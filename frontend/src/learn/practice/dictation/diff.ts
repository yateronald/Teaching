// Smart French dictation word-by-word aligner, orthographic error classifier,
// guided-blank parser, /20 French grader, and local progress storage.
import type { DictationMode } from './types';

export type DiffStatus = 'ok' | 'accent' | 'wrong' | 'missing' | 'extra';

export interface DiffToken {
  status: DiffStatus;
  /** Expected French word (omitted only for 'extra'). */
  expected?: string;
  /** What the learner typed (omitted only for 'missing'). */
  typed?: string;
}

export interface SentenceEvaluation {
  tokens: DiffToken[];
  exactCount: number;
  accentCount: number;
  wrongCount: number;
  missingCount: number;
  extraCount: number;
  totalWords: number;
  /** Earned points out of totalWords (1 per exact word, 0.75 per accent-only slip). */
  points: number;
  /** Learner's raw submitted string (or reconstructed guided sentence). */
  raw: string;
}

/** Normalize keyboard apostrophes and spaces to canonical French typography. */
const normApostrophe = (s: string) => s.replace(/['‘ʼ`]/g, '’');

/** Strip surrounding punctuation for spelling comparison, keeping inner apostrophes/hyphens. */
const coreWord = (w: string) =>
  normApostrophe(w)
    .replace(/^[«»"“”()[\],.;:!?—–-]+|[«»"“”()[\],.;:!?—–-]+$/g, '')
    .trim();

/** Lowercase core word preserving French diacritics (é, è, ê, à, ç, ô, î, œ). */
const canonical = (w: string) => coreWord(w).toLowerCase();

/** Strip diacritics & expand ligatures so we can detect accent-only slips. */
const folded = (w: string) =>
  canonical(w)
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/\p{M}/gu, '');

/** Split a French sentence into comparable word tokens. */
export function tokenizeFrench(text: string): string[] {
  return normApostrophe(text)
    .trim()
    .split(/\s+/)
    .map(t => coreWord(t))
    .filter(Boolean);
}

/** Count words in a sentence or whole passage. */
export const countWords = (text: string) => tokenizeFrench(text).length;

/** Create a subtle word-shape hint: first letter + underscores for longer words. */
export function buildHint(sentence: string): string {
  return normApostrophe(sentence)
    .split(/\s+/)
    .map(tok => {
      const m = /^([«"(]*)([\p{L}\p{N}’'-]+)([.,!?;:»")]*)$/u.exec(tok);
      if (!m) return tok;
      const [, pre, word, post] = m;
      const chars = [...word];
      if (chars.length <= 2) return `${pre}${'_'.repeat(chars.length)}${post}`;
      return `${pre}${chars[0]}${'_'.repeat(chars.length - 1)}${post}`;
    })
    .join(' ');
}

/** Compare two single words for exact vs accent-only match. */
export function classifyWord(typed: string, expected: string): 'ok' | 'accent' | 'wrong' {
  const ct = canonical(typed);
  const ce = canonical(expected);
  if (!ct) return 'wrong';
  if (ct === ce) return 'ok';
  if (folded(ct) === folded(ce)) return 'accent';
  return 'wrong';
}

/** LCS word-level alignment for full-sentence dictation correction. */
export function evaluateSentence(typedText: string, expectedText: string): SentenceEvaluation {
  const exp = tokenizeFrench(expectedText);
  const got = tokenizeFrench(typedText);
  const n = exp.length;
  const m = got.length;

  // DP table for Longest Common Subsequence where exact or accent-only counts as a match.
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  const match = (i: number, j: number) => classifyWord(got[j], exp[i]) !== 'wrong';

  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      if (match(i, j)) dp[i][j] = dp[i + 1][j + 1] + 1;
      else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  // Reconstruct aligned segments, pairing adjacent mismatches as substitutions ('wrong').
  const tokens: DiffToken[] = [];
  let i = 0;
  let j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && match(i, j)) {
      const cls = classifyWord(got[j], exp[i]);
      tokens.push({ status: cls, expected: exp[i], typed: got[j] });
      i++;
      j++;
    } else {
      // Collect mismatch block until next LCS anchor.
      const missExp: string[] = [];
      const missGot: string[] = [];
      while (i < n || j < m) {
        if (i < n && j < m && match(i, j)) break;
        if (i < n && (j === m || dp[i + 1][j] >= dp[i][j + 1])) {
          missExp.push(exp[i++]);
        } else if (j < m) {
          missGot.push(got[j++]);
        }
      }
      const paired = Math.min(missExp.length, missGot.length);
      for (let k = 0; k < paired; k++) {
        tokens.push({ status: 'wrong', expected: missExp[k], typed: missGot[k] });
      }
      for (let k = paired; k < missExp.length; k++) {
        tokens.push({ status: 'missing', expected: missExp[k] });
      }
      for (let k = paired; k < missGot.length; k++) {
        tokens.push({ status: 'extra', typed: missGot[k] });
      }
    }
  }

  let exactCount = 0;
  let accentCount = 0;
  let wrongCount = 0;
  let missingCount = 0;
  let extraCount = 0;
  for (const t of tokens) {
    if (t.status === 'ok') exactCount++;
    else if (t.status === 'accent') accentCount++;
    else if (t.status === 'wrong') wrongCount++;
    else if (t.status === 'missing') missingCount++;
    else if (t.status === 'extra') extraCount++;
  }

  const penalty = extraCount * 0.25;
  const points = Math.max(0, exactCount + accentCount * 0.75 - penalty);

  return {
    tokens,
    exactCount,
    accentCount,
    wrongCount,
    missingCount,
    extraCount,
    totalWords: n,
    points,
    raw: typedText.trim(),
  };
}

/** Parts of a sentence split for Guided-Blanks mode. */
export type GuidedPart = { kind: 'text'; value: string } | { kind: 'blank'; index: number; answer: string };

export function parseGuidedSentence(sentence: string, blanks: string[]): GuidedPart[] {
  const parts: GuidedPart[] = [];
  let rest = sentence;
  let idx = 0;
  for (const target of blanks) {
    const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(?<!\\p{L})${escaped}(?!\\p{L})`, 'u');
    const m = re.exec(rest);
    if (!m) continue;
    if (m.index > 0) parts.push({ kind: 'text', value: rest.slice(0, m.index) });
    parts.push({ kind: 'blank', index: idx++, answer: m[0] });
    rest = rest.slice(m.index + m[0].length);
  }
  if (rest) parts.push({ kind: 'text', value: rest });
  return parts;
}

/** Evaluate only the blanked target words in Guided mode, displaying full context cleanly. */
export function evaluateGuided(answers: string[], parts: GuidedPart[]): SentenceEvaluation {
  const tokens: DiffToken[] = [];
  let exactCount = 0;
  let accentCount = 0;
  let wrongCount = 0;
  let missingCount = 0;
  let totalBlanks = 0;

  for (const p of parts) {
    if (p.kind === 'text') {
      const words = tokenizeFrench(p.value);
      for (const w of words) tokens.push({ status: 'ok', expected: w, typed: w });
    } else {
      totalBlanks++;
      const typed = (answers[p.index] ?? '').trim();
      if (!typed) {
        missingCount++;
        tokens.push({ status: 'missing', expected: p.answer });
      } else {
        const cls = classifyWord(typed, p.answer);
        if (cls === 'ok') exactCount++;
        else if (cls === 'accent') accentCount++;
        else wrongCount++;
        tokens.push({ status: cls, expected: p.answer, typed });
      }
    }
  }

  const points = exactCount + accentCount * 0.75;
  const raw = parts.map(p => (p.kind === 'text' ? p.value : (answers[p.index] ?? '___').trim() || '___')).join('');

  return {
    tokens,
    exactCount,
    accentCount,
    wrongCount,
    missingCount,
    extraCount: 0,
    totalWords: Math.max(1, totalBlanks),
    points,
    raw,
  };
}

/** Compute authentic French /20 grade rounded to the nearest 0.5 point. */
export function gradeOutOf20(earned: number, total: number): number {
  if (total <= 0) return 0;
  const raw = Math.max(0, Math.min(20, (earned / total) * 20));
  return Math.round(raw * 2) / 2;
}

export const formatGrade = (grade: number, lang: 'en' | 'fr') => {
  const s = Number.isInteger(grade) ? String(grade) : grade.toFixed(1);
  return lang === 'fr' ? s.replace('.', ',') : s;
};

// ── Local progress storage (same privacy-first pattern as ear-training) ──
const STORAGE_KEY = 'lfwn-dictation-v1';

export interface DictationBest {
  grade: number;
  pct: number;
  mode: DictationMode;
  attempts: number;
  at: number;
}

function readAll(): Record<string, DictationBest> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, DictationBest>) : {};
  } catch {
    return {};
  }
}

export function readDictationBest(id: string): DictationBest | undefined {
  return readAll()[id];
}

export function saveDictationBest(id: string, grade: number, pct: number, mode: DictationMode): DictationBest {
  const all = readAll();
  const prev = all[id];
  const next: DictationBest = {
    grade: Math.max(prev?.grade ?? 0, grade),
    pct: Math.max(prev?.pct ?? 0, pct),
    mode: grade >= (prev?.grade ?? 0) ? mode : (prev?.mode ?? mode),
    attempts: (prev?.attempts ?? 0) + 1,
    at: Date.now(),
  };
  all[id] = next;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(all)); } catch { /* ignore private mode */ }
  return next;
}
