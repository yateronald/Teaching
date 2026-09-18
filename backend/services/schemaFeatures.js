// Feature detection for optional columns added by migrations.
// A present column is cached for good; an absent one is re-checked after a
// minute, so applying a migration takes effect without restarting the server.
const cache = new Map();
const RECHECK_MS = 60e3;

async function hasColumn(db, table, column) {
  const key = `${table}.${column}`;
  const hit = cache.get(key);
  if (hit && (hit.present || Date.now() - hit.at < RECHECK_MS)) return hit.present;
  try {
    const row = await db.get(
      'SELECT 1 AS ok FROM information_schema.columns WHERE table_name = $1 AND column_name = $2 LIMIT 1',
      [table, column]
    );
    const present = !!row;
    if (!present && !hit) console.warn(`⚠️  Column ${key} is missing — run backend/database/run-exam-reports-migration.js to store full reports.`);
    cache.set(key, { present, at: Date.now() });
    return present;
  } catch {
    return false;
  }
}

module.exports = { hasColumn };
