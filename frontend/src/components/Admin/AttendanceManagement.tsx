import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, ConfigProvider, DatePicker, Drawer, Dropdown, Input, Segmented, Select, Skeleton, Table, Tooltip, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    BarChartOutlined, CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, CloseOutlined,
    DownloadOutlined, ReloadOutlined, RiseOutlined, SearchOutlined, TeamOutlined, UserOutlined, WarningOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { useAuth } from '../../contexts/AuthContext';
import useResponsive from '../../hooks/useResponsive';
import { headerHeight } from '../Layout/layoutMetrics';
import { formatPlain, formatTimeLocal, resolveTimezone, timezoneLabel } from '../../utils/timezone';
import { initials } from './batchUtils';
import './AttendanceManagement.css';

/* ══════════════════════════════════════════
   ATTENDANCE — every figure on this page comes from the same list of held
   sessions for the chosen period, so the KPIs, charts and tables always agree.
══════════════════════════════════════════ */

interface Session {
    session_id: number;
    schedule_title?: string;
    batch_id?: number;
    batch_name: string;
    teacher_id?: number;
    teacher_name: string;
    starts_at?: string;
    ends_at?: string;
    session_date: string;
    start_time?: string;
    end_time?: string;
    total_students: number;
    present_count: number;
    late_count: number;
    absent_count: number;
    attendance_percentage: number;
    code_generated: boolean;
    session_started: boolean;
}
interface StudentRow {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    batch_id: number;
    batch_name: string;
    total_sessions: number;
    present_count: number;
    attendance_rate: number;
    last_attendance_date?: string | null;
}
interface RosterEntry { student_id: number; student_name: string; email: string; status: string; check_in_time?: string | null; }
interface HistoryEntry { session_id: number; starts_at: string; ends_at?: string; batch_name: string; teacher_name: string; status: string; check_in_time?: string | null; }
interface Option { id: number; name?: string; first_name?: string; last_name?: string; email?: string; }

type Period = '7d' | '30d' | '90d' | 'all' | 'custom';
type Tab = 'sessions' | 'students' | 'batches' | 'teachers';
type Tone = 'good' | 'warn' | 'bad' | 'none';
interface Agg { sessions: number; enrolled: number; attended: number; present: number; late: number; absent: number; }

const TARGET = 80;
const RISK = 60;
const PERIOD_DAYS: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 };
const PERIOD_LABEL: Record<Period, string> = { '7d': 'Last 7 days', '30d': 'Last 30 days', '90d': 'Last 90 days', all: 'All time', custom: 'Custom range' };
const WEEKDAYS = [1, 2, 3, 4, 5, 6, 0];
const WD_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WD_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/* ── helpers ── */
const toneOf = (rate: number | null | undefined, hasData = true): Tone =>
    !hasData || rate == null || Number.isNaN(rate) ? 'none' : rate >= TARGET ? 'good' : rate >= RISK ? 'warn' : 'bad';
const pct = (a: number, b: number) => (b > 0 ? (a * 100) / b : 0);
const fmtPct = (v: number | null | undefined) => (v == null || Number.isNaN(v) ? '—' : `${Math.round(v)}%`);
const fmtNum = (v: number) => v.toLocaleString('en-US');
const attendedOf = (s: Session) => (s.present_count || 0) + (s.late_count || 0);
const startIso = (s: Session) => s.starts_at || s.session_date;
const emptyAgg = (): Agg => ({ sessions: 0, enrolled: 0, attended: 0, present: 0, late: 0, absent: 0 });
const addTo = (a: Agg, s: Session) => {
    a.sessions += 1;
    a.enrolled += s.total_students || 0;
    a.attended += attendedOf(s);
    a.present += s.present_count || 0;
    a.late += s.late_count || 0;
    a.absent += s.absent_count || 0;
    return a;
};
const listOf = <T,>(d: unknown, key: string): T[] => (Array.isArray(d) ? d : Array.isArray((d as any)?.[key]) ? (d as any)[key] : []);
const personLabel = (o: Option) => o.name || `${o.first_name || ''} ${o.last_name || ''}`.trim() || `#${o.id}`;

const keyFmts = new Map<string, Intl.DateTimeFormat>();
/** YYYY-MM-DD of an instant in the viewer's timezone. */
const dayKey = (iso: string, tz: string) => {
    let f = keyFmts.get(tz);
    if (!f) { f = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }); keyFmts.set(tz, f); }
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? String(iso).slice(0, 10) : f.format(d);
};

const csvCell = (v: unknown) => { const s = v == null ? '' : String(v); return /[",\r\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
const downloadCsv = (name: string, rows: unknown[][]) => {
    const blob = new Blob(['﻿' + rows.map(r => r.map(csvCell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
};

const useWidth = (ref: React.RefObject<HTMLElement | null>) => {
    const [w, setW] = useState(0);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        setW(Math.round(el.getBoundingClientRect().width));
        const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
        ro.observe(el);
        return () => ro.disconnect();
    }, [ref]);
    return w;
};

/* ── small visual pieces ── */
const RateBar: React.FC<{ value: number | null; hasData?: boolean; compact?: boolean }> = ({ value, hasData = true, compact }) => {
    const t = toneOf(value, hasData);
    return (
        <span className={`at-rate is-${t}${compact ? ' is-compact' : ''}`}>
            <span className="at-rate-track"><span style={{ width: `${Math.min(100, Math.max(0, value || 0))}%` }} /></span>
            <strong>{hasData ? fmtPct(value) : '—'}</strong>
        </span>
    );
};

const Donut: React.FC<{ parts: { value: number; color: string }[]; size?: number; stroke?: number; children?: React.ReactNode }> = ({ parts, size = 136, stroke = 14, children }) => {
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const total = parts.reduce((t, p) => t + p.value, 0);
    let acc = 0;
    return (
        <div className="at-donut" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
                {total > 0 && parts.map((p, i) => {
                    const len = (p.value / total) * c;
                    const el = (
                        <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={p.color} strokeWidth={stroke}
                            strokeDasharray={`${Math.max(0, len - (len > 3 ? 1.5 : 0))} ${c}`} strokeDashoffset={-acc}
                            transform={`rotate(-90 ${size / 2} ${size / 2})`} />
                    );
                    acc += len;
                    return el;
                })}
            </svg>
            <div className="at-donut-center">{children}</div>
        </div>
    );
};

interface TrendPoint { key: string; label: string; long: string; sessions: number; enrolled: number; attended: number; rate: number | null; }

const TrendChart: React.FC<{ points: TrendPoint[] }> = ({ points }) => {
    const ref = useRef<HTMLDivElement>(null);
    const w = useWidth(ref);
    const [hover, setHover] = useState<number | null>(null);
    const H = 232, L = 40, R = 12, T = 14, B = 30;
    const iw = Math.max(0, w - L - R);
    const ih = H - T - B;
    const n = points.length;
    const step = n ? iw / n : 0;
    const maxS = Math.max(1, ...points.map(p => p.sessions));
    const y = (v: number) => T + ih - (v / 100) * ih;
    const x = (i: number) => L + step * i + step / 2;
    const barW = Math.max(3, Math.min(26, step * 0.46));
    const every = Math.max(1, Math.ceil(n / Math.max(1, Math.floor(iw / 64))));
    let line = '';
    let area = '';
    let run: number[] = [];
    const flush = () => {
        if (run.length) {
            area += `M${x(run[0]).toFixed(1)},${y(0)} ` + run.map(i => `L${x(i).toFixed(1)},${y(points[i].rate!).toFixed(1)}`).join(' ') + ` L${x(run[run.length - 1]).toFixed(1)},${y(0)} Z `;
        }
        run = [];
    };
    points.forEach((p, i) => {
        if (p.rate == null) { flush(); return; }
        line += `${run.length ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.rate).toFixed(1)} `;
        run.push(i);
    });
    flush();
    const hp = hover != null ? points[hover] : null;

    return (
        <div className="at-chart" ref={ref} onMouseLeave={() => setHover(null)}>
            {w > 0 && (
                <svg width={w} height={H} role="img" aria-label="Attendance rate over time">
                    <defs>
                        <linearGradient id="at-area" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.16" />
                            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    {[0, 25, 50, 75, 100].map(g => (
                        <g key={g}>
                            <line x1={L} x2={w - R} y1={y(g)} y2={y(g)} className="at-gridline" />
                            <text x={L - 8} y={y(g)} className="at-axis" textAnchor="end" dominantBaseline="middle">{g}%</text>
                        </g>
                    ))}
                    <line x1={L} x2={w - R} y1={y(TARGET)} y2={y(TARGET)} className="at-target" />
                    <text x={w - R} y={y(TARGET) - 5} className="at-target-label" textAnchor="end">Target {TARGET}%</text>
                    {points.map((p, i) => {
                        const h = (p.sessions / maxS) * ih * 0.42;
                        return <rect key={p.key} x={x(i) - barW / 2} y={T + ih - h} width={barW} height={h} rx={3} className={`at-vol${hover === i ? ' is-on' : ''}`} />;
                    })}
                    <path d={area} fill="url(#at-area)" />
                    <path d={line} className="at-line" />
                    {points.map((p, i) => p.rate != null && (
                        <circle key={p.key} cx={x(i)} cy={y(p.rate)} r={hover === i ? 5 : n > 40 ? 0 : 3} className={`at-dot is-${toneOf(p.rate)}`} />
                    ))}
                    {points.map((p, i) => (i % every === 0 || i === n - 1) && (i === n - 1 || n - 1 - i >= every / 2 || i === 0) && (
                        <text key={p.key} x={x(i)} y={H - 10} className="at-axis" textAnchor="middle">{p.label}</text>
                    ))}
                    {hover != null && <line x1={x(hover)} x2={x(hover)} y1={T} y2={T + ih} className="at-cursor" />}
                    {points.map((p, i) => (
                        <rect key={p.key} x={L + step * i} y={T} width={step} height={ih} fill="transparent" onMouseEnter={() => setHover(i)} />
                    ))}
                </svg>
            )}
            {hp && hover != null && (
                <div className="at-tip" style={{ left: Math.min(Math.max(x(hover), 90), w - 90), top: 6 }}>
                    <strong>{hp.long}</strong>
                    <span><i className={`is-${toneOf(hp.rate, hp.rate != null)}`} />{hp.rate == null ? 'No students expected' : `${fmtPct(hp.rate)} attendance`}</span>
                    <em>{hp.sessions} {hp.sessions === 1 ? 'session' : 'sessions'} · {fmtNum(hp.attended)}/{fmtNum(hp.enrolled)} seats</em>
                </div>
            )}
        </div>
    );
};

/* ══════════════════════════════════════════ */

const AttendanceManagement: React.FC = () => {
    const { apiCall, user } = useAuth();
    const navigate = useNavigate();
    const r = useResponsive();
    const [msg, msgHolder] = message.useMessage();
    const tz = resolveTimezone(user?.timezone);
    const isAdmin = user?.role === 'admin';

    const [period, setPeriod] = useState<Period>('30d');
    const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
    const [batchId, setBatchId] = useState<number | null>(null);
    const [teacherId, setTeacherId] = useState<number | null>(null);
    const [studentId, setStudentId] = useState<number | null>(null);

    const [sessions, setSessions] = useState<Session[]>([]);
    const [prevSessions, setPrevSessions] = useState<Session[] | null>(null);
    const [students, setStudents] = useState<StudentRow[]>([]);
    const [batchOpts, setBatchOpts] = useState<Option[]>([]);
    const [teacherOpts, setTeacherOpts] = useState<Option[]>([]);
    const [studentOpts, setStudentOpts] = useState<Option[]>([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [tab, setTab] = useState<Tab>('sessions');
    const [query, setQuery] = useState('');
    const [rankMode, setRankMode] = useState<'low' | 'high'>('low');
    const [sessionOpen, setSessionOpen] = useState<Session | null>(null);
    const [roster, setRoster] = useState<Record<number, RosterEntry[] | 'error'>>({});
    const [rosterFilter, setRosterFilter] = useState<'all' | 'present' | 'late' | 'absent'>('all');
    const [studentOpen, setStudentOpen] = useState<StudentRow | null>(null);
    const [history, setHistory] = useState<{ key: string; list: HistoryEntry[] | null; error?: boolean }>({ key: '', list: null });
    const reqId = useRef(0);
    const tablesRef = useRef<HTMLDivElement>(null);

    /* ── period → date window ── */
    const window_ = useMemo(() => {
        const today = dayjs();
        if (period === 'custom' && range) {
            const len = range[1].diff(range[0], 'day') + 1;
            return { from: range[0], to: range[1], prevFrom: range[0].subtract(len, 'day'), prevTo: range[0].subtract(1, 'day'), len };
        }
        const n = PERIOD_DAYS[period];
        if (!n) return null;
        const from = today.subtract(n - 1, 'day');
        return { from, to: today, prevFrom: from.subtract(n, 'day'), prevTo: from.subtract(1, 'day'), len: n };
    }, [period, range]);

    const load = useCallback(async () => {
        const id = ++reqId.current;
        const base = new URLSearchParams();
        if (batchId) base.set('batch_id', String(batchId));
        if (teacherId && isAdmin) base.set('teacher_id', String(teacherId));
        if (studentId) base.set('student_id', String(studentId));
        const cur = new URLSearchParams(base);
        const prev = new URLSearchParams(base);
        if (window_) {
            cur.set('date_from', window_.from.format('YYYY-MM-DD'));
            cur.set('date_to', window_.to.format('YYYY-MM-DD'));
            prev.set('date_from', window_.prevFrom.format('YYYY-MM-DD'));
            prev.set('date_to', window_.prevTo.format('YYYY-MM-DD'));
        }
        try {
            const [sRes, stRes, pRes] = await Promise.all([
                apiCall(`/attendance/reports/sessions?${cur}`),
                apiCall(`/attendance/reports/students?${cur}`),
                window_ ? apiCall(`/attendance/reports/sessions?${prev}`) : Promise.resolve(null),
            ]);
            if (id !== reqId.current) return;
            if (!sRes.ok) throw new Error(`The server answered ${sRes.status}.`);
            setSessions(listOf<Session>(await sRes.json(), 'sessions'));
            setStudents(stRes.ok ? listOf<StudentRow>(await stRes.json(), 'students') : []);
            setPrevSessions(pRes && pRes.ok ? listOf<Session>(await pRes.json(), 'sessions') : null);
            setError(null);
        } catch (e: any) {
            if (id === reqId.current) setError(e?.message || 'Could not load attendance.');
        } finally {
            if (id === reqId.current) { setLoading(false); setRefreshing(false); }
        }
    }, [apiCall, batchId, teacherId, studentId, isAdmin, window_]);

    useEffect(() => { setRefreshing(true); load(); }, [load]);

    useEffect(() => {
        (async () => {
            try {
                const [b, t, s] = await Promise.all([
                    apiCall('/batches'),
                    isAdmin ? apiCall('/users?role=teacher') : Promise.resolve(null),
                    apiCall('/users?role=student'),
                ]);
                if (b.ok) setBatchOpts(listOf<Option>(await b.json(), 'batches'));
                if (t?.ok) setTeacherOpts(listOf<Option>(await t.json(), 'users'));
                if (s.ok) setStudentOpts(listOf<Option>(await s.json(), 'users'));
            } catch { /* filters stay empty */ }
        })();
    }, [apiCall, isAdmin]);

    /* ── session roster + student history on demand ── */
    useEffect(() => {
        if (!sessionOpen || roster[sessionOpen.session_id]) return;
        const sid = sessionOpen.session_id;
        (async () => {
            try {
                const res = await apiCall(`/attendance/session-details-simple/${sid}`);
                const d = res.ok ? await res.json() : null;
                setRoster(p => ({ ...p, [sid]: d ? listOf<RosterEntry>(d, 'details') : 'error' }));
            } catch { setRoster(p => ({ ...p, [sid]: 'error' })); }
        })();
    }, [sessionOpen, roster, apiCall]);

    useEffect(() => {
        if (!studentOpen) return;
        const q = new URLSearchParams();
        q.set('batch_id', String(studentOpen.batch_id));
        if (window_) { q.set('date_from', window_.from.format('YYYY-MM-DD')); q.set('date_to', window_.to.format('YYYY-MM-DD')); }
        const key = `${studentOpen.id}?${q}`;
        if (history.key === key) return;
        setHistory({ key, list: null });
        (async () => {
            try {
                const res = await apiCall(`/attendance/reports/student-sessions/${studentOpen.id}?${q}`);
                if (!res.ok) throw new Error();
                setHistory({ key, list: listOf<HistoryEntry>(await res.json(), 'sessions') });
            } catch { setHistory({ key, list: [], error: true }); }
        })();
    }, [studentOpen, window_, history.key, apiCall]);

    /* ═══════════ DERIVED ═══════════ */
    const total = useMemo(() => sessions.reduce(addTo, emptyAgg()), [sessions]);
    const prevTotal = useMemo(() => (prevSessions ? prevSessions.reduce(addTo, emptyAgg()) : null), [prevSessions]);
    const rate = total.enrolled ? pct(total.attended, total.enrolled) : null;
    const prevRate = prevTotal && prevTotal.enrolled ? pct(prevTotal.attended, prevTotal.enrolled) : null;
    const delta = rate != null && prevRate != null ? Math.round(rate - prevRate) : null;
    const silent = useMemo(() => sessions.filter(s => s.total_students > 0 && attendedOf(s) === 0).length, [sessions]);

    const trend = useMemo<TrendPoint[]>(() => {
        if (!sessions.length) return [];
        const keyed = sessions.map(s => ({ s, k: dayKey(startIso(s), tz) }));
        const keys = keyed.map(e => e.k).sort();
        const first = dayjs(window_ ? window_.from.format('YYYY-MM-DD') : keys[0]);
        const last = dayjs(window_ ? window_.to.format('YYYY-MM-DD') : keys[keys.length - 1]);
        const span = last.diff(first, 'day');
        const unit: 'day' | 'week' | 'month' = span > 200 ? 'month' : span > 31 ? 'week' : 'day';
        const bucketStart = (d: Dayjs) => (unit === 'month' ? d.startOf('month') : unit === 'week' ? d.subtract((d.day() + 6) % 7, 'day') : d);
        const map = new Map<string, TrendPoint>();
        for (let cur = bucketStart(first); !cur.isAfter(last) && map.size < 200; cur = cur.add(1, unit)) {
            const k = cur.format('YYYY-MM-DD');
            map.set(k, {
                key: k,
                label: unit === 'month' ? cur.format('MMM YY') : span <= 7 ? cur.format('ddd D') : cur.format('MMM D'),
                long: unit === 'month' ? cur.format('MMMM YYYY') : unit === 'week' ? `Week of ${cur.format('MMM D, YYYY')}` : cur.format('dddd, MMM D'),
                sessions: 0, enrolled: 0, attended: 0, rate: null,
            });
        }
        keyed.forEach(({ s, k }) => {
            const p = map.get(bucketStart(dayjs(k)).format('YYYY-MM-DD'));
            if (!p) return;
            p.sessions += 1;
            p.enrolled += s.total_students || 0;
            p.attended += attendedOf(s);
        });
        return Array.from(map.values()).map(p => ({ ...p, rate: p.enrolled ? pct(p.attended, p.enrolled) : null }));
    }, [sessions, tz, window_]);

    const weekdays = useMemo(() => {
        const aggs = WEEKDAYS.map(d => ({ d, a: emptyAgg() }));
        sessions.forEach(s => { const d = dayjs(dayKey(startIso(s), tz)).day(); addTo(aggs.find(x => x.d === d)!.a, s); });
        const list = aggs.map(({ d, a }) => ({ d, sessions: a.sessions, rate: a.enrolled ? pct(a.attended, a.enrolled) : null }));
        const withData = list.filter(x => x.rate != null && x.sessions >= 2);
        const best = withData.length ? withData.reduce((m, x) => (x.rate! > m.rate! ? x : m)) : null;
        const worst = withData.length > 1 ? withData.reduce((m, x) => (x.rate! < m.rate! ? x : m)) : null;
        return { list, best, worst };
    }, [sessions, tz]);

    const batchRows = useMemo(() => {
        const map = new Map<string, { id?: number; name: string; teacher: string; teacher_id?: number; a: Agg; last: string }>();
        sessions.forEach(s => {
            const k = s.batch_id != null ? `id${s.batch_id}` : `n${s.batch_name}`;
            let row = map.get(k);
            if (!row) { row = { id: s.batch_id, name: s.batch_name, teacher: s.teacher_name, teacher_id: s.teacher_id, a: emptyAgg(), last: startIso(s) }; map.set(k, row); }
            addTo(row.a, s);
            if (startIso(s) > row.last) row.last = startIso(s);
        });
        const enrolled = new Map<number, number>();
        students.forEach(st => enrolled.set(st.batch_id, (enrolled.get(st.batch_id) || 0) + 1));
        return Array.from(map.values()).map(b => ({
            ...b,
            students: b.id != null ? enrolled.get(b.id) || 0 : 0,
            rate: b.a.enrolled ? pct(b.a.attended, b.a.enrolled) : null,
        }));
    }, [sessions, students]);

    const teacherRows = useMemo(() => {
        const map = new Map<string, { id?: number; name: string; a: Agg; batches: Set<string>; silent: number }>();
        sessions.forEach(s => {
            const k = s.teacher_id != null ? `id${s.teacher_id}` : `n${s.teacher_name}`;
            let row = map.get(k);
            if (!row) { row = { id: s.teacher_id, name: s.teacher_name, a: emptyAgg(), batches: new Set(), silent: 0 }; map.set(k, row); }
            addTo(row.a, s);
            row.batches.add(s.batch_name);
            if (s.total_students > 0 && attendedOf(s) === 0) row.silent += 1;
        });
        return Array.from(map.values()).map(t => ({ ...t, batchCount: t.batches.size, rate: t.a.enrolled ? pct(t.a.attended, t.a.enrolled) : null }))
            .sort((a, b) => b.a.sessions - a.a.sessions);
    }, [sessions]);

    const ranked = useMemo(() => {
        const list = batchRows.filter(b => b.rate != null);
        list.sort((a, b) => (rankMode === 'low' ? a.rate! - b.rate! : b.rate! - a.rate!));
        return list.slice(0, 7);
    }, [batchRows, rankMode]);

    const studentsWithData = useMemo(() => students.filter(s => s.total_sessions > 0), [students]);
    const atRisk = useMemo(() => studentsWithData.filter(s => s.total_sessions >= 3 && (s.attendance_rate || 0) < RISK)
        .sort((a, b) => (a.attendance_rate || 0) - (b.attendance_rate || 0)), [studentsWithData]);
    const uniqueStudents = useMemo(() => new Set(students.map(s => s.id)).size, [students]);

    const q = query.trim().toLowerCase();
    const visSessions = useMemo(() => (q ? sessions.filter(s => `${s.batch_name} ${s.teacher_name} ${s.schedule_title || ''}`.toLowerCase().includes(q)) : sessions), [sessions, q]);
    const visStudents = useMemo(() => (q ? students.filter(s => `${s.first_name} ${s.last_name} ${s.email} ${s.batch_name}`.toLowerCase().includes(q)) : students), [students, q]);
    const visBatches = useMemo(() => (q ? batchRows.filter(b => `${b.name} ${b.teacher}`.toLowerCase().includes(q)) : batchRows), [batchRows, q]);
    const visTeachers = useMemo(() => (q ? teacherRows.filter(t => t.name.toLowerCase().includes(q)) : teacherRows), [teacherRows, q]);

    /* ── formatting in the viewer's timezone ── */
    const dateText = (iso: string, opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }) => formatPlain(iso, user?.timezone, opts);
    const timeText = (s: { starts_at?: string; ends_at?: string; start_time?: string; end_time?: string }) =>
        s.starts_at ? `${formatTimeLocal(s.starts_at, user?.timezone)}${s.ends_at ? ` – ${formatTimeLocal(s.ends_at, user?.timezone)}` : ''}` : `${(s.start_time || '').slice(0, 5)} – ${(s.end_time || '').slice(0, 5)}`;
    const tzLabel = timezoneLabel(user?.timezone);

    const periodText = window_ ? `${window_.from.format('MMM D')} – ${window_.to.format('MMM D, YYYY')}` : 'All recorded sessions';
    const hasFilters = !!(batchId || teacherId || studentId);
    const clearFilters = () => { setBatchId(null); setTeacherId(null); setStudentId(null); };
    const focusTables = (t: Tab) => { setTab(t); setQuery(''); tablesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

    const exportSessions = () => {
        if (!sessions.length) { msg.info('There are no sessions to export for this period.'); return; }
        downloadCsv(`attendance-sessions_${dayjs().format('YYYY-MM-DD')}.csv`, [
            ['Date', 'Time', 'Batch', 'Teacher', 'Expected', 'Present', 'Late', 'Absent', 'Attendance %'],
            ...sessions.map(s => [dayKey(startIso(s), tz), timeText(s), s.batch_name, s.teacher_name, s.total_students, s.present_count, s.late_count, s.absent_count, Math.round(s.attendance_percentage || 0)]),
        ]);
    };
    const exportStudents = () => {
        if (!students.length) { msg.info('There are no students to export for this period.'); return; }
        downloadCsv(`attendance-students_${dayjs().format('YYYY-MM-DD')}.csv`, [
            ['Student', 'Email', 'Batch', 'Sessions', 'Attended', 'Missed', 'Attendance %', 'Last class'],
            ...students.map(s => [`${s.first_name} ${s.last_name}`, s.email, s.batch_name, s.total_sessions, s.present_count, Math.max(0, s.total_sessions - s.present_count), Math.round(s.attendance_rate || 0), s.last_attendance_date ? dayjs(s.last_attendance_date).format('YYYY-MM-DD') : '']),
        ]);
    };

    /* ═══════════ TABLE COLUMNS ═══════════ */
    const sessionStatus = (s: Session) => {
        if (s.total_students > 0 && attendedOf(s) === 0) return <span className="at-pill is-bad">No check-ins</span>;
        if (s.session_started) return <span className="at-pill is-good">Held</span>;
        if (s.code_generated) return <span className="at-pill is-info">Code issued</span>;
        return <span className="at-pill">Not started</span>;
    };

    const sessionCols: ColumnsType<Session> = [
        {
            title: 'Session', key: 'when', width: 200,
            sorter: (a, b) => startIso(a).localeCompare(startIso(b)), defaultSortOrder: 'descend',
            render: (_, s) => (
                <span className="at-cell-2">
                    <strong>{dateText(startIso(s), { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</strong>
                    <em>{timeText(s)}</em>
                </span>
            ),
        },
        {
            title: 'Batch', key: 'batch', ellipsis: true,
            sorter: (a, b) => a.batch_name.localeCompare(b.batch_name),
            render: (_, s) => <span className="at-cell-2"><strong>{s.batch_name}</strong><em>{s.teacher_name}</em></span>,
        },
        {
            title: 'Check-ins', key: 'counts', width: 210,
            render: (_, s) => (
                <span className="at-counts">
                    <span className="is-present" title="Present"><CheckCircleOutlined /> {s.present_count}</span>
                    <span className={`is-late${s.late_count ? '' : ' is-zero'}`} title="Late"><ClockCircleOutlined /> {s.late_count}</span>
                    <span className={`is-absent${s.absent_count ? '' : ' is-zero'}`} title="Absent"><CloseCircleOutlined /> {s.absent_count}</span>
                    <em>of {s.total_students}</em>
                </span>
            ),
        },
        {
            title: 'Attendance', key: 'rate', width: 170,
            sorter: (a, b) => (a.attendance_percentage || 0) - (b.attendance_percentage || 0),
            render: (_, s) => <RateBar value={s.attendance_percentage} hasData={s.total_students > 0} />,
        },
        { title: 'Status', key: 'status', width: 120, render: (_, s) => sessionStatus(s) },
    ];

    const studentCols: ColumnsType<StudentRow> = [
        {
            title: 'Student', key: 'name', ellipsis: true,
            sorter: (a, b) => `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`),
            render: (_, s) => (
                <span className="at-person">
                    <span className="at-av">{initials(`${s.first_name} ${s.last_name}`)}</span>
                    <span className="at-cell-2"><strong>{s.first_name} {s.last_name}</strong><em>{s.email}</em></span>
                </span>
            ),
        },
        { title: 'Batch', dataIndex: 'batch_name', key: 'batch', ellipsis: true, width: 190, sorter: (a, b) => (a.batch_name || '').localeCompare(b.batch_name || '') },
        {
            title: 'Attended', key: 'att', width: 130, align: 'center',
            sorter: (a, b) => (a.total_sessions - a.present_count) - (b.total_sessions - b.present_count),
            render: (_, s) => <span className="at-frac"><strong>{s.present_count}</strong>/{s.total_sessions}{s.total_sessions - s.present_count > 0 && <em>{s.total_sessions - s.present_count} missed</em>}</span>,
        },
        {
            title: 'Attendance', key: 'rate', width: 170, defaultSortOrder: 'ascend',
            sorter: (a, b) => (a.total_sessions ? a.attendance_rate || 0 : 101) - (b.total_sessions ? b.attendance_rate || 0 : 101),
            render: (_, s) => <RateBar value={s.attendance_rate} hasData={s.total_sessions > 0} />,
        },
        {
            title: 'Last class', key: 'last', width: 120,
            render: (_, s) => (s.last_attendance_date ? dayjs(s.last_attendance_date).format('MMM D, YYYY') : <span className="at-muted">—</span>),
        },
    ];

    type BatchRow = typeof batchRows[number];
    const batchCols: ColumnsType<BatchRow> = [
        { title: 'Batch', key: 'name', ellipsis: true, sorter: (a, b) => a.name.localeCompare(b.name), render: (_, b) => <span className="at-cell-2"><strong>{b.name}</strong><em>{b.teacher}</em></span> },
        { title: 'Students', key: 'students', width: 100, align: 'center', sorter: (a, b) => a.students - b.students, render: (_, b) => b.students || '—' },
        { title: 'Sessions', key: 'sessions', width: 100, align: 'center', sorter: (a, b) => a.a.sessions - b.a.sessions, render: (_, b) => b.a.sessions },
        { title: 'Absences', key: 'absent', width: 100, align: 'center', sorter: (a, b) => a.a.absent - b.a.absent, render: (_, b) => <span className={b.a.absent ? 'at-red' : 'at-muted'}>{b.a.absent}</span> },
        { title: 'Attendance', key: 'rate', width: 170, defaultSortOrder: 'ascend', sorter: (a, b) => (a.rate ?? 101) - (b.rate ?? 101), render: (_, b) => <RateBar value={b.rate} hasData={b.rate != null} /> },
        { title: 'Last session', key: 'last', width: 130, render: (_, b) => dateText(b.last, { month: 'short', day: 'numeric' }) },
    ];

    type TeacherRow = typeof teacherRows[number];
    const teacherCols: ColumnsType<TeacherRow> = [
        { title: 'Teacher', key: 'name', ellipsis: true, sorter: (a, b) => a.name.localeCompare(b.name), render: (_, t) => <span className="at-person"><span className="at-av is-teacher">{initials(t.name)}</span><strong>{t.name}</strong></span> },
        { title: 'Batches', key: 'batches', width: 100, align: 'center', sorter: (a, b) => a.batchCount - b.batchCount, render: (_, t) => t.batchCount },
        { title: 'Sessions held', key: 'sessions', width: 130, align: 'center', sorter: (a, b) => a.a.sessions - b.a.sessions, render: (_, t) => t.a.sessions },
        {
            title: 'No check-ins', key: 'silent', width: 130, align: 'center', sorter: (a, b) => a.silent - b.silent,
            render: (_, t) => (t.silent ? <Tooltip title="Sessions where no student checked in — the code may not have been shared."><span className="at-pill is-bad">{t.silent}</span></Tooltip> : <span className="at-muted">0</span>),
        },
        { title: 'Attendance', key: 'rate', width: 170, sorter: (a, b) => (a.rate ?? -1) - (b.rate ?? -1), render: (_, t) => <RateBar value={t.rate} hasData={t.rate != null} /> },
    ];

    /* ═══════════ LOADING ═══════════ */
    if (loading) {
        return (
            <div className="at" aria-busy="true">
                <div className="at-header"><div><Skeleton.Input active size="small" style={{ width: 130, height: 12 }} /><div style={{ marginTop: 10 }}><Skeleton.Input active style={{ width: 220, height: 26 }} /></div></div></div>
                <div className="at-card at-pad"><Skeleton.Input active block style={{ height: 32 }} /></div>
                <div className="at-kpis">{[0, 1, 2, 3, 4].map(i => <div key={i} className="at-kpi"><Skeleton active title={false} paragraph={{ rows: 3 }} /></div>)}</div>
                <div className="at-grid is-wide"><div className="at-card at-pad"><Skeleton active paragraph={{ rows: 7 }} /></div><div className="at-card at-pad"><Skeleton active paragraph={{ rows: 7 }} /></div></div>
            </div>
        );
    }

    const mobile = r.width < 768;
    const sticky = { offsetHeader: headerHeight(r.isMobile) };
    const rateTone = toneOf(rate, rate != null);
    const sessionRoster = sessionOpen ? roster[sessionOpen.session_id] : undefined;
    const rosterList = Array.isArray(sessionRoster) ? sessionRoster : [];
    const rosterCounts = { present: rosterList.filter(x => x.status === 'present').length, late: rosterList.filter(x => x.status === 'late').length, absent: rosterList.filter(x => x.status !== 'present' && x.status !== 'late').length };
    const hist = history.list;
    const histChrono = hist ? [...hist].reverse() : [];
    const absentStreak = hist ? (() => { let n = 0; for (const h of hist) { if (h.status === 'present' || h.status === 'late') break; n += 1; } return n; })() : 0;
    const histAgg = hist ? { present: hist.filter(h => h.status === 'present').length, late: hist.filter(h => h.status === 'late').length, absent: hist.filter(h => h.status !== 'present' && h.status !== 'late').length } : null;
    const histRate = hist && hist.length ? pct(histAgg!.present + histAgg!.late, hist.length) : null;

    const statusPill = (st: string) => (st === 'present' ? <span className="at-pill is-good">Present</span> : st === 'late' ? <span className="at-pill is-warn">Late</span> : <span className="at-pill is-bad">Absent</span>);

    return (
        <ConfigProvider theme={{ token: { colorPrimary: '#4f46e5', fontSize: 13, borderRadius: 8 } }}>
            {msgHolder}
            <div className="at">
                {/* ── Header ── */}
                <header className="at-header">
                    <div>
                        <div className="at-overline">Admin console · Tracking</div>
                        <h1 className="at-title">Attendance</h1>
                        <p className="at-subtitle">{PERIOD_LABEL[period]} · {periodText} · times in {tzLabel}</p>
                    </div>
                    <div className="at-header-actions">
                        <Tooltip title="Refresh"><Button icon={<ReloadOutlined spin={refreshing} />} aria-label="Refresh" onClick={() => { setRefreshing(true); load(); }} /></Tooltip>
                        <Dropdown trigger={['click']} menu={{ items: [{ key: 's', label: 'Sessions (CSV)', onClick: exportSessions }, { key: 'st', label: 'Students (CSV)', onClick: exportStudents }] }}>
                            <Button type="primary" icon={<DownloadOutlined />}>Export</Button>
                        </Dropdown>
                    </div>
                </header>

                {/* ── Filters ── */}
                <section className="at-card at-filters" aria-label="Filters">
                    <Segmented value={period === 'custom' ? '' : period} onChange={v => { setPeriod(v as Period); setRange(null); }}
                        options={[{ value: '7d', label: '7 days' }, { value: '30d', label: '30 days' }, { value: '90d', label: '90 days' }, { value: 'all', label: 'All time' }]} />
                    <DatePicker.RangePicker className="at-range" value={range} allowClear format="MMM D, YYYY" disabledDate={d => d.isAfter(dayjs(), 'day')}
                        onChange={v => { if (v && v[0] && v[1]) { setRange([v[0], v[1]]); setPeriod('custom'); } else { setRange(null); setPeriod('30d'); } }} />
                    <span className="at-filters-sep" />
                    <Select className="at-f" allowClear showSearch optionFilterProp="label" placeholder="All batches" value={batchId} onChange={v => setBatchId(v ?? null)}
                        options={batchOpts.map(b => ({ value: b.id, label: personLabel(b) }))} />
                    {isAdmin && (
                        <Select className="at-f" allowClear showSearch optionFilterProp="label" placeholder="All teachers" value={teacherId} onChange={v => setTeacherId(v ?? null)}
                            options={teacherOpts.map(t => ({ value: t.id, label: personLabel(t) }))} />
                    )}
                    <Select className="at-f is-wide" allowClear showSearch placeholder="Any student" value={studentId} onChange={v => setStudentId(v ?? null)}
                        suffixIcon={<UserOutlined />} optionFilterProp="search"
                        options={studentOpts.map(s => ({ value: s.id, label: personLabel(s), search: `${personLabel(s)} ${s.email || ''}` }))} />
                    {hasFilters && <Button type="link" size="small" onClick={clearFilters}>Clear</Button>}
                </section>

                {error && <div className="at-alert" role="alert"><WarningOutlined /><span><strong>Couldn't load attendance.</strong> {error}</span><Button size="small" onClick={() => { setRefreshing(true); load(); }}>Retry</Button></div>}

                <div className={`at-body${refreshing ? ' is-busy' : ''}`}>
                    {/* ── KPIs ── */}
                    <section className="at-kpis" aria-label="Summary">
                        <div className={`at-kpi is-hero is-${rateTone}`}>
                            <span className="at-kpi-label">Attendance rate</span>
                            <strong className="at-kpi-value">{fmtPct(rate)}</strong>
                            <span className="at-kpi-sub">
                                {delta != null ? (
                                    <span className={`at-delta ${delta > 0 ? 'is-up' : delta < 0 ? 'is-down' : ''}`}>{delta > 0 ? '▲' : delta < 0 ? '▼' : '•'} {Math.abs(delta)} pts</span>
                                ) : null}
                                {delta != null ? ` vs previous ${window_?.len} days` : `Target ${TARGET}%`}
                            </span>
                            <span className="at-kpi-meter"><span style={{ width: `${Math.min(100, rate || 0)}%` }} /><i style={{ left: `${TARGET}%` }} /></span>
                        </div>
                        <button type="button" className="at-kpi" onClick={() => focusTables('sessions')}>
                            <span className="at-kpi-ic is-indigo"><CalendarOutlined /></span>
                            <span className="at-kpi-label">Sessions held</span>
                            <strong className="at-kpi-value">{fmtNum(total.sessions)}</strong>
                            <span className="at-kpi-sub">{silent ? <span className="at-red">{silent} with no check-ins</span> : `${batchRows.length} ${batchRows.length === 1 ? 'batch' : 'batches'} · ${teacherRows.length} ${teacherRows.length === 1 ? 'teacher' : 'teachers'}`}</span>
                        </button>
                        <div className="at-kpi">
                            <span className="at-kpi-ic is-green"><CheckCircleOutlined /></span>
                            <span className="at-kpi-label">Check-ins</span>
                            <strong className="at-kpi-value">{fmtNum(total.attended)}</strong>
                            <span className="at-kpi-sub">of {fmtNum(total.enrolled)} expected{total.late ? ` · ${total.late} late` : ''}</span>
                        </div>
                        <div className="at-kpi">
                            <span className="at-kpi-ic is-red"><CloseCircleOutlined /></span>
                            <span className="at-kpi-label">Absences</span>
                            <strong className="at-kpi-value">{fmtNum(total.absent)}</strong>
                            <span className="at-kpi-sub">{total.enrolled ? `${fmtPct(pct(total.absent, total.enrolled))} of expected seats` : 'No expected seats'}</span>
                        </div>
                        <button type="button" className="at-kpi" onClick={() => focusTables('students')}>
                            <span className="at-kpi-ic is-amber"><WarningOutlined /></span>
                            <span className="at-kpi-label">Students at risk</span>
                            <strong className="at-kpi-value">{atRisk.length}</strong>
                            <span className="at-kpi-sub">below {RISK}% · of {uniqueStudents} {uniqueStudents === 1 ? 'student' : 'students'}</span>
                        </button>
                    </section>

                    {sessions.length === 0 ? (
                        <section className="at-card at-empty">
                            <span className="at-empty-ic"><CalendarOutlined /></span>
                            <strong>No sessions in this period</strong>
                            <span>Attendance appears here once teachers start classes. Try a longer period{hasFilters ? ' or clear the filters' : ''}.</span>
                            <div className="at-empty-actions">
                                {period !== 'all' && <Button onClick={() => { setPeriod('all'); setRange(null); }}>Show all time</Button>}
                                {hasFilters && <Button onClick={clearFilters}>Clear filters</Button>}
                            </div>
                        </section>
                    ) : (
                        <>
                            {/* ── Trend + breakdown ── */}
                            <div className="at-grid is-wide">
                                <section className="at-card">
                                    <div className="at-card-head">
                                        <span className="at-card-title"><span className="at-card-ic"><RiseOutlined /></span>Attendance over time</span>
                                        <span className="at-legend"><i className="is-line" />Rate <i className="is-bar" />Sessions</span>
                                    </div>
                                    <div className="at-card-body is-chart"><TrendChart points={trend} /></div>
                                </section>
                                <section className="at-card">
                                    <div className="at-card-head"><span className="at-card-title"><span className="at-card-ic"><BarChartOutlined /></span>Breakdown</span></div>
                                    <div className="at-card-body at-breakdown">
                                        <Donut parts={[{ value: total.present, color: '#10b981' }, { value: total.late, color: '#f59e0b' }, { value: total.absent, color: '#ef4444' }]}>
                                            <strong>{fmtPct(rate)}</strong><span>attended</span>
                                        </Donut>
                                        <ul className="at-bd-list">
                                            {[
                                                { k: 'Present', v: total.present, c: 'is-present' },
                                                { k: 'Late', v: total.late, c: 'is-late' },
                                                { k: 'Absent', v: total.absent, c: 'is-absent' },
                                            ].map(x => (
                                                <li key={x.k} className={x.c}><i /><span>{x.k}</span><strong>{fmtNum(x.v)}</strong><em>{fmtPct(pct(x.v, total.enrolled))}</em></li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="at-weekdays">
                                        <div className="at-sub-title">By weekday</div>
                                        <div className="at-wd">
                                            {weekdays.list.map(w => (
                                                <Tooltip key={w.d} title={w.sessions ? `${WD_LONG[w.d]}: ${fmtPct(w.rate)} · ${w.sessions} ${w.sessions === 1 ? 'session' : 'sessions'}` : `${WD_LONG[w.d]}: no sessions`}>
                                                    <div className={`at-wd-col is-${toneOf(w.rate, w.rate != null)}`}>
                                                        <span className="at-wd-bar"><span style={{ height: `${w.rate ?? 0}%` }} /></span>
                                                        <em>{WD_SHORT[w.d][0]}</em>
                                                    </div>
                                                </Tooltip>
                                            ))}
                                        </div>
                                        {weekdays.best && weekdays.worst && weekdays.best.d !== weekdays.worst.d && (
                                            <p className="at-insight">Best on <strong>{WD_LONG[weekdays.best.d]}</strong> ({fmtPct(weekdays.best.rate)}), weakest on <strong>{WD_LONG[weekdays.worst.d]}</strong> ({fmtPct(weekdays.worst.rate)}).</p>
                                        )}
                                    </div>
                                </section>
                            </div>

                            {/* ── Batches + students at risk ── */}
                            <div className="at-grid">
                                <section className="at-card">
                                    <div className="at-card-head">
                                        <span className="at-card-title"><span className="at-card-ic"><TeamOutlined /></span>Batches</span>
                                        <Segmented size="small" value={rankMode} onChange={v => setRankMode(v as 'low' | 'high')} options={[{ value: 'low', label: 'Lowest' }, { value: 'high', label: 'Highest' }]} />
                                    </div>
                                    <ol className="at-rank">
                                        {ranked.map((b, i) => (
                                            <li key={`${b.id ?? b.name}`}>
                                                <button type="button" onClick={() => b.id != null && setBatchId(b.id)} disabled={b.id == null} title="Filter the page by this batch">
                                                    <span className="at-rank-n">{i + 1}</span>
                                                    <span className="at-cell-2"><strong>{b.name}</strong><em>{b.teacher} · {b.a.sessions} {b.a.sessions === 1 ? 'session' : 'sessions'}</em></span>
                                                    <RateBar value={b.rate} compact />
                                                </button>
                                            </li>
                                        ))}
                                    </ol>
                                    {batchRows.length > ranked.length && <div className="at-card-foot"><button type="button" className="at-link" onClick={() => focusTables('batches')}>All {batchRows.length} batches</button></div>}
                                </section>
                                <section className="at-card">
                                    <div className="at-card-head">
                                        <span className="at-card-title"><span className="at-card-ic is-amber"><WarningOutlined /></span>Students to follow up</span>
                                        {atRisk.length > 0 && <span className="at-count is-amber">{atRisk.length}</span>}
                                    </div>
                                    {atRisk.length === 0 ? (
                                        <div className="at-allgood"><CheckCircleOutlined /><strong>No student below {RISK}%</strong><span>Among students with at least 3 sessions in this period.</span></div>
                                    ) : (
                                        <ul className="at-risk">
                                            {atRisk.slice(0, 7).map(s => (
                                                <li key={`${s.id}-${s.batch_id}`}>
                                                    <button type="button" onClick={() => setStudentOpen(s)}>
                                                        <span className="at-av">{initials(`${s.first_name} ${s.last_name}`)}</span>
                                                        <span className="at-cell-2"><strong>{s.first_name} {s.last_name}</strong><em>{s.batch_name} · missed {Math.max(0, s.total_sessions - s.present_count)} of {s.total_sessions}</em></span>
                                                        <RateBar value={s.attendance_rate} compact />
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    {atRisk.length > 7 && <div className="at-card-foot"><button type="button" className="at-link" onClick={() => focusTables('students')}>See all {atRisk.length}</button></div>}
                                </section>
                            </div>
                        </>
                    )}

                    {/* ── Detail tables ── */}
                    <section className="at-card at-tables" ref={tablesRef}>
                        <div className="at-tabs">
                            <Segmented value={tab} onChange={v => { setTab(v as Tab); setQuery(''); }} options={[
                                { value: 'sessions', label: <span className="at-seg">Sessions <em>{sessions.length}</em></span> },
                                { value: 'students', label: <span className="at-seg">Students <em>{students.length}</em></span> },
                                { value: 'batches', label: <span className="at-seg">Batches <em>{batchRows.length}</em></span> },
                                ...(isAdmin ? [{ value: 'teachers', label: <span className="at-seg">Teachers <em>{teacherRows.length}</em></span> }] : []),
                            ]} />
                            <Input className="at-search" allowClear prefix={<SearchOutlined />} value={query} onChange={e => setQuery(e.target.value)}
                                placeholder={tab === 'students' ? 'Search student, email or batch' : tab === 'teachers' ? 'Search teacher' : 'Search batch or teacher'} />
                        </div>

                        {tab === 'sessions' && (mobile ? (
                            <div className="at-mlist">
                                {visSessions.slice(0, 60).map(s => (
                                    <button key={s.session_id} type="button" className="at-mcard" onClick={() => { setRosterFilter('all'); setSessionOpen(s); }}>
                                        <span className="at-mcard-top"><strong>{s.batch_name}</strong>{sessionStatus(s)}</span>
                                        <em>{dateText(startIso(s), { weekday: 'short', month: 'short', day: 'numeric' })} · {timeText(s)} · {s.teacher_name}</em>
                                        <span className="at-mcard-bottom">
                                            <span className="at-counts"><span className="is-present"><CheckCircleOutlined /> {s.present_count}</span><span className="is-late"><ClockCircleOutlined /> {s.late_count}</span><span className="is-absent"><CloseCircleOutlined /> {s.absent_count}</span></span>
                                            <RateBar value={s.attendance_percentage} hasData={s.total_students > 0} compact />
                                        </span>
                                    </button>
                                ))}
                                {visSessions.length > 60 && <div className="at-muted-line">Showing the 60 most recent. Narrow the period to see more.</div>}
                                {visSessions.length === 0 && <div className="at-muted-line">No session matches.</div>}
                            </div>
                        ) : (
                            <Table<Session> rowKey="session_id" size="middle" columns={sessionCols} dataSource={visSessions} sticky={sticky} scroll={{ x: 860 }}
                                pagination={{ pageSize: 15, showSizeChanger: false, hideOnSinglePage: true, showTotal: t => `${t} sessions` }}
                                onRow={s => ({ onClick: () => { setRosterFilter('all'); setSessionOpen(s); }, className: 'at-clickable' })}
                                locale={{ emptyText: <div className="at-muted-line">No session matches.</div> }} />
                        ))}

                        {tab === 'students' && (mobile ? (
                            <div className="at-mlist">
                                {visStudents.map(s => (
                                    <button key={`${s.id}-${s.batch_id}`} type="button" className="at-mcard" onClick={() => setStudentOpen(s)}>
                                        <span className="at-person"><span className="at-av">{initials(`${s.first_name} ${s.last_name}`)}</span><span className="at-cell-2"><strong>{s.first_name} {s.last_name}</strong><em>{s.batch_name}</em></span></span>
                                        <span className="at-mcard-bottom"><span className="at-frac"><strong>{s.present_count}</strong>/{s.total_sessions} attended</span><RateBar value={s.attendance_rate} hasData={s.total_sessions > 0} compact /></span>
                                    </button>
                                ))}
                                {visStudents.length === 0 && <div className="at-muted-line">No student matches.</div>}
                            </div>
                        ) : (
                            <Table<StudentRow> rowKey={s => `${s.id}-${s.batch_id}`} size="middle" columns={studentCols} dataSource={visStudents} sticky={sticky} scroll={{ x: 820 }}
                                pagination={{ pageSize: 15, showSizeChanger: false, hideOnSinglePage: true, showTotal: t => `${t} students` }}
                                onRow={s => ({ onClick: () => setStudentOpen(s), className: `at-clickable${s.total_sessions >= 3 && (s.attendance_rate || 0) < RISK ? ' is-risk' : ''}` })}
                                locale={{ emptyText: <div className="at-muted-line">No student matches.</div> }} />
                        ))}

                        {tab === 'batches' && (mobile ? (
                            <div className="at-mlist">
                                {visBatches.map(b => (
                                    <button key={`${b.id ?? b.name}`} type="button" className="at-mcard" onClick={() => b.id != null && navigate(`/app/batches/${b.id}/insights`)}>
                                        <span className="at-mcard-top"><strong>{b.name}</strong></span>
                                        <em>{b.teacher} · {b.a.sessions} sessions · {b.a.absent} absences</em>
                                        <span className="at-mcard-bottom"><span /><RateBar value={b.rate} hasData={b.rate != null} compact /></span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <Table<BatchRow> rowKey={b => `${b.id ?? b.name}`} size="middle" columns={batchCols} dataSource={visBatches} sticky={sticky} scroll={{ x: 760 }}
                                pagination={{ pageSize: 15, showSizeChanger: false, hideOnSinglePage: true }}
                                onRow={b => ({ onClick: () => b.id != null && navigate(`/app/batches/${b.id}/insights`), className: 'at-clickable' })}
                                locale={{ emptyText: <div className="at-muted-line">No batch matches.</div> }} />
                        ))}

                        {tab === 'teachers' && (mobile ? (
                            <div className="at-mlist">
                                {visTeachers.map(t => (
                                    <button key={`${t.id ?? t.name}`} type="button" className="at-mcard" onClick={() => t.id != null && setTeacherId(t.id)}>
                                        <span className="at-person"><span className="at-av is-teacher">{initials(t.name)}</span><span className="at-cell-2"><strong>{t.name}</strong><em>{t.a.sessions} sessions · {t.batchCount} batches{t.silent ? ` · ${t.silent} without check-ins` : ''}</em></span></span>
                                        <span className="at-mcard-bottom"><span /><RateBar value={t.rate} hasData={t.rate != null} compact /></span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <Table<TeacherRow> rowKey={t => `${t.id ?? t.name}`} size="middle" columns={teacherCols} dataSource={visTeachers} sticky={sticky} scroll={{ x: 700 }}
                                pagination={{ pageSize: 15, showSizeChanger: false, hideOnSinglePage: true }}
                                onRow={t => ({ onClick: () => t.id != null && setTeacherId(t.id), className: 'at-clickable', title: 'Filter the page by this teacher' })}
                                locale={{ emptyText: <div className="at-muted-line">No teacher matches.</div> }} />
                        ))}
                    </section>
                </div>

                {/* ── Session roster ── */}
                <Drawer open={!!sessionOpen} onClose={() => setSessionOpen(null)} width={mobile ? '100%' : 460} closable={false} title={null} className="at-drawer">
                    {sessionOpen && (
                        <div className="at-detail">
                            <div className="at-dh">
                                <div className="at-dh-top">
                                    <span className="at-overline">Session</span>
                                    <button type="button" className="at-dclose" onClick={() => setSessionOpen(null)} aria-label="Close"><CloseOutlined /></button>
                                </div>
                                <h3>{sessionOpen.batch_name}</h3>
                                <p>{dateText(startIso(sessionOpen), { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} · {timeText(sessionOpen)}</p>
                                <p className="at-dh-sub">{sessionOpen.teacher_name}{sessionOpen.schedule_title ? ` · ${sessionOpen.schedule_title}` : ''}</p>
                                <div className="at-dh-stats">
                                    <div className={`is-${toneOf(sessionOpen.attendance_percentage, sessionOpen.total_students > 0)}`}><strong>{sessionOpen.total_students ? fmtPct(sessionOpen.attendance_percentage) : '—'}</strong><span>attendance</span></div>
                                    <div><strong className="at-green">{sessionOpen.present_count}</strong><span>present</span></div>
                                    <div><strong className="at-amber">{sessionOpen.late_count}</strong><span>late</span></div>
                                    <div><strong className="at-red">{sessionOpen.absent_count}</strong><span>absent</span></div>
                                </div>
                                <div className="at-stack" aria-hidden="true">
                                    <span className="is-present" style={{ flex: sessionOpen.present_count }} /><span className="is-late" style={{ flex: sessionOpen.late_count }} /><span className="is-absent" style={{ flex: sessionOpen.absent_count }} />
                                </div>
                            </div>

                            <div className="at-dsec">
                                <div className="at-dsec-head">
                                    <h4>Roster</h4>
                                    {Array.isArray(sessionRoster) && sessionRoster.length > 0 && (
                                        <Segmented size="small" value={rosterFilter} onChange={v => setRosterFilter(v as typeof rosterFilter)} options={[
                                            { value: 'all', label: `All ${rosterList.length}` },
                                            { value: 'present', label: `Present ${rosterCounts.present}` },
                                            { value: 'late', label: `Late ${rosterCounts.late}` },
                                            { value: 'absent', label: `Absent ${rosterCounts.absent}` },
                                        ]} />
                                    )}
                                </div>
                                {sessionRoster === undefined ? <Skeleton active avatar paragraph={{ rows: 3 }} />
                                    : sessionRoster === 'error' ? <div className="at-muted-line">Couldn't load the roster.</div>
                                    : rosterList.length === 0 ? <div className="at-muted-line">No students enrolled in this batch.</div>
                                    : (
                                        <ul className="at-roster">
                                            {rosterList
                                                .filter(x => rosterFilter === 'all' || (rosterFilter === 'absent' ? x.status !== 'present' && x.status !== 'late' : x.status === rosterFilter))
                                                .map(x => (
                                                    <li key={x.student_id}>
                                                        <span className={`at-av is-${x.status === 'present' ? 'good' : x.status === 'late' ? 'warn' : 'bad'}`}>{initials(x.student_name)}</span>
                                                        <span className="at-cell-2"><strong>{x.student_name}</strong><em>{x.check_in_time ? `Checked in ${formatTimeLocal(x.check_in_time, user?.timezone)}` : x.email}</em></span>
                                                        {statusPill(x.status)}
                                                    </li>
                                                ))}
                                        </ul>
                                    )}
                            </div>

                            {sessionOpen.batch_id != null && (
                                <div className="at-dactions">
                                    <Button onClick={() => { setBatchId(sessionOpen.batch_id!); setSessionOpen(null); }}>Filter by this batch</Button>
                                    <Button type="primary" icon={<BarChartOutlined />} onClick={() => navigate(`/app/batches/${sessionOpen.batch_id}/insights`)}>Batch insights</Button>
                                </div>
                            )}
                        </div>
                    )}
                </Drawer>

                {/* ── Student history ── */}
                <Drawer open={!!studentOpen} onClose={() => setStudentOpen(null)} width={mobile ? '100%' : 460} closable={false} title={null} className="at-drawer">
                    {studentOpen && (
                        <div className="at-detail">
                            <div className="at-dh">
                                <div className="at-dh-top">
                                    <span className="at-overline">Student</span>
                                    <button type="button" className="at-dclose" onClick={() => setStudentOpen(null)} aria-label="Close"><CloseOutlined /></button>
                                </div>
                                <div className="at-person is-lg">
                                    <span className="at-av">{initials(`${studentOpen.first_name} ${studentOpen.last_name}`)}</span>
                                    <span className="at-cell-2"><h3>{studentOpen.first_name} {studentOpen.last_name}</h3><em>{studentOpen.email}</em></span>
                                </div>
                                <p className="at-dh-sub">{studentOpen.batch_name} · {PERIOD_LABEL[period].toLowerCase()}</p>
                                <div className="at-dh-stats">
                                    <div className={`is-${toneOf(histRate ?? studentOpen.attendance_rate, (hist?.length ?? studentOpen.total_sessions) > 0)}`}><strong>{fmtPct(histRate ?? studentOpen.attendance_rate)}</strong><span>attendance</span></div>
                                    <div><strong className="at-green">{histAgg ? histAgg.present : '–'}</strong><span>present</span></div>
                                    <div><strong className="at-amber">{histAgg ? histAgg.late : '–'}</strong><span>late</span></div>
                                    <div><strong className="at-red">{histAgg ? histAgg.absent : '–'}</strong><span>absent</span></div>
                                </div>
                            </div>

                            {absentStreak >= 2 && (
                                <div className="at-alert is-amber is-inline"><WarningOutlined /><span><strong>Missed the last {absentStreak} sessions.</strong> Consider reaching out.</span></div>
                            )}

                            {hist && hist.length > 0 && (
                                <div className="at-dsec">
                                    <h4>Last {Math.min(30, hist.length)} sessions</h4>
                                    <div className="at-strip">
                                        {histChrono.slice(-30).map(h => (
                                            <Tooltip key={h.session_id} title={`${dateText(h.starts_at, { month: 'short', day: 'numeric' })} · ${h.status === 'present' ? 'Present' : h.status === 'late' ? 'Late' : 'Absent'}`}>
                                                <span className={`is-${h.status === 'present' ? 'good' : h.status === 'late' ? 'warn' : 'bad'}`} />
                                            </Tooltip>
                                        ))}
                                    </div>
                                    <div className="at-strip-legend"><span><i className="is-good" />Present</span><span><i className="is-warn" />Late</span><span><i className="is-bad" />Absent</span><em>oldest → newest</em></div>
                                </div>
                            )}

                            <div className="at-dsec">
                                <h4>History</h4>
                                {hist === null ? <Skeleton active paragraph={{ rows: 4 }} />
                                    : history.error ? <div className="at-muted-line">Couldn't load this student's history.</div>
                                    : hist.length === 0 ? <div className="at-muted-line">No sessions in this period.</div>
                                    : (
                                        <ul className="at-hist">
                                            {hist.map(h => (
                                                <li key={h.session_id}>
                                                    <span className="at-cell-2">
                                                        <strong>{dateText(h.starts_at, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</strong>
                                                        <em>{timeText(h)}{h.check_in_time ? ` · in at ${formatTimeLocal(h.check_in_time, user?.timezone)}` : ''}</em>
                                                    </span>
                                                    {statusPill(h.status)}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                            </div>

                            <div className="at-dactions">
                                <Button onClick={() => { setStudentId(studentOpen.id); setStudentOpen(null); }}>Filter by this student</Button>
                                <Button type="primary" icon={<BarChartOutlined />} onClick={() => navigate(`/app/batches/${studentOpen.batch_id}/insights`)}>Batch insights</Button>
                            </div>
                        </div>
                    )}
                </Drawer>
            </div>
        </ConfigProvider>
    );
};

export default AttendanceManagement;
