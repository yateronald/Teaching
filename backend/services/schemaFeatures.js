// Feature detection for optional columns and tables added by migrations.
// A present one is cached for good; an absent one is re-checked after a
// minute, so applying a migration takes effect without restarting the server.
const cache = new Map();
const RECHECK_MS = 60e3;

const MIGRATION_HINT = {
  exam_candidate_profiles: 'backend/database/run-exam-candidates-migration.js',
  tcf_ce_quiz_attempts: 'backend/database/run-exam-candidates-migration.js',
  user_sessions: 'backend/database/run-user-sessions-migration.js',
  tcf_ce_questions: 'backend/database/run-ce-passage-migration.js',
  promotions: 'backend/database/run-promotions-migration.js',
  'promotions.seats_offline': 'backend/database/run-promotion-seats-migration.js',
  site_visits: 'backend/database/run-site-monitoring-migration.js',
  'site_visits.area': 'backend/database/run-learning-analytics-migration.js',
  learn_events: 'backend/database/run-learning-analytics-migration.js',
  email_campaigns: 'backend/database/run-email-campaigns-migration.js',
  'demo_availability_requests.proposed_slots': 'backend/database/run-demo-proposed-slots-migration.js',
  'organizations.portal_branding': 'backend/database/run-org-portal-branding-migration.js',
  'organizations.cover_file_id': 'backend/database/run-org-portal-branding-migration.js',
};

async function probe(db, key, sql, params, hint) {
  const hit = cache.get(key);
  if (hit && (hit.present || Date.now() - hit.at < RECHECK_MS)) return hit.present;
  try {
    const present = !!(await db.get(sql, params));
    if (!present && !hit) console.warn(`⚠️  ${key} is missing — run ${hint}.`);
    cache.set(key, { present, at: Date.now() });
    return present;
  } catch {
    return false;
  }
}

function hasColumn(db, table, column) {
  return probe(db, `Column ${table}.${column}`,
    'SELECT 1 AS ok FROM information_schema.columns WHERE table_name = $1 AND column_name = $2 LIMIT 1',
    [table, column], MIGRATION_HINT[`${table}.${column}`] || MIGRATION_HINT[table] || 'backend/database/run-exam-reports-migration.js to store full reports');
}

function hasTable(db, table) {
  return probe(db, `Table ${table}`,
    "SELECT 1 AS ok FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1 LIMIT 1",
    [table], MIGRATION_HINT[table] || 'the pending migrations');
}

module.exports = { hasColumn, hasTable };
