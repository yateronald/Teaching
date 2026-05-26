#!/usr/bin/env node
/**
 * Diagnostic script — prints every recent meeting_recordings row with
 * the FULL file_path, and checks whether the file actually exists on
 * disk at that path.
 *
 * Run on the VPS:
 *   cd /var/www/teaching-api/backend
 *   node database/_check-recordings.js              # last 20 rows
 *   node database/_check-recordings.js 26           # only meeting 26
 */

require('dotenv').config();
const fs = require('fs');

(async () => {
    const PostgreSQLDatabase = require('./init-postgres');
    const database = new PostgreSQLDatabase();
    await database.initialize();

    const meetingFilter = process.argv[2] && !process.argv[2].startsWith('--')
        ? parseInt(process.argv[2], 10)
        : null;

    const sql = `
        SELECT id, meeting_id, egress_id, file_name, file_path,
               file_size_bytes, duration_seconds, status,
               started_at, ended_at, started_by, error_message
        FROM meeting_recordings
        ${meetingFilter ? 'WHERE meeting_id = $1' : ''}
        ORDER BY id DESC
        LIMIT 20
    `;
    const rows = meetingFilter
        ? await database.all(sql, [meetingFilter])
        : await database.all(sql);

    if (rows.length === 0) {
        console.log('No recordings found.');
        process.exit(0);
    }

    console.log(`\nFound ${rows.length} recording row(s):\n`);

    for (const r of rows) {
        const exists = r.file_path && fs.existsSync(r.file_path);
        let size = null;
        if (exists) {
            try { size = fs.statSync(r.file_path).size; } catch {}
        }

        console.log('━'.repeat(80));
        console.log(`Recording #${r.id}  (meeting ${r.meeting_id})`);
        console.log(`  status         : ${r.status}`);
        console.log(`  egress_id      : ${r.egress_id}`);
        console.log(`  started_by     : user ${r.started_by}`);
        console.log(`  file_name      : ${r.file_name || '(null)'}`);
        console.log(`  file_path      : ${r.file_path || '(null)'}`);
        console.log(`  file on disk   : ${exists ? `YES (${size} bytes)` : 'NO'}`);
        console.log(`  db.file_size   : ${r.file_size_bytes || '(null)'}`);
        console.log(`  duration_sec   : ${r.duration_seconds || '(null)'}`);
        console.log(`  started_at     : ${r.started_at}`);
        console.log(`  ended_at       : ${r.ended_at || '(still recording)'}`);
        if (r.error_message) {
            console.log(`  error_message  : ${r.error_message}`);
        }

        // Reverse check: if the file exists at the configured egress dir
        // but not at file_path, flag the path mismatch.
        if (!exists && r.file_name) {
            const egressDir = (process.env.HOST_EGRESS_RECORDINGS_DIR || '/opt/livekit/recordings').replace(/\/+$/, '');
            const candidate = `${egressDir}/${r.file_name}`;
            if (fs.existsSync(candidate)) {
                console.log(`  ⚠ MISMATCH: file exists at ${candidate}`);
                console.log(`              but file_path is set to ${r.file_path}`);
            }
        }
    }
    console.log('━'.repeat(80));
    console.log('Done.');
    await database.close();
    process.exit(0);
})().catch(err => {
    console.error('Fatal:', err);
    process.exit(1);
});
