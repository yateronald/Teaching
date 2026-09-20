require('dotenv').config();
const fs = require('fs');
const path = require('path');
const PostgreSQLDatabase = require('./init-postgres');

// Applies migration 023 (class or exam-only demo requests). Safe to run twice.
async function run() {
    const db = new PostgreSQLDatabase();
    try {
        await db.initialize();
        const sql = fs.readFileSync(path.join(__dirname, 'migrations', '023_demo_request_interest.sql'), 'utf8');
        await db.run(sql);

        const cols = await db.all(
            `SELECT column_name, is_nullable FROM information_schema.columns
              WHERE table_name = 'demo_requests'
                AND column_name IN ('interest','target_exam','exam_date','target_score','skills','interested_level','preferred_schedule')
              ORDER BY column_name`);
        cols.forEach(c => console.log(`  ${c.column_name.padEnd(20)} nullable: ${c.is_nullable}`));

        const split = await db.get(
            `SELECT COUNT(*)::int AS total,
                    COUNT(*) FILTER (WHERE interest = 'classes')::int AS classes,
                    COUNT(*) FILTER (WHERE interest = 'exam')::int AS exam
               FROM demo_requests`);
        console.log(`  requests: ${split.total} (${split.classes} for classes, ${split.exam} exam only)`);

        console.log('\n✅ Migration 023 complete — demo requests now say what they are for.');
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        if (db && typeof db.close === 'function') await db.close();
    }
}

run();
