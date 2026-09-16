const PostgreSQLDatabase = require('../database/init-postgres');
require('dotenv').config();

async function run() {
  process.env.TZ = 'UTC';
  const db = new PostgreSQLDatabase();
  await db.initialize();

  const month = await db.get("SELECT * FROM tcf_ee_months WHERE id = 10");
  console.log('EE Month with ID 10:', month);

  const allMonths = await db.all("SELECT id, month_name FROM tcf_ee_months");
  console.log('All EE months in DB:', allMonths);

  await db.close();
}

run().catch(console.error);
