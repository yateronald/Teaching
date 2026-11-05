import { useEffect, useState } from 'react';
import { getLessons, loadLessons } from './content/registry';
import type { Lesson } from './types';

/** A course's lessons: immediately when already loaded (pre-render, hydration), else after download. */
export function useLessons(courseId: string): Lesson[] | null {
  const [lessons, setLessons] = useState<Lesson[] | null>(() => getLessons(courseId) ?? null);
  useEffect(() => {
    const hit = getLessons(courseId);
    if (hit) { setLessons(hit); return; }
    let alive = true;
    loadLessons(courseId).then(l => { if (alive) setLessons(l); });
    return () => { alive = false; };
  }, [courseId]);
  return lessons;
}
