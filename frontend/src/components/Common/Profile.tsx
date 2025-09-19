import React, { useState, useEffect, useMemo } from 'react';
import {
    Card,
    Form,
    Input,
    Button,
    message,
    Typography,
    Avatar,
    Row,
    Col,
    Divider,
    Tag,
    Space,
    Modal,
    Descriptions,
} from 'antd';
import {
    UserOutlined,
    EditOutlined,
    SaveOutlined,
    MailOutlined,
    CalendarOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text } = Typography;

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
            return d.toLocaleDateString('en-GB', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            });
        }
    }
    return '-';
};

const Profile: React.FC = () => {
    const { apiCall, updateProfile, changePassword, isAdmin } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(false);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [form] = Form.useForm<UserProfile>();
    const [passwordForm] = Form.useForm<{ currentPassword: string; newPassword: string; confirmPassword: string }>();

    const displayName = useMemo(() => {
        if (!profile) return '';
        const fn = profile.first_name?.trim() || '';
        const ln = profile.last_name?.trim() || '';
        const full = `${fn} ${ln}`.trim();
        return full || profile.username || 'User';
    }, [profile]);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await apiCall('/auth/profile');
            if (response.ok) {
                const data = await response.json();
                const p: UserProfile = data.user;
                setProfile(p);
                form.setFieldsValue(p);
            } else {
                message.error('Failed to fetch profile');
            }
        } catch (error) {
            message.error('Error fetching profile');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (values: Partial<UserProfile>) => {
        setLoading(true);
        try {
            const payload: Partial<UserProfile> = {
                first_name: values.first_name,
                last_name: values.last_name,
                username: values.username,
                ...(isAdmin ? { email: values.email } : {}),
            };

            const result = await updateProfile(payload);
            if (result.success) {
                await fetchProfile();
                setEditing(false);
            } else if (result.error) {
                message.error(result.error);
            }
        } catch (error) {
            message.error('Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (values: { currentPassword: string; newPassword: string }) => {
        setLoading(true);
        try {
            const result = await changePassword(values.currentPassword, values.newPassword);
            if (result.success) {
                setPasswordModalVisible(false);
                passwordForm.resetFields();
            } else if (result.error) {
                message.error(result.error);
            }
        } catch (error) {
            message.error('Error changing password');
        } finally {
            setLoading(false);
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return 'red';
            case 'teacher': return 'blue';
            case 'student': return 'green';
            default: return 'default';
        }
    };

    if (!profile) {
        return (
            <Card loading={loading}>
                <div style={{ textAlign: 'center', padding: '50px 0' }}>
                    <Text>Loading profile...</Text>
                </div>
            </Card>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: 16 }}>
                <Title level={2}>
                    <UserOutlined /> My Profile
                </Title>
            </div>

            <Row gutter={16}>
                <Col span={8}>
                    <Card>
                        <div style={{ textAlign: 'center' }}>
                            <Avatar
                                size={120}
                                icon={<UserOutlined />}
                                style={{ marginBottom: 16, backgroundColor: '#1677ff' }}
                            >
                                {displayName ? displayName[0]?.toUpperCase() : ''}
                            </Avatar>

                            <Title level={3} style={{ marginBottom: 8 }}>
                                {displayName}
                            </Title>

                            <Tag color={getRoleColor(profile.role)} style={{ marginBottom: 16 }}>
                                {profile.role.toUpperCase()}
                            </Tag>

                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Text>
                                    <MailOutlined /> {profile.email}
                                </Text>
                                <Text type="secondary">
                                    <CalendarOutlined /> Joined {formatDateSafe(profile.created_at)}
                                </Text>
                            </Space>
                        </div>
                    </Card>
                </Col>

                <Col span={16}>
                    <Card
                        title="Personal Information"
                        extra={
                            <Space>
                                {editing ? (
                                    <>
                                        <Button onClick={() => { setEditing(false); form.setFieldsValue(profile); }}>
                                            Cancel
                                        </Button>
                                        <Button
                                            type="primary"
                                            icon={<SaveOutlined />}
                                            onClick={() => form.submit()}
                                            loading={loading}
                                        >
                                            Save
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        type="primary"
                                        icon={<EditOutlined />}
                                        onClick={() => setEditing(true)}
                                    >
                                        Edit
                                    </Button>
                                )}
                            </Space>
                        }
                    >
                        {editing ? (
                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={handleUpdateProfile}
                                initialValues={profile}
                            >
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            label="First Name"
                                            name="first_name"
                                            rules={[{ required: true, message: 'Please enter your first name' }]}
                                        >
                                            <Input prefix={<UserOutlined />} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Last Name"
                                            name="last_name"
                                            rules={[{ required: true, message: 'Please enter your last name' }]}
                                        >
                                            <Input prefix={<UserOutlined />} />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Username"
                                            name="username"
                                            rules={[{ required: true, message: 'Please enter your username' }, { min: 3 }]}
                                        >
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Email"
                                            name="email"
                                            rules={[{ type: 'email', message: 'Please enter a valid email' }]}
                                        >
                                            <Input disabled={!isAdmin} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Form>
                        ) : (
                            <Descriptions column={1} bordered>
                                <Descriptions.Item label="First Name">
                                    {profile.first_name}
                                </Descriptions.Item>
                                <Descriptions.Item label="Last Name">
                                    {profile.last_name}
                                </Descriptions.Item>
                                <Descriptions.Item label="Username">
                                    {profile.username}
                                </Descriptions.Item>
                                <Descriptions.Item label="Email">
                                    {profile.email}
                                </Descriptions.Item>
                                <Descriptions.Item label="Role">
                                    <Tag color={getRoleColor(profile.role)}>
                                        {profile.role.toUpperCase()}
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Member Since">
                                    {formatDateSafe(profile.created_at)}
                                </Descriptions.Item>
                            </Descriptions>
                        )}
                    </Card>

                    <Card title="Security" style={{ marginTop: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <Title level={5} style={{ margin: 0 }}>Password</Title>
                                <Text type="secondary">Use a strong password that you don’t use elsewhere</Text>
                            </div>
                            <Button type="primary" onClick={() => setPasswordModalVisible(true)}>
                                Change Password
                            </Button>
                        </div>
                    </Card>
                </Col>
            </Row>

            <Divider />

            <Modal
                title="Change Password"
                open={passwordModalVisible}
                onCancel={() => {
                    setPasswordModalVisible(false);
                    passwordForm.resetFields();
                }}
                footer={null}
            >
                <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={(vals) => handleChangePassword({ currentPassword: vals.currentPassword, newPassword: vals.newPassword })}
                >
                    <Form.Item
                        label="Current Password"
                        name="currentPassword"
                        rules={[{ required: true, message: 'Please enter your current password' }]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item
                        label="New Password"
                        name="newPassword"
                        rules={[{ required: true, message: 'Please enter your new password' }, { min: 6 }]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item
                        label="Confirm New Password"
                        name="confirmPassword"
                        dependencies={['newPassword']}
                        rules={[
                            { required: true, message: 'Please confirm your new password' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Passwords do not match'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button onClick={() => { setPasswordModalVisible(false); passwordForm.resetFields(); }}>Cancel</Button>
                        <Button type="primary" htmlType="submit" loading={loading}>Change Password</Button>
                    </Space>
                </Form>
            </Modal>
        </div>
    );
};

export default Profile;