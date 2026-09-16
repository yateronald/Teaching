// One-shot diagnostic + cleanup for stuck meeting_recordings rows.
// Usage:
//   node database/check-stuck-recordings.js          # list only
//   node database/check-stuck-recordings.js --clean  # mark stuck rows as failed

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function main() {
    const clean = process.argv.includes('--clean');
    const client = new Client({
        host: process.env.DB_HOST,
        port: +process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: {
            rejectUnauthorized: true,
            ca: fs.readFileSync(path.join(__dirname, '..', 'cert', 'ca.pem'), 'utf8'),
        },
    });
    await client.connect();

    const rows = (await client.query(
        `SELECT id, meeting_id, status, egress_id, started_at
         FROM meeting_recordings
         WHERE status IN ('starting', 'recording')
         ORDER BY started_at DESC`
    )).rows;

    if (!rows.length) {
        console.log('✅ No stuck recordings.');
    } else {
        console.log(`Found ${rows.length} stuck recording row(s):`);
        for (const r of rows) console.log('  ', r);
    }

    if (clean && rows.length) {
        const ids = rows.map(r => r.id);
        const meetingIds = [...new Set(rows.map(r => r.meeting_id))];
        await client.query(
            `UPDATE meeting_recordings
             SET status = 'failed',
                 error_message = 'Marked stale by check-stuck-recordings.js',
                 ended_at = COALESCE(ended_at, CURRENT_TIMESTAMP),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = ANY($1::int[])`,
            [ids]
        );
        await client.query(
            `UPDATE meetings SET is_recording = false, updated_at = CURRENT_TIMESTAMP
             WHERE id = ANY($1::int[])`,
            [meetingIds]
        );
        console.log(`🧹 Marked ${rows.length} row(s) as failed and reset is_recording on ${meetingIds.length} meeting(s).`);
    } else if (rows.length) {
        console.log('\nRun with --clean to mark them as failed:');
        console.log('  node database/check-stuck-recordings.js --clean');
    }

    await client.end();
}

main().catch((err) => {
    console.error('❌', err.message);
    process.exitCode = 1;
});
