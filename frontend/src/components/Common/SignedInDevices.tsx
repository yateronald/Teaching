import React, { useCallback, useEffect, useState } from 'react';
import { Button, Popconfirm, Skeleton, Tag, message } from 'antd';
import { DesktopOutlined, LaptopOutlined, MobileOutlined, ReloadOutlined, SafetyOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { sinceText, type DeviceSession } from '../../utils/devices';
import './SignedInDevices.css';

/* ══════════════════════════════════════════
   SIGNED-IN DEVICES
   Where you see every device using your account and cut off anything you
   don't recognise. Exam candidates are limited to two devices at a time, so
   this is also how they free one up.
══════════════════════════════════════════ */

const iconFor = (device: string) => {
    if (/iPhone|iPad|Android/i.test(device)) return <MobileOutlined />;
    if (/Mac|Linux/i.test(device)) return <LaptopOutlined />;
    return <DesktopOutlined />;
};

interface Payload {
    limit: number | null;
    idle_minutes: number;
    sessions: DeviceSession[];
}

const SignedInDevices: React.FC = () => {
    const { apiCall, logout } = useAuth();
    const [msg, msgHolder] = message.useMessage();
    const [data, setData] = useState<Payload | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [busyId, setBusyId] = useState<number | null>(null);

    const load = useCallback(async () => {
        try {
            const res = await apiCall('/auth/sessions');
            if (!res.ok) throw new Error(`The server answered ${res.status}.`);
            setData(await res.json());
            setError(null);
        } catch (e: any) {
            setError(e?.message || 'Your devices could not be loaded.');
        } finally {
            setLoading(false);
        }
    }, [apiCall]);

    useEffect(() => { load(); }, [load]);

    const signOut = async (session: DeviceSession) => {
        setBusyId(session.id);
        try {
            const res = await apiCall(`/auth/sessions/${session.id}`, { method: 'DELETE' });
            const body = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(body?.error || 'That device could not be signed out.');
            // Signing out the device you are on ends this sign-in too.
            if (session.current) { await logout(); return; }
            msg.success('Device signed out.');
            load();
        } catch (e: any) {
            msg.error(e?.message || 'That device could not be signed out.');
        } finally {
            setBusyId(null);
        }
    };

    const limit = data?.limit ?? null;
    const used = data?.sessions.length ?? 0;
    const full = limit !== null && used >= limit;

    return (
        <section className="tc-card pf-section sd">
            {msgHolder}
            <header className="pf-section-head">
                <span className="pf-section-ic is-indigo"><SafetyOutlined /></span>
                <div>
                    <h3>Signed-in devices</h3>
                    <p>
                        {limit !== null
                            ? `Your exam account may be signed in on ${limit} devices at a time. Sign out any device you don't recognise — and never share your password.`
                            : 'Everywhere your account is signed in. Sign out anything you don\'t recognise.'}
                    </p>
                </div>
                <div className="sd-head-aside">
                    {limit !== null && !loading && !error && (
                        <Tag color={full ? 'orange' : 'blue'} className="sd-count">{used} of {limit}</Tag>
                    )}
                    <Button size="small" icon={<ReloadOutlined />} onClick={() => { setLoading(true); load(); }} aria-label="Refresh devices" />
                </div>
            </header>

            {loading ? (
                <Skeleton active paragraph={{ rows: 2 }} title={false} />
            ) : error ? (
                <div className="sd-error">
                    <span>{error}</span>
                    <Button size="small" onClick={() => { setLoading(true); load(); }}>Try again</Button>
                </div>
            ) : used === 0 ? (
                <p className="sd-empty">No other device is signed in.</p>
            ) : (
                <ul className="sd-list">
                    {data!.sessions.map((s) => (
                        <li key={s.id} className={s.current ? 'is-current' : undefined}>
                            <span className="sd-ic" aria-hidden="true">{iconFor(s.device)}</span>
                            <div className="sd-text">
                                <strong>
                                    {s.device}
                                    {s.current && <Tag color="green" className="sd-tag">This device</Tag>}
                                </strong>
                                <em>Signed in {sinceText(s.age_seconds)} · last used {sinceText(s.idle_seconds)}</em>
                            </div>
                            {s.current ? (
                                <Button size="small" loading={busyId === s.id} onClick={() => signOut(s)}>Sign out</Button>
                            ) : (
                                <Popconfirm
                                    title="Sign out this device?"
                                    description="It will have to sign in again."
                                    okText="Sign out"
                                    cancelText="Keep"
                                    onConfirm={() => signOut(s)}
                                >
                                    <Button size="small" danger loading={busyId === s.id}>Sign out</Button>
                                </Popconfirm>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
};

export default SignedInDevices;
