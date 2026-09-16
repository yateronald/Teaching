const PostgreSQLDatabase = require('../database/init-postgres');
require('dotenv').config();

async function run() {
  process.env.TZ = 'UTC';
  const db = new PostgreSQLDatabase();
  await db.initialize();

  const studentId = 10;

  // Get student's batch IDs
  const batchRows = await db.all(
    `SELECT batch_id FROM batch_students WHERE student_id = $1`,
    [studentId]
  );
  const batchIds = batchRows.map(r => r.batch_id);

  // Get ALL assignments for this student (direct + via batches)
  let assignments = [];
  const directAssignments = await db.all(
    `SELECT content_type, content_id, expires_at FROM tcf_exam_assignments WHERE student_id = $1`,
    [studentId]
  );
  assignments.push(...directAssignments);

  if (batchIds.length > 0) {
    const placeholders = batchIds.map((_, i) => `$${i + 1}`).join(',');
    const batchAssignments = await db.all(
      `SELECT content_type, content_id, expires_at FROM tcf_exam_assignments WHERE batch_id IN (${placeholders})`,
      batchIds
    );
    assignments.push(...batchAssignments);
  }

  const assignmentMap = {};
  for (const a of assignments) {
    const key = `${a.content_type}:${a.content_id}`;
    const isExpired = a.expires_at ? new Date(a.expires_at) < new Date() : false;
    if (!assignmentMap[key] || (!isExpired && assignmentMap[key].is_expired)) {
      assignmentMap[key] = { is_assigned: true, is_expired: isExpired };
    }
  }

  const isAssigned = (type, id) => {
    const info = assignmentMap[`${type}:${id}`];
    return info || { is_assigned: false, is_expired: false };
  };

  const hasAssignedChildrenForCat = (catName) => {
    if (catName === 'Compréhension Écrite') {
      return Object.keys(assignmentMap).some(key => key.startsWith('ce_series:') && assignmentMap[key].is_assigned && !assignmentMap[key].is_expired);
    }
    if (catName === 'Compréhension Orale') {
      return Object.keys(assignmentMap).some(key => key.startsWith('co_series:') && assignmentMap[key].is_assigned && !assignmentMap[key].is_expired);
    }
    if (catName === 'Expression Écrite') {
      return Object.keys(assignmentMap).some(key => 
        (key.startsWith('ee_year:') || key.startsWith('ee_month:') || key.startsWith('ee_combinaison:')) 
        && assignmentMap[key].is_assigned && !assignmentMap[key].is_expired
      );
    }
    if (catName === 'Expression Orale') {
      return Object.keys(assignmentMap).some(key => 
        (key.startsWith('eo_year:') || key.startsWith('eo_month:') || key.startsWith('eo_partie:')) 
        && assignmentMap[key].is_assigned && !assignmentMap[key].is_expired
      );
    }
    return false;
  };

  const getEeYearHasAssignedChildren = async (yearId) => {
    const months = await db.all(`SELECT id FROM tcf_ee_months WHERE year_id = $1`, [yearId]);
    const monthIds = months.map(m => m.id);
    if (monthIds.length === 0) return false;
    const hasMonthAssigned = monthIds.some(id => {
      const info = assignmentMap[`ee_month:${id}`];
      return info && info.is_assigned && !info.is_expired;
    });
    if (hasMonthAssigned) return true;
    const place = monthIds.map((_, i) => `$${i + 1}`).join(',');
    const combs = await db.all(`SELECT id FROM tcf_ee_combinaisons WHERE month_id IN (${place})`, monthIds);
    return combs.some(c => {
      const info = assignmentMap[`ee_combinaison:${c.id}`];
      return info && info.is_assigned && !info.is_expired;
    });
  };

  const getEoYearHasAssignedChildren = async (yearId) => {
    const months = await db.all(`SELECT id FROM tcf_eo_months WHERE year_id = $1`, [yearId]);
    const monthIds = months.map(m => m.id);
    if (monthIds.length === 0) return false;
    const hasMonthAssigned = monthIds.some(id => {
      const info = assignmentMap[`eo_month:${id}`];
      return info && info.is_assigned && !info.is_expired;
    });
    if (hasMonthAssigned) return true;
    const place = monthIds.map((_, i) => `$${i + 1}`).join(',');
    const parties = await db.all(`SELECT id FROM tcf_eo_parties WHERE month_id IN (${place})`, monthIds);
    return parties.some(p => {
      const info = assignmentMap[`eo_partie:${p.id}`];
      return info && info.is_assigned && !info.is_expired;
    });
  };

  const categories = await db.all(
    `SELECT id, name, description, icon, display_order FROM tcf_categories ORDER BY display_order ASC`
  );

  const tree = [];

  for (const cat of categories) {
    const catAssignment = isAssigned('category', cat.id);
    const hasChildrenAssigned = hasAssignedChildrenForCat(cat.name);

    let total_count = 0;
    let available_count = 0;
    let child_type = '';

    if (cat.name === 'Compréhension Écrite') {
      const series = await db.all(`SELECT id FROM tcf_ce_series WHERE category_id = $1`, [cat.id]);
      total_count = series.length;
      const catActive = catAssignment.is_assigned && !catAssignment.is_expired;
      available_count = series.filter(s => {
        const sa = isAssigned('ce_series', s.id);
        return catActive || (sa.is_assigned && !sa.is_expired);
      }).length;
      child_type = 'ce_series';
    } else if (cat.name === 'Compréhension Orale') {
      const series = await db.all(`SELECT id FROM tcf_co_series WHERE category_id = $1`, [cat.id]);
      total_count = series.length;
      const catActive = catAssignment.is_assigned && !catAssignment.is_expired;
      available_count = series.filter(s => {
        const sa = isAssigned('co_series', s.id);
        return catActive || (sa.is_assigned && !sa.is_expired);
      }).length;
      child_type = 'co_series';
    } else if (cat.name === 'Expression Écrite') {
      const years = await db.all(`SELECT id FROM tcf_ee_years WHERE category_id = $1`, [cat.id]);
      total_count = years.length;
      const catActive = catAssignment.is_assigned && !catAssignment.is_expired;
      for (const y of years) {
        const ya = isAssigned('ee_year', y.id);
        const hasChildren = await getEeYearHasAssignedChildren(y.id);
        const yearActive = ya.is_assigned && !ya.is_expired;
        if (catActive || yearActive || hasChildren) {
          available_count++;
        }
      }
      child_type = 'ee_year';
    } else if (cat.name === 'Expression Orale') {
      const years = await db.all(`SELECT id FROM tcf_eo_years WHERE category_id = $1`, [cat.id]);
      total_count = years.length;
      const catActive = catAssignment.is_assigned && !catAssignment.is_expired;
      for (const y of years) {
        const ya = isAssigned('eo_year', y.id);
        const hasChildren = await getEoYearHasAssignedChildren(y.id);
        const yearActive = ya.is_assigned && !ya.is_expired;
        if (catActive || yearActive || hasChildren) {
          available_count++;
        }
      }
      child_type = 'eo_year';
    }

    tree.push({
      ...cat,
      type: 'category',
      is_assigned: catAssignment.is_assigned,
      is_expired: catAssignment.is_expired,
      has_assigned_children: hasChildrenAssigned,
      total_count,
      available_count,
      child_type,
      children: []
    });
  }

  console.log('Tree Response for student 10:');
  console.dir(tree, { depth: null });

  await db.close();
}

run().catch(console.error);
