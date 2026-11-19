// Catalog of interactive French dictations (/learn/practice/dictation/).
// 86 coherent French narrative, grammatical, homophone-duel & exam-condition dictations
// across ALL 6 CEFR levels (12 A1 + 16 A2 + 18 B1 + 20 B2 + 10 C1 + 10 C2),
// each recorded in ONE continuous studio take in BOTH native voices (Claire & Thomas).
import type { Lang } from '../../types';
import { skillById, skillPath } from '../meta';
import { A1_DICTATIONS } from './dataA1';
import { A1_EXTRA_DICTATIONS } from './dataA1Extra';
import { A2_DICTATIONS } from './dataA2';
import { A2_EXTRA_DICTATIONS } from './dataA2Extra';
import { B1_DICTATIONS } from './dataB1';
import { B1_EXTRA_DICTATIONS } from './dataB1Extra';
import { B2_DICTATIONS } from './dataB2';
import { B2_EXTRA_DICTATIONS } from './dataB2Extra';
import { C1_DICTATIONS } from './dataC1';
import { C2_DICTATIONS } from './dataC2';
import type { DictationCourse } from './types';

export const DICTATIONS: DictationCourse[] = [
  ...A1_DICTATIONS,
  ...A1_EXTRA_DICTATIONS,
  ...A2_DICTATIONS,
  ...A2_EXTRA_DICTATIONS,
  ...B1_DICTATIONS,
  ...B1_EXTRA_DICTATIONS,
  ...B2_DICTATIONS,
  ...B2_EXTRA_DICTATIONS,
  ...C1_DICTATIONS,
  ...C2_DICTATIONS,
];

export const dictationById = (id: string) => DICTATIONS.find(d => d.id === id);
export const dictationPath = (lang: Lang) => skillPath(skillById('dictation'), lang);
export const dictationCoursePath = (d: DictationCourse, lang: Lang) => `${dictationPath(lang)}${d.slug}/`;
