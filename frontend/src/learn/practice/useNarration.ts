// The recording of a text, played sentence by sentence: which sentence is
// being read (to light it up), seeking to a sentence, speed, and switching
// between the woman’s voice, the man’s voice and the dialogue version while
// staying on the same sentence.
//
// The recordings are not offered for download: they are stored scrambled
// (public/learn/texts/<id>-<voice>.dat, not a playable file), downloaded by
// the page, put back in order in memory and played from there. It is not
// copy protection, but there is no audio file to save and nothing for a
// download manager to catch.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { beforeSpeak, stop as stopPhrase } from '../audio';
import audioIndex from './text-audio.json';
import type { Narration, NarrationId } from './types';

// JSON infers number[][] for the sentence times: they are written as pairs by the script.
const INDEX = audioIndex as unknown as Record<string, Partial<Record<NarrationId, Narration>>>;

export const narrationOf = (textId: string, n: NarrationId): Narration | undefined => INDEX[textId]?.[n];
/** The stored file of a recording, with its content version (the server caches it for a long time). */
const narrationSrc = (textId: string, n: NarrationId) => {
  const x = narrationOf(textId, n);
  return x ? `/learn/texts/${textId}-${n}.dat?v=${x.v}` : null;
};
export const hasNarration = (textId: string) => Object.keys(INDEX[textId] ?? {}).length > 0;

/** The same key as scripts/practice-audio.mjs. */
const KEY = new TextEncoder().encode('lfwn-lecture-2026');
function unscramble(u: Uint8Array) {
  for (let i = 0; i < u.length; i++) u[i] ^= KEY[i % KEY.length] ^ (i & 0xff);
}

/** Recordings ready to play in this visit (in memory), and the ones on their way. */
const ready = new Map<string, string>();
const pending = new Map<string, Promise<string>>();
function load(src: string): Promise<string> {
  const hit = ready.get(src);
  if (hit) return Promise.resolve(hit);
  let p = pending.get(src);
  if (!p) {
    p = fetch(src)
      .then(r => { if (!r.ok) throw new Error(`audio ${r.status}`); return r.arrayBuffer(); })
      .then(buf => {
        const bytes = new Uint8Array(buf);
        unscramble(bytes);
        const url = URL.createObjectURL(new Blob([bytes], { type: 'audio/mpeg' }));
        ready.set(src, url);
        return url;
      })
      .finally(() => pending.delete(src));
    pending.set(src, p);
  }
  return p;
}

export const RATES = [0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.4, 1.5];

/** Seeking to a sentence lands this much before its first sound (no clipped syllable). */
const LEAD_IN = 0.06;

/** Index of the sentence being read at `t` (the last one started), -1 before the first. */
export function sentenceAt(n: Narration | undefined, t: number): number {
  if (!n) return -1;
  let i = -1;
  for (let k = 0; k < n.s.length; k++) { if (n.s[k][0] <= t + LEAD_IN + 0.05) i = k; else break; }
  return i;
}

export interface NarrationApi {
  versions: NarrationId[];
  version: NarrationId | null;
  meta: Narration | undefined;
  playing: boolean;
  /** The recording is still being downloaded. */
  loading: boolean;
  /** It could not be downloaded. */
  failed: boolean;
  time: number;
  rate: number;
  current: number;
  toggle: () => void;
  pause: () => void;
  playFrom: (i: number) => void;
  seek: (t: number) => void;
  prev: () => void;
  next: () => void;
  replay: () => void;
  setRate: (r: number) => void;
  choose: (n: NarrationId, play?: boolean) => void;
}

export function useNarration(textId: string, offered: NarrationId[]): NarrationApi {
  const versions = useMemo(() => offered.filter(n => narrationOf(textId, n)), [textId, offered]);
  const [version, setVersion] = useState<NarrationId | null>(versions[0] ?? null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [time, setTime] = useState(0);
  const [rate, setRateState] = useState(1);
  const audio = useRef<HTMLAudioElement | null>(null);
  const frame = useRef(0);
  const lastTick = useRef(0);
  const meta = version ? narrationOf(textId, version) : undefined;
  const current = sentenceAt(meta, time);

  const stopLoop = () => { cancelAnimationFrame(frame.current); frame.current = 0; };
  // About ten updates a second: enough to light up sentences, light on the page.
  const loop = useCallback(() => {
    const tick = () => {
      const a = audio.current;
      if (!a) return;
      const now = performance.now();
      if (now - lastTick.current > 90) { lastTick.current = now; setTime(a.currentTime); }
      frame.current = requestAnimationFrame(tick);
    };
    tick();
  }, []);

  /** The audio element of a version, created on first use; its recording is fetched if needed. */
  const element = useCallback((n: NarrationId) => {
    const src = narrationSrc(textId, n);
    if (!src) return null;
    if (audio.current && audio.current.dataset.version === n) return audio.current;
    audio.current?.pause();
    const a = new Audio();
    a.dataset.version = n;
    a.preload = 'auto';
    a.playbackRate = rate;
    a.onplay = () => { setPlaying(true); stopLoop(); loop(); };
    a.onpause = () => { setPlaying(false); stopLoop(); setTime(a.currentTime); };
    a.onended = () => { setPlaying(false); stopLoop(); setTime(a.duration || a.currentTime); };
    a.onloadedmetadata = () => { if (audio.current === a) setLoading(false); };
    // Animation frames stop in a background tab: the audio’s own clock takes over.
    a.ontimeupdate = () => { if (performance.now() - lastTick.current > 300) { lastTick.current = performance.now(); setTime(a.currentTime); } };
    audio.current = a;
    const url = ready.get(src);
    if (url) a.src = url;
    else {
      setLoading(true);
      load(src)
        .then(u => { if (!a.src) a.src = u; })
        .catch(() => { if (audio.current === a) { setFailed(true); setLoading(false); } });
    }
    return a;
  }, [textId, rate, loop]);

  /** Plays from `at` (seconds) or from where it is, as soon as the recording is there. */
  const start = useCallback((a: HTMLAudioElement, at?: number) => {
    stopPhrase();
    const go = () => {
      if (at !== undefined) { a.currentTime = Math.max(0, at); setTime(a.currentTime); }
      a.play().catch(() => setPlaying(false));
    };
    // Straight away when ready (the browser lets a tap start the sound), else when it arrives.
    if (a.readyState >= 1) go();
    else a.addEventListener('loadedmetadata', go, { once: true });
  }, []);

  const pause = useCallback(() => { audio.current?.pause(); }, []);

  const toggle = useCallback(() => {
    if (!version) return;
    const a = element(version);
    if (!a) return;
    if (!a.paused) { a.pause(); return; }
    const d = meta?.d ?? a.duration;
    start(a, d && a.currentTime >= d - 0.05 ? 0 : undefined);
  }, [version, element, meta, start]);

  const playFrom = useCallback((i: number) => {
    if (!version || !meta || !meta.s[i]) return;
    const a = element(version);
    if (a) start(a, meta.s[i][0] - LEAD_IN);
  }, [version, meta, element, start]);

  const seek = useCallback((t: number) => {
    if (!version) return;
    const a = element(version);
    if (!a) return;
    const set = () => { a.currentTime = t; setTime(t); };
    if (a.readyState < 1) a.addEventListener('loadedmetadata', set, { once: true }); else set();
    setTime(t);
  }, [version, element]);

  const replay = useCallback(() => playFrom(Math.max(0, current)), [playFrom, current]);
  const prev = useCallback(() => {
    if (!meta) return;
    const i = Math.max(0, current);
    // Well into a sentence: back to its start; at its start: the sentence before.
    playFrom(meta.s[i] && time - meta.s[i][0] > 1.2 ? i : Math.max(0, i - 1));
  }, [meta, current, time, playFrom]);
  const next = useCallback(() => { if (meta) playFrom(Math.min(meta.s.length - 1, current + 1)); }, [meta, current, playFrom]);

  const setRate = useCallback((r: number) => {
    setRateState(r);
    if (audio.current) audio.current.playbackRate = r;
  }, []);

  /** Another voice, from the same sentence. */
  const choose = useCallback((n: NarrationId, play = true) => {
    if (n === version && audio.current) { if (play) toggle(); return; }
    const nextMeta = narrationOf(textId, n);
    const wasPlaying = !!audio.current && !audio.current.paused;
    audio.current?.pause();
    setVersion(n);
    const i = sentenceAt(meta, time);
    const at = nextMeta && i >= 0 ? nextMeta.s[Math.min(i, nextMeta.s.length - 1)][0] - LEAD_IN : 0;
    const a = element(n);
    if (!a) return;
    if (play || wasPlaying) start(a, at);
    else { setTime(Math.max(0, at)); a.addEventListener('loadedmetadata', () => { a.currentTime = Math.max(0, at); }, { once: true }); }
  }, [version, textId, meta, time, element, start, toggle]);

  // The first recording is fetched as soon as the page opens (so that a tap plays at
  // once), the other voices right after it.
  useEffect(() => {
    const first = versions[0];
    if (!first) return;
    element(first);
    const firstSrc = narrationSrc(textId, first)!;
    load(firstSrc).then(() => versions.slice(1).forEach(v => { load(narrationSrc(textId, v)!).catch(() => {}); })).catch(() => {});
    // Only when the text changes: `element` is not a reason to start again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textId, versions]);

  // A word or an example heard elsewhere on the page pauses the text.
  useEffect(() => {
    const f = () => audio.current?.pause();
    beforeSpeak.add(f);
    return () => { beforeSpeak.delete(f); };
  }, []);

  // Leaving the page stops the recording.
  useEffect(() => () => { stopLoop(); audio.current?.pause(); audio.current = null; }, [textId]);

  return { versions, version, meta, playing, loading: loading && !failed, failed, time, rate, current, toggle, pause, playFrom, seek, prev, next, replay, setRate, choose };
}
