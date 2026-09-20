-- Migration 021: signed-in devices (sessions).
-- Each sign-in opens a session row identified by the token's id (jti). No token
-- is ever stored. This is what lets the platform cap how many devices an exam
-- candidate can use at once, end a session from another device, and show an
-- administrator who is signed in. Additive and safe to run twice.

CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    jti UUID NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    ended_at TIMESTAMP,
    -- how the session ended: logout · takeover (a new sign-in took its place)
    -- · admin · password (password changed) · expired
    ended_reason VARCHAR(20),
    device VARCHAR(120),
    ip VARCHAR(45),
    -- How many other devices this sign-in pushed out (0 for an ordinary one).
    -- Counting these, rather than the devices they closed, is what limits how
    -- often one account may take itself over.
    took_over SMALLINT NOT NULL DEFAULT 0
);

ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS took_over SMALLINT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_user_sessions_live ON user_sessions(user_id, ended_at, last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expiry ON user_sessions(expires_at) WHERE ended_at IS NULL;
