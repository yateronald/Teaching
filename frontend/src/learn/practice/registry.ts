// The reading texts, one module each (texts/<id>.ts, default export). In the
// browser a text is downloaded when it is opened; the build-time pre-render
// registers them all up front (ssr.ts).
import { useEffect, useState } from 'react';
import type { ReadingText } from './types';

type TextModule = { default: ReadingText };
const loaders = import.meta.glob<TextModule>('./texts/*.ts');
const cache = new Map<string, ReadingText>();
const pending = new Map<string, Promise<ReadingText | null>>();

export const getText = (id: string): ReadingText | undefined => cache.get(id);
export const registerText = (t: ReadingText) => { cache.set(t.id, t); };

export function loadText(id: string): Promise<ReadingText | null> {
  const hit = cache.get(id);
  if (hit) return Promise.resolve(hit);
  let p = pending.get(id);
  if (!p) {
    const loader = loaders[`./texts/${id}.ts`];
    p = loader ? loader().then(m => { cache.set(id, m.default); return m.default; }) : Promise.resolve(null);
    pending.set(id, p);
  }
  return p;
}

/** A text: immediately when already loaded (pre-render, hydration), else after download. */
export function useText(id: string): ReadingText | null {
  const [text, setText] = useState<ReadingText | null>(() => getText(id) ?? null);
  useEffect(() => {
    const hit = getText(id);
    if (hit) { setText(hit); return; }
    let alive = true;
    loadText(id).then(t => { if (alive) setText(t); });
    return () => { alive = false; };
  }, [id]);
  return text;
}
