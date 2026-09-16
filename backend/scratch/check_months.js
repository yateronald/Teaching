const PostgreSQLDatabase = require('../database/init-postgres');
require('dotenv').config();

async function run() {
  process.env.TZ = 'UTC';
  const db = new PostgreSQLDatabase();
  await db.initialize();

  const months = await db.all("SELECT * FROM tcf_ee_months");
  console.log('All Months in database:', months);

  await db.close();
}

run().catch(console.error);
