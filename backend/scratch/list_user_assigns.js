const PostgreSQLDatabase = require('../database/init-postgres');
require('dotenv').config();

async function run() {
  process.env.TZ = 'UTC';
  const db = new PostgreSQLDatabase();
  await db.initialize();

  const users = await db.all("SELECT id, username, email, first_name, last_name, role FROM users ORDER BY id DESC LIMIT 20");
  console.log('Recent Users:');
  console.dir(users, { depth: null });

  for (const u of users) {
    const assigns = await db.all(
      `SELECT * FROM tcf_exam_assignments WHERE student_id = $1 OR batch_id IN (SELECT batch_id FROM batch_students WHERE student_id = $1)`,
      [u.id]
    );
    if (assigns.length > 0) {
      console.log(`User ID ${u.id} (${u.first_name} ${u.last_name}) has ${assigns.length} assignments.`);
      console.log(assigns.map(a => ({
        ...a,
        isExpired: a.expires_at ? new Date(a.expires_at) < new Date() : false
      })));
    }
  }

  await db.close();
}

run().catch(console.error);
