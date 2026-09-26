-- Migration 025: companies (organizations) that prepare their own learners for the exam.
--
-- An administrator creates a company with an access window, the exam content it
-- may use and a reserve of AI credits (written and spoken expression). The
-- company's managers (role org_admin) add learners (role candidate, linked by
-- users.organization_id), group them, open content to them until at most the
-- company's own end date, and hand out credits from the reserve.
--
-- The rules that must hold whatever the application does are enforced here:
-- credits never go below zero, a learner belongs to one company, an email or a
-- username is used once. Additive; safe to run twice.

-- ── Companies ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(160) NOT NULL,                 -- official name, set by the administrator
    display_name VARCHAR(160),                  -- name shown to learners, the company may change it
    slug VARCHAR(80) NOT NULL,                  -- branded sign-in address: /o/<slug>
    default_language VARCHAR(2) NOT NULL DEFAULT 'fr' CHECK (default_language IN ('fr', 'en')),
    status VARCHAR(12) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    access_starts_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    access_ends_at TIMESTAMPTZ NOT NULL,
    seat_limit INTEGER NOT NULL CHECK (seat_limit > 0),        -- the package: learner accounts it may create
    ee_credits INTEGER NOT NULL DEFAULT 0 CHECK (ee_credits >= 0),   -- reserve not yet handed out
    eo_credits INTEGER NOT NULL DEFAULT 0 CHECK (eo_credits >= 0),
    logo_file_id VARCHAR(255),
    logo_mime VARCHAR(40),
    logo_updated_at TIMESTAMPTZ,
    notes TEXT,
    expiry_notice_for TIMESTAMPTZ,              -- the end date the "expires soon" email was sent for
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (access_ends_at > access_starts_at)
);
CREATE UNIQUE INDEX IF NOT EXISTS organizations_slug_key ON organizations (lower(slug));

-- Managers and learners of a company. A company is never deleted while it has accounts.
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id) ON DELETE RESTRICT;
CREATE INDEX IF NOT EXISTS idx_users_organization ON users (organization_id) WHERE organization_id IS NOT NULL;

-- The company manager role.
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
    CHECK (role = ANY (ARRAY['admin', 'teacher', 'student', 'candidate', 'org_admin']));

-- Company accounts are exactly managers and learners; managers always belong to a company.
DO $$ BEGIN
    ALTER TABLE users ADD CONSTRAINT users_organization_role_check
        CHECK ((organization_id IS NULL AND role <> 'org_admin')
            OR (organization_id IS NOT NULL AND role IN ('org_admin', 'candidate')));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- One account per email and per username, whatever the case (checked in code
-- before; now also safe when two sign-ups race).
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_key ON users (lower(email));
CREATE UNIQUE INDEX IF NOT EXISTS users_username_lower_key ON users (lower(username));

-- ── Content the company may use ──────────────────────────────────────────
-- A category covers everything under it; a year its months; a month its leaves.
CREATE TABLE IF NOT EXISTS organization_content (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    content_type VARCHAR(30) NOT NULL CHECK (content_type IN (
        'category', 'ce_series', 'co_series', 'ee_year', 'ee_month', 'ee_combinaison',
        'eo_year', 'eo_month', 'eo_partie')),
    content_id INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (organization_id, content_type, content_id)
);

-- ── Learner groups ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS organization_groups (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS organization_groups_name_key ON organization_groups (organization_id, lower(name));

CREATE TABLE IF NOT EXISTS organization_group_members (
    group_id INTEGER NOT NULL REFERENCES organization_groups(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (group_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_org_group_members_user ON organization_group_members (user_id);

-- ── Assignments made by a company ────────────────────────────────────────
-- organization_id marks assignments a company made (they stay within what the
-- company may use); org_group_id opens content to every current member of a group.
ALTER TABLE tcf_exam_assignments ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE tcf_exam_assignments ADD COLUMN IF NOT EXISTS org_group_id INTEGER REFERENCES organization_groups(id) ON DELETE CASCADE;
ALTER TABLE tcf_exam_assignments DROP CONSTRAINT IF EXISTS tcf_exam_assignments_check;
ALTER TABLE tcf_exam_assignments ADD CONSTRAINT tcf_exam_assignments_check
    CHECK (student_id IS NOT NULL OR batch_id IS NOT NULL OR org_group_id IS NOT NULL);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tcf_ea_org_group ON tcf_exam_assignments (content_type, content_id, org_group_id) WHERE org_group_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tcf_ea_organization ON tcf_exam_assignments (organization_id) WHERE organization_id IS NOT NULL;

-- ── Credits ──────────────────────────────────────────────────────────────
-- Learner balances never go below zero (they are spent in one conditional update).
DO $$ BEGIN
    ALTER TABLE student_ai_credits ADD CONSTRAINT student_ai_credits_not_negative
        CHECK (ee_credits >= 0 AND eo_credits >= 0);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Every movement of a company's reserve: granted or taken back by the
-- administrator, handed to a learner, returned from a learner.
CREATE TABLE IF NOT EXISTS organization_credit_transactions (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    credit_type VARCHAR(2) NOT NULL CHECK (credit_type IN ('ee', 'eo')),
    delta INTEGER NOT NULL,                     -- change of the reserve
    reason VARCHAR(30) NOT NULL CHECK (reason IN ('admin_grant', 'admin_revoke', 'distribute', 'reclaim', 'learner_left')),
    learner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_org_credit_tx_org ON organization_credit_transactions (organization_id, created_at DESC);

-- ── Rules the database itself enforces ───────────────────────────────────
-- Package: a company creates at most seat_limit learner accounts. Every account
-- counts, active or deactivated: turning a learner off does not free a place
-- (the company may turn them back on; more accounts need a bigger package).
-- The company row is locked first, so two additions at the same moment are
-- counted one after the other (each statement of the function sees what the
-- other committed).
CREATE OR REPLACE FUNCTION enforce_org_seat_limit() RETURNS trigger AS $$
DECLARE
    lim INTEGER;
    used INTEGER;
BEGIN
    IF NEW.organization_id IS NULL OR NEW.role <> 'candidate' THEN
        RETURN NEW;
    END IF;
    IF TG_OP = 'UPDATE' AND OLD.organization_id IS NOT DISTINCT FROM NEW.organization_id AND OLD.role = NEW.role THEN
        RETURN NEW; -- already counted
    END IF;
    SELECT seat_limit INTO lim FROM organizations WHERE id = NEW.organization_id FOR UPDATE;
    SELECT COUNT(*) INTO used FROM users
     WHERE organization_id = NEW.organization_id AND role = 'candidate' AND id <> NEW.id;
    IF lim IS NULL OR used >= lim THEN
        RAISE EXCEPTION 'SEAT_LIMIT_REACHED' USING ERRCODE = 'P0001';
    END IF;
    RETURN NEW;
END $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_org_seat_limit ON users;
CREATE TRIGGER users_org_seat_limit BEFORE INSERT OR UPDATE OF organization_id, role ON users
    FOR EACH ROW EXECUTE FUNCTION enforce_org_seat_limit();

-- A company's assignment always ends, and never after the company's own end date.
-- (tcf_exam_assignments.expires_at holds UTC wall-clock time.)
CREATE OR REPLACE FUNCTION enforce_org_assignment_end() RETURNS trigger AS $$
DECLARE
    ends TIMESTAMPTZ;
BEGIN
    IF NEW.organization_id IS NULL THEN
        RETURN NEW;
    END IF;
    SELECT access_ends_at INTO ends FROM organizations WHERE id = NEW.organization_id;
    IF NEW.expires_at IS NULL OR (NEW.expires_at AT TIME ZONE 'UTC') > ends THEN
        RAISE EXCEPTION 'ORG_ASSIGNMENT_AFTER_END' USING ERRCODE = 'P0001';
    END IF;
    RETURN NEW;
END $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tcf_ea_org_end ON tcf_exam_assignments;
CREATE TRIGGER tcf_ea_org_end BEFORE INSERT OR UPDATE OF expires_at, organization_id ON tcf_exam_assignments
    FOR EACH ROW EXECUTE FUNCTION enforce_org_assignment_end();

-- ── Audit ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS organization_audit (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(40) NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_org_audit_org ON organization_audit (organization_id, created_at DESC);
