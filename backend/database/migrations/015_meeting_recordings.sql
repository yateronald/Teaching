-- Migration 015: Meeting Recordings (LiveKit Egress)
-- Stores video recordings of live meetings, kept on the server for 30 days.

CREATE TABLE IF NOT EXISTS meeting_recordings (
    id SERIAL PRIMARY KEY,
    meeting_id INTEGER NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    started_by INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,

    -- LiveKit egress reference — used to stop the egress and reconcile webhook events.
    egress_id VARCHAR(100) UNIQUE,

    -- File details (filled in when egress completes)
    file_name VARCHAR(255),         -- e.g. "meeting-42-1716552000.mp4"
    file_path TEXT,                 -- absolute or relative path on server
    file_size_bytes BIGINT,
    duration_seconds INTEGER,
    mime_type VARCHAR(50) DEFAULT 'video/mp4',

    -- Lifecycle
    status VARCHAR(20) NOT NULL DEFAULT 'starting'
        CHECK (status IN ('starting', 'recording', 'finalizing', 'ready', 'failed', 'deleted')),
    error_message TEXT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,  -- = started_at + 30 days; cleanup uses this
    deleted_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_meeting_recordings_meeting ON meeting_recordings(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_recordings_started_by ON meeting_recordings(started_by);
CREATE INDEX IF NOT EXISTS idx_meeting_recordings_status ON meeting_recordings(status);
CREATE INDEX IF NOT EXISTS idx_meeting_recordings_expires ON meeting_recordings(expires_at);
CREATE INDEX IF NOT EXISTS idx_meeting_recordings_egress ON meeting_recordings(egress_id);
