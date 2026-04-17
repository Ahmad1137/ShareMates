-- Allow invitees to add themselves to a group when they have a pending invitation.
-- Without this, only creators / existing members can INSERT into members (see 002).

DROP POLICY IF EXISTS members_insert_via_pending_invite ON public.members;

CREATE POLICY members_insert_via_pending_invite
  ON public.members FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.invitations i
      WHERE i.group_id = members.group_id
        AND i.status = 'pending'
        AND lower(trim(coalesce(i.email, ''))) =
            lower(trim(coalesce(auth.jwt() ->> 'email', '')))
    )
  );
