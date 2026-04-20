-- Custom email verification (SMTP-driven, app-managed).
-- Keep existing users unblocked; new users are set to unverified by app logic.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS email_verified boolean NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS public.email_verification_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  email text NOT NULL,
  token text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id
  ON public.email_verification_tokens (user_id);

CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_expires_at
  ON public.email_verification_tokens (expires_at);

ALTER TABLE public.email_verification_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS email_verification_tokens_select_own ON public.email_verification_tokens;
DROP POLICY IF EXISTS email_verification_tokens_insert_own ON public.email_verification_tokens;
DROP POLICY IF EXISTS email_verification_tokens_delete_own ON public.email_verification_tokens;

CREATE POLICY email_verification_tokens_select_own
  ON public.email_verification_tokens
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY email_verification_tokens_insert_own
  ON public.email_verification_tokens
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY email_verification_tokens_delete_own
  ON public.email_verification_tokens
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());
