import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, ConfigProvider, DatePicker, Input, Modal, Segmented, Select, Skeleton, Tooltip, message } from 'antd';
import {
    CalendarOutlined,
    CheckCircleFilled,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseOutlined,
    EnvironmentOutlined,
    ExclamationCircleOutlined,
    FieldTimeOutlined,
    FileDoneOutlined,
    InfoCircleOutlined,
    KeyOutlined,
    LeftOutlined,
    LoginOutlined,
    ReadOutlined,
    RightOutlined,
    ScheduleOutlined,
    TeamOutlined,
    UserOutlined,
    VideoCameraOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { DatesSetArg, EventClickArg, EventContentArg } from '@fullcalendar/core';
import type { DateClickArg } from '@fullcalendar/interaction';
import { useAuth } from '../../contexts/AuthContext';
import { resolveTimezone, timezoneLabel } from '../../utils/timezone';
import useResponsive from '../../hooks/useResponsive';
import './StudentSchedule.css';

const { RangePicker } = DatePicker;

type SType = 'class' | 'exam' | 'meeting' | 'other';
type SState = 'scheduled' | 'active' | 'ended' | 'completed' | 'cancelled';
type JoinState = 'none' | 'attended' | 'open' | 'locked';
type AgendaTab = 'today' | 'upcoming' | 'active' | 'week';
type CalView = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay';

interface Schedule {
    id: number;
    title: string;
    description: string;
    batch_id: number;
    batch_name: string;
    teacher_name: string;
    french_level?: string;
    start_iso: string;
    end_iso: string;
    start: Date;
    end: Date;
    location: string;
    location_mode: 'online' | 'physical';
    link: string | null;
    type: SType;
    status: 'scheduled' | 'completed' | 'cancelled';
    /** Server-authoritative state (computed with PG NOW()) at fetch time. */
    schedule_state?: string;
    seconds_until_start?: number;
    seconds_until_end?: number;
    /** Client clock when the server seconds were read — lets us age them without trusting the browser clock. */
    fetched_at: number;
}

/** A schedule placed on the calendar in the user's timezone. */
interface Item extends Schedule {
    dayKey: string;
    wallStart: Date;
    wallEnd: Date;
}

const TYPES: SType[] = ['class', 'exam', 'meeting', 'other'];
const TYPE_META: Record<SType, { label: string; icon: React.ReactNode }> = {
    class: { label: 'Class', icon: <ReadOutlined /> },
    exam: { label: 'Exam', icon: <FileDoneOutlined /> },
    meeting: { label: 'Meeting', icon: <TeamOutlined /> },
    other: { label: 'Event', icon: <CalendarOutlined /> },
};
const STATE_LABEL: Record<SState, string> = {
    scheduled: 'Scheduled',
    // Time-based: the slot has begun. "Live" is kept for classes the teacher actually started.
    active: 'In progress',
    ended: 'Ended',
    completed: 'Completed',
    cancelled: 'Cancelled',
};
const JOIN_WINDOW_SECS = 5 * 60;

/* ── Timezone helpers ──
   FullCalendar can only render in the browser zone, so each event is converted to
   a "wall clock" Date: same Y/M/D h:m as the user's profile zone, built in local time. */
const fmtCache = new Map<string, Intl.DateTimeFormat>();
const cachedFmt = (key: string, make: () => Intl.DateTimeFormat) => {
    let f = fmtCache.get(key);
    if (!f) { f = make(); fmtCache.set(key, f); }
    return f;
};
const wallDate = (d: Date, tz: string): Date => {
    const f = cachedFmt(`parts|${tz}`, () => new Intl.DateTimeFormat('en-US', {
        timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }));
    const p: Record<string, number> = {};
    for (const part of f.formatToParts(d)) if (part.type !== 'literal') p[part.type] = Number(part.value);
    return new Date(p.year, p.month - 1, p.day, p.hour % 24, p.minute);
};
const keyOf = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const fmtTime = (d: Date, tz: string) =>
    cachedFmt(`time|${tz}`, () => new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit', hour12: true })).format(d);
const fmtDate = (d: Date, tz: string, long = false) =>
    cachedFmt(`date|${tz}|${long}`, () => new Intl.DateTimeFormat('en-US', long
        ? { timeZone: tz, weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
        : { timeZone: tz, weekday: 'short', month: 'short', day: 'numeric' })).format(d);
const shortTime = (d: Date, tz: string) => fmtTime(d, tz).replace(':00', '');
const timeRange = (s: Schedule, tz: string) => {
    const a = fmtTime(s.start, tz);
    const b = fmtTime(s.end, tz);
    return a.slice(-2) === b.slice(-2) ? `${a.slice(0, -3)} – ${b}` : `${a} – ${b}`;
};
const durationText = (s: Schedule) => {
    const m = Math.round((s.end.getTime() - s.start.getTime()) / 60000);
    if (m < 60) return `${m} min`;
    return `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60}` : ''}`;
};
const untilText = (secs: number) => {
    const m = Math.max(1, Math.ceil(secs / 60));
    if (m < 60) return `${m} min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} h${m % 60 ? ` ${m % 60} min` : ''}`;
    const d = Math.floor(h / 24);
    return `${d} d${h % 24 ? ` ${h % 24} h` : ''}`;
};

/* ── Status helpers — prefer the server's seconds (aged locally) over browser-clock math ── */
const secsUntil = (s: Schedule, edge: 'start' | 'end', now: number) => {
    const server = edge === 'start' ? s.seconds_until_start : s.seconds_until_end;
    if (typeof server === 'number' && !Number.isNaN(server)) return server - (now - s.fetched_at) / 1000;
    return ((edge === 'start' ? s.start : s.end).getTime() - now) / 1000;
};
const stateOf = (s: Schedule, now: number): SState => {
    if (s.status === 'cancelled' || s.schedule_state === 'cancelled') return 'cancelled';
    if (s.status === 'completed' || s.schedule_state === 'completed') return 'completed';
    if (secsUntil(s, 'end', now) <= 0) return 'ended';
    if (secsUntil(s, 'start', now) <= 0) return 'active';
    return 'scheduled';
};
const isOver = (st: SState) => st === 'ended' || st === 'completed' || st === 'cancelled';
const inJoinWindow = (s: Schedule, now: number) => !isOver(stateOf(s, now)) && secsUntil(s, 'start', now) <= JOIN_WINDOW_SECS;

const normalize = (fetchedAt: number) => (s: any): Schedule => {
    const parsed = new Date(s.start_time);
    const start = isNaN(parsed.getTime()) ? new Date(fetchedAt) : parsed;
    let end = new Date(s.end_time);
    if (isNaN(end.getTime()) || end <= start) end = new Date(start.getTime() + 3600_000);
    const num = (v: any) => (v === null || v === undefined || v === '' ? undefined : Number(v));
    return {
        id: s.id,
        title: s.title || 'Untitled session',
        description: s.description || '',
        batch_id: s.batch_id,
        batch_name: s.batch_name || '',
        teacher_name: [s.teacher_first_name, s.teacher_last_name].filter(Boolean).join(' ').trim(),
        french_level: s.french_level || undefined,
        start_iso: s.start_time,
        end_iso: s.end_time,
        start,
        end,
        location: s.location || '',
        location_mode: s.location_mode === 'online' ? 'online' : 'physical',
        link: s.link || null,
        type: (TYPES as string[]).includes(s.type) ? s.type : 'other',
        status: s.status === 'completed' || s.status === 'cancelled' ? s.status : 'scheduled',
        schedule_state: s.schedule_state,
        seconds_until_start: num(s.seconds_until_start),
        seconds_until_end: num(s.seconds_until_end),
        fetched_at: fetchedAt,
    };
};

const StatePill: React.FC<{ state: SState }> = ({ state }) => (
    <span className={`sc-pill is-${state}`}>
        {state === 'active' && <i className="sc-pulse" aria-hidden />}
        {STATE_LABEL[state]}
    </span>
);

const StudentSchedule: React.FC = () => {
    const navigate = useNavigate();
    const { apiCall, user } = useAuth();
    const tz = resolveTimezone(user?.timezone);
    const tzLabel = timezoneLabel(user?.timezone);
    const r = useResponsive();
    const [msg, contextHolder] = message.useMessage();

    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [now, setNow] = useState(() => Date.now());

    const [batchFilter, setBatchFilter] = useState<number | null>(null);
    const [teacherFilter, setTeacherFilter] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

    const [agendaTab, setAgendaTab] = useState<AgendaTab>('today');
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [view, setView] = useState<CalView>('dayGridMonth');
    const [calTitle, setCalTitle] = useState('');
    const [details, setDetails] = useState<Item | null>(null);

    // Join-class flow
    const [joinTarget, setJoinTarget] = useState<Item | null>(null);
    const [joinOpen, setJoinOpen] = useState(false);
    const [joining, setJoining] = useState(false);
    const [accessCode, setAccessCode] = useState('');
    const [sessionStatus, setSessionStatus] = useState<any>(null);

    // Joined badges: local (this device) + server-confirmed
    const [joinedMap, setJoinedMap] = useState<Record<number, string>>(() => {
        try { return JSON.parse(localStorage.getItem('joinedSchedules') || '{}') || {}; } catch { return {}; }
    });
    const [serverJoinedMap, setServerJoinedMap] = useState<Record<number, boolean>>({});
    const hasJoined = (id: number) => Boolean(joinedMap[id]) || Boolean(serverJoinedMap[id]);
    const markJoined = (id: number) => {
        setJoinedMap(prev => {
            const next = { ...prev, [id]: dayjs().toISOString() };
            try { localStorage.setItem('joinedSchedules', JSON.stringify(next)); } catch { /* storage unavailable */ }
            return next;
        });
    };

    const calRef = useRef<FullCalendar>(null);
    const agendaRef = useRef<HTMLElement>(null);

    /* ═══════════ DATA ═══════════ */
    const checkServerJoin = async (id: number) => {
        try {
            const res = await apiCall(`/attendance/sessions/${id}/status`);
            if (res.ok) {
                const status = await res.json();
                setServerJoinedMap(prev => ({ ...prev, [id]: Boolean(status.alreadyJoined) }));
            }
        } catch { /* badge only — ignore */ }
    };

    const fetchSchedules = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiCall('/schedules');
            if (!res.ok) throw new Error(`The server answered ${res.status}.`);
            const raw = await res.json();
            const list = Array.isArray(raw) ? raw : (raw.schedules || []);
            const fetchedAt = Date.now();
            const normalized: Schedule[] = list.map(normalize(fetchedAt));
            setSchedules(normalized);
            setNow(fetchedAt);
            // Attendance badges only matter for recent classes and the ones about to start.
            const from = fetchedAt - 14 * 86400_000;
            const to = fetchedAt + 86400_000;
            normalized
                .filter(s => s.type === 'class' && s.start.getTime() >= from && s.start.getTime() <= to)
                .forEach(s => { checkServerJoin(s.id); });
        } catch (e: any) {
            setError(e?.message || 'Could not load your schedule.');
        } finally {
            setLoading(false);
        }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchSchedules(); }, []);
    useEffect(() => {
        const t = window.setInterval(() => setNow(Date.now()), 30_000);
        return () => window.clearInterval(t);
    }, []);

    /* ═══════════ DERIVED ═══════════ */
    const items = useMemo<Item[]>(() => schedules
        .map(s => {
            const wallStart = wallDate(s.start, tz);
            return { ...s, wallStart, wallEnd: wallDate(s.end, tz), dayKey: keyOf(wallStart) };
        })
        .sort((a, b) => a.start.getTime() - b.start.getTime()), [schedules, tz]);

    const batchOptions = useMemo(() => {
        const map = new Map<number, string>();
        schedules.forEach(s => { if (s.batch_id && s.batch_name) map.set(s.batch_id, s.batch_name); });
        return Array.from(map, ([value, label]) => ({ value, label }));
    }, [schedules]);
    const teacherOptions = useMemo(() => Array.from(new Set(schedules.map(s => s.teacher_name).filter(Boolean)))
        .sort().map(name => ({ value: name, label: name })), [schedules]);

    const filtered = useMemo(() => {
        const range = dateRange ? [dateRange[0].format('YYYY-MM-DD'), dateRange[1].format('YYYY-MM-DD')] : null;
        return items.filter(s =>
            (!batchFilter || s.batch_id === batchFilter)
            && (!teacherFilter || s.teacher_name === teacherFilter)
            && (!range || (s.dayKey >= range[0] && s.dayKey <= range[1])));
    }, [items, batchFilter, teacherFilter, dateRange]);
    const hasFilters = Boolean(batchFilter || teacherFilter || dateRange);

    const derived = useMemo(() => {
        const wallNow = wallDate(new Date(now), tz);
        const todayKey = keyOf(wallNow);
        const tomorrowKey = dayjs(wallNow).add(1, 'day').format('YYYY-MM-DD');
        const weekStart = dayjs(wallNow).startOf('week');
        const [wFrom, wTo] = [weekStart.format('YYYY-MM-DD'), weekStart.add(6, 'day').format('YYYY-MM-DD')];
        const states = new Map(filtered.map(s => [s.id, stateOf(s, now)]));
        const upcoming = filtered.filter(s => states.get(s.id) === 'scheduled');
        const live = filtered.filter(s => states.get(s.id) === 'active');
        return {
            todayKey,
            tomorrowKey,
            states,
            today: filtered.filter(s => s.dayKey === todayKey),
            week: filtered.filter(s => s.dayKey >= wFrom && s.dayKey <= wTo),
            upcoming,
            active: live,
            done: filtered.filter(s => { const st = states.get(s.id); return st === 'ended' || st === 'completed'; }).length,
            featured: upcoming[0] || null,
        };
    }, [filtered, now, tz]);
    const st = (s: Schedule): SState => derived.states.get(s.id) ?? stateOf(s, now);

    const joinStateOf = (s: Item): JoinState => {
        if (s.type !== 'class' && !s.link) return 'none';
        if (hasJoined(s.id)) return 'attended';
        if (isOver(st(s))) return 'none';
        // Classes can be checked on the day (the teacher may open the session early); other sessions 5 min before.
        if (inJoinWindow(s, now) || (s.type === 'class' && s.dayKey === derived.todayKey)) return 'open';
        return 'locked';
    };

    const events = useMemo(() => filtered.map(s => {
        const state = derived.states.get(s.id) ?? 'scheduled';
        return {
            id: String(s.id),
            title: s.title,
            start: s.wallStart,
            end: s.wallEnd,
            classNames: ['sc-fc-ev', `sc-t-${s.type}`, `is-${state}`],
            extendedProps: { item: s },
        };
    }), [filtered, derived]);

    // Fit the time grid to the sessions instead of a fixed 24 h column.
    const slots = useMemo(() => {
        let min = 8, max = 20;
        for (const s of filtered) {
            min = Math.min(min, s.wallStart.getHours());
            const spansMidnight = keyOf(s.wallEnd) !== s.dayKey;
            max = Math.max(max, spansMidnight ? 24 : s.wallEnd.getHours() + (s.wallEnd.getMinutes() ? 1 : 0));
        }
        const hh = (h: number) => `${String(Math.min(24, h)).padStart(2, '0')}:00:00`;
        return { min: hh(min), max: hh(max), scroll: hh(Math.max(min, 8)) };
    }, [filtered]);

    const agendaItems: Item[] = selectedDay
        ? filtered.filter(s => s.dayKey === selectedDay)
        : agendaTab === 'today' ? derived.today
            : agendaTab === 'active' ? derived.active
                : agendaTab === 'week' ? derived.week
                    : derived.upcoming.slice(0, 30);
    const grouped = !selectedDay && agendaTab !== 'today';
    const groups = useMemo(() => {
        const out: { key: string; items: Item[] }[] = [];
        for (const s of agendaItems) {
            const last = out[out.length - 1];
            if (last && last.key === s.dayKey) last.items.push(s);
            else out.push({ key: s.dayKey, items: [s] });
        }
        return out;
    }, [agendaItems]);
    const dayLabel = (key: string) => key === derived.todayKey ? 'Today'
        : key === derived.tomorrowKey ? 'Tomorrow'
            : dayjs(key).format(dayjs(key).year() === dayjs().year() ? 'dddd, MMM D' : 'ddd, MMM D, YYYY');

    /* ═══════════ CALENDAR HANDLERS ═══════════ */
    const api = () => calRef.current?.getApi();
    const nowProvider = useCallback(() => wallDate(new Date(), tz), [tz]);
    const onDatesSet = useCallback((a: DatesSetArg) => {
        setCalTitle(a.view.title);
        setView(a.view.type as CalView);
    }, []);
    const onEventClick = useCallback((a: EventClickArg) => {
        a.jsEvent.preventDefault();
        setDetails(a.event.extendedProps.item as Item);
    }, []);
    const onDateClick = useCallback((a: DateClickArg) => {
        if (a.view.type !== 'dayGridMonth') return;
        const key = keyOf(a.date);
        setSelectedDay(prev => (prev === key ? null : key));
        const el = agendaRef.current;
        if (el && el.getBoundingClientRect().top > window.innerHeight - 120) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, []);
    const dayCellClassNames = useCallback((a: { date: Date }) => (keyOf(a.date) === selectedDay ? ['sc-day-selected'] : []), [selectedDay]);
    const renderEvent = useCallback((a: EventContentArg) => {
        const s = a.event.extendedProps.item as Item;
        if (a.view.type === 'dayGridMonth') {
            if (r.isMobile) return <span className="sc-ev-bar" />;
            return (
                <div className="sc-ev">
                    <span className="sc-ev-time">{shortTime(s.start, tz)}</span>
                    <span className="sc-ev-title">{s.title}</span>
                </div>
            );
        }
        return (
            <div className="sc-ev sc-ev--block">
                <span className="sc-ev-title">{s.title}</span>
                <span className="sc-ev-time">{timeRange(s, tz)}</span>
            </div>
        );
    }, [r.isMobile, tz]);

    /* ═══════════ JOIN FLOW ═══════════ */
    const closeJoin = () => {
        if (joining) return;
        setJoinOpen(false);
        setJoinTarget(null);
        setAccessCode('');
        setSessionStatus(null);
    };

    const openMeetingLink = (url: string) => {
        if (url.startsWith('/')) {
            navigate(url);
        } else {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    const handleJoin = async (s: Item) => {
        if (s.type === 'meeting' && s.link) {
            markJoined(s.id);
            openMeetingLink(s.link);
            return;
        }
        setDetails(null);
        setJoinTarget(s);
        let status: any = null;
        try {
            const res = await apiCall(`/attendance/sessions/${s.id}/status`);
            if (res.ok) status = await res.json();
        } catch { /* treated as "not started" */ }
        setSessionStatus(status);
        if (status?.alreadyJoined) {
            markJoined(s.id);
            if (s.link) {
                msg.success('You already joined this class — opening the meeting link.');
                openMeetingLink(s.link);
            } else {
                msg.success('You already joined this class.');
            }
            setJoinTarget(null);
            return;
        }
        setAccessCode('');
        setJoinOpen(true);
    };

    const submitAccessCode = async () => {
        if (!joinTarget || accessCode.length !== 6) return;
        setJoining(true);
        try {
            let sessionId: number | null = sessionStatus?.canJoin && sessionStatus?.sessionId ? sessionStatus.sessionId : null;
            if (!sessionId) {
                const listRes = await apiCall(`/attendance/sessions?schedule_id=${joinTarget.id}`);
                if (!listRes.ok) throw new Error('Could not find the session for this class.');
                const sessions: any[] = (await listRes.json()).sessions || [];
                const mine = sessions.filter(x => Number(x.schedule_id) === Number(joinTarget.id));
                sessionId = (mine.find(x => x.status === 'in_progress' || x.status === 'started') || mine[0])?.id ?? null;
            }
            if (!sessionId) throw new Error('No active session was found for this class.');

            const res = await apiCall(`/attendance/sessions/${sessionId}/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accessCode: accessCode.toUpperCase() }),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                msg.error(body.error || 'That code was not accepted. Please check it and try again.');
                return;
            }
            const result = await res.json();
            msg.success(`You're in — attendance recorded as ${result.status}.`);
            markJoined(joinTarget.id);
            if (joinTarget.link) openMeetingLink(joinTarget.link);
            setJoining(false);
            setJoinOpen(false);
            setJoinTarget(null);
            setAccessCode('');
            fetchSchedules();
        } catch (e: any) {
            msg.error(e?.message || 'Could not join the class. Please try again.');
        } finally {
            setJoining(false);
        }
    };

    /* ═══════════ PIECES ═══════════ */
    const modeText = (s: Schedule) => (s.location_mode === 'online' ? 'Online' : s.location || 'On site');
    const ModeIcon = ({ s }: { s: Schedule }) => (s.location_mode === 'online' ? <VideoCameraOutlined /> : <EnvironmentOutlined />);
    const joinLabel = (s: Schedule) => (s.type === 'class' ? 'Join class' : 'Join session');

    const renderRow = (s: Item) => {
        const state = st(s);
        const js = joinStateOf(s);
        const startsIn = state === 'scheduled' ? secsUntil(s, 'start', now) : 0;
        const open = () => setDetails(s);
        return (
            <div key={s.id} role="button" tabIndex={0} className={`sc-row sc-t-${s.type} is-${state}`} onClick={open}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } }}>
                <div className="sc-row-time">
                    <strong>{fmtTime(s.start, tz)}</strong>
                    <span>{durationText(s)}</span>
                </div>
                <div className="sc-row-body">
                    <div className="sc-row-title">{s.title}</div>
                    <div className="sc-row-meta">
                        <span>{TYPE_META[s.type].label}</span>
                        {s.teacher_name && <span><UserOutlined /> {s.teacher_name}</span>}
                        <span><ModeIcon s={s} /> {modeText(s)}</span>
                    </div>
                </div>
                <div className="sc-row-side">
                    {js === 'attended' ? <span className="sc-attended"><CheckCircleFilled /> Attended</span>
                        : js === 'open' ? (
                            <Button size="small" type="primary" icon={<LoginOutlined />}
                                onClick={e => { e.stopPropagation(); handleJoin(s); }}>Join</Button>
                        ) : state === 'scheduled'
                            ? startsIn < 86400 && <span className="sc-pill is-soon">In {untilText(startsIn)}</span>
                            : <StatePill state={state} />}
                </div>
            </div>
        );
    };

    /* ═══════════ LOADING ═══════════ */
    if (loading && schedules.length === 0) return (
        <div className="sc" aria-busy="true">
            <div className="sc-header">
                <div>
                    <Skeleton.Input active size="small" style={{ width: 90, height: 12 }} />
                    <div style={{ marginTop: 10 }}><Skeleton.Input active style={{ width: 220, height: 24 }} /></div>
                </div>
            </div>
            <div className="sc-overview">
                <div className="sc-panel sc-pad"><Skeleton active title={{ width: '40%' }} paragraph={{ rows: 2 }} /></div>
                <div className="sc-stats">
                    {[0, 1, 2, 3].map(i => (
                        <div key={i} className="sc-stat"><Skeleton.Avatar active shape="square" size={38} /><Skeleton.Input active size="small" style={{ width: 70 }} /></div>
                    ))}
                </div>
            </div>
            <div className="sc-main">
                <div className="sc-panel sc-pad"><Skeleton active paragraph={{ rows: 12 }} /></div>
                <div className="sc-panel sc-pad sc-agenda-skel"><Skeleton active paragraph={{ rows: 6 }} /></div>
            </div>
        </div>
    );

    const f = derived.featured;
    const fState = f ? st(f) : null;
    const fJoin = f ? joinStateOf(f) : 'none';
    const dState = details ? st(details) : null;
    const dJoin = details ? joinStateOf(details) : 'none';

    const stats: { key: string; label: string; value: number; icon: React.ReactNode; tone: string; tab?: AgendaTab }[] = [
        { key: 'week', label: 'This week', value: derived.week.length, icon: <CalendarOutlined />, tone: 'blue', tab: 'week' },
        { key: 'upcoming', label: 'Upcoming', value: derived.upcoming.length, icon: <FieldTimeOutlined />, tone: 'amber', tab: 'upcoming' },
        { key: 'done', label: 'Completed', value: derived.done, icon: <CheckCircleOutlined />, tone: 'green' },
        { key: 'total', label: 'All sessions', value: filtered.length, icon: <ScheduleOutlined />, tone: 'slate' },
    ];

    const emptyCopy: Record<string, { title: string; text: string }> = {
        day: { title: 'Nothing on this day', text: 'Pick another day in the calendar, or clear the selection.' },
        today: { title: 'No sessions today', text: 'Enjoy the free time — your next sessions are under Upcoming.' },
        upcoming: { title: 'Nothing scheduled ahead', text: 'New sessions from your teachers will appear here.' },
        active: { title: 'No active sessions', text: 'There are no sessions currently in progress.' },
        week: { title: 'No sessions this week', text: 'Check Upcoming for what comes next.' },
    };
    const empty = emptyCopy[selectedDay ? 'day' : agendaTab];

    return (
        <ConfigProvider theme={{ token: { colorPrimary: '#047857', fontSize: 13, borderRadius: 8 } }}>
            <div className="sc">
                {contextHolder}

                {/* ── Header ── */}
                <header className="sc-header">
                    <div>
                        <div className="sc-overline">Schedule</div>
                        <h1 className="sc-title">My schedule</h1>
                        <p className="sc-subtitle">Classes, exams and meetings from your batches. Times in {tzLabel} · {tz.replace(/_/g, ' ')}.</p>
                    </div>
                    <div className="sc-filters">
                        <RangePicker className="sc-range" value={dateRange} allowClear format="MMM D, YYYY" placeholder={['From', 'To']}
                            onChange={v => setDateRange(v && v[0] && v[1] ? [v[0], v[1]] : null)} />
                        {batchOptions.length > 1 && (
                            <Select className="sc-filter" value={batchFilter} onChange={setBatchFilter} allowClear placeholder="All batches"
                                options={batchOptions} showSearch optionFilterProp="label" />
                        )}
                        {teacherOptions.length > 1 && (
                            <Select className="sc-filter" value={teacherFilter} onChange={setTeacherFilter} allowClear placeholder="All teachers"
                                options={teacherOptions} showSearch optionFilterProp="label" />
                        )}
                        {hasFilters && (
                            <Button type="link" size="small" onClick={() => { setBatchFilter(null); setTeacherFilter(null); setDateRange(null); }}>
                                Clear filters
                            </Button>
                        )}
                    </div>
                </header>

                {error && (
                    <div className="sc-callout is-warning" role="alert">
                        <ExclamationCircleOutlined />
                        <div><strong>Couldn't load your schedule</strong><p>{error}</p></div>
                        <Button size="small" onClick={fetchSchedules}>Retry</Button>
                    </div>
                )}

                {/* ── Overview: next session + key numbers ── */}
                <section className="sc-overview" aria-label="Overview">
                    {f && fState ? (
                        <div className={`sc-next${fState === 'active' ? ' is-live' : ''}`}>
                            <div className="sc-next-main">
                                <span className="sc-next-over">
                                    {fState === 'active' ? <><i className="sc-pulse" aria-hidden /> In progress</> : `Next ${TYPE_META[f.type].label.toLowerCase()}`}
                                </span>
                                <h2 className="sc-next-title">{f.title}</h2>
                                <div className="sc-next-meta">
                                    <span><CalendarOutlined /> {f.dayKey === derived.todayKey ? 'Today' : f.dayKey === derived.tomorrowKey ? 'Tomorrow' : fmtDate(f.start, tz, true)}</span>
                                    <span><ClockCircleOutlined /> {timeRange(f, tz)}</span>
                                    {f.teacher_name && <span><UserOutlined /> {f.teacher_name}</span>}
                                    <span><ModeIcon s={f} /> {modeText(f)}</span>
                                </div>
                            </div>
                            <div className="sc-next-side">
                                <div className="sc-next-count">
                                    <span>{fState === 'active' ? 'Ends in' : 'Starts in'}</span>
                                    <strong>{untilText(secsUntil(f, fState === 'active' ? 'end' : 'start', now))}</strong>
                                </div>
                                <div className="sc-next-actions">
                                    {fJoin === 'attended' && <span className="sc-next-attended"><CheckCircleFilled /> Attended</span>}
                                    {fJoin === 'open' && <Button className="sc-btn-light" icon={<LoginOutlined />} onClick={() => handleJoin(f)}>{joinLabel(f)}</Button>}
                                    {fJoin === 'locked' && (
                                        <Tooltip title="Joining opens 5 minutes before the start">
                                            <Button className="sc-btn-light" icon={<LoginOutlined />} disabled>{joinLabel(f)}</Button>
                                        </Tooltip>
                                    )}
                                    <Button className="sc-btn-ghost" onClick={() => setDetails(f)}>Details</Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="sc-next is-empty">
                            <span className="sc-next-art"><CalendarOutlined /></span>
                            <div>
                                <h2 className="sc-next-title">You're all caught up</h2>
                                <p>No upcoming sessions{hasFilters ? ' match your filters' : ''}. New classes from your teachers will show up here.</p>
                            </div>
                        </div>
                    )}

                    <div className="sc-stats">
                        {stats.map(k => {
                            const body = (
                                <>
                                    <span className="sc-stat-icon">{k.icon}</span>
                                    <span className="sc-stat-text"><span>{k.label}</span><strong>{k.value}</strong></span>
                                </>
                            );
                            return k.tab ? (
                                <button key={k.key} type="button" className={`sc-stat sc-k-${k.tone}${!selectedDay && agendaTab === k.tab ? ' is-active' : ''}`}
                                    onClick={() => { setSelectedDay(null); setAgendaTab(k.tab!); }}>{body}</button>
                            ) : <div key={k.key} className={`sc-stat sc-k-${k.tone}`}>{body}</div>;
                        })}
                    </div>
                </section>

                {/* ── Calendar + agenda ── */}
                <div className="sc-main">
                    <section className="sc-panel sc-cal" aria-label="Calendar">
                        <div className="sc-cal-bar">
                            <div className="sc-cal-nav">
                                <Button icon={<LeftOutlined />} aria-label="Previous" onClick={() => api()?.prev()} />
                                <Button icon={<RightOutlined />} aria-label="Next" onClick={() => api()?.next()} />
                                <Button onClick={() => api()?.today()}>Today</Button>
                            </div>
                            <h2 className="sc-cal-title">{calTitle}</h2>
                            <Segmented className="sc-views" value={view}
                                onChange={v => { setView(v as CalView); api()?.changeView(v as CalView); }}
                                options={[{ label: 'Month', value: 'dayGridMonth' }, { label: 'Week', value: 'timeGridWeek' }, { label: 'Day', value: 'timeGridDay' }]} />
                        </div>
                        <div className={`sc-cal-body${r.isMobile ? ' is-mobile' : ''}`}>
                            <FullCalendar
                                ref={calRef}
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                initialView="dayGridMonth"
                                headerToolbar={false}
                                height={view === 'dayGridMonth' ? 'auto' : (r.isMobile ? 560 : 680)}
                                expandRows
                                fixedWeekCount={false}
                                now={nowProvider}
                                nowIndicator
                                events={events}
                                eventDisplay="block"
                                dayMaxEvents={r.isMobile ? 4 : 3}
                                dayHeaderFormat={r.isMobile ? { weekday: 'narrow' } : view === 'dayGridMonth' ? { weekday: 'short' } : { weekday: 'short', day: 'numeric' }}
                                titleFormat={view === 'timeGridDay' ? { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' } : undefined}
                                allDaySlot={false}
                                slotMinTime={slots.min}
                                slotMaxTime={slots.max}
                                scrollTime={slots.scroll}
                                slotLabelFormat={{ hour: 'numeric', meridiem: 'short' }}
                                eventTimeFormat={{ hour: 'numeric', minute: '2-digit', meridiem: 'short' }}
                                eventContent={renderEvent}
                                eventClick={onEventClick}
                                dateClick={onDateClick}
                                datesSet={onDatesSet}
                                dayCellClassNames={dayCellClassNames}
                                editable={false}
                                selectable={false}
                            />
                        </div>
                        <div className="sc-legend">
                            {TYPES.map(t => <span key={t} className={`sc-t-${t}`}><i aria-hidden />{TYPE_META[t].label}</span>)}
                            {view === 'dayGridMonth' && <span className="sc-legend-hint">Select a day to see its sessions</span>}
                        </div>
                    </section>

                    <aside className="sc-panel sc-agenda" aria-label="Agenda" ref={agendaRef}>
                        <div className="sc-agenda-head">
                            {selectedDay ? (
                                <div className="sc-dayhead">
                                    <div>
                                        <span>Selected day</span>
                                        <strong>{dayLabel(selectedDay)}</strong>
                                    </div>
                                    <Button size="small" type="text" icon={<CloseOutlined />} onClick={() => setSelectedDay(null)}>Clear</Button>
                                </div>
                            ) : (
                                <Segmented block size="small" value={agendaTab} onChange={v => setAgendaTab(v as AgendaTab)}
                                    options={[
                                        { value: 'today', label: <span className="sc-seg">Today <b>{derived.today.length}</b></span> },
                                        { value: 'upcoming', label: <span className="sc-seg">Upcoming <b>{derived.upcoming.length}</b></span> },
                                        { value: 'active', label: <span className="sc-seg">Active <b>{derived.active.length}</b></span> },
                                        { value: 'week', label: <span className="sc-seg">This week <b>{derived.week.length}</b></span> },
                                    ]} />
                            )}
                        </div>
                        <div className="sc-agenda-list">
                            {agendaItems.length === 0 ? (
                                <div className="sc-empty">
                                    <span className="sc-empty-art"><CalendarOutlined /></span>
                                    <strong>{empty.title}</strong>
                                    <span>{empty.text}</span>
                                    {!selectedDay && agendaTab === 'today' && derived.upcoming.length > 0 && (
                                        <Button size="small" onClick={() => setAgendaTab('upcoming')}>See upcoming</Button>
                                    )}
                                    {!selectedDay && agendaTab === 'active' && derived.upcoming.length > 0 && (
                                        <Button size="small" onClick={() => setAgendaTab('upcoming')}>See upcoming</Button>
                                    )}
                                </div>
                            ) : grouped ? groups.map(g => (
                                <div key={g.key} className="sc-group">
                                    <div className={`sc-group-label${g.key === derived.todayKey ? ' is-today' : ''}`}>{dayLabel(g.key)}</div>
                                    {g.items.map(renderRow)}
                                </div>
                            )) : agendaItems.map(renderRow)}
                            {!selectedDay && agendaTab === 'upcoming' && derived.upcoming.length > 30 && (
                                <div className="sc-agenda-more">Showing the next 30 of {derived.upcoming.length} sessions</div>
                            )}
                        </div>
                    </aside>
                </div>
            </div>

            {/* ── Session details ── */}
            <Modal open={!!details} onCancel={() => setDetails(null)} footer={null} width={560} centered className="sc-modal">
                {details && dState && (
                    <div className={`sc-md sc-t-${details.type}`}>
                        <header className="sc-md-head">
                            <div className="sc-md-tags">
                                <span className="sc-type-chip">{TYPE_META[details.type].icon} {TYPE_META[details.type].label}</span>
                                <StatePill state={dState} />
                            </div>
                            <h3>{details.title}</h3>
                            <p>{fmtDate(details.start, tz, true)}</p>
                        </header>
                        <dl className="sc-md-facts">
                            <div>
                                <span className="sc-md-ic"><ClockCircleOutlined /></span>
                                <div><dt>Time</dt><dd>{timeRange(details, tz)} <small>· {durationText(details)}</small></dd></div>
                            </div>
                            <div>
                                <span className="sc-md-ic"><UserOutlined /></span>
                                <div><dt>Teacher</dt><dd>{details.teacher_name || '—'}</dd></div>
                            </div>
                            <div>
                                <span className="sc-md-ic"><TeamOutlined /></span>
                                <div><dt>Batch</dt><dd>{details.batch_name || '—'}{details.french_level && <span className="sc-level">{details.french_level}</span>}</dd></div>
                            </div>
                            <div>
                                <span className="sc-md-ic"><ModeIcon s={details} /></span>
                                <div><dt>{details.location_mode === 'online' ? 'Meeting' : 'Location'}</dt><dd>{details.location_mode === 'online' ? (details.link ? 'Online — link opens when you join' : 'Online') : details.location || '—'}</dd></div>
                            </div>
                        </dl>
                        {details.description && (
                            <div className="sc-md-desc">
                                <h4>About this session</h4>
                                <p>{details.description}</p>
                            </div>
                        )}
                        <footer className="sc-md-foot">
                            <span className="sc-md-hint">
                                <InfoCircleOutlined />
                                {dState === 'cancelled' ? 'This session was cancelled.'
                                    : isOver(dState) ? 'This session has ended.'
                                        : dState === 'active' ? `In progress · ends in ${untilText(secsUntil(details, 'end', now))}`
                                            : `Starts in ${untilText(secsUntil(details, 'start', now))}${dJoin === 'locked' ? ' · joining opens 5 min before' : ''}`}
                            </span>
                            <div className="sc-md-actions">
                                <Button onClick={() => setDetails(null)}>Close</Button>
                                {dJoin === 'attended' && <span className="sc-attended"><CheckCircleFilled /> Attended</span>}
                                {(dJoin === 'open' || dJoin === 'locked') && (
                                    <Button type="primary" icon={<LoginOutlined />} disabled={dJoin === 'locked'} onClick={() => handleJoin(details)}>
                                        {joinLabel(details)}
                                    </Button>
                                )}
                            </div>
                        </footer>
                    </div>
                )}
            </Modal>

            {/* ── Join with access code ── */}
            <Modal open={joinOpen} onCancel={closeJoin} footer={null} width={460} centered className="sc-modal"
                closable={!joining} maskClosable={!joining}>
                {joinTarget && (
                    <div className="sc-join">
                        <div className="sc-join-head">
                            <span className="sc-join-icon"><KeyOutlined /></span>
                            <div>
                                <h3>{joinLabel(joinTarget)}</h3>
                                <p>{joinTarget.title}</p>
                            </div>
                        </div>
                        <div className="sc-join-summary">
                            <span><CalendarOutlined /> {fmtDate(joinTarget.start, tz)}</span>
                            <span><ClockCircleOutlined /> {timeRange(joinTarget, tz)}</span>
                            {joinTarget.teacher_name && <span><UserOutlined /> {joinTarget.teacher_name}</span>}
                            {joinTarget.batch_name && <span><TeamOutlined /> {joinTarget.batch_name}</span>}
                        </div>

                        {sessionStatus?.canJoin ? (
                            <>
                                <div className="sc-callout is-success">
                                    <CheckCircleFilled />
                                    <div><strong>Your class is live</strong><p>Enter the 6-character access code from your email to join and record your attendance.</p></div>
                                </div>
                                <label className="sc-code-label" htmlFor="sc-code">Access code</label>
                                <Input id="sc-code" className="sc-code" size="large" autoFocus autoComplete="one-time-code" maxLength={6}
                                    placeholder="••••••" prefix={<KeyOutlined />} value={accessCode}
                                    onChange={e => setAccessCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
                                    onPressEnter={submitAccessCode} />
                                <div className="sc-join-actions">
                                    <Button onClick={closeJoin} disabled={joining}>Cancel</Button>
                                    <Button type="primary" loading={joining} disabled={accessCode.length !== 6} onClick={submitAccessCode}>
                                        {joining ? 'Joining…' : joinLabel(joinTarget)}
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <>
                                {sessionStatus ? (
                                    <div className="sc-callout is-warning">
                                        <ExclamationCircleOutlined />
                                        <div><strong>You can't join yet</strong><p>{sessionStatus.reason || 'This session is not open for joining right now.'}</p></div>
                                    </div>
                                ) : (
                                    <div className="sc-callout is-info">
                                        <ClockCircleOutlined />
                                        <div><strong>Waiting for your teacher</strong><p>The session hasn't started. You'll get the access code by email as soon as it begins.</p></div>
                                    </div>
                                )}
                                <ol className="sc-steps">
                                    <li>Your teacher starts the class session.</li>
                                    <li>You receive a 6-character access code by email.</li>
                                    <li>Come back here, enter the code — attendance is recorded automatically.</li>
                                </ol>
                                <div className="sc-join-actions">
                                    <Button onClick={closeJoin}>Close</Button>
                                    <Button type="primary" onClick={() => handleJoin(joinTarget)}>Check again</Button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </Modal>
        </ConfigProvider>
    );
};

export default StudentSchedule;
