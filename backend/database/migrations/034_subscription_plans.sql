-- Migration 034: 3-tier × 3-period Academy Subscription Plans
-- (Free, Standard for courses, Premium for courses + Exam Simulator & AI credits;
--  Monthly, Quarterly, and Yearly billing periods with configurable discounts).
-- Additive and idempotent; requires migrations 030 (learn_licenses) and 031 (learn_offers).

-- 1. Allow 'standard' alongside 'premium' on learn_licenses.tier
ALTER TABLE learn_licenses DROP CONSTRAINT IF EXISTS learn_licenses_tier_check;
ALTER TABLE learn_licenses
    ADD CONSTRAINT learn_licenses_tier_check CHECK (tier IN ('standard', 'premium'));

-- 2. Tag offers with plan tier, billing period, and configured discount %
ALTER TABLE learn_offers
    ADD COLUMN IF NOT EXISTS plan_tier VARCHAR(20) NOT NULL DEFAULT 'premium',
    ADD COLUMN IF NOT EXISTS billing_period VARCHAR(20),
    ADD COLUMN IF NOT EXISTS discount_pct SMALLINT NOT NULL DEFAULT 0;

ALTER TABLE learn_offers DROP CONSTRAINT IF EXISTS learn_offers_plan_tier_check;
ALTER TABLE learn_offers
    ADD CONSTRAINT learn_offers_plan_tier_check CHECK (plan_tier IN ('standard', 'premium'));

ALTER TABLE learn_offers DROP CONSTRAINT IF EXISTS learn_offers_billing_period_check;
ALTER TABLE learn_offers
    ADD CONSTRAINT learn_offers_billing_period_check CHECK (billing_period IS NULL OR billing_period IN ('monthly', 'quarterly', 'yearly'));

ALTER TABLE learn_offers DROP CONSTRAINT IF EXISTS learn_offers_discount_pct_check;
ALTER TABLE learn_offers
    ADD CONSTRAINT learn_offers_discount_pct_check CHECK (discount_pct BETWEEN 0 AND 95);

-- 3. Ensure learn_settings exists for storing global currency, discounts, and AI credits
CREATE TABLE IF NOT EXISTS learn_settings (
    key VARCHAR(40) PRIMARY KEY,
    value VARCHAR(200) NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);
