/**
 * recordingCleanupService.js
 *
 * Periodic job that:
 *   1. Deletes meeting_recordings whose expires_at < NOW() — removing the file
 *      from disk and marking the row status='deleted', deleted_at=NOW().
 *   2. Cleans up "starting" or "recording" rows older than 24h (orphans where
 *      we never received a webhook and the egress likely died).
 *
 * Runs at server startup and then every hour.
 */

const fs = require('fs');
const path = require('path');

const ONE_HOUR_MS = 60 * 60 * 1000;
let intervalRef = null;

async function runCleanup(database) {
    let purgedExpired = 0;
    let purgedOrphans = 0;
    try {
        // 1. Expired recordings — delete the file, mark row as deleted
        const expired = await database.all(
            `SELECT id, file_path, file_name FROM meeting_recordings
             WHERE expires_at < CURRENT_TIMESTAMP
               AND status IN ('ready', 'failed', 'finalizing')`
        );
        for (const r of expired) {
            try {
                if (r.file_path && fs.existsSync(r.file_path)) {
                    fs.unlinkSync(r.file_path);
                }
            } catch (e) {
                console.warn(`[recordingCleanup] Could not delete file ${r.file_path}:`, e.message);
            }
            await database.run(
                `UPDATE meeting_recordings
                 SET status = 'deleted',
                     deleted_at = CURRENT_TIMESTAMP,
                     file_path = NULL,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = $1`,
                [r.id]
            );
            purgedExpired += 1;
        }

        // 2. Orphans — never finalized within 24 hours
        const orphans = await database.all(
            `SELECT id, file_path FROM meeting_recordings
             WHERE status IN ('starting', 'recording', 'finalizing')
               AND started_at < (CURRENT_TIMESTAMP - INTERVAL '24 hours')`
        );
        for (const r of orphans) {
            try {
                if (r.file_path && fs.existsSync(r.file_path)) {
                    fs.unlinkSync(r.file_path);
                }
            } catch (e) {
                // ignore
            }
            await database.run(
                `UPDATE meeting_recordings
                 SET status = 'failed',
                     error_message = 'Recording did not finalize within 24 hours',
                     ended_at = COALESCE(ended_at, CURRENT_TIMESTAMP),
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = $1`,
                [r.id]
            );
            purgedOrphans += 1;
        }

        if (purgedExpired || purgedOrphans) {
            console.log(`[recordingCleanup] Purged ${purgedExpired} expired, ${purgedOrphans} orphan recording(s)`);
        }
    } catch (err) {
        console.error('[recordingCleanup] Error during cleanup:', err.message);
    }
}

function start(database) {
    if (intervalRef) return; // already running
    // Initial pass on startup (with small delay so DB is ready)
    setTimeout(() => runCleanup(database), 30 * 1000);
    intervalRef = setInterval(() => runCleanup(database), ONE_HOUR_MS);
    console.log('🧹 Recording cleanup scheduler started (hourly, 30-day retention)');
}

function stop() {
    if (intervalRef) {
        clearInterval(intervalRef);
        intervalRef = null;
    }
}

module.exports = { start, stop, runCleanup };
