-- Migration 010: Enhanced meeting attendance tracking
-- Adds: reconnection tracking, absent marking, total_duration accumulation

-- Add columns to meeting_attendance for reconnection tracking
ALTER TABLE meeting_attendance ADD COLUMN IF NOT EXISTS session_number INTEGER DEFAULT 1;

-- Create a summary table for per-user meeting totals
CREATE TABLE IF NOT EXISTS meeting_attendance_summary (
    id SERIAL PRIMARY KEY,
    meeting_id INTEGER NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'absent' CHECK (status IN ('present', 'absent', 'late', 'left_early')),
    first_join TIMESTAMP,
    last_leave TIMESTAMP,
    total_duration_minutes NUMERIC(10,2) DEFAULT 0,
    session_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(meeting_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_meeting_att_summary_meeting ON meeting_attendance_summary(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_att_summary_user ON meeting_attendance_summary(user_id);
CREATE INDEX IF NOT EXISTS idx_meeting_att_summary_status ON meeting_attendance_summary(status);
