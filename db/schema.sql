-- Splitwise-style schema for Supabase / PostgreSQL
-- Run in Supabase SQL Editor or: psql $DATABASE_URL -f db/schema.sql

-- Extensions (gen_random_uuid is in pgcrypto; Supabase has it enabled by default)
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE
);

CREATE TABLE groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_by uuid NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  UNIQUE (group_id, user_id)
);

CREATE INDEX idx_members_group_id ON members (group_id);
CREATE INDEX idx_members_user_id ON members (user_id);

CREATE TABLE expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups (id) ON DELETE CASCADE,
  paid_by uuid NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  amount numeric(14, 2) NOT NULL CHECK (amount > 0),
  description text NOT NULL DEFAULT '',
  spent_on date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_expenses_group_id ON expenses (group_id);
CREATE INDEX idx_expenses_spent_on ON expenses (spent_on);
CREATE INDEX idx_expenses_paid_by ON expenses (paid_by);

CREATE TABLE splits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id uuid NOT NULL REFERENCES expenses (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  amount numeric(14, 2) NOT NULL CHECK (amount >= 0),
  UNIQUE (expense_id, user_id)
);

CREATE INDEX idx_splits_expense_id ON splits (expense_id);
CREATE INDEX idx_splits_user_id ON splits (user_id);

-- Optional: enforce split totals match expense (application layer or trigger).
-- Example trigger sketch (uncomment if you want DB-level enforcement):
--
-- CREATE OR REPLACE FUNCTION check_split_total_matches_expense()
-- RETURNS trigger AS $$
-- DECLARE
--   exp_amount numeric(14,2);
--   split_sum numeric(14,2);
-- BEGIN
--   SELECT e.amount INTO exp_amount FROM expenses e WHERE e.id = NEW.expense_id;
--   SELECT COALESCE(SUM(s.amount), 0) INTO split_sum FROM splits s WHERE s.expense_id = NEW.expense_id;
--   IF split_sum > exp_amount THEN
--     RAISE EXCEPTION 'Split amounts cannot exceed expense amount';
--   END IF;
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;
