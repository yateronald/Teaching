// Marketing campaigns on the public site: the shape the API returns, how they
// are loaded and counted, and how dates, prices and deadlines are written.
// Shared by every place a campaign appears (bar, home section, flash, free
// courses, offers page), by the registration sheet, and by the admin console
// (its previews and its flyers draw the same campaign).

import { imageUrl } from '../learn/categories';
import { OFFERS_PATHS } from '../components/Landing/sitePages';

export type Lang = 'en' | 'fr';
export type Kind = 'group_class' | 'offer' | 'event' | 'announcement';
export type Audience = 'general' | 'beginner' | 'conversation' | 'tcf' | 'tef' | 'delf' | 'business' | 'kids';
export type ThemeId = 'navy' | 'bordeaux' | 'gold' | 'forest' | 'plum';
/** Where on the site a campaign is seen or clicked. */
export type Placement = 'bar' | 'home' | 'flash' | 'learn' | 'offers' | 'link';

export interface PromoWords {
  title: string | null;
  tagline: string | null;
  description: string | null;
  highlights: string[];
  cta: string | null;
  badge: string | null;
  schedule: string | null;
  price_note: string | null;
}

export interface Promotion {
  slug: string;
  kind: Kind;
  audience: Audience;
  level: string | null;
  theme: ThemeId;
  /** A picture of the site's library (public/learn/img). */
  image: string | null;
  text: Record<Lang, PromoWords>;
  class_starts_on: string | null;
  class_ends_on: string | null;
  teacher: string | null;
  /** `left` counts the seats taken outside the site too. `show_left`: say how
   *  many are left (the group is filling up, or the administrator wants it
   *  always); otherwise only the size of the group is shown. */
  seats: { limit: number; left: number; show_left?: boolean } | null;
  full: boolean;
  price: { regular: number | null; promo: number | null; currency: string } | null;
  ends_at: string | null;
  countdown: boolean;
  places: { bar: boolean; home: boolean; flash: boolean; learn: boolean };
  registration: { mode: 'form' | 'link' | 'none'; url: string | null };
  priority: number;
}

/** The five looks a campaign can take: two tones for the background, one accent. */
export const THEMES: Record<ThemeId, { name: string; a: string; b: string; accent: string; soft: string }> = {
  navy: { name: 'Navy', a: '#1d4577', b: '#0b1733', accent: '#f2b632', soft: '#edf1f5' },
  bordeaux: { name: 'Bordeaux', a: '#a83342', b: '#4f121d', accent: '#ffd9a0', soft: '#f9edee' },
  gold: { name: 'Gold', a: '#9c6609', b: '#6f4405', accent: '#fff1c9', soft: '#fbf3df' },
  forest: { name: 'Forest', a: '#1f7a59', b: '#0c3526', accent: '#ffd77a', soft: '#e9f4ef' },
  plum: { name: 'Plum', a: '#6a45a3', b: '#2a1849', accent: '#ffc9de', soft: '#f1ecf8' },
};

export const OFFERS_PATH: Record<Lang, string> = OFFERS_PATHS;

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://api.learnfrenchwithnatives.com/api';
const ENDPOINT = `${API_BASE}/public/promotions`;

// ── Loading ──
// One request serves every placement of the page; moving between pages of the
// site reuses it for a minute.
let cache: { at: number; list: Promise<Promotion[]> } | null = null;
const FRESH_MS = 60_000;

export function loadPromotions(force = false): Promise<Promotion[]> {
  if (typeof window === 'undefined') return Promise.resolve([]);
  if (!force && cache && Date.now() - cache.at < FRESH_MS) return cache.list;
  const list = fetch(ENDPOINT, { headers: { Accept: 'application/json' } })
    .then(r => (r.ok ? r.json() : { promotions: [] }))
    .then((d: { promotions?: Promotion[] }) => (Array.isArray(d.promotions) ? d.promotions : []))
    .catch(() => [] as Promotion[]);
  cache = { at: Date.now(), list };
  return list;
}

// ── Counting views and clicks ──
// No cookie and no identifier: the server only adds one to a counter. A view is
// counted once per page load and placement.
const seen = new Set<string>();
const TYPE = 'text/plain;charset=UTF-8';

export function track(slug: string, type: 'view' | 'click', placement: Placement) {
  if (typeof window === 'undefined') return;
  if (type === 'view') {
    const key = `${slug}|${placement}`;
    if (seen.has(key)) return;
    seen.add(key);
  }
  try {
    const body = JSON.stringify({ slug, type, placement });
    if (navigator.sendBeacon?.(`${ENDPOINT}/track`, new Blob([body], { type: TYPE }))) return;
    void fetch(`${ENDPOINT}/track`, { method: 'POST', body, headers: { 'Content-Type': TYPE }, keepalive: true, mode: 'cors' }).catch(() => { /* a lost count never matters more than the page */ });
  } catch { /* ignore */ }
}

// ── Registering ──
export interface RegistrationInput {
  fullName: string; email: string; phone: string; country: string; level: string; message: string;
  /** Left empty by people; robots fill it. */
  website: string;
}
export interface RegistrationResult { ok: boolean; status?: 'new' | 'waitlist'; already?: boolean; message?: string }

export async function register(slug: string, input: RegistrationInput, lang: Lang, placement: Placement): Promise<RegistrationResult> {
  try {
    const r = await fetch(`${ENDPOINT}/${encodeURIComponent(slug)}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...input, lang, placement,
        path: window.location.pathname.slice(0, 200),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false, message: data.message || data.error };
    return { ok: true, status: data.status, already: data.already };
  } catch {
    return { ok: false };
  }
}

// ── What this visitor already did (kept in the browser only) ──
const REGISTERED_KEY = 'lfwn-promo-registered';
const read = <T,>(storage: 'local' | 'session', key: string, fallback: T): T => {
  try { const raw = (storage === 'local' ? localStorage : sessionStorage).getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
};
const write = (storage: 'local' | 'session', key: string, value: unknown) => {
  try { (storage === 'local' ? localStorage : sessionStorage).setItem(key, JSON.stringify(value)); } catch { /* private mode */ }
};
export const registeredSlugs = (): string[] => read<string[]>('local', REGISTERED_KEY, []);
export const rememberRegistered = (slug: string) => write('local', REGISTERED_KEY, [...new Set([...registeredSlugs(), slug])].slice(-40));

/** The bar stays closed for the rest of the visit once closed. */
const BAR_KEY = 'lfwn-promo-bar-closed';
export const barClosed = (slug: string) => read<string[]>('session', BAR_KEY, []).includes(slug);
export const closeBar = (slug: string) => write('session', BAR_KEY, [...read<string[]>('session', BAR_KEY, []), slug]);

/** A flash is shown again only after a few days, and at most once per visit. */
const FLASH_KEY = 'lfwn-promo-flash';
const FLASH_VISIT_KEY = 'lfwn-promo-flash-visit';
const FLASH_AGAIN_MS = 3 * 86_400_000;
export function flashAllowed(slug: string): boolean {
  if (read<boolean>('session', FLASH_VISIT_KEY, false)) return false;
  const when = read<Record<string, number>>('local', FLASH_KEY, {})[slug];
  return !when || Date.now() - when > FLASH_AGAIN_MS;
}
export function rememberFlash(slug: string) {
  write('session', FLASH_VISIT_KEY, true);
  write('local', FLASH_KEY, { ...read<Record<string, number>>('local', FLASH_KEY, {}), [slug]: Date.now() });
}

// ── Words, dates, prices ──
const LOCALE: Record<Lang, string> = { en: 'en-CA', fr: 'fr-CA' };
const at = (day: string) => new Date(`${day}T12:00:00Z`);

/** "11 January 2027" / "11 janvier 2027". */
export function fmtDay(day: string | null, lang: Lang, opts: { year?: boolean; short?: boolean } = {}): string {
  if (!day) return '';
  return at(day).toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-GB', {
    day: 'numeric', month: opts.short ? 'short' : 'long', ...(opts.year === false ? {} : { year: 'numeric' }), timeZone: 'UTC',
  });
}

/** "11 Jan – 5 Mar 2027", or just the start when there is no end. */
export function dateRange(start: string | null, end: string | null, lang: Lang): string {
  if (!start && !end) return '';
  if (!start || !end) return fmtDay(start || end, lang, { short: true });
  const sameYear = start.slice(0, 4) === end.slice(0, 4);
  return `${fmtDay(start, lang, { short: true, year: !sameYear })} – ${fmtDay(end, lang, { short: true })}`;
}

/** Weeks between two days, when it reads better than the dates ("8 weeks"). */
export function weeksBetween(start: string | null, end: string | null): number | null {
  if (!start || !end) return null;
  const days = Math.round((at(end).getTime() - at(start).getTime()) / 86_400_000) + 1;
  return days >= 12 ? Math.round(days / 7) : null;
}

export function fmtPrice(value: number, currency: string, lang: Lang): string {
  try {
    return new Intl.NumberFormat(LOCALE[lang], { style: 'currency', currency, maximumFractionDigits: Number.isInteger(value) ? 0 : 2 }).format(value);
  } catch {
    return `${value} ${currency}`;
  }
}

/** The price to pay, the crossed-out one, and the saving in percent. */
export function priceOf(p: Pick<Promotion, 'price'>, lang: Lang): { now: string; was: string | null; percent: number | null; free: boolean } | null {
  if (!p.price) return null;
  const { regular, promo, currency } = p.price;
  const now = promo ?? regular;
  if (now === null || now === undefined) return null;
  const cut = promo !== null && regular !== null && regular > promo;
  return {
    now: now === 0 ? (lang === 'fr' ? 'Gratuit' : 'Free') : fmtPrice(now, currency, lang),
    was: cut ? fmtPrice(regular!, currency, lang) : null,
    percent: cut ? Math.round((1 - promo! / regular!) * 100) : null,
    free: now === 0,
  };
}

export interface TimeLeft { total: number; days: number; hours: number; minutes: number; seconds: number }
export function timeLeft(endsAt: string | null, now = Date.now()): TimeLeft | null {
  if (!endsAt) return null;
  const total = new Date(endsAt).getTime() - now;
  if (!(total > 0)) return null;
  const s = Math.floor(total / 1000);
  return { total, days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 };
}

/** The campaigns of one placement, the most important first. */
export function forPlace(list: Promotion[], place: keyof Promotion['places']): Promotion[] {
  return list.filter(p => p.places[place]);
}

/** The campaign that fits a free course best: its own audience, then a general one, then any. */
export function bestFor(list: Promotion[], audience: Audience): Promotion | null {
  return list.find(p => p.audience === audience) || list.find(p => p.audience === 'general') || list[0] || null;
}

/** Which audience a category of free courses speaks to. */
export function audienceOfCategory(category: string | undefined, courseId?: string): Audience {
  if (courseId === 'kids-french') return 'kids';
  switch (category) {
    case 'tcf': return 'tcf';
    case 'tef-quebec': return 'tef';
    case 'delf-dalf': return 'delf';
    case 'business': return 'business';
    case 'beginner': return 'beginner';
    case 'conversation': case 'pronunciation': case 'listening': return 'conversation';
    default: return 'general';
  }
}

/** A picture of the library, at the width asked for. */
/** A picture made by the AI for a campaign (Marketing → AI): served by the API, not by the site. */
export const isAiImage = (key: string | null | undefined) => !!key && /^ai-[a-f0-9]{12}$/.test(key);
export const promoImage = (key: string, width: 640 | 1200 = 640) =>
  isAiImage(key) ? `${ENDPOINT}/images/${key}${width === 640 ? '-640' : ''}.webp` : imageUrl(key, width);
