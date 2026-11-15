require('dotenv').config();
const fs = require('fs');
const path = require('path');
const PostgreSQLDatabase = require('./init-postgres');

// Applies migration 029 (email campaigns). Safe to run twice.
async function run() {
    const db = new PostgreSQLDatabase();
    try {
        await db.initialize();
        const sql = fs.readFileSync(path.join(__dirname, 'migrations', '029_email_campaigns.sql'), 'utf8');
        await db.run(sql);

        const tables = ['email_campaigns', 'email_campaign_recipients', 'email_campaign_links', 'email_campaign_events', 'email_campaign_responses', 'email_suppressions', 'email_settings'];
        const found = await db.all(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ANY($1) ORDER BY 1", [tables]);
        if (found.length !== tables.length) {
            const missing = tables.filter(t => !found.some(f => f.table_name === t));
            throw new Error(`Tables not created: ${missing.join(', ')}`);
        }
        const counts = await db.get(
            'SELECT (SELECT COUNT(*) FROM email_campaigns)::int AS campaigns, (SELECT COUNT(*) FROM email_suppressions)::int AS suppressed');
        console.log(`  ${tables.join(', ')} ready — ${counts.campaigns} campaign(s), ${counts.suppressed} suppressed address(es)`);

        console.log('\n✅ Migration 029 complete — email campaigns are ready.');
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        if (db && typeof db.close === 'function') await db.close();
    }
}

run();
