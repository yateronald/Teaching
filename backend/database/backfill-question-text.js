/**
 * Backfill script: Updates existing tcf_ee_taches with question_text from JSON source files.
 * Only updates Task 3 (argumentation) where question_text is currently NULL.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const PostgreSQLDatabase = require('./init-postgres');

const FRENCH_MONTH_MAP = {
  'janvier': 1, 'février': 2, 'mars': 3, 'avril': 4, 'mai': 5, 'juin': 6,
  'juillet': 7, 'août': 8, 'septembre': 9, 'octobre': 10, 'novembre': 11, 'décembre': 12,
};

async function run() {
  const db = new PostgreSQLDatabase();
  try {
    console.log('Connecting...');
    await db.initialize();

    // Load all JSON files
    const baseDir = path.join(__dirname, '..', '..', 'expression ecrite');
    const years = ['2024', '2025', '2026'];
    let totalUpdated = 0;
    let totalSkipped = 0;

    for (const year of years) {
      const jsonPath = path.join(baseDir, year, `expression_ecrite_${year}.json`);
      if (!fs.existsSync(jsonPath)) {
        console.log(`⏭️  No JSON file for ${year}, skipping`);
        continue;
      }

      console.log(`\n📄 Processing ${year}...`);
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

      // Filter to task 3 entries with non-empty question
      const task3Entries = data.filter(e => e.task_number === 3 && e.question && e.question.trim());
      console.log(`   Found ${task3Entries.length} Task 3 entries with questions`);

      for (const entry of task3Entries) {
        const questionText = entry.question.trim();
        const monthStr = (entry.month || '').trim();
        const combName = (entry.combination || '').trim();
        const parts = monthStr.split(' ');
        const monthNameLower = (parts[0] || '').toLowerCase();
        const monthNumber = FRENCH_MONTH_MAP[monthNameLower];

        if (!monthNumber || !combName) {
          totalSkipped++;
          continue;
        }

        // Find the tache in the database
        const tache = await db.get(`
          SELECT t.id, t.question_text
          FROM tcf_ee_taches t
          JOIN tcf_ee_combinaisons c ON t.combinaison_id = c.id
          JOIN tcf_ee_months m ON c.month_id = m.id
          JOIN tcf_ee_years y ON m.year_id = y.id
          WHERE y.year = $1 AND m.month = $2 AND c.name = $3 AND t.task_number = 3
        `, [parseInt(year), monthNumber, combName]);

        if (!tache) {
          totalSkipped++;
          continue;
        }

        if (tache.question_text) {
          // Already has question_text, skip
          totalSkipped++;
          continue;
        }

        // Update
        await db.run(
          'UPDATE tcf_ee_taches SET question_text = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [questionText, tache.id]
        );
        totalUpdated++;
        console.log(`   ✅ Updated tache ${tache.id}: "${questionText.substring(0, 50)}..."`);
      }
    }

    console.log(`\n✅ Backfill complete! Updated: ${totalUpdated}, Skipped: ${totalSkipped}`);
  } catch (err) {
    console.error('Backfill failed:', err);
    process.exit(1);
  } finally {
    if (db && typeof db.close === 'function') await db.close();
  }
}

run();
