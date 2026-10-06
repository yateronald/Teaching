// ============================================================
// Which AI engine the whole platform uses — the administrator's choice
// (Admin → AI engine, routes/aiEngine.js). See aiModels.js for the engines themselves.
//
// Every switch is a row of `ai_engine_changes` (who, when, from what to what):
// the latest row is the engine in use, and the table is its history. With no
// row, the platform runs on the Gemini Developer API, as it always has.
// The choice is read at start-up and every 30 s, so every server process
// follows a switch made on another one.
// ============================================================
const ai = require('./aiModels');

const REFRESH_MS = 30_000;
let db = null;
let timer = null;
let current = { engine: 'developer', since: null, changedBy: null };

async function ensureTable(database) {
  await database.run(`
    CREATE TABLE IF NOT EXISTS ai_engine_changes (
      id SERIAL PRIMARY KEY,
      engine VARCHAR(20) NOT NULL CHECK (engine IN ('developer', 'vertex')),
      previous_engine VARCHAR(20),
      changed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await database.run('CREATE INDEX IF NOT EXISTS idx_ai_engine_changes_recent ON ai_engine_changes(created_at DESC, id DESC)');
}

async function refresh() {
  if (!db) return current;
  const row = await db.get(`
    SELECT c.engine, c.created_at, TRIM(CONCAT(u.first_name, ' ', u.last_name)) AS changed_by
    FROM ai_engine_changes c LEFT JOIN users u ON u.id = c.changed_by
    ORDER BY c.created_at DESC, c.id DESC LIMIT 1
  `);
  const engine = row && ai.ENGINE_IDS.includes(row.engine) ? row.engine : 'developer';
  // A saved choice whose engine has lost its configuration (key removed from
  // .env) would leave the platform without AI: the original engine takes over.
  const usable = ai.isConfigured(engine) ? engine : 'developer';
  if (usable !== engine) console.warn(`⚠️  AI engine "${engine}" is selected but not configured — running on "developer".`);
  current = { engine: usable, selected: engine, since: row?.created_at || null, changedBy: row?.changed_by || null };
  ai.setActiveEngine(usable);
  return current;
}

/** Called once the database is connected (server.js). */
async function init(database) {
  db = database;
  try {
    await ensureTable(database);
    await refresh();
    console.log(`🧠 AI engine in use: ${current.engine}`);
  } catch (err) {
    console.error('⚠️  AI engine choice could not be loaded — running on "developer":', err.message);
  }
  if (!timer) {
    timer = setInterval(() => refresh().catch(err => console.warn('⚠️  AI engine refresh failed:', err.message)), REFRESH_MS);
    timer.unref?.();
  }
}

/** Switches the platform to `engine`. Throws (status 400/409) when it cannot run. */
async function choose(engine, userId) {
  if (!ai.ENGINE_IDS.includes(engine)) throw Object.assign(new Error('Unknown AI engine.'), { status: 400 });
  if (!ai.isConfigured(engine)) {
    const issues = ai.getEngine(engine).issues.join(' ');
    throw Object.assign(new Error(`This engine is not configured on the server. ${issues}`.trim()), { status: 409 });
  }
  const previous = current.engine;
  if (previous === engine) return current;
  await db.run('INSERT INTO ai_engine_changes (engine, previous_engine, changed_by) VALUES (?, ?, ?)', [engine, previous, userId || null]);
  console.log(`🧠 AI engine switched from ${previous} to ${engine} by user ${userId}`);
  return refresh();
}

async function history(limit = 10) {
  if (!db) return [];
  return db.all(`
    SELECT c.id, c.engine, c.previous_engine, c.created_at, TRIM(CONCAT(u.first_name, ' ', u.last_name)) AS changed_by
    FROM ai_engine_changes c LEFT JOIN users u ON u.id = c.changed_by
    ORDER BY c.created_at DESC, c.id DESC LIMIT ?
  `, [limit]);
}

const state = () => current;
const stop = () => { if (timer) clearInterval(timer); timer = null; };

module.exports = { init, choose, history, state, refresh, stop };
