// Dialogues du quotidien (Practice › Listening): fifty two-voice conversations
// of everyday life, ten situations (health, housing, work…) at five levels
// each (A1 → C1). The learner listens without the text, answers, then sees
// the line that proves each answer, the whole transcript, useful phrases and
// a practical tip. Every line is a sealed recording in its speaker's voice.
import type { Level, T, Voice } from '../../types';

export type DialogueVoice = Extract<Voice, 'f' | 'm'>;
export type DialogueLevel = Extract<Level, 'A1' | 'A2' | 'B1' | 'B2' | 'C1'>;
export type ThemeId = 'sante' | 'logement' | 'travail' | 'demarches' | 'banque' | 'transports' | 'achats' | 'ecole' | 'loisirs' | 'urgences';

export interface DialogueLine { who: number; fr: string; en: string }
export interface DialogueQuestion { q: string; options: string[]; answer: number; /** The line that holds the answer. */ line: number; explain: T }

export interface Dialogue {
  id: string;
  /** Where and who: shown before listening. */
  setting: T;
  speakers: { name: string; voice: DialogueVoice }[];
  lines: DialogueLine[];
  questions: DialogueQuestion[];
  /** Lines worth reusing (indexes in `lines`). */
  phrases: number[];
  /** A practical tip about life in France. */
  tip: T;
  locked?: 'visitor' | 'free' | 'premium';
}

export interface DialogueMeta {
  id: string;
  theme: ThemeId;
  level: DialogueLevel;
  /** The French title. */
  title: string;
  summary: T;
}
