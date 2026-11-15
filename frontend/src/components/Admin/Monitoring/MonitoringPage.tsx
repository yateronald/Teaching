import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Segmented, Skeleton, Switch, Tooltip, message } from 'antd';
import {
    AreaChartOutlined, CloudDownloadOutlined, DashboardOutlined, LineChartOutlined,
    GlobalOutlined, LockOutlined, ReadOutlined, ReloadOutlined, SafetyOutlined, ThunderboltOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../../contexts/AuthContext';
import MonitoringOverview from './MonitoringOverview';
import MonitoringMap from './MonitoringMap';
import MonitoringPerformance from './MonitoringPerformance';
import MonitoringLive from './MonitoringLive';
import MonitoringLearning from './MonitoringLearning';
import { RANGES, viewerZone, type GeoData, type Learning, type Live, type Overview, type Performance, type RangeKey } from './monitoringModel';
import './Monitoring.css';

/* ══════════════════════════════════════════
   WEBSITE MONITORING
   Who visits the public site, where from, and how fast it is for them —
   next to the health of the platform serving it.

   Only an administrator holding the monitoring key reaches this page, and the
   server checks that on every request as well.
══════════════════════════════════════════ */

type TabKey = 'overview' | 'map' | 'learning' | 'performance' | 'live';

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Audience', icon: <AreaChartOutlined /> },
    { key: 'map', label: 'Map', icon: <GlobalOutlined /> },
    { key: 'learning', label: 'Free courses', icon: <ReadOutlined /> },
    { key: 'performance', label: 'Performance', icon: <ThunderboltOutlined /> },
    { key: 'live', label: 'Live', icon: <DashboardOutlined /> },
];

const LIVE_REFRESH_MS = 20_000;

const MonitoringPage: React.FC = () => {
    const { apiCall, user } = useAuth();
    const [msg, msgHolder] = message.useMessage();

    const [tab, setTab] = useState<TabKey>('overview');
    const [range, setRange] = useState<RangeKey>('7d');
    const [overview, setOverview] = useState<Overview | null>(null);
    const [performance, setPerformance] = useState<Performance | null>(null);
    const [live, setLive] = useState<Live | null>(null);
    const [geo, setGeo] = useState<GeoData | null>(null);
    const [learning, setLearning] = useState<Learning | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [denied, setDenied] = useState(false);
    const [auto, setAuto] = useState(true);
    const [refreshedAt, setRefreshedAt] = useState<Date | null>(null);
    const busy = useRef(false);
    // Only the latest request may fill the page: an older answer arriving late
    // (another period, another tab) is dropped.
    const latest = useRef(0);

    const load = useCallback(async (which: TabKey, silent = false) => {
        if (busy.current && silent) return;
        busy.current = true;
        const mine = ++latest.current;
        if (!silent) setLoading(true);
        try {
            // Days and hours are cut in the viewer's own time zone.
            const tz = `tz=${encodeURIComponent(viewerZone)}`;
            const path = which === 'overview' ? `/monitoring/overview?range=${range}&${tz}`
                : which === 'map' ? `/monitoring/geo?range=${range}`
                : which === 'learning' ? `/monitoring/learning?range=${range}&${tz}`
                    : which === 'performance' ? `/monitoring/performance?range=${range}&${tz}`
                        : `/monitoring/live?${tz}`;
            const res = await apiCall(path);
            if (mine !== latest.current) return;
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                if (res.status === 403) { setDenied(true); setError(body?.error || null); return; }
                throw new Error(body?.error || `The server answered ${res.status}.`);
            }
            const data = await res.json();
            if (mine !== latest.current) return;
            if (which === 'overview') setOverview(data);
            else if (which === 'map') setGeo(data);
            else if (which === 'learning') setLearning(data);
            else if (which === 'performance') setPerformance(data);
            else setLive(data);
            setRefreshedAt(new Date());
            setError(null);
            setDenied(false);
        } catch (e) {
            if (mine !== latest.current) return;
            // A failed refresh in the background keeps the figures on screen.
            if (!silent) setError((e instanceof Error && e.message) || 'Monitoring data could not be loaded.');
        } finally {
            busy.current = false;
            if (mine === latest.current) setLoading(false);
        }
    }, [apiCall, range]);

    useEffect(() => { load(tab); }, [load, tab]);

    // The live view keeps itself current; the other two refresh on demand.
    useEffect(() => {
        if (!auto || tab !== 'live') return;
        const timer = window.setInterval(() => load('live', true), LIVE_REFRESH_MS);
        return () => window.clearInterval(timer);
    }, [auto, tab, load]);

    const exportCsv = async () => {
        try {
            const res = await apiCall(`/monitoring/export?range=${range}&tz=${encodeURIComponent(viewerZone)}`);
            if (!res.ok) throw new Error('The export could not be prepared.');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `website-monitoring-${range}.csv`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (e) {
            msg.error((e instanceof Error && e.message) || 'The export could not be prepared.');
        }
    };

    const notReady = (overview && overview.ready === false) || (performance && performance.ready === false)
        || (geo && geo.ready === false) || (learning && learning.ready === false);

    return (
        <div className="mon">
            {msgHolder}

            <header className="mon-head">
                <div className="mon-head-text">
                    <span className="mon-eyebrow"><SafetyOutlined /> Admin console · Website</span>
                    <h1>Monitoring</h1>
                    <p>
                        Visitors on learnfrenchwithnatives.com, how the pages perform for them, and the health of the
                        platform behind it. No cookies, no addresses and no names are collected — only counts.
                    </p>
                </div>
                <div className="mon-head-actions">
                    {tab !== 'live' && (
                        <Segmented
                            value={range}
                            onChange={(value) => setRange(value as RangeKey)}
                            options={RANGES.map(r => ({ label: r.short, value: r.key }))}
                            aria-label="Period"
                        />
                    )}
                    {tab === 'live' && (
                        <span className="mon-auto">
                            <Switch size="small" checked={auto} onChange={setAuto} aria-label="Refresh automatically" />
                            Auto
                        </span>
                    )}
                    <Tooltip title="Refresh">
                        <Button icon={<ReloadOutlined />} onClick={() => load(tab)} loading={loading} aria-label="Refresh" />
                    </Tooltip>
                    <Tooltip title="Download a daily summary (CSV)">
                        <Button icon={<CloudDownloadOutlined />} onClick={exportCsv} aria-label="Export CSV" />
                    </Tooltip>
                </div>
            </header>

            <nav className="mon-tabs" aria-label="Monitoring sections">
                {TABS.map(t => (
                    <button
                        key={t.key}
                        type="button"
                        className={`mon-tab${tab === t.key ? ' is-active' : ''}`}
                        onClick={() => setTab(t.key)}
                        aria-current={tab === t.key}
                    >
                        {t.icon}
                        <span>{t.label}</span>
                        {t.key === 'live' && !!live?.visitors && <em className="mon-tab-live">{live.visitors}</em>}
                    </button>
                ))}
                <span className="mon-refreshed">
                    {refreshedAt ? `Updated ${refreshedAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : ''}
                </span>
            </nav>

            {denied ? (
                <div className="mon-empty">
                    <LockOutlined />
                    <h3>Website monitoring is not open to you</h3>
                    <p>
                        {error || 'Website monitoring is not part of your access.'} Another administrator can turn it
                        on for your account from Users — edit the account and switch on "Website monitoring".
                    </p>
                </div>
            ) : error ? (
                <div className="mon-empty is-error">
                    <LineChartOutlined />
                    <h3>Monitoring is unavailable</h3>
                    <p>{error}</p>
                    <Button type="primary" onClick={() => load(tab)}>Try again</Button>
                </div>
            ) : notReady ? (
                <div className="mon-empty">
                    <LineChartOutlined />
                    <h3>Not set up yet</h3>
                    <p>
                        The monitoring tables are missing. Run the website-monitoring migration on the server, and
                        visits will start appearing here within a minute.
                    </p>
                    <code>node backend/database/run-site-monitoring-migration.js</code>
                </div>
            ) : loading && !overview && !performance && !live && !geo && !learning ? (
                <div className="mon-grid">
                    {[0, 1, 2, 3].map(i => <div key={i} className="mon-card"><Skeleton active paragraph={{ rows: 3 }} /></div>)}
                </div>
            ) : (
                <>
                    {tab === 'overview' && <MonitoringOverview data={overview} />}
                    {tab === 'map' && <MonitoringMap data={geo} loading={loading} />}
                    {tab === 'learning' && <MonitoringLearning data={learning} />}
                    {tab === 'performance' && <MonitoringPerformance data={performance} />}
                    {tab === 'live' && <MonitoringLive data={live} />}
                </>
            )}

            <footer className="mon-foot">
                Signed in as {user?.first_name} · visits are kept for {performance?.retention_days ?? 180} days, then deleted.
                A visitor is only ever a daily hash — it cannot be traced to a person, and never leaves this page.
            </footer>
        </div>
    );
};

export default MonitoringPage;
