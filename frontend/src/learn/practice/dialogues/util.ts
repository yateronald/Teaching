// Helpers of the dialogue pages: the order of the options and the best scores
// kept in this browser.

/**
 * The options of a question in a fixed, mixed order (the right answer is
 * written first in the content files). Seeded by the dialogue and the
 * question, so the pre-rendered page and the browser agree.
 */
export function optionOrder(n: number, seed: string): number[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    h ^= h << 13; h ^= h >>> 17; h ^= h << 5;
    const j = (h >>> 0) % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

// ── Best scores (right answers, questions), in this browser only ──
const KEY = 'lfwn-dialogue';
export function readBest(): Record<string, [number, number]> {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') as Record<string, [number, number]>; } catch { return {}; }
}
export function saveBest(id: string, score: number, total: number) {
  try {
    const all = readBest();
    if (!(all[id]?.[0] >= score)) { all[id] = [score, total]; localStorage.setItem(KEY, JSON.stringify(all)); }
  } catch { /* private window: nothing kept */ }
}
