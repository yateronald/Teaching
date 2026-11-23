require('dotenv').config();
const fs = require('fs');
const path = require('path');
const PostgreSQLDatabase = require('./init-postgres');

// Applies migration 031 (online payment of Premium with Paystack). Safe to run
// twice. Migration 030 (website accounts) must be applied first.
async function run() {
    const db = new PostgreSQLDatabase();
    try {
        await db.initialize();
        const ready = await db.get("SELECT 1 AS ok FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'learn_licenses'");
        if (!ready) throw new Error('Run database/run-learner-accounts-migration.js (migration 030) first.');
        await db.run(fs.readFileSync(path.join(__dirname, 'migrations', '031_payments.sql'), 'utf8'));
        const tables = ['learn_offers', 'learn_payments', 'learn_subscriptions', 'learn_payment_events'];
        const found = await db.all(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ANY($1)", [tables]);
        if (found.length !== tables.length) throw new Error(`Tables not created: ${tables.filter(t => !found.some(f => f.table_name === t)).join(', ')}`);
        const n = await db.get('SELECT (SELECT COUNT(*) FROM learn_offers)::int AS offers, (SELECT COUNT(*) FROM learn_payments)::int AS payments');
        console.log(`  ${n.offers} price(s), ${n.payments} payment(s).`);
        console.log('\n✅ Migration 031 complete — online payment is ready (add prices in Online courses → Prices).');
    } catch (err) {
        console.error('Migration failed:', err.message);
        process.exit(1);
    } finally {
        if (db && typeof db.close === 'function') await db.close();
    }
}

run();
