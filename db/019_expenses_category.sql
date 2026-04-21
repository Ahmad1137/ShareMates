ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'Other';
