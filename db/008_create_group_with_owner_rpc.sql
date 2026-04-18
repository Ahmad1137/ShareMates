-- Reliable group creation: bypasses RLS on INSERT while still enforcing auth.uid().
-- Use when table policies keep failing from the client (e.g. server actions + JWT edge cases).

CREATE OR REPLACE FUNCTION public.create_group_with_owner(p_name text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  gid uuid;
  uid uuid;
BEGIN
  uid := (SELECT auth.uid());
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF length(trim(coalesce(p_name, ''))) = 0 THEN
    RAISE EXCEPTION 'name required';
  END IF;

  INSERT INTO public.groups (name, created_by)
  VALUES (trim(p_name), uid)
  RETURNING id INTO gid;

  INSERT INTO public.members (group_id, user_id)
  VALUES (gid, uid)
  ON CONFLICT (group_id, user_id) DO NOTHING;

  RETURN gid;
END;
$$;

REVOKE ALL ON FUNCTION public.create_group_with_owner(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_group_with_owner(text) TO authenticated;
