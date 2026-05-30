/**
 * Exam Access Service — manages and verifies student access to exam content.
 */

async function checkExamAccess(db, studentId, contentType, contentId) {
  if (!studentId || !contentType || !contentId) return false;

  // Resolve hierarchy parents if needed
  let monthId = null;
  let yearId = null;
  let categoryId = null;

  if (contentType === 'ee_combinaison') {
    const row = await db.get(`
      SELECT c.id, c.month_id, m.year_id, y.category_id
      FROM tcf_ee_combinaisons c
      JOIN tcf_ee_months m ON c.month_id = m.id
      JOIN tcf_ee_years y ON m.year_id = y.id
      WHERE c.id = $1
    `, [contentId]);
    if (!row) return false;
    monthId = row.month_id;
    yearId = row.year_id;
    categoryId = row.category_id;
  } else if (contentType === 'eo_partie') {
    const row = await db.get(`
      SELECT p.id, p.month_id, m.year_id, y.category_id
      FROM tcf_eo_parties p
      JOIN tcf_eo_months m ON p.month_id = m.id
      JOIN tcf_eo_years y ON m.year_id = y.id
      WHERE p.id = $1
    `, [contentId]);
    if (!row) return false;
    monthId = row.month_id;
    yearId = row.year_id;
    categoryId = row.category_id;
  } else if (contentType === 'ce_series') {
    const row = await db.get(`
      SELECT s.id, s.category_id
      FROM tcf_ce_series s
      WHERE s.id = $1
    `, [contentId]);
    if (!row) return false;
    categoryId = row.category_id;
  } else if (contentType === 'co_series') {
    const row = await db.get(`
      SELECT s.id, s.category_id
      FROM tcf_co_series s
      WHERE s.id = $1
    `, [contentId]);
    if (!row) return false;
    categoryId = row.category_id;
  } else {
    // If checking access directly at parent nodes
    if (contentType === 'ee_month') {
      const row = await db.get(`
        SELECT m.id, m.year_id, y.category_id
        FROM tcf_ee_months m
        JOIN tcf_ee_years y ON m.year_id = y.id
        WHERE m.id = $1
      `, [contentId]);
      if (!row) return false;
      monthId = contentId;
      yearId = row.year_id;
      categoryId = row.category_id;
    } else if (contentType === 'eo_month') {
      const row = await db.get(`
        SELECT m.id, m.year_id, y.category_id
        FROM tcf_eo_months m
        JOIN tcf_eo_years y ON m.year_id = y.id
        WHERE m.id = $1
      `, [contentId]);
      if (!row) return false;
      monthId = contentId;
      yearId = row.year_id;
      categoryId = row.category_id;
    } else if (contentType === 'ee_year') {
      const row = await db.get(`
        SELECT y.id, y.category_id
        FROM tcf_ee_years y
        WHERE y.id = $1
      `, [contentId]);
      if (!row) return false;
      yearId = contentId;
      categoryId = row.category_id;
    } else if (contentType === 'eo_year') {
      const row = await db.get(`
        SELECT y.id, y.category_id
        FROM tcf_eo_years y
        WHERE y.id = $1
      `, [contentId]);
      if (!row) return false;
      yearId = contentId;
      categoryId = row.category_id;
    } else if (contentType === 'category') {
      categoryId = contentId;
    } else {
      return false;
    }
  }

  // Get student's batch IDs
  const batchRows = await db.all(
    `SELECT batch_id FROM batch_students WHERE student_id = $1`,
    [studentId]
  );
  const batchIds = batchRows.map(r => r.batch_id);

  // Fetch all assignments for this student (direct or batch)
  let query = `
    SELECT content_type, content_id, expires_at 
    FROM tcf_exam_assignments 
    WHERE student_id = $1
  `;
  const params = [studentId];
  if (batchIds.length > 0) {
    const placeholders = batchIds.map((_, i) => `$${i + 2}`).join(',');
    query += ` OR batch_id IN (${placeholders})`;
    params.push(...batchIds);
  }

  const assignments = await db.all(query, params);

  // Check if any matching assignment exists and is not expired
  for (const a of assignments) {
    const isExpired = a.expires_at ? new Date(a.expires_at) < new Date() : false;
    if (isExpired) continue;

    // Check matches
    if (a.content_type === contentType && String(a.content_id) === String(contentId)) {
      return true;
    }
    if (monthId && a.content_type === (contentType.startsWith('ee_') ? 'ee_month' : 'eo_month') && String(a.content_id) === String(monthId)) {
      return true;
    }
    if (yearId && a.content_type === (contentType.startsWith('ee_') ? 'ee_year' : 'eo_year') && String(a.content_id) === String(yearId)) {
      return true;
    }
    if (categoryId && a.content_type === 'category' && String(a.content_id) === String(categoryId)) {
      return true;
    }
  }

  return false;
}

async function hasAnyActiveAssignmentForCategory(db, studentId, categoryName) {
  if (!studentId || !categoryName) return false;

  const batchRows = await db.all(
    `SELECT batch_id FROM batch_students WHERE student_id = $1`,
    [studentId]
  );
  const batchIds = batchRows.map(r => r.batch_id);

  let query = `
    SELECT 1 FROM tcf_exam_assignments a
    LEFT JOIN batch_students bs ON a.batch_id = bs.batch_id
    WHERE (a.student_id = $1 OR bs.student_id = $1)
      AND (a.expires_at IS NULL OR a.expires_at > CURRENT_TIMESTAMP)
      AND (
        (a.content_type = 'category' AND a.content_id = (SELECT id FROM tcf_categories WHERE name = $2))
  `;

  const params = [studentId, categoryName];

  if (categoryName === 'Expression Écrite') {
    query += `
        OR (a.content_type = 'ee_year' AND a.content_id IN (SELECT id FROM tcf_ee_years WHERE category_id = (SELECT id FROM tcf_categories WHERE name = $2)))
        OR (a.content_type = 'ee_month' AND a.content_id IN (SELECT m.id FROM tcf_ee_months m JOIN tcf_ee_years y ON m.year_id = y.id WHERE y.category_id = (SELECT id FROM tcf_categories WHERE name = $2)))
        OR (a.content_type = 'ee_combinaison' AND a.content_id IN (SELECT c.id FROM tcf_ee_combinaisons c JOIN tcf_ee_months m ON c.month_id = m.id JOIN tcf_ee_years y ON m.year_id = y.id WHERE y.category_id = (SELECT id FROM tcf_categories WHERE name = $2)))
    `;
  } else if (categoryName === 'Expression Orale') {
    query += `
        OR (a.content_type = 'eo_year' AND a.content_id IN (SELECT id FROM tcf_eo_years WHERE category_id = (SELECT id FROM tcf_categories WHERE name = $2)))
        OR (a.content_type = 'eo_month' AND a.content_id IN (SELECT m.id FROM tcf_eo_months m JOIN tcf_eo_years y ON m.year_id = y.id WHERE y.category_id = (SELECT id FROM tcf_categories WHERE name = $2)))
        OR (a.content_type = 'eo_partie' AND a.content_id IN (SELECT p.id FROM tcf_eo_parties p JOIN tcf_eo_months m ON p.month_id = m.id JOIN tcf_eo_years y ON m.year_id = y.id WHERE y.category_id = (SELECT id FROM tcf_categories WHERE name = $2)))
    `;
  } else if (categoryName === 'Compréhension Orale') {
    query += `
        OR (a.content_type = 'co_series' AND a.content_id IN (SELECT id FROM tcf_co_series WHERE category_id = (SELECT id FROM tcf_categories WHERE name = $2)))
    `;
  } else if (categoryName === 'Compréhension Écrite') {
    query += `
        OR (a.content_type = 'ce_series' AND a.content_id IN (SELECT id FROM tcf_ce_series WHERE category_id = (SELECT id FROM tcf_categories WHERE name = $2)))
    `;
  }

  query += `
      )
    LIMIT 1
  `;

  const row = await db.get(query, params);
  return !!row;
}

module.exports = {
  checkExamAccess,
  hasAnyActiveAssignmentForCategory,
};
