import { b } from '../../types';
import type { ListeningExercise } from './types';

type Localized = [fr: string, en: string];
type Question = [prompt: string, options: string[], answer: number, cue: number, explanation: Localized];
export type ExerciseDraft = [
  id: string, title: string, format: Localized, summary: Localized, goal: Localized, strategy: Localized,
  segments: string[], questions: Question[],
  /** Advanced documents only: the role of each segment, and expressions to keep. */
  outline?: Localized[], expressions?: [fr: string, meaning: Localized][],
];
const copy = ([fr, en]: Localized) => b(en, fr);

export function listening(level: ListeningExercise['level'], voice: ListeningExercise['voice'], drafts: ExerciseDraft[]): ListeningExercise[] {
  return drafts.map(([id, title, format, summary, goal, strategy, segments, questions, outline, expressions]) => ({
    id, level, voice, title, format: copy(format), summary: copy(summary), goal: copy(goal), strategy: copy(strategy), segments,
    questions: questions.map(([prompt, options, answer, cue, explanation]) => ({ prompt, options, answer, cue, explanation: copy(explanation) })),
    ...(outline ? { outline: outline.map(copy) } : {}),
    ...(expressions ? { expressions: expressions.map(([fr, meaning]) => ({ fr, meaning: copy(meaning) })) } : {}),
  }));
}
