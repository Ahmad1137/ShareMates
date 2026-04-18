-- Fix "new row violates row-level security policy for table groups" on INSERT.
-- Re-applies groups policies using (SELECT auth.uid()) — recommended for Postgres RLS.
-- Keeps can_access_group-based SELECT (from 003) so members/creators can read rows.

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

DROP POLICY IF EXISTS groups_select ON public.groups;
DROP POLICY IF EXISTS groups_insert ON public.groups;
DROP POLICY IF EXISTS groups_update ON public.groups;
DROP POLICY IF EXISTS groups_delete ON public.groups;

CREATE POLICY groups_select
  ON public.groups FOR SELECT TO authenticated
  USING (public.can_access_group(id));

CREATE POLICY groups_insert
  ON public.groups FOR INSERT TO authenticated
  WITH CHECK (created_by = (SELECT auth.uid()));

CREATE POLICY groups_update
  ON public.groups FOR UPDATE TO authenticated
  USING (created_by = (SELECT auth.uid()));

CREATE POLICY groups_delete
  ON public.groups FOR DELETE TO authenticated
  USING (created_by = (SELECT auth.uid()));
