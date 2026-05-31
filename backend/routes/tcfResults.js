const express = require('express');
const { authenticateToken, teacherOrAdmin } = require('../middleware/auth');

const router = express.Router();

// All endpoints in this router require teacher or admin permissions
router.use(authenticateToken);
router.use(teacherOrAdmin);

// ============================================================
// GET /batches - List batches
// ============================================================
router.get('/batches', async (req, res) => {
  try {
    let sql = `
      SELECT 
        b.id, b.name, b.french_level, b.start_date, b.end_date,
        u.id as teacher_id, u.first_name as teacher_first_name, u.last_name as teacher_last_name,
        COUNT(DISTINCT bs.student_id)::int as student_count
      FROM batches b
      LEFT JOIN users u ON b.teacher_id = u.id
      LEFT JOIN batch_students bs ON b.id = bs.batch_id
    `;
    const params = [];

    if (req.user.role === 'teacher') {
      sql += ' WHERE b.teacher_id = ?';
      params.push(req.user.id);
    }

    sql += `
      GROUP BY b.id, b.name, b.french_level, b.start_date, b.end_date, u.id, u.first_name, u.last_name
      ORDER BY b.name ASC
    `;

    const batches = await req.db.all(sql, params);
    res.json(batches);
  } catch (error) {
    console.error('GET /tcf-results/batches error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// GET /students - List students (with their batches)
// ============================================================
router.get('/students', async (req, res) => {
  try {
    const { search } = req.query;
    let sql = '';
    const params = [];

    if (req.user.role === 'teacher') {
      sql = `
        SELECT DISTINCT u.id, u.first_name, u.last_name, u.email, u.username
        FROM users u
        JOIN batch_students bs ON u.id = bs.student_id
        JOIN batches b ON bs.batch_id = b.id
        WHERE u.role = 'student' AND b.teacher_id = ?
      `;
      params.push(req.user.id);

      if (search) {
        sql += ` AND (u.first_name ILIKE ? OR u.last_name ILIKE ? OR u.email ILIKE ? OR u.username ILIKE ?)`;
        const term = `%${search}%`;
        params.push(term, term, term, term);
      }
    } else {
      sql = `
        SELECT id, first_name, last_name, email, username
        FROM users
        WHERE role = 'student'
      `;
      if (search) {
        sql += ` AND (first_name ILIKE ? OR last_name ILIKE ? OR email ILIKE ? OR username ILIKE ?)`;
        const term = `%${search}%`;
        params.push(term, term, term, term);
      }
    }

    sql += ' ORDER BY first_name ASC, last_name ASC';
    const students = await req.db.all(sql, params);

    // Fetch batches for each student
    for (const student of students) {
      const studentBatches = await req.db.all(`
        SELECT b.id, b.name, b.french_level
        FROM batches b
        JOIN batch_students bs ON b.id = bs.batch_id
        WHERE bs.student_id = ?
        ORDER BY b.name
      `, [student.id]);
      student.batches = studentBatches;
    }

    res.json(students);
  } catch (error) {
    console.error('GET /tcf-results/students error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// GET /student/:studentId - Get student details & attempts
// ============================================================
router.get('/student/:studentId', async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    if (isNaN(studentId)) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }

    // Auth check: If teacher, make sure student is in one of their batches
    if (req.user.role === 'teacher') {
      const access = await req.db.get(`
        SELECT COUNT(*)::int AS has_access
        FROM batch_students bs
        JOIN batches b ON bs.batch_id = b.id
        WHERE bs.student_id = ? AND b.teacher_id = ?
      `, [studentId, req.user.id]);

      if (!access || access.has_access === 0) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const studentInfo = await req.db.get(`
      SELECT id, first_name, last_name, email, username, timezone, created_at, is_active
      FROM users
      WHERE id = ? AND role = 'student'
    `, [studentId]);

    if (!studentInfo) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // CO attempts
    const coAttempts = await req.db.all(`
      SELECT a.id, a.series_id, a.completed_at, a.time_spent_seconds, a.total_questions,
             a.correct_count, a.total_points, a.earned_points, a.score_percentage, a.cefr_level,
             s.name as series_name
      FROM tcf_co_quiz_attempts a
      JOIN tcf_co_series s ON a.series_id = s.id
      WHERE a.student_id = ? AND a.completed_at IS NOT NULL
      ORDER BY a.completed_at DESC
    `, [studentId]);

    // EE attempts
    const eeAttempts = await req.db.all(`
      SELECT s.id, s.combinaison_id, s.started_at, s.submitted_at, s.time_used_seconds,
             s.average_score, s.overall_level, s.task1_score, s.task2_score, s.task3_score,
             s.task1_level, s.task2_level, s.task3_level,
             c.name as combinaison_name, m.month_name, y.year
      FROM tcf_ee_simulations s
      JOIN tcf_ee_combinaisons c ON s.combinaison_id = c.id
      JOIN tcf_ee_months m ON c.month_id = m.id
      JOIN tcf_ee_years y ON m.year_id = y.id
      WHERE s.student_id = ? AND s.status = 'completed'
      ORDER BY s.submitted_at DESC
    `, [studentId]);

    // EO attempts
    const eoAttempts = await req.db.all(`
      SELECT s.id, s.partie_id, s.completed_at, s.started_at, s.duration_seconds,
             s.overall_score, s.tache1_score, s.tache2_score, s.tache3_score,
             p.name as partie_name, m.month_name, y.year
      FROM eo_simulations s
      LEFT JOIN tcf_eo_parties p ON s.partie_id = p.id
      LEFT JOIN tcf_eo_months m ON p.month_id = m.id
      LEFT JOIN tcf_eo_years y ON m.year_id = y.id
      WHERE s.user_id = ? AND s.status = 'completed'
      ORDER BY s.completed_at DESC
    `, [studentId]);

    res.json({
      student: studentInfo,
      co: coAttempts,
      ee: eeAttempts,
      eo: eoAttempts
    });
  } catch (error) {
    console.error('GET /tcf-results/student/:studentId error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// GET /batch/:batchId - Get batch analytics
// ============================================================
router.get('/batch/:batchId', async (req, res) => {
  try {
    const batchId = parseInt(req.params.batchId);
    if (isNaN(batchId)) {
      return res.status(400).json({ error: 'Invalid batch ID' });
    }

    // Fetch batch meta
    const batchInfo = await req.db.get(`
      SELECT b.id, b.name, b.french_level, b.start_date, b.end_date,
             u.first_name as teacher_first_name, u.last_name as teacher_last_name, b.teacher_id
      FROM batches b
      LEFT JOIN users u ON b.teacher_id = u.id
      WHERE b.id = ?
    `, [batchId]);

    if (!batchInfo) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    // Auth check: if teacher, verify batch belongs to teacher
    if (req.user.role === 'teacher' && batchInfo.teacher_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get students in this batch
    const students = await req.db.all(`
      SELECT u.id, u.first_name, u.last_name, u.email, u.username
      FROM batch_students bs
      JOIN users u ON bs.student_id = u.id
      WHERE bs.batch_id = ?
      ORDER BY u.first_name ASC, u.last_name ASC
    `, [batchId]);

    if (students.length === 0) {
      return res.json({
        batch: batchInfo,
        students: [],
        analytics: {
          co: { avgScore: 0, totalAttempts: 0, levelDistribution: {} },
          ee: { avgScore: 0, totalAttempts: 0, levelDistribution: {} },
          eo: { avgScore: 0, totalAttempts: 0, levelDistribution: {} }
        }
      });
    }

    const studentIds = students.map(s => s.id);
    const placeholders = studentIds.map(() => '?').join(',');

    // Fetch attempts for all students in the batch
    const coAttempts = await req.db.all(`
      SELECT student_id, earned_points, total_points, score_percentage, cefr_level, completed_at
      FROM tcf_co_quiz_attempts
      WHERE student_id IN (${placeholders}) AND completed_at IS NOT NULL
    `, studentIds);

    const eeAttempts = await req.db.all(`
      SELECT student_id, average_score, overall_level, submitted_at
      FROM tcf_ee_simulations
      WHERE student_id IN (${placeholders}) AND status = 'completed'
    `, studentIds);

    const eoAttempts = await req.db.all(`
      SELECT user_id as student_id, overall_score, completed_at
      FROM eo_simulations
      WHERE user_id IN (${placeholders}) AND status = 'completed'
    `, studentIds);

    // Map attempts to students
    const coByStudent = {};
    const eeByStudent = {};
    const eoByStudent = {};

    studentIds.forEach(id => {
      coByStudent[id] = [];
      eeByStudent[id] = [];
      eoByStudent[id] = [];
    });

    coAttempts.forEach(a => coByStudent[a.student_id]?.push(a));
    eeAttempts.forEach(a => eeByStudent[a.student_id]?.push(a));
    eoAttempts.forEach(a => eoByStudent[a.student_id]?.push(a));

    // Calculate details per student
    const studentData = students.map(s => {
      const co = coByStudent[s.id] || [];
      const ee = eeByStudent[s.id] || [];
      const eo = eoByStudent[s.id] || [];

      // Average or best scores
      const coAvg = co.length ? Math.round(co.reduce((sum, a) => sum + parseFloat(a.score_percentage || 0), 0) / co.length) : null;
      const coBest = co.length ? Math.max(...co.map(a => parseFloat(a.score_percentage || 0))) : null;

      const eeAvg = ee.length ? Math.round((ee.reduce((sum, a) => sum + parseFloat(a.average_score || 0), 0) / ee.length) * 10) / 10 : null;
      const eeBest = ee.length ? Math.max(...ee.map(a => parseFloat(a.average_score || 0))) : null;

      const eoAvg = eo.length ? Math.round((eo.reduce((sum, a) => sum + parseFloat(a.overall_score || 0), 0) / eo.length) * 10) / 10 : null;
      const eoBest = eo.length ? Math.max(...eo.map(a => parseFloat(a.overall_score || 0))) : null;

      return {
        ...s,
        co: { attemptsCount: co.length, avgScore: coAvg, bestScore: coBest, latestAttempt: co[0]?.completed_at || null },
        ee: { attemptsCount: ee.length, avgScore: eeAvg, bestScore: eeBest, latestAttempt: ee[0]?.submitted_at || null },
        eo: { attemptsCount: eo.length, avgScore: eoAvg, bestScore: eoBest, latestAttempt: eo[0]?.completed_at || null }
      };
    });

    // Compute batch overall analytics
    const coScores = coAttempts.map(a => parseFloat(a.score_percentage || 0));
    const eeScores = eeAttempts.map(a => parseFloat(a.average_score || 0));
    const eoScores = eoAttempts.map(a => parseFloat(a.overall_score || 0));

    const coLevelDist = {};
    coAttempts.forEach(a => {
      if (a.cefr_level) coLevelDist[a.cefr_level] = (coLevelDist[a.cefr_level] || 0) + 1;
    });

    const eeLevelDist = {};
    eeAttempts.forEach(a => {
      if (a.overall_level) eeLevelDist[a.overall_level] = (eeLevelDist[a.overall_level] || 0) + 1;
    });

    const getCEFRFromScore = (score) => {
      if (score >= 16) return 'C2';
      if (score >= 14) return 'C1';
      if (score >= 12) return 'B2';
      if (score >= 10) return 'B1';
      if (score >= 6) return 'A2';
      return 'A1';
    };

    const eoLevelDist = {};
    eoAttempts.forEach(a => {
      const level = getCEFRFromScore(parseFloat(a.overall_score || 0));
      eoLevelDist[level] = (eoLevelDist[level] || 0) + 1;
    });

    const analytics = {
      co: {
        avgScore: coScores.length ? Math.round(coScores.reduce((sum, s) => sum + s, 0) / coScores.length) : 0,
        totalAttempts: coAttempts.length,
        levelDistribution: coLevelDist
      },
      ee: {
        avgScore: eeScores.length ? Math.round((eeScores.reduce((sum, s) => sum + s, 0) / eeScores.length) * 10) / 10 : 0,
        totalAttempts: eeAttempts.length,
        levelDistribution: eeLevelDist
      },
      eo: {
        avgScore: eoScores.length ? Math.round((eoScores.reduce((sum, s) => sum + s, 0) / eoScores.length) * 10) / 10 : 0,
        totalAttempts: eoAttempts.length,
        levelDistribution: eoLevelDist
      }
    };

    res.json({
      batch: batchInfo,
      students: studentData,
      analytics
    });
  } catch (error) {
    console.error('GET /tcf-results/batch/:batchId error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
