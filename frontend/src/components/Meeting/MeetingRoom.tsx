import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { App, Badge, Button, ConfigProvider, Input, Tooltip } from 'antd';
import {
  ArrowLeftOutlined, CheckCircleOutlined, DisconnectOutlined, ExclamationCircleOutlined, LoadingOutlined, LockOutlined, PlusOutlined, QuestionCircleOutlined, ReloadOutlined, StopOutlined,
} from '@ant-design/icons';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useConnectionQualityIndicator,
  useConnectionState,
  useLocalParticipant,
  useMediaDeviceSelect,
  useParticipants,
  useRoomContext,
} from '@livekit/components-react';
import { RoomEvent, Track, VideoPresets, VideoQuality } from 'livekit-client';
import type {
  AudioCaptureOptions, LocalTrackPublication, Participant, RemoteTrackPublication, RoomOptions, VideoCaptureOptions,
} from 'livekit-client';
import { useAuth } from '../../contexts/AuthContext';
import useResponsive from '../../hooks/useResponsive';
import { acquireSocket, releaseSocket } from '../../utils/realtime';
import type { Socket } from '../../utils/realtime';
import DeviceSettings from './DeviceSettings';
import MeetingShare from './MeetingShare';
import MeetingStage, { QualityBars } from './MeetingStage';
import type { LayoutMode } from './MeetingStage';
import PreJoin, { loadMediaChoices, saveMediaChoices } from './PreJoin';
import type { MediaChoices, PreJoinStatus } from './PreJoin';
import Whiteboard from './Whiteboard';
import { Ic, cleanDeviceLabel, colorFor, initials, passcodeFromLink } from './meetingUi';
import { playChatSound, playHandRaiseSound, playNotificationSound, playPollSound } from './meetingSounds';
import './MeetingShell.css';
import './MeetingRoom.css';

const EMOJIS = ['👏', '❤️', '😂', '🎉', '🤔', '👍', '🔥', '😮', '💯', '🙌'];
const POLL_COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#8b5cf6', '#f97316'];
const canPickSpeaker = typeof HTMLMediaElement !== 'undefined' && 'setSinkId' in HTMLMediaElement.prototype;

type Phase = 'loading' | 'prejoin' | 'room' | 'ended' | 'locked' | 'kicked' | 'declined' | 'disconnected' | 'notfound' | 'error';
type MyRole = 'host' | 'admin' | 'teacher' | 'member' | 'guest' | 'outsider' | 'kicked';
type Panel = 'people' | 'chat' | 'polls';
type Menu = 'mic' | 'cam' | 'more' | 'reactions' | 'leave';

interface MeetingData {
  id: number;
  code: string;
  room_name: string;
  title: string;
  teacher_id: number;
  status: string;
  is_locked: boolean;
  teacher_first_name: string;
  teacher_last_name: string;
  batch_name?: string | null;
  scheduled_start?: string | null;
  my_role: MyRole;
  needs_passcode: boolean;
  passcode?: string;
  waiting?: boolean;
  verified?: boolean;
}
interface AdmissionRequest { userId: number; userName: string; role?: string; requestedAt?: string }
const ROLE_TAG: Record<string, string> = { host: 'Host', teacher: 'Teacher', admin: 'Admin', guest: 'Guest' };
const roleOf = (p: Participant) => { try { return JSON.parse(p.metadata || '{}').role as string | undefined; } catch { return undefined; } };
const cleanPass = (v: string) => v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
const INSIDERS: MyRole[] = ['host', 'admin', 'teacher', 'member', 'guest'];
interface ChatMsg { id: string; senderId?: string; sender: string; text: string; time: string; }
interface PollVote { option_index: number; count: number | string; }
interface ActivePoll { id: number; question: string; options: string[]; votes: PollVote[]; }
interface ClosedPoll extends ActivePoll {
  voters: { option_index: number; user_id: number; first_name: string; last_name: string }[];
  totalVotes: number;
}
interface MenuItem { key: string; label: string; icon: React.ReactNode; onClick: () => void; active?: boolean; danger?: boolean; hint?: string; badge?: number; }

const parseOptions = (raw: unknown): string[] => {
  if (Array.isArray(raw)) return raw as string[];
  if (typeof raw === 'string') { try { return JSON.parse(raw); } catch { return []; } }
  return [];
};
const countOf = (votes: PollVote[], idx: number) => parseInt(String(votes.find(v => v.option_index === idx)?.count ?? 0)) || 0;
const totalOf = (votes: PollVote[]) => votes.reduce((s, v) => s + (parseInt(String(v.count)) || 0), 0);
const msgTime = (t: string) => {
  const d = new Date(t);
  return t.includes('T') && !isNaN(d.getTime()) ? d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : t;
};

/* ── Small self-updating pieces (keep the whole room from re-rendering every second) ── */
const useTick = (ms: number) => {
  const [, setN] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setN(n => n + 1), ms);
    return () => window.clearInterval(t);
  }, [ms]);
};
const Clock: React.FC = () => {
  useTick(15_000);
  return <>{new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</>;
};
const Elapsed: React.FC<{ since: number }> = ({ since }) => {
  useTick(1000);
  const s = Math.max(0, Math.floor((Date.now() - since) / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return <>{h ? `${h}:` : ''}{String(m).padStart(h ? 2 : 1, '0')}:{String(s % 60).padStart(2, '0')}</>;
};

/* ── Device list inside the mic / camera menus ── */
const DeviceMenu: React.FC<{ kind: MediaDeviceKind; title: string; storeKey: keyof MediaChoices }> = ({ kind, title, storeKey }) => {
  const room = useRoomContext();
  const { devices, activeDeviceId, setActiveMediaDevice } = useMediaDeviceSelect({ kind, room });
  return (
    <div className="mr-menu-section">
      <div className="mr-menu-title">{title}</div>
      {devices.length === 0 && <div className="mr-menu-empty">No device found</div>}
      {devices.map((d, i) => {
        const active = d.deviceId === activeDeviceId;
        return (
          <button key={d.deviceId || i} type="button" className={`mr-menu-item${active ? ' is-active' : ''}`}
            onClick={() => {
              setActiveMediaDevice(d.deviceId)
                .then(() => saveMediaChoices({ ...loadMediaChoices(), [storeKey]: d.deviceId }))
                .catch(() => { /* device vanished — list refreshes itself */ });
            }}>
            <span className="mr-menu-ic">{active ? Ic.check : null}</span>
            <span className="mr-menu-label">{cleanDeviceLabel(d.label) || `${title} ${i + 1}`}</span>
          </button>
        );
      })}
    </div>
  );
};

/* ── Status screens around the call ── */
const StatusScreen: React.FC<{
  tone: string;
  badge?: string;
  icon: React.ReactNode;
  title: string;
  text: string;
  hint?: string;
  meetingTitle?: string;
  children?: React.ReactNode;
}> = ({ tone, badge, icon, title, text, hint, meetingTitle, children }) => (
  <div className="mr-status-screen">
    <div className={`mr-status-card is-${tone}`}>
      {badge && <div className="mr-status-badge">{badge}</div>}
      <div className="mr-status-icon-wrap">{icon}</div>
      <h2 className="mr-status-title">{title}</h2>
      <p className="mr-status-text">{text}</p>
      {meetingTitle && (
        <div>
          <span className="mr-status-meeting">
            {Ic.cam}
            <span>{meetingTitle}</span>
          </span>
        </div>
      )}
      {hint && (
        <div className="mr-status-hint">
          <span className="mr-status-hint-icon">💡</span>
          <span>{hint}</span>
        </div>
      )}
      <div className="mr-status-actions">{children}</div>
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════
// MEETING PAGE — join flow (pre-join → waiting / lobby → room)
// ════════════════════════════════════════════════════════════
const MeetingPage: React.FC = () => {
  const { id: ref } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { apiCall, user } = useAuth();
  const { message } = App.useApp();

  const [meeting, setMeeting] = useState<MeetingData | null>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  const [preStatus, setPreStatus] = useState<PreJoinStatus>('idle');
  const [conn, setConn] = useState<{ token: string; url: string } | null>(null);
  const [roomChoices, setRoomChoices] = useState<MediaChoices | null>(null);
  const [reload, setReload] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Guests (not in the class's batch): passcode → lobby → admitted / declined.
  const navState = (location.state || {}) as { passcode?: string; verified?: boolean };
  const [passcode, setPasscode] = useState(() => cleanPass(navState.passcode || passcodeFromLink(location.hash)));
  const [needsPass, setNeedsPass] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [lobbySince, setLobbySince] = useState<number | null>(null);
  const [declined, setDeclined] = useState<{ retryAfter?: number; final?: boolean }>({});

  const choicesRef = useRef<MediaChoices>(loadMediaChoices());
  const statusRef = useRef(preStatus);
  statusRef.current = preStatus;
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const passRef = useRef(passcode);
  passRef.current = passcode;
  const leavingRef = useRef(false);
  const subscribeRef = useRef<() => void>(() => { });

  const meetingId = meeting?.id;
  const key = meeting?.code || ref || '';
  const isHost = meeting?.my_role === 'host';
  const isGuest = !!meeting && !INSIDERS.includes(meeting.my_role);

  // The passcode must not linger in the address bar (screenshots, screen sharing).
  useEffect(() => {
    if (location.hash.includes('pwd=')) window.history.replaceState(window.history.state, '', location.pathname + location.search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load the meeting
  useEffect(() => {
    if (!ref) return;
    let cancelled = false;
    setPhase('loading');
    (async () => {
      try {
        const resp = await apiCall(`/meetings/${encodeURIComponent(ref)}`);
        if (cancelled) return;
        if (resp.status === 404) { setPhase('notfound'); return; }
        if (!resp.ok) { setPhase('error'); return; }
        const data: MeetingData = await resp.json();
        setMeeting(data);
        if (data.code && ref !== data.code) navigate(`/app/meeting/${data.code}`, { replace: true, state: location.state });
        const outsider = !INSIDERS.includes(data.my_role);
        setNeedsPass(outsider && data.needs_passcode && !data.verified && !data.waiting && !navState.verified);
        if (data.waiting) { setPreStatus('lobby'); setLobbySince(t => t ?? Date.now()); }
        setPhase(data.my_role === 'kicked' ? 'kicked' : data.status === 'ended' ? 'ended' : 'prejoin');
      } catch {
        if (!cancelled) setPhase('error');
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, reload]);

  const enterRoom = useCallback((token: string, url: string) => {
    setRoomChoices({ ...choicesRef.current });
    setConn({ token, url });
    setLobbySince(null);
    setPhase('room');
  }, []);

  const handleStart = useCallback(async () => {
    if (!key) return;
    setPreStatus('joining');
    try {
      const resp = await apiCall(`/meetings/${key}/start`, { method: 'POST' });
      if (!resp.ok) throw new Error((await resp.json().catch(() => ({}))).error || 'Could not start the class');
      const data = await resp.json();
      setMeeting(m => (m ? { ...m, status: 'active' } : m));
      enterRoom(data.token, data.livekitUrl);
    } catch (e: unknown) {
      setPreStatus('idle');
      message.error(e instanceof Error && e.message ? e.message : 'Could not start the class');
    }
  }, [key, apiCall, enterRoom, message]);

  const handleJoin = useCallback(async () => {
    if (!key) return;
    setPreStatus(s => (s === 'waiting' || s === 'lobby' ? s : 'joining'));
    setPassError(null);
    try {
      const body = passRef.current ? { passcode: passRef.current } : {};
      const resp = await apiCall(`/meetings/${key}/join`, { method: 'POST', body: JSON.stringify(body) });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        if (data.code === 'BAD_PASSCODE' || data.code === 'TOO_MANY_ATTEMPTS') {
          setNeedsPass(true);
          setPassError(data.error || 'Wrong passcode');
          setPreStatus('idle');
          return;
        }
        throw new Error(data.error);
      }
      const verifiedNow = () => { setNeedsPass(false); subscribeRef.current(); };
      switch (data.action) {
        case 'join': enterRoom(data.token, data.livekitUrl); break;
        case 'start': handleStart(); break;
        case 'passcode': setNeedsPass(true); setPreStatus('idle'); break;
        case 'lobby': verifiedNow(); setPreStatus('lobby'); setLobbySince(t => t ?? Date.now()); break;
        case 'waiting': verifiedNow(); setPreStatus('waiting'); break;
        case 'not_ready': verifiedNow(); setPreStatus('not_ready'); break;
        case 'declined': setDeclined({ retryAfter: data.retryAfter, final: data.final }); setPreStatus('idle'); setPhase('declined'); break;
        case 'ended': setPhase('ended'); break;
        case 'locked': setPreStatus('idle'); setPhase('locked'); break;
        case 'kicked': setPhase('kicked'); break;
        default: setPreStatus('idle');
      }
    } catch (e: unknown) {
      setPreStatus('idle');
      message.error(e instanceof Error && e.message ? e.message : "Couldn't reach the class. Check your connection and try again.");
    }
  }, [key, apiCall, enterRoom, handleStart, message]);
  const joinRef = useRef(handleJoin);
  joinRef.current = handleJoin;

  // Real-time events for this meeting (authenticated socket; the server decides what we may hear)
  useEffect(() => {
    if (!meetingId || !user?.id) return;
    const s = acquireSocket();
    setSocket(s);
    const mine = (d?: { meetingId?: number }) => !d?.meetingId || Number(d.meetingId) === meetingId;
    const subscribe = () => s.emit('meeting:subscribe', { meetingId }, (r?: { ok: boolean; role?: string; waiting?: boolean }) => {
      // Our place in the lobby was lost while offline: knock again.
      if (r?.ok && r.role === 'lobby' && !r.waiting && statusRef.current === 'lobby') joinRef.current();
    });
    subscribeRef.current = subscribe;
    if (s.connected) subscribe();

    const handlers: [string, (d?: { meetingId?: number }) => void][] = [
      ['connect', subscribe],
      ['meeting:started', d => {
        if (!mine(d)) return;
        setMeeting(m => (m ? { ...m, status: 'active' } : m));
        if (statusRef.current === 'waiting' || statusRef.current === 'not_ready') joinRef.current();
      }],
      ['meeting:waiting', d => { if (mine(d)) setMeeting(m => (m ? { ...m, status: 'waiting' } : m)); }],
      ['meeting:admitted', d => {
        if (!mine(d)) return;
        setMeeting(m => (m ? { ...m, my_role: 'guest', needs_passcode: false } : m));
        joinRef.current();
      }],
      ['meeting:declined', d => { if (mine(d)) { setDeclined({ retryAfter: 120 }); setPreStatus('idle'); setPhase('declined'); } }],
      ['meeting:ended', d => { if (mine(d) && !leavingRef.current) setPhase('ended'); }],
      ['meeting:kicked', d => { if (mine(d)) setPhase('kicked'); }],
    ];
    handlers.forEach(([ev, fn]) => s.on(ev, fn));
    return () => {
      handlers.forEach(([ev, fn]) => s.off(ev, fn));
      s.emit('meeting:unsubscribe', { meetingId });
      releaseSocket();
      setSocket(null);
    };
  }, [meetingId, user?.id]);

  // Leaving the page while in the lobby withdraws the request right away.
  useEffect(() => () => {
    if (statusRef.current === 'lobby' && meetingId) apiCall(`/meetings/${meetingId}/lobby`, { method: 'DELETE' }).catch(() => { });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId]);

  const stopWaiting = useCallback(async () => {
    if (meetingId) await apiCall(`/meetings/${meetingId}/lobby`, { method: 'DELETE' }).catch(() => { });
    setPreStatus('idle');
    navigate('/app/meetings');
  }, [meetingId, apiCall, navigate]);

  const handleLeave = useCallback(async () => {
    leavingRef.current = true;
    if (key) await apiCall(`/meetings/${key}/leave`, { method: 'POST' }).catch(() => { });
    navigate('/app/meetings');
  }, [key, apiCall, navigate]);

  const handleEnd = useCallback(async () => {
    leavingRef.current = true;
    if (key) await apiCall(`/meetings/${key}/end`, { method: 'POST' }).catch(() => { });
    navigate('/app/meetings');
  }, [key, apiCall, navigate]);

  // LiveKit gave up reconnecting (or the room closed under us) — never drop the user on a blank page.
  const onDisconnected = useCallback(() => {
    if (leavingRef.current || phaseRef.current !== 'room') return;
    if (key) apiCall(`/meetings/${key}/leave`, { method: 'POST' }).catch(() => { });
    setPhase('disconnected');
  }, [key, apiCall]);

  const audioOpt = useMemo<AudioCaptureOptions | boolean>(() => {
    if (!roomChoices?.audioEnabled) return false;
    return roomChoices.audioDeviceId ? { deviceId: roomChoices.audioDeviceId } : true;
  }, [roomChoices]);
  const videoOpt = useMemo<VideoCaptureOptions | boolean>(() => {
    if (!roomChoices?.videoEnabled) return false;
    return { resolution: VideoPresets.h720.resolution, ...(roomChoices.videoDeviceId ? { deviceId: roomChoices.videoDeviceId } : {}) };
  }, [roomChoices]);
  const roomOptions = useMemo<RoomOptions>(() => ({
    adaptiveStream: { pixelDensity: 'screen' },
    dynacast: true,
    audioCaptureDefaults: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    videoCaptureDefaults: { resolution: VideoPresets.h720.resolution },
    publishDefaults: {
      simulcast: true,
      videoSimulcastLayers: [VideoPresets.h180, VideoPresets.h360],
      // Sharper slides: higher bitrate, low frame rate.
      screenShareEncoding: { maxBitrate: 3_000_000, maxFramerate: 15, priority: 'high' },
    },
    ...(roomChoices?.speakerDeviceId ? { audioOutput: { deviceId: roomChoices.speakerDeviceId } } : {}),
  }), [roomChoices]);

  const back = () => navigate('/app/meetings');
  const shell = (node: React.ReactNode) => (
    <ConfigProvider theme={{ token: { colorPrimary: '#047857', fontSize: 13, borderRadius: 8 } }}>{node}</ConfigProvider>
  );
  const title = meeting?.title;

  if (phase === 'loading') {
    return shell(
      <div className="mr-status-screen">
        <div className="mr-loading">
          <LoadingOutlined />
          <span>Connecting to your class…</span>
        </div>
      </div>
    );
  }
  if (phase === 'notfound') {
    return shell(
      <StatusScreen
        tone="neutral"
        badge="Meeting not found"
        icon={<QuestionCircleOutlined />}
        title="This meeting doesn't exist"
        text="The link or meeting ID may be mistyped, or the meeting was deleted."
        hint="Check the invitation from your teacher, or use “Join with ID” on the Live meetings page."
      >
        <Button type="primary" icon={<ArrowLeftOutlined />} onClick={back}>Back to meetings</Button>
      </StatusScreen>,
    );
  }
  if (phase === 'error' || !meeting) {
    return shell(
      <StatusScreen
        tone="danger"
        badge="Connection Issue"
        icon={<ExclamationCircleOutlined />}
        title="We couldn't load this class"
        text="Please check your internet connection, then try again."
        hint="If the issue persists, verify that the meeting exists or ask your teacher for assistance."
        meetingTitle={title}
      >
        <Button icon={<ArrowLeftOutlined />} onClick={back}>Back to meetings</Button>
        <Button type="primary" icon={<ReloadOutlined />} onClick={() => setReload(n => n + 1)}>Try again</Button>
      </StatusScreen>,
    );
  }
  if (phase === 'ended') {
    return shell(
      <StatusScreen
        tone="success"
        badge="Class Concluded"
        icon={<CheckCircleOutlined />}
        title="This class has ended"
        text="Thanks for joining! If this session was recorded, the recording will appear under Live meetings → Recordings."
        meetingTitle={title}
      >
        <Button type="primary" icon={<ArrowLeftOutlined />} onClick={back}>Back to meetings</Button>
      </StatusScreen>,
    );
  }
  if (phase === 'locked') {
    return shell(
      <StatusScreen
        tone="warning"
        badge="Access Restricted"
        icon={<LockOutlined />}
        title="This class is locked"
        text="The host has locked this class session, so no new participants can enter right now."
        hint="If you are expected to attend, contact your instructor to unlock the room or admit you."
        meetingTitle={title}
      >
        <Button icon={<ArrowLeftOutlined />} onClick={back}>Back to meetings</Button>
        <Button type="primary" icon={<ReloadOutlined />} onClick={() => { setPhase('prejoin'); setPreStatus('idle'); }}>Try again</Button>
      </StatusScreen>,
    );
  }
  if (phase === 'kicked') {
    return shell(
      <StatusScreen
        tone="danger"
        badge="Access Revoked"
        icon={<StopOutlined />}
        title="You were removed from the class"
        text="The host removed you from this class session. Contact your teacher if you believe this was in error."
        meetingTitle={title}
      >
        <Button type="primary" icon={<ArrowLeftOutlined />} onClick={back}>Back to meetings</Button>
      </StatusScreen>,
    );
  }
  if (phase === 'declined') {
    return shell(
      <StatusScreen
        tone="neutral"
        badge="Join Request Declined"
        icon={<StopOutlined />}
        title="Your request was declined"
        text={declined.final
          ? 'The host declined your request several times. You cannot ask to join this class again.'
          : 'The host did not let you in this time.'}
        hint={declined.final ? undefined : `You can ask again in ${Math.max(1, Math.ceil((declined.retryAfter || 120) / 60))} min — contact your teacher if you think this is a mistake.`}
        meetingTitle={title}
      >
        <Button icon={<ArrowLeftOutlined />} onClick={back}>Back to meetings</Button>
        {!declined.final && <Button type="primary" icon={<ReloadOutlined />} onClick={() => { setPhase('prejoin'); setPreStatus('idle'); }}>Ask again</Button>}
      </StatusScreen>,
    );
  }
  if (phase === 'disconnected') {
    return shell(
      <StatusScreen
        tone="warning"
        badge="Connection Dropped"
        icon={<DisconnectOutlined />}
        title="You were disconnected"
        text="Your connection to the class was lost. Check your internet connection, then rejoin."
        meetingTitle={title}
      >
        <Button icon={<ArrowLeftOutlined />} onClick={back}>Back to meetings</Button>
        <Button type="primary" icon={<ReloadOutlined />} onClick={() => { setConn(null); setPreStatus('idle'); setPhase('prejoin'); }}>Rejoin</Button>
      </StatusScreen>,
    );
  }

  if (phase === 'room' && conn && roomChoices) {
    return createPortal(
      <LiveKitRoom serverUrl={conn.url} token={conn.token} connect audio={audioOpt} video={videoOpt}
        options={roomOptions} onDisconnected={onDisconnected} style={{ height: '100dvh', width: '100vw' }}>
        <RoomAudioRenderer />
        <MeetingRoomUI meeting={meeting} isHost={isHost} apiCall={apiCall} socket={socket} onLeave={handleLeave} onEnd={handleEnd}
          onPasscodeChange={p => setMeeting(m => (m ? { ...m, passcode: p } : m))} />
      </LiveKitRoom>,
      document.body,
    );
  }

  return shell(
    <PreJoin
      title={meeting.title}
      hostName={`${meeting.teacher_first_name || ''} ${meeting.teacher_last_name || ''}`.trim()}
      batchName={meeting.batch_name}
      userName={`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'You'}
      isHost={isHost}
      live={meeting.status === 'active'}
      status={preStatus}
      meetingCode={meeting.code}
      guest={isGuest ? {
        needsPasscode: needsPass,
        passcode,
        onPasscodeChange: v => { setPasscode(v); setPassError(null); },
        error: passError,
        since: lobbySince,
      } : null}
      onStopWaiting={stopWaiting}
      onChoicesChange={c => { choicesRef.current = c; }}
      onJoin={c => {
        choicesRef.current = c;
        if (isHost && meeting.status !== 'active') handleStart();
        else handleJoin();
      }}
      onCancel={back}
    />,
  );
};

// ════════════════════════════════════════════════════════════
// MEETING ROOM (inside the LiveKit room context)
// ════════════════════════════════════════════════════════════
interface RoomUIProps {
  meeting: MeetingData;
  isHost: boolean;
  apiCall: (endpoint: string, options?: RequestInit) => Promise<Response>;
  socket: Socket | null;
  onLeave: () => Promise<void>;
  onEnd: () => Promise<void>;
  onPasscodeChange: (passcode: string) => void;
}

const MeetingRoomUI: React.FC<RoomUIProps> = ({ meeting, isHost, apiCall, socket, onLeave, onEnd, onPasscodeChange }) => {
  const { message, modal } = App.useApp();
  const r = useResponsive();
  const mobile = r.isMobile;
  const room = useRoomContext();
  const participants = useParticipants();
  const lp = useLocalParticipant();
  const me = lp.localParticipant;
  const myIdentity = me.identity;
  const myName = me.name || 'You';
  const myId = parseInt(myIdentity);
  const { quality } = useConnectionQualityIndicator({ participant: me });
  const connState = String(useConnectionState()).toLowerCase();
  const rootRef = useRef<HTMLDivElement>(null);
  const chatListRef = useRef<HTMLDivElement>(null);
  const [joinedAt] = useState(() => Date.now());

  const [panel, setPanel] = useState<Panel | null>(null);
  const panelRef = useRef(panel);
  panelRef.current = panel;
  const [menu, setMenu] = useState<Menu | null>(null);
  const [layout, setLayout] = useState<LayoutMode>('auto');
  const [pinned, setPinned] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);
  const [confirm, setConfirm] = useState<'leave' | 'end' | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [unread, setUnread] = useState(0);
  const [chatToast, setChatToast] = useState<ChatMsg | null>(null);

  const [admissions, setAdmissions] = useState<AdmissionRequest[]>([]);
  const [peopleQuery, setPeopleQuery] = useState('');
  const [raisedHands, setRaisedHands] = useState<{ userId: number; userName: string }[]>([]);
  const [handRaised, setHandRaised] = useState(false);

  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [announceOpen, setAnnounceOpen] = useState(false);
  const [announceInput, setAnnounceInput] = useState('');
  const [isLocked, setIsLocked] = useState(!!meeting.is_locked);
  const [emojis, setEmojis] = useState<{ id: number; emoji: string; sender: string; x: number }[]>([]);
  const emojiId = useRef(0);

  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [activePoll, setActivePoll] = useState<ActivePoll | null>(null);
  const [myVote, setMyVote] = useState<number | null>(null);
  const [closedPolls, setClosedPolls] = useState<ClosedPoll[]>([]);
  const [openPollDetails, setOpenPollDetails] = useState<Set<number>>(new Set());

  const [recStartedAt, setRecStartedAt] = useState<number | null>(null);
  const [recLoading, setRecLoading] = useState(false);
  const isRecording = recStartedAt !== null;

  /* ── Page chrome: lock the page behind the call ── */
  useEffect(() => {
    document.body.classList.add('meeting-active');
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.classList.remove('meeting-active');
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);
  const canFullscreen = typeof document !== 'undefined' && !!document.fullscreenEnabled;
  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => { });
    else rootRef.current?.requestFullscreen?.().catch(() => { });
  };

  /* ── Screen-share quality ──
     contentHint 'detail' makes the encoder favour sharp text and send a fresh keyframe on slide
     changes; after a reconnect we re-request HIGH so the SFU sends a keyframe right away. */
  useEffect(() => {
    if (!room) return;
    const hint = (pub: LocalTrackPublication | RemoteTrackPublication) => {
      if (pub.source !== Track.Source.ScreenShare) return;
      const mt = pub.track?.mediaStreamTrack;
      if (mt && mt.kind === 'video') { try { (mt as any).contentHint = 'detail'; } catch { /* unsupported */ } }
    };
    const onLocalPublished = (pub: LocalTrackPublication) => hint(pub);
    const onRemoteSubscribed = (_t: unknown, pub: RemoteTrackPublication) => {
      if (pub.source !== Track.Source.ScreenShare) return;
      try { pub.setSubscribed(true); } catch { /* ignore */ }
      try { (pub as any).setVideoQuality?.(VideoQuality.HIGH); } catch { /* ignore */ }
    };
    const onReconnected = () => {
      room.remoteParticipants.forEach(p => p.videoTrackPublications.forEach(pub => {
        if (pub.source === Track.Source.ScreenShare) { try { (pub as any).setVideoQuality?.(VideoQuality.HIGH); } catch { /* ignore */ } }
      }));
      room.localParticipant.trackPublications.forEach(pub => { if (pub.kind === Track.Kind.Video) hint(pub); });
    };
    room.on(RoomEvent.LocalTrackPublished, onLocalPublished);
    room.on(RoomEvent.TrackSubscribed, onRemoteSubscribed);
    room.on(RoomEvent.Reconnected, onReconnected);
    room.localParticipant.trackPublications.forEach(pub => { if (pub.kind === Track.Kind.Video) hint(pub); });
    return () => {
      room.off(RoomEvent.LocalTrackPublished, onLocalPublished);
      room.off(RoomEvent.TrackSubscribed, onRemoteSubscribed);
      room.off(RoomEvent.Reconnected, onReconnected);
    };
  }, [room]);

  /* ── Lobby (host): the server is the source of truth ── */
  useEffect(() => {
    if (!isHost) return;
    let cancelled = false;
    apiCall(`/meetings/${meeting.id}/lobby`)
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (!cancelled && d?.pending) setAdmissions(d.pending); })
      .catch(() => { });
    return () => { cancelled = true; };
  }, [isHost, apiCall, meeting.id]);

  /* ── Late joiners: pick up the poll that is already open ── */
  useEffect(() => {
    if (isHost) return;
    let cancelled = false;
    apiCall(`/meetings/${meeting.id}/polls`)
      .then(r => (r.ok ? r.json() : []))
      .then((polls: { id: number; question: string; options: unknown; my_vote: number | null }[]) => {
        const open = Array.isArray(polls) ? polls[0] : null;
        if (cancelled || !open) return;
        setActivePoll(prev => prev || { id: open.id, question: open.question, options: parseOptions(open.options), votes: [] });
        setMyVote(open.my_vote ?? null);
      })
      .catch(() => { });
    return () => { cancelled = true; };
  }, [isHost, apiCall, meeting.id]);

  /* ── Socket events ── */
  useEffect(() => {
    if (!socket) return;
    const onLobby = (d: { meetingId: number; pending: AdmissionRequest[] }) => {
      if (!isHost || Number(d.meetingId) !== meeting.id) return;
      setAdmissions(prev => {
        if (d.pending.some(p => !prev.some(a => a.userId === p.userId))) playNotificationSound();
        return d.pending;
      });
    };
    const onChat = (d: Partial<ChatMsg>) => {
      const m: ChatMsg = {
        id: d.id || `${d.sender}-${Date.now()}-${Math.random()}`,
        senderId: d.senderId,
        sender: d.sender || 'Participant',
        text: d.text || '',
        time: d.time || new Date().toISOString(),
      };
      setMessages(prev => [...prev, m]);
      const isMine = m.senderId ? m.senderId === myIdentity : m.sender === myName;
      if (panelRef.current !== 'chat' && !isMine) {
        setUnread(n => n + 1);
        setChatToast(m);
        playChatSound();
      }
    };
    const onAnnouncement = (d: { text: string }) => { setAnnouncement(d.text); playNotificationSound(); };
    const onHandRaised = (d: { userId: number; userName: string }) => {
      setRaisedHands(prev => (prev.some(h => h.userId === d.userId) ? prev : [...prev, d]));
      playHandRaiseSound();
    };
    const onHandLowered = (d: { userId: number }) => {
      setRaisedHands(prev => prev.filter(h => h.userId !== d.userId));
      if (d.userId === myId) setHandRaised(false);
    };
    const onReaction = (d: { emoji: string; senderName: string }) => {
      const eid = ++emojiId.current;
      setEmojis(prev => [...prev.slice(-12), { id: eid, emoji: d.emoji, sender: d.senderName, x: 6 + Math.random() * 22 }]);
      window.setTimeout(() => setEmojis(prev => prev.filter(e => e.id !== eid)), 3200);
    };
    const onLock = (d: { isLocked: boolean }) => setIsLocked(d.isLocked);
    const onPollCreated = (d: { id: number; question: string; options: unknown }) => {
      setActivePoll({ id: d.id, question: d.question, options: parseOptions(d.options), votes: [] });
      setMyVote(null);
      if (!isHost) { setPanel('polls'); playPollSound(); }
    };
    const onPollUpdated = (d: { pollId: number; votes: PollVote[] }) =>
      setActivePoll(prev => (prev && prev.id === d.pollId ? { ...prev, votes: d.votes } : prev));
    const onPollClosed = () => { setActivePoll(null); setMyVote(null); };
    const onForceStop = (d: { stopped: number }) => { if (d?.stopped > 0) message.info('The host stopped the presentation.'); };
    const onRecStarted = (d: { meetingId: number; startedAt: string }) => { if (d.meetingId === meeting.id) setRecStartedAt(new Date(d.startedAt).getTime()); };
    const onRecStopped = (d: { meetingId: number }) => { if (d.meetingId === meeting.id) setRecStartedAt(null); };

    socket.on('meeting:lobby-updated', onLobby);
    socket.on('meeting:chat-message', onChat);
    socket.on('meeting:announcement', onAnnouncement);
    socket.on('meeting:hand-raised', onHandRaised);
    socket.on('meeting:hand-lowered', onHandLowered);
    socket.on('meeting:reaction', onReaction);
    socket.on('meeting:lockChanged', onLock);
    socket.on('poll:created', onPollCreated);
    socket.on('poll:updated', onPollUpdated);
    socket.on('poll:closed', onPollClosed);
    socket.on('meeting:force-stop-share', onForceStop);
    socket.on('meeting:recording-started', onRecStarted);
    socket.on('meeting:recording-stopped', onRecStopped);
    return () => {
      socket.off('meeting:lobby-updated', onLobby);
      socket.off('meeting:chat-message', onChat);
      socket.off('meeting:announcement', onAnnouncement);
      socket.off('meeting:hand-raised', onHandRaised);
      socket.off('meeting:hand-lowered', onHandLowered);
      socket.off('meeting:reaction', onReaction);
      socket.off('meeting:lockChanged', onLock);
      socket.off('poll:created', onPollCreated);
      socket.off('poll:updated', onPollUpdated);
      socket.off('poll:closed', onPollClosed);
      socket.off('meeting:force-stop-share', onForceStop);
      socket.off('meeting:recording-started', onRecStarted);
      socket.off('meeting:recording-stopped', onRecStopped);
    };
  }, [socket, isHost, meeting.id, myIdentity, myName, myId, message]);

  // Late joiners never saw "recording-started" — ask once.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const resp = await apiCall(`/meetings/${meeting.id}/recording/state`);
        if (!resp.ok) return;
        const d = await resp.json();
        if (!cancelled && d?.isRecording && d?.startedAt) setRecStartedAt(new Date(d.startedAt).getTime());
      } catch { /* socket events still update it */ }
    })();
    return () => { cancelled = true; };
  }, [apiCall, meeting.id]);

  useEffect(() => {
    if (!announcement) return;
    const t = window.setTimeout(() => setAnnouncement(null), 9000);
    return () => window.clearTimeout(t);
  }, [announcement]);
  useEffect(() => {
    if (!chatToast) return;
    const t = window.setTimeout(() => setChatToast(null), 4500);
    return () => window.clearTimeout(t);
  }, [chatToast]);
  useEffect(() => {
    const el = chatListRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, panel]);
  useEffect(() => {
    if (pinned && !participants.some(p => p.identity === pinned)) setPinned(null);
  }, [participants, pinned]);

  /* ── Media controls ── */
  const toggleMic = useCallback(async () => {
    const next = !lp.isMicrophoneEnabled;
    try {
      await me.setMicrophoneEnabled(next);
      saveMediaChoices({ ...loadMediaChoices(), audioEnabled: next });
    } catch (e: any) {
      message.error(e?.name === 'NotAllowedError' ? 'Your browser is blocking the microphone. Allow it from the address bar.' : 'The microphone could not be switched.');
    }
  }, [lp.isMicrophoneEnabled, me, message]);

  const toggleCam = useCallback(async () => {
    const next = !lp.isCameraEnabled;
    try {
      await me.setCameraEnabled(next);
      saveMediaChoices({ ...loadMediaChoices(), videoEnabled: next });
    } catch (e: any) {
      message.error(e?.name === 'NotAllowedError' ? 'Your browser is blocking the camera. Allow it from the address bar.' : 'The camera could not be switched.');
    }
  }, [lp.isCameraEnabled, me, message]);

  const someoneElseSharing = participants.some(p => p.identity !== myIdentity && p.isScreenShareEnabled);
  const iAmSharing = lp.isScreenShareEnabled;
  const toggleShare = useCallback(async () => {
    setMenu(null);
    if (!iAmSharing && someoneElseSharing && !isHost) { message.info('Someone else is presenting. Ask them to stop first.'); return; }
    if (!iAmSharing && typeof navigator.mediaDevices?.getDisplayMedia !== 'function') {
      message.warning('Screen sharing is not supported on this device. Use a desktop browser.');
      return;
    }
    try {
      await me.setScreenShareEnabled(!iAmSharing);
    } catch (err: any) {
      if (err?.name === 'NotAllowedError') return; // picker dismissed
      message.error(err?.message || 'Could not share your screen');
    }
  }, [iAmSharing, someoneElseSharing, isHost, me, message]);

  const forceStopShare = () => {
    if (!socket) { message.error('Connection unavailable'); return; }
    socket.emit('meeting:force-stop-share', { meetingId: meeting.id });
    message.success('Presentation stopped');
  };

  const toggleMicRef = useRef(toggleMic);
  toggleMicRef.current = toggleMic;
  const toggleCamRef = useRef(toggleCam);
  toggleCamRef.current = toggleCam;

  // Keyboard shortcuts (same as Google Meet): Ctrl/⌘ + D microphone, Ctrl/⌘ + E camera.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = (e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey;
      const k = e.key.toLowerCase();
      if (mod && k === 'd') { e.preventDefault(); toggleMicRef.current(); return; }
      if (mod && k === 'e') { e.preventDefault(); toggleCamRef.current(); return; }
      if (e.key === 'Escape') { setMenu(null); setSettingsOpen(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    if (!menu || mobile) return;
    const onDown = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest('.mr-pop, .mr-pop-anchor')) setMenu(null);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [menu, mobile]);

  /* ── Room actions ── */
  const openPanel = (p: Panel, stay = false) => {
    setMenu(null);
    if (panel === p && !stay) { setPanel(null); return; }
    setPanel(p);
    if (p === 'chat') { setUnread(0); setChatToast(null); }
    if (p === 'polls' && isHost) loadPollHistory();
  };

  const sendChat = () => {
    const text = chatInput.trim();
    if (!text || !socket) return;
    // The server stamps the sender, id and time.
    socket.emit('meeting:chat-message', { meetingId: meeting.id, text });
    setChatInput('');
  };

  const toggleHand = () => {
    if (!socket) return;
    if (handRaised) socket.emit('meeting:lower-hand', { meetingId: meeting.id, userId: myId });
    else socket.emit('meeting:raise-hand', { meetingId: meeting.id });
    setHandRaised(!handRaised);
  };
  const lowerHand = (userId: number) => socket?.emit('meeting:lower-hand', { meetingId: meeting.id, userId });
  const lowerAll = () => { raisedHands.forEach(h => lowerHand(h.userId)); setRaisedHands([]); };

  const sendEmoji = (emoji: string) => {
    socket?.emit('meeting:reaction', { meetingId: meeting.id, emoji });
    if (mobile) setMenu(null);
  };

  const sendAnnouncement = () => {
    const text = announceInput.trim();
    if (!text || !socket) return;
    socket.emit('meeting:announcement', { meetingId: meeting.id, text });
    setAnnounceInput('');
    setAnnounceOpen(false);
  };

  const handleAdmit = async (userId: number) => {
    setAdmissions(prev => prev.filter(a => a.userId !== userId));
    const resp = await apiCall(`/meetings/${meeting.id}/admit`, { method: 'POST', body: JSON.stringify({ user_id: userId }) }).catch(() => null);
    if (resp && !resp.ok) message.info('This person is no longer waiting.');
  };
  const handleDecline = async (userId: number) => {
    setAdmissions(prev => prev.filter(a => a.userId !== userId));
    await apiCall(`/meetings/${meeting.id}/decline`, { method: 'POST', body: JSON.stringify({ user_id: userId }) }).catch(() => { });
  };
  const admitAll = async () => {
    setAdmissions([]);
    await apiCall(`/meetings/${meeting.id}/admit-all`, { method: 'POST' }).catch(() => { });
  };

  const toggleLock = async () => { await apiCall(`/meetings/${meeting.id}/lock`, { method: 'POST' }).catch(() => { }); };

  const kick = (p: Participant) => {
    modal.confirm({
      title: `Remove ${p.name || 'this participant'}?`,
      content: 'They will be disconnected and cannot rejoin this class.',
      okText: 'Remove',
      okButtonProps: { danger: true },
      centered: true,
      onOk: () => apiCall(`/meetings/${meeting.id}/kick`, { method: 'POST', body: JSON.stringify({ user_id: parseInt(p.identity) }) }),
    });
  };

  const toggleRecording = useCallback(async () => {
    if (recLoading) return;
    setRecLoading(true);
    try {
      if (isRecording) {
        const resp = await apiCall(`/meetings/${meeting.id}/recording/stop`, { method: 'POST' });
        if (resp.ok) message.success('Recording stopped — the video is being prepared');
        else message.error((await resp.json().catch(() => ({}))).error || 'Could not stop the recording');
      } else {
        const resp = await apiCall(`/meetings/${meeting.id}/recording/start`, { method: 'POST' });
        if (resp.ok) message.success('Recording started');
        else if (resp.status === 503) {
          const d = await resp.json().catch(() => ({}));
          modal.warning({ title: 'Recording is unavailable', content: d.message || 'Recording is not configured on the video server. Please contact your administrator.', centered: true });
        } else message.error((await resp.json().catch(() => ({}))).error || 'Could not start the recording');
      }
    } catch {
      message.error('Network error');
    } finally {
      setRecLoading(false);
    }
  }, [recLoading, isRecording, apiCall, meeting.id, message, modal]);

  /* ── Polls ── */
  const loadPollHistory = async () => {
    try {
      const resp = await apiCall(`/meetings/${meeting.id}/polls`);
      if (!resp.ok) return;
      const polls: Record<string, unknown>[] = (await resp.json()) || [];
      const closed: ClosedPoll[] = polls.filter(p => !p.is_active).map(p => {
        const votes = (p.votes || []) as PollVote[];
        const tv = p.total_votes as { count: number } | undefined;
        return {
          id: p.id as number,
          question: p.question as string,
          options: parseOptions(p.options),
          votes,
          voters: [],
          totalVotes: parseInt(String(tv?.count)) || totalOf(votes),
        };
      });
      setClosedPolls(prev => {
        const known = new Set(prev.map(p => p.id));
        return [...prev, ...closed.filter(c => !known.has(c.id))];
      });
    } catch { /* history is optional */ }
  };

  const handleCreatePoll = async () => {
    const options = pollOptions.map(o => o.trim()).filter(Boolean);
    if (!pollQuestion.trim() || options.length < 2) return;
    const resp = await apiCall(`/meetings/${meeting.id}/polls`, {
      method: 'POST',
      body: JSON.stringify({ question: pollQuestion.trim(), options }),
    });
    if (resp.ok) {
      const d = await resp.json();
      const opts = parseOptions(d.options);
      setActivePoll({ id: d.id, question: d.question || pollQuestion.trim(), options: opts.length ? opts : options, votes: [] });
      setMyVote(null);
      setPollQuestion('');
      setPollOptions(['', '']);
    } else {
      message.error('Could not publish the poll');
    }
  };

  const handleVote = async (idx: number) => {
    if (!activePoll) return;
    setMyVote(idx);
    const resp = await apiCall(`/meetings/polls/${activePoll.id}/vote`, { method: 'POST', body: JSON.stringify({ option_index: idx }) }).catch(() => null);
    if (!resp || !resp.ok) { setMyVote(null); message.error('Your vote was not recorded. Try again.'); }
  };

  const handleClosePoll = async () => {
    if (!activePoll) return;
    const resp = await apiCall(`/meetings/polls/${activePoll.id}/close`, { method: 'POST', body: JSON.stringify({ show_results: true }) });
    if (resp.ok) {
      const d = await resp.json();
      setClosedPolls(prev => [{
        id: d.id,
        question: d.question,
        options: d.options || activePoll.options,
        votes: d.votes || activePoll.votes || [],
        voters: d.voters || [],
        totalVotes: d.totalVotes || 0,
      }, ...prev]);
    }
    setActivePoll(null);
    setMyVote(null);
  };

  /* ── Derived ── */
  const handIds = useMemo(() => new Set(raisedHands.map(h => String(h.userId))), [raisedHands]);
  const pollsVisible = isHost || !!activePoll;
  const teacherIdentity = String(meeting.teacher_id);
  const reconnecting = connState.includes('reconnecting');
  const connecting = connState === 'connecting';
  const people = useMemo(() => {
    const q = peopleQuery.trim().toLowerCase();
    const rank = (p: Participant) => (p.identity === teacherIdentity ? 0 : p.identity === myIdentity ? 1 : 2);
    return participants
      .filter(p => !q || (p.name || '').toLowerCase().includes(q))
      .sort((a, b) => rank(a) - rank(b) || (a.name || '').localeCompare(b.name || ''));
  }, [participants, peopleQuery, teacherIdentity, myIdentity]);

  const tip = (title: string, node: React.ReactElement) => (mobile ? node : <Tooltip title={title} mouseEnterDelay={0.4}>{node}</Tooltip>);

  const layouts: { key: LayoutMode; label: string; icon: React.ReactNode }[] = [
    { key: 'auto', label: 'Auto', icon: Ic.layout },
    { key: 'grid', label: 'Tiled', icon: Ic.grid },
    { key: 'spotlight', label: 'Spotlight', icon: Ic.spotlight },
  ];
  const chooseLayout = (l: LayoutMode) => { setLayout(l); if (l !== 'spotlight') setPinned(null); };

  const moreItems: MenuItem[] = [
    ...(mobile ? [
      { key: 'share', label: iAmSharing ? 'Stop presenting' : 'Present screen', icon: iAmSharing ? Ic.shareStop : Ic.share, onClick: toggleShare, active: iAmSharing },
      { key: 'people', label: 'People', icon: Ic.people, onClick: () => openPanel('people', true), badge: admissions.length },
      { key: 'reactions', label: 'Reactions', icon: Ic.smile, onClick: () => setMenu('reactions') },
      ...(pollsVisible ? [{ key: 'polls', label: activePoll ? 'Live poll' : 'Polls', icon: Ic.poll, onClick: () => openPanel('polls', true), active: !!activePoll }] : []),
    ] : []),
    { key: 'wb', label: whiteboardOpen ? 'Close whiteboard' : 'Whiteboard', icon: Ic.pen, onClick: () => setWhiteboardOpen(v => !v), active: whiteboardOpen },
    { key: 'settings', label: 'Audio & video settings', icon: Ic.settings, onClick: () => setSettingsOpen(true) },
    ...(isHost ? [
      { key: 'rec', label: isRecording ? 'Stop recording' : 'Record class', icon: Ic.record, onClick: toggleRecording, active: isRecording, danger: isRecording, hint: recLoading ? 'Working…' : undefined },
      { key: 'lock', label: isLocked ? 'Unlock class' : 'Lock class', icon: isLocked ? Ic.lock : Ic.unlock, onClick: toggleLock, active: isLocked, hint: isLocked ? 'No one new can join' : undefined },
      { key: 'announce', label: 'Send an announcement', icon: Ic.megaphone, onClick: () => setAnnounceOpen(true) },
      ...(someoneElseSharing ? [{ key: 'stopshare', label: 'Stop the current presentation', icon: Ic.shareStop, onClick: forceStopShare, danger: true }] : []),
    ] : []),
    { key: 'info', label: isHost ? 'Invite people' : 'Meeting details', icon: isHost ? Ic.link : Ic.info, onClick: () => setInfoOpen(true), hint: isHost ? 'ID & passcode' : undefined },
    ...(mobile && canFullscreen ? [{ key: 'fs', label: isFullscreen ? 'Exit full screen' : 'Full screen', icon: isFullscreen ? Ic.shrink : Ic.expand, onClick: toggleFullscreen }] : []),
  ];

  const panelButton = (p: Panel, icon: React.ReactNode, label: string, extra?: React.ReactNode) => tip(label, (
    <button type="button" className={`mr-ctl mr-ctl-ghost${panel === p ? ' is-active' : ''}`} onClick={() => openPanel(p)} aria-label={label} aria-pressed={panel === p}>
      {icon}{extra}
    </button>
  ));

  /* ── Panels ── */
  const peopleView = (
    <div className="mr-panel-body">
      {participants.length > 6 && (
        <Input className="mr-search" placeholder="Search people" allowClear value={peopleQuery} onChange={e => setPeopleQuery(e.target.value)} />
      )}
      {isHost && admissions.length > 0 && (
        <section className="mr-sec">
          <div className="mr-sec-head">
            <span>Waiting to join <b>{admissions.length}</b></span>
            {admissions.length > 1 && <button type="button" className="mr-link" onClick={admitAll}>Admit all</button>}
          </div>
          {admissions.map(a => (
            <div key={a.userId} className="mr-person">
              <span className="mr-person-avatar" style={{ background: colorFor(a.userName) }}>{initials(a.userName)}</span>
              <span className="mr-person-name">
                {a.userName}
                {a.role && <span className="mr-tag is-muted">{a.role === 'teacher' ? 'Teacher' : a.role === 'admin' ? 'Admin' : 'Student'}</span>}
              </span>
              <div className="mr-person-actions is-visible">
                <Button size="small" type="primary" onClick={() => handleAdmit(a.userId)}>Admit</Button>
                <Button size="small" onClick={() => handleDecline(a.userId)}>Deny</Button>
              </div>
            </div>
          ))}
        </section>
      )}
      {raisedHands.length > 0 && (
        <section className="mr-sec">
          <div className="mr-sec-head">
            <span>Raised hands <b>{raisedHands.length}</b></span>
            {isHost && <button type="button" className="mr-link" onClick={lowerAll}>Lower all</button>}
          </div>
          {raisedHands.map((h, i) => {
            const self = h.userId === myId;
            return (
              <div key={h.userId} className="mr-person">
                <span className="mr-hand-order">{i + 1}</span>
                <span className="mr-person-name">{h.userName}{self && <em> (You)</em>}</span>
                {(isHost || self) && (
                  <div className="mr-person-actions is-visible">
                    <button type="button" className="mr-link" onClick={() => (self ? toggleHand() : lowerHand(h.userId))}>Lower</button>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}
      <section className="mr-sec">
        <div className="mr-sec-head"><span>In the class <b>{participants.length}</b></span></div>
        {people.map(p => {
          const name = p.name || 'Participant';
          const host = p.identity === teacherIdentity;
          const self = p.identity === myIdentity;
          const tag = host ? 'Host' : ROLE_TAG[roleOf(p) || ''];
          return (
            <div key={p.sid} className="mr-person">
              <span className="mr-person-avatar" style={{ background: colorFor(name) }}>{initials(name)}</span>
              <span className="mr-person-name">
                {name}{self && <em> (You)</em>}
                {tag && <span className={`mr-tag${tag === 'Guest' ? ' is-guest' : tag === 'Host' ? '' : ' is-muted'}`}>{tag}</span>}
              </span>
              <span className="mr-person-state">
                {handIds.has(p.identity) && <span className="is-hand" title="Hand raised">{Ic.hand}</span>}
                {!p.isCameraEnabled && <span className="is-off" title="Camera off">{Ic.camOff}</span>}
                <span className={p.isMicrophoneEnabled ? (p.isSpeaking ? 'is-talking' : '') : 'is-off'} title={p.isMicrophoneEnabled ? 'Microphone on' : 'Muted'}>
                  {p.isMicrophoneEnabled ? Ic.mic : Ic.micOff}
                </span>
              </span>
              <div className="mr-person-actions">
                <button type="button" className={`mr-icon-btn is-sm${pinned === p.identity ? ' is-active' : ''}`}
                  title={pinned === p.identity ? 'Unpin' : 'Pin to the main stage'} aria-label={pinned === p.identity ? `Unpin ${name}` : `Pin ${name}`}
                  onClick={() => setPinned(pinned === p.identity ? null : p.identity)}>{Ic.pin}</button>
                {isHost && !host && (
                  <button type="button" className="mr-icon-btn is-sm is-danger" title="Remove from class" aria-label={`Remove ${name}`} onClick={() => kick(p)}>
                    {Ic.close}
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {people.length === 0 && <div className="mr-muted-line">No one matches “{peopleQuery}”.</div>}
      </section>
    </div>
  );

  const chatView = (
    <div className="mr-chat">
      <div className="mr-chat-list" ref={chatListRef}>
        {messages.length === 0 ? (
          <div className="mr-empty">
            <span className="mr-empty-ic">{Ic.chat}</span>
            <strong>No messages yet</strong>
            <span>Messages are visible to everyone in the class and are not saved after it ends.</span>
          </div>
        ) : messages.map((m, i) => {
          const prev = messages[i - 1];
          const mine = m.senderId ? m.senderId === myIdentity : m.sender === myName;
          const grouped = !!prev && prev.sender === m.sender && (prev.senderId || '') === (m.senderId || '');
          return (
            <div key={m.id} className={`mr-msg${mine ? ' is-mine' : ''}${grouped ? ' is-grouped' : ''}`}>
              {!grouped && <div className="mr-msg-head"><b>{mine ? 'You' : m.sender}</b><time>{msgTime(m.time)}</time></div>}
              <div className="mr-msg-bubble">{m.text}</div>
            </div>
          );
        })}
      </div>
      <div className="mr-chat-input">
        <Input.TextArea autoSize={{ minRows: 1, maxRows: 4 }} placeholder="Send a message to everyone" value={chatInput} maxLength={1000}
          onChange={e => setChatInput(e.target.value)}
          onPressEnter={e => { if (!e.shiftKey) { e.preventDefault(); sendChat(); } }} />
        <button type="button" className="mr-send" onClick={sendChat} disabled={!chatInput.trim()} aria-label="Send message">{Ic.send}</button>
      </div>
    </div>
  );

  const pollBars = (p: ActivePoll | ClosedPoll, total: number) => (p.options || []).map((opt, idx) => {
    const n = countOf(p.votes || [], idx);
    const pct = total > 0 ? Math.round((n / total) * 100) : 0;
    return (
      <div key={idx} className="mr-poll-row">
        <div className="mr-poll-fill" style={{ width: `${pct}%`, background: `${POLL_COLORS[idx % POLL_COLORS.length]}33` }} />
        <span className="mr-poll-letter" style={{ color: POLL_COLORS[idx % POLL_COLORS.length] }}>{String.fromCharCode(65 + idx)}</span>
        <span className="mr-poll-opt-text">{opt}</span>
        <span className="mr-poll-count">{n} · {pct}%</span>
      </div>
    );
  });

  const pollsView = (
    <div className="mr-panel-body">
      {!isHost && activePoll && (
        <section className="mr-poll-card">
          <span className="mr-poll-over">Live poll</span>
          <div className="mr-poll-q">{activePoll.question}</div>
          {myVote === null ? (
            <div className="mr-poll-choices">
              {(activePoll.options || []).map((opt, idx) => (
                <button key={idx} type="button" className="mr-poll-choice" onClick={() => handleVote(idx)}>
                  <span className="mr-poll-letter">{String.fromCharCode(65 + idx)}</span>
                  <span>{opt}</span>
                </button>
              ))}
              <span className="mr-muted-line">Choose one answer. Only the teacher sees the results.</span>
            </div>
          ) : (
            <div className="mr-poll-done">
              <span className="mr-poll-done-ic">{Ic.check}</span>
              <strong>Vote submitted</strong>
              <span>You answered <b>{(activePoll.options || [])[myVote] || 'your choice'}</b>.</span>
            </div>
          )}
        </section>
      )}
      {!isHost && !activePoll && (
        <div className="mr-empty">
          <span className="mr-empty-ic">{Ic.poll}</span>
          <strong>No poll right now</strong>
          <span>When your teacher starts a poll, it opens here.</span>
        </div>
      )}

      {isHost && activePoll && (() => {
        const total = totalOf(activePoll.votes || []);
        return (
          <section className="mr-poll-card is-live">
            <div className="mr-poll-card-head">
              <span className="mr-poll-over"><i className="mr-live-dot" /> Live · {total} {total === 1 ? 'vote' : 'votes'}</span>
              <Button size="small" danger onClick={handleClosePoll}>End poll</Button>
            </div>
            <div className="mr-poll-q">{activePoll.question}</div>
            <div className="mr-poll-rows">{pollBars(activePoll, total)}</div>
          </section>
        );
      })()}

      {isHost && !activePoll && (
        <section className="mr-poll-card">
          <span className="mr-poll-over">New poll</span>
          <Input className="mr-input" value={pollQuestion} onChange={e => setPollQuestion(e.target.value)} placeholder="Ask a question" maxLength={200} />
          <div className="mr-poll-form">
            {pollOptions.map((opt, idx) => (
              <div key={idx} className="mr-poll-form-row">
                <span className="mr-poll-letter">{String.fromCharCode(65 + idx)}</span>
                <Input className="mr-input" value={opt} maxLength={120} placeholder={`Option ${idx + 1}`}
                  onChange={e => setPollOptions(prev => prev.map((o, i) => (i === idx ? e.target.value : o)))} />
                {pollOptions.length > 2 && (
                  <button type="button" className="mr-icon-btn is-sm" aria-label={`Remove option ${idx + 1}`}
                    onClick={() => setPollOptions(prev => prev.filter((_, i) => i !== idx))}>{Ic.close}</button>
                )}
              </div>
            ))}
          </div>
          <div className="mr-poll-form-actions">
            <Button size="small" icon={<PlusOutlined />} disabled={pollOptions.length >= 8} onClick={() => setPollOptions(prev => [...prev, ''])}>Add option</Button>
            <Button size="small" type="primary" onClick={handleCreatePoll}
              disabled={!pollQuestion.trim() || pollOptions.filter(o => o.trim()).length < 2}>Publish poll</Button>
          </div>
        </section>
      )}

      {isHost && closedPolls.length > 0 && (
        <section className="mr-sec">
          <div className="mr-sec-head"><span>Past polls <b>{closedPolls.length}</b></span></div>
          {closedPolls.map(cp => {
            const open = openPollDetails.has(cp.id);
            return (
              <div key={cp.id} className="mr-poll-hist">
                <div className="mr-poll-hist-head">
                  <span className="mr-poll-hist-q">{cp.question}</span>
                  <span className="mr-poll-hist-n">{cp.totalVotes} {cp.totalVotes === 1 ? 'vote' : 'votes'}</span>
                </div>
                <div className="mr-poll-rows">{pollBars(cp, cp.totalVotes)}</div>
                {(cp.voters || []).length > 0 && (
                  <button type="button" className="mr-link" onClick={() => setOpenPollDetails(prev => {
                    const n = new Set(prev);
                    if (n.has(cp.id)) n.delete(cp.id); else n.add(cp.id);
                    return n;
                  })}>{open ? 'Hide answers' : 'Show who answered what'}</button>
                )}
                {open && (
                  <div className="mr-poll-voters">
                    {cp.voters.map((v, vi) => (
                      <div key={vi}>
                        <span>{v.first_name} {v.last_name}</span>
                        <b style={{ color: POLL_COLORS[v.option_index % POLL_COLORS.length] }}>{(cp.options || [])[v.option_index] || `Option ${v.option_index + 1}`}</b>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}
    </div>
  );

  /* ═══════════ RENDER ═══════════ */
  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#059669', fontSize: 13, borderRadius: 8 } }}>
      <div ref={rootRef} className={`mr${mobile ? ' is-mobile' : ''}${panel ? ' has-panel' : ''}`}>
        {/* ── Top bar ── */}
        <header className="mr-top">
          <div className="mr-top-left">
            <div className="mr-top-title">{meeting.title}</div>
            <div className="mr-top-chips">
              {isRecording && <span className="mr-rec"><i /> REC <Elapsed since={recStartedAt!} /></span>}
              {isLocked && <span className="mr-chip">{Ic.lock} Locked</span>}
              {meeting.batch_name && !mobile && <span className="mr-chip">{meeting.batch_name}</span>}
            </div>
          </div>
          <div className="mr-top-right">
            {raisedHands.length > 0 && (
              <button type="button" className="mr-hands-chip" onClick={() => openPanel('people', true)}>
                {Ic.hand}<span>{raisedHands.length}</span>
              </button>
            )}
            {tip(`Your connection: ${quality}`, <span className="mr-quality"><QualityBars q={quality} /></span>)}
            <span className="mr-timer"><Elapsed since={joinedAt} /></span>
            {!mobile && tip(isHost ? 'Invite people — meeting ID & passcode' : 'Meeting details', (
              <button type="button" className="mr-code-btn" onClick={() => setInfoOpen(true)} aria-label={isHost ? 'Invite people' : 'Meeting details'}>
                {isHost ? Ic.link : Ic.info}<span>{meeting.code}</span>
              </button>
            ))}
            {canFullscreen && !mobile && tip(isFullscreen ? 'Exit full screen' : 'Full screen', (
              <button type="button" className="mr-icon-btn" onClick={toggleFullscreen} aria-label={isFullscreen ? 'Exit full screen' : 'Full screen'}>
                {isFullscreen ? Ic.shrink : Ic.expand}
              </button>
            ))}
          </div>
        </header>

        {reconnecting && <div className="mr-banner is-warn"><LoadingOutlined /> Connection lost — reconnecting…</div>}
        {announceOpen && (
          <div className="mr-banner is-input">
            <span className="mr-banner-ic">{Ic.megaphone}</span>
            <Input className="mr-input" autoFocus value={announceInput} maxLength={200} placeholder="Type an announcement for everyone…"
              onChange={e => setAnnounceInput(e.target.value)} onPressEnter={sendAnnouncement} />
            <Button size="small" type="primary" disabled={!announceInput.trim()} onClick={sendAnnouncement}>Send</Button>
            <button type="button" className="mr-icon-btn is-sm" onClick={() => setAnnounceOpen(false)} aria-label="Cancel announcement">{Ic.close}</button>
          </div>
        )}

        <div className="mr-body">
          <main className="mr-main">
            <MeetingStage
              teacherIdentity={teacherIdentity}
              raisedHands={handIds}
              layout={layout}
              pinned={pinned}
              onPin={setPinned}
              onShowPeople={() => openPanel('people', true)}
              onStopShare={toggleShare}
              aloneHint={isHost ? 'Your students will appear here as they join.' : 'Others will appear here as they join.'}
            />

            {whiteboardOpen && (
              <div className="mr-wb">
                <div className="mr-wb-head">
                  <span className="mr-wb-title">{Ic.pen} Whiteboard</span>
                  <span className="mr-wb-note">{isHost ? 'Only you see this board — present your screen to show it to the class.' : 'Personal board — only you see it.'}</span>
                  <button type="button" className="mr-icon-btn is-light" onClick={() => setWhiteboardOpen(false)} aria-label="Close whiteboard">{Ic.close}</button>
                </div>
                <div className="mr-wb-body"><Whiteboard /></div>
              </div>
            )}

            {announcement && (
              <div className="mr-announce" role="status">
                <span className="mr-announce-ic">{Ic.megaphone}</span>
                <div><strong>Announcement</strong><p>{announcement}</p></div>
                <button type="button" className="mr-icon-btn is-sm" onClick={() => setAnnouncement(null)} aria-label="Dismiss announcement">{Ic.close}</button>
              </div>
            )}

            {isHost && admissions.length > 0 && panel !== 'people' && (
              <div className="mr-toast mr-toast-admit" role="status">
                <span className="mr-person-avatar" style={{ background: colorFor(admissions[0].userName) }}>{initials(admissions[0].userName)}</span>
                <div className="mr-toast-text">
                  <strong>{admissions[0].userName}</strong>
                  <span>wants to join{admissions.length > 1 ? ` · +${admissions.length - 1} more` : ''}</span>
                </div>
                <div className="mr-toast-actions">
                  <Button size="small" onClick={() => (admissions.length > 1 ? openPanel('people', true) : handleDecline(admissions[0].userId))}>
                    {admissions.length > 1 ? 'View all' : 'Deny'}
                  </Button>
                  <Button size="small" type="primary" onClick={() => handleAdmit(admissions[0].userId)}>Admit</Button>
                </div>
              </div>
            )}

            {chatToast && panel !== 'chat' && (
              <button type="button" className="mr-toast mr-toast-chat" onClick={() => openPanel('chat', true)}>
                <span className="mr-person-avatar" style={{ background: colorFor(chatToast.sender) }}>{initials(chatToast.sender)}</span>
                <span className="mr-toast-text"><strong>{chatToast.sender}</strong><span>{chatToast.text}</span></span>
              </button>
            )}

            {emojis.map(e => (
              <div key={e.id} className="mr-emoji" style={{ left: `${e.x}%` }} aria-hidden>
                <span className="mr-emoji-glyph">{e.emoji}</span>
                <span className="mr-emoji-name">{e.sender}</span>
              </div>
            ))}

            {connecting && <div className="mr-connecting"><LoadingOutlined /> Connecting to the class…</div>}
          </main>

          {panel && (
            <aside className="mr-panel" aria-label="Side panel">
              <div className="mr-panel-head">
                <div className="mr-tabs" role="tablist">
                  <button type="button" role="tab" aria-selected={panel === 'people'} className={panel === 'people' ? 'is-active' : ''} onClick={() => openPanel('people', true)}>
                    People <b>{participants.length}</b>{admissions.length > 0 && <i className="mr-dot" />}
                  </button>
                  <button type="button" role="tab" aria-selected={panel === 'chat'} className={panel === 'chat' ? 'is-active' : ''} onClick={() => openPanel('chat', true)}>
                    Chat{unread > 0 && <b className="is-alert">{unread}</b>}
                  </button>
                  {pollsVisible && (
                    <button type="button" role="tab" aria-selected={panel === 'polls'} className={panel === 'polls' ? 'is-active' : ''} onClick={() => openPanel('polls', true)}>
                      Polls{activePoll && <i className="mr-dot" />}
                    </button>
                  )}
                </div>
                <button type="button" className="mr-icon-btn" onClick={() => setPanel(null)} aria-label="Close panel">{Ic.close}</button>
              </div>
              {panel === 'people' && peopleView}
              {panel === 'chat' && chatView}
              {panel === 'polls' && pollsView}
            </aside>
          )}
        </div>

        {/* ── Control bar ── */}
        <footer className="mr-bar">
          <div className="mr-bar-side mr-bar-left">
            {!r.isCompact && (
              <>
                <span className="mr-clock"><Clock /></span>
                <span className="mr-bar-sep" />
                <span className="mr-bar-title">{meeting.title}</span>
              </>
            )}
          </div>

          <div className="mr-bar-center">
            <div className="mr-split mr-pop-anchor">
              {tip(`${lp.isMicrophoneEnabled ? 'Turn off' : 'Turn on'} microphone (Ctrl + D)`, (
                <button type="button" className={`mr-ctl${lp.isMicrophoneEnabled ? '' : ' is-off'}`} onClick={toggleMic}
                  aria-label={lp.isMicrophoneEnabled ? 'Turn off microphone' : 'Turn on microphone'} aria-pressed={!lp.isMicrophoneEnabled}>
                  {lp.isMicrophoneEnabled ? Ic.mic : Ic.micOff}
                </button>
              ))}
              {!mobile && (
                <button type="button" className={`mr-ctl-caret${menu === 'mic' ? ' is-open' : ''}`} onClick={() => setMenu(menu === 'mic' ? null : 'mic')} aria-label="Audio devices">
                  {Ic.chevronUp}
                </button>
              )}
              {menu === 'mic' && !mobile && (
                <div className="mr-pop mr-pop-devices" role="menu">
                  <DeviceMenu kind="audioinput" title="Microphone" storeKey="audioDeviceId" />
                  {canPickSpeaker && <DeviceMenu kind="audiooutput" title="Speaker" storeKey="speakerDeviceId" />}
                  <button type="button" className="mr-menu-link" onClick={() => { setMenu(null); setSettingsOpen(true); }}>{Ic.settings} Audio & video settings</button>
                </div>
              )}
            </div>

            <div className="mr-split mr-pop-anchor">
              {tip(`${lp.isCameraEnabled ? 'Turn off' : 'Turn on'} camera (Ctrl + E)`, (
                <button type="button" className={`mr-ctl${lp.isCameraEnabled ? '' : ' is-off'}`} onClick={toggleCam}
                  aria-label={lp.isCameraEnabled ? 'Turn off camera' : 'Turn on camera'} aria-pressed={!lp.isCameraEnabled}>
                  {lp.isCameraEnabled ? Ic.cam : Ic.camOff}
                </button>
              ))}
              {!mobile && (
                <button type="button" className={`mr-ctl-caret${menu === 'cam' ? ' is-open' : ''}`} onClick={() => setMenu(menu === 'cam' ? null : 'cam')} aria-label="Cameras">
                  {Ic.chevronUp}
                </button>
              )}
              {menu === 'cam' && !mobile && (
                <div className="mr-pop mr-pop-devices" role="menu">
                  <DeviceMenu kind="videoinput" title="Camera" storeKey="videoDeviceId" />
                  <button type="button" className="mr-menu-link" onClick={() => { setMenu(null); setSettingsOpen(true); }}>{Ic.settings} Audio & video settings</button>
                </div>
              )}
            </div>

            {!mobile && tip(iAmSharing ? 'Stop presenting' : 'Present your screen', (
              <button type="button" className={`mr-ctl${iAmSharing ? ' is-active' : ''}`} onClick={toggleShare} aria-label={iAmSharing ? 'Stop presenting' : 'Present your screen'}>
                {iAmSharing ? Ic.shareStop : Ic.share}
              </button>
            ))}

            {!mobile && (
              <div className="mr-pop-anchor">
                {tip('Send a reaction', (
                  <button type="button" className={`mr-ctl${menu === 'reactions' ? ' is-active' : ''}`} onClick={() => setMenu(menu === 'reactions' ? null : 'reactions')} aria-label="Send a reaction">
                    {Ic.smile}
                  </button>
                ))}
                {menu === 'reactions' && (
                  <div className="mr-pop mr-pop-emoji" role="menu">
                    {EMOJIS.map(e => <button key={e} type="button" onClick={() => sendEmoji(e)} aria-label={`React ${e}`}>{e}</button>)}
                  </div>
                )}
              </div>
            )}

            {tip(handRaised ? 'Lower your hand' : 'Raise your hand', (
              <button type="button" className={`mr-ctl${handRaised ? ' is-hand' : ''}`} onClick={toggleHand} aria-label={handRaised ? 'Lower your hand' : 'Raise your hand'} aria-pressed={handRaised}>
                {Ic.hand}
              </button>
            ))}

            {mobile && (
              <button type="button" className={`mr-ctl${panel === 'chat' ? ' is-active' : ''}`} onClick={() => openPanel('chat')} aria-label="Chat">
                <Badge count={unread} size="small" offset={[4, -4]}>{Ic.chat}</Badge>
              </button>
            )}

            <div className="mr-pop-anchor">
              {tip('More options', (
                <button type="button" className={`mr-ctl${menu === 'more' ? ' is-active' : ''}`} onClick={() => setMenu(menu === 'more' ? null : 'more')} aria-label="More options">
                  <Badge dot={isRecording || (mobile && admissions.length > 0)} offset={[-2, 2]}>{Ic.more}</Badge>
                </button>
              ))}
              {menu === 'more' && !mobile && (
                <div className="mr-pop mr-pop-more" role="menu">
                  <div className="mr-menu-title">Layout</div>
                  <div className="mr-layouts">
                    {layouts.map(l => (
                      <button key={l.key} type="button" className={layout === l.key ? 'is-active' : ''} onClick={() => chooseLayout(l.key)}>
                        {l.icon}<span>{l.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="mr-menu-sep" />
                  {moreItems.map(it => (
                    <button key={it.key} type="button" className={`mr-menu-item${it.active ? ' is-active' : ''}${it.danger ? ' is-danger' : ''}`}
                      onClick={() => { setMenu(null); it.onClick(); }}>
                      <span className="mr-menu-ic">{it.icon}</span>
                      <span className="mr-menu-label">{it.label}</span>
                      {it.hint && <span className="mr-menu-hint">{it.hint}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mr-pop-anchor">
              {tip(isHost ? 'Leave or end the class' : 'Leave the class', (
                <button type="button" className="mr-ctl mr-ctl-leave" aria-label={isHost ? 'Leave or end the class' : 'Leave the class'}
                  onClick={() => (isHost ? setMenu(menu === 'leave' ? null : 'leave') : setConfirm('leave'))}>
                  {Ic.leave}
                </button>
              ))}
              {menu === 'leave' && (
                <div className="mr-pop mr-pop-leave" role="menu">
                  <button type="button" onClick={() => { setMenu(null); setConfirm('leave'); }}>
                    <strong>Leave class</strong><span>The class keeps running without you</span>
                  </button>
                  <button type="button" className="is-danger" onClick={() => { setMenu(null); setConfirm('end'); }}>
                    <strong>End class for everyone</strong><span>Everyone is disconnected</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mr-bar-side mr-bar-right">
            {!mobile && (
              <>
                {panelButton('people', Ic.people, 'People', (
                  <span className="mr-ctl-count">{participants.length}{admissions.length > 0 && <i className="mr-dot" />}</span>
                ))}
                {panelButton('chat', Ic.chat, 'Chat', unread > 0 ? <span className="mr-ctl-badge">{unread > 9 ? '9+' : unread}</span> : undefined)}
                {pollsVisible && panelButton('polls', Ic.poll, activePoll ? 'Live poll' : 'Polls', activePoll ? <i className="mr-dot mr-ctl-dot" /> : undefined)}
              </>
            )}
          </div>
        </footer>

        {/* ── Mobile sheets ── */}
        {mobile && menu === 'more' && (
          <div className="mr-sheet-backdrop" onClick={() => setMenu(null)}>
            <div className="mr-sheet" onClick={e => e.stopPropagation()} role="dialog" aria-label="More options">
              <div className="mr-sheet-grab" />
              <div className="mr-sheet-head">
                <strong>More options</strong>
                <button type="button" className="mr-icon-btn" onClick={() => setMenu(null)} aria-label="Close">{Ic.close}</button>
              </div>
              <div className="mr-layouts">
                {layouts.map(l => (
                  <button key={l.key} type="button" className={layout === l.key ? 'is-active' : ''} onClick={() => chooseLayout(l.key)}>
                    {l.icon}<span>{l.label}</span>
                  </button>
                ))}
              </div>
              <div className="mr-sheet-grid">
                {moreItems.map(it => (
                  <button key={it.key} type="button" className={`mr-sheet-item${it.active ? ' is-active' : ''}${it.danger ? ' is-danger' : ''}`}
                    onClick={() => { setMenu(null); it.onClick(); }}>
                    <span className="mr-sheet-ic"><Badge count={it.badge} size="small" offset={[6, -4]}>{it.icon}</Badge></span>
                    <span>{it.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {mobile && menu === 'reactions' && (
          <div className="mr-sheet-backdrop" onClick={() => setMenu(null)}>
            <div className="mr-sheet" onClick={e => e.stopPropagation()} role="dialog" aria-label="Send a reaction">
              <div className="mr-sheet-grab" />
              <div className="mr-sheet-head">
                <strong>Send a reaction</strong>
                <button type="button" className="mr-icon-btn" onClick={() => setMenu(null)} aria-label="Close">{Ic.close}</button>
              </div>
              <div className="mr-emoji-grid">
                {EMOJIS.map(e => <button key={e} type="button" onClick={() => sendEmoji(e)} aria-label={`React ${e}`}>{e}</button>)}
              </div>
            </div>
          </div>
        )}

        {settingsOpen && <DeviceSettings onClose={() => setSettingsOpen(false)} />}

        <MeetingShare
          open={infoOpen}
          isHost={isHost}
          meeting={{
            id: meeting.id,
            code: meeting.code,
            title: meeting.title,
            passcode: isHost ? meeting.passcode : null,
            batch_name: meeting.batch_name,
            hostName: `${meeting.teacher_first_name || ''} ${meeting.teacher_last_name || ''}`.trim() || undefined,
          }}
          apiCall={isHost ? apiCall : undefined}
          onPasscodeChange={onPasscodeChange}
          onClose={() => setInfoOpen(false)}
        />

        {confirm && (
          <div className="mr-dialog-backdrop" onClick={() => !busy && setConfirm(null)}>
            <div className="mr-dialog mr-confirm" role="alertdialog" aria-modal="true" onClick={e => e.stopPropagation()}>
              <span className={`mr-confirm-ic${confirm === 'end' ? ' is-danger' : ''}`}>{Ic.leave}</span>
              <h3>{confirm === 'end' ? 'End the class for everyone?' : 'Leave the class?'}</h3>
              <p>
                {confirm === 'end'
                  ? 'Everyone will be disconnected and attendance will be saved.'
                  : 'You can rejoin from Live meetings while the class is running.'}
              </p>
              <div className="mr-confirm-actions">
                <Button onClick={() => setConfirm(null)} disabled={busy}>Cancel</Button>
                <Button type="primary" danger loading={busy} onClick={async () => { setBusy(true); await (confirm === 'end' ? onEnd() : onLeave()); }}>
                  {confirm === 'end' ? 'End class' : 'Leave'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ConfigProvider>
  );
};

export default MeetingPage;
