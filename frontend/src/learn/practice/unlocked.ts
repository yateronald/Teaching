// Authenticated server loader for practice items & games that are stripped
// from the public bundle (texts, missions, dialogues, ear labs, listening docs,
// dictations, and game entitlement verification). Immediately purges cached
// unlocked data whenever account access is downgraded.
import { useEffect, useState, useSyncExternalStore } from 'react';
import { canOpen, itemTier } from '../access';
import { siteApi, type ApiError } from '../account/api';
import { effectiveLevel, loadAccount, registerAccessRevokeListener, useAccount } from '../account/store';
import { registerRecordings } from '../audio';
import { registerTextAudio } from './useNarration';
import type { Narration, NarrationId } from './types';

export type PracticeKind = 'text' | 'mission' | 'dialogue' | 'ear' | 'doc' | 'dictation' | 'game';

interface PracticeApiResponse<T> {
  id: string;
  kind: PracticeKind;
  tier: 'visitor' | 'free' | 'premium';
  data: T | null;
  audio?: { keys?: string[]; sealed?: string[] };
  textAudio?: Partial<Record<NarrationId, Narration>> | null;
}

const unlocked = new Map<string, unknown>();
const inflight = new Map<string, Promise<unknown>>();
let revokeEpoch = 0;
let version = 0;
const listeners = new Set<() => void>();
const notify = () => { version++; listeners.forEach(l => l()); };
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

if (typeof window !== 'undefined') {
  registerAccessRevokeListener((nextLevel) => {
    revokeEpoch++;
    let dropped = false;
    for (const key of [...unlocked.keys()]) {
      if (!canOpen(nextLevel, itemTier(key))) {
        unlocked.delete(key);
        inflight.delete(key);
        dropped = true;
      }
    }
    if (dropped) notify();
  });
}

async function fetchUnlocked<T>(kind: PracticeKind, id: string): Promise<{ status: 'ok'; data: T | null } | { status: 'locked' | 'error' }> {
  const key = `${kind}:${id}`;
  if (unlocked.has(key)) return { status: 'ok', data: unlocked.get(key) as T };
  let p = inflight.get(key) as Promise<{ status: 'ok'; data: T | null } | { status: 'locked' | 'error' }> | undefined;
  if (!p) {
    const myEpoch = revokeEpoch;
    p = (async () => {
      try {
        const res = await siteApi<PracticeApiResponse<T>>(`/learn/content/practice/${kind}/${encodeURIComponent(id)}`);
        if (myEpoch !== revokeEpoch) return { status: 'locked' as const };
        if (res.audio) registerRecordings(res.audio.keys, res.audio.sealed);
        if (kind === 'text' && res.textAudio) registerTextAudio(id, res.textAudio);
        unlocked.set(key, res.data);
        notify();
        return { status: 'ok' as const, data: res.data };
      } catch (err) {
        const e = err as ApiError;
        if (e.status === 401 || e.status === 403) {
          void loadAccount(true);
          return { status: 'locked' as const };
        }
        return { status: 'error' as const };
      } finally {
        inflight.delete(key);
      }
    })();
    inflight.set(key, p);
  }
  return p;
}

export function useUnlockedPractice<T>(
  kind: PracticeKind,
  id: string,
  localData: T | null,
  needsServerUnlock: boolean,
): { data: T | null; status: 'ready' | 'loading' | 'locked' | 'error' } {
  const account = useAccount();
  const ver = useSyncExternalStore(subscribe, () => version, () => 0);
  const key = `${kind}:${id}`;
  const tier = itemTier(key);
  const level = effectiveLevel(account);
  const allowed = canOpen(level, tier);
  const [reqState, setReqState] = useState<'idle' | 'loading' | 'locked' | 'error'>('idle');
  const cached = unlocked.has(key) ? (unlocked.get(key) as T) : null;

  useEffect(() => {
    if (!needsServerUnlock || !allowed || unlocked.has(key)) return;
    let alive = true;
    setReqState('loading');
    fetchUnlocked<T>(kind, id).then(r => {
      if (!alive) return;
      setReqState(r.status === 'ok' ? 'idle' : r.status);
    });
    return () => { alive = false; };
  }, [kind, id, key, needsServerUnlock, allowed, ver]);

  if (!needsServerUnlock) return { data: localData, status: 'ready' };
  if (!allowed) return { data: null, status: 'locked' };
  if (unlocked.has(key)) return { data: cached, status: 'ready' };
  if (reqState === 'locked') return { data: null, status: 'locked' };
  if (reqState === 'error') return { data: null, status: 'error' };
  return { data: null, status: 'loading' };
}
