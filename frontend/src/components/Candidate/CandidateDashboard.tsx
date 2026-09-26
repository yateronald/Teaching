import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, ConfigProvider, Modal, Skeleton, Tooltip } from 'antd';
import {
    AimOutlined, ArrowRightOutlined, AudioOutlined, CalendarOutlined, CheckCircleFilled, ClockCircleOutlined, EditOutlined,
    FieldTimeOutlined, FormOutlined, HistoryOutlined, LockOutlined, ReadOutlined, ReloadOutlined, RightOutlined,
    SafetyCertificateOutlined, SoundOutlined, ThunderboltOutlined, TrophyOutlined, WarningOutlined,
} from '@ant-design/icons';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { useTr } from '../../utils/useTr';
import ExamGoalEditor from './ExamGoalEditor';
import {
    EXAM_LABEL, SKILLS, SKILL_ORDER, agoText, dateText, daysLeft, daysUntil, greeting, longDate, minutesText,
    nclcNote, scoreText, scoreUnit, skillFormat, skillName, skillOther, toneFor,
    type Attempt, type Goal, type Overview, type SkillKey, type SkillSummary,
} from './candidateModel';
import './Candidate.css';

/* ══════════════════════════════════════════
   EXAM SPACE — DASHBOARD (exam candidates)
   The exam goal, an estimated level per skill, what is open and until when,
   progress over time and the latest results. Scoped under .cx.
══════════════════════════════════════════ */

const ICON: Record<SkillKey, React.ReactNode> = {
    ce: <ReadOutlined />, co: <SoundOutlined />, ee: <FormOutlined />, eo: <AudioOutlined />,
};
const CATEGORY_SKILL: Record<string, SkillKey> = {
    'Compréhension Écrite': 'ce', 'Compréhension Orale': 'co', 'Expression Écrite': 'ee', 'Expression Orale': 'eo',
};
interface TreeNode { name: string; is_assigned?: boolean; is_expired?: boolean; has_assigned_children?: boolean; available_count?: number; total_count?: number }
interface Availability { open: boolean; available: number; total: number; endsIn: number | null; ended: boolean }

const skillStyle = (k: SkillKey) => ({ '--sk': SKILLS[k].color, '--sk-soft': SKILLS[k].soft, '--sk-line': SKILLS[k].line } as React.CSSProperties);

/* ── Small pieces ── */
const Sparkline: React.FC<{ points: SkillSummary['trend']; color: string }> = ({ points, color }) => {
    if (points.length < 2) return <div className="cx-spark is-empty" aria-hidden />;
    const w = 120, h = 34, pad = 3;
    const xs = points.map((_, i) => pad + (i * (w - pad * 2)) / (points.length - 1));
    const ys = points.map(p => h - pad - ((p.percent ?? 0) / 100) * (h - pad * 2));
    const d = xs.map((x, i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
    return (
        <svg className="cx-spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" role="img" aria-label="Recent scores">
            <path d={`${d} L${xs[xs.length - 1]},${h} L${xs[0]},${h} Z`} fill={color} opacity="0.08" />
            <path d={d} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r="2.6" fill={color} />
        </svg>
    );
};

const NclcScale: React.FC<{ value: number | null; target: number | null }> = ({ value, target }) => {
    const pos = (n: number) => `${((Math.min(10, Math.max(3, n)) - 3) / 7) * 100}%`;
    return (
        <div className="cx-scale" aria-hidden>
            <div className="cx-scale-track">
                {value != null && <span className="cx-scale-fill" style={{ width: pos(value) }} />}
                {target != null && <span className="cx-scale-target" style={{ left: pos(target) }} />}
            </div>
            <div className="cx-scale-ticks">{[4, 5, 6, 7, 8, 9, 10].map(n => <span key={n} style={{ left: pos(n) }}>{n}</span>)}</div>
        </div>
    );
};

const ChartTip: React.FC<{ active?: boolean; payload?: { payload: { t: number; v: number; score: number; skill: SkillKey } }[] }> = ({ active, payload }) => {
    const { lang, locale } = useTr();
    if (!active || !payload?.length) return null;
    const p = payload[0].payload;
    const s = SKILLS[p.skill];
    return (
        <div className="cx-chart-tip">
            <span className="cx-dot" style={{ background: s.color }} />
            <div>
                <strong>{skillName(p.skill, lang)} · {p.v}%</strong>
                <span>{scoreText(p.score, s.max)} {scoreUnit(s.max)} · {dateText(new Date(p.t).toISOString(), true, locale)}</span>
            </div>
        </div>
    );
};

const ProgressChart: React.FC<{ skills: SkillSummary[] }> = ({ skills }) => {
    const { tr, lang, locale } = useTr();
    const [hidden, setHidden] = useState<SkillKey[]>([]);
    const series = skills
        .filter(s => s.trend.length)
        .map(s => ({ skill: s.skill, data: s.trend.map(p => ({ t: new Date(p.at).getTime(), v: p.percent, score: p.score, skill: s.skill })) }));
    const all = series.flatMap(s => s.data.map(d => d.t));
    if (all.length < 2) {
        return <div className="cx-empty-note">{tr('Your progress curve appears after two results. Every practice counts.', 'Votre courbe de progression apparaît après deux résultats. Chaque entraînement compte.')}</div>;
    }
    let min = Math.min(...all), max = Math.max(...all);
    if (min === max) { min -= 86_400_000; max += 86_400_000; }
    return (
        <>
            <div className="cx-legend" role="group" aria-label={tr('Show skills', 'Afficher les compétences')}>
                {series.map(s => {
                    const off = hidden.includes(s.skill);
                    return (
                        <button key={s.skill} type="button" className={`cx-legend-item${off ? ' is-off' : ''}`} aria-pressed={!off}
                            onClick={() => setHidden(h => (off ? h.filter(k => k !== s.skill) : [...h, s.skill]))}>
                            <span className="cx-dot" style={{ background: SKILLS[s.skill].color }} />{skillName(s.skill, lang)}
                        </button>
                    );
                })}
            </div>
            <div className="cx-chart">
                <ResponsiveContainer width="100%" height={230}>
                    <LineChart margin={{ top: 8, right: 12, bottom: 0, left: -14 }}>
                        <CartesianGrid stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="t" type="number" scale="time" domain={[min, max]} allowDuplicatedCategory={false}
                            tickFormatter={t => dateText(new Date(t).toISOString(), false, locale)} tick={{ fontSize: 11, fill: '#94a3b8' }}
                            axisLine={false} tickLine={false} minTickGap={28} />
                        <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={v => `${v}%`}
                            tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={48} />
                        <ChartTooltip content={<ChartTip />} cursor={{ stroke: '#e2e8f0' }} />
                        {series.filter(s => !hidden.includes(s.skill)).map(s => (
                            <Line key={s.skill} data={s.data} dataKey="v" name={skillName(s.skill, lang)} type="monotone"
                                stroke={SKILLS[s.skill].color} strokeWidth={2} dot={{ r: 3, strokeWidth: 1.5, fill: '#fff' }}
                                activeDot={{ r: 5 }} isAnimationActive={false} />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </>
    );
};

/* ══════════════════════════════════════════ */
const CandidateDashboard: React.FC = () => {
    const { apiCall, user } = useAuth();
    const { tr, lang, locale } = useTr();
    const navigate = useNavigate();
    const [data, setData] = useState<Overview | null>(null);
    // Company learners get their content from their company; others from the school's administrator.
    const opener = user?.organization ? tr('your company', 'votre entreprise') : tr('your administrator', 'votre administrateur');
    const Opener = opener.charAt(0).toUpperCase() + opener.slice(1);
    const [tree, setTree] = useState<TreeNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [goalOpen, setGoalOpen] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [ov, tree] = await Promise.all([apiCall('/exam-space/overview'), apiCall('/tcf/student/content-tree')]);
            if (!ov.ok) throw new Error((await ov.json().catch(() => ({}))).error || '');
            setData(await ov.json());
            setTree(tree.ok ? await tree.json() : []);
        } catch (e) {
            setError((e as Error).message || '');
        } finally {
            setLoading(false);
        }
    }, [apiCall]);

    useEffect(() => { load(); }, [load]);

    /** Per skill: is anything open, how much, and does access end soon. */
    const availability = useMemo(() => {
        const out = {} as Record<SkillKey, Availability>;
        SKILL_ORDER.forEach(k => {
            const node = tree.find(n => CATEGORY_SKILL[n.name] === k);
            const open = !!node && (!!node.has_assigned_children || (!!node.is_assigned && !node.is_expired)) && (node.available_count ?? 0) > 0;
            const items = data?.access.items.filter(i => i.skill === k) || [];
            const ends = items.filter(i => i.active && i.expires_at).map(i => daysLeft(i.expires_at)!).sort((a, b) => a - b);
            out[k] = {
                open,
                available: node?.available_count ?? 0,
                total: node?.total_count ?? 0,
                endsIn: open && ends.length ? ends[0] : null,
                ended: !open && items.length > 0 && items.every(i => !i.active),
            };
        });
        return out;
    }, [tree, data]);

    const firstName = user?.first_name || '';
    const goal: Goal | null = data?.goal ?? null;
    const examIn = daysUntil(goal?.exam_date);
    const target = goal?.target_nclc ?? null;

    if (loading && !data) {
        return (
            <div className="cx" aria-busy="true">
                <Skeleton active title={{ width: 260 }} paragraph={{ rows: 1 }} />
                <div className="cx-hero is-loading"><Skeleton active paragraph={{ rows: 3 }} /></div>
                <div className="cx-skills">{SKILL_ORDER.map(k => <div key={k} className="cx-skill is-loading"><Skeleton active paragraph={{ rows: 4 }} /></div>)}</div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="cx">
                <div className="cx-alert" role="alert">
                    <WarningOutlined />
                    <div><strong>{tr('Your dashboard could not be loaded.', 'Votre tableau de bord n’a pas pu être chargé.')}</strong><span>{error}</span></div>
                    <Button icon={<ReloadOutlined />} onClick={load}>{tr('Try again', 'Réessayer')}</Button>
                </div>
            </div>
        );
    }

    const skillsBy = Object.fromEntries(data.skills.map(s => [s.skill, s])) as Record<SkillKey, SkillSummary>;
    const openSkills = SKILL_ORDER.filter(k => availability[k].open).length;
    const subtitle = examIn == null
        ? tr('Practise the four skills of the exam in real conditions and follow your level as you go.', 'Entraînez-vous aux quatre compétences de l’examen en conditions réelles et suivez votre niveau au fil du temps.')
        : examIn > 1 ? tr(`Your exam is in ${examIn} days. Keep every skill moving.`, `Votre examen est dans ${examIn} jours. Faites progresser chaque compétence.`)
            : examIn === 1 ? tr('Your exam is tomorrow. Rest well — bonne chance !', 'Votre examen est demain. Reposez-vous bien — bonne chance !')
                : examIn === 0 ? tr('Your exam is today. Bonne chance !', 'Votre examen est aujourd’hui. Bonne chance !')
                    : tr('Your exam date has passed. Update your goal if you are sitting it again.', 'La date de votre examen est passée. Mettez à jour votre objectif si vous le repassez.');
    const endingSoon = data.access.items.filter(i => i.active && i.expires_at && (daysLeft(i.expires_at) ?? 99) <= 7);
    const activeItems = data.access.items.filter(i => i.active);
    const endedItems = data.access.items.filter(i => !i.active);
    const weakest = data.level.weakest ? SKILLS[data.level.weakest] : null;

    return (
        <ConfigProvider theme={{ token: { colorPrimary: '#0e7490', borderRadius: 8 } }}>
            <div className="cx">
                {/* ── Greeting ── */}
                <header className="cx-head">
                    <div className="cx-head-text">
                        <div className="cx-overline">{user?.organization ? user.organization.name : tr('Exam space', 'Espace examen')} · {EXAM_LABEL[goal?.target_exam || 'tcf_canada']}</div>
                        <h1 className="cx-title">{greeting(new Date(), tr)}{firstName ? `, ${firstName}` : ''}</h1>
                        <p className="cx-subtitle">{subtitle}</p>
                    </div>
                    <div className="cx-head-actions">
                        <Button icon={<TrophyOutlined />} onClick={() => navigate('/app/exam-results')}>{tr('My results', 'Mes résultats')}</Button>
                        <Button type="primary" icon={<ReadOutlined />} onClick={() => navigate('/app/exam-practice')}>{tr('Practise now', 'S’entraîner')}</Button>
                    </div>
                </header>

                {endingSoon.length > 0 && (
                    <div className="cx-notice" role="status">
                        <ClockCircleOutlined />
                        <span>
                            <strong>{tr(`${endingSoon.length} practice item${endingSoon.length === 1 ? ' closes' : 's close'} soon.`, `${endingSoon.length} entraînement${endingSoon.length === 1 ? ' se ferme' : 's se ferment'} bientôt.`)}</strong>{' '}
                            {endingSoon.slice(0, 2).map(i => `${i.name} (${dateText(i.expires_at, false, locale)})`).join(', ')}
                            {endingSoon.length > 2 ? tr(` and ${endingSoon.length - 2} more`, ` et ${endingSoon.length - 2} autre(s)`) : ''}. {tr(`Ask ${opener} if you need more time.`, `Demandez à ${opener} si vous avez besoin de plus de temps.`)}
                        </span>
                    </div>
                )}

                {/* ── Goal hero ── */}
                <section className="cx-hero" aria-label={tr('Your exam goal', 'Votre objectif d’examen')}>
                    <div className="cx-hero-block cx-countdown">
                        <span className="cx-hero-label"><CalendarOutlined /> {tr('Exam day', 'Jour de l’examen')}</span>
                        {examIn != null && examIn >= 0 ? (
                            <>
                                <div className="cx-countdown-value"><b>{examIn}</b><span>{examIn === 1 ? tr('day left', 'jour restant') : tr('days left', 'jours restants')}</span></div>
                                <span className="cx-hero-note">{longDate(goal?.exam_date, locale)}</span>
                            </>
                        ) : (
                            <>
                                <div className="cx-countdown-value is-empty">{examIn != null ? tr('Passed', 'Passé') : tr('Not set', 'Non défini')}</div>
                                <button type="button" className="cx-hero-link" onClick={() => setGoalOpen(true)}>
                                    {examIn != null ? tr('Update your exam date', 'Modifier la date d’examen') : tr('Add your exam date', 'Ajouter la date d’examen')} <RightOutlined />
                                </button>
                            </>
                        )}
                    </div>

                    <div className="cx-hero-block cx-level">
                        <span className="cx-hero-label"><SafetyCertificateOutlined /> {tr('Estimated level', 'Niveau estimé')}</span>
                        <div className="cx-level-row">
                            <div className="cx-level-value">
                                {data.level.nclc != null ? <><b>NCLC {data.level.nclc}</b><span>{tr('lowest of your four skills', 'la plus faible de vos quatre compétences')}</span></>
                                    : data.level.below_4 ? <><b>{tr('Below NCLC 4', 'Sous NCLC 4')}</b><span>{tr('lowest of your four skills', 'la plus faible de vos quatre compétences')}</span></>
                                        : <><b className="is-empty">—</b><span>{tr(`${data.level.skills_measured}/4 skills measured`, `${data.level.skills_measured}/4 compétences évaluées`)}</span></>}
                            </div>
                            <div className="cx-level-target">
                                <span>{tr('Target', 'Objectif')}</span>
                                <b>{target ? `NCLC ${target}` : '—'}</b>
                            </div>
                        </div>
                        <NclcScale value={data.level.nclc} target={target} />
                        <span className="cx-hero-note">
                            {data.level.nclc == null && !data.level.below_4
                                ? tr('Practise all four skills to see your overall level.', 'Entraînez-vous aux quatre compétences pour voir votre niveau global.')
                                : target && data.level.nclc != null && data.level.nclc >= target ? tr('You are at your target level. Keep it steady on exam day.', 'Vous êtes à votre niveau cible. Gardez le cap jusqu’au jour J.')
                                    : weakest ? tr(`Your ${weakest.english.toLowerCase()} decides your level for now — start there.`, `Votre niveau en ${weakest.french.toLowerCase()} détermine votre niveau pour l’instant — commencez par là.`) : ''}
                        </span>
                    </div>

                    <div className="cx-hero-block cx-hero-stats">
                        <div><b>{data.activity.total}</b><span>{tr('results', 'résultats')}</span></div>
                        <div><b>{data.activity.last_30_days}</b><span>{tr('last 30 days', '30 derniers jours')}</span></div>
                        <div><b>{minutesText(data.activity.minutes)}</b><span>{tr('practised', 'd’entraînement')}</span></div>
                        <button type="button" className="cx-hero-edit" onClick={() => setGoalOpen(true)}>
                            <EditOutlined /> {goal?.target_nclc || goal?.exam_date ? tr('Edit my goal', 'Modifier mon objectif') : tr('Set my goal', 'Définir mon objectif')}
                        </button>
                    </div>
                </section>

                {/* ── Skills ── */}
                <section aria-label={tr('Your four skills', 'Vos quatre compétences')}>
                    <div className="cx-section-head">
                        <h2>{tr('Your four skills', 'Vos quatre compétences')}</h2>
                        <span>{tr(`${openSkills}/4 open to you · levels estimated from your three latest results`, `${openSkills}/4 ouvertes · niveaux estimés à partir de vos trois derniers résultats`)}</span>
                    </div>
                    <div className="cx-skills">
                        {SKILL_ORDER.map(k => {
                            const s = skillsBy[k];
                            const meta = SKILLS[k];
                            const a = availability[k];
                            const est = s?.estimate;
                            const tone = toneFor(est?.nclc, target);
                            const gap = target && est?.nclc != null ? target - est.nclc : null;
                            return (
                                <article key={k} className={`cx-skill${a.open ? '' : ' is-locked'}`} style={skillStyle(k)}>
                                    <div className="cx-skill-top">
                                        <span className="cx-skill-icon" aria-hidden>{ICON[k]}</span>
                                        <div className="cx-skill-name">
                                            <strong>{skillName(k, lang)}</strong>
                                            <span>{skillOther(k, lang)}</span>
                                        </div>
                                        {a.open ? (
                                            a.endsIn != null && a.endsIn <= 7
                                                ? <span className="cx-state is-warn"><ClockCircleOutlined /> {a.endsIn <= 0 ? tr('Ends today', 'Se termine aujourd’hui') : tr(`${a.endsIn} d left`, `${a.endsIn} j restants`)}</span>
                                                : <span className="cx-state is-open"><CheckCircleFilled /> {tr('Open', 'Ouvert')}</span>
                                        ) : <span className="cx-state"><LockOutlined /> {a.ended ? tr('Ended', 'Terminé') : tr('Locked', 'Verrouillé')}</span>}
                                    </div>

                                    <div className="cx-skill-level">
                                        {est ? (
                                            <>
                                                <b>{est.cefr}</b>
                                                <span className={`cx-nclc is-${tone}`}>{est.nclc != null ? `NCLC ${est.nclc}` : tr('Below NCLC 4', 'Sous NCLC 4')}</span>
                                            </>
                                        ) : <span className="cx-skill-none">{tr('No result yet', 'Aucun résultat')}</span>}
                                        <Sparkline points={s?.trend || []} color={meta.color} />
                                    </div>

                                    <dl className="cx-skill-facts">
                                        <div><dt>{tr('Best', 'Meilleur')}</dt><dd>{s?.best ? <>{scoreText(s.best.score, meta.max)}<em> {scoreUnit(meta.max)}</em></> : '—'}</dd></div>
                                        <div><dt>{tr('Results', 'Résultats')}</dt><dd>{s?.attempts ?? 0}</dd></div>
                                        <div><dt>{tr('Last', 'Dernier')}</dt><dd>{s?.last_at ? agoText(s.last_at, tr, locale) : '—'}</dd></div>
                                    </dl>

                                    <div className="cx-skill-foot">
                                        <span className="cx-skill-hint">
                                            {!a.open ? (a.ended ? tr('Your access has ended', 'Votre accès est terminé') : tr('Not opened to you yet', 'Pas encore ouvert'))
                                                : gap == null ? (a.total ? tr(`${a.available} of ${a.total} section${a.total === 1 ? '' : 's'} open`, `${a.available} section(s) ouverte(s) sur ${a.total}`) : skillFormat(k, lang))
                                                    : gap <= 0 ? <><AimOutlined /> {tr('On target', 'Objectif atteint')}</> : tr(`${gap} level${gap > 1 ? 's' : ''} to your target`, `${gap} niveau${gap > 1 ? 'x' : ''} avant votre objectif`)}
                                        </span>
                                        <Button size="small" type={a.open ? 'primary' : 'default'} ghost={a.open} disabled={!a.open}
                                            onClick={() => navigate(`/app/exam-practice?skill=${k}`)}>
                                            {tr('Practise', 'S’entraîner')} <ArrowRightOutlined />
                                        </Button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </section>

                {/* ── Progress, access, results, credits ── */}
                <div className="cx-grid">
                    <div className="cx-col">
                        <section className="cx-card">
                            <div className="cx-card-head">
                                <div><h2 className="cx-card-title">{tr('Progress', 'Progression')}</h2><div className="cx-card-sub">{tr('Score of each result, as a share of the maximum', 'Score de chaque résultat, en part du maximum')}</div></div>
                            </div>
                            <div className="cx-card-body"><ProgressChart skills={data.skills} /></div>
                        </section>

                        <section className="cx-card">
                            <div className="cx-card-head">
                                <div><h2 className="cx-card-title">{tr('Latest results', 'Derniers résultats')}</h2><div className="cx-card-sub">{tr('Open a result to read its correction', 'Ouvrez un résultat pour lire sa correction')}</div></div>
                                <button type="button" className="cx-link" onClick={() => navigate('/app/exam-results')}>{tr('All results', 'Tous les résultats')} <RightOutlined /></button>
                            </div>
                            {data.recent.length === 0 ? (
                                <div className="cx-empty">
                                    <HistoryOutlined />
                                    <strong>{tr('No result yet', 'Aucun résultat pour l’instant')}</strong>
                                    <span>{tr('Finish a practice series or simulation and your score appears here.', 'Terminez une série ou une simulation et votre score apparaîtra ici.')}</span>
                                    <Button type="primary" onClick={() => navigate('/app/exam-practice')}>{tr('Start practising', 'Commencer à s’entraîner')}</Button>
                                </div>
                            ) : (
                                <ul className="cx-results">
                                    {data.recent.map((r: Attempt) => {
                                        return (
                                            <li key={`${r.skill}-${r.id}`}>
                                                <button type="button" className="cx-result" style={skillStyle(r.skill)}
                                                    onClick={() => navigate(`/app/exam-results?open=${r.skill}-${r.id}`)}>
                                                    <span className="cx-result-icon" aria-hidden>{ICON[r.skill]}</span>
                                                    <span className="cx-result-main">
                                                        <span className="cx-result-title">{r.title || skillName(r.skill, lang)}</span>
                                                        <span className="cx-result-meta">{skillName(r.skill, lang)} · {agoText(r.at, tr, locale)}</span>
                                                    </span>
                                                    <span className="cx-result-score">
                                                        <b>{scoreText(r.score, r.max)}</b><em>{scoreUnit(r.max)}</em>
                                                    </span>
                                                    <span className="cx-level-tag">{r.cefr || '—'}</span>
                                                    <RightOutlined className="cx-chev" />
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </section>
                    </div>

                    <div className="cx-col">
                        <section className="cx-card">
                            <div className="cx-card-head">
                                <div><h2 className="cx-card-title">{tr('Your access', 'Votre accès')}</h2><div className="cx-card-sub">{tr(`Opened by ${opener}`, `Ouvert par ${opener}`)}</div></div>
                                <span className="cx-count">{activeItems.length}</span>
                            </div>
                            {activeItems.length === 0 ? (
                                <div className="cx-empty">
                                    <LockOutlined />
                                    <strong>{tr('Nothing is open yet', 'Rien n’est ouvert pour l’instant')}</strong>
                                    <span>{tr(`${Opener} opens the practice content included in your preparation.`, `${Opener} ouvre les entraînements inclus dans votre préparation.`)}</span>
                                </div>
                            ) : (
                                <ul className="cx-access">
                                    {activeItems.slice(0, 8).map(i => {
                                        const left = daysLeft(i.expires_at);
                                        return (
                                            <li key={`${i.type}-${i.id}`} style={i.skill ? skillStyle(i.skill) : undefined}>
                                                <span className="cx-access-dot" aria-hidden />
                                                <span className="cx-access-main">
                                                    <strong>{i.type === 'category' && i.skill ? tr(`All ${SKILLS[i.skill].english.toLowerCase()} practice`, `Tout l’entraînement en ${SKILLS[i.skill].french.toLowerCase()}`) : i.name}</strong>
                                                    <span>{i.skill ? skillName(i.skill, lang) : tr('Practice', 'Entraînement')}</span>
                                                </span>
                                                <span className={`cx-access-end${left != null && left <= 7 ? ' is-warn' : ''}`}>
                                                    {i.expires_at ? <>{tr('until', 'jusqu’au')} {dateText(i.expires_at, false, locale)}</> : tr('No end date', 'Sans date de fin')}
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                            {(activeItems.length > 8 || endedItems.length > 0) && (
                                <div className="cx-card-foot">
                                    {activeItems.length > 8 && <span>{tr(`+${activeItems.length - 8} more open`, `+${activeItems.length - 8} autre(s) ouvert(s)`)}</span>}
                                    {endedItems.length > 0 && (
                                        <Tooltip title={endedItems.slice(0, 8).map(i => `${i.name} — ${tr('ended', 'terminé le')} ${dateText(i.expires_at, true, locale)}`).join(' · ')}>
                                            <span className="cx-muted">{tr(`${endedItems.length} item${endedItems.length === 1 ? '' : 's'} ended`, `${endedItems.length} terminé(s)`)}</span>
                                        </Tooltip>
                                    )}
                                </div>
                            )}
                        </section>

                        {data.credits && (
                            <section className="cx-card">
                                <div className="cx-card-head">
                                    <div><h2 className="cx-card-title"><ThunderboltOutlined /> {tr('AI correction credits', 'Crédits de correction IA')}</h2><div className="cx-card-sub">{tr('One credit per new writing or speaking simulation', 'Un crédit par nouvelle simulation d’expression écrite ou orale')}</div></div>
                                </div>
                                <div className="cx-credits">
                                    {(['ee', 'eo'] as const).map(k => {
                                        const n = data.credits![k];
                                        return (
                                            <div key={k} className={`cx-credit${n <= 0 ? ' is-empty' : ''}`} style={skillStyle(k)}>
                                                <span className="cx-credit-icon" aria-hidden>{ICON[k]}</span>
                                                <div><b>{n}</b><span>{skillName(k, lang)}</span></div>
                                            </div>
                                        );
                                    })}
                                </div>
                                {(data.credits.ee <= 0 || data.credits.eo <= 0) && (
                                    <div className="cx-card-foot"><span className="cx-muted">{tr(`Out of credits? ${Opener} can add more.`, `Plus de crédits ? ${Opener} peut en ajouter.`)}</span></div>
                                )}
                            </section>
                        )}

                        <section className="cx-card cx-guide">
                            <div className="cx-card-head">
                                <div><h2 className="cx-card-title"><FieldTimeOutlined /> {tr('How your level is read', 'Comment lire votre niveau')}</h2></div>
                            </div>
                            <ul className="cx-guide-list">
                                {lang === 'fr' ? <>
                                    <li><b>Compréhension écrite et orale</b> sont notées sur 699 points, de A1 à C2.</li>
                                    <li><b>Expression écrite et orale</b> sont notées sur 20, selon la grille officielle.</li>
                                    <li>Le Canada lit chaque compétence en <b>niveau NCLC</b> ; la plupart des programmes regardent votre compétence la <b>plus faible</b>.</li>
                                </> : <>
                                    <li><b>Reading &amp; listening</b> are scored out of 699 points, from A1 to C2.</li>
                                    <li><b>Writing &amp; speaking</b> are scored out of 20, on the official grid.</li>
                                    <li>Canada reads each skill as an <b>NCLC level</b>; most programmes look at your <b>lowest</b> skill.</li>
                                </>}
                                {target && nclcNote(target, lang) && <li>{tr('Your target', 'Votre objectif')}, <b>NCLC {target}</b> : {nclcNote(target, lang)}.</li>}
                            </ul>
                        </section>
                    </div>
                </div>

                <Modal
                    open={goalOpen}
                    onCancel={() => setGoalOpen(false)}
                    footer={null}
                    destroyOnHidden
                    centered
                    width={520}
                    title={<div className="cx-modal-title"><AimOutlined /> {tr('My exam goal', 'Mon objectif d’examen')}</div>}
                    rootClassName="cx-modal"
                >
                    <p className="cx-modal-lead">{tr('Everything in your exam space is measured against this goal.', 'Tout votre espace examen se mesure à cet objectif.')}</p>
                    <ExamGoalEditor
                        goal={goal}
                        onCancel={() => setGoalOpen(false)}
                        onSaved={g => { setData(d => (d ? { ...d, goal: g } : d)); setGoalOpen(false); }}
                    />
                </Modal>
            </div>
        </ConfigProvider>
    );
};

export default CandidateDashboard;
