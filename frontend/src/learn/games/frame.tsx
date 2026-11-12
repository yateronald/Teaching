// What the games share: the full-screen frame, hearts and stars, and the small
// illustrations of the game cards (drawn in CSS: crisp at any size).
import { useEffect, useState } from 'react';
import { CloseOutlined, HeartFilled, SoundOutlined, StarFilled } from '@ant-design/icons';
import { setMuted, stop as stopAudio } from '../audio';
import type { Lang } from '../types';
import { G } from './copy';
import type { GameId } from './meta';
import './games.css';

export function GameFrame({ lang, title, onClose, guard = false, progress, right, children, footer }: {
  lang: Lang;
  title: string;
  onClose: () => void;
  /** Ask before leaving (a game is in progress). */
  guard?: boolean;
  /** 0 to 1: shows a progress bar instead of the title. */
  progress?: number;
  right?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const g = G[lang];
  const [sound, setSound] = useState(true);
  useEffect(() => { setMuted(!sound); }, [sound]);
  useEffect(() => () => { stopAudio(); setMuted(false); }, []);
  const close = () => { if (!guard || window.confirm(g.quitConfirm)) { stopAudio(); onClose(); } };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  return (
    <div className="gx-frame" role="dialog" aria-modal="true" aria-label={title}>
      <header className="gx-top">
        <button type="button" className="lx-icon-btn" onClick={close} aria-label={g.quit} title={g.quit}><CloseOutlined /></button>
        {progress === undefined
          ? <p className="gx-top-title">{title}</p>
          : <div className="lx-pbar" role="progressbar" aria-label={title} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}><i style={{ transform: `scaleX(${progress})`, transition: 'transform 0.4s' }} /></div>}
        <div className="gx-top-right">{right}</div>
        <button type="button" className={`lx-icon-btn${sound ? '' : ' is-off'}`} onClick={() => setSound(s => !s)} aria-pressed={sound} aria-label={g.sound} title={g.sound}><SoundOutlined /></button>
      </header>
      <main className="gx-stage">{children}</main>
      {footer && <footer className="gx-foot"><div className="gx-foot-in">{footer}</div></footer>}
    </div>
  );
}

export function Hearts({ n, max = 3, label }: { n: number; max?: number; label: string }) {
  return (
    <span className="gx-hearts" aria-label={`${n} ${label}`}>
      {Array.from({ length: max }, (_, i) => <HeartFilled key={i} className={i < n ? '' : 'is-lost'} />)}
    </span>
  );
}

export function Stars({ n, max = 3, size = 'md' }: { n: number; max?: number; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <span className={`gx-stars is-${size}`} aria-label={`${n} / ${max}`}>
      {Array.from({ length: max }, (_, i) => <StarFilled key={i} className={i < n ? 'is-on' : ''} />)}
    </span>
  );
}

/** The picture of a game card. The story uses a photograph; the others are drawn. */
export function GameArt({ id }: { id: GameId }) {
  if (id === 'gender') {
    return (
      <div className="gx-art is-gender" aria-hidden>
        <span className="gx-art-word">maison</span>
        <div><b>LE</b><b className="is-on">LA</b></div>
      </div>
    );
  }
  if (id === 'numbers') {
    const cells = [12, 71, 8, 96, 40, 16, 80, 5, 63, 99, 21, 77];
    const on = [1, 4, 6, 9];
    return (
      <div className="gx-art is-numbers" aria-hidden>
        <div>{cells.map((c, i) => <span key={c} className={on.includes(i) ? 'is-on' : ''}>{c}</span>)}</div>
      </div>
    );
  }
  if (id === 'pairs') {
    return (
      <div className="gx-art is-pairs" aria-hidden>
        <span className="is-back" /><span className="is-sound"><SoundOutlined /></span><span className="is-word">le pain</span><span className="is-back" />
      </div>
    );
  }
  if (id === 'daily') {
    const states = ['ok', 'no', 'no', 'no', 'mid'];
    return (
      <div className="gx-art is-daily" aria-hidden>
        <div>{'MERCI'.split('').map((l, i) => <span key={i} className={`is-${states[i]}`}>{l}</span>)}</div>
        <div>{'MATIN'.split('').map((l, i) => <span key={i} className="is-ok">{l}</span>)}</div>
      </div>
    );
  }
  return null;
}
