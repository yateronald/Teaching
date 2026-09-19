require('dotenv').config();
const fs = require('fs');
const path = require('path');
const PostgreSQLDatabase = require('./init-postgres');

// Applies migration 020 (exam candidates + reading practice). Safe to run twice.
async function run() {
    const db = new PostgreSQLDatabase();
    try {
        await db.initialize();
        const sql = fs.readFileSync(path.join(__dirname, 'migrations', '020_exam_candidates.sql'), 'utf8');
        await db.run(sql);
        const tables = await db.all(`
            SELECT table_name FROM information_schema.tables
            WHERE table_name IN ('exam_candidate_profiles', 'tcf_ce_quiz_attempts') ORDER BY table_name
        `);
        tables.forEach(t => console.log(`  table ${t.table_name}`));
        const check = await db.get(`SELECT pg_get_constraintdef(oid) AS def FROM pg_constraint WHERE conname = 'users_role_check'`);
        console.log(`  users_role_check: ${check ? check.def : 'missing'}`);
        console.log('\n✅ Migration 020 complete');
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        if (db && typeof db.close === 'function') await db.close();
    }
}

run();
