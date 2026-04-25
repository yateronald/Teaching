import React, { useState, useEffect } from 'react';
import { Layout as AntLayout, Avatar, Dropdown, Button, Typography, Tooltip } from 'antd';
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
    RightOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { MenuProps } from 'antd';
import { ASSET_PATHS } from '../../utils/assets';

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

const Layout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(() => window.innerWidth <= 1024);
    const { user, logout, isAdmin, isTeacher, isStudent } = useAuth();
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
            '/profile': 'Profile',
            '/dashboard': 'Dashboard',
            '/users': 'User Management',
            '/batches': 'Batch Management',
            '/demo-requests': 'Demo Requests',
            '/timetable': 'Teacher Timetable',
            '/attendance': 'Attendance Management',
            '/settings': 'Admin Settings',
            '/admin-resources': 'Resources',
            '/teacher-dashboard': 'Dashboard',
            '/teacher-batches': 'My Batches',
            '/quiz-management': 'Quiz Management',
            '/resources': 'Resources',
            '/schedules': 'Schedule',
            '/student-dashboard': 'Dashboard',
            '/my-quizzes': 'My Quizzes',
            '/my-results': 'My Results',
            '/my-marksheet': 'Marksheet',
            '/my-resources': 'Resources',
            '/my-schedule': 'My Schedule',
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
            { key: '/app/settings',        icon: <SettingOutlined />,    label: 'Settings' },
        ];
        if (isTeacher) return [
            { key: '/app/teacher-dashboard', icon: <DashboardOutlined />,    label: 'Dashboard' },
            { key: '/app/teacher-batches',   icon: <TeamOutlined />,         label: 'My Batches' },
            { key: '/app/assign-demo',       icon: <VideoCameraOutlined />,  label: 'Assign Demo' },
            { key: '/app/quiz-management',   icon: <FileTextOutlined />,     label: 'Quiz Management' },
            { key: '/app/resources',         icon: <FolderOutlined />,       label: 'Resources' },
            { key: '/app/schedules',         icon: <CalendarOutlined />,     label: 'Schedule' },
        ];
        if (isStudent) return [
            { key: '/app/student-dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
            { key: '/app/my-quizzes',        icon: <FileTextOutlined />,  label: 'My Quizzes' },
            { key: '/app/my-results',        icon: <BookOutlined />,      label: 'My Results' },
            { key: '/app/my-marksheet',      icon: <BarChartOutlined />,  label: 'Marksheet' },
            { key: '/app/my-resources',      icon: <FolderOutlined />,    label: 'Resources' },
            { key: '/app/my-schedule',       icon: <CalendarOutlined />,  label: 'My Schedule' },
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
        <AntLayout style={{ minHeight: '100vh', background: '#f4f6fb' }}>

            {/* ════════════════════════════════════
                    PREMIUM SIDEBAR
            ════════════════════════════════════ */}
            <div style={{ ...SIDEBAR_STYLE, width: sideW }}>

                {/* Logo area */}
                <div style={{
                    height: 72, display: 'flex', alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    padding: collapsed ? '0' : '0 20px',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    flexShrink: 0,
                }}>
                    {collapsed ? (
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src={ASSET_PATHS.LOGOS.MAIN} alt="logo" style={{ width: 24, height: 24, objectFit: 'contain' }} />
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <img src={ASSET_PATHS.LOGOS.MAIN} alt="logo" style={{ width: 26, height: 26, objectFit: 'contain' }} />
                            </div>
                            <div>
                                <div style={{ fontSize: 13, color: '#fff', lineHeight: 1.2, letterSpacing: 0.2, whiteSpace: 'nowrap' }}>
                                    <span style={{ fontWeight: 800 }}>LearnFrench</span>
                                    <span style={{ fontWeight: 400, opacity: 0.9 }}>WithNative</span>
                                </div>
                                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: 500, letterSpacing: 0.5 }}>
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
                                        ? 'rgba(255,255,255,0.18)'
                                        : 'transparent',
                                    backdropFilter: active ? 'blur(8px)' : 'none',
                                    boxShadow: active ? '0 2px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.15)' : 'none',
                                    transition: 'all 0.18s ease',
                                    justifyContent: collapsed ? 'center' : 'flex-start',
                                    position: 'relative',
                                    outline: 'none',
                                }}
                                onMouseEnter={e => {
                                    if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.09)';
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
                                        background: '#a5b4fc',
                                    }} />
                                )}
                                {/* Icon */}
                                <div style={{
                                    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: active ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.07)',
                                    color: active ? '#fff' : 'rgba(255,255,255,0.6)',
                                    fontSize: 16,
                                    transition: 'all 0.18s ease',
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
                            background: 'rgba(255,255,255,0.1)',
                            cursor: 'pointer',
                            border: '1px solid rgba(255,255,255,0.1)',
                            transition: 'all 0.18s ease',
                            justifyContent: collapsed ? 'center' : 'flex-start',
                        }}
                            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.18)'}
                            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.1)'}
                        >
                            <Avatar size={34} style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                                {initials}
                            </Avatar>
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

            {/* ════════════════════════════════════
                    MAIN AREA
            ════════════════════════════════════ */}
            <AntLayout style={{ marginLeft: sideW, transition: 'margin-left 0.25s cubic-bezier(0.4,0,0.2,1)' }}>

                {/* Top header */}
                <Header style={{
                    padding: '0 24px',
                    background: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 16px rgba(67,56,202,0.2)',
                    position: 'fixed',
                    top: 0, right: 0,
                    left: sideW,
                    zIndex: 99,
                    transition: 'left 0.25s cubic-bezier(0.4,0,0.2,1)',
                    height: 64,
                }}>
                    {/* Collapse toggle */}
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            fontSize: 16, width: 40, height: 40, color: '#fff',
                            borderRadius: 10,
                            background: 'rgba(255,255,255,0.12)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    />

                    {/* Page title */}
                    <div style={{ flex: 1, paddingLeft: 16 }}>
                        <Text style={{ fontSize: 17, fontWeight: 700, color: '#fff', letterSpacing: 0.2 }}>
                            {getPageTitle(location.pathname)}
                        </Text>
                    </div>


                </Header>

                {/* Page content */}
                <Content style={{
                    margin: `${64 + 20}px 20px 20px`,
                    padding: '24px',
                    background: '#fff',
                    borderRadius: 16,
                    minHeight: 'calc(100vh - 104px)',
                    boxShadow: '0 2px 16px rgba(99,102,241,0.06)',
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