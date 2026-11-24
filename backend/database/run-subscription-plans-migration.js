require('dotenv').config();
const fs = require('fs');
const path = require('path');
const PostgreSQLDatabase = require('./init-postgres');

// Applies migration 034 (3-tier x 3-period subscription plan columns & tier constraints).
// Safe to run twice; requires migrations 030 (learn_licenses) and 031 (learn_offers).
async function run() {
    const db = new PostgreSQLDatabase();
    try {
        await db.initialize();
        const ready = await db.all(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('learn_licenses', 'learn_offers')");
        if (ready.length < 2) {
            throw new Error('Run migrations 030 and 031 first (learn_licenses and learn_offers required).');
        }

        const sql = fs.readFileSync(path.join(__dirname, 'migrations', '034_subscription_plans.sql'), 'utf8');
        await db.run(sql);

        const cols = await db.all(
            `SELECT column_name
               FROM information_schema.columns
              WHERE table_schema = 'public'
                AND table_name = 'learn_offers'
                AND column_name IN ('plan_tier', 'billing_period', 'discount_pct')`);
        if (cols.length < 3) {
            throw new Error(`Expected 3 new columns on learn_offers, found ${cols.length}.`);
        }

        const tierCheck = await db.get(
            "SELECT 1 AS ok FROM pg_constraint WHERE conname = 'learn_licenses_tier_check'");
        if (!tierCheck) {
            throw new Error('Expected constraint learn_licenses_tier_check missing.');
        }

        const settingsTable = await db.get(
            "SELECT 1 AS ok FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'learn_settings'");
        if (!settingsTable) {
            throw new Error('Expected table learn_settings missing.');
        }

        console.log('  Verified learn_offers.(plan_tier, billing_period, discount_pct), learn_licenses_tier_check, and learn_settings.');
        console.log('\n✅ Migration 034 complete — 3-tier subscription plans schema ready.');
    } catch (err) {
        console.error('Migration failed:', err.message);
        process.exit(1);
    } finally {
        if (db && typeof db.close === 'function') await db.close();
    }
}

run();
