// Checks the free courses' content: ids, lesson counts, minutes, answers, gaps.
//   node scripts/learn-check.mjs
import { createServer } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const vite = await createServer({ root, configFile: false, optimizeDeps: { noDiscovery: true }, logLevel: 'error', server: { middlewareMode: true, hmr: false }, appType: 'custom' });
const ssr = await vite.ssrLoadModule('/src/learn/ssr.ts');
const { COURSES } = await vite.ssrLoadModule('/src/learn/catalog.ts');
const { getLessons } = await vite.ssrLoadModule('/src/learn/content/registry.ts');
console.log('warnings:', ssr.prepareLearn());
const EXAMPLE_EN = JSON.parse((await import('node:fs')).readFileSync(path.join(root, 'src/learn/content/example-translations.json'), 'utf8'));
let lessons = 0, steps = 0; const kinds = {};
for (const c of COURSES) {
  const ls = getLessons(c.id) || [];
  lessons += ls.length;
  const mins = ls.reduce((a, l) => a + l.minutes, 0);
  ls.forEach(l => l.steps.forEach(s => { steps++; kinds[s.kind] = (kinds[s.kind] || 0) + 1; if (s.kind === 'mcq' && (s.answer >= s.options.length)) console.log('BAD answer', l.id); if (s.kind === 'fill' && s.text.split('___').length - 1 !== s.answers.length) console.log('BAD fill blanks', l.id, s.text); if (s.kind === 'flashcards') s.cards.forEach(cd => { if (cd.ex && !EXAMPLE_EN[cd.ex]) console.log('no English translation for example (content/example-translations.json):', cd.ex); }); if (s.kind === 'fill' && s.choices && s.choices.some((ch, i) => !ch.includes(s.answers[i][0]))) console.log('BAD fill choices', l.id, s.text); }));
  const slugs = new Set(ls.map(l => l.slug.en)); if (slugs.size !== ls.length) console.log('dup slug', c.id);
  if (Math.abs(mins - c.minutes) > 0) console.log(`minutes ${c.id}: lessons ${mins} vs catalog ${c.minutes}`);
}
// ── Games ──
const W = await vite.ssrLoadModule('/src/learn/games/words.ts');
const S = await vite.ssrLoadModule('/src/learn/games/story.ts');
const dup = (arr, what) => { const seen = new Set(); arr.forEach(x => { if (seen.has(x)) console.log(`duplicate ${what}:`, x); seen.add(x); }); };
W.DAILY_WORDS.forEach(w => { const k = W.dailyKey(w); if (!/^[A-Z]{5}$/.test(k)) console.log('BAD daily word (5 letters A-Z):', w.w, k); if (!w.ex || !w.def || !w.tr) console.log('daily word incomplete:', w.w); });
dup(W.DAILY_WORDS.map(W.dailyKey), 'daily word');
dup(W.GENDER_NOUNS.map(n => n[0]), 'gender noun');
W.GENDER_NOUNS.forEach(([n]) => { if (/^[aeiouhéèêâîôûœ]/i.test(n)) console.log('gender noun starts with a vowel or h:', n); });
W.PAIR_DECKS.forEach(d => { if (d.words.length !== 8) console.log('pair deck is not 8 words:', d.id); dup(d.words.map(w => w[0]), `pair word in ${d.id}`); });
for (let n = 0; n <= 100; n++) if (!W.frNumber(n)) console.log('no French for number', n);
let beats = 0;
S.EPISODES.forEach(ep => ep.beats.forEach(bt => {
  beats++;
  if ((bt.k === 'say' || bt.k === 'listen') && !S.CAST[bt.who]) console.log('unknown character', ep.id, bt.who);
  if (bt.k === 'choice' && new Set(bt.options).size !== 3) console.log('choice options not distinct', ep.id, bt.options[0]);
  if (bt.k === 'build' && bt.extra?.some(x => bt.words.includes(x))) console.log('build: extra word is also a right word', ep.id, bt.words.join(' '));
}));
console.log({ courses: COURSES.length, lessons, steps, kinds, pages: ssr.learnPages().length, games: { dailyWords: W.DAILY_WORDS.length, genderNouns: W.GENDER_NOUNS.length, pairDecks: W.PAIR_DECKS.length, storyBeats: beats } });
await vite.close();
