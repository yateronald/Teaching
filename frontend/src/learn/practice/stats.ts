// The learner’s reading so far, from the progress kept in this browser.
import { TEXT_MASTERED, type Progress } from '../progress';
import { TEXTS } from './meta';
import type { TextMeta } from './types';

export type TextStatus = 'todo' | 'review' | 'done';

export function textStatus(p: Progress, t: TextMeta): { status: TextStatus; best: number; total: number } {
  const rec = p.texts?.[t.id];
  if (!rec) return { status: 'todo', best: 0, total: t.questions };
  return { status: rec.best / rec.total >= TEXT_MASTERED ? 'done' : 'review', best: rec.best, total: rec.total };
}

/** The text to read next: the first one not read yet, else the first to review. */
export function nextText(p: Progress, after?: string): TextMeta | undefined {
  const from = after ? TEXTS.findIndex(t => t.id === after) + 1 : 0;
  const order = [...TEXTS.slice(from), ...TEXTS.slice(0, from)].filter(t => t.id !== after);
  return order.find(t => !p.texts?.[t.id]) ?? order.find(t => textStatus(p, t).status === 'review') ?? order[0];
}
