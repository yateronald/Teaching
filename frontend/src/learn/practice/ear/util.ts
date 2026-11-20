// Helpers of the ear-training pages: plain transcripts, the slowed-down rate,
// checking a typed answer, and the best scores kept in this browser.

/** The text of a transcript without its marks (for titles and screen readers). */
export const plainOf = (text: string) => text.replace(/[{}]/g, '').replace(/~[^~]*~/g, '').replace(/‿/g, ' ').replace(/\s+/g, ' ').trim();

/** The slowed-down playback rate (the pitch is kept by the browser). */
export const SLOW = 0.7;

const tidy = (s: string) => s.toLowerCase().replace(/[’`]/g, '\'').replace(/[«»"“”.,!?;:()]/g, ' ').replace(/\s+/g, ' ').trim();
const bare = (s: string) => tidy(s).normalize('NFD').replace(/\p{M}/gu, '').replace(/['-]/g, ' ').replace(/\s+/g, ' ').trim();

/**
 * A typed answer: `ok` when it matches an accepted answer, ignoring case and
 * punctuation; `exact` when the accents and apostrophes are right too (a
 * near miss is accepted, with the right spelling shown).
 */
export function judge(given: string, answers: string[]): { ok: boolean; exact: boolean } {
  const g = tidy(given);
  if (!g) return { ok: false, exact: false };
  if (answers.some(a => tidy(a) === g)) return { ok: true, exact: true };
  return { ok: answers.some(a => bare(a) === bare(given)), exact: false };
}

// ── Best scores, in this browser only ──
const KEY = 'lfwn-ear';
export function readBest(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') as Record<string, number>; } catch { return {}; }
}
export function saveBest(id: string, score: number) {
  try {
    const all = readBest();
    if (!(all[id] >= score)) { all[id] = score; localStorage.setItem(KEY, JSON.stringify(all)); }
    window.dispatchEvent(new Event('lfwn-activity-update'));
  } catch { /* private window: nothing kept */ }
}
