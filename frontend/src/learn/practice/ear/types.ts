// Ear training (Practice › Listening › Entraîner son oreille): short courses
// that train the decoding of spoken French, one phenomenon at a time (the
// liaison, numbers, intonation, the silent plural, u / ou, nasal vowels,
// tenses, homophones, shortened speech, discourse markers).
//
// A course runs in four steps: discover the phenomenon (examples heard at
// normal speed and slowed down), tell apart near-identical sentences, write
// the missing word, then understand it in context at natural speed.
//
// Transcripts (`show`) use a small markup: {x} the key sound or word,
// ~x~ letters or words not pronounced, ‿ a liaison or a linking, ↗ ↘ the
// melody; [x] is left as is (phonetics). The recordings read `say`, never `show`.
import type { Level, T, Voice } from '../../types';

export type EarVoice = Extract<Voice, 'f' | 'm'>;
export type EarStep = 'pick' | 'fill' | 'situation';

/** A sound to discover: `natural` is the same sentence in everyday speech (recorded too). */
export interface EarExample { say: string; natural?: string; show: string; note: T; voice: EarVoice }

interface ItemBase { say: string; voice: EarVoice; show: string; explain: T }
/** Hear one sentence, pick which of near-identical options was said (or what it means). */
export interface EarPick extends ItemBase { kind: 'pick'; options: string[]; answer: number; q?: T }
/** Hear one sentence, type the missing word (`gap` holds ___). */
export interface EarFill extends ItemBase { kind: 'fill'; gap: string; answers: string[] }
/** A realistic utterance at natural speed, with one question in French. */
export interface EarSituation extends ItemBase { kind: 'situation'; q: string; options: string[]; answer: number }
export type EarItem = EarPick | EarFill | EarSituation;

/** The content of a course (practice/ear/courses/<id>.ts), downloaded when it is opened. */
export interface EarCourse {
  id: string;
  rule: { title: T; body: T };
  goal: T;
  examples: EarExample[];
  items: EarItem[];
  takeaway: T;
}

/** What the library needs, without the content. */
export interface EarMeta {
  id: string;
  level: Extract<Level, 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'>;
  title: string;
  /** The phenomenon trained, in a few words. */
  tag: T;
  /** Shown large on the card: the phenomenon itself (e.g. « ils‿ont »). */
  sample: string;
  summary: T;
  minutes: number;
  /** Checked against the content at build time (ssr.ts). */
  items: number;
}
