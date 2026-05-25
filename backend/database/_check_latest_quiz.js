// What does the live DB actually contain for the latest quiz?
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

(async () => {
    const c = new Client({
        host: process.env.DB_HOST, port: +process.env.DB_PORT,
        user: process.env.DB_USER, password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: true, ca: fs.readFileSync(path.join(__dirname, '..', 'cert', 'ca.pem'), 'utf8') },
    });
    await c.connect();
    const r = (await c.query(`
        SELECT id, title,
               start_date::text AS start_text,
               end_date::text   AS end_text,
               start_date AT TIME ZONE 'UTC' AS start_utc,
               EXTRACT(EPOCH FROM start_date) AS start_epoch,
               EXTRACT(EPOCH FROM end_date)   AS end_epoch,
               created_at::text AS created_text
        FROM quizzes
        ORDER BY id DESC LIMIT 5
    `)).rows;
    console.log('Latest 5 quizzes (raw, no pg type coercion):');
    for (const q of r) {
        console.log('---');
        console.log('  id        :', q.id);
        console.log('  title     :', q.title);
        console.log('  start_text:', q.start_text);
        console.log('  end_text  :', q.end_text);
        console.log('  start_utc :', q.start_utc);
        console.log('  start_epoch (s):', q.start_epoch);
        console.log('  human (UTC) from epoch:', new Date(Number(q.start_epoch) * 1000).toISOString());
        console.log('  created_at:', q.created_text);
    }
    await c.end();
})().catch(e => { console.error(e.message); process.exitCode = 1; });
