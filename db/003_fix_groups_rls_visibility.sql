-- Run in Supabase SQL Editor if /group/[id] returns 404 but the row exists.
-- Fixes circular RLS: groups SELECT referenced members, members SELECT referenced groups.

-- 1) Helpers run as owner and bypass RLS when checking visibility (no recursion).

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

-- 2) Replace groups SELECT policy

DROP POLICY IF EXISTS groups_select ON public.groups;

CREATE POLICY groups_select
  ON public.groups FOR SELECT TO authenticated
  USING (public.can_access_group(id));

-- 3) Replace members SELECT policy (same visibility rule for the group)

DROP POLICY IF EXISTS members_select ON public.members;

CREATE POLICY members_select
  ON public.members FOR SELECT TO authenticated
  USING (public.can_access_group(group_id));
