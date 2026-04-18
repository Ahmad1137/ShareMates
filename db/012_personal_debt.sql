-- Personal 1:1 debt / lending (udhaar). Run in Supabase SQL Editor after public.users exists.
-- Tables: contacts (your address book), transactions (ledger between two user ids).

CREATE TABLE IF NOT EXISTS public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  contact_user_id uuid REFERENCES public.users (id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT contacts_no_self_contact CHECK (
    contact_user_id IS NULL OR contact_user_id <> user_id
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_contacts_user_registered
  ON public.contacts (user_id, contact_user_id)
  WHERE contact_user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_contacts_user_email_lower
  ON public.contacts (user_id, lower(email))
  WHERE email <> '';

CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON public.contacts (user_id);

CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  amount numeric(14, 2) NOT NULL CHECK (amount > 0),
  type text NOT NULL CHECK (type IN ('lend', 'borrow', 'settle')),
  note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT transactions_different_parties CHECK (sender_id <> receiver_id)
);

CREATE INDEX IF NOT EXISTS idx_transactions_sender ON public.transactions (sender_id);
CREATE INDEX IF NOT EXISTS idx_transactions_receiver ON public.transactions (receiver_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions (created_at DESC);

-- Positive = counterparty owes you; negative = you owe them.
-- lend: you -> them increases balance; borrow: them -> you decreases;
-- settle them->you: they paid you (reduces their debt); settle you->them: you paid (reduces your debt).
CREATE OR REPLACE FUNCTION public.get_debt_balance(p_me uuid, p_counterparty uuid)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    COALESCE(SUM(CASE WHEN type = 'lend' AND sender_id = p_me AND receiver_id = p_counterparty THEN amount END), 0)
    - COALESCE(SUM(CASE WHEN type = 'borrow' AND sender_id = p_counterparty AND receiver_id = p_me THEN amount END), 0)
    - COALESCE(SUM(CASE WHEN type = 'settle' AND sender_id = p_counterparty AND receiver_id = p_me THEN amount END), 0)
    + COALESCE(SUM(CASE WHEN type = 'settle' AND sender_id = p_me AND receiver_id = p_counterparty THEN amount END), 0)
  FROM public.transactions
  WHERE (sender_id = p_me AND receiver_id = p_counterparty)
     OR (sender_id = p_counterparty AND receiver_id = p_me);
$$;

REVOKE ALL ON FUNCTION public.get_debt_balance(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_debt_balance(uuid, uuid) TO authenticated;

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS contacts_select ON public.contacts;
DROP POLICY IF EXISTS contacts_insert ON public.contacts;
DROP POLICY IF EXISTS contacts_update ON public.contacts;
DROP POLICY IF EXISTS contacts_delete ON public.contacts;

CREATE POLICY contacts_select
  ON public.contacts FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY contacts_insert
  ON public.contacts FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY contacts_update
  ON public.contacts FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY contacts_delete
  ON public.contacts FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS debt_tx_select ON public.transactions;
DROP POLICY IF EXISTS debt_tx_insert ON public.transactions;
DROP POLICY IF EXISTS debt_tx_delete ON public.transactions;

CREATE POLICY debt_tx_select
  ON public.transactions FOR SELECT TO authenticated
  USING (
    sender_id = (SELECT auth.uid())
    OR receiver_id = (SELECT auth.uid())
  );

CREATE POLICY debt_tx_insert
  ON public.transactions FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = (SELECT auth.uid())
    OR receiver_id = (SELECT auth.uid())
  );

CREATE POLICY debt_tx_delete
  ON public.transactions FOR DELETE TO authenticated
  USING (
    sender_id = (SELECT auth.uid())
    OR receiver_id = (SELECT auth.uid())
  );

NOTIFY pgrst, 'reload schema';
