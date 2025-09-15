import React, { useState, useEffect } from 'react';
import { 
    Row, 
    Col, 
    Card, 
    Statistic, 
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
    DatePicker
} from 'antd';
import {
    UserOutlined,
    TeamOutlined,
    BookOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: 'admin' | 'teacher' | 'student';
    created_at: string;
}

interface Batch {
    id: number;
    name: string;
    description: string;
    teacher_id: number;
    teacher_name?: string;
    start_date: string;
    end_date: string;
    max_students: number;
    current_students: number;
    created_at: string;
}

interface CreateUserForm {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: 'admin' | 'teacher' | 'student';
}

interface CreateBatchForm {
    name: string;
    description: string;
    teacher_id: number;
    start_date: dayjs.Dayjs;
    end_date: dayjs.Dayjs;
    max_students: number;
}

const AdminDashboard: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [teachers, setTeachers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [userModalVisible, setUserModalVisible] = useState(false);
    const [batchModalVisible, setBatchModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editingBatch, setBatch] = useState<Batch | null>(null);
    const [userForm] = Form.useForm();
    const [batchForm] = Form.useForm();
    const { apiCall } = useAuth();

    const [stats, setStats] = useState({
        totalUsers: 0,
        totalTeachers: 0,
        totalStudents: 0,
        totalBatches: 0,
        totalQuizzes: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, batchesRes] = await Promise.all([
                apiCall('/api/users'),
                apiCall('/api/batches')
            ]);

            if (usersRes.success) {
                setUsers(usersRes.data);
                const teacherList = usersRes.data.filter((user: User) => user.role === 'teacher');
                setTeachers(teacherList);
                
                setStats(prev => ({
                    ...prev,
                    totalUsers: usersRes.data.length,
                    totalTeachers: teacherList.length,
                    totalStudents: usersRes.data.filter((user: User) => user.role === 'student').length
                }));
            }

            if (batchesRes.success) {
                setBatches(batchesRes.data);
                setStats(prev => ({
                    ...prev,
                    totalBatches: batchesRes.data.length
                }));
            }
        } catch (error) {
            message.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (values: CreateUserForm) => {
        try {
            const response = await apiCall('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify(values)
            });

            if (response.success) {
                message.success('User created successfully');
                setUserModalVisible(false);
                userForm.resetFields();
                fetchData();
            }
        } catch (error) {
            message.error('Failed to create user');
        }
    };

    const handleCreateBatch = async (values: CreateBatchForm) => {
        try {
            const batchData = {
                ...values,
                start_date: values.start_date.format('YYYY-MM-DD'),
                end_date: values.end_date.format('YYYY-MM-DD')
            };

            const response = await apiCall('/api/batches', {
                method: 'POST',
                body: JSON.stringify(batchData)
            });

            if (response.success) {
                message.success('Batch created successfully');
                setBatchModalVisible(false);
                batchForm.resetFields();
                fetchData();
            }
        } catch (error) {
            message.error('Failed to create batch');
        }
    };

    const handleDeleteUser = async (userId: number) => {
        try {
            const response = await apiCall(`/api/users/${userId}`, {
                method: 'DELETE'
            });

            if (response.success) {
                message.success('User deleted successfully');
                fetchData();
            }
        } catch (error) {
            message.error('Failed to delete user');
        }
    };

    const handleDeleteBatch = async (batchId: number) => {
        try {
            const response = await apiCall(`/api/batches/${batchId}`, {
                method: 'DELETE'
            });

            if (response.success) {
                message.success('Batch deleted successfully');
                fetchData();
            }
        } catch (error) {
            message.error('Failed to delete batch');
        }
    };

    const userColumns: ColumnsType<User> = [
        {
            title: 'Name',
            key: 'name',
            width: 200,
            fixed: 'left',
            render: (_, record) => `${record.first_name} ${record.last_name}`
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            width: 250,
            ellipsis: true
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            width: 120,
            render: (role: string) => {
                const color = role === 'admin' ? 'red' : role === 'teacher' ? 'blue' : 'green';
                return <Tag color={color}>{role.toUpperCase()}</Tag>;
            }
        },
        {
            title: 'Created',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 150,
            render: (date: string) => dayjs(date).format('MMM DD, YYYY')
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    <Button 
                        type="link" 
                        icon={<EditOutlined />}
                        onClick={() => {
                            setEditingUser(record);
                            setUserModalVisible(true);
                            userForm.setFieldsValue(record);
                        }}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Are you sure you want to delete this user?"
                        onConfirm={() => handleDeleteUser(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="link" danger icon={<DeleteOutlined />}>
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const batchColumns: ColumnsType<Batch> = [
        {
            title: 'Batch Name',
            dataIndex: 'name',
            key: 'name',
            width: 200,
            fixed: 'left',
            ellipsis: true
        },
        {
            title: 'Teacher',
            dataIndex: 'teacher_name',
            key: 'teacher_name',
            width: 180,
            ellipsis: true
        },
        {
            title: 'Students',
            key: 'students',
            width: 120,
            render: (_, record) => `${record.current_students}/${record.max_students}`
        },
        {
            title: 'Duration',
            key: 'duration',
            width: 250,
            render: (_, record) => (
                `${dayjs(record.start_date).format('MMM DD')} - ${dayjs(record.end_date).format('MMM DD, YYYY')}`
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    <Button 
                        type="link" 
                        icon={<EditOutlined />}
                        onClick={() => {
                            setBatch(record);
                            setBatchModalVisible(true);
                            batchForm.setFieldsValue({
                                ...record,
                                start_date: dayjs(record.start_date),
                                end_date: dayjs(record.end_date)
                            });
                        }}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Are you sure you want to delete this batch?"
                        onConfirm={() => handleDeleteBatch(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="link" danger icon={<DeleteOutlined />}>
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div>
            <Title level={2}>Admin Dashboard</Title>
            
            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Total Users"
                            value={stats.totalUsers}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Teachers"
                            value={stats.totalTeachers}
                            prefix={<BookOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Students"
                            value={stats.totalStudents}
                            prefix={<TeamOutlined />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Batches"
                            value={stats.totalBatches}
                            prefix={<FileTextOutlined />}
                            valueStyle={{ color: '#fa8c16' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Users Management */}
            <Card 
                title="User Management" 
                extra={
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setEditingUser(null);
                            setUserModalVisible(true);
                            userForm.resetFields();
                        }}
                    >
                        Add User
                    </Button>
                }
                style={{ marginBottom: 24 }}
            >
                <Table
                    columns={userColumns}
                    dataSource={users}
                    rowKey="id"
                    loading={loading}
                    scroll={{ x: 870, y: 400 }}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`
                    }}
                />
            </Card>

            {/* Batch Management */}
            <Card 
                title="Batch Management" 
                extra={
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setBatch(null);
                            setBatchModalVisible(true);
                            batchForm.resetFields();
                        }}
                    >
                        Create Batch
                    </Button>
                }
            >
                <Table
                    columns={batchColumns}
                    dataSource={batches}
                    rowKey="id"
                    loading={loading}
                    scroll={{ x: 900, y: 400 }}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} batches`
                    }}
                />
            </Card>

            {/* User Modal */}
            <Modal
                title={editingUser ? 'Edit User' : 'Create New User'}
                open={userModalVisible}
                onCancel={() => {
                    setUserModalVisible(false);
                    setEditingUser(null);
                    userForm.resetFields();
                }}
                footer={null}
                width={600}
            >
                <Form
                    form={userForm}
                    layout="vertical"
                    onFinish={handleCreateUser}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="first_name"
                                label="First Name"
                                rules={[{ required: true, message: 'Please enter first name' }]}
                            >
                                <Input placeholder="Enter first name" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="last_name"
                                label="Last Name"
                                rules={[{ required: true, message: 'Please enter last name' }]}
                            >
                                <Input placeholder="Enter last name" />
                            </Form.Item>
                        </Col>
                    </Row>
                    
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Please enter email' },
                            { type: 'email', message: 'Please enter valid email' }
                        ]}
                    >
                        <Input placeholder="Enter email address" />
                    </Form.Item>
                    
                    {!editingUser && (
                        <Form.Item
                            name="password"
                            label="Password"
                            rules={[
                                { required: true, message: 'Please enter password' },
                                { min: 6, message: 'Password must be at least 6 characters' }
                            ]}
                        >
                            <Input.Password placeholder="Enter password" />
                        </Form.Item>
                    )}
                    
                    <Form.Item
                        name="role"
                        label="Role"
                        rules={[{ required: true, message: 'Please select role' }]}
                    >
                        <Select placeholder="Select user role">
                            <Option value="admin">Administrator</Option>
                            <Option value="teacher">Teacher</Option>
                            <Option value="student">Student</Option>
                        </Select>
                    </Form.Item>
                    
                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setUserModalVisible(false)}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit">
                                {editingUser ? 'Update' : 'Create'} User
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Batch Modal */}
            <Modal
                title={editingBatch ? 'Edit Batch' : 'Create New Batch'}
                open={batchModalVisible}
                onCancel={() => {
                    setBatchModalVisible(false);
                    setBatch(null);
                    batchForm.resetFields();
                }}
                footer={null}
                width={600}
            >
                <Form
                    form={batchForm}
                    layout="vertical"
                    onFinish={handleCreateBatch}
                >
                    <Form.Item
                        name="name"
                        label="Batch Name"
                        rules={[{ required: true, message: 'Please enter batch name' }]}
                    >
                        <Input placeholder="Enter batch name" />
                    </Form.Item>
                    
                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[{ required: true, message: 'Please enter description' }]}
                    >
                        <Input.TextArea rows={3} placeholder="Enter batch description" />
                    </Form.Item>
                    
                    <Form.Item
                        name="teacher_id"
                        label="Assign Teacher"
                        rules={[{ required: true, message: 'Please select a teacher' }]}
                    >
                        <Select placeholder="Select teacher">
                            {teachers.map(teacher => (
                                <Option key={teacher.id} value={teacher.id}>
                                    {teacher.first_name} {teacher.last_name} ({teacher.email})
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="start_date"
                                label="Start Date"
                                rules={[{ required: true, message: 'Please select start date' }]}
                            >
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="end_date"
                                label="End Date"
                                rules={[{ required: true, message: 'Please select end date' }]}
                            >
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>
                    
                    <Form.Item
                        name="max_students"
                        label="Maximum Students"
                        rules={[
                            { required: true, message: 'Please enter maximum students' },
                            { type: 'number', min: 1, message: 'Must be at least 1' }
                        ]}
                    >
                        <Input type="number" placeholder="Enter maximum number of students" />
                    </Form.Item>
                    
                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setBatchModalVisible(false)}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit">
                                {editingBatch ? 'Update' : 'Create'} Batch
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminDashboard;