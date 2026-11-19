// Compact authoring for the dialogue files: French first, then English.
//   lines:     [speaker, French, English]
//   questions: [question (French), options, answer, line, [explanation fr, en]]
import { b } from '../../types';
import type { Dialogue, DialogueVoice } from './types';

type Copy = [fr: string, en: string];
type Line = [who: number, fr: string, en: string];
type Question = [q: string, options: string[], answer: number, line: number, explain: Copy];

export function dialogue(id: string, d: {
  setting: Copy;
  speakers: [name: string, voice: DialogueVoice][];
  lines: Line[];
  questions: Question[];
  phrases: number[];
  tip: Copy;
}): Dialogue {
  return {
    id,
    setting: b(d.setting[1], d.setting[0]),
    speakers: d.speakers.map(([name, voice]) => ({ name, voice })),
    lines: d.lines.map(([who, fr, en]) => ({ who, fr, en })),
    questions: d.questions.map(([q, options, answer, line, [fr, en]]) => ({ q, options, answer, line, explain: b(en, fr) })),
    phrases: d.phrases,
    tip: b(d.tip[1], d.tip[0]),
  };
}
