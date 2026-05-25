import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, message, Spin, Modal, Input, Badge, Tooltip, Tag } from 'antd';
import {
  AudioMutedOutlined, VideoCameraOutlined,
  PhoneOutlined, TeamOutlined, MessageOutlined,
  LockOutlined, UnlockOutlined, UserDeleteOutlined, SoundOutlined,
  LoadingOutlined, PlayCircleOutlined, FullscreenOutlined, FullscreenExitOutlined,
  HighlightOutlined, BarChartOutlined, PlusOutlined, CheckOutlined, ShareAltOutlined,
  SettingOutlined, SmileOutlined,
} from '@ant-design/icons';
import {
  LiveKitRoom,
  VideoTrack,
  useParticipants,
  useLocalParticipant,
  useRoomContext,
  useTracks,
  TrackToggle,
  RoomAudioRenderer,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';
import { useAuth } from '../../contexts/AuthContext';
import { io as socketIO } from 'socket.io-client';
import DeviceSettings from './DeviceSettings';
import Whiteboard from './Whiteboard';
import { playNotificationSound, playChatSound, playHandRaiseSound, playPollSound } from './meetingSounds';
import { getSocketUrl } from '../../utils/socketUrl';
import './MeetingRoom.css';

const SOCKET_URL = getSocketUrl();

interface MeetingData {
  id: number;
  room_name: string;
  title: string;
  teacher_id: number;
  status: string;
  is_locked: boolean;
  teacher_first_name: string;
  teacher_last_name: string;
  batch_name: string | null;
}

interface AdmissionRequest {
  userId: number;
  userName: string;
}

// ════════════════════════════════════════════════════════════
// MAIN MEETING PAGE — handles join flow + room
// ════════════════════════════════════════════════════════════
const MeetingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { apiCall, user } = useAuth();
  const [meeting, setMeeting] = useState<MeetingData | null>(null);
  const [phase, setPhase] = useState<'loading' | 'waiting' | 'lobby' | 'ended' | 'locked' | 'kicked' | 'not_ready' | 'pre-start' | 'room' | 'declined'>('loading');
  const [token, setToken] = useState<string | null>(null);
  const [livekitUrl, setLivekitUrl] = useState<string>('');
  const [, setRoomName] = useState<string>('');
  const socketRef = useRef<ReturnType<typeof socketIO> | null>(null);

  // Fetch meeting data
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const resp = await apiCall(`/meetings/${id}`);
        if (resp.ok) {
          const data = await resp.json();
          setMeeting(data);
        } else {
          message.error('Meeting not found');
          navigate('/app/meetings');
        }
      } catch {
        message.error('Failed to load meeting');
      }
    })();
  }, [id, apiCall, navigate]);

  // Setup socket
  useEffect(() => {
    if (!meeting || !user) return;
    const socket = socketIO(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.emit('meeting:join-room', meeting.id);
    socket.emit('user:join', user.id);

    socket.on('meeting:started', () => {
      // Meeting just started — try joining
      handleJoin();
    });

    socket.on('meeting:admitted', (data: { meetingId: number; token: string; livekitUrl: string; roomName: string }) => {
      if (data.meetingId === meeting.id) {
        setToken(data.token);
        setLivekitUrl(data.livekitUrl);
        setRoomName(data.roomName);
        setPhase('room');
      }
    });

    socket.on('meeting:declined', (data: { meetingId: number }) => {
      if (data.meetingId === meeting.id) setPhase('declined');
    });

    socket.on('meeting:ended', () => setPhase('ended'));
    socket.on('meeting:kicked', () => setPhase('kicked'));

    return () => { socket.disconnect(); };
  }, [meeting, user]);

  // Initial join attempt
  useEffect(() => {
    if (!meeting || !user) return;
    const isHost = meeting.teacher_id === user.id;

    if (isHost) {
      if (meeting.status === 'waiting' || meeting.status === 'scheduled') {
        setPhase('pre-start');
      } else if (meeting.status === 'active') {
        handleJoin();
      } else if (meeting.status === 'ended') {
        setPhase('ended');
      }
    } else {
      handleJoin();
    }
  }, [meeting, user]);

  const handleJoin = useCallback(async () => {
    if (!id) return;
    try {
      const resp = await apiCall(`/meetings/${id}/join`, { method: 'POST' });
      if (!resp.ok) { message.error('Failed to join'); return; }
      const data = await resp.json();

      switch (data.action) {
        case 'join':
          setToken(data.token);
          setLivekitUrl(data.livekitUrl);
          setRoomName(data.roomName);
          setPhase('room');
          break;
        case 'waiting':
          setPhase('waiting');
          break;
        case 'lobby':
          setPhase('lobby');
          // Request admission via socket
          if (socketRef.current && user && meeting) {
            socketRef.current.emit('meeting:request-admission', {
              meetingId: meeting.id,
              userId: user.id,
              userName: `${user.first_name} ${user.last_name}`,
            });
          }
          break;
        case 'ended':
          setPhase('ended');
          break;
        case 'locked':
          setPhase('locked');
          break;
        case 'kicked':
          setPhase('kicked');
          break;
        case 'not_ready':
          setPhase('not_ready');
          break;
        default:
          setPhase('loading');
      }
    } catch { message.error('Connection error'); }
  }, [id, apiCall, user, meeting]);

  const handleStartMeeting = async () => {
    if (!id) return;
    try {
      const resp = await apiCall(`/meetings/${id}/start`, { method: 'POST' });
      if (resp.ok) {
        const data = await resp.json();
        setToken(data.token);
        setLivekitUrl(data.livekitUrl);
        setRoomName(data.roomName);
        setPhase('room');
      } else {
        const d = await resp.json();
        message.error(d.error || 'Failed to start');
      }
    } catch { message.error('Failed to start meeting'); }
  };

  const handleLeaveMeeting = async () => {
    if (id) await apiCall(`/meetings/${id}/leave`, { method: 'POST' }).catch(() => {});
    navigate('/app/meetings');
  };

  const handleEndMeeting = async () => {
    if (id) {
      await apiCall(`/meetings/${id}/end`, { method: 'POST' });
      navigate('/app/meetings');
    }
  };

  // ── Render based on phase ──
  if (phase === 'loading' || !meeting) {
    return (
      <div className="meeting-status-screen">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: '#6366f1' }} />} />
        <div className="meeting-status-title">Connecting...</div>
      </div>
    );
  }

  if (phase === 'waiting') {
    return (
      <div className="meeting-status-screen">
        <div className="meeting-status-icon">⏳</div>
        <div className="meeting-status-title">Class hasn't started yet</div>
        <div className="meeting-status-subtitle">You'll be admitted automatically when the teacher begins. Please wait...</div>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24, color: '#6366f1' }} />} />
        <Button onClick={() => navigate('/app/meetings')} style={{ marginTop: 20, borderRadius: 10 }}>Go Back</Button>
      </div>
    );
  }

  if (phase === 'not_ready') {
    return (
      <div className="meeting-status-screen">
        <div className="meeting-status-icon">📅</div>
        <div className="meeting-status-title">Meeting not ready</div>
        <div className="meeting-status-subtitle">The teacher hasn't opened the meeting yet. Check back later.</div>
        <Button onClick={() => navigate('/app/meetings')} style={{ marginTop: 20, borderRadius: 10 }}>Go Back</Button>
      </div>
    );
  }

  if (phase === 'lobby') {
    return (
      <div className="meeting-status-screen">
        <div className="meeting-status-icon">🚪</div>
        <div className="meeting-status-title">Waiting to be admitted</div>
        <div className="meeting-status-subtitle">The teacher has been notified. Please wait for them to let you in.</div>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24, color: '#6366f1' }} />} />
        <Button onClick={() => navigate('/app/meetings')} style={{ marginTop: 20, borderRadius: 10 }}>Leave</Button>
      </div>
    );
  }

  if (phase === 'declined') {
    return (
      <div className="meeting-status-screen">
        <div className="meeting-status-icon">❌</div>
        <div className="meeting-status-title">Request declined</div>
        <div className="meeting-status-subtitle">The teacher has declined your request to join this meeting.</div>
        <Button onClick={() => navigate('/app/meetings')} style={{ marginTop: 20, borderRadius: 10 }}>Go Back</Button>
      </div>
    );
  }

  if (phase === 'ended') {
    return (
      <div className="meeting-status-screen">
        <div className="meeting-status-icon">✅</div>
        <div className="meeting-status-title">Meeting has ended</div>
        <div className="meeting-status-subtitle">{meeting.title}</div>
        <Button type="primary" onClick={() => navigate('/app/meetings')} style={{ marginTop: 20, borderRadius: 10, background: '#4338ca' }}>Back to Meetings</Button>
      </div>
    );
  }

  if (phase === 'locked') {
    return (
      <div className="meeting-status-screen">
        <div className="meeting-status-icon">🔒</div>
        <div className="meeting-status-title">Meeting is locked</div>
        <div className="meeting-status-subtitle">The teacher has locked this meeting. No new participants can join.</div>
        <Button onClick={() => navigate('/app/meetings')} style={{ marginTop: 20, borderRadius: 10 }}>Go Back</Button>
      </div>
    );
  }

  if (phase === 'kicked') {
    return (
      <div className="meeting-status-screen">
        <div className="meeting-status-icon">🚫</div>
        <div className="meeting-status-title">You've been removed</div>
        <div className="meeting-status-subtitle">The teacher has removed you from this meeting.</div>
        <Button onClick={() => navigate('/app/meetings')} style={{ marginTop: 20, borderRadius: 10 }}>Go Back</Button>
      </div>
    );
  }

  if (phase === 'pre-start') {
    return (
      <div className="meeting-prejoin">
        <div className="prejoin-container">
          <div className="prejoin-header">
            <div style={{ fontSize: 20, fontWeight: 800, color: '#1e293b' }}>{meeting.title}</div>
            <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Check your audio and video before starting</div>
          </div>
          <div className="prejoin-content">
            <DeviceSettings />
          </div>
          <div className="prejoin-actions">
            <Button type="primary" size="large" icon={<PlayCircleOutlined />} onClick={handleStartMeeting}
              style={{ borderRadius: 12, height: 48, fontWeight: 700, fontSize: 16, background: 'linear-gradient(135deg, #22c55e, #16a34a)', border: 'none', boxShadow: '0 4px 16px rgba(34,197,94,0.3)', paddingInline: 32, flex: 1 }}>
              Start Meeting
            </Button>
            <Button onClick={() => navigate('/app/meetings')} size="large" style={{ borderRadius: 12, height: 48 }}>Cancel</Button>
          </div>
        </div>
      </div>
    );
  }

  // ── ROOM PHASE ──
  if (phase === 'room' && token && livekitUrl) {
    return (
      <LiveKitRoom
        serverUrl={livekitUrl}
        token={token}
        connect={true}
        audio={true}
        video={true}
        onDisconnected={handleLeaveMeeting}
        style={{ height: '100vh' }}
      >
        <RoomAudioRenderer />
        <MeetingRoomUI
          meeting={meeting}
          onLeave={handleLeaveMeeting}
          onEnd={handleEndMeeting}
          apiCall={apiCall}
          socket={socketRef.current}
          isHost={meeting.teacher_id === user?.id}
        />
      </LiveKitRoom>
    );
  }

  return null;
};

// ════════════════════════════════════════════════════════════
// MEETING ROOM UI (inside LiveKitRoom context)
// ════════════════════════════════════════════════════════════
const MeetingRoomUI: React.FC<{
  meeting: MeetingData;
  onLeave: () => void;
  onEnd: () => void;
  apiCall: (endpoint: string, options?: RequestInit) => Promise<Response>;
  socket: ReturnType<typeof socketIO> | null;
  isHost: boolean;
}> = ({ meeting, onLeave, onEnd, apiCall, socket, isHost }) => {
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();
  useRoomContext(); // keep room context active
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; time: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const chatOpenRef = useRef(false);
  const [admissionRequests, setAdmissionRequests] = useState<AdmissionRequest[]>([]);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(meeting.is_locked);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pollPanelOpen, setPollPanelOpen] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [raisedHands, setRaisedHands] = useState<{ userId: number; userName: string }[]>([]);
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number; emoji: string; sender: string }[]>([]);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const emojiIdRef = useRef(0);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [activePoll, setActivePoll] = useState<{ id: number; question: string; options: string[]; votes: { option_index: number; count: number }[] } | null>(null);
  const [myVote, setMyVote] = useState<number | null>(null);
  const [closedPolls, setClosedPolls] = useState<{ id: number; question: string; options: string[]; votes: { option_index: number; count: number }[]; voters: { option_index: number; user_id: number; first_name: string; last_name: string }[]; totalVotes: number }[]>([]);
  const [expandedPollDetails, setExpandedPollDetails] = useState<Set<number>>(new Set());

  const trackRefs = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  // Separate screen share tracks from camera tracks
  const screenShareTracks = trackRefs.filter(t => t.source === Track.Source.ScreenShare);
  const cameraTracks = trackRefs.filter(t => t.source === Track.Source.Camera);
  const hasScreenShare = screenShareTracks.length > 0;

  // Fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(prev => {
      const next = !prev;
      if (next) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
      return next;
    });
  };

  // Cleanup fullscreen on unmount
  useEffect(() => {
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('meeting:admission-request', (data: AdmissionRequest) => {
      if (isHost) {
        setAdmissionRequests(prev => {
          if (prev.find(r => r.userId === data.userId)) return prev;
          return [...prev, data];
        });
        playNotificationSound();
      }
    });

    socket.on('meeting:chat-message', (data: { sender: string; text: string; time: string }) => {
      setChatMessages(prev => [...prev, data]);
      if (!chatOpenRef.current) {
        setUnreadChatCount(prev => prev + 1);
        playChatSound();
      }
    });

    socket.on('meeting:announcement', (data: { text: string }) => {
      setAnnouncement(data.text);
      playNotificationSound();
      setTimeout(() => setAnnouncement(null), 8000);
    });

    socket.on('meeting:hand-raised', (data: { userId: number; userName: string }) => {
      setRaisedHands(prev => {
        if (prev.find(h => h.userId === data.userId)) return prev;
        return [...prev, data];
      });
      playHandRaiseSound();
    });

    socket.on('meeting:hand-lowered', (data: { userId: number }) => {
      setRaisedHands(prev => prev.filter(h => h.userId !== data.userId));
      // If it's my hand being lowered (e.g. teacher dismissed it), reset local state
      const myId = parseInt(localParticipant.localParticipant.identity);
      if (data.userId === myId) setHandRaised(false);
    });

    socket.on('meeting:reaction', (data: { emoji: string; senderName: string }) => {
      const id = ++emojiIdRef.current;
      setFloatingEmojis(prev => [...prev, { id, emoji: data.emoji, sender: data.senderName }]);
      setTimeout(() => setFloatingEmojis(prev => prev.filter(e => e.id !== id)), 3000);
    });

    socket.on('meeting:lockChanged', (data: { isLocked: boolean }) => {
      setIsLocked(data.isLocked);
    });

    socket.on('poll:created', (data: { id: number; question: string; options: unknown }) => {
      let opts: string[] = [];
      if (Array.isArray(data.options)) {
        opts = data.options;
      } else if (typeof data.options === 'string') {
        try { opts = JSON.parse(data.options); } catch { opts = []; }
      }
      setActivePoll({ id: data.id, question: data.question, options: opts, votes: [] });
      setMyVote(null);
      if (!isHost) { setPollPanelOpen(true); playPollSound(); }
    });

    socket.on('poll:updated', (data: { pollId: number; votes: { option_index: number; count: number }[] }) => {
      setActivePoll(prev => prev && prev.id === data.pollId ? { ...prev, votes: data.votes } : prev);
    });

    socket.on('poll:closed', () => {
      setActivePoll(null);
      setMyVote(null);
    });

    return () => {
      socket.off('meeting:admission-request');
      socket.off('meeting:chat-message');
      socket.off('meeting:announcement');
      socket.off('meeting:lockChanged');
      socket.off('meeting:hand-raised');
      socket.off('meeting:hand-lowered');
      socket.off('meeting:reaction');
      socket.off('poll:created');
      socket.off('poll:updated');
      socket.off('poll:closed');
    };
  }, [socket, isHost]);

  const handleAdmit = async (userId: number) => {
    await apiCall(`/meetings/${meeting.id}/admit`, { method: 'POST', body: JSON.stringify({ user_id: userId }) });
    setAdmissionRequests(prev => prev.filter(r => r.userId !== userId));
  };

  const handleDecline = async (userId: number) => {
    await apiCall(`/meetings/${meeting.id}/decline`, { method: 'POST', body: JSON.stringify({ user_id: userId }) });
    setAdmissionRequests(prev => prev.filter(r => r.userId !== userId));
  };

  const handleToggleLock = async () => {
    await apiCall(`/meetings/${meeting.id}/lock`, { method: 'POST' });
  };

  const handleCreatePoll = async () => {
    const validOptions = pollOptions.filter(o => o.trim());
    if (!pollQuestion.trim() || validOptions.length < 2) return;
    const resp = await apiCall(`/meetings/${meeting.id}/polls`, {
      method: 'POST',
      body: JSON.stringify({ question: pollQuestion.trim(), options: validOptions }),
    });
    if (resp.ok) {
      const data = await resp.json();
      // Set active poll locally for the teacher too
      let opts: string[] = [];
      if (Array.isArray(data.options)) opts = data.options;
      else if (typeof data.options === 'string') { try { opts = JSON.parse(data.options); } catch { opts = validOptions; } }
      else opts = validOptions;
      setActivePoll({ id: data.id, question: data.question || pollQuestion.trim(), options: opts, votes: [] });
      setMyVote(null);
    }
    setPollQuestion('');
    setPollOptions(['', '']);
  };

  const handleVotePoll = async (optionIndex: number) => {
    if (!activePoll) return;
    await apiCall(`/meetings/polls/${activePoll.id}/vote`, {
      method: 'POST',
      body: JSON.stringify({ option_index: optionIndex }),
    });
    setMyVote(optionIndex);
  };

  const handleClosePoll = async () => {
    if (!activePoll) return;
    const resp = await apiCall(`/meetings/polls/${activePoll.id}/close`, {
      method: 'POST',
      body: JSON.stringify({ show_results: true }),
    });
    if (resp.ok) {
      const data = await resp.json();
      // Save to closed polls history with full details
      setClosedPolls(prev => [{
        id: data.id,
        question: data.question,
        options: data.options || activePoll.options,
        votes: data.votes || activePoll.votes || [],
        voters: data.voters || [],
        totalVotes: data.totalVotes || 0,
      }, ...prev]);
    }
    setActivePoll(null);
    setMyVote(null);
  };

  const sendChat = () => {
    if (!chatInput.trim() || !socket) return;
    const msg = {
      meetingId: meeting.id,
      sender: localParticipant.localParticipant.name || 'You',
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    socket.emit('meeting:chat-message', msg);
    setChatInput('');
  };

  const [announcementInput, setAnnouncementInput] = useState('');
  const [showAnnouncementInput, setShowAnnouncementInput] = useState(false);

  // ── Recording state ──
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStartedAt, setRecordingStartedAt] = useState<number | null>(null);
  const [recordingElapsed, setRecordingElapsed] = useState(0);
  const [recordingLoading, setRecordingLoading] = useState(false);

  useEffect(() => {
    if (!isRecording || !recordingStartedAt) return;
    const t = setInterval(() => setRecordingElapsed(Math.floor((Date.now() - recordingStartedAt) / 1000)), 1000);
    return () => clearInterval(t);
  }, [isRecording, recordingStartedAt]);

  // Listen for recording events (so all participants see the indicator)
  useEffect(() => {
    if (!socket) return;
    const onStarted = (data: { meetingId: number; startedAt: string }) => {
      if (data.meetingId !== meeting.id) return;
      setIsRecording(true);
      setRecordingStartedAt(new Date(data.startedAt).getTime());
      setRecordingElapsed(0);
    };
    const onStopped = (data: { meetingId: number }) => {
      if (data.meetingId !== meeting.id) return;
      setIsRecording(false);
      setRecordingStartedAt(null);
      setRecordingElapsed(0);
    };
    socket.on('meeting:recording-started', onStarted);
    socket.on('meeting:recording-stopped', onStopped);
    return () => {
      socket.off('meeting:recording-started', onStarted);
      socket.off('meeting:recording-stopped', onStopped);
    };
  }, [socket, meeting.id]);

  const toggleRecording = useCallback(async () => {
    if (recordingLoading) return;
    setRecordingLoading(true);
    try {
      if (isRecording) {
        const r = await apiCall(`/meetings/${meeting.id}/recording/stop`, { method: 'POST' });
        if (r.ok) {
          message.success('Recording stopped — finalizing video');
        } else {
          const d = await r.json().catch(() => ({}));
          message.error(d.error || 'Failed to stop recording');
        }
      } else {
        const r = await apiCall(`/meetings/${meeting.id}/recording/start`, { method: 'POST' });
        if (r.ok) {
          message.success('Recording started');
        } else if (r.status === 503) {
          const d = await r.json().catch(() => ({}));
          Modal.warning({
            title: 'Recording unavailable',
            content: d.message || 'Egress service is not configured on the LiveKit server. Please contact your administrator.',
            okText: 'OK', centered: true,
          });
        } else {
          const d = await r.json().catch(() => ({}));
          message.error(d.error || 'Failed to start recording');
        }
      }
    } catch (e) {
      message.error('Network error');
    } finally {
      setRecordingLoading(false);
    }
  }, [isRecording, recordingLoading, apiCall, meeting.id]);

  const fmtRecTime = (s: number) => {
    const m = Math.floor(s / 60);
    const ss = s % 60;
    return `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
  };


  const sendAnnouncement = () => {
    if (!announcementInput.trim() || !socket) return;
    socket.emit('meeting:announcement', { meetingId: meeting.id, text: announcementInput.trim() });
    setAnnouncementInput('');
    setShowAnnouncementInput(false);
  };

  const toggleHandRaise = () => {
    if (!socket) return;
    if (handRaised) {
      socket.emit('meeting:lower-hand', { meetingId: meeting.id, userId: parseInt(localParticipant.localParticipant.identity) });
      setHandRaised(false);
    } else {
      socket.emit('meeting:raise-hand', { meetingId: meeting.id, userId: parseInt(localParticipant.localParticipant.identity), userName: localParticipant.localParticipant.name || 'Participant' });
      setHandRaised(true);
    }
  };

  const sendEmoji = (emoji: string) => {
    if (!socket) return;
    socket.emit('meeting:reaction', { meetingId: meeting.id, emoji, senderName: localParticipant.localParticipant.name || 'Participant' });
    setEmojiPickerOpen(false);
  };

  const EMOJI_OPTIONS = ['👏', '❤️', '😂', '🎉', '🤔', '👍', '🔥', '😮', '💯', '✋'];

  return (
    <div className={`meeting-room ${isFullscreen ? 'meeting-fullscreen' : ''} ${hasScreenShare ? 'has-screenshare' : ''}`}>
      {/* Floating emoji reactions */}
      {floatingEmojis.map(fe => (
        <div key={fe.id} className="floating-emoji">
          <span className="floating-emoji-icon">{fe.emoji}</span>
          <span className="floating-emoji-name">{fe.sender}</span>
        </div>
      ))}

      {/* Raised hands indicator */}
      {raisedHands.length > 0 && (
        <div className="raised-hands-bar">
          <span style={{ marginRight: 4 }}>✋</span>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
            {raisedHands.map((h, i) => (
              <span key={h.userId} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: 10, fontSize: 11 }}>
                <span style={{ fontWeight: 800, color: '#fbbf24', fontSize: 10 }}>{i + 1}.</span>
                {h.userName.split(' ')[0]}
              </span>
            ))}
          </div>
          {isHost && <button onClick={() => {
            raisedHands.forEach(h => {
              if (socket) socket.emit('meeting:lower-hand', { meetingId: meeting.id, userId: h.userId });
            });
            setRaisedHands([]);
          }} className="raised-hands-clear">Dismiss all</button>}
        </div>
      )}

      {/* Announcement banner */}
      {announcement && (
        <div className="meeting-announcement">
          <SoundOutlined /> {announcement}
          <button onClick={() => setAnnouncement(null)} className="announcement-close">×</button>
        </div>
      )}

      {/* Announcement input bar (teacher only) */}
      {showAnnouncementInput && (
        <div className="announcement-input-bar">
          <SoundOutlined style={{ color: '#f59e0b', fontSize: 16, flexShrink: 0 }} />
          <Input
            value={announcementInput}
            onChange={e => setAnnouncementInput(e.target.value)}
            onPressEnter={sendAnnouncement}
            placeholder="Type an announcement for all participants..."
            autoFocus
            style={{ flex: 1, borderRadius: 8, background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.15)', color: '#fff' }}
          />
          <Button type="primary" size="small" onClick={sendAnnouncement} disabled={!announcementInput.trim()}
            style={{ borderRadius: 8, background: '#f59e0b', borderColor: '#f59e0b', fontWeight: 600 }}>
            Send
          </Button>
          <button onClick={() => setShowAnnouncementInput(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 16, cursor: 'pointer', padding: '0 4px' }}>×</button>
        </div>
      )}

      {/* Header */}
      <div className="meeting-header">
        <div className="meeting-header-left">
          <div className="meeting-title">{meeting.title}</div>
          <div className="meeting-meta">
            {meeting.batch_name && <Tag style={{ borderRadius: 4, fontSize: 10, background: 'rgba(255,255,255,0.1)', color: '#94a3b8', border: 'none' }}>{meeting.batch_name}</Tag>}
            <span className="meeting-participant-count"><TeamOutlined /> {participants.length}</span>
            {isLocked && <Tag color="red" style={{ borderRadius: 4, fontSize: 10 }}>🔒 Locked</Tag>}
            {isRecording && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '3px 10px', borderRadius: 100,
                background: 'rgba(239,68,68,0.18)',
                border: '1px solid rgba(239,68,68,0.45)',
                color: '#fca5a5', fontSize: 10.5, fontWeight: 700,
                letterSpacing: 0.5,
              }}>
                <span style={{
                  display: 'inline-block', width: 7, height: 7,
                  borderRadius: '50%', background: '#ef4444',
                  animation: 'rec-pulse 1.4s ease-in-out infinite',
                }} />
                REC {fmtRecTime(recordingElapsed)}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isHost && admissionRequests.length > 0 && (
            <Badge count={admissionRequests.length} offset={[-2, 2]}>
              <Button size="small" onClick={() => setParticipantsOpen(true)}
                style={{ borderRadius: 8, background: '#f59e0b', color: '#fff', border: 'none', fontWeight: 600, fontSize: 11 }}>
                {admissionRequests.length} waiting
              </Button>
            </Badge>
          )}
          {isHost && (
            <Tooltip title="Copy share link">
              <button className="control-btn" onClick={() => {
                const shareUrl = `${window.location.origin}/app/meeting-join/${meeting.room_name}`;
                navigator.clipboard.writeText(shareUrl).then(() => message.success('Share link copied!')).catch(() => message.info(shareUrl));
              }} style={{ width: 32, height: 32, fontSize: 14 }}>
                <ShareAltOutlined />
              </button>
            </Tooltip>
          )}
          <Tooltip title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
            <button className="control-btn" onClick={toggleFullscreen} style={{ width: 32, height: 32, fontSize: 14 }}>
              {isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Main content area */}
      <div className="meeting-content">
        {hasScreenShare ? (
          /* ── PRESENTER LAYOUT: big screen share + small participant strip ── */
          <div className="presenter-layout">
            <div className="presenter-main">
              {screenShareTracks.map((trackRef) => (
                <div key={`${trackRef.participant.sid}-screen`} className="screen-share-tile">
                  {trackRef.publication?.track && <VideoTrack trackRef={trackRef} />}
                  <div className="video-overlay">
                    <span className="video-name">
                      <span className="screen-badge">Screen</span>
                      {trackRef.participant.name || 'Participant'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="presenter-strip">
              {cameraTracks.map((trackRef) => {
                const p = trackRef.participant;
                const isLocal = p.sid === localParticipant.localParticipant.sid;
                const isTeacherTile = p.identity === String(meeting.teacher_id);
                return (
                  <div key={`${p.sid}-cam`} className={`strip-tile ${p.isSpeaking ? 'speaking' : ''}`}>
                    {trackRef.publication?.track ? (
                      <VideoTrack trackRef={trackRef} />
                    ) : (
                      <div className="video-placeholder">
                        <div className="video-avatar small">{(p.name || '?')[0].toUpperCase()}</div>
                      </div>
                    )}
                    <div className="strip-name">
                      {isTeacherTile && <span className="host-badge">H</span>}
                      {(p.name || '?').split(' ')[0]}{isLocal ? ' (You)' : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ── GRID LAYOUT: equal tiles ── */
          <div className="meeting-video-grid">
            {cameraTracks.map((trackRef) => {
              const p = trackRef.participant;
              const isLocal = p.sid === localParticipant.localParticipant.sid;
              const isTeacherTile = p.identity === String(meeting.teacher_id);
              return (
                <div key={`${p.sid}-${trackRef.source}`} className={`video-tile ${isTeacherTile ? 'teacher-tile' : ''} ${p.isSpeaking ? 'speaking' : ''}`}>
                  {trackRef.publication?.track ? (
                    <VideoTrack trackRef={trackRef} />
                  ) : (
                    <div className="video-placeholder">
                      <div className="video-avatar">{(p.name || '?')[0].toUpperCase()}</div>
                    </div>
                  )}
                  <div className="video-overlay">
                    <span className="video-name">
                      {isTeacherTile && <span className="host-badge">Host</span>}
                      {p.name || 'Participant'}
                      {isLocal && ' (You)'}
                    </span>
                    <div className="video-indicators">
                      {p.isMicrophoneEnabled === false && <AudioMutedOutlined style={{ color: '#ef4444', fontSize: 12 }} />}
                      {p.isCameraEnabled === false && <VideoCameraOutlined style={{ color: '#ef4444', fontSize: 12 }} />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="meeting-controls">
        <div className="controls-left">
          <TrackToggle source={Track.Source.Microphone} className="control-btn" />
          <TrackToggle source={Track.Source.Camera} className="control-btn" />
          <TrackToggle source={Track.Source.ScreenShare} className="control-btn screen-share-btn" />
        </div>
        <div className="controls-center">
          <Tooltip title="Chat">
            <Badge count={unreadChatCount} size="small">
              <button className="control-btn" onClick={() => {
                const opening = !chatOpen;
                setChatOpen(opening);
                chatOpenRef.current = opening;
                if (opening) setUnreadChatCount(0);
              }}>
                <MessageOutlined />
              </button>
            </Badge>
          </Tooltip>
          <Tooltip title="Participants">
            <button className="control-btn" onClick={() => setParticipantsOpen(!participantsOpen)}>
              <TeamOutlined />
            </button>
          </Tooltip>
          {isHost && (
            <>
              <Tooltip title={isLocked ? 'Unlock Meeting' : 'Lock Meeting'}>
                <button className="control-btn" onClick={handleToggleLock}>
                  {isLocked ? <LockOutlined style={{ color: '#ef4444' }} /> : <UnlockOutlined />}
                </button>
              </Tooltip>
              <Tooltip title={isRecording ? `Stop recording (${fmtRecTime(recordingElapsed)})` : 'Start recording'}>
                <button
                  className={`control-btn ${isRecording ? 'recording-btn-active' : 'recording-btn-idle'}`}
                  onClick={toggleRecording}
                  disabled={recordingLoading}
                  style={{
                    minWidth: 'auto',
                    padding: isRecording ? '0 12px' : '0 12px',
                    background: isRecording ? 'rgba(239,68,68,0.22)' : 'rgba(239,68,68,0.12)',
                    borderColor: '#ef4444',
                    color: isRecording ? '#fca5a5' : '#ef4444',
                    fontWeight: 700,
                  }}
                >
                  {recordingLoading ? <LoadingOutlined /> : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        display: 'inline-block', width: 9, height: 9,
                        borderRadius: '50%', background: '#ef4444',
                        animation: isRecording ? 'rec-pulse 1.4s ease-in-out infinite' : 'none',
                      }} />
                      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.4 }}>
                        {isRecording ? fmtRecTime(recordingElapsed) : 'REC'}
                      </span>
                    </span>
                  )}
                </button>
              </Tooltip>
              <Tooltip title="Announcement">
                <button className={`control-btn ${showAnnouncementInput ? 'active-btn' : ''}`} onClick={() => setShowAnnouncementInput(!showAnnouncementInput)}>
                  <SoundOutlined />
                </button>
              </Tooltip>
              <Tooltip title="Create Poll">
                <button className="control-btn" onClick={async () => {
                  const opening = !pollPanelOpen;
                  setPollPanelOpen(opening);
                  if (opening && isHost) {
                    // Fetch poll history from backend
                    try {
                      const resp = await apiCall(`/meetings/${meeting.id}/polls`);
                      if (resp.ok) {
                        const polls = await resp.json();
                        const closed = (polls || []).filter((p: Record<string, unknown>) => !p.is_active).map((p: Record<string, unknown>) => {
                          let opts: string[] = [];
                          const rawOpts = p.options;
                          if (Array.isArray(rawOpts)) opts = rawOpts as string[];
                          else if (typeof rawOpts === 'string') { try { opts = JSON.parse(rawOpts); } catch { opts = []; } }
                          const votes = (p.votes || []) as { option_index: number; count: number }[];
                          const tv = p.total_votes as { count: number } | undefined;
                          return {
                            id: p.id as number, question: p.question as string, options: opts, votes,
                            voters: [] as { option_index: number; user_id: number; first_name: string; last_name: string }[],
                            totalVotes: parseInt(String(tv?.count)) || votes.reduce((s, v) => s + (parseInt(String(v.count)) || 0), 0),
                          };
                        });
                        if (closed.length > 0) {
                          setClosedPolls(prev => {
                            const existingIds = new Set(prev.map(pp => pp.id));
                            const newOnes = closed.filter((c: { id: number }) => !existingIds.has(c.id));
                            return [...prev, ...newOnes];
                          });
                        }
                      }
                    } catch { /* ignore */ }
                  }
                }}>
                  <BarChartOutlined />
                </button>
              </Tooltip>
            </>
          )}
          {activePoll && !isHost && (
            <Tooltip title="Active Poll">
              <button className="control-btn" onClick={() => setPollPanelOpen(!pollPanelOpen)} style={{ color: '#f59e0b' }}>
                <BarChartOutlined />
              </button>
            </Tooltip>
          )}
          <Tooltip title={handRaised ? 'Lower Hand' : 'Raise Hand'}>
            <button className={`control-btn ${handRaised ? 'hand-raised-btn' : ''}`} onClick={toggleHandRaise}
              style={handRaised ? { background: 'rgba(245,158,11,0.25)', borderColor: '#f59e0b', color: '#fbbf24' } : {}}>
              <span style={{ fontSize: 16 }}>✋</span>
            </button>
          </Tooltip>
          <Tooltip title="Emoji Reaction">
            <div style={{ position: 'relative' }}>
              <button className="control-btn" onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}>
                <SmileOutlined />
              </button>
              {emojiPickerOpen && (
                <div className="emoji-picker-popup">
                  {EMOJI_OPTIONS.map(e => (
                    <button key={e} className="emoji-pick-btn" onClick={() => sendEmoji(e)}>{e}</button>
                  ))}
                </div>
              )}
            </div>
          </Tooltip>
          <Tooltip title="Whiteboard">
            <button className={`control-btn ${whiteboardOpen ? 'active-btn' : ''}`} onClick={() => setWhiteboardOpen(!whiteboardOpen)}>
              <HighlightOutlined />
            </button>
          </Tooltip>
          <Tooltip title="Audio & Video Settings">
            <button className={`control-btn ${settingsOpen ? 'active-btn' : ''}`} onClick={() => setSettingsOpen(!settingsOpen)}>
              <SettingOutlined />
            </button>
          </Tooltip>
        </div>
        <div className="controls-right">
          {isHost ? (
            <button className="control-btn end-btn" onClick={() => setShowEndConfirm(true)}>
              <PhoneOutlined /> End
            </button>
          ) : (
            <button className="control-btn leave-btn" onClick={() => setShowLeaveConfirm(true)}>
              <PhoneOutlined /> Leave
            </button>
          )}
        </div>
      </div>

      {/* Chat Panel */}
      {chatOpen && (
        <div className="meeting-side-panel chat-panel">
          <div className="side-panel-header">
            <span>Chat</span>
            <button onClick={() => { setChatOpen(false); chatOpenRef.current = false; }} className="side-panel-close">×</button>
          </div>
          <div className="chat-messages">
            {chatMessages.map((msg, i) => (
              <div key={i} className="chat-message">
                <span className="chat-sender">{msg.sender}</span>
                <span className="chat-time">{msg.time}</span>
                <div className="chat-text">{msg.text}</div>
              </div>
            ))}
          </div>
          <div className="chat-input-row">
            <Input value={chatInput} onChange={e => setChatInput(e.target.value)} onPressEnter={sendChat}
              placeholder="Type a message..." style={{ borderRadius: 8, flex: 1 }} />
            <Button type="primary" onClick={sendChat} style={{ borderRadius: 8, background: '#4338ca' }}>Send</Button>
          </div>
        </div>
      )}

      {/* Participants Panel */}
      {participantsOpen && (
        <div className="meeting-side-panel participants-panel">
          <div className="side-panel-header">
            <span>Participants ({participants.length})</span>
            <button onClick={() => setParticipantsOpen(false)} className="side-panel-close">×</button>
          </div>
          {/* Admission requests */}
          {isHost && admissionRequests.length > 0 && (
            <div className="admission-section">
              <div className="admission-title">Waiting to join ({admissionRequests.length})</div>
              {admissionRequests.map(req => (
                <div key={req.userId} className="admission-item">
                  <span className="admission-name">{req.userName}</span>
                  <div className="admission-actions">
                    <Button size="small" type="primary" onClick={() => handleAdmit(req.userId)}
                      style={{ borderRadius: 6, background: '#22c55e', borderColor: '#22c55e', fontSize: 11 }}>Admit</Button>
                    <Button size="small" danger onClick={() => handleDecline(req.userId)}
                      style={{ borderRadius: 6, fontSize: 11 }}>Decline</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="participants-list">
            {participants.map(p => {
              const isTeacherP = p.identity === String(meeting.teacher_id);
              return (
                <div key={p.sid} className="participant-item">
                  <div className="participant-avatar">{(p.name || '?')[0].toUpperCase()}</div>
                  <div className="participant-info">
                    <span className="participant-name">{p.name || 'Participant'}</span>
                    {isTeacherP && <Tag style={{ borderRadius: 4, fontSize: 9, background: '#eef2ff', color: '#4338ca', border: 'none', marginLeft: 4 }}>Host</Tag>}
                  </div>
                  <div className="participant-indicators">
                    {p.isMicrophoneEnabled === false && <AudioMutedOutlined style={{ color: '#ef4444', fontSize: 11 }} />}
                    {p.isCameraEnabled === false && <VideoCameraOutlined style={{ color: '#ef4444', fontSize: 11 }} />}
                  </div>
                  {isHost && !isTeacherP && (
                    <Tooltip title="Remove">
                      <Button type="text" size="small" danger icon={<UserDeleteOutlined />}
                        onClick={async () => {
                          Modal.confirm({
                            title: 'Remove Participant',
                            content: `Remove ${p.name} from the meeting?`,
                            okText: 'Remove', okType: 'danger',
                            onOk: () => apiCall(`/meetings/${meeting.id}/kick`, { method: 'POST', body: JSON.stringify({ user_id: parseInt(p.identity) }) }),
                          });
                        }}
                        style={{ borderRadius: 4, width: 24, height: 24 }} />
                    </Tooltip>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Poll Panel */}
      {pollPanelOpen && (
        <div className="meeting-side-panel poll-panel">
          <div className="side-panel-header">
            <span>📊 {isHost ? 'Polls' : 'Live Poll'}</span>
            <button onClick={() => setPollPanelOpen(false)} className="side-panel-close">×</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>

            {/* ── STUDENT VIEW: voting UI ── */}
            {!isHost && activePoll && (
              <div style={{ padding: 16, borderRadius: 12, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 12, lineHeight: 1.4 }}>
                  {activePoll.question}
                </div>
                {myVote === null ? (
                  /* Not voted yet — show clickable options */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {(activePoll.options || []).map((opt, idx) => (
                      <button key={idx} onClick={() => handleVotePoll(idx)}
                        style={{
                          padding: '12px 14px', borderRadius: 10, border: '1.5px solid rgba(99,102,241,0.3)',
                          background: 'rgba(255,255,255,0.04)', color: '#e2e8f0', fontSize: 13, fontWeight: 600,
                          cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                          display: 'flex', alignItems: 'center', gap: 10,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)'; e.currentTarget.style.borderColor = '#6366f1'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; }}
                      >
                        <span style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#818cf8', flexShrink: 0 }}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        {opt}
                      </button>
                    ))}
                    <div style={{ fontSize: 10, color: '#64748b', marginTop: 4, textAlign: 'center' }}>Click an option to vote</div>
                  </div>
                ) : (
                  /* Already voted — just show confirmation, no results */
                  <div style={{ textAlign: 'center', padding: '16px 0' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                      <CheckOutlined style={{ color: '#22c55e', fontSize: 22 }} />
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>Vote submitted!</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>Your response has been recorded</div>
                    <div style={{ padding: '8px 14px', borderRadius: 8, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <CheckOutlined style={{ color: '#6366f1', fontSize: 11 }} />
                      <span style={{ fontSize: 12, color: '#e2e8f0', fontWeight: 600 }}>
                        {(activePoll.options || [])[myVote] || 'Your choice'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Student: no active poll */}
            {!isHost && !activePoll && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>No active poll</div>
                <div style={{ fontSize: 11, marginTop: 4 }}>The teacher will publish a poll when ready</div>
              </div>
            )}

            {/* ── TEACHER VIEW: results + create form ── */}
            {isHost && activePoll && (
              <div style={{ padding: 12, borderRadius: 10, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#818cf8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Active Poll</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 10 }}>{activePoll.question}</div>
                {(activePoll.options || []).map((opt, idx) => {
                  const voteCount = parseInt(String((activePoll.votes || []).find(v => v.option_index === idx)?.count || 0));
                  const totalVotes = (activePoll.votes || []).reduce((s, v) => s + (parseInt(String(v.count)) || 0), 0);
                  const pct = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
                  return (
                    <div key={idx} style={{ padding: '6px 10px', borderRadius: 8, marginBottom: 3, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`, background: 'rgba(99,102,241,0.12)', transition: 'width 0.3s' }} />
                      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: '#e2e8f0' }}>{opt}</span>
                        <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>{voteCount} ({pct}%)</span>
                      </div>
                    </div>
                  );
                })}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <span style={{ fontSize: 10, color: '#64748b' }}>
                    {(activePoll.votes || []).reduce((s, v) => s + (parseInt(String(v.count)) || 0), 0)} total votes
                  </span>
                  <Button size="small" danger onClick={handleClosePoll} style={{ borderRadius: 6, fontSize: 11 }}>Close Poll</Button>
                </div>
              </div>
            )}

            {/* Create poll (host only) */}
            {isHost && (
              <div style={{ padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 8 }}>Create New Poll</div>
                <Input value={pollQuestion} onChange={e => setPollQuestion(e.target.value)} placeholder="Question..." style={{ borderRadius: 6, marginBottom: 8, background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.1)', color: '#e2e8f0' }} />
                {pollOptions.map((opt, idx) => (
                  <Input key={idx} value={opt} onChange={e => { const n = [...pollOptions]; n[idx] = e.target.value; setPollOptions(n); }}
                    placeholder={`Option ${idx + 1}`} style={{ borderRadius: 6, marginBottom: 4, background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.1)', color: '#e2e8f0' }} />
                ))}
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  <Button size="small" icon={<PlusOutlined />} onClick={() => setPollOptions([...pollOptions, ''])}
                    style={{ borderRadius: 6, fontSize: 11, color: '#94a3b8', borderColor: 'rgba(255,255,255,0.1)' }}>Add Option</Button>
                  <Button size="small" type="primary" onClick={handleCreatePoll}
                    disabled={!pollQuestion.trim() || pollOptions.filter(o => o.trim()).length < 2}
                    style={{ borderRadius: 6, fontSize: 11, background: '#6366f1', borderColor: '#6366f1' }}>Publish</Button>
                </div>
              </div>
            )}

            {/* Closed polls history (teacher only) */}
            {isHost && closedPolls.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Poll History</div>
                {closedPolls.map((cp) => {
                  const isExpanded = expandedPollDetails.has(cp.id);
                  return (
                    <div key={cp.id} style={{ padding: 10, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0', flex: 1 }}>{cp.question}</div>
                        <span style={{ fontSize: 9, color: '#64748b', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4, flexShrink: 0 }}>
                          {cp.totalVotes} votes
                        </span>
                      </div>
                      {/* Horizontal bar chart — all bars proportional */}
                      <div style={{ display: 'flex', gap: 3, height: 28, borderRadius: 6, overflow: 'hidden', marginBottom: 6 }}>
                        {(cp.options || []).map((_opt, idx) => {
                          const voteCount = parseInt(String((cp.votes || []).find(v => v.option_index === idx)?.count || 0));
                          const pct = cp.totalVotes > 0 ? Math.round((voteCount / cp.totalVotes) * 100) : 0;
                          const colors = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#8b5cf6', '#f97316'];
                          const bg = colors[idx % colors.length];
                          if (pct === 0) return null;
                          return (
                            <div key={idx} style={{ flex: pct, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: pct > 8 ? 'auto' : 0, transition: 'flex 0.3s' }}>
                              {pct >= 15 && <span style={{ fontSize: 9, color: '#fff', fontWeight: 700 }}>{pct}%</span>}
                            </div>
                          );
                        })}
                      </div>
                      {/* Legend */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                        {(cp.options || []).map((opt, idx) => {
                          const voteCount = parseInt(String((cp.votes || []).find(v => v.option_index === idx)?.count || 0));
                          const pct = cp.totalVotes > 0 ? Math.round((voteCount / cp.totalVotes) * 100) : 0;
                          const colors = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#8b5cf6', '#f97316'];
                          return (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <div style={{ width: 8, height: 8, borderRadius: 2, background: colors[idx % colors.length], flexShrink: 0 }} />
                              <span style={{ fontSize: 10, color: '#cbd5e1' }}>{opt}</span>
                              <span style={{ fontSize: 9, color: '#64748b', fontWeight: 700 }}>{voteCount} ({pct}%)</span>
                            </div>
                          );
                        })}
                      </div>
                      {/* More Details button */}
                      <button
                        onClick={() => setExpandedPollDetails(prev => { const n = new Set(prev); if (n.has(cp.id)) n.delete(cp.id); else n.add(cp.id); return n; })}
                        style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: 10, fontWeight: 700, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        {isExpanded ? '▲ Hide Details' : '▼ More Details — Participant Responses'}
                      </button>
                      {/* Expanded: participant list with their answers */}
                      {isExpanded && (
                        <div style={{ marginTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', marginBottom: 6 }}>Participant Responses</div>
                          {(cp.voters || []).length === 0 ? (
                            <div style={{ fontSize: 10, color: '#64748b', fontStyle: 'italic' }}>No votes recorded</div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                              {(cp.voters || []).map((v, vi) => {
                                const colors = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#8b5cf6', '#f97316'];
                                const optColor = colors[v.option_index % colors.length];
                                return (
                                  <div key={vi} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.02)' }}>
                                    <span style={{ fontSize: 11, color: '#e2e8f0', fontWeight: 600 }}>{v.first_name} {v.last_name}</span>
                                    <span style={{ fontSize: 10, color: optColor, fontWeight: 700, background: `${optColor}15`, padding: '1px 8px', borderRadius: 4 }}>
                                      {(cp.options || [])[v.option_index] || `Option ${v.option_index + 1}`}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Device Settings Panel */}
      {settingsOpen && (
        <div className="meeting-side-panel settings-panel">
          <div className="side-panel-header">
            <span>⚙️ Audio & Video</span>
            <button onClick={() => setSettingsOpen(false)} className="side-panel-close">×</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
            <DeviceSettings compact />
          </div>
        </div>
      )}

      {/* Whiteboard */}
      {whiteboardOpen && (
        <div className="whiteboard-overlay">
          <div className="whiteboard-header">
            <span style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>📝 Whiteboard</span>
            <button onClick={() => setWhiteboardOpen(false)} className="side-panel-close" style={{ color: '#475569', fontSize: 20 }}>×</button>
          </div>
          <div className="whiteboard-container">
            <Whiteboard />
          </div>
        </div>
      )}

      {/* End Meeting Confirmation */}
      {showEndConfirm && (
        <div className="meeting-confirm-overlay">
          <div className="meeting-confirm-dialog">
            <div style={{ fontSize: 36, marginBottom: 12 }}>{actionLoading ? '⏳' : '⚠️'}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#1e293b', marginBottom: 6 }}>
              {actionLoading ? 'Ending Meeting...' : 'End Meeting?'}
            </div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 20, lineHeight: 1.5 }}>
              {actionLoading ? 'Closing all connections and saving attendance...' : <>This will end the meeting for <strong>all participants</strong>. Everyone will be disconnected.</>}
            </div>
            {!actionLoading && (
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <Button size="large" onClick={() => setShowEndConfirm(false)} style={{ borderRadius: 10, height: 42, paddingInline: 24, fontWeight: 600 }}>
                  Cancel
                </Button>
                <Button size="large" danger type="primary" loading={actionLoading} onClick={async () => { setActionLoading(true); await onEnd(); }} style={{ borderRadius: 10, height: 42, paddingInline: 24, fontWeight: 700, background: '#ef4444', borderColor: '#ef4444' }}>
                  End Meeting
                </Button>
              </div>
            )}
            {actionLoading && <Spin indicator={<LoadingOutlined style={{ fontSize: 24, color: '#6366f1' }} />} />}
          </div>
        </div>
      )}

      {/* Leave Meeting Confirmation */}
      {showLeaveConfirm && (
        <div className="meeting-confirm-overlay">
          <div className="meeting-confirm-dialog">
            <div style={{ fontSize: 36, marginBottom: 12 }}>👋</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#1e293b', marginBottom: 6 }}>Leave Meeting?</div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 20, lineHeight: 1.5 }}>
              You will be disconnected from the meeting. The meeting will continue for other participants.
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <Button size="large" onClick={() => setShowLeaveConfirm(false)} disabled={actionLoading} style={{ borderRadius: 10, height: 42, paddingInline: 24, fontWeight: 600 }}>
                Stay
              </Button>
              <Button size="large" type="primary" loading={actionLoading} onClick={async () => { setActionLoading(true); await onLeave(); }} style={{ borderRadius: 10, height: 42, paddingInline: 24, fontWeight: 700, background: '#f59e0b', borderColor: '#f59e0b' }}>
                Leave
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingPage;
