-- Migration 017: Convert quiz submission timestamps to timestamptz
-- Interprets existing values as UTC.
ALTER TABLE quiz_submissions
    ALTER COLUMN started_at   TYPE timestamptz USING started_at   AT TIME ZONE 'UTC',
    ALTER COLUMN submitted_at TYPE timestamptz USING submitted_at AT TIME ZONE 'UTC';
