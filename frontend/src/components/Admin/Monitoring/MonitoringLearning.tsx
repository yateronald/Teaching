import React from 'react';
import { Empty, Table, Tag, Tooltip } from 'antd';
import {
    BookOutlined, CheckCircleOutlined, ClockCircleOutlined, FlagOutlined, NotificationOutlined, ReadOutlined,
    RiseOutlined, TrophyOutlined,
} from '@ant-design/icons';
import { Area, Bar, CartesianGrid, ComposedChart, ResponsiveContainer, Tooltip as ReTooltip, XAxis, YAxis } from 'recharts';
import { BarList, Delta } from './MonitoringOverview';
import {
    CATEGORY_LABEL, CHANNEL_COLOR, CHANNEL_LABEL, PAGE_KIND_LABEL, axisLabel, compact, countryName, duration, flag, fromId,
    type Learning, type LearningCourse, type LearningLesson,
} from './monitoringModel';

/* The free courses: who learns, which courses and lessons they open, how long
   they stay, how far they get — and what that brings to the campaigns. */

const title = (row: { title_en: string | null; title_fr: string | null }, id: string) => row.title_en || row.title_fr || fromId(id);
const pctText = (v: number | null | undefined) => (v === null || v === undefined ? '—' : `${v}%`);
const minutes = (m: number | null | undefined) => (m ? duration(m * 60) : '—');

const FUNNEL_LABEL: Record<Learning['funnel'][number]['step'], string> = {
    learners: 'Visited the free courses',
    course: 'Opened a course',
    started: 'Started a lesson',
    finished: 'Finished a lesson',
    final: 'Passed a final assessment',
};

const Kpi: React.FC<{ label: string; hint: string; value: React.ReactNode; delta?: React.ReactNode; sub?: React.ReactNode; icon: React.ReactNode }> = ({ label, hint, value, delta, sub, icon }) => (
    <div className="mon-kpi">
        <Tooltip title={hint}><span className="mon-kpi-label">{icon} {label}</span></Tooltip>
        <strong>{value}</strong>
        {delta}
        {sub && <small className="mon-kpi-sub">{sub}</small>}
    </div>
);

const MonitoringLearning: React.FC<{ data: Learning | null }> = ({ data }) => {
    if (!data) return null;
    const { kpis: k, series, funnel, courses, categories, lessons, games, levels, page_kinds: kinds, arrivals, entry_pages: entries, countries, devices, promotions } = data;
    const bucket = data.range?.bucket || 'day';
    const chart = series.map(p => ({ ...p, label: axisLabel(p.at, bucket) }));
    const arrived = arrivals.reduce((t, a) => t + a.visits, 0) || 1;
    // Lessons people give up on: tried often, finished rarely or with a low score.
    const hardest = lessons
        .filter(l => l.starts >= 3 && l.completion_rate !== null)
        .sort((a, b) => (a.completion_rate ?? 0) - (b.completion_rate ?? 0) || (a.avg_score ?? 100) - (b.avg_score ?? 100))
        .slice(0, 8);
    const levelTotal = levels.reduce((t, l) => t + l.tests, 0) || 1;

    return (
        <div className="mon-body">
            {!data.events && (
                <div className="mon-card mon-notice">
                    <FlagOutlined />
                    <div>
                        <strong>Lessons, assessments and games are not recorded yet</strong>
                        <p>
                            The figures below come from the pages of the free courses. Run the migration on the server to
                            add each course, the lessons started and finished, scores, time per lesson and games:
                        </p>
                        <code>node backend/database/run-learning-analytics-migration.js</code>
                    </div>
                </div>
            )}

            {/* ── The numbers ── */}
            <section className="mon-kpis">
                <Kpi
                    icon={<ReadOutlined />} label="Learners"
                    hint="People who opened at least one page of the free courses (counted once a day each)."
                    value={compact(k.learners)}
                    delta={<Delta value={k.change.learners} />}
                    sub={`${k.share_of_visitors}% of the site's visitors`}
                />
                <Kpi
                    icon={<ClockCircleOutlined />} label="Time per learner"
                    hint="Time the pages of the free courses were on screen, divided by the learners."
                    value={minutes(k.minutes_per_learner)}
                    delta={<Delta value={k.change.minutes_per_learner} />}
                    sub={`${k.hours_total} h in total`}
                />
                <Kpi
                    icon={<BookOutlined />} label="Lessons finished"
                    hint="Lessons played to the end (every attempt counts)."
                    value={compact(k.lessons_finished)}
                    delta={<Delta value={k.change.lessons_finished} />}
                    sub={`${compact(k.lessons_started)} started`}
                />
                <Kpi
                    icon={<CheckCircleOutlined />} label="Completion"
                    hint="Lessons finished out of lessons started. Compared with the previous period in points."
                    value={pctText(k.completion_rate)}
                    delta={<Delta value={k.change.completion_points} points />}
                    sub={k.avg_lesson_minutes ? `${minutes(k.avg_lesson_minutes)} per lesson` : undefined}
                />
                <Kpi
                    icon={<RiseOutlined />} label="Average score"
                    hint="The average score of the lessons finished."
                    value={pctText(k.avg_score)}
                    sub={`${compact(k.games_played)} games played`}
                />
                <Kpi
                    icon={<TrophyOutlined />} label="Final assessments"
                    hint="Final assessments passed, out of those taken."
                    value={`${compact(k.finals_passed)} / ${compact(k.finals_taken)}`}
                    sub={`${compact(k.placement_tests)} level tests`}
                />
            </section>

            {/* ── Over time ── */}
            <section className="mon-card mon-chart">
                <header>
                    <h3>Learners and lessons</h3>
                    <span>{data.range?.label}</span>
                </header>
                {chart.some(p => p.learners || p.lessons) ? (
                    <ResponsiveContainer width="100%" height={250}>
                        <ComposedChart data={chart} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                            <defs>
                                <linearGradient id="monLearners" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#0e9f6e" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#0e9f6e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#eef0f4" vertical={false} />
                            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} minTickGap={24} />
                            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} width={44} allowDecimals={false} />
                            <ReTooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} labelStyle={{ fontWeight: 600 }} />
                            <Bar dataKey="lessons" name="Lessons finished" fill="#4f46e5" radius={[3, 3, 0, 0]} maxBarSize={22} />
                            <Area type="monotone" dataKey="learners" name="Learners" stroke="#0e9f6e" strokeWidth={2} fill="url(#monLearners)" />
                        </ComposedChart>
                    </ResponsiveContainer>
                ) : (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Nobody in the free courses in this period yet." />
                )}
            </section>

            <div className="mon-grid">
                {/* ── How far learners get ── */}
                {!!funnel.length && (
                    <section className="mon-card">
                        <header><h3>How far learners get</h3><span>people, in this period</span></header>
                        <ul className="mon-funnel">
                            {funnel.map((step, i) => {
                                const first = funnel[0].value || 1;
                                const share = Math.round((step.value / first) * 100);
                                const prev = i ? funnel[i - 1].value : 0;
                                return (
                                    <li key={step.step}>
                                        <span className="mon-funnel-bar" style={{ width: `${Math.max(2, Math.min(100, share))}%` }} aria-hidden="true" />
                                        <span className="mon-funnel-label">{FUNNEL_LABEL[step.step]}</span>
                                        <b>{compact(step.value)}</b>
                                        <em>{i ? `${share}%` : ''}</em>
                                        {i > 0 && prev > 0 && (
                                            <Tooltip title="Of the step before">
                                                <small>{Math.round((step.value / prev) * 100)}% ↓</small>
                                            </Tooltip>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </section>
                )}

                {/* ── What they read ── */}
                <section className="mon-card">
                    <header><h3>Where learners go</h3><span>page views · time on screen</span></header>
                    <BarList
                        total={kinds.reduce((t, p) => t + p.views, 0) || 1}
                        rows={kinds.map(p => ({ label: PAGE_KIND_LABEL[p.kind] || p.kind, sub: p.avg_seconds ? duration(p.avg_seconds) : undefined, value: p.views }))}
                        empty={data.detailed ? 'Nothing yet.' : 'Available once the migration has run.'}
                    />
                </section>
            </div>

            {/* ── Courses ── */}
            <section className="mon-card">
                <header><h3><BookOutlined /> Most followed courses</h3><span>by learners</span></header>
                {courses.length ? (
                    <Table<LearningCourse>
                        size="small"
                        pagination={courses.length > 10 ? { pageSize: 10, size: 'small' } : false}
                        rowKey="course"
                        dataSource={courses}
                        scroll={{ x: 1060 }}
                        columns={[
                            {
                                title: 'Course', key: 'course', ellipsis: true, width: 260, fixed: 'left',
                                render: (_, c) => (
                                    <span className="mon-course">
                                        <b>{title(c, c.course)}</b>
                                        {c.category && <Tag className="mon-method">{CATEGORY_LABEL[c.category] || c.category}</Tag>}
                                    </span>
                                ),
                            },
                            { title: 'Learners', dataIndex: 'learners', width: 90, align: 'right', sorter: (a, b) => a.learners - b.learners, defaultSortOrder: 'descend' },
                            { title: 'Pages', dataIndex: 'views', width: 80, align: 'right', sorter: (a, b) => a.views - b.views, render: compact },
                            { title: 'Time / learner', dataIndex: 'minutes_per_learner', width: 115, align: 'right', sorter: (a, b) => a.minutes_per_learner - b.minutes_per_learner, render: minutes },
                            { title: 'Lessons started', dataIndex: 'lessons_started', width: 120, align: 'right', sorter: (a, b) => a.lessons_started - b.lessons_started },
                            { title: 'Finished', dataIndex: 'lessons_finished', width: 90, align: 'right', sorter: (a, b) => a.lessons_finished - b.lessons_finished },
                            {
                                title: 'Completion', dataIndex: 'completion_rate', width: 100, align: 'right',
                                sorter: (a, b) => (a.completion_rate ?? -1) - (b.completion_rate ?? -1),
                                render: (v: number | null) => <span className={v !== null && v < 40 ? 'is-bad' : undefined}>{pctText(v)}</span>,
                            },
                            { title: 'Score', dataIndex: 'avg_score', width: 75, align: 'right', render: pctText },
                            {
                                title: 'Final passed', key: 'final', width: 100, align: 'right',
                                render: (_, c) => (c.finals_taken ? `${c.finals_passed} / ${c.finals_taken}` : '—'),
                            },
                        ]}
                    />
                ) : (
                    <p className="mon-none">
                        {data.detailed ? 'No course opened in this period yet.' : 'The list of courses appears once the migration has run.'}
                    </p>
                )}
            </section>

            <div className="mon-grid">
                {/* ── Lessons ── */}
                <section className="mon-card">
                    <header><h3>Most played lessons</h3><span>started · finished · score</span></header>
                    {lessons.length ? (
                        <Table<LearningLesson>
                            size="small"
                            pagination={lessons.length > 8 ? { pageSize: 8, size: 'small' } : false}
                            rowKey={(l) => `${l.course}/${l.item}`}
                            dataSource={lessons}
                            scroll={{ x: 560 }}
                            columns={[
                                {
                                    title: 'Lesson', key: 'lesson', ellipsis: true, width: 230,
                                    render: (_, l) => (
                                        <span className="mon-course">
                                            <b>{title(l, l.item)}</b>
                                            <small>{l.course_title_en || l.course_title_fr || fromId(l.course)}</small>
                                        </span>
                                    ),
                                },
                                { title: 'Started', dataIndex: 'starts', width: 75, align: 'right' },
                                { title: 'Finished', dataIndex: 'finishes', width: 80, align: 'right' },
                                { title: 'Score', dataIndex: 'avg_score', width: 65, align: 'right', render: pctText },
                                { title: 'Time', dataIndex: 'avg_seconds', width: 75, align: 'right', render: (v: number | null) => (v ? duration(v) : '—') },
                            ]}
                        />
                    ) : <p className="mon-none">No lesson played in this period yet.</p>}
                </section>

                {/* ── Where learners give up ── */}
                <section className="mon-card">
                    <header>
                        <h3>Lessons to look at</h3>
                        <Tooltip title="Started at least 3 times, ranked by the share of attempts finished.">
                            <span>least often finished</span>
                        </Tooltip>
                    </header>
                    {hardest.length ? (
                        <BarList
                            total={100}
                            rows={hardest.map(l => ({
                                label: title(l, l.item),
                                sub: `${l.starts} tries · score ${pctText(l.avg_score)}`,
                                value: l.completion_rate ?? 0,
                                color: (l.completion_rate ?? 0) < 40 ? 'rgba(239, 68, 68, .14)' : 'rgba(245, 158, 11, .14)',
                            }))}
                        />
                    ) : <p className="mon-none">Not enough attempts yet to tell.</p>}
                </section>

                {/* ── Categories ── */}
                <section className="mon-card">
                    <header><h3>Categories</h3><span>page views of their courses</span></header>
                    <BarList
                        total={categories.reduce((t, c) => t + c.views, 0) || 1}
                        rows={categories.map(c => ({
                            label: CATEGORY_LABEL[c.category] || fromId(c.category),
                            sub: `${c.courses} course${c.courses === 1 ? '' : 's'} · ${compact(c.lessons_finished)} lessons finished`,
                            value: c.views,
                        }))}
                    />
                </section>

                {/* ── Games and level test ── */}
                <section className="mon-card">
                    <header><h3>Games</h3><span>played to the end</span></header>
                    <BarList
                        total={games.reduce((t, g) => t + g.plays, 0) || 1}
                        rows={games.map(g => ({ label: title(g, g.game), sub: `${compact(g.views)} visits`, value: g.plays }))}
                        empty="No game played yet."
                    />
                    <h4 className="mon-subhead">Level test results</h4>
                    {levels.length ? (
                        <BarList
                            total={levelTotal}
                            rows={levels.map(l => ({ label: l.level, sub: l.avg_score !== null ? `score ${l.avg_score}%` : undefined, value: l.tests }))}
                        />
                    ) : <p className="mon-none">No level test taken yet.</p>}
                </section>

                {/* ── Arrivals ── */}
                <section className="mon-card">
                    <header><h3>How learners arrive</h3><span>first page of their visit in the free courses</span></header>
                    <BarList
                        total={arrived}
                        rows={arrivals.map(a => ({ label: CHANNEL_LABEL[a.channel] || a.channel, value: a.visits, color: `${CHANNEL_COLOR[a.channel] || '#94a3b8'}22` }))}
                        empty="Learners in this period came from other pages of the site."
                    />
                    {!!entries.length && (
                        <>
                            <h4 className="mon-subhead">Landing pages</h4>
                            <BarList total={arrived} rows={entries.map(e => ({ label: <code>{e.path}</code>, value: e.visits }))} />
                        </>
                    )}
                </section>

                {/* ── Countries and devices ── */}
                <section className="mon-card">
                    <header><h3>Learners' countries</h3><span>learners</span></header>
                    <BarList
                        total={countries.reduce((t, c) => t + c.learners, 0) || 1}
                        rows={countries.map(c => ({
                            label: <><span className="mon-flag">{flag(c.country)}</span>{countryName(c.country)}</>,
                            sub: `${compact(c.views)} pages`,
                            value: c.learners,
                        }))}
                    />
                    <h4 className="mon-subhead">Devices</h4>
                    <BarList
                        total={devices.reduce((t, d) => t + d.views, 0) || 1}
                        rows={devices.map(d => ({ label: d.name ? d.name[0].toUpperCase() + d.name.slice(1) : 'Unknown', value: d.views }))}
                    />
                </section>
            </div>

            {/* ── What the free courses bring ── */}
            {promotions && (
                <section className="mon-card">
                    <header>
                        <h3><NotificationOutlined /> From free courses to classes</h3>
                        <span>the campaign card shown in the courses (Marketing)</span>
                    </header>
                    <div className="mon-kpis is-tight">
                        <div className="mon-kpi"><span className="mon-kpi-label">Card seen</span><strong>{compact(promotions.views)}</strong></div>
                        <div className="mon-kpi"><span className="mon-kpi-label">Clicks</span><strong>{compact(promotions.clicks)}</strong>
                            <small className="mon-kpi-sub">{promotions.views ? `${Math.round((promotions.clicks / promotions.views) * 1000) / 10}% of views` : '—'}</small></div>
                        <div className="mon-kpi"><span className="mon-kpi-label">Registrations</span><strong>{compact(promotions.registrations)}</strong>
                            <small className="mon-kpi-sub">{k.learners ? `${Math.round((promotions.registrations / k.learners) * 1000) / 10}% of learners` : '—'}</small></div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default MonitoringLearning;
