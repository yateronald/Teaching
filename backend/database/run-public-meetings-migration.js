require('dotenv').config();
const fs = require('fs');
const path = require('path');
const PostgreSQLDatabase = require('./init-postgres');

// Applies migration 035 (public meetings, invitees, guests, and single-use demo availability links).
// Safe to run multiple times.
async function run() {
    const db = new PostgreSQLDatabase();
    try {
        await db.initialize();
        const sql = fs.readFileSync(
            path.join(__dirname, 'migrations', '035_public_meetings_and_demo_availability.sql'),
            'utf8'
        );
        await db.run(sql);

        const meetingCols = await db.all(
            `SELECT column_name
               FROM information_schema.columns
              WHERE table_schema = 'public'
                AND table_name = 'meetings'
                AND column_name IN ('is_public', 'require_approval', 'meeting_kind', 'demo_request_id', 'host_timezone')`
        );
        if (meetingCols.length < 5) {
            throw new Error(`Expected 5 new columns on meetings, found ${meetingCols.length}.`);
        }

        const demoCol = await db.get(
            `SELECT column_name
               FROM information_schema.columns
              WHERE table_schema = 'public'
                AND table_name = 'demo_requests'
                AND column_name = 'meeting_id'`
        );
        if (!demoCol) {
            throw new Error('Expected column demo_requests.meeting_id missing.');
        }

        const tables = await db.all(
            `SELECT table_name
               FROM information_schema.tables
              WHERE table_schema = 'public'
                AND table_name IN ('meeting_invitees', 'meeting_guests', 'demo_availability_requests')`
        );
        if (tables.length < 3) {
            throw new Error(`Expected 3 new tables, found ${tables.length}.`);
        }

        console.log('  Verified meetings.(is_public, require_approval, meeting_kind, demo_request_id, host_timezone),');
        console.log('  demo_requests.meeting_id, meeting_invitees, meeting_guests, and demo_availability_requests.');
        console.log('\n✅ Migration 035 complete.');
    } catch (err) {
        console.error('Migration failed:', err.message);
        process.exit(1);
    } finally {
        if (db && typeof db.close === 'function') await db.close();
    }
}

run();
