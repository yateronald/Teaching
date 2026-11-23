// The lessons of each course, one module per course (courses/<course-id>.ts,
// default export: Lesson[]). In the browser a course is downloaded when it is
// opened; the build-time pre-render registers them all up front (ssr.ts).
//
// In the public website, a locked lesson's module holds its outline only
// (title, objectives, `locked`: the tier it needs, no exercise). Once the
// visitor's account may open it, loadFullCourse() asks the API for the full
// lessons, which replace the outlines here; the pages showing them re-render.
import type { CourseAbout, Lesson } from '../types';
import type { PlacementQuestion } from './placement';
import { siteApi, type ApiError } from '../account/api';
import { registerRecordings } from '../audio';
import { addExampleTranslations } from './examples';

type CourseModule = { default: Lesson[]; about?: CourseAbout };
const loaders = import.meta.glob<CourseModule>('./courses/*.ts');
const cache = new Map<string, Lesson[]>();
const abouts = new Map<string, CourseAbout>();
const pending = new Map<string, Promise<Lesson[]>>();

// Pages re-render when a course's lessons change (outline → full lessons).
const listeners = new Set<() => void>();
const changed = () => listeners.forEach(l => l());
export const subscribeLessons = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

export const getLessons = (courseId: string): Lesson[] | undefined => cache.get(courseId);
export const registerLessons = (courseId: string, lessons: Lesson[], about?: CourseAbout) => {
  cache.set(courseId, lessons);
  if (about) abouts.set(courseId, about);
  changed();
};
/** The description and outcomes a course keeps with its lessons (once loaded). */
export const getAbout = (courseId: string): CourseAbout | undefined => abouts.get(courseId);
export const hasCourseContent = (courseId: string) => cache.has(courseId) || `./courses/${courseId}.ts` in loaders;

export function loadLessons(courseId: string): Promise<Lesson[]> {
  const hit = cache.get(courseId);
  if (hit) return Promise.resolve(hit);
  let p = pending.get(courseId);
  if (!p) {
    const loader = loaders[`./courses/${courseId}.ts`];
    p = loader
      ? loader().then(m => { if (!cache.has(courseId)) registerLessons(courseId, m.default, m.about); return cache.get(courseId)!; })
      : Promise.resolve([]);
    pending.set(courseId, p);
  }
  return p;
}

/** True when some lessons of this course are still outlines. */
export const hasLockedLessons = (lessons: Lesson[] | null | undefined) => !!lessons?.some(l => l.locked);

export type FullResult = 'ok' | 'sign-in' | 'premium' | 'error';
const full = new Map<string, Promise<FullResult>>();

/**
 * Replaces this course's outlines by the lessons the visitor's account may
 * open. 'sign-in' / 'premium': the account cannot open them (any longer).
 */
export function loadFullCourse(courseId: string, { retry = false } = {}): Promise<FullResult> {
  const hit = full.get(courseId);
  if (hit && !retry) return hit;
  const p = (async (): Promise<FullResult> => {
    await loadLessons(courseId);
    try {
      const data = await siteApi<{ lessons: Lesson[]; about: CourseAbout | null; audio: { keys: string[]; sealed: string[] }; examples: Record<string, string> }>(
        `/learn/content/courses/${encodeURIComponent(courseId)}`);
      registerRecordings(data.audio?.keys, data.audio?.sealed);
      addExampleTranslations(data.examples);
      const byId = new Map(data.lessons.map(l => [l.id, l]));
      const merged = (cache.get(courseId) ?? []).map(l => byId.get(l.id) ?? l);
      registerLessons(courseId, merged, data.about ?? undefined);
      return 'ok';
    } catch (err) {
      full.delete(courseId);
      const e = err as ApiError;
      if (e.status === 401) return 'sign-in';
      if (e.status === 403) return 'premium';
      return 'error';
    }
  })();
  full.set(courseId, p);
  return p;
}

// ── Placement test ──
let placement: PlacementQuestion[] | undefined;
export const getPlacement = () => placement;
export const registerPlacement = (q: PlacementQuestion[]) => { placement = q; };
export const loadPlacement = () => (placement
  ? Promise.resolve(placement)
  : import('./placement').then(m => { placement = m.PLACEMENT; return placement; }));
