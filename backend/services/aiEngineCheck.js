// ============================================================
// Engine check (Admin → AI engine → Run test): one small request per
// capability, on the engine tested, through the very paths the platform uses —
//  • text: a short JSON answer (quizzes, exam scoring);
//  • voice: one sentence of speech (listening quizzes);
//  • examiner: a live session opened as a candidate's browser opens it (an
//    ephemeral token on the Developer API, this server's relay on Vertex AI),
//    up to the examiner's first words.
// ============================================================
const { WebSocket } = require('ws');
const ai = require('./aiModels');
const examiner = require('./eoExaminer');
const liveRelay = require('./liveRelay');
const { getTTSService } = require('./ttsService');

// Long enough for the platform's own fallbacks (other keys, then older models) to answer.
const STEP_TIMEOUT_MS = 90_000;
const LIVE_TIMEOUT_MS = 20_000;

const REASONS = { 429: 'over quota', 503: 'busy', 404: 'not available', 403: 'access denied', 401: 'key refused', 400: 'request refused' };
/** Collects the refusals of one check and sums them up: "gemini-3.8-flash: busy (503) ×10". */
function refusals() {
  const seen = new Map();
  return {
    onFailure: (model, status) => { const k = `${model}|${status}`; seen.set(k, (seen.get(k) || 0) + 1); },
    summary: () => [...seen].map(([k, n]) => {
      const [model, status] = k.split('|');
      return `${model}: ${REASONS[status] || 'error'}${Number(status) ? ` (${status})` : ''}${n > 1 ? ` ×${n}` : ''}`;
    }).join(' · '),
  };
}

const withTimeout = (promise, ms, what, log) => {
  let timer;
  return Promise.race([
    promise.finally(() => clearTimeout(timer)),
    new Promise((_, reject) => {
      timer = setTimeout(() => {
        const why = log?.summary();
        reject(new Error(`${what} did not answer within ${Math.round(ms / 1000)} s${why ? ` — ${why}` : ''}`));
      }, ms);
    }),
  ]);
};

async function step(id, run) {
  const started = Date.now();
  try {
    const { model, detail } = await run();
    return { id, ok: true, ms: Date.now() - started, model, detail };
  } catch (err) {
    return { id, ok: false, ms: Date.now() - started, error: ai.safeMessage(err) };
  }
}

/** The models that refused before one answered, for the result line. */
const afterRefusals = (log) => { const s = log.summary(); return s ? ` (after ${s})` : ''; };

function checkText(engine) {
  return step('text', async () => {
    const log = refusals();
    const { result, model } = await withTimeout(ai.withFallback('text', async (client, model) => {
      const res = await client.models.generateContent({
        model,
        contents: 'Test de connexion : réponds avec le mot « prêt ».',
        config: { responseMimeType: 'application/json', responseSchema: { type: 'object', properties: { status: { type: 'string' } }, required: ['status'] } },
      });
      const json = JSON.parse(res.text || '{}');
      if (!json.status) throw ai.badAnswer('Empty answer');
      return json.status;
    }, { engine, unlimited: false, label: `Engine check (${engine})`, onFailure: log.onFailure }), STEP_TIMEOUT_MS, 'The text models', log);
    return { model, detail: `Answered « ${String(result).slice(0, 40)} »${afterRefusals(log)}` };
  });
}

function checkVoice(engine) {
  return step('voice', async () => {
    const log = refusals();
    const { pcm, model } = await withTimeout(getTTSService().synthesize('Bonjour, ceci est un test de la voix.', 'Kore', { engine, onFailure: log.onFailure }), STEP_TIMEOUT_MS, 'The voice models', log);
    return { model, detail: `${(pcm.length / 48000).toFixed(1)} s of speech${afterRefusals(log)}` };
  });
}

/** Opens a raw Live connection and waits for the examiner's first audio after [DÉBUT]. */
function liveRoundTrip(url, { headers, setup }) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url, { headers, perMessageDeflate: false, handshakeTimeout: 15_000 });
    let settled = false;
    const done = (fn) => { if (settled) return; settled = true; clearTimeout(timer); try { ws.close(1000); } catch { /* gone */ } fn(); };
    const timer = setTimeout(() => done(() => reject(new Error('The examiner did not answer in time'))), LIVE_TIMEOUT_MS);
    ws.on('open', () => ws.send(JSON.stringify(setup)));
    ws.on('message', (data) => {
      let msg;
      try { msg = JSON.parse(data.toString('utf8')); } catch { return; }
      if (msg.setupComplete) ws.send(JSON.stringify({ realtimeInput: { text: '[DÉBUT]' } }));
      if ((msg.serverContent?.modelTurn?.parts || []).some(p => p.inlineData?.data)) done(resolve);
    });
    ws.on('unexpected-response', (_req, res) => done(() => reject(new Error(`Connection refused (HTTP ${res.statusCode})`))));
    ws.on('close', (code, reason) => done(() => reject(new Error(`Session closed (${code}) ${reason.toString()}`.trim()))));
    ws.on('error', (err) => done(() => reject(err)));
  });
}

function checkExaminer(engine, relayUrl) {
  return step('examiner', async () => {
    const instructions = examiner.examinerInstructions(1, {
      firstName: 'Test',
      examiner: { title: 'examinateur' },
      points: [{ title: 'Identité' }, { title: 'Loisirs' }],
    });
    const errors = [];
    // Newest model first, as the candidate's browser does.
    for (const model of ai.modelsFor('live', engine)) {
      const session = { model, voice: 'Charon', instructions, silenceMs: examiner.SILENCE_MS[1] };
      try {
        if (engine === 'vertex') {
          const vertex = ai.getEngine('vertex');
          if (!vertex.liveReady) throw new Error('VERTEX_PROJECT is not set');
          // Through the relay's public address (the one candidates get), so the
          // proxy in front of the server is part of the test.
          const token = liveRelay.issueTicket({ userId: 'engine-check', setup: examiner.vertexSetup(session), upstream: vertex.liveUpstream() });
          await liveRoundTrip(`${relayUrl}?access_token=${encodeURIComponent(token)}`, {
            setup: { setup: { model: `models/${model}` } },
          });
          return { model, detail: 'The examiner spoke (relayed by this server)' };
        }
        const token = await examiner.createLiveToken(session);
        await liveRoundTrip(`${examiner.WS_URL}?access_token=${encodeURIComponent(token)}`, {
          setup: { setup: { model: `models/${model}`, tools: [examiner.END_TASK_TOOL] } },
        });
        return { model, detail: 'The examiner spoke (ephemeral token)' };
      } catch (err) {
        errors.push(`${model}: ${ai.safeMessage(err).slice(0, 140)}`);
      }
    }
    throw new Error(errors.join(' · ') || 'No Live model is configured');
  });
}

/**
 * Runs the three checks on `engine`, one after the other (a test must not burst
 * a free quota). `relayUrl`: the relay's public address (liveRelay.relayUrlFor).
 */
async function checkEngine(engine, { relayUrl } = {}) {
  if (!ai.ENGINE_IDS.includes(engine)) throw Object.assign(new Error('Unknown AI engine.'), { status: 400 });
  if (!ai.isConfigured(engine)) {
    throw Object.assign(new Error(`This engine is not configured. ${ai.getEngine(engine).issues.join(' ')}`.trim()), { status: 409 });
  }
  const checks = [await checkText(engine), await checkVoice(engine), await checkExaminer(engine, relayUrl)];
  return { engine, at: new Date().toISOString(), ok: checks.every(c => c.ok), checks };
}

module.exports = { checkEngine };
