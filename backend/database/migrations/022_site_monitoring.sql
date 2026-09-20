-- Migration 022: website monitoring.
--
-- Three things:
--   1. `can_view_monitoring` -- an administrator only sees the monitoring space
--      when this is on. Existing administrators keep access; new ones get it
--      only if the box is ticked when the account is created.
--   2. `site_visits` -- one row per page view of the public website. No cookie,
--      no IP address and no name is ever stored: a visitor is a hash of their
--      address and browser with a salt that is thrown away every day, so the
--      rows cannot be traced back to a person or joined across days.
--   3. `api_metrics` -- one row per minute per API route, for platform health.
--
-- Additive and safe to run twice.

-- -- Who may look -----------------------------------------------------------
ALTER TABLE users ADD COLUMN IF NOT EXISTS can_view_monitoring BOOLEAN NOT NULL DEFAULT false;
-- Administrators already in place keep their access; nobody else gains any.
UPDATE users SET can_view_monitoring = true WHERE role = 'admin' AND can_view_monitoring = false;

-- -- The daily salt ---------------------------------------------------------
-- Random, never derived from visitor data, and only today's is usable. Old
-- ones are deleted, which makes yesterday's hashes permanently anonymous.
CREATE TABLE IF NOT EXISTS site_salts (
    day DATE PRIMARY KEY,
    salt TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -- Page views -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS site_visits (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- Client-side id, used only to attach the performance figures of the same
    -- page view a moment later. Unguessable and short-lived.
    event_key UUID,
    -- sha256(ip + browser + today's salt), or NULL when the visitor asked not
    -- to be counted individually (Do Not Track / Global Privacy Control).
    visitor_hash CHAR(32),
    path VARCHAR(200) NOT NULL,
    lang CHAR(2),
    country CHAR(2),
    country_from VARCHAR(8),          -- header | timezone
    referrer_host VARCHAR(120),
    channel VARCHAR(12) NOT NULL,     -- direct | search | social | referral | campaign
    source VARCHAR(60),
    medium VARCHAR(60),
    campaign VARCHAR(60),
    device VARCHAR(8),                -- phone | tablet | desktop
    browser VARCHAR(20),
    os VARCHAR(20),
    screen_w SMALLINT,
    is_bot BOOLEAN NOT NULL DEFAULT false,
    -- How the page performed for this visitor (Core Web Vitals, milliseconds;
    -- CLS is unitless so it is stored x1000).
    ttfb_ms INTEGER,
    fcp_ms INTEGER,
    lcp_ms INTEGER,
    inp_ms INTEGER,
    cls_x1000 INTEGER,
    load_ms INTEGER,
    dwell_ms INTEGER
);

CREATE INDEX IF NOT EXISTS idx_site_visits_time ON site_visits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_visits_visitor ON site_visits(visitor_hash, created_at);
CREATE INDEX IF NOT EXISTS idx_site_visits_path ON site_visits(path, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_visits_country ON site_visits(country, created_at DESC);
-- One page view may only ever be completed once.
CREATE UNIQUE INDEX IF NOT EXISTS idx_site_visits_event ON site_visits(event_key) WHERE event_key IS NOT NULL;

-- -- API performance --------------------------------------------------------
CREATE TABLE IF NOT EXISTS api_metrics (
    id BIGSERIAL PRIMARY KEY,
    minute TIMESTAMP NOT NULL,
    route VARCHAR(120) NOT NULL,
    method VARCHAR(8) NOT NULL,
    hits INTEGER NOT NULL DEFAULT 0,
    client_errors INTEGER NOT NULL DEFAULT 0,   -- 4xx
    server_errors INTEGER NOT NULL DEFAULT 0,   -- 5xx
    ms_total BIGINT NOT NULL DEFAULT 0,
    ms_max INTEGER NOT NULL DEFAULT 0,
    ms_p50 INTEGER NOT NULL DEFAULT 0,
    ms_p95 INTEGER NOT NULL DEFAULT 0,
    UNIQUE (minute, route, method)
);

CREATE INDEX IF NOT EXISTS idx_api_metrics_time ON api_metrics(minute DESC);
