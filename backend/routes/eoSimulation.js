const express = require('express');
const fs = require('fs');
const os = require('os');
const path = require('path');
const multer = require('multer');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { checkExamAccess, hasAnyActiveAssignmentForCategory } = require('../services/examAccessService');
const evaluator = require('../services/examEvaluator');
const { hasColumn } = require('../services/schemaFeatures');
const examinerService = require('../services/eoExaminer');
const { examinerFor } = examinerService;

// ============================================================
// EXPRESSION ORALE — TCF Canada simulation
//
// The browser talks to the AI examiner over Gemini Live, but never sees the API
// key: for every task it receives a single-use ephemeral token whose model,
// voice and examiner instructions are locked here, on the server.
// The candidate's microphone is recorded (WAV, 16 kHz mono) and uploaded after
// each task to a private folder outside /uploads; the recordings are used for
// the evaluation only, then deleted.
// ============================================================

const AUDIO_DIR = path.join(os.tmpdir(), 'ltf-eo-audio');
const MAX_TOKENS_PER_TASK = 5;       // first connection + reconnections
const MAX_EVALUATION_ATTEMPTS = 5;
const RECORDING_TTL_MS = 48 * 3600e3; // orphaned recordings (abandoned sessions)

fs.mkdirSync(AUDIO_DIR, { recursive: true });
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 16 * 1024 * 1024, files: 1, fields: 6, fieldSize: 512 * 1024 },
});

// Official timings of the TCF Canada oral test.
const TIMING = { t1: 120, t2Prep: 120, t2: 210, t3: 270 };

// Last-resort sujets — only when the whole bank has nothing for a task type.
const FALLBACK_T2 = [
  'Vous venez d’arriver dans une ville canadienne et vous cherchez un logement. Vous appelez le propriétaire d’un appartement à louer pour obtenir des informations (loyer, quartier, équipements, date de disponibilité).',
  'Vous souhaitez vous inscrire dans un club de sport de votre quartier. Vous posez des questions à l’employé de l’accueil (activités, horaires, tarifs, conditions d’inscription).',
  'Vous voulez suivre un cours de cuisine. Vous téléphonez à l’école pour vous renseigner (programme, durée, prix, matériel à apporter).',
];
const FALLBACK_T3 = [
  'Selon vous, le télétravail est-il une bonne chose pour les salariés et pour la société ? Justifiez votre point de vue.',
  'Pour bien s’intégrer dans un nouveau pays, faut-il avant tout apprendre sa langue ? Qu’en pensez-vous ?',
  'Les réseaux sociaux rapprochent-ils ou éloignent-ils les gens ? Donnez votre opinion en l’illustrant d’exemples.',
];
const DEFAULT_T1_POINTS = [
  { number: 1, title: 'Identité', subtitle: 'Nom, âge, lieu de vie, famille' },
  { number: 2, title: 'Parcours', subtitle: 'Études, travail' },
  { number: 3, title: 'Loisirs', subtitle: 'Centres d’intérêt, activités' },
  { number: 4, title: 'Projets', subtitle: 'Objectifs, projet au Canada' },
];
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/** Sujets imported from the web sometimes carry editorial notes; keep only the sujet. */
function cleanSujet(text) {
  return String(text || '')
    .replace(/\((?:[^()]*?)(ton dernier sujet|probablement|chatgpt|voici le sujet)[^()]*\)?/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const filesFor = (simId, n) => ({
  wav: path.join(AUDIO_DIR, `eo-${Number(simId)}-t${Number(n)}.wav`),
  json: path.join(AUDIO_DIR, `eo-${Number(simId)}-t${Number(n)}.json`),
});

function removeRecordings(simId) {
  [1, 2, 3].forEach(n => {
    const f = filesFor(simId, n);
    [f.wav, f.json].forEach(p => fs.rm(p, { force: true }, () => {}));
  });
}

function sweepOrphans() {
  fs.readdir(AUDIO_DIR, (err, names) => {
    if (err) return;
    names.forEach(name => {
      const p = path.join(AUDIO_DIR, name);
      fs.stat(p, (e, st) => { if (!e && Date.now() - st.mtimeMs > RECORDING_TTL_MS) fs.rm(p, { force: true }, () => {}); });
    });
  });
}
sweepOrphans();
setInterval(sweepOrphans, 3600e3).unref();

// Per-process guards (single Node process). Token counts reset after an hour.
const tokenCounts = new Map();
const evaluating = new Set();
setInterval(() => tokenCounts.clear(), 3600e3).unref();

router.use(authenticateToken);

async function loadOwnSimulation(req, res) {
  const sim = await req.db.get(
    `SELECT s.*, s2.prompt_text AS tache2_prompt, s3.prompt_text AS tache3_prompt, t1.prompt_text AS tache1_prompt
       FROM eo_simulations s
       LEFT JOIN tcf_eo_sujets s2 ON s.tache2_sujet_id = s2.id
       LEFT JOIN tcf_eo_sujets s3 ON s.tache3_sujet_id = s3.id
       LEFT JOIN tcf_eo_taches t1 ON s.tache1_tache_id = t1.id
      WHERE s.id = $1`,
    [req.params.id]
  );
  if (!sim) { res.status(404).json({ error: 'Simulation introuvable.' }); return null; }
  if (sim.user_id !== req.user.id) { res.status(403).json({ error: 'Accès refusé.' }); return null; }
  return sim;
}

async function loadT1Points(db, tacheId) {
  if (!tacheId) return DEFAULT_T1_POINTS;
  const rows = await db.all('SELECT point_number, title, subtitle FROM tcf_eo_points_aborder WHERE tache_id = $1 ORDER BY point_number', [tacheId]);
  return rows.length ? rows.map(p => ({ number: p.point_number, title: p.title, subtitle: p.subtitle })) : DEFAULT_T1_POINTS;
}

// ============================================================
// GET /eo-simulation/config — kept for older clients; no secret in it anymore.
// ============================================================
router.get('/config', (req, res) => {
  res.json({ liveModel: examinerService.LIVE_MODEL, firstName: req.user.first_name, studentName: `${req.user.first_name} ${req.user.last_name}` });
});

// ============================================================
// POST /eo-simulation/start — consume a credit, draw the sujets, open the record.
// ============================================================
router.post('/start', async (req, res) => {
  try {
    const partieId = req.body?.partieId ? Number(req.body.partieId) : null;
    const studentId = req.user.id;
    const allowed = partieId
      ? await checkExamAccess(req.db, studentId, 'eo_partie', partieId)
      : await hasAnyActiveAssignmentForCategory(req.db, studentId, 'Expression Orale');
    if (!allowed) return res.status(403).json({ error: 'Ce contenu ne vous est pas attribué ou votre accès a expiré.' });

    let partie = null;
    let tache1 = null;
    if (partieId) {
      partie = await req.db.get(
        `SELECT p.id, p.name, m.month_name, y.year FROM tcf_eo_parties p
           JOIN tcf_eo_months m ON p.month_id = m.id JOIN tcf_eo_years y ON m.year_id = y.id
          WHERE p.id = $1`, [partieId]);
      if (!partie) return res.status(404).json({ error: 'Partie introuvable.' });
      tache1 = await req.db.get(`SELECT id, prompt_text FROM tcf_eo_taches WHERE partie_id = $1 AND task_type = 'presentation' LIMIT 1`, [partieId]);
    }

    const drawSujet = async (type) => {
      const base = `SELECT s.id, s.prompt_text FROM tcf_eo_sujets s JOIN tcf_eo_taches t ON s.tache_id = t.id
                     WHERE t.task_type = $1 AND s.prompt_text IS NOT NULL AND LENGTH(TRIM(s.prompt_text)) > 10`;
      const own = partieId ? await req.db.get(`${base} AND t.partie_id = $2 ORDER BY RANDOM() LIMIT 1`, [type, partieId]) : null;
      return own || await req.db.get(`${base} ORDER BY RANDOM() LIMIT 1`, [type]);
    };
    const [s2, s3, points] = await Promise.all([drawSujet('interaction'), drawSujet('argumentation'), loadT1Points(req.db, tache1?.id)]);

    const aiCredits = require('../services/aiCreditService');
    try {
      await aiCredits.consumeCredit(req.db, studentId, 'eo', { reason: 'eo_attempt', related_entity_type: 'eo_simulation', related_entity_id: null });
    } catch (creditErr) {
      if (creditErr.code === 'INSUFFICIENT_CREDITS') {
        return res.status(402).json({ error: 'INSUFFICIENT_CREDITS', credit_type: 'eo', message: 'Vous n’avez plus de crédits d’expression orale.' });
      }
      throw creditErr;
    }

    const row = await req.db.run(
      `INSERT INTO eo_simulations (user_id, partie_id, tache1_tache_id, tache2_sujet_id, tache3_sujet_id, status)
       VALUES ($1, $2, $3, $4, $5, 'in_progress') RETURNING id`,
      [studentId, partieId, tache1?.id || null, s2?.id || null, s3?.id || null]
    );
    const simulationId = row.rows?.[0]?.id ?? row.id;
    const examiner = examinerFor(simulationId);

    res.json({
      simulationId,
      firstName: req.user.first_name,
      partie: partie ? { id: partie.id, name: partie.name, monthName: partie.month_name, year: partie.year } : null,
      examiner: { label: examiner.label },
      timing: TIMING,
      tache1: { prompt: 'Entretien dirigé : l’examinateur vous pose des questions sur vous.', points },
      tache2: { prompt: cleanSujet(s2?.prompt_text) || pick(FALLBACK_T2) },
      tache3: { prompt: cleanSujet(s3?.prompt_text) || pick(FALLBACK_T3) },
    });
  } catch (error) {
    console.error('POST /eo-simulation/start error:', error);
    res.status(500).json({ error: 'Impossible de démarrer la simulation.' });
  }
});

// ============================================================
// POST /eo-simulation/:id/live-token — one ephemeral token per task connection.
// ============================================================
router.post('/:id/live-token', async (req, res) => {
  try {
    const n = Number(req.body?.tache);
    if (![1, 2, 3].includes(n)) return res.status(400).json({ error: 'Tâche invalide.' });
    const sim = await loadOwnSimulation(req, res);
    if (!sim) return;
    if (sim.status !== 'in_progress') return res.status(409).json({ error: 'Cette simulation est terminée.' });

    const key = `${sim.id}:${n}`;
    const used = tokenCounts.get(key) || 0;
    if (used >= MAX_TOKENS_PER_TASK) return res.status(429).json({ error: 'Trop de reconnexions pour cette tâche.' });
    tokenCounts.set(key, used + 1);

    const examiner = examinerFor(sim.id);
    const sujet = n === 2 ? (cleanSujet(sim.tache2_prompt) || req.body?.sujet) : n === 3 ? (cleanSujet(sim.tache3_prompt) || req.body?.sujet) : null;
    // Fallback sujets are not stored on the row; the client sends back the one it was given at start.
    const safeSujet = String(sujet || '').slice(0, 1200);
    const points = n === 1 ? await loadT1Points(req.db, sim.tache1_tache_id) : [];
    const instructions = examinerService.examinerInstructions(n, { firstName: req.user.first_name, examiner, sujet: safeSujet, points });
    const model = req.body?.fallback ? examinerService.LIVE_FALLBACK_MODEL : examinerService.LIVE_MODEL;
    const token = await examinerService.createLiveToken({ model, voice: examiner.voice, instructions, silenceMs: examinerService.SILENCE_MS[n] });
    // The end-of-task tool cannot be locked into the token; the client declares it in its setup.
    res.json({ token, model, wsUrl: examinerService.WS_URL, tools: [examinerService.END_TASK_TOOL], endTool: examinerService.END_TASK });
  } catch (error) {
    console.error('POST /eo-simulation/:id/live-token error:', error.message);
    res.status(502).json({ error: 'La connexion avec l’examinateur n’a pas pu être préparée.' });
  }
});

// ============================================================
// POST /eo-simulation/:id/task/:n — dialogue + candidate recording for one task.
// ============================================================
router.post('/:id/task/:n', upload.single('audio'), async (req, res) => {
  try {
    const n = Number(req.params.n);
    if (![1, 2, 3].includes(n)) return res.status(400).json({ error: 'Tâche invalide.' });
    const sim = await loadOwnSimulation(req, res);
    if (!sim) return;
    if (sim.status !== 'in_progress') return res.status(409).json({ error: 'Cette simulation est terminée.' });

    let dialogue = [];
    try { dialogue = JSON.parse(req.body?.dialogue || '[]'); } catch { /* keep empty */ }
    dialogue = (Array.isArray(dialogue) ? dialogue : [])
      .filter(t => t && (t.role === 'examiner' || t.role === 'candidate') && typeof t.text === 'string' && t.text.trim())
      .slice(0, 200)
      .map(t => ({ role: t.role, text: t.text.trim().slice(0, 4000) }));
    const candidateText = dialogue.filter(t => t.role === 'candidate').map(t => t.text).join(' ').trim();
    const sujet = String(req.body?.sujet || '').slice(0, 1200);

    const files = filesFor(sim.id, n);
    if (req.file && req.file.buffer?.length) {
      if (req.file.buffer.toString('ascii', 0, 4) !== 'RIFF') return res.status(415).json({ error: 'Format audio non pris en charge.' });
      await fs.promises.writeFile(files.wav, req.file.buffer);
    }
    await fs.promises.writeFile(files.json, JSON.stringify({ dialogue, sujet, savedAt: new Date().toISOString() }));

    // Keep the plain transcript on the row too, so nothing is lost if the recording expires.
    const column = { 1: 'tache1_transcript', 2: 'tache2_transcript', 3: 'tache3_transcript' }[n];
    await req.db.run(`UPDATE eo_simulations SET ${column} = $1 WHERE id = $2`, [candidateText, sim.id]);
    if (n === 1) {
      const questions = dialogue.filter(t => t.role === 'examiner').map(t => t.text).slice(1, 12);
      await req.db.run('UPDATE eo_simulations SET tache1_questions = $1 WHERE id = $2', [JSON.stringify(questions), sim.id]);
    }
    res.json({ saved: true, audio: !!req.file });
  } catch (error) {
    console.error('POST /eo-simulation/:id/task/:n error:', error);
    res.status(500).json({ error: 'L’enregistrement de la tâche a échoué.' });
  }
});

// Legacy endpoint (older clients): plain transcript only.
router.post('/:id/transcript', async (req, res) => {
  try {
    const { tache, transcript } = req.body || {};
    if (![1, 2, 3].includes(tache)) return res.status(400).json({ error: 'Invalid tâche number' });
    const sim = await loadOwnSimulation(req, res);
    if (!sim) return;
    const column = { 1: 'tache1_transcript', 2: 'tache2_transcript', 3: 'tache3_transcript' }[tache];
    await req.db.run(`UPDATE eo_simulations SET ${column} = $1 WHERE id = $2`, [transcript || '', sim.id]);
    res.json({ message: 'Transcript saved' });
  } catch (error) {
    console.error('POST /eo-simulation/:id/transcript error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// POST /eo-simulation/:id/evaluate — correct the three tasks and store the report.
// Idempotent: a completed simulation returns its stored report.
// ============================================================
router.post('/:id/evaluate', async (req, res) => {
  const simId = Number(req.params.id);
  try {
    const sim = await loadOwnSimulation(req, res);
    if (!sim) return;
    const hasReportColumns = await hasColumn(req.db, 'eo_simulations', 'evaluation');
    if (sim.status === 'completed') {
      if (sim.evaluation) return res.json(typeof sim.evaluation === 'string' ? JSON.parse(sim.evaluation) : sim.evaluation);
      return res.status(409).json({ error: 'Cette simulation a déjà été évaluée.' });
    }
    if (evaluating.has(simId)) return res.status(409).json({ error: 'L’évaluation est déjà en cours.' });
    if (hasReportColumns && Number(sim.evaluation_attempts || 0) >= MAX_EVALUATION_ATTEMPTS) {
      return res.status(429).json({ error: 'Nombre maximal de tentatives d’évaluation atteint. Contactez votre enseignant.' });
    }
    if (!evaluator.isConfigured()) return res.status(503).json({ error: 'Le service d’évaluation n’est pas configuré.' });

    evaluating.add(simId);
    await req.db.run(`UPDATE eo_simulations SET status = 'evaluating' WHERE id = $1`, [simId]);
    if (hasReportColumns) await req.db.run('UPDATE eo_simulations SET evaluation_attempts = COALESCE(evaluation_attempts, 0) + 1 WHERE id = $1', [simId]);

    const prompts = { 1: null, 2: cleanSujet(sim.tache2_prompt), 3: cleanSujet(sim.tache3_prompt) };
    const inputs = await Promise.all([1, 2, 3].map(async n => {
      const f = filesFor(simId, n);
      const saved = await fs.promises.readFile(f.json, 'utf8').then(JSON.parse).catch(() => null);
      const audio = await fs.promises.readFile(f.wav).catch(() => null);
      const dialogue = saved?.dialogue || [];
      const legacyText = sim[`tache${n}_transcript`] || '';
      const text = dialogue.length ? dialogue.filter(t => t.role === 'candidate').map(t => t.text).join(' ') : legacyText;
      return {
        skill: 'eo', taskNo: n,
        prompt: prompts[n] || saved?.sujet || null,
        dialogue, text, audio,
        speech: audio ? evaluator.analyzeWav(audio) : null,
        notTaken: !saved && sim[`tache${n}_transcript`] == null,
      };
    }));

    const tasks = await Promise.all(inputs.map(input => evaluator.evaluateTask(input)));
    tasks.forEach((t, i) => { t.prompt = inputs[i].prompt; t.dialogue = inputs[i].dialogue; });
    const report = evaluator.buildReport('eo', tasks);
    const legacyCriteria = evaluator.legacyCriteria(report);

    await req.db.run(
      `UPDATE eo_simulations SET
         tache1_score = $1, tache2_score = $2, tache3_score = $3, overall_score = $4,
         tache1_feedback = $5, tache2_feedback = $6, tache3_feedback = $7, overall_feedback = $8,
         criteria_scores = $9, status = 'completed', completed_at = CURRENT_TIMESTAMP,
         duration_seconds = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - started_at))::INTEGER
       WHERE id = $10`,
      [
        tasks[0].score, tasks[1].score, tasks[2].score, report.global.score,
        evaluator.legacyFeedback(tasks[0]), evaluator.legacyFeedback(tasks[1]), evaluator.legacyFeedback(tasks[2]),
        [report.summary.headline, report.summary.text].filter(Boolean).join(' '),
        JSON.stringify(legacyCriteria), simId,
      ]
    );
    if (hasReportColumns) {
      await req.db.run(
        'UPDATE eo_simulations SET evaluation = $1, scoring_version = $2, cefr_level = $3, nclc_level = $4 WHERE id = $5',
        [JSON.stringify(report), report.version, report.global.cefr, report.global.nclc, simId]
      );
    }
    removeRecordings(simId);
    res.json(report);
  } catch (error) {
    console.error('POST /eo-simulation/:id/evaluate error:', error);
    await req.db.run(`UPDATE eo_simulations SET status = 'eval_failed' WHERE id = $1 AND status = 'evaluating'`, [simId]).catch(() => {});
    res.status(503).json({ error: 'L’évaluation n’a pas pu être réalisée pour le moment. Vos réponses sont conservées : réessayez dans quelques instants.', retryable: true });
  } finally {
    evaluating.delete(simId);
  }
});

// ============================================================
// GET /eo-simulation/history — past simulations (optionally for one partie).
// ============================================================
router.get('/history', async (req, res) => {
  try {
    const { partieId } = req.query;
    const withLevels = await hasColumn(req.db, 'eo_simulations', 'nclc_level');
    let sql = `SELECT s.id, s.partie_id, s.overall_score, s.tache1_score, s.tache2_score, s.tache3_score,
        s.status, s.started_at, s.completed_at, s.duration_seconds, s.criteria_scores,
        ${withLevels ? 's.cefr_level, s.nclc_level, s.scoring_version,' : ''}
        p.name AS partie_name, m.month_name, y.year
       FROM eo_simulations s
       LEFT JOIN tcf_eo_parties p ON s.partie_id = p.id
       LEFT JOIN tcf_eo_months m ON p.month_id = m.id
       LEFT JOIN tcf_eo_years y ON m.year_id = y.id
       WHERE s.user_id = $1 AND s.status = 'completed'`;
    const params = [req.user.id];
    if (partieId) { params.push(partieId); sql += ` AND s.partie_id = $${params.length}`; }
    sql += ' ORDER BY s.completed_at DESC LIMIT 50';
    res.json(await req.db.all(sql, params));
  } catch (error) {
    console.error('GET /eo-simulation/history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// GET /eo-simulation/analytics — aggregated performance overview.
// ============================================================
router.get('/analytics', async (req, res) => {
  try {
    const [global, perPartie, timeline, sessions] = await Promise.all([
      req.db.get(
        `SELECT COUNT(*)::int AS total_sessions,
                AVG(overall_score)::numeric(4,2) AS avg_overall, AVG(tache1_score)::numeric(4,2) AS avg_tache1,
                AVG(tache2_score)::numeric(4,2) AS avg_tache2, AVG(tache3_score)::numeric(4,2) AS avg_tache3,
                MAX(overall_score)::numeric(4,2) AS best_overall, MIN(overall_score)::numeric(4,2) AS worst_overall,
                SUM(COALESCE(duration_seconds, 0))::int AS total_duration_seconds
           FROM eo_simulations WHERE user_id = $1 AND status = 'completed'`, [req.user.id]),
      req.db.all(
        `SELECT s.partie_id, COALESCE(p.name, 'Pratique libre') AS partie_name, m.month_name, y.year,
                COUNT(*)::int AS attempts, AVG(s.overall_score)::numeric(4,2) AS avg_score,
                MAX(s.overall_score)::numeric(4,2) AS best_score, MAX(s.completed_at) AS last_attempt
           FROM eo_simulations s
           LEFT JOIN tcf_eo_parties p ON s.partie_id = p.id
           LEFT JOIN tcf_eo_months m ON p.month_id = m.id
           LEFT JOIN tcf_eo_years y ON m.year_id = y.id
          WHERE s.user_id = $1 AND s.status = 'completed'
          GROUP BY s.partie_id, p.name, m.month_name, y.year
          ORDER BY last_attempt DESC`, [req.user.id]),
      req.db.all(
        `SELECT id, overall_score, tache1_score, tache2_score, tache3_score, completed_at
           FROM eo_simulations WHERE user_id = $1 AND status = 'completed' ORDER BY completed_at ASC LIMIT 30`, [req.user.id]),
      req.db.all(`SELECT criteria_scores FROM eo_simulations WHERE user_id = $1 AND status = 'completed' AND criteria_scores IS NOT NULL`, [req.user.id]),
    ]);
    const keys = ['coherence', 'vocabulary', 'grammar', 'fluency', 'task_completion'];
    const sums = Object.fromEntries(keys.map(k => [k, { sum: 0, n: 0 }]));
    sessions.forEach(s => {
      const cs = typeof s.criteria_scores === 'string' ? JSON.parse(s.criteria_scores) : (s.criteria_scores || {});
      keys.forEach(k => { if (cs[k] != null && Number.isFinite(Number(cs[k]))) { sums[k].sum += Number(cs[k]); sums[k].n++; } });
    });
    const avgCriteria = keys.some(k => sums[k].n)
      ? Object.fromEntries(keys.filter(k => sums[k].n).map(k => [k, +(sums[k].sum / sums[k].n).toFixed(2)]))
      : null;
    res.json({ global: global || { total_sessions: 0 }, perPartie, timeline, avgCriteria });
  } catch (error) {
    console.error('GET /eo-simulation/analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// GET /eo-simulation/:id — full simulation (report included when available).
// ============================================================
router.get('/:id', async (req, res) => {
  try {
    const sim = await req.db.get(
      `SELECT s.*, s2.prompt_text AS tache2_prompt, s3.prompt_text AS tache3_prompt,
              p.name AS partie_name, m.month_name, y.year, t1.prompt_text AS tache1_prompt
         FROM eo_simulations s
         LEFT JOIN tcf_eo_sujets s2 ON s.tache2_sujet_id = s2.id
         LEFT JOIN tcf_eo_sujets s3 ON s.tache3_sujet_id = s3.id
         LEFT JOIN tcf_eo_parties p ON s.partie_id = p.id
         LEFT JOIN tcf_eo_months m ON p.month_id = m.id
         LEFT JOIN tcf_eo_years y ON m.year_id = y.id
         LEFT JOIN tcf_eo_taches t1 ON s.tache1_tache_id = t1.id
        WHERE s.id = $1`, [req.params.id]);
    if (!sim) return res.status(404).json({ error: 'Not found' });
    if (sim.user_id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    sim.tache1_points = await loadT1Points(req.db, sim.tache1_tache_id);
    sim.tache2_prompt = cleanSujet(sim.tache2_prompt);
    sim.tache3_prompt = cleanSujet(sim.tache3_prompt);
    if (typeof sim.evaluation === 'string') { try { sim.evaluation = JSON.parse(sim.evaluation); } catch { sim.evaluation = null; } }
    res.json(sim);
  } catch (error) {
    console.error('GET /eo-simulation/:id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
