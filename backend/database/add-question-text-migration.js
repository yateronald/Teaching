require('dotenv').config();
const PostgreSQLDatabase = require('./init-postgres');

async function run() {
    const db = new PostgreSQLDatabase();
    try {
        console.log('Connecting...');
        await db.initialize();

        // Add question_text column to tcf_ee_taches
        const colCheck = await db.get(
            `SELECT column_name FROM information_schema.columns 
             WHERE table_name = 'tcf_ee_taches' AND column_name = 'question_text'`
        );

        if (!colCheck) {
            await db.run(`ALTER TABLE tcf_ee_taches ADD COLUMN question_text TEXT`);
            console.log('✅ Added question_text column to tcf_ee_taches');
        } else {
            console.log('ℹ️  question_text column already exists');
        }

        // Verify
        const cols = await db.all(
            `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'tcf_ee_taches' ORDER BY ordinal_position`
        );
        console.log('Columns:', cols.map(c => `${c.column_name} (${c.data_type})`).join(', '));

        console.log('\n✅ Migration complete!');
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        if (db && typeof db.close === 'function') await db.close();
    }
}

run();
