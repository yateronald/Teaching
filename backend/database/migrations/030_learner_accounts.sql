-- Migration 030: public learner accounts on the website, one account per
-- email, and Premium access.
--
--   1. The email key: an address reduced to its real inbox (Gmail ignores dots,
--      most providers deliver name+tag@ to name@). Kept by the database for
--      every account, whatever code path creates or edits it, so two accounts
--      can never share an inbox (the runner makes it unique once no duplicate
--      is left; see database/run-learner-accounts-migration.js).
--   2. The `learner` role: people who signed up on the public website. They
--      use the courses there and never enter the student portal.
--   3. Sign-ups waiting for their email code, and the website's own codes
--      (password reset).
--   4. Who may use the courses on the website: learners always; students,
--      company learners and managers only when an administrator enables it
--      (per person, or for a whole company).
--   5. Premium: licenses on a person or a company, granted by an
--      administrator today, by the payment provider later.
--   6. The history of every change of access, Premium requests, and which
--      account loaded which protected content (download limits, evidence).
--
-- Additive and safe to run twice.

-- ── 1. Email key ──────────────────────────────────────────────────────────
-- The same rules as services/emailIdentity.js (emailKey): lower case, the part
-- after "+" removed, googlemail.com = gmail.com, and dots removed for Gmail
-- only (at other domains, j.smith and jsmith can be two people).
CREATE OR REPLACE FUNCTION lfwn_email_key(addr text) RETURNS text
LANGUAGE plpgsql IMMUTABLE PARALLEL SAFE AS $$
DECLARE
    e text;
    at_pos int;
    local_part text;
    domain_part text;
BEGIN
    IF addr IS NULL THEN RETURN NULL; END IF;
    e := lower(btrim(addr));
    IF position('@' IN e) = 0 THEN RETURN e; END IF;
    at_pos := length(e) - position('@' IN reverse(e)) + 1;
    local_part := substr(e, 1, at_pos - 1);
    domain_part := rtrim(substr(e, at_pos + 1), '.');
    IF domain_part = 'googlemail.com' THEN domain_part := 'gmail.com'; END IF;
    IF position('+' IN local_part) > 1 THEN local_part := split_part(local_part, '+', 1); END IF;
    IF domain_part = 'gmail.com' THEN local_part := replace(local_part, '.', ''); END IF;
    RETURN local_part || '@' || domain_part;
END $$;

ALTER TABLE users ADD COLUMN IF NOT EXISTS email_key text GENERATED ALWAYS AS (lfwn_email_key(email)) STORED;

-- ── 2. Learner accounts ───────────────────────────────────────────────────
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
    CHECK (role = ANY (ARRAY['admin', 'teacher', 'student', 'candidate', 'org_admin', 'learner']));

ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;
-- Google's permanent id for the person (not their email, which can change).
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_sub VARCHAR(255);
CREATE UNIQUE INDEX IF NOT EXISTS users_google_sub_key ON users (google_sub) WHERE google_sub IS NOT NULL;
-- False for an account created with Google that never chose a password (its
-- stored hash is random and matches nothing).
ALTER TABLE users ADD COLUMN IF NOT EXISTS has_password BOOLEAN NOT NULL DEFAULT true;
-- How the account was created: email | google (public sign-up). Null: created by the team.
ALTER TABLE users ADD COLUMN IF NOT EXISTS signup_source VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS country CHAR(2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_lang VARCHAR(5);
ALTER TABLE users ADD COLUMN IF NOT EXISTS terms_version VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS marketing_opt_in BOOLEAN NOT NULL DEFAULT false;

-- A learner is never part of a class: convert the account first.
CREATE OR REPLACE FUNCTION lfwn_no_learner_in_batch() RETURNS trigger AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM users WHERE id = NEW.student_id AND role = 'learner') THEN
        RAISE EXCEPTION 'A website learner cannot join a class. Convert the account to a student first.'
            USING ERRCODE = 'check_violation';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS batch_students_no_learner ON batch_students;
CREATE TRIGGER batch_students_no_learner BEFORE INSERT OR UPDATE OF student_id ON batch_students
    FOR EACH ROW EXECUTE FUNCTION lfwn_no_learner_in_batch();

-- Which door a signed-in session belongs to: the student portal, or the
-- public website. A session never works on the other door.
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS door VARCHAR(10) NOT NULL DEFAULT 'portal';

-- ── 3. Sign-ups and codes ─────────────────────────────────────────────────
-- A sign-up becomes an account only once its email is confirmed: until then
-- it waits here (24 hours at most), so nobody can reserve someone else's email.
-- A sign-up for an email that already has an account gets a row too, with no
-- code: the page cannot tell the two apart.
CREATE TABLE IF NOT EXISTS learn_pending_signups (
    id SERIAL PRIMARY KEY,
    handle_hash CHAR(64) NOT NULL UNIQUE,
    link_hash CHAR(64) UNIQUE,
    code_hash CHAR(64),
    email VARCHAR(100) NOT NULL,
    email_key VARCHAR(100) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    country CHAR(2),
    lang VARCHAR(5) NOT NULL DEFAULT 'en',
    marketing_opt_in BOOLEAN NOT NULL DEFAULT false,
    terms_version VARCHAR(20) NOT NULL,
    attempts SMALLINT NOT NULL DEFAULT 0,
    sends SMALLINT NOT NULL DEFAULT 1,
    last_sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    ip VARCHAR(45)
);
CREATE INDEX IF NOT EXISTS idx_learn_pending_signups_key ON learn_pending_signups (email_key, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_learn_pending_signups_expiry ON learn_pending_signups (expires_at);

-- The website's one-time codes (password reset). user_id is null for an
-- email without an account: the answer looks the same.
CREATE TABLE IF NOT EXISTS learn_codes (
    id SERIAL PRIMARY KEY,
    handle_hash CHAR(64) NOT NULL UNIQUE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    purpose VARCHAR(20) NOT NULL,
    code_hash CHAR(64),
    attempts SMALLINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_learn_codes_user ON learn_codes (user_id, purpose, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_learn_codes_expiry ON learn_codes (expires_at);

-- ── 4. Website access of portal accounts ──────────────────────────────────
-- off: the account works in the student portal only (default).
-- free: it may also sign in on the website (first module of every path).
-- Premium is a license (below), never this setting.
ALTER TABLE users ADD COLUMN IF NOT EXISTS learn_access VARCHAR(10) NOT NULL DEFAULT 'off';
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_learn_access_check;
ALTER TABLE users ADD CONSTRAINT users_learn_access_check CHECK (learn_access IN ('off', 'free'));

ALTER TABLE organizations ADD COLUMN IF NOT EXISTS learn_access VARCHAR(10) NOT NULL DEFAULT 'off';
ALTER TABLE organizations DROP CONSTRAINT IF EXISTS organizations_learn_access_check;
ALTER TABLE organizations ADD CONSTRAINT organizations_learn_access_check CHECK (learn_access IN ('off', 'free'));

-- ── 5. Premium ────────────────────────────────────────────────────────────
-- One row per grant, on a person or on a company. Active while not revoked,
-- started, and not past its end (no end date: until revoked). The source says
-- where it came from: admin today; the payment provider's reference goes in
-- external_ref when online payment is added.
CREATE TABLE IF NOT EXISTS learn_licenses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    tier VARCHAR(20) NOT NULL DEFAULT 'premium',
    source VARCHAR(20) NOT NULL DEFAULT 'admin',
    starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ends_at TIMESTAMPTZ,
    reason TEXT,
    external_ref VARCHAR(255),
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    revoked_at TIMESTAMPTZ,
    revoked_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    revoke_reason TEXT,
    CONSTRAINT learn_licenses_one_holder CHECK ((user_id IS NULL) <> (organization_id IS NULL)),
    CONSTRAINT learn_licenses_tier_check CHECK (tier IN ('premium')),
    CONSTRAINT learn_licenses_dates_check CHECK (ends_at IS NULL OR ends_at > starts_at)
);
CREATE INDEX IF NOT EXISTS idx_learn_licenses_user ON learn_licenses (user_id) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_learn_licenses_org ON learn_licenses (organization_id) WHERE revoked_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS learn_licenses_external_ref ON learn_licenses (source, external_ref) WHERE external_ref IS NOT NULL;

-- Settings of the courses chosen by an administrator. 'mode': free (everything
-- open to everyone) or premium (the access levels apply). No row: free.
CREATE TABLE IF NOT EXISTS learn_settings (
    key VARCHAR(40) PRIMARY KEY,
    value VARCHAR(200) NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- ── 6. History, requests, content ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS learn_access_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(40) NOT NULL,
    detail JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_learn_access_log_user ON learn_access_log (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_learn_access_log_org ON learn_access_log (organization_id, created_at DESC);

-- "I would like Premium": one open request per person, answered by the team.
CREATE TABLE IF NOT EXISTS learn_premium_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message VARCHAR(500),
    status VARCHAR(12) NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    handled_at TIMESTAMPTZ,
    handled_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT learn_premium_requests_status_check CHECK (status IN ('open', 'done', 'dismissed'))
);
CREATE UNIQUE INDEX IF NOT EXISTS learn_premium_requests_one_open ON learn_premium_requests (user_id) WHERE status = 'open';

-- Which account loaded which protected item, and when (download limits, and
-- the evidence behind a future certificate). Kept 180 days.
CREATE TABLE IF NOT EXISTS learn_content_log (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item VARCHAR(120) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_learn_content_log_user ON learn_content_log (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_learn_content_log_age ON learn_content_log (created_at);
