// Reads the practice texts aloud with Google's voices (Vertex AI, key from
// backend/.env): one recording per text and voice (a woman, a man, and both
// voices for a dialogue), with the start and end of every sentence so the page
// can light up the sentence being read. Never runs during the build.
//
//   node scripts/practice-audio.mjs                    every text (only what is missing)
//   node scripts/practice-audio.mjs --only id1,id2     some texts
//   node scripts/practice-audio.mjs --force            record the paragraphs again
//   node scripts/practice-audio.mjs --qa [--fix]       transcribe each recording and compare it with the text;
//                                                      --fix forgets the paragraphs that do not match, so the
//                                                      next run records them again
//   node scripts/practice-audio.mjs --redo <text-id>:<f|m>:<paragraph number | greeting | title | cue | outro>[,…]
//                                                      record some paragraphs again (numbered from 1)
//
// A recording opens like a lesson: the narrator greets the learner, says what
// they will study and its level, reads the title and says « Commençons »
// (model.ts, spokenFrame); then the text is read word for word;
// a short closing line sends the learner to the questions.
//
// Each paragraph is read in one take (natural sentence melody); the sentences
// are found in it from the pauses, checked against their length, and a
// paragraph whose take does not fit is read sentence by sentence instead.
// Output: public/learn/texts/<id>-<f|m|d>.dat (the mp3, scrambled: not offered for download)
// and src/learn/practice/text-audio.json.
// Cache (git-ignored): .cache/practice-audio/ (one clean take per paragraph and voice).
// Needs ffmpeg on the PATH. One request at a time, with a pause between requests.
import { createServer } from 'vite';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const backend = path.resolve(root, '..', 'backend');
const req = createRequire(path.join(backend, 'package.json'));
req('dotenv').config({ path: path.join(backend, '.env'), quiet: true });
const { GoogleGenAI } = req('@google/genai');

const args = process.argv.slice(2);
const has = f => args.includes(f);
const only = has('--only') ? args[args.indexOf('--only') + 1].split(',') : null;
const force = has('--force');
const qa = has('--qa');
const fix = has('--fix');
const redo = has('--redo') ? args[args.indexOf('--redo') + 1].split(',').map(x => x.split(':')) : [];
// --dry: check the kept takes against the current rules, record and write nothing.
const dry = has('--dry');

const KEY = process.env.VERTEX_API_KEY || process.env.GOOGLE_CLOUD_API_KEY || process.env.Google_cloud_key;
if (!KEY) { console.error('No Vertex key in backend/.env (VERTEX_API_KEY or Google_cloud_key).'); process.exit(1); }
const ai = new GoogleGenAI({ apiKey: KEY, vertexai: true });

const OUT_DIR = path.join(root, 'public', 'learn', 'texts');
const INDEX = path.join(root, 'src', 'learn', 'practice', 'text-audio.json');
const CACHE = path.join(root, '.cache', 'practice-audio');
const TMP = await fs.mkdtemp(path.join(os.tmpdir(), 'practice-audio-'));

// The voices of the free courses (chosen by ear test, scripts/learn-media.mjs).
const VOICES = { f: 'Sulafat', m: 'Schedar' };
const TTS_MODEL = process.env.PRACTICE_TTS_MODEL || 'gemini-3.8-flash-tts';
const CHECK_MODEL = process.env.PRACTICE_CHECK_MODEL || 'gemini-3.8-flash';
const RATE = 24000;
const BYTES = 2;
// Silences put between the parts of a recording, in seconds.
const LEAD = 0.35, TAIL = 0.6, PARA_GAP = 0.85, LINE_GAP = 0.6, SENTENCE_GAP = 0.42;

const sleep = ms => new Promise(r => setTimeout(r, ms));
const sha = s => createHash('sha1').update(s).digest('hex');

// The recordings are published scrambled (src/learn/practice/useNarration.ts undoes it with the same key).
const MASK = Buffer.from('lfwn-lecture-2026', 'utf8');
const scramble = buf => { const out = Buffer.from(buf); for (let i = 0; i < out.length; i++) out[i] ^= MASK[i % MASK.length] ^ (i & 0xff); return out; };

function ffmpeg(a, { log = false } = {}) {
  const r = spawnSync('ffmpeg', ['-y', '-hide_banner', '-nostats', '-loglevel', log ? 'info' : 'error', ...a], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(`ffmpeg failed: ${r.stderr || r.error}`);
  return r.stderr;
}

// ── Gentle pace: one request at a time, at most one every GAP_MS (the project was suspended once, 2026-10). ──
const GAP_MS = Number(process.env.PRACTICE_GAP_MS || 2500);
let nextSlot = 0;
async function throttle() {
  const now = Date.now();
  const at = Math.max(now, nextSlot);
  nextSlot = at + GAP_MS;
  if (at > now) await sleep(at - now);
}
let calls = 0;
async function retry(fn, tries = 4) {
  for (let t = 1; ; t++) {
    try { await throttle(); calls++; return await fn(); } catch (e) {
      const m = String(e?.message || e);
      if (/403|PERMISSION_DENIED|terms of use/i.test(m)) { console.error(`✗ Stopped: ${m.slice(0, 200)}`); process.exit(2); }
      if (t >= tries) throw e;
      await sleep(/429|RESOURCE_EXHAUSTED/i.test(m) ? 30000 * t : 2000 * t * t);
    }
  }
}

function pcmFrom(buf) {
  if (buf.length < 44 || buf.toString('ascii', 0, 4) !== 'RIFF') return buf;
  let off = 12;
  while (off + 8 <= buf.length) {
    const id = buf.toString('ascii', off, off + 4);
    const len = buf.readUInt32LE(off + 4);
    if (id === 'data') return buf.subarray(off + 8, off + 8 + len);
    off += 8 + len + (len % 2);
  }
  return buf.subarray(44);
}

/** One take of a French text, trimmed of its silence at both ends: raw 16-bit PCM at 24 kHz. */
async function speak(text, voice) {
  const res = await retry(() => ai.models.generateContent({
    model: TTS_MODEL,
    // The bare text: an instruction before it is sometimes read aloud too.
    contents: [{ role: 'user', parts: [{ text }] }],
    config: { responseModalities: ['AUDIO'], speechConfig: { languageCode: 'fr-FR', voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICES[voice] } } } },
  }), 5);
  const data = res.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData;
  if (!data) throw new Error('no audio returned');
  const rate = Number(/rate=(\d+)/.exec(data.mimeType || '')?.[1] || RATE);
  const raw = path.join(TMP, `${sha(voice + text).slice(0, 12)}-in.pcm`);
  const out = path.join(TMP, `${sha(voice + text).slice(0, 12)}-out.pcm`);
  await fs.writeFile(raw, pcmFrom(Buffer.from(data.data, 'base64')));
  ffmpeg(['-f', 's16le', '-ar', String(rate), '-ac', '1', '-i', raw,
    '-af', 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.04,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse',
    '-ar', String(RATE), '-ac', '1', '-f', 's16le', out]);
  return fs.readFile(out);
}

/** The pauses inside a take: [{ start, end }] in seconds. */
async function pauses(pcm) {
  const f = path.join(TMP, 'detect.pcm');
  await fs.writeFile(f, pcm);
  const log = ffmpeg(['-f', 's16le', '-ar', String(RATE), '-ac', '1', '-i', f, '-af', 'silencedetect=noise=-40dB:d=0.09', '-f', 'null', '-'], { log: true });
  const out = [];
  let start = null;
  for (const line of log.split(/\r?\n/)) {
    const s = /silence_start: ([\d.]+)/.exec(line);
    const e = /silence_end: ([\d.]+)/.exec(line);
    if (s) start = Number(s[1]);
    if (e && start !== null) { out.push({ start, end: Number(e[1]) }); start = null; }
  }
  return out;
}

const letters = s => s.replace(/[^\p{L}\p{N}]/gu, '').length || 1;

/**
 * Where each sentence of a paragraph take begins and ends: the pauses that
 * best fit the sentences’ lengths (dynamic programming over the pauses), then
 * a check that no sentence is far too short or too long for its text.
 */
function splitTake(sentences, dur, gaps) {
  const n = sentences.length;
  if (n === 1) return [[0, dur]];
  const cands = gaps.filter(g => g.end - g.start >= 0.1 && g.start > 0.15 && g.end < dur - 0.15);
  if (cands.length < n - 1) return null;
  const sizes = sentences.map(letters);
  const total = sizes.reduce((a, b) => a + b, 0);
  const expect = [];
  let acc = 0;
  for (let k = 0; k < n - 1; k++) { acc += sizes[k]; expect.push((acc / total) * dur); }
  const cost = (k, j) => (Math.abs((cands[j].start + cands[j].end) / 2 - expect[k]) / dur) * 10 - Math.log((cands[j].end - cands[j].start) / 0.1) * 0.6;
  const M = cands.length;
  const best = Array.from({ length: n - 1 }, () => new Array(M).fill(Infinity));
  const from = Array.from({ length: n - 1 }, () => new Array(M).fill(-1));
  for (let j = 0; j < M; j++) best[0][j] = cost(0, j);
  for (let k = 1; k < n - 1; k++) {
    for (let j = k; j < M; j++) {
      for (let i = k - 1; i < j; i++) {
        const c = best[k - 1][i] + cost(k, j);
        if (c < best[k][j]) { best[k][j] = c; from[k][j] = i; }
      }
    }
  }
  let j = -1, low = Infinity;
  for (let x = 0; x < M; x++) if (best[n - 2][x] < low) { low = best[n - 2][x]; j = x; }
  if (j < 0) return null;
  const chosen = new Array(n - 1);
  for (let k = n - 2; k >= 0; k--) { chosen[k] = cands[j]; j = from[k][j]; }
  const spans = sentences.map((_, k) => [k === 0 ? 0 : chosen[k - 1].end, k === n - 1 ? dur : chosen[k].start]);
  // The check: each sentence is read at about the pace of the paragraph (its share of
  // time against its share of letters). Short sentences (« Voilà. », « Bien sûr. ») are slower.
  // Voiced time: the pauses inside a sentence (commas, a list) do not count.
  const voiced = spans.map(([s, e]) => (e - s) - gaps.filter(g => g.start >= s && g.end <= e).reduce((a, g) => a + (g.end - g.start), 0));
  const speech = voiced.reduce((a, b) => a + b, 0);
  const why = m => { if (process.env.SPLIT_DEBUG) console.log(`      ${m}`); return null; };
  for (let k = 0; k < n; k++) {
    const ratio = (voiced[k] / speech) / (sizes[k] / total);
    const short = sizes[k] < 15;
    if (ratio < (short ? 0.4 : 0.62) || ratio > (short ? 3.2 : 1.75)) return why(`sentence ${k + 1} pace ${ratio.toFixed(2)} «${sentences[k].slice(0, 40)}»`);
  }
  // Two sentences run together (no real pause between them) do not make a clean reading.
  const tight = chosen.findIndex(g => g.end - g.start < 0.1);
  if (tight >= 0) return why(`no pause after sentence ${tight + 1} (${((chosen[tight].end - chosen[tight].start) * 1000).toFixed(0)} ms)`);
  return spans;
}

const silence = s => Buffer.alloc(Math.round(s * RATE) * BYTES);
const secs = buf => buf.length / BYTES / RATE;

/** A paragraph read by one voice, with its sentences’ times: from the cache, else recorded. */
async function paragraph(sentences, voice) {
  const text = sentences.join(' ');
  const key = sha(`${TTS_MODEL}|${VOICES[voice]}|${text}`).slice(0, 20);
  const meta = path.join(CACHE, `${key}.json`);
  const pcmFile = path.join(CACHE, `${key}.pcm`);
  if (!force && existsSync(meta) && existsSync(pcmFile)) {
    const cached = JSON.parse(await fs.readFile(meta, 'utf8'));
    const kept = await fs.readFile(pcmFile);
    if (cached.how !== 'take') return { key, pcm: kept, spans: cached.spans };
    // A take is checked again with the current rules: kept if it still fits.
    const again = splitTake(sentences, secs(kept), await pauses(kept));
    if (again) {
      if (JSON.stringify(again) !== JSON.stringify(cached.spans)) await fs.writeFile(meta, JSON.stringify({ ...cached, spans: again }));
      return { key, pcm: kept, spans: again };
    }
    if (dry) { console.log(`  ✗ ${voice} kept take no longer fits: ${text.slice(0, 70)}…`); return { key, pcm: kept, spans: cached.spans }; }
    console.log(`  ↻ ${voice} kept take no longer fits, recorded again: ${text.slice(0, 60)}…`);
  }
  if (dry) { console.log(`  ✗ ${voice} not recorded yet: ${text.slice(0, 70)}…`); return { key, pcm: silence(0.5), spans: sentences.map(() => [0, 0.5]) }; }
  let pcm, spans = null, how = 'take';
  const speed = buf => letters(text) / secs(buf);
  // Up to three takes of the whole paragraph; a take read too fast or too slow (a word added or lost) is not kept.
  for (let take = 1; take <= 3 && !spans; take++) {
    pcm = await speak(text, voice);
    const cps = speed(pcm);
    if (cps < 7 || cps > 22) { console.log(`    take ${take}: ${cps.toFixed(1)} letters/s, taken again`); continue; }
    spans = splitTake(sentences, secs(pcm), await pauses(pcm));
    if (!spans) console.log(`    take ${take}: sentences not found in the pauses, taken again`);
  }
  if (!spans) {
    // Sentence by sentence: exact times, joined with a short pause.
    how = 'sentences';
    const parts = [];
    spans = [];
    let t = 0;
    for (let k = 0; k < sentences.length; k++) {
      const s = await speak(sentences[k], voice);
      if (k > 0) { parts.push(silence(SENTENCE_GAP)); t += SENTENCE_GAP; }
      spans.push([t, t + secs(s)]);
      parts.push(s);
      t += secs(s);
    }
    pcm = Buffer.concat(parts);
  }
  await fs.mkdir(CACHE, { recursive: true });
  await fs.writeFile(pcmFile, pcm);
  await fs.writeFile(meta, JSON.stringify({ text, voice: VOICES[voice], model: TTS_MODEL, how, spans }));
  console.log(`  ✓ ${voice} ${how === 'take' ? 'one take' : 'sentence by sentence'} (${secs(pcm).toFixed(1)} s): ${text.slice(0, 60)}…`);
  return { key, pcm, spans };
}

// ── The texts, through Vite (TypeScript) ──
const vite = await createServer({ root, logLevel: 'error', server: { middlewareMode: true, hmr: false }, appType: 'custom' });
const { TEXTS } = await vite.ssrLoadModule('/src/learn/practice/meta.ts');
const { spokenFrame } = await vite.ssrLoadModule('/src/learn/practice/model.ts');
const texts = [];
for (const t of TEXTS) texts.push((await vite.ssrLoadModule(`/src/learn/practice/texts/${t.id}.ts`)).default);
await vite.close();
/** What the narrator says before and after each text (model.ts). */
const frames = new Map(texts.map((t, k) => [t.id, spokenFrame(TEXTS[k], t, k)]));

const index = existsSync(INDEX) ? JSON.parse(await fs.readFile(INDEX, 'utf8')) : {};
const round = x => Math.round(x * 1000) / 1000;
// Pauses around the narrator’s lines, in seconds.
const INTRO_GAP = 0.85, OUTRO_GAP = 1.2, TITLE_GAP = 0.32, CUE_GAP = 0.45;

/** The recordings of one text: f, m and, for a dialogue, d (introduced by the woman’s voice). */
async function record(text) {
  console.log(`${text.id}`);
  const versions = text.speakers ? ['f', 'm', 'd'] : ['f', 'm'];
  const frame = frames.get(text.id);
  const takes = { f: [], m: [] };
  const intro = {}, outro = {};
  for (const v of ['f', 'm']) {
    intro[v] = {
      greeting: await paragraph([frame.greeting], v),
      title: await paragraph([frame.title], v),
      cue: await paragraph([frame.cue], v),
    };
    for (const para of text.paras) takes[v].push(await paragraph(para.s.map(s => s[0]), v));
    outro[v] = await paragraph([frame.outro], v);
  }
  const out = {};
  for (const v of versions) {
    const narrator = v === 'd' ? 'f' : v;
    // Only the isolated title gets a highlight; the greeting and cue do not.
    const { greeting, title, cue } = intro[narrator];
    const titleAt = LEAD + secs(greeting.pcm) + TITLE_GAP;
    const parts = [silence(LEAD), greeting.pcm, silence(TITLE_GAP), title.pcm, silence(CUE_GAP), cue.pcm, silence(INTRO_GAP)];
    const spans = [];
    let t = titleAt + secs(title.pcm) + CUE_GAP + secs(cue.pcm) + INTRO_GAP;
    text.paras.forEach((para, p) => {
      const voice = v === 'd' ? (text.speakers[para.who]?.voice ?? 'f') : v;
      const take = takes[voice][p];
      if (p > 0) {
        const gap = text.speakers ? LINE_GAP : PARA_GAP;
        parts.push(silence(gap));
        t += gap;
      }
      take.spans.forEach(([s, e]) => spans.push([round(t + s), round(t + e)]));
      parts.push(take.pcm);
      t += secs(take.pcm);
    });
    // The closing line, then the questions.
    parts.push(silence(OUTRO_GAP), outro[narrator].pcm, silence(TAIL));
    const pcm = Buffer.concat(parts);
    const raw = path.join(TMP, `${text.id}-${v}.pcm`);
    const mp3 = path.join(TMP, `${text.id}-${v}.mp3`);
    const dat = path.join(OUT_DIR, `${text.id}-${v}.dat`);
    await fs.writeFile(raw, pcm);
    // Even loudness for the whole text; constant bit rate so that seeking to a sentence is exact.
    ffmpeg(['-f', 's16le', '-ar', String(RATE), '-ac', '1', '-i', raw, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', String(RATE), '-ac', '1', '-c:a', 'libmp3lame', '-b:a', '64k', mp3]);
    const bytes = await fs.readFile(mp3);
    // Stored scrambled: no audio file on the site to download (the page puts it back in order).
    await fs.writeFile(dat, scramble(bytes));
    out[v] = { v: sha(bytes).slice(0, 8), d: round(secs(pcm)), title: title.spans[0].map(t => round(titleAt + t)), s: spans };
    console.log(`  → ${path.relative(root, dat)} (${secs(pcm).toFixed(1)} s, ${spans.length} sentences)`);
  }
  return out;
}

// ── Quality check: what the recording says, against the text ──
// Written and spoken forms that are the same words: « 3D » is said « trois D ».
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, ' ').replace(/[^a-z0-9]+/g, ' ').replace(/\b3d\b/g, 'trois d').trim();

async function check(text) {
  // The expected words, each with the sentence it belongs to (the narrator’s lines included, p = -1).
  const bySentence = [];
  const words = [];
  const add = (fr, p) => {
    const s = bySentence.push({ fr, p }) - 1;
    norm(fr).split(' ').filter(Boolean).forEach(w => words.push({ w, s }));
  };
  const frame = frames.get(text.id);
  for (const part of ['greeting', 'title', 'cue']) add(frame[part], -1);
  text.paras.forEach((para, p) => para.s.forEach(([fr]) => add(fr, p)));
  add(frame.outro, -1);
  const bad = new Set();
  // The dialogue version is made of the same takes: checking f and m covers it.
  for (const v of ['f', 'm']) {
    const dat = path.join(OUT_DIR, `${text.id}-${v}.dat`);
    if (!existsSync(dat)) continue;
    const data = scramble(await fs.readFile(dat)).toString('base64');
    const res = await retry(() => ai.models.generateContent({
      model: CHECK_MODEL,
      contents: [{ role: 'user', parts: [{ inlineData: { mimeType: 'audio/mp3', data } }, { text: 'Transcribe exactly what is spoken, in French, word for word. Write numbers in words, not digits. Output only the transcript.' }] }],
      config: { temperature: 0 },
    }));
    const heard = norm(res.text || '').split(' ').filter(Boolean);
    // Longest common subsequence between the text and what was heard.
    const a = words.map(x => x.w), b = heard;
    const L = Array.from({ length: a.length + 1 }, () => new Uint16Array(b.length + 1));
    for (let i = a.length - 1; i >= 0; i--) for (let j = b.length - 1; j >= 0; j--) L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    const missing = new Map(), extra = new Map();
    const note = (m, s, w) => { if (!m.has(s)) m.set(s, []); m.get(s).push(w); };
    let i = 0, j = 0;
    while (i < a.length && j < b.length) {
      if (a[i] === b[j]) { i++; j++; }
      else if (L[i + 1][j] >= L[i][j + 1]) { note(missing, words[i].s, a[i]); i++; }
      else { note(extra, words[Math.min(i, a.length - 1)].s, b[j]); j++; }
    }
    for (; i < a.length; i++) note(missing, words[i].s, a[i]);
    for (; j < b.length; j++) note(extra, words[a.length - 1].s, b[j]);
    const flagged = [...new Set([...missing.keys(), ...extra.keys()])].sort((x, y) => x - y);
    const share = L[0][0] / a.length;
    console.log(`  ${v}: ${(share * 100).toFixed(1)} % of the words heard${flagged.length ? '' : ', nothing missing or added'}`);
    for (const s of flagged) {
      const m = missing.get(s) ?? [], x = extra.get(s) ?? [];
      const serious = m.some(w => w.length > 2) || x.length >= 2;
      console.log(`    ${serious ? 'CHECK' : 'minor'} «${bySentence[s].fr}»${m.length ? ` missing: ${m.join(' ')}` : ''}${x.length ? ` heard extra: ${x.join(' ')}` : ''}`);
      if (serious && bySentence[s].p >= 0) bad.add(`${v}|${bySentence[s].p}`);
    }
  }
  if (fix) {
    for (const item of bad) {
      const [v, p] = item.split('|');
      const sentences = text.paras[Number(p)].s.map(s => s[0]);
      const key = sha(`${TTS_MODEL}|${VOICES[v]}|${sentences.join(' ')}`).slice(0, 20);
      await fs.rm(path.join(CACHE, `${key}.json`), { force: true });
      await fs.rm(path.join(CACHE, `${key}.pcm`), { force: true });
      console.log(`    forgotten: ${v} paragraph ${Number(p) + 1} (run again to record it)`);
    }
  }
  return bad.size;
}

await fs.mkdir(OUT_DIR, { recursive: true });
// --redo: forget those takes; only their texts are recorded again.
const forgotten = new Set();
for (const [id, v, n] of redo) {
  const text = texts.find(t => t.id === id);
  // A paragraph number or one of the narrator’s named segments.
  const spoken = ['greeting', 'title', 'cue', 'outro'].includes(n) ? frames.get(id)?.[n] : text?.paras[Number(n) - 1]?.s.map(s => s[0]).join(' ');
  if (!text || !spoken || !VOICES[v]) { console.error(`✗ --redo ${id}:${v}:${n}: no such text, voice or paragraph`); process.exit(1); }
  const key = sha(`${TTS_MODEL}|${VOICES[v]}|${spoken}`).slice(0, 20);
  await fs.rm(path.join(CACHE, `${key}.json`), { force: true });
  await fs.rm(path.join(CACHE, `${key}.pcm`), { force: true });
  forgotten.add(id);
}
const chosen = texts.filter(t => (!only || only.includes(t.id)) && (!redo.length || forgotten.has(t.id)));
if (qa) {
  let bad = 0;
  for (const t of chosen) { console.log(t.id); bad += await check(t); }
  console.log(`${bad} paragraph${bad === 1 ? '' : 's'} to check${fix && bad ? ' (forgotten: run the script again)' : ''} · ${calls} requests`);
} else if (dry) {
  for (const t of chosen) { console.log(t.id); for (const v of ['f', 'm']) for (const para of t.paras) await paragraph(para.s.map(s => s[0]), v); }
} else {
  for (const t of chosen) index[t.id] = await record(t);
  // Recordings of texts that no longer exist, and any older plain .mp3, are removed.
  const ids = new Set(texts.map(t => t.id));
  for (const id of Object.keys(index)) if (!ids.has(id)) delete index[id];
  for (const f of await fs.readdir(OUT_DIR)) {
    const m = /^(.+)-[fmd]\.dat$/.exec(f);
    if (!m || !ids.has(m[1])) await fs.rm(path.join(OUT_DIR, f));
  }
  await fs.writeFile(INDEX, `${JSON.stringify(index)}\n`);
  console.log(`✓ ${Object.keys(index).length} texts in ${path.relative(root, INDEX)} · ${calls} requests`);
}
await fs.rm(TMP, { recursive: true, force: true });
