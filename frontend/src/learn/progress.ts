// Progress in the free courses, kept in this browser only (localStorage): no
// account, nothing sent anywhere. Read through useProgress(), which renders the
// empty state on the server and during hydration, then the stored one.
import { useSyncExternalStore } from 'react';
import { LEVELS, type Level } from './types';

export interface LessonRecord { best: number; at: number; attempts: number }
export interface FinalRecord { best: number; passed: boolean; at: number }

export interface Progress {
  v: 1;
  lessons: Record<string, LessonRecord>;
  finals: Record<string, FinalRecord>;
  xp: number;
  /** Days with activity, YYYY-MM-DD, most recent last (kept to 120). */
  days: string[];
  placement?: { level: Level; score: number; at: number };
  /** Adaptive test of a levelled course: the level it placed the learner at. */
  courseTests?: Record<string, { level: Level; at: number }>;
  /** Name printed on certificates. */
  name?: string;
  last?: { path: string; title: string; course: string; at: number };
  badges: string[];
}

const KEY = 'lfwn-learn-v1';
const EMPTY: Progress = { v: 1, lessons: {}, finals: {}, xp: 0, days: [], badges: [] };

let state: Progress = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load(): Progress {
  if (loaded) return state;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Progress;
      if (parsed && parsed.v === 1) state = { ...EMPTY, ...parsed };
    }
  } catch { /* storage unavailable or corrupt: start empty */ }
  return state;
}

function save(next: Progress) {
  state = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* private mode: progress lives for this visit */ }
  listeners.forEach(l => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => { if (e.key === KEY) { loaded = false; load(); listeners.forEach(x => x()); } };
  window.addEventListener('storage', onStorage);
  return () => { listeners.delete(l); window.removeEventListener('storage', onStorage); };
}

export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, load, () => EMPTY);
}

export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

function withDay(p: Progress): Progress {
  const t = today();
  return p.days[p.days.length - 1] === t ? p : { ...p, days: [...p.days, t].slice(-120) };
}

/** Consecutive days up to today (or yesterday: the streak is not lost before midnight). */
export function streak(p: Progress): number {
  if (!p.days.length) return 0;
  const set = new Set(p.days);
  const d = new Date();
  const key = (x: Date) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
  if (!set.has(key(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (set.has(key(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

export const BADGES = ['first-lesson', 'perfect', 'first-course', 'streak-3', 'streak-7', 'xp-500', 'xp-2000', 'placement', 'certificate'] as const;
export type BadgeId = typeof BADGES[number];

function awardBadges(p: Progress, extra: BadgeId[] = []): { next: Progress; fresh: BadgeId[] } {
  const has = new Set(p.badges);
  const want: BadgeId[] = [...extra];
  if (Object.keys(p.lessons).length >= 1) want.push('first-lesson');
  if (Object.values(p.lessons).some(l => l.best >= 1)) want.push('perfect');
  if (Object.values(p.finals).some(f => f.passed)) want.push('certificate');
  const s = streak(p);
  if (s >= 3) want.push('streak-3');
  if (s >= 7) want.push('streak-7');
  if (p.xp >= 500) want.push('xp-500');
  if (p.xp >= 2000) want.push('xp-2000');
  if (p.placement) want.push('placement');
  const fresh = [...new Set(want)].filter(b => !has.has(b));
  return { next: fresh.length ? { ...p, badges: [...p.badges, ...fresh] } : p, fresh };
}

export function recordLesson(id: string, score: number, xp: number, last: Progress['last']): { fresh: BadgeId[]; improved: boolean } {
  const p = load();
  const prev = p.lessons[id];
  const rec: LessonRecord = { best: Math.max(prev?.best ?? 0, score), at: Date.now(), attempts: (prev?.attempts ?? 0) + 1 };
  const { next, fresh } = awardBadges(withDay({ ...p, lessons: { ...p.lessons, [id]: rec }, xp: p.xp + xp, last }));
  save(next);
  return { fresh, improved: !prev || score > prev.best };
}

export function recordFinal(courseId: string, score: number, passed: boolean, xp: number, courseDone: boolean): BadgeId[] {
  const p = load();
  const prev = p.finals[courseId];
  const rec: FinalRecord = { best: Math.max(prev?.best ?? 0, score), passed: passed || !!prev?.passed, at: Date.now() };
  const { next, fresh } = awardBadges(withDay({ ...p, finals: { ...p.finals, [courseId]: rec }, xp: p.xp + xp }), courseDone ? ['first-course'] : []);
  save(next);
  return fresh;
}

export function recordPlacement(level: Level, score: number): BadgeId[] {
  const p = load();
  const { next, fresh } = awardBadges(withDay({ ...p, placement: { level, score, at: Date.now() }, xp: p.xp + 50 }));
  save(next);
  return fresh;
}

export function recordCourseTest(courseId: string, level: Level) {
  const p = load();
  save(withDay({ ...p, courseTests: { ...(p.courseTests ?? {}), [courseId]: { level, at: Date.now() } }, xp: p.xp + 30 }));
}

// ── Levelled courses (A1 → C2) ──
/** Score that validates a level and unlocks the next one. */
export const PASS_MARK = 0.7;
/** Below this, the level below is suggested for review. */
export const REVIEW_MARK = 0.5;

export interface LadderState {
  /** Highest level index open to the learner. */
  unlocked: number;
  /** Level indexes validated (best score ≥ PASS_MARK). */
  passed: Set<number>;
  /** The level to work on now. */
  current: number;
  /** Level given by the adaptive test, if taken. */
  tested?: Level;
}

/** Lesson ids are `${courseId}-${n}` and lesson n teaches LEVELS[n - 1]. */
export function ladderState(p: Progress, courseId: string): LadderState {
  const passed = new Set<number>();
  LEVELS.forEach((_, i) => { if ((p.lessons[`${courseId}-${i + 1}`]?.best ?? 0) >= PASS_MARK) passed.add(i); });
  const tested = p.courseTests?.[courseId]?.level;
  const fromTest = tested ? LEVELS.indexOf(tested) : 0;
  const fromPassed = passed.size ? Math.max(...passed) + 1 : 0;
  const unlocked = Math.min(LEVELS.length - 1, Math.max(fromTest, fromPassed));
  let current = unlocked;
  for (let i = fromTest; i <= unlocked; i++) if (!passed.has(i)) { current = i; break; }
  return { unlocked, passed, current, tested };
}

export function addXp(n: number) { const p = load(); save(withDay({ ...p, xp: p.xp + n })); }
export function setName(name: string) { save({ ...load(), name: name.slice(0, 60) }); }
export function resetProgress() { save(EMPTY); }

/** Lessons done in a course, given its lesson ids. */
export const doneCount = (p: Progress, lessonIds: string[]) => lessonIds.filter(id => p.lessons[id]).length;
/** Courses list progress without loading lessons: lesson ids are `${courseId}-${n}`. */
export const courseDone = (p: Progress, courseId: string, lessonCount: number) =>
  Array.from({ length: lessonCount }, (_, i) => `${courseId}-${i + 1}`).filter(id => p.lessons[id]).length;
