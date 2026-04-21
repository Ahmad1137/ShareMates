ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS included_in_previous boolean NOT NULL DEFAULT true;

ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS joined_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.invitations
  ADD COLUMN IF NOT EXISTS include_in_previous boolean NOT NULL DEFAULT false;
