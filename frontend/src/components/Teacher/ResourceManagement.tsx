import React, { useState, useEffect, useCallback } from 'react';
import {
    Table, Button, Modal, Form, Input, Select, message, Space, Typography,
    Popconfirm, Upload, Row, Col, Tooltip, Progress, Skeleton, Empty, DatePicker
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined,
    FilePdfOutlined, VideoCameraOutlined, SoundOutlined, PictureOutlined,
    FolderOutlined, EyeOutlined, SearchOutlined, CloudUploadOutlined, FileTextOutlined,
    DesktopOutlined, ExpandOutlined, CompressOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import PdfViewer from '../Common/PdfViewer';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Resource {
    id: number;
    title: string;
    description: string;
    file_name: string;
    file_type: string;
    file_size: number;
    batch_ids: number[];
    batch_names?: string;
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

const CATEGORY_CONFIG: Record<string, { icon: React.ReactNode; color: string; accent: string; label: string }> = {
    pdf:      { icon: <FilePdfOutlined />,      color: '#ef4444', accent: '#fee2e2', label: 'PDF' },
    video:    { icon: <VideoCameraOutlined />,   color: '#3b82f6', accent: '#dbeafe', label: 'Video' },
    audio:    { icon: <SoundOutlined />,         color: '#8b5cf6', accent: '#ede9fe', label: 'Audio' },
    image:    { icon: <PictureOutlined />,       color: '#22c55e', accent: '#dcfce7', label: 'Image' },
    document: { icon: <FileTextOutlined />,      color: '#f59e0b', accent: '#fef3c7', label: 'Document' },
};

function formatFileSize(bytes: number): string {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/* ── Shared KPI card ── */
const KpiCard: React.FC<{ label: string; value: number; icon: React.ReactNode; accent: string; iconColor: string }> = ({ label, value, icon, accent, iconColor }) => (
    <div style={{
        borderRadius: 16, padding: '18px 20px',
        background: '#fff', border: '1px solid #f0f0f8',
        boxShadow: '0 2px 12px rgba(99,102,241,0.07)',
        display: 'flex', alignItems: 'center', gap: 14,
    }}>
        <div style={{
            width: 40, height: 40, borderRadius: 11,
            background: accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, color: iconColor, flexShrink: 0,
        }}>
            {icon}
        </div>
        <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 3 }}>
                {label}
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#1a1d2e', lineHeight: 1 }}>
                {value}
            </div>
        </div>
    </div>
);

/* ── Loading skeleton ── */
const ResourceSkeleton: React.FC = () => (
    <div style={{ paddingBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
                <Skeleton.Input active style={{ width: 160, height: 28, borderRadius: 8 }} />
                <div style={{ marginTop: 6 }}><Skeleton.Input active style={{ width: 240, height: 14, borderRadius: 6 }} /></div>
            </div>
            <Skeleton.Button active style={{ width: 150, height: 44, borderRadius: 12 }} />
        </div>
        <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
                <Col xs={12} sm={8} md={4} key={i}>
                    <div style={{
                        borderRadius: 16, padding: '18px 20px',
                        background: '#fff', border: '1px solid #f0f0f8',
                        boxShadow: '0 2px 12px rgba(99,102,241,0.07)',
                        display: 'flex', alignItems: 'center', gap: 14,
                    }}>
                        <Skeleton.Avatar active size={40} shape="square" style={{ borderRadius: 11 }} />
                        <div style={{ flex: 1 }}>
                            <Skeleton.Input active style={{ width: '70%', height: 10, borderRadius: 4, marginBottom: 6 }} block />
                            <Skeleton.Input active style={{ width: 32, height: 22, borderRadius: 5 }} />
                        </div>
                    </div>
                </Col>
            ))}
        </Row>
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0f0f8', boxShadow: '0 2px 12px rgba(99,102,241,0.07)', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f8', display: 'flex', gap: 10 }}>
                <Skeleton.Input active style={{ width: 220, height: 34, borderRadius: 8 }} />
                <Skeleton.Input active style={{ width: 140, height: 34, borderRadius: 8 }} />
                <Skeleton.Input active style={{ width: 160, height: 34, borderRadius: 8 }} />
            </div>
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px', borderBottom: '1px solid #f8f8fc' }}>
                    <Skeleton.Avatar active size={40} shape="square" style={{ borderRadius: 10, flexShrink: 0 }} />
                    <div style={{ flex: 3 }}>
                        <Skeleton.Input active style={{ width: '60%', height: 14, borderRadius: 5, marginBottom: 6 }} block />
                        <Skeleton.Input active style={{ width: '40%', height: 11, borderRadius: 5 }} block />
                    </div>
                    <Skeleton.Input active style={{ width: 60, height: 22, borderRadius: 20 }} />
                    <Skeleton.Input active style={{ width: 70, height: 22, borderRadius: 20 }} />
                    <Skeleton.Input active style={{ width: 60, height: 22, borderRadius: 20 }} />
                    <Skeleton.Input active style={{ width: 90, height: 14, borderRadius: 5 }} />
                    <div style={{ display: 'flex', gap: 6 }}>
                        {[1,2,3,4].map(j => <Skeleton.Button key={j} active size="small" style={{ width: 30, height: 30, borderRadius: 8 }} />)}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const ResourceManagement: React.FC = () => {
    const [resources, setResources]           = useState<Resource[]>([]);
    const [batches, setBatches]               = useState<Batch[]>([]);
    const [loading, setLoading]               = useState(true);
    const [uploading, setUploading]           = useState(false);
    const [modalVisible, setModalVisible]     = useState(false);
    const [editingResource, setEditingResource] = useState<Resource | null>(null);
    const [previewResource, setPreviewResource] = useState<Resource | null>(null);
    const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
    const [previewFullscreen, setPreviewFullscreen] = useState(false);
    const [searchText, setSearchText]         = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterBatch, setFilterBatch]       = useState<number | null>(null);
    const [dateRangeFilter, setDateRangeFilter] = useState<any>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadPhase, setUploadPhase]       = useState<'idle' | 'sending' | 'cloud' | 'done'>('idle');
    const [form] = Form.useForm();

    // Multi-file upload tracking
    const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
    const [fileTitles, setFileTitles] = useState<Record<string, string>>({});
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
    }, [filterCategory, filterBatch, apiCall]);

    const fetchBatches = useCallback(async () => {
        try { const resp = await apiCall('/batches'); if (resp.ok) setBatches(await resp.json()); } catch {}
    }, [apiCall]);

    useEffect(() => { fetchResources(); fetchBatches(); }, [fetchResources, fetchBatches]);

    const handleUpload = async (values: any) => {
        if (!selectedFiles || selectedFiles.length === 0) { message.error('Please select a file'); return; }
        setUploading(true); setUploadProgress(0); setUploadPhase('sending');
        try {
            const formData = new FormData();
            const titles: string[] = [];
            selectedFiles.forEach((f: any) => {
                formData.append('files', f.originFileObj);
                titles.push(fileTitles[f.uid] || f.name.split('.').slice(0, -1).join('.') || f.name);
            });
            formData.append('titles', JSON.stringify(titles));
            if (values.description) formData.append('description', values.description);
            if (values.batch_ids) formData.append('batch_ids', JSON.stringify(values.batch_ids));

            let serverDone = false;
            let cloudInterval: ReturnType<typeof setInterval> | null = null;

            await new Promise<void>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', `${API}/resources`);
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                xhr.upload.onloadend = () => {
                    setUploadPhase('cloud'); setUploadProgress(0);
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
                    setUploadProgress(100); setUploadPhase('done');
                    if (xhr.status >= 200 && xhr.status < 300) {
                        setTimeout(() => { message.success('Uploaded successfully!'); setModalVisible(false); form.resetFields(); fetchResources(); resolve(); }, 600);
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
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: values.title, description: values.description, batch_ids: values.batch_ids || [] }),
            });
            if (resp.ok) { message.success('Resource updated'); setEditingResource(null); setModalVisible(false); form.resetFields(); fetchResources(); }
        } catch { message.error('Update failed'); }
    };

    const handleDelete = async (id: number) => {
        try {
            const resp = await apiCall(`/resources/${id}`, { method: 'DELETE' });
            if (resp.ok) { message.success('Resource deleted'); fetchResources(); }
        } catch { message.error('Delete failed'); }
    };

    const openEdit = (r: Resource) => { setEditingResource(r); form.setFieldsValue({ title: r.title, description: r.description, batch_ids: r.batch_ids }); setModalVisible(true); };
    const openUpload = () => { 
        setEditingResource(null); 
        form.resetFields(); 
        setSelectedFiles([]);
        setFileTitles({});
        setModalVisible(true); 
    };

    const handleFileChange = ({ fileList }: any) => {
        setSelectedFiles(fileList);
        setFileTitles(prev => {
            const next = { ...prev };
            fileList.forEach((f: any) => {
                if (!next[f.uid]) next[f.uid] = f.name.split('.').slice(0, -1).join('.') || f.name;
            });
            return next;
        });
    };

    const secureDownload = async (id: number, fileName: string) => {
        try {
            const resp = await apiCall(`/resources/${id}/download?json=true`);
            if (resp.ok) {
                const contentType = resp.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const data = await resp.json();
                    if (data.url) {
                        const a = document.createElement('a');
                        a.href = data.url;
                        a.download = fileName;
                        a.target = '_blank';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        return;
                    }
                }
                const blob = await resp.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                a.click();
                URL.revokeObjectURL(url);
            } else {
                message.error('Download failed');
            }
        } catch { message.error('Download failed'); }
    };

    const openPreview = async (r: Resource) => {
        setPreviewResource(r); setPreviewBlobUrl(null);
        try {
            const resp = await apiCall(`/resources/${r.id}/preview`);
            if (resp.ok) { const blob = await resp.blob(); setPreviewBlobUrl(URL.createObjectURL(blob)); }
            else setPreviewBlobUrl('error');
        } catch { setPreviewBlobUrl('error'); }
    };

    const closePreview = () => { setPreviewBlobUrl(null); setPreviewResource(null); setPreviewFullscreen(false); };

    const filtered = resources.filter(r => {
        if (searchText && !r.title.toLowerCase().includes(searchText.toLowerCase()) && !r.file_name.toLowerCase().includes(searchText.toLowerCase())) return false;
        if (dateRangeFilter && dateRangeFilter.length === 2 && r.created_at) {
            const start = dayjs(r.created_at);
            if (start.isBefore(dateRangeFilter[0], 'day') || start.isAfter(dateRangeFilter[1], 'day')) return false;
        }
        return true;
    });

    const stats = {
        total:    resources.length,
        pdf:      resources.filter(r => r.category === 'pdf').length,
        video:    resources.filter(r => r.category === 'video').length,
        audio:    resources.filter(r => r.category === 'audio').length,
        document: resources.filter(r => r.category === 'document').length,
        image:    resources.filter(r => r.category === 'image').length,
    };

    const columns: ColumnsType<Resource> = [
        {
            title: 'Resource', key: 'resource',
            render: (_, r) => {
                const cat = CATEGORY_CONFIG[r.category] || CATEGORY_CONFIG.document;
                return (
                    <Space size={12}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: cat.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cat.color, fontSize: 18, flexShrink: 0 }}>
                            {cat.icon}
                        </div>
                        <div>
                            <Text strong style={{ display: 'block', fontSize: 13, color: '#1a1d2e' }}>{r.title}</Text>
                            <Text type="secondary" style={{ fontSize: 11 }}>{r.file_name} · {formatFileSize(r.file_size)}</Text>
                        </div>
                    </Space>
                );
            },
        },
        {
            title: 'Type', dataIndex: 'category', key: 'category', width: 100,
            render: (cat: string) => {
                const c = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.document;
                return (
                    <span style={{ background: c.accent, color: c.color, borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        {c.icon} {c.label}
                    </span>
                );
            },
        },
        {
            title: 'Batches', dataIndex: 'batch_names', key: 'batches', width: 220,
            render: (names: string) => names
                ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {names.split(',').map((n, i) => <span key={i} style={{ background: '#eef2ff', color: '#4f46e5', borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 600 }}>{n.trim()}</span>)}
                  </div>
                : <Text type="secondary">—</Text>,
        },
        {
            title: 'Storage', key: 'storage', width: 90,
            render: (_, r) => r.storage_type === 'kdrive'
                ? <span style={{ background: '#e0f2fe', color: '#0284c7', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}><CloudUploadOutlined /> Cloud</span>
                : <span style={{ background: '#f1f5f9', color: '#64748b', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>Local</span>,
        },
        {
            title: 'Date', dataIndex: 'created_at', key: 'date', width: 110,
            render: (d: string) => <Text type="secondary" style={{ fontSize: 12 }}>{dayjs(d).format('MMM DD, YYYY')}</Text>,
        },
        {
            title: 'Actions', key: 'actions', width: 160,
            render: (_, r) => (
                <Space size={4}>
                    <Tooltip title="Preview">
                        <Button size="small" icon={<EyeOutlined />} onClick={() => openPreview(r)} style={{ borderRadius: 8, borderColor: '#e0e7ff', color: '#6366f1' }} />
                    </Tooltip>
                    <Tooltip title="Download">
                        <Button size="small" icon={<DownloadOutlined />} onClick={() => secureDownload(r.id, r.file_name)} style={{ borderRadius: 8, borderColor: '#e0e7ff', color: '#6366f1' }} />
                    </Tooltip>
                    <Tooltip title="Edit">
                        <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} style={{ borderRadius: 8, borderColor: '#e0e7ff', color: '#6366f1' }} />
                    </Tooltip>
                    <Popconfirm title="Delete this resource?" onConfirm={() => handleDelete(r.id)} okText="Delete" okType="danger">
                        <Button size="small" danger icon={<DeleteOutlined />} style={{ borderRadius: 8 }} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    /* ── LOADING ── */
    if (loading) return <ResourceSkeleton />;

    /* ── LOADED ── */
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: 0 }}>

            {/* ── Header ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexShrink: 0 }}>
                <div>
                    <Title level={3} style={{ margin: 0, fontWeight: 800, color: '#1a1d2e', fontSize: 22 }}>Resources</Title>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                        Manage learning materials for your students · {stats.total} file{stats.total !== 1 ? 's' : ''}
                    </Text>
                </div>
                <Button
                    type="primary" icon={<PlusOutlined />} size="large" onClick={openUpload}
                    style={{ borderRadius: 12, height: 44, fontWeight: 700, background: 'linear-gradient(135deg, #4f46e5, #6366f1)', border: 'none', boxShadow: '0 4px 16px rgba(99,102,241,0.30)', paddingInline: 24 }}
                >
                    Upload Resource
                </Button>
            </div>

            {/* ── KPI Cards (6 — 1 row) ── */}
            <Row gutter={[12, 12]} style={{ marginBottom: 20, flexShrink: 0 }}>
                <Col xs={12} sm={8} md={4}>
                    <KpiCard label="Total" value={stats.total} icon={<FolderOutlined />} accent="#eef2ff" iconColor="#6366f1" />
                </Col>
                <Col xs={12} sm={8} md={4}>
                    <KpiCard label="PDFs" value={stats.pdf} icon={<FilePdfOutlined />} accent="#fee2e2" iconColor="#ef4444" />
                </Col>
                <Col xs={12} sm={8} md={4}>
                    <KpiCard label="Videos" value={stats.video} icon={<VideoCameraOutlined />} accent="#dbeafe" iconColor="#3b82f6" />
                </Col>
                <Col xs={12} sm={8} md={4}>
                    <KpiCard label="Audio" value={stats.audio} icon={<SoundOutlined />} accent="#ede9fe" iconColor="#8b5cf6" />
                </Col>
                <Col xs={12} sm={8} md={4}>
                    <KpiCard label="Docs" value={stats.document} icon={<FileTextOutlined />} accent="#fef3c7" iconColor="#f59e0b" />
                </Col>
                <Col xs={12} sm={8} md={4}>
                    <KpiCard label="Images" value={stats.image} icon={<PictureOutlined />} accent="#dcfce7" iconColor="#22c55e" />
                </Col>
            </Row>

            {/* ── Table card ── */}
            <div style={{
                background: '#fff', borderRadius: 16, border: '1px solid #f0f0f8',
                boxShadow: '0 2px 12px rgba(99,102,241,0.07)',
                flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden',
            }}>
                {/* Toolbar */}
                <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f8', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, flexWrap: 'wrap' as const }}>
                    <Input
                        placeholder="Search resources..."
                        prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                        allowClear value={searchText} onChange={e => setSearchText(e.target.value)}
                        style={{ width: 230, borderRadius: 10, borderColor: '#e0e7ff' }}
                    />
                    <DatePicker.RangePicker
                        onChange={setDateRangeFilter}
                        style={{ width: 250, borderRadius: 10, borderColor: '#e0e7ff' }}
                        allowClear
                    />
                    <Select
                        value={filterCategory} onChange={setFilterCategory} style={{ width: 150 }}
                        options={[{ value: 'all', label: 'All Types' }, ...Object.entries(CATEGORY_CONFIG).map(([k, v]) => ({ value: k, label: v.label }))]}
                    />
                    <Select
                        value={filterBatch ?? undefined} onChange={v => setFilterBatch(v)} allowClear
                        placeholder="All Batches" style={{ width: 170 }}
                        options={batches.map(b => ({ value: b.id, label: b.name }))}
                        onClear={() => setFilterBatch(null)}
                    />
                    <div style={{ marginLeft: 'auto' }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</Text>
                    </div>
                </div>

                {/* Table */}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                    <Table
                        columns={columns} dataSource={filtered} rowKey="id" size="small"
                        scroll={{ y: 'calc(100vh - 400px)' }}
                        pagination={{ pageSize: 20, showSizeChanger: false, showTotal: (t) => `${t} resources`, style: { padding: '10px 20px', borderTop: '1px solid #f0f0f8', margin: 0 } }}
                        rowClassName={() => 'resource-table-row'}
                        locale={{ emptyText: (
                            <div style={{ padding: '48px 0', textAlign: 'center' }}>
                                <FolderOutlined style={{ fontSize: 40, color: '#c7d2fe', display: 'block', marginBottom: 10 }} />
                                <Text type="secondary">No resources yet — upload your first one!</Text>
                            </div>
                        )}}
                    />
                </div>
            </div>

            {/* ── Premium Upload / Edit Modal ── */}
            <Modal
                title={uploading ? null : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 16, borderBottom: '1px solid #f0f0f8', marginBottom: 16 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: editingResource ? '#fef3c7' : '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: editingResource ? '#f59e0b' : '#6366f1' }}>
                            {editingResource ? <EditOutlined /> : <CloudUploadOutlined />}
                        </div>
                        <div>
                            <div style={{ fontSize: 18, fontWeight: 800, color: '#1a1d2e', letterSpacing: -0.3 }}>{editingResource ? 'Edit Resource' : 'Upload Resource'}</div>
                            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500, marginTop: 2 }}>{editingResource ? 'Update the details of your shared file' : 'Share a new learning material with your students'}</div>
                        </div>
                    </div>
                )}
                open={modalVisible}
                onCancel={() => { if (!uploading) { setModalVisible(false); setEditingResource(null); form.resetFields(); } }}
                footer={null} width={uploading ? 450 : 640} destroyOnClose
                closable={!uploading} maskClosable={!uploading}
                className="premium-upload-modal"
                styles={{ body: { padding: uploading ? '40px 32px' : '20px 32px 24px' } }}
            >
                {uploading ? (
                    <div style={{ textAlign: 'center' }}>
                        <CloudUploadOutlined style={{ fontSize: 64, color: uploadPhase === 'done' ? '#22c55e' : '#6366f1', marginBottom: 20 }} />
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
                            {uploadPhase === 'sending' ? 'Sending file...' : uploadPhase === 'cloud' ? 'Uploading to Cloud...' : '✓ Upload complete!'}
                        </div>
                        <div style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>
                            {uploadPhase === 'sending' ? 'Preparing your file for secure storage' : uploadPhase === 'cloud' ? 'Encrypting and storing securely on servers' : 'Your resource is ready and available'}
                        </div>
                        <Progress percent={uploadProgress} strokeColor={uploadPhase === 'done' ? '#22c55e' : { from: '#6366f1', to: '#8b5cf6' }} style={{ maxWidth: 320, margin: '0 auto' }} strokeWidth={8} />
                    </div>
                ) : (
                    <Form form={form} layout="vertical" onFinish={editingResource ? handleUpdate : handleUpload} requiredMark={false} size="middle">
                        <Row gutter={16}>
                            {editingResource && (
                                <Col span={24}>
                                    <Form.Item name="title" label={<Text strong style={{ fontSize: 12, color: '#4b5563' }}>Resource Title</Text>} rules={[{ required: true, message: 'Please enter a title' }]} style={{ marginBottom: 12 }}>
                                        <Input placeholder="e.g. Mastering French Grammar - Chapter 3" style={{ borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', padding: '8px 12px' }} />
                                    </Form.Item>
                                </Col>
                            )}
                            <Col span={24}>
                                <Form.Item name="description" label={<Text strong style={{ fontSize: 12, color: '#4b5563' }}>Description (Optional)</Text>} style={{ marginBottom: 12 }}>
                                    <TextArea rows={2} placeholder="Add a brief description about this material to help students..." style={{ borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', padding: '8px 12px' }} />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item name="batch_ids" label={<Text strong style={{ fontSize: 12, color: '#4b5563' }}>Assign to Batches</Text>} style={{ marginBottom: 12 }}>
                                    <Select mode="multiple" allowClear placeholder="Select batches (leave blank for all)" options={batches.map(b => ({ value: b.id, label: b.name }))} style={{ borderRadius: 8 }} />
                                </Form.Item>
                            </Col>
                        </Row>
                        {!editingResource && (
                            <>
                                <Form.Item name="file" label={<Text strong style={{ fontSize: 12, color: '#4b5563' }}>Resource Files</Text>}
                                    valuePropName="fileList" getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList}
                                    rules={[{ required: true, message: 'Please select files to upload' }]}
                                    style={{ marginBottom: 0 }}>
                                    <Upload.Dragger beforeUpload={() => false} multiple={true} onChange={handleFileChange}
                                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.mp4,.avi,.mov,.webm,.mp3,.wav,.ogg,.m4a,.jpg,.jpeg,.png,.gif,.zip"
                                        style={{ borderRadius: 12, border: '2px dashed #a5b4fc', padding: '20px 20px 16px', background: '#f8faff', transition: 'all 0.3s' }}
                                        showUploadList={false}
                                    >
                                        <p style={{ fontSize: 32, color: '#6366f1', marginBottom: 8 }}><CloudUploadOutlined /></p>
                                        <p style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Drag & drop your files here</p>
                                        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>or <span style={{ color: '#6366f1', fontWeight: 600 }}>click to browse</span></p>
                                        <div style={{ display: 'inline-block', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '3px 12px', fontSize: 10, color: '#94a3b8', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                                            Multiple Files Supported · Max 100MB Total
                                        </div>
                                    </Upload.Dragger>
                                </Form.Item>
                                
                                {selectedFiles.length > 0 && (
                                    <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 180, overflowY: 'auto', paddingRight: 4 }}>
                                        {selectedFiles.map(f => (
                                            <div key={f.uid} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f8fafc', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                                                <FileTextOutlined style={{ color: '#6366f1', fontSize: 18, alignSelf: 'flex-start', marginTop: 4 }} />
                                                <div style={{ flex: 1 }}>
                                                    <Input 
                                                        value={fileTitles[f.uid]} 
                                                        onChange={e => setFileTitles(prev => ({ ...prev, [f.uid]: e.target.value }))}
                                                        placeholder="Enter custom title"
                                                        style={{ border: '1px solid #e2e8f0', background: '#fff', padding: '4px 8px', borderRadius: 6, fontWeight: 600, color: '#1e293b', fontSize: 13 }}
                                                    />
                                                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{f.name} · {formatFileSize(f.size)}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                        <Form.Item style={{ marginBottom: 0, marginTop: 24, paddingTop: 16, borderTop: '1px solid #f0f0f8' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                                <Button onClick={() => { setModalVisible(false); setEditingResource(null); }} style={{ borderRadius: 8, height: 38, padding: '0 20px', fontWeight: 600, color: '#64748b' }}>Cancel</Button>
                                <Button type="primary" htmlType="submit" icon={editingResource ? <EditOutlined /> : <CloudUploadOutlined />}
                                    style={{ borderRadius: 8, height: 38, padding: '0 24px', fontWeight: 700, background: 'linear-gradient(135deg, #4f46e5, #6366f1)', border: 'none', boxShadow: '0 4px 14px rgba(99,102,241,0.25)' }}>
                                    {editingResource ? 'Save Changes' : 'Upload to Cloud'}
                                </Button>
                            </div>
                        </Form.Item>
                    </Form>
                )}
            </Modal>

            {/* ── Premium Preview Modal ── */}
            <Modal
                title={null}
                open={!!previewResource}
                onCancel={closePreview}
                footer={null}
                width={previewFullscreen ? '100vw' : 1000}
                centered
                closable={true}
                closeIcon={
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#fff', transition: 'all 0.2s', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'scale(1)'; }}
                    >✕</div>
                }
                wrapClassName="preview-modal"
                styles={{ body: { padding: 0, height: previewFullscreen ? '100vh' : '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' } }}
                style={{ top: previewFullscreen ? 0 : 20, maxWidth: previewFullscreen ? '100vw' : undefined, margin: previewFullscreen ? 0 : '', paddingBottom: previewFullscreen ? 0 : '' }}
            >
                {previewResource && (
                    <>
                        <div style={{ flexShrink: 0, background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: '20px 60px 20px 28px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                                    {CATEGORY_CONFIG[previewResource.category]?.icon || <FileTextOutlined />}
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ fontSize: 18, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{previewResource.title}</div>
                                    <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>{formatFileSize(previewResource.file_size)} · Shared {dayjs(previewResource.created_at).format('MMM DD, YYYY')}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <Button type="default" icon={<DownloadOutlined />} onClick={() => secureDownload(previewResource.id, previewResource.file_name)} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600 }}>Download</Button>
                                <Button type="text" icon={previewFullscreen ? <CompressOutlined /> : <ExpandOutlined />} onClick={() => setPreviewFullscreen(!previewFullscreen)} style={{ color: '#fff', background: 'rgba(255,255,255,0.1)', borderRadius: 8 }} />
                            </div>
                        </div>

                        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#f8fafc', position: 'relative' }}>
                            {!previewBlobUrl ? (
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Skeleton active paragraph={{ rows: 6 }} style={{ width: '60%' }} /></div>
                            ) : previewBlobUrl === 'error' ? (
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Empty description="Could not load preview" /></div>
                            ) : (
                                <div style={{
                                    flex: 1,
                                    width: '100%',
                                    height: '100%',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: previewResource.category === 'pdf' ? 'stretch' : 'center',
                                    justifyContent: previewResource.category === 'pdf' ? 'flex-start' : 'center',
                                }}>
                                    {previewResource.category === 'pdf' && (
                                        <PdfViewer src={previewBlobUrl} />
                                    )}
                                    {previewResource.category === 'video' && (
                                        <video controls style={{ maxWidth: '100%', maxHeight: '100%', background: '#000', outline: 'none' }} src={previewBlobUrl} />
                                    )}
                                    {previewResource.category === 'audio' && (
                                        <div style={{ padding: 48, textAlign: 'center', width: '100%', maxWidth: 500 }}>
                                            <div style={{ width: 120, height: 120, borderRadius: '50%', background: '#ede9fe', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, margin: '0 auto 30px', boxShadow: '0 10px 25px rgba(139,92,246,0.2)' }}>
                                                <SoundOutlined />
                                            </div>
                                            <audio controls style={{ width: '100%', height: 50 }} src={previewBlobUrl} />
                                        </div>
                                    )}
                                    {previewResource.category === 'image' && (
                                        <img src={previewBlobUrl} alt={previewResource.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                    )}
                                    {previewResource.category === 'document' && (
                                        <div style={{ padding: 60, textAlign: 'center' }}>
                                            <DesktopOutlined style={{ fontSize: 64, color: '#94a3b8', marginBottom: 20 }} />
                                            <div style={{ fontSize: 16, fontWeight: 600, color: '#1a1d2e', marginBottom: 8 }}>Preview not supported for this file type</div>
                                            <div style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>Please download the file to view its contents.</div>
                                            <Button type="primary" size="large" icon={<DownloadOutlined />} onClick={() => secureDownload(previewResource.id, previewResource.file_name)} style={{ borderRadius: 8 }}>Download File</Button>
                                        </div>
                                    )}
                                </div>
                            )}
                            {previewResource.description && (
                                <div style={{ flexShrink: 0, padding: '16px 24px', background: '#fff', borderTop: '1px solid #f1f5f9', fontSize: 13, color: '#4b5563', lineHeight: 1.5 }}>
                                    <span style={{ fontWeight: 700, color: '#1a1d2e', marginRight: 8 }}>Description:</span>{previewResource.description}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </Modal>

            <style>{`
                .resource-table-row:hover td { background: #f8f7ff !important; }
                .ant-table-thead > tr > th {
                    background: #fafafa !important;
                    font-weight: 700 !important;
                    color: #4b5563 !important;
                    font-size: 11px !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.5px !important;
                }
                .ant-table-cell { border-bottom: 1px solid #f5f5fc !important; }
                
                .preview-modal .ant-modal-close { top: 12px !important; right: 12px !important; width: auto !important; height: auto !important; z-index: 10 !important; }
                .preview-modal .ant-modal-close-x { width: auto !important; height: auto !important; line-height: 1 !important; }
                .preview-modal .ant-modal-header { display: none !important; }
                .preview-modal .ant-modal-content { border-radius: ${previewFullscreen ? '0' : '16px'} !important; overflow: hidden !important; padding: 0 !important; }

                /* Premium Upload Modal Overrides */
                .premium-upload-modal .ant-modal-content {
                    border-radius: 24px !important;
                    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25) !important;
                    padding: 0 !important;
                }
                .premium-upload-modal .ant-modal-header { display: none !important; }
                .premium-upload-modal .ant-modal-close { top: 20px !important; right: 20px !important; }
                .premium-upload-modal .ant-select-selector { border-radius: 12px !important; border: 1px solid #e2e8f0 !important; background: #f8fafc !important; }
                
                .ant-upload-drag-hover { border-color: #6366f1 !important; background: #eef2ff !important; }
            `}</style>
        </div>
    );
};

export default ResourceManagement;
