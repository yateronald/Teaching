require('dotenv').config();
const fs = require('fs');
const path = require('path');
const PostgreSQLDatabase = require('./init-postgres');

// Applies migration 033 (FX checkout metadata & USD PDF invoice fields on learn_payments).
// Safe to run twice; requires migration 031 (learn_payments) first.
async function run() {
    const db = new PostgreSQLDatabase();
    try {
        await db.initialize();
        const ready = await db.get(
            "SELECT 1 AS ok FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'learn_payments'");
        if (!ready) throw new Error('Run database/run-payments-migration.js (migration 031) first.');

        const sql = fs.readFileSync(path.join(__dirname, 'migrations', '033_payment_fx_invoices.sql'), 'utf8');
        await db.run(sql);

        const cols = await db.all(
            `SELECT column_name
               FROM information_schema.columns
              WHERE table_schema = 'public'
                AND table_name = 'learn_payments'
                AND column_name IN ('display_amount', 'display_currency', 'fx_rate', 'invoice_number', 'invoice_emailed_at')`);
        if (cols.length < 5) {
            throw new Error(`Expected 5 columns on learn_payments, found ${cols.length}.`);
        }
        const idx = await db.get(
            "SELECT 1 AS ok FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'learn_payments_invoice_number_ux'");
        if (!idx) throw new Error('Expected index learn_payments_invoice_number_ux missing.');

        console.log('  Verified 5 columns + unique invoice_number index on learn_payments.');
        console.log('\n✅ Migration 033 complete — FX checkout metadata & invoice tracking ready.');
    } catch (err) {
        console.error('Migration failed:', err.message);
        process.exit(1);
    } finally {
        if (db && typeof db.close === 'function') await db.close();
    }
}

run();
