// The player of a listening document: play/pause, back five seconds, a seek
// bar and the time, in the look of the reading player. The recording is sealed
// (src/learn/sealedAudio.ts) and played without the browser's own controls, so
// there is no player menu offering to download it.
import { useEffect, useState, type CSSProperties, type RefObject } from 'react';
import { CaretRightFilled, LoadingOutlined, PauseOutlined, UndoOutlined } from '@ant-design/icons';
import { recordingUrl, stop as stopPhrase } from '../../audio';
import type { Lang, Voice } from '../../types';
import { fmtTime } from '../model';
import { listeningCopy } from './copy';
import '../practice.css';

interface Props {
  text: string;
  voice: Voice;
  rate: number;
  lang: Lang;
  /** The audio element, for the page to pause it or start it again. */
  audio: RefObject<HTMLAudioElement | null>;
  /** The document has started playing at least once. */
  onHeard: () => void;
}

export function ListeningPlayer({ text, voice, rate, lang, audio, onHeard }: Props) {
  const c = listeningCopy[lang];
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Another voice: its recording is loaded (and unscrambled) before it can play.
  useEffect(() => {
    let live = true;
    setSrc(null); setFailed(false); setPlaying(false); setTime(0); setDuration(0);
    const url = recordingUrl(text, voice);
    if (!url) setFailed(true);
    else url.then(u => { if (live) setSrc(u); }, () => { if (live) setFailed(true); });
    return () => { live = false; };
  }, [text, voice]);

  useEffect(() => {
    const a = audio.current;
    if (a) { a.defaultPlaybackRate = rate; a.playbackRate = rate; }
  }, [audio, rate, src]);

  const toggle = () => {
    const a = audio.current;
    if (!a || !src) return;
    if (a.paused) a.play().catch(() => setFailed(true)); else a.pause();
  };
  const seek = (t: number) => {
    const a = audio.current;
    if (!a || !src) return;
    a.currentTime = Math.max(0, Math.min(t, duration || t));
    setTime(a.currentTime);
  };
  const loading = !src && !failed;
  const label = loading ? c.loading : playing ? c.pause : c.play;
  const shown = Math.min(time, duration || time);

  return (
    <>
      <div className="rxl-player" role="group" aria-label={c.play} onContextMenu={e => e.preventDefault()}>
        <audio
          ref={audio} src={src ?? undefined} preload="auto"
          onPlay={() => { stopPhrase(); setPlaying(true); }}
          onPlaying={onHeard}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onTimeUpdate={e => setTime(e.currentTarget.currentTime)}
          onLoadedMetadata={e => { setDuration(e.currentTarget.duration || 0); e.currentTarget.playbackRate = rate; }}
          onError={() => { if (src) setFailed(true); }}
        />
        <button type="button" className="rx-pl-play" onClick={toggle} disabled={!src} aria-label={label} title={label} aria-busy={loading}>
          {loading ? <LoadingOutlined /> : playing ? <PauseOutlined /> : <CaretRightFilled />}
        </button>
        <div className="rx-pl-seek">
          <span className="rx-pl-time">{fmtTime(shown)}</span>
          <input
            type="range" min={0} max={duration || 1} step={0.1} value={shown} disabled={!src}
            style={{ '--p': `${duration ? (shown / duration) * 100 : 0}%` } as CSSProperties}
            onChange={e => seek(Number(e.target.value))}
            aria-label={c.seek} aria-valuetext={`${fmtTime(shown)} / ${fmtTime(duration)}`}
          />
          <span className="rx-pl-time">{fmtTime(duration)}</span>
        </div>
        <button type="button" className="rxl-back5" onClick={() => seek(time - 5)} disabled={!src} aria-label={c.back5} title={c.back5}>
          <UndoOutlined aria-hidden /> 5 s
        </button>
      </div>
      {failed && <p role="status" className="rxl-player-error">{c.unavailable}</p>}
    </>
  );
}
