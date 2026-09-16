const PostgreSQLDatabase = require('../database/init-postgres');
require('dotenv').config();

async function run() {
  process.env.TZ = 'UTC';
  const db = new PostgreSQLDatabase();
  await db.initialize();

  const members = await db.all(`
    SELECT bs.*, u.first_name, u.last_name, u.email
    FROM batch_students bs
    JOIN users u ON bs.student_id = u.id
    WHERE bs.batch_id = 35
  `);
  console.log('Batch 35 members:', members);

  await db.close();
}

run().catch(console.error);
