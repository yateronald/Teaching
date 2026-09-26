require('dotenv').config();
const fs = require('fs');
const path = require('path');
const PostgreSQLDatabase = require('./init-postgres');

// Applies migration 025 (companies: their accounts, content, groups, credits and audit). Safe to run twice.
async function run() {
    const db = new PostgreSQLDatabase();
    try {
        await db.initialize();
        const sql = fs.readFileSync(path.join(__dirname, 'migrations', '025_organizations.sql'), 'utf8');
        await db.run(sql);

        const tables = await db.all(
            `SELECT table_name FROM information_schema.tables
              WHERE table_schema = 'public' AND table_name LIKE 'organization%' ORDER BY table_name`);
        tables.forEach(t => console.log(`  ${t.table_name}`));
        const column = await db.get(
            `SELECT 1 AS ok FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'organization_id'`);
        console.log(`  users.organization_id ${column ? 'present' : 'MISSING'}`);

        console.log('\n✅ Migration 025 complete — companies can now be created in the admin console.');
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        if (db && typeof db.close === 'function') await db.close();
    }
}

run();
