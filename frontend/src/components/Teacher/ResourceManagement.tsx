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
    Upload,
    Progress,
    Tabs
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    FolderOutlined,
    UploadOutlined,
    FileOutlined,
    DownloadOutlined,
    EyeOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import type { ColumnsType } from 'antd/es/table';
import type { UploadProps } from 'antd';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

interface Resource {
    id: number;
    title: string;
    description: string;
    file_name: string;
    file_path: string;
    file_size: number;
    file_type: string;
    batch_id: number;
    batch_name?: string;
    is_public: boolean;
    download_count: number;
    created_at: string;
}

interface Batch {
    id: number;
    name: string;
}

const ResourceManagement: React.FC = () => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingResource, setEditingResource] = useState<Resource | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [form] = Form.useForm();
    const { apiCall } = useAuth();

    useEffect(() => {
        fetchResources();
        fetchBatches();
    }, []);

    const fetchResources = async () => {
        setLoading(true);
        try {
            const response = await apiCall('/resources/my-resources');
            if (response.ok) {
                const data = await response.json();
                setResources(data.resources || []);
            } else {
                message.error('Failed to fetch resources');
            }
        } catch (error) {
            message.error('Error fetching resources');
        } finally {
            setLoading(false);
        }
    };

    const fetchBatches = async () => {
        try {
            const response = await apiCall('/batches');
            if (response.ok) {
                const data = await response.json();
                setBatches(Array.isArray(data) ? data : (data.batches || []));
            }
        } catch (error) {
            console.error('Error fetching batches:', error);
        }
    };

    const handleSubmit = async (values: any) => {
        try {
            const formData = new FormData();
            
            // Add form fields
            Object.keys(values).forEach(key => {
                if (key !== 'file' && values[key] !== undefined) {
                    formData.append(key, values[key]);
                }
            });

            // Add file if uploading new resource
            if (!editingResource && values.file && values.file.length > 0) {
                formData.append('file', values.file[0].originFileObj);
            }

            const endpoint = editingResource ? `/resources/${editingResource.id}` : '/resources';
            const method = editingResource ? 'PUT' : 'POST';
            
            const response = await apiCall(endpoint, {
                method,
                body: formData,
            });

            if (response.ok) {
                message.success(`Resource ${editingResource ? 'updated' : 'uploaded'} successfully`);
                setModalVisible(false);
                form.resetFields();
                setEditingResource(null);
                setUploadProgress(0);
                fetchResources();
            } else {
                const errorData = await response.json();
                message.error(errorData.message || 'Operation failed');
            }
        } catch (error) {
            message.error('Error saving resource');
        }
    };

    const handleDelete = async (resourceId: number) => {
        try {
            const response = await apiCall(`/resources/${resourceId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                message.success('Resource deleted successfully');
                fetchResources();
            } else {
                message.error('Failed to delete resource');
            }
        } catch (error) {
            message.error('Error deleting resource');
        }
    };

    const handleDownload = async (resource: Resource) => {
        try {
            const response = await apiCall(`/resources/${resource.id}/download`);
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = resource.file_name;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                // Refresh resources to update download count
                fetchResources();
            } else {
                message.error('Failed to download resource');
            }
        } catch (error) {
            message.error('Error downloading resource');
        }
    };

    const handleEdit = (resource: Resource) => {
        setEditingResource(resource);
        form.setFieldsValue({
            title: resource.title,
            description: resource.description,
            batch_id: resource.batch_id,
            is_public: resource.is_public,
        });
        setModalVisible(true);
    };

    const handleAdd = () => {
        setEditingResource(null);
        form.resetFields();
        setModalVisible(true);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (fileType: string) => {
        if (fileType.includes('pdf')) return '📄';
        if (fileType.includes('image')) return '🖼️';
        if (fileType.includes('video')) return '🎥';
        if (fileType.includes('audio')) return '🎵';
        if (fileType.includes('text')) return '📝';
        return '📁';
    };

    const uploadProps: UploadProps = {
        beforeUpload: () => false, // Prevent auto upload
        maxCount: 1,
        accept: '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mp3,.zip,.rar',
        onChange: (info) => {
            if (info.fileList.length > 0) {
                const file = info.fileList[0];
                if (file.size && file.size > 50 * 1024 * 1024) { // 50MB limit
                    message.error('File size must be less than 50MB');
                    return;
                }
            }
        },
    };

    const columns: ColumnsType<Resource> = [
        {
            title: 'File',
            key: 'file',
            render: (_, record) => (
                <Space>
                    <span style={{ fontSize: '16px' }}>{getFileIcon(record.file_type)}</span>
                    <div>
                        <Text strong>{record.title}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            {record.file_name} ({formatFileSize(record.file_size)})
                        </Text>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Batch',
            key: 'batch',
            render: (_, record) => {
                const batch = batches.find(b => b.id === record.batch_id);
                return batch ? batch.name : 'All Batches';
            },
        },
        {
            title: 'Visibility',
            dataIndex: 'is_public',
            key: 'is_public',
            render: (isPublic: boolean) => (
                <Tag color={isPublic ? 'green' : 'orange'}>
                    {isPublic ? 'PUBLIC' : 'BATCH ONLY'}
                </Tag>
            ),
        },
        {
            title: 'Downloads',
            dataIndex: 'download_count',
            key: 'download_count',
            render: (count: number) => count || 0,
        },
        {
            title: 'Uploaded',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        type="default"
                        size="small"
                        icon={<DownloadOutlined />}
                        onClick={() => handleDownload(record)}
                    >
                        Download
                    </Button>
                    <Button
                        type="primary"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Are you sure you want to delete this resource?"
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

    const publicResources = resources.filter(resource => resource.is_public);
    const batchResources = resources.filter(resource => !resource.is_public);

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={2}>
                    <FolderOutlined /> Resource Management
                </Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                >
                    Upload Resource
                </Button>
            </div>

            <Card>
                <Tabs defaultActiveKey="all">
                    <TabPane tab={`All Resources (${resources.length})`} key="all">
                        <Table
                            columns={columns}
                            dataSource={resources}
                            rowKey="id"
                            loading={loading}
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                            }}
                        />
                    </TabPane>
                    <TabPane tab={`Public (${publicResources.length})`} key="public">
                        <Table
                            columns={columns}
                            dataSource={publicResources}
                            rowKey="id"
                            loading={loading}
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                            }}
                        />
                    </TabPane>
                    <TabPane tab={`Batch Only (${batchResources.length})`} key="batch">
                        <Table
                            columns={columns}
                            dataSource={batchResources}
                            rowKey="id"
                            loading={loading}
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                            }}
                        />
                    </TabPane>
                </Tabs>
            </Card>

            <Modal
                title={editingResource ? 'Edit Resource' : 'Upload Resource'}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setEditingResource(null);
                    setUploadProgress(0);
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
                        name="title"
                        label="Resource Title"
                        rules={[{ required: true, message: 'Please input resource title!' }]}
                    >
                        <Input placeholder="Enter resource title" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[{ required: true, message: 'Please input description!' }]}
                    >
                        <TextArea rows={3} placeholder="Enter resource description" />
                    </Form.Item>

                    <Form.Item
                        name="batch_id"
                        label="Batch"
                        help="Leave empty to make available to all batches"
                    >
                        <Select placeholder="Select batch (optional)" allowClear>
                            {batches.map(batch => (
                                <Option key={batch.id} value={batch.id}>
                                    {batch.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="is_public"
                        label="Visibility"
                        initialValue={false}
                    >
                        <Select>
                            <Option value={false}>Batch Only</Option>
                            <Option value={true}>Public (All Students)</Option>
                        </Select>
                    </Form.Item>

                    {!editingResource && (
                        <Form.Item
                            name="file"
                            label="File"
                            rules={[{ required: true, message: 'Please select a file!' }]}
                        >
                            <Upload {...uploadProps}>
                                <Button icon={<UploadOutlined />}>Select File</Button>
                            </Upload>
                            <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: 8 }}>
                                Supported formats: PDF, DOC, PPT, XLS, Images, Videos, Audio, ZIP (Max 50MB)
                            </Text>
                        </Form.Item>
                    )}

                    {uploadProgress > 0 && uploadProgress < 100 && (
                        <Form.Item>
                            <Progress percent={uploadProgress} />
                        </Form.Item>
                    )}

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                {editingResource ? 'Update' : 'Upload'}
                            </Button>
                            <Button onClick={() => {
                                setModalVisible(false);
                                form.resetFields();
                                setEditingResource(null);
                                setUploadProgress(0);
                            }}>
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ResourceManagement;