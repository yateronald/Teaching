// Checks the dialogue recordings by ear (Gemini): each line is transcribed and
// compared word for word with its script, the way a learner would hear it.
// One request at a time, with a pause. Never runs during the build.
//
//   node scripts/dialogue-qa.mjs [--only id1,id2] [--theme sante,banque] [--keys k1,k2] [--fix]
//   --fix removes the recordings that fail, so `learn-media.mjs --audio` records them again.
//   The full report is written to .cache/tmp/dialogue-qa.json.
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
const list = flag => (args.includes(flag) ? args[args.indexOf(flag) + 1].split(',') : null);
const only = list('--only');
const themes = list('--theme');
const keys = list('--keys');
const fix = args.includes('--fix');
const KEY = process.env.VERTEX_API_KEY || process.env.GOOGLE_CLOUD_API_KEY || process.env.Google_cloud_key;
if (!KEY) { console.error('No Vertex key in backend/.env (VERTEX_API_KEY or Google_cloud_key).'); process.exit(1); }
const ai = new GoogleGenAI({ apiKey: KEY, vertexai: true });
const MODEL = process.env.PRACTICE_CHECK_MODEL || 'gemini-3.8-flash';
const GAP_MS = Number(process.env.PRACTICE_GAP_MS || 2500);
const AUDIO_DIR = path.join(root, 'public', 'learn', 'audio');
const REPORT = path.join(root, '.cache', 'tmp', 'dialogue-qa.json');

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
function compare(script, heard) {
  const a = norm(script).split(' ').filter(Boolean), b = norm(heard).split(' ').filter(Boolean);
  const L = Array.from({ length: a.length + 1 }, () => new Uint16Array(b.length + 1));
  for (let i = a.length - 1; i >= 0; i--) for (let j = b.length - 1; j >= 0; j--) L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const missing = [], extra = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) { if (a[i] === b[j]) { i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) missing.push(a[i++]); else extra.push(b[j++]); }
  missing.push(...a.slice(i)); extra.push(...b.slice(j));
  return { missing, extra };
}

const vite = await createServer({ root, logLevel: 'error', server: { middlewareMode: true, hmr: false }, appType: 'custom' });
const { DIALOGUES } = await vite.ssrLoadModule('/src/learn/practice/dialogues/meta.ts');
const { audioKey } = await vite.ssrLoadModule('/src/learn/audio.ts');
const modules = {};
for (const m of DIALOGUES) {
  if ((only && !only.includes(m.id)) || (themes && !themes.includes(m.theme))) continue;
  modules[m.theme] ??= (await vite.ssrLoadModule(`/src/learn/practice/dialogues/content/${m.theme}.ts`)).default;
}
await vite.close();

const done = new Set();
const report = [];
let bad = 0;
for (const m of DIALOGUES) {
  const d = modules[m.theme]?.[m.id];
  if (!d) continue;
  console.log(`${m.id} (${m.level})`);
  for (const [n, line] of d.lines.entries()) {
    const voice = d.speakers[line.who].voice;
    const key = audioKey(line.fr, voice);
    if (done.has(key)) continue;
    if (keys && !keys.includes(key)) continue;
    done.add(key);
    const file = path.join(AUDIO_DIR, `${key}.dat`);
    if (!existsSync(file)) { console.log(`  – line ${n + 1}: no recording yet`); continue; }
    const data = unscramble(await fs.readFile(file)).toString('base64');
    const heard = await ask(data, 'Transcribe exactly what is spoken, in French, word for word. Write numbers in words, not digits. Output only the transcript.');
    const { missing, extra } = compare(line.fr, heard);
    // Long lines: one short word lost by the transcriber is tolerated; anything else is reviewed.
    const ok = !heard.startsWith('ERR') && !missing.some(w => w.length > 2) && extra.length < 2;
    const note = heard.startsWith('ERR') ? heard : `${missing.length ? `missing: ${missing.join(' ')} ` : ''}${extra.length ? `heard extra: ${extra.join(' ')}` : ''}`.trim() || 'word for word';
    console.log(`  ${ok ? '✓' : 'CHECK'} line ${n + 1} (${voice}): ${note}${ok ? '' : ` · «${line.fr.slice(0, 90)}»`}`);
    report.push({ id: m.id, line: n + 1, voice, key, ok, missing, extra, script: line.fr, heard });
    if (!ok) { bad++; if (fix) { await fs.rm(file); console.log('    removed: run learn-media.mjs --audio to record it again'); } }
  }
}
await fs.mkdir(path.dirname(REPORT), { recursive: true });
await fs.writeFile(REPORT, JSON.stringify(report, null, 1));
console.log(`${bad} recording${bad === 1 ? '' : 's'} to check · ${calls} requests`);
