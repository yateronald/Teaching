// Checks the listening recordings by ear: each sealed recording (the passage
// in both voices, its excerpts, the questions read aloud) is transcribed by
// Gemini and compared word for word with its script. Never runs during the
// build. One request at a time, with a pause between requests.
//
//   node scripts/listening-qa.mjs                     every exercise
//   node scripts/listening-qa.mjs --only id1,id2      some exercises
//   node scripts/listening-qa.mjs --fix               also removes the recordings that do not
//                                                     match, so that `learn-media.mjs --audio`
//                                                     records them again
import { createServer } from 'vite';
import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const req = createRequire(path.join(root, '..', 'backend', 'package.json'));
req('dotenv').config({ path: path.join(root, '..', 'backend', '.env'), quiet: true });
const { GoogleGenAI } = req('@google/genai');

const args = process.argv.slice(2);
const only = args.includes('--only') ? args[args.indexOf('--only') + 1].split(',') : null;
const fix = args.includes('--fix');
const KEY = process.env.VERTEX_API_KEY || process.env.GOOGLE_CLOUD_API_KEY || process.env.Google_cloud_key;
if (!KEY) { console.error('No Vertex key in backend/.env (VERTEX_API_KEY or Google_cloud_key).'); process.exit(1); }
const ai = new GoogleGenAI({ apiKey: KEY, vertexai: true });
const CHECK_MODEL = process.env.PRACTICE_CHECK_MODEL || 'gemini-3.8-flash';
const GAP_MS = Number(process.env.PRACTICE_GAP_MS || 2500);
const AUDIO_DIR = path.join(root, 'public', 'learn', 'audio');

// The same scrambling as scripts/learn-media.mjs (its own inverse).
const MASK = Buffer.from('lfwn-lecture-2026', 'utf8');
const unscramble = buf => { const out = Buffer.from(buf); for (let i = 0; i < out.length; i++) out[i] ^= MASK[i % MASK.length] ^ (i & 0xff); return out; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
let nextSlot = 0, calls = 0;
async function retry(fn, tries = 4) {
  for (let t = 1; ; t++) {
    const now = Date.now(), at = Math.max(now, nextSlot);
    nextSlot = at + GAP_MS;
    if (at > now) await sleep(at - now);
    try { calls++; return await fn(); } catch (e) {
      const m = String(e?.message || e);
      if (/403|PERMISSION_DENIED|terms of use/i.test(m)) { console.error(`✗ Stopped: ${m.slice(0, 200)}`); process.exit(2); }
      if (t >= tries) throw e;
      await sleep(/429|RESOURCE_EXHAUSTED/i.test(m) ? 30000 * t : 2000 * t * t);
    }
  }
}

const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim();
/** Words of the script missing from what was heard, and words heard in addition (longest common subsequence). */
function compare(script, heard) {
  const a = norm(script).split(' ').filter(Boolean), b = norm(heard).split(' ').filter(Boolean);
  const L = Array.from({ length: a.length + 1 }, () => new Uint16Array(b.length + 1));
  for (let i = a.length - 1; i >= 0; i--) for (let j = b.length - 1; j >= 0; j--) L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const missing = [], extra = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) missing.push(a[i++]); else extra.push(b[j++]);
  }
  missing.push(...a.slice(i)); extra.push(...b.slice(j));
  return { share: a.length ? L[0][0] / a.length : 1, missing, extra };
}

const vite = await createServer({ root, logLevel: 'error', server: { middlewareMode: true, hmr: false }, appType: 'custom' });
const { LISTENING: CATALOG } = await vite.ssrLoadModule('/src/learn/practice/listening/catalog.ts');
// The advanced documents are only stubs in the catalogue: their content comes from c1.ts and c2.ts.
const ADVANCED = [
  ...(await vite.ssrLoadModule('/src/learn/practice/listening/c1.ts')).c1Listening,
  ...(await vite.ssrLoadModule('/src/learn/practice/listening/c2.ts')).c2Listening,
];
const LISTENING = CATALOG.map(e => (e.lazy ? ADVANCED.find(x => x.id === e.id) : e)).filter(Boolean);
const { LISTENING_VOICES, passageAudio, questionAudio } = await vite.ssrLoadModule('/src/learn/practice/listening/types.ts');
const { audioKey, normalizeForAudio } = await vite.ssrLoadModule('/src/learn/audio.ts');
await vite.close();

let bad = 0;
for (const e of LISTENING.filter(x => !only || only.includes(x.id))) {
  console.log(e.id);
  const items = [
    ...LISTENING_VOICES.map(v => ({ what: `passage ${v}`, text: passageAudio(e), voice: v })),
    ...e.segments.map((s, i) => ({ what: `excerpt ${i + 1}`, text: s, voice: e.voice })),
    ...e.questions.map((q, i) => ({ what: `question ${i + 1}`, text: questionAudio(q), voice: e.voice })),
  ];
  for (const it of items) {
    const file = path.join(AUDIO_DIR, `${audioKey(it.text, it.voice)}.dat`);
    if (!existsSync(file)) { console.log(`  – ${it.what}: no recording yet`); continue; }
    const data = unscramble(await fs.readFile(file)).toString('base64');
    const res = await retry(() => ai.models.generateContent({
      model: CHECK_MODEL,
      contents: [{ role: 'user', parts: [{ inlineData: { mimeType: 'audio/mp3', data } }, { text: 'Transcribe exactly what is spoken, in French, word for word. Write numbers in words, not digits. Output only the transcript.' }] }],
      config: { temperature: 0 },
    }));
    const { share, missing, extra } = compare(normalizeForAudio(it.text), res.text || '');
    const serious = missing.some(w => w.length > 2) || extra.length >= 2;
    console.log(`  ${serious ? 'CHECK' : '✓'} ${it.what}: ${(share * 100).toFixed(1)} %${missing.length ? ` · missing: ${missing.join(' ')}` : ''}${extra.length ? ` · heard extra: ${extra.join(' ')}` : ''}`);
    if (serious) {
      bad++;
      if (fix) { await fs.rm(file); console.log('    removed: run learn-media.mjs --audio to record it again'); }
    }
  }
}
console.log(`${bad} recording${bad === 1 ? '' : 's'} to check · ${calls} requests`);
