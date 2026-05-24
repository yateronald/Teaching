require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const PostgreSQLDatabase = require('./init-postgres');

async function run() {
    const db = new PostgreSQLDatabase();
    try {
        await db.initialize();
        const file = path.join(__dirname, 'migrations', '015_meeting_recordings.sql');
        const sql = fs.readFileSync(file, 'utf8');
        console.log(`📥 Applying ${path.basename(file)}…`);
        // pg supports multiple statements in a single query call
        await db.client.query(sql);
        console.log('✅ Migration 015_meeting_recordings applied');

        // Verify
        const cols = await db.all(
            `SELECT column_name, data_type FROM information_schema.columns
             WHERE table_name = 'meeting_recordings' ORDER BY ordinal_position`
        );
        console.log(`Columns (${cols.length}):`, cols.map(c => `${c.column_name}`).join(', '));
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exitCode = 1;
    } finally {
        await db.close();
    }
}

run();
