import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button, ConfigProvider, DatePicker, Drawer, Form, Input, Modal, Radio, Segmented, Select, Spin, Tag, Tooltip, message,
} from 'antd';
import {
  CalendarOutlined, ClearOutlined, ClockCircleOutlined, CopyOutlined, FilterOutlined, LeftOutlined, LinkOutlined, LockOutlined,
  MailOutlined, PlusOutlined, ReloadOutlined, RightOutlined, TeamOutlined, UserOutlined, VideoCameraOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { useAuth } from '../../contexts/AuthContext';
import useResponsive from '../../hooks/useResponsive';
import { acquireSocket, releaseSocket } from '../../utils/realtime';
import { detectBrowserTimezone, formatPlain, timezoneLabel } from '../../utils/timezone';
import './AdminCalendar.css';

interface Invitee { email: string; name?: string | null; notified_at?: string | null; }

interface CalendarMeeting {
  id: number;
  code: string;
  room_name: string;
  title: string;
  description?: string | null;
  status: 'scheduled' | 'waiting' | 'active' | 'ended';
  meeting_kind: 'class' | 'demo' | 'admin' | 'public';
  is_public: boolean;
  require_approval: boolean;
  scheduled_start: string | null;
  scheduled_end: string | null;
  started_at?: string | null;
  teacher_id: number;
  teacher_first_name?: string;
  teacher_last_name?: string;
  teacher_email?: string;
  teacher_role?: string;
  batch_name?: string | null;
  demo_request_id?: number | null;
  demo_full_name?: string | null;
  demo_email?: string | null;
  demo_country?: string | null;
  passcode?: string | null;
  public_link?: string | null;
  invitees?: Invitee[];
}

interface HostOption { id: number; first_name: string; last_name: string; email: string; role: string; is_active?: boolean; }
type HostRoleScope = 'all' | 'teacher' | 'admin';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const hostFullName = (first?: string, last?: string, fallback = 'Host') =>
  `${first || ''} ${last || ''}`.trim() || fallback;

const AdminCalendar: React.FC = () => {
  const { apiCall, user } = useAuth();
  const navigate = useNavigate();
  const r = useResponsive();
  const [msg, msgHolder] = message.useMessage();
  const tz = user?.timezone;
  const tzLabel = timezoneLabel(tz);

  const [cursor, setCursor] = useState<Dayjs>(() => dayjs().startOf('month'));
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');
  const [kindFilter, setKindFilter] = useState<string>('all');
  const [hostRoleFilter, setHostRoleFilter] = useState<HostRoleScope>('all');
  const [hostIdFilter, setHostIdFilter] = useState<number | null>(null);
  const [events, setEvents] = useState<CalendarMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CalendarMeeting | null>(null);
  const [dayModal, setDayModal] = useState<{ label: string; items: CalendarMeeting[] } | null>(null);
  const [revealPass, setRevealPass] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [hosts, setHosts] = useState<HostOption[]>([]);
  const [form] = Form.useForm();

  const fetchCalendar = useCallback(async () => {
    setLoading(true);
    try {
      const from = cursor.startOf('month').subtract(7, 'day').toISOString();
      const to = cursor.endOf('month').add(14, 'day').toISOString();
      const params = new URLSearchParams({ from, to });
      if (kindFilter !== 'all') params.set('kind', kindFilter);
      if (hostIdFilter != null) {
        params.set('host_id', String(hostIdFilter));
      } else if (hostRoleFilter !== 'all') {
        params.set('host_role', hostRoleFilter);
      }
      const resp = await apiCall(`/meetings/admin-calendar?${params.toString()}`);
      const d = await resp.json().catch(() => ({}));
      if (resp.ok && Array.isArray(d.events)) {
        setEvents(d.events);
        setSelected(cur => (cur ? d.events.find((e: CalendarMeeting) => e.id === cur.id) || cur : cur));
      }
      if (resp.ok && Array.isArray(d.hosts) && d.hosts.length > 0) {
        setHosts(d.hosts);
      }
    } catch {
      msg.error('Could not load admin calendar');
    } finally {
      setLoading(false);
    }
  }, [apiCall, cursor, kindFilter, hostIdFilter, hostRoleFilter, msg]);

  useEffect(() => { fetchCalendar(); }, [fetchCalendar]);

  useEffect(() => {
    const s = acquireSocket();
    const reload = () => fetchCalendar();
    s.on('meeting:created', reload);
    s.on('meeting:started', reload);
    s.on('meeting:ended', reload);
    return () => {
      s.off('meeting:created', reload);
      s.off('meeting:started', reload);
      s.off('meeting:ended', reload);
      releaseSocket();
    };
  }, [fetchCalendar]);

  const adminHosts = useMemo(() => hosts.filter(h => h.role === 'admin'), [hosts]);
  const teacherHosts = useMemo(() => hosts.filter(h => h.role === 'teacher'), [hosts]);

  const hostSelectOptions = useMemo(() => {
    const fmt = (h: HostOption) => ({
      value: h.id,
      label: `${hostFullName(h.first_name, h.last_name, h.email)} (${h.role === 'admin' ? 'Admin' : 'Teacher'})`,
      email: h.email,
      role: h.role,
    });
    if (hostRoleFilter === 'teacher') {
      return teacherHosts.map(fmt);
    }
    if (hostRoleFilter === 'admin') {
      return adminHosts.map(fmt);
    }
    const groups: { label: string; options: ReturnType<typeof fmt>[] }[] = [];
    if (teacherHosts.length > 0) {
      groups.push({ label: `Teachers (${teacherHosts.length})`, options: teacherHosts.map(fmt) });
    }
    if (adminHosts.length > 0) {
      groups.push({ label: `Admins (${adminHosts.length})`, options: adminHosts.map(fmt) });
    }
    return groups;
  }, [adminHosts, teacherHosts, hostRoleFilter]);

  const activeHostObj = useMemo(
    () => (hostIdFilter != null ? hosts.find(h => h.id === hostIdFilter) || null : null),
    [hostIdFilter, hosts],
  );

  const hasActiveFilter = kindFilter !== 'all' || hostRoleFilter !== 'all' || hostIdFilter !== null;

  const handleHostRoleChange = (nextRole: HostRoleScope) => {
    setHostRoleFilter(nextRole);
    if (hostIdFilter != null && nextRole !== 'all') {
      const cur = hosts.find(h => h.id === hostIdFilter);
      if (!cur || cur.role !== nextRole) {
        setHostIdFilter(null);
      }
    }
  };

  const resetAllFilters = () => {
    setKindFilter('all');
    setHostRoleFilter('all');
    setHostIdFilter(null);
  };

  const monthDays = useMemo(() => {
    const startOfMonth = cursor.startOf('month');
    const startGrid = startOfMonth.subtract((startOfMonth.day() + 6) % 7, 'day'); // Monday start
    return Array.from({ length: 42 }, (_, i) => startGrid.add(i, 'day'));
  }, [cursor]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarMeeting[]>();
    for (const ev of events) {
      const refIso = ev.scheduled_start || ev.started_at;
      if (!refIso) continue;
      const dayKey = formatPlain(refIso, tz, { year: 'numeric', month: '2-digit', day: '2-digit' });
      // Normalized YYYY-MM-DD in admin timezone
      const d = new Date(refIso);
      const parts = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: tz || undefined }).format(d);
      const k = parts || dayKey;
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(ev);
    }
    return map;
  }, [events, tz]);

  const copyText = (text: string, what: string) => {
    navigator.clipboard.writeText(text).then(() => msg.success(`${what} copied`)).catch(() => msg.info(text));
  };

  const openScheduleModal = () => {
    form.resetFields();
    form.setFieldsValue({
      require_approval: true,
      host_id: hostIdFilter || user?.id,
      scheduled_time: [dayjs().add(1, 'hour').startOf('hour'), dayjs().add(2, 'hour').startOf('hour')],
    });
    setCreateOpen(true);
  };

  const handleSchedule = async () => {
    let values: {
      title: string;
      description?: string;
      invitee_emails?: string[];
      require_approval?: boolean;
      host_id?: number;
      scheduled_time: [Dayjs, Dayjs];
    };
    try { values = await form.validateFields(); } catch { return; }
    const rawEmails: string[] = Array.isArray(values.invitee_emails) ? values.invitee_emails : [];
    const invalid = rawEmails.filter(e => !EMAIL_RE.test(String(e).trim()));
    if (invalid.length > 0) {
      msg.error(`Invalid email address: ${invalid[0]}`);
      return;
    }

    setCreating(true);
    try {
      const resp = await apiCall('/meetings', {
        method: 'POST',
        body: JSON.stringify({
          title: values.title,
          description: values.description || null,
          is_public: true,
          meeting_kind: 'admin',
          require_approval: values.require_approval !== false,
          host_id: values.host_id || user?.id,
          host_timezone: tz || detectBrowserTimezone(),
          invitee_emails: rawEmails,
          scheduled_start: values.scheduled_time[0].toISOString(),
          scheduled_end: values.scheduled_time[1].toISOString(),
        }),
      });
      const d = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        msg.error(d.error || 'Could not schedule meeting');
        return;
      }
      msg.success(rawEmails.length > 0
        ? `Meeting scheduled. Invitation email sent to ${rawEmails.length} recipient(s)`
        : 'Meeting scheduled on Admin calendar');
      setCreateOpen(false);
      await fetchCalendar();
      setSelected(d);
    } catch {
      msg.error('Could not schedule meeting');
    } finally {
      setCreating(false);
    }
  };

  const kindTag = (k: string) => {
    if (k === 'demo') return <Tag color="purple">Demo</Tag>;
    if (k === 'admin' || k === 'public') return <Tag color="green">External / Public</Tag>;
    return <Tag color="blue">Class</Tag>;
  };

  const hostRoleTag = (role?: string) => {
    if (role === 'admin') return <Tag color="geekblue">Admin</Tag>;
    if (role === 'teacher') return <Tag color="cyan">Teacher</Tag>;
    return null;
  };

  const statusTag = (s: string) => {
    if (s === 'active') return <Tag color="green">Live</Tag>;
    if (s === 'waiting') return <Tag color="gold">Opening</Tag>;
    if (s === 'ended') return <Tag>Ended</Tag>;
    return <Tag color="geekblue">Scheduled</Tag>;
  };

  const showAgenda = r.isMobile || viewMode === 'agenda';

  const filterSubtitle = activeHostObj
    ? `Showing ${activeHostObj.role === 'admin' ? 'admin' : 'teacher'} calendar for ${hostFullName(activeHostObj.first_name, activeHostObj.last_name, activeHostObj.email)} in ${tzLabel}.`
    : hostRoleFilter === 'teacher'
      ? `Showing all teachers' scheduled sessions in ${tzLabel}.`
      : hostRoleFilter === 'admin'
        ? `Showing all admins' scheduled sessions in ${tzLabel}.`
        : `All demo meetings, external invitations, and scheduled live sessions in ${tzLabel}.`;

  const scheduleHostOptions = useMemo(() => {
    const activeOnly = hosts.filter(h => h.is_active !== false);
    const admins = activeOnly.filter(h => h.role === 'admin');
    const teachers = activeOnly.filter(h => h.role === 'teacher');
    const groups: { label: string; options: { value: number; label: string }[] }[] = [];
    if (admins.length > 0) {
      groups.push({
        label: 'Admins',
        options: admins.map(h => ({ value: h.id, label: `${hostFullName(h.first_name, h.last_name, h.email)} (Admin) · ${h.email}` })),
      });
    }
    if (teachers.length > 0) {
      groups.push({
        label: 'Teachers',
        options: teachers.map(h => ({ value: h.id, label: `${hostFullName(h.first_name, h.last_name, h.email)} (Teacher) · ${h.email}` })),
      });
    }
    return groups;
  }, [hosts]);

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#4f46e5', borderRadius: 8, fontSize: 13 } }}>
      <div className="ac-page">
        {msgHolder}

        <header className="ac-header">
          <div>
            <div className="ac-overline">Admin console · Scheduling</div>
            <h1 className="ac-title">Admin calendar</h1>
            <p className="ac-subtitle">{filterSubtitle}</p>
          </div>
          <div className="ac-header-actions">
            <Button icon={<ReloadOutlined />} onClick={fetchCalendar} loading={loading}>Refresh</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openScheduleModal}>Schedule meeting</Button>
          </div>
        </header>

        <section className="ac-toolbar">
          <div className="ac-toolbar-row">
            <div className="ac-nav">
              <Button icon={<LeftOutlined />} onClick={() => setCursor(c => c.subtract(1, 'month'))} aria-label="Previous month" />
              <Button onClick={() => setCursor(dayjs().startOf('month'))}>Today</Button>
              <span className="ac-month-label">{cursor.format('MMMM YYYY')}</span>
              <Button icon={<RightOutlined />} onClick={() => setCursor(c => c.add(1, 'month'))} aria-label="Next month" />
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <Segmented
                value={kindFilter}
                onChange={v => setKindFilter(String(v))}
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'demo', label: 'Demos' },
                  { value: 'admin', label: 'Public / External' },
                  { value: 'class', label: 'Classes' },
                ]}
              />
              {!r.isMobile && (
                <Segmented
                  value={viewMode}
                  onChange={v => setViewMode(v as 'month' | 'agenda')}
                  options={[
                    { value: 'month', label: 'Month' },
                    { value: 'agenda', label: 'Agenda' },
                  ]}
                />
              )}
            </div>
          </div>

          <div className="ac-filter-row">
            <div className="ac-host-controls">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: '#475569' }}>
                <FilterOutlined />
                Host
              </span>
              <Segmented
                value={hostRoleFilter}
                onChange={v => handleHostRoleChange(v as HostRoleScope)}
                options={[
                  { value: 'all', label: 'All hosts' },
                  { value: 'teacher', label: `Teachers (${teacherHosts.length})` },
                  { value: 'admin', label: `Admins (${adminHosts.length})` },
                ]}
              />
              <Select<number>
                allowClear
                showSearch
                optionFilterProp="label"
                value={hostIdFilter ?? undefined}
                onChange={v => setHostIdFilter(v ?? null)}
                options={hostSelectOptions}
                placeholder={
                  hostRoleFilter === 'teacher'
                    ? 'All teachers · select a specific teacher'
                    : hostRoleFilter === 'admin'
                      ? 'All admins · select a specific admin'
                      : 'Filter by specific teacher or admin...'
                }
                style={{ minWidth: r.isMobile ? '100%' : 260, maxWidth: 340, flex: '1 1 240px' }}
              />
            </div>

            <div className="ac-filter-summary">
              <span className="ac-count-pill">
                {events.length} {events.length === 1 ? 'session' : 'sessions'}
              </span>
              {hasActiveFilter && (
                <Button size="small" icon={<ClearOutlined />} onClick={resetAllFilters}>
                  Reset filters
                </Button>
              )}
            </div>
          </div>
        </section>

        <section className="ac-panel">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '64px 0' }}><Spin size="large" /></div>
          ) : showAgenda ? (
            <div className="ac-agenda">
              {events.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 16px', color: '#64748b' }}>
                  <CalendarOutlined style={{ fontSize: 30, marginBottom: 8, display: 'block' }} />
                  <strong>
                    {hasActiveFilter ? 'No meetings match the selected filters in this window' : 'No meetings scheduled in this window'}
                  </strong>
                  {hasActiveFilter && (
                    <div style={{ marginTop: 10 }}>
                      <Button size="small" onClick={resetAllFilters}>Show all hosts &amp; sessions</Button>
                    </div>
                  )}
                </div>
              ) : events.map(ev => (
                <div key={ev.id} className="ac-agenda-row" onClick={() => { setRevealPass(false); setSelected(ev); }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <strong>{ev.title}</strong>
                      {kindTag(ev.meeting_kind)}
                      {statusTag(ev.status)}
                    </div>
                    <div style={{ fontSize: 12.5, color: '#64748b', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                      {ev.scheduled_start && (
                        <span><ClockCircleOutlined /> {formatPlain(ev.scheduled_start, tz, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                      )}
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <UserOutlined />
                        {hostFullName(ev.teacher_first_name, ev.teacher_last_name)}
                        {hostRoleTag(ev.teacher_role)}
                      </span>
                      {(ev.invitees?.length || 0) > 0 && <span><MailOutlined /> {ev.invitees!.length} invited</span>}
                    </div>
                  </div>
                  <Button size="small" type="primary" onClick={e => { e.stopPropagation(); navigate(`/app/meeting/${ev.code || ev.room_name}`); }}>
                    Open
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="ac-weekdays">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                  <div key={d} className="ac-weekday">{d}</div>
                ))}
              </div>
              <div className="ac-grid">
                {monthDays.map(day => {
                  const key = day.format('YYYY-MM-DD');
                  const dayEvents = eventsByDay.get(key) || [];
                  const isToday = day.isSame(dayjs(), 'day');
                  const isOut = !day.isSame(cursor, 'month');
                  return (
                    <div key={key} className={`ac-cell${isOut ? ' is-out' : ''}${isToday ? ' is-today' : ''}`}>
                      <span className="ac-day-num">{day.date()}</span>
                      {dayEvents.slice(0, 3).map(ev => {
                        const hostShort = ev.teacher_first_name || hostFullName(ev.teacher_first_name, ev.teacher_last_name, '');
                        return (
                          <button
                            key={ev.id}
                            type="button"
                            className={`ac-event is-${ev.meeting_kind || 'class'}`}
                            onClick={() => { setRevealPass(false); setSelected(ev); }}
                          >
                            <strong>{ev.title}</strong>
                            <span className="ac-event-meta">
                              <span>{ev.scheduled_start ? formatPlain(ev.scheduled_start, tz, { hour: 'numeric', minute: '2-digit', hour12: true }) : ''}</span>
                              {hostShort && <span className="ac-event-host">{hostShort}</span>}
                            </span>
                          </button>
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <button
                          type="button"
                          style={{ border: 'none', background: 'transparent', fontSize: 11, color: '#4f46e5', textAlign: 'left', cursor: 'pointer', fontWeight: 600 }}
                          onClick={() => setDayModal({ label: day.format('dddd, MMMM D, YYYY'), items: dayEvents })}
                        >
                          +{dayEvents.length - 3} more
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>

        {/* Busy-day overflow modal */}
        <Modal
          open={!!dayModal}
          onCancel={() => setDayModal(null)}
          footer={null}
          width={520}
          centered
          title={dayModal ? `${dayModal.label} (${dayModal.items.length} sessions)` : ''}
        >
          {dayModal && (
            <div className="ac-day-modal-list">
              {dayModal.items.map(ev => (
                <div
                  key={ev.id}
                  className="ac-agenda-row"
                  onClick={() => {
                    setDayModal(null);
                    setRevealPass(false);
                    setSelected(ev);
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 3 }}>
                      <strong>{ev.title}</strong>
                      {kindTag(ev.meeting_kind)}
                      {statusTag(ev.status)}
                    </div>
                    <div style={{ fontSize: 12.5, color: '#64748b', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                      {ev.scheduled_start && (
                        <span><ClockCircleOutlined /> {formatPlain(ev.scheduled_start, tz, { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                      )}
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <UserOutlined />
                        {hostFullName(ev.teacher_first_name, ev.teacher_last_name)}
                        {hostRoleTag(ev.teacher_role)}
                      </span>
                    </div>
                  </div>
                  <Button size="small" type="primary" onClick={e => { e.stopPropagation(); navigate(`/app/meeting/${ev.code || ev.room_name}`); }}>
                    Open
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Modal>

        {/* Event detail drawer */}
        <Drawer
          open={!!selected}
          onClose={() => setSelected(null)}
          width={r.isMobile ? '100%' : 440}
          title={selected?.title || 'Meeting details'}
          extra={selected && statusTag(selected.status)}
        >
          {selected && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {kindTag(selected.meeting_kind)}
                {selected.is_public && (
                  <Tag icon={<LockOutlined />} color={selected.require_approval ? 'orange' : 'cyan'}>
                    {selected.require_approval ? 'Host approval required' : 'Direct link entry'}
                  </Tag>
                )}
              </div>

              {selected.scheduled_start && (
                <div>
                  <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>When ({tzLabel})</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginTop: 2 }}>
                    {formatPlain(selected.scheduled_start, tz, { weekday: 'long', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                    {selected.scheduled_end ? ` – ${formatPlain(selected.scheduled_end, tz, { hour: 'numeric', minute: '2-digit', hour12: true })}` : ''}
                  </div>
                </div>
              )}

              <div>
                <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Host</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>
                    {hostFullName(selected.teacher_first_name, selected.teacher_last_name, 'Admin')}
                  </span>
                  {hostRoleTag(selected.teacher_role)}
                  {selected.teacher_id > 0 && hostIdFilter !== selected.teacher_id && (
                    <Button
                      size="small"
                      type="link"
                      style={{ paddingInline: 4 }}
                      onClick={() => {
                        setHostRoleFilter(selected.teacher_role === 'admin' ? 'admin' : selected.teacher_role === 'teacher' ? 'teacher' : 'all');
                        setHostIdFilter(selected.teacher_id);
                        setSelected(null);
                      }}
                    >
                      Filter calendar
                    </Button>
                  )}
                </div>
                {selected.teacher_email && (
                  <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 2 }}>{selected.teacher_email}</div>
                )}
              </div>

              {selected.demo_full_name && (
                <div style={{ padding: 12, borderRadius: 10, background: '#f5f3ff', border: '1px solid #ddd6fe' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#5b21b6' }}>Demo prospect</div>
                  <div style={{ fontWeight: 700, marginTop: 2 }}>{selected.demo_full_name}</div>
                  <div style={{ fontSize: 12.5, color: '#475569' }}>{selected.demo_email}{selected.demo_country ? ` · ${selected.demo_country}` : ''}</div>
                </div>
              )}

              <div className="ac-cred-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>Meeting ID</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <code style={{ fontWeight: 700 }}>{selected.code || selected.room_name}</code>
                    <Tooltip title="Copy ID">
                      <Button size="small" icon={<CopyOutlined />} onClick={() => copyText(selected.code || selected.room_name, 'Meeting ID')} />
                    </Tooltip>
                  </div>
                </div>
                {selected.passcode && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#64748b' }}>Passcode</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <code style={{ fontWeight: 700 }}>{revealPass ? selected.passcode : '••••••'}</code>
                      <Button size="small" onClick={() => setRevealPass(v => !v)}>{revealPass ? 'Hide' : 'Show'}</Button>
                      <Button size="small" icon={<CopyOutlined />} onClick={() => copyText(selected.passcode!, 'Passcode')} />
                    </div>
                  </div>
                )}
                {selected.public_link && (
                  <Button
                    icon={<LinkOutlined />}
                    block
                    onClick={() => copyText(selected.public_link!, 'Public meeting link')}
                  >
                    Copy public join link
                  </Button>
                )}
              </div>

              {(selected.invitees?.length || 0) > 0 && (
                <div>
                  <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: 6 }}>
                    Invited emails ({selected.invitees!.length})
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {selected.invitees!.map(inv => (
                      <Tag key={inv.email} color="geekblue">{inv.email}</Tag>
                    ))}
                  </div>
                </div>
              )}

              {selected.description && (
                <div>
                  <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Notes</div>
                  <p style={{ margin: '4px 0 0', fontSize: 13.5, color: '#334155' }}>{selected.description}</p>
                </div>
              )}

              <Button
                type="primary"
                size="large"
                block
                icon={<VideoCameraOutlined />}
                disabled={selected.status === 'ended'}
                onClick={() => navigate(`/app/meeting/${selected.code || selected.room_name}`)}
              >
                {selected.status === 'active' ? 'Join live meeting' : selected.status === 'ended' ? 'Meeting ended' : 'Start / open meeting'}
              </Button>
            </div>
          )}
        </Drawer>

        {/* Quick schedule external / multi-email meeting modal */}
        <Modal
          open={createOpen}
          onCancel={() => !creating && setCreateOpen(false)}
          footer={null}
          width={560}
          centered
          title="Schedule meeting & email invitees"
        >
          <Form form={form} layout="vertical" requiredMark={false} style={{ marginTop: 12 }}>
            <Form.Item name="title" label="Meeting title" rules={[{ required: true, message: 'Enter a meeting title' }]}>
              <Input placeholder="e.g. Onboarding call, French Demo, Partner sync…" maxLength={160} />
            </Form.Item>
            <Form.Item name="scheduled_time" label="Date & time" rules={[{ required: true, message: 'Pick start and end time' }]}>
              <DatePicker.RangePicker showTime={{ format: 'HH:mm', minuteStep: 5 }} format="MMM D, YYYY HH:mm" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="host_id" label="Host">
              <Select
                showSearch
                optionFilterProp="label"
                options={scheduleHostOptions}
              />
            </Form.Item>
            <Form.Item
              name="invitee_emails"
              label="Invite emails (optional, one or many)"
              extra="Every email added receives an automatic invitation with the meeting link, ID, and passcode."
            >
              <Select
                mode="tags"
                tokenSeparators={[',', ';', ' ', '\n']}
                placeholder="Type or paste email addresses and press Enter"
                open={false}
              />
            </Form.Item>
            <Form.Item name="require_approval" label="Joining policy">
              <Radio.Group style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Radio value={true}>
                  <strong>Require host approval:</strong> guests wait in the lobby until you admit them
                </Radio>
                <Radio value={false}>
                  <strong>Anyone with the link or ID &amp; passcode can join</strong> directly once started
                </Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item name="description" label="Notes (optional)">
              <Input.TextArea rows={2} maxLength={1000} placeholder="Agenda or instructions included in the invitation email…" />
            </Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button onClick={() => setCreateOpen(false)} disabled={creating}>Cancel</Button>
              <Button type="primary" loading={creating} icon={<TeamOutlined />} onClick={handleSchedule}>
                Schedule &amp; send invites
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default AdminCalendar;
