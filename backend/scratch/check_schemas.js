const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const PostgreSQLDatabase = require('../database/init-postgres');

async function run() {
  process.env.TZ = 'UTC';
  const db = new PostgreSQLDatabase();
  await db.initialize();

  // Print columns of tcf_co_quiz_attempts
  const coCols = await db.all(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'tcf_co_quiz_attempts'
  `);
  console.log('--- tcf_co_quiz_attempts ---');
  coCols.forEach(c => console.log(`${c.column_name}: ${c.data_type}`));

  // Print columns of tcf_ee_simulations
  const eeCols = await db.all(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'tcf_ee_simulations'
  `);
  console.log('--- tcf_ee_simulations ---');
  eeCols.forEach(c => console.log(`${c.column_name}: ${c.data_type}`));

  // Print columns of eo_simulations
  const eoCols = await db.all(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'eo_simulations'
  `);
  console.log('--- eo_simulations ---');
  eoCols.forEach(c => console.log(`${c.column_name}: ${c.data_type}`));

  // Count rows in each
  const coCount = await db.get("SELECT count(*) as count FROM tcf_co_quiz_attempts");
  const eeCount = await db.get("SELECT count(*) as count FROM tcf_ee_simulations");
  const eoCount = await db.get("SELECT count(*) as count FROM eo_simulations");
  console.log(`Counts: CO=${coCount.count}, EE=${eeCount.count}, EO=${eoCount.count}`);

  // Fetch a sample completed row from each if count > 0
  if (parseInt(coCount.count) > 0) {
    const row = await db.get("SELECT * FROM tcf_co_quiz_attempts LIMIT 1");
    console.log('CO sample keys:', Object.keys(row));
  }
  if (parseInt(eeCount.count) > 0) {
    const row = await db.get("SELECT * FROM tcf_ee_simulations LIMIT 1");
    console.log('EE sample keys:', Object.keys(row));
  }
  if (parseInt(eoCount.count) > 0) {
    const row = await db.get("SELECT * FROM eo_simulations LIMIT 1");
    console.log('EO sample keys:', Object.keys(row));
  }

  await db.close();
}

run().catch(console.error);
