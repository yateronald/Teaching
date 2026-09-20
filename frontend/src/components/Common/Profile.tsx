import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, ConfigProvider, Form, Input, Modal, Skeleton, Tooltip, message } from 'antd';
import {
    CalendarOutlined, CameraOutlined, CheckCircleFilled, ClockCircleOutlined, DeleteOutlined, ExclamationCircleOutlined,
    GlobalOutlined, IdcardOutlined, LoadingOutlined, LockOutlined, MailOutlined, SafetyCertificateOutlined, UserOutlined, WarningOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import ChangeEmailModal from './ChangeEmailModal';
import TimezoneSelect from './TimezoneSelect';
import ExamGoalSection from '../Candidate/ExamGoalSection';
import SignedInDevices from './SignedInDevices';
import { resolveTimezone, timezoneLabel } from '../../utils/timezone';
import '../Teacher/Teacher.css';
import './Profile.css';

/* ══════════════════════════════════════════
   PROFILE & SETTINGS — shared by every role.
   Personal details are edited in place with a save bar; security actions open dialogs.
══════════════════════════════════════════ */

interface UserProfile {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: 'admin' | 'teacher' | 'student' | 'candidate';
    created_at: string;
    timezone?: string;
    profile_photo_kdrive_file_id?: string | null;
}
type Editable = Pick<UserProfile, 'first_name' | 'last_name' | 'username' | 'email' | 'timezone'>;

const ROLE: Record<UserProfile['role'], string> = { admin: 'Administrator', teacher: 'Teacher', student: 'Student', candidate: 'Exam candidate' };
const PHOTO_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

const fmtJoined = (v?: string | null) => {
    if (!v) return '—';
    const d = new Date(v.includes('T') ? v : v.replace(' ', 'T'));
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
};
const initialsOf = (p: UserProfile | null) => {
    if (!p) return '?';
    const s = `${p.first_name?.[0] || ''}${p.last_name?.[0] || ''}`.trim() || p.username?.[0] || '?';
    return s.toUpperCase();
};
/**
 * Only the fields actually on screen may count as a change. The email input is
 * rendered for administrators alone — everyone else changes their address
 * through the verification dialog — and a field that is not rendered is absent
 * from the watched values, so comparing it would leave the page looking
 * permanently unsaved.
 */
const EDITABLE_FIELDS = ['first_name', 'last_name', 'username', 'email', 'timezone'] as const;
const sameValues = (a: Partial<Editable>, b: Partial<Editable>, fields: readonly (keyof Editable)[]) =>
    fields.every(k => (a[k] ?? '') === (b[k] ?? ''));

/** A live "10:42 AM" in a zone, updated each minute. */
const useClock = (tz: string) => {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const id = window.setInterval(() => setNow(new Date()), 30_000);
        return () => window.clearInterval(id);
    }, []);
    try {
        return {
            time: new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit' }).format(now),
            day: new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'long', month: 'short', day: 'numeric' }).format(now),
        };
    } catch {
        return { time: '—', day: '' };
    }
};

/** 0–4 with a label; guidance only — the server requires 6+ characters. */
const passwordStrength = (pw: string) => {
    if (!pw) return { score: 0, label: '' };
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
    if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
    if (pw.length < 6) score = 0;
    return { score, label: ['Too short', 'Weak', 'Fair', 'Good', 'Strong'][score] };
};

const Profile: React.FC = () => {
    const { apiCall, updateProfile, changePassword, isAdmin, refreshUser } = useAuth();
    const [msg, msgHolder] = message.useMessage();
    const [form] = Form.useForm<Editable>();
    const [pwForm] = Form.useForm<{ currentPassword: string; newPassword: string; confirmPassword: string }>();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [pwOpen, setPwOpen] = useState(false);
    const [pwSaving, setPwSaving] = useState(false);
    const [emailOpen, setEmailOpen] = useState(false);

    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [photoBusy, setPhotoBusy] = useState(false);
    const photoUrlRef = useRef<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const values = Form.useWatch([], form) as Partial<Editable> | undefined;
    const newPassword = Form.useWatch('newPassword', pwForm) || '';

    const load = useCallback(async () => {
        try {
            const res = await apiCall('/auth/profile');
            if (!res.ok) throw new Error(`The server answered ${res.status}.`);
            const data = await res.json();
            const p: UserProfile = data.user;
            setProfile(p);
            form.setFieldsValue({ first_name: p.first_name, last_name: p.last_name, username: p.username, email: p.email, timezone: p.timezone });
            setLoadError(null);
        } catch (e: any) {
            setLoadError(e?.message || 'Your profile could not be loaded.');
        } finally {
            setLoading(false);
        }
    }, [apiCall, form]);

    useEffect(() => { load(); }, [load]);

    // The photo is fetched with the Authorization header — it used to travel as ?token=… in the image URL,
    // which leaks the session token into server logs and browser history.
    const photoId = profile?.profile_photo_kdrive_file_id ? `${profile.id}:${profile.profile_photo_kdrive_file_id}` : null;
    useEffect(() => {
        let cancelled = false;
        const replace = (url: string | null) => {
            if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
            photoUrlRef.current = url;
            setPhotoUrl(url);
        };
        if (!photoId || !profile) { replace(null); return; }
        apiCall(`/auth/profile-photo/${profile.id}?v=${encodeURIComponent(photoId)}`)
            .then(async res => { if (!res.ok) throw new Error(); const blob = await res.blob(); if (!cancelled) replace(URL.createObjectURL(blob)); })
            .catch(() => { if (!cancelled) replace(null); });
        return () => { cancelled = true; };
        // photoId captures everything that changes the image
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [photoId]);
    useEffect(() => () => { if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current); }, []);

    const saved: Partial<Editable> = useMemo(() => profile
        ? { first_name: profile.first_name, last_name: profile.last_name, username: profile.username, email: profile.email, timezone: profile.timezone }
        : {}, [profile]);
    const editableFields = useMemo(
        () => EDITABLE_FIELDS.filter(field => field !== 'email' || isAdmin), [isAdmin]);
    const dirty = !!profile && !!values && !sameValues(values, saved, editableFields);

    const tz = resolveTimezone(values?.timezone ?? profile?.timezone);
    const clock = useClock(tz);

    const save = async () => {
        let v: Editable;
        try { v = await form.validateFields(); } catch { return; }
        setSaving(true);
        try {
            const result = await updateProfile({
                first_name: v.first_name?.trim(),
                last_name: v.last_name?.trim(),
                username: v.username?.trim(),
                timezone: v.timezone,
                ...(isAdmin ? { email: v.email?.trim() } : {}),
            });
            if (result.success) await load();       // updateProfile shows its own message
        } finally {
            setSaving(false);
        }
    };
    const discard = () => form.setFieldsValue(saved);

    const pickPhoto = () => { if (!photoBusy) fileRef.current?.click(); };
    const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        if (!PHOTO_TYPES.includes(file.type)) { msg.error('Choose a JPG, PNG, WEBP or GIF image.'); return; }
        if (file.size > 5 * 1024 * 1024) { msg.error('The image must be 5 MB or smaller.'); return; }
        const body = new FormData();
        body.append('photo', file);
        setPhotoBusy(true);
        try {
            const res = await apiCall('/auth/profile-photo', { method: 'POST', body });
            if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || 'The photo could not be uploaded.');
            msg.success('Photo updated');
            await Promise.all([load(), refreshUser()]);
        } catch (err: any) {
            msg.error(err?.message || 'The photo could not be uploaded.');
        } finally {
            setPhotoBusy(false);
        }
    };
    const removePhoto = async () => {
        setPhotoBusy(true);
        try {
            const res = await apiCall('/auth/profile-photo', { method: 'DELETE' });
            if (!res.ok) throw new Error();
            msg.success('Photo removed');
            await Promise.all([load(), refreshUser()]);
        } catch {
            msg.error('The photo could not be removed.');
        } finally {
            setPhotoBusy(false);
        }
    };

    const submitPassword = async () => {
        let v: { currentPassword: string; newPassword: string };
        try { v = await pwForm.validateFields(); } catch { return; }
        setPwSaving(true);
        try {
            const result = await changePassword(v.currentPassword, v.newPassword);   // shows its own message
            if (result.success) { setPwOpen(false); pwForm.resetFields(); }
        } finally {
            setPwSaving(false);
        }
    };

    /* ═══════════ LOADING / ERROR ═══════════ */
    if (loading) {
        return (
            <div className="tc pf" aria-busy="true">
                <div className="tc-header"><div><Skeleton.Input active size="small" style={{ width: 90, height: 12 }} /><div style={{ marginTop: 10 }}><Skeleton.Input active style={{ width: 220, height: 26 }} /></div></div></div>
                <div className="pf-grid">
                    <div className="tc-card tc-pad"><Skeleton active avatar={{ size: 88 }} paragraph={{ rows: 5 }} /></div>
                    <div className="pf-main"><div className="tc-card tc-pad"><Skeleton active paragraph={{ rows: 6 }} /></div><div className="tc-card tc-pad"><Skeleton active paragraph={{ rows: 3 }} /></div></div>
                </div>
            </div>
        );
    }
    if (!profile) {
        return (
            <div className="tc pf">
                <div className="tc-alert" role="alert"><WarningOutlined /><span><strong>Your profile couldn't be loaded.</strong> {loadError}</span><Button size="small" onClick={() => { setLoading(true); load(); }}>Retry</Button></div>
            </div>
        );
    }

    const name = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username;
    const checks = [
        { done: !!photoUrl, label: 'Add a profile photo', action: pickPhoto },
        { done: !!(profile.first_name?.trim() && profile.last_name?.trim()), label: 'Fill in your first and last name', action: () => document.getElementById('pf-first')?.focus() },
        { done: !!profile.timezone && profile.timezone !== 'UTC', label: 'Choose your time zone', action: () => document.getElementById('pf-timezone')?.scrollIntoView({ behavior: 'smooth', block: 'center' }) },
    ];
    const completion = Math.round((checks.filter(c => c.done).length / checks.length) * 100);
    const strength = passwordStrength(newPassword);

    return (
        <ConfigProvider theme={{ token: { colorPrimary: '#4f46e5', fontSize: 13, borderRadius: 8 } }}>
            {msgHolder}
            <div className={`tc pf${dirty ? ' has-savebar' : ''}`}>
                <header className="tc-header">
                    <div>
                        <div className="tc-overline">Account</div>
                        <h1 className="tc-title">Profile & settings</h1>
                        <p className="tc-subtitle">Your details, the time zone every schedule is shown in, and how you sign in.</p>
                    </div>
                </header>

                <div className="pf-grid">
                    {/* ── Identity ── */}
                    <aside className="tc-card pf-id">
                        <div className={`pf-cover is-${profile.role}`} aria-hidden />
                        <input ref={fileRef} type="file" accept={PHOTO_TYPES.join(',')} hidden onChange={uploadPhoto} />
                        <div className="pf-avatar-wrap">
                            <button type="button" className="pf-avatar" onClick={pickPhoto} disabled={photoBusy} aria-label={photoUrl ? 'Change profile photo' : 'Add a profile photo'}>
                                {photoUrl ? <img src={photoUrl} alt="" /> : <span>{initialsOf(profile)}</span>}
                                <span className="pf-avatar-overlay">{photoBusy ? <LoadingOutlined /> : <CameraOutlined />}</span>
                            </button>
                        </div>
                        <div className="pf-id-body">
                            <h2>{name}</h2>
                            <span className={`pf-role is-${profile.role}`}><i aria-hidden />{ROLE[profile.role]}</span>
                            <div className="pf-photo-actions">
                                <Button size="small" icon={<CameraOutlined />} onClick={pickPhoto} disabled={photoBusy}>{photoUrl ? 'Change photo' : 'Add photo'}</Button>
                                {photoUrl && <Tooltip title="Remove photo"><Button size="small" icon={<DeleteOutlined />} className="pf-danger" onClick={removePhoto} disabled={photoBusy} aria-label="Remove photo" /></Tooltip>}
                            </div>
                            <p className="pf-hint">JPG, PNG, WEBP or GIF · up to 5 MB</p>

                            <dl className="pf-facts">
                                <div><dt><MailOutlined /> Email</dt><dd title={profile.email}>{profile.email}</dd></div>
                                <div><dt><UserOutlined /> Username</dt><dd>@{profile.username}</dd></div>
                                <div><dt><CalendarOutlined /> Member since</dt><dd>{fmtJoined(profile.created_at)}</dd></div>
                                <div><dt><ClockCircleOutlined /> Your time</dt><dd>{clock.time} <em>{timezoneLabel(profile.timezone)}</em></dd></div>
                            </dl>

                            <div className="pf-complete">
                                <div className="pf-complete-head"><span>Profile</span><b>{completion}%</b></div>
                                <span className="tc-kpi-meter pf-meter"><i style={{ width: `${completion}%` }} /></span>
                                <ul>
                                    {checks.map(c => (
                                        <li key={c.label} className={c.done ? 'is-done' : ''}>
                                            {c.done ? <CheckCircleFilled /> : <ExclamationCircleOutlined />}
                                            {c.done ? <span>{c.label}</span> : <button type="button" onClick={c.action}>{c.label}</button>}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </aside>

                    <div className="pf-main">
                        <Form form={form} layout="vertical" requiredMark={false} onFinish={save}>
                            {/* ── Personal information ── */}
                            <section className="tc-card pf-section">
                                <header className="pf-section-head">
                                    <span className="pf-section-ic"><IdcardOutlined /></span>
                                    <div><h3>Personal information</h3><p>How your name appears to {profile.role === 'student' ? 'your teachers' : profile.role === 'candidate' ? 'your administrator' : 'students and colleagues'}.</p></div>
                                </header>
                                <div className="pf-fields">
                                    <Form.Item name="first_name" label="First name" rules={[{ required: true, whitespace: true, message: 'Enter your first name' }]}>
                                        <Input id="pf-first" maxLength={60} autoComplete="given-name" />
                                    </Form.Item>
                                    <Form.Item name="last_name" label="Last name" rules={[{ required: true, whitespace: true, message: 'Enter your last name' }]}>
                                        <Input maxLength={60} autoComplete="family-name" />
                                    </Form.Item>
                                    <Form.Item name="username" label="Username" rules={[{ required: true, whitespace: true, message: 'Enter a username' }, { min: 3, message: 'At least 3 characters' }]}>
                                        <Input prefix={<span className="pf-at">@</span>} maxLength={40} autoComplete="username" />
                                    </Form.Item>
                                    {isAdmin ? (
                                        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Enter a valid email address' }]}>
                                            <Input maxLength={120} autoComplete="email" />
                                        </Form.Item>
                                    ) : (
                                        <div className="pf-readonly">
                                            <span className="pf-readonly-label">Email</span>
                                            <div className="pf-readonly-value"><span title={profile.email}>{profile.email}</span><Button type="link" size="small" onClick={() => setEmailOpen(true)}>Change</Button></div>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* ── Time zone ── */}
                            <section className="tc-card pf-section" id="pf-timezone">
                                <header className="pf-section-head">
                                    <span className="pf-section-ic is-teal"><GlobalOutlined /></span>
                                    <div><h3>Time zone</h3><p>Classes, quiz windows and deadlines are shown in this zone everywhere in the platform.</p></div>
                                </header>
                                <div className="pf-tz">
                                    <Form.Item name="timezone" label="Your time zone" className="pf-tz-field">
                                        <TimezoneSelect size="large" />
                                    </Form.Item>
                                    <div className="pf-clock" aria-live="polite">
                                        <span className="pf-clock-label">Local time there now</span>
                                        <strong>{clock.time}</strong>
                                        <em>{clock.day} · {timezoneLabel(values?.timezone ?? profile.timezone)}</em>
                                    </div>
                                </div>
                            </section>
                        </Form>

                        {/* ── Exam goal (exam candidates) ── */}
                        {profile.role === 'candidate' && <ExamGoalSection />}

                        {/* ── Security ── */}
                        <section className="tc-card pf-section">
                            <header className="pf-section-head">
                                <span className="pf-section-ic is-amber"><SafetyCertificateOutlined /></span>
                                <div><h3>Sign-in & security</h3><p>Keep your account protected.</p></div>
                            </header>
                            <ul className="pf-security">
                                <li>
                                    <span className="pf-security-ic"><LockOutlined /></span>
                                    <div><strong>Password</strong><em>Use a long password you don't use anywhere else.</em></div>
                                    <Button onClick={() => setPwOpen(true)}>Change password</Button>
                                </li>
                                <li>
                                    <span className="pf-security-ic"><MailOutlined /></span>
                                    <div><strong>Email address</strong><em>{profile.email} — used to sign in and for notifications.</em></div>
                                    <Button onClick={() => setEmailOpen(true)}>Change email</Button>
                                </li>
                            </ul>
                        </section>

                        {/* ── Signed-in devices ── */}
                        <SignedInDevices />
                    </div>
                </div>

                {/* ── Save bar ── */}
                {dirty && (
                    <div className="pf-savebar" role="region" aria-label="Unsaved changes">
                        <span><i aria-hidden /> You have unsaved changes</span>
                        <div>
                            <Button onClick={discard} disabled={saving}>Discard</Button>
                            <Button type="primary" onClick={save} loading={saving}>Save changes</Button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Change password ── */}
            <Modal open={pwOpen} onCancel={() => { if (!pwSaving) { setPwOpen(false); pwForm.resetFields(); } }} footer={null} title={null} closable={false}
                width="min(460px, calc(100vw - 24px))" wrapClassName="tc-modal pf-modal" styles={{ body: { padding: 0 } }} destroyOnHidden centered>
                <header className="tc-up-head">
                    <span className="tc-up-ic"><LockOutlined /></span>
                    <div><h2>Change password</h2><p>You stay signed in here; your other devices are signed out.</p></div>
                </header>
                <Form form={pwForm} layout="vertical" requiredMark={false} className="pf-pw" onFinish={submitPassword}>
                    <Form.Item name="currentPassword" label="Current password" rules={[{ required: true, message: 'Enter your current password' }]}>
                        <Input.Password autoComplete="current-password" autoFocus />
                    </Form.Item>
                    <Form.Item name="newPassword" label="New password" rules={[
                        { required: true, message: 'Enter a new password' },
                        { min: 6, message: 'At least 6 characters' },
                        ({ getFieldValue }) => ({ validator: (_, v) => (v && v === getFieldValue('currentPassword') ? Promise.reject(new Error('Choose a password different from the current one')) : Promise.resolve()) }),
                    ]} extra={newPassword ? (
                        <span className={`pf-strength is-${strength.score}`}>
                            <span className="pf-strength-bars">{[1, 2, 3, 4].map(i => <i key={i} className={strength.score >= i ? 'is-on' : ''} />)}</span>
                            {strength.label}{strength.score < 3 && ' — longer, with mixed case, numbers and symbols, is stronger'}
                        </span>
                    ) : 'At least 6 characters. 12 or more with a mix of characters is best.'}>
                        <Input.Password autoComplete="new-password" />
                    </Form.Item>
                    <Form.Item name="confirmPassword" label="Confirm new password" dependencies={['newPassword']} rules={[
                        { required: true, message: 'Repeat the new password' },
                        ({ getFieldValue }) => ({ validator: (_, v) => (!v || v === getFieldValue('newPassword') ? Promise.resolve() : Promise.reject(new Error('The passwords don’t match'))) }),
                    ]}>
                        <Input.Password autoComplete="new-password" />
                    </Form.Item>
                    <div className="pf-pw-foot">
                        <Button onClick={() => { setPwOpen(false); pwForm.resetFields(); }} disabled={pwSaving}>Cancel</Button>
                        <Button type="primary" htmlType="submit" loading={pwSaving}>Update password</Button>
                    </div>
                </Form>
            </Modal>

            <ChangeEmailModal open={emailOpen} onClose={() => setEmailOpen(false)} onSuccess={() => load()} currentEmail={profile.email} />
        </ConfigProvider>
    );
};

export default Profile;
