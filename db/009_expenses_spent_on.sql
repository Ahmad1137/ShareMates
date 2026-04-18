-- User-visible expense date (calendar day). created_at remains "when logged in the app".

ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS spent_on date;

UPDATE public.expenses
SET spent_on = COALESCE(
  spent_on,
  CASE
    WHEN created_at IS NOT NULL THEN (created_at AT TIME ZONE 'UTC')::date
    ELSE CURRENT_DATE
  END
);

ALTER TABLE public.expenses
  ALTER COLUMN spent_on SET DEFAULT CURRENT_DATE,
  ALTER COLUMN spent_on SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_expenses_spent_on ON public.expenses (spent_on);

-- Refresh PostgREST so the API stops saying "schema cache" / unknown column.
NOTIFY pgrst, 'reload schema';
