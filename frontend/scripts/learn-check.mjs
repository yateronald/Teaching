// Checks the free courses' content: ids, lesson counts, minutes, answers, gaps.
//   node scripts/learn-check.mjs
import { createServer } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const vite = await createServer({ root, logLevel: 'error', server: { middlewareMode: true, hmr: false }, appType: 'custom' });
const ssr = await vite.ssrLoadModule('/src/learn/ssr.ts');
const { COURSES } = await vite.ssrLoadModule('/src/learn/catalog.ts');
const { getLessons } = await vite.ssrLoadModule('/src/learn/content/registry.ts');
console.log('warnings:', ssr.prepareLearn());
let lessons = 0, steps = 0; const kinds = {};
for (const c of COURSES) {
  const ls = getLessons(c.id) || [];
  lessons += ls.length;
  const mins = ls.reduce((a, l) => a + l.minutes, 0);
  ls.forEach(l => l.steps.forEach(s => { steps++; kinds[s.kind] = (kinds[s.kind] || 0) + 1; if (s.kind === 'mcq' && (s.answer >= s.options.length)) console.log('BAD answer', l.id); if (s.kind === 'fill' && s.text.split('___').length - 1 !== s.answers.length) console.log('BAD fill blanks', l.id, s.text); if (s.kind === 'fill' && s.choices && s.choices.some((ch, i) => !ch.includes(s.answers[i][0]))) console.log('BAD fill choices', l.id, s.text); }));
  const slugs = new Set(ls.map(l => l.slug.en)); if (slugs.size !== ls.length) console.log('dup slug', c.id);
  if (Math.abs(mins - c.minutes) > 0) console.log(`minutes ${c.id}: lessons ${mins} vs catalog ${c.minutes}`);
}
console.log({ courses: COURSES.length, lessons, steps, kinds, pages: ssr.learnPages().length });
await vite.close();
