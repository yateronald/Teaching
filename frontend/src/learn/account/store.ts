// Who is signed in on the website, and what they may open. Read on mount,
// kept live across Admin mode switches & entitlement updates via SSE,
// BroadcastChannel, visibility re-checks, and response headers.
import { useSyncExternalStore } from 'react';
import { canOpen, type AccessLevel, type Tier } from '../access';
import { apiUrl, setModeHeaderObserver, siteApi } from './api';

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

export interface PortalUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

export interface SiteAccess { level: AccessLevel; website: boolean; staff: boolean; premium: { until: string | null; via: string } | null }
export interface AccountState {
  status: 'unknown' | 'ready' | 'offline';
  user: SiteUser | null;
  portalUser: PortalUser | null;
  access: SiteAccess;
  premiumRequest: { status: string; created_at: string } | null;
  google: boolean;
  /** Online payment (Paystack) is available. */
  payments: boolean;
  /** free: everything open to everyone (set by an administrator); premium: the access levels apply; null: not known yet. */
  mode: 'free' | 'premium' | null;
  /** Non-null right after an active session was downgraded (e.g. Admin enabled Premium mid-lesson). */
  revokedNotice: { at: number; reason: 'mode' | 'access' } | null;
}

const VISITOR: SiteAccess = { level: 'visitor', website: false, staff: false, premium: null };
const INITIAL: AccountState = {
  status: 'unknown',
  user: null,
  portalUser: null,
  access: VISITOR,
  premiumRequest: null,
  google: false,
  payments: false,
  mode: null,
  revokedNotice: null,
};

const RANK: Record<AccessLevel, number> = { visitor: 0, free: 1, premium: 2 };

let state: AccountState = INITIAL;
const listeners = new Set<() => void>();
const revokeListeners = new Set<(nextLevel: AccessLevel, mode: 'free' | 'premium' | null) => void>();
const emit = () => listeners.forEach(l => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

export const effectiveLevel = (s: AccountState): AccessLevel => (s.mode === 'free' ? 'premium' : s.access.level);
export const freeForAllCopy = (s: AccountState) => s.mode !== 'premium';
export const isTierLocked = (s: AccountState, tier: Tier): boolean => s.mode === 'premium' && !canOpen(effectiveLevel(s), tier);

/** Subscribes a cache/registry cleanup callback invoked immediately when access drops. */
export function registerAccessRevokeListener(fn: (nextLevel: AccessLevel, mode: 'free' | 'premium' | null) => void) {
  revokeListeners.add(fn);
  return () => { revokeListeners.delete(fn); };
}

function applyState(patch: Partial<AccountState>) {
  const prev = state;
  const prevLevel = effectiveLevel(prev);
  const next: AccountState = { ...prev, ...patch, status: patch.status ?? 'ready' };
  const nextLevel = effectiveLevel(next);
  const downgraded = (prev.status === 'ready' && RANK[nextLevel] < RANK[prevLevel])
    || (prev.mode === 'free' && next.mode === 'premium' && RANK[nextLevel] < RANK.premium);
  if (downgraded) {
    next.revokedNotice = { at: Date.now(), reason: prev.mode !== next.mode ? 'mode' : 'access' };
  }
  state = next;
  if (downgraded) {
    revokeListeners.forEach(fn => {
      try { fn(nextLevel, next.mode); } catch { /* ignore */ }
    });
  }
  emit();
}

export function setAccount(patch: Partial<AccountState>) {
  applyState(patch);
}

export function clearRevokedNotice() {
  if (!state.revokedNotice) return;
  state = { ...state, revokedNotice: null };
  emit();
}

function broadcastRefresh() {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') return;
  try {
    const ch = new BroadcastChannel('lfwn-learn-access');
    ch.postMessage({ type: 'refresh' });
    ch.close();
  } catch { /* ignore */ }
}

setModeHeaderObserver((hdrMode) => {
  if (state.mode && state.mode !== hdrMode) {
    applyState({ mode: hdrMode });
    void loadAccount(true);
  }
});

let loading: Promise<void> | null = null;
let activeEs: EventSource | null = null;
let sseOpen = false;
let reconnectAccessStream: (() => void) | null = null;

function portalToken(): string | null {
  try { return localStorage.getItem('token'); } catch { return null; }
}

interface MePayload {
  user: SiteUser | null;
  portal_user?: PortalUser | null;
  access: SiteAccess;
  premium_request: AccountState['premiumRequest'];
  mode?: 'free' | 'premium';
  google?: boolean;
  payments?: boolean;
}

/** Reads the live account, mode, and portal bridge (`force` re-reads fresh from server). */
export function loadAccount(force = false): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (loading && !force) return loading;
  const run = (async () => {
    try {
      let me = await siteApi<MePayload>('/site-auth/me');
      // Fallback for older API responses that omit mode/google/payments on /me.
      let config: { google?: boolean; payments?: boolean; mode?: 'free' | 'premium' } | null = null;
      if (me.mode === undefined) {
        config = await siteApi<{ google: boolean; payments?: boolean; mode?: 'free' | 'premium' }>('/site-auth/config').catch(() => null);
      }
      // If no website cookie yet, check if the person is logged into the portal (Admin / Teacher / Student).
      let syncedPortal = false;
      if (!me.user) {
        const tok = portalToken();
        if (tok) {
          const synced = await siteApi<MePayload>('/site-auth/portal-sync', {
            method: 'POST',
            headers: { Authorization: `Bearer ${tok}` },
            body: {},
          }).catch(() => null);
          if (synced) {
            me = synced;
            syncedPortal = !!synced.user;
          }
        }
      }
      const rawMode = me.mode ?? config?.mode;
      // Fail closed: unless server explicitly returns 'free', enforce 'premium'.
      const mode: 'free' | 'premium' = rawMode === 'free' ? 'free' : 'premium';
      applyState({
        status: 'ready',
        user: me.user,
        portalUser: me.user ? null : (me.portal_user ?? null),
        access: me.user ? (me.access || VISITOR) : VISITOR,
        premiumRequest: me.premium_request ?? null,
        google: me.google ?? !!config?.google,
        payments: me.payments ?? !!config?.payments,
        mode,
      });
      if (syncedPortal) reconnectAccessStream?.();
    } catch {
      // Server unreachable: fail closed (never grant extra unlocked content).
      applyState({ status: 'offline', user: null, portalUser: null, access: VISITOR, mode: 'premium' });
    }
  })();
  loading = run;
  return run;
}

/** After a website sign-in or sign-up. */
export function signedIn(data: { user: SiteUser; access: SiteAccess; mode?: 'free' | 'premium'; google?: boolean; payments?: boolean }) {
  applyState({
    status: 'ready',
    user: data.user,
    portalUser: null,
    access: data.access,
    premiumRequest: null,
    revokedNotice: null,
    ...(data.mode ? { mode: data.mode } : {}),
    ...(data.google !== undefined ? { google: data.google } : {}),
    ...(data.payments !== undefined ? { payments: data.payments } : {}),
  });
  loading = Promise.resolve();
  reconnectAccessStream?.();
  broadcastRefresh();
}

/** Signs out of both website and bridged portal token (so reload stays signed out). */
export async function signOut(everywhere = false) {
  const tok = portalToken();
  if (tok) {
    try { localStorage.removeItem('token'); } catch { /* ignore */ }
    try {
      await fetch(apiUrl('/auth/logout'), {
        method: 'POST',
        credentials: 'include',
        headers: { Authorization: `Bearer ${tok}` },
      });
    } catch { /* signed out anyway */ }
  }
  try { await siteApi(everywhere ? '/site-auth/logout-all' : '/site-auth/logout', { body: {} }); } catch { /* signed out anyway */ }
  broadcastRefresh();
  window.location.reload();
}

let watcherStarted = false;
let lastRefreshAt = 0;

/** Connects live SSE stream + multi-tab broadcast + focus re-check (once per browser session). */
export function startAccessWatcher() {
  if (typeof window === 'undefined' || watcherStarted) return;
  watcherStarted = true;

  const refreshThrottled = () => {
    const now = Date.now();
    if (now - lastRefreshAt < 2500) return;
    lastRefreshAt = now;
    void loadAccount(true);
  };

  const openStream = () => {
    if (typeof EventSource === 'undefined') return;
    try {
      activeEs?.close();
      sseOpen = false;
      const es = new EventSource(apiUrl('/site-auth/events'), { withCredentials: true });
      activeEs = es;
      es.onopen = () => { sseOpen = true; };
      es.onerror = () => { sseOpen = false; };
      es.addEventListener('mode', (ev: MessageEvent) => {
        try {
          const data = JSON.parse(String(ev.data || '{}')) as { mode?: string };
          if (data.mode === 'free' || data.mode === 'premium') {
            applyState({ mode: data.mode });
            void loadAccount(true);
          }
        } catch { /* ignore */ }
      });
      es.addEventListener('state', (ev: MessageEvent) => {
        try {
          const data = JSON.parse(String(ev.data || '{}')) as { mode?: string };
          if ((data.mode === 'free' || data.mode === 'premium') && state.status === 'ready' && state.mode !== data.mode) {
            applyState({ mode: data.mode });
            void loadAccount(true);
          }
        } catch { /* ignore */ }
      });
      es.addEventListener('access', () => { void loadAccount(true); });
    } catch { /* SSE unavailable */ }
  };

  reconnectAccessStream = openStream;
  openStream();

  if (typeof BroadcastChannel !== 'undefined') {
    try {
      const ch = new BroadcastChannel('lfwn-learn-access');
      ch.onmessage = (e) => {
        if (e.data?.type === 'refresh') refreshThrottled();
      };
    } catch { /* ignore */ }
  }

  window.addEventListener('focus', refreshThrottled);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') refreshThrottled();
  });
  window.addEventListener('storage', (e) => {
    if (e.key === 'token') refreshThrottled();
  });
  // Fallback poll only if SSE is disconnected while the tab is visible.
  window.setInterval(() => {
    if (!sseOpen && document.visibilityState === 'visible') refreshThrottled();
  }, 20000);
}

/** The account: a visitor on the server and at hydration, then live state. */
export function useAccount(): AccountState {
  return useSyncExternalStore(subscribe, () => state, () => INITIAL);
}
