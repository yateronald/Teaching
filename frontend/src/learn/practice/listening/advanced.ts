// The advanced documents (C1, C2) are long: their content is a separate
// download, fetched when one of them is opened. The pre-render registers them
// all up front (ssr.ts), so the pages are complete without JavaScript.
import { useEffect, useState } from 'react';
import type { ListeningExercise } from './types';

const cache = new Map<string, ListeningExercise>();
const pending = new Map<string, Promise<void>>();
const loaders: Record<string, () => Promise<ListeningExercise[]>> = {
  C1: () => import('./c1').then(m => m.c1Listening),
  C2: () => import('./c2').then(m => m.c2Listening),
};

export const registerAdvanced = (list: ListeningExercise[]) => { list.forEach(e => cache.set(e.id, e)); };

export function loadAdvanced(level: string): Promise<void> {
  let p = pending.get(level);
  if (!p) {
    p = (loaders[level]?.() ?? Promise.resolve([])).then(registerAdvanced);
    pending.set(level, p);
  }
  return p;
}

/** The whole exercise: at once for the first levels and once downloaded for the advanced ones. */
export function useFullExercise(e: ListeningExercise): ListeningExercise | null {
  const [, loaded] = useState(0);
  useEffect(() => {
    if (!e.lazy || cache.has(e.id)) return;
    let live = true;
    loadAdvanced(e.level).then(() => { if (live) loaded(n => n + 1); });
    return () => { live = false; };
  }, [e]);
  return e.lazy ? cache.get(e.id) ?? null : e;
}
