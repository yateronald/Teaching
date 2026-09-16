const PostgreSQLDatabase = require('../database/init-postgres');
require('dotenv').config();

async function run() {
  process.env.TZ = 'UTC';
  const db = new PostgreSQLDatabase();
  await db.initialize();

  const users = await db.all("SELECT id, email, first_name, last_name, role FROM users WHERE first_name ILIKE '%yate%' OR last_name ILIKE '%yate%'");
  console.log('All Yates:', users);

  await db.close();
}

run().catch(console.error);
