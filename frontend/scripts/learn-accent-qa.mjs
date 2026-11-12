// Accent check of the lesson audio: a transcription cannot tell a French word
// said with an English accent, so each recording is judged phonetically.
// Short phrases are where the voice goes wrong (no context to guess the language).
//   node scripts/learn-accent-qa.mjs [--max-words 3] [--course french-sounds,…] [--sample 80] [--only "la rue|dessous"] [--delete]
// With --delete the bad recordings are removed: `learn-media.mjs --audio` makes new ones.
import { createServer } from 'vite';
import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const req = createRequire(path.join(root, '..', 'backend', 'package.json'));
req('dotenv').config({ path: path.join(root, '..', 'backend', '.env'), quiet: true });
const { GoogleGenAI } = req('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.VERTEX_API_KEY || process.env.Google_cloud_key, vertexai: true, httpOptions: { timeout: 60000 } });
const args = process.argv.slice(2);
const opt = n => (args.includes(n) ? args[args.indexOf(n) + 1] : null);
const maxWords = Number(opt('--max-words') ?? 3);
const only = opt('--only')?.split('|') ?? null;
const del = args.includes('--delete');
const GAP = Number(process.env.LEARN_MEDIA_GAP_MS || 1300);
const sleep = ms => new Promise(r => setTimeout(r, ms));

const vite = await createServer({ root, logLevel: 'error', server: { middlewareMode: true, hmr: false }, appType: 'custom' });
const { collectMedia } = await vite.ssrLoadModule('/src/learn/mediaSources.ts');
const { audio } = collectMedia();
// --course: only the phrases of those courses (their text appears in the course file).
const courseIds = opt('--course')?.split(',') ?? null;
let courseText = '';
for (const id of courseIds ?? []) courseText += JSON.stringify((await vite.ssrLoadModule(`/src/learn/content/courses/${id}.ts`)).default);
await vite.close();

const words = t => t.split(/[\s’'-]+/).filter(w => /\p{L}/u.test(w)).length;
let todo = audio.filter(a => (only ? only.includes(a.text) : words(a.text) <= maxWords));
if (courseIds) todo = todo.filter(a => courseText.includes(JSON.stringify(a.text)));
const sample = Number(opt('--sample') ?? 0);
if (sample) todo = todo.sort(() => Math.random() - 0.5).slice(0, sample);
console.log(`${todo.length} recordings to judge (of ${audio.length})`);

const bad = [];
for (const [i, a] of todo.entries()) {
  const f = path.join(root, 'public', 'learn', 'audio', `${a.key}.mp3`);
  let b64;
  try { b64 = (await fs.readFile(f)).toString('base64'); } catch { continue; }
  let out = '';
  for (let attempt = 0; attempt < 4 && !out; attempt++) {
    try {
      const res = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [{ role: 'user', parts: [{ inlineData: { mimeType: 'audio/mp3', data: b64 } }, { text: `This recording should say the French «${a.text}», as a native speaker from France would. First line: the IPA of what is actually pronounced. Second line: OK if it is a correct native French pronunciation of exactly that text; otherwise WRONG and a short reason (read as English, English r, wrong vowel, silent letter pronounced, extra or missing word…). Liaisons and a dropped schwa are fine.` }] }],
        // A small reasoning budget: enough for a phonetic judgement, and ten times faster than the default.
        config: { temperature: 0, thinkingConfig: { thinkingBudget: Number(process.env.LEARN_QA_THINKING || 256) } },
      });
      out = res.text.trim().replace(/\n+/g, ' / ');
    } catch (e) {
      if (/403/.test(String(e.message))) { console.error('403: stopping'); process.exit(1); }
      console.log(`  retry «${a.text}»: ${String(e.message).replace(/\s+/g, ' ').slice(0, 140)}`);
      await sleep(10000 * (attempt + 1));
    }
  }
  const wrong = /WRONG/.test(out);
  if (wrong) { bad.push(a); if (del) await fs.rm(f); }
  if (wrong || only) console.log(`${wrong ? 'BAD' : 'ok '} [${a.voice}] «${a.text}» → ${out.slice(0, 170)}`);
  if ((i + 1) % 50 === 0) console.log(`  … ${i + 1}/${todo.length} (${bad.length} bad)`);
  await sleep(GAP);
}
console.log(`${bad.length} bad${del ? ' (deleted)' : ''}: ${bad.map(a => a.text).join(' | ')}`);
