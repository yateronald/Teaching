// ============================================================
// /api/admin/ai-engine — which AI engine the platform uses (administrators only).
//   GET  /       the engines, their readiness and models, the switch history
//   PUT  /       { engine } switch the whole platform to that engine
//   POST /test   { engine } check text, voice and the live examiner on that engine
// No key ever leaves the server: only whether one is set, and how many.
// ============================================================
const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const ai = require('../services/aiModels');
const engineChoice = require('../services/aiEngineChoice');
const { checkEngine } = require('../services/aiEngineCheck');
const { relayUrlFor } = require('../services/liveRelay');

router.use(authenticateToken, authorizeRoles('admin'));

const TEST_COOLDOWN_MS = 15_000;
const lastTests = new Map(); // engine → last result
const running = new Set(); // engines being tested
const lastRun = new Map(); // engine → end of the last test

function engineView(id) {
  const e = ai.getEngine(id);
  return {
    id,
    configured: e.configured,
    liveReady: e.liveReady,
    issues: e.issues,
    keys: e.keys.length,
    project: e.project || null,
    location: e.location || null,
    models: { text: e.models.text, tts: e.models.tts, live: e.models.live },
    lastTest: lastTests.get(id) || null,
  };
}

async function overview() {
  const state = engineChoice.state();
  return {
    active: ai.activeEngine(),
    selected: state.selected || state.engine,
    since: state.since,
    changedBy: state.changedBy,
    engines: ai.ENGINE_IDS.map(engineView),
    history: await engineChoice.history(10),
  };
}

router.get('/', async (req, res) => {
  try {
    res.json(await overview());
  } catch (err) {
    console.error('GET /admin/ai-engine error:', err.message);
    res.status(500).json({ error: 'The AI engine settings could not be loaded.' });
  }
});

router.put('/', async (req, res) => {
  const engine = String(req.body?.engine || '');
  try {
    await engineChoice.choose(engine, req.user.id);
    res.json(await overview());
  } catch (err) {
    if (!err.status) console.error('PUT /admin/ai-engine error:', err.message);
    res.status(err.status || 500).json({ error: err.status ? err.message : 'The AI engine could not be changed.' });
  }
});

router.post('/test', async (req, res) => {
  const engine = String(req.body?.engine || '');
  if (!ai.ENGINE_IDS.includes(engine)) return res.status(400).json({ error: 'Unknown AI engine.' });
  if (running.has(engine)) return res.status(409).json({ error: 'A test of this engine is already running.' });
  const wait = (lastRun.get(engine) || 0) + TEST_COOLDOWN_MS - Date.now();
  if (wait > 0) return res.status(429).json({ error: `Please wait ${Math.ceil(wait / 1000)} s before testing this engine again.` });
  running.add(engine);
  try {
    const result = await checkEngine(engine, { relayUrl: relayUrlFor(req) });
    lastTests.set(engine, result);
    console.log(`🧪 AI engine test (${engine}) by user ${req.user.id}: ${result.checks.map(c => `${c.id} ${c.ok ? 'ok' : 'FAILED'}`).join(', ')}`);
    res.json(result);
  } catch (err) {
    if (!err.status) console.error('POST /admin/ai-engine/test error:', err.message);
    res.status(err.status || 500).json({ error: err.status ? err.message : 'The test could not run.' });
  } finally {
    running.delete(engine);
    lastRun.set(engine, Date.now()); // the pause counts from the end of a test
  }
});

module.exports = router;
