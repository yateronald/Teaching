import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Tooltip, Badge, Spin, Empty, Button, Popover, message } from 'antd';
import {
    BellOutlined,
    CheckOutlined,
    FileTextOutlined,
    FolderOpenOutlined,
    CalendarOutlined,
    VideoCameraOutlined,
    TeamOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    link: string | null;
    entity_type: string | null;
    entity_id: number | null;
    is_read: boolean;
    created_at: string;
    read_at: string | null;
}

const TYPE_ICON: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
    quiz_published:    { icon: <FileTextOutlined />,    color: '#6366f1', bg: 'rgba(99,102,241,0.10)' },
    resource_uploaded: { icon: <FolderOpenOutlined />,  color: '#f59e0b', bg: 'rgba(245,158,11,0.10)' },
    schedule_created:  { icon: <CalendarOutlined />,    color: '#0ea5e9', bg: 'rgba(14,165,233,0.10)' },
    batch_assigned:    { icon: <TeamOutlined />,        color: '#10b981', bg: 'rgba(16,185,129,0.10)' },
    demo_assigned:     { icon: <VideoCameraOutlined />, color: '#8b5cf6', bg: 'rgba(139,92,246,0.10)' },
};

const POLL_INTERVAL_MS = 30_000;

const formatRelative = (iso: string): string => {
    const now = Date.now();
    const then = new Date(iso).getTime();
    if (!Number.isFinite(then)) return '';
    const diff = Math.max(0, Math.floor((now - then) / 1000));
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(iso).toLocaleDateString();
};

interface BellProps {
    /** Visual variant: light (white bg, dark icons) for student layout, dark for admin/teacher */
    variant?: 'light' | 'dark';
}

const NotificationBell: React.FC<BellProps> = ({ variant = 'dark' }) => {
    const { apiCall } = useAuth();
    const navigate = useNavigate();
    const [items, setItems] = useState<Notification[]>([]);
    const [unread, setUnread] = useState(0);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const pollTimerRef = useRef<number | null>(null);
    const mountedRef = useRef(true);

    // Keep apiCall in a ref so polling doesn't restart on every render
    const apiCallRef = useRef(apiCall);
    useEffect(() => { apiCallRef.current = apiCall; }, [apiCall]);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await apiCallRef.current('/notifications?limit=15');
            if (!res.ok) return;
            const data = await res.json();
            if (!mountedRef.current) return;
            setItems(Array.isArray(data.items) ? data.items : []);
            setUnread(data.unread_count || 0);
        } catch {
            // silent — next poll will reconcile
        }
    }, []);

    // Initial load + polling for cross-device sync
    useEffect(() => {
        mountedRef.current = true;
        fetchNotifications();
        pollTimerRef.current = window.setInterval(fetchNotifications, POLL_INTERVAL_MS);
        return () => {
            mountedRef.current = false;
            if (pollTimerRef.current) window.clearInterval(pollTimerRef.current);
        };
    }, [fetchNotifications]);

    // Refresh on dropdown open (immediate sync)
    useEffect(() => {
        if (open) {
            setLoading(true);
            fetchNotifications().finally(() => setLoading(false));
        }
    }, [open, fetchNotifications]);

    const handleItemClick = async (n: Notification) => {
        setOpen(false);
        // Optimistically mark read
        if (!n.is_read) {
            setItems(prev => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x));
            setUnread(u => Math.max(0, u - 1));
            try {
                await apiCallRef.current(`/notifications/${n.id}/read`, { method: 'PATCH' });
            } catch {
                // ignore — next poll will reconcile
            }
        }
        if (n.link) navigate(n.link);
    };

    const handleMarkAllRead = async () => {
        if (unread === 0) return;
        setItems(prev => prev.map(x => ({ ...x, is_read: true })));
        setUnread(0);
        try {
            await apiCallRef.current('/notifications/mark-all-read', { method: 'POST' });
        } catch {
            message.error('Failed to mark all as read');
            fetchNotifications();
        }
    };

    // Light/dark color tokens
    const isLight = variant === 'light';
    const btnColor = isLight ? '#0f172a' : '#fff';
    const btnBg = isLight ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.12)';
    const btnBorder = isLight ? '1px solid rgba(16,185,129,0.18)' : '1px solid rgba(255,255,255,0.15)';

    const dropdownContent = (
        <div style={{
            width: 380,
            maxHeight: 520,
            background: '#fff',
            borderRadius: 16,
            border: '1px solid #e2e8f0',
            boxShadow: '0 24px 48px -12px rgba(15,23,42,0.18), 0 4px 12px -4px rgba(15,23,42,0.08)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
        }}>
            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 18px', borderBottom: '1px solid #f1f5f9',
            }}>
                <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Notifications</div>
                    {unread > 0 && (
                        <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 500 }}>
                            {unread} unread
                        </div>
                    )}
                </div>
                <Button
                    type="text" size="small"
                    icon={<CheckOutlined />}
                    onClick={handleMarkAllRead}
                    disabled={unread === 0}
                    style={{ fontSize: 12, fontWeight: 600, color: unread > 0 ? '#4338ca' : '#94a3b8' }}
                >
                    Mark all read
                </Button>
            </div>

            {/* List */}
            <div style={{ flex: 1, overflowY: 'auto', maxHeight: 440 }}>
                {loading && items.length === 0 ? (
                    <div style={{ padding: 36, textAlign: 'center' }}><Spin /></div>
                ) : items.length === 0 ? (
                    <Empty
                        description={<span style={{ color: '#94a3b8', fontSize: 13 }}>No notifications yet</span>}
                        style={{ padding: '36px 0' }}
                        imageStyle={{ height: 50 }}
                    />
                ) : items.map(n => {
                    const meta = TYPE_ICON[n.type] || TYPE_ICON.quiz_published;
                    return (
                        <button
                            key={n.id}
                            onClick={() => handleItemClick(n)}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 12,
                                padding: '12px 18px',
                                background: n.is_read ? '#fff' : 'rgba(99,102,241,0.04)',
                                border: 'none',
                                borderBottom: '1px solid #f1f5f9',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'background 0.15s ease',
                            }}
                            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#f8fafc'}
                            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = n.is_read ? '#fff' : 'rgba(99,102,241,0.04)'}
                        >
                            {/* Icon */}
                            <div style={{
                                width: 36, height: 36, borderRadius: 10,
                                background: meta.bg,
                                color: meta.color,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 16, flexShrink: 0,
                            }}>
                                {meta.icon}
                            </div>
                            {/* Content */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    fontSize: 13, fontWeight: n.is_read ? 600 : 700,
                                    color: n.is_read ? '#475569' : '#0f172a',
                                    lineHeight: 1.35, marginBottom: 2,
                                }}>
                                    {n.title}
                                </div>
                                <div style={{
                                    fontSize: 12, color: n.is_read ? '#94a3b8' : '#64748b',
                                    lineHeight: 1.4,
                                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                }}>
                                    {n.message}
                                </div>
                                <div style={{
                                    fontSize: 10.5, color: '#94a3b8', fontWeight: 600,
                                    marginTop: 4, letterSpacing: 0.2,
                                }}>
                                    {formatRelative(n.created_at)}
                                </div>
                            </div>
                            {/* Unread dot */}
                            {!n.is_read && (
                                <div style={{
                                    width: 8, height: 8, borderRadius: '50%',
                                    background: meta.color,
                                    marginTop: 14,
                                    boxShadow: `0 0 0 3px ${meta.bg}`,
                                    flexShrink: 0,
                                }} />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );

    return (
        <Popover
            open={open}
            onOpenChange={setOpen}
            trigger="click"
            placement="bottomRight"
            arrow={false}
            content={dropdownContent}
            styles={{
                root: { padding: 0 },
                body: { padding: 0, background: 'transparent', boxShadow: 'none' },
            }}
        >
            <Tooltip title="Notifications" placement="bottom">
                <Badge count={unread} size="small" offset={[-4, 4]} overflowCount={9}>
                    <Button
                        type="text"
                        aria-label="Notifications"
                        icon={<BellOutlined />}
                        style={{
                            width: 40, height: 40, borderRadius: 10,
                            color: btnColor,
                            background: btnBg,
                            border: btnBorder,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 16,
                        }}
                    />
                </Badge>
            </Tooltip>
        </Popover>
    );
};

export default NotificationBell;
