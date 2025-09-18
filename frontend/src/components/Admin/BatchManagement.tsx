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
    Card,
    DatePicker
} from 'antd';
import {
    PlusOutlined,
    TeamOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface Batch {
    id: number;
    name: string;
    french_level: string;
    teacher_id: number;
    teacher_first_name?: string;
    teacher_last_name?: string;
    start_date: string;
    end_date: string;
    student_count: number;
    created_at: string;
}

interface Person {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
}

const BatchManagement: React.FC = () => {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [teachers, setTeachers] = useState<Person[]>([]);
    const [students, setStudents] = useState<Person[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
    const [form] = Form.useForm();
    const { apiCall } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchBatches();
        fetchTeachers();
        fetchStudents();
    }, []);

    const fetchBatches = async () => {
        setLoading(true);
        try {
            const response = await apiCall('/batches');
            if (response.ok) {
                const data = await response.json();
                // Backend returns an array directly
                setBatches(Array.isArray(data) ? data : (data.batches || []));
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
            // Use dedicated teachers endpoint and handle array response
            const response = await apiCall('/users/role/teachers');
            if (response.ok) {
                const data = await response.json();
                setTeachers(Array.isArray(data) ? data : (data.users || []));
            }
        } catch (error) {
            console.error('Error fetching teachers:', error);
        }
    };

    const fetchStudents = async () => {
        try {
            const response = await apiCall('/users/role/students');
            if (response.ok) {
                const data = await response.json();
                setStudents(Array.isArray(data) ? data : (data.users || []));
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const handleSubmit = async (values: any) => {
        try {
            const baseData: any = {
                name: values.name,
                teacher_id: values.teacher_id,
                french_level: values.french_level,
                // Send ISO8601 strings to match backend validator
                start_date: values.dateRange[0].toDate().toISOString(),
                end_date: values.dateRange[1].toDate().toISOString(),
            };

            const endpoint = editingBatch ? `/batches/${editingBatch.id}` : '/batches';
            const method = editingBatch ? 'PUT' : 'POST';

            // On create, backend requires student_ids array (min 1)
            const body = editingBatch
                ? baseData
                : { ...baseData, student_ids: values.student_ids };
            
            const response = await apiCall(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                message.success(`Batch ${editingBatch ? 'updated' : 'created'} successfully`);
                setModalVisible(false);
                form.resetFields();
                setEditingBatch(null);
                fetchBatches();
            } else {
                const errorData = await response.json();
                message.error(errorData.error || errorData.message || 'Operation failed');
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
            french_level: batch.french_level,
            teacher_id: batch.teacher_id,
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



    // Helper to format duration as days only
    const formatDaysOnly = (startISO: string, endISO: string) => {
        const start = new Date(startISO);
        const end = new Date(endISO);
        const startTime = start.getTime();
        const endTime = end.getTime();
        const diff = endTime - startTime;
        if (Number.isNaN(startTime) || Number.isNaN(endTime) || diff < 0) return '—';
        const dayMs = 24 * 60 * 60 * 1000;
        const days = Math.floor(diff / dayMs);
        return `${days} day${days !== 1 ? 's' : ''}`;
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
            title: 'French Level',
            dataIndex: 'french_level',
            key: 'french_level',
            width: 200,
            ellipsis: true,
        },
        {
            title: 'Teacher',
            dataIndex: 'teacher_id',
            key: 'teacher_name',
            width: 180,
            ellipsis: true,
            render: (_, record) => {
                if (record.teacher_first_name || record.teacher_last_name) {
                    return `${record.teacher_first_name || ''} ${record.teacher_last_name || ''}`.trim();
                }
                const teacher = teachers.find(t => t.id === record.teacher_id);
                return teacher ? `${teacher.first_name} ${teacher.last_name}` : 'N/A';
            },
        },
        {
            title: 'Duration',
            key: 'duration',
            width: 220,
            render: (_, record) => (
                <span>{formatDaysOnly(record.start_date, record.end_date)}</span>
            ),
        },
        {
            title: 'Students',
            dataIndex: 'student_count',
            key: 'students',
            width: 120,
        },
        // Keeping Status column colors utility in case it's used later
        // but not displayed since backend doesn't provide status
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button type="default" onClick={() => navigate(`/batches/${record.id}/insights`)}>
                        Insight
                    </Button>
                    <Button type="primary" onClick={() => handleEdit(record)}>Edit</Button>
                    <Button danger onClick={() => handleDelete(record.id)}>Delete</Button>
                </Space>
            ),
            width: 200
        },
    ];

    return (
        <Card style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }} styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column' } }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <Title level={2} style={{ margin: 0 }}>
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

            <div style={{ flex: 1, overflow: 'hidden' }}>
                <Table
                    columns={columns}
                    dataSource={batches}
                    rowKey="id"
                    loading={loading}
                    scroll={{ x: 1000, y: 'calc(100vh - 280px)' }}
                    pagination={{
                        pageSize: 15,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} batches`,
                        pageSizeOptions: ['10', '15', '25', '50'],
                    }}
                />
            </div>

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
                        name="french_level"
                        label="French Level"
                        rules={[{ required: true, message: 'Please select French level!' }]}
                    >
                        <Select placeholder="Select French level">
                            <Option value="A1">A1</Option>
                            <Option value="A2">A2</Option>
                            <Option value="B1">B1</Option>
                            <Option value="B2">B2</Option>
                            <Option value="C1">C1</Option>
                            <Option value="C2">C2</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="teacher_id"
                        label="Teacher"
                        rules={[{ required: true, message: 'Please select a teacher!' }]}
                    >
                        <Select
                            placeholder="Select teacher"
                            showSearch
                            optionFilterProp="children"
                        >
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
                        rules={[{ required: true, message: 'Please select start and end date and time!' }]}
                    >
                        <RangePicker
                            style={{ width: '100%' }}
                            showTime={{ format: 'HH:mm' }}
                            format="YYYY-MM-DD HH:mm"
                        />
                    </Form.Item>

                    {!editingBatch && (
                        <Form.Item
                            name="student_ids"
                            label="Students"
                            rules={[{ required: true, message: 'Please select at least one student!' }]}
                        >
                            <Select
                                mode="multiple"
                                placeholder="Select students"
                                showSearch
                                optionFilterProp="children"
                            >
                                {students.map(s => (
                                    <Option key={s.id} value={s.id}>
                                        {s.first_name} {s.last_name} ({s.email})
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    )}

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