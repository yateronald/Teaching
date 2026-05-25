require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const PostgreSQLDatabase = require('./init-postgres');

async function run() {
    const db = new PostgreSQLDatabase();
    try {
        await db.initialize();
        const file = path.join(__dirname, 'migrations', '018_schedules_meetings_timezone.sql');
        const sql = fs.readFileSync(file, 'utf8');
        console.log(`📥 Applying ${path.basename(file)}…`);
        await db.client.query(sql);
        console.log('✅ Migration 018 applied');

        const dates = await db.all(
            `SELECT table_name, column_name, data_type FROM information_schema.columns
             WHERE (table_name='schedules'        AND column_name IN ('start_time','end_time'))
                OR (table_name='class_schedules'  AND column_name IN ('start_time','end_time'))
                OR (table_name='class_sessions'   AND column_name IN ('start_time','end_time','session_started_at','session_ended_at','code_generated_at','code_expires_at'))
             ORDER BY table_name, column_name`
        );
        console.log('Converted columns →');
        for (const d of dates) console.log(`  ${d.table_name}.${d.column_name} :: ${d.data_type}`);
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exitCode = 1;
    } finally {
        await db.close();
    }
}

run();
