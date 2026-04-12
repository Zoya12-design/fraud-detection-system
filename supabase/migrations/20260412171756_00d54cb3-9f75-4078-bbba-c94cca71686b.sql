
-- Security definer function to check admin role (avoids recursive RLS)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _user_id AND role = 'admin'
  )
$$;

-- Update transactions policies for admin access
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions" ON public.transactions
FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
CREATE POLICY "Users can update own transactions" ON public.transactions
FOR UPDATE USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;
CREATE POLICY "Users can delete own transactions" ON public.transactions
FOR DELETE USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Update alerts policies for admin access
DROP POLICY IF EXISTS "Users can view own alerts" ON public.alerts;
CREATE POLICY "Users can view own alerts" ON public.alerts
FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
