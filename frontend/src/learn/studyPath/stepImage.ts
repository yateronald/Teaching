// The picture of a study-path step, for the roadmap thumbnails: the course,
// dialogue, listening document, text or mission it opens. Ear exercises and
// games have none (the roadmap shows their icon instead).
import { courseById } from '../catalog';
import { TEXTS } from '../practice/meta';
import { DICTATIONS } from '../practice/dictation/catalog';
import type { StudyStep } from './types';

export function stepImage(step: StudyStep): string | null {
  const s = step.source;
  switch (s.type) {
    case 'course':
    case 'ladder':
      return courseById(s.id)?.image ?? null;
    case 'dialogue':
      return `dialogue-${s.id}`;
    case 'doc':
      return `listen-${s.id}`;
    case 'mission':
      return `mission-${s.id}`;
    case 'text':
      return TEXTS.find(t => t.id === s.id)?.image ?? null;
    case 'dictation':
      return DICTATIONS.find(d => d.id === s.id)?.image ?? null;
    default:
      return null;
  }
}
