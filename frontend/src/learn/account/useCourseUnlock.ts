// Unlocks a course's lessons for the signed-in account when it may open them.
import { useEffect, useState } from 'react';
import { canOpen } from '../access';
import { hasLockedLessons, loadFullCourse } from '../content/registry';
import type { Lesson } from '../types';
import { effectiveLevel, useAccount } from './store';

/**
 * Unlocks a course's lessons for the signed-in account when it may open them:
 * the full lessons come from the API and replace the outlines.
 */
export function useCourseUnlock(courseId: string, lessons: Lesson[] | null) {
  const account = useAccount();
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [attempt, setAttempt] = useState(0);
  const level = effectiveLevel(account);
  const openable = !!lessons?.some(l => l.locked && canOpen(level, l.locked));
  useEffect(() => {
    if (!openable) return;
    let alive = true;
    setState('loading');
    loadFullCourse(courseId, { retry: attempt > 0 }).then(r => { if (alive) setState(r === 'error' ? 'error' : 'idle'); });
    return () => { alive = false; };
  }, [courseId, openable, attempt, level]);
  return {
    /** The account may open locked lessons, which are on their way. */
    loading: openable && state !== 'error',
    error: openable && state === 'error',
    retry: () => setAttempt(n => n + 1),
    stillLocked: hasLockedLessons(lessons),
  };
}

