const PostgreSQLDatabase = require('../database/init-postgres');
const { checkExamAccess, hasAnyActiveAssignmentForCategory } = require('../services/examAccessService');
require('dotenv').config();

async function run() {
  process.env.TZ = 'UTC';
  const db = new PostgreSQLDatabase();
  await db.initialize();

  console.log('--- Initializing Clean Assignment Verification ---\n');

  const assignments = await db.all(`
    SELECT a.student_id, a.batch_id, a.content_type, a.content_id, a.expires_at,
           u.first_name, u.last_name
    FROM tcf_exam_assignments a
    LEFT JOIN users u ON a.student_id = u.id
    ORDER BY a.assigned_at DESC
  `);

  let checkedCount = 0;

  for (const a of assignments) {
    // Verify if content exists in the database
    let exists = false;
    if (a.content_type === 'co_series') {
      const row = await db.get("SELECT id FROM tcf_co_series WHERE id = $1", [a.content_id]);
      exists = !!row;
    } else if (a.content_type === 'ce_series') {
      const row = await db.get("SELECT id FROM tcf_ce_series WHERE id = $1", [a.content_id]);
      exists = !!row;
    } else if (a.content_type === 'ee_month') {
      const row = await db.get("SELECT id FROM tcf_ee_months WHERE id = $1", [a.content_id]);
      exists = !!row;
    } else if (a.content_type === 'eo_month') {
      const row = await db.get("SELECT id FROM tcf_eo_months WHERE id = $1", [a.content_id]);
      exists = !!row;
    } else if (a.content_type === 'ee_year') {
      const row = await db.get("SELECT id FROM tcf_ee_years WHERE id = $1", [a.content_id]);
      exists = !!row;
    } else if (a.content_type === 'eo_year') {
      const row = await db.get("SELECT id FROM tcf_eo_years WHERE id = $1", [a.content_id]);
      exists = !!row;
    } else if (a.content_type === 'ee_combinaison') {
      const row = await db.get("SELECT id FROM tcf_ee_combinaisons WHERE id = $1", [a.content_id]);
      exists = !!row;
    } else if (a.content_type === 'eo_partie') {
      const row = await db.get("SELECT id FROM tcf_eo_parties WHERE id = $1", [a.content_id]);
      exists = !!row;
    } else if (a.content_type === 'category') {
      const row = await db.get("SELECT id FROM tcf_categories WHERE id = $1", [a.content_id]);
      exists = !!row;
    }

    if (!exists) {
      // Stale assignment row referencing deleted content; skip it
      continue;
    }

    let studentId = a.student_id;
    let name = a.first_name ? `${a.first_name} ${a.last_name}` : null;
    
    if (!studentId && a.batch_id) {
      const batchStudent = await db.get(
        "SELECT student_id FROM batch_students WHERE batch_id = $1 LIMIT 1",
        [a.batch_id]
      );
      if (batchStudent) {
        studentId = batchStudent.student_id;
        const student = await db.get("SELECT first_name, last_name FROM users WHERE id = $1", [studentId]);
        if (student) name = `${student.first_name} ${student.last_name} (via Batch ${a.batch_id})`;
      }
    }

    if (studentId && name) {
      const isExpired = a.expires_at ? new Date(a.expires_at) < new Date() : false;
      const expectedAccess = !isExpired;
      const hasAccess = await checkExamAccess(db, studentId, a.content_type, a.content_id);
      
      console.log(`Checking access for ${name}:`);
      console.log(`  - Content: ${a.content_type} (ID: ${a.content_id})`);
      console.log(`  - Expires: ${a.expires_at || 'Never'}`);
      console.log(`  - Expired?: ${isExpired}`);
      console.log(`  - Result: ${hasAccess} (Expected: ${expectedAccess})`);
      if (hasAccess === expectedAccess) {
        console.log(`  ✅ Match!`);
      } else {
        console.log(`  ❌ MISMATCH!`);
      }
      checkedCount++;
    }

    if (checkedCount >= 10) break; // Limit to 10 assertions
  }

  console.log('\nVerification completed!');
  await db.close();
}

run().catch(err => {
  console.error('Error during verification:', err);
  process.exit(1);
});
