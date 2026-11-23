-- Migration 031: online payment of Premium (Paystack).
--
--   learn_offers          what can be bought: price (in the currency's subunit,
--                         as Paystack counts it), period of Premium, one-time or
--                         recurring (a Paystack plan). Prices live here only:
--                         the website never sends an amount.
--   learn_payments        one row per payment attempt, created by the server
--                         before the visitor goes to Paystack. Only a payment
--                         confirmed by Paystack's own API grants Premium.
--   learn_subscriptions   recurring plans (renewals arrive as new payments).
--   learn_payment_events  every webhook received (signature checked), once.
--
-- Premium itself stays a license (learn_licenses, source 'paystack',
-- external_ref = the payment reference): the unique (source, external_ref)
-- index makes a payment grant Premium at most once, however many times
-- Paystack or the browser reports it.
--
-- Additive and safe to run twice. Needs migration 030.

CREATE TABLE IF NOT EXISTS learn_offers (
    id SERIAL PRIMARY KEY,
    code VARCHAR(40) NOT NULL UNIQUE,
    name_en VARCHAR(80) NOT NULL,
    name_fr VARCHAR(80) NOT NULL,
    description_en VARCHAR(300),
    description_fr VARCHAR(300),
    days INTEGER NOT NULL CHECK (days BETWEEN 1 AND 3660),
    amount BIGINT NOT NULL CHECK (amount > 0),
    currency CHAR(3) NOT NULL,
    recurring BOOLEAN NOT NULL DEFAULT false,
    paystack_plan_code VARCHAR(60),
    active BOOLEAN NOT NULL DEFAULT false,
    sort SMALLINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT learn_offers_plan_check CHECK (NOT recurring OR paystack_plan_code IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS learn_payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    offer_id INTEGER REFERENCES learn_offers(id) ON DELETE SET NULL,
    provider VARCHAR(20) NOT NULL DEFAULT 'paystack',
    reference VARCHAR(100) NOT NULL UNIQUE,
    amount BIGINT NOT NULL,
    currency CHAR(3) NOT NULL,
    days INTEGER NOT NULL,
    -- initialized | success | failed | abandoned | review | refunded | disputed
    status VARCHAR(12) NOT NULL DEFAULT 'initialized',
    status_detail VARCHAR(200),
    provider_transaction_id BIGINT,
    customer_code VARCHAR(60),
    channel VARCHAR(30),
    paid_at TIMESTAMPTZ,
    license_id INTEGER REFERENCES learn_licenses(id) ON DELETE SET NULL,
    renewal BOOLEAN NOT NULL DEFAULT false,
    ip VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT learn_payments_status_check CHECK (status IN ('initialized', 'success', 'failed', 'abandoned', 'review', 'refunded', 'disputed'))
);
CREATE INDEX IF NOT EXISTS idx_learn_payments_user ON learn_payments (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_learn_payments_status ON learn_payments (status, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS learn_payments_provider_tx ON learn_payments (provider, provider_transaction_id) WHERE provider_transaction_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS learn_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    offer_id INTEGER REFERENCES learn_offers(id) ON DELETE SET NULL,
    provider VARCHAR(20) NOT NULL DEFAULT 'paystack',
    subscription_code VARCHAR(60) NOT NULL UNIQUE,
    -- Paystack's token to cancel this subscription: never shown to anyone.
    email_token VARCHAR(100),
    plan_code VARCHAR(60),
    customer_code VARCHAR(60),
    -- active | non-renewing | attention | completed | cancelled
    status VARCHAR(20) NOT NULL,
    next_payment_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_learn_subscriptions_user ON learn_subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_learn_subscriptions_customer ON learn_subscriptions (customer_code);

CREATE TABLE IF NOT EXISTS learn_payment_events (
    id SERIAL PRIMARY KEY,
    provider VARCHAR(20) NOT NULL DEFAULT 'paystack',
    -- sha256 of the raw body: the same notification is handled once
    body_hash CHAR(64) NOT NULL UNIQUE,
    event VARCHAR(60) NOT NULL,
    reference VARCHAR(100),
    received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_at TIMESTAMPTZ,
    outcome VARCHAR(30),
    error VARCHAR(300)
);
CREATE INDEX IF NOT EXISTS idx_learn_payment_events_ref ON learn_payment_events (reference);
CREATE INDEX IF NOT EXISTS idx_learn_payment_events_time ON learn_payment_events (received_at DESC);
