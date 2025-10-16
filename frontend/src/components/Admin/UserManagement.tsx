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
    Card,
    Divider,
    Switch,
    Dropdown
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    UserOutlined,
    KeyOutlined,
    CheckCircleOutlined,
    StopOutlined,
    MoreOutlined,
    EyeOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';

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
    is_active?: boolean;
    failed_login_attempts?: number;
}

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [passwordResetLoading, setPasswordResetLoading] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
    const [form] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const { apiCall, user, isAdmin, isAuthenticated, logout } = useAuth();

    // Watch the is_active field to update Switch color reactively
    const isActiveValue = Form.useWatch('is_active', form);

    // When editing own admin account, freeze Account Status control
    const isOwnAdminEdit = !!editingUser && editingUser.role === 'admin' && user?.id === editingUser.id;

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
        setSubmitLoading(true);
        try {
            const endpoint = editingUser ? `/users/${editingUser.id}` : '/users';
            const method = editingUser ? 'PUT' : 'POST';
            
            const payload = { ...values };
            const isEditingSelfAdmin = !!editingUser && editingUser.role === 'admin' && user?.id === editingUser.id;
            if (isEditingSelfAdmin) {
                // Do not allow changing Account Status or Role for own admin account
                delete (payload as any).is_active;
                delete (payload as any).role;
            }
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
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (userId: number) => {
        // Prevent self-deletion for logged-in admin
        if (isAdmin && user?.id === userId) {
            message.warning('You cannot delete your own admin account.');
            return;
        }
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
            is_active: user.is_active ?? true, // Use actual value, default to true only if undefined
        });
        setModalVisible(true);
    };

    const handleAdd = () => {
        setEditingUser(null);
        form.resetFields();
        // Set default values for new user
        form.setFieldsValue({
            is_active: true // Default to active for new users
        });
        setModalVisible(true);
    };

    const handleResetPassword = (user: User) => {
        setResetPasswordUser(user);
        passwordForm.resetFields();
        setPasswordModalVisible(true);
    };

    const handleToggleStatus = async (targetUser: User) => {
        // Prevent self-deactivation for logged-in admin
        if (isAdmin && targetUser?.role === 'admin' && user?.id === targetUser.id) {
            // If attempting to deactivate own admin account
            if (targetUser.is_active) {
                message.warning('You cannot deactivate your own admin account.');
                return;
            }
        }
        try {
            const newStatus = !targetUser.is_active;
            const response = await apiCall(`/users/${targetUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: newStatus }),
            });

            if (response.ok) {
                message.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully`);
                fetchUsers(); // Refresh the list
            } else {
                const errorData = await response.json();
                message.error(errorData.error || 'Failed to update user status');
            }
        } catch (error) {
            console.error('Toggle status error:', error);
            message.error('Error updating user status');
        }
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
            width: 180,
            fixed: 'left',
            render: (_, record) => (
                <div>
                    <div style={{ fontWeight: 600, color: '#262626' }}>
                        {`${record.first_name} ${record.last_name}`}
                    </div>
                    <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                        ID: {record.id}
                    </div>
                </div>
            ),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            width: 220,
            ellipsis: true,
            render: (email: string) => (
                <div style={{ color: '#595959' }}>
                    {email}
                </div>
            ),
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            width: 100,
            render: (role: string) => (
                <Tag color={getRoleColor(role)} style={{ fontWeight: 500 }}>
                    {role.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'is_active',
            key: 'status',
            width: 90,
            render: (isActive: boolean) => (
                <Tag 
                    color={isActive ? 'green' : 'red'} 
                    style={{ 
                        fontWeight: 500,
                        minWidth: '70px',
                        textAlign: 'center'
                    }}
                >
                    {isActive ? 'ACTIVE' : 'DISABLED'}
                </Tag>
            ),
        },
        {
            title: 'Failed Logins',
            dataIndex: 'failed_login_attempts',
            key: 'failed_login_attempts',
            width: 110,
            align: 'center',
            render: (attempts: number) => (
                <Tag 
                    color={attempts >= 5 ? 'red' : attempts >= 3 ? 'orange' : 'default'}
                    style={{ fontWeight: 500 }}
                >
                    {attempts || 0}
                </Tag>
            ),
        },
        {
            title: 'Created At',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 120,
            render: (date: string) => (
                <div style={{ color: '#8c8c8c', fontSize: '13px' }}>
                    {new Date(date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    })}
                </div>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 120,
            fixed: 'right',
            align: 'center',
            render: (_, record) => {
                const isOwnAdmin = record.role === 'admin' && user?.id === record.id;
                const menuItems: MenuProps['items'] = [
                    {
                        key: 'edit',
                        icon: <EditOutlined style={{ color: '#1890ff' }} />,
                        label: <span style={{ color: '#262626' }}>Edit User</span>,
                        onClick: () => handleEdit(record),
                    },
                    {
                        key: 'reset-password',
                        icon: <KeyOutlined style={{ color: '#722ed1' }} />,
                        label: <span style={{ color: '#262626' }}>Reset Password</span>,
                        onClick: () => handleResetPassword(record),
                    },
                    {
                        type: 'divider',
                    },
                    {
                        key: 'toggle-status',
                        icon: record.is_active ? 
                            <StopOutlined style={{ color: '#ff4d4f' }} /> : 
                            <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                        label: (
                            <span style={{ color: record.is_active ? '#ff4d4f' : '#52c41a' }}>
                                {record.is_active ? 'Deactivate User' : 'Activate User'}
                            </span>
                        ),
                        disabled: isOwnAdmin,
                        onClick: () => {
                            if (isOwnAdmin) {
                                message.warning('You cannot deactivate your own admin account.');
                                return;
                            }
                            Modal.confirm({
                                title: `${record.is_active ? 'Deactivate' : 'Activate'} User`,
                                content: `Are you sure you want to ${record.is_active ? 'deactivate' : 'activate'} ${record.first_name} ${record.last_name}?`,
                                okText: 'Yes',
                                cancelText: 'No',
                                okButtonProps: {
                                    style: {
                                        backgroundColor: record.is_active ? '#ff4d4f' : '#52c41a',
                                        borderColor: record.is_active ? '#ff4d4f' : '#52c41a'
                                    }
                                },
                                onOk: () => handleToggleStatus(record),
                            });
                        },
                    },
                    {
                        type: 'divider',
                    },
                    {
                        key: 'delete',
                        icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
                        label: <span style={{ color: '#ff4d4f' }}>Delete User</span>,
                        disabled: isOwnAdmin,
                        onClick: () => {
                            if (isOwnAdmin) {
                                message.warning('You cannot delete your own admin account.');
                                return;
                            }
                            Modal.confirm({
                                title: 'Delete User',
                                content: `Are you sure you want to delete ${record.first_name} ${record.last_name}? This action cannot be undone.`,
                                okText: 'Yes, Delete',
                                cancelText: 'Cancel',
                                okType: 'danger',
                                onOk: () => handleDelete(record.id),
                            });
                        },
                    },
                ];

                return (
                    <Space size="small">
                        <Button
                            type="primary"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => handleEdit(record)}
                            title="Quick Edit"
                            style={{
                                borderRadius: '6px',
                                height: '28px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        />
                        <Dropdown
                            menu={{ items: menuItems }}
                            trigger={['click']}
                            placement="bottomRight"
                        >
                            <Button
                                type="text"
                                size="small"
                                icon={<MoreOutlined />}
                                style={{ 
                                    border: '1px solid #d9d9d9',
                                    borderRadius: '6px',
                                    height: '28px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: '#fafafa',
                                    transition: 'all 0.2s ease'
                                }}
                                title="More Actions"
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f0f0f0';
                                    e.currentTarget.style.borderColor = '#b7b7b7';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#fafafa';
                                    e.currentTarget.style.borderColor = '#d9d9d9';
                                }}
                            />
                        </Dropdown>
                    </Space>
                );
            },
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
                    if (!submitLoading) {
                        setModalVisible(false);
                        form.resetFields();
                        setEditingUser(null);
                    }
                }}
                footer={null}
                width={600}
                maskClosable={!submitLoading}
                closable={!submitLoading}
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
                            <Select placeholder="Select role" disabled={isOwnAdminEdit}>
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

                        <Form.Item
                            name="is_active"
                            label="Account Status"
                            valuePropName="checked"
                            initialValue={true}
                        >
                            <Switch 
                                checkedChildren="Active" 
                                unCheckedChildren="Disabled"
                                disabled={isOwnAdminEdit}
                                style={{ backgroundColor: isActiveValue ? '#52c41a' : '#ff4d4f' }}
                            />
                        </Form.Item>
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
                            <Button 
                                onClick={() => {
                                    setModalVisible(false);
                                    form.resetFields();
                                    setEditingUser(null);
                                }}
                                disabled={submitLoading}
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="primary" 
                                htmlType="submit"
                                loading={submitLoading}
                                disabled={submitLoading}
                            >
                                {submitLoading 
                                    ? (editingUser ? 'Updating...' : 'Creating...') 
                                    : (editingUser ? 'Update User' : 'Create User')
                                }
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