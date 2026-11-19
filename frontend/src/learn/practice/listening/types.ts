import type { Level, T, Voice } from '../../types';

export type ListeningVoice = Extract<Voice, 'f2' | 'm2'>;
export const LISTENING_VOICES: ListeningVoice[] = ['f2', 'm2'];

export interface ListeningExercise {
  id: string;
  level: Extract<Level, 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'>;
  title: string;
  format: T;
  summary: T;
  goal: T;
  strategy: T;
  voice: ListeningVoice;
  segments: string[];
  questions: {
    prompt: string;
    options: string[];
    answer: number;
    cue: number;
    explanation: T;
  }[];
  /** Advanced documents (C1, C2): what each segment does in the argument, shown with the transcript. */
  outline?: T[];
  /** Advanced documents: expressions worth keeping, with their meaning. */
  expressions?: { fr: string; meaning: T }[];
  /** A library entry whose content is downloaded on demand (advanced.ts): its number of questions. */
  count?: number;
  lazy?: boolean;
}

export const passageAudio = (e: ListeningExercise) => e.segments.join(' ');
export const questionAudio = (q: ListeningExercise['questions'][number]) =>
  [q.prompt, ...q.options.map((option, i) => `Réponse ${'ABCD'[i]}. ${option.replace(/[.!?]$/, '')}.`)].join(' ');
