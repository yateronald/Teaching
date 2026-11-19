// Data model for the French Dictation studio (/learn/practice/dictation/).
// Each dictation is ONE coherent French text with ONE continuous studio audio
// recording in both native voices (Claire · woman & Thomas · man).
import type { Level, T } from '../../types';

export type DictationVoice = 'f' | 'm';
export type DictationMode = 'full' | 'guided';

export const DICTATION_VOICES: DictationVoice[] = ['f', 'm'];

export interface DictationTrap {
  /** Word or expression in the text that often causes spelling errors. */
  word: string;
  /** Clear, concise explanation of the spelling or grammar rule. */
  note: T;
}

export interface DictationRule {
  /** Rule headline (e.g. "Les accords au féminin pluriel"). */
  title: T;
  /** Short, learner-friendly explanation. */
  body: T;
  /** Playable native French examples illustrating the rule. */
  examples: { fr: string; note: T }[];
}

export interface DictationCourse {
  id: string;
  slug: string;
  title: string;
  subtitle: T;
  level: Level;
  /** Everyday or thematic category shown as a crisp pill. */
  theme: T;
  /** Short orthographic focus tags (e.g. "Accents", "Plurals -s"). */
  focus: T[];
  /** Cover image key in public/learn/img. */
  image: string;
  /** Estimated minutes to complete. */
  minutes: number;
  /** Complete coherent French dictation text (one continuous passage). */
  text: string;
  /** Idiomatic English translation revealed after correction. */
  translation: string;
  /** Ordered target words blanked out when the learner selects Guided mode. */
  blanks: string[];
  /** Key orthographic traps explained in the correction report. */
  traps: DictationTrap[];
  /** Golden spelling rules shown in the correction report. */
  rules: DictationRule[];
}
