import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
    VideoTrack,
    useConnectionQualityIndicator,
    useIsSpeaking,
    useLocalParticipant,
    useSpeakingParticipants,
    useTrackMutedIndicator,
    useTracks,
} from '@livekit/components-react';
import { ConnectionQuality, Track } from 'livekit-client';
import type { Participant, TrackPublication } from 'livekit-client';
import { Ic, colorFor, initials } from './meetingUi';

/* ══════════════════════════════════════════
   MEETING STAGE — how the cameras are placed
   • Grid: tiles sized to fill the stage (best columns × aspect for the space)
   • Duo (auto, 2 people): the other person fills the stage, you float as self-view
   • Spotlight / pin / presentation: one main tile + a filmstrip
══════════════════════════════════════════ */

export type LayoutMode = 'auto' | 'grid' | 'spotlight';

type TileRef = { participant: Participant; source: Track.Source; publication?: TrackPublication };
type VideoRef = NonNullable<React.ComponentProps<typeof VideoTrack>['trackRef']>;
type Corner = 'tl' | 'tr' | 'bl' | 'br';

const GAP = 10;
const ASPECTS = [16 / 9, 4 / 3, 1, 3 / 4];

const videoOf = (t: TileRef): VideoRef | null => (t.publication?.track && !t.publication.isMuted ? (t as VideoRef) : null);

/** Largest tile that fits n tiles into W×H; 16:9 wins unless another shape is clearly bigger. */
function fitTiles(n: number, W: number, H: number, gap: number) {
    let best = { cols: 1, w: 0, h: 0 };
    if (n < 1 || W <= 0 || H <= 0) return best;
    for (const aspect of ASPECTS) {
        const bias = aspect === ASPECTS[0] ? 1 : 1.08;
        for (let cols = 1; cols <= n; cols++) {
            const rows = Math.ceil(n / cols);
            let w = (W - gap * (cols - 1)) / cols;
            let h = w / aspect;
            if (h * rows + gap * (rows - 1) > H) {
                h = (H - gap * (rows - 1)) / rows;
                w = h * aspect;
            }
            if (w * h > best.w * best.h * bias) best = { cols, w: Math.floor(w), h: Math.floor(h) };
        }
    }
    return best;
}

function useSize<T extends HTMLElement>() {
    const ref = useRef<T>(null);
    const [size, setSize] = useState({ w: 0, h: 0 });
    useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return;
        const ro = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            setSize(s => (Math.abs(s.w - width) < 1 && Math.abs(s.h - height) < 1 ? s : { w: width, h: height }));
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);
    return [ref, size] as const;
}

/* ── Connection bars (also used in the top bar) ── */
export const QualityBars: React.FC<{ q: ConnectionQuality }> = ({ q }) => {
    const level = q === ConnectionQuality.Excellent ? 3 : q === ConnectionQuality.Good ? 2 : q === ConnectionQuality.Poor ? 1 : 0;
    return (
        <span className={`mr-q is-${q}`} aria-label={`Connection ${q}`}>
            {[1, 2, 3].map(i => <i key={i} className={i <= level ? 'is-on' : ''} />)}
        </span>
    );
};

/* ── One camera tile ── */
interface TileProps {
    tile: TileRef;
    local: boolean;
    host: boolean;
    hand: boolean;
    pinned: boolean;
    onPin?: () => void;
    w?: number;
    h?: number;
    compact?: boolean;
}

const Tile: React.FC<TileProps> = ({ tile, local, host, hand, pinned, onPin, w, h, compact }) => {
    const p = tile.participant;
    const speaking = useIsSpeaking(p);
    const { isMuted: micMuted } = useTrackMutedIndicator({ participant: p, source: Track.Source.Microphone });
    const { quality } = useConnectionQualityIndicator({ participant: p });
    const video = videoOf(tile);
    const name = p.name || p.identity || 'Participant';
    const weak = quality === ConnectionQuality.Poor || quality === ConnectionQuality.Lost;
    const cls = [
        'mr-tile',
        local && 'is-local',
        speaking && !micMuted && 'is-speaking',
        !video && 'is-off',
        pinned && 'is-pinned',
        compact && 'is-compact',
    ].filter(Boolean).join(' ');

    return (
        <div className={cls} style={w && h ? { width: w, height: h } : undefined}>
            {video ? (
                <VideoTrack trackRef={video} className="mr-video" />
            ) : (
                <div className="mr-tile-off">
                    <span className="mr-avatar" style={{ background: colorFor(name) }}>{initials(name)}</span>
                </div>
            )}
            <div className="mr-tile-top">
                {hand && <span className="mr-chip-hand" title="Hand raised">{Ic.hand}</span>}
                {weak && <span className="mr-chip-weak" title="Weak connection"><QualityBars q={quality} /></span>}
            </div>
            {onPin && (
                <button type="button" className="mr-tile-pin" onClick={onPin}
                    aria-label={pinned ? `Unpin ${name}` : `Pin ${name}`} title={pinned ? 'Unpin' : 'Pin to the main stage'}>
                    {Ic.pin}
                </button>
            )}
            <div className="mr-plate">
                <span className={`mr-plate-mic${micMuted ? ' is-muted' : ''}`}>
                    {micMuted ? Ic.micOff : <span className={`mr-eq${speaking ? ' is-on' : ''}`}><i /><i /><i /></span>}
                </span>
                <span className="mr-plate-name">{local ? `${name} (You)` : name}</span>
                {host && <span className="mr-plate-host">Host</span>}
            </div>
        </div>
    );
};

/* ── Shared screen ── */
const ScreenTile: React.FC<{ tile: TileRef; local: boolean; onStopShare: () => void }> = ({ tile, local, onStopShare }) => {
    const video = videoOf(tile);
    const name = tile.participant.name || 'Participant';
    return (
        <div className="mr-screen">
            {local ? (
                // Showing your own screen back to you creates a mirror tunnel — show a status card instead.
                <div className="mr-screen-self">
                    <span className="mr-screen-self-ic">{Ic.share}</span>
                    <strong>You are presenting to everyone</strong>
                    <span>Participants see your screen in full size.</span>
                    <button type="button" className="mr-btn-danger" onClick={onStopShare}>Stop presenting</button>
                </div>
            ) : video ? (
                <VideoTrack trackRef={video} className="mr-screen-video" />
            ) : (
                <div className="mr-screen-wait">Loading {name}'s screen…</div>
            )}
            {!local && <div className="mr-screen-label">{Ic.share}<span>{name} is presenting</span></div>}
        </div>
    );
};

/* ── Floating self-view (drag it to any corner) ── */
const SelfView: React.FC<{ tile: TileProps; stageW: number; stageH: number }> = ({ tile, stageW, stageH }) => {
    const [corner, setCorner] = useState<Corner>('br');
    const [hidden, setHidden] = useState(false);
    const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
    const start = useRef<{ x: number; y: number } | null>(null);
    const el = useRef<HTMLDivElement>(null);

    const portrait = stageH > stageW;
    const w = Math.round(portrait ? Math.min(150, Math.max(96, stageW * 0.3)) : Math.min(260, Math.max(150, stageW * 0.2)));
    const h = Math.round(portrait ? (w * 4) / 3 : (w * 9) / 16);

    const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).closest('button')) return;
        start.current = { x: e.clientX, y: e.clientY };
        e.currentTarget.setPointerCapture(e.pointerId);
    };
    const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!start.current) return;
        setDrag({ x: e.clientX - start.current.x, y: e.clientY - start.current.y });
    };
    const onUp = () => {
        if (!start.current) return;
        start.current = null;
        const box = el.current?.getBoundingClientRect();
        const area = el.current?.parentElement?.getBoundingClientRect();
        if (box && area && drag) {
            const cx = box.left + box.width / 2 - area.left;
            const cy = box.top + box.height / 2 - area.top;
            setCorner(`${cy < area.height / 2 ? 't' : 'b'}${cx < area.width / 2 ? 'l' : 'r'}` as Corner);
        }
        setDrag(null);
    };

    if (hidden) {
        return (
            <button type="button" className={`mr-self-pill is-${corner}`} onClick={() => setHidden(false)}>
                {Ic.user}<span>Show self view</span>
            </button>
        );
    }
    return (
        <div ref={el} className={`mr-self is-${corner}${drag ? ' is-dragging' : ''}`}
            style={{ width: w, height: h, transform: drag ? `translate(${drag.x}px, ${drag.y}px)` : undefined }}
            onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
            <Tile {...tile} onPin={undefined} compact />
            <button type="button" className="mr-self-min" onClick={() => setHidden(true)} aria-label="Hide self view" title="Hide self view">
                {Ic.close}
            </button>
        </div>
    );
};

/* ══════════════════════════════════════════ */

export interface StageProps {
    teacherIdentity: string;
    raisedHands: Set<string>;
    layout: LayoutMode;
    pinned: string | null;
    onPin: (identity: string | null) => void;
    onShowPeople: () => void;
    onStopShare: () => void;
    aloneHint: string;
}

const MeetingStage: React.FC<StageProps> = ({ teacherIdentity, raisedHands, layout, pinned, onPin, onShowPeople, onStopShare, aloneHint }) => {
    const [ref, size] = useSize<HTMLDivElement>();
    const tracks = useTracks(
        [
            { source: Track.Source.Camera, withPlaceholder: true },
            { source: Track.Source.ScreenShare, withPlaceholder: false },
        ],
        { onlySubscribed: false },
    ) as TileRef[];
    const { localParticipant } = useLocalParticipant();
    const speakers = useSpeakingParticipants();
    const localId = localParticipant.identity;

    // Remember who spoke last so spotlight doesn't flicker back when they pause.
    const [lastSpeaker, setLastSpeaker] = useState<string | null>(null);
    useEffect(() => {
        const s = speakers.find(p => p.identity !== localId);
        if (s) setLastSpeaker(s.identity);
    }, [speakers, localId]);

    const screens = tracks.filter(t => t.source === Track.Source.ScreenShare && t.publication);
    const cams = useMemo(() => {
        const rank = (t: TileRef) => (t.participant.identity === teacherIdentity ? 0 : t.participant.identity === localId ? 2 : 1);
        return tracks.filter(t => t.source === Track.Source.Camera).sort((a, b) => rank(a) - rank(b));
    }, [tracks, teacherIdentity, localId]);

    const tileProps = (t: TileRef): TileProps => {
        const id = t.participant.identity;
        return {
            tile: t,
            local: id === localId,
            host: id === teacherIdentity,
            hand: raisedHands.has(id),
            pinned: pinned === id,
            onPin: () => onPin(pinned === id ? null : id),
        };
    };
    const keyOf = (t: TileRef) => `${t.participant.identity}-${t.source}`;

    const W = size.w;
    const H = size.h;
    let content: React.ReactNode = null;

    if (W > 0 && H > 0) {
        const pinnedCam = pinned ? cams.find(c => c.participant.identity === pinned) : undefined;

        if (screens.length || pinnedCam || layout === 'spotlight') {
            const screen = screens.length ? (screens.find(s => s.participant.identity === pinned) || screens[0]) : null;
            const mainCam = screen ? null : (
                pinnedCam
                || cams.find(c => c.participant.identity === lastSpeaker)
                || cams.find(c => c.participant.identity === teacherIdentity && c.participant.identity !== localId)
                || cams.find(c => c.participant.identity !== localId)
                || cams[0]
            );
            const strip = cams.filter(c => c !== mainCam);
            const side = W >= 720 && W > H * 1.1;
            const stripW = side && strip.length ? Math.round(Math.min(260, Math.max(168, W * 0.18))) : 0;
            const stripH = !side && strip.length ? Math.round(Math.min(132, Math.max(76, H * 0.18))) : 0;
            const mainW = W - (stripW ? stripW + GAP : 0);
            const mainH = H - (stripH ? stripH + GAP : 0);
            const fit = fitTiles(1, mainW, mainH, 0);
            const thumbW = side ? stripW : Math.round((stripH * 16) / 9);
            const thumbH = side ? Math.round((stripW * 9) / 16) : stripH;

            content = (
                <div className={`mr-spot ${side ? 'is-side' : 'is-bottom'}`}>
                    <div className="mr-spot-main" style={{ width: mainW, height: mainH }}>
                        {screen
                            ? <ScreenTile tile={screen} local={screen.participant.identity === localId} onStopShare={onStopShare} />
                            : mainCam && <Tile {...tileProps(mainCam)} w={fit.w} h={fit.h} />}
                    </div>
                    {strip.length > 0 && (
                        <div className="mr-strip" style={side ? { width: stripW, height: H } : { width: W, height: stripH }}>
                            {strip.map(t => <Tile key={keyOf(t)} {...tileProps(t)} w={thumbW} h={thumbH} compact />)}
                        </div>
                    )}
                </div>
            );
        } else if (layout === 'auto' && cams.length === 2) {
            const remote = cams.find(c => c.participant.identity !== localId) || cams[0];
            const self = cams.find(c => c !== remote) || cams[1];
            const fit = fitTiles(1, W, H, 0);
            content = (
                <>
                    <div className="mr-grid"><Tile {...tileProps(remote)} w={fit.w} h={fit.h} /></div>
                    <SelfView tile={tileProps(self)} stageW={W} stageH={H} />
                </>
            );
        } else {
            const maxTiles = W < 600 ? 6 : W < 1000 ? 9 : 16;
            let visible = cams;
            let self: TileRef | null = null;
            let overflow = 0;
            if (cams.length > maxTiles) {
                self = cams.find(c => c.participant.identity === localId) || null;
                const others = cams.filter(c => c !== self);
                visible = others.slice(0, maxTiles - 1);
                overflow = others.length - visible.length;
            }
            const fit = fitTiles(visible.length + (overflow ? 1 : 0), W, H, GAP);
            const hidden = cams.filter(c => c !== self && !visible.includes(c));
            content = (
                <>
                    <div className="mr-grid" style={{ maxWidth: fit.cols * fit.w + (fit.cols - 1) * GAP }}>
                        {visible.map(t => <Tile key={keyOf(t)} {...tileProps(t)} w={fit.w} h={fit.h} />)}
                        {overflow > 0 && (
                            <button type="button" className="mr-tile mr-tile-more" style={{ width: fit.w, height: fit.h }} onClick={onShowPeople}>
                                <span className="mr-more-faces">
                                    {hidden.slice(0, 3).map(t => {
                                        const n = t.participant.name || '?';
                                        return <span key={keyOf(t)} style={{ background: colorFor(n) }}>{initials(n)}</span>;
                                    })}
                                </span>
                                <strong>+{overflow} more</strong>
                            </button>
                        )}
                    </div>
                    {self && <SelfView tile={tileProps(self)} stageW={W} stageH={H} />}
                    {cams.length === 1 && (
                        <div className="mr-alone">
                            <strong>You're the only one here</strong>
                            <span>{aloneHint}</span>
                        </div>
                    )}
                </>
            );
        }
    }

    return <div className="mr-stage" ref={ref}>{content}</div>;
};

export default MeetingStage;
