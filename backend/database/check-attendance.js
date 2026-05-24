const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { Pool } = require('pg');
const pool = new Pool({ host: process.env.DB_HOST, port: parseInt(process.env.DB_PORT), database: process.env.DB_NAME, user: process.env.DB_USER, password: process.env.DB_PASSWORD, ssl: { rejectUnauthorized: false } });

async function check() {
    const att = await pool.query('SELECT COUNT(*) as cnt FROM attendance');
    console.log('Attendance records:', att.rows[0].cnt);
    
    const cs = await pool.query('SELECT COUNT(*) as cnt FROM class_sessions');
    console.log('Class sessions:', cs.rows[0].cnt);
    
    const sample = await pool.query(`SELECT cs.id, cs.schedule_id, cs.status, COUNT(a.id) as att_count 
        FROM class_sessions cs LEFT JOIN attendance a ON cs.id = a.session_id 
        GROUP BY cs.id, cs.schedule_id, cs.status ORDER BY att_count DESC LIMIT 5`);
    console.log('Top sessions by attendance:', JSON.stringify(sample.rows, null, 2));
    
    const ub = await pool.query('SELECT COUNT(*) as cnt FROM user_batches');
    console.log('user_batches records:', ub.rows[0].cnt);
    
    const bs = await pool.query('SELECT COUNT(*) as cnt FROM batch_students');
    console.log('batch_students records:', bs.rows[0].cnt);
    
    // Check a specific session's attendance
    const attSample = await pool.query('SELECT * FROM attendance LIMIT 5');
    console.log('Sample attendance:', JSON.stringify(attSample.rows, null, 2));
    
    // Check overview endpoint data
    const overview = await pool.query(`
        SELECT 
            COUNT(DISTINCT cs.id) as total_sessions,
            COUNT(DISTINCT a.student_id) as students_with_attendance,
            COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present,
            COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late,
            COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent
        FROM class_sessions cs
        LEFT JOIN attendance a ON cs.id = a.session_id
    `);
    console.log('Overview:', JSON.stringify(overview.rows[0]));
    
    pool.end();
}
check().catch(e => { console.error(e.message); pool.end(); });
