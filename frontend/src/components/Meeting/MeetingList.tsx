import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button, Modal, Form, Input, Select, DatePicker, message, Skeleton, Typography, Tooltip } from 'antd';
import {
  PlusOutlined, VideoCameraOutlined, DeleteOutlined,
  ClockCircleOutlined, TeamOutlined, CalendarOutlined, PlayCircleOutlined,
  UserOutlined, ShareAltOutlined, PlayCircleFilled,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { io as socketIO } from 'socket.io-client';
import MeetingRecordings from './MeetingRecordings';
import { getSocketUrl } from '../../utils/socketUrl';
import { formatLocal, formatTimeLocal, detectBrowserTimezone } from '../../utils/timezone';

const { Text } = Typography;
const { TextArea } = Input;

const SOCKET_URL = getSocketUrl();

interface Meeting {
  id: number;
  room_name: string;
  title: string;
  description: string | null;
  teacher_id: number;
  batch_id: number | null;
  status: 'scheduled' | 'waiting' | 'active' | 'ended';
  scheduled_start: string | null;
  scheduled_end: string | null;
  started_at: string | null;
  ended_at: string | null;
  is_locked: boolean;
  participant_count: number;
  teacher_first_name: string;
  teacher_last_name: string;
  batch_name: string | null;
  created_at: string;
}

interface Batch {
  id: number;
  name: string;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  scheduled: { color: '#6366f1', bg: '#eef2ff', label: 'Scheduled' },
  waiting: { color: '#f59e0b', bg: '#fef3c7', label: 'Waiting' },
  active: { color: '#22c55e', bg: '#dcfce7', label: '● Live' },
  ended: { color: '#94a3b8', bg: '#f1f5f9', label: 'Ended' },
};

const MeetingList: React.FC = () => {
  const { apiCall, isTeacher, isAdmin, user } = useAuth();
  const userTz = user?.timezone || detectBrowserTimezone();
  const browserTz = detectBrowserTimezone();
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form] = Form.useForm();

  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await apiCall('/meetings');
      if (resp.ok) setMeetings(await resp.json());
    } catch { message.error('Failed to load meetings'); }
    finally { setLoading(false); }
  }, [apiCall]);

  const fetchBatches = useCallback(async () => {
    try {
      const resp = await apiCall('/batches');
      if (resp.ok) {
        const data = await resp.json();
        setBatches(Array.isArray(data) ? data : data.batches || []);
      }
    } catch { /* ignore */ }
  }, [apiCall]);

  useEffect(() => { fetchMeetings(); fetchBatches(); }, [fetchMeetings, fetchBatches]);

  // Deep-link: ?focus=<meetingId> scrolls to and pulses the matching card.
  const [searchParams] = useSearchParams();
  const focusId = searchParams.get('focus');
  useEffect(() => {
    if (!focusId || loading) return;
    const idNum = Number(focusId);
    if (!Number.isFinite(idNum)) return;
    const tid = setTimeout(() => {
      const el = document.querySelector(`[data-focus-id="${idNum}"]`) as HTMLElement | null;
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('focus-pulse');
        setTimeout(() => el.classList.remove('focus-pulse'), 2500);
      }
    }, 250);
    return () => clearTimeout(tid);
  }, [focusId, loading, meetings]);

  // Real-time updates via Socket.io
  const socketRef = useRef<ReturnType<typeof socketIO> | null>(null);
  useEffect(() => {
    const socket = socketIO(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    // Listen for meeting status changes
    socket.on('meeting:created', () => { fetchMeetings(); });
    socket.on('meeting:started', (data: { meetingId: number }) => {
      setMeetings(prev => prev.map(m => m.id === data.meetingId ? { ...m, status: 'active' as const } : m));
    });
    socket.on('meeting:ended', (data: { meetingId: number }) => {
      setMeetings(prev => prev.map(m => m.id === data.meetingId ? { ...m, status: 'ended' as const } : m));
    });
    socket.on('meeting:waiting', (data: { meetingId: number }) => {
      setMeetings(prev => prev.map(m => m.id === data.meetingId ? { ...m, status: 'waiting' as const } : m));
    });

    // Join rooms for all meetings the user can see
    socket.on('connect', () => {
      // Re-fetch to get latest state on reconnect
      fetchMeetings();
    });

    return () => { socket.disconnect(); };
  }, [fetchMeetings]);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      setCreating(true);
      const payload: Record<string, unknown> = {
        title: values.title,
        description: values.description || null,
        batch_id: values.batch_id || null,
      };
      if (values.scheduled_time) {
        payload.scheduled_start = values.scheduled_time[0].toISOString();
        payload.scheduled_end = values.scheduled_time[1].toISOString();
      }
      const resp = await apiCall('/meetings', { method: 'POST', body: JSON.stringify(payload) });
      if (resp.ok) {
        message.success('Meeting created');
        setCreateModalOpen(false);
        form.resetFields();
        fetchMeetings();
      } else {
        const d = await resp.json();
        message.error(d.error || 'Failed');
      }
    } catch { /* validation */ }
    finally { setCreating(false); }
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Delete Meeting',
      content: 'Are you sure you want to delete this meeting?',
      okText: 'Delete', okType: 'danger',
      onOk: async () => {
        const resp = await apiCall(`/meetings/${id}`, { method: 'DELETE' });
        if (resp.ok) { message.success('Deleted'); fetchMeetings(); }
        else message.error('Failed to delete');
      },
    });
  };

  const handleJoin = async (meeting: Meeting) => {
    navigate(`/app/meeting/${meeting.id}`);
  };

  const handlePrepare = async (meeting: Meeting) => {
    try {
      const resp = await apiCall(`/meetings/${meeting.id}/prepare`, { method: 'POST' });
      if (resp.ok) {
        navigate(`/app/meeting/${meeting.id}`);
      } else {
        const d = await resp.json();
        message.error(d.error || 'Failed');
      }
    } catch { message.error('Failed'); }
  };

  const canManage = isTeacher || isAdmin;
  const upcomingMeetings = meetings.filter(m => m.status !== 'ended');
  const pastMeetings = meetings.filter(m => m.status === 'ended');

  const [activeTab, setActiveTab] = useState<'meetings' | 'recordings'>('meetings');

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', letterSpacing: -0.3 }}>
            <VideoCameraOutlined style={{ marginRight: 10, color: '#6366f1' }} />
            Live Meetings
          </div>
          <Text style={{ fontSize: 13, color: '#94a3b8' }}>
            {canManage ? 'Create and manage live classes' : 'Join live classes and view recordings'}
          </Text>
          <div style={{ marginTop: 6, fontSize: 11, color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 9px', borderRadius: 999, background: '#eef2ff', border: '1px solid #e0e7ff' }}>
            <ClockCircleOutlined style={{ color: '#6366f1', fontSize: 10 }} />
            Times shown in your timezone: <strong style={{ color: '#4338ca' }}>{userTz}</strong>
          </div>
        </div>
        {canManage && (
          <div style={{ display: 'flex', gap: 8 }}>
            <Button icon={<TeamOutlined />} onClick={() => navigate('/app/meeting-attendance')}
              style={{ borderRadius: 10, height: 40, fontWeight: 600, border: '1px solid #e0e7ff', color: '#4338ca' }}>
              Attendance
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}
              style={{ borderRadius: 10, height: 40, fontWeight: 600, background: 'linear-gradient(135deg, #4338ca, #6366f1)', border: 'none', boxShadow: '0 2px 8px rgba(99,102,241,0.3)' }}>
              New Meeting
            </Button>
          </div>
        )}
      </div>

      {/* Stats — compact, modern, with subtle accent borders */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 22 }}>
        {[
          { label: 'Upcoming', value: upcomingMeetings.filter(m => m.status === 'scheduled').length, color: '#6366f1', icon: <CalendarOutlined />, bg: '#eef2ff' },
          { label: 'Live Now', value: meetings.filter(m => m.status === 'active').length, color: '#22c55e', icon: <PlayCircleOutlined />, bg: '#dcfce7' },
          { label: 'Total', value: meetings.length, color: '#f59e0b', icon: <VideoCameraOutlined />, bg: '#fef3c7' },
        ].map((s, i) => (
          <div key={i} style={{
            padding: '14px 18px', borderRadius: 14, background: '#fff',
            border: '1px solid #f0f0f8',
            boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 11,
              background: s.bg, color: s.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, flexShrink: 0,
            }}>{s.icon}</div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 10.5, color: '#94a3b8', fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                {s.value}
                {s.label === 'Live Now' && (s.value as number) > 0 && (
                  <span className="meeting-live-pulse" style={{
                    display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                    background: '#22c55e', marginLeft: 8, verticalAlign: 'middle',
                  }} />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs: Meetings / Recordings — modern segmented control */}
      <div style={{
        display: 'inline-flex', gap: 4, padding: 4, marginBottom: 18,
        background: '#f1f5f9', borderRadius: 12,
        boxShadow: 'inset 0 1px 2px rgba(15,23,42,0.04)',
      }}>
        {([
          { key: 'meetings', label: 'Meetings', icon: <VideoCameraOutlined />, count: meetings.length },
          { key: 'recordings', label: 'Recordings', icon: <PlayCircleFilled />, count: null as number | null },
        ] as const).map(t => {
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                padding: '8px 16px',
                borderRadius: 9,
                border: 'none',
                background: isActive ? '#fff' : 'transparent',
                color: isActive ? '#4338ca' : '#64748b',
                fontWeight: isActive ? 700 : 600,
                fontSize: 13,
                cursor: 'pointer',
                boxShadow: isActive ? '0 1px 3px rgba(15,23,42,0.10), 0 0 0 1px rgba(67,56,202,0.06)' : 'none',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                transition: 'all 0.18s ease',
                fontFamily: '"Manrope", "Inter", sans-serif',
              }}
            >
              {t.icon} {t.label}
              {t.count !== null && t.count > 0 && (
                <span style={{
                  fontSize: 10.5, fontWeight: 800,
                  padding: '1px 7px', borderRadius: 999,
                  background: isActive ? '#eef2ff' : 'rgba(148,163,184,0.18)',
                  color: isActive ? '#4338ca' : '#64748b',
                  minWidth: 20, textAlign: 'center',
                }}>
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeTab === 'recordings' ? (
        <MeetingRecordings />
      ) : (
        <>

      {/* Meeting Cards */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map(i => <Skeleton.Button key={i} active style={{ height: 100, borderRadius: 14, width: '100%' }} block />)}
        </div>
      ) : meetings.length === 0 ? (
        <div style={{
          padding: '48px 24px', textAlign: 'center',
          background: '#fafbff', borderRadius: 16, border: '1px dashed #e2e8f0',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16, margin: '0 auto 14px',
            background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#6366f1', fontSize: 28,
          }}><VideoCameraOutlined /></div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
            {canManage ? 'No meetings yet' : 'No meetings scheduled'}
          </div>
          <div style={{ fontSize: 13, color: '#64748b' }}>
            {canManage ? 'Create your first live class to start meeting with students.' : "Your teacher hasn't scheduled any live classes yet."}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Active/Upcoming first — modern card with vertical accent bar */}
          {upcomingMeetings.map(m => {
            const sc = STATUS_CONFIG[m.status];
            const isHost = m.teacher_id === user?.id;
            const isLive = m.status === 'active';
            const accentColor = isLive ? '#22c55e' : m.status === 'waiting' ? '#f59e0b' : '#6366f1';

            return (
              <div
                key={m.id}
                data-focus-id={m.id}
                className={isLive ? 'meeting-card meeting-card-live' : 'meeting-card'}
                style={{
                  padding: 0,
                  borderRadius: 16,
                  background: '#fff',
                  border: isLive ? `1px solid ${accentColor}40` : '1px solid #f0f0f8',
                  boxShadow: isLive
                    ? '0 8px 24px -8px rgba(34,197,94,0.18), 0 0 0 1px rgba(34,197,94,0.08)'
                    : '0 2px 6px -2px rgba(15,23,42,0.04)',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                }}
              >
                {/* Vertical accent bar (left edge) */}
                <div style={{
                  width: 4,
                  flexShrink: 0,
                  background: isLive
                    ? 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)'
                    : `linear-gradient(180deg, ${accentColor}, ${accentColor}aa)`,
                }} />

                <div style={{ flex: 1, padding: '16px 18px', minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      {/* Tags row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                        {isLive ? (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '3px 10px', borderRadius: 999,
                            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                            color: '#fff', fontSize: 10.5, fontWeight: 800,
                            letterSpacing: 0.4, textTransform: 'uppercase',
                            boxShadow: '0 2px 6px rgba(34,197,94,0.35)',
                          }}>
                            <span className="meeting-live-pulse" style={{
                              width: 6, height: 6, borderRadius: '50%', background: '#fff',
                            }} />
                            Live
                          </span>
                        ) : (
                          <span style={{
                            padding: '3px 10px', borderRadius: 999,
                            background: sc.bg, color: sc.color,
                            fontSize: 10.5, fontWeight: 800, letterSpacing: 0.4, textTransform: 'uppercase',
                          }}>
                            {sc.label}
                          </span>
                        )}
                        {m.batch_name && (
                          <span style={{
                            padding: '3px 9px', borderRadius: 999,
                            background: '#eef2ff', color: '#4338ca',
                            fontSize: 10.5, fontWeight: 700,
                            border: '1px solid #e0e7ff',
                          }}>
                            {m.batch_name}
                          </span>
                        )}
                        {m.is_locked && (
                          <span style={{
                            padding: '3px 9px', borderRadius: 999,
                            background: '#fef2f2', color: '#dc2626',
                            fontSize: 10.5, fontWeight: 700,
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                          }}>🔒 Locked</span>
                        )}
                      </div>

                      {/* Title */}
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 4, letterSpacing: -0.2, lineHeight: 1.3 }}>
                        {m.title}
                      </div>
                      {m.description && (
                        <div style={{ fontSize: 12.5, color: '#64748b', marginBottom: 8, lineHeight: 1.5 }}>
                          {m.description}
                        </div>
                      )}

                      {/* Meta row */}
                      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 12, color: '#64748b', marginTop: 2 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                          <UserOutlined style={{ color: '#94a3b8' }} />
                          {m.teacher_first_name} {m.teacher_last_name}
                        </span>
                        {m.scheduled_start && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                            <ClockCircleOutlined style={{ color: '#94a3b8' }} />
                            {formatLocal(m.scheduled_start, userTz, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                          </span>
                        )}
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                          <TeamOutlined style={{ color: '#94a3b8' }} />
                          {m.participant_count} joined
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                      {m.status === 'active' && (
                        <Button type="primary" icon={<PlayCircleOutlined />} onClick={() => handleJoin(m)}
                          style={{
                            borderRadius: 10, fontWeight: 700, height: 38,
                            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                            borderColor: 'transparent',
                            boxShadow: '0 4px 12px rgba(34,197,94,0.35)',
                            paddingInline: 18,
                          }}>
                          {isHost ? 'Rejoin' : 'Join Now'}
                        </Button>
                      )}
                      {m.status === 'scheduled' && isHost && (
                        <Button type="primary" icon={<PlayCircleOutlined />} onClick={() => handlePrepare(m)}
                          style={{
                            borderRadius: 10, fontWeight: 700, height: 38,
                            background: 'linear-gradient(135deg, #4338ca, #6366f1)',
                            border: 'none', paddingInline: 18,
                            boxShadow: '0 4px 12px rgba(67,56,202,0.25)',
                          }}>
                          Start Class
                        </Button>
                      )}
                      {m.status === 'waiting' && isHost && (
                        <Button type="primary" icon={<PlayCircleOutlined />} onClick={() => handleJoin(m)}
                          style={{
                            borderRadius: 10, fontWeight: 700, height: 38,
                            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                            borderColor: 'transparent', paddingInline: 18,
                            boxShadow: '0 4px 12px rgba(245,158,11,0.3)',
                          }}>
                          Continue
                        </Button>
                      )}
                      {m.status === 'scheduled' && !isHost && (
                        <Tooltip title="Meeting hasn't started yet">
                          <Button disabled style={{ borderRadius: 10, height: 38 }}>Not Started</Button>
                        </Tooltip>
                      )}
                      {m.status === 'waiting' && !isHost && (
                        <Button onClick={() => handleJoin(m)}
                          style={{
                            borderRadius: 10, fontWeight: 700, height: 38,
                            background: '#fffbeb', color: '#b45309', borderColor: '#fde68a',
                            paddingInline: 16,
                          }}>
                          Join Waiting Room
                        </Button>
                      )}

                      {isHost && (
                        <>
                          <Tooltip title="Copy share link">
                            <Button type="text" icon={<ShareAltOutlined />} onClick={() => {
                              const shareUrl = `${window.location.origin}/app/meeting-join/${m.room_name}`;
                              navigator.clipboard.writeText(shareUrl).then(() => message.success('Share link copied!')).catch(() => {
                                const input = document.createElement('input');
                                input.value = shareUrl;
                                document.body.appendChild(input);
                                input.select();
                                document.execCommand('copy');
                                document.body.removeChild(input);
                                message.success('Share link copied!');
                              });
                            }} style={{ borderRadius: 10, color: '#6366f1', width: 38, height: 38 }} />
                          </Tooltip>
                          <Tooltip title="Delete">
                            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(m.id)} style={{ borderRadius: 10, width: 38, height: 38 }} />
                          </Tooltip>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* ── Past meetings ── */}
          {pastMeetings.length > 0 && (
            <>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                marginTop: 22, marginBottom: 8,
              }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                  Past Meetings
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 700, color: '#94a3b8',
                  background: '#f1f5f9', borderRadius: 999, padding: '2px 9px',
                }}>{pastMeetings.length}</span>
                <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, #e2e8f0, transparent)' }} />
              </div>

              {pastMeetings.slice(0, 10).map(m => (
                <div
                  key={m.id}
                  data-focus-id={m.id}
                  className="meeting-row-past"
                  style={{
                    padding: '14px 16px',
                    borderRadius: 12,
                    background: '#fff',
                    border: '1px solid #f0f0f8',
                    boxShadow: '0 1px 2px rgba(15,23,42,0.02)',
                    transition: 'background 0.18s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
                      {/* Past icon tile */}
                      <div style={{
                        width: 38, height: 38, borderRadius: 10,
                        background: '#f1f5f9', color: '#64748b',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 16, flexShrink: 0,
                      }}>
                        <VideoCameraOutlined />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#334155', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {m.title}
                        </div>
                        <div style={{ fontSize: 11, color: '#94a3b8', display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                          {m.started_at && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <ClockCircleOutlined />
                              {formatLocal(m.started_at, userTz, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                              {m.ended_at && ` → ${formatTimeLocal(m.ended_at, userTz)}`}
                            </span>
                          )}
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <TeamOutlined />
                            {m.participant_count} participant{m.participant_count !== 1 ? 's' : ''}
                          </span>
                          {m.batch_name && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <UserOutlined />{m.batch_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span style={{
                      padding: '3px 10px', borderRadius: 999,
                      background: '#f1f5f9', color: '#64748b',
                      fontSize: 10.5, fontWeight: 700,
                      letterSpacing: 0.4, textTransform: 'uppercase',
                      flexShrink: 0,
                    }}>
                      Ended
                    </span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      </>
      )}

      {/* Create Meeting Modal */}
      <Modal
        open={createModalOpen}
        onCancel={() => { setCreateModalOpen(false); form.resetFields(); }}
        title={null}
        footer={null}
        width={560}
        destroyOnClose
        styles={{ body: { padding: 0 } }}
      >
        {/* Header with gradient */}
        <div style={{ background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 50%, #818cf8 100%)', padding: '24px 28px 20px', borderRadius: '8px 8px 0 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 22 }}>
              <VideoCameraOutlined />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: -0.3 }}>New Live Meeting</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>Schedule a live class for your students</div>
            </div>
          </div>
        </div>

        {/* Form body */}
        <div style={{ padding: '20px 28px 8px' }}>
          <Form form={form} layout="vertical" requiredMark={false}>
            {/* Title */}
            <Form.Item name="title" rules={[{ required: true, message: 'Please enter a meeting title' }]}
              label={<span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>📝 Meeting Title</span>}>
              <Input placeholder="e.g. French Grammar — Week 5" size="large"
                style={{ borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 14 }} />
            </Form.Item>

            {/* Description */}
            <Form.Item name="description"
              label={<span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>📋 Description <span style={{ fontWeight: 400, color: '#94a3b8' }}>(optional)</span></span>}>
              <TextArea rows={2} placeholder="What will you cover in this class?"
                style={{ borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 13, resize: 'none' }} />
            </Form.Item>

            {/* Batch & Time row */}
            <div style={{ display: 'flex', gap: 12 }}>
              <Form.Item name="batch_id" style={{ flex: 1 }}
                label={<span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>👥 Batch <span style={{ fontWeight: 400, color: '#94a3b8' }}>(optional)</span></span>}>
                <Select placeholder="Select a batch" allowClear size="large" style={{ borderRadius: 10 }}
                  popupMatchSelectWidth={false}
                  getPopupContainer={trigger => trigger.parentElement || document.body}>
                  {batches.map(b => <Select.Option key={b.id} value={b.id}>{b.name}</Select.Option>)}
                </Select>
              </Form.Item>
            </div>

            {/* Scheduled time */}
            <Form.Item name="scheduled_time"
              label={<span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>🕐 Schedule <span style={{ fontWeight: 400, color: '#94a3b8' }}>(optional)</span></span>}>
              <DatePicker.RangePicker showTime format="YYYY-MM-DD HH:mm" size="large"
                style={{ width: '100%', borderRadius: 10, border: '1.5px solid #e2e8f0' }}
                placeholder={['Start date & time', 'End date & time']}
                getPopupContainer={trigger => trigger.parentElement || document.body} />
            </Form.Item>

            <div style={{ padding: '8px 12px', borderRadius: 8, background: '#eef2ff', border: '1px solid #e0e7ff', marginBottom: 14, fontSize: 11, color: '#4338ca', display: 'flex', alignItems: 'center', gap: 6 }}>
              <ClockCircleOutlined style={{ fontSize: 11 }} />
              <span>Times above are in your <strong>browser's timezone</strong>: <strong>{browserTz}</strong>. Stored in UTC; each student sees them in their own timezone.</span>
            </div>

            {/* Info note */}
            <div style={{ padding: '10px 14px', borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', marginBottom: 16, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <span style={{ fontSize: 14, flexShrink: 0 }}>💡</span>
              <div style={{ fontSize: 11, color: '#15803d', lineHeight: 1.5 }}>
                Students in the selected batch will be <strong>automatically admitted</strong> when they join. You can also share a link for others — they'll need your approval to enter.
              </div>
            </div>
          </Form>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 28px 20px', display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid #f1f5f9' }}>
          <Button onClick={() => { setCreateModalOpen(false); form.resetFields(); }} size="large"
            style={{ borderRadius: 10, height: 42, fontWeight: 600, paddingInline: 20 }}>
            Cancel
          </Button>
          <Button type="primary" onClick={handleCreate} loading={creating} size="large"
            icon={<VideoCameraOutlined />}
            style={{ borderRadius: 10, height: 42, fontWeight: 700, paddingInline: 24, background: 'linear-gradient(135deg, #4338ca, #6366f1)', border: 'none', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
            Create Meeting
          </Button>
        </div>
      </Modal>

      {/* Pulse animation used to highlight a deep-linked meeting card */}
      <style>{`
        .focus-pulse {
          animation: focus-pulse-anim 2.5s ease-out;
          scroll-margin-top: 100px;
        }
        @keyframes focus-pulse-anim {
          0%   { box-shadow: 0 0 0 0 rgba(99,102,241,0.5), 0 0 0 0 rgba(99,102,241,0.3); }
          30%  { box-shadow: 0 0 0 6px rgba(99,102,241,0.2), 0 0 0 12px rgba(99,102,241,0.05); }
          100% { box-shadow: 0 0 0 0 transparent; }
        }
      `}</style>
    </div>
  );
};

export default MeetingList;
