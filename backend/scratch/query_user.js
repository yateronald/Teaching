const PostgreSQLDatabase = require('../database/init-postgres');
require('dotenv').config();

async function run() {
  process.env.TZ = 'UTC';
  const db = new PostgreSQLDatabase();
  await db.initialize();

  const user = await db.get("SELECT * FROM users WHERE id = 10");
  console.log('User:', user);

  if (user) {
    const batchRows = await db.all(
      `SELECT batch_id FROM batch_students WHERE student_id = $1`,
      [user.id]
    );
    console.log('Batches:', batchRows);

    const assigns = await db.all(
      `SELECT * FROM tcf_exam_assignments WHERE student_id = $1 OR batch_id IN (SELECT batch_id FROM batch_students WHERE student_id = $1) ORDER BY assigned_at DESC`,
      [user.id]
    );
    console.log('Assignments:');
    console.dir(assigns.map(a => ({
      ...a,
      isExpired: a.expires_at ? new Date(a.expires_at) < new Date() : false
    })), { depth: null });
  }

  await db.close();
}

run().catch(console.error);
