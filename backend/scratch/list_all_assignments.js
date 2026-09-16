const PostgreSQLDatabase = require('../database/init-postgres');
require('dotenv').config();

async function run() {
  process.env.TZ = 'UTC';
  const db = new PostgreSQLDatabase();
  await db.initialize();

  const assignments = await db.all("SELECT * FROM tcf_exam_assignments ORDER BY assigned_at DESC");
  console.log('All Assignments in database:');
  console.dir(assignments.map(a => ({
    id: a.id,
    content_type: a.content_type,
    content_id: a.content_id,
    student_id: a.student_id,
    batch_id: a.batch_id,
    group_id: a.group_id,
    group_name: a.group_name,
    expires_at: a.expires_at,
    assigned_at: a.assigned_at
  })), { depth: null });

  await db.close();
}

run().catch(console.error);
