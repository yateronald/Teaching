const PostgreSQLDatabase = require('../database/init-postgres');
require('dotenv').config();

async function run() {
  process.env.TZ = 'UTC';
  const db = new PostgreSQLDatabase();
  await db.initialize();

  // Find all members of batch 19
  const members = await db.all("SELECT bs.*, u.first_name, u.last_name FROM batch_students bs JOIN users u ON bs.student_id = u.id WHERE bs.batch_id = 19");
  console.log('Batch 19 members:', members);

  // Check if batch 19 has assignments
  const assigns = await db.all("SELECT * FROM tcf_exam_assignments WHERE batch_id = 19");
  console.log('Batch 19 assignments:', assigns);

  await db.close();
}

run().catch(console.error);
