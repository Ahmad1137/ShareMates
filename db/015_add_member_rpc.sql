-- Add an existing user to a group with permission checks in DB.
-- Avoids client-side RLS failures on direct INSERT into members.

CREATE OR REPLACE FUNCTION public.add_member_to_group(
  p_group_id uuid,
  p_user_id uuid,
  p_include_in_previous boolean DEFAULT false
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid;
  affected int;
BEGIN
  uid := (SELECT auth.uid());
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF NOT public.can_access_group(p_group_id) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  INSERT INTO public.members (group_id, user_id, included_in_previous, joined_at)
  VALUES (p_group_id, p_user_id, p_include_in_previous, now())
  ON CONFLICT (group_id, user_id) DO NOTHING;

  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected = 0 THEN
    RETURN 'already';
  END IF;

  RETURN 'added';
END;
$$;

REVOKE ALL ON FUNCTION public.add_member_to_group(uuid, uuid, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.add_member_to_group(uuid, uuid, boolean) TO authenticated;
