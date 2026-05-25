require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const PostgreSQLDatabase = require('./init-postgres');

async function run() {
    const db = new PostgreSQLDatabase();
    try {
        await db.initialize();
        const file = path.join(__dirname, 'migrations', '016_timezones_and_dates.sql');
        const sql = fs.readFileSync(file, 'utf8');
        console.log(`📥 Applying ${path.basename(file)}…`);
        await db.client.query(sql);
        console.log('✅ Migration 016 applied');

        // Verify
        const userTz = await db.all(
            `SELECT column_name, data_type FROM information_schema.columns
             WHERE table_name='users' AND column_name='timezone'`
        );
        const dates = await db.all(
            `SELECT table_name, column_name, data_type FROM information_schema.columns
             WHERE (table_name='quizzes' AND column_name IN ('start_date','end_date'))
                OR (table_name='meetings' AND column_name IN ('scheduled_start','scheduled_end'))
             ORDER BY table_name, column_name`
        );
        console.log('users.timezone →', userTz);
        console.log('Converted scheduling columns →');
        for (const d of dates) console.log(`  ${d.table_name}.${d.column_name} :: ${d.data_type}`);
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exitCode = 1;
    } finally {
        await db.close();
    }
}

run();
