const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

const sql = fs.readFileSync(path.join(__dirname, 'drop-chat-tables.sql'), 'utf8');

pool.query(sql).then(res => {
  const last = Array.isArray(res) ? res[res.length - 1] : res;
  console.log('✅', last.rows ? last.rows[0].result : 'Done');
  pool.end();
}).catch(err => {
  console.error('❌ Error:', err.message);
  pool.end();
  process.exit(1);
});
