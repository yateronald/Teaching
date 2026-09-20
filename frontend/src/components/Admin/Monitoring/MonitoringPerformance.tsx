import React from 'react';
import { Empty, Table, Tag, Tooltip } from 'antd';
import { ApiOutlined, CheckCircleFilled, CloudServerOutlined, WarningFilled } from '@ant-design/icons';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip as ReTooltip, XAxis, YAxis } from 'recharts';
import { RATING_LABEL, axisLabel, compact, ms, uptimeText, vitalText, type Performance } from './monitoringModel';

/* How fast the site is for real visitors, and how the platform behind it holds up. */

const VitalCard: React.FC<{ vital: Performance['vitals'][number] }> = ({ vital }) => {
    const total = vital.good_count + vital.fair_count + vital.poor_count;
    const width = (n: number) => (total ? `${(n / total) * 100}%` : '0%');
    return (
        <div className={`mon-vital is-${vital.rating}`}>
            <header>
                <span>{vital.label}</span>
                <Tag className="mon-vital-tag">{RATING_LABEL[vital.rating]}</Tag>
            </header>
            <strong>{vital.samples ? vitalText(vital.unit, vital.p75) : '—'}</strong>
            <em>
                {vital.samples
                    ? <>75th percentile · {compact(vital.samples)} page views</>
                    : <>waiting for the first measurements</>}
            </em>
            <div className="mon-vital-bar" role="img" aria-label={`${vital.good_count} good, ${vital.fair_count} need work, ${vital.poor_count} poor`}>
                <i className="is-good" style={{ width: width(vital.good_count) }} />
                <i className="is-fair" style={{ width: width(vital.fair_count) }} />
                <i className="is-poor" style={{ width: width(vital.poor_count) }} />
            </div>
            <small>
                Good under {vitalText(vital.unit, vital.good)} · poor over {vitalText(vital.unit, vital.poor)}
            </small>
        </div>
    );
};

const MonitoringPerformance: React.FC<{ data: Performance | null }> = ({ data }) => {
    if (!data) return null;
    const { vitals, slowest, trend, api, health } = data;
    const trendData = trend.map(t => ({ ...t, label: axisLabel(t.at, 'day') }));
    const apiSeries = api.series.map(s => ({ ...s, label: axisLabel(s.at, 'day') }));
    const apiHealthy = api.error_rate < 1 && api.p95_ms < 1500;

    return (
        <div className="mon-body">
            {/* ── Core Web Vitals ── */}
            <section className="mon-card">
                <header>
                    <h3>Core Web Vitals</h3>
                    <span>measured on real visitors' devices</span>
                </header>
                <div className="mon-vitals">
                    {vitals.map(v => <VitalCard key={v.key} vital={v} />)}
                </div>
            </section>

            <div className="mon-grid">
                {/* ── Trend ── */}
                <section className="mon-card mon-chart">
                    <header><h3>Loading speed over time</h3><span>75th percentile</span></header>
                    {trendData.length ? (
                        <ResponsiveContainer width="100%" height={230}>
                            <LineChart data={trendData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#eef0f4" vertical={false} />
                                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} minTickGap={24} />
                                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} width={48} unit="ms" />
                                <ReTooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} formatter={(v: number) => ms(v)} />
                                <Line type="monotone" dataKey="lcp_p75" name="Largest paint" stroke="#4f46e5" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="load_p75" name="Page load" stroke="#f59e0b" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No measurements yet." />}
                </section>

                {/* ── Slowest pages ── */}
                <section className="mon-card">
                    <header><h3>Slowest pages</h3><span>largest paint, 75th percentile</span></header>
                    {slowest.length ? (
                        <Table
                            size="small"
                            pagination={false}
                            rowKey="path"
                            dataSource={slowest}
                            columns={[
                                { title: 'Page', dataIndex: 'path', render: (p: string) => <code>{p}</code>, ellipsis: true },
                                { title: 'Largest paint', dataIndex: 'lcp_p75', width: 120, align: 'right', render: (v: number) => ms(v) },
                                { title: 'Load', dataIndex: 'load_p75', width: 100, align: 'right', render: (v: number) => ms(v) },
                                { title: 'Views', dataIndex: 'samples', width: 80, align: 'right' },
                            ]}
                        />
                    ) : <p className="mon-none">Not enough measurements yet.</p>}
                </section>
            </div>

            {/* ── The platform itself ── */}
            <section className="mon-card">
                <header>
                    <h3><ApiOutlined /> Platform</h3>
                    <span>
                        {apiHealthy
                            ? <Tag color="green" icon={<CheckCircleFilled />}>Healthy</Tag>
                            : <Tag color="orange" icon={<WarningFilled />}>Watch</Tag>}
                    </span>
                </header>

                <div className="mon-kpis is-tight">
                    <div className="mon-kpi"><span className="mon-kpi-label">API requests</span><strong>{compact(api.requests)}</strong></div>
                    <div className="mon-kpi"><span className="mon-kpi-label">Average response</span><strong>{ms(api.avg_ms)}</strong></div>
                    <div className="mon-kpi"><span className="mon-kpi-label">Slowest 5%</span><strong>{ms(api.p95_ms)}</strong></div>
                    <div className="mon-kpi">
                        <Tooltip title="Share of requests the server failed to answer (5xx).">
                            <span className="mon-kpi-label">Error rate</span>
                        </Tooltip>
                        <strong className={api.error_rate >= 1 ? 'is-bad' : undefined}>{api.error_rate}<i>%</i></strong>
                    </div>
                    <div className="mon-kpi"><span className="mon-kpi-label">Refused requests</span><strong>{compact(api.client_errors)}</strong></div>
                    <div className="mon-kpi">
                        <span className="mon-kpi-label"><CloudServerOutlined /> Uptime</span>
                        <strong>{uptimeText(health.uptime_seconds)}</strong>
                    </div>
                </div>

                <div className="mon-grid">
                    <div className="mon-chart">
                        {apiSeries.length ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={apiSeries} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#eef0f4" vertical={false} />
                                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} minTickGap={24} />
                                    <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} width={48} />
                                    <ReTooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} />
                                    <Line type="monotone" dataKey="requests" name="Requests" stroke="#4f46e5" strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="errors" name="Server errors" stroke="#ef4444" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : <p className="mon-none">No API traffic recorded yet.</p>}
                    </div>

                    <div>
                        <h4 className="mon-subhead">Slowest endpoints</h4>
                        {api.routes.length ? (
                            <Table
                                size="small"
                                pagination={false}
                                rowKey={(r) => `${r.method} ${r.route}`}
                                dataSource={api.routes}
                                columns={[
                                    {
                                        title: 'Endpoint', dataIndex: 'route', ellipsis: true,
                                        render: (route: string, row) => <><Tag className="mon-method">{row.method}</Tag><code>{route}</code></>,
                                    },
                                    { title: 'Calls', dataIndex: 'hits', width: 80, align: 'right', render: (v: number) => compact(v) },
                                    { title: 'Slowest 5%', dataIndex: 'p95_ms', width: 110, align: 'right', render: (v: number) => ms(v) },
                                    {
                                        title: 'Errors', dataIndex: 'server_errors', width: 90, align: 'right',
                                        render: (v: number) => (v ? <span className="is-bad">{v}</span> : '—'),
                                    },
                                ]}
                            />
                        ) : <p className="mon-none">Nothing measured yet — figures appear a minute after traffic.</p>}
                    </div>
                </div>

                <ul className="mon-facts">
                    <li><span>Memory</span><b>{health.memory_mb} MB</b></li>
                    <li><span>Heap</span><b>{health.heap_used_mb} / {health.heap_total_mb} MB</b></li>
                    <li>
                        <Tooltip title="How late the server is answering its own timers. Above ~50 ms means it is busy.">
                            <span>Event loop lag</span>
                        </Tooltip>
                        <b className={health.event_loop_lag_ms > 50 ? 'is-bad' : undefined}>{health.event_loop_lag_ms} ms</b>
                    </li>
                    <li><span>Node</span><b>{health.node}</b></li>
                    <li><span>Started</span><b>{new Date(health.started_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</b></li>
                </ul>
            </section>
        </div>
    );
};

export default MonitoringPerformance;
