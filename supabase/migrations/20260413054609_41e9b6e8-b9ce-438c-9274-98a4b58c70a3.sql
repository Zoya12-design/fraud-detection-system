
-- Fix 1: Remove the permissive "update" policy on profiles that allows role escalation
DROP POLICY IF EXISTS "update" ON public.profiles;

-- Fix 2: Remove overly permissive chat SELECT policy that exposes all emails
DROP POLICY IF EXISTS "Authenticated users can view all chat messages" ON public.chat_messages;

-- Fix 3: Remove duplicate public INSERT policy on chat_messages
DROP POLICY IF EXISTS "Users can send messages" ON public.chat_messages;

-- Fix 4: Update the remaining chat SELECT policy to let all authenticated users see chat (team chat), but without the public role having access
DROP POLICY IF EXISTS "Users can view own messages" ON public.chat_messages;

-- Recreate chat SELECT for authenticated users only (team chat requires seeing all messages)
CREATE POLICY "Authenticated users can view chat messages"
ON public.chat_messages
FOR SELECT
TO authenticated
USING (true);

-- Update chat INSERT to authenticated role only
DROP POLICY IF EXISTS "Authenticated users can send messages" ON public.chat_messages;
CREATE POLICY "Authenticated users can send messages"
ON public.chat_messages
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
