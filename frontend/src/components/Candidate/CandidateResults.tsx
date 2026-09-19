import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, ConfigProvider, Segmented, Skeleton } from 'antd';
import {
    AudioOutlined, FormOutlined, HistoryOutlined, ReadOutlined, ReloadOutlined, RightOutlined, SoundOutlined, WarningOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import AttemptReview from './AttemptReview';
import {
    SKILLS, SKILL_ORDER, dateText, durationText, scoreText, scoreUnit,
    type Attempt, type Overview, type SkillKey,
} from './candidateModel';
import './Candidate.css';

/* ══════════════════════════════════════════
   EXAM SPACE — MY RESULTS
   Every completed practice across the four skills, newest first, with the
   best and estimated level per skill. Any result opens its correction.
══════════════════════════════════════════ */

const ICON: Record<SkillKey, React.ReactNode> = { ce: <ReadOutlined />, co: <SoundOutlined />, ee: <FormOutlined />, eo: <AudioOutlined /> };
const PAGE = 30;
type Filter = 'all' | SkillKey;
const skillStyle = (k: SkillKey) => ({ '--sk': SKILLS[k].color, '--sk-soft': SKILLS[k].soft, '--sk-line': SKILLS[k].line } as React.CSSProperties);

const CandidateResults: React.FC = () => {
    const { apiCall } = useAuth();
    const navigate = useNavigate();
    const [params, setParams] = useSearchParams();
    const [overview, setOverview] = useState<Overview | null>(null);
    const [items, setItems] = useState<Attempt[]>([]);
    const [total, setTotal] = useState(0);
    const [counts, setCounts] = useState<Record<SkillKey, number>>({ ce: 0, co: 0, ee: 0, eo: 0 });
    const [filter, setFilter] = useState<Filter>(() => (SKILL_ORDER.includes(params.get('skill') as SkillKey) ? params.get('skill') as SkillKey : 'all'));
    const [loading, setLoading] = useState(true);
    const [more, setMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [review, setReview] = useState<(Pick<Attempt, 'skill' | 'id'> & Partial<Attempt>) | null>(null);

    // ?open=ce-12 (from the dashboard) opens that result directly
    useEffect(() => {
        const open = params.get('open');
        const m = open?.match(/^(ce|co|ee|eo)-(\d+)$/);
        if (m) {
            setReview({ skill: m[1] as SkillKey, id: Number(m[2]) });
            setParams(p => { p.delete('open'); return p; }, { replace: true });
        }
    }, [params, setParams]);

    const fetchPage = useCallback(async (f: Filter, offset: number) => {
        const q = new URLSearchParams({ limit: String(PAGE), offset: String(offset) });
        if (f !== 'all') q.set('skill', f);
        const res = await apiCall(`/exam-space/results?${q}`);
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error || 'Your results could not be loaded.');
        return body as { total: number; counts: Record<SkillKey, number>; items: Attempt[] };
    }, [apiCall]);

    const load = useCallback(async (f: Filter) => {
        setLoading(true);
        setError(null);
        try {
            const [page, ov] = await Promise.all([
                fetchPage(f, 0),
                overview ? Promise.resolve(overview) : apiCall('/exam-space/overview').then(r => (r.ok ? r.json() : null)),
            ]);
            setItems(page.items);
            setTotal(page.total);
            if (f === 'all') setCounts(page.counts);
            if (ov) setOverview(ov);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchPage, apiCall]);

    useEffect(() => { load(filter); }, [filter, load]);

    // Counts per skill come from the unfiltered list; fetch them once when the page opens on a filter.
    useEffect(() => {
        if (filter === 'all') return;
        fetchPage('all', 0).then(p => setCounts(p.counts)).catch(() => { /* counts are informative */ });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadMore = async () => {
        setMore(true);
        try {
            const page = await fetchPage(filter, items.length);
            setItems(list => [...list, ...page.items]);
            setTotal(page.total);
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setMore(false);
        }
    };

    const allCount = SKILL_ORDER.reduce((s, k) => s + (counts[k] || 0), 0);
    const options = useMemo<{ value: Filter; label: React.ReactNode }[]>(() => [
        { value: 'all', label: <span className="cx-seg-label">All <b>{allCount}</b></span> },
        ...SKILL_ORDER.map(k => ({ value: k as Filter, label: <span className="cx-seg-label">{SKILLS[k].english} <b>{counts[k] || 0}</b></span> })),
    ], [counts, allCount]);

    const skillsBy = overview ? Object.fromEntries(overview.skills.map(s => [s.skill, s])) : {};

    return (
        <ConfigProvider theme={{ token: { colorPrimary: '#0e7490', borderRadius: 8 } }}>
            <div className="cx">
                <header className="cx-head">
                    <div className="cx-head-text">
                        <div className="cx-overline">Exam space</div>
                        <h1 className="cx-title">My results</h1>
                        <p className="cx-subtitle">Every practice you completed, with its score, level and full correction.</p>
                    </div>
                    <div className="cx-head-actions">
                        <Button type="primary" icon={<ReadOutlined />} onClick={() => navigate('/app/exam-practice')}>Practise</Button>
                    </div>
                </header>

                {/* ── Per-skill summary ── */}
                <section className="cx-summary" aria-label="Summary by skill">
                    {SKILL_ORDER.map(k => {
                        const s = (skillsBy as Record<string, Overview['skills'][number]>)[k];
                        const meta = SKILLS[k];
                        const active = filter === k;
                        return (
                            <button key={k} type="button" className={`cx-sum${active ? ' is-active' : ''}`} style={skillStyle(k)}
                                aria-pressed={active} onClick={() => setFilter(active ? 'all' : k)}>
                                <span className="cx-sum-icon" aria-hidden>{ICON[k]}</span>
                                <span className="cx-sum-main">
                                    <span className="cx-sum-name">{meta.english}</span>
                                    {s?.best ? (
                                        <span className="cx-sum-best">
                                            <b>{scoreText(s.best.score, meta.max)}</b><em>{scoreUnit(meta.max)}</em>
                                            <span className="cx-level-tag">{s.best.cefr}</span>
                                        </span>
                                    ) : <span className="cx-sum-none">No result yet</span>}
                                    <span className="cx-sum-meta">
                                        {s?.estimate ? `Estimated ${s.estimate.cefr}${s.estimate.nclc ? ` · NCLC ${s.estimate.nclc}` : ''}` : `${counts[k] || 0} results`}
                                    </span>
                                </span>
                            </button>
                        );
                    })}
                </section>

                <section className="cx-card">
                    <div className="cx-card-head cx-list-head">
                        <Segmented<Filter> value={filter} onChange={setFilter} options={options} className="cx-filter" />
                        <span className="cx-muted">{loading ? '' : `${total} ${total === 1 ? 'result' : 'results'}`}</span>
                    </div>

                    {error ? (
                        <div className="cx-alert is-inline" role="alert">
                            <WarningOutlined />
                            <div><strong>Your results could not be loaded.</strong><span>{error}</span></div>
                            <Button icon={<ReloadOutlined />} onClick={() => load(filter)}>Try again</Button>
                        </div>
                    ) : loading ? (
                        <div className="cx-card-body"><Skeleton active paragraph={{ rows: 6 }} /></div>
                    ) : items.length === 0 ? (
                        <div className="cx-empty">
                            <HistoryOutlined />
                            <strong>{filter === 'all' ? 'No result yet' : `No ${SKILLS[filter].english.toLowerCase()} result yet`}</strong>
                            <span>Complete a practice series or a simulation and it appears here with its correction.</span>
                            <Button type="primary" onClick={() => navigate(filter === 'all' ? '/app/exam-practice' : `/app/exam-practice?skill=${filter}`)}>Start practising</Button>
                        </div>
                    ) : (
                        <>
                            <div className="cx-table" role="table" aria-label="Results">
                                <div className="cx-tr is-head" role="row">
                                    <span role="columnheader">Practice</span>
                                    <span role="columnheader">Date</span>
                                    <span role="columnheader">Time</span>
                                    <span role="columnheader">Score</span>
                                    <span role="columnheader">Level</span>
                                    <span role="columnheader" aria-label="Open" />
                                </div>
                                {items.map(r => {
                                    const meta = SKILLS[r.skill];
                                    return (
                                        <button key={`${r.skill}-${r.id}`} type="button" className="cx-tr" role="row" style={skillStyle(r.skill)}
                                            onClick={() => setReview(r)}>
                                            <span className="cx-td-main" role="cell">
                                                <span className="cx-result-icon" aria-hidden>{ICON[r.skill]}</span>
                                                <span className="cx-result-main">
                                                    <span className="cx-result-title">{r.title || meta.english}</span>
                                                    <span className="cx-result-meta">{meta.english}{r.detail ? ` · ${r.detail} correct` : ''}</span>
                                                </span>
                                            </span>
                                            <span className="cx-td" role="cell" data-label="Date">{dateText(r.at)}</span>
                                            <span className="cx-td" role="cell" data-label="Time">{durationText(r.duration_seconds)}</span>
                                            <span className="cx-td cx-td-score" role="cell" data-label="Score"><b>{scoreText(r.score, r.max)}</b><em>{scoreUnit(r.max)}</em></span>
                                            <span className="cx-td" role="cell" data-label="Level">
                                                <span className="cx-level-tag">{r.cefr || '—'}</span>
                                                {r.nclc != null && <span className="cx-nclc-small">NCLC {r.nclc}</span>}
                                            </span>
                                            <span className="cx-td cx-td-go" role="cell"><RightOutlined /></span>
                                        </button>
                                    );
                                })}
                            </div>
                            {items.length < total && (
                                <div className="cx-more"><Button onClick={loadMore} loading={more}>Show {Math.min(PAGE, total - items.length)} more</Button></div>
                            )}
                        </>
                    )}
                </section>

                {review && <AttemptReview attempt={review} onClose={() => setReview(null)} />}
            </div>
        </ConfigProvider>
    );
};

export default CandidateResults;
