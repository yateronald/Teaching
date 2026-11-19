// Small pieces of the ear-training pages: the transcript with its marks and
// the play buttons (normal speed and slowed down).
import { useEffect, type ReactNode } from 'react';
import { PauseOutlined, SoundOutlined } from '@ant-design/icons';
import { prefetchRecording, speak, stop, usePlaying } from '../../audio';
import type { EarVoice } from './types';

/** {x} the key sound, ~x~ not pronounced, ‿ a linking: the rest is plain text. */
export function Marked({ text, className }: { text: string; className?: string }) {
  const out: ReactNode[] = [];
  const re = /\{([^}]*)\}|~([^~]*)~|(‿)/g;
  let last = 0, m: RegExpExecArray | null, k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] !== undefined) out.push(<mark key={k++} className="ear-key">{m[1].split('‿').flatMap((p, i) => (i ? [<span key={i} className="ear-link">‿</span>, p] : [p]))}</mark>);
    else if (m[2] !== undefined) out.push(<span key={k++} className="ear-drop">{m[2]}</span>);
    else out.push(<span key={k++} className="ear-link">‿</span>);
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return <span className={className} lang="fr">{out}</span>;
}

/** Plays a recording; `rate` slows it down. The recordings are sealed (not offered for download). */
export function PlayButton({ text, voice, label, stopLabel, rate = 1, big = false, onPlay, icon }: {
  text: string; voice: EarVoice; label: string; stopLabel: string; rate?: number; big?: boolean; onPlay?: () => void; icon?: ReactNode;
}) {
  const playing = usePlaying(text, voice);
  useEffect(() => { prefetchRecording(text, voice); }, [text, voice]);
  return (
    <button type="button" className={`ear-play${big ? ' is-big' : ''}${playing ? ' is-on' : ''}`} aria-pressed={playing}
      onClick={() => { if (playing) stop(); else { onPlay?.(); void speak(text, { voice, rate }); } }}>
      {playing ? <PauseOutlined aria-hidden /> : (icon ?? <SoundOutlined aria-hidden />)}
      <span>{playing ? stopLabel : label}</span>
    </button>
  );
}
