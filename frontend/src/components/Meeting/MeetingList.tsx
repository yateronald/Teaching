import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button, Modal, Form, Input, Select, DatePicker, message, Tag, Empty, Skeleton, Typography, Tooltip } from 'antd';
import {
  PlusOutlined, VideoCameraOutlined, DeleteOutlined,
  ClockCircleOutlined, TeamOutlined, CalendarOutlined, PlayCircleOutlined,
  UserOutlined, ShareAltOutlined, PlayCircleFilled,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { io as socketIO } from 'socket.io-client';
import dayjs from 'dayjs';
import MeetingRecordings from './MeetingRecordings';
import { getSocketUrl } from '../../utils/socketUrl';

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

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Upcoming', value: upcomingMeetings.filter(m => m.status === 'scheduled').length, color: '#6366f1', icon: <CalendarOutlined /> },
          { label: 'Live Now', value: meetings.filter(m => m.status === 'active').length, color: '#22c55e', icon: <PlayCircleOutlined /> },
          { label: 'Total', value: meetings.length, color: '#f59e0b', icon: <VideoCameraOutlined /> },
        ].map((s, i) => (
          <div key={i} style={{ padding: '14px 16px', borderRadius: 12, background: '#fff', border: '1px solid #f0f0f8', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ color: s.color, fontSize: 16 }}>{s.icon}</span>
              <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{s.label}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#1e293b' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs: Meetings / Recordings */}
      <div style={{
        display: 'inline-flex', gap: 4, padding: 4, marginBottom: 18,
        background: '#f1f5f9', borderRadius: 12,
      }}>
        {([
          { key: 'meetings', label: 'Meetings', icon: <VideoCameraOutlined /> },
          { key: 'recordings', label: 'Recordings', icon: <PlayCircleFilled /> },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              padding: '8px 18px',
              borderRadius: 8,
              border: 'none',
              background: activeTab === t.key ? '#fff' : 'transparent',
              color: activeTab === t.key ? '#4338ca' : '#64748b',
              fontWeight: activeTab === t.key ? 700 : 600,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: activeTab === t.key ? '0 1px 3px rgba(15,23,42,0.08)' : 'none',
              display: 'inline-flex', alignItems: 'center', gap: 7,
              transition: 'all 0.18s ease',
              fontFamily: '"Manrope", "Inter", sans-serif',
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'recordings' ? (
        <MeetingRecordings />
      ) : (
        <>

      {/* Meeting Cards */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map(i => <Skeleton.Button key={i} active style={{ height: 100, borderRadius: 12, width: '100%' }} block />)}
        </div>
      ) : meetings.length === 0 ? (
        <Empty description={canManage ? 'No meetings yet. Create your first one!' : 'No meetings scheduled for you.'} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Active/Upcoming first */}
          {upcomingMeetings.map(m => {
            const sc = STATUS_CONFIG[m.status];
            const isHost = m.teacher_id === user?.id;
            return (
              <div key={m.id} data-focus-id={m.id} style={{ padding: '16px 20px', borderRadius: 14, background: '#fff', border: m.status === 'active' ? '2px solid #22c55e' : '1px solid #f0f0f8', boxShadow: m.status === 'active' ? '0 0 20px rgba(34,197,94,0.1)' : '0 1px 4px rgba(0,0,0,0.03)', position: 'relative', overflow: 'hidden' }}>
                {m.status === 'active' && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #22c55e, #4ade80)' }} />}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <Tag style={{ borderRadius: 6, fontWeight: 700, fontSize: 11, background: sc.bg, color: sc.color, border: 'none', margin: 0 }}>{sc.label}</Tag>
                      {m.batch_name && <Tag style={{ borderRadius: 6, fontSize: 10, margin: 0, background: '#f8f9ff', color: '#6366f1', border: '1px solid #e0e7ff' }}>{m.batch_name}</Tag>}
                      {m.is_locked && <Tag color="red" style={{ borderRadius: 6, fontSize: 10, margin: 0 }}>🔒 Locked</Tag>}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>{m.title}</div>
                    {m.description && <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>{m.description}</div>}
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 11, color: '#94a3b8' }}>
                      <span><UserOutlined /> {m.teacher_first_name} {m.teacher_last_name}</span>
                      {m.scheduled_start && <span><ClockCircleOutlined /> {dayjs(m.scheduled_start).format('MMM D, HH:mm')}</span>}
                      <span><TeamOutlined /> {m.participant_count} joined</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {m.status === 'active' && (
                      <Button type="primary" icon={<PlayCircleOutlined />} onClick={() => handleJoin(m)}
                        style={{ borderRadius: 10, fontWeight: 600, background: '#22c55e', borderColor: '#22c55e', boxShadow: '0 2px 8px rgba(34,197,94,0.3)' }}>
                        {isHost ? 'Rejoin' : 'Join Now'}
                      </Button>
                    )}
                    {m.status === 'scheduled' && isHost && (
                      <Button type="primary" icon={<PlayCircleOutlined />} onClick={() => handlePrepare(m)}
                        style={{ borderRadius: 10, fontWeight: 600, background: 'linear-gradient(135deg, #4338ca, #6366f1)', border: 'none' }}>
                        Start Class
                      </Button>
                    )}
                    {m.status === 'waiting' && isHost && (
                      <Button type="primary" icon={<PlayCircleOutlined />} onClick={() => handleJoin(m)}
                        style={{ borderRadius: 10, fontWeight: 600, background: '#f59e0b', borderColor: '#f59e0b' }}>
                        Continue Setup
                      </Button>
                    )}
                    {m.status === 'scheduled' && !isHost && (
                      <Tooltip title="Meeting hasn't started yet">
                        <Button disabled style={{ borderRadius: 10 }}>Not Started</Button>
                      </Tooltip>
                    )}
                    {m.status === 'waiting' && !isHost && (
                      <Button onClick={() => handleJoin(m)} style={{ borderRadius: 10, fontWeight: 600, color: '#f59e0b', borderColor: '#f59e0b' }}>
                        Join Waiting Room
                      </Button>
                    )}
                    {isHost && (
                      <>
                        <Tooltip title="Copy share link">
                          <Button type="text" icon={<ShareAltOutlined />} onClick={() => {
                            const shareUrl = `${window.location.origin}/app/meeting-join/${m.room_name}`;
                            navigator.clipboard.writeText(shareUrl).then(() => message.success('Share link copied!')).catch(() => {
                              // Fallback
                              const input = document.createElement('input');
                              input.value = shareUrl;
                              document.body.appendChild(input);
                              input.select();
                              document.execCommand('copy');
                              document.body.removeChild(input);
                              message.success('Share link copied!');
                            });
                          }} style={{ borderRadius: 8, color: '#6366f1' }} />
                        </Tooltip>
                        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(m.id)} style={{ borderRadius: 8 }} />
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Past meetings */}
          {pastMeetings.length > 0 && (
            <>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#475569', marginTop: 16, marginBottom: 4 }}>Past Meetings</div>
              {pastMeetings.slice(0, 10).map(m => (
                <div key={m.id} data-focus-id={m.id} style={{ padding: '12px 16px', borderRadius: 12, background: '#fafbff', border: '1px solid #f0f0f8', opacity: 0.8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>{m.title}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>
                        {m.started_at && dayjs(m.started_at).format('MMM D, HH:mm')}
                        {m.ended_at && ` — ${dayjs(m.ended_at).format('HH:mm')}`}
                        {' · '}{m.participant_count} participants
                        {m.batch_name && ` · ${m.batch_name}`}
                      </div>
                    </div>
                    <Tag style={{ borderRadius: 6, background: '#f1f5f9', color: '#94a3b8', border: 'none' }}>Ended</Tag>
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
