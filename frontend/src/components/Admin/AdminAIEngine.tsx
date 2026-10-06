import React, { useCallback, useEffect, useState } from 'react';
import { Button, ConfigProvider, Modal, Skeleton, Tooltip, message } from 'antd';
import {
    ApiOutlined, AudioOutlined, CheckCircleFilled, CloseCircleFilled, CloudOutlined, ExperimentOutlined,
    FileTextOutlined, HistoryOutlined, InfoCircleOutlined, LockOutlined, ReloadOutlined, SoundOutlined,
    SwapOutlined, WarningOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { formatLocal } from '../../utils/timezone';
import './AdminSettings.css';
import './AdminAIEngine.css';

/* ══════════════════════════════════════════
   AI ENGINE
   Which Google AI service powers the whole platform: quiz generation, exam
   scoring, listening audio and the live oral examiner. The administrator tests
   an engine, then switches; every switch is kept in the history.
   Keys never reach this page: only whether they are set.
══════════════════════════════════════════ */

type EngineId = 'developer' | 'vertex';
type CheckId = 'text' | 'voice' | 'examiner';

interface EngineCheck { id: CheckId; ok: boolean; ms: number; model?: string; detail?: string; error?: string; }
interface EngineTest { engine: EngineId; at: string; ok: boolean; checks: EngineCheck[]; }
interface EngineInfo {
    id: EngineId;
    configured: boolean;
    liveReady: boolean;
    issues: string[];
    keys: number;
    project: string | null;
    location: string | null;
    models: { text: string[]; tts: string[]; live: string[] };
    lastTest: EngineTest | null;
}
interface Change { id: number; engine: EngineId; previous_engine: EngineId | null; created_at: string; changed_by: string | null; }
interface Overview {
    active: EngineId;
    selected: EngineId;
    since: string | null;
    changedBy: string | null;
    engines: EngineInfo[];
    history: Change[];
}

const META: Record<EngineId, { name: string; product: string; icon: React.ReactNode; billing: string; examiner: string }> = {
    developer: {
        name: 'Google AI Developer',
        product: 'Gemini API · AI Studio keys',
        icon: <ApiOutlined />,
        billing: 'Free tier — a daily quota per key and per model',
        examiner: 'The browser connects to Google with a single-use token',
    },
    vertex: {
        name: 'Google Cloud Vertex AI',
        product: 'Vertex AI · Google Cloud project',
        icon: <CloudOutlined />,
        billing: 'Billed per use to the Google Cloud project — no daily cap',
        examiner: 'Relayed by this server: the browser never reaches Google directly',
    },
};

const CAPABILITIES: { id: CheckId; kind: keyof EngineInfo['models']; label: string; use: string; icon: React.ReactNode }[] = [
    { id: 'text', kind: 'text', label: 'Text', use: 'AI quizzes, written and oral exam scoring', icon: <FileTextOutlined /> },
    { id: 'voice', kind: 'tts', label: 'Voice', use: 'Listening audio for quizzes', icon: <SoundOutlined /> },
    { id: 'examiner', kind: 'live', label: 'Live examiner', use: 'The oral exam, in real time', icon: <AudioOutlined /> },
];

const nameOf = (id: EngineId | null | undefined) => (id ? META[id]?.name || id : '—');
const seconds = (ms: number) => `${(ms / 1000).toFixed(1)} s`;

const AdminAIEngine: React.FC = () => {
    const { apiCall, user } = useAuth();
    const [msg, msgHolder] = message.useMessage();

    const [data, setData] = useState<Overview | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [testing, setTesting] = useState<EngineId | null>(null);
    const [switchTo, setSwitchTo] = useState<EngineId | null>(null);
    const [switching, setSwitching] = useState(false);

    const when = useCallback((iso: string | null | undefined) => (iso
        ? formatLocal(iso, user?.timezone, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
        : ''), [user?.timezone]);

    const load = useCallback(async () => {
        try {
            const res = await apiCall('/admin/ai-engine');
            const body = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(body?.error || `The server answered ${res.status}.`);
            setData(body as Overview);
            setError(null);
        } catch (e) {
            setError((e as Error)?.message || 'Could not load the AI engine settings.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [apiCall]);

    useEffect(() => { load(); }, [load]);

    const runTest = async (engine: EngineId) => {
        setTesting(engine);
        try {
            const res = await apiCall('/admin/ai-engine/test', { method: 'POST', body: JSON.stringify({ engine }) });
            const body = await res.json().catch(() => ({}));
            if (!res.ok) { msg.error(body?.error || 'The test could not run.'); return; }
            const result = body as EngineTest;
            setData(d => (d ? { ...d, engines: d.engines.map(e => (e.id === engine ? { ...e, lastTest: result } : e)) } : d));
            if (result.ok) msg.success(`${nameOf(engine)}: every check passed.`);
            else msg.warning(`${nameOf(engine)}: ${result.checks.filter(c => !c.ok).length} check(s) failed — see the details on the card.`);
        } catch {
            msg.error('The test could not run. Check your connection and try again.');
        } finally {
            setTesting(null);
        }
    };

    const confirmSwitch = async () => {
        if (!switchTo) return;
        setSwitching(true);
        try {
            const res = await apiCall('/admin/ai-engine', { method: 'PUT', body: JSON.stringify({ engine: switchTo }) });
            const body = await res.json().catch(() => ({}));
            if (!res.ok) { msg.error(body?.error || 'The AI engine could not be changed.'); return; }
            const tests = new Map((data?.engines || []).map(e => [e.id, e.lastTest]));
            const next = body as Overview;
            // Test results live in the page until reloaded; keep the ones the server did not resend.
            setData({ ...next, engines: next.engines.map(e => ({ ...e, lastTest: e.lastTest || tests.get(e.id) || null })) });
            msg.success(`The platform now runs on ${nameOf(switchTo)}.`);
            setSwitchTo(null);
        } catch {
            msg.error('The AI engine could not be changed. Check your connection and try again.');
        } finally {
            setSwitching(false);
        }
    };

    /* ═══════════ LOADING ═══════════ */
    if (loading) {
        return (
            <div className="st" aria-busy="true">
                <div className="st-header"><div><Skeleton.Input active size="small" style={{ width: 150, height: 12 }} /><div style={{ marginTop: 10 }}><Skeleton.Input active style={{ width: 200, height: 26 }} /></div></div></div>
                <div className="ae-grid">{[0, 1].map(i => <div key={i} className="st-card st-pad"><Skeleton active paragraph={{ rows: 6 }} /></div>)}</div>
            </div>
        );
    }

    const target = data?.engines.find(e => e.id === switchTo) || null;
    const targetTestedOk = !!target?.lastTest?.ok;

    return (
        <ConfigProvider theme={{ token: { colorPrimary: '#4f46e5', fontSize: 13, borderRadius: 8 } }}>
            {msgHolder}
            <div className="st">
                {/* ── Header ── */}
                <header className="st-header">
                    <div>
                        <div className="st-overline">Admin console · System</div>
                        <h1 className="st-title">AI engine</h1>
                        <p className="st-subtitle">
                            The Google AI service behind the whole platform: AI quizzes, exam scoring, listening audio and the live oral examiner.
                        </p>
                    </div>
                    <div className="st-header-actions">
                        <Tooltip title="Reload from the server"><Button icon={<ReloadOutlined spin={refreshing} />} aria-label="Reload" onClick={() => { setRefreshing(true); load(); }} /></Tooltip>
                    </div>
                </header>

                {error && (
                    <div className="st-alert is-error" role="alert">
                        <WarningOutlined />
                        <span><strong>Couldn't load the AI engine settings.</strong> {error}</span>
                        <Button size="small" onClick={() => { setLoading(true); load(); }}>Retry</Button>
                    </div>
                )}

                {data && (
                    <>
                        {/* ── Summary ── */}
                        <section className="st-card st-summary">
                            <div className="st-summary-main">
                                <span className="st-summary-ic">{META[data.active]?.icon || <InfoCircleOutlined />}</span>
                                <div>
                                    <h2>In use: {nameOf(data.active)}</h2>
                                    <p>
                                        Every new AI request on the platform goes to <strong>{nameOf(data.active)}</strong>.
                                        {data.since
                                            ? <> Chosen {when(data.since)}{data.changedBy ? <> by <strong>{data.changedBy}</strong></> : null}.</>
                                            : <> This is the platform's original engine.</>}
                                    </p>
                                </div>
                            </div>
                            {data.selected !== data.active && (
                                <ul className="st-notes">
                                    <li className="is-warn"><WarningOutlined /><span>
                                        {nameOf(data.selected)} was chosen but is no longer configured on the server, so the platform fell back to {nameOf(data.active)}. Fix its configuration, then switch again.
                                    </span></li>
                                </ul>
                            )}
                            <p className="st-footnote">A switch applies at once to new requests. An oral exam task already under way keeps its connection until the task ends; no request moves from one engine to the other.</p>
                        </section>

                        {/* ── Engines ── */}
                        <div className="ae-grid">
                            {data.engines.map(engine => {
                                const meta = META[engine.id];
                                const active = data.active === engine.id;
                                const test = engine.lastTest;
                                const status = active ? { cls: 'is-active', text: 'In use' }
                                    : engine.configured ? { cls: 'is-ready', text: 'Ready' }
                                        : { cls: 'is-off', text: 'Not configured' };
                                return (
                                    <section key={engine.id} className={`st-card ae-engine${active ? ' is-active' : ''}`} aria-label={meta.name}>
                                        <div className="ae-engine-head">
                                            <span className={`ae-engine-ic is-${engine.id}`}>{meta.icon}</span>
                                            <div className="ae-engine-title">
                                                <h2>{meta.name}</h2>
                                                <p>{meta.product}</p>
                                            </div>
                                            <span className={`ae-status ${status.cls}`}>{status.text}</span>
                                        </div>

                                        <dl className="ae-facts">
                                            <div><dt>Billing</dt><dd>{meta.billing}</dd></div>
                                            <div><dt>Keys</dt><dd>{engine.keys === 0 ? 'None set on the server' : engine.keys === 1 ? '1 key, kept on the server' : `${engine.keys} keys, used in rotation`}</dd></div>
                                            {engine.id === 'vertex' && (
                                                <div><dt>Project</dt><dd>{engine.project ? <><code>{engine.project}</code> · examiner region <code>{engine.location}</code></> : 'Not set'}</dd></div>
                                            )}
                                            <div><dt>Examiner</dt><dd>{meta.examiner}</dd></div>
                                        </dl>

                                        <ul className="ae-caps">
                                            {CAPABILITIES.map(cap => {
                                                const models = engine.models[cap.kind] || [];
                                                const check = test?.checks.find(c => c.id === cap.id);
                                                return (
                                                    <li key={cap.id}>
                                                        <span className="ae-cap-ic">{cap.icon}</span>
                                                        <div className="ae-cap-text">
                                                            <strong>{cap.label}</strong>
                                                            <em>{cap.use}</em>
                                                            <span className="ae-models">
                                                                {models.length
                                                                    ? <><code>{models[0]}</code>{models.length > 1 && <> then {models.slice(1).map((m, i) => <React.Fragment key={m}>{i > 0 && ', '}<code>{m}</code></React.Fragment>)}</>}</>
                                                                    : 'No model'}
                                                            </span>
                                                        </div>
                                                        {check && (
                                                            <Tooltip title={check.ok ? `${check.detail || 'OK'}${check.model ? ` · ${check.model}` : ''}` : check.error}>
                                                                <span className={`ae-check ${check.ok ? 'is-ok' : 'is-fail'}`}>
                                                                    {check.ok ? <CheckCircleFilled /> : <CloseCircleFilled />}
                                                                    {check.ok ? seconds(check.ms) : 'Failed'}
                                                                </span>
                                                            </Tooltip>
                                                        )}
                                                    </li>
                                                );
                                            })}
                                        </ul>

                                        {engine.issues.length > 0 && (
                                            <ul className="st-notes ae-notes">
                                                {engine.issues.map(issue => <li key={issue} className="is-warn"><WarningOutlined /><span>{issue}</span></li>)}
                                            </ul>
                                        )}

                                        {test && (
                                            <div className={`ae-test ${test.ok ? 'is-ok' : 'is-fail'}`} role="status">
                                                <div className="ae-test-head">
                                                    {test.ok ? <CheckCircleFilled /> : <CloseCircleFilled />}
                                                    <strong>{test.ok ? 'Every check passed' : 'Some checks failed'}</strong>
                                                    <span>{when(test.at)}</span>
                                                </div>
                                                <ul>
                                                    {test.checks.map(c => {
                                                        const cap = CAPABILITIES.find(x => x.id === c.id);
                                                        return (
                                                            <li key={c.id} className={c.ok ? 'is-ok' : 'is-fail'}>
                                                                <span className="ae-test-label">{cap?.label || c.id}</span>
                                                                <span className="ae-test-detail">
                                                                    {c.ok ? <>{c.detail}{c.model && <> · <code>{c.model}</code></>} · {seconds(c.ms)}</> : c.error}
                                                                </span>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                        )}

                                        <div className="ae-actions">
                                            <Button icon={<ExperimentOutlined />} loading={testing === engine.id} disabled={!engine.configured || (!!testing && testing !== engine.id)} onClick={() => runTest(engine.id)}>
                                                {testing === engine.id ? 'Testing…' : 'Run test'}
                                            </Button>
                                            {active
                                                ? <span className="ae-inuse"><CheckCircleFilled /> In use</span>
                                                : (
                                                    <Button type="primary" icon={<SwapOutlined />} disabled={!engine.configured || !!testing} onClick={() => setSwitchTo(engine.id)}>
                                                        Use this engine
                                                    </Button>
                                                )}
                                        </div>
                                    </section>
                                );
                            })}
                        </div>

                        {/* ── History ── */}
                        <section className="st-card">
                            <div className="st-card-head">
                                <span className="st-card-ic is-violet"><HistoryOutlined /></span>
                                <div><h2>History</h2><p>Every switch, with who made it.</p></div>
                            </div>
                            {data.history.length === 0
                                ? <p className="ae-empty">No switch yet: the platform has always run on {nameOf('developer')}.</p>
                                : (
                                    <ol className="ae-history">
                                        {data.history.map(h => (
                                            <li key={h.id}>
                                                <span className="ae-history-route">{nameOf(h.previous_engine)} <SwapOutlined /> <strong>{nameOf(h.engine)}</strong></span>
                                                <span className="ae-history-meta">{when(h.created_at)}{h.changed_by ? ` · ${h.changed_by}` : ''}</span>
                                            </li>
                                        ))}
                                    </ol>
                                )}
                        </section>

                        {/* ── Security ── */}
                        <section className="st-card ae-security">
                            <div className="st-card-head">
                                <span className="st-card-ic is-green"><LockOutlined /></span>
                                <div>
                                    <h2>Keys and security</h2>
                                    <p>
                                        API keys are set in the server's environment file and never leave the server — not to this page, not to a learner's browser.
                                        The oral examiner receives a single-use credential for each task, with the examiner's instructions locked by the server.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </>
                )}
            </div>

            {/* ── Switch confirmation ── */}
            <Modal
                open={!!switchTo}
                title={`Switch the platform to ${nameOf(switchTo)}?`}
                okText={`Switch to ${nameOf(switchTo)}`}
                okButtonProps={{ icon: <SwapOutlined />, loading: switching }}
                cancelButtonProps={{ disabled: switching }}
                onOk={confirmSwitch}
                onCancel={() => !switching && setSwitchTo(null)}
                destroyOnHidden
            >
                <ul className="ae-confirm">
                    <li>AI quizzes, exam scoring, listening audio and the oral examiner will use <strong>{nameOf(switchTo)}</strong> for every new request.</li>
                    <li>Oral exam tasks already under way keep their connection until the task ends.</li>
                    {switchTo === 'vertex' && <li>Usage is billed to the Google Cloud project{target?.project ? <> <code>{target.project}</code></> : null}.</li>}
                    {switchTo === 'developer' && <li>The free-tier quotas apply again: each key has a daily limit per model.</li>}
                </ul>
                {!targetTestedOk && (
                    <div className="ae-confirm-warn">
                        <WarningOutlined />
                        <span>{target?.lastTest ? 'The last test of this engine failed.' : 'This engine has not been tested since the page was opened.'} Running a test first confirms that every feature answers.</span>
                    </div>
                )}
            </Modal>
        </ConfigProvider>
    );
};

export default AdminAIEngine;
