import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CaretRightFilled, LoadingOutlined, PauseOutlined, WarningOutlined } from '@ant-design/icons';

/* One <audio> element for a whole list of clips: starting a clip stops the previous one.
   Nothing is downloaded until a clip is played. */

export type AudioStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

export function useSharedAudio() {
    const ref = useRef<HTMLAudioElement | null>(null);
    const currentRef = useRef<string | null>(null);
    const [current, setCurrent] = useState<string | null>(null);
    const [status, setStatus] = useState<AudioStatus>('idle');
    const [progress, setProgress] = useState(0);
    const [time, setTime] = useState({ at: 0, total: 0 });

    const ensure = useCallback(() => {
        if (ref.current) return ref.current;
        const a = new Audio();
        a.preload = 'none';
        a.addEventListener('playing', () => setStatus('playing'));
        a.addEventListener('waiting', () => setStatus('loading'));
        a.addEventListener('pause', () => { if (currentRef.current && !a.ended) setStatus(s => (s === 'error' ? s : 'paused')); });
        a.addEventListener('ended', () => { setStatus('idle'); setProgress(0); setTime(t => ({ ...t, at: 0 })); });
        a.addEventListener('error', () => { if (currentRef.current && a.getAttribute('src')) setStatus('error'); });
        a.addEventListener('timeupdate', () => {
            const total = Number.isFinite(a.duration) ? a.duration : 0;
            setProgress(total ? a.currentTime / total : 0);
            setTime({ at: a.currentTime, total });
        });
        ref.current = a;
        return a;
    }, []);

    const stop = useCallback(() => {
        currentRef.current = null;
        const a = ref.current;
        if (a) { a.pause(); a.removeAttribute('src'); a.load(); }
        setCurrent(null);
        setStatus('idle');
        setProgress(0);
        setTime({ at: 0, total: 0 });
    }, []);

    const toggle = useCallback((key: string, src: string) => {
        const a = ensure();
        if (currentRef.current === key) {
            if (a.paused) { setStatus('loading'); a.play().catch(() => setStatus('error')); } else a.pause();
            return;
        }
        a.pause();
        currentRef.current = key;
        setCurrent(key);
        setProgress(0);
        setTime({ at: 0, total: 0 });
        setStatus('loading');
        a.src = src;
        a.play().catch(err => { if (err?.name !== 'AbortError') setStatus('error'); });
    }, [ensure]);

    useEffect(() => () => {
        currentRef.current = null;
        const a = ref.current;
        if (a) { a.pause(); a.removeAttribute('src'); }
    }, []);

    return { current, status, progress, time, toggle, stop };
}

export const fmtClock = (s: number) => {
    const v = Number.isFinite(s) && s > 0 ? s : 0;
    return `${Math.floor(v / 60)}:${String(Math.floor(v % 60)).padStart(2, '0')}`;
};

/** Round play/pause button; the ring shows playback progress. */
export const AudioPlayButton: React.FC<{ status: AudioStatus; progress: number; onClick: () => void; label: string }> = ({ status, progress, onClick, label }) => (
    <button type="button" className={`ap-btn is-${status}`} onClick={onClick}
        style={{ '--p': `${Math.round(Math.min(1, Math.max(0, progress)) * 360)}deg` } as React.CSSProperties}
        aria-label={status === 'playing' ? `Pause ${label}` : `Play ${label}`} title={status === 'error' ? 'The audio could not be played' : undefined}>
        <span className="ap-inner">
            {status === 'loading' ? <LoadingOutlined /> : status === 'playing' ? <PauseOutlined /> : status === 'error' ? <WarningOutlined /> : <CaretRightFilled />}
        </span>
    </button>
);
