const PostgreSQLDatabase = require('../database/init-postgres');
require('dotenv').config();

async function run() {
  process.env.TZ = 'UTC';
  const db = new PostgreSQLDatabase();
  await db.initialize();

  // Query users and credit balances
  const balances = await db.all(`
    SELECT b.*, u.first_name, u.last_name, u.email
    FROM student_ai_credits b
    JOIN users u ON b.user_id = u.id
    WHERE b.ee_credits = 5 OR b.eo_credits = 4
  `);
  console.log('Matches:', balances);

  await db.close();
}

run().catch(console.error);
