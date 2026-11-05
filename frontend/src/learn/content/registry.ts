// The lessons of each course, one module per course (courses/<course-id>.ts,
// default export: Lesson[]). In the browser a course is downloaded when it is
// opened; the build-time pre-render registers them all up front (ssr.ts).
import type { Lesson } from '../types';
import type { PlacementQuestion } from './placement';

type CourseModule = { default: Lesson[] };
const loaders = import.meta.glob<CourseModule>('./courses/*.ts');
const cache = new Map<string, Lesson[]>();
const pending = new Map<string, Promise<Lesson[]>>();

export const getLessons = (courseId: string): Lesson[] | undefined => cache.get(courseId);
export const registerLessons = (courseId: string, lessons: Lesson[]) => { cache.set(courseId, lessons); };
export const hasCourseContent = (courseId: string) => cache.has(courseId) || `./courses/${courseId}.ts` in loaders;

export function loadLessons(courseId: string): Promise<Lesson[]> {
  const hit = cache.get(courseId);
  if (hit) return Promise.resolve(hit);
  let p = pending.get(courseId);
  if (!p) {
    const loader = loaders[`./courses/${courseId}.ts`];
    p = loader
      ? loader().then(m => { cache.set(courseId, m.default); return m.default; })
      : Promise.resolve([]);
    pending.set(courseId, p);
  }
  return p;
}

// ── Placement test ──
let placement: PlacementQuestion[] | undefined;
export const getPlacement = () => placement;
export const registerPlacement = (q: PlacementQuestion[]) => { placement = q; };
export const loadPlacement = () => (placement
  ? Promise.resolve(placement)
  : import('./placement').then(m => { placement = m.PLACEMENT; return placement; }));
