
-- ============================================
-- 1. Enhanced Fraud Detection Engine
-- ============================================

CREATE OR REPLACE FUNCTION public.evaluate_fraud()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _risk_score INTEGER := 0;
  _risk_level TEXT := 'low';
  _status TEXT := 'safe';
  _alert_message TEXT;
  _unusual_locations TEXT[] := ARRAY['Lagos', 'Minsk', 'Pyongyang', 'Caracas', 'Tehran', 'Unknown', 'Mogadishu', 'Moscow', 'Bucharest'];
  _high_risk_categories TEXT[] := ARRAY['ATM Withdrawal', 'Wire Transfer', 'Cryptocurrency'];
  _medium_risk_categories TEXT[] := ARRAY['Online Purchase'];
  _recent_count INTEGER := 0;
  _last_location TEXT;
BEGIN
  -- Base score from amount
  IF NEW.amount > 100000 THEN
    _risk_score := 85;
  ELSIF NEW.amount > 50000 THEN
    _risk_score := 60;
  ELSIF NEW.amount > 10000 THEN
    _risk_score := 40;
  ELSIF NEW.amount > 5000 THEN
    _risk_score := 25;
  ELSIF NEW.amount > 1000 THEN
    _risk_score := 15;
  ELSE
    _risk_score := 5 + floor(random() * 10)::int;
  END IF;

  -- Boost for unusual location
  IF EXISTS (SELECT 1 FROM unnest(_unusual_locations) AS loc WHERE NEW.location ILIKE '%' || loc || '%') THEN
    _risk_score := LEAST(_risk_score + 25, 100);
  END IF;

  -- Boost for high-risk categories
  IF NEW.category = ANY(_high_risk_categories) THEN
    _risk_score := LEAST(_risk_score + 20, 100);
  ELSIF NEW.category = ANY(_medium_risk_categories) THEN
    _risk_score := LEAST(_risk_score + 10, 100);
  END IF;

  -- Transaction frequency check: count transactions in last 1 hour
  SELECT COUNT(*) INTO _recent_count
  FROM public.transactions
  WHERE user_id = NEW.user_id
    AND created_at > (now() - interval '1 hour')
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

  IF _recent_count >= 5 THEN
    _risk_score := LEAST(_risk_score + 30, 100);
  ELSIF _recent_count >= 3 THEN
    _risk_score := LEAST(_risk_score + 15, 100);
  ELSIF _recent_count >= 1 THEN
    _risk_score := LEAST(_risk_score + 5, 100);
  END IF;

  -- Location change detection: different from last transaction
  SELECT location INTO _last_location
  FROM public.transactions
  WHERE user_id = NEW.user_id
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
  ORDER BY created_at DESC
  LIMIT 1;

  IF _last_location IS NOT NULL AND _last_location != NEW.location THEN
    _risk_score := LEAST(_risk_score + 10, 100);
  END IF;

  -- Determine risk level and status (Low 0-30, Medium 31-70, High 71-100)
  IF _risk_score >= 71 THEN
    _risk_level := 'high';
    _status := 'fraud';
  ELSIF _risk_score >= 31 THEN
    _risk_level := 'medium';
    _status := 'flagged';
  ELSE
    _risk_level := 'low';
    _status := 'safe';
  END IF;

  NEW.risk_score := _risk_score;
  NEW.risk_level := _risk_level;
  NEW.status := _status;

  -- Auto-create alert for suspicious/fraud
  IF _risk_score >= 31 THEN
    IF _risk_score >= 71 THEN
      _alert_message := 'FRAUD DETECTED: $' || NEW.amount || ' at ' || NEW.merchant || ' from ' || NEW.location;
      IF _recent_count >= 3 THEN
        _alert_message := _alert_message || ' [VELOCITY ALERT: ' || _recent_count || ' txns in 1hr]';
      END IF;
    ELSE
      _alert_message := 'Suspicious transaction: $' || NEW.amount || ' at ' || NEW.merchant || ' from ' || NEW.location;
    END IF;

    IF _last_location IS NOT NULL AND _last_location != NEW.location THEN
      _alert_message := _alert_message || ' [LOCATION CHANGE: from ' || _last_location || ']';
    END IF;

    INSERT INTO public.alerts (user_id, transaction_id, message, severity)
    VALUES (NEW.user_id, NEW.id, _alert_message,
      CASE WHEN _risk_score >= 71 THEN 'high' ELSE 'medium' END
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS evaluate_fraud_trigger ON public.transactions;
CREATE TRIGGER evaluate_fraud_trigger
  BEFORE INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.evaluate_fraud();

-- ============================================
-- 2. Fix chat messages for team visibility
-- ============================================

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can view own chat messages" ON public.chat_messages;

-- Allow all authenticated users to view all chat messages (team chat)
CREATE POLICY "Team members can view chat messages"
ON public.chat_messages
FOR SELECT
TO authenticated
USING (true);

-- ============================================
-- 3. Admin can view all profiles
-- ============================================

-- Drop existing view policy and recreate with admin access
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- ============================================
-- 4. Admin can delete alerts
-- ============================================

-- Allow users to delete their own alerts, admin can delete any
CREATE POLICY "Users can delete own alerts"
ON public.alerts
FOR DELETE
TO authenticated
USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
