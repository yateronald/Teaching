// Run from frontend: node scripts/test-reading-missions.mjs
import assert from 'node:assert/strict';
import { stat } from 'node:fs/promises';
import { createServer } from 'vite';

const vite = await createServer({ logLevel: 'error', server: { middlewareMode: true, hmr: false } });
try {
  const { MISSIONS, missionPath, missionAudio, missionVoice } = await vite.ssrLoadModule('/src/learn/practice/missions.ts');
  const { resolveLearnPath } = await vite.ssrLoadModule('/src/learn/paths.ts');
  const { audioKey, hasRecording } = await vite.ssrLoadModule('/src/learn/audio.ts');
  const { collectMedia } = await vite.ssrLoadModule('/src/learn/mediaSources.ts');
  const keys = new Set(collectMedia().audio.map(a => a.key));
  const seen = new Set();
  const counts = {};
  let tracks = 0;

  for (const m of MISSIONS) {
    assert(!seen.has(m.id), `Duplicate mission ID: ${m.id}`);
    seen.add(m.id);
    counts[m.level] = (counts[m.level] ?? 0) + 1;
    for (const lang of ['fr', 'en']) {
      const route = resolveLearnPath(missionPath(m, lang));
      assert.equal(route.type, 'reading-mission');
      assert.equal(route.mission.id, m.id);
      assert.equal(route.lang, lang);
    }
    assert.equal(m.documents.length, 3, m.id);
    assert.equal(new Set(m.documents.map(d => d.id)).size, m.documents.length, m.id);
    for (const d of m.documents) {
      const { line, highlight } = d.clue;
      assert(d.lines[line]?.includes(highlight) && highlight.trim(), `${m.id}: missing highlight`);
      assert(new Set(d.lines).size === d.lines.length && d.lines.length >= 2, `${m.id}: ambiguous passages`);
      assert.equal(typeof d.takeaway.en, 'string', `${m.id}: missing English explanation`);
      const words = missionAudio(d);
      const voice = missionVoice(d);
      const key = audioKey(words, voice);
      assert(keys.has(key), `${m.id}: add recording to the generation input`);
      assert(hasRecording(words, voice), `${m.id}: missing ${voice} recording`);
      assert((await stat(`public/learn/audio/${key}.mp3`)).size > 0);
      tracks++;
    }
  }
  assert.equal(MISSIONS.length, 10);
  assert.deepEqual(counts, { A1: 2, A2: 2, B1: 4, B2: 2 });
  assert.deepEqual(new Set(MISSIONS.flatMap(m => m.documents.map(missionVoice))), new Set(['f', 'f2', 'm2']));
  console.log(`${MISSIONS.length} guided reading missions, both routes, ${tracks} recordings, and all clues verified.`);
} finally {
  await vite.close();
}
