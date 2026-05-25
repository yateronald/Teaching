-- Migration 016: Per-user timezone + scheduling timestamps with timezone awareness
--
-- Two changes:
--   1. Add users.timezone (IANA zone identifier, e.g. 'America/Toronto').
--      Defaults to 'UTC' so existing rows are valid immediately.
--   2. Convert user-facing scheduling timestamps from `timestamp` (naive) to
--      `timestamptz`. Existing naive values are interpreted as UTC, which
--      matches how the backend has always written them (toISOString from
--      the frontend lands as UTC strings).
--
-- Bookkeeping columns like `created_at`, `updated_at`, `joined_at`, etc. are
-- intentionally left as plain timestamp — they're not user-scheduled fields.

-- ── 1. users.timezone ────────────────────────────────────────────────
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS timezone VARCHAR(64) NOT NULL DEFAULT 'UTC';

CREATE INDEX IF NOT EXISTS idx_users_timezone ON users(timezone);

-- ── 2. Quizzes ───────────────────────────────────────────────────────
ALTER TABLE quizzes
    ALTER COLUMN start_date TYPE timestamptz USING start_date AT TIME ZONE 'UTC',
    ALTER COLUMN end_date   TYPE timestamptz USING end_date   AT TIME ZONE 'UTC';

-- ── 3. Live meetings ─────────────────────────────────────────────────
ALTER TABLE meetings
    ALTER COLUMN scheduled_start TYPE timestamptz USING scheduled_start AT TIME ZONE 'UTC',
    ALTER COLUMN scheduled_end   TYPE timestamptz USING scheduled_end   AT TIME ZONE 'UTC';
