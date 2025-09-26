const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function checkAttendance() {
  try {
    console.log('Checking attendance table...');
    
    // Check table structure
    const structure = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'attendance' 
      ORDER BY ordinal_position
    `);
    console.log('\nAttendance table structure:');
    structure.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Check recent records
    const recent = await pool.query(`
      SELECT a.*, u.first_name, u.last_name, cs.id as session_id
      FROM attendance a
      JOIN users u ON a.student_id = u.id
      JOIN class_sessions cs ON a.session_id = cs.id
      ORDER BY a.check_in_time DESC
      LIMIT 10
    `);
    
    console.log(`\nRecent attendance records (${recent.rows.length} found):`);
    recent.rows.forEach(row => {
      console.log(`- ${row.first_name} ${row.last_name} | Session: ${row.session_id} | Status: ${row.status} | Time: ${row.check_in_time}`);
    });
    
    // Check today's records
    const today = await pool.query(`
      SELECT COUNT(*) as count
      FROM attendance 
      WHERE DATE(check_in_time) = CURRENT_DATE
    `);
    console.log(`\nToday's attendance records: ${today.rows[0].count}`);
    
    // Check active sessions
    const activeSessions = await pool.query(`
      SELECT cs.id, cs.schedule_id, cs.status, cs.access_code, cs.start_time,
             s.title, b.name as batch_name
      FROM class_sessions cs
      JOIN schedules s ON cs.schedule_id = s.id
      JOIN batches b ON s.batch_id = b.id
      WHERE cs.status IN ('started', 'in_progress')
      ORDER BY cs.start_time DESC
    `);
    
    console.log(`\nActive sessions (${activeSessions.rows.length} found):`);
    activeSessions.rows.forEach(row => {
      console.log(`- Session ${row.id}: ${row.title} | Batch: ${row.batch_name} | Status: ${row.status} | Code: ${row.access_code}`);
    });
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkAttendance();