// Regenerates src/learn/practice/listening/advanced-meta.ts (the library entries of the
// C1 and C2 documents) from their content in c1.ts and c2.ts. Run after editing them:
//   node scripts/listening-stubs.mjs
import { createServer } from 'vite';
import fs from 'node:fs';
const vite = await createServer({ root: process.cwd(), logLevel: 'error', server: { middlewareMode: true, hmr: false }, appType: 'custom' });
const { c1Listening } = await vite.ssrLoadModule('/src/learn/practice/listening/c1.ts');
const { c2Listening } = await vite.ssrLoadModule('/src/learn/practice/listening/c2.ts');
await vite.close();
const q = s => JSON.stringify(s);
const rows = [...c1Listening, ...c2Listening].map(e =>
  `  stub(${q(e.id)}, ${q(e.level)}, ${q(e.voice)}, ${q(e.title)}, [${q(e.format.fr)}, ${q(e.format.en)}], [${q(e.summary.fr)}, ${q(e.summary.en)}], ${e.questions.length}),`);
const out = `// The advanced documents (C1, C2) as the library and the router see them:
// title, level, summary and number of questions. Their content (c1.ts, c2.ts)
// is downloaded only when one is opened (advanced.ts). Generated from the
// content by scripts/listening-stubs.mjs, and checked against it at build time (ssr.ts).
import { b } from '../../types';
import type { ListeningExercise } from './types';

const stub = (id: string, level: ListeningExercise['level'], voice: ListeningExercise['voice'], title: string, format: [string, string], summary: [string, string], count: number): ListeningExercise => ({
  id, level, voice, title, format: b(format[1], format[0]), summary: b(summary[1], summary[0]),
  goal: b('', ''), strategy: b('', ''), segments: [], questions: [], count, lazy: true,
});

export const ADVANCED_STUBS: ListeningExercise[] = [
${rows.join('\n')}
];
`;
fs.writeFileSync('src/learn/practice/listening/advanced-meta.ts', out);
console.log(rows.length, 'stubs');
