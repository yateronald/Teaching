/**
 * Migration: Add kDrive columns to resources table
 * Run: node database/migrate-resources-kdrive.js
 */
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

const sql = `
-- Add kDrive columns to resources table
ALTER TABLE resources ADD COLUMN IF NOT EXISTS kdrive_file_id INTEGER;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS kdrive_folder_id INTEGER;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS storage_type VARCHAR(20) DEFAULT 'local';
ALTER TABLE resources ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'document';
ALTER TABLE resources ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Index for kDrive lookups
CREATE INDEX IF NOT EXISTS idx_resources_kdrive_file_id ON resources(kdrive_file_id) WHERE kdrive_file_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_storage_type ON resources(storage_type);
CREATE INDEX IF NOT EXISTS idx_resources_teacher_id ON resources(teacher_id);
CREATE INDEX IF NOT EXISTS idx_resources_batch_id ON resources(batch_id);

SELECT 'Migration complete' AS result;
`;

pool.query(sql).then(res => {
  const last = Array.isArray(res) ? res[res.length - 1] : res;
  console.log('✅', last.rows ? last.rows[0].result : 'Done');
  pool.end();
}).catch(err => {
  console.error('❌ Migration error:', err.message);
  pool.end();
  process.exit(1);
});
