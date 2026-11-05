// Short builders for the levelled exam courses (TCF / TEF, A1 → C2). Exam
// questions are in French, as in the real papers; explanations are bilingual.
// The right option always comes first here: options are shuffled on screen.
import type { ConceptStep, Level, McqStep, T, Voice } from '../types';

interface Opts { explain?: T; timer?: number }

/** A listening question: the recording is heard, not shown. */
export const listen = (level: Level, voice: Voice, audio: string, prompt: string, options: string[], o: Opts = {}): McqStep =>
  ({ kind: 'mcq', level, voice, audio, listen: true, prompt, options, answer: 0, timer: o.timer ?? 45, ...(o.explain ? { explain: o.explain } : {}) });

/** A reading question on a document. */
export const read = (level: Level, doc: { title?: T; text: string; source?: T }, prompt: string, options: string[], o: Opts = {}): McqStep =>
  ({ kind: 'mcq', level, doc, prompt, options, answer: 0, timer: o.timer ?? 60, ...(o.explain ? { explain: o.explain } : {}) });

/** A language question, with an optional French sentence (a ___ gap) above the options. */
export const pick = (level: Level, prompt: T, options: T[], o: Opts & { fr?: string } = {}): McqStep =>
  ({ kind: 'mcq', level, prompt, options, answer: 0, ...(o.fr ? { fr: o.fr } : {}), ...(o.explain ? { explain: o.explain } : {}), ...(o.timer ? { timer: o.timer } : {}) });

/** A lesson card. */
export const card = (title: T, body: T, more: Omit<ConceptStep, 'kind' | 'title' | 'body'> = {}): ConceptStep =>
  ({ kind: 'concept', title, body, ...more });
