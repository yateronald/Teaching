// Run from frontend: node scripts/test-reading-library.mjs
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { createServer } from 'vite';

const vite = await createServer({ logLevel: 'error', server: { middlewareMode: true, hmr: false } });
try {
  const { TEXTS } = await vite.ssrLoadModule('/src/learn/practice/meta.ts');
  const { checkText, isSpokenTitle, narrationsOf, sentencesOf, spokenFrame } = await vite.ssrLoadModule('/src/learn/practice/model.ts');
  const index = JSON.parse(await readFile('src/learn/practice/text-audio.json', 'utf8'));
  const images = JSON.parse(await readFile('src/learn/image-versions.json', 'utf8'));
  const prompts = JSON.parse(await readFile('scripts/learn-images.json', 'utf8'));
  const mask = Buffer.from('lfwn-lecture-2026');
  const seen = new Set();
  let tracks = 0;

  for (const [i, meta] of TEXTS.entries()) {
    assert(!seen.has(meta.id), `Duplicate reading ID: ${meta.id}`);
    seen.add(meta.id);
    const { default: text } = await vite.ssrLoadModule(`/src/learn/practice/texts/${meta.id}.ts`);
    assert.equal(text.id, meta.id);
    assert.deepEqual(checkText(meta, text), []);
    const frame = spokenFrame(meta, text, i);
    assert(frame.title.startsWith(meta.title));
    assert(!frame.greeting.includes(meta.title) && !frame.cue.includes(meta.title));

    assert(prompts[meta.image], `${meta.id}: missing illustration prompt`);
    const hash = createHash('sha1');
    for (const suffix of ['', '-640']) {
      const webp = await readFile(`public/learn/img/${meta.image}${suffix}.webp`);
      assert.equal(webp.toString('ascii', 8, 12), 'WEBP');
      hash.update(webp);
    }
    assert.equal(images[meta.image], hash.digest('hex').slice(0, 8), `${meta.id}: image version`);

    for (const voice of narrationsOf(text)) {
      const label = `${meta.id} (${voice})`;
      const n = index[meta.id]?.[voice];
      assert(n?.title, `${label}: missing title cue`);
      assert.equal(n.s.length, sentencesOf(text).length, `${label}: wrong number of sentence cues`);
      const [start, end] = n.title;
      assert(0 < start && start < end && end < n.s[0][0], `${label}: title must finish before the body`);
      assert(!isSpokenTitle(n, start / 2), `${label}: greeting must not highlight the title`);
      assert(isSpokenTitle(n, start) && isSpokenTitle(n, (start + end) / 2), `${label}: title must highlight when spoken`);
      assert(!isSpokenTitle(n, end), `${label}: cue must not highlight the title`);
      assert(!isSpokenTitle(n, n.s[0][0]), `${label}: body must not highlight the title`);
      assert(n.s.every(([a, b], i) => a < b && b <= n.d && (!i || n.s[i - 1][1] <= a)), `${label}: invalid sentence cues`);
      const file = await readFile(`public/learn/texts/${meta.id}-${voice}.dat`);
      const decoded = file.map((b, i) => b ^ mask[i % mask.length] ^ (i & 0xff));
      assert.equal(createHash('sha1').update(decoded).digest('hex').slice(0, 8), n.v, `${label}: recording and cues differ`);
      tracks++;
    }
  }

  assert(!isSpokenTitle({ v: 'legacy', d: 45, s: [[10, 15]] }, 5), 'Legacy audio must not highlight the whole introduction');
  console.log(`Reading library: ${TEXTS.length} texts, ${tracks} recordings, synced title cues, quizzes and covers verified.`);
} finally {
  await vite.close();
}
