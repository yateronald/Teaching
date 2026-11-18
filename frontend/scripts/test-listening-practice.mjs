// From frontend: node scripts/test-listening-practice.mjs
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createServer } from 'vite';

const vite = await createServer({ logLevel: 'error', server: { middlewareMode: true, ws: false }, appType: 'custom' });
try {
  const { LISTENING, listeningPath, exercisePath, listeningCoverKey } = await vite.ssrLoadModule('/src/learn/practice/listening/catalog.ts');
  const { LISTENING_VOICES, passageAudio, questionAudio } = await vite.ssrLoadModule('/src/learn/practice/listening/types.ts');
  const { audioKey, hasRecording } = await vite.ssrLoadModule('/src/learn/audio.ts');
  const { resolveLearnPath } = await vite.ssrLoadModule('/src/learn/paths.ts');
  const { collectMedia } = await vite.ssrLoadModule('/src/learn/mediaSources.ts');
  const media = collectMedia();
  const registered = new Set(media.audio.map(a => a.key));
  const versions = JSON.parse(await readFile('src/learn/image-versions.json', 'utf8'));
  const prompts = JSON.parse(await readFile('scripts/learn-images.json', 'utf8'));
  const seenCovers = new Set();
  const clips = new Set();
  const checkAudio = async (text, voice) => {
    const key = audioKey(text, voice);
    if (clips.has(key)) return;
    assert(registered.has(key), `Recording not registered: ${key}`);
    assert(hasRecording(text, voice), `Missing from audio manifest: ${key}`);
    assert((await stat(`public/learn/audio/${key}.dat`)).size > 1000, key);
    clips.add(key);
  };

  assert.equal(LISTENING.length, 10);
  assert.equal(new Set(LISTENING.map(e => e.id)).size, 10);
  assert.deepEqual(LISTENING_VOICES, ['f2', 'm2']);
  assert.deepEqual(Object.fromEntries(['A1', 'A2', 'B1', 'B2'].map(level => [level, LISTENING.filter(e => e.level === level).length])), { A1: 3, A2: 2, B1: 3, B2: 2 });
  for (const lang of ['fr', 'en']) {
    assert.deepEqual(resolveLearnPath(listeningPath(lang)), { type: 'listening', lang });
    assert.equal(resolveLearnPath(listeningPath(lang) + 'nonexistent/').type, 'none');
  }
  let questions = 0;
  for (const e of LISTENING) {
    const key = listeningCoverKey(e);
    const hash = createHash('sha1');
    assert(media.images.includes(key) && prompts[key], `Cover is not registered: ${key}`);
    for (const suffix of ['', '-640']) {
      const file = await readFile(`public/learn/img/${key}${suffix}.webp`);
      assert.equal(file.toString('ascii', 8, 12), 'WEBP', key);
      hash.update(file);
    }
    const digest = hash.digest('hex').slice(0, 8);
    assert.equal(versions[key], digest, `Wrong cover version: ${key}`);
    assert(!seenCovers.has(digest), `Duplicate cover: ${key}`);
    seenCovers.add(digest);
    for (const lang of ['fr', 'en']) assert.deepEqual(resolveLearnPath(exercisePath(e, lang)), { type: 'listening-exercise', lang, exercise: e });
    assert(e.questions.length >= 4 && e.questions.length <= 7);
    assert(LISTENING_VOICES.includes(e.voice));
    assert.equal(new Set(e.questions.map(q => q.prompt)).size, e.questions.length);
    for (const voice of LISTENING_VOICES) await checkAudio(passageAudio(e), voice);
    for (const segment of e.segments) await checkAudio(segment, e.voice);
    for (const q of e.questions) {
      assert(q.options.length >= 2 && q.options.length <= 4);
      assert.equal(new Set(q.options).size, q.options.length);
      assert(q.options[q.answer]?.trim(), e.id);
      assert(e.segments[q.cue]?.trim(), e.id);
      const prompt = questionAudio(q);
      assert(prompt.startsWith(q.prompt));
      q.options.forEach((option, i) => assert(prompt.includes(`Réponse ${'ABCD'[i]}. ${option.replace(/[.!?]$/, '')}`)));
      await checkAudio(prompt, e.voice);
      questions++;
    }
  }
  console.log(`${LISTENING.length} illustrated listening exercises, ${questions} spoken questionnaires, ${clips.size} audio files, and both languages verified.`);
} finally {
  await vite.close();
}
