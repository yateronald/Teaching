const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { authenticateToken } = require('../middleware/auth');
const { getKDriveService } = require('../services/kdriveService');
const { checkExamAccess, hasAnyActiveAssignmentForCategory } = require('../services/examAccessService');

const router = express.Router();

// Multer config for CO audio/image uploads (temp storage, then uploaded to kDrive)
const coUpload = multer({
  dest: os.tmpdir(),
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB per file
  fileFilter: (_req, file, cb) => {
    const audioExts = /mp3|wav|ogg|m4a|webm/;
    const imageExts = /jpg|jpeg|png|gif|webp/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    if (file.fieldname === 'audio' && audioExts.test(ext)) return cb(null, true);
    if (file.fieldname === 'intro_audio' && audioExts.test(ext)) return cb(null, true);
    if (file.fieldname === 'image' && imageExts.test(ext)) return cb(null, true);
    // Bulk import: audio_N and image_N field names
    if (/^audio_\d+$/.test(file.fieldname) && audioExts.test(ext)) return cb(null, true);
    if (/^image_\d+$/.test(file.fieldname) && imageExts.test(ext)) return cb(null, true);
    cb(new Error(`File type not allowed for field "${file.fieldname}": .${ext}`));
  },
});

/** Helper: clean up temp file */
function cleanTemp(filePath) {
  try { if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch {}
}

// All TCF endpoints require authentication
router.use(authenticateToken);

// ============================================================
// Helper: Admin-only guard
// ============================================================
function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
  }
  next();
}

// ============================================================
// CATEGORY ENDPOINTS
// ============================================================

// GET /categories — list all categories ordered by display_order, include series count
router.get('/categories', async (req, res) => {
  try {
    const categories = await req.db.all(`
      SELECT c.id, c.name, c.description, c.icon, c.display_order, c.created_at, c.updated_at,
        COALESCE(s.series_count, 0)::int AS series_count,
        COALESCE(s.question_count, 0)::int AS question_count,
        COALESCE(s.sub_count, 0)::int AS sub_count
      FROM tcf_categories c
      LEFT JOIN (
        -- series_count: CE/CO series or EE/EO years · question_count: CE/CO questions · sub_count: EE combinaisons / EO parties
        SELECT category_id, COUNT(*) AS series_count, COALESCE(SUM(total_questions), 0) AS question_count, 0 AS sub_count FROM tcf_ce_series GROUP BY category_id
        UNION ALL
        SELECT category_id, COUNT(*), COALESCE(SUM(total_questions), 0), 0 FROM tcf_co_series GROUP BY category_id
        UNION ALL
        SELECT y.category_id, COUNT(DISTINCT y.id), 0, COUNT(cb.id)
          FROM tcf_ee_years y LEFT JOIN tcf_ee_months m ON m.year_id = y.id LEFT JOIN tcf_ee_combinaisons cb ON cb.month_id = m.id
          GROUP BY y.category_id
        UNION ALL
        SELECT y.category_id, COUNT(DISTINCT y.id), 0, COUNT(p.id)
          FROM tcf_eo_years y LEFT JOIN tcf_eo_months m ON m.year_id = y.id LEFT JOIN tcf_eo_parties p ON p.month_id = m.id
          GROUP BY y.category_id
      ) s ON s.category_id = c.id
      ORDER BY c.display_order ASC, c.id ASC
    `);
    res.json(categories);
  } catch (error) {
    console.error('GET /categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /categories — create a new category
router.post('/categories', adminOnly, async (req, res) => {
  try {
    const { name, description, icon } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Validation failed', details: ['name is required'] });
    }

    // Check for duplicate name
    const existing = await req.db.get(
      'SELECT id FROM tcf_categories WHERE name = ?',
      [name.trim()]
    );
    if (existing) {
      return res.status(409).json({ error: 'A category with this name already exists' });
    }

    // Get next display_order
    const maxOrder = await req.db.get('SELECT COALESCE(MAX(display_order), 0) AS max_order FROM tcf_categories');
    const nextOrder = (maxOrder.max_order || 0) + 1;

    const result = await req.db.run(
      'INSERT INTO tcf_categories (name, description, icon, display_order) VALUES (?, ?, ?, ?) RETURNING id',
      [name.trim(), description || null, icon || null, nextOrder]
    );

    const category = await req.db.get('SELECT * FROM tcf_categories WHERE id = ?', [result.rows[0].id]);
    res.status(201).json(category);
  } catch (error) {
    console.error('POST /categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /categories/:id — update category
router.put('/categories/:id', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon } = req.body;

    const existing = await req.db.get('SELECT * FROM tcf_categories WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Category not found' });
    }

    if (name !== undefined && (!name || !name.trim())) {
      return res.status(400).json({ error: 'Validation failed', details: ['name cannot be empty'] });
    }

    // Check for duplicate name if changing
    if (name && name.trim() !== existing.name) {
      const dup = await req.db.get(
        'SELECT id FROM tcf_categories WHERE name = ? AND id != ?',
        [name.trim(), id]
      );
      if (dup) {
        return res.status(409).json({ error: 'A category with this name already exists' });
      }
    }

    await req.db.run(
      `UPDATE tcf_categories SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        icon = COALESCE(?, icon),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [name ? name.trim() : null, description !== undefined ? description : null, icon !== undefined ? icon : null, id]
    );

    const updated = await req.db.get('SELECT * FROM tcf_categories WHERE id = ?', [id]);
    res.json(updated);
  } catch (error) {
    console.error('PUT /categories/:id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /categories/:id — delete category (cascade)
router.delete('/categories/:id', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await req.db.get('SELECT id FROM tcf_categories WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await req.db.run('DELETE FROM tcf_categories WHERE id = ?', [id]);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('DELETE /categories/:id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// SERIES ENDPOINTS (CE-specific)
// ============================================================

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

// Validate CEFR thresholds: must have all 6 keys with ascending numeric values
function validateCefrThresholds(thresholds) {
  if (!thresholds || typeof thresholds !== 'object') {
    return 'cefr_thresholds must be a JSON object';
  }
  for (const level of CEFR_LEVELS) {
    if (!(level in thresholds)) {
      return `cefr_thresholds must include key "${level}"`;
    }
    if (typeof thresholds[level] !== 'number' || thresholds[level] < 0) {
      return `cefr_thresholds.${level} must be a non-negative number`;
    }
  }
  // Check ascending order: A1 <= A2 <= B1 <= B2 <= C1 <= C2
  for (let i = 1; i < CEFR_LEVELS.length; i++) {
    if (thresholds[CEFR_LEVELS[i]] < thresholds[CEFR_LEVELS[i - 1]]) {
      return 'cefr_thresholds values must be in ascending order (A1 ≤ A2 ≤ B1 ≤ B2 ≤ C1 ≤ C2)';
    }
  }
  return null;
}

// GET /categories/:categoryId/series — list series with question counts, total points, CEFR distribution
router.get('/categories/:categoryId/series', async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Verify category exists
    const category = await req.db.get('SELECT id FROM tcf_categories WHERE id = ?', [categoryId]);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const series = await req.db.all(`
      SELECT s.id, s.category_id, s.name, s.description, s.duration_minutes,
        s.total_questions, s.total_points, s.cefr_thresholds,
        s.created_by, s.created_at, s.updated_at
      FROM tcf_ce_series s
      WHERE s.category_id = ?
      ORDER BY s.created_at DESC
    `, [categoryId]);

    // CEFR distribution of every series in one grouped query (was one query per series)
    const distributionOf = await cefrDistributionsFor(req.db, 'tcf_ce_questions', 'tcf_ce_series', categoryId);
    for (const s of series) s.cefr_distribution = distributionOf(s.id);

    res.json(series);
  } catch (error) {
    console.error('GET /categories/:categoryId/series error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /categories/:categoryId/series — create series
router.post('/categories/:categoryId/series', adminOnly, async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, description, duration_minutes, cefr_thresholds } = req.body;

    // Verify category exists
    const category = await req.db.get('SELECT id FROM tcf_categories WHERE id = ?', [categoryId]);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Validate required fields
    const errors = [];
    if (!name || !name.trim()) errors.push('name is required');
    if (duration_minutes === undefined || duration_minutes === null) {
      errors.push('duration_minutes is required');
    } else if (!Number.isInteger(duration_minutes) || duration_minutes < 1) {
      errors.push('duration_minutes must be an integer >= 1');
    }

    const thresholdError = validateCefrThresholds(cefr_thresholds);
    if (thresholdError) errors.push(thresholdError);

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    const result = await req.db.run(
      `INSERT INTO tcf_ce_series (category_id, name, description, duration_minutes, cefr_thresholds, created_by)
       VALUES (?, ?, ?, ?, ?, ?) RETURNING id`,
      [categoryId, name.trim(), description || null, duration_minutes, JSON.stringify(cefr_thresholds), req.user.id]
    );

    const newSeries = await req.db.get('SELECT * FROM tcf_ce_series WHERE id = ?', [result.rows[0].id]);
    newSeries.cefr_distribution = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
    res.status(201).json(newSeries);
  } catch (error) {
    console.error('POST /categories/:categoryId/series error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /series/:id — get series with all questions ordered by question_order
router.get('/series/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const series = await req.db.get('SELECT * FROM tcf_ce_series WHERE id = ?', [id]);
    if (!series) {
      return res.status(404).json({ error: 'Series not found' });
    }

    // Get questions ordered by question_order
    const questions = await req.db.all(`
      SELECT id, question_order, image_url, question_text,
        option_a, option_b, option_c, option_d,
        correct_answer, cefr_level, points, created_at, updated_at
      FROM tcf_ce_questions
      WHERE series_id = ?
      ORDER BY question_order ASC
    `, [id]);

    // Compute CEFR distribution
    const distribution = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
    for (const q of questions) {
      if (distribution.hasOwnProperty(q.cefr_level)) {
        distribution[q.cefr_level]++;
      }
    }

    series.cefr_distribution = distribution;
    series.questions = questions;
    res.json(series);
  } catch (error) {
    console.error('GET /series/:id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /series/:id — update series
router.put('/series/:id', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, duration_minutes, cefr_thresholds } = req.body;

    const existing = await req.db.get('SELECT * FROM tcf_ce_series WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Series not found' });
    }

    const errors = [];
    if (name !== undefined && (!name || !name.trim())) errors.push('name cannot be empty');
    if (duration_minutes !== undefined) {
      if (!Number.isInteger(duration_minutes) || duration_minutes < 1) {
        errors.push('duration_minutes must be an integer >= 1');
      }
    }
    if (cefr_thresholds !== undefined) {
      const thresholdError = validateCefrThresholds(cefr_thresholds);
      if (thresholdError) errors.push(thresholdError);
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    await req.db.run(
      `UPDATE tcf_ce_series SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        duration_minutes = COALESCE(?, duration_minutes),
        cefr_thresholds = COALESCE(?, cefr_thresholds),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        name ? name.trim() : null,
        description !== undefined ? description : null,
        duration_minutes !== undefined ? duration_minutes : null,
        cefr_thresholds ? JSON.stringify(cefr_thresholds) : null,
        id
      ]
    );

    const updated = await req.db.get('SELECT * FROM tcf_ce_series WHERE id = ?', [id]);

    // Compute CEFR distribution
    const dist = await req.db.all(`
      SELECT cefr_level, COUNT(*) AS count
      FROM tcf_ce_questions WHERE series_id = ?
      GROUP BY cefr_level
    `, [id]);
    const distribution = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
    for (const row of dist) {
      distribution[row.cefr_level] = parseInt(row.count, 10);
    }
    updated.cefr_distribution = distribution;

    res.json(updated);
  } catch (error) {
    console.error('PUT /series/:id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /series/:id — delete series (cascade)
router.delete('/series/:id', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await req.db.get('SELECT id FROM tcf_ce_series WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Series not found' });
    }

    await req.db.run('DELETE FROM tcf_ce_series WHERE id = ?', [id]);
    res.json({ message: 'Series deleted successfully' });
  } catch (error) {
    console.error('DELETE /series/:id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// QUESTION ENDPOINTS
// ============================================================

const VALID_ANSWERS = ['A', 'B', 'C', 'D'];

// Helper: recalculate series totals after question changes
async function recalculateSeriesCounters(db, seriesId) {
  const stats = await db.get(`
    SELECT COUNT(*) AS total_questions, COALESCE(SUM(points), 0) AS total_points
    FROM tcf_ce_questions WHERE series_id = ?
  `, [seriesId]);

  await db.run(
    `UPDATE tcf_ce_series SET total_questions = ?, total_points = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [parseInt(stats.total_questions, 10), parseFloat(stats.total_points), seriesId]
  );
}

// Helper: reindex question_order to be contiguous 1..N
async function reindexQuestions(db, seriesId) {
  await db.run(`
    UPDATE tcf_ce_questions q SET question_order = r.rn
    FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY question_order ASC, id ASC) AS rn FROM tcf_ce_questions WHERE series_id = $1) r
    WHERE q.id = r.id AND q.question_order IS DISTINCT FROM r.rn
  `, [seriesId]);
}

// CEFR distribution of every series in a category — one grouped query.
// Table names are fixed by the callers, never user input.
async function cefrDistributionsFor(db, questionTable, seriesTable, categoryId) {
  const rows = await db.all(`
    SELECT q.series_id, q.cefr_level, COUNT(*)::int AS count
    FROM ${questionTable} q JOIN ${seriesTable} s ON s.id = q.series_id
    WHERE s.category_id = $1
    GROUP BY q.series_id, q.cefr_level
  `, [categoryId]);
  const empty = () => ({ A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 });
  const bySeries = {};
  for (const r of rows) {
    if (!bySeries[r.series_id]) bySeries[r.series_id] = empty();
    bySeries[r.series_id][r.cefr_level] = r.count;
  }
  return id => bySeries[id] || empty();
}

// Set question_order for many questions in one statement. items: [{ id, question_order }]
async function bulkSetQuestionOrder(db, table, items) {
  if (!items.length) return;
  const params = [];
  const values = items.map(item => {
    params.push(item.id, item.question_order);
    return `($${params.length - 1}::int, $${params.length}::int)`;
  });
  await db.run(`
    UPDATE ${table} q SET question_order = v.ord, updated_at = CURRENT_TIMESTAMP
    FROM (VALUES ${values.join(', ')}) AS v(id, ord)
    WHERE q.id = v.id
  `, params);
}

// Validate question fields
function validateQuestion(body) {
  const errors = [];
  const { question_text, option_a, option_b, option_c, option_d, correct_answer, cefr_level, points } = body;

  if (!question_text || !question_text.trim()) errors.push('question_text is required');
  if (!option_a || !option_a.trim()) errors.push('option_a is required');
  if (!option_b || !option_b.trim()) errors.push('option_b is required');
  if (!option_c || !option_c.trim()) errors.push('option_c is required');
  if (!option_d || !option_d.trim()) errors.push('option_d is required');
  if (!correct_answer || !VALID_ANSWERS.includes(correct_answer)) {
    errors.push('correct_answer must be one of A, B, C, D');
  }
  if (!cefr_level || !CEFR_LEVELS.includes(cefr_level)) {
    errors.push('cefr_level must be one of A1, A2, B1, B2, C1, C2');
  }
  if (points === undefined || points === null) {
    errors.push('points is required');
  } else if (typeof points !== 'number' || points < 0) {
    errors.push('points must be a number >= 0');
  }

  return errors;
}

// POST /series/:id/questions — add question to series
router.post('/series/:id/questions', adminOnly, coUpload.fields([{ name: 'image', maxCount: 1 }]), async (req, res) => {
  const tempFiles = [];
  try {
    const { id } = req.params;

    const series = await req.db.get('SELECT id FROM tcf_ce_series WHERE id = ?', [id]);
    if (!series) {
      return res.status(404).json({ error: 'Series not found' });
    }

    const errors = validateQuestion(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    const { question_text, option_a, option_b, option_c, option_d, correct_answer, cefr_level, points } = req.body;

    // Handle image upload to kDrive
    let imageUrl = null;
    const imageFile = req.files?.image?.[0];
    if (imageFile) {
      tempFiles.push(imageFile.path);
      try {
        const kdriveService = getKDriveService();
        if (kdriveService.isConfigured) {
          const ceFolder = await kdriveService.getOrCreateFolder(kdriveService.rootFolderId, 'TCF_CE_Resources');
          const folderId = ceFolder ? ceFolder.id : kdriveService.rootFolderId;
          const uploaded = await kdriveService.uploadFile(imageFile.path, folderId, imageFile.originalname);
          if (uploaded && uploaded.id) {
            const protocol = req.protocol;
            const host = req.get('host');
            const ext = path.extname(imageFile.originalname) || '';
            imageUrl = `${protocol}://${host}/api/tcf/kdrive/${uploaded.id}/stream?ext=${ext}`;
          }
        }
      } catch (e) {
        console.error('CE question image upload error:', e);
      }
    }

    // Get next question_order
    const maxOrder = await req.db.get(
      'SELECT COALESCE(MAX(question_order), 0) AS max_order FROM tcf_ce_questions WHERE series_id = ?',
      [id]
    );
    const nextOrder = maxOrder.max_order + 1;

    const result = await req.db.run(
      `INSERT INTO tcf_ce_questions (series_id, question_order, image_url, question_text, option_a, option_b, option_c, option_d, correct_answer, cefr_level, points)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
      [id, nextOrder, imageUrl, question_text.trim(), option_a.trim(), option_b.trim(), option_c.trim(), option_d.trim(), correct_answer, cefr_level, points]
    );

    // Update series counters
    await recalculateSeriesCounters(req.db, id);

    const question = await req.db.get('SELECT * FROM tcf_ce_questions WHERE id = ?', [result.rows[0].id]);
    res.status(201).json(question);
  } catch (error) {
    console.error('POST /series/:id/questions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    tempFiles.forEach(cleanTemp);
  }
});

// PUT /questions/:id — update question
router.put('/questions/:id', adminOnly, coUpload.fields([{ name: 'image', maxCount: 1 }]), async (req, res) => {
  const tempFiles = [];
  try {
    const { id } = req.params;

    const existing = await req.db.get('SELECT * FROM tcf_ce_questions WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const errors = validateQuestion(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    const { question_text, option_a, option_b, option_c, option_d, correct_answer, cefr_level, points } = req.body;

    // Handle image upload to kDrive (or keep existing)
    let imageUrl = existing.image_url; // keep existing by default
    const imageFile = req.files?.image?.[0];
    if (imageFile) {
      tempFiles.push(imageFile.path);
      try {
        const kdriveService = getKDriveService();
        if (kdriveService.isConfigured) {
          const ceFolder = await kdriveService.getOrCreateFolder(kdriveService.rootFolderId, 'TCF_CE_Resources');
          const folderId = ceFolder ? ceFolder.id : kdriveService.rootFolderId;
          const uploaded = await kdriveService.uploadFile(imageFile.path, folderId, imageFile.originalname);
          if (uploaded && uploaded.id) {
            const protocol = req.protocol;
            const host = req.get('host');
            const ext = path.extname(imageFile.originalname) || '';
            imageUrl = `${protocol}://${host}/api/tcf/kdrive/${uploaded.id}/stream?ext=${ext}`;
          }
        }
      } catch (e) {
        console.error('CE question image update error:', e);
      }
    }
    // If remove_image flag is sent, clear the image
    if (req.body.remove_image === 'true') {
      imageUrl = null;
    }

    await req.db.run(
      `UPDATE tcf_ce_questions SET
        question_text = ?, image_url = ?, option_a = ?, option_b = ?, option_c = ?, option_d = ?,
        correct_answer = ?, cefr_level = ?, points = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [question_text.trim(), imageUrl, option_a.trim(), option_b.trim(), option_c.trim(), option_d.trim(), correct_answer, cefr_level, points, id]
    );

    // Recalculate series totals (points may have changed)
    await recalculateSeriesCounters(req.db, existing.series_id);

    const updated = await req.db.get('SELECT * FROM tcf_ce_questions WHERE id = ?', [id]);
    res.json(updated);
  } catch (error) {
    console.error('PUT /questions/:id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    tempFiles.forEach(cleanTemp);
  }
});

// DELETE /questions/:id — delete question, reindex remaining, update series totals
router.delete('/questions/:id', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await req.db.get('SELECT id, series_id FROM tcf_ce_questions WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const seriesId = existing.series_id;

    await req.db.run('DELETE FROM tcf_ce_questions WHERE id = ?', [id]);

    // Reindex remaining questions to be contiguous 1..N
    await reindexQuestions(req.db, seriesId);

    // Update series counters
    await recalculateSeriesCounters(req.db, seriesId);

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('DELETE /questions/:id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /series/:id/questions/reorder — bulk update question order
router.put('/series/:id/questions/reorder', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { questions } = req.body;

    const series = await req.db.get('SELECT id FROM tcf_ce_series WHERE id = ?', [id]);
    if (!series) {
      return res.status(404).json({ error: 'Series not found' });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'Validation failed', details: ['questions must be a non-empty array of {id, question_order}'] });
    }

    // Validate all IDs belong to this series
    const existingQuestions = await req.db.all(
      'SELECT id FROM tcf_ce_questions WHERE series_id = ?',
      [id]
    );
    const existingIds = new Set(existingQuestions.map(q => q.id));

    for (const item of questions) {
      if (!item.id || !existingIds.has(item.id)) {
        return res.status(400).json({ error: 'Validation failed', details: [`Question ID ${item.id} does not belong to this series`] });
      }
      if (!Number.isInteger(item.question_order) || item.question_order < 1) {
        return res.status(400).json({ error: 'Validation failed', details: ['question_order must be a positive integer'] });
      }
    }

    await bulkSetQuestionOrder(req.db, 'tcf_ce_questions', questions);

    const updated = await req.db.all(
      'SELECT * FROM tcf_ce_questions WHERE series_id = ? ORDER BY question_order ASC',
      [id]
    );
    res.json(updated);
  } catch (error) {
    console.error('PUT /series/:id/questions/reorder error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// CE BULK IMPORT ENDPOINT
// ============================================================

// POST /series/bulk-import — import a full CE series from JSON data
router.post('/series/bulk-import', adminOnly, coUpload.any(), async (req, res) => {
  let uploadedFiles = [];
  try {
    let series_data, questions_data;
    try {
      series_data = JSON.parse(req.body.series_data);
      questions_data = JSON.parse(req.body.questions_data);
    } catch (e) {
      return res.status(400).json({ error: 'Validation failed', details: ['Invalid JSON format in form data'] });
    }

    if (!series_data || !questions_data) {
      return res.status(400).json({ error: 'Validation failed', details: ['series_data and questions_data are required'] });
    }

    // Validate series data
    const errors = [];
    if (!series_data.name || !series_data.name.trim()) errors.push('series name is required');
    if (!series_data.category_id) errors.push('category_id is required');
    const durationMinutes = parseInt(series_data.duration_minutes, 10);
    if (isNaN(durationMinutes) || durationMinutes < 1) errors.push('duration_minutes must be an integer >= 1');
    const thresholdError = validateCefrThresholds(series_data.cefr_thresholds);
    if (thresholdError) errors.push(thresholdError);
    if (!Array.isArray(questions_data) || questions_data.length === 0) errors.push('questions_data must be a non-empty array');
    if (errors.length > 0) return res.status(400).json({ error: 'Validation failed', details: errors });

    // Group files by fieldname
    const filesByField = {};
    if (req.files) {
      for (const f of req.files) {
        filesByField[f.fieldname] = f;
        uploadedFiles.push(f.path);
      }
    }

    // Verify category exists
    const category = await req.db.get('SELECT id FROM tcf_categories WHERE id = ?', [series_data.category_id]);
    if (!category) return res.status(404).json({ error: 'Category not found' });

    // Get KDrive service
    const kdriveService = getKDriveService();
    let folderId = kdriveService.rootFolderId;
    if (kdriveService.isConfigured) {
      try {
        const ceFolder = await kdriveService.getOrCreateFolder(kdriveService.rootFolderId, 'TCF_CE_Resources');
        if (ceFolder) folderId = ceFolder.id;
      } catch (err) {
        console.error('Failed to create CE bulk folder:', err);
      }
    }

    // Create the series
    const seriesResult = await req.db.run(
      `INSERT INTO tcf_ce_series (category_id, name, description, duration_minutes, cefr_thresholds, total_points, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id`,
      [series_data.category_id, series_data.name.trim(), series_data.description || null,
       durationMinutes, JSON.stringify(series_data.cefr_thresholds),
       parseInt(series_data.total_points, 10) || 0,
       req.user.id]
    );
    const seriesId = seriesResult.rows[0].id;

    // Insert each question
    const insertedQuestions = [];
    for (let i = 0; i < questions_data.length; i++) {
      const q = questions_data[i];
      const qNum = q.number || (i + 1);
      const questionOrder = i + 1;

      let imageUrl = q.image_url || null;

      if (filesByField[`image_${qNum}`] && folderId) {
        const file = filesByField[`image_${qNum}`];
        try {
          const uploaded = await kdriveService.uploadFile(file.path, folderId, file.originalname);
          if (uploaded && uploaded.id) {
            const protocol = req.protocol;
            const host = req.get('host');
            const ext = path.extname(file.originalname) || '';
            imageUrl = `${protocol}://${host}/api/tcf/kdrive/${uploaded.id}/stream?ext=${ext}`;
          }
        } catch (e) {
          console.error('Upload image failed for question', qNum, e);
        }
      }

      const result = await req.db.run(
        `INSERT INTO tcf_ce_questions (series_id, question_order, image_url, question_text, option_a, option_b, option_c, option_d, correct_answer, cefr_level, points)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
        [seriesId, questionOrder, imageUrl,
         (q.prompt || q.question_text || '').trim(),
         (q.options?.A || q.option_a || 'A').trim(),
         (q.options?.B || q.option_b || 'B').trim(),
         (q.options?.C || q.option_c || 'C').trim(),
         (q.options?.D || q.option_d || 'D').trim(),
         q.correct_letter || q.correct_answer || 'A',
         q.level || q.cefr_level || 'A1',
         parseFloat(q.points) || 0]
      );
      insertedQuestions.push({ id: result.rows[0].id, number: qNum });
    }


    // Recalculate series counters
    await recalculateSeriesCounters(req.db, seriesId);

    // Fetch the created series with questions
    const newSeries = await req.db.get('SELECT * FROM tcf_ce_series WHERE id = ?', [seriesId]);
    const questions = await req.db.all('SELECT * FROM tcf_ce_questions WHERE series_id = ? ORDER BY question_order ASC', [seriesId]);
    const dist = await req.db.all('SELECT cefr_level, COUNT(*) AS count FROM tcf_ce_questions WHERE series_id = ? GROUP BY cefr_level', [seriesId]);
    const distribution = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
    for (const row of dist) distribution[row.cefr_level] = parseInt(row.count, 10);
    newSeries.cefr_distribution = distribution;
    newSeries.questions = questions;

    res.status(201).json({ series: newSeries, imported_questions: insertedQuestions.length });
  } catch (error) {
    console.error('POST /series/bulk-import error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  } finally {
    uploadedFiles.forEach(cleanTemp);
  }
});

// GET /kdrive/:fileId/stream — stream any file from kDrive by ID (used for CE images)
router.get('/kdrive/:fileId/stream', async (req, res) => {
  try {
    const { fileId } = req.params;
    const kdrive = getKDriveService();
    if (!kdrive.isConfigured) return res.status(500).json({ error: 'kDrive not configured' });
    
    // Attempt to guess mime type from a query param if provided, otherwise generic
    const ext = req.query.ext || '';
    const mimeMap = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp' };
    res.setHeader('Content-Type', mimeMap[ext.toLowerCase()] || 'image/png'); // Default to png since it's mostly images
    
    await kdrive.streamFile(fileId, res, req.headers, 'inline', `image${ext}`);
  } catch (error) {
    console.error('GET /kdrive/:fileId/stream error:', error);
    if (!res.headersSent) res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// ASSIGNMENT ENDPOINTS
// ============================================================

// POST /series/:id/assign — assign series to student or batch
router.post('/series/:id/assign', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { student_id, batch_id } = req.body;

    const series = await req.db.get('SELECT id FROM tcf_ce_series WHERE id = ?', [id]);
    if (!series) {
      return res.status(404).json({ error: 'Series not found' });
    }

    // Exactly one of student_id or batch_id must be provided
    if ((!student_id && !batch_id) || (student_id && batch_id)) {
      return res.status(400).json({ error: 'Validation failed', details: ['Exactly one of student_id or batch_id must be provided'] });
    }

    try {
      const result = await req.db.run(
        `INSERT INTO tcf_ce_series_assignments (series_id, student_id, batch_id)
         VALUES (?, ?, ?) RETURNING id`,
        [id, student_id || null, batch_id || null]
      );

      const assignment = await req.db.get('SELECT * FROM tcf_ce_series_assignments WHERE id = ?', [result.rows[0].id]);
      res.status(201).json(assignment);
    } catch (err) {
      // Unique constraint violation = duplicate assignment
      if (err.code === '23505') {
        return res.status(409).json({ error: 'Assignment already exists' });
      }
      throw err;
    }
  } catch (error) {
    console.error('POST /series/:id/assign error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /series/:id/assignments — list assignments with student/batch details
router.get('/series/:id/assignments', async (req, res) => {
  try {
    const { id } = req.params;

    const series = await req.db.get('SELECT id FROM tcf_ce_series WHERE id = ?', [id]);
    if (!series) {
      return res.status(404).json({ error: 'Series not found' });
    }

    const assignments = await req.db.all(`
      SELECT a.id, a.series_id, a.student_id, a.batch_id, a.assigned_at,
        u.first_name AS student_first_name, u.last_name AS student_last_name, u.email AS student_email,
        b.name AS batch_name
      FROM tcf_ce_series_assignments a
      LEFT JOIN users u ON a.student_id = u.id
      LEFT JOIN batches b ON a.batch_id = b.id
      WHERE a.series_id = ?
      ORDER BY a.assigned_at DESC
    `, [id]);

    res.json(assignments);
  } catch (error) {
    console.error('GET /series/:id/assignments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /assignments/:id — remove series assignment
router.delete('/assignments/:id', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await req.db.get('SELECT id FROM tcf_ce_series_assignments WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    await req.db.run('DELETE FROM tcf_ce_series_assignments WHERE id = ?', [id]);
    res.json({ message: 'Assignment removed successfully' });
  } catch (error) {
    console.error('DELETE /assignments/:id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /categories/:id/assign — assign category to student or batch
router.post('/categories/:id/assign', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { student_id, batch_id } = req.body;

    const category = await req.db.get('SELECT id FROM tcf_categories WHERE id = ?', [id]);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Exactly one of student_id or batch_id must be provided
    if ((!student_id && !batch_id) || (student_id && batch_id)) {
      return res.status(400).json({ error: 'Validation failed', details: ['Exactly one of student_id or batch_id must be provided'] });
    }

    try {
      const result = await req.db.run(
        `INSERT INTO tcf_category_assignments (category_id, student_id, batch_id)
         VALUES (?, ?, ?) RETURNING id`,
        [id, student_id || null, batch_id || null]
      );

      const assignment = await req.db.get('SELECT * FROM tcf_category_assignments WHERE id = ?', [result.rows[0].id]);
      res.status(201).json(assignment);
    } catch (err) {
      if (err.code === '23505') {
        return res.status(409).json({ error: 'Assignment already exists' });
      }
      throw err;
    }
  } catch (error) {
    console.error('POST /categories/:id/assign error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /categories/:id/assignments — list category assignments with details
router.get('/categories/:id/assignments', async (req, res) => {
  try {
    const { id } = req.params;

    const category = await req.db.get('SELECT id FROM tcf_categories WHERE id = ?', [id]);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const assignments = await req.db.all(`
      SELECT a.id, a.category_id, a.student_id, a.batch_id, a.assigned_at,
        u.first_name AS student_first_name, u.last_name AS student_last_name, u.email AS student_email,
        b.name AS batch_name
      FROM tcf_category_assignments a
      LEFT JOIN users u ON a.student_id = u.id
      LEFT JOIN batches b ON a.batch_id = b.id
      WHERE a.category_id = ?
      ORDER BY a.assigned_at DESC
    `, [id]);

    res.json(assignments);
  } catch (error) {
    console.error('GET /categories/:id/assignments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /category-assignments/:id — remove category assignment
router.delete('/category-assignments/:id', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await req.db.get('SELECT id FROM tcf_category_assignments WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    await req.db.run('DELETE FROM tcf_category_assignments WHERE id = ?', [id]);
    res.json({ message: 'Category assignment removed successfully' });
  } catch (error) {
    console.error('DELETE /category-assignments/:id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// CO (Compréhension Orale) SERIES ENDPOINTS
// ============================================================

// Helper: get or create the TCF CO kDrive folder
let coFolderId = null;
async function getCoFolderId() {
  if (coFolderId) return coFolderId;
  const kdrive = getKDriveService();
  if (!kdrive.isConfigured) throw new Error('kDrive is not configured');
  const folder = await kdrive.getOrCreateFolder(kdrive.rootFolderId, 'TCF_CO_Audio');
  coFolderId = folder.id;
  return coFolderId;
}

// GET /co/categories/:categoryId/series
router.get('/co/categories/:categoryId/series', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await req.db.get('SELECT id FROM tcf_categories WHERE id = ?', [categoryId]);
    if (!category) return res.status(404).json({ error: 'Category not found' });

    const series = await req.db.all(`
      SELECT s.id, s.category_id, s.name, s.description, s.duration_minutes,
        s.total_questions, s.total_points, s.cefr_thresholds,
        s.intro_audio_kdrive_file_id, s.intro_audio_file_name,
        s.created_by, s.created_at, s.updated_at
      FROM tcf_co_series s WHERE s.category_id = ? ORDER BY s.created_at DESC
    `, [categoryId]);

    const distributionOf = await cefrDistributionsFor(req.db, 'tcf_co_questions', 'tcf_co_series', categoryId);
    for (const s of series) s.cefr_distribution = distributionOf(s.id);
    res.json(series);
  } catch (error) {
    console.error('GET /co/categories/:categoryId/series error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /co/categories/:categoryId/series
router.post('/co/categories/:categoryId/series', adminOnly, coUpload.fields([
  { name: 'intro_audio', maxCount: 1 },
]), async (req, res) => {
  const introAudioFile = req.files?.intro_audio?.[0];
  try {
    const { categoryId } = req.params;
    const { name, description, duration_minutes: durationRaw } = req.body;
    const duration_minutes = durationRaw !== undefined && durationRaw !== null ? parseInt(durationRaw, 10) : undefined;

    // cefr_thresholds comes as a JSON string in form data
    let cefr_thresholds;
    try {
      cefr_thresholds = typeof req.body.cefr_thresholds === 'string'
        ? JSON.parse(req.body.cefr_thresholds)
        : req.body.cefr_thresholds;
    } catch {
      return res.status(400).json({ error: 'Validation failed', details: ['cefr_thresholds must be valid JSON'] });
    }

    const category = await req.db.get('SELECT id FROM tcf_categories WHERE id = ?', [categoryId]);
    if (!category) return res.status(404).json({ error: 'Category not found' });

    const errors = [];
    if (!name || !name.trim()) errors.push('name is required');
    if (duration_minutes === undefined || isNaN(duration_minutes)) errors.push('duration_minutes is required');
    else if (!Number.isInteger(duration_minutes) || duration_minutes < 1) errors.push('duration_minutes must be an integer >= 1');
    const thresholdError = validateCefrThresholds(cefr_thresholds);
    if (thresholdError) errors.push(thresholdError);
    if (errors.length > 0) return res.status(400).json({ error: 'Validation failed', details: errors });

    // Upload intro audio to kDrive if provided
    let introAudioKdriveFileId = null;
    let introAudioFileName = null;
    if (introAudioFile) {
      const kdrive = getKDriveService();
      const folderId = await getCoFolderId();
      const audioResult = await kdrive.uploadFile(introAudioFile.path, folderId, introAudioFile.originalname);
      if (!audioResult || !audioResult.id) return res.status(500).json({ error: 'Failed to upload intro audio to kDrive' });
      introAudioKdriveFileId = audioResult.id;
      introAudioFileName = introAudioFile.originalname;
    }

    const result = await req.db.run(
      `INSERT INTO tcf_co_series (category_id, name, description, duration_minutes, cefr_thresholds, created_by, intro_audio_kdrive_file_id, intro_audio_file_name)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
      [categoryId, name.trim(), description || null, duration_minutes, JSON.stringify(cefr_thresholds), req.user.id, introAudioKdriveFileId, introAudioFileName]
    );
    const newSeries = await req.db.get('SELECT * FROM tcf_co_series WHERE id = ?', [result.rows[0].id]);
    newSeries.cefr_distribution = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
    res.status(201).json(newSeries);
  } catch (error) {
    console.error('POST /co/categories/:categoryId/series error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    cleanTemp(introAudioFile?.path);
  }
});

// GET /co/series/:id
router.get('/co/series/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const series = await req.db.get('SELECT * FROM tcf_co_series WHERE id = ?', [id]);
    if (!series) return res.status(404).json({ error: 'Series not found' });

    const questions = await req.db.all(`
      SELECT id, question_order, audio_kdrive_file_id, audio_file_name,
        image_kdrive_file_id, image_file_name, question_text,
        option_a, option_b, option_c, option_d,
        correct_answer, cefr_level, points, created_at, updated_at
      FROM tcf_co_questions WHERE series_id = ? ORDER BY question_order ASC
    `, [id]);

    const distribution = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
    for (const q of questions) {
      if (distribution.hasOwnProperty(q.cefr_level)) distribution[q.cefr_level]++;
    }
    series.cefr_distribution = distribution;
    series.questions = questions;
    res.json(series);
  } catch (error) {
    console.error('GET /co/series/:id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /co/series/:id/intro-audio — stream intro audio from kDrive
router.get('/co/series/:id/intro-audio', async (req, res) => {
  try {
    const { id } = req.params;
    const series = await req.db.get('SELECT intro_audio_kdrive_file_id, intro_audio_file_name FROM tcf_co_series WHERE id = ?', [id]);
    if (!series || !series.intro_audio_kdrive_file_id) return res.status(404).json({ error: 'Intro audio not found' });

    const kdrive = getKDriveService();
    const ext = path.extname(series.intro_audio_file_name || '').toLowerCase();
    const mimeMap = { '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg', '.m4a': 'audio/mp4', '.webm': 'audio/webm' };
    res.setHeader('Content-Type', mimeMap[ext] || 'audio/mpeg');
    await kdrive.streamFile(series.intro_audio_kdrive_file_id, res, req.headers, 'inline', series.intro_audio_file_name || 'intro-audio');
  } catch (error) {
    console.error('GET /co/series/:id/intro-audio error:', error);
    if (!res.headersSent) res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /co/series/:id
router.put('/co/series/:id', adminOnly, coUpload.fields([
  { name: 'intro_audio', maxCount: 1 },
]), async (req, res) => {
  const introAudioFile = req.files?.intro_audio?.[0];
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const durationRaw = req.body.duration_minutes;
    const duration_minutes = durationRaw !== undefined && durationRaw !== null && durationRaw !== '' ? parseInt(durationRaw, 10) : undefined;

    // cefr_thresholds comes as a JSON string in form data
    let cefr_thresholds;
    if (req.body.cefr_thresholds !== undefined) {
      try {
        cefr_thresholds = typeof req.body.cefr_thresholds === 'string'
          ? JSON.parse(req.body.cefr_thresholds)
          : req.body.cefr_thresholds;
      } catch {
        return res.status(400).json({ error: 'Validation failed', details: ['cefr_thresholds must be valid JSON'] });
      }
    }

    const existing = await req.db.get('SELECT * FROM tcf_co_series WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'Series not found' });

    const errors = [];
    if (name !== undefined && (!name || !name.trim())) errors.push('name cannot be empty');
    if (duration_minutes !== undefined && (!Number.isInteger(duration_minutes) || duration_minutes < 1))
      errors.push('duration_minutes must be an integer >= 1');
    if (cefr_thresholds !== undefined) {
      const te = validateCefrThresholds(cefr_thresholds);
      if (te) errors.push(te);
    }
    if (errors.length > 0) return res.status(400).json({ error: 'Validation failed', details: errors });

    // Handle intro audio upload/replacement
    let introAudioKdriveFileId = existing.intro_audio_kdrive_file_id;
    let introAudioFileName = existing.intro_audio_file_name;
    if (introAudioFile) {
      const kdrive = getKDriveService();
      const folderId = await getCoFolderId();
      const audioResult = await kdrive.uploadFile(introAudioFile.path, folderId, introAudioFile.originalname);
      if (!audioResult || !audioResult.id) return res.status(500).json({ error: 'Failed to upload intro audio to kDrive' });
      // Delete old file if replacing
      if (existing.intro_audio_kdrive_file_id) {
        try { await kdrive.deleteFile(existing.intro_audio_kdrive_file_id); } catch {}
      }
      introAudioKdriveFileId = audioResult.id;
      introAudioFileName = introAudioFile.originalname;
    }

    await req.db.run(
      `UPDATE tcf_co_series SET name = COALESCE(?, name), description = COALESCE(?, description),
        duration_minutes = COALESCE(?, duration_minutes), cefr_thresholds = COALESCE(?, cefr_thresholds),
        intro_audio_kdrive_file_id = ?, intro_audio_file_name = ?,
        updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [name ? name.trim() : null, description !== undefined ? description : null,
       duration_minutes !== undefined ? duration_minutes : null,
       cefr_thresholds ? JSON.stringify(cefr_thresholds) : null,
       introAudioKdriveFileId, introAudioFileName, id]
    );

    const updated = await req.db.get('SELECT * FROM tcf_co_series WHERE id = ?', [id]);
    const dist = await req.db.all('SELECT cefr_level, COUNT(*) AS count FROM tcf_co_questions WHERE series_id = ? GROUP BY cefr_level', [id]);
    const distribution = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
    for (const row of dist) distribution[row.cefr_level] = parseInt(row.count, 10);
    updated.cefr_distribution = distribution;
    res.json(updated);
  } catch (error) {
    console.error('PUT /co/series/:id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    cleanTemp(introAudioFile?.path);
  }
});

// DELETE /co/series/:id — delete series + clean up all kDrive files
router.delete('/co/series/:id', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await req.db.get('SELECT id, intro_audio_kdrive_file_id FROM tcf_co_series WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'Series not found' });

    // Collect all kDrive file IDs to delete (questions audio + images + intro audio)
    const questions = await req.db.all(
      'SELECT audio_kdrive_file_id, image_kdrive_file_id FROM tcf_co_questions WHERE series_id = ?',
      [id]
    );

    const kdrive = getKDriveService();
    const fileIds = [];
    if (existing.intro_audio_kdrive_file_id) fileIds.push(existing.intro_audio_kdrive_file_id);
    for (const q of questions) {
      if (q.audio_kdrive_file_id) fileIds.push(q.audio_kdrive_file_id);
      if (q.image_kdrive_file_id) fileIds.push(q.image_kdrive_file_id);
    }

    // Delete from DB first (cascade removes questions + assignments)
    await req.db.run('DELETE FROM tcf_co_series WHERE id = ?', [id]);

    // Clean up kDrive files in background (don't block response)
    if (fileIds.length > 0) {
      Promise.all(fileIds.map(fid => kdrive.deleteFile(fid).catch(() => {}))).catch(() => {});
    }

    res.json({ message: 'Series deleted successfully' });
  } catch (error) {
    console.error('DELETE /co/series/:id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// CO QUESTION ENDPOINTS (with audio/image upload)
// ============================================================

async function recalculateCoSeriesCounters(db, seriesId) {
  const stats = await db.get(
    'SELECT COUNT(*) AS total_questions, COALESCE(SUM(points), 0) AS total_points FROM tcf_co_questions WHERE series_id = ?',
    [seriesId]
  );
  await db.run(
    'UPDATE tcf_co_series SET total_questions = ?, total_points = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [parseInt(stats.total_questions, 10), parseFloat(stats.total_points), seriesId]
  );
}

async function reindexCoQuestions(db, seriesId) {
  await db.run(`
    UPDATE tcf_co_questions q SET question_order = r.rn
    FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY question_order ASC, id ASC) AS rn FROM tcf_co_questions WHERE series_id = $1) r
    WHERE q.id = r.id AND q.question_order IS DISTINCT FROM r.rn
  `, [seriesId]);
}

// POST /co/series/:id/questions — add CO question with audio (required) + image (optional)
router.post('/co/series/:id/questions', adminOnly, coUpload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'image', maxCount: 1 },
]), async (req, res) => {
  const audioFile = req.files?.audio?.[0];
  const imageFile = req.files?.image?.[0];
  try {
    const { id } = req.params;
    const series = await req.db.get('SELECT id FROM tcf_co_series WHERE id = ?', [id]);
    if (!series) return res.status(404).json({ error: 'Series not found' });

    const { question_text, option_a, option_b, option_c, option_d, correct_answer, cefr_level, points } = req.body;
    const errors = [];
    if (!question_text || !question_text.trim()) errors.push('question_text is required');
    if (!option_a || !option_a.trim()) errors.push('option_a is required');
    if (!option_b || !option_b.trim()) errors.push('option_b is required');
    if (!option_c || !option_c.trim()) errors.push('option_c is required');
    if (!option_d || !option_d.trim()) errors.push('option_d is required');
    if (!correct_answer || !VALID_ANSWERS.includes(correct_answer)) errors.push('correct_answer must be one of A, B, C, D');
    if (!cefr_level || !CEFR_LEVELS.includes(cefr_level)) errors.push('cefr_level must be one of A1, A2, B1, B2, C1, C2');
    const numPoints = points !== undefined && points !== null ? parseFloat(points) : NaN;
    if (isNaN(numPoints) || numPoints < 0) errors.push('points must be a number >= 0');
    if (!audioFile) errors.push('audio file is required');
    if (errors.length > 0) return res.status(400).json({ error: 'Validation failed', details: errors });

    const kdrive = getKDriveService();
    const folderId = await getCoFolderId();
    const audioResult = await kdrive.uploadFile(audioFile.path, folderId, audioFile.originalname);
    if (!audioResult || !audioResult.id) return res.status(500).json({ error: 'Failed to upload audio to kDrive' });

    let imageResult = null;
    if (imageFile) {
      imageResult = await kdrive.uploadFile(imageFile.path, folderId, imageFile.originalname);
    }

    const maxOrder = await req.db.get('SELECT COALESCE(MAX(question_order), 0) AS max_order FROM tcf_co_questions WHERE series_id = ?', [id]);
    const nextOrder = maxOrder.max_order + 1;

    const result = await req.db.run(
      `INSERT INTO tcf_co_questions (series_id, question_order, audio_kdrive_file_id, audio_file_name,
        image_kdrive_file_id, image_file_name, question_text, option_a, option_b, option_c, option_d,
        correct_answer, cefr_level, points)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
      [id, nextOrder, audioResult.id, audioFile.originalname,
       imageResult ? imageResult.id : null, imageFile ? imageFile.originalname : null,
       question_text.trim(), option_a.trim(), option_b.trim(), option_c.trim(), option_d.trim(),
       correct_answer, cefr_level, numPoints]
    );

    await recalculateCoSeriesCounters(req.db, id);
    const question = await req.db.get('SELECT * FROM tcf_co_questions WHERE id = ?', [result.rows[0].id]);
    res.status(201).json(question);
  } catch (error) {
    console.error('POST /co/series/:id/questions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    cleanTemp(audioFile?.path);
    cleanTemp(imageFile?.path);
  }
});

// PUT /co/questions/:id — update CO question, optionally replace audio/image
router.put('/co/questions/:id', adminOnly, coUpload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'image', maxCount: 1 },
]), async (req, res) => {
  const audioFile = req.files?.audio?.[0];
  const imageFile = req.files?.image?.[0];
  try {
    const { id } = req.params;
    const existing = await req.db.get('SELECT * FROM tcf_co_questions WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'Question not found' });

    const { question_text, option_a, option_b, option_c, option_d, correct_answer, cefr_level, points } = req.body;
    const errors = [];
    if (!question_text || !question_text.trim()) errors.push('question_text is required');
    if (!option_a || !option_a.trim()) errors.push('option_a is required');
    if (!option_b || !option_b.trim()) errors.push('option_b is required');
    if (!option_c || !option_c.trim()) errors.push('option_c is required');
    if (!option_d || !option_d.trim()) errors.push('option_d is required');
    if (!correct_answer || !VALID_ANSWERS.includes(correct_answer)) errors.push('correct_answer must be one of A, B, C, D');
    if (!cefr_level || !CEFR_LEVELS.includes(cefr_level)) errors.push('cefr_level must be one of A1, A2, B1, B2, C1, C2');
    const numPoints = points !== undefined && points !== null ? parseFloat(points) : NaN;
    if (isNaN(numPoints) || numPoints < 0) errors.push('points must be a number >= 0');
    if (errors.length > 0) return res.status(400).json({ error: 'Validation failed', details: errors });

    let audioKdriveFileId = existing.audio_kdrive_file_id;
    let audioFileName = existing.audio_file_name;
    let imageKdriveFileId = existing.image_kdrive_file_id;
    let imageFileName = existing.image_file_name;
    const kdrive = getKDriveService();

    if (audioFile) {
      const folderId = await getCoFolderId();
      const audioResult = await kdrive.uploadFile(audioFile.path, folderId, audioFile.originalname);
      if (!audioResult || !audioResult.id) return res.status(500).json({ error: 'Failed to upload audio to kDrive' });
      if (existing.audio_kdrive_file_id) { try { await kdrive.deleteFile(existing.audio_kdrive_file_id); } catch {} }
      audioKdriveFileId = audioResult.id;
      audioFileName = audioFile.originalname;
    }

    if (imageFile) {
      const folderId = await getCoFolderId();
      const imageResult = await kdrive.uploadFile(imageFile.path, folderId, imageFile.originalname);
      if (imageResult && imageResult.id) {
        if (existing.image_kdrive_file_id) { try { await kdrive.deleteFile(existing.image_kdrive_file_id); } catch {} }
        imageKdriveFileId = imageResult.id;
        imageFileName = imageFile.originalname;
      }
    }

    await req.db.run(
      `UPDATE tcf_co_questions SET question_text = ?, option_a = ?, option_b = ?, option_c = ?, option_d = ?,
        correct_answer = ?, cefr_level = ?, points = ?,
        audio_kdrive_file_id = ?, audio_file_name = ?, image_kdrive_file_id = ?, image_file_name = ?,
        updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [question_text.trim(), option_a.trim(), option_b.trim(), option_c.trim(), option_d.trim(),
       correct_answer, cefr_level, numPoints,
       audioKdriveFileId, audioFileName, imageKdriveFileId, imageFileName, id]
    );

    await recalculateCoSeriesCounters(req.db, existing.series_id);
    const updated = await req.db.get('SELECT * FROM tcf_co_questions WHERE id = ?', [id]);
    res.json(updated);
  } catch (error) {
    console.error('PUT /co/questions/:id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    cleanTemp(audioFile?.path);
    cleanTemp(imageFile?.path);
  }
});

// DELETE /co/questions/:id
router.delete('/co/questions/:id', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await req.db.get('SELECT id, series_id, audio_kdrive_file_id, image_kdrive_file_id FROM tcf_co_questions WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'Question not found' });

    const kdrive = getKDriveService();
    if (existing.audio_kdrive_file_id) { try { await kdrive.deleteFile(existing.audio_kdrive_file_id); } catch {} }
    if (existing.image_kdrive_file_id) { try { await kdrive.deleteFile(existing.image_kdrive_file_id); } catch {} }

    await req.db.run('DELETE FROM tcf_co_questions WHERE id = ?', [id]);
    await reindexCoQuestions(req.db, existing.series_id);
    await recalculateCoSeriesCounters(req.db, existing.series_id);
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('DELETE /co/questions/:id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /co/series/:id/questions/reorder
router.put('/co/series/:id/questions/reorder', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { questions } = req.body;
    const series = await req.db.get('SELECT id FROM tcf_co_series WHERE id = ?', [id]);
    if (!series) return res.status(404).json({ error: 'Series not found' });
    if (!Array.isArray(questions) || questions.length === 0)
      return res.status(400).json({ error: 'Validation failed', details: ['questions must be a non-empty array of {id, question_order}'] });

    const existingQuestions = await req.db.all('SELECT id FROM tcf_co_questions WHERE series_id = ?', [id]);
    const existingIds = new Set(existingQuestions.map(q => q.id));
    for (const item of questions) {
      if (!item.id || !existingIds.has(item.id))
        return res.status(400).json({ error: 'Validation failed', details: [`Question ID ${item.id} does not belong to this series`] });
      if (!Number.isInteger(item.question_order) || item.question_order < 1)
        return res.status(400).json({ error: 'Validation failed', details: ['question_order must be a positive integer'] });
    }
    await bulkSetQuestionOrder(req.db, 'tcf_co_questions', questions);
    const updated = await req.db.all('SELECT * FROM tcf_co_questions WHERE series_id = ? ORDER BY question_order ASC', [id]);
    res.json(updated);
  } catch (error) {
    console.error('PUT /co/series/:id/questions/reorder error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /co/questions/:id/audio — stream audio from kDrive
router.get('/co/questions/:id/audio', async (req, res) => {
  try {
    const { id } = req.params;
    const question = await req.db.get('SELECT audio_kdrive_file_id, audio_file_name FROM tcf_co_questions WHERE id = ?', [id]);
    if (!question || !question.audio_kdrive_file_id) return res.status(404).json({ error: 'Audio not found' });

    const kdrive = getKDriveService();
    const ext = path.extname(question.audio_file_name || '').toLowerCase();
    const mimeMap = { '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg', '.m4a': 'audio/mp4', '.webm': 'audio/webm' };
    res.setHeader('Content-Type', mimeMap[ext] || 'audio/mpeg');
    await kdrive.streamFile(question.audio_kdrive_file_id, res, req.headers, 'inline', question.audio_file_name || 'audio');
  } catch (error) {
    console.error('GET /co/questions/:id/audio error:', error);
    if (!res.headersSent) res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /co/questions/:id/image — stream image from kDrive
router.get('/co/questions/:id/image', async (req, res) => {
  try {
    const { id } = req.params;
    const question = await req.db.get('SELECT image_kdrive_file_id, image_file_name FROM tcf_co_questions WHERE id = ?', [id]);
    if (!question || !question.image_kdrive_file_id) return res.status(404).json({ error: 'Image not found' });

    const kdrive = getKDriveService();
    const ext = path.extname(question.image_file_name || '').toLowerCase();
    const mimeMap = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp' };
    res.setHeader('Content-Type', mimeMap[ext] || 'image/jpeg');
    await kdrive.streamFile(question.image_kdrive_file_id, res, req.headers, 'inline', question.image_file_name || 'image');
  } catch (error) {
    console.error('GET /co/questions/:id/image error:', error);
    if (!res.headersSent) res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// CO ASSIGNMENT ENDPOINTS
// ============================================================

router.post('/co/series/:id/assign', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { student_id, batch_id } = req.body;
    const series = await req.db.get('SELECT id FROM tcf_co_series WHERE id = ?', [id]);
    if (!series) return res.status(404).json({ error: 'Series not found' });
    if ((!student_id && !batch_id) || (student_id && batch_id))
      return res.status(400).json({ error: 'Validation failed', details: ['Exactly one of student_id or batch_id must be provided'] });

    try {
      const result = await req.db.run(
        'INSERT INTO tcf_co_series_assignments (series_id, student_id, batch_id) VALUES (?, ?, ?) RETURNING id',
        [id, student_id || null, batch_id || null]
      );
      const assignment = await req.db.get('SELECT * FROM tcf_co_series_assignments WHERE id = ?', [result.rows[0].id]);
      res.status(201).json(assignment);
    } catch (err) {
      if (err.code === '23505') return res.status(409).json({ error: 'Assignment already exists' });
      throw err;
    }
  } catch (error) {
    console.error('POST /co/series/:id/assign error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/co/series/:id/assignments', async (req, res) => {
  try {
    const { id } = req.params;
    const series = await req.db.get('SELECT id FROM tcf_co_series WHERE id = ?', [id]);
    if (!series) return res.status(404).json({ error: 'Series not found' });

    const assignments = await req.db.all(`
      SELECT a.id, a.series_id, a.student_id, a.batch_id, a.assigned_at,
        u.first_name AS student_first_name, u.last_name AS student_last_name, u.email AS student_email,
        b.name AS batch_name
      FROM tcf_co_series_assignments a
      LEFT JOIN users u ON a.student_id = u.id
      LEFT JOIN batches b ON a.batch_id = b.id
      WHERE a.series_id = ? ORDER BY a.assigned_at DESC
    `, [id]);
    res.json(assignments);
  } catch (error) {
    console.error('GET /co/series/:id/assignments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/co/assignments/:id', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await req.db.get('SELECT id FROM tcf_co_series_assignments WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'Assignment not found' });
    await req.db.run('DELETE FROM tcf_co_series_assignments WHERE id = ?', [id]);
    res.json({ message: 'Assignment removed successfully' });
  } catch (error) {
    console.error('DELETE /co/assignments/:id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// CO BULK IMPORT ENDPOINT
// ============================================================

// POST /co/series/bulk-import — import a full series from folder data
router.post('/co/series/bulk-import', adminOnly, coUpload.any(), async (req, res) => {
  const uploadedFiles = req.files || [];
  try {
    // Parse series_data and questions_data from form fields
    let seriesData, questionsData;
    try {
      seriesData = JSON.parse(req.body.series_data);
    } catch {
      return res.status(400).json({ error: 'Validation failed', details: ['series_data must be valid JSON'] });
    }
    try {
      questionsData = JSON.parse(req.body.questions_data);
    } catch {
      return res.status(400).json({ error: 'Validation failed', details: ['questions_data must be valid JSON'] });
    }

    // Validate series data
    const errors = [];
    if (!seriesData.name || !seriesData.name.trim()) errors.push('series name is required');
    if (!seriesData.category_id) errors.push('category_id is required');
    const durationMinutes = parseInt(seriesData.duration_minutes, 10);
    if (isNaN(durationMinutes) || durationMinutes < 1) errors.push('duration_minutes must be an integer >= 1');
    const thresholdError = validateCefrThresholds(seriesData.cefr_thresholds);
    if (thresholdError) errors.push(thresholdError);
    if (!Array.isArray(questionsData) || questionsData.length === 0) errors.push('questions_data must be a non-empty array');
    if (errors.length > 0) return res.status(400).json({ error: 'Validation failed', details: errors });

    // Verify category exists
    const category = await req.db.get('SELECT id FROM tcf_categories WHERE id = ?', [seriesData.category_id]);
    if (!category) return res.status(404).json({ error: 'Category not found' });

    // Build a map of uploaded files by fieldname
    const fileMap = {};
    for (const f of uploadedFiles) {
      fileMap[f.fieldname] = f;
    }

    const kdrive = getKDriveService();
    const folderId = await getCoFolderId();

    // Upload intro audio if provided
    let introAudioKdriveFileId = null;
    let introAudioFileName = null;
    const introFile = fileMap['intro_audio'];
    if (introFile) {
      const result = await kdrive.uploadFile(introFile.path, folderId, introFile.originalname);
      if (result && result.id) {
        introAudioKdriveFileId = result.id;
        introAudioFileName = introFile.originalname;
      }
    }

    // Create the series
    const seriesResult = await req.db.run(
      `INSERT INTO tcf_co_series (category_id, name, description, duration_minutes, cefr_thresholds, total_points, created_by, intro_audio_kdrive_file_id, intro_audio_file_name)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
      [seriesData.category_id, seriesData.name.trim(), seriesData.description || null,
       durationMinutes, JSON.stringify(seriesData.cefr_thresholds),
       parseInt(seriesData.total_points, 10) || 0,
       req.user.id, introAudioKdriveFileId, introAudioFileName]
    );
    const seriesId = seriesResult.rows[0].id;

    // Insert each question
    const insertedQuestions = [];
    for (let i = 0; i < questionsData.length; i++) {
      const q = questionsData[i];
      const qNum = q.number || (i + 1);
      const questionOrder = i + 1;

      // Upload audio for this question
      let audioKdriveFileId = null;
      let audioFileName = null;
      const audioFile = fileMap[`audio_${qNum}`];
      if (audioFile) {
        try {
          const audioResult = await kdrive.uploadFile(audioFile.path, folderId, audioFile.originalname);
          if (audioResult && audioResult.id) {
            audioKdriveFileId = audioResult.id;
            audioFileName = audioFile.originalname;
          }
        } catch (err) {
          console.error(`Failed to upload audio for question ${qNum}:`, err.message);
        }
      }

      // Upload image for this question
      let imageKdriveFileId = null;
      let imageFileName = null;
      const imageFile = fileMap[`image_${qNum}`];
      if (imageFile) {
        try {
          const imageResult = await kdrive.uploadFile(imageFile.path, folderId, imageFile.originalname);
          if (imageResult && imageResult.id) {
            imageKdriveFileId = imageResult.id;
            imageFileName = imageFile.originalname;
          }
        } catch (err) {
          console.error(`Failed to upload image for question ${qNum}:`, err.message);
        }
      }

      const result = await req.db.run(
        `INSERT INTO tcf_co_questions (series_id, question_order, audio_kdrive_file_id, audio_file_name,
          image_kdrive_file_id, image_file_name, question_text, option_a, option_b, option_c, option_d,
          correct_answer, cefr_level, points)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
        [seriesId, questionOrder, audioKdriveFileId, audioFileName,
         imageKdriveFileId, imageFileName,
         (q.prompt || q.question_text || '').trim(),
         (q.options?.A || q.option_a || 'A').trim(),
         (q.options?.B || q.option_b || 'B').trim(),
         (q.options?.C || q.option_c || 'C').trim(),
         (q.options?.D || q.option_d || 'D').trim(),
         q.correct_letter || q.correct_answer || 'A',
         q.level || q.cefr_level || 'A1',
         parseFloat(q.points) || 0]
      );
      insertedQuestions.push({ id: result.rows[0].id, number: qNum, audioUploaded: !!audioKdriveFileId, imageUploaded: !!imageKdriveFileId });
    }

    // Recalculate series counters
    await recalculateCoSeriesCounters(req.db, seriesId);

    // Fetch the created series with questions
    const newSeries = await req.db.get('SELECT * FROM tcf_co_series WHERE id = ?', [seriesId]);
    const questions = await req.db.all('SELECT * FROM tcf_co_questions WHERE series_id = ? ORDER BY question_order ASC', [seriesId]);
    const dist = await req.db.all('SELECT cefr_level, COUNT(*) AS count FROM tcf_co_questions WHERE series_id = ? GROUP BY cefr_level', [seriesId]);
    const distribution = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
    for (const row of dist) distribution[row.cefr_level] = parseInt(row.count, 10);
    newSeries.cefr_distribution = distribution;
    newSeries.questions = questions;

    res.status(201).json({ series: newSeries, imported_questions: insertedQuestions.length });
  } catch (error) {
    console.error('POST /co/series/bulk-import error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  } finally {
    // Clean up all temp files
    for (const f of uploadedFiles) {
      cleanTemp(f.path);
    }
  }
});

// ============================================================
// EE (Expression Écrite) ENDPOINTS
// ============================================================

// ── EE Years ──

// GET /ee/categories/:categoryId/years — list years for the EE category, ordered DESC
router.get('/ee/categories/:categoryId/years', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await req.db.get('SELECT id FROM tcf_categories WHERE id = ?', [categoryId]);
    if (!category) return res.status(404).json({ error: 'Category not found' });

    const years = await req.db.all(`
      SELECT y.id, y.category_id, y.year, y.created_at,
        (SELECT COUNT(*) FROM tcf_ee_months WHERE year_id = y.id) AS month_count
      FROM tcf_ee_years y
      WHERE y.category_id = ?
      ORDER BY y.year DESC
    `, [categoryId]);
    res.json(years);
  } catch (error) {
    console.error('GET /ee/categories/:categoryId/years error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /ee/categories/:categoryId/years — create year
router.post('/ee/categories/:categoryId/years', adminOnly, async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { year } = req.body;

    const category = await req.db.get('SELECT id FROM tcf_categories WHERE id = ?', [categoryId]);
    if (!category) return res.status(404).json({ error: 'Category not found' });

    if (!year || !Number.isInteger(year) || year < 2000 || year > 2100) {
      return res.status(400).json({ error: 'Validation failed', details: ['year must be an integer between 2000 and 2100'] });
    }

    // Check duplicate
    const existing = await req.db.get(
      'SELECT id FROM tcf_ee_years WHERE category_id = ? AND year = ?',
      [categoryId, year]
    );
    if (existing) return res.status(409).json({ error: 'This year already exists for this category' });

    const result = await req.db.run(
      'INSERT INTO tcf_ee_years (category_id, year) VALUES (?, ?) RETURNING id',
      [categoryId, year]
    );
    const created = await req.db.get('SELECT * FROM tcf_ee_years WHERE id = ?', [result.rows[0].id]);
    res.status(201).json(created);
  } catch (error) {
    console.error('POST /ee/categories/:categoryId/years error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /ee/years/:id — delete year (cascade)
router.delete('/ee/years/:id', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await req.db.get('SELECT id FROM tcf_ee_years WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'Year not found' });

    await req.db.run('DELETE FROM tcf_ee_years WHERE id = ?', [id]);
    res.json({ message: 'Year deleted successfully' });
  } catch (error) {
    console.error('DELETE /ee/years/:id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── EE Months ──

// GET /ee/years/:yearId/months — list months for a year, ordered by month number
router.get('/ee/years/:yearId/months', async (req, res) => {
  try {
    const { yearId } = req.params;
    const yearRow = await req.db.get('SELECT * FROM tcf_ee_years WHERE id = ?', [yearId]);
    if (!yearRow) return res.status(404).json({ error: 'Year not found' });

    const months = await req.db.all(`
      SELECT m.id, m.year_id, m.month, m.month_name, m.created_at,
        (SELECT COUNT(*) FROM tcf_ee_combinaisons WHERE month_id = m.id) AS combinaison_count
      FROM tcf_ee_months m
      WHERE m.year_id = ?
      ORDER BY m.month ASC
    `, [yearId]);
    res.json(months);
  } catch (error) {
    console.error('GET /ee/years/:yearId/months error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /ee/years/:yearId/months — create month
router.post('/ee/years/:yearId/months', adminOnly, async (req, res) => {
  try {
    const { yearId } = req.params;
    const { month, month_name } = req.body;

    const yearRow = await req.db.get('SELECT id FROM tcf_ee_years WHERE id = ?', [yearId]);
    if (!yearRow) return res.status(404).json({ error: 'Year not found' });

    if (!month || !Number.isInteger(month) || month < 1 || month > 12) {
      return res.status(400).json({ error: 'Validation failed', details: ['month must be an integer between 1 and 12'] });
    }
    if (!month_name || !month_name.trim()) {
      return res.status(400).json({ error: 'Validation failed', details: ['month_name is required'] });
    }

    // Check duplicate
    const existing = await req.db.get(
      'SELECT id FROM tcf_ee_months WHERE year_id = ? AND month = ?',
      [yearId, month]
    );
    if (existing) return res.status(409).json({ error: 'This month already exists for this year' });

    const result = await req.db.run(
      'INSERT INTO tcf_ee_months (year_id, month, month_name) VALUES (?, ?, ?) RETURNING id',
      [yearId, month, month_name.trim()]
    );
    const created = await req.db.get('SELECT * FROM tcf_ee_months WHERE id = ?', [result.rows[0].id]);
    res.status(201).json(created);
  } catch (error) {
    console.error('POST /ee/years/:yearId/months error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /ee/months/:id — delete month (cascade)
router.delete('/ee/months/:id', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await req.db.get('SELECT id FROM tcf_ee_months WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'Month not found' });

    await req.db.run('DELETE FROM tcf_ee_months WHERE id = ?', [id]);
    res.json({ message: 'Month deleted successfully' });
  } catch (error) {
    console.error('DELETE /ee/months/:id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── EE Combinaisons ──

// GET /ee/months/:monthId/combinaisons — list combinaisons with their tâches
router.get('/ee/months/:monthId/combinaisons', async (req, res) => {
  try {
    const { monthId } = req.params;
    const monthRow = await req.db.get('SELECT id FROM tcf_ee_months WHERE id = ?', [monthId]);
    if (!monthRow) return res.status(404).json({ error: 'Month not found' });

    const combinaisons = await req.db.all(`
      SELECT c.id, c.month_id, c.name, c.display_order, c.created_at, c.updated_at
      FROM tcf_ee_combinaisons c
      WHERE c.month_id = ?
      ORDER BY c.display_order ASC, c.id ASC
    `, [monthId]);

    // All tâches of the month in one query (was one query per combinaison)
    const taches = await req.db.all(`
      SELECT t.id, t.combinaison_id, t.task_number, t.task_type, t.prompt_text, t.question_text,
        t.argument_text_1, t.argument_text_2, t.min_words, t.max_words,
        t.duration_minutes, t.correction_text, t.created_at, t.updated_at
      FROM tcf_ee_taches t
      JOIN tcf_ee_combinaisons c ON c.id = t.combinaison_id
      WHERE c.month_id = $1
      ORDER BY t.task_number ASC
    `, [monthId]);
    const tachesBy = new Map();
    for (const t of taches) {
      if (!tachesBy.has(t.combinaison_id)) tachesBy.set(t.combinaison_id, []);
      tachesBy.get(t.combinaison_id).push(t);
    }
    for (const comb of combinaisons) comb.taches = tachesBy.get(comb.id) || [];

    res.json(combinaisons);
  } catch (error) {
    console.error('GET /ee/months/:monthId/combinaisons error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /ee/months/:monthId/combinaisons — create combinaison
router.post('/ee/months/:monthId/combinaisons', adminOnly, async (req, res) => {
  try {
    const { monthId } = req.params;
    const { name } = req.body;

    const monthRow = await req.db.get('SELECT id FROM tcf_ee_months WHERE id = ?', [monthId]);
    if (!monthRow) return res.status(404).json({ error: 'Month not found' });

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Validation failed', details: ['name is required'] });
    }

    // Get next display_order
    const maxOrder = await req.db.get(
      'SELECT COALESCE(MAX(display_order), 0) AS max_order FROM tcf_ee_combinaisons WHERE month_id = ?',
      [monthId]
    );
    const nextOrder = (maxOrder.max_order || 0) + 1;

    const result = await req.db.run(
      'INSERT INTO tcf_ee_combinaisons (month_id, name, display_order) VALUES (?, ?, ?) RETURNING id',
      [monthId, name.trim(), nextOrder]
    );
    const created = await req.db.get('SELECT * FROM tcf_ee_combinaisons WHERE id = ?', [result.rows[0].id]);
    created.taches = [];
    res.status(201).json(created);
  } catch (error) {
    console.error('POST /ee/months/:monthId/combinaisons error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /ee/combinaisons/:id — update combinaison name
router.put('/ee/combinaisons/:id', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const existing = await req.db.get('SELECT * FROM tcf_ee_combinaisons WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'Combinaison not found' });

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Validation failed', details: ['name is required'] });
    }

    await req.db.run(
      'UPDATE tcf_ee_combinaisons SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name.trim(), id]
    );
    const updated = await req.db.get('SELECT * FROM tcf_ee_combinaisons WHERE id = ?', [id]);
    res.json(updated);
  } catch (error) {
    console.error('PUT /ee/combinaisons/:id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /ee/combinaisons/:id — delete combinaison (cascade)
router.delete('/ee/combinaisons/:id', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await req.db.get('SELECT id FROM tcf_ee_combinaisons WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'Combinaison not found' });

    await req.db.run('DELETE FROM tcf_ee_combinaisons WHERE id = ?', [id]);
    res.json({ message: 'Combinaison deleted successfully' });
  } catch (error) {
    console.error('DELETE /ee/combinaisons/:id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── EE Tâches ──

const VALID_TASK_TYPES = ['message_court', 'narration', 'argumentation'];

// POST /ee/combinaisons/:id/taches — create a tâche
router.post('/ee/combinaisons/:id/taches', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { task_number, task_type, prompt_text, argument_text_1, argument_text_2, min_words, max_words, duration_minutes, correction_text } = req.body;

    const comb = await req.db.get('SELECT id FROM tcf_ee_combinaisons WHERE id = ?', [id]);
    if (!comb) return res.status(404).json({ error: 'Combinaison not found' });

    // Validate
    const errors = [];
    if (!task_number || ![1, 2, 3].includes(task_number)) errors.push('task_number must be 1, 2, or 3');
    if (!task_type || !VALID_TASK_TYPES.includes(task_type)) errors.push('task_type must be message_court, narration, or argumentation');
    if (!prompt_text || !prompt_text.trim()) errors.push('prompt_text is required');
    if (min_words === undefined || min_words === null || !Number.isInteger(min_words) || min_words < 0) errors.push('min_words must be a non-negative integer');
    if (max_words === undefined || max_words === null || !Number.isInteger(max_words) || max_words < 0) errors.push('max_words must be a non-negative integer');
    if (duration_minutes === undefined || duration_minutes === null || !Number.isInteger(duration_minutes) || duration_minutes < 1) errors.push('duration_minutes must be a positive integer');

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    // Check duplicate task_number in this combinaison
    const dup = await req.db.get(
      'SELECT id FROM tcf_ee_taches WHERE combinaison_id = ? AND task_number = ?',
      [id, task_number]
    );
    if (dup) return res.status(409).json({ error: `Task ${task_number} already exists in this combinaison` });

    const { question_text } = req.body;
    const result = await req.db.run(
      `INSERT INTO tcf_ee_taches (combinaison_id, task_number, task_type, prompt_text, question_text, argument_text_1, argument_text_2, min_words, max_words, duration_minutes, correction_text)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
      [id, task_number, task_type, prompt_text.trim(), question_text || null, argument_text_1 || null, argument_text_2 || null, min_words, max_words, duration_minutes, correction_text || null]
    );

    const created = await req.db.get('SELECT * FROM tcf_ee_taches WHERE id = ?', [result.rows[0].id]);
    res.status(201).json(created);
  } catch (error) {
    console.error('POST /ee/combinaisons/:id/taches error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /ee/taches/:id — update a tâche
router.put('/ee/taches/:id', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { prompt_text, question_text, argument_text_1, argument_text_2, min_words, max_words, duration_minutes, correction_text } = req.body;

    const existing = await req.db.get('SELECT * FROM tcf_ee_taches WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'Tâche not found' });

    const errors = [];
    if (prompt_text !== undefined && (!prompt_text || !prompt_text.trim())) errors.push('prompt_text cannot be empty');
    if (min_words !== undefined && (!Number.isInteger(min_words) || min_words < 0)) errors.push('min_words must be a non-negative integer');
    if (max_words !== undefined && (!Number.isInteger(max_words) || max_words < 0)) errors.push('max_words must be a non-negative integer');
    if (duration_minutes !== undefined && (!Number.isInteger(duration_minutes) || duration_minutes < 1)) errors.push('duration_minutes must be a positive integer');

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    await req.db.run(
      `UPDATE tcf_ee_taches SET
        prompt_text = COALESCE(?, prompt_text),
        question_text = ?,
        argument_text_1 = ?,
        argument_text_2 = ?,
        min_words = COALESCE(?, min_words),
        max_words = COALESCE(?, max_words),
        duration_minutes = COALESCE(?, duration_minutes),
        correction_text = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        prompt_text ? prompt_text.trim() : null,
        question_text !== undefined ? (question_text || null) : existing.question_text,
        argument_text_1 !== undefined ? (argument_text_1 || null) : existing.argument_text_1,
        argument_text_2 !== undefined ? (argument_text_2 || null) : existing.argument_text_2,
        min_words !== undefined ? min_words : null,
        max_words !== undefined ? max_words : null,
        duration_minutes !== undefined ? duration_minutes : null,
        correction_text !== undefined ? (correction_text || null) : existing.correction_text,
        id
      ]
    );

    const updated = await req.db.get('SELECT * FROM tcf_ee_taches WHERE id = ?', [id]);
    res.json(updated);
  } catch (error) {
    console.error('PUT /ee/taches/:id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /ee/taches/:id — delete a tâche
router.delete('/ee/taches/:id', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await req.db.get('SELECT id FROM tcf_ee_taches WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'Tâche not found' });

    await req.db.run('DELETE FROM tcf_ee_taches WHERE id = ?', [id]);
    res.json({ message: 'Tâche deleted successfully' });
  } catch (error) {
    console.error('DELETE /ee/taches/:id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── EE Bulk Import ──

// French month name → number mapping
const FRENCH_MONTH_MAP = {
  'janvier': 1, 'février': 2, 'mars': 3, 'avril': 4,
  'mai': 5, 'juin': 6, 'juillet': 7, 'août': 8,
  'septembre': 9, 'octobre': 10, 'novembre': 11, 'décembre': 12,
};

// Task type mapping from display name to DB enum
const TASK_TYPE_MAP = {
  'message court': 'message_court',
  'narration': 'narration',
  'argumentation': 'argumentation',
};

// POST /ee/years/bulk-import — bulk import EE data from JSON
router.post('/ee/years/bulk-import', adminOnly, async (req, res) => {
  try {
    const { category_id, year, data } = req.body;

    // Validate input
    const errors = [];
    if (!category_id) errors.push('category_id is required');
    if (!year || !Number.isInteger(year)) errors.push('year must be an integer');
    if (!Array.isArray(data) || data.length === 0) errors.push('data must be a non-empty array');
    if (errors.length > 0) return res.status(400).json({ error: 'Validation failed', details: errors });

    // Verify category exists
    const category = await req.db.get('SELECT id FROM tcf_categories WHERE id = ?', [category_id]);
    if (!category) return res.status(404).json({ error: 'Category not found' });

    // 1. Create or get the year
    let yearRow = await req.db.get(
      'SELECT id FROM tcf_ee_years WHERE category_id = ? AND year = ?',
      [category_id, year]
    );
    let yearCreated = false;
    if (!yearRow) {
      const result = await req.db.run(
        'INSERT INTO tcf_ee_years (category_id, year) VALUES (?, ?) RETURNING id',
        [category_id, year]
      );
      yearRow = { id: result.rows[0].id };
      yearCreated = true;
    }
    const yearId = yearRow.id;

    // 2. Group tasks by month
    const monthGroups = {};
    for (const entry of data) {
      const monthStr = (entry.month || '').trim();
      if (!monthStr) continue;
      if (!monthGroups[monthStr]) monthGroups[monthStr] = [];
      monthGroups[monthStr].push(entry);
    }

    // Parse month name → number from "Juillet 2024" format
    const parseMonthNumber = (monthStr) => {
      const parts = monthStr.split(' ');
      const monthName = (parts[0] || '').toLowerCase();
      return FRENCH_MONTH_MAP[monthName] || null;
    };

    const summary = {
      year,
      year_created: yearCreated,
      months_created: 0,
      combinaisons_created: 0,
      taches_created: 0,
      months: [],
    };

    // 3. Process each month
    for (const [monthStr, entries] of Object.entries(monthGroups)) {
      const monthNumber = parseMonthNumber(monthStr);
      if (!monthNumber) {
        console.warn(`Skipping unknown month: "${monthStr}"`);
        continue;
      }
      const monthName = monthStr.split(' ')[0]; // e.g. "Juillet"

      // Create or get the month
      let monthRow = await req.db.get(
        'SELECT id FROM tcf_ee_months WHERE year_id = ? AND month = ?',
        [yearId, monthNumber]
      );
      let monthCreated = false;
      if (!monthRow) {
        const result = await req.db.run(
          'INSERT INTO tcf_ee_months (year_id, month, month_name) VALUES (?, ?, ?) RETURNING id',
          [yearId, monthNumber, monthName]
        );
        monthRow = { id: result.rows[0].id };
        monthCreated = true;
        summary.months_created++;
      }
      const monthId = monthRow.id;

      // 4. Group entries by combination within this month
      const combGroups = {};
      for (const entry of entries) {
        const combName = (entry.combination || '').trim();
        if (!combName) continue;
        if (!combGroups[combName]) combGroups[combName] = [];
        combGroups[combName].push(entry);
      }

      const monthSummary = {
        month_name: monthName,
        month_number: monthNumber,
        month_created: monthCreated,
        combinaisons: [],
      };

      // 5. Process each combination
      const combNames = Object.keys(combGroups).sort((a, b) => {
        // Sort by combination number: "Combinaison 2" → 2
        const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
        const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
        return numA - numB;
      });

      for (const combName of combNames) {
        const combEntries = combGroups[combName];

        // Check if combinaison already exists for this month
        let combRow = await req.db.get(
          'SELECT id FROM tcf_ee_combinaisons WHERE month_id = ? AND name = ?',
          [monthId, combName]
        );
        let combCreated = false;
        if (!combRow) {
          // Get next display_order
          const maxOrder = await req.db.get(
            'SELECT COALESCE(MAX(display_order), 0) AS max_order FROM tcf_ee_combinaisons WHERE month_id = ?',
            [monthId]
          );
          const nextOrder = (maxOrder?.max_order || 0) + 1;

          const result = await req.db.run(
            'INSERT INTO tcf_ee_combinaisons (month_id, name, display_order) VALUES (?, ?, ?) RETURNING id',
            [monthId, combName, nextOrder]
          );
          combRow = { id: result.rows[0].id };
          combCreated = true;
          summary.combinaisons_created++;
        }
        const combinaisonId = combRow.id;

        let tachesCreated = 0;

        // 6. Create tâches for each entry in this combination
        for (const entry of combEntries) {
          const taskNumber = parseInt(entry.task_number, 10);
          if (!taskNumber || taskNumber < 1 || taskNumber > 3) continue;

          // Map task type
          const taskTypeRaw = (entry.task_type || '').toLowerCase();
          const taskType = TASK_TYPE_MAP[taskTypeRaw];
          if (!taskType) {
            console.warn(`Skipping unknown task_type: "${entry.task_type}"`);
            continue;
          }

          // Parse word range "60-120 mots" → min=60, max=120
          let minWords = 60, maxWords = 120;
          const wordMatch = (entry.word_range || '').match(/(\d+)\s*-\s*(\d+)/);
          if (wordMatch) {
            minWords = parseInt(wordMatch[1], 10);
            maxWords = parseInt(wordMatch[2], 10);
          }

          // Parse duration "10 min" → 10
          let durationMinutes = 10;
          const durMatch = (entry.duration || '').match(/(\d+)/);
          if (durMatch) {
            durationMinutes = parseInt(durMatch[1], 10);
          }

          // Prompt text
          const promptText = (entry.prompt || '').trim();
          if (!promptText) continue;

          // Question text (used for task 3 argumentation)
          const questionText = (entry.question || '').trim() || null;

          // Correction — store as null if empty
          const correctionText = (entry.correction || '').trim() || null;

          // Check if tâche already exists
          const existingTache = await req.db.get(
            'SELECT id FROM tcf_ee_taches WHERE combinaison_id = ? AND task_number = ?',
            [combinaisonId, taskNumber]
          );
          if (existingTache) continue; // Skip duplicates

          await req.db.run(
            `INSERT INTO tcf_ee_taches (combinaison_id, task_number, task_type, prompt_text, question_text, argument_text_1, argument_text_2, min_words, max_words, duration_minutes, correction_text)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [combinaisonId, taskNumber, taskType, promptText, questionText, null, null, minWords, maxWords, durationMinutes, correctionText]
          );
          tachesCreated++;
          summary.taches_created++;
        }

        monthSummary.combinaisons.push({
          name: combName,
          created: combCreated,
          taches_created: tachesCreated,
        });
      }

      summary.months.push(monthSummary);
    }

    res.status(201).json(summary);
  } catch (error) {
    console.error('POST /ee/years/bulk-import error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// ============================================================
// EXPRESSION ORALE (EO) ENDPOINTS
// ============================================================
// Structure: Category → Year → Month → Partie → 3 Tâches
// Tâche 1 (Présentation): prompt + 4 points à aborder
// Tâche 2 (Interaction): multiple sujets with prep, duration, correction
// Tâche 3 (Argumentation): multiple sujets with duration, correction

// ── EO Years ──

// GET /eo/categories/:categoryId/years
router.get('/eo/categories/:categoryId/years', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const years = await req.db.all(
      `SELECT y.*, 
        (SELECT COUNT(*) FROM tcf_eo_months WHERE year_id = y.id) as month_count
       FROM tcf_eo_years y WHERE y.category_id = ? ORDER BY y.year DESC`,
      [categoryId]
    );
    res.json(years);
  } catch (error) {
    console.error('GET /eo/categories/:categoryId/years error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /eo/categories/:categoryId/years
router.post('/eo/categories/:categoryId/years', adminOnly, async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { year } = req.body;
    if (!year) return res.status(400).json({ error: 'Year is required' });
    const existing = await req.db.get('SELECT id FROM tcf_eo_years WHERE category_id = ? AND year = ?', [categoryId, year]);
    if (existing) return res.status(409).json({ error: 'Year already exists' });
    const result = await req.db.run(
      'INSERT INTO tcf_eo_years (category_id, year) VALUES (?, ?) RETURNING id',
      [categoryId, year]
    );
    res.status(201).json({ id: result.id || result.lastID, year });
  } catch (error) {
    console.error('POST /eo/categories/:categoryId/years error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /eo/years/:id
router.delete('/eo/years/:id', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await req.db.get('SELECT id FROM tcf_eo_years WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'Year not found' });
    await req.db.run('DELETE FROM tcf_eo_years WHERE id = ?', [id]);
    res.json({ message: 'Year deleted successfully' });
  } catch (error) {
    console.error('DELETE /eo/years/:id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── EO Months ──

// GET /eo/years/:yearId/months
router.get('/eo/years/:yearId/months', async (req, res) => {
  try {
    const { yearId } = req.params;
    const months = await req.db.all(
      `SELECT m.*,
        (SELECT COUNT(*) FROM tcf_eo_parties WHERE month_id = m.id) as partie_count
       FROM tcf_eo_months m WHERE m.year_id = ? ORDER BY m.month ASC`,
      [yearId]
    );
    res.json(months);
  } catch (error) {
    console.error('GET /eo/years/:yearId/months error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /eo/years/:yearId/months
router.post('/eo/years/:yearId/months', adminOnly, async (req, res) => {
  try {
    const { yearId } = req.params;
    const { month, month_name } = req.body;
    if (!month || !month_name) return res.status(400).json({ error: 'Month and month_name are required' });
    const existing = await req.db.get('SELECT id FROM tcf_eo_months WHERE year_id = ? AND month = ?', [yearId, month]);
    if (existing) return res.status(409).json({ error: 'Month already exists for this year' });
    const result = await req.db.run(
      'INSERT INTO tcf_eo_months (year_id, month, month_name) VALUES (?, ?, ?) RETURNING id',
      [yearId, month, month_name]
    );
    res.status(201).json({ id: result.id || result.lastID, month, month_name });
  } catch (error) {
    console.error('POST /eo/years/:yearId/months error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /eo/months/:id
router.delete('/eo/months/:id', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await req.db.get('SELECT id FROM tcf_eo_months WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'Month not found' });
    await req.db.run('DELETE FROM tcf_eo_months WHERE id = ?', [id]);
    res.json({ message: 'Month deleted successfully' });
  } catch (error) {
    console.error('DELETE /eo/months/:id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── EO Parties ──

// GET /eo/months/:monthId/parties — list parties with tâches, points, sujets
router.get('/eo/months/:monthId/parties', async (req, res) => {
  try {
    const { monthId } = req.params;
    const parties = await req.db.all(
      'SELECT * FROM tcf_eo_parties WHERE month_id = ? ORDER BY display_order ASC, id ASC',
      [monthId]
    );

    // Tâches, points and sujets of the whole month in three queries
    // (this used to run one query per partie and two per tâche).
    const taches = await req.db.all(`
      SELECT t.* FROM tcf_eo_taches t
      JOIN tcf_eo_parties p ON p.id = t.partie_id
      WHERE p.month_id = $1 ORDER BY t.task_number ASC
    `, [monthId]);
    const points = await req.db.all(`
      SELECT pt.* FROM tcf_eo_points_aborder pt
      JOIN tcf_eo_taches t ON t.id = pt.tache_id
      JOIN tcf_eo_parties p ON p.id = t.partie_id
      WHERE p.month_id = $1 ORDER BY pt.point_number ASC
    `, [monthId]);
    const sujets = await req.db.all(`
      SELECT s.* FROM tcf_eo_sujets s
      JOIN tcf_eo_taches t ON t.id = s.tache_id
      JOIN tcf_eo_parties p ON p.id = t.partie_id
      WHERE p.month_id = $1 ORDER BY s.sujet_number ASC
    `, [monthId]);

    const groupBy = (rows, key) => {
      const m = new Map();
      for (const r of rows) {
        if (!m.has(r[key])) m.set(r[key], []);
        m.get(r[key]).push(r);
      }
      return m;
    };
    const tachesBy = groupBy(taches, 'partie_id');
    const pointsBy = groupBy(points, 'tache_id');
    const sujetsBy = groupBy(sujets, 'tache_id');
    for (const tache of taches) {
      // Tâche 1 carries "points à aborder"; tâches 2 and 3 carry sujets.
      if (tache.task_number === 1) tache.points = pointsBy.get(tache.id) || [];
      else tache.sujets = sujetsBy.get(tache.id) || [];
    }
    for (const partie of parties) partie.taches = tachesBy.get(partie.id) || [];

    res.json(parties);
  } catch (error) {
    console.error('GET /eo/months/:monthId/parties error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /eo/months/:monthId/parties
router.post('/eo/months/:monthId/parties', adminOnly, async (req, res) => {
  try {
    const { monthId } = req.params;
    const { name, display_order } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    // Fall back to the next free position instead of 0, so new parties keep a sensible order.
    let order = Number(display_order);
    if (!Number.isFinite(order) || order <= 0) {
      const max = await req.db.get('SELECT COALESCE(MAX(display_order), 0) AS m FROM tcf_eo_parties WHERE month_id = ?', [monthId]);
      order = (Number(max?.m) || 0) + 1;
    }
    const result = await req.db.run(
      'INSERT INTO tcf_eo_parties (month_id, name, display_order) VALUES (?, ?, ?) RETURNING id',
      [monthId, name, order]
    );
    res.status(201).json({ id: result.id || result.lastID, name, display_order: order });
  } catch (error) {
    console.error('POST /eo/months/:monthId/parties error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /eo/parties/:id
router.put('/eo/parties/:id', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, display_order } = req.body;
    const existing = await req.db.get('SELECT id FROM tcf_eo_parties WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'Partie not found' });
    await req.db.run(
      'UPDATE tcf_eo_parties SET name = COALESCE(?, name), display_order = COALESCE(?, display_order), updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, display_order, id]
    );
    res.json({ message: 'Partie updated' });
  } catch (error) {
    console.error('PUT /eo/parties/:id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /eo/parties/:id
router.delete('/eo/parties/:id', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await req.db.get('SELECT id FROM tcf_eo_parties WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'Partie not found' });
    await req.db.run('DELETE FROM tcf_eo_parties WHERE id = ?', [id]);
    res.json({ message: 'Partie deleted successfully' });
  } catch (error) {
    console.error('DELETE /eo/parties/:id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── EO Tâches ──

// POST /eo/parties/:partieId/taches
router.post('/eo/parties/:partieId/taches', adminOnly, async (req, res) => {
  try {
    const { partieId } = req.params;
    const { task_number, task_type, prompt_text, prep_minutes, duration_minutes } = req.body;
    if (!task_number || !task_type || !duration_minutes) {
      return res.status(400).json({ error: 'task_number, task_type, and duration_minutes are required' });
    }
    const existing = await req.db.get(
      'SELECT id FROM tcf_eo_taches WHERE partie_id = ? AND task_number = ?',
      [partieId, task_number]
    );
    if (existing) return res.status(409).json({ error: `Tâche ${task_number} already exists for this partie` });

    const result = await req.db.run(
      `INSERT INTO tcf_eo_taches (partie_id, task_number, task_type, prompt_text, prep_minutes, duration_minutes)
       VALUES (?, ?, ?, ?, ?, ?) RETURNING id`,
      [partieId, task_number, task_type, prompt_text || null, prep_minutes || 0, duration_minutes]
    );
    res.status(201).json({ id: result.id || result.lastID });
  } catch (error) {
    console.error('POST /eo/parties/:partieId/taches error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /eo/taches/:id
router.put('/eo/taches/:id', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { prompt_text, prep_minutes, duration_minutes } = req.body;
    const existing = await req.db.get('SELECT id FROM tcf_eo_taches WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'Tâche not found' });
    await req.db.run(
      `UPDATE tcf_eo_taches SET 
        prompt_text = COALESCE(?, prompt_text),
        prep_minutes = COALESCE(?, prep_minutes),
        duration_minutes = COALESCE(?, duration_minutes),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [prompt_text, prep_minutes, duration_minutes, id]
    );
    res.json({ message: 'Tâche updated' });
  } catch (error) {
    console.error('PUT /eo/taches/:id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /eo/taches/:id
router.delete('/eo/taches/:id', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await req.db.get('SELECT id FROM tcf_eo_taches WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'Tâche not found' });
    await req.db.run('DELETE FROM tcf_eo_taches WHERE id = ?', [id]);
    res.json({ message: 'Tâche deleted successfully' });
  } catch (error) {
    console.error('DELETE /eo/taches/:id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── EO Points à aborder (Tâche 1) ──

// POST /eo/taches/:tacheId/points
router.post('/eo/taches/:tacheId/points', adminOnly, async (req, res) => {
  try {
    const { tacheId } = req.params;
    const { point_number, title, subtitle } = req.body;
    if (!point_number || !title) return res.status(400).json({ error: 'point_number and title are required' });
    const result = await req.db.run(
      'INSERT INTO tcf_eo_points_aborder (tache_id, point_number, title, subtitle) VALUES (?, ?, ?, ?) RETURNING id',
      [tacheId, point_number, title, subtitle || null]
    );
    res.status(201).json({ id: result.id || result.lastID });
  } catch (error) {
    console.error('POST /eo/taches/:tacheId/points error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /eo/points/:id
router.put('/eo/points/:id', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle } = req.body;
    const existing = await req.db.get('SELECT id FROM tcf_eo_points_aborder WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'Point not found' });
    await req.db.run(
      'UPDATE tcf_eo_points_aborder SET title = COALESCE(?, title), subtitle = COALESCE(?, subtitle) WHERE id = ?',
      [title, subtitle, id]
    );
    res.json({ message: 'Point updated' });
  } catch (error) {
    console.error('PUT /eo/points/:id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /eo/points/:id
router.delete('/eo/points/:id', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await req.db.get('SELECT id FROM tcf_eo_points_aborder WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'Point not found' });
    await req.db.run('DELETE FROM tcf_eo_points_aborder WHERE id = ?', [id]);
    res.json({ message: 'Point deleted' });
  } catch (error) {
    console.error('DELETE /eo/points/:id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── EO Sujets (Tâche 2 & 3) ──

// POST /eo/taches/:tacheId/sujets
router.post('/eo/taches/:tacheId/sujets', adminOnly, async (req, res) => {
  try {
    const { tacheId } = req.params;
    const { sujet_number, prompt_text, duration_seconds, correction_text } = req.body;
    if (!prompt_text) return res.status(400).json({ error: 'prompt_text is required' });
    const num = sujet_number || 1;
    const result = await req.db.run(
      `INSERT INTO tcf_eo_sujets (tache_id, sujet_number, prompt_text, duration_seconds, correction_text)
       VALUES (?, ?, ?, ?, ?) RETURNING id`,
      [tacheId, num, prompt_text, duration_seconds || null, correction_text || null]
    );
    res.status(201).json({ id: result.id || result.lastID });
  } catch (error) {
    console.error('POST /eo/taches/:tacheId/sujets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /eo/sujets/:id
router.put('/eo/sujets/:id', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { prompt_text, duration_seconds, correction_text } = req.body;
    const existing = await req.db.get('SELECT id FROM tcf_eo_sujets WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'Sujet not found' });
    await req.db.run(
      `UPDATE tcf_eo_sujets SET 
        prompt_text = COALESCE(?, prompt_text),
        duration_seconds = COALESCE(?, duration_seconds),
        correction_text = COALESCE(?, correction_text),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [prompt_text, duration_seconds, correction_text, id]
    );
    res.json({ message: 'Sujet updated' });
  } catch (error) {
    console.error('PUT /eo/sujets/:id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /eo/sujets/:id
router.delete('/eo/sujets/:id', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await req.db.get('SELECT id FROM tcf_eo_sujets WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'Sujet not found' });
    await req.db.run('DELETE FROM tcf_eo_sujets WHERE id = ?', [id]);
    res.json({ message: 'Sujet deleted' });
  } catch (error) {
    console.error('DELETE /eo/sujets/:id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── EO Bulk Import ──

/** Parse duration string like "3 min 30 s" → seconds */
function parseDurationToSeconds(str) {
  if (!str || str === 'Aucune') return 0;
  const minMatch = str.match(/(\d+)\s*min/);
  const secMatch = str.match(/(\d+)\s*s(?:\b|$)/);
  const mins = minMatch ? parseInt(minMatch[1], 10) : 0;
  const secs = secMatch ? parseInt(secMatch[1], 10) : 0;
  return mins * 60 + secs;
}

/** Parse duration string → minutes (decimal) */
function parseDurationToMinutes(str) {
  const secs = parseDurationToSeconds(str);
  return Math.round((secs / 60) * 10) / 10; // 1 decimal
}

/** Extract points à aborder from Tâche 1 text */
function extractPointsAborder(text) {
  if (!text) return { prompt: text || '', points: [] };
  // Split on various forms: "Points à aborder", "Points aborder", "Points a aborder", etc.
  const parts = text.split(/\n\s*(?:Points?\s*(?:à|a)?\s*aborder|POINTS?\s*(?:À|A)?\s*ABORDER)\s*:?\s*\n?/i);
  const prompt = (parts[0] || '').trim();
  const pointsText = parts[1] || '';
  const points = [];
  // Match numbered lines like "1. Identité (nom, âge, ville)"
  const lines = pointsText.split('\n').filter(l => l.trim());
  for (const line of lines) {
    const m = line.match(/^\s*(\d+)\.\s*(.+)/);
    if (m) {
      const fullText = m[2].trim();
      // Try to split "Title (subtitle)" or "Title - subtitle"
      const parenMatch = fullText.match(/^([^(]+)\s*\(([^)]+)\)/);
      if (parenMatch) {
        points.push({ title: parenMatch[1].trim(), subtitle: parenMatch[2].trim() });
      } else {
        points.push({ title: fullText, subtitle: null });
      }
    }
  }
  return { prompt, points };
}

// POST /eo/years/bulk-import — bulk import from JSON (month by month)
router.post('/eo/years/bulk-import', adminOnly, async (req, res) => {
  try {
    const { category_id, year, data } = req.body;
    if (!category_id || !year || !data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ error: 'category_id, year, and data array are required' });
    }

    // Ensure year exists
    let yearRow = await req.db.get(
      'SELECT id FROM tcf_eo_years WHERE category_id = ? AND year = ?',
      [category_id, year]
    );
    if (!yearRow) {
      yearRow = await req.db.run(
        'INSERT INTO tcf_eo_years (category_id, year) VALUES (?, ?) RETURNING id',
        [category_id, year]
      );
    }
    const yearId = yearRow.id || yearRow.lastID;

    // Group data by month
    const monthGroups = {};
    for (const entry of data) {
      const monthKey = (entry.month || '').trim();
      if (!monthKey) continue;
      if (!monthGroups[monthKey]) monthGroups[monthKey] = [];
      monthGroups[monthKey].push(entry);
    }

    const summary = { year, months: [], parties_created: 0, taches_created: 0, sujets_created: 0, points_created: 0 };

    for (const [monthKey, monthEntries] of Object.entries(monthGroups)) {
      // Parse month name → number
      const parts = monthKey.split(' ');
      const monthNameLower = (parts[0] || '').toLowerCase();
      const monthNumber = FRENCH_MONTH_MAP[monthNameLower] || 0;
      const monthName = parts[0] || monthKey;
      if (!monthNumber) continue;

      // Ensure month exists
      let monthRow = await req.db.get(
        'SELECT id FROM tcf_eo_months WHERE year_id = ? AND month = ?',
        [yearId, monthNumber]
      );
      if (!monthRow) {
        monthRow = await req.db.run(
          'INSERT INTO tcf_eo_months (year_id, month, month_name) VALUES (?, ?, ?) RETURNING id',
          [yearId, monthNumber, monthName]
        );
      }
      const monthId = monthRow.id || monthRow.lastID;

      const monthSummary = { month: monthName, parties: 0, taches: 0, sujets: 0, points: 0 };

      // Group by partie
      const partieGroups = {};
      for (const entry of monthEntries) {
        const partieKey = (entry.partie || '').trim();
        if (!partieKey) continue;
        if (!partieGroups[partieKey]) partieGroups[partieKey] = [];
        partieGroups[partieKey].push(entry);
      }

      // Sort parties numerically
      const sortedParties = Object.keys(partieGroups).sort((a, b) => {
        const na = parseInt(a.replace(/\D/g, ''), 10) || 0;
        const nb = parseInt(b.replace(/\D/g, ''), 10) || 0;
        return na - nb;
      });

      for (let pi = 0; pi < sortedParties.length; pi++) {
        const partieName = sortedParties[pi];
        const partieEntries = partieGroups[partieName];
        const displayOrder = parseInt(partieName.replace(/\D/g, ''), 10) || (pi + 1);

        // Create partie
        const partieRow = await req.db.run(
          'INSERT INTO tcf_eo_parties (month_id, name, display_order) VALUES (?, ?, ?) RETURNING id',
          [monthId, partieName, displayOrder]
        );
        const partieId = partieRow.id || partieRow.lastID;
        monthSummary.parties++;
        summary.parties_created++;

        // Group entries by task_number
        const taskGroups = {};
        for (const entry of partieEntries) {
          const tn = entry.task_number;
          if (!taskGroups[tn]) taskGroups[tn] = [];
          taskGroups[tn].push(entry);
        }

        for (const [taskNumStr, taskEntries] of Object.entries(taskGroups)) {
          const taskNum = parseInt(taskNumStr, 10);
          const firstEntry = taskEntries[0];
          const taskType = taskNum === 1 ? 'presentation' : taskNum === 2 ? 'interaction' : 'argumentation';
          const prepMinutes = parseDurationToMinutes(firstEntry.preparation_time);
          const durMinutes = parseDurationToMinutes(firstEntry.task_duration);

          let promptText = null;
          if (taskNum === 1) {
            // Extract prompt and points from text
            const parsed = extractPointsAborder(firstEntry.text);
            promptText = parsed.prompt;
          }

          // Create tâche
          const tacheRow = await req.db.run(
            `INSERT INTO tcf_eo_taches (partie_id, task_number, task_type, prompt_text, prep_minutes, duration_minutes)
             VALUES (?, ?, ?, ?, ?, ?) RETURNING id`,
            [partieId, taskNum, taskType, promptText, prepMinutes, durMinutes]
          );
          const tacheId = tacheRow.id || tacheRow.lastID;
          monthSummary.taches++;
          summary.taches_created++;

          if (taskNum === 1) {
            // Create points à aborder
            const parsed = extractPointsAborder(firstEntry.text);
            for (let i = 0; i < parsed.points.length; i++) {
              const pt = parsed.points[i];
              await req.db.run(
                'INSERT INTO tcf_eo_points_aborder (tache_id, point_number, title, subtitle) VALUES (?, ?, ?, ?)',
                [tacheId, i + 1, pt.title, pt.subtitle]
              );
              monthSummary.points++;
              summary.points_created++;
            }
          } else {
            // Create sujets for tâche 2 & 3
            const sorted = taskEntries.sort((a, b) => (a.exercise_number || 0) - (b.exercise_number || 0));
            for (let si = 0; si < sorted.length; si++) {
              const s = sorted[si];
              const durSec = parseDurationToSeconds(s.exercise_duration);
              await req.db.run(
                `INSERT INTO tcf_eo_sujets (tache_id, sujet_number, prompt_text, duration_seconds, correction_text)
                 VALUES (?, ?, ?, ?, ?)`,
                [tacheId, si + 1, s.text || '', durSec || null, s.correction || null]
              );
              monthSummary.sujets++;
              summary.sujets_created++;
            }
          }
        }
      }

      summary.months.push(monthSummary);
    }

    res.status(201).json(summary);
  } catch (error) {
    console.error('POST /eo/years/bulk-import error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// ============================================================
// UNIFIED EXAM ASSIGNMENT ENDPOINTS
// ============================================================

// Valid content types
const VALID_CONTENT_TYPES = [
  'category',
  'ce_series', 'co_series',
  'ee_year', 'ee_month', 'ee_combinaison',
  'eo_year', 'eo_month', 'eo_partie',
];

// group_id / group_name were added after the table existed. Check once per server start,
// not on every request (ALTER TABLE takes a lock on the table).
let assignmentColumnsReady = null;
function ensureAssignmentColumns(db) {
  if (!assignmentColumnsReady) {
    assignmentColumnsReady = (async () => {
      await db.run(`ALTER TABLE tcf_exam_assignments ADD COLUMN IF NOT EXISTS group_id TEXT`);
      await db.run(`ALTER TABLE tcf_exam_assignments ADD COLUMN IF NOT EXISTS group_name TEXT`);
    })().catch(err => {
      assignmentColumnsReady = null;
      console.warn('[exam-assignments] column check failed:', err.message);
    });
  }
  return assignmentColumnsReady;
}

// Display names of assigned content — one query per content type.
const CONTENT_NAME_SQL = {
  category: `SELECT id, name FROM tcf_categories WHERE id = ANY($1::int[])`,
  ce_series: `SELECT id, name FROM tcf_ce_series WHERE id = ANY($1::int[])`,
  co_series: `SELECT id, name FROM tcf_co_series WHERE id = ANY($1::int[])`,
  ee_year: `SELECT id, 'EE ' || year AS name FROM tcf_ee_years WHERE id = ANY($1::int[])`,
  ee_month: `SELECT m.id, m.month_name || ' ' || y.year AS name FROM tcf_ee_months m JOIN tcf_ee_years y ON y.id = m.year_id WHERE m.id = ANY($1::int[])`,
  ee_combinaison: `SELECT id, name FROM tcf_ee_combinaisons WHERE id = ANY($1::int[])`,
  eo_year: `SELECT id, 'EO ' || year AS name FROM tcf_eo_years WHERE id = ANY($1::int[])`,
  eo_month: `SELECT m.id, m.month_name || ' ' || y.year AS name FROM tcf_eo_months m JOIN tcf_eo_years y ON y.id = m.year_id WHERE m.id = ANY($1::int[])`,
  eo_partie: `SELECT id, name FROM tcf_eo_parties WHERE id = ANY($1::int[])`,
};
async function contentNameResolver(db, rows) {
  const idsByType = {};
  for (const r of rows) {
    if (!idsByType[r.content_type]) idsByType[r.content_type] = new Set();
    idsByType[r.content_type].add(Number(r.content_id));
  }
  const names = {};
  for (const [type, ids] of Object.entries(idsByType)) {
    if (!CONTENT_NAME_SQL[type]) continue;
    const found = await db.all(CONTENT_NAME_SQL[type], [Array.from(ids)]);
    for (const f of found) names[`${type}:${f.id}`] = f.name;
  }
  return (type, id) => names[`${type}:${id}`] || `${type} #${id}`;
}

// GET /exam-assignments/content-tree — full content tree for the assignment modal
router.get('/exam-assignments/content-tree', async (req, res) => {
  try {
    // One query per table, assembled in memory (this used to run one query per category, year and month).
    // Sequential on purpose: the app shares a single pg client, which runs one query at a time.
    const categories = await req.db.all(`SELECT id, name, description, icon, display_order FROM tcf_categories ORDER BY display_order ASC, id ASC`);
    const ceSeries = await req.db.all(`SELECT id, category_id, name, description, total_questions, total_points FROM tcf_ce_series ORDER BY name ASC`);
    const coSeries = await req.db.all(`SELECT id, category_id, name, description, total_questions, total_points FROM tcf_co_series ORDER BY name ASC`);
    const eeYears = await req.db.all(`SELECT id, category_id, year FROM tcf_ee_years ORDER BY year DESC`);
    const eeMonths = await req.db.all(`SELECT id, year_id, month, month_name FROM tcf_ee_months ORDER BY month ASC`);
    const eeCombs = await req.db.all(`SELECT id, month_id, name, display_order FROM tcf_ee_combinaisons ORDER BY display_order ASC, id ASC`);
    const eoYears = await req.db.all(`SELECT id, category_id, year FROM tcf_eo_years ORDER BY year DESC`);
    const eoMonths = await req.db.all(`SELECT id, year_id, month, month_name FROM tcf_eo_months ORDER BY month ASC`);
    const eoParties = await req.db.all(`SELECT id, month_id, name, display_order FROM tcf_eo_parties ORDER BY display_order ASC, id ASC`);

    const groupBy = (rows, key) => {
      const m = new Map();
      for (const r of rows) {
        if (!m.has(r[key])) m.set(r[key], []);
        m.get(r[key]).push(r);
      }
      return m;
    };
    const without = (row, key) => { const o = { ...row }; delete o[key]; return o; };
    const ceBy = groupBy(ceSeries, 'category_id');
    const coBy = groupBy(coSeries, 'category_id');
    const eeYearsBy = groupBy(eeYears, 'category_id');
    const eeMonthsBy = groupBy(eeMonths, 'year_id');
    const eeCombsBy = groupBy(eeCombs, 'month_id');
    const eoYearsBy = groupBy(eoYears, 'category_id');
    const eoMonthsBy = groupBy(eoMonths, 'year_id');
    const eoPartiesBy = groupBy(eoParties, 'month_id');

    // EE/EO: category → years → months → combinaisons / parties
    const yearsTree = (years, monthsBy, leavesBy, prefix, leafType) => (years || []).map(y => ({
      ...without(y, 'category_id'), type: `${prefix}_year`, content_id: y.id,
      children: (monthsBy.get(y.id) || []).map(m => ({
        ...without(m, 'year_id'), type: `${prefix}_month`, content_id: m.id,
        children: (leavesBy.get(m.id) || []).map(l => ({ ...without(l, 'month_id'), type: leafType, content_id: l.id })),
      })),
    }));

    const tree = categories.map(cat => {
      const node = { ...cat, type: 'category', children: [] };
      if (cat.name === 'Compréhension Écrite') {
        node.children = (ceBy.get(cat.id) || []).map(s => ({ ...without(s, 'category_id'), type: 'ce_series', content_id: s.id }));
      } else if (cat.name === 'Compréhension Orale') {
        node.children = (coBy.get(cat.id) || []).map(s => ({ ...without(s, 'category_id'), type: 'co_series', content_id: s.id }));
      } else if (cat.name === 'Expression Écrite') {
        node.children = yearsTree(eeYearsBy.get(cat.id), eeMonthsBy, eeCombsBy, 'ee', 'ee_combinaison');
      } else if (cat.name === 'Expression Orale') {
        node.children = yearsTree(eoYearsBy.get(cat.id), eoMonthsBy, eoPartiesBy, 'eo', 'eo_partie');
      }
      return node;
    });

    res.json(tree);
  } catch (error) {
    console.error('GET /exam-assignments/content-tree error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /exam-assignments — create assignments (bulk)
// Body: { items: [{ content_type, content_id }], student_ids: [...], batch_ids: [...], expires_at? }
router.post('/exam-assignments', adminOnly, async (req, res) => {
  try {
    const { items, student_ids = [], batch_ids = [], expires_at, group_name } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items array is required (each with content_type and content_id)' });
    }
    if (student_ids.length === 0 && batch_ids.length === 0) {
      return res.status(400).json({ error: 'At least one student_id or batch_id is required' });
    }

    // Validate content types
    for (const item of items) {
      if (!VALID_CONTENT_TYPES.includes(item.content_type)) {
        return res.status(400).json({ error: `Invalid content_type: ${item.content_type}` });
      }
      if (!item.content_id) {
        return res.status(400).json({ error: 'content_id is required for each item' });
      }
    }

    await ensureAssignmentColumns(req.db);

    // Generate group ID
    const groupId = require('crypto').randomUUID();

    // Use user-provided name, or auto-generate as fallback
    let groupName = group_name?.trim() || '';
    if (!groupName) {
      const nameResolver = async (type, id) => {
        switch (type) {
          case 'category': { const r = await req.db.get('SELECT name FROM tcf_categories WHERE id = $1', [id]); return r?.name || `Category`; }
          case 'ce_series': { const r = await req.db.get('SELECT name FROM tcf_ce_series WHERE id = $1', [id]); return r?.name || `CE Series`; }
          case 'co_series': { const r = await req.db.get('SELECT name FROM tcf_co_series WHERE id = $1', [id]); return r?.name || `CO Series`; }
          case 'ee_year': { const r = await req.db.get('SELECT year FROM tcf_ee_years WHERE id = $1', [id]); return r ? `EE ${r.year}` : `EE Year`; }
          case 'ee_month': { const r = await req.db.get('SELECT month_name FROM tcf_ee_months WHERE id = $1', [id]); return r?.month_name || `EE Month`; }
          case 'ee_combinaison': { const r = await req.db.get('SELECT name FROM tcf_ee_combinaisons WHERE id = $1', [id]); return r?.name || `EE Combinaison`; }
          case 'eo_year': { const r = await req.db.get('SELECT year FROM tcf_eo_years WHERE id = $1', [id]); return r ? `EO ${r.year}` : `EO Year`; }
          case 'eo_month': { const r = await req.db.get('SELECT month_name FROM tcf_eo_months WHERE id = $1', [id]); return r?.month_name || `EO Month`; }
          case 'eo_partie': { const r = await req.db.get('SELECT name FROM tcf_eo_parties WHERE id = $1', [id]); return r?.name || `EO Partie`; }
          default: return `${type} #${id}`;
        }
      };
      const nameParts = [];
      for (const item of items.slice(0, 3)) {
        nameParts.push(await nameResolver(item.content_type, item.content_id));
      }
      groupName = nameParts.join(', ');
      if (items.length > 3) groupName += ` +${items.length - 3} more`;
    }

    const expiresAtValue = expires_at || null;
    // One row per item × recipient, inserted in bulk. Existing (item, recipient) pairs are
    // skipped by the unique indexes and reported as duplicates.
    const studentIdList = Array.from(new Set(student_ids.map(Number).filter(Boolean)));
    const batchIdList = Array.from(new Set(batch_ids.map(Number).filter(Boolean)));
    const rowsToInsert = [];
    for (const item of items) {
      for (const sid of studentIdList) rowsToInsert.push([item.content_type, Number(item.content_id), sid, null]);
      for (const bid of batchIdList) rowsToInsert.push([item.content_type, Number(item.content_id), null, bid]);
    }
    let created = 0;
    const CHUNK = 500;
    for (let i = 0; i < rowsToInsert.length; i += CHUNK) {
      const params = [];
      const values = rowsToInsert.slice(i, i + CHUNK).map(([type, contentId, sid, bid]) => {
        params.push(type, contentId, sid, bid, expiresAtValue, req.user.id, groupId, groupName);
        const b = params.length - 8;
        return `($${b + 1}, $${b + 2}, $${b + 3}, $${b + 4}, $${b + 5}, $${b + 6}, $${b + 7}, $${b + 8})`;
      });
      const inserted = await req.db.all(
        `INSERT INTO tcf_exam_assignments (content_type, content_id, student_id, batch_id, expires_at, assigned_by, group_id, group_name)
         VALUES ${values.join(', ')}
         ON CONFLICT DO NOTHING
         RETURNING id`,
        params
      );
      created += inserted.length;
    }
    const duplicates = rowsToInsert.length - created;

    // Grant AI credits to all recipients (students directly + students in assigned batches).
    // Wrapped in try/catch so a credit grant failure NEVER blocks the assignment itself.
    try {
      const eeCredits = parseInt(req.body.ee_credits) || 0;
      const eoCredits = parseInt(req.body.eo_credits) || 0;
      if (eeCredits > 0 || eoCredits > 0) {
        const aiCredits = require('../services/aiCreditService');

        // Collect all student IDs (direct + via batches)
        const directIds = Array.isArray(student_ids) ? student_ids.map(Number).filter(Boolean) : [];
        const batchIdList = Array.isArray(batch_ids) ? batch_ids.map(Number).filter(Boolean) : [];
        let allStudentIds = [...directIds];
        if (batchIdList.length > 0) {
          const placeholders = batchIdList.map((_, i) => `$${i + 1}`).join(',');
          const rows = await req.db.all(
            `SELECT DISTINCT student_id FROM batch_students WHERE batch_id IN (${placeholders})`,
            batchIdList
          );
          allStudentIds.push(...rows.map(r => r.student_id));
        }
        // Dedupe
        allStudentIds = Array.from(new Set(allStudentIds.filter(Boolean)));
        if (allStudentIds.length > 0) {
          await aiCredits.bulkGrant(req.db, allStudentIds, eeCredits, eoCredits, {
            reason: 'admin_grant',
            actor_id: req.user.id,
            related_entity_type: 'tcf_exam_assignment',
            related_entity_id: null,
            notes: groupName || null,
          });
        }
      }
    } catch (creditErr) {
      console.warn('[ai-credits] Failed to grant on assignment:', creditErr.message);
    }

    res.status(201).json({ created, duplicates, group_id: groupId });
  } catch (error) {
    console.error('POST /exam-assignments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /exam-assignments — list all assignments GROUPED
router.get('/exam-assignments', async (req, res) => {
  try {
    await ensureAssignmentColumns(req.db);

    const assignments = await req.db.all(`
      SELECT a.id, a.content_type, a.content_id, a.student_id, a.batch_id,
             a.expires_at, a.assigned_by, a.assigned_at, a.group_id, a.group_name,
             u.first_name AS student_first_name, u.last_name AS student_last_name, u.email AS student_email,
             b.name AS batch_name,
             ab.first_name AS assigned_by_first, ab.last_name AS assigned_by_last
      FROM tcf_exam_assignments a
      LEFT JOIN users u ON a.student_id = u.id
      LEFT JOIN batches b ON a.batch_id = b.id
      LEFT JOIN users ab ON a.assigned_by = ab.id
      ORDER BY a.assigned_at DESC
    `);

    const nameOf = await contentNameResolver(req.db, assignments);

    // Group by group_id (or by individual id for legacy rows without group_id)
    const groups = {};
    for (const a of assignments) {
      a.content_name = nameOf(a.content_type, a.content_id);
      a.is_expired = a.expires_at ? new Date(a.expires_at) < new Date() : false;

      const gid = a.group_id || `single_${a.id}`;
      if (!groups[gid]) {
        groups[gid] = {
          group_id: gid,
          group_name: a.group_name || a.content_name,
          assigned_at: a.assigned_at,
          expires_at: a.expires_at,
          is_expired: a.is_expired,
          assigned_by: a.assigned_by ? `${a.assigned_by_first} ${a.assigned_by_last}` : null,
          recipients: [],
          items: [],
          item_ids: [],
        };
      }
      const g = groups[gid];

      // Add unique content items
      const itemKey = `${a.content_type}:${a.content_id}`;
      if (!g.item_ids.includes(itemKey)) {
        g.item_ids.push(itemKey);
        g.items.push({ id: a.id, content_type: a.content_type, content_id: a.content_id, content_name: a.content_name });
      }

      // Add unique recipients
      const recipientKey = a.student_id ? `student:${a.student_id}` : `batch:${a.batch_id}`;
      if (!g.recipients.find(r => r.key === recipientKey)) {
        g.recipients.push({
          key: recipientKey,
          type: a.student_id ? 'student' : 'batch',
          name: a.student_id ? `${a.student_first_name} ${a.student_last_name}` : a.batch_name,
        });
      }
    }

    res.json(Object.values(groups));
  } catch (error) {
    console.error('GET /exam-assignments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /exam-assignments/group/:groupId — remove entire group (MUST be before /:id)
router.delete('/exam-assignments/group/:groupId', adminOnly, async (req, res) => {
  try {
    const { groupId } = req.params;
    if (groupId && groupId.startsWith('single_')) {
      const id = parseInt(groupId.replace('single_', ''), 10);
      const result = await req.db.run('DELETE FROM tcf_exam_assignments WHERE id = $1', [id]);
      res.json({ message: 'Assignment removed', deleted: result.changes || 0 });
    } else {
      const result = await req.db.run('DELETE FROM tcf_exam_assignments WHERE group_id = $1', [groupId]);
      res.json({ message: 'Assignment group removed', deleted: result.changes || 0 });
    }
  } catch (error) {
    console.error('DELETE /exam-assignments/group error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /exam-assignments/:id — remove a single assignment
router.delete('/exam-assignments/:id', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await req.db.get('SELECT id FROM tcf_exam_assignments WHERE id = $1', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    await req.db.run('DELETE FROM tcf_exam_assignments WHERE id = $1', [id]);
    res.json({ message: 'Assignment removed' });
  } catch (error) {
    console.error('DELETE /exam-assignments/:id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// STUDENT CONTENT TREE — returns all categories with frozen/assigned status
// ============================================================
// ============================================================
// STUDENT CONTENT TREE (loaded lazily, one level at a time)
// Access is resolved in memory from ONE assignments query plus a few
// set-based queries per level. The previous version ran queries inside
// nested year × month loops, which made every level slow on a remote DB.
// ============================================================

const SERIES_CATEGORIES = {
  'Compréhension Écrite': { table: 'tcf_ce_series', type: 'ce_series' },
  'Compréhension Orale': { table: 'tcf_co_series', type: 'co_series' },
};
const EXPRESSION_CATEGORIES = {
  'Expression Écrite': { years: 'tcf_ee_years', months: 'tcf_ee_months', leaves: 'tcf_ee_combinaisons', year: 'ee_year', month: 'ee_month', leaf: 'ee_combinaison' },
  'Expression Orale': { years: 'tcf_eo_years', months: 'tcf_eo_months', leaves: 'tcf_eo_parties', year: 'eo_year', month: 'eo_month', leaf: 'eo_partie' },
};
const EXPRESSION_BY_TYPE = {
  ee_year: EXPRESSION_CATEGORIES['Expression Écrite'], ee_month: EXPRESSION_CATEGORIES['Expression Écrite'],
  eo_year: EXPRESSION_CATEGORIES['Expression Orale'], eo_month: EXPRESSION_CATEGORIES['Expression Orale'],
};
const NOT_ASSIGNED = Object.freeze({ is_assigned: false, is_expired: false });

/**
 * The student's own track record on a list of practice items, in one query:
 * completed attempts, best score, last attempt, and (writing) an attempt still
 * open plus the theme of task 3, which is what tells combinations apart.
 * Scores: writing and speaking on 20, listening in TCF points (0–699).
 */
const LEAF_PROGRESS_SQL = {
  ee_combinaison: `
    SELECT l.id,
           (SELECT NULLIF(TRIM(t.question_text), '') FROM tcf_ee_taches t WHERE t.combinaison_id = l.id AND t.task_number = 3 LIMIT 1) AS theme,
           COALESCE(s.attempts, 0) AS attempts, s.best, s.last_at, COALESCE(s.running, false) AS running
      FROM unnest($2::int[]) AS l(id)
      LEFT JOIN (
        SELECT combinaison_id,
               COUNT(*) FILTER (WHERE status = 'completed')::int AS attempts,
               MAX(average_score) FILTER (WHERE status = 'completed') AS best,
               MAX(COALESCE(submitted_at, started_at)) FILTER (WHERE status = 'completed') AS last_at,
               bool_or(status IN ('in_progress', 'error')) AS running
          FROM tcf_ee_simulations WHERE student_id = $1 AND combinaison_id = ANY($2::int[])
         GROUP BY combinaison_id
      ) s ON s.combinaison_id = l.id`,
  eo_partie: `
    SELECT l.id, NULL AS theme, COALESCE(s.attempts, 0) AS attempts, s.best, s.last_at, false AS running
      FROM unnest($2::int[]) AS l(id)
      LEFT JOIN (
        SELECT partie_id, COUNT(*)::int AS attempts, MAX(overall_score) AS best, MAX(completed_at) AS last_at
          FROM eo_simulations WHERE user_id = $1 AND status = 'completed' AND partie_id = ANY($2::int[])
         GROUP BY partie_id
      ) s ON s.partie_id = l.id`,
  co_series: `
    SELECT l.id, NULL AS theme, COALESCE(s.attempts, 0) AS attempts, s.best, s.last_at, false AS running
      FROM unnest($2::int[]) AS l(id)
      LEFT JOIN (
        SELECT series_id, COUNT(*)::int AS attempts, MAX(earned_points) AS best, MAX(completed_at) AS last_at
          FROM tcf_co_quiz_attempts WHERE student_id = $1 AND completed_at IS NOT NULL AND series_id = ANY($2::int[])
         GROUP BY series_id
      ) s ON s.series_id = l.id`,
};

async function attachLeafProgress(db, studentId, leaves) {
  const type = leaves[0]?.type;
  const sql = LEAF_PROGRESS_SQL[type];
  if (!sql || !leaves.length) return leaves;
  try {
    const rows = await db.all(sql, [studentId, leaves.map(l => l.content_id)]);
    const byId = new Map(rows.map(r => [Number(r.id), r]));
    return leaves.map(l => {
      const r = byId.get(Number(l.content_id));
      if (!r) return l;
      return {
        ...l,
        theme: r.theme || null,
        progress: {
          attempts: Number(r.attempts) || 0,
          best: r.best == null ? null : Number(r.best),
          last_at: r.last_at || null,
          running: !!r.running,
        },
      };
    });
  } catch (err) {
    // Progress is a convenience: never let it break the list itself.
    console.error('attachLeafProgress failed:', err.message);
    return leaves;
  }
}

/** "content_type:content_id" → { is_assigned, is_expired } for direct and batch assignments. */
async function loadStudentAssignmentMap(db, studentId) {
  const rows = await db.all(`
    SELECT content_type, content_id, expires_at FROM tcf_exam_assignments WHERE student_id = $1
    UNION ALL
    SELECT a.content_type, a.content_id, a.expires_at
    FROM tcf_exam_assignments a
    JOIN batch_students bs ON bs.batch_id = a.batch_id
    WHERE bs.student_id = $1
  `, [studentId]);
  const now = new Date();
  const map = {};
  for (const a of rows) {
    const key = `${a.content_type}:${a.content_id}`;
    const isExpired = a.expires_at ? new Date(a.expires_at) < now : false;
    if (!map[key] || (!isExpired && map[key].is_expired)) map[key] = { is_assigned: true, is_expired: isExpired };
  }
  return map;
}

const accessOf = (map, type, id) => map[`${type}:${id}`] || NOT_ASSIGNED;
const isActiveAccess = (access) => !!(access && access.is_assigned && !access.is_expired);

/** A child counts as assigned when it or its parent is; it is expired unless one of them is still active. */
const inheritAccess = (map, type, id, parent) => {
  const own = accessOf(map, type, id);
  const is_assigned = !!(parent.is_assigned || own.is_assigned);
  return { is_assigned, is_expired: is_assigned && !(isActiveAccess(own) || isActiveAccess(parent)) };
};

const groupBy = (rows, key) => {
  const out = new Map();
  for (const r of rows) {
    if (!out.has(r[key])) out.set(r[key], []);
    out.get(r[key]).push(r);
  }
  return out;
};

/** Months of the given years and the leaves of those months — two queries in total. */
async function loadMonthsAndLeaves(db, cfg, yearIds) {
  if (!yearIds.length) return { monthsByYear: new Map(), leavesByMonth: new Map() };
  const months = await db.all(`SELECT id, year_id FROM ${cfg.months} WHERE year_id = ANY($1)`, [yearIds]);
  const monthIds = months.map(m => m.id);
  const leaves = monthIds.length
    ? await db.all(`SELECT id, month_id FROM ${cfg.leaves} WHERE month_id = ANY($1)`, [monthIds])
    : [];
  return { monthsByYear: groupBy(months, 'year_id'), leavesByMonth: groupBy(leaves, 'month_id') };
}

/** Directly-assigned (not inherited) active content below a month / year. */
const monthHasActiveLeaf = (map, cfg, leaves) => (leaves || []).some(l => isActiveAccess(accessOf(map, cfg.leaf, l.id)));
const yearHasActiveChildren = (map, cfg, months, leavesByMonth) => (months || []).some(m =>
  isActiveAccess(accessOf(map, cfg.month, m.id)) || monthHasActiveLeaf(map, cfg, leavesByMonth.get(m.id)));

// GET /student/content-tree — the four skill categories with availability counts
router.get('/student/content-tree', async (req, res) => {
  try {
    const map = await loadStudentAssignmentMap(req.db, req.user.id);
    const hasActivePrefix = (...types) => Object.entries(map).some(([key, access]) =>
      isActiveAccess(access) && types.some(t => key.startsWith(`${t}:`)));

    const categories = await req.db.all(
      `SELECT id, name, description, icon, display_order FROM tcf_categories ORDER BY display_order ASC`
    );

    const tree = [];
    for (const cat of categories) {
      const catAccess = accessOf(map, 'category', cat.id);
      const catActive = isActiveAccess(catAccess);
      const seriesCfg = SERIES_CATEGORIES[cat.name];
      const exprCfg = EXPRESSION_CATEGORIES[cat.name];
      let total_count = 0;
      let available_count = 0;
      let child_type = '';
      let has_assigned_children = false;

      if (seriesCfg) {
        const series = await req.db.all(`SELECT id FROM ${seriesCfg.table} WHERE category_id = $1`, [cat.id]);
        total_count = series.length;
        available_count = series.filter(s => catActive || isActiveAccess(accessOf(map, seriesCfg.type, s.id))).length;
        child_type = seriesCfg.type;
        has_assigned_children = hasActivePrefix(seriesCfg.type);
      } else if (exprCfg) {
        const years = await req.db.all(`SELECT id FROM ${exprCfg.years} WHERE category_id = $1`, [cat.id]);
        const { monthsByYear, leavesByMonth } = await loadMonthsAndLeaves(req.db, exprCfg, years.map(y => y.id));
        total_count = years.length;
        available_count = years.filter(y =>
          catActive
          || isActiveAccess(accessOf(map, exprCfg.year, y.id))
          || yearHasActiveChildren(map, exprCfg, monthsByYear.get(y.id), leavesByMonth)
        ).length;
        child_type = exprCfg.year;
        has_assigned_children = hasActivePrefix(exprCfg.year, exprCfg.month, exprCfg.leaf);
      }

      tree.push({
        ...cat,
        type: 'category',
        is_assigned: catAccess.is_assigned,
        is_expired: catAccess.is_expired,
        has_assigned_children,
        total_count,
        available_count,
        child_type,
        children: [],
      });
    }

    res.json(tree);
  } catch (error) {
    console.error('GET /student/content-tree error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /student/content-tree/children — immediate children of one node
router.get('/student/content-tree/children', async (req, res) => {
  try {
    const { parentType, parentId } = req.query;
    if (!parentType || !parentId) {
      return res.status(400).json({ error: 'Missing parentType or parentId' });
    }
    const pid = Number(parentId);
    if (!Number.isInteger(pid)) return res.status(400).json({ error: 'Invalid parentId' });

    const map = await loadStudentAssignmentMap(req.db, req.user.id);
    let children = [];

    if (parentType === 'category') {
      const category = await req.db.get(`SELECT name FROM tcf_categories WHERE id = $1`, [pid]);
      if (!category) return res.status(404).json({ error: 'Category not found' });
      const catAccess = accessOf(map, 'category', pid);
      const seriesCfg = SERIES_CATEGORIES[category.name];
      const exprCfg = EXPRESSION_CATEGORIES[category.name];

      if (seriesCfg) {
        const series = await req.db.all(
          `SELECT id, name, description, total_questions, total_points FROM ${seriesCfg.table} WHERE category_id = $1 ORDER BY name ASC`,
          [pid]
        );
        children = series.map(s => ({
          ...s, type: seriesCfg.type, content_id: s.id,
          ...inheritAccess(map, seriesCfg.type, s.id, catAccess),
        }));
      } else if (exprCfg) {
        const years = await req.db.all(
          `SELECT id, year FROM ${exprCfg.years} WHERE category_id = $1 ORDER BY year DESC`,
          [pid]
        );
        const { monthsByYear, leavesByMonth } = await loadMonthsAndLeaves(req.db, exprCfg, years.map(y => y.id));
        children = years.map(y => {
          const access = inheritAccess(map, exprCfg.year, y.id, catAccess);
          const months = monthsByYear.get(y.id) || [];
          return {
            ...y, type: exprCfg.year, content_id: y.id,
            ...access,
            has_assigned_children: yearHasActiveChildren(map, exprCfg, months, leavesByMonth),
            total_count: months.length,
            available_count: months.filter(m =>
              isActiveAccess(access)
              || isActiveAccess(accessOf(map, exprCfg.month, m.id))
              || monthHasActiveLeaf(map, exprCfg, leavesByMonth.get(m.id))
            ).length,
            child_type: exprCfg.month,
            children: [],
          };
        });
      }
    } else if (parentType === 'ee_year' || parentType === 'eo_year') {
      const cfg = EXPRESSION_BY_TYPE[parentType];
      const yearRow = await req.db.get(`SELECT category_id FROM ${cfg.years} WHERE id = $1`, [pid]);
      const catAccess = yearRow ? accessOf(map, 'category', yearRow.category_id) : NOT_ASSIGNED;
      const yearAccess = inheritAccess(map, cfg.year, pid, catAccess);

      const months = await req.db.all(
        `SELECT id, month, month_name FROM ${cfg.months} WHERE year_id = $1 ORDER BY month ASC`,
        [pid]
      );
      const leaves = months.length
        ? await req.db.all(`SELECT id, month_id FROM ${cfg.leaves} WHERE month_id = ANY($1)`, [months.map(m => m.id)])
        : [];
      const leavesByMonth = groupBy(leaves, 'month_id');

      children = months.map(m => {
        const monthAccess = inheritAccess(map, cfg.month, m.id, yearAccess);
        const monthLeaves = leavesByMonth.get(m.id) || [];
        return {
          ...m, type: cfg.month, content_id: m.id,
          ...monthAccess,
          has_assigned_children: monthHasActiveLeaf(map, cfg, monthLeaves),
          total_count: monthLeaves.length,
          available_count: monthLeaves.filter(l => isActiveAccess(inheritAccess(map, cfg.leaf, l.id, monthAccess))).length,
          child_type: cfg.leaf,
          children: [],
        };
      });
    } else if (parentType === 'ee_month' || parentType === 'eo_month') {
      const cfg = EXPRESSION_BY_TYPE[parentType];
      const monthRow = await req.db.get(`
        SELECT y.id AS year_id, y.category_id
        FROM ${cfg.months} m
        JOIN ${cfg.years} y ON m.year_id = y.id
        WHERE m.id = $1
      `, [pid]);
      let monthAccess = NOT_ASSIGNED;
      if (monthRow) {
        const catAccess = accessOf(map, 'category', monthRow.category_id);
        const yearAccess = inheritAccess(map, cfg.year, monthRow.year_id, catAccess);
        monthAccess = inheritAccess(map, cfg.month, pid, yearAccess);
      }
      const leaves = await req.db.all(
        `SELECT id, name, display_order FROM ${cfg.leaves} WHERE month_id = $1 ORDER BY display_order ASC`,
        [pid]
      );
      children = leaves.map(l => ({
        ...l, type: cfg.leaf, content_id: l.id,
        ...inheritAccess(map, cfg.leaf, l.id, monthAccess),
      }));
    }

    res.json(await attachLeafProgress(req.db, req.user.id, children));
  } catch (error) {
    console.error('GET /student/content-tree/children error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// STUDENT CO QUIZ TAKING
// ============================================================

const MAX_ATTEMPTS = 10;

// Helper: compute CEFR level from earned points using official TCF scale
// A1: 100–199, A2: 200–299, B1: 300–399, B2: 400–499, C1: 500–599, C2: 600–699
function computeCefrLevel(earnedPoints) {
  if (earnedPoints >= 600) return 'C2';
  if (earnedPoints >= 500) return 'C1';
  if (earnedPoints >= 400) return 'B2';
  if (earnedPoints >= 300) return 'B1';
  if (earnedPoints >= 200) return 'A2';
  return 'A1';
}

// GET /student/co/series/:id — series info + questions (NO correct answers)
router.get('/student/co/series/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const hasAccess = await checkExamAccess(req.db, req.user.id, 'co_series', id);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied: Exam content is not assigned or has expired.' });
    }

    const series = await req.db.get('SELECT * FROM tcf_co_series WHERE id = $1', [id]);
    if (!series) return res.status(404).json({ error: 'Series not found' });

    const questions = await req.db.all(`
      SELECT id, question_order, question_text, option_a, option_b, option_c, option_d,
        cefr_level, points,
        CASE WHEN audio_kdrive_file_id IS NOT NULL THEN true ELSE false END AS has_audio,
        CASE WHEN image_kdrive_file_id IS NOT NULL THEN true ELSE false END AS has_image
      FROM tcf_co_questions WHERE series_id = $1 ORDER BY question_order ASC
    `, [id]);

    // Get student's best attempt
    const userId = req.user?.id;
    let bestAttempt = null;
    let attemptCount = 0;
    if (userId) {
      bestAttempt = await req.db.get(
        `SELECT score_percentage, cefr_level, earned_points, total_points 
         FROM tcf_co_quiz_attempts WHERE series_id = $1 AND student_id = $2 AND completed_at IS NOT NULL
         ORDER BY earned_points DESC LIMIT 1`, [id, userId]
      );
      const countRes = await req.db.get(
        'SELECT COUNT(*) AS cnt FROM tcf_co_quiz_attempts WHERE series_id = $1 AND student_id = $2 AND completed_at IS NOT NULL',
        [id, userId]
      );
      attemptCount = countRes?.cnt || 0;
    }

    res.json({
      ...series,
      questions,
      best_attempt: bestAttempt,
      attempt_count: attemptCount,
      max_attempts: MAX_ATTEMPTS,
    });
  } catch (error) {
    console.error('GET /student/co/series/:id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /student/co/series/:id/start — create new attempt
router.post('/student/co/series/:id/start', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const hasAccess = await checkExamAccess(req.db, userId, 'co_series', id);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied: Exam content is not assigned or has expired.' });
    }

    const series = await req.db.get('SELECT id, total_questions, total_points FROM tcf_co_series WHERE id = $1', [id]);
    if (!series) return res.status(404).json({ error: 'Series not found' });

    // No attempt limit — keep all history

    // Delete any incomplete attempts for this series
    await req.db.run(
      'DELETE FROM tcf_co_quiz_attempts WHERE series_id = $1 AND student_id = $2 AND completed_at IS NULL',
      [id, userId]
    );

    const result = await req.db.get(
      `INSERT INTO tcf_co_quiz_attempts (series_id, student_id, total_questions, total_points)
       VALUES ($1, $2, $3, $4) RETURNING id, started_at`,
      [id, userId, series.total_questions, series.total_points]
    );

    res.json({ attempt_id: result.id, started_at: result.started_at });
  } catch (error) {
    console.error('POST /student/co/series/:id/start error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /student/co/series/:id/submit — submit answers and auto-grade
router.post('/student/co/series/:id/submit', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { attempt_id, answers, is_auto_submitted } = req.body;

    if (!attempt_id || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'attempt_id and answers array required' });
    }

    // Verify attempt belongs to this user and is not completed
    const attempt = await req.db.get(
      'SELECT * FROM tcf_co_quiz_attempts WHERE id = $1 AND student_id = $2 AND series_id = $3 AND completed_at IS NULL',
      [attempt_id, userId, id]
    );
    if (!attempt) return res.status(404).json({ error: 'Attempt not found or already submitted' });

    // Get correct answers
    const questions = await req.db.all(
      'SELECT id, correct_answer, points, cefr_level FROM tcf_co_questions WHERE series_id = $1 ORDER BY question_order ASC',
      [id]
    );


    // Grade
    const questionMap = {};
    for (const q of questions) questionMap[q.id] = q;

    let correctCount = 0;
    let earnedPoints = 0;
    const gradedAnswers = [];

    for (const ans of answers) {
      const q = questionMap[ans.question_id];
      if (!q) continue;
      const isCorrect = ans.selected_answer === q.correct_answer;
      if (isCorrect) { correctCount++; earnedPoints += parseFloat(q.points); }
      gradedAnswers.push({
        question_id: ans.question_id,
        selected_answer: ans.selected_answer || null,
        correct_answer: q.correct_answer,
        is_correct: isCorrect,
        points: parseFloat(q.points),
        cefr_level: q.cefr_level,
      });
    }

    const totalPoints = questions.reduce((s, q) => s + parseFloat(q.points), 0);
    const scorePercentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const cefrLevel = computeCefrLevel(earnedPoints);

    // Calculate time spent
    const startedAt = new Date(attempt.started_at);
    const timeSpent = Math.floor((Date.now() - startedAt.getTime()) / 1000);

    await req.db.run(
      `UPDATE tcf_co_quiz_attempts SET 
        completed_at = CURRENT_TIMESTAMP, time_spent_seconds = $1,
        correct_count = $2, earned_points = $3, total_points = $4,
        score_percentage = $5, cefr_level = $6, is_auto_submitted = $7,
        answers = $8
       WHERE id = $9`,
      [timeSpent, correctCount, earnedPoints, totalPoints, scorePercentage, cefrLevel,
       is_auto_submitted || false, JSON.stringify(gradedAnswers), attempt_id]
    );

    res.json({
      attempt_id,
      correct_count: correctCount,
      total_questions: questions.length,
      earned_points: earnedPoints,
      total_points: totalPoints,
      score_percentage: scorePercentage,
      cefr_level: cefrLevel,
      time_spent_seconds: timeSpent,
      is_auto_submitted: is_auto_submitted || false,
      answers: gradedAnswers,
    });
  } catch (error) {
    console.error('POST /student/co/series/:id/submit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /student/co/series/:id/attempts — all attempts for analytics
router.get('/student/co/series/:id/attempts', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const hasAccess = await checkExamAccess(req.db, userId, 'co_series', id);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied: Exam content is not assigned or has expired.' });
    }

    const attempts = await req.db.all(
      `SELECT id, started_at, completed_at, time_spent_seconds, total_questions,
        correct_count, total_points, earned_points, score_percentage, cefr_level, is_auto_submitted
       FROM tcf_co_quiz_attempts 
       WHERE series_id = $1 AND student_id = $2 AND completed_at IS NOT NULL
       ORDER BY completed_at DESC`,
      [id, userId]
    );

    // Compute analytics
    const best = attempts.reduce((b, a) => (a.earned_points > (b?.earned_points || 0) ? a : b), null);
    const avg = attempts.length > 0
      ? Math.round(attempts.reduce((s, a) => s + parseFloat(a.score_percentage), 0) / attempts.length)
      : 0;

    // CEFR breakdown from latest attempt
    let cefrBreakdown = null;
    if (attempts.length > 0) {
      const latest = await req.db.get(
        'SELECT answers FROM tcf_co_quiz_attempts WHERE id = $1', [attempts[0].id]
      );
      if (latest?.answers) {
        const ans = typeof latest.answers === 'string' ? JSON.parse(latest.answers) : latest.answers;
        const breakdown = {};
        for (const a of ans) {
          if (!breakdown[a.cefr_level]) breakdown[a.cefr_level] = { total: 0, correct: 0 };
          breakdown[a.cefr_level].total++;
          if (a.is_correct) breakdown[a.cefr_level].correct++;
        }
        cefrBreakdown = breakdown;
      }
    }

    res.json({
      attempts,
      best_attempt: best,
      average_score: avg,
      attempt_count: attempts.length,
      max_attempts: MAX_ATTEMPTS,
      cefr_breakdown: cefrBreakdown,
    });
  } catch (error) {
    console.error('GET /student/co/series/:id/attempts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// GET /student/co/global-analytics — overall CO performance across all series
router.get('/student/co/global-analytics', async (req, res) => {
  try {
    const userId = req.user.id;
    const attempts = await req.db.all(
      `SELECT a.id, a.series_id, a.started_at, a.completed_at, a.time_spent_seconds,
        a.total_questions, a.correct_count, a.total_points, a.earned_points,
        a.score_percentage, a.is_auto_submitted,
        s.name AS series_name
       FROM tcf_co_quiz_attempts a
       JOIN tcf_co_series s ON s.id = a.series_id
       WHERE a.student_id = $1 AND a.completed_at IS NOT NULL
       ORDER BY a.completed_at DESC`,
      [userId]
    );
    if (attempts.length === 0) {
      return res.json({
        total_attempts: 0, series_count: 0, overall_level: null,
        overall_earned: 0, overall_total: 0,
        series_breakdown: [], cefr_distribution: {},
        recent_attempts: [], score_progression: [],
      });
    }
    const seriesMap = {};
    for (const a of attempts) {
      if (!seriesMap[a.series_id]) {
        seriesMap[a.series_id] = {
          series_id: a.series_id, series_name: a.series_name,
          attempts: 0, best_earned: 0, best_total: 0,
          latest_earned: 0, latest_total: 0, latest_date: null,
        };
      }
      const s = seriesMap[a.series_id];
      s.attempts++;
      if (a.earned_points > s.best_earned) { s.best_earned = a.earned_points; s.best_total = a.total_points; }
      if (!s.latest_date || new Date(a.completed_at) > new Date(s.latest_date)) {
        s.latest_earned = a.earned_points; s.latest_total = a.total_points; s.latest_date = a.completed_at;
      }
    }
    const seriesBreakdown = Object.values(seriesMap);
    const bestScores = seriesBreakdown.map(s => s.best_earned);
    const avgBest = Math.round(bestScores.reduce((a, b) => a + b, 0) / bestScores.length);
    const overallLevel = computeCefrLevel(avgBest);
    const cefrDist = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
    for (const a of attempts) { cefrDist[computeCefrLevel(a.earned_points)]++; }
    const progression = [...attempts].reverse().slice(-20).map(a => ({
      date: a.completed_at, earned: a.earned_points, total: a.total_points,
      series: a.series_name, level: computeCefrLevel(a.earned_points),
    }));
    const recent = attempts.slice(0, 10).map(a => ({
      id: a.id, series_name: a.series_name,
      earned_points: a.earned_points, total_points: a.total_points,
      correct_count: a.correct_count, total_questions: a.total_questions,
      level: computeCefrLevel(a.earned_points),
      completed_at: a.completed_at, time_spent_seconds: a.time_spent_seconds,
    }));
    res.json({
      total_attempts: attempts.length,
      series_count: seriesBreakdown.length,
      overall_level: overallLevel,
      overall_earned: avgBest,
      overall_total: seriesBreakdown.length > 0 ? Math.round(seriesBreakdown.reduce((s, b) => s + b.best_total, 0) / seriesBreakdown.length) : 699,
      series_breakdown: seriesBreakdown,
      cefr_distribution: cefrDist,
      recent_attempts: recent,
      score_progression: progression,
    });
  } catch (error) {
    console.error('GET /student/co/global-analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /student/co/attempts/:attemptId/correction — full correction for one attempt
router.get('/student/co/attempts/:attemptId/correction', async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;

    const attempt = await req.db.get(
      `SELECT a.*, s.name AS series_name, s.cefr_thresholds
       FROM tcf_co_quiz_attempts a
       JOIN tcf_co_series s ON s.id = a.series_id
       WHERE a.id = $1 AND a.student_id = $2 AND a.completed_at IS NOT NULL`,
      [attemptId, userId]
    );
    if (!attempt) return res.status(404).json({ error: 'Attempt not found' });

    // Get questions with full details for correction display
    const questions = await req.db.all(`
      SELECT id, question_order, question_text, option_a, option_b, option_c, option_d,
        correct_answer, cefr_level, points,
        CASE WHEN audio_kdrive_file_id IS NOT NULL THEN true ELSE false END AS has_audio,
        CASE WHEN image_kdrive_file_id IS NOT NULL THEN true ELSE false END AS has_image
      FROM tcf_co_questions WHERE series_id = $1 ORDER BY question_order ASC
    `, [attempt.series_id]);

    const answers = typeof attempt.answers === 'string' ? JSON.parse(attempt.answers) : attempt.answers;

    res.json({
      ...attempt,
      questions,
      answers,
    });
  } catch (error) {
    console.error('GET /student/co/attempts/:attemptId/correction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Exam media (question audio / images, intro audio) ─────────────────────
// Every student of a series downloads the same files, so recently used files
// are kept in memory instead of making a kDrive round trip for each question.
// Least-recently-used entries are evicted past the size budget.
const MEDIA_CACHE_MAX_BYTES = (Number(process.env.EXAM_MEDIA_CACHE_MB) || 150) * 1024 * 1024;
const MEDIA_CACHE_TTL_MS = 60 * 60 * 1000;
const MEDIA_MAX_ITEM_BYTES = 25 * 1024 * 1024;
const mediaCache = new Map(); // fileId → { buf, at }; Map order doubles as LRU order
const mediaInflight = new Map(); // fileId → Promise<Buffer>, so concurrent requests share one download
let mediaCacheBytes = 0;

async function getExamMedia(fileId) {
  const key = String(fileId);
  const hit = mediaCache.get(key);
  if (hit) {
    mediaCache.delete(key);
    if (Date.now() - hit.at < MEDIA_CACHE_TTL_MS) {
      mediaCache.set(key, hit); // mark as most recently used
      return hit.buf;
    }
    mediaCacheBytes -= hit.buf.length;
  }
  if (mediaInflight.has(key)) return mediaInflight.get(key);
  const job = getKDriveService().downloadFileAsBuffer(fileId)
    .then((buf) => {
      if (buf.length <= MEDIA_MAX_ITEM_BYTES) {
        mediaCache.set(key, { buf, at: Date.now() });
        mediaCacheBytes += buf.length;
        for (const [k, v] of mediaCache) {
          if (mediaCacheBytes <= MEDIA_CACHE_MAX_BYTES) break;
          mediaCache.delete(k);
          mediaCacheBytes -= v.buf.length;
        }
      }
      return buf;
    })
    .finally(() => mediaInflight.delete(key));
  mediaInflight.set(key, job);
  return job;
}

// Per-student access to a series, remembered briefly so preloading a series'
// media doesn't re-check assignments for every file.
const SERIES_ACCESS_TTL_MS = 5 * 60 * 1000;
const seriesAccessCache = new Map(); // "studentId:seriesId" → { ok, at }

async function canUseCoSeries(db, studentId, seriesId) {
  const key = `${studentId}:${seriesId}`;
  const hit = seriesAccessCache.get(key);
  if (hit && Date.now() - hit.at < SERIES_ACCESS_TTL_MS) return hit.ok;
  const ok = !!(await checkExamAccess(db, studentId, 'co_series', seriesId));
  if (seriesAccessCache.size > 5000) seriesAccessCache.clear();
  seriesAccessCache.set(key, { ok, at: Date.now() });
  return ok;
}

function sendExamMedia(res, buf, contentType) {
  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Length', buf.length);
  res.end(buf);
}

// GET /student/co/questions/:id/audio — SECURE audio
router.get('/student/co/questions/:id/audio', async (req, res) => {
  try {
    const question = await req.db.get(
      'SELECT series_id, audio_kdrive_file_id FROM tcf_co_questions WHERE id = $1', [req.params.id]
    );
    if (!question || !question.audio_kdrive_file_id) return res.status(404).json({ error: 'Audio not found' });
    if (!(await canUseCoSeries(req.db, req.user.id, question.series_id))) {
      return res.status(403).json({ error: 'Access denied: Exam content is not assigned or has expired.' });
    }
    const buf = await getExamMedia(question.audio_kdrive_file_id);
    // Served as generic binary to discourage download managers; the player applies the audio MIME type.
    sendExamMedia(res, buf, 'application/octet-stream');
  } catch (error) {
    console.error('GET /student/co/questions/:id/audio error:', error);
    if (!res.headersSent) res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /student/co/questions/:id/image — question image
router.get('/student/co/questions/:id/image', async (req, res) => {
  try {
    const question = await req.db.get(
      'SELECT series_id, image_kdrive_file_id, image_file_name FROM tcf_co_questions WHERE id = $1', [req.params.id]
    );
    if (!question || !question.image_kdrive_file_id) return res.status(404).json({ error: 'Image not found' });
    if (!(await canUseCoSeries(req.db, req.user.id, question.series_id))) {
      return res.status(403).json({ error: 'Access denied: Exam content is not assigned or has expired.' });
    }
    const ext = path.extname(question.image_file_name || '').toLowerCase();
    const mimeMap = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp' };
    const buf = await getExamMedia(question.image_kdrive_file_id);
    sendExamMedia(res, buf, mimeMap[ext] || 'image/jpeg');
  } catch (error) {
    console.error('GET /student/co/questions/:id/image error:', error);
    if (!res.headersSent) res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /student/co/series/:id/intro-audio — secure intro audio
router.get('/student/co/series/:id/intro-audio', async (req, res) => {
  try {
    const { id } = req.params;

    const hasAccess = await checkExamAccess(req.db, req.user.id, 'co_series', id);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied: Exam content is not assigned or has expired.' });
    }

    const series = await req.db.get('SELECT intro_audio_kdrive_file_id, intro_audio_file_name FROM tcf_co_series WHERE id = $1', [id]);
    if (!series || !series.intro_audio_kdrive_file_id) return res.status(404).json({ error: 'Intro audio not found' });

    // Served as generic binary to discourage download managers.
    const buf = await getExamMedia(series.intro_audio_kdrive_file_id);
    sendExamMedia(res, buf, 'application/octet-stream');
  } catch (error) {
    console.error('GET /student/co/series/:id/intro-audio error:', error);
    if (!res.headersSent) res.status(500).json({ error: 'Internal server error' });
  }
});
// ============================================================
// ADMIN CO ANALYTICS
// ============================================================

// GET /admin/co/analytics/student/:studentId — analytics for a specific student
router.get('/admin/co/analytics/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await req.db.get('SELECT id, first_name, last_name, email FROM users WHERE id = $1', [studentId]);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const attempts = await req.db.all(
      `SELECT a.id, a.series_id, a.completed_at, a.time_spent_seconds,
        a.total_questions, a.correct_count, a.total_points, a.earned_points,
        a.score_percentage, a.is_auto_submitted, s.name AS series_name
       FROM tcf_co_quiz_attempts a
       JOIN tcf_co_series s ON s.id = a.series_id
       WHERE a.student_id = $1 AND a.completed_at IS NOT NULL
       ORDER BY a.completed_at DESC`, [studentId]
    );

    const seriesMap = {};
    for (const a of attempts) {
      if (!seriesMap[a.series_id]) {
        seriesMap[a.series_id] = { series_id: a.series_id, series_name: a.series_name, attempts: 0, best_earned: 0, best_total: 0, latest_earned: 0, latest_total: 0 };
      }
      const s = seriesMap[a.series_id];
      s.attempts++;
      if (a.earned_points > s.best_earned) { s.best_earned = a.earned_points; s.best_total = a.total_points; }
      if (s.attempts === 1 || !s.latest_total) { s.latest_earned = a.earned_points; s.latest_total = a.total_points; }
    }
    const seriesBreakdown = Object.values(seriesMap);
    const bestScores = seriesBreakdown.map(s => s.best_earned);
    const avgBest = bestScores.length > 0 ? Math.round(bestScores.reduce((a, b) => a + b, 0) / bestScores.length) : 0;
    const cefrDist = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
    for (const a of attempts) { cefrDist[computeCefrLevel(a.earned_points)]++; }
    const progression = [...attempts].reverse().slice(-20).map(a => ({
      date: a.completed_at, earned: a.earned_points, total: a.total_points, series: a.series_name, level: computeCefrLevel(a.earned_points),
    }));

    res.json({
      student: { id: student.id, name: `${student.first_name} ${student.last_name}`, email: student.email },
      total_attempts: attempts.length,
      series_count: seriesBreakdown.length,
      overall_level: computeCefrLevel(avgBest),
      overall_earned: avgBest,
      overall_total: seriesBreakdown.length > 0 ? Math.round(seriesBreakdown.reduce((s, b) => s + b.best_total, 0) / seriesBreakdown.length) : 699,
      series_breakdown: seriesBreakdown,
      cefr_distribution: cefrDist,
      recent_attempts: attempts.slice(0, 5).map(a => ({
        id: a.id, series_name: a.series_name, earned_points: a.earned_points, total_points: a.total_points,
        correct_count: a.correct_count, total_questions: a.total_questions,
        level: computeCefrLevel(a.earned_points), completed_at: a.completed_at, time_spent_seconds: a.time_spent_seconds,
      })),
      score_progression: progression,
    });
  } catch (error) {
    console.error('GET /admin/co/analytics/student/:studentId error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /admin/co/analytics/batch/:batchId — aggregate analytics for a batch
router.get('/admin/co/analytics/batch/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    const batch = await req.db.get('SELECT id, name FROM batches WHERE id = $1', [batchId]);
    if (!batch) return res.status(404).json({ error: 'Batch not found' });

    // Get all students in this batch
    const students = await req.db.all(
      `SELECT u.id, u.first_name, u.last_name, u.email
       FROM users u
       JOIN batch_students bs ON bs.student_id = u.id
       WHERE bs.batch_id = $1`, [batchId]
    );
    const studentIds = students.map(s => s.id);
    if (studentIds.length === 0) {
      return res.json({
        batch: { id: batch.id, name: batch.name }, student_count: 0,
        total_attempts: 0, overall_level: null, students_with_attempts: 0,
        leaderboard: [], cefr_distribution: {}, per_student: [], series_stats: [],
        level_distribution_by_student: {},
      });
    }

    // All attempts for these students
    const placeholders = studentIds.map((_, i) => `$${i + 1}`).join(',');
    const attempts = await req.db.all(
      `SELECT a.id, a.student_id, a.series_id, a.completed_at, a.time_spent_seconds,
        a.total_questions, a.correct_count, a.total_points, a.earned_points,
        a.score_percentage, s.name AS series_name
       FROM tcf_co_quiz_attempts a
       JOIN tcf_co_series s ON s.id = a.series_id
       WHERE a.student_id IN (${placeholders}) AND a.completed_at IS NOT NULL
       ORDER BY a.completed_at DESC`, studentIds
    );

    // Per-student stats
    const studentMap = {};
    for (const st of students) {
      studentMap[st.id] = { id: st.id, name: `${st.first_name} ${st.last_name}`, email: st.email, attempts: 0, best_earned: 0, best_total: 0, avg_earned: 0, series_practiced: new Set(), total_earned: 0 };
    }
    for (const a of attempts) {
      const st = studentMap[a.student_id];
      if (!st) continue;
      st.attempts++;
      st.total_earned += a.earned_points;
      st.series_practiced.add(a.series_id);
      if (a.earned_points > st.best_earned) { st.best_earned = a.earned_points; st.best_total = a.total_points; }
    }
    const perStudent = Object.values(studentMap).map(s => ({
      id: s.id, name: s.name, email: s.email, attempts: s.attempts,
      best_earned: s.best_earned, best_total: s.best_total,
      avg_earned: s.attempts > 0 ? Math.round(s.total_earned / s.attempts) : 0,
      level: s.attempts > 0 ? computeCefrLevel(s.best_earned) : null,
      series_count: s.series_practiced.size,
    }));

    // Leaderboard: top 5 by best score
    const leaderboard = [...perStudent].filter(s => s.attempts > 0).sort((a, b) => b.best_earned - a.best_earned).slice(0, 5);

    // Overall CEFR distribution across all attempts
    const cefrDist = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
    for (const a of attempts) { cefrDist[computeCefrLevel(a.earned_points)]++; }

    // Level distribution by student (each student's best level)
    const levelByStudent = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
    for (const s of perStudent) { if (s.level) levelByStudent[s.level]++; }

    // Series stats
    const seriesMap = {};
    for (const a of attempts) {
      if (!seriesMap[a.series_id]) {
        seriesMap[a.series_id] = { series_name: a.series_name, attempts: 0, students: new Set(), total_earned: 0, best_earned: 0, best_student: '' };
      }
      const sr = seriesMap[a.series_id];
      sr.attempts++;
      sr.students.add(a.student_id);
      sr.total_earned += a.earned_points;
      if (a.earned_points > sr.best_earned) {
        sr.best_earned = a.earned_points;
        const stu = studentMap[a.student_id];
        sr.best_student = stu ? stu.name : '';
      }
    }
    const seriesStats = Object.values(seriesMap).map(s => ({
      series_name: s.series_name, attempts: s.attempts, student_count: s.students.size,
      avg_earned: Math.round(s.total_earned / s.attempts),
      best_earned: s.best_earned, best_student: s.best_student,
      level: computeCefrLevel(Math.round(s.total_earned / s.attempts)),
    }));

    const studentsWithAttempts = perStudent.filter(s => s.attempts > 0).length;
    const allBest = perStudent.filter(s => s.attempts > 0).map(s => s.best_earned);
    const batchAvg = allBest.length > 0 ? Math.round(allBest.reduce((a, b) => a + b, 0) / allBest.length) : 0;

    // Statistical measures
    const stdDev = allBest.length > 1 ? Math.round(Math.sqrt(allBest.reduce((s, v) => s + Math.pow(v - batchAvg, 2), 0) / allBest.length)) : 0;
    const sortedBest = [...allBest].sort((a, b) => a - b);
    const median = sortedBest.length > 0 ? sortedBest[Math.floor(sortedBest.length / 2)] : 0;

    res.json({
      batch: { id: batch.id, name: batch.name },
      student_count: students.length,
      students_with_attempts: studentsWithAttempts,
      total_attempts: attempts.length,
      overall_level: computeCefrLevel(batchAvg),
      batch_avg: batchAvg,
      batch_median: median,
      batch_std_dev: stdDev,
      batch_best: allBest.length > 0 ? Math.max(...allBest) : 0,
      leaderboard,
      cefr_distribution: cefrDist,
      level_distribution_by_student: levelByStudent,
      per_student: perStudent.sort((a, b) => b.best_earned - a.best_earned),
      series_stats: seriesStats,
    });
  } catch (error) {
    console.error('GET /admin/co/analytics/batch/:batchId error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// EXPRESSION ÉCRITE — SIMULATION (TCF Canada, 60 minutes, 3 tâches)
//
// The server owns the clock: the deadline is started_at + the sum of the task
// durations, drafts are autosaved against it, and a copy sent after the grace
// period is replaced by the last draft saved in time. Correction is done by the
// shared exam evaluator (double correction, official scale, CEFR + NCLC).
// ============================================================
const eeEvaluator = require('../services/examEvaluator');
const { hasColumn: eeHasColumn } = require('../services/schemaFeatures');
const EE_SUBMIT_GRACE_SECONDS = 60;
const EE_DRAFT_GRACE_SECONDS = 30;
const EE_MAX_ANSWER_CHARS = 6000;
const EE_MAX_EVALUATION_ATTEMPTS = 5;
const eeEvaluating = new Set();

const EE_TYPE_LABEL = { message_court: 'Message', narration: 'Récit et impressions', argumentation: 'Point de vue argumenté' };
const EE_T3_CONSIGNE = 'Lisez les deux documents. Rédigez un texte en deux parties : présentez et comparez objectivement les deux points de vue (40 à 60 mots), puis donnez votre opinion de façon argumentée (80 à 120 mots).';

/** One task as the candidate sees it. T3 documents are stored as two paragraphs of prompt_text. */
function eeTaskView(t) {
  let documents = [t.argument_text_1, t.argument_text_2].filter(s => s && String(s).trim());
  let consigne = String(t.prompt_text || '').trim();
  let lead = null;
  if (t.task_number === 3 || t.task_type === 'argumentation') {
    if (!documents.length) {
      const paragraphs = consigne.split(/\n\s*\n|\n/).map(s => s.trim()).filter(Boolean);
      // A few sujets open with their title on its own line.
      if (paragraphs.length >= 3 && paragraphs[0].length < 140) lead = paragraphs.shift().replace(/^[«"\s]+|[»"\s]+$/g, '');
      documents = paragraphs.length >= 2 ? [paragraphs[0], paragraphs.slice(1).join('\n')] : paragraphs;
    }
    consigne = EE_T3_CONSIGNE;
  }
  return {
    id: t.id,
    task_number: t.task_number,
    task_type: t.task_type,
    task_type_label: EE_TYPE_LABEL[t.task_type] || 'Tâche',
    title: t.task_number === 3 ? (String(t.question_text || '').trim().replace(/\.$/, '') || lead || null) : null,
    consigne,
    documents,
    // Kept for older clients.
    prompt_text: t.prompt_text,
    question_text: t.question_text,
    argument_text_1: documents[0] || null,
    argument_text_2: documents[1] || null,
    min_words: t.min_words,
    max_words: t.max_words,
    duration_minutes: t.duration_minutes,
  };
}

async function eeLoadTasks(db, combinaisonId, withCorrection = false) {
  return db.all(
    `SELECT id, task_number, task_type, prompt_text, question_text, argument_text_1, argument_text_2,
            min_words, max_words, duration_minutes${withCorrection ? ', correction_text' : ''}
       FROM tcf_ee_taches WHERE combinaison_id = $1 ORDER BY task_number ASC`, [combinaisonId]);
}

const EE_REMAINING_SQL = `EXTRACT(EPOCH FROM (started_at + make_interval(secs => COALESCE(total_duration_seconds, 3600)) - CURRENT_TIMESTAMP))::int`;

/** Simulation row + clock computed by the database (no client clock or timezone involved). */
async function eeLoadOwn(db, id, studentId) {
  return db.get(`SELECT *, ${EE_REMAINING_SQL} AS remaining_seconds FROM tcf_ee_simulations WHERE id = $1 AND student_id = $2`, [id, studentId]);
}

async function eeLoadRunning(db, studentId, combinaisonId) {
  return db.get(
    `SELECT id, status, task1_answer, task2_answer, task3_answer, ${EE_REMAINING_SQL} AS remaining_seconds
       FROM tcf_ee_simulations WHERE student_id = $1 AND combinaison_id = $2 AND status IN ('in_progress', 'error')
      ORDER BY started_at DESC LIMIT 1`, [studentId, combinaisonId]);
}

const eeAnswersOf = (row) => [row.task1_answer || '', row.task2_answer || '', row.task3_answer || ''];
const eeClean = (answers) => [0, 1, 2].map(i => String((Array.isArray(answers) ? answers[i] : '') || '').replace(/\r\n/g, '\n').slice(0, EE_MAX_ANSWER_CHARS));
const eeWords = (answers) => answers.reduce((n, a) => n + eeEvaluator.wordCount(a), 0);

// GET /ee/simulation/combinaison/:id — tasks, attempts and any attempt still running
router.get('/ee/simulation/combinaison/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id;
    if (!await checkExamAccess(req.db, studentId, 'ee_combinaison', id)) {
      return res.status(403).json({ error: 'Ce contenu ne vous est pas attribué ou votre accès a expiré.' });
    }
    const comb = await req.db.get(
      `SELECT c.id, c.name, c.display_order, m.month_name, y.year
         FROM tcf_ee_combinaisons c JOIN tcf_ee_months m ON c.month_id = m.id JOIN tcf_ee_years y ON m.year_id = y.id
        WHERE c.id = $1`, [id]);
    if (!comb) return res.status(404).json({ error: 'Combinaison introuvable.' });

    const [taches, countRow, running] = await Promise.all([
      eeLoadTasks(req.db, id),
      req.db.get(`SELECT COUNT(*)::int AS n FROM tcf_ee_simulations WHERE student_id = $1 AND combinaison_id = $2 AND status = 'completed'`, [studentId, id]),
      eeLoadRunning(req.db, studentId, id),
    ]);
    res.json({
      combinaison: comb,
      taches: taches.map(eeTaskView),
      total_duration_minutes: taches.reduce((sum, t) => sum + (t.duration_minutes || 0), 0) || 60,
      attempt_count: countRow?.n || 0,
      in_progress: running ? {
        simulation_id: running.id,
        status: running.status,
        remaining_seconds: Math.max(0, running.remaining_seconds),
        words: eeWords(eeAnswersOf(running)),
      } : null,
    });
  } catch (error) {
    console.error('GET /ee/simulation/combinaison/:id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /ee/simulation/start — resume the running attempt or open a new one (1 credit)
router.post('/ee/simulation/start', async (req, res) => {
  try {
    const studentId = req.user.id;
    const combinaisonId = Number(req.body?.combinaison_id);
    if (!combinaisonId) return res.status(400).json({ error: 'combinaison_id is required' });
    if (!await checkExamAccess(req.db, studentId, 'ee_combinaison', combinaisonId)) {
      return res.status(403).json({ error: 'Ce contenu ne vous est pas attribué ou votre accès a expiré.' });
    }
    const taches = await eeLoadTasks(req.db, combinaisonId);
    if (!taches.length) return res.status(404).json({ error: 'Cette combinaison ne contient aucune tâche.' });

    const running = await eeLoadRunning(req.db, studentId, combinaisonId);
    if (running && running.status === 'error') {
      // Written and handed in, but the correction failed: correct it again, no new credit.
      return res.json({ simulation_id: running.id, resumed: true, needs_correction: true, answers: eeAnswersOf(running), remaining_seconds: 0 });
    }
    if (running && running.remaining_seconds > 0) {
      return res.json({ simulation_id: running.id, resumed: true, answers: eeAnswersOf(running), remaining_seconds: running.remaining_seconds });
    }
    if (running && !req.body?.force_new) {
      const words = eeWords(eeAnswersOf(running));
      if (words > 0) return res.status(409).json({ error: 'EXPIRED_ATTEMPT', simulation_id: running.id, words });
    }
    if (running) await req.db.run(`UPDATE tcf_ee_simulations SET status = 'abandoned' WHERE id = $1`, [running.id]);

    const aiCredits = require('../services/aiCreditService');
    try {
      await aiCredits.consumeCredit(req.db, studentId, 'ee', { reason: 'ee_attempt', related_entity_type: 'tcf_ee_simulation', related_entity_id: null });
    } catch (creditErr) {
      if (creditErr.code === 'INSUFFICIENT_CREDITS') {
        return res.status(402).json({ error: 'INSUFFICIENT_CREDITS', credit_type: 'ee', message: 'Vous n’avez plus de crédits d’expression écrite.' });
      }
      throw creditErr;
    }
    // The duration comes from the tasks, never from the client.
    const totalSeconds = (taches.reduce((sum, t) => sum + (t.duration_minutes || 0), 0) || 60) * 60;
    const result = await req.db.run(
      `INSERT INTO tcf_ee_simulations (student_id, combinaison_id, total_duration_seconds, status)
       VALUES ($1, $2, $3, 'in_progress') RETURNING id`, [studentId, combinaisonId, totalSeconds]);
    res.status(201).json({ simulation_id: result.rows[0].id, resumed: false, answers: ['', '', ''], remaining_seconds: totalSeconds });
  } catch (error) {
    console.error('POST /ee/simulation/start error:', error);
    res.status(500).json({ error: 'Impossible de démarrer la simulation.' });
  }
});

// PUT /ee/simulation/:id/draft — autosave (refused once the time is over)
router.put('/ee/simulation/:id/draft', async (req, res) => {
  try {
    const sim = await eeLoadOwn(req.db, req.params.id, req.user.id);
    if (!sim) return res.status(404).json({ error: 'Simulation introuvable.' });
    if (sim.status !== 'in_progress') return res.status(409).json({ error: 'Cette simulation n’est plus modifiable.' });
    if (sim.remaining_seconds < -EE_DRAFT_GRACE_SECONDS) return res.status(409).json({ error: 'TIME_OVER', remaining_seconds: 0 });
    const [a1, a2, a3] = eeClean(req.body?.answers);
    await req.db.run('UPDATE tcf_ee_simulations SET task1_answer = $1, task2_answer = $2, task3_answer = $3 WHERE id = $4', [a1, a2, a3, sim.id]);
    res.json({ saved_at: new Date().toISOString(), remaining_seconds: Math.max(0, sim.remaining_seconds) });
  } catch (error) {
    console.error('PUT /ee/simulation/:id/draft error:', error);
    res.status(500).json({ error: 'La sauvegarde a échoué.' });
  }
});

// POST /ee/simulation/:id/submit — hand in the copy and correct it (also retries a failed correction)
router.post('/ee/simulation/:id/submit', async (req, res) => {
  const simId = Number(req.params.id);
  let locked = false;
  try {
    const sim = await eeLoadOwn(req.db, simId, req.user.id);
    if (!sim) return res.status(404).json({ error: 'Simulation introuvable.' });
    if (sim.status === 'completed') return res.json({ simulation_id: simId, status: 'completed' });
    if (!['in_progress', 'error', 'correcting'].includes(sim.status)) return res.status(409).json({ error: 'Cette simulation ne peut plus être soumise.' });
    if (eeEvaluating.has(simId)) return res.status(409).json({ error: 'La correction est déjà en cours.' });
    const hasReport = await eeHasColumn(req.db, 'tcf_ee_simulations', 'evaluation');
    if (hasReport && Number(sim.evaluation_attempts || 0) >= EE_MAX_EVALUATION_ATTEMPTS) {
      return res.status(429).json({ error: 'Nombre maximal de tentatives de correction atteint. Contactez votre enseignant.' });
    }
    if (!eeEvaluator.isConfigured()) return res.status(503).json({ error: 'Le service de correction n’est pas configuré.' });

    // A copy sent in time (or within the grace period) is taken as sent; after that, the last draft saved in time counts.
    const inTime = sim.status === 'in_progress' && sim.remaining_seconds >= -EE_SUBMIT_GRACE_SECONDS;
    const answers = inTime && Array.isArray(req.body?.answers) ? eeClean(req.body.answers) : eeAnswersOf(sim);
    const totalSeconds = Number(sim.total_duration_seconds) || 3600;
    const timeUsed = Math.min(totalSeconds, Math.max(0, totalSeconds - Math.max(0, sim.remaining_seconds)));

    eeEvaluating.add(simId);
    locked = true;
    await req.db.run(
      `UPDATE tcf_ee_simulations SET task1_answer = $1, task2_answer = $2, task3_answer = $3,
              time_used_seconds = COALESCE(NULLIF(time_used_seconds, 0), $4), submitted_at = COALESCE(submitted_at, CURRENT_TIMESTAMP), status = 'correcting'
        WHERE id = $5`, [answers[0], answers[1], answers[2], timeUsed, simId]);
    if (hasReport) await req.db.run('UPDATE tcf_ee_simulations SET evaluation_attempts = COALESCE(evaluation_attempts, 0) + 1 WHERE id = $1', [simId]);

    const taches = (await eeLoadTasks(req.db, sim.combinaison_id)).map(eeTaskView);
    try {
      const tasks = await Promise.all([1, 2, 3].map(n => {
        const t = taches.find(x => x.task_number === n);
        if (!t) {
          return { n, title: `Tâche ${n}`, score: 0, words: 0, evaluated: false, criteria: [], strengths: [], improvements: [], errors: [],
            adjustments: [{ code: 'not_taken', label: 'Tâche absente', detail: 'Cette tâche n’existe pas dans la combinaison.' }] };
        }
        return eeEvaluator.evaluateTask({
          skill: 'ee', taskNo: n,
          prompt: [t.title ? `Titre : ${t.title}` : null, t.consigne].filter(Boolean).join('\n'),
          documents: n === 3 ? t.documents : [],
          text: answers[n - 1], minWords: t.min_words, maxWords: t.max_words,
        });
      }));
      const report = eeEvaluator.buildReport('ee', tasks);
      if (!inTime) report.late = true;
      const [t1, t2, t3] = tasks;
      const fb = (t) => JSON.stringify({ positives: t.strengths || [], improvements: [...(t.improvements || []), ...(t.adjustments || []).map(a => a.detail)] });
      await req.db.run(
        `UPDATE tcf_ee_simulations SET
           task1_score = $1, task2_score = $2, task3_score = $3,
           task1_level = $4, task2_level = $5, task3_level = $6,
           task1_feedback = $7, task2_feedback = $8, task3_feedback = $9,
           average_score = $10, overall_level = $11, status = 'completed'
         WHERE id = $12`,
        [t1.score, t2.score, t3.score, t1.cefr || 'A1', t2.cefr || 'A1', t3.cefr || 'A1', fb(t1), fb(t2), fb(t3),
          report.global.score, report.global.cefr || 'A1', simId]);
      if (hasReport) {
        await req.db.run('UPDATE tcf_ee_simulations SET evaluation = $1, scoring_version = $2, nclc_level = $3 WHERE id = $4',
          [JSON.stringify(report), report.version, report.global.nclc, simId]);
      }
      res.json({ simulation_id: simId, status: 'completed', report });
    } catch (aiError) {
      console.error('EE correction failed:', aiError.message);
      await req.db.run(`UPDATE tcf_ee_simulations SET status = 'error' WHERE id = $1`, [simId]);
      res.status(503).json({ error: 'La correction n’a pas pu être réalisée pour le moment. Votre copie est enregistrée : relancez la correction dans quelques instants.', retryable: true });
    }
  } catch (error) {
    console.error('POST /ee/simulation/:id/submit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (locked) eeEvaluating.delete(simId);
  }
});

// GET /ee/simulation/:id/result — the corrected copy
router.get('/ee/simulation/:id/result', async (req, res) => {
  try {
    const sim = await req.db.get(
      `SELECT s.*, c.name AS combinaison_name, m.month_name, y.year
         FROM tcf_ee_simulations s
         JOIN tcf_ee_combinaisons c ON s.combinaison_id = c.id
         JOIN tcf_ee_months m ON c.month_id = m.id
         JOIN tcf_ee_years y ON m.year_id = y.id
        WHERE s.id = $1 AND s.student_id = $2`, [req.params.id, req.user.id]);
    if (!sim) return res.status(404).json({ error: 'Simulation introuvable.' });
    const taches = await eeLoadTasks(req.db, sim.combinaison_id, true);
    const parse = (v) => { if (!v) return null; if (typeof v !== 'string') return v; try { return JSON.parse(v); } catch { return null; } };
    res.json({
      id: sim.id,
      status: sim.status,
      combinaison: { id: sim.combinaison_id, name: sim.combinaison_name, month_name: sim.month_name, year: sim.year },
      started_at: sim.started_at,
      submitted_at: sim.submitted_at,
      time_used_seconds: sim.time_used_seconds,
      average_score: parseFloat(sim.average_score) || 0,
      overall_level: sim.overall_level || 'A1',
      report: parse(sim.evaluation),
      tasks: [1, 2, 3].map(n => {
        const raw = taches.find(t => t.task_number === n);
        const view = raw ? eeTaskView(raw) : { task_number: n, documents: [] };
        const fb = parse(sim[`task${n}_feedback`]) || {};
        return {
          ...view,
          student_answer: sim[`task${n}_answer`] || '',
          score: parseFloat(sim[`task${n}_score`]) || 0,
          level: sim[`task${n}_level`] || 'A1',
          positives: fb.positives || [],
          improvements: fb.improvements || [],
          correction_text: raw?.correction_text || null,
        };
      }),
    });
  } catch (error) {
    console.error('GET /ee/simulation/:id/result error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /ee/simulation/history/:combinaisonId — student's attempt history
router.get('/ee/simulation/history/:combinaisonId', async (req, res) => {
  try {
    const { combinaisonId } = req.params;
    const studentId = req.user.id;
    if (!await checkExamAccess(req.db, studentId, 'ee_combinaison', combinaisonId)) {
      return res.status(403).json({ error: 'Ce contenu ne vous est pas attribué ou votre accès a expiré.' });
    }
    const withNclc = await eeHasColumn(req.db, 'tcf_ee_simulations', 'nclc_level');
    const attempts = await req.db.all(
      `SELECT id, started_at, submitted_at, time_used_seconds, average_score, overall_level, status,
              task1_score, task2_score, task3_score, task1_level, task2_level, task3_level${withNclc ? ', nclc_level, scoring_version' : ''}
         FROM tcf_ee_simulations
        WHERE student_id = $1 AND combinaison_id = $2 AND status IN ('completed', 'error')
        ORDER BY created_at DESC`, [studentId, combinaisonId]);
    res.json(attempts);
  } catch (error) {
    console.error('GET /ee/simulation/history/:combinaisonId error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;


