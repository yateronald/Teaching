import React, { useState, useEffect } from 'react';
import { Layout as AntLayout, Dropdown, Button, Typography, Tooltip, Drawer } from 'antd';
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
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { MenuProps } from 'antd';
import { ASSET_PATHS } from '../../utils/assets';
import NotificationBell from '../Notifications/NotificationBell';
import useResponsive from '../../hooks/useResponsive';

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

const SIDEBAR_W = 232;
const SIDEBAR_W_COLLAPSED = 64;
/** Outer offset around the floating student sidebar. Tightens on small laptops. */
const STUDENT_SIDEBAR_GAP = 12;

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
    left: STUDENT_SIDEBAR_GAP, top: STUDENT_SIDEBAR_GAP, bottom: STUDENT_SIDEBAR_GAP,
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 18,
    boxShadow: '0 18px 40px -16px rgba(15,23,42,0.10), 0 4px 12px -3px rgba(15,23,42,0.04), inset 0 1px 0 rgba(255,255,255,0.9)',
    border: '1px solid rgba(226,232,240,0.85)',
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

   Density modes (driven by viewport width):
   • compact   — laptop / tablet (< 1280): no welcome banner, no section
                 label, tighter row padding, smaller icon tiles. Designed
                 to fit a 14" 1080p screen without a vertical scrollbar.
   • cozy      — small desktop (1280–1439): welcome banner hidden, but
                 nav rows keep some breathing room.
   • comfortable — desktop ≥ 1440: welcome banner shown, section label
                 visible, original spacing.
   ────────────────────────────────────────────────────────────────── */
type StudentDensity = 'compact' | 'cozy' | 'comfortable';

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
    density: StudentDensity;
    /** When true the sidebar fills its parent — used inside a Drawer. */
    embedded?: boolean;
    onItemNavigate?: () => void;
}

const StudentSidebar: React.FC<StudentSidebarProps> = ({
    collapsed, sideW, user, token, navItems, location, navigate, userMenuItems,
    density, embedded = false, onItemNavigate
}) => {
    const firstName = user?.first_name || 'Student';
    const showWelcome = !collapsed && density === 'comfortable';
    const showSectionLabel = !collapsed && density !== 'compact';

    // Density-driven sizes
    const ROW_PADY = density === 'compact' ? 7 : density === 'cozy' ? 8 : 10;
    const ROW_PADX = density === 'compact' ? 10 : 12;
    const ICON_TILE = density === 'compact' ? 30 : density === 'cozy' ? 32 : 34;
    const ICON_FONT = density === 'compact' ? 14 : 15;
    const LABEL_FONT = density === 'compact' ? 13 : 13.5;
    const ROW_GAP = density === 'compact' ? 2 : 3;

    const wrapperStyle: React.CSSProperties = embedded
        ? {
            background: '#ffffff',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            width: '100%',
            overflowX: 'hidden',
        }
        : { ...STUDENT_SIDEBAR_STYLE, width: sideW };

    return (
        <div style={wrapperStyle}>
            {/* ── Brand mark ── */}
            <div style={{
                padding: collapsed ? '14px 0' : (density === 'compact' ? '14px 16px' : '18px 16px'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: 12,
                flexShrink: 0,
            }}>
                <div style={{
                    width: density === 'compact' ? 38 : 42,
                    height: density === 'compact' ? 38 : 42,
                    borderRadius: 12,
                    background: S_GRAD,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 8px 18px -4px rgba(16,185,129,0.45), inset 0 1px 0 rgba(255,255,255,0.25)',
                }}>
                    <img src={ASSET_PATHS.LOGOS.MAIN} alt="logo" style={{ width: 22, height: 22, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
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

            {/* ── Welcome banner (only on comfortable density) ── */}
            {showWelcome && (
                <div style={{
                    margin: '2px 12px 12px',
                    padding: '12px 14px',
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdfa 50%, #ecfeff 100%)',
                    border: '1px solid rgba(16,185,129,0.18)',
                    position: 'relative',
                    overflow: 'hidden',
                    flexShrink: 0,
                }}>
                    <div style={{
                        position: 'absolute', top: -20, right: -20,
                        width: 80, height: 80, borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(16,185,129,0.18), transparent 70%)',
                        pointerEvents: 'none',
                    }} />
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: S_ACCENT, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 3 }}>
                        Bienvenue 👋
                    </div>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a', letterSpacing: -0.2, lineHeight: 1.3 }}>
                        Hi, {firstName}!
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 500, marginTop: 2 }}>
                        Ready to learn today?
                    </div>
                </div>
            )}

            {/* ── Section label ── */}
            {showSectionLabel && (
                <div style={{
                    padding: '0 18px 6px',
                    fontSize: 10,
                    fontWeight: 800,
                    color: '#94a3b8',
                    letterSpacing: 1.4,
                    textTransform: 'uppercase',
                    flexShrink: 0,
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
                minHeight: 0,
            }}>
                {navItems.map(item => {
                    const active = location.pathname === item.key || location.pathname.startsWith(item.key + '/');
                    const navBtn = (
                        <button
                            key={item.key}
                            onClick={() => { navigate(item.key); onItemNavigate?.(); }}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 11,
                                padding: collapsed ? `${ROW_PADY}px 0` : `${ROW_PADY}px ${ROW_PADX}px`,
                                marginBottom: ROW_GAP,
                                borderRadius: 11,
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
                                width: ICON_TILE, height: ICON_TILE, borderRadius: 9, flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: active ? S_GRAD : '#f1f5f9',
                                color: active ? '#fff' : '#475569',
                                fontSize: ICON_FONT,
                                transition: 'all 0.18s ease',
                                boxShadow: active ? '0 5px 12px -4px rgba(16,185,129,0.45)' : 'none',
                            }}>
                                {item.icon}
                            </div>
                            {/* Label */}
                            {!collapsed && (
                                <span style={{
                                    fontSize: LABEL_FONT,
                                    fontWeight: active ? 700 : 600,
                                    color: active ? '#0f172a' : '#475569',
                                    letterSpacing: -0.1,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
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
            <div style={{ padding: collapsed ? '10px 8px' : '10px 12px', flexShrink: 0 }}>
                <Dropdown menu={{ items: userMenuItems }} placement="topRight" trigger={['click']}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: collapsed ? '8px 0' : '8px 10px',
                        borderRadius: 12,
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
                            size={32}
                            iconFontSize={15}
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
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 1 }}>
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
    const responsive = useResponsive();
    const { user, logout, isAdmin, isTeacher, isStudent, token } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Sidebar state derives from viewport. Below 1280 we collapse the rail
    // by default; the user can still expand it manually via the toggle.
    const [collapsed, setCollapsed] = useState(() => responsive.shouldCollapseSidebar);
    const [drawerOpen, setDrawerOpen] = useState(false);

    // When the viewport crosses a breakpoint, sync the collapse state so the
    // sidebar always lands in a sensible default for the new size. Manual
    // toggling still works between resizes.
    const prevWidthRef = React.useRef(responsive.width);
    useEffect(() => {
        const prev = prevWidthRef.current;
        const next = responsive.width;
        prevWidthRef.current = next;

        // Only flip collapse state if a major breakpoint was actually crossed.
        const crossedDown = prev >= 1280 && next < 1280;
        const crossedUp = prev < 1280 && next >= 1280;
        if (crossedDown && !collapsed) setCollapsed(true);
        if (crossedUp && collapsed) setCollapsed(false);
    }, [responsive.width, collapsed]);

    // Close drawer automatically when navigating
    useEffect(() => { setDrawerOpen(false); }, [location.pathname]);

    // Density derived from breakpoint — used by the student sidebar
    const studentDensity: StudentDensity = responsive.isDesktop
        ? 'comfortable'
        : responsive.isSmallDesktop
            ? 'cozy'
            : 'compact';

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
    const inDrawer = responsive.shouldUseDrawer;

    /* ── Student page background scales with breakpoint ── */
    const studentBg = '#f0fdfa';

    /* ── Outer left offset for the main content. In drawer mode the
         sidebar is hidden by default, so the content takes the full width. */
    const contentLeftOffset = inDrawer
        ? 0
        : isStudent
            ? sideW + STUDENT_SIDEBAR_GAP * 2
            : sideW;

    return (
        <AntLayout style={{ minHeight: '100vh', background: isStudent ? studentBg : isTeacher ? '#fef2f2' : '#f4f6fb' }}>

            {/* ════════════════════════════════════
                    SIDEBAR — branches on role + viewport
            ════════════════════════════════════ */}
            {inDrawer && isStudent ? (
                /* ── Mobile (student): off-canvas drawer ── */
                <Drawer
                    placement="left"
                    open={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    closable={false}
                    width={Math.min(280, window.innerWidth - 56)}
                    styles={{
                        body: { padding: 0, background: '#fff' },
                        header: { display: 'none' },
                    }}
                    rootStyle={{ zIndex: 1200 }}
                >
                    <StudentSidebar
                        collapsed={false}
                        sideW={SIDEBAR_W}
                        user={user}
                        token={token}
                        initials={initials}
                        navItems={navItems}
                        location={location}
                        navigate={navigate}
                        userMenuItems={userMenuItems}
                        density="comfortable"
                        embedded
                        onItemNavigate={() => setDrawerOpen(false)}
                    />
                </Drawer>
            ) : isStudent ? (
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
                    density={studentDensity}
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
            <AntLayout style={{
                marginLeft: contentLeftOffset,
                transition: 'margin-left 0.25s cubic-bezier(0.4,0,0.2,1)',
            }}>

                {/* Top header */}
                <Header style={{
                    padding: inDrawer ? '0 14px' : '0 24px',
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
                    top: isStudent && !inDrawer ? STUDENT_SIDEBAR_GAP : 0,
                    right: isStudent && !inDrawer ? STUDENT_SIDEBAR_GAP : 0,
                    left: isStudent && !inDrawer ? sideW + STUDENT_SIDEBAR_GAP * 2 : (inDrawer ? 0 : sideW),
                    zIndex: 99,
                    transition: 'left 0.25s cubic-bezier(0.4,0,0.2,1)',
                    height: responsive.isMobile ? 56 : 64,
                    borderRadius: isStudent && !inDrawer ? 18 : 0,
                    border: isStudent && !inDrawer ? '1px solid rgba(226,232,240,0.85)' : 'none',
                }}>
                    {/* Collapse toggle / Drawer toggle */}
                    <Button
                        type="text"
                        icon={inDrawer ? <MenuOutlined /> : (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)}
                        onClick={() => {
                            if (inDrawer) setDrawerOpen(true);
                            else setCollapsed(!collapsed);
                        }}
                        style={{
                            fontSize: 16, width: 38, height: 38,
                            color: isStudent ? '#0f172a' : '#fff',
                            borderRadius: 10,
                            background: isStudent ? S_ACCENT_SOFT : 'rgba(255,255,255,0.12)',
                            border: isStudent ? '1px solid rgba(16,185,129,0.18)' : '1px solid rgba(255,255,255,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    />

                    {/* Page title */}
                    <div style={{ flex: 1, paddingLeft: responsive.isMobile ? 12 : 16, minWidth: 0 }}>
                        <Text style={{
                            fontSize: responsive.isMobile ? 15 : 17,
                            fontWeight: 700,
                            color: isStudent ? '#0f172a' : '#fff',
                            letterSpacing: 0.2,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: 'block',
                        }}>
                            {getPageTitle(location.pathname)}
                        </Text>
                    </div>

                    {/* ── Header right cluster: bell • user avatar ── */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: responsive.isMobile ? 6 : 10 }}>

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
                                    size={responsive.isMobile ? 34 : 38}
                                    iconFontSize={16}
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
                    margin: isStudent && !inDrawer
                        ? `${64 + STUDENT_SIDEBAR_GAP * 2}px ${STUDENT_SIDEBAR_GAP}px ${STUDENT_SIDEBAR_GAP}px`
                        : inDrawer
                            ? `${(responsive.isMobile ? 56 : 64) + 12}px 12px 12px`
                            : `${64 + 20}px 20px 20px`,
                    padding: responsive.isMobile ? '14px' : responsive.isLaptop ? '18px' : '24px',
                    background: '#fff',
                    borderRadius: 16,
                    /* On mobile we let the container hug its content to avoid
                       a tall empty card when the page only has a few items. */
                    minHeight: responsive.isMobile ? 'auto' : `calc(100vh - ${responsive.isMobile ? 84 : 104}px)`,
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