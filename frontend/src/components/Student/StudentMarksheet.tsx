import React, { Suspense, lazy, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Table, Select, Button, Modal, Alert, Input, Segmented, Pagination, Tooltip, Skeleton, ConfigProvider, Empty, Radio } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined, PrinterOutlined, BarChartOutlined, LockOutlined, InfoCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAuth } from '../../contexts/AuthContext';
import useResponsive from '../../hooks/useResponsive';
import { headerHeight } from '../Layout/layoutMetrics';
import { GRADE_BANDS, PASS_MARK, gradeFromPercent, toneFor } from '../../utils/grading';
import type { PrintBatch } from './MarksheetPrint';
import './StudentMarksheet.css';

// Loaded on demand: the chart only when "Compare" opens, the printable report only when printing.
const BarChart = lazy(() => import('@mui/x-charts/BarChart').then(m => ({ default: m.BarChart })));
const MarksheetPrint = lazy(() => import('./MarksheetPrint'));

/* ── Types ── */
interface ApiResult {
    id: number; quiz_id: number; quiz_title: string;
    batch_id: number | null; batch_name: string | null;
    score: number | string | null; max_score: number | string | null; percentage: number | string | null;
    correct_answers?: number | string | null; total_questions?: number | string | null;
    submitted_at: string | null; end_date?: string | null;
    teacher_first_name?: string | null; teacher_last_name?: string | null;
    results_locked?: boolean | 0 | 1;
}

/** One submission. A quiz shared by several of the student's batches comes back once per batch; we merge those. */
export interface MarkRow {
    key: string;
    quizTitle: string;
    batchKeys: string[];
    batchNames: string[];
    teacher: string | null;
    locked: boolean;
    releaseAt: string | null;
    score: number | null;
    maxScore: number | null;
    pct: number | null;
    correct: number | null;
    questions: number | null;
    submittedAt: string | null;
}

export interface Stats {
    graded: number; pending: number; passed: number;
    average: number | null; best: number | null; lowest: number | null;
    points: number; maxPoints: number; lastAt: string | null;
}

interface BatchRow extends Stats { key: string; name: string; total: number; }

type View = 'quizzes' | 'batches';
type StatusFilter = 'all' | 'passed' | 'failed' | 'pending';

/* ── Grading scale lives in utils/grading ── */
const PAGE_SIZE = 15;
const UNASSIGNED = 'unassigned';


/* ── Helpers ── */
const toNum = (v: unknown): number | null => {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
};
const NUM = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
const PCT = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
const fmtNum = (v: number) => NUM.format(v);
const fmtPct = (v: number | null) => (v == null ? '—' : `${PCT.format(v)}%`);
const fmtDate = (v: string | null) => (v ? dayjs(v).format('MMM D, YYYY') : '—');
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const isGraded = (r: MarkRow) => !r.locked && r.pct != null;
const byDateDesc = (a: MarkRow, b: MarkRow) => dayjs(b.submittedAt || 0).valueOf() - dayjs(a.submittedAt || 0).valueOf();

const normalize = (raw: ApiResult[]): MarkRow[] => {
    const bySubmission = new Map<string, MarkRow>();
    for (const r of raw) {
        const key = String(r.id);
        const batchKey = r.batch_id == null ? UNASSIGNED : String(r.batch_id);
        const batchName = r.batch_name || 'Unassigned';
        const existing = bySubmission.get(key);
        if (existing) {
            if (!existing.batchKeys.includes(batchKey)) {
                existing.batchKeys.push(batchKey);
                existing.batchNames.push(batchName);
            }
            continue;
        }
        const locked = !!r.results_locked;
        bySubmission.set(key, {
            key,
            quizTitle: r.quiz_title || 'Untitled quiz',
            batchKeys: [batchKey],
            batchNames: [batchName],
            teacher: [r.teacher_first_name, r.teacher_last_name].filter(Boolean).join(' ') || null,
            locked,
            releaseAt: locked ? r.end_date ?? null : null,
            score: locked ? null : toNum(r.score),
            maxScore: locked ? null : toNum(r.max_score),
            pct: locked ? null : toNum(r.percentage),
            correct: locked ? null : toNum(r.correct_answers),
            questions: toNum(r.total_questions),
            submittedAt: r.submitted_at,
        });
    }
    return Array.from(bySubmission.values());
};

/** Average is weighted by points (total earned / total available), matching how the marksheet has always been computed. */
const computeStats = (rows: MarkRow[]): Stats => {
    let graded = 0, pending = 0, passed = 0, points = 0, maxPoints = 0;
    let best: number | null = null, lowest: number | null = null, lastAt: string | null = null;
    for (const r of rows) {
        if (r.submittedAt && (!lastAt || dayjs(r.submittedAt).isAfter(lastAt))) lastAt = r.submittedAt;
        if (!isGraded(r)) { pending++; continue; }
        const pct = r.pct as number;
        graded++;
        if (pct >= PASS_MARK) passed++;
        points += r.score ?? 0;
        maxPoints += r.maxScore ?? 0;
        best = best == null ? pct : Math.max(best, pct);
        lowest = lowest == null ? pct : Math.min(lowest, pct);
    }
    const average = graded > 0 && maxPoints > 0 ? (points / maxPoints) * 100 : null;
    return { graded, pending, passed, average, best, lowest, points, maxPoints, lastAt };
};

/* ── Small presentational pieces ── */
const ScoreCell = ({ pct }: { pct: number }) => (
    <div className={`ms-score ms-tone-${toneFor(pct)}`}>
        <span className="ms-score-bar" aria-hidden><span style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} /></span>
        <span className="ms-score-value">{fmtPct(pct)}</span>
    </div>
);

const GradeBadge = ({ pct }: { pct: number }) => (
    <span className={`ms-grade ms-tone-${toneFor(pct)}`}>{gradeFromPercent(pct)}</span>
);

const LockedNote = ({ row }: { row: MarkRow }) => (
    <span className="ms-pill">
        <LockOutlined />
        {row.releaseAt ? `Results released ${fmtDate(row.releaseAt)}` : 'Awaiting release'}
    </span>
);

interface TrendPoint { key: string; label: string; date: string | null; pct: number; }

const TrendChart: React.FC<{ points: TrendPoint[] }> = ({ points }) => {
    const wrapRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(0);
    const [active, setActive] = useState<number | null>(null);

    useLayoutEffect(() => {
        const el = wrapRef.current;
        if (!el) return;
        setWidth(el.clientWidth);
        const ro = new ResizeObserver(entries => setWidth(entries[0].contentRect.width));
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const H = 180, L = 36, R = 8, T = 14, B = 10;
    const innerW = Math.max(0, width - L - R);
    const innerH = H - T - B;
    const xAt = (i: number) => L + (points.length > 1 ? (i * innerW) / (points.length - 1) : innerW / 2);
    const yAt = (pct: number) => T + innerH * (1 - Math.min(100, Math.max(0, pct)) / 100);
    const line = points.map((p, i) => `${i ? 'L' : 'M'}${xAt(i).toFixed(1)} ${yAt(p.pct).toFixed(1)}`).join(' ');
    const area = `${line} L${xAt(points.length - 1).toFixed(1)} ${T + innerH} L${xAt(0).toFixed(1)} ${T + innerH} Z`;

    const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
        const rel = e.clientX - e.currentTarget.getBoundingClientRect().left - L;
        const idx = points.length > 1 ? Math.round((rel / innerW) * (points.length - 1)) : 0;
        setActive(Math.min(points.length - 1, Math.max(0, idx)));
    };

    const activePoint = active != null ? points[active] : null;
    const tipLeft = active != null ? Math.min(Math.max(xAt(active), 100), width - 100) : 0;

    return (
        <div className="ms-trend" ref={wrapRef}>
            {width > 0 && (
                <svg width={width} height={H} onMouseMove={onMove} onMouseLeave={() => setActive(null)}
                    role="img" aria-label={`Score trend over the last ${points.length} graded quizzes`}>
                    {[0, PASS_MARK, 100].map(v => (
                        <g key={v}>
                            <line x1={L} x2={width - R} y1={yAt(v)} y2={yAt(v)} className={v === PASS_MARK ? 'ms-trend-pass' : 'ms-trend-grid'} />
                            <text x={L - 8} y={yAt(v)} dy="0.32em" textAnchor="end" className="ms-trend-axis">{v}%</text>
                        </g>
                    ))}
                    <text x={width - R} y={yAt(PASS_MARK) - 5} textAnchor="end" className="ms-trend-axis">Pass mark</text>
                    <path d={area} className="ms-trend-area" />
                    <path d={line} className="ms-trend-line" />
                    {active != null && <line x1={xAt(active)} x2={xAt(active)} y1={T} y2={T + innerH} className="ms-trend-guide" />}
                    {points.map((p, i) => (
                        <circle key={p.key} cx={xAt(i)} cy={yAt(p.pct)} r={i === active ? 4.5 : 3}
                            className={`ms-trend-dot${p.pct < PASS_MARK ? ' is-fail' : ''}${i === active ? ' is-active' : ''}`} />
                    ))}
                </svg>
            )}
            {activePoint && (
                <div className="ms-trend-tip" style={{ left: tipLeft }}>
                    <strong>{activePoint.label}</strong>
                    <span>{fmtPct(activePoint.pct)} · {fmtDate(activePoint.date)}</span>
                </div>
            )}
        </div>
    );
};

const Distribution: React.FC<{ rows: MarkRow[] }> = ({ rows }) => {
    const total = rows.length;
    const bands = GRADE_BANDS.map((b, i) => ({
        ...b,
        count: rows.filter(r => (r.pct as number) >= b.min && (i === 0 || (r.pct as number) < GRADE_BANDS[i - 1].min)).length,
    }));
    return (
        <ul className="ms-dist">
            {bands.map(b => {
                const share = total ? (b.count / total) * 100 : 0;
                return (
                    <li key={b.label} className={`ms-tone-${b.tone}`}>
                        <span className="ms-dist-label"><strong>{b.label}</strong> {b.range}</span>
                        <span className="ms-dist-track"><span className="ms-dist-bar" style={{ width: `${share}%` }} /></span>
                        <span className="ms-dist-count">{b.count} <small>· {Math.round(share)}%</small></span>
                    </li>
                );
            })}
        </ul>
    );
};

/* ══════════════════════════════
   MAIN COMPONENT
══════════════════════════════ */
const StudentMarksheet: React.FC = () => {
    const { apiCall, user } = useAuth();
    const r = useResponsive();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [rows, setRows] = useState<MarkRow[]>([]);
    const [selectedBatches, setSelectedBatches] = useState<string[]>(['all']);
    const [view, setView] = useState<View>('quizzes');
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<StatusFilter>('all');
    const [page, setPage] = useState(1);
    const [compareOpen, setCompareOpen] = useState(false);
    const [printOpen, setPrintOpen] = useState(false);
    const [enrolled, setEnrolled] = useState<PrintBatch[] | null>(null);
    const [printChoice, setPrintChoice] = useState<string | null>(null);
    const [printJob, setPrintJob] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            setLoading(true); setError(null);
            try {
                const res = await apiCall('/quizzes/student/results');
                if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Failed to fetch'); }
                const data: any = await res.json();
                setRows(normalize(Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : []));
            } catch (e: any) { setError(e?.message || 'Failed to load results'); }
            finally { setLoading(false); }
        })();
    }, [apiCall]);

    useEffect(() => { setPage(1); }, [search, status, selectedBatches, view]);

    /* ── Batch filter ── */
    const batchOptions = useMemo(() => {
        const m = new Map<string, string>();
        rows.forEach(row => row.batchKeys.forEach((k, i) => m.set(k, row.batchNames[i])));
        return [{ value: 'all', label: 'All batches' }, ...Array.from(m, ([value, label]) => ({ value, label }))];
    }, [rows]);
    const enrolledBatchCount = batchOptions.length - 1;

    const isAll = selectedBatches.includes('all');
    const onBatchChange = (vals: string[]) => {
        const justSelectedAll = !selectedBatches.includes('all') && vals.includes('all');
        setSelectedBatches(justSelectedAll || vals.length === 0 ? ['all'] : vals.filter(v => v !== 'all'));
    };

    const scoped = useMemo(
        () => (isAll ? rows : rows.filter(row => row.batchKeys.some(k => selectedBatches.includes(k)))),
        [rows, selectedBatches, isAll],
    );
    const stats = useMemo(() => computeStats(scoped), [scoped]);

    const batchRows = useMemo<BatchRow[]>(() => {
        const groups = new Map<string, { name: string; rows: MarkRow[] }>();
        for (const row of rows) {
            row.batchKeys.forEach((k, i) => {
                if (!isAll && !selectedBatches.includes(k)) return;
                if (!groups.has(k)) groups.set(k, { name: row.batchNames[i], rows: [] });
                groups.get(k)!.rows.push(row);
            });
        }
        return Array.from(groups, ([key, g]) => ({ key, name: g.name, total: g.rows.length, ...computeStats(g.rows) }))
            .sort((a, b) => (b.average ?? -1) - (a.average ?? -1));
    }, [rows, selectedBatches, isAll]);
    const canCompare = batchRows.length >= 2;

    // Results grouped per batch over everything (ignores the page filter): feeds the print picker and report.
    const byBatch = useMemo(() => {
        const groups = new Map<string, MarkRow[]>();
        rows.forEach(row => row.batchKeys.forEach(k => {
            if (!groups.has(k)) groups.set(k, []);
            groups.get(k)!.push(row);
        }));
        return new Map(Array.from(groups, ([k, list]) => [k, { rows: list, stats: computeStats(list) }]));
    }, [rows]);

    /* ── Insights ── */
    const gradedRows = useMemo(() => scoped.filter(isGraded), [scoped]);
    const trendPoints = useMemo<TrendPoint[]>(() =>
        gradedRows.slice().sort((a, b) => -byDateDesc(a, b)).slice(-20)
            .map(row => ({ key: row.key, label: row.quizTitle, date: row.submittedAt, pct: row.pct as number })),
    [gradedRows]);

    /* ── Quiz list (search + status) ── */
    const quizList = useMemo(() => {
        const q = search.trim().toLowerCase();
        return scoped.filter(row => {
            if (q && !row.quizTitle.toLowerCase().includes(q) && !row.batchNames.some(n => n.toLowerCase().includes(q))) return false;
            if (status === 'passed') return isGraded(row) && (row.pct as number) >= PASS_MARK;
            if (status === 'failed') return isGraded(row) && (row.pct as number) < PASS_MARK;
            if (status === 'pending') return !isGraded(row);
            return true;
        }).sort(byDateDesc);
    }, [scoped, search, status]);

    /* ── Columns ── */
    const LOCKED_SPAN = 4;
    const hideWhenLocked = (row: MarkRow) => ({ colSpan: row.locked ? 0 : 1 });

    const quizColumns: ColumnsType<MarkRow> = [
        {
            title: 'Quiz', key: 'quiz',
            render: (_, row) => (
                <div>
                    <div className="ms-cell-title" title={row.quizTitle}>{row.quizTitle}</div>
                    <div className="ms-cell-meta">{[row.batchNames.join(', '), row.teacher].filter(Boolean).join(' · ')}</div>
                </div>
            ),
        },
        {
            title: 'Submitted', key: 'submitted', width: 140,
            sorter: (a, b) => -byDateDesc(a, b), defaultSortOrder: 'descend',
            render: (_, row) => row.submittedAt ? (
                <div>
                    <div>{fmtDate(row.submittedAt)}</div>
                    <div className="ms-cell-meta">{dayjs(row.submittedAt).format('HH:mm')}</div>
                </div>
            ) : <span className="ms-muted">—</span>,
        },
        {
            title: 'Correct', key: 'correct', width: 96, align: 'right',
            onCell: row => (row.locked ? { colSpan: LOCKED_SPAN, className: 'ms-cell-locked' } : {}),
            render: (_, row) => row.locked ? <LockedNote row={row} />
                : row.correct != null && row.questions ? `${row.correct} / ${row.questions}` : <span className="ms-muted">—</span>,
        },
        {
            title: 'Points', key: 'points', width: 120, align: 'right', onCell: hideWhenLocked,
            render: (_, row) => row.score != null && row.maxScore != null
                ? <>{fmtNum(row.score)} <span className="ms-muted">/ {fmtNum(row.maxScore)}</span></>
                : <span className="ms-muted">—</span>,
        },
        {
            title: 'Score', key: 'score', width: 160, align: 'right', onCell: hideWhenLocked,
            sorter: (a, b) => (a.pct ?? -1) - (b.pct ?? -1),
            render: (_, row) => row.pct != null ? <ScoreCell pct={row.pct} /> : null,
        },
        {
            title: 'Grade', key: 'grade', width: 80, align: 'center', onCell: hideWhenLocked,
            render: (_, row) => row.pct != null ? <GradeBadge pct={row.pct} /> : null,
        },
    ];

    const passRate = (b: Stats) => (b.graded ? Math.round((b.passed / b.graded) * 100) : null);

    const batchColumns: ColumnsType<BatchRow> = [
        {
            title: 'Batch', key: 'name',
            render: (_, b) => (
                <div>
                    <div className="ms-cell-title" title={b.name}>{b.name}</div>
                    <div className="ms-cell-meta">{plural(b.total, 'quiz', 'quizzes')}</div>
                </div>
            ),
        },
        {
            title: 'Graded', key: 'graded', width: 150,
            render: (_, b) => (
                <div>
                    <div className="ms-progress-label">{b.graded} <small>of {b.total}</small></div>
                    <div className="ms-progress-track"><span style={{ width: `${b.total ? (b.graded / b.total) * 100 : 0}%` }} /></div>
                </div>
            ),
        },
        {
            title: 'Average', key: 'average', width: 160, align: 'right',
            sorter: (a, b) => (a.average ?? -1) - (b.average ?? -1), defaultSortOrder: 'descend',
            render: (_, b) => b.average != null ? <ScoreCell pct={b.average} /> : <span className="ms-muted">—</span>,
        },
        {
            title: 'Grade', key: 'grade', width: 80, align: 'center',
            render: (_, b) => b.average != null ? <GradeBadge pct={b.average} /> : <span className="ms-muted">—</span>,
        },
        {
            title: 'Pass rate', key: 'pass', width: 100, align: 'right',
            sorter: (a, b) => (passRate(a) ?? -1) - (passRate(b) ?? -1),
            render: (_, b) => { const p = passRate(b); return p == null ? <span className="ms-muted">—</span> : `${p}%`; },
        },
        { title: 'Best', key: 'best', width: 90, align: 'right', render: (_, b) => fmtPct(b.best) },
        { title: 'Lowest', key: 'lowest', width: 90, align: 'right', render: (_, b) => fmtPct(b.lowest) },
        { title: 'Last result', key: 'last', width: 130, render: (_, b) => fmtDate(b.lastAt) },
    ];

    /* ═══════════ LOADING ═══════════ */
    if (loading) return (
        <div className="ms" aria-busy="true">
            <div className="ms-header">
                <div>
                    <Skeleton.Input active size="small" style={{ width: 90, height: 12 }} />
                    <div style={{ marginTop: 10 }}><Skeleton.Input active style={{ width: 260, height: 26 }} /></div>
                </div>
            </div>
            <div className="ms-summary ms-summary-loading"><Skeleton active title={false} paragraph={{ rows: 3 }} /></div>
            <div className="ms-card" style={{ padding: 20 }}><Skeleton active title={false} paragraph={{ rows: 7 }} /></div>
        </div>
    );

    /* ═══════════ RENDER ═══════════ */
    const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ');
    const averageTone = stats.average != null ? `ms-tone-${toneFor(stats.average)}` : '';
    const useTable = !r.isMobile;
    // Column headers stick just below the fixed app header while rows scroll.
    const stickyHeader = { offsetHeader: headerHeight(r.isMobile) };
    const viewCount = view === 'quizzes' ? quizList.length : batchRows.length;
    const hasFilters = search.trim() !== '' || status !== 'all';

    /* ── Print: pick one batch, then lazily mount the report and open the dialog ── */
    const openPrint = async () => {
        setPrintOpen(true);
        let list = enrolled;
        if (!list) {
            list = [];
            try {
                const res = await apiCall('/batches/student/my-batches');
                if (res.ok) { const data = await res.json(); if (Array.isArray(data)) list = data; }
            } catch { /* fall back to the batches found in the results */ }
            if (list.length === 0) {
                list = batchOptions
                    .filter(o => o.value !== 'all' && o.value !== UNASSIGNED)
                    .map(o => ({ id: Number(o.value), name: o.label }));
            }
            setEnrolled(list);
        }
        const printable = list.filter(b => byBatch.has(String(b.id))).map(b => String(b.id));
        const preferred = !isAll && selectedBatches.length === 1 ? selectedBatches[0] : null;
        setPrintChoice(prev => (prev && printable.includes(prev) ? prev
            : preferred && printable.includes(preferred) ? preferred
            : printable[0] ?? null));
    };

    const printBatch = printJob ? enrolled?.find(b => String(b.id) === printJob) ?? null : null;
    const printData = printJob ? byBatch.get(printJob) : undefined;

    const runPrint = () => {
        const previousTitle = document.title;
        // Shown in the browser's print header and used as the default PDF file name.
        document.title = ['Academic Report', fullName, printBatch?.name].filter(Boolean).join(' - ');
        const finish = () => {
            window.removeEventListener('afterprint', finish);
            document.title = previousTitle;
            setPrintJob(null);
        };
        window.addEventListener('afterprint', finish);
        window.print();
    };

    const compareHint = enrolledBatchCount < 2
        ? 'Comparison needs at least two batches'
        : 'Select at least two batches to compare';

    const emptyResults = (
        <div className="ms-empty">
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={rows.length === 0 ? 'No results yet. Your marks appear here once a quiz is graded.' : 'No quizzes match these filters.'} />
        </div>
    );

    return (
        <ConfigProvider theme={{ token: { colorPrimary: '#047857' } }}>
            <div className="ms">

                {/* ── Header ── */}
                <header className="ms-header">
                    <div>
                        <div className="ms-overline">Marksheet</div>
                        <h1 className="ms-title">{fullName || 'My results'}</h1>
                        <p className="ms-subtitle">
                            {plural(stats.graded, 'graded quiz', 'graded quizzes')} · {plural(batchRows.length, 'batch', 'batches')}
                            {stats.lastAt && <> · Last result {fmtDate(stats.lastAt)}</>}
                        </p>
                    </div>
                    <div className="ms-header-actions ms-no-print">
                        {enrolledBatchCount > 1 && (
                            <Select
                                className="ms-batch-select"
                                mode="multiple"
                                value={selectedBatches}
                                onChange={onBatchChange}
                                options={batchOptions}
                                maxTagCount="responsive"
                                placeholder="Filter by batch"
                                aria-label="Filter by batch"
                            />
                        )}
                        <Tooltip title={canCompare ? undefined : compareHint}>
                            <Button icon={<BarChartOutlined />} disabled={!canCompare} onClick={() => setCompareOpen(true)}>Compare</Button>
                        </Tooltip>
                        <Button icon={<PrinterOutlined />} onClick={openPrint} disabled={rows.length === 0} loading={printJob != null}>Print</Button>
                    </div>
                </header>

                {error && <Alert type="error" message="Couldn't load your results" description={error} showIcon />}

                {/* ── Summary ── */}
                <section className="ms-summary" aria-label="Summary">
                    <div className={`ms-grade-block ${averageTone}`}>
                        <span className="ms-overline">Overall grade</span>
                        <div className="ms-grade-row">
                            <span className="ms-grade-letter">{stats.average != null ? gradeFromPercent(stats.average) : '—'}</span>
                            <span className="ms-grade-pct">
                                {stats.average != null ? `${NUM.format(stats.average)}%` : 'No grades yet'}
                                <small>average, weighted by points</small>
                            </span>
                        </div>
                        <div className="ms-meter" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={stats.average ?? 0} aria-label="Average score">
                            <div className="ms-meter-fill" style={{ width: `${Math.min(100, stats.average ?? 0)}%` }} />
                            <div className="ms-meter-mark" style={{ left: `${PASS_MARK}%` }} />
                        </div>
                        <div className="ms-meter-scale"><span>0</span><span>Pass {PASS_MARK}%</span><span>100</span></div>
                    </div>

                    <dl className="ms-stats">
                        <div className="ms-stat">
                            <dt>Graded quizzes</dt>
                            <dd className="ms-stat-value">{stats.graded}</dd>
                            <dd className="ms-stat-note">{stats.pending > 0 ? `${stats.pending} awaiting release` : 'All results released'}</dd>
                        </div>
                        <div className="ms-stat">
                            <dt>Passed</dt>
                            <dd className="ms-stat-value">{stats.passed} <small>/ {stats.graded}</small></dd>
                            <dd className="ms-stat-note">{passRate(stats) != null ? `${passRate(stats)}% pass rate` : '—'}</dd>
                        </div>
                        <div className="ms-stat">
                            <dt>Best / lowest</dt>
                            <dd className="ms-stat-value">{fmtPct(stats.best)} <small>/ {fmtPct(stats.lowest)}</small></dd>
                            <dd className="ms-stat-note">Single-quiz scores</dd>
                        </div>
                        <div className="ms-stat">
                            <dt>Total points</dt>
                            <dd className="ms-stat-value">{fmtNum(stats.points)} <small>/ {fmtNum(stats.maxPoints)}</small></dd>
                            <dd className="ms-stat-note">Earned across graded quizzes</dd>
                        </div>
                    </dl>
                </section>

                {/* ── Insights ── */}
                {gradedRows.length > 0 && (
                    <div className="ms-insights">
                        <section className="ms-card">
                            <div className="ms-card-head">
                                <h2 className="ms-card-title">Score trend</h2>
                                <span className="ms-card-sub">Last {plural(trendPoints.length, 'graded quiz', 'graded quizzes')}</span>
                            </div>
                            <div className="ms-card-body">
                                {trendPoints.length >= 2
                                    ? <TrendChart points={trendPoints} />
                                    : <div className="ms-card-empty">Your trend appears after your second graded quiz.</div>}
                            </div>
                        </section>
                        <section className="ms-card">
                            <div className="ms-card-head">
                                <h2 className="ms-card-title">Grade distribution</h2>
                                <span className="ms-card-sub">{plural(gradedRows.length, 'quiz', 'quizzes')}</span>
                            </div>
                            <div className="ms-card-body"><Distribution rows={gradedRows} /></div>
                        </section>
                    </div>
                )}

                {/* ── Results ── */}
                <section className="ms-card" aria-label="Results">
                    <div className="ms-toolbar ms-no-print">
                        <Segmented<View>
                            value={view}
                            onChange={setView}
                            block={r.isMobile}
                            options={[
                                { value: 'quizzes', label: <span>Quizzes<span className="ms-count">{scoped.length}</span></span> },
                                { value: 'batches', label: <span>Batches<span className="ms-count">{batchRows.length}</span></span> },
                            ]}
                        />
                        {view === 'quizzes' && (
                            <div className="ms-toolbar-filters">
                                <Input
                                    className="ms-search"
                                    prefix={<SearchOutlined className="ms-muted" />}
                                    placeholder="Search quizzes"
                                    allowClear
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    aria-label="Search quizzes"
                                />
                                <Select<StatusFilter>
                                    className="ms-status"
                                    value={status}
                                    onChange={setStatus}
                                    aria-label="Filter by result"
                                    options={[
                                        { value: 'all', label: 'All results' },
                                        { value: 'passed', label: 'Passed' },
                                        { value: 'failed', label: 'Below pass mark' },
                                        { value: 'pending', label: 'Awaiting release' },
                                    ]}
                                />
                            </div>
                        )}
                    </div>

                    {viewCount === 0 ? emptyResults : useTable ? (
                        view === 'quizzes' ? (
                            <Table<MarkRow>
                                className="ms-table"
                                columns={quizColumns}
                                dataSource={quizList}
                                rowKey="key"
                                tableLayout="fixed"
                                scroll={{ x: 760 }}
                                size="middle"
                                showSorterTooltip={false}
                                sticky={stickyHeader}
                                pagination={{
                                    current: page, pageSize: PAGE_SIZE, onChange: setPage,
                                    hideOnSinglePage: true, showSizeChanger: false, size: 'small',
                                    showTotal: (total, [from, to]) => `${from}–${to} of ${total}`,
                                }}
                            />
                        ) : (
                            <Table<BatchRow>
                                className="ms-table"
                                columns={batchColumns}
                                dataSource={batchRows}
                                rowKey="key"
                                tableLayout="fixed"
                                scroll={{ x: 960 }}
                                sticky={stickyHeader}
                                size="middle"
                                showSorterTooltip={false}
                                pagination={false}
                            />
                        )
                    ) : view === 'quizzes' ? (
                        <>
                            <ul className="ms-list">
                                {quizList.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(row => (
                                    <li key={row.key} className="ms-list-item">
                                        <div className="ms-list-main">
                                            <div className="ms-cell-title">{row.quizTitle}</div>
                                            <div className="ms-cell-meta">
                                                {[row.batchNames.join(', '), row.submittedAt && fmtDate(row.submittedAt)].filter(Boolean).join(' · ')}
                                            </div>
                                            {row.score != null && row.maxScore != null && (
                                                <div className="ms-cell-meta">
                                                    {fmtNum(row.score)} / {fmtNum(row.maxScore)} pts
                                                    {row.correct != null && row.questions ? ` · ${row.correct}/${row.questions} correct` : ''}
                                                </div>
                                            )}
                                        </div>
                                        <div className="ms-list-side">
                                            {row.pct != null ? (
                                                <>
                                                    <span className="ms-list-pct">{fmtPct(row.pct)}</span>
                                                    <GradeBadge pct={row.pct} />
                                                </>
                                            ) : (
                                                <span className="ms-pill"><LockOutlined /> Pending</span>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            {quizList.length > PAGE_SIZE && (
                                <div className="ms-results-foot">
                                    <Pagination simple size="small" current={page} pageSize={PAGE_SIZE} total={quizList.length} onChange={setPage} />
                                </div>
                            )}
                        </>
                    ) : (
                        <ul className="ms-list">
                            {batchRows.map(b => (
                                <li key={b.key} className="ms-list-item">
                                    <div className="ms-list-main">
                                        <div className="ms-cell-title">{b.name}</div>
                                        <div className="ms-cell-meta">
                                            {b.graded} of {b.total} graded
                                            {passRate(b) != null && ` · ${passRate(b)}% pass rate`}
                                        </div>
                                        <div className="ms-cell-meta">Best {fmtPct(b.best)} · Lowest {fmtPct(b.lowest)}</div>
                                    </div>
                                    <div className="ms-list-side">
                                        {b.average != null ? (
                                            <>
                                                <span className="ms-list-pct">{fmtPct(b.average)}</span>
                                                <GradeBadge pct={b.average} />
                                            </>
                                        ) : <span className="ms-muted">—</span>}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    {(stats.pending > 0 || hasFilters) && (
                        <div className="ms-results-foot ms-no-print">
                            <span>
                                <InfoCircleOutlined />
                                {stats.pending > 0
                                    ? `${plural(stats.pending, 'result')} awaiting release. Scores unlock once each quiz closes.`
                                    : `Showing ${quizList.length} of ${scoped.length} quizzes.`}
                            </span>
                            {hasFilters && (
                                <Button type="link" size="small" onClick={() => { setSearch(''); setStatus('all'); }}>Clear filters</Button>
                            )}
                        </div>
                    )}
                </section>

                {/* ── Compare modal ── */}
                <Modal
                    open={compareOpen}
                    onCancel={() => setCompareOpen(false)}
                    title="Compare batches"
                    width={r.isCompact ? '95vw' : 820}
                    footer={<Button onClick={() => setCompareOpen(false)}>Close</Button>}
                    wrapClassName="ms-modal"
                >
                    <p className="ms-modal-sub">Average score and share of quizzes graded, per batch.</p>
                    <div className="ms-modal-chart">
                        <Suspense fallback={<div style={{ height: 280 }} />}>
                        <BarChart
                            height={280}
                            xAxis={[{ scaleType: 'band', data: batchRows.map(b => b.name) }]}
                            yAxis={[{ min: 0, max: 100 }]}
                            series={[
                                { data: batchRows.map(b => Number((b.average ?? 0).toFixed(1))), label: 'Average score (%)', color: '#047857' },
                                { data: batchRows.map(b => (b.total ? Math.round((b.graded / b.total) * 100) : 0)), label: 'Graded (%)', color: '#cbd5e1' },
                            ]}
                        />
                        </Suspense>
                    </div>
                    <div className="ms-modal-table">
                        <Table<BatchRow>
                            className="ms-table"
                            columns={batchColumns.filter(c => ['name', 'average', 'grade', 'pass', 'best', 'lowest'].includes(String(c.key)))}
                            dataSource={batchRows}
                            rowKey="key"
                            size="small"
                            tableLayout="fixed"
                            scroll={{ x: 640 }}
                            pagination={false}
                            showSorterTooltip={false}
                        />
                    </div>
                </Modal>

                {/* ── Print: batch picker ── */}
                <Modal
                    open={printOpen}
                    onCancel={() => setPrintOpen(false)}
                    title="Print marksheet"
                    width={480}
                    wrapClassName="ms-modal"
                    okText="Print"
                    okButtonProps={{ icon: <PrinterOutlined />, disabled: !printChoice }}
                    onOk={() => { setPrintOpen(false); setPrintJob(printChoice); }}
                >
                    <p className="ms-modal-sub">Choose a batch. The report covers that batch's period and results only.</p>
                    {enrolled === null ? (
                        <Skeleton active title={false} paragraph={{ rows: 3 }} />
                    ) : enrolled.length === 0 ? (
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="You're not enrolled in any batch yet." />
                    ) : (
                        <Radio.Group className="ms-print-options" value={printChoice} onChange={e => setPrintChoice(e.target.value)}>
                            {enrolled.map(b => {
                                const s = byBatch.get(String(b.id))?.stats;
                                const period = b.start_date || b.end_date ? `${fmtDate(b.start_date ?? null)} – ${fmtDate(b.end_date ?? null)}` : null;
                                const summary = s
                                    ? `${plural(s.graded, 'graded quiz', 'graded quizzes')}${s.pending ? ` · ${s.pending} pending` : ''}`
                                    : 'No results yet';
                                return (
                                    <Radio key={b.id} value={String(b.id)} disabled={!s} className="ms-print-option">
                                        <div className="ms-print-option-title">
                                            {b.name}
                                            {b.french_level && <span className="ms-level-tag">{b.french_level}</span>}
                                        </div>
                                        <div className="ms-cell-meta">{[period, summary].filter(Boolean).join(' · ')}</div>
                                    </Radio>
                                );
                            })}
                        </Radio.Group>
                    )}
                </Modal>

                {printJob && printBatch && printData && (
                    <Suspense fallback={null}>
                        <MarksheetPrint
                            student={{ name: fullName, id: user?.id, createdAt: user?.created_at }}
                            batch={printBatch}
                            rows={printData.rows}
                            stats={printData.stats}
                            onReady={runPrint}
                        />
                    </Suspense>
                )}
            </div>
        </ConfigProvider>
    );
};

export default StudentMarksheet;
