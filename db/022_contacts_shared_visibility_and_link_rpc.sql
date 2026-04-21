-- Allow shared read-only contact visibility for linked user,
-- and provide a secure way to backfill contact_user_id by email.

CREATE INDEX IF NOT EXISTS idx_contacts_contact_user_id ON public.contacts (contact_user_id);

DROP POLICY IF EXISTS contacts_select ON public.contacts;
CREATE POLICY contacts_select
  ON public.contacts FOR SELECT TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR contact_user_id = (SELECT auth.uid())
  );

CREATE OR REPLACE FUNCTION public.link_contacts_by_email(p_user uuid, p_email text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer := 0;
BEGIN
  IF p_user IS NULL OR p_email IS NULL OR btrim(p_email) = '' THEN
    RETURN 0;
  END IF;

  UPDATE public.contacts
  SET contact_user_id = p_user
  WHERE contact_user_id IS NULL
    AND lower(email) = lower(btrim(p_email))
    AND user_id <> p_user;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.link_contacts_by_email(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.link_contacts_by_email(uuid, text) TO authenticated;

NOTIFY pgrst, 'reload schema';
