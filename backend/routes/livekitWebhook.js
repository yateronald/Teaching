/**
 * livekitWebhook.js
 *
 * Public endpoint that receives LiveKit webhook events. We use it to
 * finalize meeting_recordings rows when egress events arrive:
 *
 *   - egress_started   → status='recording'
 *   - egress_ended     → status='ready' or 'failed', sets file_size_bytes,
 *                         duration_seconds, ended_at.
 *
 * The endpoint must be reachable by your LiveKit deployment. Configure it
 * in your livekit.yaml under `webhook.urls` and use the same API key/secret
 * so we can verify the signature.
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const { WebhookReceiver } = require('livekit-server-sdk');

const router = express.Router();

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;

let receiver = null;
function getReceiver() {
    if (!receiver && LIVEKIT_API_KEY && LIVEKIT_API_SECRET) {
        receiver = new WebhookReceiver(LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
    }
    return receiver;
}

// LiveKit posts JSON with an Authorization header carrying a signed JWT.
// We need the RAW body to verify, so this route uses express.raw().
router.post('/livekit', express.raw({ type: '*/*', limit: '5mb' }), async (req, res) => {
    try {
        const recv = getReceiver();
        if (!recv) {
            return res.status(503).json({ error: 'Webhook receiver not configured' });
        }

        const authHeader = req.get('Authorization') || '';
        const bodyStr = req.body && Buffer.isBuffer(req.body) ? req.body.toString('utf8') : '';
        let event;
        try {
            event = await recv.receive(bodyStr, authHeader);
        } catch (verifyErr) {
            console.warn('[livekit-webhook] signature verification failed:', verifyErr.message);
            return res.status(401).json({ error: 'Invalid signature' });
        }

        const eventType = event.event;
        const egressInfo = event.egressInfo;

        if (!egressInfo) {
            // Not an egress event; ignore quietly
            return res.status(200).json({ ok: true, ignored: true });
        }

        const egressId = egressInfo.egressId;
        const db = req.db;

        const recording = await db.get(
            'SELECT * FROM meeting_recordings WHERE egress_id = $1',
            [egressId]
        );
        if (!recording) {
            return res.status(200).json({ ok: true, ignored: 'unknown egress' });
        }

        if (eventType === 'egress_started' || eventType === 'egress_updated') {
            // Make sure our row reflects the live status
            await db.run(
                `UPDATE meeting_recordings
                 SET status = 'recording', updated_at = CURRENT_TIMESTAMP
                 WHERE id = $1 AND status IN ('starting')`,
                [recording.id]
            );
        } else if (eventType === 'egress_ended') {
            // Pull final stats. The egressInfo.fileResults / fileResults[0] usually
            // carries the final filename, size, and duration.
            const fileResults = egressInfo.fileResults || egressInfo.file?.fileResults || [];
            const first = Array.isArray(fileResults) && fileResults.length ? fileResults[0] : null;

            let actualFilePath = recording.file_path;
            let fileSize = first?.size ? Number(first.size) : null;
            let durationSec = null;

            if (egressInfo.startedAt && egressInfo.endedAt) {
                const startedNs = BigInt(egressInfo.startedAt);
                const endedNs = BigInt(egressInfo.endedAt);
                if (endedNs > startedNs) {
                    durationSec = Number((endedNs - startedNs) / 1_000_000_000n);
                }
            }
            if (first?.filename) {
                actualFilePath = first.filename;  // egress can override the path
            }

            // If file size missing, try stat
            if (!fileSize && actualFilePath && fs.existsSync(actualFilePath)) {
                try { fileSize = fs.statSync(actualFilePath).size; } catch {}
            }

            // Determine final status from egressInfo.status
            // EgressStatus: 0 STARTING, 1 ACTIVE, 2 ENDING, 3 COMPLETE, 4 FAILED, 5 ABORTED
            const finalStatus =
                egressInfo.status === 4 || egressInfo.status === 'EGRESS_FAILED' ? 'failed' :
                egressInfo.status === 5 || egressInfo.status === 'EGRESS_ABORTED' ? 'failed' :
                'ready';

            await db.run(
                `UPDATE meeting_recordings
                 SET status = $1,
                     file_path = COALESCE($2, file_path),
                     file_size_bytes = $3,
                     duration_seconds = $4,
                     ended_at = COALESCE(ended_at, CURRENT_TIMESTAMP),
                     error_message = $5,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = $6`,
                [
                    finalStatus,
                    actualFilePath,
                    fileSize,
                    durationSec,
                    finalStatus === 'failed' ? (egressInfo.error || 'Egress failed') : null,
                    recording.id
                ]
            );

            // Mirror to meetings.recording_url for legacy code (best path the player can use)
            if (finalStatus === 'ready') {
                await db.run(
                    `UPDATE meetings SET recording_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
                    [`/api/meetings/recordings/${recording.id}/stream`, recording.meeting_id]
                );
            }

            // Notify clients
            if (req.io) {
                req.io.to(`meeting:${recording.meeting_id}`).emit('meeting:recording-ready', {
                    meetingId: recording.meeting_id,
                    recordingId: recording.id,
                    status: finalStatus,
                });
            }
        }

        res.status(200).json({ ok: true });
    } catch (err) {
        console.error('[livekit-webhook] error:', err);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

module.exports = router;
