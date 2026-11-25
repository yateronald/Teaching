import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { App, Button, ConfigProvider } from 'antd';
import {
  ArrowLeftOutlined, CheckCircleOutlined, DisconnectOutlined, ExclamationCircleOutlined,
  LoadingOutlined, LockOutlined, QuestionCircleOutlined, ReloadOutlined, StopOutlined,
} from '@ant-design/icons';
import { LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react';
import { DisconnectReason, VideoPresets } from 'livekit-client';
import type { RoomOptions } from 'livekit-client';
import { createGuestSocket } from '../../utils/realtime';
import type { Socket } from '../../utils/realtime';
import ConnectionGuard from './ConnectionGuard';
import type { MediaState, RejoinAnswer } from './ConnectionGuard';
import PreJoin, { loadMediaChoices } from './PreJoin';
import type { MediaChoices, PreJoinStatus } from './PreJoin';
import { MeetingRoomUI, StatusScreen } from './MeetingRoom';
import type { MeetingData } from './MeetingRoom';
import { passcodeFromLink } from './meetingUi';
import './MeetingShell.css';
import './MeetingRoom.css';

const API_BASE = ((import.meta.env.VITE_API_BASE_URL as string | undefined) || 'https://api.learnfrenchwithnatives.com/api').replace(/\/$/, '');

type Phase = 'loading' | 'prejoin' | 'room' | 'ended' | 'locked' | 'kicked' | 'declined' | 'disconnected' | 'notfound' | 'error';

interface PublicMeta {
  id: number;
  code: string;
  title: string;
  status: string;
  is_locked: boolean;
  require_approval: boolean;
  scheduled_start?: string | null;
  scheduled_end?: string | null;
  needs_passcode: boolean;
  host_name: string;
  host_role: 'admin' | 'teacher';
  guest?: { guest_id: string; display_name: string; guest_status: string; waiting: boolean };
}

const cleanPass = (v: string) => v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);

const PublicMeetingRoom: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { message } = App.useApp();

  const navState = (location.state || {}) as { displayName?: string; email?: string; passcode?: string; verified?: boolean };

  const [meta, setMeta] = useState<PublicMeta | null>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  const [preStatus, setPreStatus] = useState<PreJoinStatus>('idle');
  const [conn, setConn] = useState<{ token: string; url: string } | null>(null);
  const [roomChoices, setRoomChoices] = useState<MediaChoices | null>(null);
  const [live, setLive] = useState<MediaState>({ mic: false, cam: false });
  const [socket, setSocket] = useState<Socket | null>(null);
  const [guestToken, setGuestToken] = useState<string | null>(null);
  const [reload, setReload] = useState(0);

  const [displayName, setDisplayName] = useState(() => navState.displayName || '');
  const [email, setEmail] = useState(() => navState.email || '');
  const [passcode, setPasscode] = useState(() => cleanPass(navState.passcode || passcodeFromLink(location.hash)));
  const [passError, setPassError] = useState<string | null>(null);
  const [lobbySince, setLobbySince] = useState<number | null>(null);
  const [declined, setDeclined] = useState<{ retryAfter?: number; final?: boolean }>({});
  const [notStartedInfo, setNotStartedInfo] = useState<{ hostName: string; hostRole: 'admin' | 'teacher' } | null>(null);

  const choicesRef = useRef<MediaChoices>(loadMediaChoices());
  const statusRef = useRef(preStatus);
  statusRef.current = preStatus;
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const passRef = useRef(passcode);
  passRef.current = passcode;
  const nameRef = useRef(displayName);
  nameRef.current = displayName;
  const emailRef = useRef(email);
  emailRef.current = email;
  const guestTokenRef = useRef(guestToken);
  guestTokenRef.current = guestToken;
  const recoverRef = useRef<((why: string) => void) | null>(null);
  const leavingRef = useRef(false);

  // Inject noindex + remove #pwd fragment cleanly from URL
  useEffect(() => {
    const prevTitle = document.title;
    const metaTag = document.createElement('meta');
    metaTag.name = 'robots';
    metaTag.content = 'noindex, nofollow';
    document.head.appendChild(metaTag);
    if (location.hash.includes('pwd=')) {
      window.history.replaceState(window.history.state, '', location.pathname + location.search);
    }
    return () => {
      document.title = prevTitle;
      metaTag.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (meta?.title) document.title = `${meta.title} — Meeting`;
  }, [meta?.title]);

  const loadMeta = useCallback(async () => {
    if (!code) return null;
    const headers: Record<string, string> = {};
    if (guestTokenRef.current) headers.Authorization = `Bearer ${guestTokenRef.current}`;
    const resp = await fetch(`${API_BASE}/public/meetings/${encodeURIComponent(code)}`, { headers });
    if (resp.status === 404) { setPhase('notfound'); return null; }
    if (!resp.ok) { setPhase('error'); return null; }
    const data: PublicMeta = await resp.json();
    setMeta(data);
    return data;
  }, [code]);

  useEffect(() => {
    if (!code) return;
    let cancelled = false;
    setPhase('loading');
    (async () => {
      try {
        const data = await loadMeta();
        if (cancelled || !data) return;
        if (data.status === 'ended') { setPhase('ended'); return; }
        if (data.status === 'scheduled' || data.status === 'waiting') {
          setNotStartedInfo({ hostName: data.host_name, hostRole: data.host_role });
        } else {
          setNotStartedInfo(null);
        }
        setPhase('prejoin');
      } catch {
        if (!cancelled) setPhase('error');
      }
    })();
    return () => { cancelled = true; };
  }, [code, reload, loadMeta]);

  const enterRoom = useCallback((token: string, url: string) => {
    setRoomChoices({ ...choicesRef.current });
    setLive({ mic: !!choicesRef.current.audioEnabled, cam: !!choicesRef.current.videoEnabled });
    setConn({ token, url });
    setLobbySince(null);
    setNotStartedInfo(null);
    setPhase('room');
  }, []);

  const handleJoin = useCallback(async () => {
    if (!code) return;
    const cleanName = nameRef.current.trim();
    if (cleanName.length < 2) {
      message.warning('Please enter your name (at least 2 characters).');
      return;
    }
    setPreStatus(s => (s === 'waiting' || s === 'lobby' ? s : 'joining'));
    setPassError(null);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (guestTokenRef.current) headers.Authorization = `Bearer ${guestTokenRef.current}`;
      const resp = await fetch(`${API_BASE}/public/meetings/${encodeURIComponent(code)}/join`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          display_name: cleanName,
          email: emailRef.current.trim() || undefined,
          passcode: passRef.current || undefined,
        }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        if (data.code === 'BAD_PASSCODE' || data.code === 'TOO_MANY_ATTEMPTS') {
          setPassError(data.error || 'Incorrect passcode');
          setPreStatus('idle');
          return;
        }
        throw new Error(data.error || 'Could not join meeting');
      }

      if (data.guest_token) setGuestToken(data.guest_token);

      switch (data.action) {
        case 'join':
          enterRoom(data.token, data.livekitUrl);
          break;
        case 'passcode':
          setPassError('Please enter the 6-character passcode.');
          setPreStatus('idle');
          break;
        case 'not_started':
          setNotStartedInfo({
            hostName: data.host_name || meta?.host_name || 'the host',
            hostRole: data.host_role || meta?.host_role || 'admin',
          });
          setPreStatus('waiting');
          break;
        case 'lobby':
          setNotStartedInfo(null);
          setPreStatus('lobby');
          setLobbySince(t => t ?? Date.now());
          break;
        case 'declined':
          setDeclined({ retryAfter: data.retryAfter, final: data.final });
          setPreStatus('idle');
          setPhase('declined');
          break;
        case 'ended':
          setPhase('ended');
          break;
        case 'locked':
          setPreStatus('idle');
          setPhase('locked');
          break;
        case 'kicked':
          setPhase('kicked');
          break;
        default:
          setPreStatus('idle');
      }
    } catch (e: unknown) {
      setPreStatus('idle');
      message.error(e instanceof Error && e.message ? e.message : 'Unable to reach the meeting. Please try again.');
    }
  }, [code, enterRoom, message, meta?.host_name, meta?.host_role]);

  const joinRef = useRef(handleJoin);
  joinRef.current = handleJoin;

  // Scoped guest Socket.IO lifecycle (created only after obtaining guestToken; never reads portal localStorage)
  useEffect(() => {
    if (!meta?.id || !guestToken) return;
    const s = createGuestSocket(guestToken);
    setSocket(s);

    const subscribe = () => s.emit('meeting:subscribe', { meetingId: meta.id }, (r?: { ok: boolean; ended?: boolean; role?: string; waiting?: boolean }) => {
      if (r?.ended) setPhase('ended');
      if (r?.ok && r.role === 'lobby' && !r.waiting && statusRef.current === 'lobby') {
        joinRef.current();
      }
    });

    if (s.connected) subscribe();
    s.on('connect', subscribe);
    s.on('meeting:started', (d?: { meetingId?: number }) => {
      if (d?.meetingId && Number(d.meetingId) !== meta.id) return;
      setMeta(m => (m ? { ...m, status: 'active' } : m));
      setNotStartedInfo(null);
      if (statusRef.current === 'waiting' || statusRef.current === 'not_ready') {
        joinRef.current();
      }
    });
    s.on('meeting:admitted', (d?: { meetingId?: number }) => {
      if (d?.meetingId && Number(d.meetingId) !== meta.id) return;
      joinRef.current();
      subscribe();
    });
    s.on('meeting:declined', (d?: { meetingId?: number }) => {
      if (d?.meetingId && Number(d.meetingId) !== meta.id) return;
      setDeclined({ retryAfter: 120 });
      setPreStatus('idle');
      setPhase('declined');
    });
    s.on('meeting:ended', (d?: { meetingId?: number }) => {
      if (d?.meetingId && Number(d.meetingId) !== meta.id) return;
      if (!leavingRef.current) setPhase('ended');
    });
    s.on('meeting:kicked', (d?: { meetingId?: number }) => {
      if (d?.meetingId && Number(d.meetingId) !== meta.id) return;
      setPhase('kicked');
    });

    return () => {
      s.emit('meeting:unsubscribe', { meetingId: meta.id });
      s.disconnect();
      setSocket(null);
    };
  }, [meta?.id, guestToken]);

  // Fallback poll while waiting for host to start or admit (in case guest browser slept WebSocket)
  useEffect(() => {
    if (phase !== 'prejoin' || (preStatus !== 'waiting' && preStatus !== 'lobby')) return;
    const id = window.setInterval(async () => {
      const fresh = await loadMeta().catch(() => null);
      if (!fresh) return;
      if (fresh.status === 'ended') { setPhase('ended'); return; }
      if (statusRef.current === 'waiting' && fresh.status === 'active') {
        joinRef.current();
        return;
      }
      if (statusRef.current === 'lobby') {
        const gs = fresh.guest?.guest_status;
        if (gs === 'admitted' || fresh.require_approval === false) {
          joinRef.current();
        } else if (gs === 'declined') {
          setDeclined({ retryAfter: 120 });
          setPreStatus('idle');
          setPhase('declined');
        } else if (gs === 'kicked') {
          setPhase('kicked');
        }
      }
    }, 6000);
    return () => window.clearInterval(id);
  }, [phase, preStatus, loadMeta]);

  const stopWaiting = useCallback(async () => {
    if (code && guestTokenRef.current) {
      await fetch(`${API_BASE}/public/meetings/${encodeURIComponent(code)}/lobby`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${guestTokenRef.current}` },
      }).catch(() => {});
    }
    setLobbySince(null);
    setPreStatus('idle');
  }, [code]);

  const rejoin = useCallback(async (): Promise<RejoinAnswer> => {
    if (!code) return { kind: 'stop' };
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (guestTokenRef.current) headers.Authorization = `Bearer ${guestTokenRef.current}`;
      const resp = await fetch(`${API_BASE}/public/meetings/${encodeURIComponent(code)}/join`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          display_name: nameRef.current.trim() || 'Guest',
          passcode: passRef.current || undefined,
        }),
      });
      if (!resp.ok) return { kind: 'retry' };
      const d = await resp.json();
      if (d.guest_token) setGuestToken(d.guest_token);
      if (d.action === 'join') return { kind: 'token', token: d.token, url: d.livekitUrl };
      if (d.action === 'ended') { setPhase('ended'); return { kind: 'stop' }; }
      if (d.action === 'kicked') { setPhase('kicked'); return { kind: 'stop' }; }
      if (d.action === 'declined') { setDeclined({ retryAfter: d.retryAfter, final: d.final }); setPhase('declined'); return { kind: 'stop' }; }
      if (d.action === 'locked') { setPhase('locked'); return { kind: 'stop' }; }
      return { kind: 'retry' };
    } catch {
      return { kind: 'retry' };
    }
  }, [code]);

  const handleLeave = useCallback(async () => {
    leavingRef.current = true;
    if (code && guestTokenRef.current) {
      await fetch(`${API_BASE}/public/meetings/${encodeURIComponent(code)}/leave`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${guestTokenRef.current}` },
      }).catch(() => {});
    }
    navigate('/meeting');
  }, [code, navigate]);

  const onDisconnected = useCallback((reason?: DisconnectReason) => {
    if (leavingRef.current || phaseRef.current !== 'room') return;
    if (reason === DisconnectReason.ROOM_DELETED) { setPhase('ended'); return; }
    if (reason === DisconnectReason.PARTICIPANT_REMOVED) { setPhase('kicked'); return; }
    recoverRef.current?.(`livekit-${reason ?? 'unknown'}`);
  }, []);

  const guestApiCall = useCallback(async () => new Response(JSON.stringify({}), { status: 403 }), []);

  const roomOptions = useMemo<RoomOptions>(() => ({
    adaptiveStream: { pixelDensity: 'screen' },
    dynacast: true,
    audioCaptureDefaults: {
      echoCancellation: true, noiseSuppression: true, autoGainControl: true,
      ...(roomChoices?.audioDeviceId ? { deviceId: roomChoices.audioDeviceId } : {}),
    },
    videoCaptureDefaults: {
      resolution: VideoPresets.h720.resolution,
      ...(roomChoices?.videoDeviceId ? { deviceId: roomChoices.videoDeviceId } : {}),
    },
    publishDefaults: {
      simulcast: true,
      videoSimulcastLayers: [VideoPresets.h180, VideoPresets.h360],
      screenShareEncoding: { maxBitrate: 3_000_000, maxFramerate: 15, priority: 'high' },
    },
    ...(roomChoices?.speakerDeviceId ? { audioOutput: { deviceId: roomChoices.speakerDeviceId } } : {}),
  }), [roomChoices]);

  const back = () => navigate('/meeting');
  const shell = (node: React.ReactNode) => (
    <ConfigProvider theme={{ token: { colorPrimary: '#047857', fontSize: 13, borderRadius: 8 } }}>{node}</ConfigProvider>
  );

  if (phase === 'loading') {
    return shell(
      <div className="mr-status-screen">
        <div className="mr-loading">
          <LoadingOutlined />
          <span>Loading meeting…</span>
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
        title="This meeting was not found"
        text="The link or Meeting ID may be incorrect, or this meeting is not open for public access."
        hint="Double-check the invitation link or enter the Meeting ID and passcode on the meeting entry page."
      >
        <Button type="primary" icon={<ArrowLeftOutlined />} onClick={back}>Back to join page</Button>
      </StatusScreen>
    );
  }
  if (phase === 'error' || !meta) {
    return shell(
      <StatusScreen
        tone="danger"
        badge="Connection Issue"
        icon={<ExclamationCircleOutlined />}
        title="Unable to load this meeting"
        text="Please check your internet connection and try again."
      >
        <Button icon={<ArrowLeftOutlined />} onClick={back}>Back</Button>
        <Button type="primary" icon={<ReloadOutlined />} onClick={() => setReload(n => n + 1)}>Try again</Button>
      </StatusScreen>
    );
  }
  if (phase === 'ended') {
    return shell(
      <StatusScreen
        tone="success"
        badge="Meeting Ended"
        icon={<CheckCircleOutlined />}
        title="This meeting has ended"
        text="Thank you for joining! You may now close this window."
        meetingTitle={meta.title}
      >
        <Button type="primary" icon={<ArrowLeftOutlined />} onClick={back}>Join another meeting</Button>
      </StatusScreen>
    );
  }
  if (phase === 'locked') {
    return shell(
      <StatusScreen
        tone="warning"
        badge="Room Locked"
        icon={<LockOutlined />}
        title="This meeting is locked"
        text="The host has temporarily locked this room. Contact your host if you still need to join."
        meetingTitle={meta.title}
      >
        <Button icon={<ArrowLeftOutlined />} onClick={back}>Back</Button>
        <Button type="primary" icon={<ReloadOutlined />} onClick={() => { setPhase('prejoin'); setPreStatus('idle'); }}>Try again</Button>
      </StatusScreen>
    );
  }
  if (phase === 'kicked') {
    return shell(
      <StatusScreen
        tone="danger"
        badge="Removed"
        icon={<StopOutlined />}
        title="You were removed from the meeting"
        text="The host removed you from this session."
        meetingTitle={meta.title}
      >
        <Button type="primary" icon={<ArrowLeftOutlined />} onClick={back}>Back</Button>
      </StatusScreen>
    );
  }
  if (phase === 'declined') {
    return shell(
      <StatusScreen
        tone="neutral"
        badge="Request Declined"
        icon={<StopOutlined />}
        title="Your request to join was declined"
        text={declined.final
          ? 'The host declined your request several times. You cannot request entry again.'
          : 'The host did not admit you at this time.'}
        hint={declined.final ? undefined : `You can ask again in ${Math.max(1, Math.ceil((declined.retryAfter || 120) / 60))} minute(s).`}
        meetingTitle={meta.title}
      >
        <Button icon={<ArrowLeftOutlined />} onClick={back}>Back</Button>
        {!declined.final && <Button type="primary" icon={<ReloadOutlined />} onClick={() => { setPhase('prejoin'); setPreStatus('idle'); }}>Try again</Button>}
      </StatusScreen>
    );
  }
  if (phase === 'disconnected') {
    return shell(
      <StatusScreen
        tone="warning"
        badge="Connection Dropped"
        icon={<DisconnectOutlined />}
        title="Connection lost"
        text="Check your internet connection and click Rejoin."
        meetingTitle={meta.title}
      >
        <Button icon={<ArrowLeftOutlined />} onClick={back}>Back</Button>
        <Button type="primary" icon={<ReloadOutlined />} onClick={() => joinRef.current()}>Rejoin now</Button>
      </StatusScreen>
    );
  }

  if (phase === 'room' && conn && roomChoices) {
    const meetingData: MeetingData = {
      id: meta.id,
      code: meta.code,
      room_name: meta.code,
      title: meta.title,
      teacher_id: 0,
      status: meta.status,
      is_locked: meta.is_locked,
      is_public: true,
      require_approval: meta.require_approval,
      teacher_first_name: meta.host_name,
      teacher_last_name: '',
      my_role: 'guest',
      needs_passcode: false,
    };
    return createPortal(
      <LiveKitRoom
        serverUrl={conn.url}
        token={conn.token}
        connect
        audio={live.mic}
        video={live.cam}
        options={roomOptions}
        onDisconnected={onDisconnected}
        onError={() => recoverRef.current?.('connect-error')}
        style={{ height: '100dvh', width: '100vw' }}
      >
        <RoomAudioRenderer />
        <ConnectionGuard
          rejoin={rejoin}
          onMediaState={setLive}
          onLongAbsence={async () => {}}
          onGiveUp={() => { if (!leavingRef.current) setPhase('disconnected'); }}
          onLeave={() => { void handleLeave(); }}
          leavingRef={leavingRef}
          recoverRef={recoverRef}
        />
        <MeetingRoomUI
          meeting={meetingData}
          isHost={false}
          guestMode
          apiCall={guestApiCall}
          socket={socket}
          onLeave={handleLeave}
          onEnd={handleLeave}
          onPasscodeChange={() => {}}
        />
      </LiveKitRoom>,
      document.body
    );
  }

  // Clear explanatory banner when meeting hasn't been started by admin/host yet
  const isWaitingForStart = preStatus === 'waiting' || meta.status === 'scheduled' || meta.status === 'waiting';
  const hostRoleWord = (notStartedInfo?.hostRole || meta.host_role) === 'admin' ? 'The administrator' : 'The host';
  const hostDisplay = notStartedInfo?.hostName || meta.host_name;

  const customStatusTitle = preStatus === 'lobby'
    ? `Waiting for ${hostDisplay} to let you in`
    : isWaitingForStart
      ? `${hostRoleWord} (${hostDisplay}) has not yet started the meeting`
      : undefined;

  const customStatusText = preStatus === 'lobby'
    ? `${hostDisplay} has been notified. Keep this page open — you will join automatically as soon as they admit you.`
    : isWaitingForStart
      ? (preStatus === 'waiting'
          ? `Keep this page open. As soon as ${hostDisplay} starts the meeting, ${meta.require_approval ? 'you will enter the waiting room so they can admit you' : 'you will join the meeting automatically'}.`
          : `You can check your camera and microphone now. Click Join below to wait for ${hostDisplay} to start.`)
      : undefined;

  return shell(
    <PreJoin
      title={meta.title}
      hostName={meta.host_name}
      userName={displayName.trim() || 'Guest'}
      isHost={false}
      live={meta.status === 'active'}
      status={preStatus}
      meetingCode={meta.code}
      cancelLabel="Change meeting"
      guest={{
        needsPasscode: meta.needs_passcode && !guestToken,
        passcode,
        onPasscodeChange: v => { setPasscode(v); setPassError(null); },
        error: passError,
        since: lobbySince,
        displayName,
        onDisplayNameChange: setDisplayName,
        email,
        onEmailChange: setEmail,
        customStatusTitle,
        customStatusText,
        primaryActionLabel: meta.require_approval ? 'Ask to join' : 'Join meeting',
      }}
      onStopWaiting={stopWaiting}
      onChoicesChange={c => { choicesRef.current = c; }}
      onJoin={c => { choicesRef.current = c; handleJoin(); }}
      onCancel={back}
    />
  );
};

export default PublicMeetingRoom;
