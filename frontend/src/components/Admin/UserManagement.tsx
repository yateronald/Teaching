import React, { useState, useEffect, useMemo } from 'react';
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
        Card,
    Divider,
    Switch,
    Dropdown,
    Skeleton,
    DatePicker,
        } from 'antd';
import dayjs from 'dayjs';
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
    const [searchText, setSearchText] = useState('');
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [dateRangeFilter, setDateRangeFilter] = useState<any>(null);
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

    const getRoleStyle = (role: string) => {
        switch (role) {
            case 'admin': return { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' };
            case 'teacher': return { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' };
            case 'student': return { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' };
            default: return { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' };
        }
    };

    const getInitials = (first: string, last: string) => {
        return `${(first || '')[0] || ''}${(last || '')[0] || ''}`.toUpperCase();
    };

    const getAvatarColor = (role: string) => {
        switch (role) {
            case 'admin': return 'linear-gradient(135deg, #ef4444, #f87171)';
            case 'teacher': return 'linear-gradient(135deg, #3b82f6, #60a5fa)';
            case 'student': return 'linear-gradient(135deg, #10b981, #34d399)';
            default: return 'linear-gradient(135deg, #6366f1, #818cf8)';
        }
    };

    const columns: ColumnsType<User> = [
        {
            title: 'Name',
            key: 'name',
            width: 220,
            fixed: 'left',
            render: (_, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 34, height: 34, borderRadius: 10,
                        background: getAvatarColor(record.role),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                    }}>
                        {getInitials(record.first_name, record.last_name)}
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 13, lineHeight: 1.3 }}>
                            {`${record.first_name} ${record.last_name}`}
                        </div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>
                            ID: {record.id}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            width: 240,
            ellipsis: true,
            render: (email: string) => (
                <span style={{ color: '#64748b', fontSize: 12.5 }}>
                    {email}
                </span>
            ),
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            width: 110,
            render: (role: string) => {
                const s = getRoleStyle(role);
                return (
                    <span style={{
                        display: 'inline-block',
                        padding: '3px 12px',
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        background: s.bg,
                        color: s.color,
                        border: `1px solid ${s.border}`,
                    }}>
                        {role}
                    </span>
                );
            },
        },
        {
            title: 'Status',
            dataIndex: 'is_active',
            key: 'status',
            width: 100,
            render: (isActive: boolean) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: isActive ? '#22c55e' : '#ef4444',
                        boxShadow: isActive ? '0 0 6px #22c55e80' : '0 0 6px #ef444480',
                    }} />
                    <span style={{
                        fontSize: 12, fontWeight: 600,
                        color: isActive ? '#16a34a' : '#dc2626',
                    }}>
                        {isActive ? 'Active' : 'Disabled'}
                    </span>
                </div>
            ),
        },
        {
            title: 'Failed Logins',
            dataIndex: 'failed_login_attempts',
            key: 'failed_login_attempts',
            width: 110,
            align: 'center',
            render: (attempts: number) => {
                const val = attempts || 0;
                const color = val >= 5 ? '#dc2626' : val >= 3 ? '#f59e0b' : '#94a3b8';
                return (
                    <span style={{
                        display: 'inline-block',
                        padding: '2px 10px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        color: color,
                        background: val >= 3 ? (val >= 5 ? '#fef2f2' : '#fffbeb') : '#f8fafc',
                    }}>
                        {val}
                    </span>
                );
            },
        },
        {
            title: 'Created At',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 130,
            render: (date: string) => (
                <span style={{ color: '#94a3b8', fontSize: 12, fontWeight: 500 }}>
                    {new Date(date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    })}
                </span>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 100,
            fixed: 'right',
            align: 'center',
            render: (_, record) => {
                const isOwnAdmin = record.role === 'admin' && user?.id === record.id;
                const menuItems: MenuProps['items'] = [
                    {
                        key: 'edit',
                        icon: <EditOutlined style={{ color: '#6366f1' }} />,
                        label: <span style={{ color: '#1e293b' }}>Edit User</span>,
                        onClick: () => handleEdit(record),
                    },
                    {
                        key: 'reset-password',
                        icon: <KeyOutlined style={{ color: '#8b5cf6' }} />,
                        label: <span style={{ color: '#1e293b' }}>Reset Password</span>,
                        onClick: () => handleResetPassword(record),
                    },
                    {
                        type: 'divider',
                    },
                    {
                        key: 'toggle-status',
                        icon: record.is_active ? 
                            <StopOutlined style={{ color: '#ef4444' }} /> : 
                            <CheckCircleOutlined style={{ color: '#22c55e' }} />,
                        label: (
                            <span style={{ color: record.is_active ? '#ef4444' : '#22c55e' }}>
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
                                        backgroundColor: record.is_active ? '#ef4444' : '#22c55e',
                                        borderColor: record.is_active ? '#ef4444' : '#22c55e'
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
                        icon: <DeleteOutlined style={{ color: '#ef4444' }} />,
                        label: <span style={{ color: '#ef4444' }}>Delete User</span>,
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
                            type="text"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => handleEdit(record)}
                            title="Quick Edit"
                            style={{
                                borderRadius: 8,
                                height: 30, width: 30,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#6366f1',
                                background: '#eef2ff',
                                border: 'none',
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
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 8,
                                    height: 30, width: 30,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: '#f8fafc',
                                    transition: 'all 0.2s ease'
                                }}
                                title="More Actions"
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#eef2ff';
                                    e.currentTarget.style.borderColor = '#c7d2fe';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f8fafc';
                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                }}
                            />
                        </Dropdown>
                    </Space>
                );
            },
        },
    ];

    // Derived Statistics for Dashboard
    const totalUsers = users.length;
    const adminCount = users.filter(u => u.role === 'admin').length;
    const teacherCount = users.filter(u => u.role === 'teacher').length;
    const studentCount = users.filter(u => u.role === 'student').length;
    const inactiveCount = users.filter(u => !u.is_active).length;

    // Computed Filtered List
    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const matchesSearch = (u.first_name + ' ' + u.last_name).toLowerCase().includes(searchText.toLowerCase()) || 
                                  (u.email || '').toLowerCase().includes(searchText.toLowerCase());
            const matchesRole = selectedRoles.length === 0 || selectedRoles.includes(u.role);
            
            let matchesDate = true;
            if (dateRangeFilter && dateRangeFilter.length === 2 && u.created_at) {
                const start = dayjs(u.created_at);
                if (start.isBefore(dateRangeFilter[0], 'day') || start.isAfter(dateRangeFilter[1], 'day')) matchesDate = false;
            }

            return matchesSearch && matchesRole && matchesDate;
        });
    }, [users, searchText, selectedRoles, dateRangeFilter]);

    // ============================================================
    // Full-page Skeleton
    // ============================================================
    if (loading && users.length === 0) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 90px)' }}>
                {/* Header skeleton */}
                <div style={{ flexShrink: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                        <div>
                            <Skeleton.Input active style={{ width: 220, height: 26, borderRadius: 8 }} />
                            <div style={{ marginTop: 8 }}>
                                <Skeleton.Input active style={{ width: 360, height: 14, borderRadius: 6 }} />
                            </div>
                        </div>
                        <Skeleton.Button active style={{ width: 140, height: 40, borderRadius: 10 }} />
                    </div>

                    {/* KPI skeleton */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px', marginBottom: 20 }}>
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} style={{ borderRadius: 14, padding: '14px 16px', background: '#fff', border: '1px solid #f0f0f8', display: 'flex', alignItems: 'center', gap: 12 }}>
                                <Skeleton.Avatar active size={40} shape="square" style={{ borderRadius: 10 }} />
                                <div style={{ flex: 1 }}>
                                    <Skeleton.Input active style={{ width: '60%', height: 10, borderRadius: 4, marginBottom: 8 }} block />
                                    <Skeleton.Input active style={{ width: 36, height: 22, borderRadius: 6 }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Table skeleton */}
                <div style={{ flex: 1, background: '#fff', borderRadius: 16, border: '1px solid #f0f0f8', overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                    <div style={{ padding: '14px 20px', borderBottom: '1px solid #f5f5fa', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                        <Skeleton.Avatar active size={30} shape="square" style={{ borderRadius: 9 }} />
                        <Skeleton.Input active style={{ width: 120, height: 16, borderRadius: 4 }} />
                    </div>
                    {/* Table header skeleton */}
                    <div style={{ padding: '12px 20px', borderBottom: '1px solid #f5f5fa', display: 'flex', gap: 24 }}>
                        {[140, 200, 80, 80, 80, 100, 80].map((w, i) => (
                            <Skeleton.Input key={i} active style={{ width: w, height: 12, borderRadius: 4 }} />
                        ))}
                    </div>
                    {/* Table rows skeleton */}
                    <div style={{ flex: 1, overflow: 'hidden', padding: '0 20px' }}>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '14px 0', borderBottom: '1px solid #f8f9fb' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: 140 }}>
                                    <Skeleton.Avatar active size={34} shape="square" style={{ borderRadius: 10 }} />
                                    <div>
                                        <Skeleton.Input active style={{ width: 90, height: 12, borderRadius: 4, marginBottom: 4 }} />
                                        <Skeleton.Input active style={{ width: 40, height: 9, borderRadius: 4 }} />
                                    </div>
                                </div>
                                <Skeleton.Input active style={{ width: 180, height: 12, borderRadius: 4 }} />
                                <Skeleton.Input active style={{ width: 60, height: 20, borderRadius: 12 }} />
                                <Skeleton.Input active style={{ width: 55, height: 12, borderRadius: 4 }} />
                                <Skeleton.Input active style={{ width: 25, height: 14, borderRadius: 6 }} />
                                <Skeleton.Input active style={{ width: 80, height: 12, borderRadius: 4 }} />
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <Skeleton.Avatar active size={28} shape="square" style={{ borderRadius: 8 }} />
                                    <Skeleton.Avatar active size={28} shape="square" style={{ borderRadius: 8 }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 90px)' }}>
            {/* Fixed Header Area */}
            <div style={{ flexShrink: 0 }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', letterSpacing: -0.3 }}>
                            User Management
                        </div>
                        <Typography.Text style={{ fontSize: 13, color: '#94a3b8' }}>
                            Manage administrators, teachers, and students across the platform
                        </Typography.Text>
                    </div>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
                        style={{ borderRadius: 10, fontWeight: 600, height: 40, background: '#6366f1', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}
                    >
                        Add New User
                    </Button>
                </div>

                {/* KPI Dashboard */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px', marginBottom: 20 }}>
                    {[
                        { label: 'Total Users', value: totalUsers, icon: <UserOutlined />, gradient: 'linear-gradient(135deg, #6366f1, #818cf8)', accent: '#6366f1' },
                        { label: 'Admins', value: adminCount, icon: <KeyOutlined />, gradient: 'linear-gradient(135deg, #ef4444, #f87171)', accent: '#ef4444' },
                        { label: 'Teachers', value: teacherCount, icon: <EditOutlined />, gradient: 'linear-gradient(135deg, #3b82f6, #60a5fa)', accent: '#3b82f6' },
                        { label: 'Students', value: studentCount, icon: <UserOutlined />, gradient: 'linear-gradient(135deg, #10b981, #34d399)', accent: '#10b981' },
                        { label: 'Disabled', value: inactiveCount, icon: <StopOutlined />, gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)', accent: '#f59e0b' },
                    ].map((kpi, i) => (
                        <div key={i} style={{
                            borderRadius: 14, padding: '14px 16px',
                            background: '#fff', border: '1px solid #f0f0f8',
                            boxShadow: '0 2px 12px rgba(99,102,241,0.04)',
                            display: 'flex', alignItems: 'center', gap: 12,
                            transition: 'all 0.2s ease', cursor: 'default',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.12)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(99,102,241,0.04)'; }}
                        >
                            <div style={{
                                width: 40, height: 40, borderRadius: 10,
                                background: kpi.gradient,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 16, color: '#fff', flexShrink: 0,
                                boxShadow: `0 4px 12px ${kpi.accent}40`,
                            }}>
                                {kpi.icon}
                            </div>
                            <div>
                                <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.6 }}>{kpi.label}</div>
                                <div style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>{kpi.value}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Table Container — fills remaining height */}
            <div style={{ flex: 1, background: '#fff', borderRadius: 16, border: '1px solid #f0f0f8', boxShadow: '0 2px 12px rgba(99,102,241,0.04)', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f5f5fa', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 30, height: 30, borderRadius: 9, background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed', fontSize: 14 }}>
                                <UserOutlined />
                            </div>
                            <span style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>User Directory</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', background: '#f1f5f9', padding: '2px 10px', borderRadius: 12 }}>{filteredUsers.length} of {totalUsers} users</span>
                        </div>
                    </div>
                    {/* Advanced Filter Bar */}
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <Input.Search 
                            placeholder="Search by student or teacher name, or email..." 
                            allowClear 
                            onChange={e => setSearchText(e.target.value)} 
                            style={{ width: 320 }} 
                        />
                        <Select
                            mode="multiple"
                            placeholder="Filter by Role"
                            allowClear
                            style={{ minWidth: 200 }}
                            onChange={setSelectedRoles}
                            options={[
                                { label: 'Administrator', value: 'admin' },
                                { label: 'Teacher', value: 'teacher' },
                                { label: 'Student', value: 'student' }
                            ]}
                        />
                        <DatePicker.RangePicker 
                            onChange={setDateRangeFilter} 
                            allowClear 
                            style={{ minWidth: 240 }} 
                        />
                    </div>
                </div>
                <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
                    <Table
                        columns={columns}
                        dataSource={filteredUsers}
                        rowKey="id"
                        loading={loading}
                        scroll={{ x: 1000 }}
                        size="middle"
                        pagination={{
                            pageSize: 15,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
                            pageSizeOptions: ['10', '15', '25', '50'],
                            style: { padding: '12px 20px', margin: 0 },
                        }}
                    />
                </div>
            </div>

            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ 
                            width: 40, height: 40, borderRadius: 10, 
                            background: editingUser ? '#eff6ff' : '#ecfdf5', 
                            color: editingUser ? '#2563eb' : '#10b981', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 
                        }}>
                            {editingUser ? <EditOutlined /> : <PlusOutlined />}
                        </div>
                        <span style={{ fontSize: 18, fontWeight: 700, color: '#1e293b' }}>
                            {editingUser ? 'Edit User Profile' : 'Create New User'}
                        </span>
                    </div>
                }
                open={modalVisible}
                onCancel={() => {
                    if (!submitLoading) {
                        setModalVisible(false);
                        form.resetFields();
                        setEditingUser(null);
                    }
                }}
                footer={null}
                width={650}
                maskClosable={!submitLoading}
                closable={!submitLoading}
                styles={{ 
                    header: { paddingBottom: 16, borderBottom: '1px solid #f1f5f9', marginBottom: 24, margin: '-4px -24px 24px', padding: '24px 32px 16px' }, 
                    body: { padding: '0 8px' }, 
                    content: { borderRadius: 20, overflow: 'hidden', padding: '24px 24px 32px' } 
                }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    requiredMark={(label, info) => (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ fontWeight: 600, color: '#475569', fontSize: 13 }}>{label}</span>
                            {info.required && <span style={{ color: '#ef4444' }}>*</span>}
                        </div>
                    )}
                >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <Form.Item
                            name="first_name"
                            label="First Name"
                            rules={[{ required: true, message: 'Please input first name!' }]}
                        >
                            <Input size="large" placeholder="Enter first name" style={{ borderRadius: 8, borderColor: '#e2e8f0' }} />
                        </Form.Item>

                        <Form.Item
                            name="last_name"
                            label="Last Name"
                            rules={[{ required: true, message: 'Please input last name!' }]}
                        >
                            <Input size="large" placeholder="Enter last name" style={{ borderRadius: 8, borderColor: '#e2e8f0' }} />
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
                            size="large"
                            placeholder="Enter username" 
                            disabled={!!editingUser}
                            prefix={<UserOutlined style={{ color: '#94a3b8' }} />}
                            style={{ borderRadius: 8, borderColor: '#e2e8f0' }}
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
                        <Input size="large" placeholder="Enter email" style={{ borderRadius: 8, borderColor: '#e2e8f0' }} />
                    </Form.Item>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <Form.Item
                            name="role"
                            label="Role"
                            rules={[{ required: true, message: 'Please select a role!' }]}
                        >
                            <Select size="large" placeholder="Select role" disabled={isOwnAdminEdit}>
                                <Option value="admin">
                                    <Space>
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
                                        <span style={{ fontWeight: 600 }}>Admin</span>
                                    </Space>
                                </Option>
                                <Option value="teacher">
                                    <Space>
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }} />
                                        <span style={{ fontWeight: 600 }}>Teacher</span>
                                    </Space>
                                </Option>
                                <Option value="student">
                                    <Space>
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                                        <span style={{ fontWeight: 600 }}>Student</span>
                                    </Space>
                                </Option>
                            </Select>
                        </Form.Item>

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
                                style={{ backgroundColor: isActiveValue ? '#10b981' : '#f43f5e', height: 26, width: 70 }}
                            />
                        </Form.Item>
                    </div>

                    {!editingUser && (
                        <div style={{ 
                            background: '#f8fafc', border: '1px dashed #cbd5e1', 
                            borderRadius: '12px', padding: '16px', marginTop: 8, marginBottom: 24 
                        }}>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <div style={{ fontSize: 18, color: '#64748b' }}>
                                    <KeyOutlined />
                                </div>
                                <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                                    <span style={{ fontWeight: 700, display: 'block', marginBottom: 2, color: '#1e293b' }}>Auto-Generated Password</span>
                                    A secure 10-character password will be generated automatically and emailed to the user.
                                </div>
                            </div>
                        </div>
                    )}

                    {editingUser && (
                        <div style={{ 
                            background: '#fff7ed', border: '1px solid #fed7aa', 
                            borderRadius: '12px', padding: '16px', marginTop: 8, marginBottom: 24 
                        }}>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <div style={{ fontSize: 18, color: '#f97316' }}>
                                    <KeyOutlined />
                                </div>
                                <div style={{ fontSize: 13, color: '#9a3412', lineHeight: 1.5 }}>
                                    To change this user's password, please use the <strong>"Reset Password"</strong> action from their row menu in the main table.
                                </div>
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: 32, display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 20, borderTop: '1px solid #f1f5f9' }}>
                        <Button 
                            size="large"
                            onClick={() => {
                                setModalVisible(false);
                                form.resetFields();
                                setEditingUser(null);
                            }}
                            disabled={submitLoading}
                            style={{ borderRadius: 10, fontWeight: 600, padding: '0 24px' }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            size="large"
                            type="primary" 
                            htmlType="submit"
                            loading={submitLoading}
                            style={{ borderRadius: 10, fontWeight: 600, padding: '0 32px', background: '#6366f1', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}
                        >
                            {editingUser ? 'Save Changes' : 'Create User'}
                        </Button>
                    </div>
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
        </div>
    );
};

export default UserManagement;