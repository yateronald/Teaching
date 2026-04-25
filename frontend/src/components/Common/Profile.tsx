import React, { useState, useEffect, useMemo } from 'react';
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
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import ChangeEmailModal from './ChangeEmailModal';

const { Text } = Typography;

interface UserProfile {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: 'admin' | 'teacher' | 'student';
    created_at: string;
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

const ROLE_CONFIG: Record<string, { label: string; bg: string; color: string; dot: string; gradient: string }> = {
    admin:   { label: 'Administrator', bg: '#fef3c7', color: '#b45309', dot: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
    teacher: { label: 'Teacher',       bg: '#eef2ff', color: '#4338ca', dot: '#6366f1', gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)' },
    student: { label: 'Student',       bg: '#dcfce7', color: '#15803d', dot: '#22c55e', gradient: 'linear-gradient(135deg, #22c55e, #16a34a)' },
};

/* ── Small field display row ── */
const InfoRow = ({ icon, label, value, mono = false }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: '1px solid #f0f0f8' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f4f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', fontSize: 15, flexShrink: 0 }}>
            {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1d2e', fontFamily: mono ? 'monospace' : undefined }}>{value || '—'}</div>
        </div>
    </div>
);

/* ── Security action row ── */
const SecurityRow = ({ icon, title, subtitle, actionLabel, onAction, danger = false }: {
    icon: React.ReactNode; title: string; subtitle: string; actionLabel: string; onAction: () => void; danger?: boolean;
}) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0', borderBottom: '1px solid #f0f0f8' }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: danger ? '#fff1f2' : '#f4f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: danger ? '#ef4444' : '#6366f1', fontSize: 18, flexShrink: 0 }}>
            {icon}
        </div>
        <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1d2e', marginBottom: 2 }}>{title}</div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>{subtitle}</div>
        </div>
        <Button
            onClick={onAction}
            style={{
                borderRadius: 10, fontWeight: 600, fontSize: 13, height: 36,
                borderColor: danger ? '#fecaca' : '#e0e7ff',
                color: danger ? '#ef4444' : '#6366f1',
                background: danger ? '#fff1f2' : '#f4f3ff',
                paddingInline: 18,
            }}
        >
            {actionLabel}
        </Button>
    </div>
);

const Profile: React.FC = () => {
    const { apiCall, updateProfile, changePassword, isAdmin } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [form] = Form.useForm<UserProfile>();
    const [passwordForm] = Form.useForm<{ currentPassword: string; newPassword: string; confirmPassword: string }>();
    const [emailModalOpen, setEmailModalOpen] = useState(false);
    const [pwLoading, setPwLoading] = useState(false);

    const displayName = useMemo(() => {
        if (!profile) return '';
        const fn = profile.first_name?.trim() || '';
        const ln = profile.last_name?.trim() || '';
        return `${fn} ${ln}`.trim() || profile.username || 'User';
    }, [profile]);

    const initials = useMemo(() => {
        if (!profile) return '?';
        return `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase() || '?';
    }, [profile]);

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

    const roleConfig = ROLE_CONFIG[profile?.role || ''] || ROLE_CONFIG.student;

    /* ── Loading skeleton ── */
    if (loading) return (
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: 24 }}>
                <div style={{ width: 300, flexShrink: 0 }}>
                    <div style={{ borderRadius: 20, background: '#fff', border: '1px solid #f0f0f8', boxShadow: '0 2px 16px rgba(99,102,241,0.07)', padding: 32, textAlign: 'center' }}>
                        <Skeleton.Avatar active size={96} style={{ marginBottom: 16 }} />
                        <Skeleton.Input active style={{ width: 160, height: 20, borderRadius: 8, marginBottom: 10 }} />
                        <Skeleton.Input active style={{ width: 80, height: 16, borderRadius: 20, marginBottom: 20 }} />
                        <Skeleton active paragraph={{ rows: 2 }} title={false} />
                    </div>
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ borderRadius: 20, background: '#fff', border: '1px solid #f0f0f8', boxShadow: '0 2px 16px rgba(99,102,241,0.07)', padding: 28, marginBottom: 20 }}>
                        <Skeleton active paragraph={{ rows: 5 }} />
                    </div>
                    <div style={{ borderRadius: 20, background: '#fff', border: '1px solid #f0f0f8', boxShadow: '0 2px 16px rgba(99,102,241,0.07)', padding: 28 }}>
                        <Skeleton active paragraph={{ rows: 3 }} />
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ maxWidth: 960, margin: '0 auto' }}>

            {/* Page header */}
            <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1d2e', letterSpacing: 0.2 }}>My Profile</div>
                <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Manage your personal information and account settings</div>
            </div>

            <Row gutter={[24, 24]}>

                {/* ── LEFT: Avatar card ── */}
                <Col xs={24} md={9}>
                    <div style={{
                        borderRadius: 20, background: '#fff',
                        border: '1px solid #f0f0f8',
                        boxShadow: '0 2px 16px rgba(99,102,241,0.07)',
                        overflow: 'hidden',
                        height: '100%',
                    }}>
                        {/* gradient banner */}
                        <div style={{ height: 80, background: roleConfig.gradient, position: 'relative' }}>
                            <div style={{
                                position: 'absolute', bottom: -44, left: '50%', transform: 'translateX(-50%)',
                                width: 88, height: 88, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                border: '4px solid #fff',
                                boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 28, fontWeight: 800, color: '#fff',
                            }}>
                                {initials}
                            </div>
                        </div>

                        {/* identity */}
                        <div style={{ textAlign: 'center', paddingTop: 56, paddingBottom: 28, paddingInline: 24 }}>
                            <div style={{ fontSize: 18, fontWeight: 800, color: '#1a1d2e', marginBottom: 6 }}>{displayName}</div>

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
                        borderRadius: 20, background: '#fff',
                        border: '1px solid #f0f0f8',
                        boxShadow: '0 2px 16px rgba(99,102,241,0.07)',
                        padding: 28, marginBottom: 20,
                    }}>
                        {/* Card header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', fontSize: 16 }}>
                                    <IdcardOutlined />
                                </div>
                                <div>
                                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1d2e' }}>Personal Information</div>
                                    <div style={{ fontSize: 12, color: '#94a3b8' }}>Your account details</div>
                                </div>
                            </div>

                            {/* Edit/Save/Cancel */}
                            {editing ? (
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <Button
                                        icon={<CloseOutlined />}
                                        onClick={() => { setEditing(false); form.setFieldsValue(profile!); }}
                                        style={{ borderRadius: 10, height: 36, borderColor: '#e2e8f0', color: '#64748b' }}
                                    >Cancel</Button>
                                    <Button
                                        type="primary" icon={<SaveOutlined />}
                                        onClick={() => form.submit()}
                                        loading={saving}
                                        style={{ borderRadius: 10, height: 36, background: 'linear-gradient(135deg, #4f46e5, #6366f1)', border: 'none', fontWeight: 700 }}
                                    >Save Changes</Button>
                                </div>
                            ) : (
                                <Button
                                    icon={<EditOutlined />}
                                    onClick={() => setEditing(true)}
                                    style={{ borderRadius: 10, height: 36, borderColor: '#e0e7ff', color: '#6366f1', background: '#f4f3ff', fontWeight: 600 }}
                                >Edit Profile</Button>
                            )}
                        </div>

                        {/* View or Edit */}
                        {editing ? (
                            <Form form={form} layout="vertical" onFinish={handleUpdateProfile} initialValues={profile!}>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item label={<span style={{ fontWeight: 600, color: '#4b5563', fontSize: 13 }}>First Name</span>} name="first_name"
                                            rules={[{ required: true, message: 'Required' }]}>
                                            <Input prefix={<UserOutlined style={{ color: '#94a3b8' }} />} style={{ borderRadius: 10, height: 40 }} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label={<span style={{ fontWeight: 600, color: '#4b5563', fontSize: 13 }}>Last Name</span>} name="last_name"
                                            rules={[{ required: true, message: 'Required' }]}>
                                            <Input prefix={<UserOutlined style={{ color: '#94a3b8' }} />} style={{ borderRadius: 10, height: 40 }} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item label={<span style={{ fontWeight: 600, color: '#4b5563', fontSize: 13 }}>Username</span>} name="username"
                                            rules={[{ required: true, message: 'Required' }, { min: 3, message: 'Min 3 characters' }]}>
                                            <Input prefix={<span style={{ color: '#94a3b8' }}>@</span>} style={{ borderRadius: 10, height: 40 }} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label={<span style={{ fontWeight: 600, color: '#4b5563', fontSize: 13 }}>Email</span>} name="email"
                                            rules={[{ type: 'email', message: 'Invalid email' }]}>
                                            <Input prefix={<MailOutlined style={{ color: '#94a3b8' }} />} disabled={!isAdmin} style={{ borderRadius: 10, height: 40 }} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Form>
                        ) : (
                            <div>
                                <Row gutter={24}>
                                    <Col span={12}>
                                        <InfoRow icon={<UserOutlined />} label="First Name" value={profile?.first_name || ''} />
                                    </Col>
                                    <Col span={12}>
                                        <InfoRow icon={<UserOutlined />} label="Last Name" value={profile?.last_name || ''} />
                                    </Col>
                                </Row>
                                <Row gutter={24}>
                                    <Col span={12}>
                                        <InfoRow icon={<span style={{ fontWeight: 700 }}>@</span>} label="Username" value={profile?.username || ''} mono />
                                    </Col>
                                    <Col span={12}>
                                        <InfoRow icon={<MailOutlined />} label="Email" value={profile?.email || ''} />
                                    </Col>
                                </Row>
                                <Row gutter={24}>
                                    <Col span={12}>
                                        <InfoRow icon={<IdcardOutlined />} label="Role" value={roleConfig.label} />
                                    </Col>
                                    <Col span={12}>
                                        <InfoRow icon={<CalendarOutlined />} label="Member Since" value={formatDateSafe(profile?.created_at)} />
                                    </Col>
                                </Row>
                            </div>
                        )}
                    </div>

                    {/* Security card */}
                    <div style={{
                        borderRadius: 20, background: '#fff',
                        border: '1px solid #f0f0f8',
                        boxShadow: '0 2px 16px rgba(99,102,241,0.07)',
                        padding: 28,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', fontSize: 16 }}>
                                <SafetyOutlined />
                            </div>
                            <div>
                                <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1d2e' }}>Security Settings</div>
                                <div style={{ fontSize: 12, color: '#94a3b8' }}>Manage your password and login details</div>
                            </div>
                        </div>

                        <SecurityRow
                            icon={<LockOutlined />}
                            title="Password"
                            subtitle="Use a strong password that you don't use elsewhere"
                            actionLabel="Change Password"
                            onAction={() => setPasswordModalVisible(true)}
                        />
                        <SecurityRow
                            icon={<MailOutlined />}
                            title="Email Address"
                            subtitle="Update your email address for account notifications"
                            actionLabel="Change Email"
                            onAction={() => setEmailModalOpen(true)}
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
                            <div style={{ fontWeight: 700, color: '#1a1d2e', fontSize: 15 }}>Change Password</div>
                            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 400 }}>Choose a strong, unique password</div>
                        </div>
                    </div>
                }
                open={passwordModalVisible}
                onCancel={() => { setPasswordModalVisible(false); passwordForm.resetFields(); }}
                footer={null}
                width={440}
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

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                        <Button onClick={() => { setPasswordModalVisible(false); passwordForm.resetFields(); }}
                            style={{ borderRadius: 10, height: 40, borderColor: '#e2e8f0', color: '#64748b' }}>
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit" loading={pwLoading}
                            style={{ borderRadius: 10, height: 40, background: 'linear-gradient(135deg, #4f46e5, #6366f1)', border: 'none', fontWeight: 700 }}>
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