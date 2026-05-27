import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    Form,
    Input,
    Button,
    message,
    Typography,
    Row,
    Col,
    Modal,
    Skeleton,
} from 'antd';
import {
    UserOutlined,
    EditOutlined,
    SaveOutlined,
    MailOutlined,
    CalendarOutlined,
    LockOutlined,
    CloseOutlined,
    IdcardOutlined,
    SafetyOutlined,
    CheckCircleFilled,
    CameraOutlined,
    LoadingOutlined,
    DeleteOutlined,
    GlobalOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import ChangeEmailModal from './ChangeEmailModal';
import TimezoneSelect from './TimezoneSelect';
import useResponsive from '../../hooks/useResponsive';

const { Text } = Typography;

interface UserProfile {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: 'admin' | 'teacher' | 'student';
    created_at: string;
    timezone?: string;
    profile_photo_kdrive_file_id?: string | null;
}

const formatDateSafe = (value?: string | null) => {
    if (!value) return '-';
    const candidates = [value, value.replace(' ', 'T')];
    for (const v of candidates) {
        const d = new Date(v);
        if (!isNaN(d.getTime())) {
            return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        }
    }
    return '-';
};

// Render a timezone with its current offset, e.g. "America/Toronto · GMT-4".
const timezoneDisplay = (tz?: string | null): string => {
    const safe = tz || 'UTC';
    try {
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: safe, timeZoneName: 'shortOffset',
        }).formatToParts(new Date());
        const tzPart = parts.find(p => p.type === 'timeZoneName');
        return tzPart ? `${safe} · ${tzPart.value}` : safe;
    } catch {
        return safe;
    }
};

const ROLE_CONFIG: Record<string, { label: string; bg: string; color: string; dot: string; gradient: string }> = {
    admin:   { label: 'Administrator', bg: '#fef3c7', color: '#b45309', dot: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
    teacher: { label: 'Teacher',       bg: '#eef2ff', color: '#4338ca', dot: '#6366f1', gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)' },
    student: { label: 'Student',       bg: '#dcfce7', color: '#15803d', dot: '#22c55e', gradient: 'linear-gradient(135deg, #22c55e, #16a34a)' },
};

/* ── Small field display row ──
 * Uses a flex layout that adapts to compact screens by stacking.
 */
const InfoRow = ({ icon, label, value, mono = false, compact = false }: { icon: React.ReactNode; label: string; value: string; mono?: boolean; compact?: boolean }) => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: compact ? 12 : 14,
        padding: compact ? '12px 0' : '14px 0',
        borderBottom: '1px solid #f0f0f8',
    }}>
        <div style={{
            width: compact ? 32 : 36,
            height: compact ? 32 : 36,
            borderRadius: 10,
            background: '#f4f3ff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#6366f1',
            fontSize: compact ? 13 : 15,
            flexShrink: 0,
        }}>
            {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
                fontSize: compact ? 10 : 11,
                fontWeight: 600,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: 0.6,
                marginBottom: 2,
            }}>{label}</div>
            <div style={{
                fontSize: compact ? 13 : 14,
                fontWeight: 600,
                color: '#1a1d2e',
                fontFamily: mono ? 'monospace' : undefined,
                wordBreak: 'break-word',
                lineHeight: 1.35,
            }}>{value || '—'}</div>
        </div>
    </div>
);

/* ── Security action row ──
 * On compact screens stacks the action button below the title to give
 * it room to breathe — on desktop keeps the button on the right.
 */
const SecurityRow = ({ icon, title, subtitle, actionLabel, onAction, danger = false, compact = false }: {
    icon: React.ReactNode; title: string; subtitle: string; actionLabel: string; onAction: () => void; danger?: boolean; compact?: boolean;
}) => (
    <div style={{
        display: 'flex',
        alignItems: compact ? 'flex-start' : 'center',
        gap: compact ? 12 : 16,
        padding: compact ? '14px 0' : '16px 0',
        borderBottom: '1px solid #f0f0f8',
        flexWrap: compact ? 'wrap' : 'nowrap',
    }}>
        <div style={{
            width: compact ? 36 : 40,
            height: compact ? 36 : 40,
            borderRadius: 12,
            background: danger ? '#fff1f2' : '#f4f3ff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: danger ? '#ef4444' : '#6366f1',
            fontSize: compact ? 16 : 18,
            flexShrink: 0,
        }}>
            {icon}
        </div>
        <div style={{ flex: compact ? '1 1 calc(100% - 48px)' : 1, minWidth: 0 }}>
            <div style={{ fontSize: compact ? 13 : 14, fontWeight: 700, color: '#1a1d2e', marginBottom: 2 }}>{title}</div>
            <div style={{ fontSize: compact ? 11.5 : 12, color: '#94a3b8', lineHeight: 1.4 }}>{subtitle}</div>
        </div>
        <Button
            onClick={onAction}
            block={compact}
            style={{
                borderRadius: 10, fontWeight: 600,
                fontSize: compact ? 12.5 : 13,
                height: compact ? 38 : 36,
                borderColor: danger ? '#fecaca' : '#e0e7ff',
                color: danger ? '#ef4444' : '#6366f1',
                background: danger ? '#fff1f2' : '#f4f3ff',
                paddingInline: compact ? 14 : 18,
                marginLeft: compact ? 48 : 0,
                marginTop: compact ? 2 : 0,
                width: compact ? 'calc(100% - 48px)' : 'auto',
            }}
        >
            {actionLabel}
        </Button>
    </div>
);

const Profile: React.FC = () => {
    const { apiCall, updateProfile, changePassword, isAdmin, token, refreshUser } = useAuth();
    const responsive = useResponsive();
    // Compact = phone-width (<768): stacks fields, full-width buttons,
    // smaller card padding, larger touch targets.
    const compact = responsive.isMobile;
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [form] = Form.useForm<UserProfile>();
    const [passwordForm] = Form.useForm<{ currentPassword: string; newPassword: string; confirmPassword: string }>();
    const [emailModalOpen, setEmailModalOpen] = useState(false);
    const [pwLoading, setPwLoading] = useState(false);

    // Profile-photo state
    const [photoUploading, setPhotoUploading] = useState(false);
    const [photoVersion, setPhotoVersion] = useState(0); // bumped on upload to bust the <img> cache
    const fileInputRef = useRef<HTMLInputElement>(null);

    const displayName = useMemo(() => {
        if (!profile) return '';
        const fn = profile.first_name?.trim() || '';
        const ln = profile.last_name?.trim() || '';
        return `${fn} ${ln}`.trim() || profile.username || 'User';
    }, [profile]);

    const hasPhoto = !!profile?.profile_photo_kdrive_file_id;
    const photoSrc = useMemo(() => {
        if (!hasPhoto || !profile) return '';
        // Build absolute URL; the <img> tag can't send Authorization headers,
        // so we pass the JWT as a query token (the auth middleware accepts it).
        const apiBase = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5000/api';
        const t = token ? `&token=${encodeURIComponent(token)}` : '';
        // photoVersion forces React/browser to refetch after upload/remove.
        return `${apiBase}/auth/profile-photo/${profile.id}?v=${photoVersion}${t}`;
    }, [hasPhoto, profile, photoVersion, token]);

    useEffect(() => { fetchProfile(); }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await apiCall('/auth/profile');
            if (response.ok) {
                const data = await response.json();
                const p: UserProfile = data.user;
                setProfile(p);
                form.setFieldsValue(p);
            } else { message.error('Failed to fetch profile'); }
        } catch { message.error('Error fetching profile'); }
        finally { setLoading(false); }
    };

    const handleUpdateProfile = async (values: Partial<UserProfile>) => {
        setSaving(true);
        try {
            const payload: Partial<UserProfile> = {
                first_name: values.first_name,
                last_name: values.last_name,
                username: values.username,
                timezone: values.timezone,
                ...(isAdmin ? { email: values.email } : {}),
            };
            const result = await updateProfile(payload);
            if (result.success) { await fetchProfile(); setEditing(false); }
            else if (result.error) message.error(result.error);
        } catch { message.error('Error updating profile'); }
        finally { setSaving(false); }
    };

    const handleChangePassword = async (values: { currentPassword: string; newPassword: string }) => {
        setPwLoading(true);
        try {
            const result = await changePassword(values.currentPassword, values.newPassword);
            if (result.success) { setPasswordModalVisible(false); passwordForm.resetFields(); }
            else if (result.error) message.error(result.error);
        } catch { message.error('Error changing password'); }
        finally { setPwLoading(false); }
    };

    /* ── Profile photo: trigger picker ── */
    const triggerPhotoPicker = () => {
        if (photoUploading) return;
        fileInputRef.current?.click();
    };

    /* ── Profile photo: validate + upload ── */
    const handlePhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        // Reset the input so picking the same file again still triggers `change`.
        if (e.target) e.target.value = '';
        if (!file) return;

        // Client-side validation (server validates again).
        const ALLOWED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (!ALLOWED.includes(file.type)) {
            message.error('Please select a JPG, PNG, WEBP, or GIF image');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            message.error('Image must be 5MB or less');
            return;
        }

        const formData = new FormData();
        formData.append('photo', file);

        setPhotoUploading(true);
        try {
            const response = await apiCall('/auth/profile-photo', {
                method: 'POST',
                body: formData,
            });
            if (response.ok) {
                message.success('Profile photo updated');
                setPhotoVersion(v => v + 1);
                await Promise.all([fetchProfile(), refreshUser()]);
            } else {
                let errMsg = 'Failed to upload photo';
                try { const data = await response.json(); errMsg = data.error || errMsg; } catch {}
                message.error(errMsg);
            }
        } catch (err) {
            console.error('Photo upload error:', err);
            message.error('Network error while uploading photo');
        } finally {
            setPhotoUploading(false);
        }
    };

    /* ── Profile photo: remove ── */
    const handleRemovePhoto = async () => {
        if (photoUploading) return;
        setPhotoUploading(true);
        try {
            const response = await apiCall('/auth/profile-photo', { method: 'DELETE' });
            if (response.ok) {
                message.success('Profile photo removed');
                setPhotoVersion(v => v + 1);
                await Promise.all([fetchProfile(), refreshUser()]);
            } else {
                message.error('Failed to remove photo');
            }
        } catch (err) {
            console.error('Photo remove error:', err);
            message.error('Network error while removing photo');
        } finally {
            setPhotoUploading(false);
        }
    };

    const roleConfig = ROLE_CONFIG[profile?.role || ''] || ROLE_CONFIG.student;

    /* ── Loading skeleton ── */
    if (loading) return (
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <div style={{
                display: 'flex',
                gap: compact ? 16 : 24,
                flexDirection: compact ? 'column' : 'row',
            }}>
                <div style={{ width: compact ? '100%' : 300, flexShrink: 0 }}>
                    <div style={{
                        borderRadius: compact ? 16 : 20,
                        background: '#fff',
                        border: '1px solid #f0f0f8',
                        boxShadow: '0 2px 16px rgba(99,102,241,0.07)',
                        padding: compact ? 22 : 32,
                        textAlign: 'center',
                    }}>
                        <Skeleton.Avatar active size={compact ? 80 : 96} style={{ marginBottom: 16 }} />
                        <Skeleton.Input active style={{ width: 160, height: 20, borderRadius: 8, marginBottom: 10 }} />
                        <Skeleton.Input active style={{ width: 80, height: 16, borderRadius: 20, marginBottom: 20 }} />
                        <Skeleton active paragraph={{ rows: 2 }} title={false} />
                    </div>
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{
                        borderRadius: compact ? 16 : 20,
                        background: '#fff',
                        border: '1px solid #f0f0f8',
                        boxShadow: '0 2px 16px rgba(99,102,241,0.07)',
                        padding: compact ? 18 : 28,
                        marginBottom: compact ? 16 : 20,
                    }}>
                        <Skeleton active paragraph={{ rows: 5 }} />
                    </div>
                    <div style={{
                        borderRadius: compact ? 16 : 20,
                        background: '#fff',
                        border: '1px solid #f0f0f8',
                        boxShadow: '0 2px 16px rgba(99,102,241,0.07)',
                        padding: compact ? 18 : 28,
                    }}>
                        <Skeleton active paragraph={{ rows: 3 }} />
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{
            maxWidth: 960,
            margin: '0 auto',
            paddingInline: compact ? 0 : undefined,
        }}>

            {/* Page header */}
            <div style={{ marginBottom: compact ? 18 : 28 }}>
                <div style={{
                    fontSize: compact ? 18 : 22,
                    fontWeight: 800,
                    color: '#1a1d2e',
                    letterSpacing: 0.2,
                    fontFamily: 'Manrope, Inter, sans-serif',
                }}>My Profile</div>
                <div style={{
                    fontSize: compact ? 12 : 13,
                    color: '#94a3b8',
                    marginTop: 4,
                    lineHeight: 1.4,
                }}>Manage your personal information and account settings</div>
            </div>

            <Row gutter={[compact ? 16 : 24, compact ? 16 : 24]}>

                {/* ── LEFT: Avatar card ── */}
                <Col xs={24} md={9}>
                    <div style={{
                        borderRadius: compact ? 16 : 20,
                        background: '#fff',
                        border: '1px solid #f0f0f8',
                        boxShadow: '0 2px 16px rgba(99,102,241,0.07)',
                        overflow: 'hidden',
                        height: '100%',
                    }}>
                        {/* gradient banner */}
                        <div style={{ height: 80, background: roleConfig.gradient, position: 'relative' }}>
                            {/* Hidden file input — re-used via ref */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                style={{ display: 'none' }}
                                onChange={handlePhotoSelected}
                            />

                            {/* Avatar wrapper (clickable) */}
                            <div
                                role="button"
                                tabIndex={0}
                                aria-label={hasPhoto ? 'Change profile photo' : 'Upload profile photo'}
                                onClick={triggerPhotoPicker}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') triggerPhotoPicker(); }}
                                style={{
                                    position: 'absolute', bottom: -44, left: '50%', transform: 'translateX(-50%)',
                                    width: 88, height: 88, borderRadius: '50%',
                                    background: hasPhoto ? '#f4f3ff' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    border: '4px solid #fff',
                                    boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#fff',
                                    cursor: photoUploading ? 'wait' : 'pointer',
                                    overflow: 'hidden',
                                    outline: 'none',
                                }}
                            >
                                {hasPhoto ? (
                                    <img
                                        src={photoSrc}
                                        alt="Profile"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                    />
                                ) : (
                                    <UserOutlined style={{ fontSize: 38, color: '#fff' }} />
                                )}

                                {/* Loading overlay */}
                                {photoUploading && (
                                    <div style={{
                                        position: 'absolute', inset: 0, borderRadius: '50%',
                                        background: 'rgba(15,23,42,0.55)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <LoadingOutlined style={{ color: '#fff', fontSize: 24 }} spin />
                                    </div>
                                )}

                                {/* Camera overlay button */}
                                <button
                                    type="button"
                                    aria-label="Change profile photo"
                                    onClick={(e) => { e.stopPropagation(); triggerPhotoPicker(); }}
                                    disabled={photoUploading}
                                    style={{
                                        position: 'absolute', bottom: 2, right: 2,
                                        width: 28, height: 28, borderRadius: '50%',
                                        background: '#fff',
                                        border: '2px solid #fff',
                                        boxShadow: '0 2px 8px rgba(15,23,42,0.18)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#6366f1',
                                        cursor: photoUploading ? 'not-allowed' : 'pointer',
                                        padding: 0,
                                    }}
                                >
                                    <CameraOutlined style={{ fontSize: 13 }} />
                                </button>
                            </div>
                        </div>

                        {/* identity */}
                        <div style={{
                            textAlign: 'center',
                            paddingTop: compact ? 50 : 56,
                            paddingBottom: compact ? 22 : 28,
                            paddingInline: compact ? 18 : 24,
                        }}>
                            <div style={{
                                fontSize: compact ? 16 : 18,
                                fontWeight: 800,
                                color: '#1a1d2e',
                                marginBottom: 6,
                                fontFamily: 'Manrope, Inter, sans-serif',
                                wordBreak: 'break-word',
                            }}>{displayName}</div>

                            {/* Remove photo link (only when one exists) */}
                            {hasPhoto && (
                                <div style={{ marginTop: -2, marginBottom: 10 }}>
                                    <Button
                                        type="link"
                                        size="small"
                                        icon={<DeleteOutlined />}
                                        onClick={handleRemovePhoto}
                                        disabled={photoUploading}
                                        style={{ color: '#ef4444', fontSize: 12, fontWeight: 600, padding: 0, height: 'auto' }}
                                    >
                                        Remove photo
                                    </Button>
                                </div>
                            )}

                            {/* Role pill */}
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: roleConfig.bg, borderRadius: 20, padding: '4px 14px', marginBottom: 20 }}>
                                <div style={{ width: 7, height: 7, borderRadius: '50%', background: roleConfig.dot }} />
                                <span style={{ fontSize: 12, fontWeight: 700, color: roleConfig.color }}>{roleConfig.label}</span>
                            </div>

                            {/* Quick info */}
                            <div style={{ background: '#f8f7ff', borderRadius: 14, padding: 16, textAlign: 'left' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                    <MailOutlined style={{ color: '#6366f1', fontSize: 14 }} />
                                    <Text style={{ fontSize: 13, color: '#4b5563', wordBreak: 'break-all' }}>{profile?.email}</Text>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <CalendarOutlined style={{ color: '#6366f1', fontSize: 14 }} />
                                    <Text style={{ fontSize: 13, color: '#4b5563' }}>Joined {formatDateSafe(profile?.created_at)}</Text>
                                </div>
                            </div>

                            {/* Active badge */}
                            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                <CheckCircleFilled style={{ color: '#22c55e', fontSize: 14 }} />
                                <Text style={{ fontSize: 12, color: '#22c55e', fontWeight: 600 }}>Account Active</Text>
                            </div>
                        </div>
                    </div>
                </Col>

                {/* ── RIGHT: Info + Security ── */}
                <Col xs={24} md={15}>

                    {/* Personal Information card */}
                    <div style={{
                        borderRadius: compact ? 16 : 20,
                        background: '#fff',
                        border: '1px solid #f0f0f8',
                        boxShadow: '0 2px 16px rgba(99,102,241,0.07)',
                        padding: compact ? 18 : 28,
                        marginBottom: compact ? 16 : 20,
                    }}>
                        {/* Card header */}
                        <div style={{
                            display: 'flex',
                            alignItems: compact ? 'flex-start' : 'center',
                            justifyContent: 'space-between',
                            gap: compact ? 12 : 0,
                            marginBottom: compact ? 16 : 20,
                            flexWrap: compact ? 'wrap' : 'nowrap',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: compact ? '1 1 auto' : 'unset' }}>
                                <div style={{
                                    width: compact ? 32 : 36,
                                    height: compact ? 32 : 36,
                                    borderRadius: 10,
                                    background: '#eef2ff',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#6366f1',
                                    fontSize: compact ? 14 : 16,
                                    flexShrink: 0,
                                }}>
                                    <IdcardOutlined />
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <div style={{
                                        fontSize: compact ? 14 : 15,
                                        fontWeight: 700,
                                        color: '#1a1d2e',
                                        fontFamily: 'Manrope, Inter, sans-serif',
                                    }}>Personal Information</div>
                                    <div style={{ fontSize: compact ? 11.5 : 12, color: '#94a3b8' }}>Your account details</div>
                                </div>
                            </div>

                            {/* Edit/Save/Cancel */}
                            {editing ? (
                                <div style={{
                                    display: 'flex',
                                    gap: 8,
                                    width: compact ? '100%' : 'auto',
                                }}>
                                    <Button
                                        icon={<CloseOutlined />}
                                        onClick={() => { setEditing(false); form.setFieldsValue(profile!); }}
                                        block={compact}
                                        style={{ borderRadius: 10, height: compact ? 38 : 36, borderColor: '#e2e8f0', color: '#64748b' }}
                                    >Cancel</Button>
                                    <Button
                                        type="primary" icon={<SaveOutlined />}
                                        onClick={() => form.submit()}
                                        loading={saving}
                                        block={compact}
                                        style={{ borderRadius: 10, height: compact ? 38 : 36, background: 'linear-gradient(135deg, #4f46e5, #6366f1)', border: 'none', fontWeight: 700 }}
                                    >Save Changes</Button>
                                </div>
                            ) : (
                                <Button
                                    icon={<EditOutlined />}
                                    onClick={() => setEditing(true)}
                                    block={compact}
                                    style={{
                                        borderRadius: 10,
                                        height: compact ? 38 : 36,
                                        borderColor: '#e0e7ff',
                                        color: '#6366f1',
                                        background: '#f4f3ff',
                                        fontWeight: 600,
                                    }}
                                >Edit Profile</Button>
                            )}
                        </div>

                        {/* View or Edit */}
                        {editing ? (
                            <Form form={form} layout="vertical" onFinish={handleUpdateProfile} initialValues={profile!}>
                                <Row gutter={compact ? 12 : 16}>
                                    <Col xs={24} sm={12}>
                                        <Form.Item label={<span style={{ fontWeight: 600, color: '#4b5563', fontSize: 13 }}>First Name</span>} name="first_name"
                                            rules={[{ required: true, message: 'Required' }]}>
                                            <Input prefix={<UserOutlined style={{ color: '#94a3b8' }} />} style={{ borderRadius: 10, height: 40 }} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item label={<span style={{ fontWeight: 600, color: '#4b5563', fontSize: 13 }}>Last Name</span>} name="last_name"
                                            rules={[{ required: true, message: 'Required' }]}>
                                            <Input prefix={<UserOutlined style={{ color: '#94a3b8' }} />} style={{ borderRadius: 10, height: 40 }} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={compact ? 12 : 16}>
                                    <Col xs={24} sm={12}>
                                        <Form.Item label={<span style={{ fontWeight: 600, color: '#4b5563', fontSize: 13 }}>Username</span>} name="username"
                                            rules={[{ required: true, message: 'Required' }, { min: 3, message: 'Min 3 characters' }]}>
                                            <Input prefix={<span style={{ color: '#94a3b8' }}>@</span>} style={{ borderRadius: 10, height: 40 }} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item label={<span style={{ fontWeight: 600, color: '#4b5563', fontSize: 13 }}>Email</span>} name="email"
                                            rules={[{ type: 'email', message: 'Invalid email' }]}>
                                            <Input prefix={<MailOutlined style={{ color: '#94a3b8' }} />} disabled={!isAdmin} style={{ borderRadius: 10, height: 40 }} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={compact ? 12 : 16}>
                                    <Col span={24}>
                                        <Form.Item
                                            label={
                                                <span style={{ fontWeight: 600, color: '#4b5563', fontSize: 13 }}>
                                                    Timezone
                                                    <span style={{ color: '#94a3b8', fontWeight: 400, marginLeft: 8, display: compact ? 'block' : 'inline', marginTop: compact ? 2 : 0 }}>
                                                        — All scheduled quizzes and classes will be shown in this timezone.
                                                    </span>
                                                </span>
                                            }
                                            name="timezone"
                                        >
                                            <TimezoneSelect size="large" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Form>
                        ) : (
                            <div>
                                <Row gutter={compact ? 12 : 24}>
                                    <Col xs={24} sm={12}>
                                        <InfoRow icon={<UserOutlined />} label="First Name" value={profile?.first_name || ''} compact={compact} />
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <InfoRow icon={<UserOutlined />} label="Last Name" value={profile?.last_name || ''} compact={compact} />
                                    </Col>
                                </Row>
                                <Row gutter={compact ? 12 : 24}>
                                    <Col xs={24} sm={12}>
                                        <InfoRow icon={<span style={{ fontWeight: 700 }}>@</span>} label="Username" value={profile?.username || ''} mono compact={compact} />
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <InfoRow icon={<MailOutlined />} label="Email" value={profile?.email || ''} compact={compact} />
                                    </Col>
                                </Row>
                                <Row gutter={compact ? 12 : 24}>
                                    <Col xs={24} sm={12}>
                                        <InfoRow icon={<IdcardOutlined />} label="Role" value={roleConfig.label} compact={compact} />
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <InfoRow icon={<CalendarOutlined />} label="Member Since" value={formatDateSafe(profile?.created_at)} compact={compact} />
                                    </Col>
                                </Row>
                                <Row gutter={compact ? 12 : 24}>
                                    <Col span={24}>
                                        <InfoRow
                                            icon={<GlobalOutlined />}
                                            label="Timezone"
                                            value={timezoneDisplay(profile?.timezone)}
                                            compact={compact}
                                        />
                                    </Col>
                                </Row>
                            </div>
                        )}
                    </div>

                    {/* Security card */}
                    <div style={{
                        borderRadius: compact ? 16 : 20,
                        background: '#fff',
                        border: '1px solid #f0f0f8',
                        boxShadow: '0 2px 16px rgba(99,102,241,0.07)',
                        padding: compact ? 18 : 28,
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            marginBottom: compact ? 6 : 8,
                        }}>
                            <div style={{
                                width: compact ? 32 : 36,
                                height: compact ? 32 : 36,
                                borderRadius: 10,
                                background: '#fef3c7',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#f59e0b',
                                fontSize: compact ? 14 : 16,
                                flexShrink: 0,
                            }}>
                                <SafetyOutlined />
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <div style={{
                                    fontSize: compact ? 14 : 15,
                                    fontWeight: 700,
                                    color: '#1a1d2e',
                                    fontFamily: 'Manrope, Inter, sans-serif',
                                }}>Security Settings</div>
                                <div style={{ fontSize: compact ? 11.5 : 12, color: '#94a3b8' }}>Manage your password and login details</div>
                            </div>
                        </div>

                        <SecurityRow
                            icon={<LockOutlined />}
                            title="Password"
                            subtitle="Use a strong password that you don't use elsewhere"
                            actionLabel="Change Password"
                            onAction={() => setPasswordModalVisible(true)}
                            compact={compact}
                        />
                        <SecurityRow
                            icon={<MailOutlined />}
                            title="Email Address"
                            subtitle="Update your email address for account notifications"
                            actionLabel="Change Email"
                            onAction={() => setEmailModalOpen(true)}
                            compact={compact}
                        />
                    </div>
                </Col>
            </Row>

            {/* ── Change Password Modal ── */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', fontSize: 16 }}>
                            <LockOutlined />
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, color: '#1a1d2e', fontSize: 15, fontFamily: 'Manrope, Inter, sans-serif' }}>Change Password</div>
                            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 400 }}>Choose a strong, unique password</div>
                        </div>
                    </div>
                }
                open={passwordModalVisible}
                onCancel={() => { setPasswordModalVisible(false); passwordForm.resetFields(); }}
                footer={null}
                width={compact ? '94vw' : 440}
                centered={compact}
                styles={{ body: { padding: compact ? '8px 0 4px' : undefined } }}
            >
                <Form
                    form={passwordForm}
                    layout="vertical"
                    style={{ marginTop: 16 }}
                    onFinish={(vals) => handleChangePassword({ currentPassword: vals.currentPassword, newPassword: vals.newPassword })}
                >
                    <Form.Item label={<span style={{ fontWeight: 600, color: '#4b5563', fontSize: 13 }}>Current Password</span>}
                        name="currentPassword" rules={[{ required: true, message: 'Required' }]}>
                        <Input.Password style={{ borderRadius: 10, height: 42 }} />
                    </Form.Item>
                    <Form.Item label={<span style={{ fontWeight: 600, color: '#4b5563', fontSize: 13 }}>New Password</span>}
                        name="newPassword" rules={[{ required: true, message: 'Required' }, { min: 6, message: 'Min 6 characters' }]}>
                        <Input.Password style={{ borderRadius: 10, height: 42 }} />
                    </Form.Item>
                    <Form.Item label={<span style={{ fontWeight: 600, color: '#4b5563', fontSize: 13 }}>Confirm Password</span>}
                        name="confirmPassword"
                        dependencies={['newPassword']}
                        rules={[
                            { required: true, message: 'Required' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                                    return Promise.reject(new Error('Passwords do not match'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password style={{ borderRadius: 10, height: 42 }} />
                    </Form.Item>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 8,
                        marginTop: 8,
                        flexDirection: compact ? 'column-reverse' : 'row',
                    }}>
                        <Button onClick={() => { setPasswordModalVisible(false); passwordForm.resetFields(); }}
                            block={compact}
                            style={{ borderRadius: 10, height: compact ? 42 : 40, borderColor: '#e2e8f0', color: '#64748b' }}>
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit" loading={pwLoading}
                            block={compact}
                            style={{ borderRadius: 10, height: compact ? 42 : 40, background: 'linear-gradient(135deg, #4f46e5, #6366f1)', border: 'none', fontWeight: 700 }}>
                            Update Password
                        </Button>
                    </div>
                </Form>
            </Modal>

            <ChangeEmailModal
                open={emailModalOpen}
                onClose={() => setEmailModalOpen(false)}
                onSuccess={() => fetchProfile()}
                currentEmail={profile?.email || ''}
            />
        </div>
    );
};

export default Profile;