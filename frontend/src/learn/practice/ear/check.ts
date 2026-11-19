// What the build checks in every ear-training course (ssr.ts warnings):
// the content matches its catalogue entry, every question has a valid answer,
// every gap has one blank, and the transcript markup is balanced.
import type { EarCourse, EarMeta } from './types';

const balanced = (s: string) => {
  let curly = 0;
  for (const ch of s) {
    if (ch === '{') curly++; else if (ch === '}') curly--;
    if (curly < 0 || curly > 1) return false;
  }
  return curly === 0 && (s.split('~').length - 1) % 2 === 0;
};

export function checkEar(meta: EarMeta, c: EarCourse): string[] {
  const w: string[] = [];
  const at = `ear course ${meta.id}`;
  if (c.id !== meta.id) w.push(`${at}: its file says id ${c.id}`);
  if (c.items.length !== meta.items) w.push(`${at}: ${c.items.length} exercises, meta.ts says ${meta.items}`);
  if (c.examples.length < 2) w.push(`${at}: fewer than two examples to discover`);
  for (const step of ['pick', 'fill', 'situation'] as const) {
    if (!c.items.some(i => i.kind === step)) w.push(`${at}: no « ${step} » exercise`);
  }
  [...c.examples.map(e => e.show), ...c.items.map(i => i.show)].forEach(s => { if (!balanced(s)) w.push(`${at}: unbalanced markup in « ${s} »`); });
  c.items.forEach((it, n) => {
    const q = `${at}, exercise ${n + 1}`;
    if (!it.say.trim()) w.push(`${q}: nothing to hear`);
    if (it.kind === 'fill') {
      if (it.gap.split('___').length !== 2) w.push(`${q}: the gap must contain one ___`);
      if (!it.answers.length) w.push(`${q}: no accepted answer`);
    } else {
      if (it.answer < 0 || it.answer >= it.options.length) w.push(`${q}: no valid answer`);
      if (new Set(it.options).size !== it.options.length) w.push(`${q}: two options are the same`);
    }
  });
  return w;
}
