import { useEffect, useState } from 'react';
import { courseAbout } from './catalog';
import { getAbout, getLessons, hasCourseContent, loadLessons } from './content/registry';
import type { CourseAbout, CourseMeta, Lesson } from './types';

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

/**
 * A course's description and outcomes. Newer courses keep them in their own
 * module, so this downloads it when needed and re-renders once it is there.
 */
export function useCourseAbout(course: CourseMeta | undefined): CourseAbout | undefined {
  const id = course?.id;
  const needsModule = !!course && !course.outcomes && hasCourseContent(course.id);
  const [, setLoaded] = useState(0);
  useEffect(() => {
    if (!id || !needsModule || getAbout(id)) return;
    let alive = true;
    loadLessons(id).then(() => { if (alive) setLoaded(n => n + 1); }, () => {});
    return () => { alive = false; };
  }, [id, needsModule]);
  return course ? courseAbout(course) : undefined;
}
