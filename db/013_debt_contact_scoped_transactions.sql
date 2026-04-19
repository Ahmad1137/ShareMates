-- Contact-scoped IOU: support unregistered contacts (no contact_user_id).
-- Rows may use contact_id + (owner as sender XOR receiver); legacy pairwise rows stay valid.

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS contact_id uuid REFERENCES public.contacts (id) ON DELETE CASCADE;

ALTER TABLE public.transactions
  ALTER COLUMN sender_id DROP NOT NULL,
  ALTER COLUMN receiver_id DROP NOT NULL;

ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_different_parties;

ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_party_check;

-- CHECK cannot use subqueries in PostgreSQL; keep shape-only rules here.
ALTER TABLE public.transactions
  ADD CONSTRAINT transactions_party_check CHECK (
    (
      contact_id IS NULL
      AND sender_id IS NOT NULL
      AND receiver_id IS NOT NULL
      AND sender_id <> receiver_id
    )
    OR (
      contact_id IS NOT NULL
      AND (
        (sender_id IS NOT NULL AND receiver_id IS NULL)
        OR (sender_id IS NULL AND receiver_id IS NOT NULL)
        OR (sender_id IS NOT NULL AND receiver_id IS NOT NULL AND sender_id <> receiver_id)
      )
    )
  );

DROP TRIGGER IF EXISTS transactions_validate_contact_party ON public.transactions;
DROP FUNCTION IF EXISTS public.transactions_validate_contact_party();

-- Enforce: contact_id (when set) must reference a row in contacts whose owner is sender or receiver.
CREATE OR REPLACE FUNCTION public.transactions_validate_contact_party()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NEW.contact_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.contacts c
    WHERE c.id = NEW.contact_id
      AND (
        (NEW.sender_id IS NOT NULL AND c.user_id = NEW.sender_id)
        OR (NEW.receiver_id IS NOT NULL AND c.user_id = NEW.receiver_id)
      )
  ) THEN
    RAISE EXCEPTION 'transactions: contact_id must reference a contact owned by sender_id or receiver_id'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER transactions_validate_contact_party
  BEFORE INSERT OR UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE PROCEDURE public.transactions_validate_contact_party();

CREATE INDEX IF NOT EXISTS idx_transactions_contact_id ON public.transactions (contact_id);

-- Balance for one contact row: positive = they owe you (same sign as before).
CREATE OR REPLACE FUNCTION public.get_contact_ledger_balance(p_owner uuid, p_contact uuid)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH cp AS (
    SELECT contact_user_id AS cpu
    FROM public.contacts
    WHERE id = p_contact AND user_id = p_owner
  )
  SELECT
    COALESCE(
      SUM(
        CASE
          WHEN t.type = 'lend'
            AND t.sender_id = p_owner
            AND (
              t.contact_id = p_contact
              OR (
                t.contact_id IS NULL
                AND (SELECT cpu FROM cp) IS NOT NULL
                AND t.receiver_id = (SELECT cpu FROM cp)
              )
            )
            THEN t.amount
          ELSE 0
        END
      ),
      0
    )
    - COALESCE(
      SUM(
        CASE
          WHEN t.type = 'borrow'
            AND t.receiver_id = p_owner
            AND (
              t.contact_id = p_contact
              OR (
                t.contact_id IS NULL
                AND (SELECT cpu FROM cp) IS NOT NULL
                AND t.sender_id = (SELECT cpu FROM cp)
              )
            )
            THEN t.amount
          ELSE 0
        END
      ),
      0
    )
    - COALESCE(
      SUM(
        CASE
          WHEN t.type = 'settle'
            AND t.receiver_id = p_owner
            AND (
              t.contact_id = p_contact
              OR (
                t.contact_id IS NULL
                AND (SELECT cpu FROM cp) IS NOT NULL
                AND t.sender_id = (SELECT cpu FROM cp)
              )
            )
            THEN t.amount
          ELSE 0
        END
      ),
      0
    )
    + COALESCE(
      SUM(
        CASE
          WHEN t.type = 'settle'
            AND t.sender_id = p_owner
            AND (
              t.contact_id = p_contact
              OR (
                t.contact_id IS NULL
                AND (SELECT cpu FROM cp) IS NOT NULL
                AND t.receiver_id = (SELECT cpu FROM cp)
              )
            )
            THEN t.amount
          ELSE 0
        END
      ),
      0
    )
  FROM public.transactions t
  WHERE
    t.contact_id = p_contact
    OR (
      t.contact_id IS NULL
      AND (SELECT cpu FROM cp) IS NOT NULL
      AND (
        (t.sender_id = p_owner AND t.receiver_id = (SELECT cpu FROM cp))
        OR (t.sender_id = (SELECT cpu FROM cp) AND t.receiver_id = p_owner)
      )
    );
$$;

REVOKE ALL ON FUNCTION public.get_contact_ledger_balance(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_contact_ledger_balance(uuid, uuid) TO authenticated;

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
