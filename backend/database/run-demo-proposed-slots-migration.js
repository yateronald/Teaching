require('dotenv').config();
const fs = require('fs');
const path = require('path');
const PostgreSQLDatabase = require('./init-postgres');

// Applies migration 036 (flexible multi-slot proposed availability options).
// Safe to run multiple times.
async function run() {
    const db = new PostgreSQLDatabase();
    try {
        await db.initialize();
        const sql = fs.readFileSync(
            path.join(__dirname, 'migrations', '036_demo_proposed_slots.sql'),
            'utf8'
        );
        await db.run(sql);

        const col = await db.get(
            `SELECT column_name
               FROM information_schema.columns
              WHERE table_schema = 'public'
                AND table_name = 'demo_availability_requests'
                AND column_name = 'proposed_slots'`
        );
        if (!col) {
            throw new Error('Expected column demo_availability_requests.proposed_slots missing.');
        }

        console.log('  Verified demo_availability_requests.proposed_slots.');
        console.log('\nMigration 036 complete.');
    } catch (err) {
        console.error('Migration failed:', err.message);
        process.exit(1);
    } finally {
        if (db && typeof db.close === 'function') await db.close();
    }
}

run();
