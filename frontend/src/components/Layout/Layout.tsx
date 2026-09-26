import React, { Suspense, useEffect, useState } from 'react';
import { ConfigProvider, Dropdown, Button, Tooltip, Drawer, notification } from 'antd';
import frFR from 'antd/locale/fr_FR';
import enGB from 'antd/locale/en_GB';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
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
    LineChartOutlined,
    BankOutlined,
    SendOutlined,
    ThunderboltOutlined,
    ApartmentOutlined,
    GlobalOutlined,
} from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from '../Notifications/NotificationBell';
import useResponsive from '../../hooks/useResponsive';
import { useActiveMeeting } from '../../hooks/useActiveMeeting';
import useDemoAlerts from '../../hooks/useDemoAlerts';
import MeetingLobbyWatcher from '../Meeting/MeetingLobbyWatcher';
import OrgStateBanner from '../Org/OrgStateBanner';
import { useTr } from '../../utils/useTr';
import { apiAsset } from '../../utils/apiAsset';
import './Layout.css';

/* ══════════════════════════════════════════
   App shell: fixed sidebar + fixed top bar + content card.
   One structure for every role; each role only changes the accent colour
   (see .al-role-* in Layout.css). Geometry lives in layoutMetrics.ts.
══════════════════════════════════════════ */

type Role = 'admin' | 'teacher' | 'student' | 'candidate' | 'org_admin';
type Tr = (en: string, fr: string) => string;

interface NavItem {
    key: string;
    icon: React.ReactNode;
    label: string;
    /** Shown only when the account holds this extra key. */
    needs?: 'monitoring';
    /** Draws a live count on the entry (people waiting for an answer). */
    counter?: 'demoRequests';
}
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
    org_admin: { portal: 'Company space', roleName: 'Company manager', home: '/app/org' },
};

/** Wording of the two bilingual spaces (company managers and exam candidates). */
const roleMetaFor = (role: Role, tr: Tr) => {
    if (role === 'org_admin') return { ...ROLE_META.org_admin, portal: tr('Company space', 'Espace entreprise'), roleName: tr('Company manager', 'Responsable entreprise') };
    if (role === 'candidate') return { ...ROLE_META.candidate, portal: tr('Exam space', 'Espace examen'), roleName: tr('Learner', 'Apprenant') };
    return ROLE_META[role];
};

const NAV: Record<Role, NavGroup[]> = {
    admin: [
        {
            label: 'Management',
            items: [
                { key: '/app/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
                { key: '/app/users', icon: <UserOutlined />, label: 'Users' },
                { key: '/app/companies', icon: <BankOutlined />, label: 'Companies' },
                { key: '/app/batches', icon: <TeamOutlined />, label: 'Batches' },
                { key: '/app/demo-requests', icon: <PhoneOutlined />, label: 'Demo Requests', counter: 'demoRequests' },
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
            items: [
                { key: '/app/monitoring', icon: <LineChartOutlined />, label: 'Monitoring', needs: 'monitoring' },
                { key: '/app/settings', icon: <SettingOutlined />, label: 'Settings' },
            ],
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
    candidate: [],
    org_admin: [],
};

/** The two bilingual spaces: an exam candidate's and a company manager's. */
const bilingualNav = (role: Role, tr: Tr): NavGroup[] => role === 'org_admin' ? [
    {
        label: tr('My company', 'Mon entreprise'),
        items: [
            { key: '/app/org', icon: <DashboardOutlined />, label: tr('Dashboard', 'Tableau de bord') },
            { key: '/app/org/learners', icon: <TeamOutlined />, label: tr('Learners', 'Apprenants') },
            { key: '/app/org/groups', icon: <ApartmentOutlined />, label: tr('Groups', 'Groupes') },
            { key: '/app/org/assignments', icon: <SendOutlined />, label: tr('Assignments', 'Attributions') },
            { key: '/app/org/credits', icon: <ThunderboltOutlined />, label: tr('Credits', 'Crédits') },
        ],
    },
    {
        label: tr('Account', 'Compte'),
        items: [
            { key: '/app/org/settings', icon: <BankOutlined />, label: tr('Company settings', 'Paramètres entreprise') },
            { key: '/app/profile', icon: <SettingOutlined />, label: tr('Profile settings', 'Mon profil') },
        ],
    },
] : [
    {
        label: tr('Exam preparation', 'Préparation aux examens'),
        items: [
            { key: '/app/exam-home', icon: <DashboardOutlined />, label: tr('Dashboard', 'Tableau de bord') },
            { key: '/app/exam-practice', icon: <ReadOutlined />, label: tr('Practice', 'S’entraîner') },
            { key: '/app/exam-results', icon: <TrophyOutlined />, label: tr('My results', 'Mes résultats') },
        ],
    },
    {
        label: tr('Account', 'Compte'),
        items: [{ key: '/app/profile', icon: <SettingOutlined />, label: tr('Profile settings', 'Mon profil') }],
    },
];

/** The navigation this account actually sees: entries needing a key they don't hold are dropped. */
function navFor(role: Role, keys: { monitoring: boolean }, tr: Tr): NavGroup[] {
    const groups = role === 'candidate' || role === 'org_admin' ? bilingualNav(role, tr) : NAV[role];
    return groups
        .map(group => ({ ...group, items: group.items.filter(item => !item.needs || keys[item.needs]) }))
        .filter(group => group.items.length > 0);
}

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
    '/monitoring': 'Website Monitoring',
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

/** Page titles of the two bilingual spaces. */
const bilingualTitle = (p: string, tr: Tr): string | null => {
    if (/^\/org\/learners\/\d+/.test(p)) return tr('Learner', 'Apprenant');
    const titles: Record<string, string> = {
        '/org': tr('Dashboard', 'Tableau de bord'),
        '/org/learners': tr('Learners', 'Apprenants'),
        '/org/groups': tr('Groups', 'Groupes'),
        '/org/assignments': tr('Assignments', 'Attributions'),
        '/org/credits': tr('Credits', 'Crédits'),
        '/org/settings': tr('Company settings', 'Paramètres entreprise'),
        '/exam-home': tr('Dashboard', 'Tableau de bord'),
        '/exam-practice': tr('Practice', 'S’entraîner'),
        '/exam-results': tr('My results', 'Mes résultats'),
        '/profile': tr('Profile settings', 'Mon profil'),
    };
    return titles[p.replace(/\/$/, '')] || null;
};

const pageInfo = (pathname: string, role: Role, tr: Tr): PageInfo => {
    const p = pathname.replace(/^\/app/, '') || '/';
    if (role === 'candidate' || role === 'org_admin') {
        const t = bilingualTitle(p, tr);
        if (t) return { title: t, ...(/^\/org\/learners\/\d+/.test(p) ? { parent: { label: tr('Learners', 'Apprenants'), to: '/app/org/learners' } } : {}) };
    }
    if (/^\/companies\/\d+/.test(p)) return { title: 'Company', parent: { label: 'Companies', to: '/app/companies' } };
    if (p === '/companies') return { title: 'Companies' };
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
    /** The groups this account may see (see navFor). */
    groups: NavGroup[];
    /** Live counts drawn on the entries that ask for one. */
    counters?: Partial<Record<NonNullable<NavItem['counter']>, number>>;
    activeKey: string;
    user: any;
    token: string | null;
    onLogout: () => void;
    /** Rendered inside the mobile drawer. */
    inDrawer?: boolean;
    onClose?: () => void;
    showLiveIndicator?: boolean;
    activeMeetingTitle?: string | null;
    /** A company account: the company's name and logo replace the platform's. */
    brand?: { name: string; logoUrl: string | null; tagline: string } | null;
    meta: { portal: string; roleName: string; home: string };
    logoutLabel: string;
}

const Sidebar: React.FC<SidebarProps> = ({
    collapsed,
    groups,
    counters = {},
    activeKey,
    user,
    token,
    onLogout,
    inDrawer = false,
    onClose,
    showLiveIndicator = false,
    activeMeetingTitle,
    brand = null,
    meta,
    logoutLabel,
}) => {
    const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Account';

    return (
        <aside className={`al-sidebar${collapsed ? ' is-collapsed' : ''}`} aria-label="Main navigation">
            <div className="al-brand">
                <Link to={meta.home} className="al-brand-link" onClick={onClose} aria-label={`${brand?.name || BRAND} — home`}>
                    {brand ? (
                        <span className="al-brand-mark is-company" aria-hidden>
                            {brand.logoUrl ? <img src={brand.logoUrl} alt="" /> : <b>{brand.name.slice(0, 1).toUpperCase()}</b>}
                        </span>
                    ) : <span className="al-brand-mark" aria-hidden />}
                    {!collapsed && (brand ? (
                        <span className="al-brand-text">
                            <strong title={brand.name}>{brand.name}</strong>
                            <span>{brand.tagline}</span>
                        </span>
                    ) : (
                        <span className="al-brand-text">
                            <strong>Learn French</strong>
                            <span>with Natives</span>
                        </span>
                    ))}
                </Link>
                {inDrawer && (
                    <Button type="text" className="al-icon-btn" icon={<CloseOutlined />} onClick={onClose} aria-label="Close menu" />
                )}
            </div>

            {!collapsed && (
                <div className="al-portal"><span className="al-portal-dot" />{meta.portal}</div>
            )}

            <nav className="al-nav">
                {groups.map((group, gi) => (
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
                                const waiting = item.counter ? (counters[item.counter] || 0) : 0;
                                const tip = isLive ? liveTip
                                    : waiting ? `${item.label} — ${waiting} waiting for an answer`
                                        : item.label;

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
                                            {!!waiting && collapsed && (
                                                <span className="al-count-dot" aria-hidden="true">{waiting > 9 ? '9+' : waiting}</span>
                                            )}
                                            {isLive && (
                                                <span className="al-live-icon-beacon" aria-hidden>
                                                    <span className="al-live-icon-ping" />
                                                    <span className="al-live-icon-core" />
                                                </span>
                                            )}
                                        </span>
                                        {!collapsed && <span className="al-item-label">{item.label}</span>}
                                        {!collapsed && !!waiting && (
                                            <span className="al-count" aria-label={`${waiting} waiting for an answer`}>
                                                <span className="al-count-ping" aria-hidden="true" />
                                                {waiting} new
                                            </span>
                                        )}
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
                                        ) : isLive || waiting ? (
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
                    <Tooltip title={logoutLabel}>
                        <Button type="text" className="al-icon-btn" icon={<LogoutOutlined />} onClick={onLogout} aria-label={logoutLabel} />
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
    const { user, logout, isAdmin, isTeacher, isCandidate, isOrgAdmin, canViewMonitoring, token } = useAuth();
    const { tr, lang, setLang } = useTr();
    const navigate = useNavigate();
    const location = useLocation();
    const { hasActiveMeeting, activeMeeting } = useActiveMeeting();
    const [notice, noticeHolder] = notification.useNotification();

    // People waiting for an answer to a demo request (administrators only).
    const demo = useDemoAlerts(isAdmin, (request) => {
        notice.open({
            key: `demo-${request.id}`,
            message: 'New demo request',
            description: `${request.full_name}${request.country ? ` from ${request.country}` : ''} is waiting for an answer.`,
            icon: <PhoneOutlined style={{ color: '#dc2626' }} />,
            placement: 'bottomRight',
            duration: 8,
            btn: (
                <Button type="primary" size="small" onClick={() => { notice.destroy(`demo-${request.id}`); navigate('/app/demo-requests'); }}>
                    Open
                </Button>
            ),
        });
    });

    const role: Role = isAdmin ? 'admin' : isTeacher ? 'teacher' : isOrgAdmin ? 'org_admin' : isCandidate ? 'candidate' : 'student';
    const meta = roleMetaFor(role, tr);
    const bilingual = role === 'candidate' || role === 'org_admin';
    const org = user?.organization || null;
    const brand = org ? {
        name: org.name,
        logoUrl: org.logo_url ? apiAsset(org.logo_url) : null,
        tagline: tr('Exam preparation', 'Préparation aux examens'),
    } : null;
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

    useEffect(() => { if (bilingual) dayjs.locale(lang === 'fr' ? 'fr' : 'en'); }, [bilingual, lang]);

    const page = pageInfo(location.pathname, role, tr);
    useEffect(() => { document.title = `${page.title} · ${brand?.name || BRAND}`; }, [page.title, brand?.name]);

    const nav = navFor(role, { monitoring: canViewMonitoring }, tr);
    const allItems = nav.flatMap(g => g.items);
    const firstSegment = '/app/' + (location.pathname.replace(/^\/app\/?/, '').split('/')[0] || '');
    const activeKey = allItems
        .filter(i => location.pathname === i.key || location.pathname.startsWith(i.key + '/'))
        .sort((a, b) => b.key.length - a.key.length)[0]?.key
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
    const logoutLabel = bilingual ? tr('Log out', 'Se déconnecter') : 'Log out';
    const accountItems: MenuProps['items'] = [
        { key: 'profile', icon: <SettingOutlined />, label: bilingual ? tr('Profile settings', 'Mon profil') : 'Profile settings', onClick: () => navigate('/app/profile') },
        { type: 'divider' },
        { key: 'logout', icon: <LogoutOutlined />, label: logoutLabel, danger: true, onClick: handleLogout },
    ];

    const sideW = isMobile ? 0 : collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W;
    const showAccountName = r.width >= 1024;

    return (
        <div className={`al al-role-${role}`} style={{ '--al-sidebar-w': `${sideW}px` } as React.CSSProperties}>
            {noticeHolder}
            <a href="#al-main" className="al-skip">{bilingual ? tr('Skip to content', 'Aller au contenu') : 'Skip to content'}</a>

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
                        groups={nav}
                        counters={{ demoRequests: demo.waiting }}
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
                        brand={brand}
                        meta={meta}
                        logoutLabel={logoutLabel}
                    />
                </Drawer>
            ) : (
                <Sidebar
                    groups={nav}
                    counters={{ demoRequests: demo.waiting }}
                    role={role}
                    collapsed={collapsed}
                    activeKey={activeKey}
                    user={user}
                    token={token}
                    onLogout={handleLogout}
                    showLiveIndicator={showLiveIndicator}
                    activeMeetingTitle={activeMeeting?.title}
                    brand={brand}
                    meta={meta}
                    logoutLabel={logoutLabel}
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
                    {bilingual && (
                        <Tooltip title={tr('Language', 'Langue')}>
                            <button type="button" className="al-lang" onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
                                aria-label={lang === 'fr' ? 'Switch to English' : 'Passer en français'}>
                                <GlobalOutlined /><span>{lang === 'fr' ? 'FR' : 'EN'}</span>
                            </button>
                        </Tooltip>
                    )}
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
                    {/* A company account sees its company's state: ends soon, expired (read-only). */}
                    {org && bilingual && <OrgStateBanner org={org} manager={role === 'org_admin'} />}
                    {/* Pages are loaded on demand: keep the shell on screen while one loads. */}
                    <Suspense fallback={<div className="app-route-loading is-inner" role="status" aria-label="Loading" />}>
                        {bilingual ? (
                            <ConfigProvider locale={lang === 'fr' ? frFR : enGB}
                                theme={role === 'org_admin' ? { token: { colorPrimary: '#0f766e' } } : undefined}>
                                <Outlet />
                            </ConfigProvider>
                        ) : <Outlet />}
                    </Suspense>
                </main>
            </div>
        </div>
    );
};

export default Layout;
