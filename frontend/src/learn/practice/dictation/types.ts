// Data model for the French Dictation studio (/learn/practice/dictation/).
// Each dictation is ONE coherent French text with ONE continuous studio audio
// recording in both native voices (Claire · woman & Thomas · man), paired with
// one of 4 authentic pedagogical dictation methods.
import type { Level, T } from '../../types';

export type DictationVoice = 'f' | 'm';

/**
 * Four authentic French dictation methods to keep practice varied and engaging:
 * - 'story':       Classic literary/everyday dictation (Full sheet or Guided blanks)
 * - 'homophones':  Trap-choice "Duel de mots" (pick sound-alike spellings inline while listening, or Full sheet)
 * - 'conjugation': Grammatical dictation "Verbes & accords" (inline blanks with infinitive/lemma cues, or Full sheet)
 * - 'exam':        Exam challenge (authentic 3-listen counter, live timer, no-hint discipline, or Free training)
 */
export type DictationMethod = 'story' | 'homophones' | 'conjugation' | 'exam';

export type DictationMode = 'full' | 'guided' | 'duel' | 'grammar';

export const DICTATION_VOICES: DictationVoice[] = ['f', 'm'];
export const DICTATION_METHODS: DictationMethod[] = ['story', 'homophones', 'conjugation', 'exam'];

export interface HomophoneSlot {
  /** Exact word occurring in `text` (in sequential order). */
  target: string;
  /** 2–3 sound-alike choices presented inline (includes `target`). */
  options: string[];
}

export interface GrammarSlot {
  /** Exact inflected word occurring in `text` (in sequential order). */
  target: string;
  /** Infinitive verb or base masculine/singular lemma shown as a grammar cue. */
  cue: string;
}

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
  /** Pedagogical dictation format (defaults to 'story'). */
  method?: DictationMethod;
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
  /** For 'homophones' courses: sequential inline sound-alike choice slots. */
  homophones?: HomophoneSlot[];
  /** For 'conjugation' courses: sequential inline blanks with infinitive/base cues. */
  grammarCues?: GrammarSlot[];
  /** Key orthographic traps explained in the correction report. */
  traps: DictationTrap[];
  /** Golden spelling rules shown in the correction report. */
  rules: DictationRule[];
  /** Cached word count (kept on public build outlines). */
  wordCount?: number;
  locked?: 'visitor' | 'free' | 'premium';
}

export const courseMethod = (d: DictationCourse): DictationMethod => d.method ?? 'story';
