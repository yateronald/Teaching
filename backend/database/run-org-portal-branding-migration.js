const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const PostgreSQLDatabase = require('./init-postgres');

// Applies migration 037 (organization portal branding & cover image columns). Safe to run twice.
async function run() {
    const db = new PostgreSQLDatabase();
    try {
        await db.initialize();
        const sql = fs.readFileSync(path.join(__dirname, 'migrations', '037_organization_portal_branding.sql'), 'utf8');
        await db.run(sql);

        const cols = await db.all(
            `SELECT column_name
               FROM information_schema.columns
              WHERE table_name = 'organizations'
                AND column_name IN ('portal_branding', 'cover_file_id', 'cover_mime', 'cover_updated_at')
              ORDER BY column_name`
        );
        const found = new Set(cols.map(c => c.column_name));
        for (const col of ['portal_branding', 'cover_file_id', 'cover_mime', 'cover_updated_at']) {
            console.log(`  organizations.${col}: ${found.has(col) ? 'present' : 'MISSING'}`);
            if (!found.has(col)) throw new Error(`Missing column organizations.${col}`);
        }

        console.log('\nMigration 037 complete - organization portal branding columns are ready.');
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        if (db && typeof db.close === 'function') await db.close();
    }
}

run();
