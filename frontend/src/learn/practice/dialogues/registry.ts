// The dialogues, one module per situation (content/<theme>.ts, default export:
// the five dialogues of that situation, by id). In the browser a situation is
// downloaded when one of its dialogues is opened; the build-time pre-render
// registers them all up front (ssr.ts).
import { useEffect, useState } from 'react';
import type { Dialogue, ThemeId } from './types';

type ThemeModule = { default: Record<string, Dialogue> };
const loaders = import.meta.glob<ThemeModule>('./content/*.ts');
const cache = new Map<string, Dialogue>();
const pending = new Map<ThemeId, Promise<void>>();

export const registerDialogue = (d: Dialogue) => { cache.set(d.id, d); };

function loadTheme(theme: ThemeId): Promise<void> {
  let p = pending.get(theme);
  if (!p) {
    const loader = loaders[`./content/${theme}.ts`];
    p = loader ? loader().then(m => { Object.values(m.default).forEach(registerDialogue); }) : Promise.resolve();
    pending.set(theme, p);
  }
  return p;
}

export async function loadDialogue(id: string, theme: ThemeId): Promise<Dialogue | null> {
  if (!cache.has(id)) await loadTheme(theme);
  return cache.get(id) ?? null;
}

/** A dialogue: immediately when already loaded (pre-render, hydration), else after download. */
export function useDialogue(id: string, theme: ThemeId): Dialogue | null {
  const [d, setD] = useState<Dialogue | null>(() => cache.get(id) ?? null);
  useEffect(() => {
    let live = true;
    if (!d || d.id !== id) loadDialogue(id, theme).then(x => { if (live) setD(x); });
    return () => { live = false; };
  }, [id, theme, d]);
  return d && d.id === id ? d : null;
}
