#!/usr/bin/env node
/**
 * Recovery script — finds meeting_recordings rows that were wrongly
 * marked as `failed` due to the path-translation bug in earlier
 * versions of the reconciler, AND whose file actually exists on disk
 * at the host-side path. Promotes them back to `ready`.
 *
 * Run on the VPS (where the host filesystem is reachable):
 *   cd /var/www/teaching-api/backend
 *   node database/_recover-failed-recordings.js               # dry-run
 *   node database/_recover-failed-recordings.js --apply       # actually fix
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

(async () => {
    const PostgreSQLDatabase = require('./init-postgres');
    const database = new PostgreSQLDatabase();
    await database.initialize();

    const apply = process.argv.includes('--apply');
    const HOST_DIR = (process.env.HOST_EGRESS_RECORDINGS_DIR || '/opt/livekit/recordings').replace(/\/+$/, '');

    const failed = await database.all(
        `SELECT id, meeting_id, file_name, file_path, file_size_bytes, status, error_message
         FROM meeting_recordings
         WHERE status = 'failed'
         ORDER BY id DESC`
    );

    console.log(`\nFound ${failed.length} failed recording(s). Checking each for a recoverable file…\n`);
    console.log(`Host egress dir: ${HOST_DIR}\n`);

    let recovered = 0;
    let unrecoverable = 0;

    for (const r of failed) {
        // Determine candidate host-side paths to check.
        const candidates = new Set();
        if (r.file_path) candidates.add(r.file_path);
        if (r.file_name) {
            candidates.add(path.join(HOST_DIR, r.file_name));
        }
        // If the stored path looks like a container path, translate it.
        if (r.file_path && r.file_path.startsWith('/home/egress/recordings/')) {
            const fname = path.basename(r.file_path);
            candidates.add(path.join(HOST_DIR, fname));
        }

        let found = null;
        let size = 0;
        for (const c of candidates) {
            try {
                if (c && fs.existsSync(c)) {
                    const st = fs.statSync(c);
                    if (st.size > 1024) {
                        found = c;
                        size = st.size;
                        break;
                    }
                }
            } catch { /* ignore */ }
        }

        console.log(`Recording #${r.id} (meeting ${r.meeting_id}, ${r.file_name || 'no filename'})`);
        if (found) {
            console.log(`  ✓ found at ${found} (${size} bytes)`);
            if (apply) {
                await database.run(
                    `UPDATE meeting_recordings
                     SET status = 'ready',
                         file_path = $1,
                         file_size_bytes = COALESCE($2, file_size_bytes),
                         error_message = NULL,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE id = $3`,
                    [found, size, r.id]
                );
                await database.run(
                    `UPDATE meetings SET recording_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
                    [`/api/meetings/recordings/${r.id}/stream`, r.meeting_id]
                );
                console.log(`  → promoted to 'ready'`);
            } else {
                console.log(`  → would promote to 'ready' (run with --apply to commit)`);
            }
            recovered += 1;
        } else {
            console.log(`  ✗ no file found on disk among:`);
            for (const c of candidates) console.log(`      ${c}`);
            unrecoverable += 1;
        }
    }

    console.log(`\nSummary: ${recovered} recoverable, ${unrecoverable} unrecoverable`);
    if (!apply && recovered > 0) {
        console.log(`\nRun the script again with --apply to actually update the database:`);
        console.log(`  node database/_recover-failed-recordings.js --apply`);
    }

    await database.close();
    process.exit(0);
})().catch(err => {
    console.error('Fatal:', err);
    process.exit(1);
});
