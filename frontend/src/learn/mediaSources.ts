// Every picture and every French phrase the free courses use, for the media
// generator (scripts/learn-media.mjs). Not imported by the site itself.
import { NO_AUDIO, audioKey, normalizeForAudio } from './audio';
import { CATEGORIES } from './categories';
import { COURSES } from './catalog';
import { PLACEMENT } from './content/placement';
import { CAST, EPISODES, playerLines } from './games/story';
import { DAILY_WORDS, GENDER_NOUNS, PAIR_DECKS, numberCall, withArticle } from './games/words';
import type { Lesson, Step, Voice } from './types';

const modules = import.meta.glob<{ default: Lesson[] }>('./content/courses/*.ts', { eager: true });

export interface AudioItem { key: string; text: string; voice: Voice }

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
  const add = (text: string, voice: Voice = 'f') => {
    const t = normalizeForAudio(text);
    if (!t || NO_AUDIO.has(t)) return;
    const key = audioKey(t, voice);
    if (!audio.has(key)) audio.set(key, { key, text: t, voice });
  };
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
  return { audio: [...audio.values()], images: [...images] };
}
