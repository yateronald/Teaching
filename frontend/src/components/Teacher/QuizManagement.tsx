import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, ConfigProvider, Dropdown, Input, Modal, Pagination, Select, Skeleton, Tooltip, message } from 'antd';
import type { MenuProps } from 'antd';
import {
    BarChartOutlined, CheckCircleOutlined, ClockCircleOutlined, CopyOutlined, DeleteOutlined, EditOutlined, EyeOutlined,
    FileTextOutlined, FormOutlined, MoreOutlined, PlusOutlined, ReloadOutlined, SearchOutlined, SendOutlined, StopOutlined,
    TeamOutlined, ThunderboltOutlined, TrophyOutlined, WarningOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import useResponsive from '../../hooks/useResponsive';
import { resolveTimezone, timezoneLabel } from '../../utils/timezone';
import ErrorBoundary from '../ErrorBoundary';
import { headerHeight } from '../Layout/layoutMetrics';
import QuizBuilder from '../Quiz/QuizBuilder';
import type { BuilderResult } from '../Quiz/QuizBuilder';
import QuizDetails from '../Quiz/QuizDetails';
import QuizResults from '../Quiz/QuizResults';
import type { ResultsTab } from '../Quiz/QuizResults';
import {
    PASS_MARK, STATE_META, fmtPct, fmtSpan, liveStateOf, makeWhen, normalizeQuizRow, plural, toneOfScore,
} from '../Quiz/quizModel';
import type { LiveState, QuizRow } from '../Quiz/quizModel';
import './Teacher.css';
import '../Quiz/Quiz.css';

/* ══════════════════════════════════════════
   QUIZZES — every quiz this teacher owns, what state it is in right now,
   and the way into building, previewing and grading it.
══════════════════════════════════════════ */

type Tab = 'all' | LiveState;
type SortKey = 'recent' | 'closing' | 'title' | 'score' | 'completion';
interface BuilderState { quizId: number | null; duplicateOf: number | null; withAI: boolean; context: QuizRow | null }

const PAGE_SIZE = 15;
const DAY = 86_400;

const TAB_ORDER: Tab[] = ['all', 'live', 'scheduled', 'draft', 'ended'];
const TAB_LABEL: Record<Tab, string> = { all: 'All', live: 'Live', scheduled: 'Scheduled', draft: 'Drafts', ended: 'Ended' };

const QuizManagement: React.FC = () => {
    const { apiCall, user } = useAuth();
    const r = useResponsive();
    const [msg, msgHolder] = message.useMessage();
    const [modal, modalHolder] = Modal.useModal();
    const tz = resolveTimezone(user?.timezone);
    const when = useMemo(() => makeWhen(tz), [tz]);

    const [rows, setRows] = useState<QuizRow[]>([]);
    const [fetchedAt, setFetchedAt] = useState(() => Date.now());
    const [now, setNow] = useState(() => Date.now());
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [tab, setTab] = useState<Tab>('all');
    const [search, setSearch] = useState('');
    const [batch, setBatch] = useState<string | null>(null);
    const [sort, setSort] = useState<SortKey>('recent');
    const [page, setPage] = useState(1);

    const [builder, setBuilder] = useState<BuilderState | null>(null);
    const [preview, setPreview] = useState<QuizRow | null>(null);
    const [results, setResults] = useState<{ row: QuizRow; tab: ResultsTab } | null>(null);
    const [busyId, setBusyId] = useState<number | null>(null);

    const load = useCallback(async () => {
        try {
            const res = await apiCall('/quizzes');
            if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || `The server answered ${res.status}.`);
            const data = await res.json();
            setRows((Array.isArray(data) ? data : data?.quizzes || []).map(normalizeQuizRow));
            const t = Date.now();
            setFetchedAt(t);
            setNow(t);
            setError(null);
        } catch (e: any) {
            setError(e?.message || 'Could not load your quizzes.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [apiCall]);

    useEffect(() => { load(); }, [load]);
    // Countdowns tick without refetching; the list itself refreshes when a quiz changes state.
    useEffect(() => {
        const id = window.setInterval(() => setNow(Date.now()), 30_000);
        return () => window.clearInterval(id);
    }, []);

    // The column header pins under the app bar while the list scrolls. A zero-height marker sits just
    // above it: once the marker passes under the bar, the header is pinned and gets its shadow.
    const stickyTop = headerHeight(r.isMobile);
    const [stuck, setStuck] = useState(false);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const stickyMarker = useCallback((node: HTMLDivElement | null) => {
        observerRef.current?.disconnect();
        observerRef.current = null;
        if (!node) { setStuck(false); return; }
        const observer = new IntersectionObserver(
            ([entry]) => setStuck(!entry.isIntersecting && entry.boundingClientRect.top < stickyTop),
            { rootMargin: `-${stickyTop}px 0px 0px 0px`, threshold: 0 },
        );
        observer.observe(node);
        observerRef.current = observer;
    }, [stickyTop]);
    useEffect(() => () => observerRef.current?.disconnect(), []);

    const refresh = () => { setRefreshing(true); load(); };
    const elapsed = Math.max(0, (now - fetchedAt) / 1000);

    const items = useMemo(() => rows.map(row => ({ row, ...liveStateOf(row, elapsed) })), [rows, elapsed]);

    /* ── Figures ── */
    const counts = useMemo(() => {
        const c: Record<Tab, number> = { all: items.length, live: 0, scheduled: 0, draft: 0, ended: 0 };
        items.forEach(i => { c[i.state]++; });
        return c;
    }, [items]);

    const kpi = useMemo(() => {
        const published = items.filter(i => i.state !== 'draft');
        const assigned = published.reduce((s, i) => s + i.row.total_students, 0);
        const submitted = published.reduce((s, i) => s + i.row.submitted_students, 0);
        const graded = items.filter(i => i.row.avg_score !== null && i.row.submitted_students > 0);
        const weight = graded.reduce((s, i) => s + i.row.submitted_students, 0);
        const closingSoon = items.filter(i => i.state === 'live' && i.endsIn !== null && i.endsIn <= DAY).length;
        const nextStart = items.filter(i => i.state === 'scheduled' && i.startsIn !== null).sort((a, b) => (a.startsIn ?? 0) - (b.startsIn ?? 0))[0];
        return {
            published: published.length,
            completion: assigned ? (submitted / assigned) * 100 : null,
            assigned,
            submitted,
            average: weight ? graded.reduce((s, i) => s + (i.row.avg_score as number) * i.row.submitted_students, 0) / weight : null,
            gradedCount: graded.length,
            closingSoon,
            nextStart,
        };
    }, [items]);

    const batchOptions = useMemo(() => {
        const names = new Set<string>();
        rows.forEach(q => q.batches.forEach(b => names.add(b)));
        return [...names].sort((a, b) => a.localeCompare(b)).map(n => ({ value: n, label: n }));
    }, [rows]);

    const list = useMemo(() => {
        const q = search.trim().toLowerCase();
        const out = items.filter(i => {
            if (tab !== 'all' && i.state !== tab) return false;
            if (batch && !i.row.batches.includes(batch)) return false;
            if (q && !`${i.row.title} ${i.row.description || ''} ${i.row.batches.join(' ')}`.toLowerCase().includes(q)) return false;
            return true;
        });
        const rank: Record<LiveState, number> = { live: 0, scheduled: 1, draft: 2, ended: 3 };
        const completion = (x: QuizRow) => (x.total_students ? x.submitted_students / x.total_students : Infinity);
        return out.sort((a, b) => {
            if (sort === 'title') return a.row.title.localeCompare(b.row.title);
            if (sort === 'score') return (a.row.avg_score ?? Infinity) - (b.row.avg_score ?? Infinity);
            if (sort === 'completion') {
                const pa = a.state === 'draft' ? Infinity : completion(a.row);
                const pb = b.state === 'draft' ? Infinity : completion(b.row);
                return pa - pb;
            }
            if (sort === 'closing') {
                if (rank[a.state] !== rank[b.state]) return rank[a.state] - rank[b.state];
                if (a.state === 'live') return (a.endsIn ?? Infinity) - (b.endsIn ?? Infinity);
                if (a.state === 'scheduled') return (a.startsIn ?? Infinity) - (b.startsIn ?? Infinity);
            }
            return (Date.parse(b.row.created_at) || 0) - (Date.parse(a.row.created_at) || 0);
        });
    }, [items, tab, batch, search, sort]);

    useEffect(() => { setPage(1); }, [tab, batch, search, sort]);
    const pageItems = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const hasFilters = tab !== 'all' || !!batch || !!search.trim();
    const clearFilters = () => { setTab('all'); setBatch(null); setSearch(''); };

    /* ── Actions ── */
    const openBuilder = (next: Partial<BuilderState> = {}) =>
        setBuilder({ quizId: null, duplicateOf: null, withAI: false, context: null, ...next });

    const onSaved = (result: BuilderResult) => {
        setBuilder(null);
        const parts = [result.created ? (result.published ? 'Quiz published' : 'Draft saved') : result.published ? 'Changes saved' : 'Saved as draft'];
        if (result.notified) parts.push(`${plural(result.notified, 'student')} notified`);
        if (result.regraded) parts.push(`${plural(result.regraded, 'score')} recalculated`);
        msg.success(parts.join(' · '));
        load();
    };

    const setStatus = async (row: QuizRow, status: 'draft' | 'published') => {
        setBusyId(row.id);
        try {
            const res = await apiCall(`/quizzes/${row.id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.error || 'The status could not be changed.');
            msg.success(status === 'published'
                ? `Published${data?.notified ? ` · ${plural(data.notified, 'student')} notified` : ''}`
                : 'Moved to drafts — students no longer see it');
            await load();
        } catch (e: any) {
            msg.error(e?.message || 'The status could not be changed.');
        } finally {
            setBusyId(null);
        }
    };

    const confirmPublish = (row: QuizRow) => {
        if (row.end_date && Date.parse(row.end_date) <= Date.now()) {
            modal.warning({
                title: 'This quiz has already closed',
                content: 'Its closing time is in the past, so students could not take it. Edit the schedule, then publish.',
                okText: 'Edit schedule',
                onOk: () => openBuilder({ quizId: row.id, context: row }),
            });
            return;
        }
        modal.confirm({
            title: `Publish “${row.title}”?`,
            icon: <SendOutlined />,
            content: row.total_students
                ? `${plural(row.total_students, 'student')} in ${row.batches.join(', ')} will see it and be notified by email and in the app.`
                : 'No students are enrolled in its batches yet, so nobody will be notified.',
            okText: 'Publish',
            onOk: () => setStatus(row, 'published'),
        });
    };

    const confirmUnpublish = (row: QuizRow, state: LiveState) => {
        modal.confirm({
            title: `Move “${row.title}” back to drafts?`,
            icon: <StopOutlined />,
            content: state === 'live' && row.in_progress_students
                ? `${plural(row.in_progress_students, 'student is', 'students are')} taking it right now and will lose access. Submitted work is kept.`
                : 'Students will no longer see it. Submitted work and scores are kept.',
            okText: 'Move to drafts',
            okButtonProps: { danger: state === 'live' },
            onOk: () => setStatus(row, 'draft'),
        });
    };

    const confirmDelete = (row: QuizRow) => {
        modal.confirm({
            title: `Delete “${row.title}”?`,
            icon: <DeleteOutlined />,
            content: row.submitted_students
                ? `This permanently deletes the quiz and ${plural(row.submitted_students, 'student submission')} with their scores. This can't be undone.`
                : 'The quiz and its questions are deleted permanently. This can’t be undone.',
            okText: 'Delete quiz',
            okButtonProps: { danger: true },
            onOk: async () => {
                const res = await apiCall(`/quizzes/${row.id}`, { method: 'DELETE' });
                if (!res.ok) {
                    msg.error((await res.json().catch(() => ({})))?.error || 'The quiz could not be deleted.');
                    throw new Error('delete failed');
                }
                setRows(xs => xs.filter(x => x.id !== row.id));
                msg.success('Quiz deleted');
            },
        });
    };

    const menuFor = (row: QuizRow, state: LiveState): MenuProps => ({
        items: [
            { key: 'preview', icon: <EyeOutlined />, label: 'Preview & answer key' },
            ...(state !== 'draft' ? [
                { key: 'results', icon: <TeamOutlined />, label: 'Student results' },
                { key: 'analysis', icon: <BarChartOutlined />, label: 'Question analysis' },
            ] : []),
            { type: 'divider' as const },
            { key: 'edit', icon: <EditOutlined />, label: state === 'ended' ? 'Edit (closed quizzes are locked)' : 'Edit', disabled: state === 'ended' },
            { key: 'duplicate', icon: <CopyOutlined />, label: 'Duplicate' },
            state === 'draft'
                ? { key: 'publish', icon: <SendOutlined />, label: 'Publish…' }
                : { key: 'unpublish', icon: <StopOutlined />, label: 'Move to drafts…' },
            { type: 'divider' as const },
            { key: 'delete', icon: <DeleteOutlined />, label: 'Delete…', danger: true },
        ],
        onClick: ({ key, domEvent }) => {
            domEvent.stopPropagation();
            if (key === 'preview') setPreview(row);
            else if (key === 'results') setResults({ row, tab: 'students' });
            else if (key === 'analysis') setResults({ row, tab: 'questions' });
            else if (key === 'edit') openBuilder({ quizId: row.id, context: row });
            else if (key === 'duplicate') openBuilder({ duplicateOf: row.id });
            else if (key === 'publish') confirmPublish(row);
            else if (key === 'unpublish') confirmUnpublish(row, state);
            else if (key === 'delete') confirmDelete(row);
        },
    });

    /* ── Pieces ── */
    const whenCell = (row: QuizRow, state: LiveState, startsIn: number | null, endsIn: number | null) => {
        const range = row.start_date || row.end_date
            ? `${row.start_date ? when.at(row.start_date) : 'Now'} – ${row.end_date ? when.at(row.end_date) : 'no end'}`
            : 'No time window';
        let lead: React.ReactNode;
        if (state === 'draft') lead = <span className="qz-muted">Not published</span>;
        else if (state === 'scheduled') lead = <span>Opens in <b>{fmtSpan(startsIn ?? 0)}</b></span>;
        else if (state === 'live') lead = endsIn === null
            ? <span>Open, no closing time</span>
            : <span className={endsIn <= DAY ? 'qz-soon' : undefined}>Closes in <b>{fmtSpan(endsIn)}</b></span>;
        else lead = <span>Closed {row.end_date ? when.day(row.end_date) : ''}</span>;
        return <><span className="qz-when-lead">{lead}</span><span className="qz-when-window">{range}</span></>;
    };

    const subsCell = (row: QuizRow, state: LiveState) => {
        if (state === 'draft') return <span className="qz-muted">—</span>;
        const pct = row.total_students ? (row.submitted_students / row.total_students) * 100 : 0;
        return (
            <>
                <span className="qz-subs-top"><b>{row.submitted_students}</b> / {row.total_students}</span>
                <span className="qz-meter" aria-hidden><i style={{ width: `${Math.min(100, pct)}%` }} /></span>
                {row.in_progress_students > 0 && state === 'live' && <span className="qz-subs-note">{row.in_progress_students} in progress</span>}
            </>
        );
    };

    /* ═══════════ LOADING ═══════════ */
    if (loading) {
        return (
            <div className="tc qz-page" aria-busy="true">
                <div className="tc-header"><div><Skeleton.Input active size="small" style={{ width: 110, height: 12 }} /><div style={{ marginTop: 10 }}><Skeleton.Input active style={{ width: 160, height: 26 }} /></div></div></div>
                <div className="tc-kpis">{[0, 1, 2, 3, 4].map(i => <div key={i} className="tc-kpi"><Skeleton active title={false} paragraph={{ rows: 2 }} /></div>)}</div>
                <div className="tc-card tc-pad"><Skeleton active paragraph={{ rows: 8 }} /></div>
            </div>
        );
    }

    return (
        <ConfigProvider theme={{ token: { colorPrimary: '#4f46e5', fontSize: 13, borderRadius: 8 } }}>
            {msgHolder}{modalHolder}
            <div className="tc qz-page">
                {/* ── Header ── */}
                <header className="tc-header">
                    <div>
                        <div className="tc-overline">Teacher space</div>
                        <h1 className="tc-title">Quizzes</h1>
                        <p className="tc-subtitle">Build, schedule and grade quizzes for your batches. Times shown in {timezoneLabel(user?.timezone)}.</p>
                    </div>
                    <div className="tc-actions">
                        <Tooltip title="Refresh"><Button icon={<ReloadOutlined spin={refreshing} />} aria-label="Refresh" onClick={refresh} /></Tooltip>
                        <Button icon={<ThunderboltOutlined />} onClick={() => openBuilder({ withAI: true })}>{r.isMobile ? 'AI' : 'Generate with AI'}</Button>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => openBuilder()}>New quiz</Button>
                    </div>
                </header>

                {error && (
                    <div className="tc-alert" role="alert">
                        <WarningOutlined /><span><strong>Couldn't load your quizzes.</strong> {error}</span>
                        <Button size="small" onClick={refresh}>Retry</Button>
                    </div>
                )}

                {/* ── KPIs ── */}
                <section className="tc-kpis" aria-label="Summary">
                    <button type="button" className={`tc-kpi${tab === 'all' ? ' is-on' : ''}`} onClick={() => setTab('all')}>
                        <span className="tc-kpi-ic"><FileTextOutlined /></span>
                        <span className="tc-kpi-label">Quizzes</span>
                        <span className="tc-kpi-value">{counts.all}</span>
                        <span className="tc-kpi-sub">{kpi.published} published · {counts.draft} {counts.draft === 1 ? 'draft' : 'drafts'}</span>
                    </button>
                    <button type="button" className={`tc-kpi is-green${tab === 'live' ? ' is-on' : ''}`} onClick={() => setTab('live')}>
                        <span className="tc-kpi-ic"><CheckCircleOutlined /></span>
                        <span className="tc-kpi-label">Live now</span>
                        <span className="tc-kpi-value">{counts.live}</span>
                        <span className={`tc-kpi-sub${kpi.closingSoon ? ' qz-soon' : ''}`}>{kpi.closingSoon ? `${kpi.closingSoon} closing within 24 h` : 'Open to students'}</span>
                    </button>
                    <button type="button" className={`tc-kpi is-amber${tab === 'scheduled' ? ' is-on' : ''}`} onClick={() => setTab('scheduled')}>
                        <span className="tc-kpi-ic"><ClockCircleOutlined /></span>
                        <span className="tc-kpi-label">Scheduled</span>
                        <span className="tc-kpi-value">{counts.scheduled}</span>
                        <span className="tc-kpi-sub">{kpi.nextStart ? `Next opens in ${fmtSpan(kpi.nextStart.startsIn ?? 0)}` : 'Nothing waiting to open'}</span>
                    </button>
                    <div className="tc-kpi">
                        <span className="tc-kpi-ic"><TeamOutlined /></span>
                        <span className="tc-kpi-label">Completion</span>
                        <span className="tc-kpi-value">{fmtPct(kpi.completion)}</span>
                        <span className="tc-kpi-sub">{kpi.assigned ? `${kpi.submitted} of ${kpi.assigned} expected submissions` : 'No published quizzes yet'}</span>
                        <span className="tc-kpi-meter"><i style={{ width: `${Math.min(100, kpi.completion ?? 0)}%` }} /></span>
                    </div>
                    <div className={`tc-kpi ${kpi.average === null ? 'is-slate' : kpi.average >= 70 ? 'is-green' : kpi.average >= PASS_MARK ? 'is-amber' : 'is-red'}`}>
                        <span className="tc-kpi-ic"><TrophyOutlined /></span>
                        <span className="tc-kpi-label">Average score</span>
                        <span className="tc-kpi-value">{fmtPct(kpi.average)}</span>
                        <span className="tc-kpi-sub">{kpi.gradedCount ? `Across ${plural(kpi.gradedCount, 'graded quiz', 'graded quizzes')} · pass ${PASS_MARK}%` : 'No graded submissions yet'}</span>
                        <span className="tc-kpi-meter"><i style={{ width: `${Math.min(100, kpi.average ?? 0)}%` }} /></span>
                    </div>
                </section>

                {/* ── List ── */}
                <section className="tc-card qz-list" aria-label="Quizzes">
                    <div className="qz-toolbar">
                        <div className="qz-tabs" role="tablist" aria-label="Status">
                            {TAB_ORDER.map(t => (
                                <button key={t} type="button" role="tab" aria-selected={tab === t} className={`qz-tab${tab === t ? ' is-on' : ''}${t !== 'all' ? ` is-${t}` : ''}`} onClick={() => setTab(t)}>
                                    {t !== 'all' && <i className="qz-dot" aria-hidden />}{TAB_LABEL[t]}<span>{counts[t]}</span>
                                </button>
                            ))}
                        </div>
                        <div className="qz-filters">
                            <Input className="qz-search" allowClear prefix={<SearchOutlined style={{ color: '#94a3b8' }} />} placeholder="Search quizzes" value={search} onChange={e => setSearch(e.target.value)} aria-label="Search quizzes" />
                            {batchOptions.length > 1 && (
                                <Select<string> className="qz-filter" allowClear showSearch placeholder="All batches" value={batch ?? undefined} onChange={v => setBatch(v ?? null)} options={batchOptions} aria-label="Batch" />
                            )}
                            <Select<SortKey> className="qz-sort" value={sort} onChange={setSort} aria-label="Sort" options={[
                                { value: 'recent', label: 'Newest first' },
                                { value: 'closing', label: 'Closing soonest' },
                                { value: 'completion', label: 'Lowest completion' },
                                { value: 'score', label: 'Lowest average' },
                                { value: 'title', label: 'Title (A–Z)' },
                            ]} />
                        </div>
                    </div>

                    {rows.length === 0 ? (
                        <div className="qz-empty">
                            <span className="qz-empty-art"><FormOutlined /></span>
                            <strong>Create your first quiz</strong>
                            <span>Write questions yourself, generate a first draft with AI, or add listening sections with recorded or generated audio.</span>
                            <div className="qz-empty-actions">
                                <Button type="primary" icon={<PlusOutlined />} onClick={() => openBuilder()}>New quiz</Button>
                                <Button icon={<ThunderboltOutlined />} onClick={() => openBuilder({ withAI: true })}>Generate with AI</Button>
                            </div>
                        </div>
                    ) : list.length === 0 ? (
                        <div className="qz-empty is-compact">
                            <strong>No quizzes match</strong>
                            <span>Try another status, batch or search term.</span>
                            {hasFilters && <Button size="small" onClick={clearFilters}>Clear filters</Button>}
                        </div>
                    ) : (
                        <div className="qz-table" role="table" aria-label="Quizzes" style={{ '--qz-sticky-top': `${stickyTop}px` } as React.CSSProperties}>
                            <div ref={stickyMarker} className="qz-sticky-marker" aria-hidden />
                            <div className={`qz-row is-head${stuck ? ' is-stuck' : ''}`} role="row">
                                <span role="columnheader">Quiz</span>
                                <span role="columnheader">Availability</span>
                                <span role="columnheader">Submitted</span>
                                <span role="columnheader">Average</span>
                                <span role="columnheader">Status</span>
                                <div className="qz-c-head-actions" role="columnheader">
                                    <span className="qz-sr">Actions</span>
                                    <div className={`qz-head-actions${stuck ? ' is-visible' : ''}`} aria-hidden={!stuck}>
                                        <Tooltip title="Generate with AI">
                                            <Button
                                                size="small"
                                                icon={<ThunderboltOutlined />}
                                                onClick={() => openBuilder({ withAI: true })}
                                                className="qz-head-btn qz-head-btn-ai"
                                                tabIndex={stuck ? 0 : -1}
                                            >
                                                <span className="qz-head-btn-label">Generate with AI</span>
                                                <span className="qz-head-btn-label-short">AI</span>
                                            </Button>
                                        </Tooltip>
                                        <Button
                                            size="small"
                                            type="primary"
                                            icon={<PlusOutlined />}
                                            onClick={() => openBuilder()}
                                            className="qz-head-btn qz-head-btn-new"
                                            tabIndex={stuck ? 0 : -1}
                                        >
                                            New quiz
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            {pageItems.map(({ row, state, startsIn, endsIn }) => (
                                <div key={row.id} className={`qz-row is-${state}`} role="row">
                                    <div className="qz-c-main" role="cell">
                                        <button type="button" className="qz-title" onClick={() => setPreview(row)}>{row.title}</button>
                                        <span className="qz-meta">
                                            <span>{plural(row.total_questions, 'question')}</span>
                                            <span>{row.duration_minutes} min</span>
                                            {row.total_marks !== null && <span>{row.total_marks} pts</span>}
                                        </span>
                                        {row.batches.length > 0 && (
                                            <span className="qz-chips">
                                                {row.batches.slice(0, 2).map(b => <span key={b} className="qz-chip">{b}</span>)}
                                                {row.batches.length > 2 && <Tooltip title={row.batches.slice(2).join(', ')}><span className="qz-chip">+{row.batches.length - 2}</span></Tooltip>}
                                            </span>
                                        )}
                                    </div>
                                    <div className="qz-c-when" role="cell">{whenCell(row, state, startsIn, endsIn)}</div>
                                    <div className="qz-c-subs" role="cell">{subsCell(row, state)}</div>
                                    <div className="qz-c-score" role="cell">
                                        {state === 'draft' || row.submitted_students === 0
                                            ? <span className="qz-muted">—</span>
                                            : <span className={`tc-score ${toneOfScore(row.avg_score)}`}>{fmtPct(row.avg_score)}</span>}
                                    </div>
                                    <div className="qz-c-status" role="cell"><span className={`qz-state is-${state}`}><i aria-hidden />{STATE_META[state].label}</span></div>
                                    <div className="qz-c-actions" role="cell">
                                        {state === 'draft' ? (
                                            <Button size="small" icon={<EditOutlined />} onClick={() => openBuilder({ quizId: row.id, context: row })}>Edit</Button>
                                        ) : (
                                            <Button size="small" icon={<TeamOutlined />} onClick={() => setResults({ row, tab: 'overview' })}>Results</Button>
                                        )}
                                        <Dropdown menu={menuFor(row, state)} trigger={['click']} placement="bottomRight">
                                            <Button size="small" type="text" icon={<MoreOutlined />} loading={busyId === row.id} aria-label={`More actions for ${row.title}`} />
                                        </Dropdown>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {list.length > PAGE_SIZE && (
                        <div className="qz-foot">
                            <Pagination size="small" current={page} pageSize={PAGE_SIZE} total={list.length} onChange={setPage} showSizeChanger={false} simple={r.isMobile}
                                showTotal={r.isMobile ? undefined : (t, [a, b]) => `${a}–${b} of ${t}`} />
                        </div>
                    )}
                </section>
            </div>

            {builder && (
                <ErrorBoundary>
                    <QuizBuilder
                        quizId={builder.quizId}
                        duplicateOf={builder.duplicateOf}
                        startWithAI={builder.withAI}
                        context={builder.context}
                        onClose={() => setBuilder(null)}
                        onSaved={onSaved}
                    />
                </ErrorBoundary>
            )}

            <ErrorBoundary>
                <QuizDetails
                    quiz={preview}
                    onClose={() => setPreview(null)}
                    onEdit={(row) => { setPreview(null); openBuilder({ quizId: row.id, context: row }); }}
                    onResults={(row) => { setPreview(null); setResults({ row, tab: 'overview' }); }}
                    canEdit={(row) => liveStateOf(row, elapsed).state !== 'ended'}
                />
            </ErrorBoundary>

            <ErrorBoundary>
                <QuizResults
                    quiz={results?.row ?? null}
                    initialTab={results?.tab ?? 'overview'}
                    onClose={() => setResults(null)}
                />
            </ErrorBoundary>
        </ConfigProvider>
    );
};

export default QuizManagement;
