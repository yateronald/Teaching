require('dotenv').config();
const fs = require('fs');
const path = require('path');
const PostgreSQLDatabase = require('./init-postgres');

// Applies migration 022 (website monitoring). Safe to run twice.
async function run() {
    const db = new PostgreSQLDatabase();
    try {
        await db.initialize();
        const sql = fs.readFileSync(path.join(__dirname, 'migrations', '022_site_monitoring.sql'), 'utf8');
        await db.run(sql);

        for (const table of ['site_visits', 'site_salts', 'api_metrics']) {
            const cols = await db.all(
                'SELECT column_name FROM information_schema.columns WHERE table_name = $1', [table]);
            if (!cols.length) throw new Error(`${table} was not created`);
            console.log(`  table ${table.padEnd(12)} ${cols.length} columns`);
        }
        const admins = await db.get(
            `SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE can_view_monitoring)::int AS allowed
               FROM users WHERE role = 'admin'`);
        console.log(`  administrators: ${admins.allowed} of ${admins.total} may see the monitoring space`);

        console.log('\n✅ Migration 022 complete — website monitoring is ready.');
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        if (db && typeof db.close === 'function') await db.close();
    }
}

run();
