// The learner's choice to see the English translation under the French of
// the exercises (English interface only). A convenience kept in this browser.
import { useSyncExternalStore } from 'react';

const KEY = 'lfwn-show-translations';
const listeners = new Set<() => void>();
let value: boolean | null = null;

const read = (): boolean => {
  if (value === null) {
    try { value = localStorage.getItem(KEY) === '1'; } catch { value = false; }
  }
  return value;
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};

export function setShowTranslations(on: boolean) {
  value = on;
  try { localStorage.setItem(KEY, on ? '1' : '0'); } catch { /* private mode: kept for this visit */ }
  listeners.forEach(l => l());
}

/** Off on the server and at hydration; the saved choice applies once mounted. */
export const useShowTranslations = () => useSyncExternalStore(subscribe, read, () => false);
