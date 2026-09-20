import React, { useCallback, useEffect, useState } from 'react';
import { Button, Popconfirm, Skeleton, Tooltip, message } from 'antd';
import { DesktopOutlined, LaptopOutlined, MobileOutlined, ReloadOutlined, SafetyOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { sinceText, type DeviceSession } from '../../utils/devices';
import './UserDevices.css';

/* ══════════════════════════════════════════
   SIGNED-IN DEVICES (admin view)
   Exam candidates may use two devices at a time. An account that sits at its
   limit and keeps pushing devices out is worth a look — the takeover count
   says how often it happened today.
══════════════════════════════════════════ */

const iconFor = (device: string) => {
    if (/iPhone|iPad|Android/i.test(device)) return <MobileOutlined />;
    if (/Mac|Linux/i.test(device)) return <LaptopOutlined />;
    return <DesktopOutlined />;
};

interface Payload {
    limit: number | null;
    idle_minutes: number;
    takeovers_today: number;
    takeovers_allowed: number;
    sessions: DeviceSession[];
}

const UserDevices: React.FC<{ userId: number; name: string }> = ({ userId, name }) => {
    const { apiCall } = useAuth();
    const [msg, msgHolder] = message.useMessage();
    const [data, setData] = useState<Payload | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState<number | 'all' | null>(null);

    const load = useCallback(async () => {
        try {
            const res = await apiCall(`/users/${userId}/sessions`);
            if (!res.ok) throw new Error(`The server answered ${res.status}.`);
            setData(await res.json());
            setError(null);
        } catch (e: any) {
            setError(e?.message || 'Devices could not be loaded.');
        } finally {
            setLoading(false);
        }
    }, [apiCall, userId]);

    useEffect(() => { setLoading(true); load(); }, [load]);

    const revoke = async (sessionId?: number) => {
        setBusy(sessionId ?? 'all');
        try {
            const res = await apiCall(`/users/${userId}/sessions${sessionId ? `/${sessionId}` : ''}`, { method: 'DELETE' });
            const body = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(body?.error || 'The devices could not be signed out.');
            msg.success(body?.message || 'Signed out.');
            load();
        } catch (e: any) {
            msg.error(e?.message || 'The devices could not be signed out.');
        } finally {
            setBusy(null);
        }
    };

    const used = data?.sessions.length ?? 0;
    const limit = data?.limit ?? null;

    return (
        <div className="um-dev">
            {msgHolder}
            <div className="um-dev-head">
                <h4><SafetyOutlined /> Signed-in devices</h4>
                <span>
                    {limit !== null ? `${used} of ${limit}` : used === 0 ? 'none' : `${used}`}
                    <Tooltip title="Refresh">
                        <Button type="text" size="small" icon={<ReloadOutlined />} onClick={() => { setLoading(true); load(); }} aria-label="Refresh devices" />
                    </Tooltip>
                </span>
            </div>

            {loading ? (
                <Skeleton active title={false} paragraph={{ rows: 2 }} />
            ) : error ? (
                <p className="um-dev-empty">{error} <Button type="link" size="small" onClick={() => { setLoading(true); load(); }}>Try again</Button></p>
            ) : (
                <>
                    {used === 0 ? (
                        <p className="um-dev-empty">{name} is not signed in on any device right now.</p>
                    ) : (
                        <ul className="um-dev-list">
                            {data!.sessions.map(s => (
                                <li key={s.id}>
                                    <span className="um-dev-ic" aria-hidden="true">{iconFor(s.device)}</span>
                                    <div>
                                        <strong>{s.device}</strong>
                                        <em>
                                            last used {sinceText(s.idle_seconds)} · signed in {sinceText(s.age_seconds)}
                                            {s.ip ? ` · ${s.ip}` : ''}
                                        </em>
                                    </div>
                                    <Popconfirm title="Sign out this device?" okText="Sign out" cancelText="Keep" onConfirm={() => revoke(s.id)}>
                                        <Button size="small" danger type="text" loading={busy === s.id}>Sign out</Button>
                                    </Popconfirm>
                                </li>
                            ))}
                        </ul>
                    )}

                    {!!data?.takeovers_today && (
                        <p className="um-dev-note">
                            Signed its other devices out {data.takeovers_today} time{data.takeovers_today === 1 ? '' : 's'} in the last 24 h
                            {data.takeovers_today >= data.takeovers_allowed ? ' — the limit for today, so they cannot do it again.' : '.'}
                        </p>
                    )}

                    {used > 0 && (
                        <Popconfirm
                            title={`Sign out every device of ${name}?`}
                            description="They will have to sign in again. Their exam answers are saved as they go."
                            okText="Sign out all"
                            cancelText="Cancel"
                            onConfirm={() => revoke()}
                        >
                            <Button size="small" danger block loading={busy === 'all'}>Sign out all devices</Button>
                        </Popconfirm>
                    )}
                </>
            )}
        </div>
    );
};

export default UserDevices;
