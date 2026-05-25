/**
 * One-shot script to unblock the host: marks any recording row for the
 * given meeting that is stuck in 'starting' / 'recording' / 'finalizing'
 * as 'failed' so the next /recording/start can proceed.
 *
 * Usage:  node database/_unblock-recording.js <meetingId>
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const PostgreSQLDatabase = require('./init-postgres');

(async () => {
    const meetingId = parseInt(process.argv[2] || '17', 10);
    const db = new PostgreSQLDatabase();
    try {
        await db.initialize();
        const stuck = await db.all(
            `SELECT id, status, egress_id FROM meeting_recordings
             WHERE meeting_id = $1 AND status IN ('starting', 'recording', 'finalizing')`,
            [meetingId]
        );
        console.log(`Found ${stuck.length} stuck row(s) for meeting ${meetingId}`);
        for (const r of stuck) {
            console.log(`  - id=${r.id} status=${r.status} egress=${r.egress_id || 'null'}`);
            await db.run(
                `UPDATE meeting_recordings
                 SET status='failed',
                     error_message='Manually unblocked via _unblock-recording.js',
                     ended_at=COALESCE(ended_at, CURRENT_TIMESTAMP),
                     updated_at=CURRENT_TIMESTAMP
                 WHERE id=$1`,
                [r.id]
            );
        }
        await db.run(
            `UPDATE meetings SET is_recording=false, updated_at=CURRENT_TIMESTAMP WHERE id=$1`,
            [meetingId]
        );
        console.log('✅ Done. The host can start a new recording now.');
    } catch (err) {
        console.error('❌', err.message);
    } finally {
        await db.close();
    }
})();
