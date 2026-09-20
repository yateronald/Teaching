import React from 'react';
import { Empty, Tooltip } from 'antd';
import {
    ArrowDownOutlined, ArrowUpOutlined, DesktopOutlined, GlobalOutlined, MobileOutlined,
    TabletOutlined, TeamOutlined,
} from '@ant-design/icons';
import {
    Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip as ReTooltip, XAxis, YAxis,
} from 'recharts';
import {
    CHANNEL_COLOR, CHANNEL_LABEL, DEVICE_COLOR, axisLabel, compact, countryName, duration, flag, languageName,
    type Named, type Overview,
} from './monitoringModel';

/* The audience view: how many people came, from where, and what they read. */

const KPIS = [
    { key: 'visitors', label: 'Visitors', hint: 'People, counted once a day each.' },
    { key: 'visits', label: 'Page views', hint: 'Pages opened in total.' },
    { key: 'sessions', label: 'Visits', hint: 'A run of pages with no gap longer than 30 minutes.' },
    { key: 'bounce_rate', label: 'Bounce rate', hint: 'Visits that read one page and left.', suffix: '%', lowerIsBetter: true },
    { key: 'avg_seconds', label: 'Time on page', hint: 'Average time a page stayed open.', time: true },
] as const;

/** A list of names with a share bar — the shape every breakdown here uses. */
const BarList: React.FC<{
    rows: { label: React.ReactNode; value: number; sub?: string; color?: string }[];
    total: number;
    empty?: string;
}> = ({ rows, total, empty = 'Nothing yet.' }) => {
    if (!rows.length) return <p className="mon-none">{empty}</p>;
    const top = Math.max(...rows.map(r => r.value), 1);
    return (
        <ul className="mon-bars">
            {rows.map((row, i) => (
                <li key={i}>
                    <span className="mon-bar-fill" style={{ width: `${(row.value / top) * 100}%`, background: row.color }} aria-hidden="true" />
                    <span className="mon-bar-label">{row.label}</span>
                    {row.sub && <span className="mon-bar-sub">{row.sub}</span>}
                    <b>{compact(row.value)}</b>
                    <em>{total ? `${Math.round((row.value / total) * 100)}%` : '0%'}</em>
                </li>
            ))}
        </ul>
    );
};

const deviceIcon = (name: string) =>
    name === 'phone' ? <MobileOutlined /> : name === 'tablet' ? <TabletOutlined /> : <DesktopOutlined />;

const Delta: React.FC<{ value: number | null; lowerIsBetter?: boolean }> = ({ value, lowerIsBetter }) => {
    if (value === null || value === undefined || !Number.isFinite(value)) return <span className="mon-delta is-flat">no earlier data</span>;
    if (value === 0) return <span className="mon-delta is-flat">no change</span>;
    const up = value > 0;
    const good = lowerIsBetter ? !up : up;
    return (
        <span className={`mon-delta ${good ? 'is-up' : 'is-down'}`}>
            {up ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            {Math.abs(value)}%
        </span>
    );
};

const MonitoringOverview: React.FC<{ data: Overview | null }> = ({ data }) => {
    if (!data) return null;
    const { kpis, series, countries, pages, channels, referrers, campaigns, devices, browsers, systems, languages } = data;
    const bucket = data.range?.bucket || 'day';
    const totalVisits = kpis.visits || 1;
    const chart = series.map(p => ({ ...p, label: axisLabel(p.at, bucket) }));
    const share = (rows: Named[]) => rows.reduce((sum, r) => sum + r.visits, 0) || 1;

    return (
        <div className="mon-body">
            {/* ── The numbers ── */}
            <section className="mon-kpis">
                {KPIS.map(kpi => {
                    const value = kpis[kpi.key] as number;
                    return (
                        <div key={kpi.key} className="mon-kpi">
                            <Tooltip title={kpi.hint}>
                                <span className="mon-kpi-label">{kpi.label}</span>
                            </Tooltip>
                            <strong>
                                {'time' in kpi && kpi.time ? duration(value) : compact(value)}
                                {'suffix' in kpi && kpi.suffix ? <i>{kpi.suffix}</i> : null}
                            </strong>
                            <Delta value={kpis.change[kpi.key]} lowerIsBetter={'lowerIsBetter' in kpi && kpi.lowerIsBetter} />
                        </div>
                    );
                })}
                <div className="mon-kpi is-live">
                    <span className="mon-kpi-label">Right now</span>
                    <strong><span className="mon-dot" aria-hidden="true" />{kpis.live_visitors}</strong>
                    <span className="mon-delta is-flat">in the last 5 minutes</span>
                </div>
            </section>

            {/* ── Traffic over time ── */}
            <section className="mon-card mon-chart">
                <header>
                    <h3>Traffic</h3>
                    <span>{data.range?.label}</span>
                </header>
                {chart.length ? (
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={chart} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                            <defs>
                                <linearGradient id="monVisits" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.35} />
                                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="monVisitors" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#0e9f6e" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#0e9f6e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#eef0f4" vertical={false} />
                            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} minTickGap={24} />
                            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} width={44} allowDecimals={false} />
                            <ReTooltip
                                contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }}
                                labelStyle={{ fontWeight: 600 }}
                            />
                            <Area type="monotone" dataKey="visits" name="Page views" stroke="#4f46e5" strokeWidth={2} fill="url(#monVisits)" />
                            <Area type="monotone" dataKey="visitors" name="Visitors" stroke="#0e9f6e" strokeWidth={2} fill="url(#monVisitors)" />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No visits in this period yet." />
                )}
            </section>

            <div className="mon-grid">
                {/* ── Countries ── */}
                <section className="mon-card">
                    <header>
                        <h3><GlobalOutlined /> Countries</h3>
                        <span>{countries.length} in this period</span>
                    </header>
                    <BarList
                        total={totalVisits}
                        rows={countries.slice(0, 12).map(c => ({
                            label: <><span className="mon-flag">{flag(c.country)}</span>{countryName(c.country)}</>,
                            sub: `${compact(c.visitors)} visitors`,
                            value: c.visits,
                        }))}
                        empty="No country could be worked out yet."
                    />
                </section>

                {/* ── Pages ── */}
                <section className="mon-card">
                    <header>
                        <h3>Top pages</h3>
                        <span>by page views</span>
                    </header>
                    <BarList
                        total={totalVisits}
                        rows={pages.slice(0, 12).map(p => ({
                            label: <code>{p.path}</code>,
                            sub: p.avg_seconds ? duration(p.avg_seconds) : undefined,
                            value: p.visits,
                        }))}
                    />
                </section>

                {/* ── How they arrived ── */}
                <section className="mon-card">
                    <header><h3>How people arrive</h3></header>
                    <div className="mon-split">
                        <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                                <Pie
                                    data={channels.map(c => ({ name: CHANNEL_LABEL[c.channel] || c.channel, value: c.visits, key: c.channel }))}
                                    dataKey="value" nameKey="name" innerRadius={44} outerRadius={70} paddingAngle={2} stroke="none"
                                >
                                    {channels.map(c => <Cell key={c.channel} fill={CHANNEL_COLOR[c.channel] || '#94a3b8'} />)}
                                </Pie>
                                <ReTooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <ul className="mon-legend">
                            {channels.map(c => (
                                <li key={c.channel}>
                                    <i style={{ background: CHANNEL_COLOR[c.channel] || '#94a3b8' }} aria-hidden="true" />
                                    {CHANNEL_LABEL[c.channel] || c.channel}
                                    <b>{compact(c.visits)}</b>
                                </li>
                            ))}
                            {!channels.length && <li className="mon-none">Nothing yet.</li>}
                        </ul>
                    </div>
                </section>

                {/* ── Referrers and campaigns ── */}
                <section className="mon-card">
                    <header><h3>Referring sites</h3></header>
                    <BarList
                        total={totalVisits}
                        rows={referrers.map(r => ({ label: r.host, value: r.visits }))}
                        empty="No site has linked a visitor here yet."
                    />
                    {!!campaigns.length && (
                        <>
                            <h4 className="mon-subhead">Campaigns</h4>
                            <BarList
                                total={totalVisits}
                                rows={campaigns.map(c => ({
                                    label: c.name || c.source || 'Campaign',
                                    sub: [c.source, c.medium].filter(Boolean).join(' · ') || undefined,
                                    value: c.visits,
                                    color: CHANNEL_COLOR.campaign,
                                }))}
                            />
                        </>
                    )}
                </section>

                {/* ── Devices ── */}
                <section className="mon-card">
                    <header><h3><TeamOutlined /> Devices</h3></header>
                    <BarList
                        total={share(devices)}
                        rows={devices.map(d => ({
                            label: <>{deviceIcon(d.name)} {d.name ? d.name[0].toUpperCase() + d.name.slice(1) : 'Unknown'}</>,
                            value: d.visits,
                            color: DEVICE_COLOR[d.name] || undefined,
                        }))}
                    />
                    <h4 className="mon-subhead">Browsers</h4>
                    <BarList total={share(browsers)} rows={browsers.map(b => ({ label: b.name || 'Other', value: b.visits }))} />
                </section>

                {/* ── Systems and languages ── */}
                <section className="mon-card">
                    <header><h3>Systems &amp; languages</h3></header>
                    <BarList total={share(systems)} rows={systems.map(s => ({ label: s.name || 'Other', value: s.visits }))} />
                    <h4 className="mon-subhead">Languages</h4>
                    <BarList total={share(languages)} rows={languages.map(l => ({ label: languageName(l.name), value: l.visits }))} />
                </section>
            </div>
        </div>
    );
};

export default MonitoringOverview;
