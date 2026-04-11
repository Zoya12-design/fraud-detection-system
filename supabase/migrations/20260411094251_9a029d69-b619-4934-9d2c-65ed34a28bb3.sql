
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL DEFAULT 0,
  merchant TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'other',
  card_last4 TEXT NOT NULL DEFAULT '0000',
  description TEXT DEFAULT '',
  risk_score INTEGER NOT NULL DEFAULT 0,
  risk_level TEXT NOT NULL DEFAULT 'low',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON public.transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON public.transactions FOR DELETE USING (auth.uid() = user_id);

-- Create alerts table
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own alerts" ON public.alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own alerts" ON public.alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own alerts" ON public.alerts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Fraud detection function
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
  _unusual_locations TEXT[] := ARRAY['Lagos', 'Minsk', 'Pyongyang', 'Caracas', 'Tehran', 'Unknown', 'Mogadishu'];
BEGIN
  -- Base score from amount
  IF NEW.amount > 100000 THEN
    _risk_score := 85;
  ELSIF NEW.amount > 50000 THEN
    _risk_score := 55;
  ELSIF NEW.amount > 10000 THEN
    _risk_score := 35;
  ELSE
    _risk_score := 10 + floor(random() * 15)::int;
  END IF;

  -- Boost for unusual location
  IF NEW.location = ANY(_unusual_locations) THEN
    _risk_score := LEAST(_risk_score + 25, 100);
  END IF;

  -- Determine risk level and status
  IF _risk_score >= 71 THEN
    _risk_level := 'high';
    _status := 'fraud';
  ELSIF _risk_score >= 41 THEN
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
  IF _risk_score >= 41 THEN
    IF _risk_score >= 71 THEN
      _alert_message := 'FRAUD DETECTED: $' || NEW.amount || ' at ' || NEW.merchant || ' from ' || NEW.location;
    ELSE
      _alert_message := 'Suspicious transaction: $' || NEW.amount || ' at ' || NEW.merchant || ' from ' || NEW.location;
    END IF;

    INSERT INTO public.alerts (user_id, transaction_id, message, severity)
    VALUES (NEW.user_id, NEW.id, _alert_message,
      CASE WHEN _risk_score >= 71 THEN 'high' ELSE 'medium' END
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER evaluate_transaction_fraud
  BEFORE INSERT ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.evaluate_fraud();

-- Updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
