-- Run this in Supabase SQL Editor if you see:
-- "Could not find the '…' column … in the schema cache"
-- after adding columns. Safe to run anytime.

NOTIFY pgrst, 'reload schema';
