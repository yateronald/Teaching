const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const PostgreSQLDatabase = require('../database/init-postgres');

async function run() {
  process.env.TZ = 'UTC';
  const db = new PostgreSQLDatabase();
  await db.initialize();

  // Find a teacher
  const teacher = await db.get("SELECT id, first_name, last_name FROM users WHERE role = 'teacher' LIMIT 1");
  console.log('Teacher:', teacher);

  // Find an admin
  const admin = await db.get("SELECT id, first_name, last_name FROM users WHERE role = 'admin' LIMIT 1");
  console.log('Admin:', admin);

  // Find a batch with students
  const batch = await db.get(`
    SELECT b.id, b.name, count(bs.student_id) as student_count
    FROM batches b
    JOIN batch_students bs ON b.id = bs.batch_id
    GROUP BY b.id, b.name
    HAVING count(bs.student_id) > 0
    LIMIT 1
  `);
  console.log('Batch with students:', batch);

  if (teacher) {
    console.log(`\n--- Testing teacher batches for teacher ID ${teacher.id} ---`);
    const batches = await db.all(`
      SELECT 
        b.id, b.name, b.french_level, b.start_date, b.end_date,
        u.first_name as teacher_first_name, u.last_name as teacher_last_name,
        COUNT(DISTINCT bs.student_id)::int as student_count
      FROM batches b
      LEFT JOIN users u ON b.teacher_id = u.id
      LEFT JOIN batch_students bs ON b.id = bs.batch_id
      WHERE b.teacher_id = ?
      GROUP BY b.id, b.name, b.french_level, b.start_date, b.end_date, u.id, u.first_name, u.last_name
    `, [teacher.id]);
    console.log('Batches found:', batches.length);
    console.log(batches);
  }

  if (batch) {
    console.log(`\n--- Testing batch results aggregation for batch ID ${batch.id} ---`);
    const students = await db.all(`
      SELECT u.id, u.first_name, u.last_name, u.email
      FROM batch_students bs
      JOIN users u ON bs.student_id = u.id
      WHERE bs.batch_id = ?
    `, [batch.id]);
    console.log('Students in batch:', students.length);

    if (students.length > 0) {
      const studentIds = students.map(s => s.id);
      const placeholders = studentIds.map(() => '?').join(',');

      const coAttempts = await db.all(`
        SELECT student_id, earned_points, score_percentage, cefr_level, completed_at
        FROM tcf_co_quiz_attempts
        WHERE student_id IN (${placeholders}) AND completed_at IS NOT NULL
      `, studentIds);

      const eeSims = await db.all(`
        SELECT student_id, average_score, overall_level, submitted_at
        FROM tcf_ee_simulations
        WHERE student_id IN (${placeholders}) AND status = 'completed'
      `, studentIds);

      const eoSims = await db.all(`
        SELECT user_id as student_id, overall_score, completed_at
        FROM eo_simulations
        WHERE user_id IN (${placeholders}) AND status = 'completed'
      `, studentIds);

      console.log(`CO attempts found: ${coAttempts.length}`);
      console.log(`EE sims found: ${eeSims.length}`);
      console.log(`EO sims found: ${eoSims.length}`);
    }
  }

  await db.close();
}

run().catch(console.error);
