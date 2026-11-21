// Compact builders for the course modules added by path (catalogExtra.ts):
// the same Step and Lesson objects as the first courses, written in fewer
// characters. The right option always comes first: options are shuffled on
// screen. A gloss (`tr`) is the English translation of the French.
import { b } from '../types';
import type {
  CategorizeStep, ConceptStep, ConjugateStep, DialogueStep, DictationStep, Doc, FillStep, FlashcardsStep,
  Gloss, Lesson, MatchStep, McqStep, OrderStep, SpeakStep, Step, T, Voice, WriteStep,
} from '../types';

export { b };

/** The usual instructions. */
export const P = {
  choose: b('Choose the right answer.', 'Choisissez la bonne réponse.'),
  word: b('Choose the right word.', 'Choisissez le bon mot.'),
  form: b('Choose the right form.', 'Choisissez la bonne forme.'),
  spelling: b('Choose the right spelling.', 'Choisissez la bonne orthographe.'),
  complete: b('Complete the sentence.', 'Complétez la phrase.'),
  completeText: b('Complete the text.', 'Complétez le texte.'),
  order: b('Put the words in order.', 'Remettez les mots dans l’ordre.'),
  match: b('Match each French phrase with its meaning.', 'Associez chaque phrase française à son sens.'),
  sort: b('Sort the expressions.', 'Classez les expressions.'),
  dictation: b('Write what you hear.', 'Écrivez ce que vous entendez.'),
  speak: b('Say it aloud.', 'Dites-le à voix haute.'),
  listen: b('Listen, then answer.', 'Écoutez, puis répondez.'),
  read: b('Read, then answer.', 'Lisez, puis répondez.'),
  best: b('Which answer fits best?', 'Quelle réponse convient le mieux ?'),
  meaning: b('What does it mean?', 'Qu’est-ce que cela veut dire ?'),
};

type Ex = [fr: string, tr?: Gloss];
interface CardMore { variant?: ConceptStep['variant']; ex?: Ex[]; points?: T[]; table?: ConceptStep['table']; image?: string }

/** A lesson card: title, body (**bold** allowed) and options (variant, examples, points, table). */
export const card = (title: T, body: T, m: CardMore = {}): ConceptStep => ({
  kind: 'concept', title, body,
  ...(m.variant ? { variant: m.variant } : {}),
  ...(m.ex ? { examples: m.ex.map(([fr, tr]) => (tr ? { fr, tr } : { fr })) } : {}),
  ...(m.points ? { points: m.points } : {}),
  ...(m.table ? { table: m.table } : {}),
  ...(m.image ? { image: m.image } : {}),
});
export const tip = (title: T, body: T, m: CardMore = {}) => card(title, body, { ...m, variant: 'tip' });
export const culture = (title: T, body: T, m: CardMore = {}) => card(title, body, { ...m, variant: 'culture' });
export const trap = (title: T, body: T, m: CardMore = {}) => card(title, body, { ...m, variant: 'trap' });
export const exam = (title: T, body: T, m: CardMore = {}) => card(title, body, { ...m, variant: 'exam' });

interface McqMore { fr?: string; explain?: T; audio?: string; listen?: boolean; voice?: Voice; doc?: Doc; image?: string; timer?: number; fixedOrder?: boolean }
/** A multiple-choice question; the first option is the right one. */
export const mc = (prompt: T, options: T[], m: McqMore = {}): McqStep => ({ kind: 'mcq', prompt, options, answer: 0, ...m });
/** A listening question: the French is heard, not shown. */
export const hear = (audio: string, prompt: T, options: T[], m: Omit<McqMore, 'audio' | 'listen'> = {}): McqStep =>
  ({ kind: 'mcq', prompt, options, answer: 0, audio, listen: true, ...m });
/** A reading question on a document. */
export const doc = (d: Doc, prompt: T, options: T[], m: Omit<McqMore, 'doc'> = {}): McqStep =>
  ({ kind: 'mcq', prompt, options, answer: 0, doc: d, ...m });

interface FillMore { tr?: Gloss; hint?: T; explain?: T; strict?: boolean; choices?: string[][] }
/** A gap fill: each ___ in `text` is a blank; an answer is one string or several accepted ones. */
export const gap = (prompt: T, text: string, answers: (string | string[])[], m: FillMore = {}): FillStep =>
  ({ kind: 'fill', prompt, text, answers: answers.map(a => (Array.isArray(a) ? a : [a])), ...m });

/** A sentence to rebuild; words are split on single spaces (keep « ? », « ! » as their own word). */
export const ord = (prompt: T, sentence: string, m: { tr?: Gloss; extra?: string[]; alt?: string[]; explain?: T } = {}): OrderStep => ({
  kind: 'order', prompt, words: sentence.split(' '),
  ...(m.tr ? { tr: m.tr } : {}), ...(m.extra ? { extra: m.extra } : {}), ...(m.explain ? { explain: m.explain } : {}),
  ...(m.alt ? { alt: m.alt.map(a => a.split(' ')) } : {}),
});

/** French ↔ meaning pairs (both French: frBoth). */
export const pairs = (prompt: T, list: [string, T][], frBoth = false): MatchStep =>
  ({ kind: 'match', prompt, pairs: list, ...(frBoth ? { frBoth } : {}) });

/** Items to put in buckets: [text, bucket index]. */
export const sort = (prompt: T, buckets: T[], items: [string, number][], m: { listen?: boolean; explain?: T } = {}): CategorizeStep =>
  ({ kind: 'categorize', prompt, buckets, items: items.map(([text, bucket]) => ({ text, bucket })), ...m });

export const dict = (text: string, m: { voice?: Voice; hint?: T; strict?: boolean; prompt?: T } = {}): DictationStep =>
  ({ kind: 'dictation', prompt: m.prompt ?? P.dictation, text, voice: m.voice ?? 'f', ...(m.hint ? { hint: m.hint } : {}), ...(m.strict ? { strict: true } : {}) });

export const say = (text: string, tr?: Gloss, m: { tip?: T; prompt?: T } = {}): SpeakStep =>
  ({ kind: 'speak', prompt: m.prompt ?? P.speak, text, ...(tr ? { tr } : {}), ...(m.tip ? { tip: m.tip } : {}) });

type Line = [s: number, fr: string, tr?: Gloss] | [s: number, choose: { options: string[]; explain?: T }];
/** A dialogue: speakers as [name, voice]; the first speaker is on the left. A choice's first option is right. */
export const dlg = (title: T, scene: T | undefined, speakers: [string, Voice][], lines: Line[], call = false): DialogueStep => ({
  kind: 'dialogue', title, ...(scene ? { scene } : {}),
  speakers: speakers.map(([name, voice], i) => ({ name, voice, side: i === 0 ? 'l' : 'r' })),
  lines: lines.map(l => (typeof l[1] === 'string'
    ? { s: l[0], fr: l[1], ...(l[2] ? { tr: l[2] } : {}) }
    : { s: l[0], choose: { options: l[1].options, answer: 0, ...(l[1].explain ? { explain: l[1].explain } : {}) } })),
  ...(call ? { call } : {}),
});

export const flash = (title: T, cards: [fr: string, tr: Gloss][]): FlashcardsStep =>
  ({ kind: 'flashcards', title, cards: cards.map(([fr, tr]) => ({ fr, tr })) });

export const conj = (verb: string, tense: T, forms: [string, string][], m: { given?: number[]; explain?: T; prompt?: T } = {}): ConjugateStep =>
  ({ kind: 'conjugate', prompt: m.prompt ?? b('Conjugate the verb.', 'Conjuguez le verbe.'), verb, tense, forms, ...(m.given ? { given: m.given } : {}), ...(m.explain ? { explain: m.explain } : {}) });

export const write = (prompt: T, task: T, min: number, max: number, checklist: T[], model: string, m: { phrases?: string[]; modelNote?: T } = {}): WriteStep =>
  ({ kind: 'write', prompt, task, min, max, checklist, model, ...m });

/** A lesson of course `course`, number `n` (1-based). */
export const lesson = (
  course: string, n: number,
  slug: [en: string, fr: string], title: T, summary: T, objectives: T[], minutes: number,
  steps: Step[],
  points: T[], vocab: [string, Gloss][] = [],
): Lesson => ({
  id: `${course}-${n}`, slug: { en: slug[0], fr: slug[1] }, title, summary, objectives, minutes, steps,
  notes: { points, ...(vocab.length ? { vocab } : {}) },
});
