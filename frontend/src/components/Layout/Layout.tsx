import React, { Suspense, useEffect, useState } from 'react';
import { Dropdown, Button, Tooltip, Drawer } from 'antd';
import type { MenuProps } from 'antd';
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
    MenuOutlined,
    CloseOutlined,
    DownOutlined,
    ScheduleOutlined,
    TrophyOutlined,
} from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from '../Notifications/NotificationBell';
import useResponsive from '../../hooks/useResponsive';
import { useActiveMeeting } from '../../hooks/useActiveMeeting';
import MeetingLobbyWatcher from '../Meeting/MeetingLobbyWatcher';
import './Layout.css';

/* ══════════════════════════════════════════
   App shell: fixed sidebar + fixed top bar + content card.
   One structure for every role; each role only changes the accent colour
   (see .al-role-* in Layout.css). Geometry lives in layoutMetrics.ts.
══════════════════════════════════════════ */

type Role = 'admin' | 'teacher' | 'student' | 'candidate';

interface NavItem { key: string; icon: React.ReactNode; label: string; }
interface NavGroup { label: string; items: NavItem[]; }

const SIDEBAR_W = 256;
const SIDEBAR_W_COLLAPSED = 72;
const COLLAPSE_PREF_KEY = 'lfn.sidebar.collapsed';
const BRAND = 'Learn French with Natives';

const ROLE_META: Record<Role, { portal: string; roleName: string; home: string }> = {
    admin: { portal: 'Admin console', roleName: 'Administrator', home: '/app/dashboard' },
    teacher: { portal: 'Teacher space', roleName: 'Teacher', home: '/app/teacher-dashboard' },
    student: { portal: 'Student space', roleName: 'Student', home: '/app/student-dashboard' },
    candidate: { portal: 'Exam space', roleName: 'Exam candidate', home: '/app/exam-home' },
};

const NAV: Record<Role, NavGroup[]> = {
    admin: [
        {
            label: 'Management',
            items: [
                { key: '/app/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
                { key: '/app/users', icon: <UserOutlined />, label: 'Users' },
                { key: '/app/batches', icon: <TeamOutlined />, label: 'Batches' },
                { key: '/app/demo-requests', icon: <PhoneOutlined />, label: 'Demo Requests' },
                { key: '/app/timetable', icon: <CalendarOutlined />, label: 'Teacher Timetable' },
                { key: '/app/attendance', icon: <BarChartOutlined />, label: 'Attendance' },
            ],
        },
        {
            label: 'Content',
            items: [
                { key: '/app/admin-resources', icon: <FolderOutlined />, label: 'Resources' },
                { key: '/app/exam-preparation', icon: <ReadOutlined />, label: 'Exam Preparation' },
            ],
        },
        {
            label: 'System',
            items: [{ key: '/app/settings', icon: <SettingOutlined />, label: 'Settings' }],
        },
    ],
    teacher: [
        {
            label: 'Teaching',
            items: [
                { key: '/app/teacher-dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
                { key: '/app/teacher-batches', icon: <TeamOutlined />, label: 'My Batches' },
                { key: '/app/quiz-management', icon: <FileTextOutlined />, label: 'Quiz Management' },
                { key: '/app/teacher-exam-prep', icon: <ReadOutlined />, label: 'Exam Preparation' },
                { key: '/app/resources', icon: <FolderOutlined />, label: 'Resources' },
            ],
        },
        {
            label: 'Sessions',
            items: [
                { key: '/app/schedules', icon: <CalendarOutlined />, label: 'Schedule' },
                { key: '/app/meetings', icon: <VideoCameraOutlined />, label: 'Live Meetings' },
                { key: '/app/assign-demo', icon: <PhoneOutlined />, label: 'Assign Demo' },
            ],
        },
        {
            label: 'Account',
            items: [{ key: '/app/profile', icon: <SettingOutlined />, label: 'Profile Settings' }],
        },
    ],
    student: [
        {
            label: 'Learning',
            items: [
                { key: '/app/student-dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
                { key: '/app/my-quizzes', icon: <FileTextOutlined />, label: 'My Quizzes' },
                { key: '/app/my-exams', icon: <ReadOutlined />, label: 'Exam Preparation' },
                { key: '/app/my-resources', icon: <FolderOutlined />, label: 'Resources' },
            ],
        },
        {
            label: 'Progress',
            items: [
                { key: '/app/my-results', icon: <BookOutlined />, label: 'My Results' },
                { key: '/app/my-marksheet', icon: <BarChartOutlined />, label: 'Marksheet' },
            ],
        },
        {
            label: 'Schedule',
            items: [
                { key: '/app/my-schedule', icon: <ScheduleOutlined />, label: 'My Schedule' },
                { key: '/app/meetings', icon: <VideoCameraOutlined />, label: 'Live Meetings' },
            ],
        },
        {
            label: 'Account',
            items: [{ key: '/app/profile', icon: <SettingOutlined />, label: 'Profile Settings' }],
        },
    ],
    candidate: [
        {
            label: 'Exam preparation',
            items: [
                { key: '/app/exam-home', icon: <DashboardOutlined />, label: 'Dashboard' },
                { key: '/app/exam-practice', icon: <ReadOutlined />, label: 'Practice' },
                { key: '/app/exam-results', icon: <TrophyOutlined />, label: 'My Results' },
            ],
        },
        {
            label: 'Account',
            items: [{ key: '/app/profile', icon: <SettingOutlined />, label: 'Profile Settings' }],
        },
    ],
};

/** Routes that have no sidebar entry of their own highlight this entry instead. */
const ACTIVE_ALIASES: Record<string, string> = {
    '/app/meeting': '/app/meetings',
    '/app/meeting-join': '/app/meetings',
    '/app/meeting-attendance': '/app/meetings',
    '/app/student-quizzes': '/app/my-quizzes',
    '/app/student-resources': '/app/my-resources',
    '/app/student-schedule': '/app/my-schedule',
    '/app/student-quiz-results': '/app/my-results',
    '/app/student-marksheet': '/app/my-marksheet',
};

const TITLES: Record<string, string> = {
    '/profile': 'Profile Settings',
    '/dashboard': 'Dashboard',
    '/users': 'User Management',
    '/batches': 'Batch Management',
    '/demo-requests': 'Demo Requests',
    '/timetable': 'Teacher Timetable',
    '/attendance': 'Attendance',
    '/settings': 'Settings',
    '/admin-resources': 'Resources',
    '/exam-preparation': 'Exam Preparation',
    '/teacher-dashboard': 'Dashboard',
    '/teacher-batches': 'My Batches',
    '/assign-demo': 'Assign Demo',
    '/quiz-management': 'Quiz Management',
    '/resources': 'Resources',
    '/schedules': 'Schedule',
    '/teacher-exam-prep': 'Exam Preparation',
    '/student-dashboard': 'Dashboard',
    '/my-quizzes': 'My Quizzes',
    '/student-quizzes': 'My Quizzes',
    '/my-results': 'My Results',
    '/student-quiz-results': 'My Results',
    '/my-marksheet': 'Marksheet',
    '/student-marksheet': 'Marksheet',
    '/my-resources': 'Resources',
    '/student-resources': 'Resources',
    '/my-schedule': 'My Schedule',
    '/student-schedule': 'My Schedule',
    '/my-exams': 'Exam Preparation',
    '/exam-home': 'Dashboard',
    '/exam-practice': 'Practice',
    '/exam-results': 'My Results',
    '/meetings': 'Live Meetings',
    '/meeting-attendance': 'Meeting Attendance',
};

interface PageInfo { title: string; parent?: { label: string; to: string }; }

const pageInfo = (pathname: string, role: Role): PageInfo => {
    const p = pathname.replace(/^\/app/, '') || '/';
    if (/^\/batches\/[^/]+\/insights/.test(p)) return { title: 'Batch Insights', parent: { label: 'Batch Management', to: '/app/batches' } };
    if (/^\/meeting\/[^/]+/.test(p)) return { title: 'Live Meeting', parent: { label: 'Live Meetings', to: '/app/meetings' } };
    if (/^\/meeting-join\/[^/]+/.test(p)) return { title: 'Join Meeting', parent: { label: 'Live Meetings', to: '/app/meetings' } };
    return { title: TITLES['/' + (p.split('/')[1] || '')] || ROLE_META[role].portal };
};

/* Profile photo URL — the token goes in the query string because <img> can't send headers.
   The kDrive file id busts the cache when the photo changes. */
const buildPhotoUrl = (userId: number, token: string | null, cacheKey?: string | null) => {
    const apiBase = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5000/api';
    const t = token ? `&token=${encodeURIComponent(token)}` : '';
    const v = cacheKey ? encodeURIComponent(cacheKey) : '1';
    return `${apiBase}/auth/profile-photo/${userId}?v=${v}${t}`;
};

const Avatar: React.FC<{ user: any; token: string | null; size?: number }> = ({ user, token, size = 32 }) => {
    const [errored, setErrored] = useState(false);
    useEffect(() => { setErrored(false); }, [user?.id, user?.profile_photo_kdrive_file_id]);
    const initials = `${user?.first_name?.[0] ?? ''}${user?.last_name?.[0] ?? ''}`.toUpperCase() || '?';
    const hasPhoto = !!user?.profile_photo_kdrive_file_id && !errored;
    return (
        <span className="al-avatar" style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }} aria-hidden>
            {hasPhoto
                ? <img src={buildPhotoUrl(user.id, token, user?.profile_photo_kdrive_file_id)} alt="" onError={() => setErrored(true)} />
                : initials}
        </span>
    );
};

/* ══════════════════════════════
   SIDEBAR (desktop rail + mobile drawer content)
══════════════════════════════ */
interface SidebarProps {
    role: Role;
    collapsed: boolean;
    activeKey: string;
    user: any;
    token: string | null;
    onLogout: () => void;
    /** Rendered inside the mobile drawer. */
    inDrawer?: boolean;
    onClose?: () => void;
    showLiveIndicator?: boolean;
    activeMeetingTitle?: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({
    role,
    collapsed,
    activeKey,
    user,
    token,
    onLogout,
    inDrawer = false,
    onClose,
    showLiveIndicator = false,
    activeMeetingTitle,
}) => {
    const meta = ROLE_META[role];
    const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Account';

    return (
        <aside className={`al-sidebar${collapsed ? ' is-collapsed' : ''}`} aria-label="Main navigation">
            <div className="al-brand">
                <Link to={meta.home} className="al-brand-link" onClick={onClose} aria-label={`${BRAND} — home`}>
                    <span className="al-brand-mark" aria-hidden />
                    {!collapsed && (
                        <span className="al-brand-text">
                            <strong>Learn French</strong>
                            <span>with Natives</span>
                        </span>
                    )}
                </Link>
                {inDrawer && (
                    <Button type="text" className="al-icon-btn" icon={<CloseOutlined />} onClick={onClose} aria-label="Close menu" />
                )}
            </div>

            {!collapsed && (
                <div className="al-portal"><span className="al-portal-dot" />{meta.portal}</div>
            )}

            <nav className="al-nav">
                {NAV[role].map((group, gi) => (
                    <div key={group.label} className="al-group">
                        {collapsed
                            ? gi > 0 && <div className="al-group-divider" role="separator" />
                            : <div className="al-group-label">{group.label}</div>}
                        <ul>
                            {group.items.map(item => {
                                const active = item.key === activeKey;
                                const isLiveMeeting = item.key === '/app/meetings';
                                const isLive = isLiveMeeting && showLiveIndicator;
                                const liveTip = activeMeetingTitle
                                    ? `🔴 Live now: ${activeMeetingTitle} · Click to join`
                                    : '🔴 Live class in progress · Click to join';
                                const tip = isLive ? liveTip : item.label;

                                const link = (
                                    <Link
                                        to={item.key}
                                        className={`al-item${active ? ' is-active' : ''}${isLive ? ' al-item-live' : ''}`}
                                        aria-current={active ? 'page' : undefined}
                                        aria-label={collapsed ? tip : undefined}
                                        onClick={onClose}
                                    >
                                        <span className="al-item-icon">
                                            {item.icon}
                                            {isLive && (
                                                <span className="al-live-icon-beacon" aria-hidden>
                                                    <span className="al-live-icon-ping" />
                                                    <span className="al-live-icon-core" />
                                                </span>
                                            )}
                                        </span>
                                        {!collapsed && <span className="al-item-label">{item.label}</span>}
                                        {!collapsed && isLive && (
                                            <span className="al-live-badge" aria-label="Class is live">
                                                <span className="al-live-badge-dot">
                                                    <span className="al-live-badge-ping" />
                                                    <span className="al-live-badge-core" />
                                                </span>
                                                <span className="al-live-badge-text">LIVE</span>
                                            </span>
                                        )}
                                    </Link>
                                );
                                return (
                                    <li key={item.key}>
                                        {collapsed ? (
                                            <Tooltip title={tip} placement="right">{link}</Tooltip>
                                        ) : isLive ? (
                                            <Tooltip title={tip} placement="right">{link}</Tooltip>
                                        ) : (
                                            link
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>

            <div className="al-foot">
                <Tooltip title={collapsed ? `${fullName} · Profile settings` : undefined} placement="right">
                    <Link to="/app/profile" className="al-account" onClick={onClose} aria-label="Profile settings">
                        <Avatar user={user} token={token} size={32} />
                        {!collapsed && (
                            <span className="al-account-text">
                                <strong>{fullName}</strong>
                                <span>{meta.roleName}</span>
                            </span>
                        )}
                    </Link>
                </Tooltip>
                {!collapsed && (
                    <Tooltip title="Log out">
                        <Button type="text" className="al-icon-btn" icon={<LogoutOutlined />} onClick={onLogout} aria-label="Log out" />
                    </Tooltip>
                )}
            </div>
        </aside>
    );
};

/* ══════════════════════════════
   LAYOUT
══════════════════════════════ */
const readCollapsePref = (): boolean | null => {
    try {
        const v = localStorage.getItem(COLLAPSE_PREF_KEY);
        return v == null ? null : v === '1';
    } catch { return null; }
};
const writeCollapsePref = (value: boolean) => {
    try { localStorage.setItem(COLLAPSE_PREF_KEY, value ? '1' : '0'); } catch { /* private mode */ }
};

const Layout: React.FC = () => {
    const r = useResponsive();
    const { user, logout, isAdmin, isTeacher, isCandidate, token } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { hasActiveMeeting, activeMeeting } = useActiveMeeting();

    const role: Role = isAdmin ? 'admin' : isTeacher ? 'teacher' : isCandidate ? 'candidate' : 'student';
    const meta = ROLE_META[role];
    const isMobile = r.shouldUseDrawer;

    // Check if user is currently inside any live meeting page/room
    const isMeetingRoute =
        location.pathname === '/app/meetings' ||
        location.pathname.startsWith('/app/meeting/') ||
        location.pathname.startsWith('/app/meeting-join/') ||
        location.pathname.startsWith('/app/meeting-attendance');

    // Only show the live pulse/badge when an active meeting exists and user is elsewhere in the app
    const showLiveIndicator = hasActiveMeeting && !isMeetingRoute;

    // Below 1280px the sidebar starts as an icon rail; above it, the user's last choice wins.
    const [collapsed, setCollapsed] = useState(() => r.shouldCollapseSidebar || (readCollapsePref() ?? false));
    const [drawerOpen, setDrawerOpen] = useState(false);

    const prevWidth = React.useRef(r.width);
    useEffect(() => {
        const prev = prevWidth.current;
        prevWidth.current = r.width;
        if (prev >= 1280 && r.width < 1280) setCollapsed(true);
        if (prev < 1280 && r.width >= 1280) setCollapsed(readCollapsePref() ?? false);
    }, [r.width]);

    useEffect(() => { setDrawerOpen(false); }, [location.pathname]);

    const page = pageInfo(location.pathname, role);
    useEffect(() => { document.title = `${page.title} · ${BRAND}`; }, [page.title]);

    const allItems = NAV[role].flatMap(g => g.items);
    const firstSegment = '/app/' + (location.pathname.replace(/^\/app\/?/, '').split('/')[0] || '');
    const activeKey = allItems.find(i => location.pathname === i.key || location.pathname.startsWith(i.key + '/'))?.key
        ?? ACTIVE_ALIASES[firstSegment]
        ?? firstSegment;

    const handleLogout = () => { logout(); navigate('/login'); };
    const toggleSidebar = () => {
        if (isMobile) { setDrawerOpen(true); return; }
        setCollapsed(c => {
            const next = !c;
            if (!r.shouldCollapseSidebar) writeCollapsePref(next);
            return next;
        });
    };

    const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Account';
    const accountItems: MenuProps['items'] = [
        { key: 'profile', icon: <SettingOutlined />, label: 'Profile settings', onClick: () => navigate('/app/profile') },
        { type: 'divider' },
        { key: 'logout', icon: <LogoutOutlined />, label: 'Log out', danger: true, onClick: handleLogout },
    ];

    const sideW = isMobile ? 0 : collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W;
    const showAccountName = r.width >= 1024;

    return (
        <div className={`al al-role-${role}`} style={{ '--al-sidebar-w': `${sideW}px` } as React.CSSProperties}>
            <a href="#al-main" className="al-skip">Skip to content</a>

            {isMobile ? (
                <Drawer
                    placement="left"
                    open={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    closable={false}
                    width={Math.min(288, r.width - 48)}
                    rootClassName={`al-drawer al-role-${role}`}
                    styles={{ body: { padding: 0 } }}
                >
                    <Sidebar
                        role={role}
                        collapsed={false}
                        activeKey={activeKey}
                        user={user}
                        token={token}
                        onLogout={handleLogout}
                        inDrawer
                        onClose={() => setDrawerOpen(false)}
                        showLiveIndicator={showLiveIndicator}
                        activeMeetingTitle={activeMeeting?.title}
                    />
                </Drawer>
            ) : (
                <Sidebar
                    role={role}
                    collapsed={collapsed}
                    activeKey={activeKey}
                    user={user}
                    token={token}
                    onLogout={handleLogout}
                    showLiveIndicator={showLiveIndicator}
                    activeMeetingTitle={activeMeeting?.title}
                />
            )}

            <header className="al-header">
                <Tooltip title={isMobile ? undefined : collapsed ? 'Expand sidebar' : 'Collapse sidebar'} placement="bottom">
                    <Button
                        type="text"
                        className="al-icon-btn"
                        icon={isMobile ? <MenuOutlined /> : collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={toggleSidebar}
                        aria-label={isMobile ? 'Open menu' : collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    />
                </Tooltip>

                <div className="al-header-title">
                    {!isMobile && (
                        <nav className="al-crumbs" aria-label="Breadcrumb">
                            <Link to={meta.home}>{meta.portal}</Link>
                            {page.parent && (
                                <>
                                    <RightOutlined />
                                    <Link to={page.parent.to}>{page.parent.label}</Link>
                                </>
                            )}
                        </nav>
                    )}
                    <div className="al-page-title" aria-current="page">{page.title}</div>
                </div>

                <div className="al-header-actions">
                    <NotificationBell variant="light" />
                    {(isTeacher || isAdmin) && <MeetingLobbyWatcher />}
                    <Dropdown
                        trigger={['click']}
                        placement="bottomRight"
                        menu={{ items: accountItems }}
                        popupRender={menu => (
                            <div className={`al-pop al-role-${role}`}>
                                <div className="al-pop-head">
                                    <Avatar user={user} token={token} size={36} />
                                    <div className="al-pop-who">
                                        <strong>{fullName}</strong>
                                        <span>{user?.email || meta.roleName}</span>
                                    </div>
                                </div>
                                {menu}
                            </div>
                        )}
                    >
                        <button type="button" className="al-account-btn" aria-label="Account menu">
                            <Avatar user={user} token={token} size={32} />
                            {showAccountName && (
                                <span className="al-account-btn-text">
                                    <strong>{fullName}</strong>
                                    <span>{meta.roleName}</span>
                                </span>
                            )}
                            {showAccountName && <DownOutlined />}
                        </button>
                    </Dropdown>
                </div>
            </header>

            <div className="al-main">
                <main id="al-main" className="al-content" tabIndex={-1}>
                    {/* Pages are loaded on demand: keep the shell on screen while one loads. */}
                    <Suspense fallback={<div className="app-route-loading is-inner" role="status" aria-label="Loading" />}>
                        <Outlet />
                    </Suspense>
                </main>
            </div>
        </div>
    );
};

export default Layout;
