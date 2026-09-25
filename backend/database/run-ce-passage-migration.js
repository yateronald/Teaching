require('dotenv').config();
const fs = require('fs');
const path = require('path');
const PostgreSQLDatabase = require('./init-postgres');

// Applies migration 024 (reading documents as text, answer explanations). Safe to run twice.
async function run() {
    const db = new PostgreSQLDatabase();
    try {
        await db.initialize();
        const sql = fs.readFileSync(path.join(__dirname, 'migrations', '024_ce_passage_explanation.sql'), 'utf8');
        await db.run(sql);

        const cols = await db.all(
            `SELECT column_name, data_type FROM information_schema.columns
              WHERE table_name = 'tcf_ce_questions' AND column_name IN ('passage_text', 'explanation')
              ORDER BY column_name`);
        cols.forEach(c => console.log(`  ${c.column_name.padEnd(14)} ${c.data_type}`));

        const counts = await db.get(
            `SELECT COUNT(*)::int AS total,
                    COUNT(*) FILTER (WHERE image_url IS NOT NULL)::int AS with_image,
                    COUNT(*) FILTER (WHERE passage_text IS NOT NULL)::int AS with_text
               FROM tcf_ce_questions`);
        console.log(`  questions: ${counts.total} (${counts.with_image} with an image, ${counts.with_text} with a text)`);

        console.log('\n✅ Migration 024 complete — reading questions can now store their document as text and an explanation.');
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        if (db && typeof db.close === 'function') await db.close();
    }
}

run();
