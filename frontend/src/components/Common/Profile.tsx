import React, { useState, useEffect } from 'react';
import {
    Card,
    Form,
    Input,
    Button,
    message,
    Typography,
    Avatar,
    Upload,
    Row,
    Col,
    Divider,
    Tag,
    Space,
    Modal,
    Descriptions,
    Tabs,
    List,
    Statistic,
    Progress
} from 'antd';
import {
    UserOutlined,
    EditOutlined,
    SaveOutlined,
    CameraOutlined,
    MailOutlined,
    PhoneOutlined,
    CalendarOutlined,
    BookOutlined,
    TrophyOutlined,
    ClockCircleOutlined,
    TeamOutlined,
    UploadOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import type { UploadProps } from 'antd';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

interface UserProfile {
    id: number;
    name: string;
    email: string;
    phone?: string;
    role: 'admin' | 'teacher' | 'student';
    avatar?: string;
    bio?: string;
    date_joined: string;
    last_login?: string;
    batch_name?: string;
    batch_id?: number;
    subjects?: string[];
    total_quizzes?: number;
    completed_quizzes?: number;
    average_score?: number;
    total_resources?: number;
    downloaded_resources?: number;
}

interface Activity {
    id: number;
    type: 'quiz' | 'resource' | 'login' | 'batch_join';
    description: string;
    timestamp: string;
    score?: number;
    resource_name?: string;
}

const Profile: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(false);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const { user, apiCall } = useAuth();

    useEffect(() => {
        fetchProfile();
        fetchActivities();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await apiCall('/users/profile');
            if (response.ok) {
                const data = await response.json();
                setProfile(data.profile);
                form.setFieldsValue(data.profile);
            } else {
                message.error('Failed to fetch profile');
            }
        } catch (error) {
            message.error('Error fetching profile');
        } finally {
            setLoading(false);
        }
    };

    const fetchActivities = async () => {
        try {
            const response = await apiCall('/users/activities');
            if (response.ok) {
                const data = await response.json();
                setActivities(data.activities || []);
            }
        } catch (error) {
            console.error('Error fetching activities:', error);
        }
    };

    const handleUpdateProfile = async (values: any) => {
        setLoading(true);
        try {
            const response = await apiCall('/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            if (response.ok) {
                const data = await response.json();
                setProfile(data.profile);
                setEditing(false);
                message.success('Profile updated successfully');
            } else {
                const errorData = await response.json();
                message.error(errorData.message || 'Failed to update profile');
            }
        } catch (error) {
            message.error('Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (values: any) => {
        setLoading(true);
        try {
            const response = await apiCall('/users/change-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            if (response.ok) {
                setPasswordModalVisible(false);
                passwordForm.resetFields();
                message.success('Password changed successfully');
            } else {
                const errorData = await response.json();
                message.error(errorData.message || 'Failed to change password');
            }
        } catch (error) {
            message.error('Error changing password');
        } finally {
            setLoading(false);
        }
    };

    const uploadProps: UploadProps = {
        name: 'avatar',
        action: `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/users/upload-avatar`,
        headers: {
            authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        beforeUpload: (file) => {
            const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
            if (!isJpgOrPng) {
                message.error('You can only upload JPG/PNG file!');
            }
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
                message.error('Image must smaller than 2MB!');
            }
            return isJpgOrPng && isLt2M;
        },
        onChange: (info) => {
            if (info.file.status === 'done') {
                message.success('Avatar uploaded successfully');
                fetchProfile();
            } else if (info.file.status === 'error') {
                message.error('Avatar upload failed');
            }
        },
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return 'red';
            case 'teacher': return 'blue';
            case 'student': return 'green';
            default: return 'default';
        }
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'quiz': return <BookOutlined />;
            case 'resource': return <UploadOutlined />;
            case 'login': return <UserOutlined />;
            case 'batch_join': return <TeamOutlined />;
            default: return <ClockCircleOutlined />;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                <Avatar
                                    size={120}
                                    src={profile.avatar}
                                    icon={<UserOutlined />}
                                    style={{ marginBottom: 16 }}
                                />
                                <Upload {...uploadProps} showUploadList={false}>
                                    <Button
                                        type="primary"
                                        shape="circle"
                                        icon={<CameraOutlined />}
                                        size="small"
                                        style={{
                                            position: 'absolute',
                                            bottom: 16,
                                            right: 0,
                                            zIndex: 1
                                        }}
                                    />
                                </Upload>
                            </div>
                            
                            <Title level={3} style={{ marginBottom: 8 }}>
                                {profile.name}
                            </Title>
                            
                            <Tag color={getRoleColor(profile.role)} style={{ marginBottom: 16 }}>
                                {profile.role.toUpperCase()}
                            </Tag>
                            
                            {profile.batch_name && (
                                <div style={{ marginBottom: 16 }}>
                                    <Text type="secondary">
                                        <TeamOutlined /> {profile.batch_name}
                                    </Text>
                                </div>
                            )}
                            
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Text>
                                    <MailOutlined /> {profile.email}
                                </Text>
                                {profile.phone && (
                                    <Text>
                                        <PhoneOutlined /> {profile.phone}
                                    </Text>
                                )}
                                <Text type="secondary">
                                    <CalendarOutlined /> Joined {formatDate(profile.date_joined)}
                                </Text>
                                {profile.last_login && (
                                    <Text type="secondary">
                                        <ClockCircleOutlined /> Last login: {formatDateTime(profile.last_login)}
                                    </Text>
                                )}
                            </Space>
                        </div>
                    </Card>

                    {profile.role === 'student' && (
                        <Card title="Statistics" style={{ marginTop: 16 }}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Statistic
                                        title="Quizzes"
                                        value={profile.completed_quizzes || 0}
                                        suffix={`/ ${profile.total_quizzes || 0}`}
                                        prefix={<BookOutlined />}
                                    />
                                </Col>
                                <Col span={12}>
                                    <Statistic
                                        title="Avg Score"
                                        value={profile.average_score || 0}
                                        suffix="%"
                                        prefix={<TrophyOutlined />}
                                    />
                                </Col>
                            </Row>
                            
                            {profile.total_quizzes && profile.total_quizzes > 0 && (
                                <div style={{ marginTop: 16 }}>
                                    <Text strong>Quiz Progress</Text>
                                    <Progress
                                        percent={Math.round(((profile.completed_quizzes || 0) / profile.total_quizzes) * 100)}
                                        status="active"
                                        style={{ marginTop: 8 }}
                                    />
                                </div>
                            )}
                            
                            <Divider />
                            
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Statistic
                                        title="Resources"
                                        value={profile.downloaded_resources || 0}
                                        suffix={`/ ${profile.total_resources || 0}`}
                                        prefix={<UploadOutlined />}
                                    />
                                </Col>
                                <Col span={12}>
                                    {profile.total_resources && profile.total_resources > 0 && (
                                        <div>
                                            <Text strong>Download Rate</Text>
                                            <Progress
                                                percent={Math.round(((profile.downloaded_resources || 0) / profile.total_resources) * 100)}
                                                size="small"
                                                style={{ marginTop: 8 }}
                                            />
                                        </div>
                                    )}
                                </Col>
                            </Row>
                        </Card>
                    )}
                </Col>
                
                <Col span={16}>
                    <Tabs defaultActiveKey="details">
                        <TabPane tab="Profile Details" key="details">
                            <Card
                                title="Personal Information"
                                extra={
                                    <Space>
                                        {editing ? (
                                            <>
                                                <Button onClick={() => setEditing(false)}>
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
                                                    label="Full Name"
                                                    name="name"
                                                    rules={[{ required: true, message: 'Please enter your name' }]}
                                                >
                                                    <Input prefix={<UserOutlined />} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item
                                                    label="Phone Number"
                                                    name="phone"
                                                >
                                                    <Input prefix={<PhoneOutlined />} />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        
                                        <Form.Item
                                            label="Bio"
                                            name="bio"
                                        >
                                            <TextArea
                                                rows={4}
                                                placeholder="Tell us about yourself..."
                                            />
                                        </Form.Item>
                                    </Form>
                                ) : (
                                    <Descriptions column={1} bordered>
                                        <Descriptions.Item label="Full Name">
                                            {profile.name}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Email">
                                            {profile.email}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Phone">
                                            {profile.phone || 'Not provided'}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Role">
                                            <Tag color={getRoleColor(profile.role)}>
                                                {profile.role.toUpperCase()}
                                            </Tag>
                                        </Descriptions.Item>
                                        {profile.batch_name && (
                                            <Descriptions.Item label="Batch">
                                                {profile.batch_name}
                                            </Descriptions.Item>
                                        )}
                                        {profile.subjects && profile.subjects.length > 0 && (
                                            <Descriptions.Item label="Subjects">
                                                {profile.subjects.map(subject => (
                                                    <Tag key={subject} color="blue">{subject}</Tag>
                                                ))}
                                            </Descriptions.Item>
                                        )}
                                        <Descriptions.Item label="Bio">
                                            {profile.bio || 'No bio provided'}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Member Since">
                                            {formatDate(profile.date_joined)}
                                        </Descriptions.Item>
                                    </Descriptions>
                                )}
                            </Card>
                            
                            <Card title="Security" style={{ marginTop: 16 }}>
                                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                    <Button
                                        type="primary"
                                        onClick={() => setPasswordModalVisible(true)}
                                    >
                                        Change Password
                                    </Button>
                                </div>
                            </Card>
                        </TabPane>
                        
                        <TabPane tab="Recent Activity" key="activity">
                            <Card title="Activity Log">
                                {activities.length > 0 ? (
                                    <List
                                        dataSource={activities}
                                        renderItem={(activity) => (
                                            <List.Item>
                                                <List.Item.Meta
                                                    avatar={
                                                        <Avatar 
                                                            icon={getActivityIcon(activity.type)}
                                                            style={{ backgroundColor: '#1890ff' }}
                                                        />
                                                    }
                                                    title={activity.description}
                                                    description={
                                                        <Space>
                                                            <Text type="secondary">
                                                                {formatDateTime(activity.timestamp)}
                                                            </Text>
                                                            {activity.score && (
                                                                <Tag color="green">Score: {activity.score}%</Tag>
                                                            )}
                                                        </Space>
                                                    }
                                                />
                                            </List.Item>
                                        )}
                                    />
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '50px 0' }}>
                                        <Text type="secondary">No recent activity</Text>
                                    </div>
                                )}
                            </Card>
                        </TabPane>
                    </Tabs>
                </Col>
            </Row>

            <Modal
                title="Change Password"
                open={passwordModalVisible}
                onCancel={() => {
                    setPasswordModalVisible(false);
                    passwordForm.resetFields();
                }}
                footer={[
                    <Button key="cancel" onClick={() => {
                        setPasswordModalVisible(false);
                        passwordForm.resetFields();
                    }}>
                        Cancel
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        loading={loading}
                        onClick={() => passwordForm.submit()}
                    >
                        Change Password
                    </Button>
                ]}
            >
                <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={handleChangePassword}
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
                        rules={[
                            { required: true, message: 'Please enter your new password' },
                            { min: 6, message: 'Password must be at least 6 characters' }
                        ]}
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
                </Form>
            </Modal>
        </div>
    );
};

export default Profile;