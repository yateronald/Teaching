// Who is signed in on the website, and what they may open. Read once per
// visit (and after each sign-in or sign-out); the pre-rendered pages and the
// first render in the browser always show a visitor, then the account appears.
import { useSyncExternalStore } from 'react';
import type { AccessLevel } from '../access';
import { siteApi } from './api';

export interface SiteUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  country: string | null;
  lang: 'en' | 'fr' | null;
  marketing_opt_in: boolean;
  email_verified: boolean;
  google_linked: boolean;
  has_password: boolean;
  portal: boolean;
  created_at: string;
}
export interface SiteAccess { level: AccessLevel; website: boolean; staff: boolean; premium: { until: string | null; via: string } | null }
export interface AccountState {
  status: 'unknown' | 'ready' | 'offline';
  user: SiteUser | null;
  access: SiteAccess;
  premiumRequest: { status: string; created_at: string } | null;
  google: boolean;
  /** Online payment (Paystack) is available. */
  payments: boolean;
  /** free: everything open to everyone (set by an administrator); premium: the access levels apply; null: not known yet. */
  mode: 'free' | 'premium' | null;
}

const VISITOR: SiteAccess = { level: 'visitor', website: false, staff: false, premium: null };
const INITIAL: AccountState = { status: 'unknown', user: null, access: VISITOR, premiumRequest: null, google: false, payments: false, mode: null };

let state: AccountState = INITIAL;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(l => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

export function setAccount(patch: Partial<AccountState>) {
  state = { ...state, ...patch, status: patch.status ?? 'ready' };
  emit();
}

let loading: Promise<void> | null = null;
let configLoaded = false;

/** Reads the account (once; `force` reads it again). */
export function loadAccount(force = false): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (loading && !force) return loading;
  loading = (async () => {
    try {
      const [me, config] = await Promise.all([
        siteApi<{ user: SiteUser | null; access: SiteAccess; premium_request: AccountState['premiumRequest'] }>('/site-auth/me'),
        configLoaded ? Promise.resolve(null) : siteApi<{ google: boolean; payments?: boolean; mode?: 'free' | 'premium' }>('/site-auth/config').catch(() => null),
      ]);
      if (config) configLoaded = true;
      setAccount({ status: 'ready', user: me.user, access: me.access || VISITOR, premiumRequest: me.premium_request ?? null, ...(config ? { google: !!config.google, payments: !!config.payments, mode: config.mode === 'premium' ? 'premium' : 'free' } : {}) });
    } catch {
      // The API cannot be reached: the site works as for a visitor.
      setAccount({ status: 'offline', user: null, access: VISITOR });
    }
  })();
  return loading;
}

/** After a sign-in or a sign-up: the answer already says who the person is. */
export function signedIn(data: { user: SiteUser; access: SiteAccess }) {
  setAccount({ status: 'ready', user: data.user, access: data.access, premiumRequest: null });
  loading = Promise.resolve();
}

/** Signs out, then reloads the page so no unlocked lesson stays in memory. */
export async function signOut(everywhere = false) {
  try { await siteApi(everywhere ? '/site-auth/logout-all' : '/site-auth/logout', { body: {} }); } catch { /* signed out anyway */ }
  window.location.reload();
}

/**
 * What this visitor may open: everything while an administrator keeps the
 * courses free for everyone, else their own level. Unknown mode opens nothing.
 */
export const effectiveLevel = (s: AccountState): AccessLevel => (s.mode === 'free' ? 'premium' : s.access.level);

/**
 * For the words of the pages: true unless the courses are known to be in
 * Premium mode (the pre-rendered pages speak of the free courses).
 */
export const freeForAllCopy = (s: AccountState) => s.mode !== 'premium';

/** The account: a visitor on the server and at hydration, then the real one. */
export function useAccount(): AccountState {
  return useSyncExternalStore(subscribe, () => state, () => INITIAL);
}
