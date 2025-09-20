import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    Select,
    message,
    Space,
    Typography,
    Tag,
    Popconfirm,
    Card,
    Divider
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    UserOutlined,
    KeyOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;
const { Option } = Select;

interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: 'admin' | 'teacher' | 'student';
    created_at: string;
}

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [passwordResetLoading, setPasswordResetLoading] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
    const [form] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const { apiCall, user, isAdmin, isAuthenticated, logout } = useAuth();

    // Check if user is authenticated and has admin privileges
    if (!isAuthenticated) {
        return (
            <Card>
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Title level={3}>Authentication Required</Title>
                    <p>Please log in to access user management.</p>
                </div>
            </Card>
        );
    }

    if (!isAdmin) {
        return (
            <Card>
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Title level={3}>Access Denied</Title>
                    <p>You need admin privileges to access user management.</p>
                    <p>Current role: {user?.role || 'Unknown'}</p>
                </div>
            </Card>
        );
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await apiCall('/users');
            if (response.ok) {
                const data = await response.json();
                setUsers(data || []);
            } else {
                const errorData = await response.json();
                message.error(errorData.error || errorData.message || 'Failed to fetch users');
            }
        } catch (error: any) {
            console.error('Fetch users error:', error);
            if (error.message && error.message.includes('Authentication token is invalid or expired.')) {
                message.error('Session expired. Please log in again.');
                logout();
            } else {
                message.error('Error fetching users');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values: any) => {
        try {
            const endpoint = editingUser ? `/users/${editingUser.id}` : '/users';
            const method = editingUser ? 'PUT' : 'POST';
            
            const payload = { ...values };
            if (!editingUser) {
                // Remove password field; backend will auto-generate 10-char password and email it
                delete (payload as any).password;
            }
            
            const response = await apiCall(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                message.success(`User ${editingUser ? 'updated' : 'created'} successfully`);
                setModalVisible(false);
                form.resetFields();
                setEditingUser(null);
                fetchUsers();
            } else {
                const errorData = await response.json();
                message.error(errorData.error || errorData.message || 'Operation failed');
            }
        } catch (error: any) {
            console.error('User update error:', error);
            if (error.message && error.message.includes('Authentication token is invalid or expired.')) {
                message.error('Session expired. Please log in again.');
                logout();
            } else {
                message.error('Error while saving user');
            }
        }
    };

    const handleDelete = async (userId: number) => {
        try {
            const response = await apiCall(`/users/${userId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                message.success('User deleted successfully');
                fetchUsers();
            } else {
                const errorData = await response.json();
                message.error(errorData.error || errorData.message || 'Failed to delete user');
            }
        } catch (error: any) {
            console.error('User delete error:', error);
            if (error.message && error.message.includes('Authentication token is invalid or expired.')) {
                message.error('Session expired. Please log in again.');
                logout();
            } else {
                message.error('Error deleting user');
            }
        }
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        form.setFieldsValue({
            username: user.username,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role,
        });
        setModalVisible(true);
    };

    const handleAdd = () => {
        setEditingUser(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleResetPassword = (user: User) => {
        setResetPasswordUser(user);
        passwordForm.resetFields();
        setPasswordModalVisible(true);
    };

    const handlePasswordReset = async (_values: any) => {
        if (!resetPasswordUser) return;
        
        setPasswordResetLoading(true);
        try {
            const payload: any = { mustChange: true };
            const response = await apiCall(`/users/${resetPasswordUser.id}/reset-password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (!response.ok) {
                const errorData = data || {};
                message.error(errorData.error || errorData.message || 'Failed to reset password');
                return;
            }
            message.success('Password reset. A temporary password has been emailed to the user.');
            setPasswordModalVisible(false);
            passwordForm.resetFields();
            setResetPasswordUser(null);
            fetchUsers();
        } catch (error: any) {
            console.error('Password reset error:', error);
            if (error?.response) {
                try {
                    const errorData = await error.response.json();
                    message.error(errorData.error || 'Error resetting password');
                } catch (e) {
                    message.error('Error resetting password');
                }
            } else {
                message.error('Error resetting password');
            }
        } finally {
            setPasswordResetLoading(false);
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

    const columns: ColumnsType<User> = [
        {
            title: 'Name',
            key: 'name',
            width: 200,
            fixed: 'left',
            render: (_, record) => `${record.first_name} ${record.last_name}`,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            width: 250,
            ellipsis: true,
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            width: 120,
            render: (role: string) => (
                <Tag color={getRoleColor(role)}>
                    {role.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Created At',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 150,
            render: (date: string) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 250,
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Edit
                    </Button>
                    <Button
                        type="default"
                        size="small"
                        icon={<KeyOutlined />}
                        onClick={() => handleResetPassword(record)}
                    >
                        Reset Password
                    </Button>
                    <Popconfirm
                        title="Are you sure you want to delete this user?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            type="primary"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                        >
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Card style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }} bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <Title level={2} style={{ margin: 0 }}>
                    <UserOutlined /> User Management
                </Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                >
                    Add User
                </Button>
            </div>

            <div style={{ flex: 1, overflow: 'hidden' }}>
                <Table
                    columns={columns}
                    dataSource={users}
                    rowKey="id"
                    loading={loading}
                    scroll={{ x: 900, y: 'calc(100vh - 280px)' }}
                    pagination={{
                        pageSize: 15,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
                        pageSizeOptions: ['10', '15', '25', '50'],
                    }}
                />
            </div>

            <Modal
                title={editingUser ? 'Edit User' : 'Add User'}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setEditingUser(null);
                }}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Form.Item
                            name="first_name"
                            label="First Name"
                            rules={[{ required: true, message: 'Please input first name!' }]}
                        >
                            <Input placeholder="Enter first name" />
                        </Form.Item>

                        <Form.Item
                            name="last_name"
                            label="Last Name"
                            rules={[{ required: true, message: 'Please input last name!' }]}
                        >
                            <Input placeholder="Enter last name" />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="username"
                        label="Username"
                        rules={[
                            { required: !editingUser, message: 'Please input username!' },
                            { min: 3, message: 'Username must be at least 3 characters!' }
                        ]}
                    >
                        <Input 
                            placeholder="Enter username" 
                            disabled={!!editingUser}
                            prefix={<UserOutlined />}
                        />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Please input email!' },
                            { type: 'email', message: 'Please enter a valid email!' }
                        ]}
                    >
                        <Input placeholder="Enter email" />
                    </Form.Item>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Form.Item
                            name="role"
                            label="Role"
                            rules={[{ required: true, message: 'Please select a role!' }]}
                        >
                            <Select placeholder="Select role">
                                <Option value="admin">
                                    <Space>
                                        <Tag color="red">Admin</Tag>
                                        Full system access
                                    </Space>
                                </Option>
                                <Option value="teacher">
                                    <Space>
                                        <Tag color="blue">Teacher</Tag>
                                        Manage classes & students
                                    </Space>
                                </Option>
                                <Option value="student">
                                    <Space>
                                        <Tag color="green">Student</Tag>
                                        Access learning materials
                                    </Space>
                                </Option>
                            </Select>
                        </Form.Item>

                        {!editingUser && (
                            <Form.Item name="password" label="Password">
                                <div style={{ color: '#888' }}>
                                  Password will be auto-generated (10 characters: letters and numbers) and emailed to the user.
                                </div>
                            </Form.Item>
                        )}
                    </div>

                    {editingUser && (
                        <div style={{ 
                            background: '#f6ffed', 
                            border: '1px solid #b7eb8f', 
                            borderRadius: '6px', 
                            padding: '12px', 
                            marginBottom: '16px' 
                        }}>
                            <Space>
                                <KeyOutlined style={{ color: '#52c41a' }} />
                                <span style={{ color: '#389e0d' }}>
                                    To change the password, use the "Reset Password" button in the user list.
                                </span>
                            </Space>
                        </div>
                    )}

                    <Divider />

                    <Form.Item style={{ marginBottom: 0 }}>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={() => {
                                setModalVisible(false);
                                form.resetFields();
                                setEditingUser(null);
                            }}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit">
                                {editingUser ? 'Update User' : 'Create User'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Password Reset Modal */}
            <Modal
                title={`Reset Password for ${resetPasswordUser?.first_name} ${resetPasswordUser?.last_name}`}
                open={passwordModalVisible}
                onCancel={() => {
                    if (!passwordResetLoading) {
                        setPasswordModalVisible(false);
                        passwordForm.resetFields();
                        setResetPasswordUser(null);
                    }
                }}
                footer={null}
                width={500}
                closable={!passwordResetLoading}
                maskClosable={!passwordResetLoading}
            >
                {passwordResetLoading ? (
                    <div style={{ 
                        textAlign: 'center', 
                        padding: '60px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '20px'
                    }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            border: '4px solid #f0f0f0',
                            borderTop: '4px solid #1890ff',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }} />
                        <div style={{ 
                            fontSize: '16px', 
                            color: '#666',
                            fontWeight: '500'
                        }}>
                            Resetting password...
                        </div>
                        <div style={{ 
                            fontSize: '14px', 
                            color: '#999'
                        }}>
                            Please wait while we process your request
                        </div>
                        <style>
                            {`
                                @keyframes spin {
                                    0% { transform: rotate(0deg); }
                                    100% { transform: rotate(360deg); }
                                }
                            `}
                        </style>
                    </div>
                ) : (
                    <>
                        <div style={{ 
                            background: '#fff7e6', 
                            border: '1px solid #ffd591', 
                            borderRadius: '6px', 
                            padding: '12px', 
                            marginBottom: '20px' 
                        }}>
                            <Space>
                                <KeyOutlined style={{ color: '#fa8c16' }} />
                                <span style={{ color: '#d46b08' }}>
                                    This will reset the user's password. They may be required to change it on next login.
                                </span>
                            </Space>
                        </div>

                        <Form
                            form={passwordForm}
                            layout="vertical"
                            onFinish={handlePasswordReset}
                        >
                            <Divider />
                            <Form.Item style={{ marginBottom: 0 }}>
                                <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                                    <Button onClick={() => {
                                        setPasswordModalVisible(false);
                                        passwordForm.resetFields();
                                        setResetPasswordUser(null);
                                    }}>
                                        Cancel
                                    </Button>
                                    <Button 
                                        type="primary" 
                                        danger 
                                        htmlType="submit"
                                        loading={passwordResetLoading}
                                    >
                                        Reset Password
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Form>
                    </>
                )}
            </Modal>
        </Card>
    );
};

export default UserManagement;