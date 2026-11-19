// Keeps the course files readable: French first, then English, as in the
// other practice authoring helpers. The voices alternate (a woman, a man)
// across a course; items that share a recording keep the same voice.
import { b } from '../../types';
import type { EarCourse, EarExample, EarFill, EarItem, EarPick, EarSituation, EarVoice } from './types';

type Copy = [fr: string, en: string];
const copy = ([fr, en]: Copy) => b(en, fr);

type Draft<I extends EarItem> = Omit<I, 'voice'>;
type ExampleDraft = Omit<EarExample, 'voice'>;

export const ex = (say: string, show: string, note: Copy, natural?: string): ExampleDraft =>
  ({ say, show, note: copy(note), ...(natural ? { natural } : {}) });

export const pick = (say: string, options: string[], answer: number, show: string, explain: Copy, q?: Copy): Draft<EarPick> =>
  ({ kind: 'pick', say, options, answer, show, explain: copy(explain), ...(q ? { q: copy(q) } : {}) });

export const fill = (say: string, gap: string, answers: string | string[], show: string, explain: Copy): Draft<EarFill> =>
  ({ kind: 'fill', say, gap, answers: Array.isArray(answers) ? answers : [answers], show, explain: copy(explain) });

export const situation = (say: string, q: string, options: string[], answer: number, show: string, explain: Copy): Draft<EarSituation> =>
  ({ kind: 'situation', say, q, options, answer, show, explain: copy(explain) });

export function ear(id: string, d: {
  rule: [title: Copy, body: Copy];
  goal: Copy;
  takeaway: Copy;
  examples: ExampleDraft[];
  items: Draft<EarItem>[];
}): EarCourse {
  const voices: EarVoice[] = ['f', 'm'];
  const bySay = new Map<string, EarVoice>();
  let n = 0;
  const voiceFor = (say: string) => {
    let v = bySay.get(say);
    if (!v) { v = voices[n++ % 2]; bySay.set(say, v); }
    return v;
  };
  return {
    id,
    rule: { title: copy(d.rule[0]), body: copy(d.rule[1]) },
    goal: copy(d.goal),
    takeaway: copy(d.takeaway),
    examples: d.examples.map((e, i) => ({ ...e, voice: voices[i % 2] })),
    items: d.items.map(it => ({ ...it, voice: voiceFor(it.say) }) as EarItem),
  };
}
