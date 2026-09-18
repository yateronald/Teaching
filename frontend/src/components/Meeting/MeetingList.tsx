import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, ConfigProvider, DatePicker, Form, Input, Modal, Segmented, Select, Skeleton, Tooltip, message } from 'antd';
import {
  CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined, DeleteOutlined, FieldTimeOutlined, HistoryOutlined,
  LinkOutlined, LockOutlined, PlusOutlined, TeamOutlined, UserOutlined, VideoCameraOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MeetingRecordings from './MeetingRecordings';
import JoinWithId from './JoinWithId';
import MeetingShare from './MeetingShare';
import type { ShareableMeeting } from './MeetingShare';
import { Ic, copyText } from './meetingUi';
import { acquireSocket, releaseSocket } from '../../utils/realtime';
import { detectBrowserTimezone, formatPlain, timezoneLabel } from '../../utils/timezone';
import './MeetingList.css';

const PAST_PAGE = 10;

interface Meeting {
  id: number;
  room_name: string;
  code?: string;
  passcode?: string;
  my_role?: 'host' | 'admin' | 'teacher' | 'member' | 'guest';
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
  participant_count: number | string;
  teacher_first_name: string;
  teacher_last_name: string;
  batch_name: string | null;
  created_at: string;
}

interface Batch { id: number; name: string; }
type Tab = 'upcoming' | 'active' | 'past' | 'recordings';

const ms = (iso?: string | null) => (iso ? new Date(iso).getTime() : NaN);
const minutesBetween = (a?: string | null, b?: string | null) => {
  const d = (ms(b) - ms(a)) / 60000;
  return Number.isFinite(d) ? Math.max(0, Math.round(d)) : null;
};
const durationText = (m: number | null) => (m === null ? '—' : m < 60 ? `${m} min` : `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ''}`);
const spanText = (msLeft: number) => {
  const m = Math.max(1, Math.round(msLeft / 60000));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h${m % 60 ? ` ${m % 60} min` : ''}`;
  const d = Math.floor(h / 24);
  return `${d} d${h % 24 ? ` ${h % 24} h` : ''}`;
};
const RANK: Record<Meeting['status'], number> = { active: 0, waiting: 1, scheduled: 2, ended: 3 };

const MeetingList: React.FC = () => {
  const { apiCall, isTeacher, isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [msg, msgHolder] = message.useMessage();
  const [modal, modalHolder] = Modal.useModal();
  const tzLabel = timezoneLabel(user?.timezone);
  const browserTz = detectBrowserTimezone();
  const canManage = isTeacher || isAdmin;

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('upcoming');
  const [pastLimit, setPastLimit] = useState(PAST_PAGE);
  const [now, setNow] = useState(() => Date.now());
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [share, setShare] = useState<{ meeting: ShareableMeeting; created?: boolean } | null>(null);
  const [creating, setCreating] = useState(false);
  const [form] = Form.useForm();

  const fetchMeetings = useCallback(async () => {
    try {
      const resp = await apiCall('/meetings');
      if (!resp.ok) throw new Error(`The server answered ${resp.status}.`);
      setMeetings(await resp.json());
      setError(null);
    } catch (e: any) {
      setError(e?.message || 'Could not load meetings.');
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const fetchBatches = useCallback(async () => {
    try {
      const resp = await apiCall('/batches');
      if (resp.ok) {
        const data = await resp.json();
        setBatches(Array.isArray(data) ? data : data.batches || []);
      }
    } catch { /* optional */ }
  }, [apiCall]);

  useEffect(() => { fetchMeetings(); }, [fetchMeetings]);
  useEffect(() => { if (canManage) fetchBatches(); }, [canManage, fetchBatches]);
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(t);
  }, []);

  // Real-time status changes
  useEffect(() => {
    const socket = acquireSocket();
    const patch = (status: Meeting['status']) => (data: { meetingId: number }) =>
      setMeetings(prev => prev.map(m => (m.id === data.meetingId ? { ...m, status } : m)));
    const handlers: [string, (d: { meetingId: number }) => void][] = [
      ['meeting:created', () => { fetchMeetings(); }],
      ['meeting:started', patch('active')],
      ['meeting:ended', patch('ended')],
      ['meeting:waiting', patch('waiting')],
      ['connect', () => { fetchMeetings(); }],
    ];
    handlers.forEach(([ev, fn]) => socket.on(ev, fn));
    return () => { handlers.forEach(([ev, fn]) => socket.off(ev, fn)); releaseSocket(); };
  }, [fetchMeetings]);

  /* ── Derived lists ── */
  const view = useMemo(() => {
    const whenMs = (m: Meeting) => ms(m.scheduled_start) || ms(m.started_at) || ms(m.created_at);

    // Past: finished meetings
    const past = meetings.filter(m => {
      if (m.status === 'ended') return true;
      const end = ms(m.ended_at || m.scheduled_end);
      if (m.status !== 'active' && Number.isFinite(end) && now > end) return true;
      return false;
    }).sort((a, b) => (ms(b.ended_at || b.started_at || b.created_at) || 0) - (ms(a.ended_at || a.started_at || a.created_at) || 0));

    // Non-past meetings
    const nonPast = meetings.filter(m => !past.some(p => p.id === m.id));

    // Active: status is active/waiting, OR start time has already passed
    const active = nonPast.filter(m => {
      if (m.status === 'active' || m.status === 'waiting') return true;
      const start = ms(m.started_at || m.scheduled_start);
      return Number.isFinite(start) && now >= start;
    }).sort((a, b) => RANK[a.status] - RANK[b.status] || (whenMs(a) || Infinity) - (whenMs(b) || Infinity));

    // Upcoming: start time has not yet arrived
    const upcoming = nonPast.filter(m => !active.some(act => act.id === m.id))
      .sort((a, b) => (whenMs(a) || Infinity) - (whenMs(b) || Infinity));

    // Top hero card is strictly for upcoming classes waiting to start.
    // Once a meeting moves to active, it is removed from the top banner and lives in the Active tab.
    const featured = upcoming.slice(0, 1);

    return {
      upcoming,
      active,
      past,
      featured,
      minutes: past.reduce((s, m) => s + (minutesBetween(m.started_at, m.ended_at) || 0), 0),
    };
  }, [meetings, now]);

  // When there are active classes and 0 upcoming classes on initial load, default to active tab
  const userSwitchedTab = useRef(false);
  useEffect(() => {
    if (loading || userSwitchedTab.current) return;
    if (view.active.length > 0 && view.upcoming.length === 0) {
      setTab('active');
    }
  }, [loading, view.active.length, view.upcoming.length]);

  // Deep-link: ?focus=<meetingId> opens the right tab, scrolls to the card and pulses it.
  const [searchParams] = useSearchParams();
  const focusId = Number(searchParams.get('focus'));
  useEffect(() => {
    if (!focusId || loading) return;
    if (view.active.some(m => m.id === focusId)) {
      setTab('active');
    } else if (view.upcoming.some(m => m.id === focusId)) {
      setTab('upcoming');
    } else {
      const idx = view.past.findIndex(m => m.id === focusId);
      if (idx >= 0) { setTab('past'); if (idx >= pastLimit) setPastLimit(idx + 1); }
    }
    const tid = window.setTimeout(() => {
      const el = document.querySelector(`[data-focus-id="${focusId}"]`) as HTMLElement | null;
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ml-focus');
      window.setTimeout(() => el.classList.remove('ml-focus'), 2500);
    }, 250);
    return () => window.clearTimeout(tid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusId, loading, view.active.length, view.upcoming.length, view.past.length]);

  /* ── Actions ── */
  const codeOf = (m: Meeting) => m.code || m.room_name;
  const open = (m: Meeting) => navigate(`/app/meeting/${codeOf(m)}`);

  const handlePrepare = async (m: Meeting) => {
    try {
      const resp = await apiCall(`/meetings/${m.id}/prepare`, { method: 'POST' });
      if (resp.ok) open(m);
      else msg.error((await resp.json().catch(() => ({}))).error || 'Could not open the class');
    } catch { msg.error('Could not open the class'); }
  };

  const openShare = (m: Meeting, created = false) => setShare({
    created,
    meeting: {
      id: m.id,
      code: codeOf(m),
      title: m.title,
      passcode: m.passcode,
      batch_name: m.batch_name,
      hostName: `${m.teacher_first_name || ''} ${m.teacher_last_name || ''}`.trim() || undefined,
      when: m.scheduled_start ? `${dayLabel(m.scheduled_start)} · ${rangeOf(m)} (${tzLabel})` : undefined,
    },
  });
  const copyCode = async (m: Meeting) => {
    if (await copyText(codeOf(m))) msg.success('Meeting ID copied');
  };

  const handleDelete = (m: Meeting) => {
    modal.confirm({
      title: 'Delete this meeting?',
      content: `“${m.title}” will be removed for everyone.`,
      okText: 'Delete',
      okButtonProps: { danger: true },
      centered: true,
      onOk: async () => {
        const resp = await apiCall(`/meetings/${m.id}`, { method: 'DELETE' });
        if (resp.ok) { msg.success('Meeting deleted'); fetchMeetings(); }
        else msg.error('Could not delete the meeting');
      },
    });
  };

  const closeCreate = () => { setCreateOpen(false); form.resetFields(); };
  const handleCreate = async () => {
    let values: any;
    try { values = await form.validateFields(); } catch { return; }
    setCreating(true);
    try {
      const payload: Record<string, unknown> = {
        title: values.title,
        description: values.description || null,
        batch_id: values.batch_id,
        scheduled_start: values.scheduled_time[0].toISOString(),
        scheduled_end: values.scheduled_time[1].toISOString(),
      };
      const resp = await apiCall('/meetings', { method: 'POST', body: JSON.stringify(payload) });
      if (resp.ok) {
        const created: Meeting = await resp.json();
        closeCreate();
        fetchMeetings();
        openShare(created, true);
      } else {
        msg.error((await resp.json().catch(() => ({}))).error || 'Could not create the meeting');
      }
    } finally {
      setCreating(false);
    }
  };

  /* ── Formatting ── */
  const fmt = (iso: string | null | undefined, opts: Intl.DateTimeFormatOptions) => formatPlain(iso, user?.timezone, opts);
  const time = (iso?: string | null) => fmt(iso, { hour: 'numeric', minute: '2-digit', hour12: true });
  const dayKey = (iso: string | number) => formatPlain(iso, user?.timezone, { year: 'numeric', month: '2-digit', day: '2-digit' });
  const startOf = (m: Meeting) => m.started_at || m.scheduled_start;
  const endOf = (m: Meeting) => m.ended_at || m.scheduled_end;
  const whenOf = (m: Meeting) => startOf(m) || m.created_at;
  const rangeOf = (m: Meeting) => {
    const s = startOf(m);
    if (!s) return '';
    const e = endOf(m);
    return e ? `${time(s)} – ${time(e)}` : time(s);
  };
  const dayLabel = (iso: string) => {
    const k = dayKey(iso);
    if (k === dayKey(now)) return 'Today';
    if (k === dayKey(now + 86400_000)) return 'Tomorrow';
    return fmt(iso, { weekday: 'long', month: 'short', day: 'numeric' });
  };
  const teacherOf = (m: Meeting) => `${m.teacher_first_name || ''} ${m.teacher_last_name || ''}`.trim() || 'Teacher';
  const peopleOf = (m: Meeting) => Number(m.participant_count) || 0;
  const startsIn = (m: Meeting) => {
    const t = ms(m.scheduled_start);
    return Number.isFinite(t) && t > now ? t - now : null;
  };

  const dateBlock = (iso: string | null, muted = false) => (
    <div className={`ml-date${muted ? ' is-muted' : ''}`} aria-hidden>
      {iso ? (
        <>
          <span>{fmt(iso, { month: 'short' })}</span>
          <strong>{fmt(iso, { day: 'numeric' })}</strong>
          <em>{fmt(iso, { weekday: 'short' })}</em>
        </>
      ) : <strong>—</strong>}
    </div>
  );

  const statusPill = (m: Meeting) => {
    if (m.status === 'active') return <span className="ml-pill is-live"><i className="ml-pulse" /> Live</span>;
    if (m.status === 'waiting') return <span className="ml-pill is-waiting">Opening soon</span>;
    const start = ms(m.started_at || m.scheduled_start);
    if (Number.isFinite(start) && now >= start && m.status !== 'ended') {
      return <span className="ml-pill is-live"><i className="ml-pulse" /> Active</span>;
    }
    const left = startsIn(m);
    if (left !== null && left < 86400_000) return <span className="ml-pill is-soon">In {spanText(left)}</span>;
    return <span className="ml-pill">Scheduled</span>;
  };

  const actionsFor = (m: Meeting, onDark = false) => {
    const isHost = m.teacher_id === user?.id;
    const primary = onDark ? 'ml-btn-light' : undefined;
    const secondary = onDark ? 'ml-btn-ghost' : undefined;
    if (m.status === 'active') {
      return <Button type="primary" className={primary} icon={<VideoCameraOutlined />} onClick={() => open(m)}>{isHost ? 'Rejoin' : 'Join now'}</Button>;
    }
    if (m.status === 'waiting') {
      return isHost
        ? <Button type="primary" className={primary} onClick={() => open(m)}>Continue</Button>
        : <Tooltip title="Your teacher is getting ready — you'll join as soon as class starts"><Button type="primary" className={primary} onClick={() => open(m)}>Join</Button></Tooltip>;
    }
    const start = ms(m.started_at || m.scheduled_start);
    const hasStarted = Number.isFinite(start) && now >= start;
    if (hasStarted && m.status !== 'ended') {
      return isHost
        ? <Button type="primary" className={primary} icon={<VideoCameraOutlined />} onClick={() => handlePrepare(m)}>Start class</Button>
        : <Button type="primary" className={primary} icon={<VideoCameraOutlined />} onClick={() => open(m)}>Join class</Button>;
    }
    return isHost
      ? <Button type="primary" className={primary} icon={<VideoCameraOutlined />} onClick={() => handlePrepare(m)}>Start class</Button>
      : <Tooltip title="Check your camera and microphone before class"><Button className={secondary} onClick={() => open(m)}>Test devices</Button></Tooltip>;
  };

  const hostTools = (m: Meeting) => m.teacher_id === user?.id && (
    <>
      <Tooltip title="Share: link, meeting ID and passcode"><Button type="text" className="ml-icon-btn" icon={<LinkOutlined />} onClick={() => openShare(m)} aria-label="Share meeting" /></Tooltip>
      <Tooltip title="Delete"><Button type="text" danger className="ml-icon-btn" icon={<DeleteOutlined />} onClick={() => handleDelete(m)} aria-label="Delete meeting" /></Tooltip>
    </>
  );

  /* ═══════════ LOADING ═══════════ */
  if (loading) {
    return (
      <div className="ml" aria-busy="true">
        <div className="ml-header">
          <div>
            <Skeleton.Input active size="small" style={{ width: 90, height: 12 }} />
            <div style={{ marginTop: 10 }}><Skeleton.Input active style={{ width: 220, height: 24 }} /></div>
          </div>
        </div>
        <div className="ml-panel ml-pad"><Skeleton active title={{ width: '35%' }} paragraph={{ rows: 2 }} /></div>
        <div className="ml-panel ml-pad"><Skeleton active title={false} paragraph={{ rows: 6 }} /></div>
      </div>
    );
  }

  const stats = [
    { key: 'upcoming', label: 'Upcoming', value: String(view.upcoming.length), icon: <CalendarOutlined />, tone: 'blue' },
    { key: 'active', label: 'Active', value: String(view.active.length), icon: <VideoCameraOutlined />, tone: 'green' },
    { key: 'done', label: 'Completed', value: String(view.past.length), icon: <CheckCircleOutlined />, tone: 'slate' },
    { key: 'time', label: 'Class time', value: durationText(view.minutes), icon: <FieldTimeOutlined />, tone: 'amber' },
  ];

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#047857', fontSize: 13, borderRadius: 8 } }}>
      <div className="ml">
        {msgHolder}
        {modalHolder}

        {/* ── Header ── */}
        <header className="ml-header">
          <div>
            <div className="ml-overline">Live classes</div>
            <h1 className="ml-title">Live meetings</h1>
            <p className="ml-subtitle">
              {canManage ? 'Schedule, start and manage your live classes.' : 'Join your live classes and watch the recordings.'} Times in {tzLabel}.
            </p>
          </div>
          <div className="ml-header-actions">
            <Button icon={<span className="anticon">{Ic.hash}</span>} onClick={() => setJoinOpen(true)}>Join with ID</Button>
            {canManage && <Button icon={<TeamOutlined />} onClick={() => navigate('/app/meeting-attendance')}>Attendance</Button>}
            {canManage && <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>New meeting</Button>}
          </div>
        </header>

        {error && (
          <div className="ml-alert" role="alert">
            <div><strong>Couldn't load your meetings</strong><p>{error}</p></div>
            <Button size="small" onClick={() => { setLoading(true); fetchMeetings(); }}>Retry</Button>
          </div>
        )}

        {/* ── Live / next class ── */}
        {view.featured.map(m => {
          const isLive = m.status === 'active';
          const left = startsIn(m);
          const when = startOf(m);
          return (
            <article key={m.id} data-focus-id={m.id} className={`ml-hero${isLive ? ' is-live' : ''}`}>
              <div className="ml-hero-main">
                <div className="ml-hero-header">
                  <span className="ml-hero-over">
                    {isLive ? <><i className="ml-pulse" /> Live now</> : m.status === 'waiting' ? 'Opening soon' : 'Next class'}
                  </span>
                  {(isLive ? m.started_at : left !== null) ? (
                    <span className="ml-hero-countdown">
                      <ClockCircleOutlined />
                      <span>{isLive ? `Started ${spanText(now - ms(m.started_at))} ago` : `Starts in ${spanText(left || 0)}`}</span>
                    </span>
                  ) : null}
                </div>
                <h2 className="ml-hero-title">{m.title}</h2>
                {m.description && <p className="ml-hero-desc">{m.description}</p>}
                <div className="ml-hero-meta">
                  {when && <span><CalendarOutlined /> {dayLabel(when)} · {rangeOf(m)}</span>}
                  <span><UserOutlined /> {teacherOf(m)}</span>
                  {m.batch_name && <span><TeamOutlined /> {m.batch_name}</span>}
                  {isLive && <span><VideoCameraOutlined /> {peopleOf(m)} joined</span>}
                </div>
              </div>
              <div className="ml-hero-actions">
                {actionsFor(m, isLive)}
                {m.teacher_id === user?.id && (
                  <Tooltip title="Link, meeting ID and passcode">
                    <Button
                      className={isLive ? "ml-btn-ghost" : "ml-hero-btn-copy"}
                      icon={<LinkOutlined />}
                      onClick={() => openShare(m)}
                    >
                      Share
                    </Button>
                  </Tooltip>
                )}
              </div>
            </article>
          );
        })}

        {/* ── Key numbers ── */}
        <section className="ml-stats" aria-label="Overview">
          {stats.map(s => (
            <div key={s.key} className={`ml-stat ml-k-${s.tone}`}>
              <span className="ml-stat-icon">{s.icon}</span>
              <span className="ml-stat-text"><span>{s.label}</span><strong>{s.value}</strong></span>
            </div>
          ))}
        </section>

        {/* ── Lists ── */}
        <section className="ml-panel">
          <div className="ml-toolbar">
            <Segmented value={tab} onChange={v => { userSwitchedTab.current = true; setTab(v as Tab); }}
              options={[
                { value: 'upcoming', label: <span className="ml-seg">Upcoming <b>{view.upcoming.length}</b></span> },
                {
                  value: 'active',
                  label: (
                    <span className="ml-seg">
                      {view.active.length > 0 && <i className="ml-pulse" />} Active <b>{view.active.length}</b>
                    </span>
                  ),
                },
                { value: 'past', label: <span className="ml-seg">Past <b>{view.past.length}</b></span> },
                { value: 'recordings', label: <span className="ml-seg">Recordings</span> },
              ]} />
            {tab === 'recordings' && <span className="ml-toolbar-note">Recordings are kept for 30 days.</span>}
          </div>

          {tab === 'recordings' ? (
            <MeetingRecordings />
          ) : tab === 'active' ? (
            view.active.length === 0 ? (
              <div className="ml-empty">
                <span className="ml-empty-art"><VideoCameraOutlined /></span>
                <strong>No active classes</strong>
                <span>There are no live classes in session right now.</span>
                {canManage ? (
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>New meeting</Button>
                ) : view.upcoming.length > 0 ? (
                  <Button onClick={() => setTab('upcoming')}>See upcoming classes ({view.upcoming.length})</Button>
                ) : null}
              </div>
            ) : (
              <div className="ml-list">
                {view.active.map(m => (
                  <div key={m.id} data-focus-id={m.id} className={`ml-row is-${m.status === 'active' ? 'active' : 'waiting'}`}>
                    {dateBlock(whenOf(m))}
                    <div className="ml-row-body">
                      <div className="ml-row-title">
                        <span>{m.title}</span>
                        {m.is_locked && <Tooltip title="Locked — no new participants"><LockOutlined className="ml-lock" /></Tooltip>}
                        {m.my_role === 'guest' && <Tooltip title="The host admitted you to this class"><span className="ml-tag is-guest">Guest</span></Tooltip>}
                      </div>
                      <div className="ml-row-meta">
                        <span><ClockCircleOutlined /> {rangeOf(m) || 'No time set'}</span>
                        <span><UserOutlined /> {teacherOf(m)}</span>
                        {m.batch_name && <span><TeamOutlined /> {m.batch_name}</span>}
                        {m.teacher_id === user?.id && (
                          <Tooltip title="Copy meeting ID">
                            <button type="button" className="ml-code" onClick={() => copyCode(m)} aria-label={`Copy meeting ID ${codeOf(m)}`}>
                              {Ic.hash}<span>{codeOf(m)}</span>
                            </button>
                          </Tooltip>
                        )}
                        {m.status === 'active' && <span><VideoCameraOutlined /> {peopleOf(m)} joined</span>}
                      </div>
                    </div>
                    <div className="ml-row-side">
                      {statusPill(m)}
                      <div className="ml-row-actions">{actionsFor(m)}{hostTools(m)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : tab === 'upcoming' ? (
            view.upcoming.length === 0 ? (
              <div className="ml-empty">
                <span className="ml-empty-art"><CalendarOutlined /></span>
                <strong>No upcoming classes</strong>
                <span>{canManage ? 'Create a meeting to schedule your next live class.' : "New live classes from your teachers will show up here."}</span>
                {canManage
                  ? <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>New meeting</Button>
                  : view.active.length > 0 ? <Button onClick={() => setTab('active')}>See active classes ({view.active.length})</Button>
                  : view.past.length > 0 && <Button onClick={() => setTab('past')}>See past classes</Button>}
              </div>
            ) : (
              <div className="ml-list">
                {view.upcoming.map(m => (
                  <div key={m.id} data-focus-id={m.id} className={`ml-row is-${m.status}`}>
                    {dateBlock(whenOf(m))}
                    <div className="ml-row-body">
                      <div className="ml-row-title">
                        <span>{m.title}</span>
                        {m.is_locked && <Tooltip title="Locked — no new participants"><LockOutlined className="ml-lock" /></Tooltip>}
                        {m.my_role === 'guest' && <Tooltip title="The host admitted you to this class"><span className="ml-tag is-guest">Guest</span></Tooltip>}
                      </div>
                      <div className="ml-row-meta">
                        <span><ClockCircleOutlined /> {rangeOf(m) || 'No time set'}</span>
                        <span><UserOutlined /> {teacherOf(m)}</span>
                        {m.batch_name && <span><TeamOutlined /> {m.batch_name}</span>}
                        {m.teacher_id === user?.id && (
                          <Tooltip title="Copy meeting ID">
                            <button type="button" className="ml-code" onClick={() => copyCode(m)} aria-label={`Copy meeting ID ${codeOf(m)}`}>
                              {Ic.hash}<span>{codeOf(m)}</span>
                            </button>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                    <div className="ml-row-side">
                      {statusPill(m)}
                      <div className="ml-row-actions">{actionsFor(m)}{hostTools(m)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : view.past.length === 0 ? (
            <div className="ml-empty">
              <span className="ml-empty-art"><HistoryOutlined /></span>
              <strong>No past classes yet</strong>
              <span>Classes appear here once they end.</span>
            </div>
          ) : (
            <div className="ml-list">
              {view.past.slice(0, pastLimit).map(m => {
                const n = peopleOf(m);
                return (
                  <div key={m.id} data-focus-id={m.id} className="ml-row is-ended">
                    {dateBlock(whenOf(m), true)}
                    <div className="ml-row-body">
                      <div className="ml-row-title"><span>{m.title}</span></div>
                      <div className="ml-row-meta">
                        {rangeOf(m) && <span><ClockCircleOutlined /> {rangeOf(m)}</span>}
                        <span><HistoryOutlined /> {durationText(minutesBetween(m.started_at, m.ended_at))}</span>
                        <span><TeamOutlined /> {n} {n === 1 ? 'participant' : 'participants'}</span>
                        {m.batch_name && <span>{m.batch_name}</span>}
                      </div>
                    </div>
                    <div className="ml-row-side"><span className="ml-pill is-ended">Ended</span></div>
                  </div>
                );
              })}
              {view.past.length > pastLimit && (
                <div className="ml-more">
                  <Button onClick={() => setPastLimit(l => l + PAST_PAGE)}>Show {Math.min(PAST_PAGE, view.past.length - pastLimit)} more</Button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* ── Create meeting ── */}
      <Modal open={createOpen} onCancel={closeCreate} footer={null} width={540} centered className="ml-modal">
        <div className="ml-md">
          <header className="ml-md-head">
            <span className="ml-md-icon"><VideoCameraOutlined /></span>
            <div>
              <h3>New live meeting</h3>
              <p>Schedule a live class for your students.</p>
            </div>
          </header>
          <Form form={form} layout="vertical" requiredMark={false} className="ml-md-body">
            <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Give the meeting a title' }]}>
              <Input placeholder="e.g. French grammar — week 5" maxLength={120} />
            </Form.Item>
            <Form.Item name="description" label={<>Description <span className="ml-optional">optional</span></>}>
              <Input.TextArea placeholder="What will you cover in this class?" autoSize={{ minRows: 2, maxRows: 4 }} maxLength={500} />
            </Form.Item>
            <Form.Item
              name="batch_id"
              label="Batch"
              rules={[{ required: true, message: 'Please select a batch' }]}
            >
              <Select placeholder="Select a batch" showSearch optionFilterProp="label"
                options={batches.map(b => ({ value: b.id, label: b.name }))} />
            </Form.Item>
            <Form.Item
              name="scheduled_time"
              label="Schedule"
              rules={[{ required: true, message: 'Please select the start and end time' }]}
            >
              <DatePicker.RangePicker showTime={{ format: 'HH:mm', minuteStep: 5 }} format="MMM D, YYYY HH:mm"
                style={{ width: '100%' }} placeholder={['Starts', 'Ends']} />
            </Form.Item>
            <div className="ml-md-note">
              <ClockCircleOutlined />
              <span>Times use your browser's timezone (<strong>{browserTz}</strong>). Each student sees them in their own timezone.</span>
            </div>
            <div className="ml-md-note is-green">
              <TeamOutlined />
              <span>Students of the batch join directly. The meeting gets its own ID and passcode: anyone else enters them, then waits in the lobby until you admit them.</span>
            </div>
          </Form>
          <footer className="ml-md-foot">
            <Button onClick={closeCreate}>Cancel</Button>
            <Button type="primary" icon={<VideoCameraOutlined />} loading={creating} onClick={handleCreate}>Create meeting</Button>
          </footer>
        </div>
      </Modal>

      <JoinWithId open={joinOpen} onClose={() => setJoinOpen(false)} apiCall={apiCall} />
      <MeetingShare
        open={!!share}
        meeting={share?.meeting || null}
        created={share?.created}
        isHost
        apiCall={apiCall}
        onClose={() => setShare(null)}
        onPasscodeChange={p => {
          const id = share?.meeting.id;
          setMeetings(prev => prev.map(m => (m.id === id ? { ...m, passcode: p } : m)));
        }}
      />
    </ConfigProvider>
  );
};

export default MeetingList;
