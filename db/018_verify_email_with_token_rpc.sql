-- Verify email using token without requiring an active auth session.
-- This allows users to click email links directly from any browser/device.

CREATE OR REPLACE FUNCTION public.verify_email_with_token(p_token text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.email_verification_tokens%ROWTYPE;
BEGIN
  IF length(trim(coalesce(p_token, ''))) = 0 THEN
    RAISE EXCEPTION 'missing token';
  END IF;

  SELECT *
  INTO v_row
  FROM public.email_verification_tokens
  WHERE token = trim(p_token)
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'invalid token';
  END IF;

  IF v_row.expires_at < now() THEN
    RAISE EXCEPTION 'expired token';
  END IF;

  UPDATE public.users
  SET email_verified = true
  WHERE id = v_row.user_id;

  RETURN v_row.user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.verify_email_with_token(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_email_with_token(text) TO anon, authenticated;
