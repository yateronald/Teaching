// Catalog of interactive French dictations (/learn/practice/dictation/).
// 186 coherent French narrative, homophone-duel, grammatical & exam-condition dictations
// across ALL 6 CEFR levels (30 A1 + 32 A2 + 34 B1 + 36 B2 + 27 C1 + 27 C2),
// each recorded in ONE continuous studio take in BOTH native voices (Claire & Thomas).
import type { Lang } from '../../types';
import { skillById, skillPath } from '../meta';
import { A1_DICTATIONS } from './dataA1';
import { A1_EXTRA_DICTATIONS } from './dataA1Extra';
import { A1_BATCH3_DICTATIONS } from './dataA1Batch3';
import { A2_DICTATIONS } from './dataA2';
import { A2_EXTRA_DICTATIONS } from './dataA2Extra';
import { A2_BATCH3_DICTATIONS } from './dataA2Batch3';
import { B1_DICTATIONS } from './dataB1';
import { B1_EXTRA_DICTATIONS } from './dataB1Extra';
import { B1_BATCH3_DICTATIONS } from './dataB1Batch3';
import { B2_DICTATIONS } from './dataB2';
import { B2_EXTRA_DICTATIONS } from './dataB2Extra';
import { B2_BATCH3_DICTATIONS } from './dataB2Batch3';
import { C1_DICTATIONS } from './dataC1';
import { C1_BATCH3_DICTATIONS } from './dataC1Batch3';
import { C2_DICTATIONS } from './dataC2';
import { C2_BATCH3_DICTATIONS } from './dataC2Batch3';
import type { DictationCourse } from './types';

export const DICTATIONS: DictationCourse[] = [
  ...A1_DICTATIONS,
  ...A1_EXTRA_DICTATIONS,
  ...A1_BATCH3_DICTATIONS,
  ...A2_DICTATIONS,
  ...A2_EXTRA_DICTATIONS,
  ...A2_BATCH3_DICTATIONS,
  ...B1_DICTATIONS,
  ...B1_EXTRA_DICTATIONS,
  ...B1_BATCH3_DICTATIONS,
  ...B2_DICTATIONS,
  ...B2_EXTRA_DICTATIONS,
  ...B2_BATCH3_DICTATIONS,
  ...C1_DICTATIONS,
  ...C1_BATCH3_DICTATIONS,
  ...C2_DICTATIONS,
  ...C2_BATCH3_DICTATIONS,
];

export const dictationById = (id: string) => DICTATIONS.find(d => d.id === id);
export const dictationPath = (lang: Lang) => skillPath(skillById('dictation'), lang);
export const dictationCoursePath = (d: DictationCourse, lang: Lang) => `${dictationPath(lang)}${d.slug}/`;
