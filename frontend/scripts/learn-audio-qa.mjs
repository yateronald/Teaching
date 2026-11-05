// Quality check of the generated lesson audio: flags recordings whose length
// does not fit their text, and transcribes them (plus a random sample) with
// Gemini to catch misreadings. Bad files are deleted so the next
// `learn-media.mjs --audio` run regenerates them.
//   node scripts/learn-audio-qa.mjs [--sample 15] [--delete]
//   node scripts/learn-audio-qa.mjs --redo "gris|mes"   force a new take of some phrases
import { createServer } from 'vite';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const req = createRequire(path.join(root, '..', 'backend', 'package.json'));
req('dotenv').config({ path: path.join(root, '..', 'backend', '.env'), quiet: true });
const { GoogleGenAI } = req('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.VERTEX_API_KEY || process.env.Google_cloud_key, vertexai: true });
const args = process.argv.slice(2);
const sample = args.includes('--sample') ? Number(args[args.indexOf('--sample') + 1]) : 15;
const del = args.includes('--delete');
// --redo "gris|mes": delete those recordings (exact texts) so learn-media regenerates them.
// --only "gris|mes": transcribe just those phrases.
const only = args.includes('--only') ? args[args.indexOf('--only') + 1].split('|') : null;
const redo = args.includes('--redo') ? args[args.indexOf('--redo') + 1].split('|') : null;

const vite = await createServer({ root, logLevel: 'error', server: { middlewareMode: true, hmr: false }, appType: 'custom' });
const { collectMedia } = await vite.ssrLoadModule('/src/learn/mediaSources.ts');
const { audio } = collectMedia();
await vite.close();
const dir = path.join(root, 'public', 'learn', 'audio');
const dur = f => Number(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], { encoding: 'utf8' }).stdout.trim());

const rows = [];
for (const a of audio) {
  const f = path.join(dir, `${a.key}.mp3`);
  try { await fs.access(f); } catch { continue; }
  const d = dur(f);
  const letters = a.text.replace(/[^\p{L}\d]/gu, '').length || 1;
  rows.push({ ...a, f, d, perChar: d / letters });
}
if (redo) {
  const hit = rows.filter(r => redo.includes(r.text));
  for (const r of hit) await fs.rm(r.f);
  console.log(`deleted ${hit.length}: ${hit.map(r => r.text).join(' | ')}`);
  process.exit(0);
}
const sorted = [...rows].sort((x, y) => x.perChar - y.perChar);
const median = sorted[Math.floor(sorted.length / 2)].perChar;
const odd = only ? rows.filter(r => only.includes(r.text)) : rows.filter(r => r.perChar > median * 2.2 || r.perChar < median * 0.4 || (r.d > 4 && r.perChar > median * 1.7));
const rand = only ? [] : rows.filter(r => !odd.includes(r)).sort(() => Math.random() - 0.5).slice(0, sample);
console.log(`${rows.length} recordings · median ${(median * 1000).toFixed(0)} ms/letter · ${odd.length} with an odd length`);

const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
let bad = 0;
for (const r of [...odd, ...rand]) {
  const b64 = (await fs.readFile(r.f)).toString('base64');
  let heard = '';
  try {
    const res = await ai.models.generateContent({ model: 'gemini-3.8-flash', contents: [{ role: 'user', parts: [{ inlineData: { mimeType: 'audio/mp3', data: b64 } }, { text: 'Transcribe exactly what is spoken, in French. Output only the transcript.' }] }], config: { temperature: 0 } });
    heard = res.text.trim();
  } catch (e) { heard = `ERR ${e.message}`; }
  const a = norm(r.text).split(' '), h = new Set(norm(heard).split(' '));
  const hit = a.filter(w => h.has(w)).length / a.length;
  const extra = norm(heard).split(' ').length - a.length;
  const ok = hit >= 0.8 && extra <= Math.max(3, a.length * 0.4);
  if (!ok) { bad++; if (del) await fs.rm(r.f); }
  console.log(`${ok ? 'ok ' : 'BAD'} ${odd.includes(r) ? 'odd ' : 'rand'} ${r.d.toFixed(1)}s  «${r.text.slice(0, 60)}» → «${heard.slice(0, 70)}»`);
}
console.log(`${bad} bad${del ? ' (deleted)' : ''}`);
