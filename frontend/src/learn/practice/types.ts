// The practice space of the free courses (/learn/practice/, /fr/apprendre/pratique/):
// one library per skill. Reading comes first: original texts written by our
// teachers, read aloud by a woman and a man, with comprehension questions.
import type { Gloss, Level, T } from '../types';

export type SkillId = 'reading' | 'listening' | 'dictation' | 'grammar' | 'vocabulary';

/** A sentence of a text: the French, and its English translation (English pages, on demand). */
export type Sentence = [fr: string, en: string];

/**
 * A paragraph, or one line of a dialogue (`who` = index of the speaker).
 * `lead` is the bold introduction of an article (le chapeau); `lines` puts
 * each sentence on its own line (the signature of a letter).
 */
export interface Para { s: Sentence[]; who?: number; lead?: boolean; lines?: boolean }

export type TextGenre =
  | 'portrait' | 'story' | 'dialogue' | 'email' | 'article' | 'notice'
  | 'postcard' | 'ad' | 'recipe' | 'interview' | 'forum' | 'letter' | 'column';

export type QuestionSkill = 'global' | 'detail' | 'vocab' | 'inference';

export interface ReadingQuestion {
  /** The question, in French. */
  q: string;
  /** Its English translation, shown on English pages. */
  qEn?: string;
  /** French options, shown in this order (a, b, c, d). */
  options: string[];
  answer: number;
  /**
   * Words of the text that hold the answer, exactly as written: highlighted
   * in the text once the answers are checked (“where to look”).
   */
  evidence: string | string[];
  explain: T;
  skill: QuestionSkill;
}

/** A word or phrase of the text explained on tap: `fr` is written exactly as in the text. */
export interface GlossEntry { fr: string; tr: { en: string; fr: string } }

/** The language point a text illustrates, with examples heard aloud. */
export interface Focus { title: T; body: T; examples: { fr: string; tr?: Gloss }[] }

export interface ReadingText {
  id: string;
  /** A dialogue: who speaks, and with which voice in the two-voice recording. */
  speakers?: { name: string; voice: 'f' | 'm' }[];
  /** An email: its header, shown above the text and not read aloud. */
  email?: { from: string; to: string; subject: string };
  paras: Para[];
  /** Before reading: a question to think about, beside the picture. */
  warmup: T;
  glossary: GlossEntry[];
  questions: ReadingQuestion[];
  focus: Focus;
  /** Set on public build outlines when this text requires an account or Premium. */
  locked?: 'visitor' | 'free' | 'premium';
}

/** What lists, addresses and search engines need, without the text itself. */
export interface TextMeta {
  id: string;
  /** The same address in both languages: the French title. */
  slug: string;
  /** The French title (content: the same on both sides). */
  title: string;
  subtitle: T;
  level: Level;
  genre: TextGenre;
  theme: T;
  /** The language point, in a few words. */
  focus: T;
  /** Picture key (public/learn/img, scripts/learn-images.json). */
  image: string;
  /** Checked against the text at build time (ssr.ts). */
  words: number;
  questions: number;
  /** One of the texts suggested to start with. */
  starter?: boolean;
}

/**
 * The recordings of a text (src/learn/practice/text-audio.json, written by
 * scripts/practice-audio.mjs): `v` content version, `d` duration in seconds,
 * `s` start and end of each sentence, and `title` the spoken title alone.
 */
export interface Narration { v: string; d: number; s: [number, number][]; title?: [number, number] }
/** f: a woman reads, m: a man reads, d: a dialogue with both voices. */
export type NarrationId = 'f' | 'm' | 'd';
