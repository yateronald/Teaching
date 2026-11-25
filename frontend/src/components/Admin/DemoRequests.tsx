import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, ConfigProvider, DatePicker, Drawer, Dropdown, Form, Input, InputNumber, Modal, Radio, Segmented, Select, Skeleton, Table, Tag, TimePicker, Tooltip, message } from 'antd';
import type { MenuProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  CalendarOutlined, CheckCircleFilled, CheckOutlined, ClockCircleOutlined, CloseOutlined, CopyOutlined, DeleteOutlined,
  DownloadOutlined, EditOutlined, EnvironmentOutlined, ExclamationCircleFilled, LinkOutlined, MailOutlined, MoreOutlined,
  PhoneOutlined, PlusOutlined, ReloadOutlined, RightOutlined, SearchOutlined, SendOutlined, StopOutlined, TeamOutlined, TrophyOutlined, UserOutlined,
  VideoCameraOutlined, WhatsAppOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { useAuth } from '../../contexts/AuthContext';
import useDemoAlerts from '../../hooks/useDemoAlerts';
import useResponsive from '../../hooks/useResponsive';
import { acquireSocket, releaseSocket } from '../../utils/realtime';
import { headerHeight } from '../Layout/layoutMetrics';
import { COMMON_TIMEZONES, detectBrowserTimezone, formatPlain, timezoneLabel } from '../../utils/timezone';
import './DemoRequests.css';

/* ══════════════════════════════════════════
   DEMO REQUESTS — lead pipeline: New → Contacted → Scheduled → Completed (or Cancelled)
══════════════════════════════════════════ */

type Status = 'new' | 'contacted' | 'demo_scheduled' | 'completed' | 'cancelled';

interface AvailabilitySlot {
  date: string;
  end_date?: string | null;
  start: string;
  end: string;
}

interface AvailabilityRequest {
  id: number;
  status: 'pending' | 'submitted' | 'expired' | 'superseded';
  proposed_timezone: string;
  proposed_start_date: string;
  proposed_end_date: string;
  proposed_time_start: string;
  proposed_time_end: string;
  proposed_slots?: AvailabilitySlot[] | null;
  admin_note?: string | null;
  expires_at?: string;
  submitted_at?: string | null;
  submitted_timezone?: string | null;
  submitted_slots?: AvailabilitySlot[] | null;
  submitted_note?: string | null;
}

interface ProposedSlotDraft {
  id: number;
  isRange: boolean;
  date: Dayjs | null;
  endDate: Dayjs | null;
  start: Dayjs | null;
  end: Dayjs | null;
}

interface LinkedMeeting {
  id: number;
  code: string;
  title: string;
  status: string;
  scheduled_start?: string | null;
  scheduled_end?: string | null;
  is_public?: boolean;
  require_approval?: boolean;
  passcode?: string | null;
  public_link?: string | null;
}

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
  meeting_id?: number | null;
  meeting_link?: string | null;
  teacher_first_name?: string | null;
  teacher_last_name?: string | null;
  teacher_email?: string | null;
  /** What the person asked for: live classes, or exam practice only. */
  interest?: 'classes' | 'exam' | null;
  target_exam?: string | null;
  exam_date?: string | null;
  target_score?: string | null;
  /** The papers they want, as 'ce,co,ee,eo'. */
  skills?: string | null;
  latest_availability?: AvailabilityRequest | null;
  linked_meeting?: LinkedMeeting | null;
}

type Interest = 'classes' | 'exam';

/** The per-status counters the pipeline reads; always present. */
type StatusCount = 'new_requests' | 'contacted' | 'demo_scheduled' | 'completed' | 'cancelled';

const INTEREST: Record<Interest, { label: string; short: string; hint: string }> = {
  classes: { label: 'Live classes', short: 'Classes', hint: 'Wants a trial class with a teacher' },
  exam: { label: 'Exam only', short: 'Exam only', hint: 'Wants mock exams and corrections, no classes' },
};

const EXAM_LABELS: Record<string, string> = {
  tcf_canada: 'TCF Canada', tef_canada: 'TEF Canada', tcf_quebec: 'TCF Quebec', tefaq: 'TEFAQ',
  tcf_tp: 'TCF Tout public', delf: 'DELF', dalf: 'DALF', other: 'Another exam',
};

const SKILL_LABELS: Record<string, string> = { co: 'Listening', ce: 'Reading', ee: 'Writing', eo: 'Speaking' };

/** A request with no interest recorded predates the split, and was for classes. */
const interestOf = (x: DemoRequest): Interest => (x.interest === 'exam' ? 'exam' : 'classes');
interface Stats {
  total: number; new_requests: number; contacted: number; demo_scheduled: number; completed: number; cancelled: number;
  this_week: number; this_month: number;
  /** Present once migration 023 has run. */
  exam_requests?: number; class_requests?: number; exam_new?: number;
}
interface Teacher { id: number; first_name: string; last_name: string; email: string; role?: string; }

const STATUS: Record<Status, { label: string; stat: StatusCount }> = {
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
  const navigate = useNavigate();
  const r = useResponsive();
  const [msg, msgHolder] = message.useMessage();
  const [modal, modalHolder] = Modal.useModal();
  const [scheduleForm] = Form.useForm();
  const [availForm] = Form.useForm();
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
  const [interest, setInterest] = useState<Interest | ''>('');
  const [level, setLevel] = useState<string | undefined>();
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [debounced, setDebounced] = useState({ search: '', country: '' });
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [hosts, setHosts] = useState<Teacher[]>([]);

  const [drawer, setDrawer] = useState<DemoRequest | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [scheduleFor, setScheduleFor] = useState<DemoRequest | null>(null);
  const [scheduleMode, setScheduleMode] = useState<'platform' | 'external'>('platform');
  const [scheduling, setScheduling] = useState(false);
  const [availFor, setAvailFor] = useState<DemoRequest | null>(null);
  const [proposedSlots, setProposedSlots] = useState<ProposedSlotDraft[]>([]);
  const [availError, setAvailError] = useState<string | null>(null);
  const [sendingAvail, setSendingAvail] = useState(false);
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
    ...(interest && { interest }),
    ...(level && { level }),
    ...(debounced.search && { search: debounced.search }),
    ...(debounced.country && { country: debounced.country }),
    ...(range && { start_date: range[0].format('YYYY-MM-DD'), end_date: range[1].format('YYYY-MM-DD') }),
    ...extra,
  }).toString(), [page, limit, status, interest, level, debounced, range]);

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
        exam_requests: n(s.exam_requests), class_requests: n(s.class_requests), exam_new: n(s.exam_new),
      });
      setDrawer(cur => (cur ? list.find(x => x.id === cur.id) || cur : cur));
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error && e.message ? e.message : 'Could not load demo requests.');
    } finally {
      setLoading(false);
      setFetching(false);
    }
  }, [apiCall, query]);

  useEffect(() => { fetchList(); }, [fetchList]);

  // A request or availability submitted while this page is open appears without a refresh.
  const alerts = useDemoAlerts(true, () => { fetchList(); });

  useEffect(() => {
    const s = acquireSocket();
    const onAvail = (p: { fullName?: string }) => {
      msg.info(`${p?.fullName || 'A prospect'} submitted their availability!`);
      fetchList();
    };
    s.on('demo:availability-submitted', onAvail);
    return () => { s.off('demo:availability-submitted', onAvail); releaseSocket(); };
  }, [fetchList, msg]);

  useEffect(() => {
    apiCall('/users/role/teachers').then(res => (res.ok ? res.json() : [])).then(d => setTeachers(Array.isArray(d) ? d : [])).catch(() => setTeachers([]));
    apiCall('/users?limit=200').then(res => (res.ok ? res.json() : [])).then(d => {
      const list = Array.isArray(d) ? d : (d?.users || d?.data || []);
      const filtered = list.filter((u: Teacher) => u.role === 'admin' || u.role === 'teacher');
      if (user?.id && !filtered.some((u: Teacher) => u.id === user.id)) {
        filtered.unshift({ id: user.id, first_name: user.first_name, last_name: user.last_name, email: user.email, role: 'admin' });
      }
      setHosts(filtered);
    }).catch(() => {});
  }, [apiCall, user]);
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

  const openAskAvailability = (req: DemoRequest) => {
    setAvailFor(req);
    setAvailError(null);
    availForm.resetFields();
    availForm.setFieldsValue({
      proposed_timezone: tz || detectBrowserTimezone(),
      admin_note: '',
    });
    const baseDay = dayjs().add(1, 'day');
    setProposedSlots([
      { id: Date.now(), isRange: false, date: baseDay, endDate: null, start: dayjs('10:00', 'HH:mm'), end: dayjs('11:00', 'HH:mm') },
    ]);
  };

  const addProposedSlot = () => {
    if (proposedSlots.length >= 15) return;
    setAvailError(null);
    const last = proposedSlots[proposedSlots.length - 1];
    const anchor = last?.isRange && last?.endDate ? last.endDate : last?.date;
    const nextDate = anchor ? anchor.add(1, 'day') : dayjs().add(1, 'day');
    setProposedSlots(prev => [
      ...prev,
      {
        id: Date.now() + prev.length + 1,
        isRange: false,
        date: nextDate,
        endDate: null,
        start: last?.start || dayjs('10:00', 'HH:mm'),
        end: last?.end || dayjs('11:00', 'HH:mm'),
      },
    ]);
  };

  const duplicateProposedSlot = (index: number) => {
    if (proposedSlots.length >= 15) return;
    setAvailError(null);
    const src = proposedSlots[index];
    if (!src) return;
    const canShift = src.start && src.end && src.end.hour() < 22;
    const nextSlot: ProposedSlotDraft = {
      id: Date.now() + proposedSlots.length + 7,
      isRange: src.isRange,
      date: src.date,
      endDate: src.endDate,
      start: canShift ? src.start!.add(1, 'hour') : src.start,
      end: canShift ? src.end!.add(1, 'hour') : src.end,
    };
    setProposedSlots(prev => [
      ...prev.slice(0, index + 1),
      nextSlot,
      ...prev.slice(index + 1),
    ]);
  };

  const updateProposedSlot = (id: number, patch: Partial<ProposedSlotDraft>) => {
    setAvailError(null);
    setProposedSlots(prev => prev.map(s => (s.id === id ? { ...s, ...patch } : s)));
  };

  const toggleProposedSlotMode = (id: number, nextIsRange: boolean) => {
    setAvailError(null);
    setProposedSlots(prev => prev.map(s => {
      if (s.id !== id) return s;
      const start = s.date || dayjs().add(1, 'day');
      const nextEnd = nextIsRange
        ? (s.endDate && !s.endDate.isBefore(start, 'day') ? s.endDate : start.add(1, 'day'))
        : null;
      return { ...s, isRange: nextIsRange, date: start, endDate: nextEnd };
    }));
  };

  const removeProposedSlot = (id: number) => {
    if (proposedSlots.length <= 1) return;
    setAvailError(null);
    setProposedSlots(prev => prev.filter(s => s.id !== id));
  };

  const submitAskAvailability = async (values: {
    proposed_timezone: string;
    admin_note?: string;
  }) => {
    if (!availFor) return;
    if (proposedSlots.length === 0) {
      setAvailError('Please add at least one date and time option.');
      return;
    }
    const payloadSlots: AvailabilitySlot[] = [];
    for (let i = 0; i < proposedSlots.length; i += 1) {
      const s = proposedSlots[i];
      if (!s.date || !s.start || !s.end || (s.isRange && !s.endDate)) {
        setAvailError(`Option #${i + 1} needs a complete ${s.isRange ? 'date range' : 'date'} and start/end times.`);
        return;
      }
      const dateStr = s.date.format('YYYY-MM-DD');
      let endDateStr: string | undefined;
      if (s.isRange && s.endDate) {
        if (s.endDate.isBefore(s.date, 'day')) {
          setAvailError(`Option #${i + 1}: end date must be on or after start date.`);
          return;
        }
        if (s.endDate.diff(s.date, 'day') > 31) {
          setAvailError(`Option #${i + 1}: each date range can cover up to 31 days.`);
          return;
        }
        const cand = s.endDate.format('YYYY-MM-DD');
        if (cand !== dateStr) endDateStr = cand;
      }
      const start = s.start.format('HH:mm');
      const end = s.end.format('HH:mm');
      if (end <= start) {
        setAvailError(`Option #${i + 1}: end time must be after start time.`);
        return;
      }
      payloadSlots.push({ date: dateStr, ...(endDateStr ? { end_date: endDateStr } : {}), start, end });
    }
    setAvailError(null);
    setSendingAvail(true);
    try {
      const res = await apiCall(`/demo-requests/${availFor.id}/request-availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposed_slots: payloadSlots,
          proposed_timezone: values.proposed_timezone,
          admin_note: values.admin_note?.trim() || undefined,
        }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAvailError(d.message || 'Could not send availability request');
        return;
      }
      msg.success(d.email_sent
        ? `Availability link emailed to ${availFor.full_name}`
        : 'Availability request saved (email delivery failed)');
      setAvailFor(null);
      fetchList();
    } catch {
      setAvailError('Could not send availability request');
    } finally {
      setSendingAvail(false);
    }
  };

  const slotToLocalDayjs = (slot: AvailabilitySlot, sourceTz?: string | null): Dayjs | null => {
    try {
      const target = `${slot.date}T${slot.start}:00`;
      if (!sourceTz || sourceTz === 'UTC') return dayjs(target);
      // Approximate conversion by finding UTC offset at that date in sourceTz
      const approx = new Date(`${target}Z`);
      const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: sourceTz, year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
      }).formatToParts(approx);
      const get = (t: string) => Number(parts.find(p => p.type === t)?.value || 0);
      const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour') % 24, get('minute'), get('second'));
      const offsetMs = asUtc - approx.getTime();
      return dayjs(new Date(Date.parse(`${target}Z`) - offsetMs));
    } catch {
      return dayjs(`${slot.date}T${slot.start}`);
    }
  };

  const openSchedule = (req: DemoRequest, prefillSlot?: AvailabilitySlot) => {
    setScheduleFor(req);
    setScheduleMode('platform');
    scheduleForm.resetFields();
    const firstSlot = prefillSlot || req.latest_availability?.submitted_slots?.[0];
    const slotDt = firstSlot
      ? slotToLocalDayjs(firstSlot, req.latest_availability?.submitted_timezone || req.timezone)
      : null;
    scheduleForm.setFieldsValue({
      demo_scheduled_at: slotDt || (req.demo_scheduled_at ? dayjs(req.demo_scheduled_at) : dayjs().add(1, 'day').hour(10).minute(0)),
      duration_minutes: 30,
      host_id: req.teacher_id || user?.id,
      teacher_id: req.teacher_id || undefined,
      title: `French Demo: ${req.full_name}`,
      require_approval: true,
      meeting_link: req.meeting_link || '',
      notes: req.notes || '',
    });
  };

  const submitSchedule = async (values: {
    demo_scheduled_at: Dayjs;
    duration_minutes?: number;
    host_id?: number;
    teacher_id?: number;
    title?: string;
    require_approval?: boolean;
    meeting_link?: string;
    notes?: string;
  }) => {
    if (!scheduleFor) return;
    setScheduling(true);
    try {
      if (scheduleMode === 'platform') {
        const start = values.demo_scheduled_at.toDate();
        const dur = Math.max(15, Number(values.duration_minutes) || 30);
        const end = new Date(start.getTime() + dur * 60000);
        const res = await apiCall(`/demo-requests/${scheduleFor.id}/schedule-meeting`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scheduled_start: start.toISOString(),
            scheduled_end: end.toISOString(),
            title: values.title?.trim() || undefined,
            host_id: values.host_id || user?.id,
            require_approval: values.require_approval !== false,
            notes: values.notes || '',
            host_timezone: tz || detectBrowserTimezone(),
          }),
        });
        const d = await res.json().catch(() => ({}));
        if (!res.ok) {
          msg.error(d.message || 'Could not schedule the demo meeting');
          return;
        }
        msg.success(`Demo meeting scheduled and added to Admin calendar. ${scheduleFor.full_name} received the join link.`);
        setScheduleFor(null);
        fetchList();
        return;
      }

      const res = await apiCall(`/demo-requests/${scheduleFor.id}/schedule`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          demo_scheduled_at: values.demo_scheduled_at.toISOString(),
          teacher_id: values.teacher_id,
          meeting_link: (values.meeting_link || '').trim(),
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
      msg.success(`Demo scheduled. ${scheduleFor.full_name} and the teacher were emailed.`);
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
      const head = ['Name', 'Email', 'Phone', 'Country', 'Timezone', 'Looking for', 'Exam', 'Exam date', 'Score needed', 'Papers', 'Current level', 'Target level', 'Experience', 'Goals', 'Expected start', 'Preferred schedule', 'Status', 'Demo date', 'Teacher', 'Notes', 'Received'];
      const rows = list.map(x => [x.full_name, x.email, x.phone || '', x.country || '', x.timezone || '',
        INTEREST[interestOf(x)].label,
        x.target_exam ? EXAM_LABELS[x.target_exam] || x.target_exam : '',
        x.exam_date || '', x.target_score || '',
        (x.skills || '').split(',').filter(Boolean).map(k => SKILL_LABELS[k] || k).join(' / '),
        x.current_level || '', x.interested_level || '',
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
    : { month: 'short', day: 'numeric', year: 'numeric' }) : '-');
  const teacherName = (x: DemoRequest) => `${x.teacher_first_name || ''} ${x.teacher_last_name || ''}`.trim();
  const demoPassed = (x: DemoRequest) => !!x.demo_scheduled_at && new Date(x.demo_scheduled_at).getTime() < Date.now();

  const nextAction = (x: DemoRequest): { label: string; icon: React.ReactNode; run: () => void } | null => {
    if (x.latest_availability?.status === 'submitted' && (x.status === 'new' || x.status === 'contacted')) {
      return { label: 'Schedule', icon: <CalendarOutlined />, run: () => openSchedule(x) };
    }
    if (x.status === 'new') return { label: 'Ask availability', icon: <SendOutlined />, run: () => openAskAvailability(x) };
    if (x.status === 'contacted') return { label: 'Schedule demo', icon: <CalendarOutlined />, run: () => openSchedule(x) };
    if (x.status === 'demo_scheduled' && demoPassed(x)) return { label: 'Mark completed', icon: <CheckCircleFilled />, run: () => updateStatus(x, 'completed') };
    if (x.status === 'demo_scheduled' && x.linked_meeting?.code) {
      return { label: 'Open room', icon: <VideoCameraOutlined />, run: () => navigate(`/app/meeting/${x.linked_meeting!.code}`) };
    }
    if (x.status === 'demo_scheduled' && x.meeting_link) return { label: 'Open link', icon: <LinkOutlined />, run: () => window.open(x.meeting_link as string, '_blank', 'noopener,noreferrer') };
    return null;
  };

  const actionsMenu = (x: DemoRequest): MenuProps['items'] => [
    { key: 'view', icon: <UserOutlined />, label: 'Open details', onClick: () => setDrawer(x) },
    { key: 'ask_avail', icon: <SendOutlined />, label: x.latest_availability?.status === 'pending' ? 'Resend availability request' : 'Ask for availability', disabled: x.status === 'completed' || x.status === 'cancelled', onClick: () => openAskAvailability(x) },
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
    const av = x.latest_availability;
    const sub = x.status === 'new' ? `Waiting ${agoText(x.created_at).replace(' ago', '')}`
      : x.status === 'contacted' ? `Contacted ${agoText(x.contacted_at || x.updated_at)}`
        : x.status === 'demo_scheduled' ? (x.demo_scheduled_at ? `${demoPassed(x) ? 'Held' : 'Demo'} ${fmtDate(x.demo_scheduled_at, true)}` : 'Demo booked')
          : x.status === 'completed' ? 'Demo done' : 'Closed';
    return (
      <div className="dr-status">
        <span className={`dr-pill is-${x.status}`}>{STATUS[x.status]?.label || x.status}</span>
        <span className={`dr-status-sub${x.status === 'new' && waiting >= 2 ? ' is-late' : ''}`}>{sub}</span>
        {av?.status === 'submitted' && x.status !== 'demo_scheduled' && x.status !== 'completed' && (
          <Tag color="green" style={{ marginTop: 4, width: 'fit-content', fontSize: 11 }}>
            Availability received{av.submitted_slots?.[0] ? ` · ${av.submitted_slots[0].date}` : ''}
          </Tag>
        )}
        {av?.status === 'pending' && x.status !== 'demo_scheduled' && x.status !== 'completed' && (
          <Tag color="geekblue" style={{ marginTop: 4, width: 'fit-content', fontSize: 11 }}>
            Availability requested
          </Tag>
        )}
      </div>
    );
  };

  const LevelCell: React.FC<{ x: DemoRequest }> = ({ x }) => (
    <div className="dr-level">
      <span className="dr-level-path">
        <b>{x.current_level || '-'}</b>
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
  // An exam date is a calendar day, not an instant: it must not be moved by a
  // time zone on its way to the screen.
  const examDay = (day: string) => dayjs(day).format('MMM D, YYYY');

  const daysTo = (day?: string | null) => {
    if (!day) return '';
    const left = dayjs(day).startOf('day').diff(dayjs().startOf('day'), 'day');
    if (left < 0) return ' · already passed';
    if (left === 0) return ' · today';
    return ` · in ${left} day${left === 1 ? '' : 's'}`;
  };

  const hasFilters = !!(status || interest || level || search || country || range);
  const clearFilters = () => { setStatus(''); setInterest(''); setLevel(undefined); setSearch(''); setCountry(''); setRange(null); };

  const columns: ColumnsType<DemoRequest> = [
    {
      title: 'Requester', key: 'person',
      render: (_, x) => (
        <div className="dr-person">
          <span className="dr-av">{initialsOf(x.full_name)}</span>
          <div className="dr-person-text">
            <strong>{x.full_name}</strong>
            <em>
              <Tooltip title={INTEREST[interestOf(x)].hint}>
                <span className={`dr-kind is-${interestOf(x)}`}>{INTEREST[interestOf(x)].short}</span>
              </Tooltip>
              {x.email}
            </em>
          </div>
        </div>
      ),
    },
    {
      title: 'Contact', key: 'contact', width: 190,
      render: (_, x) => (
        <div className="dr-contact">
          {x.phone ? <span><PhoneOutlined /> {x.phone}</span> : <span className="is-muted"><PhoneOutlined /> No phone</span>}
          <span><EnvironmentOutlined /> {x.country || '-'}</span>
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

        {/* People waiting for a first reply, said plainly at the top of the page. */}
        {stats.new_requests > 0 && (
          <div className="dr-waiting" role="status">
            <span className="dr-waiting-dot" aria-hidden="true"><i /></span>
            <div className="dr-waiting-text">
              <strong>
                {stats.new_requests} new {stats.new_requests === 1 ? 'request is' : 'requests are'} waiting for a reply
              </strong>
              <span>
                {alerts.latest
                  ? `Latest: ${alerts.latest.full_name}${alerts.latest.country ? ` from ${alerts.latest.country}` : ''} · ${agoText(alerts.latest.created_at)}`
                  : 'Answer them while they are still warm.'}
              </span>
            </div>
            {status !== 'new' && (
              <Button type="primary" danger size="small" onClick={() => setStatus('new')}>Show them</Button>
            )}
          </div>
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
                    <em>{stats.total ? `${Math.round((v / stats.total) * 100)}%` : '-'}</em>
                  </button>
                </React.Fragment>
              );
            })}
          </div>
          <div className="dr-pipe-foot">
            <span><b>{stats.this_month}</b> received in the last 30 days</span>
            <span><b>{conversion}%</b> reached a completed demo</span>
            {stats.new_requests > 0 && <span className="is-warn"><ClockCircleOutlined /> <b>{stats.new_requests}</b> waiting for a first reply</span>}
            {!!stats.exam_requests && (
              <span><b>{stats.exam_requests}</b> for exam practice only · <b>{stats.class_requests ?? (stats.total - stats.exam_requests)}</b> for classes</span>
            )}
          </div>
        </section>

        {/* ── Directory ── */}
        <section className="dr-panel" aria-label="Requests">
          <div className="dr-toolbar">
            <Input className="dr-search" prefix={<SearchOutlined />} allowClear placeholder="Search name or email" value={search} onChange={e => setSearch(e.target.value)} />
            <Select
              className="dr-filter"
              allowClear
              placeholder="Classes or exam"
              value={interest || undefined}
              onChange={(value) => { setInterest((value as Interest) || ''); setPage(1); }}
              options={(['classes', 'exam'] as Interest[]).map(key => ({ value: key, label: INTEREST[key].label }))}
            />
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
            <div className="dr-dfoot" style={{ flexWrap: 'wrap' }}>
              {dNext && <Button type="primary" icon={dNext.icon} loading={busyId === d.id} onClick={dNext.run}>{dNext.label}</Button>}
              {d.status !== 'completed' && d.status !== 'cancelled' && (
                <Button icon={<SendOutlined />} onClick={() => openAskAvailability(d)}>
                  {d.latest_availability?.status === 'pending' ? 'Resend availability' : 'Ask availability'}
                </Button>
              )}
              {d.status !== 'completed' && d.status !== 'cancelled' && (
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
                  {d.phone && d.phone.replace(/[^\d]/g, '').length >= 7 && (
                    <a className="dr-chip-btn" href={`https://wa.me/${d.phone.replace(/[^\d]/g, '')}`} target="_blank" rel="noopener noreferrer"><WhatsAppOutlined /> WhatsApp</a>
                  )}
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
                      <span className="dr-step-text"><strong>{STATUS[k].label}</strong><em>{stepDates[k] && i <= stepIndex ? fmtDate(stepDates[k]) : '-'}</em></span>
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
                    {d.linked_meeting?.code && (
                      <em style={{ marginTop: 4 }}>
                        ID: <code>{d.linked_meeting.code}</code>
                        {d.linked_meeting.passcode ? <> · Pass: <code>{d.linked_meeting.passcode}</code></> : null}
                      </em>
                    )}
                  </div>
                  {(d.meeting_link || d.linked_meeting) && (
                    <div className="dr-demo-actions" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {d.linked_meeting?.code && (
                        <Button size="small" type="primary" icon={<VideoCameraOutlined />} onClick={() => navigate(`/app/meeting/${d.linked_meeting!.code}`)}>
                          Open room
                        </Button>
                      )}
                      {d.meeting_link && (
                        <Tooltip title="Copy public meeting link"><Button size="small" icon={<CopyOutlined />} onClick={() => copy(d.meeting_link as string, 'Meeting link')} aria-label="Copy link" /></Tooltip>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── Availability request / submitted slots ── */}
              <section className="dr-sec">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <h4 style={{ margin: 0 }}>Availability workflow</h4>
                  {d.status !== 'completed' && d.status !== 'cancelled' && (
                    <Button size="small" icon={<SendOutlined />} onClick={() => openAskAvailability(d)}>
                      {d.latest_availability ? 'Send new link' : 'Ask for availability'}
                    </Button>
                  )}
                </div>
                {!d.latest_availability ? (
                  <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
                    No availability link sent yet. Click <strong>Ask for availability</strong> to send a one-time scheduling link.
                  </p>
                ) : d.latest_availability.status === 'submitted' ? (
                  <div style={{ padding: 12, borderRadius: 10, background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <Tag color="green" style={{ margin: 0 }}>Availability received</Tag>
                      <span style={{ fontSize: 11.5, color: '#065f46' }}>
                        {d.latest_availability.submitted_timezone}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {(d.latest_availability.submitted_slots || []).map((sl, i) => {
                        const localDt = slotToLocalDayjs(sl, d.latest_availability?.submitted_timezone);
                        return (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, background: '#ffffff', padding: '6px 10px', borderRadius: 8, border: '1px solid #d1fae5' }}>
                            <div style={{ fontSize: 12.5 }}>
                              <strong>{dayjs(sl.date).format('ddd, MMM D, YYYY')}</strong> · {sl.start} - {sl.end} ({d.latest_availability?.submitted_timezone})
                              {localDt && (
                                <div style={{ fontSize: 11.5, color: '#64748b' }}>
                                  Your time: {localDt.format('ddd, MMM D · HH:mm')} ({timezoneLabel(tz)})
                                </div>
                              )}
                            </div>
                            {d.status !== 'completed' && d.status !== 'cancelled' && (
                              <Button size="small" type="primary" onClick={() => openSchedule(d, sl)}>
                                Schedule
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {d.latest_availability.submitted_note && (
                      <div style={{ marginTop: 8, fontSize: 12.5, color: '#065f46' }}>
                        <strong>Prospect note:</strong> {d.latest_availability.submitted_note}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ padding: 12, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: 12.5 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <Tag color={d.latest_availability.status === 'pending' ? 'geekblue' : 'orange'} style={{ margin: 0 }}>
                        {d.latest_availability.status === 'pending' ? 'Waiting for prospect response' : d.latest_availability.status}
                      </Tag>
                      <span style={{ fontSize: 11.5, color: '#64748b' }}>{d.latest_availability.proposed_timezone}</span>
                    </div>
                    {d.latest_availability.proposed_slots && d.latest_availability.proposed_slots.length > 0 ? (
                      <div className="dr-proposed-list">
                        {d.latest_availability.proposed_slots.map((sl, idx) => (
                          <div key={idx} className="dr-proposed-item">
                            <strong>
                              {sl.end_date && sl.end_date !== sl.date
                                ? `${dayjs(sl.date).format('ddd, MMM D')} to ${dayjs(sl.end_date).format('ddd, MMM D, YYYY')}`
                                : dayjs(sl.date).format('ddd, MMM D, YYYY')}
                            </strong>
                            <span>{sl.start} - {sl.end}{sl.end_date && sl.end_date !== sl.date ? ' (daily)' : ''}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ marginTop: 6, color: '#334155' }}>
                        Proposed: <strong>{d.latest_availability.proposed_start_date} to {d.latest_availability.proposed_end_date}</strong> · {d.latest_availability.proposed_time_start} - {d.latest_availability.proposed_time_end}
                      </div>
                    )}
                  </div>
                )}
              </section>

              <section className="dr-sec">
                <h4>Contact</h4>
                <dl className="dr-facts">
                  <div><dt>Email</dt><dd>{d.email}</dd></div>
                  <div><dt>WhatsApp</dt><dd>{d.phone || '-'}</dd></div>
                  <div><dt>Country</dt><dd>{d.country || '-'}</dd></div>
                  <div><dt>Timezone</dt><dd>{d.timezone ? <>{d.timezone.replace(/_/g, ' ')}{dTz && <small> · now {inTz(new Date(), dTz, { hour: 'numeric', minute: '2-digit', hour12: true })}</small>}</> : '-'}</dd></div>
                </dl>
              </section>

              {interestOf(d) === 'exam' && (
                <section className="dr-sec dr-exam">
                  <h4><TrophyOutlined /> Exam preparation only</h4>
                  <p className="dr-exam-note">No classes asked for: this person wants mock exams and corrections.</p>
                  <dl className="dr-facts">
                    <div><dt>Exam</dt><dd>{d.target_exam ? EXAM_LABELS[d.target_exam] || d.target_exam : '-'}</dd></div>
                    <div><dt>Exam date</dt><dd>{d.exam_date ? `${examDay(d.exam_date)}${daysTo(d.exam_date)}` : 'Not booked yet'}</dd></div>
                    <div><dt>Score needed</dt><dd>{d.target_score || '-'}</dd></div>
                    <div><dt>Sat it before</dt><dd>{hasExperience(d.has_previous_experience) ? 'Yes' : 'Not yet'}</dd></div>
                  </dl>
                  {d.skills && (
                    <div className="dr-exam-skills">
                      {d.skills.split(',').filter(Boolean).map(skill => (
                        <span key={skill}>{SKILL_LABELS[skill] || skill}</span>
                      ))}
                    </div>
                  )}
                </section>
              )}

              <section className="dr-sec">
                <h4>Learning profile</h4>
                <dl className="dr-facts">
                  <div><dt>Looking for</dt><dd>{INTEREST[interestOf(d)].label}</dd></div>
                  <div><dt>Level</dt><dd>{d.current_level || '-'}{d.interested_level && ` → wants ${d.interested_level}`}</dd></div>
                  <div><dt>Experience</dt><dd>{hasExperience(d.has_previous_experience) ? 'Has studied French before' : 'First time learning'}</dd></div>
                  {d.previous_study_method && <div><dt>Studied with</dt><dd>{d.previous_study_method}</dd></div>}
                  <div><dt>Wants to start</dt><dd>{d.expected_start_time || '-'}</dd></div>
                  {interestOf(d) === 'classes' && <div><dt>Availability</dt><dd>{d.preferred_schedule || '-'}</dd></div>}
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

        {/* ── Ask for availability ── */}
        <Modal
          open={!!availFor}
          onCancel={() => !sendingAvail && setAvailFor(null)}
          footer={null}
          width={640}
          centered
          className="dr-modal"
          maskClosable={!sendingAvail}
          closable={!sendingAvail}
        >
          <div className="dr-md">
            <header className="dr-md-head">
              <span className="dr-md-ic"><SendOutlined /></span>
              <div>
                <h3>Ask for availability</h3>
                <p>{availFor?.full_name} · {availFor?.email}</p>
              </div>
            </header>
            <Form form={availForm} layout="vertical" requiredMark={false} onFinish={submitAskAvailability} className="dr-md-body">
              <Form.Item
                name="proposed_timezone"
                label="Your timezone for these options"
                rules={[{ required: true, message: 'Select timezone' }]}
                extra={availFor?.timezone ? `Prospect timezone: ${availFor.timezone.replace(/_/g, ' ')} (converted automatically on their booking page)` : undefined}
              >
                <Select
                  showSearch
                  optionFilterProp="label"
                  options={COMMON_TIMEZONES.map(t => ({ value: t.value, label: t.label }))}
                />
              </Form.Item>

              <div className="dr-slots-head">
                <span className="dr-slots-label">
                  Proposed date or range options
                  <span className="dr-slots-count">{proposedSlots.length}/15</span>
                </span>
                {proposedSlots.length < 15 && (
                  <Button type="link" size="small" icon={<PlusOutlined />} onClick={addProposedSlot} style={{ paddingInline: 0 }}>
                    Add option
                  </Button>
                )}
              </div>

              <div className="dr-slots-list">
                {proposedSlots.map((slot, idx) => (
                  <div key={slot.id} className="dr-slot-card">
                    <div className="dr-slot-card-head">
                      <span className="dr-slot-idx">Option {idx + 1}</span>
                      <div className="dr-slot-mode" role="group" aria-label={`Option ${idx + 1} date mode`}>
                        <button
                          type="button"
                          className={!slot.isRange ? 'is-on' : ''}
                          onClick={() => toggleProposedSlotMode(slot.id, false)}
                        >
                          Single day
                        </button>
                        <button
                          type="button"
                          className={slot.isRange ? 'is-on' : ''}
                          onClick={() => toggleProposedSlotMode(slot.id, true)}
                        >
                          Date range
                        </button>
                      </div>
                      <div className="dr-slot-actions">
                        <Tooltip title="Duplicate option">
                          <Button
                            type="text"
                            size="small"
                            icon={<CopyOutlined />}
                            disabled={proposedSlots.length >= 15}
                            onClick={() => duplicateProposedSlot(idx)}
                            aria-label={`Duplicate option ${idx + 1}`}
                          />
                        </Tooltip>
                        <Tooltip title="Remove option">
                          <Button
                            danger
                            type="text"
                            size="small"
                            icon={<DeleteOutlined />}
                            disabled={proposedSlots.length <= 1}
                            onClick={() => removeProposedSlot(slot.id)}
                            aria-label={`Remove option ${idx + 1}`}
                          />
                        </Tooltip>
                      </div>
                    </div>

                    <div className={`dr-slot-fields${slot.isRange ? ' is-range' : ''}`}>
                      <div className="dr-slot-field">
                        <span>{slot.isRange ? 'From date' : 'Date'}</span>
                        <DatePicker
                          value={slot.date}
                          format="ddd, MMM D, YYYY"
                          placeholder="Select date"
                          allowClear={false}
                          disabledDate={dt => dt.isBefore(dayjs().startOf('day'))}
                          onChange={d => {
                            const fixEnd = slot.isRange && d && slot.endDate && slot.endDate.isBefore(d, 'day')
                              ? d.add(1, 'day')
                              : slot.endDate;
                            updateProposedSlot(slot.id, { date: d, ...(slot.isRange ? { endDate: fixEnd } : {}) });
                          }}
                          style={{ width: '100%' }}
                        />
                      </div>

                      {slot.isRange && (
                        <div className="dr-slot-field">
                          <span>To date</span>
                          <DatePicker
                            value={slot.endDate}
                            format="ddd, MMM D, YYYY"
                            placeholder="End date"
                            allowClear={false}
                            disabledDate={dt => {
                              const min = slot.date ? slot.date.startOf('day') : dayjs().startOf('day');
                              return dt.isBefore(min) || dt.isAfter(min.add(31, 'day'));
                            }}
                            onChange={d => updateProposedSlot(slot.id, { endDate: d })}
                            style={{ width: '100%' }}
                          />
                        </div>
                      )}

                      <div className="dr-slot-field">
                        <span>{slot.isRange ? 'Daily from' : 'From'}</span>
                        <TimePicker
                          value={slot.start}
                          format="HH:mm"
                          minuteStep={15}
                          placeholder="From"
                          allowClear={false}
                          onChange={t => updateProposedSlot(slot.id, { start: t })}
                          style={{ width: '100%' }}
                        />
                      </div>

                      <div className="dr-slot-field">
                        <span>{slot.isRange ? 'Daily until' : 'To'}</span>
                        <TimePicker
                          value={slot.end}
                          format="HH:mm"
                          minuteStep={15}
                          placeholder="To"
                          allowClear={false}
                          onChange={t => updateProposedSlot(slot.id, { end: t })}
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {availError && (
                <div className="dr-slot-error" role="alert">{availError}</div>
              )}

              <Form.Item name="admin_note" label="Note for prospect (optional)" style={{ marginBottom: 10 }}>
                <Input.TextArea rows={2} maxLength={800} placeholder="e.g. Pick any 30-minute window that suits your schedule." />
              </Form.Item>
              <p className="dr-md-info"><MailOutlined /> {availFor?.full_name} will receive these exact options by email with a single-use link.</p>
            </Form>
            <footer className="dr-md-foot">
              <Button onClick={() => setAvailFor(null)} disabled={sendingAvail}>Cancel</Button>
              <Button type="primary" icon={<SendOutlined />} loading={sendingAvail} onClick={() => availForm.submit()}>
                Send availability link
              </Button>
            </footer>
          </div>
        </Modal>

        {/* ── Schedule demo ── */}
        <Modal open={!!scheduleFor} onCancel={() => !scheduling && setScheduleFor(null)} footer={null} width={560} centered className="dr-modal"
          maskClosable={!scheduling} closable={!scheduling} forceRender>
          <div className="dr-md">
            <header className="dr-md-head">
              <span className="dr-md-ic"><CalendarOutlined /></span>
              <div>
                <h3>{scheduleFor?.demo_scheduled_at ? 'Reschedule demo' : 'Schedule a demo'}</h3>
                <p>{scheduleFor?.full_name} · {scheduleFor?.current_level || '-'}{scheduleFor?.country ? ` · ${scheduleFor.country}` : ''}</p>
              </div>
            </header>
            {scheduleFor?.latest_availability?.status === 'submitted' && (scheduleFor.latest_availability.submitted_slots?.length || 0) > 0 && (
              <div className="dr-md-pref" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
                <span><strong>Submitted availability</strong> ({scheduleFor.latest_availability.submitted_timezone}). Click a slot to pre-fill:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {scheduleFor.latest_availability.submitted_slots!.map((sl, i) => (
                    <Button
                      key={i}
                      size="small"
                      onClick={() => {
                        const dt = slotToLocalDayjs(sl, scheduleFor.latest_availability?.submitted_timezone);
                        if (dt) scheduleForm.setFieldValue('demo_scheduled_at', dt);
                      }}
                    >
                      {sl.date} {sl.start}–{sl.end}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {scheduleFor?.preferred_schedule && !scheduleFor?.latest_availability?.submitted_slots?.length && (
              <div className="dr-md-pref"><ClockCircleOutlined /><span><strong>Their availability</strong>{scheduleFor.preferred_schedule}{scheduleFor.timezone ? ` · ${scheduleFor.timezone.replace(/_/g, ' ')}` : ''}</span></div>
            )}
            <div style={{ padding: '12px 24px 0' }}>
              <Segmented
                block
                value={scheduleMode}
                onChange={v => setScheduleMode(v as 'platform' | 'external')}
                options={[
                  { value: 'platform', label: 'Create live meeting (auto link & Calendar)' },
                  { value: 'external', label: 'Use external URL' },
                ]}
              />
            </div>
            <Form form={scheduleForm} layout="vertical" requiredMark={false} onFinish={submitSchedule} className="dr-md-body">
              <Form.Item name="demo_scheduled_at" label="Date and time" rules={[{ required: true, message: 'Pick the date and time' }]}
                extra={pickedDate && sTz && sTz !== tz ? `Their local time: ${inTz(pickedDate.toDate(), sTz, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}` : `Your time (${timezoneLabel(tz)})`}>
                <DatePicker showTime={{ format: 'HH:mm', minuteStep: 15 }} format="ddd, MMM D YYYY · HH:mm" style={{ width: '100%' }}
                  disabledDate={dt => dt.isBefore(dayjs().startOf('day'))} />
              </Form.Item>
              {scheduleMode === 'platform' ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: 12 }}>
                    <Form.Item name="title" label="Meeting title">
                      <Input maxLength={160} placeholder="French Demo Session" />
                    </Form.Item>
                    <Form.Item name="duration_minutes" label="Duration (min)">
                      <InputNumber min={15} max={180} step={15} style={{ width: '100%' }} />
                    </Form.Item>
                  </div>
                  <Form.Item name="host_id" label="Host (Admin or Teacher)">
                    <Select showSearch optionFilterProp="label" placeholder="Select host"
                      options={hosts.map(h => ({ value: h.id, label: `${h.first_name} ${h.last_name} (${h.role}) · ${h.email}` }))} />
                  </Form.Item>
                  <Form.Item name="require_approval" label="Guest joining policy">
                    <Radio.Group style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <Radio value={true}><strong>Require host approval:</strong> prospect waits in lobby</Radio>
                      <Radio value={false}><strong>Direct entry:</strong> prospect joins immediately once live</Radio>
                    </Radio.Group>
                  </Form.Item>
                </>
              ) : (
                <>
                  <Form.Item name="teacher_id" label="Teacher" rules={[{ required: true, message: 'Choose a teacher' }]}>
                    <Select showSearch optionFilterProp="label" placeholder="Search a teacher"
                      options={teachers.map(t => ({ value: t.id, label: `${t.first_name} ${t.last_name} · ${t.email}` }))} />
                  </Form.Item>
                  <Form.Item name="meeting_link" label="Meeting link"
                    rules={[{ required: true, message: 'Add the meeting link' }, { type: 'url', message: 'Enter a full link, e.g. https://meet.google.com/…' }]}>
                    <Input prefix={<LinkOutlined />} placeholder="https://meet.google.com/abc-defg-hij" />
                  </Form.Item>
                </>
              )}
              <Form.Item name="notes" label="Note for the participant">
                <Input.TextArea autoSize={{ minRows: 2, maxRows: 5 }} placeholder="Anything they should prepare…" maxLength={1000} />
              </Form.Item>
              <p className="dr-md-info">
                <MailOutlined />{' '}
                {scheduleMode === 'platform'
                  ? 'Creates the meeting, adds it to Admin Calendar, and automatically emails the join link, ID & passcode.'
                  : 'A confirmation email goes to the student and the teacher.'}
              </p>
            </Form>
            <footer className="dr-md-foot">
              <Button onClick={() => setScheduleFor(null)} disabled={scheduling}>Cancel</Button>
              <Button type="primary" icon={<CalendarOutlined />} loading={scheduling} onClick={() => scheduleForm.submit()}>
                {scheduleMode === 'platform' ? 'Schedule & email link' : (scheduleFor?.demo_scheduled_at ? 'Save & notify' : 'Schedule & notify')}
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
