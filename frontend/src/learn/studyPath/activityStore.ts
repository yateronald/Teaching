// SSR-safe localStorage stores for the Guided Study Path and unified
// cross-activity completion tracking across courses, reading, listening,
// dialogues, ear labs, dictations, missions, and games.
import { useSyncExternalStore } from 'react';
import { LEVELS, type Lang, type Level } from '../types';
import { PASS_MARK, courseDone, useProgress, type Progress } from '../progress';
import { formatGrade, type DictationBest } from '../practice/dictation/diff';
import type { SavedStudyPath, StepCompletion, StudyGoalId, StudyStep } from './types';

const PATH_KEY = 'lfwn-study-path-v1';
const DOCS_KEY = 'lfwn-listening-v1';
const MISSIONS_KEY = 'lfwn-mission-v1';
const DIALOGUE_KEY = 'lfwn-dialogue';
const EAR_KEY = 'lfwn-ear';
const DICTATION_KEY = 'lfwn-dictation-v1';
const ACTIVITY_EVENT = 'lfwn-activity-update';

const DEFAULT_PATH: SavedStudyPath = {
  goal: 'complete',
  level: 'A1',
  picked: false,
  updatedAt: 0,
};

let pathCache: SavedStudyPath = DEFAULT_PATH;
let pathLoaded = false;
const pathListeners = new Set<() => void>();

function isGoal(x: unknown): x is StudyGoalId {
  return x === 'complete' || x === 'exams' || x === 'diploma' || x === 'fluency';
}

function isLevel(x: unknown): x is Level {
  return typeof x === 'string' && (LEVELS as readonly string[]).includes(x);
}

function readStudyPath(): SavedStudyPath {
  if (typeof window === 'undefined') return DEFAULT_PATH;
  if (pathLoaded) return pathCache;
  pathLoaded = true;
  try {
    const raw = localStorage.getItem(PATH_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SavedStudyPath>;
      pathCache = {
        goal: isGoal(parsed.goal) ? parsed.goal : 'complete',
        level: isLevel(parsed.level) ? parsed.level : 'A1',
        picked: Boolean(parsed.picked),
        updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : 0,
      };
    }
  } catch {
    pathCache = DEFAULT_PATH;
  }
  return pathCache;
}

function writeStudyPath(next: SavedStudyPath) {
  pathCache = next;
  pathLoaded = true;
  try {
    localStorage.setItem(PATH_KEY, JSON.stringify(next));
  } catch {
    /* private window */
  }
  pathListeners.forEach(fn => fn());
}

function subscribePath(cb: () => void) {
  pathListeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === PATH_KEY) {
      pathLoaded = false;
      readStudyPath();
      pathListeners.forEach(fn => fn());
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    pathListeners.delete(cb);
    window.removeEventListener('storage', onStorage);
  };
}

export function useStudyPath(): SavedStudyPath {
  return useSyncExternalStore(subscribePath, readStudyPath, () => DEFAULT_PATH);
}

export function setStudyPath(goal: StudyGoalId, level: Level, picked = true) {
  writeStudyPath({ goal, level, picked, updatedAt: Date.now() });
}

export function setStudyGoal(goal: StudyGoalId, picked = true) {
  const cur = readStudyPath();
  writeStudyPath({ ...cur, goal, picked, updatedAt: Date.now() });
}

export function setStudyLevel(level: Level, picked = true) {
  const cur = readStudyPath();
  writeStudyPath({ ...cur, level, picked, updatedAt: Date.now() });
}

// ── Activity Completion Store (aggregates all practice localStorage keys) ──

export interface ListeningDocRecord {
  correct: number;
  total: number;
  at: number;
}

export interface PracticeActivitySnapshot {
  dialogues: Record<string, [number, number]>;
  ear: Record<string, number>;
  dictations: Record<string, DictationBest>;
  docs: Record<string, ListeningDocRecord>;
  missions: Record<string, number>;
}

const EMPTY_PRACTICE: PracticeActivitySnapshot = {
  dialogues: {},
  ear: {},
  dictations: {},
  docs: {},
  missions: {},
};

let practiceCache: PracticeActivitySnapshot = EMPTY_PRACTICE;
let practiceLoaded = false;
const practiceListeners = new Set<() => void>();

function safeParse<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function readPracticeSnapshot(): PracticeActivitySnapshot {
  if (typeof window === 'undefined') return EMPTY_PRACTICE;
  if (practiceLoaded) return practiceCache;
  practiceLoaded = true;
  practiceCache = {
    dialogues: safeParse<Record<string, [number, number]>>(DIALOGUE_KEY, {}),
    ear: safeParse<Record<string, number>>(EAR_KEY, {}),
    dictations: safeParse<Record<string, DictationBest>>(DICTATION_KEY, {}),
    docs: safeParse<Record<string, ListeningDocRecord>>(DOCS_KEY, {}),
    missions: safeParse<Record<string, number>>(MISSIONS_KEY, {}),
  };
  return practiceCache;
}

/** Notify any mounted Study Path / Academy Bar / Progress views that a practice activity was saved. */
export function notifyActivityChanged() {
  practiceLoaded = false;
  if (typeof window !== 'undefined') {
    readPracticeSnapshot();
    practiceListeners.forEach(fn => fn());
    window.dispatchEvent(new Event(ACTIVITY_EVENT));
  }
}

export function saveListeningDocBest(id: string, correct: number, total: number) {
  if (typeof window === 'undefined') return;
  try {
    const all = safeParse<Record<string, ListeningDocRecord>>(DOCS_KEY, {});
    const prev = all[id];
    if (!prev || correct >= prev.correct) {
      all[id] = { correct: Math.max(prev?.correct ?? 0, correct), total, at: Date.now() };
      localStorage.setItem(DOCS_KEY, JSON.stringify(all));
    }
  } catch {
    /* private window */
  }
  notifyActivityChanged();
}

export function saveMissionDone(id: string) {
  if (typeof window === 'undefined') return;
  try {
    const all = safeParse<Record<string, number>>(MISSIONS_KEY, {});
    if (!all[id]) {
      all[id] = Date.now();
      localStorage.setItem(MISSIONS_KEY, JSON.stringify(all));
    }
  } catch {
    /* private window */
  }
  notifyActivityChanged();
}

function subscribePractice(cb: () => void) {
  practiceListeners.add(cb);
  const refresh = () => {
    practiceLoaded = false;
    readPracticeSnapshot();
    cb();
  };
  const onStorage = (e: StorageEvent) => {
    if (!e.key || [DIALOGUE_KEY, EAR_KEY, DICTATION_KEY, DOCS_KEY, MISSIONS_KEY].includes(e.key)) {
      refresh();
    }
  };
  window.addEventListener('storage', onStorage);
  window.addEventListener(ACTIVITY_EVENT, refresh);
  window.addEventListener('focus', refresh);
  return () => {
    practiceListeners.delete(cb);
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(ACTIVITY_EVENT, refresh);
    window.removeEventListener('focus', refresh);
  };
}

export interface ActivitySnapshot {
  progress: Progress;
  practice: PracticeActivitySnapshot;
}

export function useActivitySnapshot(): ActivitySnapshot {
  const progress = useProgress();
  const practice = useSyncExternalStore(subscribePractice, readPracticeSnapshot, () => EMPTY_PRACTICE);
  return { progress, practice };
}

/** Evaluate live completion status for any StudyStep. */
export function getStepCompletion(step: StudyStep, snap: ActivitySnapshot, lang: Lang): StepCompletion {
  const { progress: p, practice } = snap;
  const s = step.source;

  switch (s.type) {
    case 'course': {
      const doneCount = courseDone(p, s.id, s.lessonCount);
      const passed = !!p.finals[s.id]?.passed;
      const done = passed || doneCount >= s.lessonCount;
      const started = doneCount > 0;
      return {
        done,
        started,
        detail: done ? undefined : started ? `${doneCount}/${s.lessonCount}` : undefined,
      };
    }
    case 'ladder': {
      const idx = LEVELS.indexOf(s.level);
      const rec = p.lessons[`${s.id}-${idx + 1}`];
      const done = !!rec && rec.best >= PASS_MARK;
      return {
        done,
        started: !!rec,
        detail: rec ? `${Math.round(rec.best * 100)}%` : undefined,
      };
    }
    case 'dialogue': {
      const rec = practice.dialogues[s.id];
      return { done: !!rec, started: !!rec, detail: rec ? `${rec[0]}/${rec[1]}` : undefined };
    }
    case 'ear': {
      const score = practice.ear[s.id];
      const has = typeof score === 'number';
      return { done: has, started: has, detail: has ? `${score}/10` : undefined };
    }
    case 'doc': {
      const rec = practice.docs[s.id];
      return { done: !!rec, started: !!rec, detail: rec ? `${rec.correct}/${rec.total}` : undefined };
    }
    case 'text': {
      const rec = p.texts?.[s.id];
      return { done: !!rec, started: !!rec, detail: rec ? `${rec.best}/${rec.total}` : undefined };
    }
    case 'mission': {
      const has = !!practice.missions[s.id];
      return { done: has, started: has };
    }
    case 'dictation': {
      const rec = practice.dictations[s.id];
      return {
        done: !!rec,
        started: !!rec,
        detail: rec ? `${formatGrade(rec.grade, lang)}/20` : undefined,
      };
    }
    case 'game': {
      if (s.id === 'story') {
        const eps = Object.keys(p.story ?? {}).length;
        return { done: eps > 0, started: eps > 0, detail: eps > 0 ? `${eps} ep.` : undefined };
      }
      if (s.id === 'daily-word') {
        const wins = p.daily?.wins ?? 0;
        const played = (p.daily?.guesses?.length ?? 0) > 0 || wins > 0;
        return { done: wins > 0, started: played };
      }
      const g = p.games?.[s.id];
      return { done: !!g && g.plays > 0, started: !!g && g.plays > 0 };
    }
    case 'placement': {
      return {
        done: !!p.placement,
        started: !!p.placement,
        detail: p.placement ? p.placement.level : undefined,
      };
    }
  }
}

/** Total unique completed activities across all stores (for Progress & Academy Bar). */
export function countTotalCompleted(snap: ActivitySnapshot): {
  lessons: number;
  texts: number;
  missions: number;
  dialogues: number;
  ear: number;
  docs: number;
  dictations: number;
  total: number;
} {
  const lessons = Object.keys(snap.progress.lessons).length;
  const texts = Object.keys(snap.progress.texts ?? {}).length;
  const missions = Object.keys(snap.practice.missions).length;
  const dialogues = Object.keys(snap.practice.dialogues).length;
  const ear = Object.keys(snap.practice.ear).length;
  const docs = Object.keys(snap.practice.docs).length;
  const dictations = Object.keys(snap.practice.dictations).length;
  return {
    lessons,
    texts,
    missions,
    dialogues,
    ear,
    docs,
    dictations,
    total: lessons + texts + missions + dialogues + ear + docs + dictations,
  };
}
