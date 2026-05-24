import React, { useState, useEffect } from 'react';
import { Layout as AntLayout, Dropdown, Button, Typography, Tooltip } from 'antd';
import {
    DashboardOutlined,
    UserOutlined,
    TeamOutlined,
    BookOutlined,
    FileTextOutlined,
    CalendarOutlined,
    FolderOutlined,
    LogoutOutlined,
    SettingOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    BarChartOutlined,
    PhoneOutlined,
    VideoCameraOutlined,
    RightOutlined,
    ReadOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { MenuProps } from 'antd';
import { ASSET_PATHS } from '../../utils/assets';
import NotificationBell from '../Notifications/NotificationBell';

const { Header, Content } = AntLayout;
const { Text } = Typography;

/* ── nav item definition ── */
interface NavItem {
    key: string;
    icon: React.ReactNode;
    label: string;
}

/* ── role pill colors ── */
const ROLE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
    admin:   { bg: '#fef3c7', text: '#b45309', dot: '#f59e0b' },
    teacher: { bg: '#eef2ff', text: '#4338ca', dot: '#6366f1' },
    student: { bg: '#dcfce7', text: '#15803d', dot: '#22c55e' },
};

const SIDEBAR_W = 240;
const SIDEBAR_W_COLLAPSED = 68;

/* ── Default (admin) sidebar — indigo gradient ── */
const SIDEBAR_STYLE: React.CSSProperties = {
    background: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)',
    position: 'fixed',
    left: 0, top: 0, bottom: 0,
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '4px 0 24px rgba(67,56,202,0.25)',
    overflowX: 'hidden',
    transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
};

/* ── Teacher-specific sidebar — sophisticated dark burgundy/crimson ── */
const TEACHER_SIDEBAR_STYLE: React.CSSProperties = {
    background: 'linear-gradient(180deg, #1a0a0d 0%, #3f1d1f 40%, #6b1d2a 100%)',
    position: 'fixed',
    left: 0, top: 0, bottom: 0,
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '4px 0 24px rgba(107,29,42,0.35)',
    overflowX: 'hidden',
    transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
};

/* ── Teacher accent palette ── */
const T_ACCENT_LIGHT = '#fb7185';  // rose-400
const T_ACCENT_GLOW = 'rgba(244,63,94,0.45)';
const T_HEADER_GRAD = 'linear-gradient(135deg, #1a0a0d 0%, #3f1d1f 50%, #881337 100%)';

/* ── Student-specific sidebar — light, fresh, emerald/teal palette ── */
const STUDENT_SIDEBAR_STYLE: React.CSSProperties = {
    background: '#ffffff',
    position: 'fixed',
    left: 12, top: 12, bottom: 12,
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 22,
    boxShadow: '0 24px 48px -16px rgba(15,23,42,0.10), 0 6px 16px -4px rgba(15,23,42,0.05), inset 0 1px 0 rgba(255,255,255,0.9)',
    border: '1px solid rgba(226,232,240,0.8)',
    overflowX: 'hidden',
    transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
};

/* ── Student brand palette ── */
const S_GRAD = 'linear-gradient(135deg, #10b981 0%, #06b6d4 50%, #0ea5e9 100%)';
const S_ACCENT = '#10b981';
const S_ACCENT_SOFT = 'rgba(16,185,129,0.08)';

/* ── Role → gradient used as avatar background when there is no photo ── */
const ROLE_GRADIENT: Record<string, string> = {
    admin:   'linear-gradient(135deg, #f59e0b, #d97706)',
    teacher: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    student: 'linear-gradient(135deg, #10b981, #06b6d4)',
};

/* ── Build the absolute URL for a user's profile photo (token in query string
       since <img> tags can't send Authorization headers). The kDrive file id
       is mixed into the cache key so the browser refetches when it changes. ── */
const buildPhotoUrl = (userId: number, token: string | null, cacheKey?: string | null) => {
    const apiBase = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5000/api';
    const t = token ? `&token=${encodeURIComponent(token)}` : '';
    const v = cacheKey ? encodeURIComponent(cacheKey) : '1';
    return `${apiBase}/auth/profile-photo/${userId}?v=${v}${t}`;
};

/* ── Reusable avatar that shows the photo if available, otherwise a gradient
       circle with the user icon. ── */
interface RoleAvatarProps {
    user: any;
    token: string | null;
    size?: number;
    border?: string;
    boxShadow?: string;
    iconFontSize?: number;
}

const RoleAvatar: React.FC<RoleAvatarProps> = ({
    user, token, size = 38, border = '2px solid rgba(255,255,255,0.9)',
    boxShadow, iconFontSize,
}) => {
    const [errored, setErrored] = React.useState(false);
    React.useEffect(() => { setErrored(false); }, [user?.id, user?.profile_photo_kdrive_file_id]);

    const hasPhoto = !!user?.profile_photo_kdrive_file_id && !errored;
    const gradient = ROLE_GRADIENT[user?.role] || ROLE_GRADIENT.student;
    const computedIconFontSize = iconFontSize ?? Math.round(size * 0.45);

    return (
        <div style={{
            width: size, height: size, borderRadius: '50%',
            background: hasPhoto ? '#e2e8f0' : gradient,
            border,
            boxShadow: boxShadow ?? '0 2px 8px rgba(15,23,42,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', overflow: 'hidden', flexShrink: 0,
        }}>
            {hasPhoto ? (
                <img
                    src={buildPhotoUrl(user.id, token, user?.profile_photo_kdrive_file_id)}
                    alt="Profile"
                    onError={() => setErrored(true)}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
            ) : (
                <UserOutlined style={{ fontSize: computedIconFontSize, color: '#fff' }} />
            )}
        </div>
    );
};

/* ──────────────────────────────────────────────────────────────────
   STUDENT-ONLY SIDEBAR
   Floating white card with emerald/teal/cyan accents.
   Distinct from admin/teacher: lighter, more energetic, focused
   on motivation and progress.
   ────────────────────────────────────────────────────────────────── */
interface StudentSidebarProps {
    collapsed: boolean;
    sideW: number;
    user: any;
    token: string | null;
    initials: string;
    navItems: NavItem[];
    location: { pathname: string };
    navigate: (path: string) => void;
    userMenuItems: MenuProps['items'];
}

const StudentSidebar: React.FC<StudentSidebarProps> = ({
    collapsed, sideW, user, token, navItems, location, navigate, userMenuItems
}) => {
    const firstName = user?.first_name || 'Student';

    return (
        <div style={{ ...STUDENT_SIDEBAR_STYLE, width: sideW }}>
            {/* ── Brand mark ── */}
            <div style={{
                padding: collapsed ? '18px 0' : '20px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: 12,
                flexShrink: 0,
            }}>
                <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: S_GRAD,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 8px 18px -4px rgba(16,185,129,0.45), inset 0 1px 0 rgba(255,255,255,0.25)',
                }}>
                    <img src={ASSET_PATHS.LOGOS.MAIN} alt="logo" style={{ width: 24, height: 24, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                </div>
                {!collapsed && (
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: '#0f172a', lineHeight: 1.2, fontWeight: 800, letterSpacing: -0.2, whiteSpace: 'nowrap' }}>
                            Learn French
                        </div>
                        <div style={{ fontSize: 10, color: S_ACCENT, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 }}>
                            Student space
                        </div>
                    </div>
                )}
            </div>

            {/* ── Welcome banner (only when expanded) ── */}
            {!collapsed && (
                <div style={{
                    margin: '4px 14px 16px',
                    padding: '14px 16px',
                    borderRadius: 16,
                    background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdfa 50%, #ecfeff 100%)',
                    border: '1px solid rgba(16,185,129,0.18)',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    <div style={{
                        position: 'absolute', top: -20, right: -20,
                        width: 80, height: 80, borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(16,185,129,0.18), transparent 70%)',
                        pointerEvents: 'none',
                    }} />
                    <div style={{ fontSize: 11, fontWeight: 700, color: S_ACCENT, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 4 }}>
                        Bienvenue 👋
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', letterSpacing: -0.2, lineHeight: 1.3 }}>
                        Hi, {firstName}!
                    </div>
                    <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 500, marginTop: 3 }}>
                        Ready to learn today?
                    </div>
                </div>
            )}

            {/* ── Section label ── */}
            {!collapsed && (
                <div style={{
                    padding: '0 18px 8px',
                    fontSize: 10,
                    fontWeight: 800,
                    color: '#94a3b8',
                    letterSpacing: 1.4,
                    textTransform: 'uppercase',
                }}>
                    Learning
                </div>
            )}

            {/* ── Nav items ── */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                padding: collapsed ? '4px 8px' : '0 10px',
            }}>
                {navItems.map(item => {
                    const active = location.pathname === item.key || location.pathname.startsWith(item.key + '/');
                    const navBtn = (
                        <button
                            key={item.key}
                            onClick={() => navigate(item.key)}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: collapsed ? '10px 0' : '10px 12px',
                                marginBottom: 3,
                                borderRadius: 12,
                                border: 'none',
                                cursor: 'pointer',
                                background: active ? S_ACCENT_SOFT : 'transparent',
                                boxShadow: active ? `inset 0 0 0 1px rgba(16,185,129,0.2)` : 'none',
                                transition: 'all 0.18s ease',
                                justifyContent: collapsed ? 'center' : 'flex-start',
                                position: 'relative',
                                outline: 'none',
                            }}
                            onMouseEnter={e => {
                                if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(15,23,42,0.04)';
                            }}
                            onMouseLeave={e => {
                                if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                            }}
                        >
                            {/* Active left bar */}
                            {active && !collapsed && (
                                <div style={{
                                    position: 'absolute', left: -10, top: '20%', bottom: '20%',
                                    width: 3, borderRadius: '0 3px 3px 0',
                                    background: S_GRAD,
                                }} />
                            )}
                            {/* Icon */}
                            <div style={{
                                width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: active ? S_GRAD : '#f1f5f9',
                                color: active ? '#fff' : '#475569',
                                fontSize: 15,
                                transition: 'all 0.18s ease',
                                boxShadow: active ? '0 6px 14px -4px rgba(16,185,129,0.45)' : 'none',
                            }}>
                                {item.icon}
                            </div>
                            {/* Label */}
                            {!collapsed && (
                                <span style={{
                                    fontSize: 13.5,
                                    fontWeight: active ? 700 : 600,
                                    color: active ? '#0f172a' : '#475569',
                                    letterSpacing: -0.1,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    transition: 'color 0.18s ease',
                                }}>
                                    {item.label}
                                </span>
                            )}
                            {/* Active dot at the right */}
                            {active && !collapsed && (
                                <div style={{
                                    marginLeft: 'auto',
                                    width: 6, height: 6, borderRadius: '50%',
                                    background: S_ACCENT,
                                    boxShadow: `0 0 0 3px rgba(16,185,129,0.18)`,
                                }} />
                            )}
                        </button>
                    );
                    return collapsed
                        ? <Tooltip key={item.key} title={item.label} placement="right">{navBtn}</Tooltip>
                        : <React.Fragment key={item.key}>{navBtn}</React.Fragment>;
                })}
            </div>

            {/* ── User card at bottom ── */}
            <div style={{ padding: collapsed ? '12px 8px' : '14px 12px', flexShrink: 0 }}>
                <Dropdown menu={{ items: userMenuItems }} placement="topRight" trigger={['click']}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: collapsed ? '10px 0' : '10px 12px',
                        borderRadius: 14,
                        background: '#f8fafc',
                        cursor: 'pointer',
                        border: '1px solid #e2e8f0',
                        transition: 'all 0.18s ease',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                    }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLDivElement).style.background = '#f0fdf4';
                            (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(16,185,129,0.3)';
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLDivElement).style.background = '#f8fafc';
                            (e.currentTarget as HTMLDivElement).style.borderColor = '#e2e8f0';
                        }}
                    >
                        <RoleAvatar
                            user={user}
                            token={token}
                            size={34}
                            iconFontSize={16}
                            border="none"
                            boxShadow="0 4px 10px -2px rgba(16,185,129,0.4)"
                        />
                        {!collapsed && (
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                    fontSize: 12.5, fontWeight: 700, color: '#0f172a',
                                    lineHeight: 1.3, whiteSpace: 'nowrap',
                                    overflow: 'hidden', textOverflow: 'ellipsis',
                                }}>
                                    {user?.first_name} {user?.last_name}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                                    <div style={{
                                        width: 6, height: 6, borderRadius: '50%',
                                        background: S_ACCENT,
                                        boxShadow: `0 0 0 2.5px rgba(16,185,129,0.2)`,
                                        flexShrink: 0,
                                    }} />
                                    <span style={{ fontSize: 10.5, color: '#64748b', fontWeight: 600 }}>
                                        Student
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </Dropdown>
            </div>
        </div>
    );
};

const Layout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(() => window.innerWidth <= 1024);
    const { user, logout, isAdmin, isTeacher, isStudent, token } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Auto-collapse sidebar on tablet/small screens
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 1024) setCollapsed(true);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    /* ── page title ── */
    const getPageTitle = (path: string): string => {
        const p = path.startsWith('/app') ? path.replace(/^\/app/, '') || '/' : path;
        const MAP: Record<string, string> = {
            '/profile': 'Profile Settings',
            '/dashboard': 'Dashboard',
            '/users': 'User Management',
            '/batches': 'Batch Management',
            '/demo-requests': 'Demo Requests',
            '/timetable': 'Teacher Timetable',
            '/attendance': 'Attendance Management',
            '/settings': 'Admin Settings',
            '/admin-resources': 'Resources',
            '/exam-preparation': 'Exam Preparation',
            '/teacher-dashboard': 'Dashboard',
            '/teacher-batches': 'My Batches',
            '/quiz-management': 'Quiz Management',
            '/resources': 'Resources',
            '/schedules': 'Schedule',
            '/meetings': 'Live Meetings',
            '/meeting-attendance': 'Meeting Attendance',
            '/student-dashboard': 'Dashboard',
            '/my-quizzes': 'My Quizzes',
            '/my-results': 'My Results',
            '/my-marksheet': 'Marksheet',
            '/my-resources': 'Resources',
            '/my-schedule': 'My Schedule',
            '/my-exams': 'Exam Preparation',
        };
        if (/^\/batches\/[\w-]+\/insights/.test(p)) return 'Batch Insights';
        return MAP[p] || MAP['/' + p.split('/')[1]] || 'Dashboard';
    };

    useEffect(() => {
        document.title = getPageTitle(location.pathname);
    }, [location.pathname]);

    /* ── nav items per role ── */
    const getNavItems = (): NavItem[] => {
        if (isAdmin) return [
            { key: '/app/dashboard',       icon: <DashboardOutlined />,  label: 'Dashboard' },
            { key: '/app/users',           icon: <UserOutlined />,       label: 'User Management' },
            { key: '/app/batches',         icon: <TeamOutlined />,       label: 'Batch Management' },
            { key: '/app/demo-requests',   icon: <PhoneOutlined />,      label: 'Demo Requests' },
            { key: '/app/timetable',       icon: <CalendarOutlined />,   label: 'Teacher Timetable' },
            { key: '/app/attendance',      icon: <BarChartOutlined />,   label: 'Attendance' },
            { key: '/app/admin-resources', icon: <FolderOutlined />,     label: 'Resources' },
            { key: '/app/exam-preparation', icon: <ReadOutlined />,      label: 'Exam Preparation' },
            { key: '/app/settings',        icon: <SettingOutlined />,    label: 'Settings' },
        ];
        if (isTeacher) return [
            { key: '/app/teacher-dashboard', icon: <DashboardOutlined />,    label: 'Dashboard' },
            { key: '/app/teacher-batches',   icon: <TeamOutlined />,         label: 'My Batches' },
            { key: '/app/assign-demo',       icon: <VideoCameraOutlined />,  label: 'Assign Demo' },
            { key: '/app/quiz-management',   icon: <FileTextOutlined />,     label: 'Quiz Management' },
            { key: '/app/resources',         icon: <FolderOutlined />,       label: 'Resources' },
            { key: '/app/schedules',         icon: <CalendarOutlined />,     label: 'Schedule' },
            { key: '/app/meetings',          icon: <PhoneOutlined />,        label: 'Live Meetings' },
            { key: '/app/profile',           icon: <SettingOutlined />,      label: 'Profile Settings' },
        ];
        if (isStudent) return [
            { key: '/app/student-dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
            { key: '/app/my-quizzes',        icon: <FileTextOutlined />,  label: 'My Quizzes' },
            { key: '/app/my-results',        icon: <BookOutlined />,      label: 'My Results' },
            { key: '/app/my-marksheet',      icon: <BarChartOutlined />,  label: 'Marksheet' },
            { key: '/app/my-resources',      icon: <FolderOutlined />,    label: 'Resources' },
            { key: '/app/my-schedule',       icon: <CalendarOutlined />,  label: 'My Schedule' },
            { key: '/app/my-exams',          icon: <ReadOutlined />,      label: 'Exam Preparation' },
            { key: '/app/meetings',          icon: <PhoneOutlined />,     label: 'Live Meetings' },
            { key: '/app/profile',           icon: <SettingOutlined />,   label: 'Profile Settings' },
        ];
        return [];
    };

    const handleLogout = () => { logout(); navigate('/login'); };

    const userMenuItems: MenuProps['items'] = [
        { key: 'profile', icon: <SettingOutlined />, label: 'Profile Settings', onClick: () => navigate('/app/profile') },
        { type: 'divider' },
        { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true, onClick: handleLogout },
    ];

    const getRoleDisplayName = (role: string) => ({ admin: 'Administrator', teacher: 'Teacher', student: 'Student' }[role] || role);
    const roleStyle = ROLE_COLORS[user?.role || ''] || ROLE_COLORS.student;

    const initials = user ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() : '?';
    const navItems = getNavItems();
    const sideW = collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W;

    return (
        <AntLayout style={{ minHeight: '100vh', background: isStudent ? '#f0fdfa' : isTeacher ? '#fef2f2' : '#f4f6fb' }}>

            {/* ════════════════════════════════════
                    SIDEBAR — branches on role
            ════════════════════════════════════ */}
            {isStudent ? (
                <StudentSidebar
                    collapsed={collapsed}
                    sideW={sideW}
                    user={user}
                    token={token}
                    initials={initials}
                    navItems={navItems}
                    location={location}
                    navigate={navigate}
                    userMenuItems={userMenuItems}
                />
            ) : (
            <div style={{ ...(isTeacher ? TEACHER_SIDEBAR_STYLE : SIDEBAR_STYLE), width: sideW }}>

                {/* Logo area */}
                <div style={{
                    height: 72, display: 'flex', alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    padding: collapsed ? '0' : '0 20px',
                    borderBottom: isTeacher ? '1px solid rgba(244,63,94,0.18)' : '1px solid rgba(255,255,255,0.1)',
                    flexShrink: 0,
                    background: isTeacher ? T_HEADER_GRAD : 'transparent',
                }}>
                    {collapsed ? (
                        <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: isTeacher ? 'linear-gradient(135deg, #f43f5e, #e11d48)' : 'rgba(255,255,255,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: isTeacher ? '0 6px 14px -4px rgba(244,63,94,0.5)' : 'none',
                        }}>
                            <img src={ASSET_PATHS.LOGOS.MAIN} alt="logo" style={{ width: 24, height: 24, objectFit: 'contain' }} />
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                                width: 38, height: 38, borderRadius: 10,
                                background: isTeacher ? 'linear-gradient(135deg, #f43f5e, #e11d48)' : 'rgba(255,255,255,0.15)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                                boxShadow: isTeacher ? '0 6px 14px -4px rgba(244,63,94,0.5)' : 'none',
                            }}>
                                <img src={ASSET_PATHS.LOGOS.MAIN} alt="logo" style={{ width: 26, height: 26, objectFit: 'contain' }} />
                            </div>
                            <div>
                                <div style={{ fontSize: 13, color: '#fff', lineHeight: 1.2, letterSpacing: 0.2, whiteSpace: 'nowrap' }}>
                                    <span style={{ fontWeight: 800 }}>LearnFrench</span>
                                    <span style={{ fontWeight: 400, opacity: 0.9 }}>WithNative</span>
                                </div>
                                <div style={{
                                    fontSize: 10,
                                    color: isTeacher ? T_ACCENT_LIGHT : 'rgba(255,255,255,0.55)',
                                    fontWeight: 700,
                                    letterSpacing: 1,
                                    textTransform: 'uppercase',
                                }}>
                                    {isAdmin ? 'ADMIN PORTAL' : isTeacher ? 'TEACHER PORTAL' : isStudent ? 'STUDENT PORTAL' : 'PORTAL'}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Nav section label */}
                {!collapsed && (
                    <div style={{ padding: '18px 20px 8px', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: 1.2, textTransform: 'uppercase' }}>
                        Navigation
                    </div>
                )}
                {collapsed && <div style={{ height: 16 }} />}

                {/* Nav items */}
                <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: collapsed ? '0 10px' : '0 12px' }}>
                    {navItems.map(item => {
                        const active = location.pathname === item.key || location.pathname.startsWith(item.key + '/');
                        const navBtn = (
                            <button
                                key={item.key}
                                onClick={() => navigate(item.key)}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    padding: collapsed ? '11px 0' : '11px 14px',
                                    marginBottom: 4,
                                    borderRadius: 12,
                                    border: 'none',
                                    cursor: 'pointer',
                                    background: active
                                        ? (isTeacher ? 'rgba(244,63,94,0.18)' : 'rgba(255,255,255,0.18)')
                                        : 'transparent',
                                    backdropFilter: active ? 'blur(8px)' : 'none',
                                    boxShadow: active
                                        ? (isTeacher
                                            ? `0 2px 12px ${T_ACCENT_GLOW}, inset 0 1px 0 rgba(255,255,255,0.1)`
                                            : '0 2px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.15)')
                                        : 'none',
                                    transition: 'all 0.18s ease',
                                    justifyContent: collapsed ? 'center' : 'flex-start',
                                    position: 'relative',
                                    outline: 'none',
                                }}
                                onMouseEnter={e => {
                                    if (!active) (e.currentTarget as HTMLButtonElement).style.background = isTeacher ? 'rgba(244,63,94,0.08)' : 'rgba(255,255,255,0.09)';
                                }}
                                onMouseLeave={e => {
                                    if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                                }}
                            >
                                {/* Active left bar */}
                                {active && !collapsed && (
                                    <div style={{
                                        position: 'absolute', left: 0, top: '20%', bottom: '20%',
                                        width: 3, borderRadius: '0 3px 3px 0',
                                        background: isTeacher ? T_ACCENT_LIGHT : '#a5b4fc',
                                    }} />
                                )}
                                {/* Icon */}
                                <div style={{
                                    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: active
                                        ? (isTeacher
                                            ? 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)'
                                            : 'rgba(255,255,255,0.22)')
                                        : 'rgba(255,255,255,0.07)',
                                    color: active ? '#fff' : 'rgba(255,255,255,0.6)',
                                    fontSize: 16,
                                    transition: 'all 0.18s ease',
                                    boxShadow: active && isTeacher ? '0 6px 14px -4px rgba(244,63,94,0.5)' : 'none',
                                }}>
                                    {item.icon}
                                </div>
                                {/* Label */}
                                {!collapsed && (
                                    <span style={{
                                        fontSize: 13.5, fontWeight: active ? 700 : 500,
                                        color: active ? '#fff' : 'rgba(255,255,255,0.72)',
                                        letterSpacing: 0.1,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        transition: 'all 0.18s ease',
                                    }}>
                                        {item.label}
                                    </span>
                                )}
                                {/* Arrow indicator for active */}
                                {active && !collapsed && (
                                    <RightOutlined style={{ marginLeft: 'auto', fontSize: 10, color: 'rgba(255,255,255,0.5)' }} />
                                )}
                            </button>
                        );
                        return collapsed
                            ? <Tooltip key={item.key} title={item.label} placement="right">{navBtn}</Tooltip>
                            : <React.Fragment key={item.key}>{navBtn}</React.Fragment>;
                    })}
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '8px 16px' }} />

                {/* User card at bottom */}
                <div style={{ padding: collapsed ? '12px 10px' : '12px 12px', flexShrink: 0 }}>
                    <Dropdown menu={{ items: userMenuItems }} placement="topRight" trigger={['click']}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: collapsed ? '10px 0' : '10px 12px',
                            borderRadius: 14,
                            background: isTeacher ? 'rgba(244,63,94,0.10)' : 'rgba(255,255,255,0.1)',
                            cursor: 'pointer',
                            border: isTeacher ? '1px solid rgba(244,63,94,0.18)' : '1px solid rgba(255,255,255,0.1)',
                            transition: 'all 0.18s ease',
                            justifyContent: collapsed ? 'center' : 'flex-start',
                        }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLDivElement).style.background = isTeacher ? 'rgba(244,63,94,0.18)' : 'rgba(255,255,255,0.18)';
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLDivElement).style.background = isTeacher ? 'rgba(244,63,94,0.10)' : 'rgba(255,255,255,0.1)';
                            }}
                        >
                            <RoleAvatar
                                user={user}
                                token={token}
                                size={34}
                                iconFontSize={16}
                                border="none"
                            />
                            {!collapsed && (
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {user?.first_name} {user?.last_name}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: roleStyle.dot, flexShrink: 0 }} />
                                        <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>
                                            {getRoleDisplayName(user?.role || '')}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Dropdown>
                </div>
            </div>
            )}

            {/* ════════════════════════════════════
                    MAIN AREA
            ════════════════════════════════════ */}
            <AntLayout style={{ marginLeft: isStudent ? sideW + 24 : sideW, transition: 'margin-left 0.25s cubic-bezier(0.4,0,0.2,1)' }}>

                {/* Top header */}
                <Header style={{
                    padding: '0 24px',
                    background: isStudent
                        ? '#ffffff'
                        : (isTeacher
                            ? T_HEADER_GRAD
                            : 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: isStudent
                        ? '0 1px 0 rgba(15,23,42,0.05)'
                        : (isTeacher
                            ? '0 2px 16px rgba(107,29,42,0.3)'
                            : '0 2px 16px rgba(67,56,202,0.2)'),
                    position: 'fixed',
                    top: isStudent ? 12 : 0,
                    right: isStudent ? 12 : 0,
                    left: isStudent ? sideW + 24 : sideW,
                    zIndex: 99,
                    transition: 'left 0.25s cubic-bezier(0.4,0,0.2,1)',
                    height: 64,
                    borderRadius: isStudent ? 22 : 0,
                    border: isStudent ? '1px solid rgba(226,232,240,0.8)' : 'none',
                }}>
                    {/* Collapse toggle */}
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            fontSize: 16, width: 40, height: 40,
                            color: isStudent ? '#0f172a' : '#fff',
                            borderRadius: 10,
                            background: isStudent ? S_ACCENT_SOFT : 'rgba(255,255,255,0.12)',
                            border: isStudent ? '1px solid rgba(16,185,129,0.18)' : '1px solid rgba(255,255,255,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    />

                    {/* Page title */}
                    <div style={{ flex: 1, paddingLeft: 16 }}>
                        <Text style={{ fontSize: 17, fontWeight: 700, color: isStudent ? '#0f172a' : '#fff', letterSpacing: 0.2 }}>
                            {getPageTitle(location.pathname)}
                        </Text>
                    </div>

                    {/* ── Header right cluster: bell • user avatar ── */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

                        {/* Notifications */}
                        <NotificationBell variant={isStudent ? 'light' : 'dark'} />

                        {/* User avatar / dropdown */}
                        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
                            <button
                                type="button"
                                aria-label="Open user menu"
                                style={{
                                    background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', borderRadius: '50%',
                                    outline: 'none',
                                }}
                            >
                                <RoleAvatar
                                    user={user}
                                    token={token}
                                    size={38}
                                    iconFontSize={18}
                                    border="2px solid #ffffff"
                                    boxShadow={isStudent
                                        ? '0 2px 8px rgba(15,23,42,0.10)'
                                        : '0 2px 8px rgba(0,0,0,0.25)'}
                                />
                            </button>
                        </Dropdown>
                    </div>


                </Header>

                {/* Page content */}
                <Content style={{
                    margin: isStudent
                        ? `${64 + 24 + 12}px 12px 12px`
                        : `${64 + 20}px 20px 20px`,
                    padding: '24px',
                    background: '#fff',
                    borderRadius: 16,
                    minHeight: 'calc(100vh - 104px)',
                    boxShadow: isStudent
                        ? '0 6px 24px -8px rgba(15,23,42,0.06)'
                        : '0 2px 16px rgba(99,102,241,0.06)',
                    overflow: 'auto',
                }}>
                    <Outlet />
                </Content>
            </AntLayout>

            <style>{`
                /* Smooth scrollbar for sidebar */
                .ant-layout-sider-children::-webkit-scrollbar { width: 4px; }
                .ant-layout-sider-children::-webkit-scrollbar-track { background: transparent; }
                .ant-layout-sider-children::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }

                /* Remove default Ant menu hover bg bleed */
                .ant-menu-item:hover, .ant-menu-item-active { background: transparent !important; }
            `}</style>
        </AntLayout>
    );
};

export default Layout;