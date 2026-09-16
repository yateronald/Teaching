import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Button, ConfigProvider, DatePicker, Drawer, Dropdown, Form, Input, InputNumber, Modal, Segmented, Select, Skeleton, Switch, TimePicker, Tooltip, message,
} from 'antd';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
    CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseOutlined, CopyOutlined, DeleteOutlined, EditOutlined,
    EnvironmentOutlined, FieldTimeOutlined, InfoCircleOutlined, LinkOutlined, MoreOutlined, PlayCircleOutlined,
    PlusOutlined, ReloadOutlined, SearchOutlined, StopOutlined, TeamOutlined, VideoCameraOutlined, WarningOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import useResponsive from '../../hooks/useResponsive';
import { headerHeight } from '../Layout/layoutMetrics';
import { resolveTimezone, timezoneLabel } from '../../utils/timezone';
import { dayKeyIn, isoToWall, nowWallIn, wallToIso } from '../../utils/zonedTime';
import './Teacher.css';
import './Schedule.css';

/* ══════════════════════════════════════════
   SCHEDULE — the teacher's classes: what is next, what happened, and booking more.
   Every time on this page (agenda, calendar, pickers) is the teacher's profile time zone.
══════════════════════════════════════════ */

type SessionType = 'class' | 'exam' | 'assignment' | 'quiz' | 'meeting' | 'other';
type Status = 'scheduled' | 'completed' | 'cancelled';
type LiveState = 'cancelled' | 'completed' | 'ended' | 'live' | 'soon' | 'scheduled';
type Scope = 'upcoming' | 'past' | 'all';
type ViewMode = 'agenda' | 'calendar';

interface Item {
    id: number;
    title: string;
    description: string;
    batch_id: number;
    batch_name: string;
    start: string;
    end: string;
    type: SessionType;
    status: Status;
    location_mode: 'online' | 'physical';
    location: string;
    link: string | null;
    startsIn: number | null;
    endsIn: number | null;
}
interface Batch { id: number; name: string; student_count?: number }
interface Session { id: number; access_code: string; code_expires_at: string | null; status: string }

const TYPES: Record<SessionType, { label: string; tone: string }> = {
    class: { label: 'Class', tone: 'is-class' },
    exam: { label: 'Exam', tone: 'is-exam' },
    quiz: { label: 'Quiz', tone: 'is-quiz' },
    assignment: { label: 'Assignment', tone: 'is-assignment' },
    meeting: { label: 'Meeting', tone: 'is-meeting' },
    other: { label: 'Other', tone: 'is-other' },
};
const TYPE_KEYS = Object.keys(TYPES) as SessionType[];
const STATE_LABEL: Record<LiveState, string> = { cancelled: 'Cancelled', completed: 'Completed', ended: 'Ended', live: 'Live now', soon: 'Starting soon', scheduled: 'Scheduled' };
const DURATIONS = [30, 45, 60, 90, 120];
const WALL = 'YYYY-MM-DDTHH:mm';
const num = (v: unknown): number | null => (v === null || v === undefined || v === '' || Number.isNaN(Number(v)) ? null : Number(v));

const stateOf = (item: Item, elapsed: number): LiveState => {
    if (item.status === 'cancelled') return 'cancelled';
    if (item.status === 'completed') return 'completed';
    const startsIn = item.startsIn === null ? null : item.startsIn - elapsed;
    const endsIn = item.endsIn === null ? null : item.endsIn - elapsed;
    if (endsIn !== null && endsIn <= 0) return 'ended';
    if (startsIn !== null && startsIn <= 0) return 'live';
    if (startsIn !== null && startsIn <= 900) return 'soon';
    return 'scheduled';
};
const fmtSpan = (seconds: number) => {
    const s = Math.max(0, Math.round(seconds));
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (d >= 1) return h ? `${d}d ${h}h` : `${d}d`;
    if (h >= 1) return m ? `${h}h ${m}m` : `${h}h`;
    return m >= 1 ? `${m} min` : 'less than a minute';
};
const toWallString = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const ScheduleManagement: React.FC = () => {
    const { apiCall, user } = useAuth();
    const r = useResponsive();
    const [msg, msgHolder] = message.useMessage();
    const [modal, modalHolder] = Modal.useModal();
    const tz = resolveTimezone(user?.timezone);
    const [form] = Form.useForm();

    const [items, setItems] = useState<Item[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [sessions, setSessions] = useState<Record<number, Session>>({});
    const [fetchedAt, setFetchedAt] = useState(() => Date.now());
    const [now, setNow] = useState(() => Date.now());
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [view, setView] = useState<ViewMode>('agenda');
    const [scope, setScope] = useState<Scope>('upcoming');
    const [search, setSearch] = useState('');
    const [batchFilter, setBatchFilter] = useState<number | null>(null);
    const [typeFilter, setTypeFilter] = useState<SessionType | null>(null);

    const [editing, setEditing] = useState<{ item: Item | null; open: boolean }>({ item: null, open: false });
    const [saving, setSaving] = useState(false);
    const [details, setDetails] = useState<number | null>(null);
    const [startFor, setStartFor] = useState<Item | null>(null);
    const [starting, setStarting] = useState(false);

    /* ── Data ── */
    const load = useCallback(async (opts: { quiet?: boolean } = {}) => {
        if (!opts.quiet) setRefreshing(true);
        try {
            const today = dayKeyIn(new Date().toISOString(), tz);
            const [sRes, bRes, aRes] = await Promise.all([apiCall('/schedules'), apiCall('/batches'), apiCall(`/attendance/sessions?date=${today}`)]);
            if (!sRes.ok) throw new Error((await sRes.json().catch(() => ({})))?.error || `The server answered ${sRes.status}.`);
            const raw = await sRes.json();
            const list: any[] = Array.isArray(raw) ? raw : raw?.schedules || [];
            setItems(list.map((s: any): Item => ({
                id: Number(s.id),
                title: s.title || 'Untitled',
                description: s.description || '',
                batch_id: Number(s.batch_id),
                batch_name: s.batch_name || '',
                start: s.start_time,
                end: s.end_time,
                type: (TYPE_KEYS.includes(s.type) ? s.type : 'other') as SessionType,
                status: (['scheduled', 'completed', 'cancelled'].includes(String(s.status || '').toLowerCase()) ? String(s.status).toLowerCase() : 'scheduled') as Status,
                location_mode: s.location_mode === 'physical' ? 'physical' : 'online',
                location: s.location && s.location !== '--' ? s.location : '',
                link: s.link || null,
                startsIn: num(s.seconds_until_start),
                endsIn: num(s.seconds_until_end),
            })));
            if (bRes.ok) {
                const bData = await bRes.json();
                setBatches((Array.isArray(bData) ? bData : bData?.batches || []).map((b: any) => ({ id: Number(b.id), name: b.name, student_count: num(b.student_count) ?? undefined })));
            }
            if (aRes.ok) {
                const aData = await aRes.json();
                const map: Record<number, Session> = {};
                (Array.isArray(aData?.sessions) ? aData.sessions : []).forEach((s: any) => {
                    const scheduleId = Number(s.schedule_id);
                    const dead = ['ended', 'completed', 'cancelled'].includes(String(s.status || '').toLowerCase());
                    if (scheduleId && s.access_code && !dead) map[scheduleId] = { id: Number(s.id), access_code: s.access_code, code_expires_at: s.code_expires_at || null, status: s.status };
                });
                setSessions(map);
            }
            const t = Date.now();
            setFetchedAt(t);
            setNow(t);
            setError(null);
        } catch (e: any) {
            setError(e?.message || 'Your schedule could not be loaded.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [apiCall, tz]);

    useEffect(() => { load({ quiet: true }); }, [load]);
    useEffect(() => {
        const id = window.setInterval(() => setNow(Date.now()), 20_000);
        return () => window.clearInterval(id);
    }, []);
    const elapsed = Math.max(0, (now - fetchedAt) / 1000);

    /* ── Formatting in the profile zone ── */
    const fmt = useMemo(() => {
        const time = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit' });
        const dayLong = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'long', month: 'long', day: 'numeric' });
        const dayShort = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short', month: 'short', day: 'numeric' });
        const full = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
        return {
            time: (iso: string) => time.format(new Date(iso)),
            range: (a: string, b: string) => `${time.format(new Date(a))} – ${time.format(new Date(b))}`,
            dayLong: (iso: string) => dayLong.format(new Date(iso)),
            dayShort: (iso: string) => dayShort.format(new Date(iso)),
            full: (iso: string) => full.format(new Date(iso)),
        };
    }, [tz]);
    const todayKey = dayKeyIn(new Date(now).toISOString(), tz);
    const dayLabel = (iso: string) => {
        const key = dayKeyIn(iso, tz);
        const diff = Math.round((Date.parse(`${key}T00:00:00Z`) - Date.parse(`${todayKey}T00:00:00Z`)) / 86_400_000);
        if (diff === 0) return 'Today';
        if (diff === 1) return 'Tomorrow';
        if (diff === -1) return 'Yesterday';
        return fmt.dayLong(iso);
    };

    /* ── Derived ── */
    const withState = useMemo(() => items.map(i => ({ item: i, state: stateOf(i, elapsed) })), [items, elapsed]);
    const isPast = (s: LiveState) => s === 'ended' || s === 'completed';

    const kpi = useMemo(() => {
        const monthKey = todayKey.slice(0, 7);
        let today = 0, week = 0, upcoming = 0, minutes = 0;
        withState.forEach(({ item, state }) => {
            const key = dayKeyIn(item.start, tz);
            if (state !== 'cancelled' && key === todayKey) today++;
            if (state === 'scheduled' || state === 'soon' || state === 'live') {
                upcoming++;
                const days = Math.round((Date.parse(`${key}T00:00:00Z`) - Date.parse(`${todayKey}T00:00:00Z`)) / 86_400_000);
                if (days >= 0 && days < 7) week++;
            }
            if (item.type === 'class' && isPast(state) && key.slice(0, 7) === monthKey) {
                minutes += Math.max(0, (Date.parse(item.end) - Date.parse(item.start)) / 60_000);
            }
        });
        return { today, week, upcoming, hours: Math.round(minutes / 6) / 10 };
    }, [withState, todayKey, tz]);

    const next = useMemo(() => withState
        .filter(x => x.state === 'live' || x.state === 'soon' || x.state === 'scheduled')
        .sort((a, b) => Date.parse(a.item.start) - Date.parse(b.item.start))[0] ?? null, [withState]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return withState.filter(({ item, state }) => {
            if (scope === 'upcoming' && (isPast(state) || state === 'cancelled')) return false;
            if (scope === 'past' && !isPast(state) && state !== 'cancelled') return false;
            if (batchFilter && item.batch_id !== batchFilter) return false;
            if (typeFilter && item.type !== typeFilter) return false;
            if (q && !`${item.title} ${item.description} ${item.batch_name}`.toLowerCase().includes(q)) return false;
            return true;
        });
    }, [withState, scope, batchFilter, typeFilter, search]);

    const groups = useMemo(() => {
        const sorted = [...filtered].sort((a, b) => scope === 'past'
            ? Date.parse(b.item.start) - Date.parse(a.item.start)
            : Date.parse(a.item.start) - Date.parse(b.item.start));
        const map = new Map<string, typeof sorted>();
        sorted.forEach(entry => {
            const key = dayKeyIn(entry.item.start, tz);
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(entry);
        });
        return [...map.entries()];
    }, [filtered, scope, tz]);

    /* ── Actions ── */
    const openCreate = (prefill?: { start?: string; end?: string }) => {
        const startWall = prefill?.start ?? isoToWall(new Date(Math.ceil(Date.now() / 900_000) * 900_000).toISOString(), tz) ?? nowWallIn(tz);
        const endWall = prefill?.end ?? dayjs(startWall).add(1, 'hour').format(WALL);
        form.resetFields();
        form.setFieldsValue({
            title: '', description: '', batch_id: batches.length === 1 ? batches[0].id : undefined, type: 'class',
            date: dayjs(startWall), start_time: dayjs(startWall), duration: Math.max(15, dayjs(endWall).diff(dayjs(startWall), 'minute')),
            location_mode: 'online', link: '', location: '', status: 'scheduled', repeat: false, repeat_weeks: 4,
        });
        setEditing({ item: null, open: true });
    };
    const openEdit = (item: Item) => {
        const startWall = isoToWall(item.start, tz) as string;
        form.resetFields();
        form.setFieldsValue({
            title: item.title, description: item.description, batch_id: item.batch_id, type: item.type,
            date: dayjs(startWall), start_time: dayjs(startWall),
            duration: Math.max(5, Math.round((Date.parse(item.end) - Date.parse(item.start)) / 60_000)),
            location_mode: item.location_mode, link: item.link || '', location: item.location, status: item.status, repeat: false, repeat_weeks: 4,
        });
        setEditing({ item, open: true });
    };
    const duplicate = (item: Item) => {
        const startWall = dayjs(isoToWall(item.start, tz) as string).add(7, 'day');
        form.resetFields();
        form.setFieldsValue({
            title: item.title, description: item.description, batch_id: item.batch_id, type: item.type,
            date: startWall, start_time: startWall,
            duration: Math.max(5, Math.round((Date.parse(item.end) - Date.parse(item.start)) / 60_000)),
            location_mode: item.location_mode, link: item.link || '', location: item.location, status: 'scheduled', repeat: false, repeat_weeks: 4,
        });
        setEditing({ item: null, open: true });
    };

    const submit = async () => {
        let v: any;
        try { v = await form.validateFields(); } catch { return; }
        const item = editing.item;
        const startWall = `${v.date.format('YYYY-MM-DD')}T${v.start_time.format('HH:mm')}`;
        const startIso = wallToIso(startWall, tz);
        if (!startIso) { msg.error('That start time could not be read.'); return; }
        const endIso = new Date(Date.parse(startIso) + Number(v.duration) * 60_000).toISOString();
        if (!item && Date.parse(endIso) < Date.now()) { msg.error('That session would already be over. Pick a future time.'); return; }

        const payload = {
            title: v.title.trim(),
            description: (v.description || '').trim(),
            batch_id: v.batch_id,
            start_time: startIso,
            end_time: endIso,
            type: v.type,
            status: v.status || 'scheduled',
            location_mode: v.location_mode,
            location: v.location_mode === 'physical' ? v.location : undefined,
            link: v.location_mode === 'online' ? v.link : undefined,
        };

        setSaving(true);
        try {
            if (item) {
                const res = await apiCall(`/schedules/${item.id}`, { method: 'PUT', body: JSON.stringify(payload) });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(data?.error || 'The session could not be saved.');
                msg.success('Session updated');
            } else {
                const repeats = v.repeat ? Math.min(16, Math.max(2, Number(v.repeat_weeks) || 2)) : 1;
                let created = 0;
                const clashes: string[] = [];
                for (let w = 0; w < repeats; w++) {
                    const weekStart = w === 0 ? startIso : wallToIso(dayjs(startWall).add(w, 'week').format(WALL), tz) as string;
                    const weekEnd = new Date(Date.parse(weekStart) + Number(v.duration) * 60_000).toISOString();
                    const res = await apiCall('/schedules', { method: 'POST', body: JSON.stringify({ ...payload, start_time: weekStart, end_time: weekEnd }) });
                    const data = await res.json().catch(() => ({}));
                    if (res.ok) created++;
                    else if (/conflict/i.test(data?.error || '')) clashes.push(fmt.dayShort(weekStart));
                    else throw new Error(data?.error || 'The session could not be created.');
                }
                if (!created) throw new Error(`That slot clashes with another session for this batch${clashes.length > 1 ? ' on every date' : ''}.`);
                msg.success(clashes.length
                    ? `${created} of ${repeats} sessions created — ${clashes.join(', ')} clashed with existing sessions`
                    : repeats > 1 ? `${created} weekly sessions created` : 'Session created');
            }
            setEditing({ item: null, open: false });
            await load({ quiet: true });
        } catch (e: any) {
            msg.error(e?.message || 'The session could not be saved.');
        } finally {
            setSaving(false);
        }
    };

    const remove = (item: Item) => modal.confirm({
        title: `Delete “${item.title}”?`,
        icon: <DeleteOutlined />,
        content: 'Students lose it from their schedule. Attendance already recorded for it is kept.',
        okText: 'Delete session',
        okButtonProps: { danger: true },
        onOk: async () => {
            const res = await apiCall(`/schedules/${item.id}`, { method: 'DELETE' });
            if (!res.ok) { msg.error('The session could not be deleted.'); throw new Error('delete failed'); }
            setItems(xs => xs.filter(x => x.id !== item.id));
            setDetails(null);
            msg.success('Session deleted');
        },
    });

    const setStatus = async (item: Item, status: Status) => {
        const res = await apiCall(`/schedules/${item.id}`, { method: 'PUT', body: JSON.stringify({ status }) });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) { msg.error(data?.error || 'The status could not be changed.'); return; }
        msg.success(status === 'cancelled' ? 'Session cancelled' : 'Session marked completed');
        load({ quiet: true });
    };

    const copyText = async (text: string, what: string) => {
        try { await navigator.clipboard.writeText(text); msg.success(`${what} copied`); }
        catch { msg.error('Your browser blocked the clipboard.'); }
    };

    const startClass = async (item: Item) => {
        setStarting(true);
        try {
            const res = await apiCall(`/attendance/sessions/${item.id}/start`, {
                method: 'POST',
                body: JSON.stringify({ sessionDate: dayKeyIn(item.start, tz) }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.error || 'The class session could not be started.');
            setSessions(s => ({ ...s, [item.id]: { id: Number(data.sessionId), access_code: data.accessCode, code_expires_at: data.expiresAt || null, status: 'active' } }));
            msg.success('Class started — the access code was emailed to the students');
        } catch (e: any) {
            msg.error(e?.message || 'The class session could not be started.');
        } finally {
            setStarting(false);
        }
    };
    const endClass = async (item: Item) => {
        const session = sessions[item.id];
        if (!session) return;
        modal.confirm({
            title: 'End this class session?',
            icon: <StopOutlined />,
            content: 'The access code stops working, so students can no longer check in.',
            okText: 'End session',
            okButtonProps: { danger: true },
            onOk: async () => {
                const res = await apiCall(`/attendance/sessions/${session.id}/end`, { method: 'POST' });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) { msg.error(data?.error || 'The session could not be ended.'); throw new Error('end failed'); }
                setSessions(s => { const next = { ...s }; delete next[item.id]; return next; });
                setStartFor(null);
                msg.success('Class session ended');
            },
        });
    };

    /* ── Calendar (events carry profile-zone wall clock so FullCalendar shows the right times) ── */
    const events = useMemo(() => filtered.map(({ item, state }) => ({
        id: String(item.id),
        title: item.title,
        start: new Date(isoToWall(item.start, tz) as string),
        end: new Date(isoToWall(item.end, tz) as string),
        classNames: [`sh-ev`, `sh-ev-${item.type}`, state === 'cancelled' ? 'is-cancelled' : isPast(state) ? 'is-past' : ''],
        extendedProps: { item },
    })), [filtered, tz]);

    // FullCalendar hides anything outside slotMin/MaxTime, so grow the window to fit the sessions.
    const dayWindow = useMemo(() => {
        let min = 8, max = 20;
        filtered.forEach(({ item }) => {
            const s = new Date(isoToWall(item.start, tz) as string);
            const e = new Date(isoToWall(item.end, tz) as string);
            min = Math.min(min, s.getHours());
            max = Math.max(max, e.getHours() + (e.getMinutes() > 0 ? 1 : 0));
        });
        const pad = (n: number) => `${String(n).padStart(2, '0')}:00:00`;
        const lo = Math.max(0, min - 1), hi = Math.min(24, Math.max(max + 1, min + 4));
        const here = new Date(nowWallIn(tz)).getHours();
        return { min: pad(lo), max: pad(hi), scroll: pad(Math.min(Math.max(here - 1, lo), Math.max(lo, hi - 4))) };
    }, [filtered, tz]);

    const moveEvent = async (info: any) => {
        const item: Item = info.event.extendedProps.item;
        const startIso = wallToIso(toWallString(info.event.start), tz);
        const endIso = info.event.end ? wallToIso(toWallString(info.event.end), tz) : null;
        if (!startIso) { info.revert(); return; }
        const res = await apiCall(`/schedules/${item.id}`, {
            method: 'PUT',
            body: JSON.stringify({ start_time: startIso, end_time: endIso ?? new Date(Date.parse(startIso) + (Date.parse(item.end) - Date.parse(item.start))).toISOString() }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) { msg.error(data?.error || 'The session could not be moved.'); info.revert(); return; }
        msg.success('Session moved');
        load({ quiet: true });
    };

    /* ── Row pieces ── */
    const primaryAction = (item: Item, state: LiveState) => {
        const session = sessions[item.id];
        if (item.type === 'class' && !isPast(state) && state !== 'cancelled') {
            if (session) {
                return item.link
                    ? <Button size="small" type="primary" icon={<VideoCameraOutlined />} href={item.link} target="_blank" rel="noopener noreferrer">Join</Button>
                    : <Button size="small" type="primary" icon={<InfoCircleOutlined />} onClick={() => setStartFor(item)}>Show code</Button>;
            }
            const ready = state === 'live' || state === 'soon';
            // A greyed-out Start button on next week's class is just noise — only offer it on the day.
            if (ready || dayKeyIn(item.start, tz) === todayKey) {
                return (
                    <Tooltip title={ready ? 'Generate the access code and email it to the batch' : 'Available 15 minutes before the start'}>
                        <Button size="small" type={ready ? 'primary' : 'default'} icon={<PlayCircleOutlined />} disabled={!ready} onClick={() => setStartFor(item)}>Start class</Button>
                    </Tooltip>
                );
            }
        }
        if (item.link && !isPast(state) && state !== 'cancelled') {
            return <Button size="small" icon={<LinkOutlined />} href={item.link} target="_blank" rel="noopener noreferrer">Open link</Button>;
        }
        return null;
    };

    const rowMenu = (item: Item, state: LiveState): MenuProps => ({
        items: [
            { key: 'details', icon: <InfoCircleOutlined />, label: 'Details' },
            { key: 'edit', icon: <EditOutlined />, label: 'Edit' },
            { key: 'duplicate', icon: <CopyOutlined />, label: 'Duplicate next week' },
            ...(item.link ? [{ key: 'copy', icon: <LinkOutlined />, label: 'Copy meeting link' }] : []),
            { type: 'divider' as const },
            ...(state === 'cancelled' ? [] : [{ key: 'cancel', icon: <StopOutlined />, label: 'Cancel session' }]),
            ...(isPast(state) && item.status !== 'completed' ? [{ key: 'complete', icon: <CheckCircleOutlined />, label: 'Mark completed' }] : []),
            { key: 'delete', icon: <DeleteOutlined />, label: 'Delete…', danger: true },
        ],
        onClick: ({ key, domEvent }) => {
            domEvent.stopPropagation();
            if (key === 'details') setDetails(item.id);
            else if (key === 'edit') openEdit(item);
            else if (key === 'duplicate') duplicate(item);
            else if (key === 'copy') copyText(item.link as string, 'Meeting link');
            else if (key === 'cancel') modal.confirm({
                title: `Cancel “${item.title}”?`, icon: <StopOutlined />,
                content: 'It stays in the schedule marked as cancelled so students can see it was called off.',
                okText: 'Cancel session', okButtonProps: { danger: true }, cancelText: 'Keep it',
                onOk: () => setStatus(item, 'cancelled'),
            });
            else if (key === 'complete') setStatus(item, 'completed');
            else if (key === 'delete') remove(item);
        },
    });

    const detailItem = items.find(i => i.id === details) ?? null;
    const detailState = detailItem ? stateOf(detailItem, elapsed) : null;

    /* ═══════════ LOADING ═══════════ */
    if (loading) {
        return (
            <div className="tc sh" aria-busy="true">
                <div className="tc-header"><div><Skeleton.Input active size="small" style={{ width: 110, height: 12 }} /><div style={{ marginTop: 10 }}><Skeleton.Input active style={{ width: 180, height: 26 }} /></div></div></div>
                <div className="tc-kpis sh-kpis">{[0, 1, 2, 3].map(i => <div key={i} className="tc-kpi"><span className="tc-kpi-ic" /><Skeleton className="sh-kpi-skeleton" active title={false} paragraph={{ rows: 2 }} /></div>)}</div>
                <div className="tc-card tc-pad"><Skeleton active paragraph={{ rows: 8 }} /></div>
            </div>
        );
    }

    return (
        <ConfigProvider theme={{ token: { colorPrimary: '#4f46e5', fontSize: 13, borderRadius: 8 } }}>
            {msgHolder}{modalHolder}
            <div className="tc sh" style={{ '--sh-sticky-top': `${headerHeight(r.isMobile)}px` } as React.CSSProperties}>
                {/* ── Header ── */}
                <header className="tc-header">
                    <div>
                        <div className="tc-overline">Teacher space</div>
                        <h1 className="tc-title">Schedule</h1>
                        <p className="tc-subtitle">Your classes and sessions. All times in {timezoneLabel(user?.timezone)} — students see them in their own zone.</p>
                    </div>
                    <div className="tc-actions">
                        <Segmented<ViewMode> value={view} onChange={setView} options={[{ value: 'agenda', label: 'Agenda' }, { value: 'calendar', label: 'Calendar' }]} />
                        <Tooltip title="Refresh"><Button icon={<ReloadOutlined spin={refreshing} />} onClick={() => load()} aria-label="Refresh" /></Tooltip>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreate()}>New session</Button>
                    </div>
                </header>

                {error && (
                    <div className="tc-alert" role="alert">
                        <WarningOutlined /><span><strong>Couldn't load your schedule.</strong> {error}</span>
                        <Button size="small" onClick={() => load()}>Retry</Button>
                    </div>
                )}

                {/* ── KPIs ── */}
                <section className="tc-kpis sh-kpis" aria-label="Summary">
                    <div className="tc-kpi">
                        <span className="tc-kpi-ic"><CalendarOutlined /></span>
                        <span className="tc-kpi-label">Today</span>
                        <span className="tc-kpi-value">{kpi.today}</span>
                        <span className="tc-kpi-sub">{kpi.today ? 'Sessions today' : 'No sessions today'}</span>
                    </div>
                    <div className="tc-kpi is-green">
                        <span className="tc-kpi-ic"><ClockCircleOutlined /></span>
                        <span className="tc-kpi-label">Next 7 days</span>
                        <span className="tc-kpi-value">{kpi.week}</span>
                        <span className="tc-kpi-sub">Sessions this week</span>
                    </div>
                    <div className="tc-kpi is-amber">
                        <span className="tc-kpi-ic"><TeamOutlined /></span>
                        <span className="tc-kpi-label">Upcoming</span>
                        <span className="tc-kpi-value">{kpi.upcoming}</span>
                        <span className="tc-kpi-sub">Still to teach</span>
                    </div>
                    <div className="tc-kpi is-slate">
                        <span className="tc-kpi-ic"><FieldTimeOutlined /></span>
                        <span className="tc-kpi-label">Taught this month</span>
                        <span className="tc-kpi-value">{kpi.hours}<small> h</small></span>
                        <span className="tc-kpi-sub">Completed classes</span>
                    </div>
                </section>

                {/* ── Up next ── */}
                {next && (
                    <section className={`sh-next is-${next.state}`} aria-label="Next session">
                        <div className="sh-next-when">
                            <span className="sh-eyebrow">{next.state === 'live' ? 'Happening now' : 'Up next'}</span>
                            <strong>{next.state === 'live'
                                ? `Ends in ${fmtSpan((next.item.endsIn ?? 0) - elapsed)}`
                                : `Starts in ${fmtSpan((next.item.startsIn ?? 0) - elapsed)}`}</strong>
                            <em>{dayLabel(next.item.start)} · {fmt.range(next.item.start, next.item.end)}</em>
                        </div>
                        <div className="sh-next-what">
                            <span className={`sh-type ${TYPES[next.item.type].tone}`}>{TYPES[next.item.type].label}</span>
                            <h2>{next.item.title}</h2>
                            <span className="sh-next-meta">
                                <span><TeamOutlined /> {next.item.batch_name || 'No batch'}</span>
                                <span>{next.item.location_mode === 'online' ? <><VideoCameraOutlined /> Online</> : <><EnvironmentOutlined /> {next.item.location || 'In person'}</>}</span>
                                {sessions[next.item.id] && <span className="sh-code-chip"><InfoCircleOutlined /> Code {sessions[next.item.id].access_code}</span>}
                            </span>
                        </div>
                        <div className="sh-next-actions">
                            {primaryAction(next.item, next.state)}
                            <Button onClick={() => setDetails(next.item.id)}>Details</Button>
                        </div>
                    </section>
                )}

                {/* ── Toolbar + list/calendar ── */}
                <section className="tc-card sh-body">
                    <div className="sh-toolbar">
                        <Segmented<Scope> value={scope} onChange={setScope} options={[
                            { value: 'upcoming', label: 'Upcoming' }, { value: 'past', label: 'Past' }, { value: 'all', label: 'All' },
                        ]} />
                        <div className="sh-filters">
                            <Input className="sh-search" allowClear prefix={<SearchOutlined style={{ color: '#94a3b8' }} />} placeholder="Search sessions" value={search} onChange={e => setSearch(e.target.value)} aria-label="Search sessions" />
                            {batches.length > 1 && (
                                <Select<number> className="sh-filter" allowClear placeholder="All batches" value={batchFilter ?? undefined} onChange={v => setBatchFilter(v ?? null)}
                                    options={batches.map(b => ({ value: b.id, label: b.name }))} />
                            )}
                            <Select<SessionType> className="sh-filter" allowClear placeholder="All types" value={typeFilter ?? undefined} onChange={v => setTypeFilter(v ?? null)}
                                options={TYPE_KEYS.map(t => ({ value: t, label: TYPES[t].label }))} />
                        </div>
                    </div>

                    {view === 'calendar' ? (
                        <div className="sh-calendar">
                            <FullCalendar
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                initialView={r.isMobile ? 'timeGridDay' : 'timeGridWeek'}
                                headerToolbar={{ left: 'prev,next today', center: 'title', right: r.isMobile ? 'timeGridDay,dayGridMonth' : 'dayGridMonth,timeGridWeek,timeGridDay' }}
                                // A fixed height keeps its own scroller, so scrollTime lands on the working hours.
                                height={r.isMobile ? 520 : 660}
                                events={events}
                                // Events carry profile-zone wall clock, so the calendar must read them as plain local times.
                                timeZone="local"
                                now={() => new Date(nowWallIn(tz))}
                                nowIndicator
                                allDaySlot={false}
                                slotMinTime={dayWindow.min}
                                slotMaxTime={dayWindow.max}
                                scrollTime={dayWindow.scroll}
                                slotDuration="00:30:00"
                                slotLabelInterval="01:00:00"
                                dayMaxEvents={3}
                                stickyHeaderDates
                                selectable
                                selectMirror
                                select={(info: any) => openCreate({ start: toWallString(info.start), end: toWallString(info.end) })}
                                editable
                                eventDrop={moveEvent}
                                eventResize={moveEvent}
                                eventClick={(info: any) => setDetails(info.event.extendedProps.item.id)}
                                eventTimeFormat={{ hour: 'numeric', minute: '2-digit', meridiem: 'short' }}
                                firstDay={1}
                            />
                        </div>
                    ) : groups.length === 0 ? (
                        <div className="sh-empty">
                            <span className="sh-empty-art" aria-hidden="true"><CalendarOutlined /></span>
                            <div className="sh-empty-copy">
                                <strong>{items.length === 0 ? 'No sessions yet' : scope === 'upcoming' ? 'Nothing coming up' : 'Nothing matches'}</strong>
                                <p>{items.length === 0
                                    ? 'Schedule your first class. Your students will receive the details by email.'
                                    : scope === 'upcoming' ? 'Schedule your next class, or view Past to revisit earlier sessions.' : 'Try another filter or search term.'}</p>
                            </div>
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreate()}>New session</Button>
                        </div>
                    ) : (
                        <div className="sh-agenda">
                            {groups.map(([key, entries]) => (
                                <section key={key} className={`sh-day${key === todayKey ? ' is-today' : ''}`}>
                                    <header className="sh-day-head">
                                        <h3>{dayLabel(entries[0].item.start)}</h3>
                                        <span>{entries.length} {entries.length === 1 ? 'session' : 'sessions'}</span>
                                    </header>
                                    <ul className="sh-rows">
                                        {entries.map(({ item, state }) => (
                                            <li key={item.id}>
                                                <div className={`sh-row is-${state}`} role="button" tabIndex={0}
                                                    onClick={() => setDetails(item.id)} onKeyDown={e => { if (e.key === 'Enter') setDetails(item.id); }}>
                                                    <span className="sh-time">
                                                        <strong>{fmt.time(item.start)}</strong>
                                                        <em>{fmt.time(item.end)}</em>
                                                    </span>
                                                    <span className="sh-bar" aria-hidden />
                                                    <span className="sh-main">
                                                        <span className="sh-title-row">
                                                            <strong>{item.title}</strong>
                                                            <span className={`sh-type ${TYPES[item.type].tone}`}>{TYPES[item.type].label}</span>
                                                            {state !== 'scheduled' && <span className={`sh-state is-${state}`}>{STATE_LABEL[state]}</span>}
                                                        </span>
                                                        <span className="sh-meta">
                                                            <span><TeamOutlined /> {item.batch_name || '—'}</span>
                                                            <span>{item.location_mode === 'online' ? <><VideoCameraOutlined /> Online</> : <><EnvironmentOutlined /> {item.location || 'In person'}</>}</span>
                                                            {sessions[item.id] && <span className="sh-code-chip"><InfoCircleOutlined /> Code {sessions[item.id].access_code}</span>}
                                                        </span>
                                                    </span>
                                                    <span className="sh-row-actions" onClick={e => e.stopPropagation()}>
                                                        {primaryAction(item, state)}
                                                        <Dropdown menu={rowMenu(item, state)} trigger={['click']} placement="bottomRight">
                                                            <Button size="small" type="text" icon={<MoreOutlined />} aria-label={`More actions for ${item.title}`} />
                                                        </Dropdown>
                                                    </span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {/* ── Create / edit ── */}
            <Modal open={editing.open} onCancel={() => !saving && setEditing({ item: null, open: false })} footer={null} title={null} closable={false} centered
                width="min(680px, calc(100vw - 24px))" wrapClassName="tc-modal sh-modal" styles={{ body: { padding: 0 } }} maskClosable={!saving} destroyOnHidden>
                <div className="sh-form">
                    <header className="tc-up-head">
                        <span className="tc-up-ic"><CalendarOutlined /></span>
                        <div>
                            <h2>{editing.item ? 'Edit session' : 'New session'}</h2>
                            <p>Times are in {timezoneLabel(user?.timezone)}. Students see them in their own time zone.</p>
                        </div>
                        <Button type="text" icon={<CloseOutlined />} onClick={() => setEditing({ item: null, open: false })} disabled={saving} aria-label="Close" />
                    </header>
                    <Form form={form} layout="vertical" requiredMark={false} className="sh-form-body" onFinish={submit}>
                        <Form.Item name="title" label="Title" rules={[{ required: true, whitespace: true, message: 'Give the session a title' }]}>
                            <Input placeholder="E.g. Passé composé — practice" maxLength={120} autoFocus />
                        </Form.Item>
                        <div className="sh-form-row">
                            <Form.Item name="batch_id" label="Batch" rules={[{ required: true, message: 'Choose a batch' }]}>
                                <Select placeholder="Choose a batch" optionFilterProp="label" showSearch
                                    options={batches.map(b => ({ value: b.id, label: b.name }))}
                                    notFoundContent={<span className="sh-hint">No batches are assigned to you yet.</span>} />
                            </Form.Item>
                            <Form.Item name="type" label="Type" rules={[{ required: true }]}>
                                <Select options={TYPE_KEYS.map(t => ({ value: t, label: TYPES[t].label }))} />
                            </Form.Item>
                        </div>
                        <div className="sh-form-row is-three">
                            <Form.Item name="date" label="Date" rules={[{ required: true, message: 'Pick a date' }]}>
                                <DatePicker className="sh-full" format="ddd, MMM D, YYYY" allowClear={false} />
                            </Form.Item>
                            <Form.Item name="start_time" label="Starts" rules={[{ required: true, message: 'Pick a start time' }]}>
                                <TimePicker className="sh-full" format="HH:mm" minuteStep={5} allowClear={false} needConfirm={false} />
                            </Form.Item>
                            <Form.Item name="duration" label="Length" rules={[{ required: true, type: 'number', min: 5, max: 600, message: '5–600 minutes' }]}>
                                <InputNumber className="sh-full" min={5} max={600} step={5} addonAfter="min" />
                            </Form.Item>
                        </div>
                        <Form.Item shouldUpdate={(a, b) => a.duration !== b.duration || a.start_time !== b.start_time || a.date !== b.date} noStyle>
                            {() => {
                                const current = Number(form.getFieldValue('duration'));
                                return (
                                    <div className="sh-presets" role="group" aria-label="Common lengths">
                                        {DURATIONS.map(d => (
                                            <button key={d} type="button" className={`sh-preset${current === d ? ' is-on' : ''}`}
                                                onClick={() => form.setFieldValue('duration', d)}>
                                                {d >= 60 ? `${Math.floor(d / 60)} h${d % 60 ? ` ${d % 60}` : ''}` : `${d} min`}
                                            </button>
                                        ))}
                                    </div>
                                );
                            }}
                        </Form.Item>
                        <Form.Item shouldUpdate={(a, b) => a.duration !== b.duration || a.start_time !== b.start_time || a.date !== b.date} noStyle>
                            {() => {
                                const d = form.getFieldValue('date') as Dayjs | undefined;
                                const t = form.getFieldValue('start_time') as Dayjs | undefined;
                                const mins = Number(form.getFieldValue('duration')) || 0;
                                if (!d || !t || !mins) return null;
                                const startIso = wallToIso(`${d.format('YYYY-MM-DD')}T${t.format('HH:mm')}`, tz);
                                if (!startIso) return null;
                                const endIso = new Date(Date.parse(startIso) + mins * 60_000).toISOString();
                                return <p className="sh-when-preview"><ClockCircleOutlined /> {fmt.dayLong(startIso)} · {fmt.range(startIso, endIso)} <em>({timezoneLabel(user?.timezone)})</em></p>;
                            }}
                        </Form.Item>
                        <div className="sh-form-row">
                            <Form.Item name="location_mode" label="Where" rules={[{ required: true }]}>
                                <Segmented block options={[{ value: 'online', label: 'Online' }, { value: 'physical', label: 'In person' }]} />
                            </Form.Item>
                            <Form.Item noStyle shouldUpdate={(a, b) => a.location_mode !== b.location_mode}>
                                {() => form.getFieldValue('location_mode') === 'physical' ? (
                                    <Form.Item name="location" label="Place" rules={[{ required: true, whitespace: true, message: 'Where does it take place?' }]}>
                                        <Input placeholder="Room or address" maxLength={255} />
                                    </Form.Item>
                                ) : (
                                    <Form.Item name="link" label="Meeting link" rules={[{ required: true, message: 'Add the meeting link' }, { type: 'url', message: 'Enter a full link starting with https://' }]}>
                                        <Input placeholder="https://meet.example.com/abc-defg" maxLength={1000} />
                                    </Form.Item>
                                )}
                            </Form.Item>
                        </div>
                        <Form.Item name="description" label={<>Description <em className="sh-optional">optional</em></>}>
                            <Input.TextArea rows={2} maxLength={500} placeholder="What will you cover?" />
                        </Form.Item>
                        {editing.item ? (
                            <Form.Item name="status" label="Status">
                                <Segmented options={[{ value: 'scheduled', label: 'Scheduled' }, { value: 'completed', label: 'Completed' }, { value: 'cancelled', label: 'Cancelled' }]} />
                            </Form.Item>
                        ) : (
                            <div className="sh-repeat">
                                <Form.Item name="repeat" valuePropName="checked" noStyle><Switch size="small" /></Form.Item>
                                <span className="sh-repeat-text"><strong>Repeat weekly</strong><em>Creates the same session on the following weeks.</em></span>
                                <Form.Item noStyle shouldUpdate={(a, b) => a.repeat !== b.repeat}>
                                    {() => form.getFieldValue('repeat') ? (
                                        <Form.Item name="repeat_weeks" noStyle><InputNumber min={2} max={16} addonAfter="weeks" /></Form.Item>
                                    ) : null}
                                </Form.Item>
                            </div>
                        )}
                        <p className="sh-hint"><InfoCircleOutlined /> {editing.item ? 'Students see the change in their schedule straight away.' : 'Students in the batch get an email with the date, time and link.'}</p>
                    </Form>
                    <footer className="tc-modal-foot sh-form-foot">
                        <Button onClick={() => setEditing({ item: null, open: false })} disabled={saving}>Cancel</Button>
                        <Button type="primary" onClick={submit} loading={saving}>{editing.item ? 'Save changes' : 'Create session'}</Button>
                    </footer>
                </div>
            </Modal>

            {/* ── Start class ── */}
            <Modal open={!!startFor} onCancel={() => !starting && setStartFor(null)} footer={null} title={null} closable={false} centered
                width="min(520px, calc(100vw - 24px))" wrapClassName="tc-modal sh-modal" styles={{ body: { padding: 0 } }} maskClosable={!starting} destroyOnHidden>
                {startFor && (() => {
                    const session = sessions[startFor.id];
                    const expires = session?.code_expires_at ? Date.parse(session.code_expires_at) : null;
                    const expired = expires !== null && expires <= now;
                    return (
                        <div className="sh-start">
                            <header className="tc-up-head">
                                <span className="tc-up-ic"><PlayCircleOutlined /></span>
                                <div>
                                    <h2>{session ? 'Class in progress' : 'Start the class'}</h2>
                                    <p>{startFor.title} · {startFor.batch_name}</p>
                                </div>
                                <Button type="text" icon={<CloseOutlined />} onClick={() => setStartFor(null)} disabled={starting} aria-label="Close" />
                            </header>
                            <div className="sh-start-body">
                                {session ? (
                                    <>
                                        <div className={`sh-code${expired ? ' is-expired' : ''}`}>
                                            <span className="sh-code-label">Attendance code</span>
                                            <strong>{session.access_code}</strong>
                                            <span className="sh-code-sub">{expired ? 'This code has expired — end the session and start it again.' : expires ? `Valid until ${fmt.time(session.code_expires_at as string)}` : 'Students enter it to mark their attendance'}</span>
                                            <Button icon={<CopyOutlined />} onClick={() => copyText(session.access_code, 'Access code')}>Copy code</Button>
                                        </div>
                                        <p className="sh-hint"><InfoCircleOutlined /> The code was emailed to every student in {startFor.batch_name}. Attendance is recorded when they enter it.</p>
                                        <div className="sh-start-actions">
                                            <Button danger icon={<StopOutlined />} onClick={() => endClass(startFor)}>End session</Button>
                                            {startFor.link && <Button type="primary" icon={<VideoCameraOutlined />} href={startFor.link} target="_blank" rel="noopener noreferrer">Join meeting</Button>}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <ul className="sh-start-steps">
                                            <li><i>1</i><span><strong>An attendance code is generated</strong><em>Valid for 30 minutes.</em></span></li>
                                            <li><i>2</i><span><strong>Every student in the batch gets it by email</strong><em>They enter it to be marked present.</em></span></li>
                                            <li><i>3</i><span><strong>You join the meeting</strong><em>{startFor.link ? 'The link opens in a new tab.' : 'This session has no meeting link.'}</em></span></li>
                                        </ul>
                                        <div className="sh-start-actions">
                                            <Button onClick={() => setStartFor(null)} disabled={starting}>Not yet</Button>
                                            <Button type="primary" icon={<PlayCircleOutlined />} loading={starting} onClick={() => startClass(startFor)}>Start class & send code</Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })()}
            </Modal>

            {/* ── Details ── */}
            <Drawer open={!!detailItem} onClose={() => setDetails(null)} placement="right" width={r.isMobile ? '100%' : 460} destroyOnHidden
                rootClassName="tc-drawer sh-drawer" closeIcon={<CloseOutlined />}
                title={detailItem && <span className="tc-dtitle"><strong>{detailItem.title}</strong><em>{detailItem.batch_name}</em></span>}>
                {detailItem && detailState && (
                    <>
                        <section className="tc-card sh-d-when">
                            <span className={`sh-state is-${detailState}`}>{STATE_LABEL[detailState]}</span>
                            <strong>{fmt.full(detailItem.start)}</strong>
                            <em>{fmt.range(detailItem.start, detailItem.end)} · {Math.round((Date.parse(detailItem.end) - Date.parse(detailItem.start)) / 60_000)} min · {timezoneLabel(user?.timezone)}</em>
                            {(detailState === 'scheduled' || detailState === 'soon') && detailItem.startsIn !== null && <p className="sh-countdown">Starts in {fmtSpan(detailItem.startsIn - elapsed)}</p>}
                            {detailState === 'live' && detailItem.endsIn !== null && <p className="sh-countdown is-live">Live now · ends in {fmtSpan(detailItem.endsIn - elapsed)}</p>}
                        </section>
                        <section className="tc-card sh-d-section">
                            <dl className="sh-dl">
                                <div><dt>Type</dt><dd><span className={`sh-type ${TYPES[detailItem.type].tone}`}>{TYPES[detailItem.type].label}</span></dd></div>
                                <div><dt>Batch</dt><dd>{detailItem.batch_name || '—'}</dd></div>
                                <div><dt>Where</dt><dd>{detailItem.location_mode === 'online' ? 'Online' : detailItem.location || 'In person'}</dd></div>
                                {sessions[detailItem.id] && <div><dt>Attendance code</dt><dd><b>{sessions[detailItem.id].access_code}</b></dd></div>}
                            </dl>
                            {detailItem.link && (
                                <div className="sh-link">
                                    <VideoCameraOutlined />
                                    <span title={detailItem.link}>{detailItem.link}</span>
                                    <Tooltip title="Copy link"><Button size="small" type="text" icon={<CopyOutlined />} onClick={() => copyText(detailItem.link as string, 'Meeting link')} aria-label="Copy meeting link" /></Tooltip>
                                    <Button size="small" href={detailItem.link} target="_blank" rel="noopener noreferrer">Open</Button>
                                </div>
                            )}
                            {detailItem.description && <p className="sh-d-desc">{detailItem.description}</p>}
                        </section>
                        <div className="sh-d-actions">
                            {primaryAction(detailItem, detailState)}
                            <Button icon={<EditOutlined />} onClick={() => { setDetails(null); openEdit(detailItem); }}>Edit</Button>
                            <Button icon={<CopyOutlined />} onClick={() => { setDetails(null); duplicate(detailItem); }}>Duplicate</Button>
                            <Button danger icon={<DeleteOutlined />} onClick={() => remove(detailItem)}>Delete</Button>
                        </div>
                    </>
                )}
            </Drawer>
        </ConfigProvider>
    );
};

export default ScheduleManagement;
