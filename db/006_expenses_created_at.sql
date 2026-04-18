-- Add expenses.created_at if the table was created from an older schema
-- or 002 was not applied. Safe to run multiple times.

ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
