-- Accept a pending invitation and add current user to members.
-- SECURITY DEFINER avoids client-side RLS false negatives on members insert.
-- Idempotent: if user is already in members or invite already accepted, return group id.

CREATE OR REPLACE FUNCTION public.accept_invitation_member(p_token text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid;
  user_email text;
  v_invite public.invitations%ROWTYPE;
BEGIN
  uid := (SELECT auth.uid());
  user_email := lower(trim(coalesce((SELECT auth.jwt() ->> 'email'), '')));

  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT *
  INTO v_invite
  FROM public.invitations
  WHERE token = p_token
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'invitation not found';
  END IF;

  IF lower(trim(coalesce(v_invite.email, ''))) <> user_email THEN
    RAISE EXCEPTION 'invitation belongs to different email';
  END IF;

  IF v_invite.status = 'cancelled' THEN
    RAISE EXCEPTION 'invitation is no longer pending';
  END IF;

  INSERT INTO public.members (group_id, user_id)
  VALUES (v_invite.group_id, uid)
  ON CONFLICT (group_id, user_id) DO NOTHING;

  IF v_invite.status = 'pending' THEN
    UPDATE public.invitations
    SET status = 'accepted',
        accepted_at = COALESCE(accepted_at, now())
    WHERE id = v_invite.id;
  END IF;

  RETURN v_invite.group_id;
END;
$$;

REVOKE ALL ON FUNCTION public.accept_invitation_member(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accept_invitation_member(text) TO authenticated;
