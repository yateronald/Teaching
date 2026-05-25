require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const PostgreSQLDatabase = require('./init-postgres');

async function run() {
    const db = new PostgreSQLDatabase();
    try {
        await db.initialize();
        const file = path.join(__dirname, 'migrations', '017_submissions_timezone.sql');
        const sql = fs.readFileSync(file, 'utf8');
        console.log(`📥 Applying ${path.basename(file)}...`);
        await db.client.query(sql);
        console.log('✅ Migration 017 applied');

        // Record migration in the migrations table
        await db.run(
            `INSERT INTO migrations (filename, applied_at)
             VALUES ('017_submissions_timezone.sql', NOW())
             ON CONFLICT (filename) DO NOTHING`
        );
        console.log('✅ Migration 017 recorded in migrations table');

        // Verify columns
        const cols = await db.all(
            `SELECT column_name, data_type FROM information_schema.columns
             WHERE table_name='quiz_submissions' AND column_name IN ('started_at', 'submitted_at')`
        );
        console.log('quiz_submissions columns after conversion:');
        for (const col of cols) {
            console.log(`  quiz_submissions.${col.column_name} :: ${col.data_type}`);
        }
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exitCode = 1;
    } finally {
        await db.close();
    }
}

run();
