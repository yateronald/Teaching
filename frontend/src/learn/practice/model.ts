// Reading a text: its sentences in order, where a word or an answer sits in
// it, and the checks the build runs on every text (ssr.ts).
import type { Lang, Level } from '../types';
import type { Narration, NarrationId, ReadingText, TextGenre, TextMeta } from './types';

// ── What the voice says around the text ──
// The recording does not start cold on the first sentence: the narrator greets
// the learner, says what they are going to study and its level, reads the
// title and announces the start; at the end, a short line sends them to the
// questions. The text itself is then read word for word.

const LEVEL_SAID: Record<Level, string> = { A1: 'A un', A2: 'A deux', B1: 'B un', B2: 'B deux', C1: 'C un', C2: 'C deux' };
const GENRE_SAID: Record<TextGenre, string> = {
  portrait: 'un court texte', story: 'une petite histoire', dialogue: 'un dialogue', email: 'un courriel', article: 'un article', notice: 'un message',
  postcard: 'une carte postale', ad: 'une offre d’emploi', recipe: 'une recette', interview: 'une interview',
  forum: 'une discussion sur un forum', letter: 'une lettre', column: 'une chronique',
};
/** « Le marchand » becomes « le marchand » inside a sentence. */
const inSentence = (name: string) => (/^(Le|La|Les|L’)(\s|$)/.test(name) || name.startsWith('L’') ? name.charAt(0).toLowerCase() + name.slice(1) : name);

/**
 * The narrator’s opening is split so the title has its own playback cue.
 * `k` (the text’s place in the list) varies the closing line.
 */
export function spokenFrame(meta: TextMeta, text: ReadingText, k: number) {
  // A dialogue names its two speakers; an interview or a forum keeps its genre.
  const what = meta.genre === 'dialogue' && text.speakers && text.speakers.length === 2
    ? `un dialogue entre ${inSentence(text.speakers[0].name)} et ${inSentence(text.speakers[1].name)}`
    : GENRE_SAID[meta.genre];
  const level = LEVEL_SAID[meta.level];
  const greeting = `Bonjour ! Aujourd’hui, nous allons lire ${what}, de niveau ${level}. Voici le titre.`;
  const title = /[.?!]$/.test(meta.title) ? meta.title : `${meta.title}.`;
  const cue = 'Commençons.';
  const outros = [
    'C’est la fin du texte. À vous maintenant : répondez aux questions !',
    'Voilà, le texte est terminé. Maintenant, répondez aux questions pour vérifier ce que vous avez compris.',
    'Fin du texte. Merci pour votre écoute, et passons maintenant aux questions !',
  ];
  return { greeting, title, cue, outro: outros[k % outros.length] };
}

/** Untimed legacy audio stays unhighlighted until its title can be aligned. */
export function isSpokenTitle(narration: Narration | undefined, time: number): boolean {
  const span = narration?.title;
  return !!span && time >= span[0] && time < span[1];
}

export interface FlatSentence { i: number; p: number; fr: string; en: string }

/** Every sentence of the text, numbered from 0 in reading order. */
export function sentencesOf(t: ReadingText): FlatSentence[] {
  const out: FlatSentence[] = [];
  t.paras.forEach((para, p) => para.s.forEach(([fr, en]) => out.push({ i: out.length, p, fr, en })));
  return out;
}

const countWords = (s: string) => s.split(/\s+/).filter(w => /[\p{L}\p{N}]/u.test(w)).length;
export const wordCount = (t: ReadingText) => sentencesOf(t).reduce((n, s) => n + countWords(s.fr), 0);

const isWordChar = (ch: string | undefined) => !!ch && /[\p{L}\p{N}]/u.test(ch);

/** Index of `needle` in `hay` as whole words (« frais » is not found in « fraises »). */
export function findPhrase(hay: string, needle: string, from = 0): number {
  if (!needle) return -1;
  let at = hay.indexOf(needle, from);
  while (at >= 0) {
    const okStart = !isWordChar(needle[0]) || !isWordChar(hay[at - 1]);
    const okEnd = !isWordChar(needle[needle.length - 1]) || !isWordChar(hay[at + needle.length]);
    if (okStart && okEnd) return at;
    at = hay.indexOf(needle, at + 1);
  }
  return -1;
}

export interface Span { i: number; start: number; end: number }

/** The first place a phrase appears in the text. */
export function locate(sentences: FlatSentence[], phrase: string): Span | null {
  for (const s of sentences) {
    const at = findPhrase(s.fr, phrase);
    if (at >= 0) return { i: s.i, start: at, end: at + phrase.length };
  }
  return null;
}

export const evidenceOf = (q: { evidence: string | string[] }) => (Array.isArray(q.evidence) ? q.evidence : [q.evidence]);

/** Which recordings a text has: both readers, and the two-voice version of a dialogue. */
export const narrationsOf = (t: ReadingText): NarrationId[] => (t.speakers ? ['d', 'f', 'm'] : ['f', 'm']);

/** The voice of each paragraph in a recording (the dialogue version follows the speakers). */
export function paraVoice(t: ReadingText, p: number, n: NarrationId): 'f' | 'm' {
  if (n !== 'd') return n;
  const who = t.paras[p].who;
  return who !== undefined && t.speakers ? t.speakers[who].voice : 'f';
}

/** The build refuses nothing, but it says what does not add up (ssr.ts warnings). */
export function checkText(meta: TextMeta, t: ReadingText): string[] {
  const w: string[] = [];
  const at = `text ${meta.id}`;
  const sentences = sentencesOf(t);
  const words = wordCount(t);
  if (words !== meta.words) w.push(`${at}: ${words} words, meta.ts says ${meta.words}`);
  if (t.questions.length !== meta.questions) w.push(`${at}: ${t.questions.length} questions, meta.ts says ${meta.questions}`);
  if (meta.genre === 'dialogue' && !t.speakers) w.push(`${at}: a dialogue needs speakers`);
  t.paras.forEach((p, i) => {
    if (!p.s.length) w.push(`${at}: paragraph ${i + 1} is empty`);
    if (t.speakers && (p.who === undefined || !t.speakers[p.who])) w.push(`${at}: line ${i + 1} has no speaker`);
    p.s.forEach(([fr, en]) => { if (!fr.trim() || !en.trim()) w.push(`${at}: a sentence or its translation is empty in paragraph ${i + 1}`); });
  });
  t.glossary.forEach(g => { if (!locate(sentences, g.fr)) w.push(`${at}: glossary « ${g.fr} » is not in the text`); });
  t.questions.forEach((q, n) => {
    if (q.answer < 0 || q.answer >= q.options.length) w.push(`${at}: question ${n + 1} has no valid answer`);
    evidenceOf(q).forEach(e => { if (!locate(sentences, e)) w.push(`${at}: question ${n + 1}, evidence « ${e} » is not in the text`); });
  });
  return w;
}

/** “5 min”, “175 words”: small formatting shared by the pages. */
export const fmtTime = (s: number) => {
  const t = Math.max(0, Math.floor(s));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
};

export const pct = (x: number, lang: Lang) => (lang === 'fr' ? `${Math.round(x * 100)} %` : `${Math.round(x * 100)}%`);
