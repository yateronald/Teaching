// Generates the media of the free courses with Google's models (Vertex AI,
// key from backend/.env): pictures, French audio for every phrase, and the
// hub video. Only what is missing is generated; run it again after adding
// content. Never runs during the build.
//
//   node scripts/learn-media.mjs              pictures + audio
//   node scripts/learn-media.mjs --images     pictures only
//   node scripts/learn-media.mjs --audio      audio only
//   node scripts/learn-media.mjs --video      the hub video (Veo)
//   node scripts/learn-media.mjs --only key1,key2 --force   regenerate some pictures
//
// Output: public/learn/img/<key>.webp (+ -640.webp), public/learn/audio/<key>.mp3,
// public/learn/video/hub.mp4, src/learn/audio-manifest.json, src/learn/image-versions.json.
// Needs ffmpeg on the PATH.
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
const only = args.includes('--only') ? args[args.indexOf('--only') + 1].split(',') : null;
const force = has('--force');
const doImages = has('--images') || (!has('--audio') && !has('--video'));
const doAudio = has('--audio') || (!has('--images') && !has('--video'));
const doVideo = has('--video');

const KEY = process.env.VERTEX_API_KEY || process.env.GOOGLE_CLOUD_API_KEY || process.env.Google_cloud_key;
const PROJECT = process.env.VERTEX_PROJECT;
if (!KEY) { console.error('No Vertex key in backend/.env (VERTEX_API_KEY or Google_cloud_key).'); process.exit(1); }
const ai = new GoogleGenAI({ apiKey: KEY, vertexai: true });

const IMG_DIR = path.join(root, 'public', 'learn', 'img');
const AUDIO_DIR = path.join(root, 'public', 'learn', 'audio');
const VIDEO_DIR = path.join(root, 'public', 'learn', 'video');
const MANIFEST = path.join(root, 'src', 'learn', 'audio-manifest.json');
const TMP = await fs.mkdtemp(path.join(os.tmpdir(), 'learn-media-'));

const ffmpeg = (...a) => {
  const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', ...a], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`ffmpeg failed: ${r.stderr || r.error}`);
};
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function pool(items, n, fn) {
  let i = 0, done = 0, failed = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (i < items.length) {
      const item = items[i++];
      try { await fn(item); done++; } catch (e) { failed++; console.warn(`  ✗ ${item.key ?? item}: ${String(e.message || e).slice(0, 160)}`); }
      if ((done + failed) % 25 === 0) console.log(`  … ${done + failed}/${items.length}`);
    }
  }));
  return { done, failed };
}

// Gentle pace: at most one request every GAP_MS across the whole run, so a
// bulk run never looks like abuse (the project was suspended once, 2026-10).
const GAP_MS = Number(process.env.LEARN_MEDIA_GAP_MS || 1100);
let nextSlot = 0;
async function throttle() {
  const now = Date.now();
  const at = Math.max(now, nextSlot);
  nextSlot = at + GAP_MS;
  if (at > now) await sleep(at - now);
}

async function retry(fn, tries = 4) {
  for (let t = 1; ; t++) {
    try { await throttle(); return await fn(); } catch (e) {
      // Refused by policy: stop the whole run at once instead of insisting.
      if (/403|PERMISSION_DENIED|terms of use/i.test(String(e.message))) { console.error(`✗ Stopped: ${String(e.message).slice(0, 200)}`); process.exit(2); }
      if (t >= tries) throw e;
      if (/429|RESOURCE_EXHAUSTED/i.test(String(e.message))) { await sleep(30000 * t); continue; }
      await sleep(1500 * t * t);
    }
  }
}

// ── Load the content through Vite (TypeScript, import.meta.glob) ──
const vite = await createServer({ root, logLevel: 'error', server: { middlewareMode: true, hmr: false }, appType: 'custom' });
const { collectMedia } = await vite.ssrLoadModule('/src/learn/mediaSources.ts');
const media = collectMedia();
await vite.close();
console.log(`Content: ${media.images.length} pictures, ${media.audio.length} audio phrases.`);

// ── Pictures ──
const STYLE = 'Editorial documentary photograph, natural light, 35mm lens, shallow depth of field, realistic skin and textures, warm muted colours with deep navy and cream accents, calm and premium, candid (people not looking at the camera unless stated). Absolutely no text, letters, words, captions, logos or watermarks anywhere in the image. Laptops, phones and objects are plain and unbranded, with no logo of any kind (no apple on a laptop lid, no brand name on headphones, radios or screens). Natural anatomy: each person has exactly two arms and two hands, every hand fully visible or naturally hidden.';

// Nano Banana 2 (gemini-3.1-flash-image): far more photographic than 2.5.
const IMAGE_MODEL = process.env.LEARN_IMAGE_MODEL || 'gemini-3.1-flash-image';

async function genImage(key, prompt) {
  const res = await retry(() => ai.models.generateContent({
    model: IMAGE_MODEL,
    contents: [{ role: 'user', parts: [{ text: `${prompt}\n\n${STYLE}` }] }],
    config: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '16:9' } },
  }));
  const part = res.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  if (!part) throw new Error('no image returned');
  const src = path.join(TMP, `${key}.png`);
  await fs.writeFile(src, Buffer.from(part.inlineData.data, 'base64'));
  ffmpeg('-i', src, '-vf', 'scale=1200:-2', '-c:v', 'libwebp', '-quality', '80', path.join(IMG_DIR, `${key}.webp`));
  ffmpeg('-i', src, '-vf', 'scale=640:-2', '-c:v', 'libwebp', '-quality', '78', path.join(IMG_DIR, `${key}-640.webp`));
}

if (doImages) {
  await fs.mkdir(IMG_DIR, { recursive: true });
  const prompts = JSON.parse(await fs.readFile(path.join(root, 'scripts', 'learn-images.json'), 'utf8'));
  const wanted = media.images.filter(k => (only ? only.includes(k) : true));
  const missingPrompt = wanted.filter(k => !prompts[k]);
  if (missingPrompt.length) console.warn(`  ⚠ no prompt for: ${missingPrompt.join(', ')}`);
  const todo = wanted.filter(k => prompts[k] && (force || !existsSync(path.join(IMG_DIR, `${k}.webp`)))).map(key => ({ key }));
  console.log(`Pictures to generate: ${todo.length}`);
  const r = await pool(todo, 2, ({ key }) => genImage(key, prompts[key]));
  console.log(`✓ pictures: ${r.done} generated, ${r.failed} failed`);
}

// ── Audio ──
// Chosen by ear-test (Gemini 3.8 judged 24 voices, 3–5 times each, on how
// native French they sound): Sulafat and Schedar scored highest overall.
const VOICES = { f: 'Sulafat', m: 'Schedar', f2: 'Aoede', m2: 'Sadaltager' };
const TTS_MODELS = ['gemini-3.8-flash-tts'];

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

let ttsModel = 0;
async function genAudio({ key, text, voice }) {
  // The bare text: an instruction before it is sometimes read aloud too.
  const prompt = text;
  const res = await retry(async () => {
    try {
      return await ai.models.generateContent({
        model: TTS_MODELS[ttsModel],
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICES[voice] || 'Kore' } } } },
      });
    } catch (e) {
      if (/404|not found/i.test(String(e.message)) && ttsModel < TTS_MODELS.length - 1) { ttsModel++; throw new Error(`model fallback to ${TTS_MODELS[ttsModel]}`); }
      throw e;
    }
  }, 5);
  const data = res.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData;
  if (!data) throw new Error('no audio returned');
  const rate = Number(/rate=(\d+)/.exec(data.mimeType || '')?.[1] || 24000);
  const raw = path.join(TMP, `${key}.pcm`);
  await fs.writeFile(raw, pcmFrom(Buffer.from(data.data, 'base64')));
  // Trim leading/trailing silence, normalise loudness, small mono mp3.
  ffmpeg('-f', 's16le', '-ar', String(rate), '-ac', '1', '-i', raw,
    '-af', 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.12,areverse,loudnorm=I=-17:TP=-1.5:LRA=11',
    '-ar', '24000', '-ac', '1', '-b:a', '48k', path.join(AUDIO_DIR, `${key}.mp3`));
}

if (doAudio) {
  await fs.mkdir(AUDIO_DIR, { recursive: true });
  const todo = media.audio.filter(a => force || !existsSync(path.join(AUDIO_DIR, `${a.key}.mp3`)));
  console.log(`Audio to generate: ${todo.length}`);
  const r = await pool(todo, 2, genAudio);
  console.log(`✓ audio: ${r.done} generated, ${r.failed} failed (model ${TTS_MODELS[ttsModel]})`);
}

// The manifest lists the recordings that exist, whatever this run did.
{
  const files = existsSync(AUDIO_DIR) ? (await fs.readdir(AUDIO_DIR)).filter(f => f.endsWith('.mp3')).map(f => f.slice(0, -4)) : [];
  const used = new Set(media.audio.map(a => a.key));
  const keys = files.filter(k => used.has(k)).sort();
  // Recordings no phrase uses any more (text edited) are removed.
  for (const k of files.filter(k => !used.has(k))) await fs.rm(path.join(AUDIO_DIR, `${k}.mp3`));
  await fs.writeFile(MANIFEST, `${JSON.stringify({ keys })}\n`);
  console.log(`✓ audio manifest: ${keys.length} recordings (${files.length - keys.length} unused removed)`);
}

// Picture versions: the server caches .webp for a year, so each URL carries a
// hash of the file (?v=…) and a regenerated picture reaches every visitor.
{
  const out = {};
  const names = existsSync(IMG_DIR) ? (await fs.readdir(IMG_DIR)).filter(f => f.endsWith('.webp') && !f.endsWith('-640.webp')).sort() : [];
  for (const f of names) {
    const key = f.slice(0, -5);
    const h = createHash('sha1').update(await fs.readFile(path.join(IMG_DIR, f)));
    if (existsSync(path.join(IMG_DIR, `${key}-640.webp`))) h.update(await fs.readFile(path.join(IMG_DIR, `${key}-640.webp`)));
    out[key] = h.digest('hex').slice(0, 8);
  }
  await fs.writeFile(path.join(root, 'src', 'learn', 'image-versions.json'), `${JSON.stringify(out, null, 0)}
`);
  console.log(`✓ image versions: ${names.length} pictures`);
}

// ── Video (Veo, regional endpoint) ──
if (doVideo) {
  await fs.mkdir(VIDEO_DIR, { recursive: true });
  const regional = new GoogleGenAI({ apiKey: KEY, vertexai: true, httpOptions: { baseUrl: 'https://us-central1-aiplatform.googleapis.com/' } });
  const model = `projects/${PROJECT}/locations/us-central1/publishers/google/models/veo-3.1-fast-generate-001`;
  const videos = JSON.parse(await fs.readFile(path.join(root, 'scripts', 'learn-videos.json'), 'utf8'));
  for (const [name, prompt] of Object.entries(videos)) {
    if (!force && existsSync(path.join(VIDEO_DIR, `${name}.mp4`))) continue;
    console.log(`Video ${name}: generating (a few minutes)…`);
    let op = await regional.models.generateVideos({ model, prompt, config: { numberOfVideos: 1, durationSeconds: 8, aspectRatio: '16:9', generateAudio: false } });
    while (!op.done) { await sleep(10000); op = await regional.operations.getVideosOperation({ operation: op }); }
    const v = op.response?.generatedVideos?.[0]?.video;
    if (!v) { console.warn(`  ✗ ${name}: ${JSON.stringify(op.error || op.response).slice(0, 200)}`); continue; }
    const src = path.join(TMP, `${name}-src.mp4`);
    if (v.videoBytes) await fs.writeFile(src, Buffer.from(v.videoBytes, 'base64'));
    else if (v.uri) { const r = await fetch(v.uri); await fs.writeFile(src, Buffer.from(await r.arrayBuffer())); }
    ffmpeg('-i', src, '-an', '-vf', 'scale=1280:-2', '-c:v', 'libx264', '-preset', 'slow', '-crf', '28', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path.join(VIDEO_DIR, `${name}.mp4`));
    console.log(`✓ video ${name}`);
  }
}

await fs.rm(TMP, { recursive: true, force: true });
