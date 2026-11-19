// Checks the ear-training recordings by ear (Gemini), the way a learner hears them:
// • a « tell apart » exercise whose options are sentences: the model hears the
//   recording and must pick the option that was said (a minimal pair it cannot
//   tell apart is ambiguous for a learner too);
// • an intonation exercise: the model says whether it hears a question or a statement;
// • everything else (examples, gaps, situations): transcribed and compared word
//   for word with its script.
// One request at a time, with a pause. Never runs during the build.
//
//   node scripts/ear-qa.mjs [--only id1,id2] [--fix]
//   --fix removes the recordings that fail, so `learn-media.mjs --audio` records them again.
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
const MODEL = process.env.PRACTICE_CHECK_MODEL || 'gemini-3.8-flash';
const GAP_MS = Number(process.env.PRACTICE_GAP_MS || 2500);
const AUDIO_DIR = path.join(root, 'public', 'learn', 'audio');

const MASK = Buffer.from('lfwn-lecture-2026', 'utf8');
const unscramble = buf => { const out = Buffer.from(buf); for (let i = 0; i < out.length; i++) out[i] ^= MASK[i % MASK.length] ^ (i & 0xff); return out; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
let nextSlot = 0, calls = 0;
async function ask(data, prompt) {
  for (let t = 1; ; t++) {
    const now = Date.now(), at = Math.max(now, nextSlot);
    nextSlot = at + GAP_MS;
    if (at > now) await sleep(at - now);
    try {
      calls++;
      const res = await ai.models.generateContent({
        model: MODEL,
        contents: [{ role: 'user', parts: [{ inlineData: { mimeType: 'audio/mp3', data } }, { text: prompt }] }],
        config: { temperature: 0 },
      });
      return (res.text || '').trim();
    } catch (e) {
      const m = String(e?.message || e);
      if (/403|PERMISSION_DENIED|terms of use/i.test(m)) { console.error(`✗ Stopped: ${m.slice(0, 200)}`); process.exit(2); }
      if (t >= 4) return `ERR ${m.slice(0, 80)}`;
      await sleep(/429|RESOURCE_EXHAUSTED/i.test(m) ? 30000 * t : 2000 * t * t);
    }
  }
}

const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim();
// The short spoken forms are compared with their full spelling (the model may write either).
const expand = s => norm(s)
  .replace(/\bj (sais|suis|te|vais|ai)\b/g, 'je $1').replace(/\bt (es|as|inquiete)\b/g, 'tu $1')
  .replace(/\bj te\b/g, 'je te');
function compare(script, heard) {
  const a = expand(script).split(' ').filter(Boolean), b = expand(heard).split(' ').filter(Boolean);
  const L = Array.from({ length: a.length + 1 }, () => new Uint16Array(b.length + 1));
  for (let i = a.length - 1; i >= 0; i--) for (let j = b.length - 1; j >= 0; j--) L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const missing = [], extra = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) { if (a[i] === b[j]) { i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) missing.push(a[i++]); else extra.push(b[j++]); }
  missing.push(...a.slice(i)); extra.push(...b.slice(j));
  return { missing, extra };
}

const vite = await createServer({ root, logLevel: 'error', server: { middlewareMode: true, hmr: false }, appType: 'custom' });
const { EAR } = await vite.ssrLoadModule('/src/learn/practice/ear/meta.ts');
const { audioKey } = await vite.ssrLoadModule('/src/learn/audio.ts');
const courses = [];
for (const e of EAR) if (!only || only.includes(e.id)) courses.push((await vite.ssrLoadModule(`/src/learn/practice/ear/courses/${e.id}.ts`)).default);
await vite.close();

const done = new Set();
let bad = 0;
for (const c of courses) {
  console.log(c.id);
  const clips = [
    ...c.examples.flatMap((e, n) => [{ what: `example ${n + 1}`, say: e.say, voice: e.voice }, ...(e.natural ? [{ what: `example ${n + 1} (everyday)`, say: e.natural, voice: e.voice }] : [])]),
    ...c.items.map((it, n) => ({ what: `exercise ${n + 1}`, say: it.say, voice: it.voice, it })),
  ];
  for (const clip of clips) {
    const key = audioKey(clip.say, clip.voice);
    if (done.has(key)) continue;
    done.add(key);
    const file = path.join(AUDIO_DIR, `${key}.dat`);
    if (!existsSync(file)) { console.log(`  – ${clip.what}: no recording yet`); continue; }
    const data = unscramble(await fs.readFile(file)).toString('base64');
    const it = clip.it;
    let ok, note;
    if (it && it.kind === 'pick' && it.options.includes('Une question')) {
      const heard = await ask(data, 'Listen to this French recording. Is it spoken as a QUESTION (rising intonation at the end) or a STATEMENT (falling intonation)? Answer with one word: QUESTION or STATEMENT.');
      const want = it.options[it.answer] === 'Une question' ? 'QUESTION' : 'STATEMENT';
      ok = heard.toUpperCase().includes(want); note = `heard ${heard}, expected ${want}`;
    } else if (it && it.kind === 'pick' && it.options.includes(it.say)) {
      const letters = 'ABCD';
      const list = it.options.map((o, i) => `${letters[i]}) ${o}`).join('\n');
      const heard = await ask(data, `Listen carefully to this French recording. Exactly one of these sentences is spoken. Which one? Pay attention to every sound (liaisons, vowels, endings).\n${list}\nAnswer with the letter only.`);
      const want = letters[it.answer];
      ok = heard.replace(/[^A-D]/g, '').startsWith(want); note = `picked ${heard || '?'}, expected ${want}`;
    } else {
      const heard = await ask(data, 'Transcribe exactly what is spoken, in French, word for word. Write numbers in words, not digits. Output only the transcript.');
      const { missing, extra } = compare(clip.say, heard);
      ok = !heard.startsWith('ERR') && !missing.some(w => w.length > 2) && extra.length < 2;
      note = heard.startsWith('ERR') ? heard : `${missing.length ? `missing: ${missing.join(' ')} ` : ''}${extra.length ? `heard extra: ${extra.join(' ')}` : ''}`.trim() || 'word for word';
    }
    console.log(`  ${ok ? '✓' : 'CHECK'} ${clip.what}: ${note} · «${clip.say.slice(0, 70)}»`);
    if (!ok) { bad++; if (fix) { await fs.rm(file); console.log('    removed: run learn-media.mjs --audio to record it again'); } }
  }
}
console.log(`${bad} recording${bad === 1 ? '' : 's'} to check · ${calls} requests`);
