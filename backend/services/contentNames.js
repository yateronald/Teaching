/**
 * Readable names of exam content ("eo_month:12" → "Septembre 2026"), shared by
 * the admin assignments, the company space and the learner dashboard.
 */
// One query per content type.
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

module.exports = { CONTENT_NAME_SQL, contentNameResolver };
