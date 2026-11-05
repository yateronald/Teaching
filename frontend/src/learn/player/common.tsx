// Small pieces shared by the activities: rich text, the speaker button, the
// accent keyboard, answer comparison and speech recognition.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SoundOutlined } from '@ant-design/icons';
import { hasRecording, speak, usePlaying } from '../audio';
import type { Lang, Voice } from '../types';
import { UI } from '../ui';

/** **bold** and __highlight__ inside interface or lesson text. */
export function Rich({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|__[^_]+__)/g).filter(Boolean);
  return (
    <span className={className}>
      {parts.map((p, i) => {
        if (p.startsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>;
        if (p.startsWith('__')) return <mark key={i} className="lx-hl">{p.slice(2, -2)}</mark>;
        return <React.Fragment key={i}>{p}</React.Fragment>;
      })}
    </span>
  );
}

/** Paragraphs separated by blank lines, each with rich text. */
export function RichBlock({ text, className }: { text: string; className?: string }) {
  return (
    <div className={className}>
      {text.split(/\n\s*\n/).map((p, i) => <p key={i}><Rich text={p} /></p>)}
    </div>
  );
}

export function AudioButton({ text, voice = 'f', lang, size = 'md', slow = false, label }: { text: string; voice?: Voice; lang: Lang; size?: 'sm' | 'md' | 'lg'; slow?: boolean; label?: string }) {
  const playing = usePlaying(text, voice);
  const ui = UI[lang].player;
  // No speaker button for a phrase that has no recording yet.
  if (!hasRecording(text, voice)) return null;
  return (
    <button
      type="button"
      className={`lx-audio is-${size}${playing ? ' is-playing' : ''}${slow ? ' is-slow' : ''}`}
      onClick={e => { e.stopPropagation(); speak(text, { voice, rate: slow ? 0.72 : 1 }); }}
      aria-label={label ?? (slow ? ui.slow : ui.listen)}
      title={label ?? (slow ? ui.slow : ui.listen)}
    >
      {slow ? <span className="lx-audio-slow" aria-hidden>0.7×</span> : <SoundOutlined aria-hidden />}
      {playing && <span className="lx-audio-wave" aria-hidden><i /><i /><i /></span>}
    </button>
  );
}

/** A French phrase with its speaker: tap the text or the button to hear it. */
export function Phrase({ fr, voice, lang, className }: { fr: string; voice?: Voice; lang: Lang; className?: string }) {
  return (
    <span className={`lx-phrase ${className ?? ''}`}>
      <AudioButton text={fr} voice={voice} lang={lang} size="sm" />
      <button type="button" className="lx-phrase-text" onClick={() => speak(fr, { voice })}>{fr}</button>
    </span>
  );
}

const ACCENTS = ['é', 'è', 'ê', 'à', 'â', 'ç', 'ù', 'û', 'î', 'ï', 'ô', 'œ', '’'];

/** Accent keys that type into the last focused field. */
export function AccentKeys({ target, lang }: { target: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>; lang: Lang }) {
  const insert = (ch: string) => {
    const el = target.current;
    if (!el) return;
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const next = el.value.slice(0, start) + ch + el.value.slice(end);
    const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value')?.set;
    setter?.call(el, next);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.focus();
    requestAnimationFrame(() => el.setSelectionRange(start + ch.length, start + ch.length));
  };
  return (
    <div className="lx-accents" role="group" aria-label={UI[lang].player.accents}>
      {ACCENTS.map(a => (
        <button key={a} type="button" onMouseDown={e => e.preventDefault()} onClick={() => insert(a)}>{a}</button>
      ))}
    </div>
  );
}

// ── Comparing answers ──

const stripAccents = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
export const normalize = (s: string) => s
  .toLowerCase()
  .replace(/[’`´]/g, "'")
  .replace(/\s*'\s*/g, "'")
  .replace(/[.!?…,;:«»"]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

export type Match = 'exact' | 'accents' | 'no';
/** exact, right but for accents, or wrong. */
export function compare(given: string, accepted: string[]): { match: Match; best: string } {
  const g = normalize(given);
  for (const a of accepted) if (normalize(a) === g) return { match: 'exact', best: a };
  for (const a of accepted) if (stripAccents(normalize(a)) === stripAccents(g)) return { match: 'accents', best: a };
  return { match: 'no', best: accepted[0] };
}

/** Word-by-word comparison for dictation and speech: which expected words were found. */
export function wordDiff(given: string, expected: string, accentStrict = false): { word: string; ok: boolean }[] {
  const prep = (s: string) => (accentStrict ? normalize(s) : stripAccents(normalize(s))).replace(/'/g, "' ").split(' ').filter(Boolean);
  const exp = expected.replace(/[’]/g, "'").replace(/'/g, "' ").split(/\s+/).filter(Boolean);
  const g = prep(given);
  const pool = [...g];
  return exp.map(word => {
    const key = prep(word)[0] ?? '';
    const i = pool.indexOf(key);
    if (i >= 0) pool.splice(i, 1);
    return { word: word.replace(/' $/, "'"), ok: i >= 0 || key === '' };
  });
}

// ── Speech recognition (Chrome, Edge, Safari) ──

interface RecognitionLike {
  lang: string; interimResults: boolean; maxAlternatives: number; continuous: boolean;
  start(): void; stop(): void; abort(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
}

export function speechSupported(): boolean {
  if (typeof window === 'undefined') return false;
  const w = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
  return !!(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export function useSpeech() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const rec = useRef<RecognitionLike | null>(null);

  const start = useCallback(() => {
    const w = window as unknown as { SpeechRecognition?: new () => RecognitionLike; webkitSpeechRecognition?: new () => RecognitionLike };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) { setError('unsupported'); return; }
    const r = new Ctor();
    r.lang = 'fr-FR';
    r.interimResults = true;
    r.maxAlternatives = 1;
    r.continuous = false;
    setTranscript('');
    setError(null);
    r.onresult = e => {
      let text = '';
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
      setTranscript(text);
    };
    r.onerror = e => { setError(e.error); setListening(false); };
    r.onend = () => setListening(false);
    rec.current = r;
    setListening(true);
    try { r.start(); } catch { setListening(false); }
  }, []);

  const stop = useCallback(() => { rec.current?.stop(); }, []);
  useEffect(() => () => rec.current?.abort(), []);
  return { listening, transcript, error, start, stop };
}

/** Deterministic shuffle (the same order on the server and in the browser). */
export function seededShuffle<X>(items: X[], seed: string): X[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619) >>> 0;
  const rand = () => { h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0; h = Math.imul(h ^ (h >>> 13), 3266489909) >>> 0; return ((h ^= h >>> 16) >>> 0) / 4294967296; };
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
