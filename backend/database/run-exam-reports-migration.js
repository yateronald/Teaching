require('dotenv').config();
const fs = require('fs');
const path = require('path');
const PostgreSQLDatabase = require('./init-postgres');

// Applies migration 019 (structured EO/EE simulation reports). Safe to run twice.
async function run() {
    const db = new PostgreSQLDatabase();
    try {
        await db.initialize();
        const sql = fs.readFileSync(path.join(__dirname, 'migrations', '019_exam_simulation_reports.sql'), 'utf8');
        await db.run(sql);
        const cols = await db.all(`
            SELECT table_name, column_name, data_type
            FROM information_schema.columns
            WHERE table_name IN ('eo_simulations', 'tcf_ee_simulations')
              AND column_name IN ('evaluation', 'scoring_version', 'cefr_level', 'nclc_level', 'evaluation_attempts')
            ORDER BY table_name, column_name
        `);
        cols.forEach(c => console.log(`  ${c.table_name}.${c.column_name} (${c.data_type})`));
        console.log('\n✅ Migration 019 complete');
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        if (db && typeof db.close === 'function') await db.close();
    }
}

run();
