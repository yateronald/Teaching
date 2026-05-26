/**
 * recordingCleanupService.js
 *
 * Periodic job that:
 *   1. Deletes meeting_recordings whose expires_at < NOW() — removing the file
 *      from disk and marking the row status='deleted', deleted_at=NOW().
 *   2. Cleans up "starting" or "recording" rows older than 24h (orphans where
 *      we never received a webhook and the egress likely died).
 *   3. Every 5 minutes, RECONCILES rows stuck on 'finalizing' for >2 minutes
 *      by asking LiveKit directly via the EgressClient. If LiveKit confirms
 *      the egress completed and the file exists on disk, we promote the row
 *      to 'ready' without waiting for a (possibly broken) webhook.
 *
 * Runs at server startup and then every hour for cleanup,
 * every 5 minutes for reconciliation.
 */

const fs = require('fs');

const ONE_HOUR_MS = 60 * 60 * 1000;
const FIVE_MIN_MS = 5 * 60 * 1000;
let intervalRef = null;
let reconcileIntervalRef = null;

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

    // ── Reconciliation loop ──
    // Every 5 minutes, ask LiveKit directly about any 'finalizing' rows
    // that have been stuck for >2 minutes. If LiveKit says the egress is
    // done and the file is on disk, we move the row to 'ready' so the
    // user can play it back. This is our fallback for when the
    // egress_ended webhook never reaches us (most common cause of stuck
    // recordings).
    setTimeout(() => reconcileStuckRecordings(database), 60 * 1000);
    reconcileIntervalRef = setInterval(
        () => reconcileStuckRecordings(database),
        FIVE_MIN_MS
    );

    console.log('🧹 Recording cleanup scheduler started (hourly purge, 5-min reconcile)');
}

function stop() {
    if (intervalRef) {
        clearInterval(intervalRef);
        intervalRef = null;
    }
    if (reconcileIntervalRef) {
        clearInterval(reconcileIntervalRef);
        reconcileIntervalRef = null;
    }
}

/**
 * Look at rows that have been stuck on 'finalizing' for more than 2
 * minutes and reconcile them against LiveKit. This catches the case
 * where the egress_ended webhook never arrived but the file is actually
 * ready on disk.
 */
async function reconcileStuckRecordings(database) {
    let promoted = 0;
    let failed = 0;
    try {
        const stuck = await database.all(
            `SELECT id, meeting_id, egress_id, file_path, started_at
             FROM meeting_recordings
             WHERE status = 'finalizing'
               AND egress_id IS NOT NULL
               AND updated_at < (CURRENT_TIMESTAMP - INTERVAL '2 minutes')
             ORDER BY id DESC
             LIMIT 50`
        );
        if (stuck.length === 0) return;

        // Lazy-require so we don't crash startup if LiveKit env isn't set.
        let recordingService;
        try {
            recordingService = require('./recordingService');
        } catch {
            return;
        }

        for (const r of stuck) {
            try {
                const info = await recordingService.getEgress(r.egress_id);
                if (!info) {
                    // Egress is gone from LiveKit's memory and the webhook never
                    // came back — mark as failed so the host can retry.
                    await database.run(
                        `UPDATE meeting_recordings
                         SET status = 'failed',
                             error_message = 'Egress disappeared without callback',
                             ended_at = COALESCE(ended_at, CURRENT_TIMESTAMP),
                             updated_at = CURRENT_TIMESTAMP
                         WHERE id = $1 AND status = 'finalizing'`,
                        [r.id]
                    );
                    failed += 1;
                    continue;
                }

                // EgressStatus enum: 0 STARTING, 1 ACTIVE, 2 ENDING, 3 COMPLETE, 4 FAILED, 5 ABORTED
                const completed = info.status === 3 || info.status === 'EGRESS_COMPLETE';
                const errored   = info.status === 4 || info.status === 5
                                || info.status === 'EGRESS_FAILED' || info.status === 'EGRESS_ABORTED';

                if (errored) {
                    await database.run(
                        `UPDATE meeting_recordings
                         SET status = 'failed',
                             error_message = $1,
                             ended_at = COALESCE(ended_at, CURRENT_TIMESTAMP),
                             updated_at = CURRENT_TIMESTAMP
                         WHERE id = $2 AND status = 'finalizing'`,
                        [info.error || 'Egress reported failure', r.id]
                    );
                    failed += 1;
                    continue;
                }

                if (!completed) continue; // still in progress, leave it

                // Egress completed — pull final stats and promote.
                const fileResults = info.fileResults || info.file?.fileResults || [];
                const first = Array.isArray(fileResults) && fileResults.length ? fileResults[0] : null;
                let actualFilePath = first?.filename || r.file_path;
                let fileSize = first?.size ? Number(first.size) : null;
                let durationSec = null;
                if (info.startedAt && info.endedAt) {
                    const startedNs = BigInt(info.startedAt);
                    const endedNs = BigInt(info.endedAt);
                    if (endedNs > startedNs) {
                        durationSec = Number((endedNs - startedNs) / 1_000_000_000n);
                    }
                }

                // Verify the file actually exists on disk before marking ready.
                let fileExists = false;
                try {
                    if (actualFilePath && fs.existsSync(actualFilePath)) {
                        fileExists = true;
                        if (!fileSize) fileSize = fs.statSync(actualFilePath).size;
                    }
                } catch { /* ignore */ }

                if (!fileExists) {
                    // LiveKit says complete but the file isn't where we expect.
                    // Most likely cause: docker volume mount mismatch. Mark as
                    // failed so the user gets a clear error in the UI.
                    await database.run(
                        `UPDATE meeting_recordings
                         SET status = 'failed',
                             error_message = $1,
                             ended_at = COALESCE(ended_at, CURRENT_TIMESTAMP),
                             updated_at = CURRENT_TIMESTAMP
                         WHERE id = $2 AND status = 'finalizing'`,
                        [`File not found at ${actualFilePath} (check egress volume mount)`, r.id]
                    );
                    failed += 1;
                    continue;
                }

                await database.run(
                    `UPDATE meeting_recordings
                     SET status = 'ready',
                         file_path = $1,
                         file_size_bytes = $2,
                         duration_seconds = $3,
                         ended_at = COALESCE(ended_at, CURRENT_TIMESTAMP),
                         updated_at = CURRENT_TIMESTAMP
                     WHERE id = $4 AND status = 'finalizing'`,
                    [actualFilePath, fileSize, durationSec, r.id]
                );
                await database.run(
                    `UPDATE meetings SET recording_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
                    [`/api/meetings/recordings/${r.id}/stream`, r.meeting_id]
                );
                promoted += 1;
            } catch (e) {
                console.warn(`[recordingReconcile] Error reconciling recording ${r.id}:`, e.message);
            }
        }

        if (promoted || failed) {
            console.log(`[recordingReconcile] Promoted ${promoted} → ready, marked ${failed} → failed`);
        }
    } catch (err) {
        console.error('[recordingReconcile] Error during reconciliation:', err.message);
    }
}

module.exports = { start, stop, runCleanup, reconcileStuckRecordings };
