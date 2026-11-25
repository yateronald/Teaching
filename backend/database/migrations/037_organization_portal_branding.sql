-- 037: White-label portal branding & cover image columns for organizations.
-- Idempotent: safe to run repeatedly.

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS portal_branding JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS cover_file_id VARCHAR(255);

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS cover_mime VARCHAR(40);

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS cover_updated_at TIMESTAMPTZ;
