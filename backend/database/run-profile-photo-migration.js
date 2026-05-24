require('dotenv').config();
const PostgreSQLDatabase = require('./init-postgres');
const fs = require('fs');
const path = require('path');

/**
 * Runner for migration 013_profile_photos.sql
 *
 * Adds the `profile_photo_kdrive_file_id` column on the users table.
 * Idempotent thanks to ADD COLUMN IF NOT EXISTS.
 */
async function run() {
    const db = new PostgreSQLDatabase();
    try {
        console.log('Connecting...');
        await db.initialize();

        const sqlPath = path.join(__dirname, 'migrations', '013_profile_photos.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        const client = db.getDatabase();
        await client.query(sql);
        console.log('SQL executed.');

        // Verify the new column is present
        const cols = await db.all(
            `SELECT column_name, data_type, is_nullable
             FROM information_schema.columns
             WHERE table_name = 'users' AND column_name = 'profile_photo_kdrive_file_id'`
        );
        console.log('\nProfile photo column:');
        cols.forEach(c => console.log(`  - ${c.column_name} (${c.data_type}, nullable: ${c.is_nullable})`));

        console.log('\n✅ Profile photos migration complete!');
    } catch (err) {
        console.error('Migration failed:', err.message);
        process.exit(1);
    } finally {
        if (db && typeof db.close === 'function') await db.close();
    }
}

run();
