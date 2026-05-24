require('dotenv').config();
const PostgreSQLDatabase = require('./init-postgres');

async function run() {
    const db = new PostgreSQLDatabase();
    try {
        console.log('Connecting...');
        await db.initialize();

        console.log('Adding intro_audio columns to tcf_co_series...');
        await db.run('ALTER TABLE tcf_co_series ADD COLUMN IF NOT EXISTS intro_audio_kdrive_file_id INTEGER');
        await db.run('ALTER TABLE tcf_co_series ADD COLUMN IF NOT EXISTS intro_audio_file_name VARCHAR(255)');
        console.log('✅ intro_audio_kdrive_file_id and intro_audio_file_name columns added');

        // Verify
        const cols = await db.all(`
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = 'tcf_co_series' AND column_name LIKE 'intro_audio%'
            ORDER BY column_name
        `);
        console.log('New columns:', cols.map(c => `${c.column_name} (${c.data_type})`).join(', '));

        console.log('\n✅ Migration 006 complete!');
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        if (db && typeof db.close === 'function') await db.close();
    }
}

run();
