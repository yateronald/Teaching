// Which lessons and exercises each kind of visitor may open:
//   visitor  (no account)  the first module of the A1 path ("Complete")
//   free     (an account)  the first module of every path
//   premium                everything else
// The lists are computed from the study paths at each build
// (scripts/learn-pack.mjs) and swapped in for access-map.json by the build
// (scripts/vite-learn-access.mjs). The committed file only says "not
// generated": everything is open, for the QA scripts and a dev server started
// without the pack. The server checks again before sending any locked lesson.
import MAP from './access-map.json';
import type { Lesson, Level } from '../types';

export type Tier = 'visitor' | 'free' | 'premium';
export type AccessLevel = Tier;

interface Lists { courses: string[]; ladders: Record<string, string[]>; items: string[] }
interface AccessMap { generated: boolean; visitor?: Lists; free?: Lists }

const map = MAP as AccessMap;
/** False when the lists were not generated (everything is open). */
export const ACCESS_GENERATED = !!map.generated;

const toSets = (l?: Lists) => ({
  courses: new Set(l?.courses ?? []),
  ladders: new Map(Object.entries(l?.ladders ?? {}).map(([k, v]) => [k, new Set(v)])),
  items: new Set(l?.items ?? []),
});
const VISITOR = toSets(map.visitor);
const FREE = toSets(map.free);

const RANK: Record<Tier, number> = { visitor: 0, free: 1, premium: 2 };
/** True when someone at `level` may open something of `tier`. */
export const canOpen = (level: AccessLevel, tier: Tier) => RANK[level] >= RANK[tier];

/** The tier of one lesson of a course (levelled courses open level by level). */
export function lessonTier(courseId: string, lesson: Pick<Lesson, 'level'> | { level?: Level }): Tier {
  if (!ACCESS_GENERATED) return 'visitor';
  if (VISITOR.courses.has(courseId) || (lesson.level && VISITOR.ladders.get(courseId)?.has(lesson.level))) return 'visitor';
  if (FREE.courses.has(courseId) || (lesson.level && FREE.ladders.get(courseId)?.has(lesson.level))) return 'free';
  return 'premium';
}

/** The lowest tier of a course: what someone needs to open at least part of it. */
export function courseTier(courseId: string): Tier {
  if (!ACCESS_GENERATED) return 'visitor';
  if (VISITOR.courses.has(courseId) || VISITOR.ladders.has(courseId)) return 'visitor';
  if (FREE.courses.has(courseId) || FREE.ladders.has(courseId)) return 'free';
  return 'premium';
}

/** The tier of a practice item or game: "dialogue:<id>", "text:<id>", "ear:<id>", "doc:<id>", "dictation:<id>", "mission:<id>", "game:<id>". */
export function itemTier(key: string): Tier {
  if (!ACCESS_GENERATED) return 'visitor';
  if (VISITOR.items.has(key)) return 'visitor';
  if (FREE.items.has(key)) return 'free';
  return 'premium';
}
