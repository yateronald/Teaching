-- Migration 029: email campaigns.
--
--   email_campaigns            one email: its words in French and English (content),
--                              its buttons, its offer box, its design, its form,
--                              its audience and its state
--   email_campaign_recipients  the people it was sent to, each with a private token
--                              (tracking, unsubscribe, view in the browser, the form)
--   email_campaign_links       the links of a sent campaign, by number: a click only ever
--                              redirects to one of them (never an open redirect)
--   email_campaign_events      opens, clicks and unsubscribes (no IP address kept)
--   email_campaign_responses   what people sent through the campaign's form
--   email_suppressions         addresses that must never receive a campaign again
--                              (unsubscribed, bounced, complaint, removed by hand)
--   email_settings             the sender's details (postal address required by CASL)
--
-- Additive and safe to run twice.

CREATE TABLE IF NOT EXISTS email_campaigns (
    id               SERIAL PRIMARY KEY,
    name             VARCHAR(140) NOT NULL,
    status           VARCHAR(12)  NOT NULL DEFAULT 'draft',   -- draft, scheduled, sending, paused, sent, cancelled
    goal             VARCHAR(12)  NOT NULL DEFAULT 'news',    -- news, offer, group, whatsapp, event, reminder, survey
    language_mode    VARCHAR(6)   NOT NULL DEFAULT 'auto',    -- auto (each person's language), fr, en, both
    default_lang     VARCHAR(2)   NOT NULL DEFAULT 'fr',      -- language of the people whose language is unknown
    content          JSONB NOT NULL DEFAULT '{}'::jsonb,      -- { fr: {subject, preheader, headline, body…}, en: {…} }
    buttons          JSONB NOT NULL DEFAULT '{}'::jsonb,      -- { primary: {action, url}, secondary: {action, url} }
    offer            JSONB NOT NULL DEFAULT '{}'::jsonb,      -- { show, regular, promo, currency }
    design           JSONB NOT NULL DEFAULT '{}'::jsonb,      -- layout, header, colours, fonts, shapes
    form             JSONB NOT NULL DEFAULT '{}'::jsonb,      -- { fields: [...] }
    image_key        VARCHAR(80),
    promotion_id     INTEGER,
    audience         JSONB NOT NULL DEFAULT '{}'::jsonb,
    excluded         JSONB NOT NULL DEFAULT '[]'::jsonb,
    scheduled_at     TIMESTAMPTZ,
    started_at       TIMESTAMPTZ,
    finished_at      TIMESTAMPTZ,
    note             VARCHAR(200),
    created_by       INTEGER,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS email_campaigns_status ON email_campaigns (status, scheduled_at);

CREATE TABLE IF NOT EXISTS email_campaign_links (
    campaign_id INTEGER  NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
    idx         SMALLINT NOT NULL,
    url         VARCHAR(1000) NOT NULL,                       -- « form »: the campaign's form page
    label       VARCHAR(80),
    PRIMARY KEY (campaign_id, idx)
);

CREATE TABLE IF NOT EXISTS email_campaign_recipients (
    id              SERIAL PRIMARY KEY,
    campaign_id     INTEGER NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
    email           VARCHAR(254) NOT NULL,
    name            VARCHAR(160),
    lang            VARCHAR(4)  NOT NULL DEFAULT 'fr',        -- fr, en, both
    source          VARCHAR(16) NOT NULL,                     -- student, candidate, registration, demo
    token           VARCHAR(40) NOT NULL UNIQUE,
    status          VARCHAR(12) NOT NULL DEFAULT 'queued',    -- queued, sending, sent, delivered, failed, bounced, skipped
    error           VARCHAR(300),
    message_id      VARCHAR(200),
    claimed_at      TIMESTAMPTZ,
    sent_at         TIMESTAMPTZ,
    opened_at       TIMESTAMPTZ,
    opens           INTEGER NOT NULL DEFAULT 0,
    clicked_at      TIMESTAMPTZ,
    clicks          INTEGER NOT NULL DEFAULT 0,
    unsubscribed_at TIMESTAMPTZ,
    responded_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS email_campaign_recipients_once ON email_campaign_recipients (campaign_id, lower(email));
CREATE INDEX IF NOT EXISTS email_campaign_recipients_queue ON email_campaign_recipients (campaign_id, status);
CREATE INDEX IF NOT EXISTS email_campaign_recipients_message ON email_campaign_recipients (message_id);

CREATE TABLE IF NOT EXISTS email_campaign_events (
    id           BIGSERIAL PRIMARY KEY,
    campaign_id  INTEGER NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
    recipient_id INTEGER NOT NULL REFERENCES email_campaign_recipients(id) ON DELETE CASCADE,
    type         VARCHAR(12) NOT NULL,                        -- open, click, unsubscribe
    link_idx     SMALLINT,
    machine      BOOLEAN NOT NULL DEFAULT false,              -- most likely a mail scanner, not a person
    at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS email_campaign_events_campaign ON email_campaign_events (campaign_id, type, at);

CREATE TABLE IF NOT EXISTS email_campaign_responses (
    id           SERIAL PRIMARY KEY,
    campaign_id  INTEGER NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
    recipient_id INTEGER REFERENCES email_campaign_recipients(id) ON DELETE SET NULL,
    name         VARCHAR(160),
    email        VARCHAR(254),
    phone        VARCHAR(40),
    lang         VARCHAR(2) NOT NULL DEFAULT 'fr',
    answers      JSONB NOT NULL DEFAULT '{}'::jsonb,          -- { field id: answer }
    status       VARCHAR(12) NOT NULL DEFAULT 'new',          -- new, contacted, done
    notes        TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- One answer per person (sending the form again updates it).
CREATE UNIQUE INDEX IF NOT EXISTS email_campaign_responses_once ON email_campaign_responses (campaign_id, recipient_id) WHERE recipient_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS email_campaign_responses_campaign ON email_campaign_responses (campaign_id, created_at DESC);

CREATE TABLE IF NOT EXISTS email_suppressions (
    email       VARCHAR(254) PRIMARY KEY,                     -- always lower case
    reason      VARCHAR(16) NOT NULL,                         -- unsubscribed, bounced, complaint, manual
    campaign_id INTEGER,
    note        VARCHAR(200),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS email_settings (
    key        VARCHAR(40) PRIMARY KEY,
    value      TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
