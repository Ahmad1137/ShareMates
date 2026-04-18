-- Run this if expense rows have no visible dates.
-- Order matters: created_at must exist before 009-style UPDATE references it.

ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS spent_on date;

-- Backfill spent_on for any NULLs (safe even if created_at was just added).
UPDATE public.expenses
SET spent_on = COALESCE(
  spent_on,
  CASE
    WHEN created_at IS NOT NULL THEN (created_at AT TIME ZONE 'UTC')::date
    ELSE CURRENT_DATE
  END
)
WHERE spent_on IS NULL;

ALTER TABLE public.expenses
  ALTER COLUMN spent_on SET DEFAULT CURRENT_DATE;

UPDATE public.expenses
SET spent_on = CURRENT_DATE
WHERE spent_on IS NULL;

ALTER TABLE public.expenses
  ALTER COLUMN spent_on SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_expenses_spent_on ON public.expenses (spent_on);

NOTIFY pgrst, 'reload schema';
