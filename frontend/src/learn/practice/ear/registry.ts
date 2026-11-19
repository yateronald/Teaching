// The ear-training courses, one module each (courses/<id>.ts, default export).
// In the browser a course is downloaded when it is opened; the build-time
// pre-render registers them all up front (ssr.ts). Same pattern as the reading
// texts (practice/registry.ts), so the free-courses bundle does not grow.
import { useEffect, useState } from 'react';
import type { EarCourse } from './types';

type CourseModule = { default: EarCourse };
const loaders = import.meta.glob<CourseModule>('./courses/*.ts');
const cache = new Map<string, EarCourse>();
const pending = new Map<string, Promise<EarCourse | null>>();

export const registerEar = (c: EarCourse) => { cache.set(c.id, c); };

export function loadEar(id: string): Promise<EarCourse | null> {
  const hit = cache.get(id);
  if (hit) return Promise.resolve(hit);
  let p = pending.get(id);
  if (!p) {
    const loader = loaders[`./courses/${id}.ts`];
    p = loader ? loader().then(m => { cache.set(id, m.default); return m.default; }) : Promise.resolve(null);
    pending.set(id, p);
  }
  return p;
}

/** A course: immediately when already loaded (pre-render, hydration), else after download. */
export function useEar(id: string): EarCourse | null {
  const [course, setCourse] = useState<EarCourse | null>(() => cache.get(id) ?? null);
  useEffect(() => {
    let live = true;
    if (!course || course.id !== id) loadEar(id).then(c => { if (live) setCourse(c); });
    return () => { live = false; };
  }, [id, course]);
  return course && course.id === id ? course : null;
}
