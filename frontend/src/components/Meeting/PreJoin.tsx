import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Select, Tooltip } from 'antd';
import { LoadingOutlined, ReloadOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { Ic, cleanDeviceLabel, colorFor, initials } from './meetingUi';
import './MeetingShell.css';

/* ══════════════════════════════════════════
   PRE-JOIN — the "Ready to join?" screen
   Owns the ONLY preview stream (one camera + one mic track), so the
   choices made here are exactly what the room publishes.
══════════════════════════════════════════ */

export interface MediaChoices {
    audioEnabled: boolean;
    videoEnabled: boolean;
    audioDeviceId: string;
    videoDeviceId: string;
    speakerDeviceId: string;
}

const STORE_KEY = 'lfn.meeting.media';
const DEFAULTS: MediaChoices = { audioEnabled: true, videoEnabled: true, audioDeviceId: '', videoDeviceId: '', speakerDeviceId: '' };

export const loadMediaChoices = (): MediaChoices => {
    try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORE_KEY) || '{}') }; } catch { return { ...DEFAULTS }; }
};
export const saveMediaChoices = (c: MediaChoices) => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(c)); } catch { /* storage unavailable */ }
};

type DeviceState = 'pending' | 'ok' | 'off' | 'denied' | 'missing' | 'busy' | 'error';
type Kind = 'audioinput' | 'videoinput' | 'audiooutput';

const stateFromError = (e: any): DeviceState => {
    const n = e?.name;
    if (n === 'NotAllowedError' || n === 'SecurityError') return 'denied';
    if (n === 'NotFoundError' || n === 'OverconstrainedError') return 'missing';
    if (n === 'NotReadableError' || n === 'AbortError') return 'busy';
    return 'error';
};
const PROBLEM: Partial<Record<DeviceState, string>> = {
    denied: 'Access blocked',
    missing: 'Not found',
    busy: 'In use by another app',
    error: 'Unavailable',
};
const isProblem = (s: DeviceState) => s === 'denied' || s === 'missing' || s === 'busy' || s === 'error';
const canPickSpeaker = typeof HTMLMediaElement !== 'undefined' && 'setSinkId' in HTMLMediaElement.prototype;

export type PreJoinStatus = 'idle' | 'joining' | 'waiting' | 'lobby' | 'not_ready';

export interface PreJoinProps {
    title: string;
    hostName?: string;
    batchName?: string | null;
    userName: string;
    isHost: boolean;
    /** The meeting is currently running. */
    live: boolean;
    status: PreJoinStatus;
    onJoin: (choices: MediaChoices) => void;
    onCancel: () => void;
    /** Keeps the parent in sync while the user waits (lobby / waiting room). */
    onChoicesChange?: (choices: MediaChoices) => void;
}

const PreJoin: React.FC<PreJoinProps> = ({ title, hostName, batchName, userName, isHost, live, status, onJoin, onCancel, onChoicesChange }) => {
    const [choices, setChoices] = useState<MediaChoices>(loadMediaChoices);
    const [devices, setDevices] = useState<Record<Kind, MediaDeviceInfo[]>>({ audioinput: [], videoinput: [], audiooutput: [] });
    const [active, setActive] = useState({ audio: '', video: '' });
    const [cam, setCam] = useState<DeviceState>('pending');
    const [mic, setMic] = useState<DeviceState>('pending');
    const [hasVideo, setHasVideo] = useState(false);
    const [speaking, setSpeaking] = useState(false);
    const [testing, setTesting] = useState(false);
    const [nonce, setNonce] = useState(0);

    const rootRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const videoTrack = useRef<MediaStreamTrack | null>(null);
    const audioTrack = useRef<MediaStreamTrack | null>(null);
    const audioCtx = useRef<AudioContext | null>(null);
    const meterStop = useRef<() => void>(() => { });
    const onChoicesRef = useRef(onChoicesChange);
    onChoicesRef.current = onChoicesChange;

    const update = (patch: Partial<MediaChoices>) => setChoices(c => ({ ...c, ...patch }));
    const effective: MediaChoices = {
        ...choices,
        audioDeviceId: choices.audioDeviceId || active.audio,
        videoDeviceId: choices.videoDeviceId || active.video,
    };

    useEffect(() => { saveMediaChoices(choices); }, [choices]);
    useEffect(() => { onChoicesRef.current?.(effective); },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [choices, active]);

    const refreshDevices = useCallback(async () => {
        if (!navigator.mediaDevices?.enumerateDevices) return;
        try {
            const list = await navigator.mediaDevices.enumerateDevices();
            const of = (k: Kind) => list.filter(d => d.kind === k && d.deviceId);
            setDevices({ audioinput: of('audioinput'), videoinput: of('videoinput'), audiooutput: of('audiooutput') });
        } catch { /* keep previous list */ }
    }, []);

    useEffect(() => {
        const md = navigator.mediaDevices;
        if (!md?.addEventListener) return;
        md.addEventListener('devicechange', refreshDevices);
        return () => md.removeEventListener('devicechange', refreshDevices);
    }, [refreshDevices]);

    /* ── Camera ── */
    useEffect(() => {
        let cancelled = false;
        const release = () => { videoTrack.current?.stop(); videoTrack.current = null; setHasVideo(false); };
        if (!choices.videoEnabled) { release(); setCam('off'); return; }
        if (!navigator.mediaDevices?.getUserMedia) { setCam('error'); return; }
        setCam(s => (s === 'ok' ? s : 'pending'));
        navigator.mediaDevices.getUserMedia({
            video: {
                ...(choices.videoDeviceId ? { deviceId: { exact: choices.videoDeviceId } } : {}),
                width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 },
            },
        }).then(stream => {
            const track = stream.getVideoTracks()[0];
            if (cancelled || !track) { stream.getTracks().forEach(t => t.stop()); return; }
            videoTrack.current?.stop();
            videoTrack.current = track;
            if (videoRef.current) videoRef.current.srcObject = new MediaStream([track]);
            setHasVideo(true);
            setCam('ok');
            setActive(a => ({ ...a, video: track.getSettings().deviceId || '' }));
            refreshDevices();
        }).catch(e => {
            if (cancelled) return;
            // A remembered camera that is no longer plugged in: fall back to the default one.
            if (choices.videoDeviceId && (e?.name === 'OverconstrainedError' || e?.name === 'NotFoundError')) { update({ videoDeviceId: '' }); return; }
            release();
            setCam(stateFromError(e));
        });
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [choices.videoEnabled, choices.videoDeviceId, nonce]);

    /* ── Microphone + level meter (drives a CSS variable, no re-render per frame) ── */
    const startMeter = (track: MediaStreamTrack) => {
        const Ctx: typeof AudioContext | undefined = window.AudioContext || (window as any).webkitAudioContext;
        if (!Ctx) return;
        const ctx = audioCtx.current ?? (audioCtx.current = new Ctx());
        ctx.resume?.().catch(() => { });
        const source = ctx.createMediaStreamSource(new MediaStream([track]));
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.5;
        source.connect(analyser);
        const data = new Uint8Array(analyser.fftSize);
        let frame = 0, lastLoud = 0, on = false, smooth = 0;
        const tick = () => {
            analyser.getByteTimeDomainData(data);
            let sum = 0;
            for (let i = 0; i < data.length; i++) { const v = (data[i] - 128) / 128; sum += v * v; }
            const lvl = Math.min(1, Math.sqrt(sum / data.length) * 5);
            smooth = Math.max(lvl, smooth * 0.85);
            rootRef.current?.style.setProperty('--lvl', smooth.toFixed(3));
            const t = performance.now();
            if (lvl > 0.1) lastLoud = t;
            const now = t - lastLoud < 500;
            if (now !== on) { on = now; setSpeaking(now); }
            frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        meterStop.current = () => {
            cancelAnimationFrame(frame);
            try { source.disconnect(); } catch { /* already disconnected */ }
            meterStop.current = () => { };
        };
    };

    useEffect(() => {
        let cancelled = false;
        const release = () => {
            meterStop.current();
            audioTrack.current?.stop();
            audioTrack.current = null;
            setSpeaking(false);
            rootRef.current?.style.setProperty('--lvl', '0');
        };
        if (!choices.audioEnabled) { release(); setMic('off'); return; }
        if (!navigator.mediaDevices?.getUserMedia) { setMic('error'); return; }
        setMic(s => (s === 'ok' ? s : 'pending'));
        navigator.mediaDevices.getUserMedia({
            audio: {
                ...(choices.audioDeviceId ? { deviceId: { exact: choices.audioDeviceId } } : {}),
                echoCancellation: true, noiseSuppression: true, autoGainControl: true,
            },
        }).then(stream => {
            const track = stream.getAudioTracks()[0];
            if (cancelled || !track) { stream.getTracks().forEach(t => t.stop()); return; }
            release();
            audioTrack.current = track;
            startMeter(track);
            setMic('ok');
            setActive(a => ({ ...a, audio: track.getSettings().deviceId || '' }));
            refreshDevices();
        }).catch(e => {
            if (cancelled) return;
            if (choices.audioDeviceId && (e?.name === 'OverconstrainedError' || e?.name === 'NotFoundError')) { update({ audioDeviceId: '' }); return; }
            release();
            setMic(stateFromError(e));
        });
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [choices.audioEnabled, choices.audioDeviceId, nonce]);

    // Release every device when leaving this screen so the room can take them.
    useEffect(() => () => {
        videoTrack.current?.stop();
        audioTrack.current?.stop();
        meterStop.current();
        audioCtx.current?.close().catch(() => { });
    }, []);

    /* ── Speaker test: a short chime routed to the selected output ── */
    const testSpeaker = async () => {
        if (testing) return;
        setTesting(true);
        try {
            const Ctx: typeof AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new Ctx();
            const dest = ctx.createMediaStreamDestination();
            [523.25, 659.25, 783.99].forEach((f, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                const t0 = ctx.currentTime + i * 0.17;
                osc.type = 'sine';
                osc.frequency.value = f;
                gain.gain.setValueAtTime(0, t0);
                gain.gain.linearRampToValueAtTime(0.28, t0 + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.7);
                osc.connect(gain).connect(dest);
                osc.start(t0);
                osc.stop(t0 + 0.75);
            });
            const el = new Audio();
            el.srcObject = dest.stream;
            if (choices.speakerDeviceId && typeof (el as any).setSinkId === 'function') {
                await (el as any).setSinkId(choices.speakerDeviceId).catch(() => { });
            }
            await el.play();
            window.setTimeout(() => { el.pause(); ctx.close().catch(() => { }); setTesting(false); }, 1400);
        } catch {
            setTesting(false);
        }
    };

    /* ── View helpers ── */
    const options = (kind: Kind, fallback: string) => devices[kind].map((d, i) => ({ value: d.deviceId, label: cleanDeviceLabel(d.label) || `${fallback} ${i + 1}` }));
    const pick = (kind: Kind, id: string) => (id && devices[kind].some(d => d.deviceId === id) ? id : undefined);
    const toneOf = (s: DeviceState) => (s === 'ok' ? 'ok' : s === 'off' ? 'off' : s === 'pending' ? 'pending' : 'bad');

    const camText = cam === 'off' ? 'Camera is off' : cam === 'ok' ? 'Working' : cam === 'pending' ? 'Starting…' : PROBLEM[cam];
    const micText = mic === 'off' ? 'Muted' : mic === 'ok' ? (speaking ? 'We can hear you' : 'Say something to test it') : mic === 'pending' ? 'Starting…' : PROBLEM[mic];
    const previewText = cam === 'off' ? 'Your camera is off' : cam === 'pending' ? 'Starting camera…' : `Camera: ${PROBLEM[cam]?.toLowerCase()}`;

    const waiting = status === 'waiting' || status === 'lobby';
    const primaryLabel = isHost
        ? (live ? 'Rejoin class' : 'Start class')
        : status === 'not_ready' ? 'Check again'
            : status === 'waiting' ? 'Waiting for the teacher…'
                : status === 'lobby' ? 'Asking to join…'
                    : 'Join now';

    const note = isHost
        ? (live
            ? { tone: 'live', title: 'Your class is running', text: 'Rejoin to continue teaching.' }
            : { tone: 'info', title: 'Your students are waiting', text: batchName ? `Students in ${batchName} join automatically once you start. Anyone else asks to join.` : 'Participants ask to join and you admit them.' })
        : status === 'waiting' ? { tone: 'wait', title: `Waiting for ${hostName || 'your teacher'}`, text: "The class hasn't started yet. You'll join automatically as soon as it does." }
            : status === 'lobby' ? { tone: 'wait', title: 'Asking to be let in', text: 'The host has been notified. You will join as soon as they admit you.' }
                : status === 'not_ready' ? { tone: 'muted', title: "This class hasn't opened yet", text: 'Your teacher opens the room shortly before the start time. Check your devices now and come back.' }
                    : live ? { tone: 'live', title: 'Class is live', text: `${hostName || 'Your teacher'} is in the room.` }
                        : { tone: 'info', title: 'Get ready', text: 'Check your camera and microphone, then join.' };

    const blocked = cam === 'denied' || mic === 'denied';
    const busy = cam === 'busy' || mic === 'busy';

    return (
        <div className="pj" ref={rootRef}>
            <div className="pj-grid">
                {/* ── Preview + devices ── */}
                <section className="pj-stage" aria-label="Camera preview">
                    <div className={`pj-preview${hasVideo ? ' has-video' : ''}`}>
                        <video ref={videoRef} autoPlay muted playsInline />
                        {!hasVideo && (
                            <div className="pj-off">
                                <span className="pj-avatar" style={{ background: colorFor(userName) }}>{initials(userName)}</span>
                                <span className="pj-off-text">{cam === 'pending' && <LoadingOutlined />} {previewText}</span>
                            </div>
                        )}
                        <div className="pj-preview-top">
                            <span className="pj-name">{userName}</span>
                            {mic === 'ok' && <span className={`pj-meter${speaking ? ' is-on' : ''}`} aria-hidden><i /><i /><i /></span>}
                        </div>
                        <div className="pj-toggles">
                            <Tooltip title={choices.audioEnabled ? 'Turn off microphone' : 'Turn on microphone'}>
                                <button type="button" className={`pj-toggle${choices.audioEnabled ? '' : ' is-off'}`} aria-pressed={!choices.audioEnabled}
                                    aria-label={choices.audioEnabled ? 'Turn off microphone' : 'Turn on microphone'}
                                    onClick={() => update({ audioEnabled: !choices.audioEnabled })}>
                                    {choices.audioEnabled ? Ic.mic : Ic.micOff}
                                </button>
                            </Tooltip>
                            <Tooltip title={choices.videoEnabled ? 'Turn off camera' : 'Turn on camera'}>
                                <button type="button" className={`pj-toggle${choices.videoEnabled ? '' : ' is-off'}`} aria-pressed={!choices.videoEnabled}
                                    aria-label={choices.videoEnabled ? 'Turn off camera' : 'Turn on camera'}
                                    onClick={() => update({ videoEnabled: !choices.videoEnabled })}>
                                    {choices.videoEnabled ? Ic.cam : Ic.camOff}
                                </button>
                            </Tooltip>
                        </div>
                    </div>

                    {(blocked || busy) && (
                        <div className="pj-alert" role="alert">
                            <div>
                                <strong>{blocked ? 'Allow your camera and microphone' : 'Your camera or microphone is busy'}</strong>
                                <p>{blocked
                                    ? 'Click the camera icon in the address bar, choose “Allow”, then try again.'
                                    : 'Another app (Zoom, Teams, …) is using it. Close that app, then try again.'}</p>
                            </div>
                            <Button size="small" icon={<ReloadOutlined />} onClick={() => setNonce(n => n + 1)}>Try again</Button>
                        </div>
                    )}

                    <div className="pj-devices">
                        <div className="pj-dev">
                            <span className="pj-dev-ic">{Ic.mic}</span>
                            <Select className="pj-select" variant="borderless" placeholder="Default microphone" popupMatchSelectWidth={false}
                                value={pick('audioinput', effective.audioDeviceId)} options={options('audioinput', 'Microphone')}
                                disabled={!devices.audioinput.length} onChange={v => update({ audioDeviceId: v, audioEnabled: true })} />
                            {mic === 'ok' && <span className="pj-dev-level" aria-hidden><i /></span>}
                        </div>
                        <div className="pj-dev">
                            <span className="pj-dev-ic">{Ic.speaker}</span>
                            {canPickSpeaker && devices.audiooutput.length > 0 ? (
                                <Select className="pj-select" variant="borderless" placeholder="Default speaker" popupMatchSelectWidth={false}
                                    value={pick('audiooutput', choices.speakerDeviceId)} options={options('audiooutput', 'Speaker')}
                                    onChange={v => update({ speakerDeviceId: v })} />
                            ) : <span className="pj-dev-static">System default speaker</span>}
                        </div>
                        <div className="pj-dev">
                            <span className="pj-dev-ic">{Ic.cam}</span>
                            <Select className="pj-select" variant="borderless" placeholder="Default camera" popupMatchSelectWidth={false}
                                value={pick('videoinput', effective.videoDeviceId)} options={options('videoinput', 'Camera')}
                                disabled={!devices.videoinput.length} onChange={v => update({ videoDeviceId: v, videoEnabled: true })} />
                        </div>
                    </div>
                </section>

                {/* ── Join panel ── */}
                <aside className="pj-side">
                    <span className="pj-over">{isHost ? (live ? 'Your class' : 'Ready to start?') : 'Ready to join?'}</span>
                    <h1 className="pj-title">{title}</h1>
                    <div className="pj-meta">
                        {hostName && <span><UserOutlined /> {isHost ? 'You are the host' : `Hosted by ${hostName}`}</span>}
                        {batchName && <span><TeamOutlined /> {batchName}</span>}
                    </div>

                    <div className={`pj-note is-${note.tone}`}>
                        <span className="pj-note-ic">{note.tone === 'live' ? <i className="pj-pulse" /> : waiting ? <LoadingOutlined /> : Ic.info}</span>
                        <div><strong>{note.title}</strong><p>{note.text}</p></div>
                    </div>

                    <ul className="pj-checks" aria-label="Device check">
                        <li className={`is-${toneOf(cam)}`}>
                            <span className="pj-check-ic">{cam === 'off' ? Ic.camOff : Ic.cam}</span>
                            <span className="pj-check-text"><b>Camera</b><em>{camText}</em></span>
                            <span className="pj-dot" />
                        </li>
                        <li className={`is-${toneOf(mic)}${speaking ? ' is-hearing' : ''}`}>
                            <span className="pj-check-ic">{mic === 'off' ? Ic.micOff : Ic.mic}</span>
                            <span className="pj-check-text"><b>Microphone</b><em>{micText}</em></span>
                            <span className="pj-dot" />
                        </li>
                        <li className="is-off">
                            <span className="pj-check-ic">{Ic.speaker}</span>
                            <span className="pj-check-text"><b>Speaker</b><em>{testing ? 'Playing a test sound…' : 'Play a sound to check it'}</em></span>
                            <Button size="small" onClick={testSpeaker} loading={testing}>Test</Button>
                        </li>
                    </ul>

                    <div className="pj-actions">
                        <Button type="primary" size="large" block loading={status === 'joining'} disabled={waiting}
                            icon={waiting ? undefined : Ic.cam} onClick={() => onJoin(effective)}>
                            {primaryLabel}
                        </Button>
                        <Button size="large" block onClick={onCancel}>{waiting ? 'Leave' : 'Back to meetings'}</Button>
                    </div>
                    <p className="pj-tip">In the call: <kbd>Ctrl</kbd> + <kbd>D</kbd> microphone · <kbd>Ctrl</kbd> + <kbd>E</kbd> camera</p>
                    {(isProblem(cam) && isProblem(mic)) && <p className="pj-tip">You can still join and listen without a camera or microphone.</p>}
                </aside>
            </div>
        </div>
    );
};

export default PreJoin;
