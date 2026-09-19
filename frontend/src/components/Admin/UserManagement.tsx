import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Button, Checkbox, ConfigProvider, DatePicker, Drawer, Dropdown, Form, Input, Modal, Segmented, Select, Skeleton, Switch, Table, Tooltip, message,
} from 'antd';
import type { MenuProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
    AimOutlined, BarChartOutlined, CalendarOutlined, CheckCircleFilled, CheckCircleOutlined, CloseOutlined, CrownOutlined, DeleteOutlined, DownloadOutlined,
    EditOutlined, ExclamationCircleFilled, KeyOutlined, LockOutlined, MailOutlined, MoreOutlined, PlusOutlined, ReadOutlined,
    ReloadOutlined, RightOutlined, SafetyOutlined, SearchOutlined, SolutionOutlined, StopOutlined, TeamOutlined, UserAddOutlined,
    UserOutlined, WarningOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import useResponsive from '../../hooks/useResponsive';
import { headerHeight } from '../Layout/layoutMetrics';
import { formatPlain } from '../../utils/timezone';
import { useNavigate } from 'react-router-dom';
import ExamAssignmentModal from './ExamAssignmentModal';
import { EXAM_LABEL, NCLC_NOTE, NCLC_OPTIONS, daysUntil, type ExamTarget } from '../Candidate/candidateModel';
import './UserManagement.css';

type Role = 'admin' | 'teacher' | 'student' | 'candidate';

/** Exam candidates: their goal, what is open to them and their last practice (from the API). */
interface CandidateExam {
    target_exam: ExamTarget; target_nclc: number | null; exam_date: string | null; admin_notes: string | null;
    active_items: number; total_items: number; access_until: string | null; last_practice_at: string | null; attempts: number;
}
type RoleTab = 'all' | Role;
type StatusKey = 'active' | 'disabled' | 'attention' | 'new';

interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: Role;
    created_at: string;
    is_active?: boolean;
    failed_login_attempts?: number;
    exam?: CandidateExam | null;
}

const ROLES: Role[] = ['student', 'candidate', 'teacher', 'admin'];
const ROLE_META: Record<Role, { label: string; plural: string; icon: React.ReactNode; desc: string }> = {
    student: { label: 'Student', plural: 'Students', icon: <ReadOutlined />, desc: 'Joins classes, quizzes and exam practice.' },
    candidate: { label: 'Exam candidate', plural: 'Candidates', icon: <AimOutlined />, desc: 'Exam practice only — no classes or batches.' },
    teacher: { label: 'Teacher', plural: 'Teachers', icon: <SolutionOutlined />, desc: 'Runs batches, live classes and grading.' },
    admin: { label: 'Admin', plural: 'Admins', icon: <CrownOutlined />, desc: 'Full access to the admin console.' },
};
const ATTENTION = 3; // failed sign-ins before a user is flagged
const JSON_HEADERS = { 'Content-Type': 'application/json' };

const fullName = (u: User) => `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username || u.email;
const initialsOf = (u: User) => ((u.first_name?.[0] || '') + (u.last_name?.[0] || '')).toUpperCase() || (u.email?.[0] || '?').toUpperCase();
const daysSince = (iso: string) => (Date.now() - new Date(iso).getTime()) / 86400_000;
const agoText = (iso: string) => {
    const d = daysSince(iso);
    if (!Number.isFinite(d)) return '';
    if (d < 1) return 'Today';
    if (d < 2) return 'Yesterday';
    if (d < 30) return `${Math.floor(d)} days ago`;
    if (d < 365) { const m = Math.floor(d / 30); return `${m} ${m === 1 ? 'month' : 'months'} ago`; }
    const y = Math.floor(d / 365);
    return `${y} ${y === 1 ? 'year' : 'years'} ago`;
};
const slug = (s: string) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '');
const suggestUsername = (first?: string, last?: string, email?: string) =>
    [slug(first || ''), slug(last || '')].filter(Boolean).join('.') || slug((email || '').split('@')[0]);

/* ── Small pieces ── */
const Avatar: React.FC<{ u: User; large?: boolean }> = ({ u, large }) => (
    <span className={`um-avatar is-${u.role}${large ? ' is-lg' : ''}`} aria-hidden>{initialsOf(u)}</span>
);
const RolePill: React.FC<{ role: Role }> = ({ role }) => (
    <span className={`um-role is-${role}`}><i />{ROLE_META[role]?.label || role}</span>
);
const StatusCell: React.FC<{ u: User }> = ({ u }) => {
    const failed = u.failed_login_attempts || 0;
    return (
        <span className="um-status">
            <span className={`um-state${u.is_active ? ' is-on' : ''}`}><i />{u.is_active ? 'Active' : 'Disabled'}</span>
            {failed > 0 && (
                <Tooltip title={`${failed} failed sign-in ${failed === 1 ? 'attempt' : 'attempts'}`}>
                    <span className={`um-fail${failed >= ATTENTION ? ' is-high' : ''}`}><WarningOutlined /> {failed}</span>
                </Tooltip>
            )}
        </span>
    );
};

const RolePicker: React.FC<{ value?: Role; onChange?: (r: Role) => void; disabled?: boolean }> = ({ value, onChange, disabled }) => (
    <div className="um-roles" role="radiogroup" aria-label="Role">
        {ROLES.map(k => (
            <button key={k} type="button" role="radio" aria-checked={value === k} disabled={disabled}
                className={`um-role-card is-${k}${value === k ? ' is-selected' : ''}`} onClick={() => onChange?.(k)}>
                <span className="um-role-card-ic">{ROLE_META[k].icon}</span>
                <strong>{ROLE_META[k].label}</strong>
                <span>{ROLE_META[k].desc}</span>
                <CheckCircleFilled className="um-role-check" />
            </button>
        ))}
    </div>
);

const UserManagement: React.FC = () => {
    const { apiCall, user, isAdmin, isAuthenticated, logout } = useAuth();
    const r = useResponsive();
    const navigate = useNavigate();
    const [assignFor, setAssignFor] = useState<User | null>(null);
    const [msg, msgHolder] = message.useMessage();
    const [modal, modalHolder] = Modal.useModal();
    const [form] = Form.useForm();
    const editRole = Form.useWatch('role', form) as Role | undefined;
    const goalNclc = Form.useWatch('target_nclc', form) as number | undefined;

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const [roleTab, setRoleTab] = useState<RoleTab>('all');
    const [search, setSearch] = useState('');
    const [statusKey, setStatusKey] = useState<StatusKey | null>(null);
    const [range, setRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
    const [selectedIds, setSelectedIds] = useState<React.Key[]>([]);
    const [bulkBusy, setBulkBusy] = useState(false);
    const [cardLimit, setCardLimit] = useState(20);

    const [editorOpen, setEditorOpen] = useState(false);
    const [editing, setEditing] = useState<User | null>(null);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const usernameTouched = useRef(false);

    const [resetTarget, setResetTarget] = useState<User | null>(null);
    const [resetMustChange, setResetMustChange] = useState(true);
    const [resetting, setResetting] = useState(false);
    const [resetDone, setResetDone] = useState(false);

    const [profileId, setProfileId] = useState<number | null>(null);
    const profile = users.find(u => u.id === profileId) || null;

    const isSelf = (u: User) => u.id === user?.id;
    const ownAdminEdit = !!editing && editing.role === 'admin' && isSelf(editing);
    const fmtDate = (iso: string) => formatPlain(iso, user?.timezone, { month: 'short', day: 'numeric', year: 'numeric' });

    const handleAuthError = (e: any) => {
        if (e?.message?.includes('Authentication token is invalid or expired.')) {
            msg.error('Your session expired. Please sign in again.');
            logout();
            return true;
        }
        return false;
    };

    /* ═══════════ DATA ═══════════ */
    const fetchUsers = useCallback(async () => {
        try {
            const res = await apiCall('/users');
            if (!res.ok) {
                const d = await res.json().catch(() => ({}));
                throw new Error(d.error || d.message || `The server answered ${res.status}.`);
            }
            const data = await res.json();
            setUsers(Array.isArray(data) ? data : []);
            setLoadError(null);
        } catch (e: any) {
            if (!handleAuthError(e)) setLoadError(e?.message || 'Could not load users.');
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [apiCall]);

    useEffect(() => {
        if (isAuthenticated && isAdmin) fetchUsers();
        else setLoading(false);
    }, [isAuthenticated, isAdmin, fetchUsers]);

    const stats = useMemo(() => {
        const by = (k: Role) => users.filter(u => u.role === k).length;
        return {
            total: users.length,
            student: by('student'),
            candidate: by('candidate'),
            teacher: by('teacher'),
            admin: by('admin'),
            active: users.filter(u => u.is_active).length,
            disabled: users.filter(u => !u.is_active).length,
            attention: users.filter(u => (u.failed_login_attempts || 0) >= ATTENTION).length,
            fresh: users.filter(u => daysSince(u.created_at) <= 30).length,
        };
    }, [users]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return users.filter(u => {
            if (roleTab !== 'all' && u.role !== roleTab) return false;
            if (q && !`${fullName(u)} ${u.email} ${u.username}`.toLowerCase().includes(q)) return false;
            if (statusKey === 'active' && !u.is_active) return false;
            if (statusKey === 'disabled' && u.is_active) return false;
            if (statusKey === 'attention' && (u.failed_login_attempts || 0) < ATTENTION) return false;
            if (statusKey === 'new' && daysSince(u.created_at) > 30) return false;
            if (range) {
                const d = dayjs(u.created_at);
                if (d.isBefore(range[0], 'day') || d.isAfter(range[1], 'day')) return false;
            }
            return true;
        });
    }, [users, search, roleTab, statusKey, range]);

    const hasFilters = !!(search || statusKey || range || roleTab !== 'all');
    const clearFilters = () => { setSearch(''); setStatusKey(null); setRange(null); setRoleTab('all'); };

    // Keep the selection limited to rows that are still visible.
    useEffect(() => {
        setSelectedIds(ids => ids.filter(id => filtered.some(u => u.id === id)));
        setCardLimit(20);
    }, [filtered]);

    /* ═══════════ EDITOR ═══════════ */
    const openCreate = () => {
        setEditing(null);
        setFormError(null);
        usernameTouched.current = false;
        form.resetFields();
        form.setFieldsValue({ role: roleTab !== 'all' ? roleTab : 'student', is_active: true, target_exam: 'tcf_canada' });
        setEditorOpen(true);
    };

    const openEdit = (u: User) => {
        setEditing(u);
        setFormError(null);
        usernameTouched.current = true;
        form.resetFields();
        form.setFieldsValue({
            username: u.username,
            email: u.email,
            first_name: u.first_name,
            last_name: u.last_name,
            role: u.role,
            is_active: u.is_active ?? true,
            target_exam: u.exam?.target_exam || 'tcf_canada',
            target_nclc: u.exam?.target_nclc ?? undefined,
            exam_date: u.exam?.exam_date ? dayjs(u.exam.exam_date) : null,
            admin_notes: u.exam?.admin_notes || '',
        });
        setEditorOpen(true);
    };

    const closeEditor = () => {
        if (saving) return;
        setEditorOpen(false);
        setEditing(null);
        setFormError(null);
    };

    const onValuesChange = (changed: Record<string, unknown>, all: Record<string, string>) => {
        if ('username' in changed) { usernameTouched.current = !!changed.username; return; }
        if (!editing && !usernameTouched.current && ('first_name' in changed || 'last_name' in changed || 'email' in changed)) {
            form.setFieldsValue({ username: suggestUsername(all.first_name, all.last_name, all.email) });
        }
    };

    const handleSubmit = async (values: any) => {
        setSaving(true);
        setFormError(null);
        try {
            const payload: Record<string, unknown> = {
                first_name: String(values.first_name || '').trim(),
                last_name: String(values.last_name || '').trim(),
                email: String(values.email || '').trim(),
                role: values.role,
                is_active: !!values.is_active,
            };
            if (!editing) payload.username = String(values.username || '').trim();
            if (ownAdminEdit) { delete payload.is_active; delete payload.role; }
            if (values.role === 'candidate') {
                payload.target_exam = values.target_exam || 'tcf_canada';
                payload.target_nclc = values.target_nclc ?? null;
                payload.exam_date = values.exam_date ? values.exam_date.format('YYYY-MM-DD') : null;
                payload.admin_notes = String(values.admin_notes || '').trim() || null;
            }

            const res = await apiCall(editing ? `/users/${editing.id}` : '/users', {
                method: editing ? 'PUT' : 'POST',
                headers: JSON_HEADERS,
                body: JSON.stringify(payload),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                const err: string = data.error || data.message || 'Could not save this user.';
                if (/already exists/i.test(err)) {
                    const text = 'This email or username is already used by another account.';
                    form.setFields([{ name: 'email', errors: [text] }, ...(!editing ? [{ name: 'username', errors: [text] }] : [])]);
                } else if (err === 'Validation failed' && Array.isArray(data.details)) {
                    setFormError(`Please check: ${data.details.map((d: any) => String(d.path || d.param).replace('_', ' ')).join(', ')}.`);
                } else {
                    setFormError(err);
                }
                return;
            }
            msg.success(editing
                ? `${payload.first_name}'s profile was updated`
                : values.role === 'candidate'
                    ? `${payload.first_name} was added as an exam candidate — open exam content to them from their profile`
                    : `${payload.first_name} was added — a welcome email with a temporary password is on its way`);
            setEditorOpen(false);
            setEditing(null);
            fetchUsers();
        } catch (e: any) {
            if (!handleAuthError(e)) setFormError("We couldn't reach the server. Try again.");
        } finally {
            setSaving(false);
        }
    };

    /* ═══════════ ACTIONS ═══════════ */
    const setActive = async (u: User, active: boolean) => {
        try {
            const res = await apiCall(`/users/${u.id}`, { method: 'PUT', headers: JSON_HEADERS, body: JSON.stringify({ is_active: active }) });
            if (!res.ok) {
                const d = await res.json().catch(() => ({}));
                msg.error(d.error || 'Could not update the account status');
                return;
            }
            msg.success(`${fullName(u)} ${active ? 'can sign in again' : 'can no longer sign in'}`);
            fetchUsers();
        } catch (e) {
            if (!handleAuthError(e)) msg.error('Could not update the account status');
        }
    };

    const confirmToggle = (u: User) => {
        if (isSelf(u) && u.is_active) { msg.warning('You cannot disable your own admin account.'); return; }
        const disabling = !!u.is_active;
        modal.confirm({
            title: disabling ? `Disable ${fullName(u)}?` : `Enable ${fullName(u)}?`,
            content: disabling
                ? "They will be signed out and won't be able to sign in until you enable the account again."
                : 'They will be able to sign in again. Failed sign-in attempts are reset.',
            okText: disabling ? 'Disable account' : 'Enable account',
            okButtonProps: disabling ? { danger: true } : undefined,
            centered: true,
            onOk: () => setActive(u, !disabling),
        });
    };

    const confirmDelete = (u: User) => {
        if (isSelf(u)) { msg.warning('You cannot delete your own admin account.'); return; }
        modal.confirm({
            title: `Delete ${fullName(u)}?`,
            icon: <ExclamationCircleFilled style={{ color: '#dc2626' }} />,
            content: 'This permanently removes the account. It cannot be undone — disable the account instead if you may need it later.',
            okText: 'Delete permanently',
            okButtonProps: { danger: true },
            centered: true,
            onOk: async () => {
                try {
                    const res = await apiCall(`/users/${u.id}`, { method: 'DELETE' });
                    if (!res.ok) {
                        const d = await res.json().catch(() => ({}));
                        msg.error(d.error || d.message || 'Could not delete the user');
                        return;
                    }
                    msg.success(`${fullName(u)} was deleted`);
                    if (profileId === u.id) setProfileId(null);
                    fetchUsers();
                } catch (e) {
                    if (!handleAuthError(e)) msg.error('Could not delete the user');
                }
            },
        });
    };

    const openReset = (u: User) => { setResetTarget(u); setResetMustChange(true); setResetDone(false); };
    const closeReset = () => { if (!resetting) { setResetTarget(null); setResetDone(false); } };
    const doReset = async () => {
        if (!resetTarget) return;
        setResetting(true);
        try {
            const res = await apiCall(`/users/${resetTarget.id}/reset-password`, {
                method: 'PUT', headers: JSON_HEADERS, body: JSON.stringify({ mustChange: resetMustChange }),
            });
            if (!res.ok) {
                const d = await res.json().catch(() => ({}));
                msg.error(d.error || d.message || 'Could not reset the password');
                return;
            }
            setResetDone(true);
            fetchUsers();
        } catch (e) {
            if (!handleAuthError(e)) msg.error('Could not reset the password');
        } finally {
            setResetting(false);
        }
    };

    const bulkSetActive = async (active: boolean) => {
        const targets = users.filter(u => selectedIds.includes(u.id) && !isSelf(u) && !!u.is_active !== active);
        if (!targets.length) { msg.info(`The selected users are already ${active ? 'active' : 'disabled'}.`); return; }
        setBulkBusy(true);
        const results = await Promise.allSettled(targets.map(u =>
            apiCall(`/users/${u.id}`, { method: 'PUT', headers: JSON_HEADERS, body: JSON.stringify({ is_active: active }) })
                .then(res => { if (!res.ok) throw new Error(String(res.status)); })));
        const ok = results.filter(x => x.status === 'fulfilled').length;
        setBulkBusy(false);
        setSelectedIds([]);
        fetchUsers();
        if (ok === targets.length) msg.success(`${ok} ${ok === 1 ? 'account' : 'accounts'} ${active ? 'enabled' : 'disabled'}`);
        else msg.warning(`${ok} of ${targets.length} accounts updated — the others could not be changed.`);
    };
    const confirmBulkDisable = () => {
        modal.confirm({
            title: `Disable ${selectedIds.length} ${selectedIds.length === 1 ? 'account' : 'accounts'}?`,
            content: "They won't be able to sign in until you enable them again. Your own account is never included.",
            okText: 'Disable accounts',
            okButtonProps: { danger: true },
            centered: true,
            onOk: () => bulkSetActive(false),
        });
    };

    const exportCsv = () => {
        const rows: (string | number)[][] = [
            ['ID', 'First name', 'Last name', 'Username', 'Email', 'Role', 'Status', 'Failed sign-ins', 'Joined'],
            ...filtered.map(u => [u.id, u.first_name, u.last_name, u.username, u.email, u.role, u.is_active ? 'Active' : 'Disabled',
                u.failed_login_attempts || 0, dayjs(u.created_at).format('YYYY-MM-DD')]),
        ];
        const csv = rows.map(row => row.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
        const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = `users-${dayjs().format('YYYY-MM-DD')}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const actionsMenu = (u: User): MenuProps['items'] => [
        { key: 'edit', icon: <EditOutlined />, label: 'Edit profile', onClick: () => openEdit(u) },
        { key: 'reset', icon: <KeyOutlined />, label: 'Reset password', onClick: () => openReset(u) },
        { type: 'divider' },
        {
            key: 'toggle',
            icon: u.is_active ? <StopOutlined /> : <CheckCircleOutlined />,
            label: u.is_active ? 'Disable account' : 'Enable account',
            disabled: isSelf(u),
            onClick: () => confirmToggle(u),
        },
        { key: 'delete', icon: <DeleteOutlined />, label: 'Delete user', danger: true, disabled: isSelf(u), onClick: () => confirmDelete(u) },
    ];

    /* ═══════════ ACCESS GUARDS ═══════════ */
    if (!isAuthenticated || !isAdmin) {
        return (
            <div className="um">
                <div className="um-denied">
                    <span className="um-denied-ic"><LockOutlined /></span>
                    <h2>{isAuthenticated ? 'Admins only' : 'Please sign in'}</h2>
                    <p>{isAuthenticated
                        ? `User management is available to administrators. You are signed in as ${user?.role || 'a user'}.`
                        : 'Sign in with an administrator account to manage users.'}</p>
                </div>
            </div>
        );
    }

    /* ═══════════ LOADING ═══════════ */
    if (loading) {
        return (
            <div className="um" aria-busy="true">
                <div className="um-header">
                    <div>
                        <Skeleton.Input active size="small" style={{ width: 110, height: 12 }} />
                        <div style={{ marginTop: 10 }}><Skeleton.Input active style={{ width: 200, height: 24 }} /></div>
                    </div>
                </div>
                <div className="um-overview">
                    <div className="um-summary"><Skeleton active title={{ width: '30%' }} paragraph={{ rows: 2 }} /></div>
                    <div className="um-tiles">
                        {[0, 1, 2, 3].map(i => <div key={i} className="um-tile"><Skeleton.Avatar active shape="square" size={38} /><Skeleton.Input active size="small" style={{ width: 80 }} /></div>)}
                    </div>
                </div>
                <div className="um-panel um-pad"><Skeleton active title={false} paragraph={{ rows: 9 }} /></div>
            </div>
        );
    }

    const pct = (n: number) => (stats.total ? Math.round((n / stats.total) * 100) : 0);
    const tiles: { key: StatusKey; label: string; value: number; hint: string; icon: React.ReactNode; tone: string }[] = [
        { key: 'active', label: 'Active', value: stats.active, hint: 'Can sign in', icon: <CheckCircleOutlined />, tone: 'green' },
        { key: 'disabled', label: 'Disabled', value: stats.disabled, hint: "Can't sign in", icon: <StopOutlined />, tone: 'slate' },
        { key: 'attention', label: 'Needs attention', value: stats.attention, hint: `${ATTENTION}+ failed sign-ins`, icon: <WarningOutlined />, tone: 'amber' },
        { key: 'new', label: 'New', value: stats.fresh, hint: 'Joined in 30 days', icon: <CalendarOutlined />, tone: 'indigo' },
    ];

    const columns: ColumnsType<User> = [
        {
            title: 'User',
            key: 'user',
            sorter: (a, b) => fullName(a).localeCompare(fullName(b)),
            render: (_, u) => (
                <div className="um-user">
                    <Avatar u={u} />
                    <div className="um-user-text">
                        <div className="um-user-name">{fullName(u)}{isSelf(u) && <span className="um-you">You</span>}</div>
                        <div className="um-user-email">{u.email}</div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Role',
            dataIndex: 'role',
            width: 130,
            sorter: (a, b) => a.role.localeCompare(b.role),
            render: (role: Role) => <RolePill role={role} />,
        },
        {
            title: 'Status',
            key: 'status',
            width: 170,
            sorter: (a, b) => Number(!!b.is_active) - Number(!!a.is_active),
            render: (_, u) => <StatusCell u={u} />,
        },
        {
            title: 'Username',
            dataIndex: 'username',
            width: 180,
            responsive: ['xl'],
            ellipsis: true,
            render: (v: string) => <span className="um-handle">@{v}</span>,
        },
        {
            title: 'Joined',
            dataIndex: 'created_at',
            width: 150,
            defaultSortOrder: 'descend',
            sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
            render: (iso: string) => <div className="um-joined"><span>{fmtDate(iso)}</span><em>{agoText(iso)}</em></div>,
        },
        {
            title: <span className="sr-only">Actions</span>,
            key: 'actions',
            width: 92,
            align: 'right',
            render: (_, u) => (
                <div className="um-row-actions" onClick={e => e.stopPropagation()}>
                    <Tooltip title="Edit profile">
                        <Button type="text" className="um-icon-btn" icon={<EditOutlined />} onClick={() => openEdit(u)} aria-label={`Edit ${fullName(u)}`} />
                    </Tooltip>
                    <Dropdown menu={{ items: actionsMenu(u) }} trigger={['click']} placement="bottomRight">
                        <Button type="text" className="um-icon-btn" icon={<MoreOutlined />} aria-label={`More actions for ${fullName(u)}`} />
                    </Dropdown>
                </div>
            ),
        },
    ];

    const empty = (
        <div className="um-empty">
            <span className="um-empty-ic"><TeamOutlined /></span>
            <strong>{users.length ? 'No users match these filters' : 'No users yet'}</strong>
            <span>{users.length ? 'Try another search or clear the filters.' : 'Add your first teacher or student to get started.'}</span>
            {users.length ? <Button onClick={clearFilters}>Clear filters</Button> : <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Add user</Button>}
        </div>
    );
    const useCards = r.width < 768;
    const facts = profile ? [
        { label: 'Username', value: <span className="um-handle">@{profile.username}</span> },
        { label: 'Email', value: profile.email },
        { label: 'User ID', value: `#${profile.id}` },
        { label: 'Joined', value: `${fmtDate(profile.created_at)} · ${agoText(profile.created_at)}` },
        { label: 'Failed sign-ins', value: String(profile.failed_login_attempts || 0) },
    ] : [];

    return (
        <ConfigProvider theme={{ token: { colorPrimary: '#4f46e5', fontSize: 13, borderRadius: 8 } }}>
            <div className="um">
                {msgHolder}
                {modalHolder}

                {/* ── Header ── */}
                <header className="um-header">
                    <div>
                        <div className="um-overline">Admin console · People</div>
                        <h1 className="um-title">Users</h1>
                        <p className="um-subtitle">Manage accounts, roles and sign-in access for everyone on the platform.</p>
                    </div>
                    <div className="um-header-actions">
                        <Tooltip title="Refresh"><Button icon={<ReloadOutlined />} onClick={() => { setLoading(true); fetchUsers(); }} aria-label="Refresh" /></Tooltip>
                        <Button icon={<DownloadOutlined />} onClick={exportCsv} disabled={!filtered.length}>{r.isMobile ? 'CSV' : 'Export CSV'}</Button>
                        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Add user</Button>
                    </div>
                </header>

                {loadError && (
                    <div className="um-alert" role="alert">
                        <ExclamationCircleFilled />
                        <div><strong>Couldn't load users</strong><span>{loadError}</span></div>
                        <Button size="small" onClick={() => { setLoading(true); fetchUsers(); }}>Retry</Button>
                    </div>
                )}

                {/* ── Overview ── */}
                <section className="um-overview" aria-label="Overview">
                    <div className="um-summary">
                        <div className="um-summary-top">
                            <div>
                                <span className="um-summary-label">Total users</span>
                                <strong className="um-summary-value">{stats.total}</strong>
                            </div>
                            <span className="um-summary-sub">{stats.active} active · {stats.disabled} disabled</span>
                        </div>
                        <div className="um-dist" aria-hidden>
                            {ROLES.map(k => (stats[k] ? <span key={k} className={`is-${k}`} style={{ flexGrow: stats[k] }} /> : null))}
                        </div>
                        <div className="um-legend">
                            {ROLES.map(k => (
                                <button key={k} type="button" className={`um-legend-item is-${k}${roleTab === k ? ' is-active' : ''}`}
                                    onClick={() => setRoleTab(roleTab === k ? 'all' : k)} aria-pressed={roleTab === k}>
                                    <i />{ROLE_META[k].plural}<b>{stats[k]}</b><em>{pct(stats[k])}%</em>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="um-tiles">
                        {tiles.map(t => (
                            <button key={t.key} type="button" className={`um-tile um-k-${t.tone}${statusKey === t.key ? ' is-active' : ''}`}
                                onClick={() => setStatusKey(statusKey === t.key ? null : t.key)} aria-pressed={statusKey === t.key}>
                                <span className="um-tile-ic">{t.icon}</span>
                                <span className="um-tile-text"><span>{t.label}</span><strong>{t.value}</strong></span>
                                <em>{t.hint}</em>
                            </button>
                        ))}
                    </div>
                </section>

                {/* ── Directory ── */}
                <section className="um-panel" aria-label="User directory">
                    <div className="um-toolbar">
                        {selectedIds.length > 0 ? (
                            <div className="um-bulk">
                                <span><b>{selectedIds.length}</b> selected</span>
                                <Button size="small" icon={<CheckCircleOutlined />} loading={bulkBusy} onClick={() => bulkSetActive(true)}>Enable</Button>
                                <Button size="small" danger icon={<StopOutlined />} disabled={bulkBusy} onClick={confirmBulkDisable}>Disable</Button>
                                <Button size="small" type="text" onClick={() => setSelectedIds([])}>Clear</Button>
                            </div>
                        ) : (
                            <Segmented className="um-tabs" value={roleTab} onChange={v => setRoleTab(v as RoleTab)}
                                options={[
                                    { value: 'all', label: <span className="um-seg">All <b>{stats.total}</b></span> },
                                    ...ROLES.map(k => ({ value: k, label: <span className="um-seg">{ROLE_META[k].plural} <b>{stats[k]}</b></span> })),
                                ]} />
                        )}
                        <Input className="um-search" prefix={<SearchOutlined />} allowClear placeholder="Search name, email or username"
                            value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="um-filters">
                        <Select className="um-filter" value={statusKey} onChange={v => setStatusKey(v ?? null)} allowClear placeholder="Any status"
                            options={tiles.map(t => ({ value: t.key, label: t.label }))} />
                        <DatePicker.RangePicker className="um-range" value={range} allowClear format="MMM D, YYYY" placeholder={['Joined from', 'To']}
                            onChange={v => setRange(v && v[0] && v[1] ? [v[0], v[1]] : null)} />
                        {hasFilters && <Button type="link" size="small" onClick={clearFilters}>Clear filters</Button>}
                        <span className="um-count">{filtered.length === users.length ? `${users.length} users` : `${filtered.length} of ${users.length} users`}</span>
                    </div>

                    {useCards ? (
                        filtered.length === 0 ? empty : (
                            <div className="um-cards">
                                {filtered.slice(0, cardLimit).map(u => (
                                    <button key={u.id} type="button" className="um-card" onClick={() => setProfileId(u.id)}>
                                        <Avatar u={u} />
                                        <span className="um-card-main">
                                            <span className="um-user-name">{fullName(u)}{isSelf(u) && <span className="um-you">You</span>}</span>
                                            <span className="um-user-email">{u.email}</span>
                                            <span className="um-card-meta"><RolePill role={u.role} /><StatusCell u={u} /></span>
                                        </span>
                                        <RightOutlined className="um-card-chev" />
                                    </button>
                                ))}
                                {filtered.length > cardLimit && (
                                    <div className="um-more"><Button onClick={() => setCardLimit(n => n + 20)}>Show {Math.min(20, filtered.length - cardLimit)} more</Button></div>
                                )}
                            </div>
                        )
                    ) : (
                        <Table<User>
                            className="um-table"
                            columns={columns}
                            dataSource={filtered}
                            rowKey="id"
                            size="middle"
                            sticky={{ offsetHeader: headerHeight(r.isMobile) }}
                            scroll={{ x: 820 }}
                            locale={{ emptyText: empty }}
                            rowSelection={{
                                selectedRowKeys: selectedIds,
                                onChange: keys => setSelectedIds(keys),
                                getCheckboxProps: u => ({ disabled: isSelf(u), 'aria-label': `Select ${fullName(u)}` }),
                            }}
                            onRow={u => ({
                                onClick: e => {
                                    if ((e.target as HTMLElement).closest('.ant-table-selection-column, .um-row-actions')) return;
                                    setProfileId(u.id);
                                },
                                className: 'um-row',
                            })}
                            pagination={{
                                defaultPageSize: 20,
                                showSizeChanger: true,
                                pageSizeOptions: ['10', '20', '50', '100'],
                                showTotal: (total, [a, b]) => `${a}–${b} of ${total}`,
                                hideOnSinglePage: false,
                            }}
                        />
                    )}
                </section>

                {/* ── Profile drawer ── */}
                <Drawer open={!!profile} onClose={() => setProfileId(null)} width={r.isMobile ? '100%' : 420} closable={false} title={null} className="um-drawer">
                    {profile && (
                        <div className="um-profile">
                            <div className={`um-profile-head is-${profile.role}`}>
                                <button type="button" className="um-drawer-close" onClick={() => setProfileId(null)} aria-label="Close"><CloseOutlined /></button>
                                <Avatar u={profile} large />
                                <h3>{fullName(profile)}{isSelf(profile) && <span className="um-you">You</span>}</h3>
                                <p>{profile.email}</p>
                                <div className="um-profile-tags"><RolePill role={profile.role} /><StatusCell u={profile} /></div>
                            </div>
                            <div className="um-profile-actions">
                                <Button type="primary" icon={<EditOutlined />} onClick={() => openEdit(profile)}>Edit profile</Button>
                                <Button icon={<KeyOutlined />} onClick={() => openReset(profile)}>Reset password</Button>
                            </div>
                            {profile.role === 'candidate' && (() => {
                                const ex = profile.exam;
                                const days = daysUntil(ex?.exam_date);
                                return (
                                    <div className="um-exam">
                                        <div className="um-exam-head">
                                            <h4><AimOutlined /> Exam preparation</h4>
                                            <span>{EXAM_LABEL[ex?.target_exam || 'tcf_canada']}</span>
                                        </div>
                                        <div className="um-exam-grid">
                                            <div><span>Target</span><b>{ex?.target_nclc ? `NCLC ${ex.target_nclc}` : '—'}</b></div>
                                            <div><span>Exam date</span><b>{ex?.exam_date ? dayjs(ex.exam_date).format('MMM D, YYYY') : '—'}</b>{days != null && days >= 0 && <em>in {days} day{days === 1 ? '' : 's'}</em>}</div>
                                            <div><span>Open content</span><b>{ex?.active_items ?? 0}</b>{ex?.access_until && <em>until {fmtDate(ex.access_until)}</em>}</div>
                                            <div><span>Results</span><b>{ex?.attempts ?? 0}</b><em>{ex?.last_practice_at ? `last ${agoText(ex.last_practice_at).toLowerCase()}` : 'no practice yet'}</em></div>
                                        </div>
                                        {ex?.admin_notes && <p className="um-exam-note"><LockOutlined /> {ex.admin_notes}</p>}
                                        {!ex?.active_items && (
                                            <p className="um-exam-warn"><WarningOutlined /> Nothing is open to this candidate yet — assign exam content so they can practise.</p>
                                        )}
                                        <div className="um-exam-actions">
                                            <Button type="primary" icon={<AimOutlined />} onClick={() => setAssignFor(profile)}>Assign exams</Button>
                                            <Button icon={<BarChartOutlined />} onClick={() => navigate(`/app/exam-preparation?results=${profile.id}`)}>View results</Button>
                                        </div>
                                    </div>
                                );
                            })()}
                            {(profile.failed_login_attempts || 0) >= ATTENTION && (
                                <div className="um-callout is-warn">
                                    <WarningOutlined />
                                    <div>
                                        <strong>{profile.failed_login_attempts} failed sign-in attempts</strong>
                                        <span>They may have forgotten their password. Resetting it emails them a new temporary one.</span>
                                    </div>
                                </div>
                            )}
                            <dl className="um-facts">
                                {facts.map(f => <div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>)}
                            </dl>
                            <div className="um-zone">
                                <h4>Account access</h4>
                                <div className="um-zone-row">
                                    <div>
                                        <strong>{profile.is_active ? 'Disable account' : 'Enable account'}</strong>
                                        <span>{profile.is_active ? 'Stops them from signing in. You can undo this anytime.' : 'Lets them sign in again and clears failed attempts.'}</span>
                                    </div>
                                    <Button danger={!!profile.is_active} disabled={isSelf(profile)} onClick={() => confirmToggle(profile)}>
                                        {profile.is_active ? 'Disable' : 'Enable'}
                                    </Button>
                                </div>
                                <div className="um-zone-row">
                                    <div>
                                        <strong>Delete user</strong>
                                        <span>Permanently removes the account. This cannot be undone.</span>
                                    </div>
                                    <Button danger type="text" icon={<DeleteOutlined />} disabled={isSelf(profile)} onClick={() => confirmDelete(profile)}>Delete</Button>
                                </div>
                                {isSelf(profile) && <p className="um-zone-note"><LockOutlined /> This is your own account — it can't be disabled or deleted here.</p>}
                            </div>
                        </div>
                    )}
                </Drawer>

                {/* ── Create / edit ── */}
                <Modal open={editorOpen} onCancel={closeEditor} footer={null} width={620} centered forceRender
                    maskClosable={!saving} closable={!saving} className="um-modal">
                    <div className="um-md">
                        <header className="um-md-head">
                            <span className="um-md-icon">{editing ? <EditOutlined /> : <UserAddOutlined />}</span>
                            <div>
                                <h3>{editing ? `Edit ${fullName(editing)}` : 'Add a user'}</h3>
                                <p>{editing ? 'Update profile details, role and access.' : 'They receive a welcome email with a temporary password.'}</p>
                            </div>
                        </header>

                        <Form form={form} layout="vertical" requiredMark={false} onFinish={handleSubmit} onValuesChange={onValuesChange} className="um-md-body">
                            <section className="um-md-section">
                                <div className="um-md-label">Role</div>
                                <Form.Item name="role" rules={[{ required: true, message: 'Choose a role' }]} className="um-md-roles">
                                    <RolePicker disabled={ownAdminEdit} />
                                </Form.Item>
                                {ownAdminEdit && <p className="um-md-note"><LockOutlined /> You can't change your own role or disable your own account.</p>}
                            </section>

                            <section className="um-md-section">
                                <div className="um-md-label">Profile</div>
                                <div className="um-md-grid">
                                    <Form.Item name="first_name" label="First name" rules={[{ required: true, whitespace: true, message: 'Enter a first name' }]}>
                                        <Input placeholder="e.g. Marie" autoComplete="off" maxLength={60} />
                                    </Form.Item>
                                    <Form.Item name="last_name" label="Last name" rules={[{ required: true, whitespace: true, message: 'Enter a last name' }]}>
                                        <Input placeholder="e.g. Dupont" autoComplete="off" maxLength={60} />
                                    </Form.Item>
                                </div>
                                <Form.Item name="email" label="Email address"
                                    rules={[{ required: true, message: 'Enter an email address' }, { type: 'email', message: 'Enter a valid email address' }]}>
                                    <Input prefix={<MailOutlined />} placeholder="name@example.com" autoComplete="off" inputMode="email" />
                                </Form.Item>
                                <Form.Item name="username" label="Username"
                                    extra={editing ? "Usernames can't be changed." : 'Suggested from the name — you can change it.'}
                                    rules={editing ? [] : [
                                        { required: true, message: 'Enter a username' },
                                        { min: 3, message: 'At least 3 characters' },
                                        { pattern: /^[a-zA-Z0-9._-]+$/, message: 'Use letters, numbers, dots, dashes or underscores' },
                                    ]}>
                                    <Input prefix={<UserOutlined />} placeholder="marie.dupont" disabled={!!editing} autoComplete="off" maxLength={40} />
                                </Form.Item>
                            </section>

                            {editRole === 'candidate' && (
                                <section className="um-md-section">
                                    <div className="um-md-label">Exam goal</div>
                                    <p className="um-md-note is-plain">Exam candidates only prepare for the exam: they see practice, results and their profile — no classes, batches or live meetings. Open content to them with “Assign exams”.</p>
                                    <div className="um-md-grid">
                                        <Form.Item name="target_exam" label="Exam">
                                            <Select options={Object.entries(EXAM_LABEL).map(([value, label]) => ({ value, label }))} />
                                        </Form.Item>
                                        <Form.Item name="target_nclc" label="Target level" extra={goalNclc ? NCLC_NOTE[goalNclc] : undefined}>
                                            <Select allowClear placeholder="Not set" options={NCLC_OPTIONS.map(n => ({ value: n, label: `NCLC ${n}` }))} />
                                        </Form.Item>
                                    </div>
                                    <Form.Item name="exam_date" label="Exam date">
                                        <DatePicker className="um-full" format="MMM D, YYYY" placeholder="Not booked yet" />
                                    </Form.Item>
                                    <Form.Item name="admin_notes" label="Private note" extra="Only administrators see this note.">
                                        <Input.TextArea rows={2} maxLength={2000} placeholder="e.g. Express Entry file, 3-month package" />
                                    </Form.Item>
                                </section>
                            )}

                            <section className="um-md-section">
                                <div className="um-md-label">Access</div>
                                <div className="um-switch-row">
                                    <div>
                                        <strong>Account active</strong>
                                        <span>Disabled users can't sign in. You can re-enable them anytime.</span>
                                    </div>
                                    <Form.Item name="is_active" valuePropName="checked" noStyle>
                                        <Switch disabled={ownAdminEdit} aria-label="Account active" />
                                    </Form.Item>
                                </div>
                                {editing ? (
                                    <div className="um-callout">
                                        <KeyOutlined />
                                        <div>
                                            <strong>Password</strong>
                                            <span>Passwords aren't edited here. Reset it to email them a new temporary one.</span>
                                        </div>
                                        <Button size="small" onClick={() => { const u = editing; closeEditor(); openReset(u); }}>Reset password</Button>
                                    </div>
                                ) : (
                                    <div className="um-callout is-info">
                                        <SafetyOutlined />
                                        <div>
                                            <strong>Temporary password</strong>
                                            <span>A secure 10-character password is generated and emailed to them. They must change it at their first sign-in.</span>
                                        </div>
                                    </div>
                                )}
                            </section>

                            {formError && (
                                <div className="um-alert" role="alert">
                                    <ExclamationCircleFilled />
                                    <div><strong>Couldn't save</strong><span>{formError}</span></div>
                                </div>
                            )}
                        </Form>

                        <footer className="um-md-foot">
                            <Button onClick={closeEditor} disabled={saving}>Cancel</Button>
                            <Button type="primary" loading={saving} onClick={() => form.submit()} icon={editing ? undefined : <UserAddOutlined />}>
                                {editing ? 'Save changes' : 'Create user'}
                            </Button>
                        </footer>
                    </div>
                </Modal>

                {/* ── Assign exam content to a candidate ── */}
                <ExamAssignmentModal
                    open={!!assignFor}
                    onClose={() => setAssignFor(null)}
                    apiCall={apiCall}
                    presetCandidates={assignFor ? [assignFor.id] : undefined}
                    onChanged={fetchUsers}
                />

                {/* ── Reset password ── */}
                <Modal open={!!resetTarget} onCancel={closeReset} footer={null} width={440} centered
                    maskClosable={!resetting} closable={!resetting} className="um-modal">
                    {resetTarget && (
                        <div className="um-confirm">
                            {resetDone ? (
                                <>
                                    <span className="um-confirm-ic is-success"><CheckCircleFilled /></span>
                                    <h3>Temporary password sent</h3>
                                    <p>
                                        A new password was emailed to <strong>{resetTarget.email}</strong>.
                                        {resetMustChange && ' They will choose their own password when they sign in.'}
                                    </p>
                                    <div className="um-confirm-actions"><Button type="primary" onClick={closeReset}>Done</Button></div>
                                </>
                            ) : (
                                <>
                                    <span className="um-confirm-ic"><KeyOutlined /></span>
                                    <h3>Reset {fullName(resetTarget)}'s password?</h3>
                                    <p>A new temporary password is generated and emailed to <strong>{resetTarget.email}</strong>. Their current password stops working right away.</p>
                                    <Checkbox className="um-check" checked={resetMustChange} onChange={e => setResetMustChange(e.target.checked)}>
                                        Ask them to choose a new password at next sign-in
                                    </Checkbox>
                                    <div className="um-confirm-actions">
                                        <Button onClick={closeReset} disabled={resetting}>Cancel</Button>
                                        <Button type="primary" icon={<MailOutlined />} loading={resetting} onClick={doReset}>Reset and email</Button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </Modal>
            </div>
        </ConfigProvider>
    );
};

export default UserManagement;
