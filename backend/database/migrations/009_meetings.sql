-- Migration 009: Live Meetings / Virtual Classroom
-- Tables: meetings, meeting_attendance, meeting_polls, meeting_poll_votes

-- ============================================================
-- 1. meetings
-- ============================================================
CREATE TABLE IF NOT EXISTS meetings (
    id SERIAL PRIMARY KEY,
    room_name VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    batch_id INTEGER REFERENCES batches(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'waiting', 'active', 'ended')),
    scheduled_start TIMESTAMP,
    scheduled_end TIMESTAMP,
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    password VARCHAR(100),
    is_locked BOOLEAN DEFAULT FALSE,
    trusted_user_ids INTEGER[] DEFAULT '{}',
    kicked_user_ids INTEGER[] DEFAULT '{}',
    recording_url TEXT,
    is_recording BOOLEAN DEFAULT FALSE,
    max_participants INTEGER DEFAULT 50,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. meeting_attendance
-- ============================================================
CREATE TABLE IF NOT EXISTS meeting_attendance (
    id SERIAL PRIMARY KEY,
    meeting_id INTEGER NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP,
    duration_minutes NUMERIC(8,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 3. meeting_polls
-- ============================================================
CREATE TABLE IF NOT EXISTS meeting_polls (
    id SERIAL PRIMARY KEY,
    meeting_id INTEGER NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    show_results BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 4. meeting_poll_votes
-- ============================================================
CREATE TABLE IF NOT EXISTS meeting_poll_votes (
    id SERIAL PRIMARY KEY,
    poll_id INTEGER NOT NULL REFERENCES meeting_polls(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    option_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(poll_id, user_id)
);

-- ============================================================
-- 5. Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_meetings_teacher ON meetings(teacher_id);
CREATE INDEX IF NOT EXISTS idx_meetings_batch ON meetings(batch_id);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);
CREATE INDEX IF NOT EXISTS idx_meetings_room ON meetings(room_name);
CREATE INDEX IF NOT EXISTS idx_meeting_attendance_meeting ON meeting_attendance(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_attendance_user ON meeting_attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_meeting_polls_meeting ON meeting_polls(meeting_id);
