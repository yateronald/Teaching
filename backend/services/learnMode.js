/**
 * The courses' mode, chosen by an administrator (Online courses page):
 *
 *   free     every lesson, exercise, game and certificate is open to everyone,
 *            with or without an account; online payment is closed.
 *   premium  the access levels apply: visitor / free account / Premium.
 *
 * Until an administrator chooses, the courses are free for everyone.
 * Read on every protected request (kept 15 seconds in memory, and updated at
 * once when the administrator changes it in this process).
 */
const MODES = ['free', 'premium'];
const DEFAULT_MODE = 'free';
const TTL = 15 * 1000;
let cache = { mode: null, at: 0 };

async function ensureTable(db) {
    await db.run(`CREATE TABLE IF NOT EXISTS learn_settings (
        key VARCHAR(40) PRIMARY KEY,
        value VARCHAR(200) NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL
    )`);
}

/** 'free' or 'premium'. */
async function getMode(db) {
    if (cache.mode && Date.now() - cache.at < TTL) return cache.mode;
    let mode = DEFAULT_MODE;
    try {
        const row = await db.get("SELECT value FROM learn_settings WHERE key = 'mode'");
        if (row && MODES.includes(row.value)) mode = row.value;
    } catch {
        // The table does not exist yet: nobody chose, the courses are free.
    }
    cache = { mode, at: Date.now() };
    return mode;
}

const isFreeForAll = async (db) => (await getMode(db)) === 'free';

/** The level the content checks use: everything when the courses are free for everyone. */
async function contentLevel(db, access) {
    return (await isFreeForAll(db)) ? 'premium' : access.level;
}

async function setMode(db, mode, actorId) {
    if (!MODES.includes(mode)) throw new Error('mode must be free or premium');
    await ensureTable(db);
    await db.run(
        `INSERT INTO learn_settings (key, value, updated_by) VALUES ('mode', $1, $2)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now(), updated_by = EXCLUDED.updated_by`,
        [mode, actorId]);
    cache = { mode, at: Date.now() };
    return mode;
}

/** When and by whom the mode was last changed. */
async function modeInfo(db) {
    const mode = await getMode(db);
    try {
        const row = await db.get(
            `SELECT s.updated_at, u.first_name || ' ' || u.last_name AS by
               FROM learn_settings s LEFT JOIN users u ON u.id = s.updated_by WHERE s.key = 'mode'`);
        return { mode, updated_at: row?.updated_at || null, updated_by: row?.by || null };
    } catch {
        return { mode, updated_at: null, updated_by: null };
    }
}

module.exports = { MODES, DEFAULT_MODE, getMode, isFreeForAll, contentLevel, setMode, modeInfo };
