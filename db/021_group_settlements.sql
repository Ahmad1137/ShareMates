CREATE TABLE IF NOT EXISTS public.group_settlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.groups (id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.users (id) ON DELETE RESTRICT,
  receiver_id uuid NOT NULL REFERENCES public.users (id) ON DELETE RESTRICT,
  amount numeric(14, 2) NOT NULL CHECK (amount > 0),
  note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_group_settlements_group_id
  ON public.group_settlements (group_id);

ALTER TABLE public.group_settlements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS group_settlements_select ON public.group_settlements;
DROP POLICY IF EXISTS group_settlements_insert ON public.group_settlements;

CREATE POLICY group_settlements_select
  ON public.group_settlements FOR SELECT TO authenticated
  USING (public.can_access_group(group_id));

CREATE POLICY group_settlements_insert
  ON public.group_settlements FOR INSERT TO authenticated
  WITH CHECK (
    public.can_access_group(group_id)
    AND sender_id = auth.uid()
  );
