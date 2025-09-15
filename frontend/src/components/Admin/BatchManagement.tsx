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
    DatePicker
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    TeamOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

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
    status: 'active' | 'inactive' | 'completed';
    created_at: string;
}

interface Teacher {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
}

const BatchManagement: React.FC = () => {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
    const [form] = Form.useForm();
    const { apiCall } = useAuth();

    useEffect(() => {
        fetchBatches();
        fetchTeachers();
    }, []);

    const fetchBatches = async () => {
        setLoading(true);
        try {
            const response = await apiCall('/batches');
            if (response.ok) {
                const data = await response.json();
                setBatches(data.batches || []);
            } else {
                message.error('Failed to fetch batches');
            }
        } catch (error) {
            message.error('Error fetching batches');
        } finally {
            setLoading(false);
        }
    };

    const fetchTeachers = async () => {
        try {
            const response = await apiCall('/users?role=teacher');
            if (response.ok) {
                const data = await response.json();
                setTeachers(data.users || []);
            }
        } catch (error) {
            console.error('Error fetching teachers:', error);
        }
    };

    const handleSubmit = async (values: any) => {
        try {
            const formData = {
                ...values,
                start_date: values.dateRange[0].format('YYYY-MM-DD'),
                end_date: values.dateRange[1].format('YYYY-MM-DD'),
            };
            delete formData.dateRange;

            const endpoint = editingBatch ? `/batches/${editingBatch.id}` : '/batches';
            const method = editingBatch ? 'PUT' : 'POST';
            
            const response = await apiCall(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                message.success(`Batch ${editingBatch ? 'updated' : 'created'} successfully`);
                setModalVisible(false);
                form.resetFields();
                setEditingBatch(null);
                fetchBatches();
            } else {
                const errorData = await response.json();
                message.error(errorData.message || 'Operation failed');
            }
        } catch (error) {
            message.error('Error saving batch');
        }
    };

    const handleDelete = async (batchId: number) => {
        try {
            const response = await apiCall(`/batches/${batchId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                message.success('Batch deleted successfully');
                fetchBatches();
            } else {
                message.error('Failed to delete batch');
            }
        } catch (error) {
            message.error('Error deleting batch');
        }
    };

    const handleEdit = (batch: Batch) => {
        setEditingBatch(batch);
        form.setFieldsValue({
            name: batch.name,
            description: batch.description,
            teacher_id: batch.teacher_id,
            max_students: batch.max_students,
            status: batch.status,
            dateRange: [
                dayjs(batch.start_date),
                dayjs(batch.end_date)
            ],
        });
        setModalVisible(true);
    };

    const handleAdd = () => {
        setEditingBatch(null);
        form.resetFields();
        setModalVisible(true);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'green';
            case 'inactive': return 'orange';
            case 'completed': return 'blue';
            default: return 'default';
        }
    };

    const columns: ColumnsType<Batch> = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            width: 180,
            fixed: 'left',
            ellipsis: true,
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            width: 200,
            ellipsis: true,
        },
        {
            title: 'Teacher',
            dataIndex: 'teacher_name',
            key: 'teacher_name',
            width: 150,
            ellipsis: true,
            render: (_, record) => {
                const teacher = teachers.find(t => t.id === record.teacher_id);
                return teacher ? `${teacher.first_name} ${teacher.last_name}` : 'N/A';
            },
        },
        {
            title: 'Duration',
            key: 'duration',
            width: 220,
            render: (_, record) => (
                <span>
                    {dayjs(record.start_date).format('MMM DD, YYYY')} - {dayjs(record.end_date).format('MMM DD, YYYY')}
                </span>
            ),
        },
        {
            title: 'Students',
            key: 'students',
            width: 100,
            render: (_, record) => (
                <span>
                    {record.current_students || 0} / {record.max_students}
                </span>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>
                    {status.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
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
                    <Popconfirm
                        title="Are you sure you want to delete this batch?"
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
        <Card>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={2}>
                    <TeamOutlined /> Batch Management
                </Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                >
                    Add Batch
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={batches}
                rowKey="id"
                loading={loading}
                scroll={{ x: 1100, y: 400 }}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} batches`
                }}
            />

            <Modal
                title={editingBatch ? 'Edit Batch' : 'Add Batch'}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setEditingBatch(null);
                }}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="name"
                        label="Batch Name"
                        rules={[{ required: true, message: 'Please input batch name!' }]}
                    >
                        <Input placeholder="Enter batch name" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[{ required: true, message: 'Please input description!' }]}
                    >
                        <Input.TextArea rows={3} placeholder="Enter batch description" />
                    </Form.Item>

                    <Form.Item
                        name="teacher_id"
                        label="Teacher"
                        rules={[{ required: true, message: 'Please select a teacher!' }]}
                    >
                        <Select placeholder="Select teacher">
                            {teachers.map(teacher => (
                                <Option key={teacher.id} value={teacher.id}>
                                    {teacher.first_name} {teacher.last_name} ({teacher.email})
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="dateRange"
                        label="Duration"
                        rules={[{ required: true, message: 'Please select start and end dates!' }]}
                    >
                        <RangePicker style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="max_students"
                        label="Maximum Students"
                        rules={[
                            { required: true, message: 'Please input maximum students!' },
                            { type: 'number', min: 1, message: 'Must be at least 1!' }
                        ]}
                    >
                        <Input type="number" placeholder="Enter maximum students" />
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label="Status"
                        rules={[{ required: true, message: 'Please select status!' }]}
                    >
                        <Select placeholder="Select status">
                            <Option value="active">Active</Option>
                            <Option value="inactive">Inactive</Option>
                            <Option value="completed">Completed</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                {editingBatch ? 'Update' : 'Create'}
                            </Button>
                            <Button onClick={() => {
                                setModalVisible(false);
                                form.resetFields();
                                setEditingBatch(null);
                            }}>
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default BatchManagement;