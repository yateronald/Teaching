import type { Lang } from '../../types';
import { skillPath, skillById } from '../meta';
import { a1Listening } from './a1';
import { a2Listening } from './a2';
import { b1Listening } from './b1';
import { b2Listening } from './b2';
import { a1Listening2, a2Listening2, b1Listening2, b2Listening2 } from './series2';
import type { ListeningExercise } from './types';

/** Easiest first: the library and the “next exercise” link follow this order. */
export const LISTENING = [
  ...a1Listening, ...a1Listening2, ...a2Listening, ...a2Listening2,
  ...b1Listening, ...b1Listening2, ...b2Listening, ...b2Listening2,
];
export const listeningCoverKey = (exercise: ListeningExercise) => `listen-${exercise.id}`;
export const listeningPath = (lang: Lang) => skillPath(skillById('listening'), lang);
export const exercisePath = (exercise: ListeningExercise, lang: Lang) => `${listeningPath(lang)}${exercise.id}/`;
