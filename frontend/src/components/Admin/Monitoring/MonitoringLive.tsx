import React from 'react';
import { Empty } from 'antd';
import { Bar, BarChart, ResponsiveContainer, Tooltip as ReTooltip, XAxis } from 'recharts';
import { CHANNEL_LABEL, agoText, axisLabel, compact, countryName, flag, type Live } from './monitoringModel';

/* Who is on the site at this moment. Refreshes itself every 20 seconds. */

const MonitoringLive: React.FC<{ data: Live | null }> = ({ data }) => {
    if (!data) return null;
    const minutes = data.minutes.map(m => ({ ...m, label: axisLabel(m.at, 'minute') }));

    return (
        <div className="mon-body">
            <section className="mon-card mon-live-head">
                <div className="mon-live-now">
                    <span className="mon-dot is-big" aria-hidden="true" />
                    <strong>{data.visitors}</strong>
                    <span>{data.visitors === 1 ? 'visitor right now' : 'visitors right now'}</span>
                    <em>{compact(data.views)} page views in the last 5 minutes</em>
                </div>
                <div className="mon-live-chart">
                    {minutes.length ? (
                        <ResponsiveContainer width="100%" height={110}>
                            <BarChart data={minutes} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} minTickGap={30} />
                                <ReTooltip
                                    cursor={{ fill: 'rgba(79,70,229,0.08)' }}
                                    contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }}
                                />
                                <Bar dataKey="visits" name="Page views" fill="#4f46e5" radius={[3, 3, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <p className="mon-none">Nobody in the last 30 minutes.</p>}
                    <span className="mon-live-axis">last 30 minutes</span>
                </div>
            </section>

            <div className="mon-grid">
                <section className="mon-card">
                    <header><h3>Pages being read</h3><span>last 30 minutes</span></header>
                    {data.pages.length ? (
                        <ul className="mon-bars">
                            {data.pages.map(p => (
                                <li key={p.path}>
                                    <span className="mon-bar-fill" style={{ width: `${(p.visits / data.pages[0].visits) * 100}%` }} aria-hidden="true" />
                                    <span className="mon-bar-label"><code>{p.path}</code></span>
                                    <b>{p.visits}</b>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="mon-none">Quiet.</p>}
                </section>

                <section className="mon-card">
                    <header><h3>Where from</h3><span>last 30 minutes</span></header>
                    {data.countries.length ? (
                        <ul className="mon-bars">
                            {data.countries.map(c => (
                                <li key={c.country}>
                                    <span className="mon-bar-fill" style={{ width: `${(c.visits / data.countries[0].visits) * 100}%` }} aria-hidden="true" />
                                    <span className="mon-bar-label"><span className="mon-flag">{flag(c.country)}</span>{countryName(c.country)}</span>
                                    <b>{c.visits}</b>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="mon-none">Quiet.</p>}
                </section>
            </div>

            <section className="mon-card">
                <header><h3>Latest page views</h3><span>newest first</span></header>
                {data.recent.length ? (
                    <ul className="mon-feed">
                        {data.recent.map((hit, i) => (
                            <li key={i}>
                                <span className="mon-feed-flag">{flag(hit.country)}</span>
                                <span className="mon-feed-path"><code>{hit.path}</code></span>
                                <span className="mon-feed-meta">
                                    {countryName(hit.country)} · {hit.device || 'unknown device'}
                                    {hit.browser ? ` · ${hit.browser}` : ''}
                                    {' · '}
                                    {hit.referrer_host || CHANNEL_LABEL[hit.channel] || hit.channel}
                                </span>
                                <span className="mon-feed-ago">{agoText(hit.seconds_ago)}</span>
                            </li>
                        ))}
                    </ul>
                ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No page views in the last 30 minutes." />}
            </section>
        </div>
    );
};

export default MonitoringLive;
