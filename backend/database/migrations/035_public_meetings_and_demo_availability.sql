-- 035: Public meetings, multi-email invitations, external guest sessions, and single-use demo availability links.
-- Safe to run multiple times (idempotent).

-- 1. Extend meetings for public access, approval policy, meeting kind, demo linkage, and host timezone
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS require_approval BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS meeting_kind VARCHAR(30) NOT NULL DEFAULT 'class';
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS demo_request_id INTEGER REFERENCES demo_requests(id) ON DELETE SET NULL;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS host_timezone VARCHAR(80);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'meetings_meeting_kind_check'
  ) THEN
    ALTER TABLE meetings
      ADD CONSTRAINT meetings_meeting_kind_check
      CHECK (meeting_kind IN ('class', 'demo', 'admin', 'public'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_meetings_public_room
  ON meetings(room_name) WHERE is_public = TRUE;

CREATE INDEX IF NOT EXISTS idx_meetings_demo_request
  ON meetings(demo_request_id) WHERE demo_request_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_meetings_kind_start
  ON meetings(meeting_kind, scheduled_start);

-- 2. Link demo_requests back to the created live meeting
ALTER TABLE demo_requests ADD COLUMN IF NOT EXISTS meeting_id INTEGER REFERENCES meetings(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_demo_requests_meeting_id
  ON demo_requests(meeting_id) WHERE meeting_id IS NOT NULL;

-- 3. Multi-email invitees for admin / demo / public meetings
CREATE TABLE IF NOT EXISTS meeting_invitees (
  id SERIAL PRIMARY KEY,
  meeting_id INTEGER NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  invited_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (meeting_id, email)
);

CREATE INDEX IF NOT EXISTS idx_meeting_invitees_meeting
  ON meeting_invitees(meeting_id);

-- 4. External public guests (strictly isolated from portal `users` table)
CREATE TABLE IF NOT EXISTS meeting_guests (
  id VARCHAR(64) PRIMARY KEY,
  meeting_id INTEGER NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  display_name VARCHAR(120) NOT NULL,
  email VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'admitted', 'declined', 'kicked')),
  declined_until TIMESTAMPTZ,
  decline_count INTEGER NOT NULL DEFAULT 0,
  joined_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_meeting_guests_meeting_status
  ON meeting_guests(meeting_id, status);

-- 5. Single-use expiring demo availability requests (SHA-256 hashed tokens)
CREATE TABLE IF NOT EXISTS demo_availability_requests (
  id SERIAL PRIMARY KEY,
  demo_request_id INTEGER NOT NULL REFERENCES demo_requests(id) ON DELETE CASCADE,
  token_hash VARCHAR(64) NOT NULL UNIQUE,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  proposed_timezone VARCHAR(80) NOT NULL,
  proposed_start_date DATE NOT NULL,
  proposed_end_date DATE NOT NULL,
  proposed_time_start VARCHAR(10) NOT NULL,
  proposed_time_end VARCHAR(10) NOT NULL,
  proposed_days JSONB,
  admin_note TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'submitted', 'expired', 'superseded')),
  expires_at TIMESTAMPTZ NOT NULL,
  submitted_at TIMESTAMPTZ,
  submitted_timezone VARCHAR(80),
  submitted_slots JSONB,
  submitted_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_demo_avail_demo_id
  ON demo_availability_requests(demo_request_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_demo_avail_status
  ON demo_availability_requests(status, expires_at);
