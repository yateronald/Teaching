require('dotenv').config();
const fs = require('fs');
const path = require('path');
const PostgreSQLDatabase = require('./init-postgres');

// Applies migration 021 (signed-in devices). Safe to run twice.
async function run() {
    const db = new PostgreSQLDatabase();
    try {
        await db.initialize();
        const sql = fs.readFileSync(path.join(__dirname, 'migrations', '021_user_sessions.sql'), 'utf8');
        await db.run(sql);

        const cols = await db.all(`
            SELECT column_name, data_type FROM information_schema.columns
            WHERE table_name = 'user_sessions' ORDER BY ordinal_position
        `);
        if (!cols.length) throw new Error('user_sessions was not created');
        cols.forEach(c => console.log(`  ${c.column_name.padEnd(14)} ${c.data_type}`));
        const idx = await db.all(`SELECT indexname FROM pg_indexes WHERE tablename = 'user_sessions' ORDER BY indexname`);
        idx.forEach(i => console.log(`  index ${i.indexname}`));

        console.log('\n✅ Migration 021 complete — exam candidates are limited to 2 devices.');
        console.log('   Students, teachers and admins keep their current sign-in; exam');
        console.log('   candidates sign in once more so their devices can be counted.');
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        if (db && typeof db.close === 'function') await db.close();
    }
}

run();
