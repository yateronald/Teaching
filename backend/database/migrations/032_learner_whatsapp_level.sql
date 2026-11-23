-- Migration 032: learner WhatsApp number (E.164 validated by country) and French CEFR level.
-- Additive and safe to run twice. Requires migration 030 (learn_pending_signups).

ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(32);
ALTER TABLE users ADD COLUMN IF NOT EXISTS french_level VARCHAR(16);

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_french_level_check;
ALTER TABLE users ADD CONSTRAINT users_french_level_check
    CHECK (french_level IS NULL OR french_level IN ('beginner', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'));

ALTER TABLE learn_pending_signups ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(32);
ALTER TABLE learn_pending_signups ADD COLUMN IF NOT EXISTS french_level VARCHAR(16);
