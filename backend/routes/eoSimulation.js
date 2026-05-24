const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { GoogleGenAI } = require('@google/genai');

const GEMINI_API_KEYS = [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY1].filter(Boolean);
const GEMINI_LIVE_MODEL = 'gemini-3.1-flash-live-preview';
const GEMINI_TEXT_MODEL = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';

// ============================================================
// Fallback exam content — used only when the database has no sujets
// available for a given tâche type. These are real TCF/TEF Canada style
// prompts so the AI examiner can always propose a meaningful exercise
// instead of saying "aucun sujet pour cette tâche".
// ============================================================
const FALLBACK_T2_SUJETS = [
  "Vous voulez visiter une région québécoise. Vous allez à l'office du tourisme pour vous renseigner sur les activités à faire, les hébergements disponibles et les transports.",
  "Vous êtes un(e) ami(e) francophone récemment installé(e) au Canada. Vous appelez pour demander des informations pratiques sur la vie quotidienne (logement, démarches administratives, transports).",
  "Vous voulez vous inscrire à un cours de français dans une école de langue. Vous appelez l'école pour vous renseigner sur les horaires, les niveaux, les tarifs et les méthodes d'enseignement.",
  "Vous cherchez un appartement à louer dans une nouvelle ville. Vous appelez le propriétaire pour poser des questions sur le logement (taille, prix, quartier, équipements) et organiser une visite.",
  "Vous prévoyez un voyage d'affaires au Québec. Vous contactez une agence de voyage pour obtenir des informations sur les vols, les hôtels d'affaires et les options de transport sur place.",
  "Vous souhaitez vous inscrire à un club sportif francophone. Vous appelez pour demander des informations sur les activités proposées, les horaires, les tarifs et les conditions d'inscription.",
];
const FALLBACK_T3_SUJETS = [
  "Pensez-vous que les entreprises doivent accompagner les nouveaux employés pour faciliter leur intégration ? Êtes-vous d'accord avec cette idée ? Justifiez votre position.",
  "À votre avis, la télévision est-elle nécessaire à l'éducation des enfants ? Pourquoi ? Présentez votre opinion en l'illustrant d'exemples concrets.",
  "Aujourd'hui, beaucoup de personnes choisissent de travailler depuis chez elles. Selon vous, le télétravail est-il une bonne chose pour la société ? Argumentez votre point de vue.",
  "Avec Internet, le monde est devenu un village. Êtes-vous d'accord avec cette affirmation ? Quels sont les avantages et les inconvénients de cette globalisation numérique ?",
  "Selon vous, l'apprentissage des langues étrangères devrait-il être obligatoire dès le primaire ? Pourquoi ? Donnez des exemples pour soutenir votre position.",
  "Pensez-vous que les réseaux sociaux ont changé la façon dont les jeunes communiquent ? Cette évolution est-elle positive ou négative ? Justifiez votre réponse.",
  "Certaines personnes choisissent de ne pas avoir d'enfants. Que pensez-vous de ce choix de vie ? Quelles sont, selon vous, les raisons qui peuvent motiver cette décision ?",
  "Faut-il privilégier la qualité ou la quantité dans le travail ? Selon vous, qu'est-ce qui rend un travail vraiment réussi ? Argumentez avec des exemples.",
];
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

router.use(authenticateToken);

// ============================================================
// GET /eo-simulation/config — return Gemini config for frontend
// (the frontend uses the API key directly in WebSocket;
//  in production this should be replaced with ephemeral tokens)
// ============================================================
router.get('/config', async (req, res) => {
  try {
    if (GEMINI_API_KEYS.length === 0) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }
    res.json({
      apiKey: GEMINI_API_KEYS[0],
      liveModel: GEMINI_LIVE_MODEL,
      textModel: GEMINI_TEXT_MODEL,
      studentName: `${req.user.first_name} ${req.user.last_name}`,
      firstName: req.user.first_name,
    });
  } catch (error) {
    console.error('GET /eo-simulation/config error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// POST /eo-simulation/start — start a new session for a specific partie
// (or fall back to global random if no partieId provided)
// ============================================================
router.post('/start', async (req, res) => {
  try {
    const { partieId } = req.body || {};

    let partieInfo = null;
    let tache1Info = null;
    let tache1Points = [];
    let tache2Sujet = null;
    let tache3Sujet = null;

    if (partieId) {
      // ── Load THIS partie's content (matches what the student clicked on) ──
      partieInfo = await req.db.get(
        `SELECT p.id, p.name, m.month_name, y.year
         FROM tcf_eo_parties p
         JOIN tcf_eo_months m ON p.month_id = m.id
         JOIN tcf_eo_years y ON m.year_id = y.id
         WHERE p.id = $1`,
        [partieId]
      );
      if (!partieInfo) {
        return res.status(404).json({ error: 'Partie not found' });
      }

      // Tâche 1 (presentation) — get prompt + points to address
      tache1Info = await req.db.get(
        `SELECT id, prompt_text, prep_minutes, duration_minutes
         FROM tcf_eo_taches
         WHERE partie_id = $1 AND task_type = 'presentation'
         LIMIT 1`,
        [partieId]
      );
      if (tache1Info) {
        tache1Points = await req.db.all(
          `SELECT point_number, title, subtitle
           FROM tcf_eo_points_aborder
           WHERE tache_id = $1
           ORDER BY point_number ASC`,
          [tache1Info.id]
        );
      }

      // Tâche 2 (interaction) — random sujet within THIS partie
      tache2Sujet = await req.db.get(
        `SELECT s.id, s.prompt_text, s.duration_seconds, s.correction_text
         FROM tcf_eo_sujets s
         JOIN tcf_eo_taches t ON s.tache_id = t.id
         WHERE t.partie_id = $1 AND t.task_type = 'interaction'
           AND s.prompt_text IS NOT NULL AND TRIM(s.prompt_text) <> ''
         ORDER BY RANDOM() LIMIT 1`,
        [partieId]
      );

      // Tâche 3 (argumentation) — random sujet within THIS partie
      tache3Sujet = await req.db.get(
        `SELECT s.id, s.prompt_text, s.duration_seconds, s.correction_text
         FROM tcf_eo_sujets s
         JOIN tcf_eo_taches t ON s.tache_id = t.id
         WHERE t.partie_id = $1 AND t.task_type = 'argumentation'
           AND s.prompt_text IS NOT NULL AND TRIM(s.prompt_text) <> ''
         ORDER BY RANDOM() LIMIT 1`,
        [partieId]
      );

      // ── Cross-partie fallback: if THIS partie doesn't have a sujet for a tâche,
      //    pick a random sujet from any other partie. This avoids the "aucun sujet
      //    pour cette tâche" problem when an admin hasn't seeded full content yet.
      if (!tache2Sujet) {
        tache2Sujet = await req.db.get(
          `SELECT s.id, s.prompt_text, s.duration_seconds, s.correction_text
           FROM tcf_eo_sujets s
           JOIN tcf_eo_taches t ON s.tache_id = t.id
           WHERE t.task_type = 'interaction'
             AND s.prompt_text IS NOT NULL AND TRIM(s.prompt_text) <> ''
           ORDER BY RANDOM() LIMIT 1`
        );
      }
      if (!tache3Sujet) {
        tache3Sujet = await req.db.get(
          `SELECT s.id, s.prompt_text, s.duration_seconds, s.correction_text
           FROM tcf_eo_sujets s
           JOIN tcf_eo_taches t ON s.tache_id = t.id
           WHERE t.task_type = 'argumentation'
             AND s.prompt_text IS NOT NULL AND TRIM(s.prompt_text) <> ''
           ORDER BY RANDOM() LIMIT 1`
        );
      }
    } else {
      // ── Fallback: pick random sujets from anywhere (no specific partie) ──
      tache2Sujet = await req.db.get(
        `SELECT s.id, s.prompt_text, s.duration_seconds, s.correction_text
         FROM tcf_eo_sujets s
         JOIN tcf_eo_taches t ON s.tache_id = t.id
         WHERE t.task_type = 'interaction'
           AND s.prompt_text IS NOT NULL AND TRIM(s.prompt_text) <> ''
         ORDER BY RANDOM() LIMIT 1`
      );
      tache3Sujet = await req.db.get(
        `SELECT s.id, s.prompt_text, s.duration_seconds, s.correction_text
         FROM tcf_eo_sujets s
         JOIN tcf_eo_taches t ON s.tache_id = t.id
         WHERE t.task_type = 'argumentation'
           AND s.prompt_text IS NOT NULL AND TRIM(s.prompt_text) <> ''
         ORDER BY RANDOM() LIMIT 1`
      );
    }

    // ── Last-resort fallback prompts: only if the entire DB has no sujets at all
    // for that tâche type. These are real TCF/TEF-style sujets, so the AI examiner
    // can still propose a meaningful exercise instead of saying "aucun sujet".
    if (!tache2Sujet) {
      tache2Sujet = {
        id: null,
        prompt_text: pickRandom(FALLBACK_T2_SUJETS),
        duration_seconds: 210,
        correction_text: null,
      };
    }
    if (!tache3Sujet) {
      tache3Sujet = {
        id: null,
        prompt_text: pickRandom(FALLBACK_T3_SUJETS),
        duration_seconds: 270,
        correction_text: null,
      };
    }

    // Consume 1 EO credit before creating a new simulation. EO simulations are
    // always new (no resume path here), so every start consumes a credit.
    // If the student has 0 EO credits, return 402 with a clear message.
    const aiCredits = require('../services/aiCreditService');
    try {
      await aiCredits.consumeCredit(req.db, req.user.id, 'eo', {
        reason: 'eo_attempt',
        related_entity_type: 'eo_simulation',
        related_entity_id: null,
      });
    } catch (creditErr) {
      if (creditErr.code === 'INSUFFICIENT_CREDITS') {
        return res.status(402).json({
          error: 'INSUFFICIENT_CREDITS',
          credit_type: 'eo',
          message: 'You are out of Expression Orale credits. Please contact your administrator for more credits.',
        });
      }
      console.error('[eo-simulation/start] credit consume failed:', creditErr);
      return res.status(500).json({ error: 'Failed to consume credit' });
    }

    // Create the simulation record (partie_id may be null; sujet ids may be null when fallback prompts are used)
    const result = await req.db.run(
      `INSERT INTO eo_simulations
        (user_id, partie_id, tache1_tache_id, tache2_sujet_id, tache3_sujet_id, status)
       VALUES ($1, $2, $3, $4, $5, 'in_progress') RETURNING id`,
      [req.user.id, partieId || null, tache1Info?.id || null, tache2Sujet.id || null, tache3Sujet.id || null]
    );

    res.json({
      simulationId: result.id || result.lastID,
      studentName: `${req.user.first_name} ${req.user.last_name}`,
      firstName: req.user.first_name,
      partie: partieInfo
        ? { id: partieInfo.id, name: partieInfo.name, monthName: partieInfo.month_name, year: partieInfo.year }
        : null,
      tache1: tache1Info
        ? {
            id: tache1Info.id,
            prompt: tache1Info.prompt_text || "Présentez-vous en parlant de votre identité, votre formation, vos loisirs et vos projets.",
            durationMinutes: Number(tache1Info.duration_minutes) || 2,
            points: tache1Points.map(p => ({ number: p.point_number, title: p.title, subtitle: p.subtitle })),
          }
        : {
            id: null,
            prompt: "Présentez-vous en parlant de votre identité, votre formation, vos loisirs et vos projets.",
            durationMinutes: 2,
            points: [
              { number: 1, title: 'Identité', subtitle: 'Nom, âge, origine, situation' },
              { number: 2, title: 'Formation', subtitle: 'Études, parcours académique' },
              { number: 3, title: 'Loisirs', subtitle: 'Vos passe-temps et centres d\'intérêt' },
              { number: 4, title: 'Projets', subtitle: 'Vos objectifs futurs' },
            ],
          },
      tache2: { id: tache2Sujet.id || null, prompt: (tache2Sujet.prompt_text && tache2Sujet.prompt_text.trim()) || pickRandom(FALLBACK_T2_SUJETS) },
      tache3: { id: tache3Sujet.id || null, prompt: (tache3Sujet.prompt_text && tache3Sujet.prompt_text.trim()) || pickRandom(FALLBACK_T3_SUJETS) },
    });
  } catch (error) {
    console.error('POST /eo-simulation/start error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// POST /eo-simulation/:id/transcript — save a tâche transcript
// ============================================================
router.post('/:id/transcript', async (req, res) => {
  try {
    const { id } = req.params;
    const { tache, transcript, questions } = req.body;
    if (![1, 2, 3].includes(tache)) {
      return res.status(400).json({ error: 'Invalid tâche number' });
    }

    const sim = await req.db.get('SELECT user_id FROM eo_simulations WHERE id = $1', [id]);
    if (!sim) return res.status(404).json({ error: 'Simulation not found' });
    if (sim.user_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    const fields = {
      1: 'tache1_transcript',
      2: 'tache2_transcript',
      3: 'tache3_transcript',
    };
    await req.db.run(
      `UPDATE eo_simulations SET ${fields[tache]} = $1 WHERE id = $2`,
      [transcript || '', id]
    );

    if (tache === 1 && Array.isArray(questions)) {
      await req.db.run(
        'UPDATE eo_simulations SET tache1_questions = $1 WHERE id = $2',
        [JSON.stringify(questions), id]
      );
    }

    res.json({ message: 'Transcript saved' });
  } catch (error) {
    console.error('POST /eo-simulation/:id/transcript error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// POST /eo-simulation/:id/evaluate — generate AI evaluation & score
// ============================================================
router.post('/:id/evaluate', async (req, res) => {
  try {
    const { id } = req.params;
    const sim = await req.db.get(
      `SELECT s.*, 
        s2.prompt_text as tache2_prompt,
        s3.prompt_text as tache3_prompt
       FROM eo_simulations s
       LEFT JOIN tcf_eo_sujets s2 ON s.tache2_sujet_id = s2.id
       LEFT JOIN tcf_eo_sujets s3 ON s.tache3_sujet_id = s3.id
       WHERE s.id = $1`,
      [id]
    );
    if (!sim) return res.status(404).json({ error: 'Simulation not found' });
    if (sim.user_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    // Compute word counts (used both for the prompt and as a safety net)
    const wordCount = (s) => (s || '').trim().split(/\s+/).filter(w => w.length > 0).length;
    const t1Words = wordCount(sim.tache1_transcript);
    const t2Words = wordCount(sim.tache2_transcript);
    const t3Words = wordCount(sim.tache3_transcript);

    const t1Questions = (() => {
      try {
        if (!sim.tache1_questions) return [];
        return typeof sim.tache1_questions === 'string' ? JSON.parse(sim.tache1_questions) : sim.tache1_questions;
      } catch { return []; }
    })();

    // Build the evaluation prompt — strict, rubric-driven, French exam style
    const systemInstruction =
`Tu es un examinateur officiel certifié des examens TCF/TEF Canada — Expression Orale.
Tu évalues les performances des candidats avec rigueur, équité et bienveillance pédagogique, en suivant strictement les barèmes officiels.

CRITÈRES OFFICIELS (chacun sur 20):
1. Cohérence et organisation du discours — Capacité à structurer les idées de manière logique avec des connecteurs.
2. Étendue et précision du vocabulaire — Richesse lexicale, précision, registre adapté.
3. Correction grammaticale et morphosyntaxique — Conjugaisons, accords, syntaxe.
4. Aisance et fluidité — Rythme, hésitations, prononciation, débit naturel.
5. Réalisation de la tâche — Pertinence par rapport au sujet, respect des consignes, complétude.

BARÈME OFFICIEL (par tâche, sur 20):
- 0 points: Aucune production ou hors sujet complet.
- 1 à 4 (A1): Production minimale, très fragmentaire, communication très limitée.
- 5 à 8 (A2): Phrases simples, erreurs fréquentes, vocabulaire limité.
- 9 à 11 (B1): Communication claire mais hésitante, erreurs présentes mais compréhensibles.
- 12 à 14 (B2): Bonne maîtrise, peu d'erreurs, vocabulaire varié, idées développées.
- 15 à 17 (C1): Excellente maîtrise, vocabulaire riche, structure soignée, fluidité naturelle.
- 18 à 20 (C2): Niveau quasi-natif, exceptionnel, vocabulaire très riche.

PONDÉRATION POUR LA NOTE GLOBALE:
- Tâche 1 (Présentation): 20%
- Tâche 2 (Interaction):  35%
- Tâche 3 (Argumentation): 45%

RÈGLES IMPORTANTES:
- Si la transcription d'une tâche est VIDE ou ne contient AUCUN mot pertinent, attribue 0/20 pour cette tâche et explique-le dans le retour.
- Si la production est très courte par rapport au temps disponible (<30 mots pour T1, <60 mots pour T2, <80 mots pour T3), pénalise sur "Réalisation de la tâche".
- Sois précis dans le retour: cite des exemples concrets de la production de l'étudiant.
- Donne au moins 2 points forts et 2 axes d'amélioration spécifiques par tâche (sauf si score = 0).
- Tous les retours doivent être en français.
- Réponds UNIQUEMENT avec le JSON demandé, sans markdown ni commentaire.`;

    const userPrompt =
`Voici les transcriptions du candidat aux trois tâches de l'épreuve d'expression orale TCF/TEF Canada. Évalue chaque tâche selon les critères officiels et le barème ci-dessus.

──────────────────────────────────────────────
TÂCHE 1 — Présentation personnelle (2 min, monologue avec relance)
──────────────────────────────────────────────
Consigne: Le candidat se présente librement (identité, formation, loisirs, projets).
Questions de relance posées par l'examinateur durant la tâche:
${t1Questions.length > 0 ? t1Questions.map((q, i) => `  ${i+1}. ${q}`).join('\n') : '  (Aucune question de relance)'}

Nombre de mots prononcés par le candidat: ${t1Words}
Transcription du candidat:
"""
${sim.tache1_transcript || '[AUCUNE PRODUCTION ORALE]'}
"""

──────────────────────────────────────────────
TÂCHE 2 — Interaction orale (2 min préparation + 3 min 30 dialogue)
──────────────────────────────────────────────
Sujet officiel: ${sim.tache2_prompt || '(N/A)'}

Nombre de mots prononcés par le candidat: ${t2Words}
Transcription du candidat:
"""
${sim.tache2_transcript || '[AUCUNE PRODUCTION ORALE]'}
"""

──────────────────────────────────────────────
TÂCHE 3 — Argumentation (4 min 30, monologue)
──────────────────────────────────────────────
Sujet officiel: ${sim.tache3_prompt || '(N/A)'}

Nombre de mots prononcés par le candidat: ${t3Words}
Transcription du candidat:
"""
${sim.tache3_transcript || '[AUCUNE PRODUCTION ORALE]'}
"""

──────────────────────────────────────────────
INSTRUCTIONS DE NOTATION
──────────────────────────────────────────────
Évalue chaque tâche sur 20 selon le barème officiel.
Fournis aussi:
- 5 critères globaux notés sur 20 (cohérence, vocabulaire, grammaire, fluidité, réalisation de la tâche).
- Une note globale sur 20 (moyenne pondérée T1=20%, T2=35%, T3=45%, arrondie à 0,5 près).
- Un retour détaillé pour chaque tâche citant des exemples concrets de la transcription.
- Un message global d'encouragement et de conseils.

Si l'étudiant n'a rien produit (transcription vide), donne 0 et explique. NE DONNE PAS 10/20 PAR DÉFAUT — ÉVALUE RÉELLEMENT.`;

    // JSON schema for structured output (Gemini supports this for reliable parsing)
    const responseSchema = {
      type: 'object',
      properties: {
        tache1_score: { type: 'number', description: 'Score de la tâche 1 sur 20' },
        tache2_score: { type: 'number', description: 'Score de la tâche 2 sur 20' },
        tache3_score: { type: 'number', description: 'Score de la tâche 3 sur 20' },
        overall_score: { type: 'number', description: 'Score global sur 20 (moyenne pondérée)' },
        tache1_feedback: { type: 'string', description: 'Retour détaillé tâche 1 en français' },
        tache2_feedback: { type: 'string', description: 'Retour détaillé tâche 2 en français' },
        tache3_feedback: { type: 'string', description: 'Retour détaillé tâche 3 en français' },
        overall_feedback: { type: 'string', description: 'Message global encourageant en français' },
        criteria_scores: {
          type: 'object',
          properties: {
            coherence: { type: 'number' },
            vocabulary: { type: 'number' },
            grammar: { type: 'number' },
            fluency: { type: 'number' },
            task_completion: { type: 'number' },
          },
          required: ['coherence', 'vocabulary', 'grammar', 'fluency', 'task_completion'],
        },
      },
      required: [
        'tache1_score', 'tache2_score', 'tache3_score', 'overall_score',
        'tache1_feedback', 'tache2_feedback', 'tache3_feedback', 'overall_feedback',
        'criteria_scores',
      ],
    };

    // Try the AI call across all available API keys (rate-limit fallback)
    const evaluation = await callGeminiEvaluation({
      systemInstruction,
      userPrompt,
      responseSchema,
      transcripts: { t1: sim.tache1_transcript, t2: sim.tache2_transcript, t3: sim.tache3_transcript },
      wordCounts: { t1: t1Words, t2: t2Words, t3: t3Words },
    });

    // Save the evaluation
    await req.db.run(
      `UPDATE eo_simulations SET 
        tache1_score = $1, tache2_score = $2, tache3_score = $3, overall_score = $4,
        tache1_feedback = $5, tache2_feedback = $6, tache3_feedback = $7, overall_feedback = $8,
        criteria_scores = $9, status = 'completed', completed_at = CURRENT_TIMESTAMP,
        duration_seconds = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - started_at))::INTEGER
       WHERE id = $10`,
      [
        evaluation.tache1_score, evaluation.tache2_score, evaluation.tache3_score, evaluation.overall_score,
        evaluation.tache1_feedback, evaluation.tache2_feedback, evaluation.tache3_feedback, evaluation.overall_feedback,
        JSON.stringify(evaluation.criteria_scores || {}),
        id,
      ]
    );

    res.json(evaluation);
  } catch (error) {
    console.error('POST /eo-simulation/:id/evaluate error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// GET /eo-simulation/history — get user's past simulations
// Optional query: ?partieId=X to filter by partie
// ============================================================
router.get('/history', async (req, res) => {
  try {
    const { partieId } = req.query;
    let sql = `SELECT s.id, s.partie_id, s.overall_score, s.tache1_score, s.tache2_score, s.tache3_score,
        s.status, s.started_at, s.completed_at, s.duration_seconds, s.criteria_scores,
        p.name as partie_name, m.month_name, y.year
       FROM eo_simulations s
       LEFT JOIN tcf_eo_parties p ON s.partie_id = p.id
       LEFT JOIN tcf_eo_months m ON p.month_id = m.id
       LEFT JOIN tcf_eo_years y ON m.year_id = y.id
       WHERE s.user_id = $1 AND s.status = 'completed'`;
    const params = [req.user.id];
    if (partieId) {
      params.push(partieId);
      sql += ` AND s.partie_id = $${params.length}`;
    }
    sql += ' ORDER BY s.completed_at DESC LIMIT 50';
    const sims = await req.db.all(sql, params);
    res.json(sims);
  } catch (error) {
    console.error('GET /eo-simulation/history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// GET /eo-simulation/analytics — aggregated performance overview
// Returns global stats + per-partie breakdown for all completed sessions
// ============================================================
router.get('/analytics', async (req, res) => {
  try {
    // Global stats
    const global = await req.db.get(
      `SELECT
        COUNT(*)::int as total_sessions,
        AVG(overall_score)::numeric(4,2) as avg_overall,
        AVG(tache1_score)::numeric(4,2) as avg_tache1,
        AVG(tache2_score)::numeric(4,2) as avg_tache2,
        AVG(tache3_score)::numeric(4,2) as avg_tache3,
        MAX(overall_score)::numeric(4,2) as best_overall,
        MIN(overall_score)::numeric(4,2) as worst_overall,
        SUM(COALESCE(duration_seconds, 0))::int as total_duration_seconds
       FROM eo_simulations
       WHERE user_id = $1 AND status = 'completed'`,
      [req.user.id]
    );

    // Per-partie breakdown
    const perPartie = await req.db.all(
      `SELECT s.partie_id,
        COALESCE(p.name, 'Pratique libre') as partie_name,
        m.month_name, y.year,
        COUNT(*)::int as attempts,
        AVG(s.overall_score)::numeric(4,2) as avg_score,
        MAX(s.overall_score)::numeric(4,2) as best_score,
        MAX(s.completed_at) as last_attempt
       FROM eo_simulations s
       LEFT JOIN tcf_eo_parties p ON s.partie_id = p.id
       LEFT JOIN tcf_eo_months m ON p.month_id = m.id
       LEFT JOIN tcf_eo_years y ON m.year_id = y.id
       WHERE s.user_id = $1 AND s.status = 'completed'
       GROUP BY s.partie_id, p.name, m.month_name, y.year
       ORDER BY last_attempt DESC`,
      [req.user.id]
    );

    // Recent timeline (for trend chart)
    const timeline = await req.db.all(
      `SELECT id, overall_score, tache1_score, tache2_score, tache3_score, completed_at
       FROM eo_simulations
       WHERE user_id = $1 AND status = 'completed'
       ORDER BY completed_at ASC
       LIMIT 30`,
      [req.user.id]
    );

    // Aggregate criteria scores
    const sessions = await req.db.all(
      `SELECT criteria_scores
       FROM eo_simulations
       WHERE user_id = $1 AND status = 'completed' AND criteria_scores IS NOT NULL`,
      [req.user.id]
    );
    const critTotals = { coherence: 0, vocabulary: 0, grammar: 0, fluency: 0, task_completion: 0 };
    let critCount = 0;
    sessions.forEach(s => {
      const cs = typeof s.criteria_scores === 'string' ? JSON.parse(s.criteria_scores) : (s.criteria_scores || {});
      if (cs && Object.keys(cs).length) {
        critCount++;
        for (const k of Object.keys(critTotals)) {
          critTotals[k] += Number(cs[k] || 0);
        }
      }
    });
    const avgCriteria = critCount > 0
      ? Object.fromEntries(Object.entries(critTotals).map(([k, v]) => [k, +(v / critCount).toFixed(2)]))
      : null;

    res.json({
      global: global || { total_sessions: 0 },
      perPartie,
      timeline,
      avgCriteria,
    });
  } catch (error) {
    console.error('GET /eo-simulation/analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// GET /eo-simulation/:id — get full simulation details
// ============================================================
router.get('/:id', async (req, res) => {
  try {
    const sim = await req.db.get(
      `SELECT s.*,
        s2.prompt_text as tache2_prompt,
        s3.prompt_text as tache3_prompt,
        p.name as partie_name,
        m.month_name, y.year,
        t1.prompt_text as tache1_prompt
       FROM eo_simulations s
       LEFT JOIN tcf_eo_sujets s2 ON s.tache2_sujet_id = s2.id
       LEFT JOIN tcf_eo_sujets s3 ON s.tache3_sujet_id = s3.id
       LEFT JOIN tcf_eo_parties p ON s.partie_id = p.id
       LEFT JOIN tcf_eo_months m ON p.month_id = m.id
       LEFT JOIN tcf_eo_years y ON m.year_id = y.id
       LEFT JOIN tcf_eo_taches t1 ON s.tache1_tache_id = t1.id
       WHERE s.id = $1`,
      [req.params.id]
    );
    if (!sim) return res.status(404).json({ error: 'Not found' });
    if (sim.user_id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Load tâche1 points if available
    if (sim.tache1_tache_id) {
      sim.tache1_points = await req.db.all(
        `SELECT point_number, title, subtitle FROM tcf_eo_points_aborder WHERE tache_id = $1 ORDER BY point_number`,
        [sim.tache1_tache_id]
      );
    } else {
      sim.tache1_points = [];
    }

    res.json(sim);
  } catch (error) {
    console.error('GET /eo-simulation/:id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// AI Evaluation Helpers
// ============================================================

// Call Gemini with retry across all available API keys.
// Returns a validated evaluation object. Falls back to a deterministic
// transcript-based heuristic only if all keys fail.
async function callGeminiEvaluation({ systemInstruction, userPrompt, responseSchema, transcripts, wordCounts }) {
  // If we have no usable transcript at all, skip AI and use heuristic (which gives 0s)
  const totalWords = (wordCounts.t1 || 0) + (wordCounts.t2 || 0) + (wordCounts.t3 || 0);

  if (GEMINI_API_KEYS.length === 0) {
    console.warn('⚠️  EO eval: No Gemini API key configured — using heuristic fallback.');
    return heuristicEvaluation({ transcripts, wordCounts });
  }

  let lastError = null;
  for (let i = 0; i < GEMINI_API_KEYS.length; i++) {
    const apiKey = GEMINI_API_KEYS[i];
    try {
      console.log(`🎙️  EO eval: Calling Gemini (${GEMINI_TEXT_MODEL}) with key ${i}, total words=${totalWords}...`);
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: userPrompt,
        config: {
          systemInstruction,
          temperature: 0.3,
          maxOutputTokens: 4096,
          responseMimeType: 'application/json',
          responseSchema,
        },
      });

      const rawText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (!rawText) {
        throw new Error('Empty response from Gemini');
      }

      let parsed;
      try {
        parsed = JSON.parse(rawText);
      } catch (parseErr) {
        console.error('🎙️  EO eval: JSON parse failed. Raw response:', rawText.substring(0, 500));
        throw new Error('AI returned invalid JSON');
      }

      const validated = validateEvaluation(parsed, wordCounts);
      console.log(`✅ EO eval done: T1=${validated.tache1_score}, T2=${validated.tache2_score}, T3=${validated.tache3_score}, overall=${validated.overall_score}`);
      return validated;

    } catch (err) {
      lastError = err;
      console.error(`❌ EO eval failed with key ${i}: ${err.message}`);

      // Quota / rate limit → try next key
      const retryable = err.status === 429 || /quota|rate limit/i.test(err.message || '');
      if (retryable && i < GEMINI_API_KEYS.length - 1) {
        console.log(`🔄 Retrying with next key...`);
        continue;
      }
      // 4xx (auth, bad request) — don't retry across keys for non-rate-limit errors
      if (err.status && err.status >= 400 && err.status < 500 && err.status !== 429) {
        break;
      }
    }
  }

  console.warn(`⚠️  EO eval: All AI attempts failed (${lastError?.message}) — falling back to heuristic.`);
  return heuristicEvaluation({ transcripts, wordCounts });
}

// Clamp + validate the AI's evaluation response.
// Ensures all scores are valid numbers in [0, 20]; recomputes overall if missing.
function validateEvaluation(raw, wordCounts) {
  const clamp = (v, min = 0, max = 20) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return min;
    return Math.max(min, Math.min(max, Math.round(n * 10) / 10));
  };

  const t1 = clamp(raw.tache1_score);
  const t2 = clamp(raw.tache2_score);
  const t3 = clamp(raw.tache3_score);

  // Recompute overall if missing or absurd; weighted T1=20%, T2=35%, T3=45%
  let overall = clamp(raw.overall_score);
  if (!Number.isFinite(Number(raw.overall_score))) {
    overall = Math.round((t1 * 0.2 + t2 * 0.35 + t3 * 0.45) * 10) / 10;
  }

  const cs = raw.criteria_scores || {};
  const criteria_scores = {
    coherence: clamp(cs.coherence),
    vocabulary: clamp(cs.vocabulary),
    grammar: clamp(cs.grammar),
    fluency: clamp(cs.fluency),
    task_completion: clamp(cs.task_completion),
  };

  // Hard floor: if a tâche transcript is truly empty, force its score to 0.
  // This protects against the AI hallucinating scores when there's no production.
  const safeFeedback = (txt, fallback) => (typeof txt === 'string' && txt.trim() ? txt.trim() : fallback);
  let tache1_score = t1, tache2_score = t2, tache3_score = t3;
  let tache1_feedback = safeFeedback(raw.tache1_feedback, 'Pas de retour disponible.');
  let tache2_feedback = safeFeedback(raw.tache2_feedback, 'Pas de retour disponible.');
  let tache3_feedback = safeFeedback(raw.tache3_feedback, 'Pas de retour disponible.');

  if (wordCounts.t1 === 0) {
    tache1_score = 0;
    tache1_feedback = "Aucune production orale n'a été enregistrée pour la tâche 1. Pour progresser, prenez le temps de vous présenter en abordant les quatre points (identité, formation, loisirs, projets).";
  }
  if (wordCounts.t2 === 0) {
    tache2_score = 0;
    tache2_feedback = "Aucune production orale n'a été enregistrée pour la tâche 2. Cette tâche évalue votre capacité à poser des questions pertinentes dans un contexte d'interaction. Réessayez en utilisant le temps de préparation pour formuler vos questions.";
  }
  if (wordCounts.t3 === 0) {
    tache3_score = 0;
    tache3_feedback = "Aucune production orale n'a été enregistrée pour la tâche 3. Cette tâche évalue votre capacité à argumenter sur un sujet de société. Pour réussir, structurez votre opinion avec une introduction, des arguments et une conclusion.";
  }

  // Recompute overall if any tâche was forced to 0
  if (wordCounts.t1 === 0 || wordCounts.t2 === 0 || wordCounts.t3 === 0) {
    overall = Math.round((tache1_score * 0.2 + tache2_score * 0.35 + tache3_score * 0.45) * 10) / 10;
  }

  return {
    tache1_score, tache2_score, tache3_score, overall_score: overall,
    tache1_feedback, tache2_feedback, tache3_feedback,
    overall_feedback: safeFeedback(raw.overall_feedback,
      "Bravo pour avoir terminé cette simulation. Continuez à pratiquer régulièrement pour progresser."),
    criteria_scores,
  };
}

// Deterministic heuristic — used ONLY if Gemini is unreachable for all keys.
// Scores are derived from transcript word counts so the result is at least
// proportional to effort, never a flat 10/20.
function heuristicEvaluation({ transcripts, wordCounts }) {
  // Reference word counts for a "passing" production at each tâche.
  const refs = { t1: 180, t2: 280, t3: 380 };
  const scoreFromWords = (words, ref) => {
    if (!words) return 0;
    // Linear ramp: 0 words = 0, ref words = 12 (passable B1), 1.5×ref = 15 (B2)
    const ratio = words / ref;
    if (ratio <= 0) return 0;
    if (ratio < 0.2) return Math.round(ratio * 5 * 10) / 10;     // 0–4
    if (ratio < 0.5) return Math.round((4 + (ratio - 0.2) * 13.33) * 10) / 10; // 4–8
    if (ratio < 0.8) return Math.round((8 + (ratio - 0.5) * 10) * 10) / 10;    // 8–11
    if (ratio < 1.0) return Math.round((11 + (ratio - 0.8) * 5) * 10) / 10;    // 11–12
    if (ratio < 1.3) return Math.round((12 + (ratio - 1.0) * 6.67) * 10) / 10; // 12–14
    if (ratio < 1.7) return Math.round((14 + (ratio - 1.3) * 2.5) * 10) / 10;  // 14–15
    return 15; // Cap heuristic at 15; only AI can confirm higher levels.
  };

  const t1 = scoreFromWords(wordCounts.t1, refs.t1);
  const t2 = scoreFromWords(wordCounts.t2, refs.t2);
  const t3 = scoreFromWords(wordCounts.t3, refs.t3);
  const overall = Math.round((t1 * 0.2 + t2 * 0.35 + t3 * 0.45) * 10) / 10;

  const fb = (words, ref, name) => {
    if (!words) return `Aucune production orale n'a été enregistrée pour ${name}. Cette tâche n'a pas pu être évaluée.`;
    const ratio = words / ref;
    if (ratio < 0.4) return `${name}: production très courte (${words} mots). Pour progresser, parlez davantage en développant chaque idée avec des exemples concrets. L'évaluation détaillée n'a pas pu être générée automatiquement par l'IA — réessayez plus tard pour obtenir un retour personnalisé.`;
    if (ratio < 0.8) return `${name}: production correcte mais à étoffer (${words} mots). Travaillez la structure et les connecteurs logiques (d'abord, ensuite, par exemple, en effet, c'est-à-dire, finalement). L'évaluation IA détaillée est temporairement indisponible.`;
    return `${name}: bonne production en quantité (${words} mots). Continuez à enrichir votre vocabulaire et à varier les structures grammaticales. L'évaluation IA détaillée est temporairement indisponible — réessayez plus tard pour un retour ciblé.`;
  };

  return {
    tache1_score: t1,
    tache2_score: t2,
    tache3_score: t3,
    overall_score: overall,
    tache1_feedback: fb(wordCounts.t1, refs.t1, 'Tâche 1 (Présentation)'),
    tache2_feedback: fb(wordCounts.t2, refs.t2, 'Tâche 2 (Interaction)'),
    tache3_feedback: fb(wordCounts.t3, refs.t3, 'Tâche 3 (Argumentation)'),
    overall_feedback:
      `Note préliminaire: ${overall}/20 (calculée à partir de la quantité de production). ` +
      `L'évaluation détaillée par l'IA n'est pas disponible pour le moment, mais votre production a bien été enregistrée. ` +
      `Veuillez réessayer plus tard pour obtenir un retour qualitatif complet sur la cohérence, le vocabulaire, la grammaire et la fluidité.`,
    criteria_scores: {
      coherence: overall,
      vocabulary: overall,
      grammar: overall,
      fluency: overall,
      task_completion: overall,
    },
  };
}

module.exports = router;
