// The visit, as the flash sees it: how long the visitor has really been on the
// site (only while the tab is in front of them), how many pages they opened,
// and how long they have been on this one. Kept for the tab (sessionStorage):
// moving to another page or reloading continues the same visit; half an hour
// away starts a new one.

const KEY = 'lfwn-visit';
const GAP_MS = 30 * 60_000;

interface Visit {
  /** When the visit began, and when the visitor was last seen (ms). */
  start: number;
  seen: number;
  /** Time spent with the tab in front, up to the last save (ms). */
  active: number;
  /** Pages opened, the current one, and the active time when it was opened. */
  pages: number;
  path: string;
  pageAt: number;
}

let visit: Visit | null = null;
/** When the tab came to the front (0 while it is hidden). */
let frontSince = 0;

const visible = () => typeof document === 'undefined' || document.visibilityState !== 'hidden';

function load(now: number): Visit {
  let saved: Visit | null = null;
  try { saved = JSON.parse(sessionStorage.getItem(KEY) || 'null') as Visit | null; } catch { /* private mode */ }
  const fresh = !saved || typeof saved.active !== 'number' || !(saved.start <= now) || now - saved.seen > GAP_MS;
  return fresh ? { start: now, seen: now, active: 0, pages: 0, path: '', pageAt: 0 } : saved!;
}

function save(now = Date.now()) {
  if (!visit) return;
  visit.active = activeMs(now);
  visit.seen = now;
  frontSince = visible() ? now : 0;
  try { sessionStorage.setItem(KEY, JSON.stringify(visit)); } catch { /* private mode */ }
}

/** Starts (or continues) the visit; safe to call on every page. */
export function startVisit(now = Date.now()) {
  if (visit) return;
  visit = load(now);
  frontSince = visible() ? now : 0;
  // Leaving the tab stops the clock; coming back starts it again.
  document.addEventListener('visibilitychange', () => save());
  window.addEventListener('pagehide', () => save());
  save(now);
}

/** A page is shown: counted once, however often it is drawn again. */
export function notePage(path: string, now = Date.now()) {
  startVisit(now);
  if (!visit || visit.path === path) return;
  visit.pages += 1;
  visit.path = path;
  visit.pageAt = activeMs(now);
  save(now);
}

/** Time spent on the site with the tab in front (ms). */
export function activeMs(now = Date.now()): number {
  if (!visit) return 0;
  return visit.active + (frontSince ? Math.max(0, now - frontSince) : 0);
}

/** Time spent on this page with the tab in front (ms). */
export const pageActiveMs = (now = Date.now()) => (visit ? Math.max(0, activeMs(now) - visit.pageAt) : 0);
export const pagesSeen = () => visit?.pages ?? 0;

// ── When the flash comes ──

/** The flash comes on the first sign of interest. */
export const FLASH_RULES = {
  /** Reading the site this long. */
  readMs: 30_000,
  /** A second page, after this long on it. */
  secondPageMs: 10_000,
  /** Half of a page at least two screens long, after this long on the site. */
  halfPageMs: 10_000,
  /** On a computer, the mouse leaving for the tabs or the close button, after this long. */
  exitMs: 8_000,
};

export type FlashReason = 'read' | 'second-page' | 'half-page' | 'exit';

/** Which sign of interest the visitor gave, if any (the exit is an event, see below). */
export function flashReason(s: { active: number; pageActive: number; pages: number; scrolled: number; screens: number }): FlashReason | null {
  if (s.active >= FLASH_RULES.readMs) return 'read';
  if (s.pages >= 2 && s.pageActive >= FLASH_RULES.secondPageMs) return 'second-page';
  if (s.screens >= 2 && s.scrolled >= 0.5 && s.active >= FLASH_RULES.halfPageMs) return 'half-page';
  return null;
}

/** What the page says now: how far it was read, and how many screens long it is. */
export function readingNow() {
  const doc = document.documentElement;
  const max = doc.scrollHeight - window.innerHeight;
  return {
    active: activeMs(),
    pageActive: pageActiveMs(),
    pages: pagesSeen(),
    scrolled: max > 0 ? window.scrollY / max : 0,
    screens: window.innerHeight > 0 ? doc.scrollHeight / window.innerHeight : 0,
  };
}

/** A computer with a mouse: the only place where « about to leave » can be seen. */
export const canSeeExit = () => typeof window !== 'undefined' && !!window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;
