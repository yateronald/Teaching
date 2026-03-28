import React, { useState, useEffect, useCallback } from 'react';
import {
    Table, Button, Modal, Form, Input, Select, message, Space, Typography, Tag,
    Popconfirm, Card, Upload, Row, Col, Statistic, Empty, Tooltip, Spin, Progress
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined,
    FilePdfOutlined, VideoCameraOutlined, SoundOutlined, PictureOutlined,
    FolderOutlined, EyeOutlined, SearchOutlined, CloudUploadOutlined, FileTextOutlined,
    CloseCircleOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Resource {
    id: number;
    title: string;
    description: string;
    file_name: string;
    file_type: string;
    file_size: number;
    batch_id: number;
    batch_name?: string;
    teacher_id: number;
    teacher_first_name?: string;
    teacher_last_name?: string;
    category: string;
    storage_type: string;
    kdrive_file_id?: number;
    created_at: string;
    updated_at?: string;
}

interface Batch { id: number; name: string; }

const CATEGORY_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
    pdf: { icon: <FilePdfOutlined />, color: '#e74c3c', label: 'PDF' },
    video: { icon: <VideoCameraOutlined />, color: '#3498db', label: 'Video' },
    audio: { icon: <SoundOutlined />, color: '#9b59b6', label: 'Audio' },
    image: { icon: <PictureOutlined />, color: '#2ecc71', label: 'Image' },
    document: { icon: <FileTextOutlined />, color: '#f39c12', label: 'Document' },
};

function formatFileSize(bytes: number): string {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

const ResourceManagement: React.FC = () => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingResource, setEditingResource] = useState<Resource | null>(null);
    const [previewResource, setPreviewResource] = useState<Resource | null>(null);
    const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
    const [searchText, setSearchText] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterBatch, setFilterBatch] = useState<number | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadPhase, setUploadPhase] = useState<'idle' | 'sending' | 'cloud' | 'done'>('idle');
    const [form] = Form.useForm();
    const { apiCall, token } = useAuth();
    const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

    const fetchResources = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterCategory !== 'all') params.set('category', filterCategory);
            if (filterBatch) params.set('batch_id', String(filterBatch));
            const resp = await apiCall(`/resources?${params}`);
            if (resp.ok) setResources(await resp.json());
        } catch { message.error('Failed to load resources'); }
        finally { setLoading(false); }
    }, [filterCategory, filterBatch]);

    const fetchBatches = useCallback(async () => {
        try {
            const resp = await apiCall('/batches');
            if (resp.ok) setBatches(await resp.json());
        } catch {}
    }, []);

    useEffect(() => { fetchResources(); fetchBatches(); }, [fetchResources, fetchBatches]);

    const handleUpload = async (values: any) => {
        if (!values.file?.[0]) { message.error('Please select a file'); return; }
        setUploading(true);
        setUploadProgress(0);
        setUploadPhase('sending');
        try {
            const formData = new FormData();
            formData.append('file', values.file[0].originFileObj);
            formData.append('title', values.title);
            if (values.description) formData.append('description', values.description);
            if (values.batch_id) formData.append('batch_id', values.batch_id);

            let serverDone = false;
            let cloudInterval: ReturnType<typeof setInterval> | null = null;

            await new Promise<void>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', `${API}/resources`);
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);

                xhr.upload.onloadend = () => {
                    // Browser finished sending → server now uploads to kDrive
                    setUploadPhase('cloud');
                    setUploadProgress(0);
                    let current = 0;
                    cloudInterval = setInterval(() => {
                        if (serverDone) { if (cloudInterval) clearInterval(cloudInterval); return; }
                        current += Math.random() * 4 + 1;
                        if (current > 90) current = 90;
                        setUploadProgress(Math.round(current));
                    }, 400);
                };

                xhr.onload = () => {
                    serverDone = true;
                    if (cloudInterval) clearInterval(cloudInterval);
                    setUploadProgress(100);
                    setUploadPhase('done');

                    if (xhr.status >= 200 && xhr.status < 300) {
                        setTimeout(() => {
                            message.success('Uploaded to cloud successfully!');
                            setModalVisible(false);
                            form.resetFields();
                            fetchResources();
                            resolve();
                        }, 600);
                    } else {
                        try { message.error(JSON.parse(xhr.responseText).error || 'Upload failed'); } catch { message.error('Upload failed'); }
                        reject();
                    }
                };

                xhr.onerror = () => { serverDone = true; if (cloudInterval) clearInterval(cloudInterval); message.error('Network error'); reject(); };
                xhr.send(formData);
            });
        } catch {}
        finally { setUploading(false); setUploadProgress(0); setUploadPhase('idle'); }
    };

    const handleUpdate = async (values: any) => {
        if (!editingResource) return;
        try {
            const resp = await apiCall(`/resources/${editingResource.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: values.title, description: values.description, batch_id: values.batch_id || null }),
            });
            if (resp.ok) {
                message.success('Resource updated');
                setEditingResource(null);
                setModalVisible(false);
                form.resetFields();
                fetchResources();
            }
        } catch { message.error('Update failed'); }
    };

    const handleDelete = async (id: number) => {
        try {
            const resp = await apiCall(`/resources/${id}`, { method: 'DELETE' });
            if (resp.ok) { message.success('Resource deleted'); fetchResources(); }
        } catch { message.error('Delete failed'); }
    };

    const openEdit = (r: Resource) => {
        setEditingResource(r);
        form.setFieldsValue({ title: r.title, description: r.description, batch_id: r.batch_id });
        setModalVisible(true);
    };

    const openUpload = () => {
        setEditingResource(null);
        form.resetFields();
        setModalVisible(true);
    };

    /** Securely download a file using Authorization header (no token in URL) */
    const secureDownload = async (id: number, fileName: string) => {
        try {
            const resp = await fetch(`${API}/resources/${id}/download`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!resp.ok) throw new Error('Download failed');
            const blob = await resp.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 5000);
        } catch { message.error('Download failed'); }
    };

    /** Open preview modal and fetch blob URL securely */
    const openPreview = async (r: Resource) => {
        setPreviewResource(r);
        setPreviewBlobUrl(null);
        try {
            const resp = await fetch(`${API}/resources/${r.id}/preview`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!resp.ok) throw new Error('Preview failed');
            const blob = await resp.blob();
            setPreviewBlobUrl(URL.createObjectURL(blob));
        } catch {
            message.error('Failed to load preview — file may not be available on this server');
            setPreviewBlobUrl('error');
        }
    };

    const closePreview = () => {
        if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl);
        setPreviewBlobUrl(null);
        setPreviewResource(null);
    };

    const filtered = resources.filter(r => {
        if (searchText && !r.title.toLowerCase().includes(searchText.toLowerCase()) && !r.file_name.toLowerCase().includes(searchText.toLowerCase())) return false;
        return true;
    });

    const stats = {
        total: resources.length,
        pdf: resources.filter(r => r.category === 'pdf').length,
        video: resources.filter(r => r.category === 'video').length,
        audio: resources.filter(r => r.category === 'audio').length,
        document: resources.filter(r => r.category === 'document').length,
        image: resources.filter(r => r.category === 'image').length,
    };

    const columns: ColumnsType<Resource> = [
        {
            title: 'Resource',
            key: 'resource',
            render: (_, r) => {
                const cat = CATEGORY_CONFIG[r.category] || CATEGORY_CONFIG.document;
                return (
                    <Space>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${cat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cat.color, fontSize: 18 }}>
                            {cat.icon}
                        </div>
                        <div>
                            <Text strong style={{ display: 'block', fontSize: 14 }}>{r.title}</Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>{r.file_name} · {formatFileSize(r.file_size)}</Text>
                        </div>
                    </Space>
                );
            },
        },
        {
            title: 'Type', dataIndex: 'category', key: 'category', width: 100,
            render: (cat: string) => {
                const c = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.document;
                return <Tag color={c.color} style={{ borderRadius: 6 }}>{c.icon} {c.label}</Tag>;
            },
        },
        {
            title: 'Batch', dataIndex: 'batch_name', key: 'batch', width: 150,
            render: (name: string) => name ? <Tag color="blue">{name}</Tag> : <Text type="secondary">—</Text>,
        },
        {
            title: 'Storage', key: 'storage', width: 100,
            render: (_, r) => r.storage_type === 'kdrive'
                ? <Tag color="cyan" icon={<CloudUploadOutlined />}>Cloud</Tag>
                : <Tag>Local</Tag>,
        },
        {
            title: 'Date', dataIndex: 'created_at', key: 'date', width: 120,
            render: (d: string) => dayjs(d).format('MMM DD, YYYY'),
        },
        {
            title: 'Actions', key: 'actions', width: 200,
            render: (_, r) => (
                <Space size="small">
                    <Tooltip title="Preview"><Button size="small" icon={<EyeOutlined />} onClick={() => openPreview(r)} /></Tooltip>
                    <Tooltip title="Download">
                        <Button size="small" icon={<DownloadOutlined />} onClick={() => secureDownload(r.id, r.file_name)} />
                    </Tooltip>
                    <Tooltip title="Edit"><Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} /></Tooltip>
                    <Popconfirm title="Delete this resource?" onConfirm={() => handleDelete(r.id)}>
                        <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                        <Title level={3} style={{ margin: 0, fontWeight: 700 }}>Resources</Title>
                        <Text type="secondary">Manage learning materials for your students</Text>
                    </div>
                    <Button type="primary" icon={<PlusOutlined />} size="large" onClick={openUpload}
                        style={{ borderRadius: 10, height: 44, fontWeight: 600 }}>
                        Upload Resource
                    </Button>
                </div>

                {/* Stats */}
                <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
                    {[
                        { label: 'Total', value: stats.total, icon: <FolderOutlined />, color: '#1a56db' },
                        { label: 'PDFs', value: stats.pdf, icon: <FilePdfOutlined />, color: '#e74c3c' },
                        { label: 'Videos', value: stats.video, icon: <VideoCameraOutlined />, color: '#3498db' },
                        { label: 'Audio', value: stats.audio, icon: <SoundOutlined />, color: '#9b59b6' },
                        { label: 'Docs', value: stats.document, icon: <FileTextOutlined />, color: '#f39c12' },
                        { label: 'Images', value: stats.image, icon: <PictureOutlined />, color: '#2ecc71' },
                    ].map((s, i) => (
                        <Col xs={12} sm={8} md={4} key={i}>
                            <Card size="small" style={{ borderRadius: 12, border: 'none', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                                <Statistic title={s.label} value={s.value} prefix={<span style={{ color: s.color }}>{s.icon}</span>}
                                    valueStyle={{ fontSize: 24, fontWeight: 700 }} />
                            </Card>
                        </Col>
                    ))}
                </Row>

                {/* Filters */}
                <Card size="small" style={{ borderRadius: 12, border: 'none', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                    <Space wrap size="middle">
                        <Input placeholder="Search resources..." prefix={<SearchOutlined />} allowClear
                            value={searchText} onChange={e => setSearchText(e.target.value)}
                            style={{ width: 240, borderRadius: 8 }} />
                        <Select value={filterCategory} onChange={setFilterCategory} style={{ width: 140 }}
                            options={[{ value: 'all', label: 'All Types' }, ...Object.entries(CATEGORY_CONFIG).map(([k, v]) => ({ value: k, label: v.label }))]} />
                        <Select value={filterBatch} onChange={setFilterBatch} allowClear placeholder="All Batches" style={{ width: 160 }}
                            options={batches.map(b => ({ value: b.id, label: b.name }))} />
                    </Space>
                </Card>
            </div>

            {/* Table */}
            <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                <Table columns={columns} dataSource={filtered} rowKey="id" loading={loading}
                    pagination={{ pageSize: 15, showSizeChanger: false, showTotal: (t) => `${t} resources` }}
                    locale={{ emptyText: <Empty description="No resources yet. Upload your first one!" /> }} />
            </Card>

            {/* Upload / Edit Modal */}
            <Modal
                title={uploading ? null : editingResource ? '✏️ Edit Resource' : '☁️ Upload Resource'}
                open={modalVisible}
                onCancel={() => { if (!uploading) { setModalVisible(false); setEditingResource(null); form.resetFields(); } }}
                footer={null}
                width={uploading ? 400 : 520}
                destroyOnClose
                closable={!uploading}
                maskClosable={!uploading}
                styles={{ body: { padding: uploading ? '32px 28px' : '20px 24px' } }}
            >
                {/* Uploading state — compact progress view */}
                {uploading ? (
                    <div style={{ textAlign: 'center' }}>
                        <CloudUploadOutlined style={{ fontSize: 48, color: uploadPhase === 'done' ? '#52c41a' : '#1a56db', marginBottom: 16 }} />
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                            {uploadPhase === 'sending' ? 'Sending file...' : uploadPhase === 'cloud' ? 'Uploading to kDrive...' : '✓ Upload complete!'}
                        </div>
                        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
                            {uploadPhase === 'sending' ? 'Preparing your file for cloud storage' : uploadPhase === 'cloud' ? 'Storing securely on Infomaniak kDrive' : 'Your resource is ready'}
                        </div>
                        <Progress
                            percent={uploadProgress}
                            strokeColor={uploadPhase === 'done' ? '#52c41a' : { from: '#1a56db', to: '#7c3aed' }}
                            style={{ maxWidth: 300, margin: '0 auto' }}
                        />
                    </div>
                ) : (
                    /* Normal form */
                    <Form form={form} layout="vertical" onFinish={editingResource ? handleUpdate : handleUpload}>
                        <Form.Item name="title" label={<Text strong style={{ fontSize: 13 }}>Title</Text>} rules={[{ required: true, message: 'Title is required' }]}>
                            <Input placeholder="e.g. French Grammar Chapter 3" size="large" style={{ borderRadius: 10 }} />
                        </Form.Item>
                        <Form.Item name="description" label={<Text strong style={{ fontSize: 13 }}>Description</Text>}>
                            <TextArea rows={2} placeholder="Brief description" style={{ borderRadius: 10 }} />
                        </Form.Item>
                        <Form.Item name="batch_id" label={<Text strong style={{ fontSize: 13 }}>Assign to Batch</Text>}>
                            <Select allowClear placeholder="Select a batch (optional)" size="large"
                                options={batches.map(b => ({ value: b.id, label: b.name }))} />
                        </Form.Item>
                        {!editingResource && (
                            <Form.Item name="file" label={<Text strong style={{ fontSize: 13 }}>File</Text>} valuePropName="fileList"
                                getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList}
                                rules={[{ required: true, message: 'Please select a file' }]}>
                                <Upload.Dragger beforeUpload={() => false} maxCount={1}
                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.mp4,.avi,.mov,.webm,.mp3,.wav,.ogg,.m4a,.jpg,.jpeg,.png,.gif,.zip"
                                    style={{ borderRadius: 12, border: '2px dashed #d9d9d9', padding: '12px 0' }}>
                                    <p style={{ fontSize: 28, color: '#1a56db', marginBottom: 4 }}><CloudUploadOutlined /></p>
                                    <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginBottom: 2 }}>Drag & drop or click to browse</p>
                                    <p style={{ fontSize: 11, color: '#94a3b8' }}>PDF, DOC, PPT, MP4, MP3, images · Max 100MB</p>
                                </Upload.Dragger>
                            </Form.Item>
                        )}
                        <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                                <Button onClick={() => { setModalVisible(false); setEditingResource(null); }}
                                    style={{ borderRadius: 10, height: 40 }}>Cancel</Button>
                                <Button type="primary" htmlType="submit"
                                    icon={editingResource ? <EditOutlined /> : <CloudUploadOutlined />}
                                    style={{ borderRadius: 10, height: 40, fontWeight: 600, minWidth: 130 }}>
                                    {editingResource ? 'Save Changes' : 'Upload to Cloud'}
                                </Button>
                            </div>
                        </Form.Item>
                    </Form>
                )}
            </Modal>

            {/* Preview Modal */}
            <Modal
                title={previewResource?.title || 'Preview'}
                open={!!previewResource}
                onCancel={closePreview}
                width={900}
                footer={[
                    <Button key="download" icon={<DownloadOutlined />} onClick={() => {
                        if (previewResource) secureDownload(previewResource.id, previewResource.file_name);
                    }}>Download</Button>,
                    <Button key="close" type="primary" onClick={closePreview}>Close</Button>,
                ]}
                styles={{ body: { padding: 0, minHeight: 500 } }}
            >
                {previewResource && !previewBlobUrl && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                        <Spin size="large" tip="Loading preview..." />
                    </div>
                )}
                {previewResource && previewBlobUrl === 'error' && (
                    <div style={{ padding: 60, textAlign: 'center' }}>
                        <CloseCircleOutlined style={{ fontSize: 48, color: '#ff4d4f', marginBottom: 16 }} />
                        <div><Text strong style={{ fontSize: 16 }}>Preview not available</Text></div>
                        <Text type="secondary">This file was uploaded on a different server and is not accessible locally. Try downloading it instead.</Text>
                    </div>
                )}
                {previewResource && previewBlobUrl && previewBlobUrl !== 'error' && (
                    <div style={{ width: '100%', minHeight: 500 }}>
                        {previewResource.category === 'pdf' && (
                            <iframe src={previewBlobUrl}
                                style={{ width: '100%', height: 600, border: 'none' }} title="PDF Preview" />
                        )}
                        {previewResource.category === 'video' && (
                            <video controls style={{ width: '100%', maxHeight: 500 }}
                                src={previewBlobUrl} />
                        )}
                        {previewResource.category === 'audio' && (
                            <div style={{ padding: 40, textAlign: 'center' }}>
                                <SoundOutlined style={{ fontSize: 64, color: '#9b59b6', marginBottom: 24 }} />
                                <div><Text strong style={{ fontSize: 18 }}>{previewResource.file_name}</Text></div>
                                <audio controls style={{ marginTop: 24, width: '80%' }}
                                    src={previewBlobUrl} />
                            </div>
                        )}
                        {previewResource.category === 'image' && (
                            <img src={previewBlobUrl}
                                alt={previewResource.title} style={{ width: '100%', objectFit: 'contain', maxHeight: 600 }} />
                        )}
                        {previewResource.category === 'document' && (
                            <div style={{ padding: 60, textAlign: 'center' }}>
                                <FileTextOutlined style={{ fontSize: 64, color: '#f39c12', marginBottom: 16 }} />
                                <div><Text strong style={{ fontSize: 18 }}>{previewResource.file_name}</Text></div>
                                <Text type="secondary">{formatFileSize(previewResource.file_size)}</Text>
                                <div style={{ marginTop: 24 }}>
                                    <Text type="secondary">This file type cannot be previewed in the browser. Please download it.</Text>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ResourceManagement;
