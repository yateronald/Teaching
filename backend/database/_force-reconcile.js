#!/usr/bin/env node
/**
 * One-shot diagnostic + reconciliation script.
 *
 * Runs the reconciliation logic IMMEDIATELY for every meeting_recordings
 * row currently stuck on 'finalizing' (or, if you pass a meeting id, just
 * that one). Prints what LiveKit says, whether the file exists on disk,
 * and what action it took.
 *
 * Usage:
 *   node backend/database/_force-reconcile.js
 *   node backend/database/_force-reconcile.js 26          # only meeting 26
 *   node backend/database/_force-reconcile.js --all       # also re-poke 'ready' rows
 */

require('dotenv').config();
const fs = require('fs');

(async () => {
    const PostgreSQLDatabase = require('./init-postgres');
    const database = new PostgreSQLDatabase();
    await database.initialize();
    const recordingService = require('../services/recordingService');

    const meetingFilter = process.argv[2] && !process.argv[2].startsWith('--')
        ? parseInt(process.argv[2], 10)
        : null;
    const includeReady = process.argv.includes('--all');

    const sql = `
        SELECT id, meeting_id, egress_id, file_path, file_name, status,
               EXTRACT(EPOCH FROM (NOW() - started_at))::int AS age_sec,
               EXTRACT(EPOCH FROM (NOW() - updated_at))::int AS age_since_update_sec
        FROM meeting_recordings
        WHERE ${includeReady
                ? `status IN ('finalizing', 'recording', 'ready')`
                : `status IN ('finalizing', 'recording')`}
          ${meetingFilter ? `AND meeting_id = $1` : ''}
        ORDER BY id DESC
        LIMIT 50
    `;
    const rows = meetingFilter
        ? await database.all(sql, [meetingFilter])
        : await database.all(sql);

    if (rows.length === 0) {
        console.log('No rows to reconcile.');
        process.exit(0);
    }

    console.log(`\nFound ${rows.length} row(s) to inspect:\n`);
    const egressDir = recordingService.getEgressRecordingsDir();
    const hostDir = recordingService.getHostEgressDir();
    console.log(`  egress writes to: ${egressDir}`);
    console.log(`  backend reads from: ${hostDir}\n`);

    for (const r of rows) {
        console.log('━'.repeat(70));
        console.log(`Recording #${r.id} (meeting ${r.meeting_id}, status=${r.status}, age=${r.age_sec}s)`);
        console.log(`  egress_id : ${r.egress_id}`);
        console.log(`  file_path : ${r.file_path}`);
        console.log(`  file_name : ${r.file_name}`);

        // 1. Check if the file exists on disk
        const fileExists = r.file_path && fs.existsSync(r.file_path);
        let fileSize = null;
        if (fileExists) {
            try { fileSize = fs.statSync(r.file_path).size; } catch {}
        }
        console.log(`  on disk   : ${fileExists ? `YES (${fileSize} bytes)` : 'NO'}`);

        // 2. Ask LiveKit
        let info = null;
        try {
            info = await recordingService.getEgress(r.egress_id);
        } catch (e) {
            console.log(`  ✗ LiveKit query failed: ${e.message}`);
            continue;
        }

        if (!info) {
            console.log(`  LiveKit   : EGRESS NOT FOUND (gone from memory)`);
            console.log(`  → Action  : would mark as 'failed'`);
            continue;
        }

        const statusName = String(info.status);
        const completed = info.status === 3 || statusName === 'EGRESS_COMPLETE' || statusName === '3';
        const errored = info.status === 4 || info.status === 5
                     || statusName === 'EGRESS_FAILED' || statusName === 'EGRESS_ABORTED';
        console.log(`  LiveKit   : status=${statusName} (raw value)`);
        console.log(`              completed=${completed} errored=${errored}`);

        const fileResults = info.fileResults || info.file?.fileResults || [];
        if (fileResults.length > 0) {
            const first = fileResults[0];
            console.log(`              filename=${first.filename}`);
            console.log(`              size=${first.size}`);
        }

        if (r.status === 'finalizing' && completed && fileExists) {
            // Promote it
            console.log(`  → Action  : PROMOTING to 'ready'`);
            await database.run(
                `UPDATE meeting_recordings
                 SET status = 'ready',
                     file_size_bytes = COALESCE($1, file_size_bytes),
                     ended_at = COALESCE(ended_at, CURRENT_TIMESTAMP),
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = $2`,
                [fileSize, r.id]
            );
            await database.run(
                `UPDATE meetings SET recording_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
                [`/api/meetings/recordings/${r.id}/stream`, r.meeting_id]
            );
            console.log(`              ✓ row updated`);
        } else if (r.status === 'finalizing' && errored) {
            console.log(`  → Action  : marking as 'failed'`);
            await database.run(
                `UPDATE meeting_recordings
                 SET status = 'failed',
                     error_message = $1,
                     ended_at = COALESCE(ended_at, CURRENT_TIMESTAMP),
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = $2`,
                [info.error || 'Egress reported failure', r.id]
            );
        } else {
            console.log(`  → Action  : (no change — egress still in progress or row already final)`);
        }
    }

    console.log('━'.repeat(70));
    console.log('Done.');
    await database.close();
    process.exit(0);
})().catch(err => {
    console.error('Fatal:', err);
    process.exit(1);
});
