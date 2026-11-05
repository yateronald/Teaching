// The free learning space (/learn/, /fr/apprendre/): its content model.
//
// A course is a short sequence of lessons; a lesson is a sequence of steps,
// each one something the learner DOES (choose, build, match, listen, speak,
// write…), with a few concept cards in between. Everything a learner reads in
// the interface comes in English and French; the French being taught is the
// same on both sides.

export type Lang = 'en' | 'fr';

/** Interface text: a plain string is the same in both languages (French content). */
export type T = string | { en: string; fr: string };

/**
 * A gloss for the learner (translation, meaning). A plain string is English and
 * is hidden on French pages; give { en, fr } to show a French explanation too.
 */
export type Gloss = string | { en: string; fr: string };

export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export const LEVELS: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export type CategoryId = 'beginner' | 'grammar' | 'spelling' | 'listening' | 'pronunciation' | 'conversation' | 'tcf' | 'tef-quebec' | 'delf-dalf' | 'business';

/** A voice for generated audio: two women, two men. */
export type Voice = 'f' | 'm' | 'f2' | 'm2';

// ── Steps ──────────────────────────────────────────────────────────────────

export interface ConceptStep {
  kind: 'concept';
  /** default = explanation; tip/culture/exam/trap = a coloured note. */
  variant?: 'default' | 'tip' | 'culture' | 'exam' | 'trap';
  title: T;
  /** Supports **bold** and __highlight__. */
  body?: T;
  image?: string;
  points?: T[];
  table?: { head: T[]; rows: T[][]; caption?: T };
  /** French examples, revealed one by one, each with its audio. */
  examples?: { fr: string; tr?: Gloss; note?: T }[];
}

export interface McqStep {
  kind: 'mcq';
  prompt: T;
  /** A French sentence shown above the options (e.g. with a ___ gap). */
  fr?: string;
  /** French text read aloud. With `listen`, the text stays hidden: a listening question. */
  audio?: string;
  listen?: boolean;
  /** Voice of the recording (default f). */
  voice?: Voice;
  image?: string;
  /** A reading document, exam style. */
  doc?: { title?: T; text: string; source?: T };
  options: T[];
  /** Index of the right option. Options are shuffled on screen unless `fixedOrder`. */
  answer: number;
  fixedOrder?: boolean;
  explain?: T;
  /** Exam-style questions carry their level (placement test, exam courses). */
  level?: Level;
  /** Seconds, exam-style countdown (shown, never blocking). */
  timer?: number;
}

export interface FillStep {
  kind: 'fill';
  prompt: T;
  /** French sentence; each ___ is a blank. */
  text: string;
  /** Accepted answers for each blank (first = canonical). */
  answers: string[][];
  /** If given, the learner picks among chips instead of typing. */
  choices?: string[][];
  /** Accents count: a missing accent is a mistake, not a warning (spelling courses). */
  strict?: boolean;
  tr?: Gloss;
  hint?: T;
  explain?: T;
}

export interface OrderStep {
  kind: 'order';
  prompt: T;
  /** The words of the sentence, in the right order. */
  words: string[];
  /** Words that do not belong. */
  extra?: string[];
  /** Other accepted orders (full word lists). */
  alt?: string[][];
  tr?: Gloss;
  explain?: T;
}

export interface MatchStep {
  kind: 'match';
  prompt: T;
  pairs: [string, T][];
}

export interface CategorizeStep {
  kind: 'categorize';
  prompt: T;
  buckets: T[];
  items: { text: string; bucket: number }[];
  explain?: T;
}

export interface DictationStep {
  kind: 'dictation';
  prompt: T;
  text: string;
  hint?: T;
  voice?: Voice;
  strict?: boolean;
}

export interface SpeakStep {
  kind: 'speak';
  prompt: T;
  text: string;
  tr?: Gloss;
  tip?: T;
}

export interface DialogueLine { s: number; fr: string; tr?: Gloss }
export interface DialogueChoice { s: number; choose: { options: string[]; answer: number; explain?: T } }

export interface DialogueStep {
  kind: 'dialogue';
  title: T;
  scene?: T;
  speakers: { name: string; voice: Voice; side: 'l' | 'r' }[];
  lines: (DialogueLine | DialogueChoice)[];
}

export interface FlashcardsStep {
  kind: 'flashcards';
  title: T;
  cards: { fr: string; tr: Gloss; ex?: string }[];
}

export interface ConjugateStep {
  kind: 'conjugate';
  prompt: T;
  verb: string;
  tense: T;
  /** [pronoun, answer]. */
  forms: [string, string][];
  /** Rows already filled in, as a model. */
  given?: number[];
  explain?: T;
}

export interface HotspotStep {
  kind: 'hotspot';
  prompt: T;
  image: string;
  /** x / y in % of the picture. */
  spots: { x: number; y: number; fr: string; tr: Gloss }[];
}

export interface WriteStep {
  kind: 'write';
  prompt: T;
  /** The task as an exam would print it. */
  task?: T;
  min: number;
  max: number;
  checklist: T[];
  phrases?: string[];
  model: string;
  modelNote?: T;
}

export type Step =
  | ConceptStep | McqStep | FillStep | OrderStep | MatchStep | CategorizeStep
  | DictationStep | SpeakStep | DialogueStep | FlashcardsStep | ConjugateStep | HotspotStep | WriteStep;

export type StepKind = Step['kind'];

/** Steps that are scored. */
export const GRADED: StepKind[] = ['mcq', 'fill', 'order', 'match', 'categorize', 'dictation', 'conjugate', 'hotspot'];
export const isGraded = (s: Step) => GRADED.includes(s.kind) || (s.kind === 'dialogue' && s.lines.some(l => 'choose' in l));

// ── Lessons, courses, categories ───────────────────────────────────────────

export interface Lesson {
  id: string;
  slug: Record<Lang, string>;
  title: T;
  /** One or two sentences: the meta description and the syllabus line. */
  summary: T;
  objectives: T[];
  minutes: number;
  steps: Step[];
  /** In a levelled course (CourseMeta.ladder), the CEFR level this lesson teaches. */
  level?: Level;
  /** The lesson in a few lines, printed under the player (revision + search engines). */
  notes: { points: T[]; vocab?: [string, Gloss][] };
}

export interface CourseMeta {
  id: string;
  category: CategoryId;
  slug: Record<Lang, string>;
  title: T;
  subtitle: T;
  /** As displayed: "A1", "A2 → B1", "A1 → C1". */
  level: string;
  levels: Level[];
  image: string;
  /** A paragraph for the course page and search engines. */
  description: T;
  outcomes: T[];
  /** How the demo request is labelled when it comes from this course. */
  offer?: string;
  popular?: boolean;
  /**
   * A levelled course: one lesson per CEFR level (A1 → C2), an adaptive test
   * that places the learner, and each level unlocked by 70 % at the one below.
   */
  ladder?: boolean;
  /** Lesson count and minutes, so lists do not need the lessons themselves. */
  lessonCount: number;
  minutes: number;
}

export interface CategoryMeta {
  id: CategoryId;
  slug: Record<Lang, string>;
  name: T;
  tag: T;
  tagline: T;
  description: T;
  image: string;
  /** A public page of the site that sells the matching course (internal link). */
  topic?: 'tcf-canada' | 'tef-canada' | 'quebec' | 'delf-dalf' | 'online' | 'business' | 'kids';
}

export const tx = (t: T | undefined, lang: Lang): string => (t === undefined ? '' : typeof t === 'string' ? t : t[lang]);
/** Glosses: a plain string is English only. */
export const gloss = (g: Gloss | undefined, lang: Lang): string => (g === undefined ? '' : typeof g === 'string' ? (lang === 'en' ? g : '') : g[lang]);
/** Bilingual text, terse to write in content files. */
export const b = (en: string, fr: string): { en: string; fr: string } => ({ en, fr });
