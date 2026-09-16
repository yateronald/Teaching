import React, { useCallback, useEffect, useState } from 'react';
import { Button, ConfigProvider, DatePicker, Drawer, Dropdown, Form, Input, Modal, Select, Skeleton, Table, Tooltip, message } from 'antd';
import type { MenuProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  CalendarOutlined, CheckCircleFilled, CheckOutlined, ClockCircleOutlined, CloseOutlined, CopyOutlined, DeleteOutlined,
  DownloadOutlined, EditOutlined, EnvironmentOutlined, ExclamationCircleFilled, LinkOutlined, MailOutlined, MoreOutlined,
  PhoneOutlined, ReloadOutlined, RightOutlined, SearchOutlined, StopOutlined, TeamOutlined, UserOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { useAuth } from '../../contexts/AuthContext';
import useResponsive from '../../hooks/useResponsive';
import { headerHeight } from '../Layout/layoutMetrics';
import { formatPlain, timezoneLabel } from '../../utils/timezone';
import './DemoRequests.css';

/* ══════════════════════════════════════════
   DEMO REQUESTS — lead pipeline: New → Contacted → Scheduled → Completed (or Cancelled)
══════════════════════════════════════════ */

type Status = 'new' | 'contacted' | 'demo_scheduled' | 'completed' | 'cancelled';

interface DemoRequest {
  id: number;
  full_name: string;
  email: string;
  phone?: string | null;
  country?: string | null;
  has_previous_experience?: boolean | string | number | null;
  current_level?: string | null;
  previous_study_method?: string | null;
  interested_level?: string | null;
  learning_goals?: string | null;
  expectations?: string | null;
  expected_start_time?: string | null;
  preferred_schedule?: string | null;
  timezone?: string | null;
  status: Status;
  notes?: string | null;
  contacted_at?: string | null;
  demo_scheduled_at?: string | null;
  created_at: string;
  updated_at?: string | null;
  teacher_id?: number | null;
  meeting_link?: string | null;
  teacher_first_name?: string | null;
  teacher_last_name?: string | null;
  teacher_email?: string | null;
}
interface Stats { total: number; new_requests: number; contacted: number; demo_scheduled: number; completed: number; cancelled: number; this_week: number; this_month: number; }
interface Teacher { id: number; first_name: string; last_name: string; email: string; }

const STATUS: Record<Status, { label: string; stat: keyof Stats }> = {
  new: { label: 'New', stat: 'new_requests' },
  contacted: { label: 'Contacted', stat: 'contacted' },
  demo_scheduled: { label: 'Scheduled', stat: 'demo_scheduled' },
  completed: { label: 'Completed', stat: 'completed' },
  cancelled: { label: 'Cancelled', stat: 'cancelled' },
};
const PIPELINE: Status[] = ['new', 'contacted', 'demo_scheduled', 'completed'];
const LEVELS = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const EMPTY_STATS: Stats = { total: 0, new_requests: 0, contacted: 0, demo_scheduled: 0, completed: 0, cancelled: 0, this_week: 0, this_month: 0 };

const hasExperience = (v: DemoRequest['has_previous_experience']) => v === true || v === 1 || v === 'yes' || v === 'true' || v === '1';
const initialsOf = (name: string) => {
  const p = (name || '?').trim().split(/\s+/).filter(Boolean);
  return ((p[0]?.[0] || '?') + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase();
};
const daysAgo = (iso?: string | null) => (iso ? Math.floor((Date.now() - new Date(iso).getTime()) / 86400_000) : 0);
const agoText = (iso?: string | null) => {
  if (!iso) return '';
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return mins <= 1 ? 'just now' : `${mins} min ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} ${d === 1 ? 'day' : 'days'} ago`;
  const mo = Math.floor(d / 30);
  return `${mo} ${mo === 1 ? 'month' : 'months'} ago`;
};
const validTz = (tz?: string | null) => {
  if (!tz) return null;
  try { new Intl.DateTimeFormat('en-US', { timeZone: tz }).format(); return tz; } catch { return null; }
};
const inTz = (d: Date | string, tz: string, opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-US', { ...opts, timeZone: tz }).format(new Date(d));
const n = (v: unknown) => Number(v) || 0;

const DemoRequests: React.FC = () => {
  const { apiCall, user } = useAuth();
  const r = useResponsive();
  const [msg, msgHolder] = message.useMessage();
  const [modal, modalHolder] = Modal.useModal();
  const [scheduleForm] = Form.useForm();
  const tz = user?.timezone;

  const [items, setItems] = useState<DemoRequest[]>([]);
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState<Status | ''>('');
  const [level, setLevel] = useState<string | undefined>();
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [debounced, setDebounced] = useState({ search: '', country: '' });
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const [drawer, setDrawer] = useState<DemoRequest | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [scheduleFor, setScheduleFor] = useState<DemoRequest | null>(null);
  const [scheduling, setScheduling] = useState(false);
  const [statusFor, setStatusFor] = useState<DemoRequest | null>(null);
  const [statusChoice, setStatusChoice] = useState<Status>('new');
  const [statusNotes, setStatusNotes] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const pickedDate: Dayjs | undefined = Form.useWatch('demo_scheduled_at', scheduleForm);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced({ search: search.trim(), country: country.trim() }), 350);
    return () => window.clearTimeout(t);
  }, [search, country]);
  useEffect(() => { setPage(1); }, [status, level, debounced, range]);

  const query = useCallback((extra: Record<string, string> = {}) => new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(status && { status }),
    ...(level && { level }),
    ...(debounced.search && { search: debounced.search }),
    ...(debounced.country && { country: debounced.country }),
    ...(range && { start_date: range[0].format('YYYY-MM-DD'), end_date: range[1].format('YYYY-MM-DD') }),
    ...extra,
  }).toString(), [page, limit, status, level, debounced, range]);

  const fetchList = useCallback(async () => {
    setFetching(true);
    try {
      const res = await apiCall(`/demo-requests?${query()}`);
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.message || `The server answered ${res.status}.`);
      const list: DemoRequest[] = d.data || [];
      setItems(list);
      setTotal(n(d.pagination?.total));
      const s = d.statistics || {};
      setStats({
        total: n(s.total), new_requests: n(s.new_requests), contacted: n(s.contacted), demo_scheduled: n(s.demo_scheduled),
        completed: n(s.completed), cancelled: n(s.cancelled), this_week: n(s.this_week), this_month: n(s.this_month),
      });
      setDrawer(cur => (cur ? list.find(x => x.id === cur.id) || cur : cur));
      setError(null);
    } catch (e: any) {
      setError(e?.message || 'Could not load demo requests.');
    } finally {
      setLoading(false);
      setFetching(false);
    }
  }, [apiCall, query]);

  useEffect(() => { fetchList(); }, [fetchList]);
  useEffect(() => {
    apiCall('/users/role/teachers').then(res => (res.ok ? res.json() : [])).then(d => setTeachers(Array.isArray(d) ? d : [])).catch(() => setTeachers([]));
  }, [apiCall]);
  useEffect(() => { setNotesDraft(drawer?.notes || ''); }, [drawer?.id, drawer?.notes]);

  /* ═══════════ ACTIONS ═══════════ */
  const merge = (updated: Partial<DemoRequest> & { id: number }) => {
    setItems(list => list.map(x => (x.id === updated.id ? { ...x, ...updated } : x)));
    setDrawer(cur => (cur && cur.id === updated.id ? { ...cur, ...updated } : cur));
  };

  const updateStatus = async (req: DemoRequest, next: Status, notes?: string) => {
    setBusyId(req.id);
    try {
      const res = await apiCall(`/demo-requests/${req.id}/status`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next, ...(notes !== undefined ? { notes } : {}) }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { msg.error(d.message || 'Could not update the request'); return false; }
      if (d.data) merge({ ...d.data, teacher_first_name: req.teacher_first_name, teacher_last_name: req.teacher_last_name, teacher_email: req.teacher_email });
      if (next !== req.status) msg.success(`${req.full_name} marked as ${STATUS[next].label.toLowerCase()}`);
      fetchList();
      return true;
    } catch {
      msg.error('Could not update the request');
      return false;
    } finally {
      setBusyId(null);
    }
  };

  const saveNotes = async () => {
    if (!drawer) return;
    setSavingNotes(true);
    const ok = await updateStatus(drawer, drawer.status, notesDraft);
    setSavingNotes(false);
    if (ok) msg.success('Notes saved');
  };

  const openSchedule = (req: DemoRequest) => {
    setScheduleFor(req);
    scheduleForm.resetFields();
    scheduleForm.setFieldsValue({
      demo_scheduled_at: req.demo_scheduled_at ? dayjs(req.demo_scheduled_at) : undefined,
      teacher_id: req.teacher_id || undefined,
      meeting_link: req.meeting_link || '',
      notes: req.notes || '',
    });
  };
  const submitSchedule = async (values: { demo_scheduled_at: Dayjs; teacher_id: number; meeting_link: string; notes?: string }) => {
    if (!scheduleFor) return;
    setScheduling(true);
    try {
      const res = await apiCall(`/demo-requests/${scheduleFor.id}/schedule`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          demo_scheduled_at: values.demo_scheduled_at.toISOString(),
          teacher_id: values.teacher_id,
          meeting_link: values.meeting_link.trim(),
          notes: values.notes || '',
        }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        const first = Array.isArray(d.errors) && d.errors[0]?.msg;
        msg.error(first || d.message || 'Could not schedule the demo');
        return;
      }
      if (d.data) merge(d.data);
      msg.success(`Demo scheduled — ${scheduleFor.full_name} and the teacher were emailed`);
      setScheduleFor(null);
      fetchList();
    } catch {
      msg.error('Could not schedule the demo');
    } finally {
      setScheduling(false);
    }
  };

  const openStatus = (req: DemoRequest) => { setStatusFor(req); setStatusChoice(req.status); setStatusNotes(req.notes || ''); };
  const submitStatus = async () => {
    if (!statusFor) return;
    setSavingStatus(true);
    const ok = await updateStatus(statusFor, statusChoice, statusNotes);
    setSavingStatus(false);
    if (ok) setStatusFor(null);
  };

  const confirmDelete = (req: DemoRequest) => {
    modal.confirm({
      title: `Delete ${req.full_name}'s request?`,
      icon: <ExclamationCircleFilled style={{ color: '#dc2626' }} />,
      content: 'The request and its notes are removed permanently. Cancel it instead if you want to keep a record.',
      okText: 'Delete',
      okButtonProps: { danger: true },
      centered: true,
      onOk: async () => {
        const res = await apiCall(`/demo-requests/${req.id}`, { method: 'DELETE' });
        if (!res.ok && res.status !== 404) { msg.error('Could not delete the request'); return; }
        msg.success('Request deleted');
        if (drawer?.id === req.id) setDrawer(null);
        fetchList();
      },
    });
  };

  const copy = (text: string, what: string) => {
    navigator.clipboard.writeText(text).then(() => msg.success(`${what} copied`)).catch(() => msg.info(text));
  };

  const exportCsv = async () => {
    try {
      const res = await apiCall(`/demo-requests?${query({ page: '1', limit: '1000' })}`);
      const d = await res.json();
      const list: DemoRequest[] = d.data || [];
      const head = ['Name', 'Email', 'Phone', 'Country', 'Timezone', 'Current level', 'Target level', 'Experience', 'Goals', 'Expected start', 'Preferred schedule', 'Status', 'Demo date', 'Teacher', 'Notes', 'Received'];
      const rows = list.map(x => [x.full_name, x.email, x.phone || '', x.country || '', x.timezone || '', x.current_level || '', x.interested_level || '',
        hasExperience(x.has_previous_experience) ? 'Yes' : 'No', x.learning_goals || '', x.expected_start_time || '', x.preferred_schedule || '',
        STATUS[x.status]?.label || x.status, x.demo_scheduled_at ? dayjs(x.demo_scheduled_at).format('YYYY-MM-DD HH:mm') : '',
        `${x.teacher_first_name || ''} ${x.teacher_last_name || ''}`.trim(), x.notes || '', dayjs(x.created_at).format('YYYY-MM-DD HH:mm')]);
      const csv = [head, ...rows].map(row => row.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
      const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `demo-requests-${dayjs().format('YYYY-MM-DD')}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      msg.error('Could not export the requests');
    }
  };

  /* ═══════════ VIEW HELPERS ═══════════ */
  const fmtDate = (iso?: string | null, withTime = false) => (iso ? formatPlain(iso, tz, withTime
    ? { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }
    : { month: 'short', day: 'numeric', year: 'numeric' }) : '—');
  const teacherName = (x: DemoRequest) => `${x.teacher_first_name || ''} ${x.teacher_last_name || ''}`.trim();
  const demoPassed = (x: DemoRequest) => !!x.demo_scheduled_at && new Date(x.demo_scheduled_at).getTime() < Date.now();

  const nextAction = (x: DemoRequest): { label: string; icon: React.ReactNode; run: () => void } | null => {
    if (x.status === 'new') return { label: 'Mark contacted', icon: <CheckOutlined />, run: () => updateStatus(x, 'contacted') };
    if (x.status === 'contacted') return { label: 'Schedule demo', icon: <CalendarOutlined />, run: () => openSchedule(x) };
    if (x.status === 'demo_scheduled' && demoPassed(x)) return { label: 'Mark completed', icon: <CheckCircleFilled />, run: () => updateStatus(x, 'completed') };
    if (x.status === 'demo_scheduled' && x.meeting_link) return { label: 'Open link', icon: <LinkOutlined />, run: () => window.open(x.meeting_link as string, '_blank', 'noopener,noreferrer') };
    return null;
  };

  const actionsMenu = (x: DemoRequest): MenuProps['items'] => [
    { key: 'view', icon: <UserOutlined />, label: 'Open details', onClick: () => setDrawer(x) },
    { key: 'mail', icon: <MailOutlined />, label: 'Send an email', onClick: () => { window.location.href = `mailto:${x.email}`; } },
    { type: 'divider' },
    { key: 'contacted', icon: <CheckOutlined />, label: 'Mark contacted', disabled: x.status !== 'new', onClick: () => updateStatus(x, 'contacted') },
    { key: 'schedule', icon: <CalendarOutlined />, label: x.demo_scheduled_at ? 'Reschedule demo' : 'Schedule demo', disabled: x.status === 'completed' || x.status === 'cancelled', onClick: () => openSchedule(x) },
    { key: 'status', icon: <EditOutlined />, label: 'Change status & notes', onClick: () => openStatus(x) },
    { type: 'divider' },
    { key: 'delete', icon: <DeleteOutlined />, label: 'Delete', danger: true, onClick: () => confirmDelete(x) },
  ];

  const StatusCell: React.FC<{ x: DemoRequest }> = ({ x }) => {
    const waiting = daysAgo(x.created_at);
    const sub = x.status === 'new' ? `Waiting ${agoText(x.created_at).replace(' ago', '')}`
      : x.status === 'contacted' ? `Contacted ${agoText(x.contacted_at || x.updated_at)}`
        : x.status === 'demo_scheduled' ? (x.demo_scheduled_at ? `${demoPassed(x) ? 'Held' : 'Demo'} ${fmtDate(x.demo_scheduled_at, true)}` : 'Demo booked')
          : x.status === 'completed' ? 'Demo done' : 'Closed';
    return (
      <div className="dr-status">
        <span className={`dr-pill is-${x.status}`}>{STATUS[x.status]?.label || x.status}</span>
        <span className={`dr-status-sub${x.status === 'new' && waiting >= 2 ? ' is-late' : ''}`}>{sub}</span>
      </div>
    );
  };

  const LevelCell: React.FC<{ x: DemoRequest }> = ({ x }) => (
    <div className="dr-level">
      <span className="dr-level-path">
        <b>{x.current_level || '—'}</b>
        {x.interested_level && x.interested_level !== x.current_level && <><RightOutlined /><b className="is-target">{x.interested_level}</b></>}
      </span>
      <em>{hasExperience(x.has_previous_experience) ? 'Has studied before' : 'First time learning'}</em>
    </div>
  );

  /* ═══════════ LOADING ═══════════ */
  if (loading) {
    return (
      <div className="dr" aria-busy="true">
        <div className="dr-header"><div><Skeleton.Input active size="small" style={{ width: 120, height: 12 }} /><div style={{ marginTop: 10 }}><Skeleton.Input active style={{ width: 220, height: 24 }} /></div></div></div>
        <div className="dr-panel dr-pad"><Skeleton active title={false} paragraph={{ rows: 2 }} /></div>
        <div className="dr-panel dr-pad"><Skeleton active title={false} paragraph={{ rows: 8 }} /></div>
      </div>
    );
  }

  const conversion = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;
  const hasFilters = !!(status || level || search || country || range);
  const clearFilters = () => { setStatus(''); setLevel(undefined); setSearch(''); setCountry(''); setRange(null); };

  const columns: ColumnsType<DemoRequest> = [
    {
      title: 'Requester', key: 'person',
      render: (_, x) => (
        <div className="dr-person">
          <span className="dr-av">{initialsOf(x.full_name)}</span>
          <div className="dr-person-text"><strong>{x.full_name}</strong><em>{x.email}</em></div>
        </div>
      ),
    },
    {
      title: 'Contact', key: 'contact', width: 190,
      render: (_, x) => (
        <div className="dr-contact">
          {x.phone ? <span><PhoneOutlined /> {x.phone}</span> : <span className="is-muted"><PhoneOutlined /> No phone</span>}
          <span><EnvironmentOutlined /> {x.country || '—'}</span>
        </div>
      ),
    },
    { title: 'Level', key: 'level', width: 170, render: (_, x) => <LevelCell x={x} /> },
    { title: 'Status', key: 'status', width: 210, render: (_, x) => <StatusCell x={x} /> },
    {
      title: 'Received', dataIndex: 'created_at', width: 130,
      render: (iso: string) => <div className="dr-when"><span>{fmtDate(iso)}</span><em>{agoText(iso)}</em></div>,
    },
    {
      title: <span className="sr-only">Actions</span>, key: 'actions', width: 190, align: 'right',
      render: (_, x) => {
        const next = nextAction(x);
        return (
          <div className="dr-row-actions" onClick={e => e.stopPropagation()}>
            {next && <Button size="small" icon={next.icon} loading={busyId === x.id} onClick={next.run}>{next.label}</Button>}
            <Dropdown menu={{ items: actionsMenu(x) }} trigger={['click']} placement="bottomRight">
              <Button type="text" size="small" className="dr-icon-btn" icon={<MoreOutlined />} aria-label={`More actions for ${x.full_name}`} />
            </Dropdown>
          </div>
        );
      },
    },
  ];

  const empty = (
    <div className="dr-empty">
      <span className="dr-empty-ic"><MailOutlined /></span>
      <strong>{hasFilters ? 'No requests match these filters' : 'No demo requests yet'}</strong>
      <span>{hasFilters ? 'Try another search or clear the filters.' : 'Requests sent from the website appear here.'}</span>
      {hasFilters && <Button onClick={clearFilters}>Clear filters</Button>}
    </div>
  );
  const useCards = r.width < 768;
  const d = drawer;
  const dTz = validTz(d?.timezone);
  const stepIndex = d ? (d.status === 'cancelled' ? -1 : PIPELINE.indexOf(d.status)) : 0;
  const stepDates: Record<Status, string | null | undefined> = d ? {
    new: d.created_at, contacted: d.contacted_at, demo_scheduled: d.demo_scheduled_at, completed: d.status === 'completed' ? d.updated_at : null, cancelled: null,
  } : { new: null, contacted: null, demo_scheduled: null, completed: null, cancelled: null };
  const dNext = d ? nextAction(d) : null;
  const sTz = validTz(scheduleFor?.timezone);

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#4f46e5', fontSize: 13, borderRadius: 8 } }}>
      <div className="dr">
        {msgHolder}
        {modalHolder}

        <header className="dr-header">
          <div>
            <div className="dr-overline">Admin console · Admissions</div>
            <h1 className="dr-title">Demo requests</h1>
            <p className="dr-subtitle">Follow every trial-class request from first contact to a completed demo. Times in {timezoneLabel(tz)}.</p>
          </div>
          <div className="dr-header-actions">
            <Tooltip title="Refresh"><Button icon={<ReloadOutlined spin={fetching} />} onClick={fetchList} aria-label="Refresh" /></Tooltip>
            <Button icon={<DownloadOutlined />} onClick={exportCsv} disabled={!total}>{r.isMobile ? 'CSV' : 'Export CSV'}</Button>
          </div>
        </header>

        {error && (
          <div className="dr-alert" role="alert"><ExclamationCircleFilled /><span><strong>Couldn't load requests.</strong> {error}</span><Button size="small" onClick={fetchList}>Retry</Button></div>
        )}

        {/* ── Pipeline ── */}
        <section className="dr-panel dr-pipeline" aria-label="Pipeline">
          <div className="dr-stages">
            <button type="button" className={`dr-stage is-all${status === '' ? ' is-active' : ''}`} onClick={() => setStatus('')} aria-pressed={status === ''}>
              <span>All requests</span><strong>{stats.total}</strong><em>{stats.this_week} this week</em>
            </button>
            {(['new', 'contacted', 'demo_scheduled', 'completed', 'cancelled'] as Status[]).map((k, i) => {
              const v = stats[STATUS[k].stat];
              return (
                <React.Fragment key={k}>
                  {i > 0 && i < 4 && <RightOutlined className="dr-stage-arrow" aria-hidden />}
                  {i === 4 && <span className="dr-stage-sep" aria-hidden />}
                  <button type="button" className={`dr-stage is-${k}${status === k ? ' is-active' : ''}`}
                    onClick={() => setStatus(status === k ? '' : k)} aria-pressed={status === k}>
                    <span><i />{STATUS[k].label}</span>
                    <strong>{v}</strong>
                    <em>{stats.total ? `${Math.round((v / stats.total) * 100)}%` : '—'}</em>
                  </button>
                </React.Fragment>
              );
            })}
          </div>
          <div className="dr-pipe-foot">
            <span><b>{stats.this_month}</b> received in the last 30 days</span>
            <span><b>{conversion}%</b> reached a completed demo</span>
            {stats.new_requests > 0 && <span className="is-warn"><ClockCircleOutlined /> <b>{stats.new_requests}</b> waiting for a first reply</span>}
          </div>
        </section>

        {/* ── Directory ── */}
        <section className="dr-panel" aria-label="Requests">
          <div className="dr-toolbar">
            <Input className="dr-search" prefix={<SearchOutlined />} allowClear placeholder="Search name or email" value={search} onChange={e => setSearch(e.target.value)} />
            <Select className="dr-filter" allowClear placeholder="Any level" value={level} onChange={setLevel} options={LEVELS.map(l => ({ value: l, label: `Level ${l}` }))} />
            <Input className="dr-filter" prefix={<EnvironmentOutlined />} allowClear placeholder="Country" value={country} onChange={e => setCountry(e.target.value)} />
            <DatePicker.RangePicker className="dr-range" value={range} format="MMM D, YYYY" placeholder={['Received from', 'To']}
              onChange={v => setRange(v && v[0] && v[1] ? [v[0], v[1]] : null)} />
            {hasFilters && <Button type="link" size="small" onClick={clearFilters}>Clear filters</Button>}
            <span className="dr-count">{total} {total === 1 ? 'request' : 'requests'}{status && ` · ${STATUS[status].label}`}</span>
          </div>

          {useCards ? (
            items.length === 0 ? empty : (
              <div className="dr-cards">
                {items.map(x => {
                  const next = nextAction(x);
                  return (
                    <div key={x.id} className="dr-card" role="button" tabIndex={0} onClick={() => setDrawer(x)}
                      onKeyDown={e => { if (e.key === 'Enter') setDrawer(x); }}>
                      <div className="dr-card-top">
                        <div className="dr-person"><span className="dr-av">{initialsOf(x.full_name)}</span><div className="dr-person-text"><strong>{x.full_name}</strong><em>{x.country || x.email}</em></div></div>
                        <span className="dr-when-sm">{agoText(x.created_at)}</span>
                      </div>
                      <div className="dr-card-meta"><StatusCell x={x} /><LevelCell x={x} /></div>
                      {next && <div onClick={e => e.stopPropagation()}><Button size="small" block icon={next.icon} loading={busyId === x.id} onClick={next.run}>{next.label}</Button></div>}
                    </div>
                  );
                })}
                {total > items.length && (
                  <div className="dr-more"><Button onClick={() => setLimit(l => l + 20)} loading={fetching}>Show more</Button></div>
                )}
              </div>
            )
          ) : (
            <Table<DemoRequest>
              className="dr-table"
              columns={columns}
              dataSource={items}
              rowKey="id"
              size="middle"
              loading={fetching && !loading}
              sticky={{ offsetHeader: headerHeight(r.isMobile) }}
              scroll={{ x: 980 }}
              locale={{ emptyText: empty }}
              rowClassName={x => `dr-row${x.status === 'new' && daysAgo(x.created_at) >= 2 ? ' is-late' : ''}`}
              onRow={x => ({ onClick: e => { if (!(e.target as HTMLElement).closest('.dr-row-actions')) setDrawer(x); } })}
              pagination={{
                current: page,
                pageSize: limit,
                total,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100'],
                showTotal: (t, [a, b]) => `${a}–${b} of ${t}`,
                onChange: (p, s) => { setPage(p); setLimit(s); },
              }}
            />
          )}
        </section>

        {/* ── Details drawer ── */}
        <Drawer open={!!d} onClose={() => setDrawer(null)} width={r.isMobile ? '100%' : 480} closable={false} title={null} className="dr-drawer"
          footer={d && (
            <div className="dr-dfoot">
              {dNext && <Button type="primary" icon={dNext.icon} loading={busyId === d.id} onClick={dNext.run}>{dNext.label}</Button>}
              {d.status !== 'completed' && d.status !== 'cancelled' && d.status !== 'contacted' && (
                <Button icon={<CalendarOutlined />} onClick={() => openSchedule(d)}>{d.demo_scheduled_at ? 'Reschedule' : 'Schedule'}</Button>
              )}
              <Button icon={<EditOutlined />} onClick={() => openStatus(d)}>Status</Button>
              <Tooltip title="Delete request"><Button danger type="text" icon={<DeleteOutlined />} onClick={() => confirmDelete(d)} aria-label="Delete request" /></Tooltip>
            </div>
          )}>
          {d && (
            <div className="dr-detail">
              <div className="dr-dh">
                <button type="button" className="dr-dclose" onClick={() => setDrawer(null)} aria-label="Close"><CloseOutlined /></button>
                <span className="dr-av is-lg">{initialsOf(d.full_name)}</span>
                <h3>{d.full_name}</h3>
                <p>Received {fmtDate(d.created_at, true)} · {agoText(d.created_at)}</p>
                <div className="dr-dh-actions">
                  <a className="dr-chip-btn" href={`mailto:${d.email}`}><MailOutlined /> Email</a>
                  {d.phone && <a className="dr-chip-btn" href={`tel:${d.phone.replace(/[^\d+]/g, '')}`}><PhoneOutlined /> Call</a>}
                  <button type="button" className="dr-chip-btn" onClick={() => copy(d.email, 'Email')}><CopyOutlined /> Copy email</button>
                </div>
              </div>

              {d.status === 'cancelled' ? (
                <div className="dr-banner is-cancelled"><StopOutlined /> This request was cancelled.</div>
              ) : (
                <ol className="dr-steps">
                  {PIPELINE.map((k, i) => (
                    <li key={k} className={i < stepIndex ? 'is-done' : i === stepIndex ? 'is-current' : ''}>
                      <span className="dr-step-dot">{i < stepIndex ? <CheckOutlined /> : i + 1}</span>
                      <span className="dr-step-text"><strong>{STATUS[k].label}</strong><em>{stepDates[k] && i <= stepIndex ? fmtDate(stepDates[k]) : '—'}</em></span>
                    </li>
                  ))}
                </ol>
              )}

              {d.demo_scheduled_at && (
                <div className={`dr-demo${demoPassed(d) ? ' is-past' : ''}`}>
                  <div className="dr-demo-date">
                    <em>{formatPlain(d.demo_scheduled_at, tz, { month: 'short' })}</em>
                    <strong>{formatPlain(d.demo_scheduled_at, tz, { day: 'numeric' })}</strong>
                  </div>
                  <div className="dr-demo-text">
                    <span className="dr-demo-over">{demoPassed(d) ? 'Demo held' : 'Demo scheduled'}</span>
                    <strong>{formatPlain(d.demo_scheduled_at, tz, { weekday: 'long', hour: 'numeric', minute: '2-digit', hour12: true })} <small>{timezoneLabel(tz)}</small></strong>
                    {dTz && dTz !== tz && <em>Their time: {inTz(d.demo_scheduled_at, dTz, { weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: true })} ({dTz.replace(/_/g, ' ')})</em>}
                    {teacherName(d) && <em><TeamOutlined /> {teacherName(d)}</em>}
                  </div>
                  {d.meeting_link && (
                    <div className="dr-demo-actions">
                      <Button size="small" icon={<LinkOutlined />} href={d.meeting_link} target="_blank" rel="noopener noreferrer">Open</Button>
                      <Tooltip title="Copy link"><Button size="small" icon={<CopyOutlined />} onClick={() => copy(d.meeting_link as string, 'Link')} aria-label="Copy link" /></Tooltip>
                    </div>
                  )}
                </div>
              )}

              <section className="dr-sec">
                <h4>Contact</h4>
                <dl className="dr-facts">
                  <div><dt>Email</dt><dd>{d.email}</dd></div>
                  <div><dt>Phone</dt><dd>{d.phone || '—'}</dd></div>
                  <div><dt>Country</dt><dd>{d.country || '—'}</dd></div>
                  <div><dt>Timezone</dt><dd>{d.timezone ? <>{d.timezone.replace(/_/g, ' ')}{dTz && <small> · now {inTz(new Date(), dTz, { hour: 'numeric', minute: '2-digit', hour12: true })}</small>}</> : '—'}</dd></div>
                </dl>
              </section>

              <section className="dr-sec">
                <h4>Learning profile</h4>
                <dl className="dr-facts">
                  <div><dt>Level</dt><dd>{d.current_level || '—'}{d.interested_level && ` → wants ${d.interested_level}`}</dd></div>
                  <div><dt>Experience</dt><dd>{hasExperience(d.has_previous_experience) ? 'Has studied French before' : 'First time learning'}</dd></div>
                  {d.previous_study_method && <div><dt>Studied with</dt><dd>{d.previous_study_method}</dd></div>}
                  <div><dt>Wants to start</dt><dd>{d.expected_start_time || '—'}</dd></div>
                  <div><dt>Availability</dt><dd>{d.preferred_schedule || '—'}</dd></div>
                </dl>
              </section>

              {(d.learning_goals || d.expectations) && (
                <section className="dr-sec">
                  <h4>Goals & expectations</h4>
                  {d.learning_goals && <blockquote className="dr-quote"><span>Goals</span>{d.learning_goals}</blockquote>}
                  {d.expectations && <blockquote className="dr-quote"><span>Expectations</span>{d.expectations}</blockquote>}
                </section>
              )}

              <section className="dr-sec">
                <h4>Internal notes</h4>
                <Input.TextArea value={notesDraft} onChange={e => setNotesDraft(e.target.value)} autoSize={{ minRows: 3, maxRows: 8 }}
                  placeholder="Call summary, availability, follow-up… (only admins see this)" maxLength={2000} />
                <div className="dr-notes-actions">
                  <span>{notesDraft !== (d.notes || '') ? 'Unsaved changes' : d.notes ? 'Saved' : ''}</span>
                  <Button size="small" type="primary" onClick={saveNotes} loading={savingNotes} disabled={notesDraft === (d.notes || '')}>Save notes</Button>
                </div>
              </section>
            </div>
          )}
        </Drawer>

        {/* ── Schedule demo ── */}
        <Modal open={!!scheduleFor} onCancel={() => !scheduling && setScheduleFor(null)} footer={null} width={520} centered className="dr-modal"
          maskClosable={!scheduling} closable={!scheduling} forceRender>
          <div className="dr-md">
            <header className="dr-md-head">
              <span className="dr-md-ic"><CalendarOutlined /></span>
              <div>
                <h3>{scheduleFor?.demo_scheduled_at ? 'Reschedule demo' : 'Schedule a demo'}</h3>
                <p>{scheduleFor?.full_name} · {scheduleFor?.current_level || '—'}{scheduleFor?.country ? ` · ${scheduleFor.country}` : ''}</p>
              </div>
            </header>
            {scheduleFor?.preferred_schedule && (
              <div className="dr-md-pref"><ClockCircleOutlined /><span><strong>Their availability</strong>{scheduleFor.preferred_schedule}{scheduleFor.timezone ? ` · ${scheduleFor.timezone.replace(/_/g, ' ')}` : ''}</span></div>
            )}
            <Form form={scheduleForm} layout="vertical" requiredMark={false} onFinish={submitSchedule} className="dr-md-body">
              <Form.Item name="demo_scheduled_at" label="Date and time" rules={[{ required: true, message: 'Pick the date and time' }]}
                extra={pickedDate && sTz && sTz !== tz ? `Their local time: ${inTz(pickedDate.toDate(), sTz, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}` : `Your time (${timezoneLabel(tz)})`}>
                <DatePicker showTime={{ format: 'HH:mm', minuteStep: 15 }} format="ddd, MMM D YYYY · HH:mm" style={{ width: '100%' }}
                  disabledDate={dt => dt.isBefore(dayjs().startOf('day'))} />
              </Form.Item>
              <Form.Item name="teacher_id" label="Teacher" rules={[{ required: true, message: 'Choose a teacher' }]}>
                <Select showSearch optionFilterProp="label" placeholder="Search a teacher"
                  options={teachers.map(t => ({ value: t.id, label: `${t.first_name} ${t.last_name} · ${t.email}` }))} />
              </Form.Item>
              <Form.Item name="meeting_link" label="Meeting link"
                rules={[{ required: true, message: 'Add the meeting link' }, { type: 'url', message: 'Enter a full link, e.g. https://meet.google.com/…' }]}>
                <Input prefix={<LinkOutlined />} placeholder="https://meet.google.com/abc-defg-hij" />
              </Form.Item>
              <Form.Item name="notes" label="Note for the teacher and student">
                <Input.TextArea autoSize={{ minRows: 2, maxRows: 5 }} placeholder="Anything they should prepare…" maxLength={1000} />
              </Form.Item>
              <p className="dr-md-info"><MailOutlined /> A confirmation email goes to the student and the teacher.</p>
            </Form>
            <footer className="dr-md-foot">
              <Button onClick={() => setScheduleFor(null)} disabled={scheduling}>Cancel</Button>
              <Button type="primary" icon={<CalendarOutlined />} loading={scheduling} onClick={() => scheduleForm.submit()}>
                {scheduleFor?.demo_scheduled_at ? 'Save & notify' : 'Schedule & notify'}
              </Button>
            </footer>
          </div>
        </Modal>

        {/* ── Change status ── */}
        <Modal open={!!statusFor} onCancel={() => !savingStatus && setStatusFor(null)} footer={null} width={460} centered className="dr-modal">
          {statusFor && (
            <div className="dr-md">
              <header className="dr-md-head">
                <span className="dr-md-ic"><EditOutlined /></span>
                <div><h3>Update request</h3><p>{statusFor.full_name}</p></div>
              </header>
              <div className="dr-md-body">
                <div className="dr-status-grid" role="radiogroup" aria-label="Status">
                  {(Object.keys(STATUS) as Status[]).map(k => (
                    <button key={k} type="button" role="radio" aria-checked={statusChoice === k}
                      className={`dr-status-opt is-${k}${statusChoice === k ? ' is-on' : ''}`} onClick={() => setStatusChoice(k)}>
                      <i />{STATUS[k].label}
                    </button>
                  ))}
                </div>
                {statusChoice === 'demo_scheduled' && !statusFor.demo_scheduled_at && (
                  <p className="dr-md-warn">To book a date, teacher and link, use <button type="button" onClick={() => { const x = statusFor; setStatusFor(null); openSchedule(x); }}>Schedule demo</button> instead.</p>
                )}
                <label className="dr-md-label" htmlFor="dr-notes">Notes</label>
                <Input.TextArea id="dr-notes" value={statusNotes} onChange={e => setStatusNotes(e.target.value)} autoSize={{ minRows: 3, maxRows: 6 }} maxLength={2000} placeholder="Optional" />
              </div>
              <footer className="dr-md-foot">
                <Button onClick={() => setStatusFor(null)} disabled={savingStatus}>Cancel</Button>
                <Button type="primary" loading={savingStatus} onClick={submitStatus}>Save</Button>
              </footer>
            </div>
          )}
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default DemoRequests;
