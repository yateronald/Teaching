import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, ConfigProvider, Drawer, Input, Select, Skeleton, Tooltip, message } from 'antd';
import {
    ArrowRightOutlined, CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseOutlined, CopyOutlined, GlobalOutlined,
    InfoCircleOutlined, MailOutlined, ReloadOutlined, SearchOutlined, StopOutlined, TeamOutlined, UserOutlined, VideoCameraOutlined,
    WarningOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import useResponsive from '../../hooks/useResponsive';
import { resolveTimezone, timezoneLabel } from '../../utils/timezone';
import './Teacher.css';
import './AssignDemo.css';

/* ══════════════════════════════════════════
   DEMO LESSONS — trial lessons the admin team assigned to this teacher.
   Scheduling and status changes stay with the admins; this page is the teacher's
   agenda: what's next, who the student is, and one click into the meeting.
══════════════════════════════════════════ */

type Status = 'new' | 'contacted' | 'demo_scheduled' | 'completed' | 'cancelled';
type Bucket = 'all' | 'upcoming' | 'to_schedule' | 'completed' | 'cancelled';
type SortKey = 'soonest' | 'newest';

interface Demo {
    id: number;
    full_name: string;
    email: string;
    country: string;
    has_previous_experience: string;
    current_level: string;
    interested_level: string;
    learning_goals: string;
    expected_start_time: string;
    preferred_schedule: string;
    timezone: string;
    status: Status;
    notes: string;
    contacted_at: string | null;
    demo_scheduled_at: string | null;
    meeting_link: string | null;
    created_at: string;
    updated_at: string | null;
}
interface Stats { total_assigned: number; scheduled: number; contacted: number; completed: number; cancelled: number; this_week_demos: number }

const STATUS: Record<Status, { label: string; tone: string }> = {
    new: { label: 'New request', tone: 'is-new' },
    contacted: { label: 'Contacted', tone: 'is-contacted' },
    demo_scheduled: { label: 'Scheduled', tone: 'is-scheduled' },
    completed: { label: 'Completed', tone: 'is-completed' },
    cancelled: { label: 'Cancelled', tone: 'is-cancelled' },
};
const BUCKETS: { key: Bucket; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'to_schedule', label: 'To schedule' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
];
const LIVE_GRACE_MS = 90 * 60_000;   // a demo counts as "now / upcoming" until 90 min after its start

const validZone = (tz?: string | null) => {
    if (!tz) return null;
    try { new Intl.DateTimeFormat('en-US', { timeZone: tz }).format(); return tz; } catch { return null; }
};
const ts = (iso?: string | null) => { const t = iso ? Date.parse(iso) : NaN; return Number.isNaN(t) ? null : t; };
const initials = (name: string) => (name || '?').trim().split(/\s+/).map(p => p[0]).join('').slice(0, 2).toUpperCase() || '?';
const relative = (ms: number) => {
    const abs = Math.abs(ms);
    const m = Math.round(abs / 60_000);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    const text = d >= 2 ? `${d} days` : h >= 1 ? `${h} h ${m % 60 ? `${m % 60} min` : ''}`.trim() : `${Math.max(1, m)} min`;
    return ms >= 0 ? `in ${text}` : `${text} ago`;
};
const bucketOf = (d: Demo, now: number): Exclude<Bucket, 'all'> => {
    if (d.status === 'completed') return 'completed';
    if (d.status === 'cancelled') return 'cancelled';
    const at = ts(d.demo_scheduled_at);
    if (d.status === 'demo_scheduled' && at !== null && at + LIVE_GRACE_MS >= now) return 'upcoming';
    return 'to_schedule';
};

const AssignDemo: React.FC = () => {
    const { apiCall, user } = useAuth();
    const r = useResponsive();
    const [msg, msgHolder] = message.useMessage();
    const tz = resolveTimezone(user?.timezone);

    const [demos, setDemos] = useState<Demo[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [now, setNow] = useState(() => Date.now());

    const [bucket, setBucket] = useState<Bucket>('all');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState<SortKey>('soonest');
    const [openId, setOpenId] = useState<number | null>(null);

    // One request for everything assigned (a teacher's demo list is small), so tabs, search and counts are exact.
    const load = useCallback(async () => {
        try {
            const res = await apiCall('/demo-requests/my-demos?page=1&limit=500');
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.message || data?.error || `The server answered ${res.status}.`);
            setDemos(Array.isArray(data?.data) ? data.data : []);
            setStats(data?.statistics ?? null);
            setError(null);
        } catch (e: any) {
            setError(e?.message || 'Your demo lessons could not be loaded.');
        } finally {
            setLoading(false);
            setRefreshing(false);
            setNow(Date.now());
        }
    }, [apiCall]);

    useEffect(() => { load(); }, [load]);
    useEffect(() => {
        const id = window.setInterval(() => setNow(Date.now()), 30_000);
        return () => window.clearInterval(id);
    }, []);

    const fmt = useMemo(() => {
        const make = (zone: string, opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-US', { timeZone: zone, ...opts });
        const day = make(tz, { weekday: 'short', month: 'short', day: 'numeric' });
        const time = make(tz, { hour: 'numeric', minute: '2-digit' });
        const full = make(tz, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
        const short = make(tz, { month: 'short', day: 'numeric', year: 'numeric' });
        return {
            day: (iso: string) => day.format(new Date(iso)),
            time: (iso: string) => time.format(new Date(iso)),
            full: (iso: string) => full.format(new Date(iso)),
            short: (iso?: string | null) => (ts(iso) === null ? '—' : short.format(new Date(iso as string))),
            inZone: (iso: string, zone: string) => make(zone, { weekday: 'short', hour: 'numeric', minute: '2-digit' }).format(new Date(iso)),
        };
    }, [tz]);

    const counts = useMemo(() => {
        const c: Record<Bucket, number> = { all: demos.length, upcoming: 0, to_schedule: 0, completed: 0, cancelled: 0 };
        demos.forEach(d => { c[bucketOf(d, now)]++; });
        return c;
    }, [demos, now]);

    const next = useMemo(() => demos
        .filter(d => bucketOf(d, now) === 'upcoming')
        .sort((a, b) => (ts(a.demo_scheduled_at) ?? 0) - (ts(b.demo_scheduled_at) ?? 0))[0] ?? null, [demos, now]);

    const list = useMemo(() => {
        const q = search.trim().toLowerCase();
        const out = demos.filter(d => {
            if (bucket !== 'all' && bucketOf(d, now) !== bucket) return false;
            if (q && !`${d.full_name} ${d.email} ${d.country} ${d.current_level} ${d.interested_level}`.toLowerCase().includes(q)) return false;
            return true;
        });
        const rank: Record<Exclude<Bucket, 'all'>, number> = { upcoming: 0, to_schedule: 1, completed: 2, cancelled: 3 };
        return out.sort((a, b) => {
            if (sort === 'newest') return (ts(b.created_at) ?? 0) - (ts(a.created_at) ?? 0);
            const ra = rank[bucketOf(a, now)];
            const rb = rank[bucketOf(b, now)];
            if (ra !== rb) return ra - rb;
            if (ra === 0) return (ts(a.demo_scheduled_at) ?? 0) - (ts(b.demo_scheduled_at) ?? 0);
            if (ra === 1) return (ts(b.created_at) ?? 0) - (ts(a.created_at) ?? 0);
            return (ts(b.demo_scheduled_at ?? b.updated_at) ?? 0) - (ts(a.demo_scheduled_at ?? a.updated_at) ?? 0);
        });
    }, [demos, bucket, search, sort, now]);

    const open = demos.find(d => d.id === openId) ?? null;

    const copy = async (text: string, what: string) => {
        try { await navigator.clipboard.writeText(text); msg.success(`${what} copied`); }
        catch { msg.error('Your browser blocked the clipboard.'); }
    };
    const joinable = (d: Demo) => {
        const at = ts(d.demo_scheduled_at);
        return !!d.meeting_link && d.status === 'demo_scheduled' && at !== null && at - now <= 15 * 60_000 && at + LIVE_GRACE_MS >= now;
    };
    const studentZone = (d: Demo) => validZone(d.timezone);

    /* ── Pieces ── */
    const levels = (d: Demo) => (
        <span className="dm-levels" aria-label={`From ${d.current_level || 'unknown'} to ${d.interested_level || 'unknown'}`}>
            <b>{d.current_level || '—'}</b><ArrowRightOutlined /><b className="is-target">{d.interested_level || '—'}</b>
        </span>
    );
    const whenBlock = (d: Demo) => {
        const at = ts(d.demo_scheduled_at);
        if (at === null) return <span className="dm-when is-none"><strong>Not scheduled yet</strong><em>Requested {fmt.short(d.created_at)}</em></span>;
        const live = at <= now && at + LIVE_GRACE_MS >= now && d.status === 'demo_scheduled';
        return (
            <span className="dm-when">
                <strong>{fmt.day(d.demo_scheduled_at as string)} · {fmt.time(d.demo_scheduled_at as string)}</strong>
                <em className={live ? 'is-live' : at > now && at - now < 86_400_000 ? 'is-soon' : undefined}>{live ? 'Happening now' : relative(at - now)}</em>
            </span>
        );
    };

    /* ═══════════ LOADING ═══════════ */
    if (loading) {
        return (
            <div className="tc dm" aria-busy="true">
                <div className="tc-header"><div><Skeleton.Input active size="small" style={{ width: 110, height: 12 }} /><div style={{ marginTop: 10 }}><Skeleton.Input active style={{ width: 200, height: 26 }} /></div></div></div>
                <div className="tc-kpis">{[0, 1, 2, 3, 4].map(i => <div key={i} className="tc-kpi"><Skeleton active title={false} paragraph={{ rows: 2 }} /></div>)}</div>
                <div className="tc-card tc-pad"><Skeleton active avatar paragraph={{ rows: 6 }} /></div>
            </div>
        );
    }

    const nextAt = next ? ts(next.demo_scheduled_at) : null;
    const nextZone = next ? studentZone(next) : null;

    return (
        <ConfigProvider theme={{ token: { colorPrimary: '#4f46e5', fontSize: 13, borderRadius: 8 } }}>
            {msgHolder}
            <div className="tc dm">
                <header className="tc-header">
                    <div>
                        <div className="tc-overline">Teacher space</div>
                        <h1 className="tc-title">Demo lessons</h1>
                        <p className="tc-subtitle">Trial lessons the admin team assigned to you. Times are shown in {timezoneLabel(user?.timezone)}.</p>
                    </div>
                    <div className="tc-actions">
                        <Button icon={<ReloadOutlined spin={refreshing} />} onClick={() => { setRefreshing(true); load(); }}>Refresh</Button>
                    </div>
                </header>

                {error && (
                    <div className="tc-alert" role="alert">
                        <WarningOutlined /><span><strong>Couldn't load your demo lessons.</strong> {error}</span>
                        <Button size="small" onClick={() => { setRefreshing(true); load(); }}>Retry</Button>
                    </div>
                )}

                {/* ── KPIs ── */}
                <section className="tc-kpis" aria-label="Summary">
                    <button type="button" className={`tc-kpi${bucket === 'all' ? ' is-on' : ''}`} onClick={() => setBucket('all')}>
                        <span className="tc-kpi-ic"><TeamOutlined /></span>
                        <span className="tc-kpi-label">Assigned to you</span>
                        <span className="tc-kpi-value">{stats?.total_assigned ?? demos.length}</span>
                        <span className="tc-kpi-sub">All demo requests</span>
                    </button>
                    <button type="button" className={`tc-kpi is-green${bucket === 'upcoming' ? ' is-on' : ''}`} onClick={() => setBucket('upcoming')}>
                        <span className="tc-kpi-ic"><CalendarOutlined /></span>
                        <span className="tc-kpi-label">Upcoming</span>
                        <span className="tc-kpi-value">{counts.upcoming}</span>
                        <span className="tc-kpi-sub">{stats?.this_week_demos ? `${stats.this_week_demos} in the next 7 days` : 'Scheduled with a time'}</span>
                    </button>
                    <button type="button" className={`tc-kpi is-amber${bucket === 'to_schedule' ? ' is-on' : ''}`} onClick={() => setBucket('to_schedule')}>
                        <span className="tc-kpi-ic"><ClockCircleOutlined /></span>
                        <span className="tc-kpi-label">To schedule</span>
                        <span className="tc-kpi-value">{counts.to_schedule}</span>
                        <span className="tc-kpi-sub">Waiting for a time from the admins</span>
                    </button>
                    <button type="button" className={`tc-kpi is-slate${bucket === 'completed' ? ' is-on' : ''}`} onClick={() => setBucket('completed')}>
                        <span className="tc-kpi-ic"><CheckCircleOutlined /></span>
                        <span className="tc-kpi-label">Completed</span>
                        <span className="tc-kpi-value">{counts.completed}</span>
                        <span className="tc-kpi-sub">Demo lessons given</span>
                    </button>
                    <button type="button" className={`tc-kpi is-red${bucket === 'cancelled' ? ' is-on' : ''}`} onClick={() => setBucket('cancelled')}>
                        <span className="tc-kpi-ic"><StopOutlined /></span>
                        <span className="tc-kpi-label">Cancelled</span>
                        <span className="tc-kpi-value">{counts.cancelled}</span>
                        <span className="tc-kpi-sub">No longer happening</span>
                    </button>
                </section>

                {/* ── Up next ── */}
                {next && nextAt !== null && (
                    <section className={`dm-next${joinable(next) ? ' is-live' : ''}`} aria-label="Next demo lesson">
                        <div className="dm-next-when">
                            <span className="dm-eyebrow">{nextAt <= now ? 'Happening now' : 'Up next'}</span>
                            <strong>{nextAt <= now ? 'Started ' + relative(nextAt - now) : relative(nextAt - now).replace(/^in /, 'Starts in ')}</strong>
                            <em>{fmt.full(next.demo_scheduled_at as string)}</em>
                        </div>
                        <div className="dm-next-who">
                            <span className="dm-av is-lg">{initials(next.full_name)}</span>
                            <div className="dm-next-id">
                                <strong>{next.full_name}</strong>
                                <em>{[next.country, nextZone ? `${fmt.inZone(next.demo_scheduled_at as string, nextZone)} for them` : null].filter(Boolean).join(' · ')}</em>
                                {levels(next)}
                            </div>
                        </div>
                        <div className="dm-next-actions">
                            {next.meeting_link ? (
                                <Tooltip title={joinable(next) ? '' : 'The meeting opens 15 minutes before the start'}>
                                    <Button type="primary" icon={<VideoCameraOutlined />} href={next.meeting_link} target="_blank" rel="noopener noreferrer" disabled={!joinable(next)}>Join meeting</Button>
                                </Tooltip>
                            ) : <span className="dm-hint"><InfoCircleOutlined /> No meeting link yet</span>}
                            {next.meeting_link && <Tooltip title="Copy meeting link"><Button icon={<CopyOutlined />} onClick={() => copy(next.meeting_link as string, 'Meeting link')} aria-label="Copy meeting link" /></Tooltip>}
                            <Button onClick={() => setOpenId(next.id)}>Details</Button>
                        </div>
                    </section>
                )}

                {/* ── List ── */}
                <section className="tc-card dm-list" aria-label="Demo lessons">
                    <div className="dm-toolbar">
                        <div className="dm-tabs" role="tablist" aria-label="Status">
                            {BUCKETS.map(b => (
                                <button key={b.key} type="button" role="tab" aria-selected={bucket === b.key} className={`dm-tab${bucket === b.key ? ' is-on' : ''}`} onClick={() => setBucket(b.key)}>
                                    {b.label}<span>{counts[b.key]}</span>
                                </button>
                            ))}
                        </div>
                        <div className="dm-filters">
                            <Input className="dm-search" allowClear prefix={<SearchOutlined style={{ color: '#94a3b8' }} />} placeholder="Search students" value={search} onChange={e => setSearch(e.target.value)} aria-label="Search students" />
                            <Select<SortKey> className="dm-sort" value={sort} onChange={setSort} aria-label="Sort" options={[{ value: 'soonest', label: 'Soonest demo first' }, { value: 'newest', label: 'Newest request first' }]} />
                        </div>
                    </div>

                    {demos.length === 0 ? (
                        <div className="dm-empty">
                            <span className="dm-empty-art"><VideoCameraOutlined /></span>
                            <strong>No demo lessons assigned yet</strong>
                            <span>When the admin team assigns you a trial lesson, it appears here with the student's details and the meeting link.</span>
                        </div>
                    ) : list.length === 0 ? (
                        <div className="dm-empty is-compact">
                            <strong>Nothing matches</strong>
                            <span>Try another status or search term.</span>
                            <Button size="small" onClick={() => { setBucket('all'); setSearch(''); }}>Clear filters</Button>
                        </div>
                    ) : (
                        <ul className="dm-rows">
                            {list.map(d => {
                                const st = STATUS[d.status] ?? STATUS.new;
                                const overdue = d.status === 'demo_scheduled' && (ts(d.demo_scheduled_at) ?? Infinity) + LIVE_GRACE_MS < now;
                                return (
                                    <li key={d.id}>
                                        <div className="dm-row" role="button" tabIndex={0} onClick={() => setOpenId(d.id)} onKeyDown={e => { if (e.key === 'Enter') setOpenId(d.id); }}>
                                            <span className="dm-who">
                                                <span className="dm-av">{initials(d.full_name)}</span>
                                                <span className="dm-who-text"><strong>{d.full_name}</strong><em>{d.email}</em></span>
                                            </span>
                                            <span className="dm-where"><GlobalOutlined /> {d.country || '—'}</span>
                                            {levels(d)}
                                            {whenBlock(d)}
                                            <span className="dm-status-cell">
                                                <span className={`dm-status ${overdue ? 'is-overdue' : st.tone}`}><i aria-hidden />{overdue ? 'Awaiting update' : st.label}</span>
                                            </span>
                                            <span className="dm-row-actions" onClick={e => e.stopPropagation()}>
                                                {joinable(d) && <Button size="small" type="primary" icon={<VideoCameraOutlined />} href={d.meeting_link as string} target="_blank" rel="noopener noreferrer">Join</Button>}
                                                <Button size="small" onClick={() => setOpenId(d.id)}>Details</Button>
                                            </span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>
            </div>

            {/* ── Details ── */}
            <Drawer open={!!open} onClose={() => setOpenId(null)} placement="right" width={r.isMobile ? '100%' : 520} destroyOnHidden rootClassName="tc-drawer dm-drawer"
                closeIcon={<CloseOutlined />}
                title={open && <span className="tc-dtitle"><strong>{open.full_name}</strong><em>Demo lesson · {STATUS[open.status]?.label}</em></span>}>
                {open && (() => {
                    const zone = studentZone(open);
                    const at = ts(open.demo_scheduled_at);
                    const timeline = [
                        { label: 'Request received', at: open.created_at, done: true },
                        { label: 'Student contacted', at: open.contacted_at, done: !!open.contacted_at },
                        { label: 'Demo scheduled', at: open.demo_scheduled_at, done: open.status === 'demo_scheduled' || open.status === 'completed' },
                        open.status === 'cancelled'
                            ? { label: 'Cancelled', at: open.updated_at, done: true, bad: true }
                            : { label: 'Completed', at: open.status === 'completed' ? open.updated_at : null, done: open.status === 'completed' },
                    ];
                    return (
                        <>
                            <section className="tc-card dm-d-demo">
                                <div className="dm-d-head">
                                    <span className={`dm-status ${STATUS[open.status]?.tone}`}><i aria-hidden />{STATUS[open.status]?.label}</span>
                                    {levels(open)}
                                </div>
                                {at !== null ? (
                                    <>
                                        <strong className="dm-d-time">{fmt.full(open.demo_scheduled_at as string)}</strong>
                                        <p className="dm-d-sub">{relative(at - now)} · your time ({timezoneLabel(user?.timezone)}){zone ? ` · ${fmt.inZone(open.demo_scheduled_at as string, zone)} for the student (${zone.replace(/_/g, ' ')})` : ''}</p>
                                    </>
                                ) : <p className="dm-d-sub">No time has been set yet. The admin team schedules it with the student.</p>}
                                {open.meeting_link && (
                                    <div className="dm-link">
                                        <VideoCameraOutlined />
                                        <span title={open.meeting_link}>{open.meeting_link}</span>
                                        <Tooltip title="Copy link"><Button size="small" type="text" icon={<CopyOutlined />} onClick={() => copy(open.meeting_link as string, 'Meeting link')} aria-label="Copy meeting link" /></Tooltip>
                                        <Button size="small" type={joinable(open) ? 'primary' : 'default'} href={open.meeting_link} target="_blank" rel="noopener noreferrer">Open</Button>
                                    </div>
                                )}
                            </section>

                            <section className="tc-card dm-d-section">
                                <h4><UserOutlined /> Student</h4>
                                <dl className="dm-dl">
                                    <div><dt>Email</dt><dd><a href={`mailto:${open.email}`}>{open.email}</a><Tooltip title="Copy email"><Button size="small" type="text" icon={<CopyOutlined />} onClick={() => copy(open.email, 'Email')} aria-label="Copy email" /></Tooltip></dd></div>
                                    <div><dt>Country</dt><dd>{open.country || '—'}</dd></div>
                                    <div><dt>Time zone</dt><dd>{open.timezone ? `${open.timezone}${zone ? ` · ${timezoneLabel(zone)}` : ''}` : '—'}</dd></div>
                                    <div><dt>Learned French before</dt><dd>{open.has_previous_experience === 'yes' ? 'Yes' : open.has_previous_experience === 'no' ? 'No' : open.has_previous_experience || '—'}</dd></div>
                                    <div><dt>Current level</dt><dd>{open.current_level || '—'}</dd></div>
                                    <div><dt>Wants to reach</dt><dd>{open.interested_level || '—'}</dd></div>
                                </dl>
                            </section>

                            <section className="tc-card dm-d-section">
                                <h4><InfoCircleOutlined /> Goals & availability</h4>
                                <dl className="dm-dl is-stacked">
                                    <div><dt>Learning goals</dt><dd>{open.learning_goals || '—'}</dd></div>
                                    <div><dt>Preferred schedule</dt><dd>{open.preferred_schedule || '—'}</dd></div>
                                    <div><dt>Wants to start</dt><dd>{open.expected_start_time || '—'}</dd></div>
                                </dl>
                                {open.notes && <div className="dm-notes"><strong>Notes from the admin team</strong><p>{open.notes}</p></div>}
                            </section>

                            <section className="tc-card dm-d-section">
                                <h4><ClockCircleOutlined /> Timeline</h4>
                                <ol className="dm-timeline">
                                    {timeline.map(step => (
                                        <li key={step.label} className={`${step.done ? 'is-done' : ''}${'bad' in step && step.bad ? ' is-bad' : ''}`}>
                                            <i aria-hidden />
                                            <span><strong>{step.label}</strong><em>{step.at && step.done ? fmt.short(step.at) : 'Not yet'}</em></span>
                                        </li>
                                    ))}
                                </ol>
                            </section>

                            <p className="dm-d-note"><InfoCircleOutlined /> Scheduling and status changes are handled by the admin team. If a demo needs to move, contact them.</p>
                            <div className="dm-d-actions">
                                <Button icon={<MailOutlined />} href={`mailto:${open.email}`}>Email student</Button>
                                {open.meeting_link && <Button type="primary" icon={<VideoCameraOutlined />} href={open.meeting_link} target="_blank" rel="noopener noreferrer" disabled={!joinable(open)}>Join meeting</Button>}
                            </div>
                        </>
                    );
                })()}
            </Drawer>
        </ConfigProvider>
    );
};

export default AssignDemo;
