import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { App, Button } from 'antd';
import { LoadingOutlined, ReloadOutlined, SoundOutlined, WifiOutlined } from '@ant-design/icons';
import { useRoomContext } from '@livekit/components-react';
import { ConnectionState, DisconnectReason, RoomEvent, Track } from 'livekit-client';
import type { LocalTrack, Participant } from 'livekit-client';

/* ══════════════════════════════════════════
   CONNECTION GUARD
   Keeps a person in their class through everything a real computer does:
   the lid closes, the screen locks, the Wi-Fi changes, the phone goes into a
   pocket. LiveKit already retries short drops by itself; this takes over when
   it gives up, and brings the person back into the same room — same chat,
   same view, same microphone and camera state — without a click.

   It never records anything about the person; it only reconnects them.
══════════════════════════════════════════ */

/** What the page answers when asked "may this person come back, and how?". */
export type RejoinAnswer =
    | { kind: 'token'; token: string; url: string }
    | { kind: 'retry' }   // network or server trouble: try again a little later
    | { kind: 'stop' };   // the page took over (class ended, removed, lobby, signed out…)

/** Whether the person had their microphone and camera on, as they last left them. */
export interface MediaState { mic: boolean; cam: boolean }

interface Props {
    /** Asked on every attempt: fresh access for this class. */
    rejoin: () => Promise<RejoinAnswer>;
    /** Reported whenever the person turns their microphone or camera on or off. */
    onMediaState: (state: MediaState) => void;
    /** Called once per outage that lasts long enough to count as having left the class. */
    onLongAbsence: () => Promise<void>;
    /** Called when reconnecting on our own is no longer reasonable. */
    onGiveUp: () => void;
    onLeave: () => void;
    /** True once the person chose to leave: a disconnect then is expected, not lost. */
    leavingRef: React.MutableRefObject<boolean>;
    /** Lets the page ask for recovery, e.g. when the very first connection fails. */
    recoverRef: React.MutableRefObject<((why: string) => void) | null>;
}

/** Disconnects the page handles itself, and that must never be retried. */
const NOT_OURS = new Set<DisconnectReason>([
    DisconnectReason.CLIENT_INITIATED,     // the person left
    DisconnectReason.DUPLICATE_IDENTITY,   // they opened the class somewhere else
    DisconnectReason.PARTICIPANT_REMOVED,  // the host removed them
]);

/** Past this, the outage is recorded as leaving (attendance stays honest). */
const ABSENCE_MS = 45_000;
/** Attempts with the network up before handing over to the page (about seven minutes). */
const MAX_ATTEMPTS = 30;
const MAX_DELAY_MS = 15_000;
/** A 2-second timer that fires this late means the computer was asleep or the tab frozen. */
const SLEEP_GAP_MS = 8_000;

type Status = 'ok' | 'recovering' | 'offline';

const ConnectionGuard: React.FC<Props> = (props) => {
    const room = useRoomContext();
    const { message } = App.useApp();

    const [status, setStatus] = useState<Status>('ok');
    const [attempt, setAttempt] = useState(0);
    const [nextAt, setNextAt] = useState<number | null>(null);
    const [now, setNow] = useState(Date.now());
    const [audioBlocked, setAudioBlocked] = useState(false);

    // The latest callbacks, so timers and listeners never call stale ones.
    const latest = useRef(props);
    latest.current = props;

    const recovering = useRef(false);
    const running = useRef(false);
    const timer = useRef<number | undefined>(undefined);
    const startedAt = useRef(0);
    const attempts = useRef(0);
    const absenceRecorded = useRef(false);
    const media = useRef<MediaState | null>(null);
    const frozen = useRef(false);

    const clearTimer = () => {
        if (timer.current !== undefined) window.clearTimeout(timer.current);
        timer.current = undefined;
        setNextAt(null);
    };

    // ── Microphone and camera, as the person last set them ──────────────────
    // Only read while the room is healthy: a dropping room reports everything
    // as off, and that must never become "the person turned their camera off".
    useEffect(() => {
        const read = () => {
            if (frozen.current || room.state !== ConnectionState.Connected) return;
            const lp = room.localParticipant;
            const next = { mic: lp.isMicrophoneEnabled, cam: lp.isCameraEnabled };
            if (!media.current || next.mic !== media.current.mic || next.cam !== media.current.cam) {
                media.current = next;
                latest.current.onMediaState(next);
            }
        };
        const onMuteChange = (_pub: unknown, participant: Participant) => {
            if (participant === room.localParticipant) read();
        };
        const freeze = () => { frozen.current = true; };
        const thaw = () => { frozen.current = false; };

        room.on(RoomEvent.LocalTrackPublished, read);
        room.on(RoomEvent.LocalTrackUnpublished, read);
        room.on(RoomEvent.TrackMuted, onMuteChange);
        room.on(RoomEvent.TrackUnmuted, onMuteChange);
        room.on(RoomEvent.Reconnecting, freeze);
        room.on(RoomEvent.SignalReconnecting, freeze);
        room.on(RoomEvent.Disconnected, freeze);
        room.on(RoomEvent.Reconnected, thaw);
        room.on(RoomEvent.Connected, thaw);
        return () => {
            room.off(RoomEvent.LocalTrackPublished, read);
            room.off(RoomEvent.LocalTrackUnpublished, read);
            room.off(RoomEvent.TrackMuted, onMuteChange);
            room.off(RoomEvent.TrackUnmuted, onMuteChange);
            room.off(RoomEvent.Reconnecting, freeze);
            room.off(RoomEvent.SignalReconnecting, freeze);
            room.off(RoomEvent.Disconnected, freeze);
            room.off(RoomEvent.Reconnected, thaw);
            room.off(RoomEvent.Connected, thaw);
        };
    }, [room]);

    // ── A camera or microphone the system switched off while asleep ──────────
    // Many laptops end camera and microphone tracks on lock. The room may come
    // back fine with a black tile and a dead mic; this restarts them.
    const healLocalTracks = useCallback(async () => {
        if (room.state !== ConnectionState.Connected) return;
        const lp = room.localParticipant;
        for (const pub of lp.trackPublications.values()) {
            const track = pub.track as LocalTrack | undefined;
            if (!track || pub.isMuted) continue;
            if (pub.source !== Track.Source.Camera && pub.source !== Track.Source.Microphone) continue;
            if (track.mediaStreamTrack?.readyState !== 'ended') continue;
            try {
                await track.restartTrack();
            } catch {
                try {
                    if (pub.source === Track.Source.Camera) {
                        await lp.setCameraEnabled(false);
                        await lp.setCameraEnabled(true);
                    } else {
                        await lp.setMicrophoneEnabled(false);
                        await lp.setMicrophoneEnabled(true);
                    }
                } catch { /* the device is really gone: the controls show it off */ }
            }
        }
    }, [room]);

    // ── Sound the browser paused after sleep ────────────────────────────────
    const checkAudio = useCallback(() => setAudioBlocked(!room.canPlaybackAudio), [room]);
    useEffect(() => {
        room.on(RoomEvent.AudioPlaybackStatusChanged, checkAudio);
        checkAudio();
        return () => { room.off(RoomEvent.AudioPlaybackStatusChanged, checkAudio); };
    }, [room, checkAudio]);

    // ── Recovery ────────────────────────────────────────────────────────────
    const finish = useCallback(() => {
        recovering.current = false;
        attempts.current = 0;
        absenceRecorded.current = false;
        clearTimer();
        setAttempt(0);
        setStatus('ok');
    }, []);

    const attemptNowRef = useRef<() => Promise<void>>(async () => { });

    const scheduleNext = useCallback(() => {
        if (attempts.current >= MAX_ATTEMPTS) {
            finish();
            latest.current.onGiveUp();
            return;
        }
        const delay = Math.min(MAX_DELAY_MS, 1000 * 2 ** Math.min(attempts.current - 1, 4)) + Math.random() * 400;
        clearTimer();
        setNextAt(Date.now() + delay);
        timer.current = window.setTimeout(() => { void attemptNowRef.current(); }, delay);
    }, [finish]);

    const attemptNow = useCallback(async () => {
        if (!recovering.current || running.current || latest.current.leavingRef.current) return;
        clearTimer();

        // No network: nothing to try. The 'online' event starts us again.
        if (!navigator.onLine) { setStatus('offline'); return; }

        running.current = true;
        setStatus('recovering');
        try {
            // A long outage is a real absence: record it before coming back, so
            // attendance shows the gap instead of an unbroken session.
            if (!absenceRecorded.current && Date.now() - startedAt.current > ABSENCE_MS) {
                absenceRecorded.current = true;
                await latest.current.onLongAbsence().catch(() => { });
            }

            attempts.current += 1;
            setAttempt(attempts.current);

            let answer: RejoinAnswer;
            try { answer = await latest.current.rejoin(); } catch { answer = { kind: 'retry' }; }
            if (!recovering.current || latest.current.leavingRef.current) return;

            if (answer.kind === 'stop') { finish(); return; }
            if (answer.kind === 'token') {
                try {
                    await room.connect(answer.url, answer.token);
                    finish();
                    message.success({ content: "You're back in the class", key: 'mr-reconnect', duration: 3 });
                    void healLocalTracks();
                    checkAudio();
                    return;
                } catch { /* fall through: try again shortly */ }
            }
            scheduleNext();
        } finally {
            running.current = false;
        }
    }, [room, finish, scheduleNext, healLocalTracks, checkAudio, message]);
    attemptNowRef.current = attemptNow;

    const begin = useCallback((why: string) => {
        if (latest.current.leavingRef.current) return;
        if (recovering.current) { void attemptNow(); return; }
        recovering.current = true;
        startedAt.current = Date.now();
        attempts.current = 0;
        absenceRecorded.current = false;
        setStatus(navigator.onLine ? 'recovering' : 'offline');
        if (import.meta.env.DEV) console.info('[meeting] reconnecting:', why);
        void attemptNow();
    }, [attemptNow]);

    // LiveKit gave up on its own retries — our turn.
    useEffect(() => {
        const onDisconnected = (reason?: DisconnectReason) => {
            if (reason !== undefined && NOT_OURS.has(reason)) return;
            begin(`disconnected (${reason ?? 'unknown'})`);
        };
        room.on(RoomEvent.Disconnected, onDisconnected);
        room.on(RoomEvent.Reconnected, healLocalTracks);
        room.on(RoomEvent.MediaDevicesChanged, healLocalTracks);
        return () => {
            room.off(RoomEvent.Disconnected, onDisconnected);
            room.off(RoomEvent.Reconnected, healLocalTracks);
            room.off(RoomEvent.MediaDevicesChanged, healLocalTracks);
        };
    }, [room, begin, healLocalTracks]);

    // The page can ask too (e.g. the first connection failed) — only if we are really disconnected.
    useEffect(() => {
        latest.current.recoverRef.current = (why: string) => {
            if (room.state === ConnectionState.Disconnected) begin(why);
        };
        const ref = latest.current.recoverRef;
        return () => { ref.current = null; };
    }, [room, begin]);

    // ── Waking up ───────────────────────────────────────────────────────────
    // Timers stop while the computer sleeps, so backoff timers cannot be relied
    // on to notice the wake. Every sign of life retries at once instead.
    useEffect(() => {
        const wake = () => {
            if (recovering.current) void attemptNow();
            else { void healLocalTracks(); checkAudio(); }
        };
        const onOnline = () => { if (recovering.current) void attemptNow(); };
        const onOffline = () => { if (recovering.current) { clearTimer(); setStatus('offline'); } };
        const onVisible = () => { if (document.visibilityState === 'visible') wake(); };

        let last = Date.now();
        const watchdog = window.setInterval(() => {
            const t = Date.now();
            if (t - last > SLEEP_GAP_MS) wake();
            last = t;
        }, 2000);

        window.addEventListener('online', onOnline);
        window.addEventListener('offline', onOffline);
        window.addEventListener('pageshow', wake);
        window.addEventListener('focus', wake);
        document.addEventListener('visibilitychange', onVisible);
        return () => {
            window.clearInterval(watchdog);
            window.removeEventListener('online', onOnline);
            window.removeEventListener('offline', onOffline);
            window.removeEventListener('pageshow', wake);
            window.removeEventListener('focus', wake);
            document.removeEventListener('visibilitychange', onVisible);
        };
    }, [attemptNow, healLocalTracks, checkAudio]);

    // ── Keeping the screen awake during class ───────────────────────────────
    // Most "my computer went to sleep during class" is the idle timer while a
    // student only listens. A screen wake lock stops that where it is
    // supported; browsers release it when the tab is hidden, so it is taken
    // again on return.
    useEffect(() => {
        type Sentinel = { released: boolean; release: () => Promise<void> };
        const nav = navigator as Navigator & { wakeLock?: { request: (type: 'screen') => Promise<Sentinel> } };
        if (!nav.wakeLock) return;
        let sentinel: Sentinel | null = null;
        let active = true;
        const take = async () => {
            if (!active || document.visibilityState !== 'visible' || (sentinel && !sentinel.released)) return;
            try { sentinel = await nav.wakeLock!.request('screen'); } catch { /* denied or unsupported */ }
        };
        const onVisible = () => { void take(); };
        void take();
        document.addEventListener('visibilitychange', onVisible);
        return () => {
            active = false;
            document.removeEventListener('visibilitychange', onVisible);
            sentinel?.release().catch(() => { });
        };
    }, []);

    // Stop every timer when the room goes away (class ended, person left).
    useEffect(() => () => {
        recovering.current = false;
        if (timer.current !== undefined) window.clearTimeout(timer.current);
    }, []);

    // A seconds countdown while waiting for the next attempt.
    useEffect(() => {
        if (status === 'ok') return;
        const id = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(id);
    }, [status]);

    // ── What the person sees ────────────────────────────────────────────────
    const unlockAudio = () => {
        room.startAudio().then(checkAudio).catch(checkAudio);
    };

    const retryNow = () => { void attemptNow(); };
    const seconds = nextAt ? Math.max(0, Math.ceil((nextAt - now) / 1000)) : null;

    return createPortal(
        <>
            {status !== 'ok' && (
                <div className="mr-guard" role="alertdialog" aria-live="assertive" aria-labelledby="mr-guard-title">
                    <div className="mr-guard-card">
                        <span className={`mr-guard-icon${status === 'offline' ? ' is-offline' : ''}`} aria-hidden="true">
                            {status === 'offline' ? <WifiOutlined /> : <LoadingOutlined />}
                        </span>
                        <h2 id="mr-guard-title">
                            {status === 'offline' ? "You're offline" : 'Reconnecting to your class…'}
                        </h2>
                        <p>
                            {status === 'offline'
                                ? "We'll bring you back the moment your internet returns. You don't need to do anything."
                                : "Your connection dropped — maybe your computer went to sleep. We're bringing you back into the same class."}
                        </p>
                        <p className="mr-guard-meta">
                            {status === 'offline'
                                ? 'Waiting for the network'
                                : running.current || seconds === null || seconds === 0
                                    ? `Trying now${attempt > 1 ? ` · attempt ${attempt}` : ''}`
                                    : `Next try in ${seconds} s · attempt ${attempt}`}
                        </p>
                        <div className="mr-guard-actions">
                            {status !== 'offline' && (
                                <Button icon={<ReloadOutlined />} onClick={retryNow} disabled={running.current}>Try now</Button>
                            )}
                            <Button type="text" danger onClick={() => latest.current.onLeave()}>Leave class</Button>
                        </div>
                    </div>
                </div>
            )}

            {status === 'ok' && audioBlocked && (
                <button type="button" className="mr-guard-sound" onClick={unlockAudio}>
                    <SoundOutlined /> Sound is paused — tap to turn it back on
                </button>
            )}
        </>,
        document.body,
    );
};

export default ConnectionGuard;
