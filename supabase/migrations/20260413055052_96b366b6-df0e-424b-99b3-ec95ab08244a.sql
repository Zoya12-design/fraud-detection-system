
-- ============================================
-- FIX 1: Profiles - prevent role escalation
-- ============================================

-- Drop existing user update policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create a trigger function that prevents non-admins from changing their role
CREATE OR REPLACE FUNCTION public.prevent_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If the user is not an admin, force role to remain unchanged
  IF NOT public.is_admin(auth.uid()) THEN
    NEW.role := OLD.role;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger on profiles table
DROP TRIGGER IF EXISTS enforce_role_protection ON public.profiles;
CREATE TRIGGER enforce_role_protection
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_change();

-- Recreate a simple update policy (trigger handles role protection)
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- FIX 2: Chat messages - restrict visibility
-- ============================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view chat messages" ON public.chat_messages;

-- Users can only see their own messages
CREATE POLICY "Users can view own chat messages"
ON public.chat_messages
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
