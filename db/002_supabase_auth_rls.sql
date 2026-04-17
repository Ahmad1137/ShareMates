-- Run in Supabase SQL Editor after schema.sql.
-- If `users` has rows whose id is not in auth.users, delete or fix them before adding the FK.

ALTER TABLE public.groups
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;

ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_auth_fkey;

ALTER TABLE public.users
  ADD CONSTRAINT users_id_auth_fkey
  FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, name, email)
  VALUES (
    new.id,
    COALESCE(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(COALESCE(new.email, ''), '@', 1)
    ),
    COALESCE(new.email, '')
  )
  ON CONFLICT (id) DO UPDATE
    SET
      name = EXCLUDED.name,
      email = EXCLUDED.email;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();

-- Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.splits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS users_select_authenticated ON public.users;
DROP POLICY IF EXISTS users_insert_own ON public.users;
DROP POLICY IF EXISTS users_update_own ON public.users;
DROP POLICY IF EXISTS groups_select ON public.groups;
DROP POLICY IF EXISTS groups_insert ON public.groups;
DROP POLICY IF EXISTS groups_update ON public.groups;
DROP POLICY IF EXISTS groups_delete ON public.groups;
DROP POLICY IF EXISTS members_select ON public.members;
DROP POLICY IF EXISTS members_insert ON public.members;
DROP POLICY IF EXISTS members_delete ON public.members;
DROP POLICY IF EXISTS expenses_select ON public.expenses;
DROP POLICY IF EXISTS expenses_insert ON public.expenses;
DROP POLICY IF EXISTS expenses_delete ON public.expenses;
DROP POLICY IF EXISTS splits_select ON public.splits;
DROP POLICY IF EXISTS splits_insert ON public.splits;
DROP POLICY IF EXISTS splits_delete ON public.splits;

CREATE POLICY users_select_authenticated
  ON public.users FOR SELECT TO authenticated USING (true);

CREATE POLICY users_insert_own
  ON public.users FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY users_update_own
  ON public.users FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Creator or member can see a group
CREATE POLICY groups_select
  ON public.groups FOR SELECT TO authenticated USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.members m
      WHERE m.group_id = groups.id AND m.user_id = auth.uid()
    )
  );

CREATE POLICY groups_insert
  ON public.groups FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

CREATE POLICY groups_update
  ON public.groups FOR UPDATE TO authenticated USING (created_by = auth.uid());

CREATE POLICY groups_delete
  ON public.groups FOR DELETE TO authenticated USING (created_by = auth.uid());

-- Creator (not necessarily in members yet) or any member can see/add members
CREATE POLICY members_select
  ON public.members FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = members.group_id AND g.created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.members m
      WHERE m.group_id = members.group_id AND m.user_id = auth.uid()
    )
  );

CREATE POLICY members_insert
  ON public.members FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = members.group_id AND g.created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.members m
      WHERE m.group_id = members.group_id AND m.user_id = auth.uid()
    )
  );

CREATE POLICY members_delete
  ON public.members FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = members.group_id AND g.created_by = auth.uid()
    )
  );

-- Expenses: creator or member of group
CREATE POLICY expenses_select
  ON public.expenses FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = expenses.group_id
        AND (
          g.created_by = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.members m
            WHERE m.group_id = g.id AND m.user_id = auth.uid()
          )
        )
    )
  );

CREATE POLICY expenses_insert
  ON public.expenses FOR INSERT TO authenticated WITH CHECK (
    paid_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = expenses.group_id
        AND (
          g.created_by = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.members m
            WHERE m.group_id = g.id AND m.user_id = auth.uid()
          )
        )
    )
  );

CREATE POLICY expenses_delete
  ON public.expenses FOR DELETE TO authenticated USING (
    paid_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = expenses.group_id
        AND (
          g.created_by = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.members m
            WHERE m.group_id = g.id AND m.user_id = auth.uid()
          )
        )
    )
  );

CREATE POLICY splits_select
  ON public.splits FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.expenses e
      JOIN public.groups g ON g.id = e.group_id
      WHERE e.id = splits.expense_id
        AND (
          g.created_by = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.members m
            WHERE m.group_id = g.id AND m.user_id = auth.uid()
          )
        )
    )
  );

CREATE POLICY splits_insert
  ON public.splits FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.expenses e
      JOIN public.groups g ON g.id = e.group_id
      WHERE e.id = splits.expense_id
        AND (
          g.created_by = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.members m
            WHERE m.group_id = g.id AND m.user_id = auth.uid()
          )
        )
    )
  );

CREATE POLICY splits_delete
  ON public.splits FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.expenses e
      JOIN public.groups g ON g.id = e.group_id
      WHERE e.id = splits.expense_id
        AND (
          g.created_by = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.members m
            WHERE m.group_id = g.id AND m.user_id = auth.uid()
          )
        )
    )
  );
