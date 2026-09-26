/**
 * The whole exam content tree (category → series, or category → year → month →
 * combinaison / partie), built with one query per table. Used by the admin
 * assignment screen and, filtered to what a company may use, by the company space.
 */
async function buildContentTree(db) {
  // One query per table, assembled in memory (this used to run one query per category, year and month).
  // Sequential on purpose: the app shares a single pg client, which runs one query at a time.
  const categories = await db.all(`SELECT id, name, description, icon, display_order FROM tcf_categories ORDER BY display_order ASC, id ASC`);
  const ceSeries = await db.all(`SELECT id, category_id, name, description, total_questions, total_points FROM tcf_ce_series ORDER BY name ASC`);
  const coSeries = await db.all(`SELECT id, category_id, name, description, total_questions, total_points FROM tcf_co_series ORDER BY name ASC`);
  const eeYears = await db.all(`SELECT id, category_id, year FROM tcf_ee_years ORDER BY year DESC`);
  const eeMonths = await db.all(`SELECT id, year_id, month, month_name FROM tcf_ee_months ORDER BY month ASC`);
  const eeCombs = await db.all(`SELECT id, month_id, name, display_order FROM tcf_ee_combinaisons ORDER BY display_order ASC, id ASC`);
  const eoYears = await db.all(`SELECT id, category_id, year FROM tcf_eo_years ORDER BY year DESC`);
  const eoMonths = await db.all(`SELECT id, year_id, month, month_name FROM tcf_eo_months ORDER BY month ASC`);
  const eoParties = await db.all(`SELECT id, month_id, name, display_order FROM tcf_eo_parties ORDER BY display_order ASC, id ASC`);

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

  return tree;
}

const keyOf = (node) => `${node.type}:${node.content_id ?? node.id}`;

/**
 * The part of the tree a company may use: a node given to the company, with
 * everything under it, plus the path that leads to it. `selectable` marks the
 * nodes the company may assign (the path above them is only there to navigate).
 */
function filterTree(tree, allowed, parentCovered = false) {
  const out = [];
  for (const node of tree || []) {
    const covered = parentCovered || allowed.has(keyOf(node));
    const children = filterTree(node.children || [], allowed, covered);
    if (covered || children.length) out.push({ ...node, selectable: covered, children });
  }
  return out;
}

module.exports = { buildContentTree, filterTree, keyOf };
