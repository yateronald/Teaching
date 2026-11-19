// What the build checks in every dialogue (ssr.ts warnings).
import type { Dialogue, DialogueMeta } from './types';

export function checkDialogue(meta: DialogueMeta, d: Dialogue): string[] {
  const w: string[] = [];
  const at = `dialogue ${meta.id}`;
  if (d.speakers.length !== 2) w.push(`${at}: needs two speakers`);
  if (d.lines.length < 5) w.push(`${at}: fewer than five lines`);
  d.lines.forEach((l, i) => {
    if (!d.speakers[l.who]) w.push(`${at}: line ${i + 1} has no speaker`);
    if (!l.fr.trim() || !l.en.trim()) w.push(`${at}: line ${i + 1} or its translation is empty`);
  });
  if (d.questions.length < 3) w.push(`${at}: fewer than three questions`);
  d.questions.forEach((q, i) => {
    if (q.answer < 0 || q.answer >= q.options.length) w.push(`${at}: question ${i + 1} has no valid answer`);
    if (!d.lines[q.line]) w.push(`${at}: question ${i + 1} points to a missing line`);
    if (new Set(q.options).size !== q.options.length) w.push(`${at}: question ${i + 1} repeats an option`);
  });
  d.phrases.forEach(p => { if (!d.lines[p]) w.push(`${at}: useful phrase ${p + 1} is not a line`); });
  return w;
}
