const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { Pool } = require('pg');
const pool = new Pool({ host: process.env.DB_HOST, port: parseInt(process.env.DB_PORT), database: process.env.DB_NAME, user: process.env.DB_USER, password: process.env.DB_PASSWORD, ssl: { rejectUnauthorized: false } });

pool.query('ALTER TABLE resources ALTER COLUMN file_path DROP NOT NULL')
    .then(() => { console.log('✅ file_path is now nullable'); pool.end(); })
    .catch(e => { console.error('❌', e.message); pool.end(); });
