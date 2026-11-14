require('dotenv').config();
const fs = require('fs');
const path = require('path');
const PostgreSQLDatabase = require('./init-postgres');

// Applies migration 026 (marketing campaigns: promotions, their registrations and their counts). Safe to run twice.
async function run() {
    const db = new PostgreSQLDatabase();
    try {
        await db.initialize();
        const sql = fs.readFileSync(path.join(__dirname, 'migrations', '026_promotions.sql'), 'utf8');
        await db.run(sql);

        const tables = await db.all(
            `SELECT table_name FROM information_schema.tables
              WHERE table_schema = 'public' AND table_name LIKE 'promotion%' ORDER BY table_name`);
        tables.forEach(t => console.log(`  ${t.table_name}`));
        const count = await db.get('SELECT COUNT(*)::int AS n FROM promotions');
        console.log(`  campaigns so far: ${count.n}`);

        console.log('\n✅ Migration 026 complete — campaigns can now be created in the admin console (Marketing).');
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        if (db && typeof db.close === 'function') await db.close();
    }
}

run();
