// Every picture and every French phrase the free courses use, for the media
// generator (scripts/learn-media.mjs). Not imported by the site itself.
import { NO_AUDIO, audioKey, normalizeForAudio } from './audio';
import { CATEGORIES } from './categories';
import { COURSES } from './catalog';
import { PLACEMENT } from './content/placement';
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
    case 'match': s.pairs.forEach(p => add(p[0])); break;
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
  return { audio: [...audio.values()], images: [...images] };
}
