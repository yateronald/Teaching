import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { courseAbout } from './catalog';
import { getAbout, getLessons, hasCourseContent, loadLessons, subscribeLessons } from './content/registry';
import type { CourseAbout, CourseMeta, Lesson } from './types';

/**
 * A course's lessons: immediately when already loaded (pre-render, hydration),
 * else after download. Re-renders when they change (a locked lesson unlocked).
 */
export function useLessons(courseId: string): Lesson[] | null {
  const read = useCallback(() => getLessons(courseId) ?? null, [courseId]);
  const lessons = useSyncExternalStore(subscribeLessons, read, read);
  useEffect(() => {
    if (!getLessons(courseId)) loadLessons(courseId);
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
  const read = useCallback(() => (id ? getAbout(id) : undefined), [id]);
  useSyncExternalStore(subscribeLessons, read, read);
  useEffect(() => {
    if (!id || !needsModule || getAbout(id)) return;
    loadLessons(id).catch(() => {});
  }, [id, needsModule]);
  return course ? courseAbout(course) : undefined;
}
