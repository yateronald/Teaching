-- Migration 033: automatic FX checkout support (USD display -> XOF settlement)
-- and persistent branded USD invoice numbering & email delivery tracking.
-- Safe to run multiple times; requires migration 031 (learn_payments).

ALTER TABLE learn_payments
    ADD COLUMN IF NOT EXISTS display_amount BIGINT,
    ADD COLUMN IF NOT EXISTS display_currency CHAR(3),
    ADD COLUMN IF NOT EXISTS fx_rate NUMERIC(12, 6),
    ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(40),
    ADD COLUMN IF NOT EXISTS invoice_emailed_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS learn_payments_invoice_number_ux
    ON learn_payments (invoice_number)
    WHERE invoice_number IS NOT NULL;

UPDATE learn_payments
   SET display_amount = amount,
       display_currency = currency
 WHERE display_amount IS NULL;
