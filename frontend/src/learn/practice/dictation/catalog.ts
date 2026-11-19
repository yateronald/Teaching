// Catalog of interactive French dictations (/learn/practice/dictation/).
// 36 coherent French narrative & editorial dictations across A1–B2
// (6 A1 + 10 A2 + 10 B1 + 10 B2), each recorded in ONE continuous studio take
// in BOTH native voices (Claire · woman & Thomas · man).
import type { Lang } from '../../types';
import { skillById, skillPath } from '../meta';
import { A1_DICTATIONS } from './dataA1';
import { A2_DICTATIONS } from './dataA2';
import { B1_DICTATIONS } from './dataB1';
import { B2_DICTATIONS } from './dataB2';
import type { DictationCourse } from './types';

export const DICTATIONS: DictationCourse[] = [
  ...A1_DICTATIONS,
  ...A2_DICTATIONS,
  ...B1_DICTATIONS,
  ...B2_DICTATIONS,
];

export const dictationById = (id: string) => DICTATIONS.find(d => d.id === id);
export const dictationPath = (lang: Lang) => skillPath(skillById('dictation'), lang);
export const dictationCoursePath = (d: DictationCourse, lang: Lang) => `${dictationPath(lang)}${d.slug}/`;
