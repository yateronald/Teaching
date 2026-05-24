const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { Pool } = require('pg');
const pool = new Pool({ host: process.env.DB_HOST, port: parseInt(process.env.DB_PORT), database: process.env.DB_NAME, user: process.env.DB_USER, password: process.env.DB_PASSWORD, ssl: { rejectUnauthorized: false } });

async function check() {
    // Get attendance with student names
    const r = await pool.query(`
        SELECT a.session_id, a.student_id, a.status, 
               u.first_name || ' ' || u.last_name as student_name
        FROM attendance a
        JOIN users u ON a.student_id = u.id
        ORDER BY a.session_id
    `);
    console.log('Attendance records with students:');
    r.rows.forEach(row => console.log(`  Session ${row.session_id}: ${row.student_name} = ${row.status}`));
    
    // Check students endpoint data - using batch_students
    const students = await pool.query(`
        SELECT u.id, u.first_name, u.last_name, u.email, b.id as batch_id, b.name as batch_name,
               COUNT(DISTINCT cs.id) as total_sessions,
               COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count
        FROM users u
        JOIN batch_students bs ON u.id = bs.student_id
        JOIN batches b ON bs.batch_id = b.id
        LEFT JOIN schedules s ON b.id = s.batch_id AND s.type = 'class'
        LEFT JOIN class_sessions cs ON s.id = cs.schedule_id
        LEFT JOIN attendance a ON cs.id = a.session_id AND a.student_id = u.id
        WHERE u.role = 'student'
        GROUP BY u.id, u.first_name, u.last_name, u.email, b.id, b.name
        LIMIT 10
    `);
    console.log('\nStudents via batch_students:');
    students.rows.forEach(row => console.log(`  ${row.first_name} ${row.last_name} (${row.batch_name}): ${row.present_count}/${row.total_sessions}`));
    
    pool.end();
}
check().catch(e => { console.error(e.message); pool.end(); });
