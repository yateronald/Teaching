// Every picture and every French phrase the free courses use, for the media
// generator (scripts/learn-media.mjs). Not imported by the site itself.
import { NO_AUDIO, audioKey, normalizeForAudio } from './audio';
import { CATEGORIES } from './categories';
import { COURSES } from './catalog';
import { PLACEMENT } from './content/placement';
import { CAST, EPISODES, playerLines } from './games/story';
import { DAILY_WORDS, GENDER_NOUNS, PAIR_DECKS, numberCall, withArticle } from './games/words';
import { TEXTS } from './practice/meta';
import { MISSIONS, missionAudio, missionCoverKey, missionVoice } from './practice/missions';
import { LISTENING, listeningCoverKey } from './practice/listening/catalog';
import { c1Listening } from './practice/listening/c1';
import { c2Listening } from './practice/listening/c2';
import { LISTENING_VOICES, passageAudio, questionAudio } from './practice/listening/types';
import type { ReadingText } from './practice/types';
import type { EarCourse } from './practice/ear/types';
import type { Dialogue } from './practice/dialogues/types';
import { DIALOGUES, dialogueCoverKey } from './practice/dialogues/meta';
import { DICTATIONS } from './practice/dictation/catalog';
import { DICTATION_VOICES } from './practice/dictation/types';
import type { Lesson, Step, Voice } from './types';

const modules = import.meta.glob<{ default: Lesson[] }>('./content/courses/*.ts', { eager: true });
const textModules = import.meta.glob<{ default: ReadingText }>('./practice/texts/*.ts', { eager: true });
const earModules = import.meta.glob<{ default: EarCourse }>('./practice/ear/courses/*.ts', { eager: true });
const dialogueModules = import.meta.glob<{ default: Record<string, Dialogue> }>('./practice/dialogues/content/*.ts', { eager: true });

/** `sealed`: a practice recording, stored scrambled (not offered for download, sealedAudio.ts). */
export interface AudioItem { key: string; text: string; voice: Voice; sealed?: boolean }

function stepPhrases(s: Step, add: (text: string, voice?: Voice) => void, image: (k: string) => void) {
  switch (s.kind) {
    case 'concept':
      s.examples?.forEach(e => add(e.fr));
      if (s.image) image(s.image);
      break;
    case 'mcq':
      if (s.audio) add(s.audio, s.voice);
      if (s.image) image(s.image);
      break;
    case 'order': add(s.words.join(' ')); break;
    case 'match': s.pairs.forEach(p => { add(p[0]); if (s.frBoth && typeof p[1] === 'string') add(p[1]); }); break;
    case 'categorize': if (s.listen) s.items.forEach(it => add(it.text)); break;
    case 'dictation': add(s.text, s.voice); break;
    case 'speak': add(s.text); break;
    case 'dialogue':
      s.lines.forEach(l => {
        const voice = s.speakers[l.s].voice;
        if ('choose' in l) add(l.choose.options[l.choose.answer], voice); else add(l.fr, voice);
      });
      break;
    case 'flashcards': s.cards.forEach(c => add(c.fr)); break;
    case 'hotspot': s.spots.forEach(p => add(p.fr)); image(s.image); break;
    default: break;
  }
}

export function collectMedia() {
  const audio = new Map<string, AudioItem>();
  const images = new Set<string>(['hub-hero', 'teacher', 'placement']);
  const add = (text: string, voice: Voice = 'f', sealed = false) => {
    const t = normalizeForAudio(text);
    if (!t || NO_AUDIO.has(t)) return;
    const key = audioKey(t, voice);
    const had = audio.get(key);
    if (!had) audio.set(key, { key, text: t, voice, ...(sealed ? { sealed } : {}) });
    else if (sealed) had.sealed = true;
  };
  const seal = (text: string, voice: Voice) => add(text, voice, true);
  const image = (k: string) => images.add(k);
  CATEGORIES.forEach(c => images.add(c.image));
  COURSES.forEach(c => images.add(c.image));
  for (const mod of Object.values(modules)) {
    for (const lesson of mod.default) {
      lesson.steps.forEach(s => stepPhrases(s, add, image));
      lesson.notes.vocab?.forEach(([fr]) => add(fr));
    }
  }
  PLACEMENT.forEach(q => q.audio && add(q.audio));
  ['un croissant', 'une croissant', 'des croissant'].forEach(t => add(t));

  // ── Games ──
  images.add('games-hero');
  for (const ep of EPISODES) {
    images.add(ep.image);
    for (const bt of ep.beats) {
      if (bt.k === 'scene') images.add(bt.image);
      if (bt.k === 'say' || bt.k === 'listen') add(bt.fr, CAST[bt.who].voice);
    }
    // The learner's lines, in both voices.
    playerLines(ep).forEach(l => { add(l, 'f'); add(l, 'm'); });
  }
  GENDER_NOUNS.forEach(([noun, g]) => add(withArticle(noun, g)));
  for (let n = 0; n <= 100; n++) add(numberCall(n));
  PAIR_DECKS.forEach(d => d.words.forEach(([fr]) => add(fr)));
  DAILY_WORDS.forEach(w => add(w.ex));

  // ── Reading texts: their picture, the words explained and the language-point
  // examples (the texts themselves are read by scripts/practice-audio.mjs). ──
  TEXTS.forEach(t => images.add(t.image));
  MISSIONS.forEach(m => {
    images.add(missionCoverKey(m));
    m.documents.forEach(d => seal(missionAudio(d), missionVoice(d)));
  });
  // Listening: the passage, its excerpts and the questions read aloud are all sealed.
  [...LISTENING.filter(e => !e.lazy), ...c1Listening, ...c2Listening].forEach(e => {
    images.add(listeningCoverKey(e));
    LISTENING_VOICES.forEach(voice => seal(passageAudio(e), voice));
    e.segments.forEach(segment => seal(segment, e.voice));
    e.questions.forEach(question => seal(questionAudio(question), e.voice));
  });
  // Ear training: the examples (careful and everyday forms) and every exercise.
  for (const mod of Object.values(earModules)) {
    mod.default.examples.forEach(e => { seal(e.say, e.voice); if (e.natural) seal(e.natural, e.voice); });
    mod.default.items.forEach(it => seal(it.say, it.voice));
  }
  // Dialogues: a picture each, and every line in its speaker's voice.
  DIALOGUES.forEach(d => images.add(dialogueCoverKey(d)));
  for (const mod of Object.values(dialogueModules)) {
    Object.values(mod.default).forEach(d => d.lines.forEach(l => seal(l.fr, d.speakers[l.who].voice)));
  }
  // Dictations: ONE continuous coherent passage audio + rule examples in BOTH native voices (woman & man).
  DICTATIONS.forEach(d => {
    images.add(d.image);
    DICTATION_VOICES.forEach(v => {
      seal(d.text, v);
      d.rules.forEach(r => r.examples.forEach(ex => seal(ex.fr, v)));
    });
  });
  for (const mod of Object.values(textModules)) {
    mod.default.glossary.forEach(g => add(g.fr));
    mod.default.focus.examples.forEach(e => add(e.fr));
  }
  return { audio: [...audio.values()], images: [...images] };
}
