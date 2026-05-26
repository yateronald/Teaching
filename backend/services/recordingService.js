/**
 * recordingService.js
 *
 * Wraps the LiveKit EgressClient to start/stop room-composite recordings.
 * Recordings are saved as MP4 to the local filesystem under
 *   <UPLOAD_PATH>/recordings/<meeting_id>-<egressId>.mp4
 *
 * REQUIREMENTS:
 *   - The LiveKit deployment must have the Egress service running and reachable
 *     from the LiveKit server URL (LIVEKIT_URL).
 *   - The Egress service must be able to write to the target filepath. For
 *     self-hosted deployments running egress on the same host as this app,
 *     point it at <APP>/backend/uploads/recordings via a docker volume mount
 *     or a shared filesystem.
 *
 * If egress is not configured, all calls fail with a clear error and the
 * route handlers surface it as 503 with code EGRESS_NOT_AVAILABLE.
 */

const fs = require('fs');
const path = require('path');
const {
    EgressClient,
    EncodedFileType,
    EncodedFileOutput,
    EncodingOptionsPreset,
} = require('livekit-server-sdk');

const LIVEKIT_URL = process.env.LIVEKIT_URL;
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;

// ─────────────────────────────────────────────────────────────────────
// Recordings storage paths
//
// The egress process and the backend often run on different filesystems
// (egress in Docker, backend on the host) so we keep TWO knobs:
//
//   EGRESS_RECORDINGS_DIR   Where the egress WRITES the file. This is
//                           the path INSIDE the egress container that
//                           the docker volume mount sees.
//                           Default: /opt/livekit/recordings (matches
//                           the standard LiveKit docker-compose layout).
//
//   UPLOAD_PATH             Where the backend READS the file. After the
//                           docker volume mount this is the host-side
//                           path of the same physical directory.
//                           Default: ./uploads (relative to backend cwd)
//                           Recordings go into <UPLOAD_PATH>/recordings.
//
// In a single-host docker setup the two paths point at the same physical
// directory via a `volumes:` bind mount:
//   /opt/livekit/recordings:/opt/livekit/recordings        (preferred)
//   <host_path>:/opt/livekit/recordings                    (also works)
//
// The backend stores BOTH paths on the meeting_recordings row:
//   - egress_filepath  → what we asked egress to write
//   - file_path        → where the backend reads from on its filesystem
//
// During reconciliation / streaming we always read from `file_path`, so
// callers don't need to care about the distinction.
// ─────────────────────────────────────────────────────────────────────

// Where the EGRESS process writes (path it sees inside the container).
const EGRESS_RECORDINGS_DIR = (
    process.env.EGRESS_RECORDINGS_DIR ||
    '/home/egress/recordings'
).replace(/\/+$/, '');

// Where the BACKEND reads from (path on the backend's filesystem).
const UPLOAD_BASE = process.env.UPLOAD_PATH || './uploads';
const RECORDINGS_DIR = path.resolve(path.join(UPLOAD_BASE, 'recordings'));

// If the host-side recordings dir for the egress is also accessible to
// the backend (single-host setup), prefer that as the read path so we
// don't need to maintain a separate copy of the file. The standard
// LiveKit docker-compose layout bind-mounts:
//   /opt/livekit/recordings (host)  →  /home/egress/recordings (container)
// so the backend reads from the host side and the egress writes to the
// container side, both pointing at the same physical file.
const HOST_EGRESS_DIR = (
    process.env.HOST_EGRESS_RECORDINGS_DIR ||
    '/opt/livekit/recordings'
).replace(/\/+$/, '');

// Ensure directory exists at module load (for the backend's read path).
try {
    if (!fs.existsSync(RECORDINGS_DIR)) {
        fs.mkdirSync(RECORDINGS_DIR, { recursive: true });
    }
} catch (e) {
    console.warn('[recordingService] Could not ensure recordings dir:', e.message);
}

// LiveKit Egress URLs typically follow the same scheme as the WebSocket URL
// but with http(s):// instead of ws(s)://. The EgressClient takes the LiveKit
// SERVER URL (HTTP), not the WS URL — convert if needed.
function toHttpUrl(wsUrl) {
    if (!wsUrl) return '';
    return wsUrl.replace(/^wss:\/\//, 'https://').replace(/^ws:\/\//, 'http://');
}

let egressClient = null;
function getClient() {
    if (egressClient) return egressClient;
    if (!LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
        const err = new Error('LiveKit credentials not configured');
        err.code = 'EGRESS_NOT_AVAILABLE';
        throw err;
    }
    egressClient = new EgressClient(toHttpUrl(LIVEKIT_URL), LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
    return egressClient;
}

function getRecordingsDir() {
    return RECORDINGS_DIR;
}

/**
 * Start recording a LiveKit room as a composite MP4.
 *
 * @param {object} args
 * @param {string} args.roomName       LiveKit room to record
 * @param {number} args.meetingId      our meeting id (used in filename)
 * @returns {Promise<{ egressId: string, fileName: string, egressFilePath: string, hostFilePath: string }>}
 */
async function startRoomRecording({ roomName, meetingId }) {
    const client = getClient();

    const fileName = `meeting-${meetingId}-${Date.now()}.mp4`;

    // Path the EGRESS will write to (inside its container). This must be
    // a directory the egress process can write to — i.e. one that's
    // either bind-mounted from the host or owned by the egress user.
    const egressFilePath = `${EGRESS_RECORDINGS_DIR}/${fileName}`;

    // Path the BACKEND will read from. If the egress dir is bind-mounted
    // 1:1 to the host (the standard /opt/livekit/recordings layout), we
    // can read directly from there. Otherwise the backend must have its
    // own copy via the legacy UPLOAD_PATH/recordings dir.
    const hostFilePath = HOST_EGRESS_DIR
        ? `${HOST_EGRESS_DIR}/${fileName}`
        : path.join(RECORDINGS_DIR, fileName);

    const fileOutput = new EncodedFileOutput({
        fileType: EncodedFileType.MP4,
        filepath: egressFilePath,
        // No S3/Azure/GCP upload — keep files local.
        disableManifest: true,
    });

    try {
        const info = await client.startRoomCompositeEgress(
            roomName,
            { file: fileOutput },
            {
                layout: 'speaker',                              // 'grid' | 'speaker' | 'single-speaker'
                encodingOptions: EncodingOptionsPreset.H264_720P_30,
                audioOnly: false,
                videoOnly: false,
            }
        );
        return {
            egressId: info.egressId,
            fileName,
            // Backwards-compatible field name for callers that already
            // store `filePath` on the recording row.
            filePath: hostFilePath,
            egressFilePath,
            hostFilePath,
            startedAtUnixMs: Number(info.startedAt) || Date.now(),
        };
    } catch (err) {
        // LiveKit returns descriptive errors; surface them with a stable code.
        const wrapped = new Error(`Failed to start LiveKit egress: ${err.message}`);
        wrapped.code = 'EGRESS_START_FAILED';
        wrapped.cause = err;
        throw wrapped;
    }
}

/**
 * Stop a running egress. The MP4 will finalize asynchronously; the
 * 'egress_ended' webhook (or polling listEgress) gives the final size/duration.
 */
async function stopRecording(egressId) {
    const client = getClient();
    try {
        const info = await client.stopEgress(egressId);
        return info;
    } catch (err) {
        const wrapped = new Error(`Failed to stop LiveKit egress: ${err.message}`);
        wrapped.code = 'EGRESS_STOP_FAILED';
        wrapped.cause = err;
        throw wrapped;
    }
}

/**
 * Look up an egress by id. Returns the EgressInfo from LiveKit so we can
 * read final file size / duration when finalizing.
 */
async function getEgress(egressId) {
    const client = getClient();
    const list = await client.listEgress({ egressId });
    return list[0] || null;
}

/**
 * Compute the expiry timestamp for a recording (30 days from now).
 */
function computeExpiry(daysFromNow = 30) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + daysFromNow);
    return d;
}

module.exports = {
    startRoomRecording,
    stopRecording,
    getEgress,
    getRecordingsDir,
    getEgressRecordingsDir: () => EGRESS_RECORDINGS_DIR,
    getHostEgressDir: () => HOST_EGRESS_DIR,
    computeExpiry,
};
