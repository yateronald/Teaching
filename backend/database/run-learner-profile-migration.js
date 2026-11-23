require('dotenv').config();
const fs = require('fs');
const path = require('path');
const PostgreSQLDatabase = require('./init-postgres');

// Applies migration 032 (WhatsApp contact & French CEFR level on users and pending sign-ups).
// Safe to run twice; requires migration 030 (learn_pending_signups) first.
async function run() {
    const db = new PostgreSQLDatabase();
    try {
        await db.initialize();
        const ready = await db.get(
            "SELECT 1 AS ok FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'learn_pending_signups'");
        if (!ready) throw new Error('Run database/run-learner-accounts-migration.js (migration 030) first.');

        const sql = fs.readFileSync(path.join(__dirname, 'migrations', '032_learner_whatsapp_level.sql'), 'utf8');
        await db.run(sql);

        const cols = await db.all(
            `SELECT table_name, column_name
               FROM information_schema.columns
              WHERE table_schema = 'public'
                AND table_name IN ('users', 'learn_pending_signups')
                AND column_name IN ('whatsapp', 'french_level')`);
        if (cols.length < 4) {
            throw new Error(`Expected 4 columns across users & learn_pending_signups, found ${cols.length}.`);
        }
        console.log('  Columns verified: users.(whatsapp, french_level), learn_pending_signups.(whatsapp, french_level).');
        console.log('\n✅ Migration 032 complete — WhatsApp and French level fields are ready.');
    } catch (err) {
        console.error('Migration failed:', err.message);
        process.exit(1);
    } finally {
        if (db && typeof db.close === 'function') await db.close();
    }
}

run();
