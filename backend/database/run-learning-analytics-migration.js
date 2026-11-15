require('dotenv').config();
const fs = require('fs');
const path = require('path');
const PostgreSQLDatabase = require('./init-postgres');

// Applies migration 027 (free-course statistics in the monitoring space).
// Needs migration 022 (website monitoring) first. Safe to run twice.
async function run() {
    const db = new PostgreSQLDatabase();
    try {
        await db.initialize();
        const monitoring = await db.get(
            "SELECT 1 AS ok FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'site_visits'");
        if (!monitoring) throw new Error('site_visits is missing: run run-site-monitoring-migration.js first.');

        const sql = fs.readFileSync(path.join(__dirname, 'migrations', '027_learning_analytics.sql'), 'utf8');
        await db.run(sql);

        for (const table of ['learn_events', 'learn_titles']) {
            const cols = await db.all('SELECT column_name FROM information_schema.columns WHERE table_name = $1', [table]);
            if (!cols.length) throw new Error(`${table} was not created`);
            console.log(`  table ${table.padEnd(13)} ${cols.length} columns`);
        }
        const learn = await db.get("SELECT COUNT(*)::int AS n FROM site_visits WHERE area = 'learn'");
        console.log(`  free-course page views already recorded: ${learn.n}`);

        console.log('\n✅ Migration 027 complete — free-course statistics are ready.');
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        if (db && typeof db.close === 'function') await db.close();
    }
}

run();
