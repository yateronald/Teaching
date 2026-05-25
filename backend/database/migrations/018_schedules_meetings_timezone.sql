-- Migration 018: Convert schedule + class_session datetime columns to timestamptz
--
-- Same fix as migration 016 did for quizzes/meetings: the columns were
-- `timestamp without time zone` (naive), which silently shifts values by the
-- PG server's TimeZone setting (Europe/Berlin on the VPS). Existing values
-- are reinterpreted as UTC because the frontend was always sending UTC ISO
-- strings via `.toISOString()`.
--
-- Bookkeeping columns (created_at, updated_at, joined_at, etc.) are
-- intentionally left as plain timestamp — they're not user-scheduled fields.
--
-- The view `attendance_summary` references class_sessions.start_time/end_time
-- so we drop and recreate it around the ALTERs.

-- ── Schedules table ──────────────────────────────────────────────
ALTER TABLE schedules
    ALTER COLUMN start_time TYPE timestamptz USING start_time AT TIME ZONE 'UTC',
    ALTER COLUMN end_time   TYPE timestamptz USING end_time   AT TIME ZONE 'UTC';

-- ── Legacy class_schedules table (if present) ────────────────────
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='class_schedules') THEN
        ALTER TABLE class_schedules
            ALTER COLUMN start_time TYPE timestamptz USING start_time AT TIME ZONE 'UTC',
            ALTER COLUMN end_time   TYPE timestamptz USING end_time   AT TIME ZONE 'UTC';
    END IF;
END $$;

-- ── Class sessions: drop dependent view, alter, recreate ─────────
DROP VIEW IF EXISTS attendance_summary;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='class_sessions') THEN
        ALTER TABLE class_sessions
            ALTER COLUMN start_time            TYPE timestamptz USING start_time            AT TIME ZONE 'UTC',
            ALTER COLUMN end_time              TYPE timestamptz USING end_time              AT TIME ZONE 'UTC',
            ALTER COLUMN session_started_at    TYPE timestamptz USING session_started_at    AT TIME ZONE 'UTC',
            ALTER COLUMN session_ended_at      TYPE timestamptz USING session_ended_at      AT TIME ZONE 'UTC',
            ALTER COLUMN code_generated_at     TYPE timestamptz USING code_generated_at     AT TIME ZONE 'UTC',
            ALTER COLUMN code_expires_at       TYPE timestamptz USING code_expires_at       AT TIME ZONE 'UTC';
    END IF;
END $$;

-- Recreate the attendance_summary view with the same definition
CREATE OR REPLACE VIEW attendance_summary AS
SELECT ar.session_id,
       cs.batch_id,
       cs.session_date,
       cs.start_time,
       cs.end_time,
       b.name AS batch_name,
       (u.first_name::text || ' '::text || u.last_name::text) AS teacher_name,
       count(ar.id) AS total_students,
       count(CASE WHEN ar.status = 'present' THEN 1 END) AS present_count,
       count(CASE WHEN ar.status = 'absent'  THEN 1 END) AS absent_count,
       count(CASE WHEN ar.status = 'late'    THEN 1 END) AS late_count,
       round(
           (count(CASE WHEN ar.status = 'present' THEN 1 END)::numeric * 100.0)
           / NULLIF(count(ar.id), 0)::numeric,
           2
       ) AS attendance_percentage
FROM attendance_records ar
JOIN class_sessions cs ON ar.session_id = cs.id
JOIN batches b         ON cs.batch_id = b.id
JOIN users u           ON cs.teacher_id = u.id
GROUP BY ar.session_id, cs.batch_id, cs.session_date, cs.start_time, cs.end_time,
         b.name, u.first_name, u.last_name;
