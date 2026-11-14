-- Migration 026: marketing campaigns (promotions) shown on the public site.
--
-- An administrator creates a campaign in the admin console: a group class with
-- dates and seats, a discount, a free event or a plain announcement. While it
-- is published and inside its dates, the public site shows it where the
-- administrator chose (announcement bar, home page, flash pop-up, free
-- courses, offers page). Visitors register with a short form; the
-- administrator sees who registered, per campaign.
--
-- Additive; safe to run twice.

-- ── Campaigns ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS promotions (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(80) NOT NULL,                  -- public address of the campaign: /offers/?p=<slug>
    kind VARCHAR(16) NOT NULL DEFAULT 'group_class'
        CHECK (kind IN ('group_class', 'offer', 'event', 'announcement')),
    status VARCHAR(12) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'published', 'paused', 'archived')),

    -- What visitors read, in the two languages of the site. One language may be
    -- left empty: the other one is shown instead.
    title_en VARCHAR(140),
    title_fr VARCHAR(140),
    tagline_en VARCHAR(220),
    tagline_fr VARCHAR(220),
    description_en TEXT,
    description_fr TEXT,
    highlights_en JSONB NOT NULL DEFAULT '[]'::jsonb,   -- short selling points, as an array of strings
    highlights_fr JSONB NOT NULL DEFAULT '[]'::jsonb,
    cta_en VARCHAR(40),
    cta_fr VARCHAR(40),
    badge_en VARCHAR(30),                       -- "-20 %", "New", "Last seats"
    badge_fr VARCHAR(30),

    -- Who it is for: decides which free courses show it first.
    audience VARCHAR(20) NOT NULL DEFAULT 'general'
        CHECK (audience IN ('general', 'beginner', 'conversation', 'tcf', 'tef', 'delf', 'business', 'kids')),
    level VARCHAR(20),                          -- "A2", "B1 → B2", "NCLC 7"

    -- The class itself (group classes and events).
    class_starts_on DATE,
    class_ends_on DATE,
    schedule_en VARCHAR(160),                   -- "Mon & Wed, 7 pm (Montréal time)"
    schedule_fr VARCHAR(160),
    teacher_name VARCHAR(120),
    seat_limit INTEGER CHECK (seat_limit IS NULL OR seat_limit > 0),
    show_seats BOOLEAN NOT NULL DEFAULT true,   -- "4 seats left" on the site

    -- Price (all optional).
    price_regular NUMERIC(10, 2) CHECK (price_regular IS NULL OR price_regular >= 0),
    price_promo NUMERIC(10, 2) CHECK (price_promo IS NULL OR price_promo >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'CAD',
    price_note_en VARCHAR(120),                 -- "per month", "for the 8 weeks"
    price_note_fr VARCHAR(120),

    -- When the site shows it. ends_at is also the registration deadline.
    starts_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ends_at TIMESTAMPTZ,
    show_countdown BOOLEAN NOT NULL DEFAULT true,

    -- Where the site shows it (the offers page always lists it).
    place_bar BOOLEAN NOT NULL DEFAULT false,
    place_home BOOLEAN NOT NULL DEFAULT true,
    place_flash BOOLEAN NOT NULL DEFAULT false,
    place_learn BOOLEAN NOT NULL DEFAULT true,
    priority INTEGER NOT NULL DEFAULT 0,        -- higher first

    -- How it looks.
    theme VARCHAR(16) NOT NULL DEFAULT 'navy'
        CHECK (theme IN ('navy', 'bordeaux', 'gold', 'forest', 'plum')),
    image_key VARCHAR(80),                      -- a picture of the site's library (public/learn/img)

    -- What the button does: the registration form, an outside link, or nothing.
    registration_mode VARCHAR(8) NOT NULL DEFAULT 'form'
        CHECK (registration_mode IN ('form', 'link', 'none')),
    cta_url VARCHAR(500),

    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CHECK (title_en IS NOT NULL OR title_fr IS NOT NULL),
    CHECK (ends_at IS NULL OR ends_at > starts_at),
    CHECK (class_ends_on IS NULL OR class_starts_on IS NULL OR class_ends_on >= class_starts_on)
);
CREATE UNIQUE INDEX IF NOT EXISTS promotions_slug_key ON promotions (lower(slug));
CREATE INDEX IF NOT EXISTS idx_promotions_live ON promotions (status, starts_at, ends_at);

-- ── People who registered ────────────────────────────────────────────────
-- A campaign that has registrations is never deleted (it is archived): the
-- list of people is the reason the campaign existed.
CREATE TABLE IF NOT EXISTS promotion_registrations (
    id SERIAL PRIMARY KEY,
    promotion_id INTEGER NOT NULL REFERENCES promotions(id) ON DELETE RESTRICT,
    full_name VARCHAR(140) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(40),
    country VARCHAR(80),
    level VARCHAR(40),                          -- what the person says of their French
    message TEXT,
    language VARCHAR(2) NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'fr')),
    timezone VARCHAR(64),
    placement VARCHAR(16),                      -- where on the site the person clicked
    source_path VARCHAR(200),                   -- the page they were on
    status VARCHAR(12) NOT NULL DEFAULT 'new'
        CHECK (status IN ('new', 'contacted', 'confirmed', 'waitlist', 'cancelled')),
    notes TEXT,                                 -- the administrator's own notes
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- One registration per person and campaign, whatever the case of the email.
CREATE UNIQUE INDEX IF NOT EXISTS promotion_registrations_once
    ON promotion_registrations (promotion_id, lower(email));
CREATE INDEX IF NOT EXISTS idx_promotion_registrations_status
    ON promotion_registrations (promotion_id, status);

-- ── How often each campaign is seen and clicked ──────────────────────────
-- One row per campaign, day and place on the site. Counts only: nothing here
-- says who looked.
CREATE TABLE IF NOT EXISTS promotion_stats (
    promotion_id INTEGER NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
    day DATE NOT NULL,
    placement VARCHAR(16) NOT NULL,
    views INTEGER NOT NULL DEFAULT 0,
    clicks INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (promotion_id, day, placement)
);
