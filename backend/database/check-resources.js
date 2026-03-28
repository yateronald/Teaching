const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { Pool } = require('pg');
const pool = new Pool({ host: process.env.DB_HOST, port: parseInt(process.env.DB_PORT), database: process.env.DB_NAME, user: process.env.DB_USER, password: process.env.DB_PASSWORD, ssl: { rejectUnauthorized: false } });

async function check() {
    const r = await pool.query('SELECT id, title, file_name, storage_type, kdrive_file_id, file_path FROM resources ORDER BY id');
    console.log('Resources in database:');
    r.rows.forEach(row => {
        console.log(`  #${row.id} "${row.title}" — storage: ${row.storage_type || 'local'}, kdrive_id: ${row.kdrive_file_id || 'none'}, path: ${row.file_path || 'none'}`);
    });
    pool.end();
}
check().catch(e => { console.error(e.message); pool.end(); });
