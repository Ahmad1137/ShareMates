-- Invitations: allow inviting emails not yet registered.
-- This migration expects `public.can_access_group(uuid)`.
-- Create it here as a safety fallback so this file can run independently.

CREATE OR REPLACE FUNCTION public.can_access_group(p_group_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.groups g
    WHERE g.id = p_group_id
      AND (
        g.created_by = (SELECT auth.uid())
        OR EXISTS (
          SELECT 1
          FROM public.members m
          WHERE m.group_id = g.id
            AND m.user_id = (SELECT auth.uid())
        )
      )
  );
$$;

REVOKE ALL ON FUNCTION public.can_access_group(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_access_group(uuid) TO authenticated;

CREATE TABLE IF NOT EXISTS public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.groups (id) ON DELETE CASCADE,
  invited_by uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  email text NOT NULL,
  token text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_invitations_group_id ON public.invitations (group_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON public.invitations (email);
CREATE UNIQUE INDEX IF NOT EXISTS ux_invitations_pending_group_email
  ON public.invitations (group_id, lower(email))
  WHERE status = 'pending';

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS invitations_select ON public.invitations;
DROP POLICY IF EXISTS invitations_insert ON public.invitations;
DROP POLICY IF EXISTS invitations_update ON public.invitations;
DROP POLICY IF EXISTS invitations_delete ON public.invitations;

-- Group members/creator can see invitations; invited email can see its own invitation.
CREATE POLICY invitations_select
  ON public.invitations FOR SELECT TO authenticated
  USING (
    public.can_access_group(group_id)
    OR lower(email) = lower((SELECT auth.jwt() ->> 'email'))
  );

CREATE POLICY invitations_insert
  ON public.invitations FOR INSERT TO authenticated
  WITH CHECK (public.can_access_group(group_id));

-- Invited person can accept; group members can also manage statuses.
CREATE POLICY invitations_update
  ON public.invitations FOR UPDATE TO authenticated
  USING (
    public.can_access_group(group_id)
    OR lower(email) = lower((SELECT auth.jwt() ->> 'email'))
  )
  WITH CHECK (
    public.can_access_group(group_id)
    OR lower(email) = lower((SELECT auth.jwt() ->> 'email'))
  );

CREATE POLICY invitations_delete
  ON public.invitations FOR DELETE TO authenticated
  USING (public.can_access_group(group_id));
