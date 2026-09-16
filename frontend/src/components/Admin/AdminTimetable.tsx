import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, ConfigProvider, Drawer, Input, Segmented, Select, Skeleton, Switch, Tooltip } from 'antd';
import {
    AppstoreOutlined, BarChartOutlined, CalendarOutlined, ClockCircleOutlined, CloseOutlined, EditOutlined, EnvironmentOutlined,
    LinkOutlined, ReloadOutlined, SearchOutlined, TeamOutlined, UnorderedListOutlined, WarningOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import useResponsive from '../../hooks/useResponsive';
import { formatPlain, resolveTimezone, timezoneLabel } from '../../utils/timezone';
import { LEVELS, STATUS_LABEL, WEEK, countOf, hoursText, initials, levelTone, statusOf } from './batchUtils';
import type { Batch } from './batchUtils';
import './AdminTimetable.css';

/* ══════════════════════════════════════════
   TEACHER TIMETABLE — the recurring weekly schedule of every batch.
   Each slot is stored in its batch's timezone; it is converted to the viewer's
   timezone so every class sits at the right hour (and on the right day).
══════════════════════════════════════════ */

interface Entry {
    id: number;
    batch_id: number;
    day_of_week: number;
    start_time: string;
    end_time: string;
    timezone?: string | null;
    location_mode?: string | null;
    location?: string | null;
    link?: string | null;
    batch_name: string;
    french_level: string;
    start_date: string;
    end_date: string;
    teacher_id: number;
    teacher_first_name: string;
    teacher_last_name: string;
}
interface Slot extends Entry {
    day: number;        // viewer weekday, 0 = Sunday
    start: number;      // minutes from midnight (viewer tz)
    end: number;
    teacher: string;
    color: string;
    ended: boolean;
    upcoming: boolean;
    converted: boolean;
    lane: number;
    lanes: number;
}
interface Student { id: number; first_name: string; last_name: string; email: string; }
type View = 'week' | 'agenda' | 'teachers';
type Mode = 'all' | 'online' | 'physical';

const PALETTE = ['#4f46e5', '#059669', '#e11d48', '#d97706', '#0284c7', '#7c3aed', '#0d9488', '#ea580c', '#db2777', '#65a30d'];

/* ── Timezone maths (no library) ── */
const fmtCache = new Map<string, Intl.DateTimeFormat>();
const partsIn = (ms: number, tz: string) => {
    let f = fmtCache.get(tz);
    if (!f) {
        f = new Intl.DateTimeFormat('en-US', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
        fmtCache.set(tz, f);
    }
    const p: Record<string, number> = {};
    for (const x of f.formatToParts(new Date(ms))) if (x.type !== 'literal') p[x.type] = Number(x.value);
    return { y: p.year, m: p.month, d: p.day, h: p.hour % 24, mi: p.minute };
};
const offsetMs = (tz: string, ms: number) => {
    const p = partsIn(ms, tz);
    return Date.UTC(p.y, p.m - 1, p.d, p.h, p.mi) - Math.floor(ms / 60000) * 60000;
};
const validTz = (tz?: string | null) => {
    if (!tz) return null;
    try { new Intl.DateTimeFormat('en-US', { timeZone: tz }); return tz; } catch { return null; }
};
const toMin = (t: string) => { const [h, m] = (t || '0:0').split(':').map(Number); return (h || 0) * 60 + (m || 0); };

/** Recurring slot (weekday + wall time in `srcTz`) → weekday + minutes in `viewTz`, for the current week. */
const convertSlot = (dow: number, startMin: number, durMin: number, srcTz: string, viewTz: string) => {
    if (srcTz === viewTz) return { day: dow, start: startMin, end: startMin + durMin };
    const now = partsIn(Date.now(), srcTz);
    const todayDow = new Date(Date.UTC(now.y, now.m - 1, now.d)).getUTCDay();
    const base = Date.UTC(now.y, now.m - 1, now.d + (dow - todayDow), Math.floor(startMin / 60), startMin % 60);
    let inst = base - offsetMs(srcTz, base);
    const off2 = offsetMs(srcTz, inst);
    inst = base - off2;
    const v = partsIn(inst, viewTz);
    return { day: new Date(Date.UTC(v.y, v.m - 1, v.d)).getUTCDay(), start: v.h * 60 + v.mi, end: v.h * 60 + v.mi + durMin };
};

const fmtMin = (m: number) => {
    const mm = ((m % 1440) + 1440) % 1440;
    const h = Math.floor(mm / 60);
    const mi = mm % 60;
    return `${h % 12 || 12}${mi ? `:${String(mi).padStart(2, '0')}` : ''} ${h < 12 ? 'AM' : 'PM'}`;
};
const hourLabel = (h: number) => `${h % 12 || 12} ${h < 12 || h === 24 ? 'AM' : 'PM'}`;
const dayLong = (d: number) => WEEK.find(w => w.v === d)?.long || '';

/** Give overlapping slots side-by-side lanes. */
const layoutDay = (list: Slot[]) => {
    const sorted = [...list].sort((a, b) => a.start - b.start || b.end - a.end);
    let cluster: Slot[] = [];
    let clusterEnd = -1;
    const flush = () => {
        const lanesEnd: number[] = [];
        cluster.forEach(s => {
            let lane = lanesEnd.findIndex(e => e <= s.start);
            if (lane === -1) { lane = lanesEnd.length; lanesEnd.push(s.end); } else lanesEnd[lane] = s.end;
            s.lane = lane;
        });
        cluster.forEach(s => { s.lanes = lanesEnd.length; });
        cluster = [];
    };
    sorted.forEach(s => {
        if (cluster.length && s.start >= clusterEnd) flush();
        cluster.push(s);
        clusterEnd = Math.max(clusterEnd, s.end);
    });
    if (cluster.length) flush();
    return sorted;
};

const AdminTimetable: React.FC = () => {
    const { apiCall, user } = useAuth();
    const navigate = useNavigate();
    const r = useResponsive();
    const viewTz = resolveTimezone(user?.timezone);

    const [entries, setEntries] = useState<Entry[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [view, setView] = useState<View>('week');
    const [teacherIds, setTeacherIds] = useState<number[]>([]);
    const [levels, setLevels] = useState<string[]>([]);
    const [mode, setMode] = useState<Mode>('all');
    const [showEnded, setShowEnded] = useState(false);
    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState<Slot | null>(null);
    const [students, setStudents] = useState<{ loading: boolean; list: Student[] | null }>({ loading: false, list: null });
    const [now, setNow] = useState(Date.now());

    const todayDow = useMemo(() => { const p = partsIn(now, viewTz); return new Date(Date.UTC(p.y, p.m - 1, p.d)).getUTCDay(); }, [now, viewTz]);
    const nowMin = useMemo(() => { const p = partsIn(now, viewTz); return p.h * 60 + p.mi; }, [now, viewTz]);
    const [dayPick, setDayPick] = useState<number>(todayDow);

    const load = useCallback(async () => {
        try {
            const [tRes, bRes] = await Promise.all([apiCall('/batches/timetable'), apiCall('/batches')]);
            if (!tRes.ok) throw new Error(`The server answered ${tRes.status}.`);
            const t = await tRes.json();
            setEntries(Array.isArray(t) ? t : []);
            if (bRes.ok) { const b = await bRes.json(); setBatches(Array.isArray(b) ? b : b.batches || []); }
            setError(null);
        } catch (e: any) {
            setError(e?.message || 'Could not load the timetable.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [apiCall]);

    useEffect(() => { load(); }, [load]);
    useEffect(() => { const t = window.setInterval(() => setNow(Date.now()), 60_000); return () => window.clearInterval(t); }, []);
    useEffect(() => { setStudents({ loading: false, list: null }); }, [selected?.batch_id]);

    /* ═══════════ DERIVED ═══════════ */
    const teachers = useMemo(() => {
        const map = new Map<number, string>();
        entries.forEach(e => map.set(e.teacher_id, `${e.teacher_first_name || ''} ${e.teacher_last_name || ''}`.trim() || 'Teacher'));
        return Array.from(map, ([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
    }, [entries]);
    const colorOf = useMemo(() => new Map(teachers.map((t, i) => [t.id, PALETTE[i % PALETTE.length]])), [teachers]);
    const batchById = useMemo(() => new Map(batches.map(b => [b.id, b])), [batches]);

    const slots = useMemo<Slot[]>(() => entries.map(e => {
        const src = validTz(e.timezone) || viewTz;
        let dur = toMin(e.end_time) - toMin(e.start_time);
        if (dur <= 0) dur += 1440;
        const c = convertSlot(Number(e.day_of_week), toMin(e.start_time), dur, src, viewTz);
        return {
            ...e,
            ...c,
            teacher: `${e.teacher_first_name || ''} ${e.teacher_last_name || ''}`.trim() || 'Teacher',
            color: colorOf.get(e.teacher_id) || PALETTE[0],
            ended: new Date(e.end_date).getTime() < now,
            upcoming: new Date(e.start_date).getTime() > now,
            converted: src !== viewTz,
            lane: 0,
            lanes: 1,
        };
    }), [entries, viewTz, colorOf, now]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return slots.filter(s =>
            (showEnded || !s.ended)
            && (!teacherIds.length || teacherIds.includes(s.teacher_id))
            && (!levels.length || levels.includes(s.french_level))
            && (mode === 'all' || (mode === 'physical' ? s.location_mode === 'physical' : s.location_mode !== 'physical'))
            && (!q || `${s.batch_name} ${s.teacher}`.toLowerCase().includes(q)));
    }, [slots, showEnded, teacherIds, levels, mode, query]);

    const byDay = useMemo(() => {
        const out: Record<number, Slot[]> = {};
        WEEK.forEach(w => { out[w.v] = layoutDay(filtered.filter(s => s.day === w.v).map(s => ({ ...s }))); });
        return out;
    }, [filtered]);

    const stats = useMemo(() => {
        const minutes = filtered.reduce((t, s) => t + (s.end - s.start), 0);
        const batchIds = new Set(filtered.map(s => s.batch_id));
        const online = new Set(filtered.filter(s => s.location_mode !== 'physical').map(s => s.batch_id)).size;
        const perDay = WEEK.map(w => ({ w, n: byDay[w.v].length, min: byDay[w.v].reduce((t, s) => t + (s.end - s.start), 0) }));
        const busiest = [...perDay].sort((a, b) => b.min - a.min)[0];
        return { classes: filtered.length, minutes, batches: batchIds.size, online, physical: batchIds.size - online, teachers: new Set(filtered.map(s => s.teacher_id)).size, perDay, busiest };
    }, [filtered, byDay]);

    const conflicts = useMemo(() => {
        const found: { key: string; teacher: string; day: number; a: Slot; b: Slot }[] = [];
        WEEK.forEach(w => {
            const list = byDay[w.v];
            for (let i = 0; i < list.length; i++) {
                for (let j = i + 1; j < list.length; j++) {
                    const a = list[i];
                    const b = list[j];
                    if (a.teacher_id === b.teacher_id && a.start < b.end && b.start < a.end) {
                        found.push({ key: `${a.id}-${b.id}`, teacher: a.teacher, day: w.v, a, b });
                    }
                }
            }
        });
        return found;
    }, [byDay]);
    const conflictIds = useMemo(() => new Set(conflicts.flatMap(c => [c.a.id, c.b.id])), [conflicts]);

    const unscheduled = useMemo(() => {
        const withSlots = new Set(entries.map(e => e.batch_id));
        return batches.filter(b => statusOf(b) !== 'ended' && !withSlots.has(b.id));
    }, [batches, entries]);

    const teacherRows = useMemo(() => teachers
        .filter(t => !teacherIds.length || teacherIds.includes(t.id))
        .map(t => {
            const list = filtered.filter(s => s.teacher_id === t.id);
            return {
                ...t,
                color: colorOf.get(t.id) || PALETTE[0],
                classes: list.length,
                minutes: list.reduce((m, s) => m + (s.end - s.start), 0),
                batches: new Set(list.map(s => s.batch_id)).size,
                perDay: WEEK.map(w => {
                    const d = list.filter(s => s.day === w.v);
                    return { v: w.v, short: w.short, n: d.length, min: d.reduce((m, s) => m + (s.end - s.start), 0) };
                }),
                conflicts: conflicts.filter(c => c.a.teacher_id === t.id).length,
            };
        })
        .sort((a, b) => b.minutes - a.minutes), [teachers, teacherIds, filtered, colorOf, conflicts]);
    const maxDayMin = Math.max(60, ...teacherRows.flatMap(t => t.perDay.map(d => d.min)));

    const [lo, hi] = useMemo(() => {
        if (!filtered.length) return [8, 18];
        const a = Math.min(...filtered.map(s => s.start));
        const b = Math.max(...filtered.map(s => Math.min(s.end, 1440)));
        const l = Math.max(0, Math.floor(a / 60) - 1);
        const h = Math.min(24, Math.ceil(b / 60) + 1);
        return [l, Math.max(h, Math.min(24, l + 6))];
    }, [filtered]);
    const HOUR = r.isMobile ? 52 : 64;

    const openStudents = async (batchId: number) => {
        setStudents({ loading: true, list: null });
        try {
            const res = await apiCall(`/batches/${batchId}`);
            const d = res.ok ? await res.json() : null;
            setStudents({ loading: false, list: Array.isArray(d?.students) ? d.students : [] });
        } catch {
            setStudents({ loading: false, list: [] });
        }
    };

    const hasFilters = !!(teacherIds.length || levels.length || mode !== 'all' || query || showEnded);
    const clearFilters = () => { setTeacherIds([]); setLevels([]); setMode('all'); setQuery(''); setShowEnded(false); };
    const toggleTeacher = (id: number) => setTeacherIds(ids => (ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]));
    const tzLabel = timezoneLabel(user?.timezone);

    /* ═══════════ PIECES ═══════════ */
    const SlotRow: React.FC<{ s: Slot }> = ({ s }) => (
        <button type="button" className={`tt-row${conflictIds.has(s.id) ? ' is-conflict' : ''}${s.ended ? ' is-ended' : ''}`}
            style={{ '--c': s.color } as React.CSSProperties} onClick={() => setSelected(s)}>
            <span className="tt-row-time"><strong>{fmtMin(s.start)}</strong><em>{hoursText(s.end - s.start)}</em></span>
            <span className="tt-row-bar" />
            <span className="tt-row-text">
                <strong>{s.batch_name}</strong>
                <em>{s.teacher} · {s.location_mode === 'physical' ? (s.location || 'In person') : 'Online'}</em>
            </span>
            <span className={`tt-lv ${levelTone(s.french_level)}`}>{s.french_level}</span>
            {conflictIds.has(s.id) && <Tooltip title="Overlaps another class of this teacher"><WarningOutlined className="tt-warn-ic" /></Tooltip>}
        </button>
    );

    /* ═══════════ LOADING ═══════════ */
    if (loading) {
        return (
            <div className="tt" aria-busy="true">
                <div className="tt-header"><div><Skeleton.Input active size="small" style={{ width: 130, height: 12 }} /><div style={{ marginTop: 10 }}><Skeleton.Input active style={{ width: 240, height: 24 }} /></div></div></div>
                <div className="tt-kpis">{[0, 1, 2, 3, 4].map(i => <div key={i} className="tt-kpi"><Skeleton active title={false} paragraph={{ rows: 2 }} /></div>)}</div>
                <div className="tt-panel tt-pad"><Skeleton active paragraph={{ rows: 10 }} /></div>
            </div>
        );
    }

    const narrowWeek = view === 'week' && r.width < 900;
    const hours = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
    const selBatch = selected ? batchById.get(selected.batch_id) : undefined;
    const selStatus = selected ? statusOf({ ...selected, id: selected.batch_id, student_count: 0, created_at: selected.start_date } as unknown as Batch) : 'running';
    const siblings = selected ? slots.filter(s => s.batch_id === selected.batch_id).sort((a, b) => ((a.day + 6) % 7) - ((b.day + 6) % 7) || a.start - b.start) : [];

    return (
        <ConfigProvider theme={{ token: { colorPrimary: '#4f46e5', fontSize: 13, borderRadius: 8 } }}>
            <div className="tt">
                {/* ── Header ── */}
                <header className="tt-header">
                    <div>
                        <div className="tt-overline">Admin console · Schedule</div>
                        <h1 className="tt-title">Teacher timetable</h1>
                        <p className="tt-subtitle">The recurring weekly schedule of every batch, shown in your timezone ({tzLabel} · {viewTz.replace(/_/g, ' ')}).</p>
                    </div>
                    <div className="tt-header-actions">
                        <Tooltip title="Refresh"><Button icon={<ReloadOutlined spin={refreshing} />} aria-label="Refresh" onClick={() => { setRefreshing(true); load(); }} /></Tooltip>
                        <Button icon={<CalendarOutlined />} onClick={() => navigate('/app/batches')}>Manage batches</Button>
                    </div>
                </header>

                {error && <div className="tt-alert" role="alert"><WarningOutlined /><span><strong>Couldn't load the timetable.</strong> {error}</span><Button size="small" onClick={() => { setLoading(true); load(); }}>Retry</Button></div>}

                {/* ── KPIs ── */}
                <section className="tt-kpis" aria-label="This week">
                    <div className="tt-kpi"><span className="tt-kpi-ic is-indigo"><CalendarOutlined /></span><span className="tt-kpi-label">Classes per week</span><strong>{stats.classes}</strong><em>{stats.batches} active {stats.batches === 1 ? 'batch' : 'batches'}</em></div>
                    <div className="tt-kpi"><span className="tt-kpi-ic is-green"><ClockCircleOutlined /></span><span className="tt-kpi-label">Teaching time</span><strong>{hoursText(stats.minutes)}</strong><em>per week</em></div>
                    <div className="tt-kpi"><span className="tt-kpi-ic is-blue"><LinkOutlined /></span><span className="tt-kpi-label">Online · in person</span><strong>{stats.online} <small>·</small> {stats.physical}</strong><em>batches</em></div>
                    <div className="tt-kpi"><span className="tt-kpi-ic is-violet"><TeamOutlined /></span><span className="tt-kpi-label">Teachers teaching</span><strong>{stats.teachers}</strong><em>of {teachers.length} with a schedule</em></div>
                    <div className="tt-kpi"><span className="tt-kpi-ic is-amber"><BarChartOutlined /></span><span className="tt-kpi-label">Busiest day</span><strong>{stats.busiest && stats.busiest.n ? stats.busiest.w.long : '—'}</strong><em>{stats.busiest && stats.busiest.n ? `${stats.busiest.n} classes · ${hoursText(stats.busiest.min)}` : 'No classes'}</em></div>
                </section>

                {/* ── Attention ── */}
                {(conflicts.length > 0 || unscheduled.length > 0) && (
                    <section className="tt-attention">
                        {conflicts.length > 0 && (
                            <div className="tt-att is-red">
                                <WarningOutlined />
                                <div>
                                    <strong>{conflicts.length} overlapping {conflicts.length === 1 ? 'class' : 'classes'}</strong>
                                    <span>{conflicts.slice(0, 2).map(c => `${c.teacher} · ${dayLong(c.day)} ${fmtMin(Math.max(c.a.start, c.b.start))}`).join(' — ')}{conflicts.length > 2 ? '…' : ''}</span>
                                </div>
                                <Button size="small" onClick={() => { setSelected(conflicts[0].a); }}>Review</Button>
                            </div>
                        )}
                        {unscheduled.length > 0 && (
                            <div className="tt-att is-amber">
                                <CalendarOutlined />
                                <div>
                                    <strong>{unscheduled.length} active {unscheduled.length === 1 ? 'batch has' : 'batches have'} no weekly classes</strong>
                                    <span>{unscheduled.slice(0, 3).map(b => b.name).join(', ')}{unscheduled.length > 3 ? '…' : ''}</span>
                                </div>
                                <Button size="small" onClick={() => navigate(`/app/batches?edit=${unscheduled[0].id}&step=1`)}>Add schedule</Button>
                            </div>
                        )}
                    </section>
                )}

                {/* ── Toolbar ── */}
                <section className="tt-panel">
                    <div className="tt-toolbar">
                        <Segmented value={view} onChange={v => setView(v as View)} options={[
                            { value: 'week', label: <span className="tt-seg"><CalendarOutlined /> Week</span> },
                            { value: 'agenda', label: <span className="tt-seg"><UnorderedListOutlined /> Agenda</span> },
                            { value: 'teachers', label: <span className="tt-seg"><AppstoreOutlined /> Teachers</span> },
                        ]} />
                        <div className="tt-filters">
                            <Input className="tt-search" prefix={<SearchOutlined />} allowClear placeholder="Search batch or teacher" value={query} onChange={e => setQuery(e.target.value)} />
                            <Select className="tt-f" mode="multiple" allowClear maxTagCount="responsive" placeholder="All teachers" value={teacherIds} onChange={setTeacherIds}
                                optionFilterProp="label" options={teachers.map(t => ({ value: t.id, label: t.name }))} />
                            <Select className="tt-f is-narrow" mode="multiple" allowClear maxTagCount="responsive" placeholder="All levels" value={levels} onChange={setLevels}
                                options={LEVELS.map(l => ({ value: l, label: l }))} />
                            <Segmented size="small" value={mode} onChange={v => setMode(v as Mode)} options={[
                                { value: 'all', label: 'All' }, { value: 'online', label: 'Online' }, { value: 'physical', label: 'In person' },
                            ]} />
                            <label className="tt-switch"><Switch size="small" checked={showEnded} onChange={setShowEnded} /> Ended batches</label>
                            {hasFilters && <Button type="link" size="small" onClick={clearFilters}>Clear</Button>}
                        </div>
                    </div>

                    {teachers.length > 0 && view !== 'teachers' && (
                        <div className="tt-legend">
                            {teachers.map(t => {
                                const on = !teacherIds.length || teacherIds.includes(t.id);
                                const mins = slots.filter(s => s.teacher_id === t.id && (showEnded || !s.ended)).reduce((m, s) => m + (s.end - s.start), 0);
                                return (
                                    <button key={t.id} type="button" className={`tt-chip${on ? '' : ' is-off'}${teacherIds.includes(t.id) ? ' is-on' : ''}`}
                                        style={{ '--c': colorOf.get(t.id) } as React.CSSProperties} onClick={() => toggleTeacher(t.id)} aria-pressed={teacherIds.includes(t.id)}>
                                        <i />{t.name}<em>{hoursText(mins)}</em>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {filtered.length === 0 && view !== 'teachers' ? (
                        <div className="tt-empty">
                            <span className="tt-empty-ic"><CalendarOutlined /></span>
                            <strong>{entries.length ? 'No classes match these filters' : 'No weekly classes yet'}</strong>
                            <span>{entries.length ? 'Try another teacher or level, or include ended batches.' : 'Add a weekly schedule to a batch and it appears here.'}</span>
                            {entries.length ? <Button onClick={clearFilters}>Clear filters</Button> : <Button type="primary" onClick={() => navigate('/app/batches')}>Go to batches</Button>}
                        </div>
                    ) : view === 'week' && !narrowWeek ? (
                        /* ── Week grid ── */
                        <div className="tt-grid-wrap">
                            <div className="tt-grid" style={{ '--hour': `${HOUR}px` } as React.CSSProperties}>
                                <div className="tt-head">
                                    <div className="tt-corner">{tzLabel}</div>
                                    {WEEK.map(w => {
                                        const d = stats.perDay.find(p => p.w.v === w.v)!;
                                        return (
                                            <div key={w.v} className={`tt-dayhead${w.v === todayDow ? ' is-today' : ''}`}>
                                                <strong>{w.short}</strong>
                                                <span>{d.n ? `${d.n} · ${hoursText(d.min)}` : 'Free'}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="tt-body" style={{ height: (hi - lo) * HOUR }}>
                                    <div className="tt-times">
                                        {hours.map(h => <span key={h} style={{ top: (h - lo) * HOUR }}>{h < 24 ? hourLabel(h) : ''}</span>)}
                                    </div>
                                    {WEEK.map(w => (
                                        <div key={w.v} className={`tt-col${w.v === todayDow ? ' is-today' : ''}`}>
                                            {byDay[w.v].map(s => {
                                                const top = ((s.start - lo * 60) / 60) * HOUR;
                                                const height = Math.max(22, ((Math.min(s.end, hi * 60) - s.start) / 60) * HOUR - 3);
                                                const size = height < 42 ? ' is-xs' : height < 70 ? ' is-sm' : '';
                                                return (
                                                    <button key={s.id} type="button"
                                                        className={`tt-ev${size}${s.lanes > 2 ? ' is-narrow' : ''}${conflictIds.has(s.id) ? ' is-conflict' : ''}${s.ended ? ' is-ended' : ''}`}
                                                        style={{ top, height, left: `calc(${(s.lane / s.lanes) * 100}% + 3px)`, width: `calc(${100 / s.lanes}% - 6px)`, '--c': s.color } as React.CSSProperties}
                                                        onClick={() => setSelected(s)}
                                                        title={`${s.batch_name} · ${fmtMin(s.start)} – ${fmtMin(s.end)} · ${s.teacher}`}>
                                                        <span className="tt-ev-time">{fmtMin(s.start)}<span className="tt-ev-end"> – {fmtMin(s.end)}</span></span>
                                                        <span className="tt-ev-name">{s.batch_name}</span>
                                                        <span className="tt-ev-meta">
                                                            <b className={`tt-lv ${levelTone(s.french_level)}`}>{s.french_level}</b>
                                                            <span className="tt-ev-teacher">{s.teacher}</span>
                                                            {s.location_mode === 'physical' ? <EnvironmentOutlined /> : <LinkOutlined />}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                            {w.v === todayDow && nowMin >= lo * 60 && nowMin <= hi * 60 && (
                                                <span className="tt-now" style={{ top: ((nowMin - lo * 60) / 60) * HOUR }} aria-label="Now" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : view === 'week' ? (
                        /* ── Week on narrow screens: day picker + list ── */
                        <div className="tt-mobile">
                            <div className="tt-daypicker" role="tablist" aria-label="Day">
                                {WEEK.map(w => (
                                    <button key={w.v} type="button" role="tab" aria-selected={dayPick === w.v}
                                        className={`${dayPick === w.v ? 'is-on' : ''}${w.v === todayDow ? ' is-today' : ''}`} onClick={() => setDayPick(w.v)}>
                                        <strong>{w.short}</strong><span>{byDay[w.v].length || '–'}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="tt-daylist">
                                {byDay[dayPick].length === 0 ? <div className="tt-muted-line">No classes on {dayLong(dayPick)}.</div> : byDay[dayPick].map(s => <SlotRow key={s.id} s={s} />)}
                            </div>
                        </div>
                    ) : view === 'agenda' ? (
                        /* ── Agenda ── */
                        <div className="tt-agenda">
                            {WEEK.map(w => (
                                <div key={w.v} className={`tt-agenda-day${w.v === todayDow ? ' is-today' : ''}`}>
                                    <div className="tt-agenda-head">
                                        <strong>{w.long}</strong>
                                        {w.v === todayDow && <span className="tt-today">Today</span>}
                                        <em>{byDay[w.v].length ? `${byDay[w.v].length} ${byDay[w.v].length === 1 ? 'class' : 'classes'} · ${hoursText(byDay[w.v].reduce((m, s) => m + (s.end - s.start), 0))}` : 'No classes'}</em>
                                    </div>
                                    {byDay[w.v].map(s => <SlotRow key={s.id} s={s} />)}
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* ── Teachers workload ── */
                        <div className="tt-teachers">
                            {teacherRows.length === 0 ? <div className="tt-muted-line">No teacher matches these filters.</div> : teacherRows.map(t => (
                                <div key={t.id} className="tt-tcard" style={{ '--c': t.color } as React.CSSProperties}>
                                    <div className="tt-tcard-head">
                                        <span className="tt-tav">{initials(t.name)}</span>
                                        <div className="tt-tcard-id">
                                            <strong>{t.name}</strong>
                                            <em>{t.classes} {t.classes === 1 ? 'class' : 'classes'} · {hoursText(t.minutes)} a week · {t.batches} {t.batches === 1 ? 'batch' : 'batches'}</em>
                                        </div>
                                        {t.conflicts > 0 && <Tooltip title="Overlapping classes"><span className="tt-badge is-red"><WarningOutlined /> {t.conflicts}</span></Tooltip>}
                                    </div>
                                    <div className="tt-strip">
                                        {t.perDay.map(d => (
                                            <Tooltip key={d.v} title={`${dayLong(d.v)}: ${d.n ? `${d.n} ${d.n === 1 ? 'class' : 'classes'} · ${hoursText(d.min)}` : 'free'}`}>
                                                <div className={`tt-strip-cell${d.n ? '' : ' is-free'}`} style={{ '--i': d.min / maxDayMin } as React.CSSProperties}>
                                                    <span>{d.short}</span>
                                                    <strong>{d.n ? hoursText(d.min).replace(' min', 'm') : '—'}</strong>
                                                </div>
                                            </Tooltip>
                                        ))}
                                    </div>
                                    <Button size="small" type="link" onClick={() => { setTeacherIds([t.id]); setView('week'); }}>Show in week view</Button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* ── Class details ── */}
                <Drawer open={!!selected} onClose={() => setSelected(null)} width={r.isMobile ? '100%' : 440} closable={false} title={null} className="tt-drawer">
                    {selected && (
                        <div className="tt-detail" style={{ '--c': selected.color } as React.CSSProperties}>
                            <div className="tt-dh">
                                <div className="tt-dh-top">
                                    <span className={`tt-mark ${levelTone(selected.french_level)}`}>{selected.french_level}</span>
                                    <button type="button" className="tt-dclose" onClick={() => setSelected(null)} aria-label="Close"><CloseOutlined /></button>
                                </div>
                                <h3>{selected.batch_name}</h3>
                                <p><span className="tt-dot" />{selected.teacher}</p>
                                <div className="tt-dh-when">
                                    <strong>{dayLong(selected.day)} · {fmtMin(selected.start)} – {fmtMin(selected.end)}</strong>
                                    <span>{hoursText(selected.end - selected.start)} · {tzLabel}</span>
                                </div>
                                <span className={`tt-pill is-${selStatus}`}>{STATUS_LABEL[selStatus]} batch</span>
                            </div>

                            {conflictIds.has(selected.id) && (
                                <div className="tt-att is-red is-inline"><WarningOutlined /><div><strong>Overlaps another class</strong><span>{selected.teacher} has another class at the same time this day.</span></div></div>
                            )}

                            <dl className="tt-facts">
                                {selected.converted && (
                                    <div><dt>Scheduled as</dt><dd>{dayLong(Number(selected.day_of_week))} {selected.start_time.slice(0, 5)}–{selected.end_time.slice(0, 5)} <small>{(selected.timezone || '').replace(/_/g, ' ')}</small></dd></div>
                                )}
                                <div>
                                    <dt>{selected.location_mode === 'physical' ? 'Location' : 'Meeting'}</dt>
                                    <dd>{selected.location_mode === 'physical'
                                        ? <><EnvironmentOutlined /> {selected.location || 'In person'}</>
                                        : selected.link ? <a href={selected.link} target="_blank" rel="noopener noreferrer"><LinkOutlined /> Open meeting link</a> : 'Online'}</dd>
                                </div>
                                <div><dt>Batch period</dt><dd>{formatPlain(selected.start_date, user?.timezone, { month: 'short', day: 'numeric', year: 'numeric' })} – {formatPlain(selected.end_date, user?.timezone, { month: 'short', day: 'numeric', year: 'numeric' })}</dd></div>
                                {selBatch && <div><dt>Students</dt><dd>{countOf(selBatch)}</dd></div>}
                            </dl>

                            <section className="tt-dsec">
                                <h4>This batch every week</h4>
                                <ul className="tt-sib">
                                    {siblings.map(s => (
                                        <li key={s.id} className={s.id === selected.id ? 'is-on' : ''}>
                                            <button type="button" onClick={() => setSelected(s)}>
                                                <strong>{dayLong(s.day)}</strong><span>{fmtMin(s.start)} – {fmtMin(s.end)}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            <section className="tt-dsec">
                                <h4>Students</h4>
                                {students.list === null ? (
                                    <Button block icon={<TeamOutlined />} loading={students.loading} onClick={() => openStudents(selected.batch_id)}>Show students</Button>
                                ) : students.list.length === 0 ? (
                                    <div className="tt-muted-line">No students enrolled.</div>
                                ) : (
                                    <ul className="tt-students">
                                        {students.list.map(st => (
                                            <li key={st.id}><span className="tt-sav">{initials(`${st.first_name} ${st.last_name}`)}</span><span><strong>{st.first_name} {st.last_name}</strong><em>{st.email}</em></span></li>
                                        ))}
                                    </ul>
                                )}
                            </section>

                            <div className="tt-dactions">
                                <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(`/app/batches?edit=${selected.batch_id}&step=1`)}>Edit schedule</Button>
                                <Button icon={<BarChartOutlined />} onClick={() => navigate(`/app/batches/${selected.batch_id}/insights`)}>Insights</Button>
                            </div>
                        </div>
                    )}
                </Drawer>
            </div>
        </ConfigProvider>
    );
};

export default AdminTimetable;
