import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Card, Row, Col, Statistic, Table, Select, Input, Space, Typography, Tag,
    Button, Modal, Tooltip, Spin, Empty, Progress, message
} from 'antd';
import {
    FolderOutlined, FilePdfOutlined, VideoCameraOutlined, SoundOutlined, PictureOutlined,
    FileTextOutlined, CloudOutlined, SearchOutlined, EyeOutlined, DownloadOutlined,
    TeamOutlined, BookOutlined, DatabaseOutlined, ExpandOutlined, CompressOutlined,
    CloseCircleOutlined, CloudUploadOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface Resource {
    id: number; title: string; description: string; file_name: string; file_type: string;
    file_size: number; batch_id: number; batch_name?: string; teacher_id: number;
    teacher_first_name?: string; teacher_last_name?: string; category: string;
    storage_type: string; created_at: string;
}
interface Batch { id: number; name: string; }
interface Teacher { id: number; first_name: string; last_name: string; }

const CAT: Record<string, { icon: React.ReactNode; color: string; label: string; bg: string }> = {
    pdf: { icon: <FilePdfOutlined />, color: '#e74c3c', label: 'PDF', bg: '#fde8e8' },
    video: { icon: <VideoCameraOutlined />, color: '#3498db', label: 'Video', bg: '#dbeafe' },
    audio: { icon: <SoundOutlined />, color: '#9b59b6', label: 'Audio', bg: '#ede9fe' },
    image: { icon: <PictureOutlined />, color: '#2ecc71', label: 'Image', bg: '#d1fae5' },
    document: { icon: <FileTextOutlined />, color: '#f39c12', label: 'Document', bg: '#fef3c7' },
};

function fmtSize(b: number) {
    if (!b) return '0 B';
    const k = 1024, s = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return parseFloat((b / Math.pow(k, i)).toFixed(1)) + ' ' + s[i];
}

const AdminResources: React.FC = () => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [previewResource, setPreviewResource] = useState<Resource | null>(null);
    const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
    const [fullscreen, setFullscreen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterBatch, setFilterBatch] = useState<number | null>(null);
    const [filterTeacher, setFilterTeacher] = useState<number | null>(null);
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

    const fetchTeachers = useCallback(async () => {
        try {
            const resp = await apiCall('/users?role=teacher');
            if (resp.ok) {
                const data = await resp.json();
                setTeachers(Array.isArray(data) ? data : data.users || []);
            }
        } catch {}
    }, []);

    useEffect(() => { fetchResources(); fetchBatches(); fetchTeachers(); }, [fetchResources, fetchBatches, fetchTeachers]);

    const secureDownload = async (id: number, fileName: string) => {
        try {
            const resp = await fetch(`${API}/resources/${id}/download`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!resp.ok) throw new Error('Download failed');
            const blob = await resp.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = fileName; a.click();
            setTimeout(() => URL.revokeObjectURL(url), 5000);
        } catch { message.error('Download failed'); }
    };

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
            message.error('Failed to load preview');
            setPreviewBlobUrl('error');
        }
    };

    const closePreview = () => {
        if (previewBlobUrl && previewBlobUrl !== 'error') URL.revokeObjectURL(previewBlobUrl);
        setPreviewBlobUrl(null);
        setPreviewResource(null);
        setFullscreen(false);
    };

    // Filtered resources
    const filtered = useMemo(() => resources.filter(r => {
        if (searchText && !r.title.toLowerCase().includes(searchText.toLowerCase()) && !r.file_name.toLowerCase().includes(searchText.toLowerCase())) return false;
        if (filterTeacher && r.teacher_id !== filterTeacher) return false;
        return true;
    }), [resources, searchText, filterTeacher]);

    // Stats
    const totalStorage = resources.reduce((s, r) => s + (r.file_size || 0), 0);
    const cloudCount = resources.filter(r => r.storage_type === 'kdrive').length;
    const localCount = resources.length - cloudCount;

    // Insights
    const teacherStats = useMemo(() => {
        const map: Record<number, { name: string; count: number; size: number }> = {};
        resources.forEach(r => {
            const tid = r.teacher_id;
            if (!map[tid]) map[tid] = { name: `${r.teacher_first_name || ''} ${r.teacher_last_name || ''}`.trim() || `Teacher #${tid}`, count: 0, size: 0 };
            map[tid].count++; map[tid].size += r.file_size || 0;
        });
        return Object.values(map).sort((a, b) => b.count - a.count);
    }, [resources]);

    const batchStats = useMemo(() => {
        const map: Record<number, { name: string; count: number }> = {};
        resources.forEach(r => {
            if (!r.batch_id) return;
            if (!map[r.batch_id]) map[r.batch_id] = { name: r.batch_name || `Batch #${r.batch_id}`, count: 0 };
            map[r.batch_id].count++;
        });
        return Object.values(map).sort((a, b) => b.count - a.count);
    }, [resources]);

    const typeStats = useMemo(() => {
        const counts: Record<string, number> = {};
        resources.forEach(r => { counts[r.category] = (counts[r.category] || 0) + 1; });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]);
    }, [resources]);

    const columns: ColumnsType<Resource> = [
        {
            title: 'Resource', key: 'resource',
            render: (_, r) => {
                const cat = CAT[r.category] || CAT.document;
                return (
                    <Space>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cat.color, fontSize: 18 }}>
                            {cat.icon}
                        </div>
                        <div>
                            <Text strong style={{ display: 'block', fontSize: 14 }}>{r.title}</Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>{r.file_name} · {fmtSize(r.file_size)}</Text>
                        </div>
                    </Space>
                );
            },
        },
        {
            title: 'Type', dataIndex: 'category', key: 'category', width: 100,
            render: (cat: string) => {
                const c = CAT[cat] || CAT.document;
                return <Tag color={c.color} style={{ borderRadius: 6 }}>{c.icon} {c.label}</Tag>;
            },
        },
        {
            title: 'Teacher', key: 'teacher', width: 150,
            render: (_, r) => r.teacher_first_name ? <Text>{r.teacher_first_name} {r.teacher_last_name}</Text> : <Text type="secondary">—</Text>,
        },
        {
            title: 'Batch', dataIndex: 'batch_name', key: 'batch', width: 140,
            render: (name: string) => name ? <Tag color="blue">{name}</Tag> : <Text type="secondary">—</Text>,
        },
        {
            title: 'Storage', key: 'storage', width: 90,
            render: (_, r) => r.storage_type === 'kdrive'
                ? <Tag color="cyan" icon={<CloudUploadOutlined />}>Cloud</Tag>
                : <Tag>Local</Tag>,
        },
        {
            title: 'Date', dataIndex: 'created_at', key: 'date', width: 120,
            render: (d: string) => dayjs(d).format('MMM DD, YYYY'),
            sorter: (a, b) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
            defaultSortOrder: 'descend',
        },
        {
            title: 'Actions', key: 'actions', width: 100,
            render: (_, r) => (
                <Space size="small">
                    <Tooltip title="Preview"><Button size="small" icon={<EyeOutlined />} onClick={() => openPreview(r)} /></Tooltip>
                    <Tooltip title="Download"><Button size="small" icon={<DownloadOutlined />} onClick={() => secureDownload(r.id, r.file_name)} /></Tooltip>
                </Space>
            ),
        },
    ];

    const maxTeacherCount = teacherStats.length ? teacherStats[0].count : 1;
    const maxBatchCount = batchStats.length ? batchStats[0].count : 1;

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <Title level={3} style={{ margin: 0, fontWeight: 700 }}>📁 Resource Dashboard</Title>
                <Text type="secondary">Overview of all learning resources across the platform</Text>
            </div>

            {/* Stats Row */}
            <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
                {[
                    { label: 'Total Resources', value: resources.length, icon: <FolderOutlined />, color: '#1a56db' },
                    { label: 'Storage Used', value: fmtSize(totalStorage), icon: <DatabaseOutlined />, color: '#7c3aed' },
                    { label: 'Cloud Files', value: cloudCount, icon: <CloudOutlined />, color: '#0891b2' },
                    { label: 'Local Files', value: localCount, icon: <DatabaseOutlined />, color: '#64748b' },
                    ...Object.entries(CAT).map(([k, v]) => ({
                        label: v.label, value: resources.filter(r => r.category === k).length, icon: v.icon, color: v.color,
                    })),
                ].map((s, i) => (
                    <Col xs={12} sm={8} md={6} lg={4} xl={3} key={i}>
                        <Card size="small" style={{ borderRadius: 12, border: 'none', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                            <Statistic title={<span style={{ fontSize: 12 }}>{s.label}</span>}
                                value={typeof s.value === 'string' ? undefined : s.value}
                                formatter={typeof s.value === 'string' ? () => s.value : undefined}
                                prefix={<span style={{ color: s.color }}>{s.icon}</span>}
                                valueStyle={{ fontSize: 20, fontWeight: 700 }} />
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Insights Section */}
            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                {/* Resources per Teacher */}
                <Col xs={24} md={12}>
                    <Card title={<span><TeamOutlined style={{ color: '#1a56db', marginRight: 8 }} />Resources per Teacher</span>}
                        size="small" style={{ borderRadius: 12, border: 'none', boxShadow: '0 1px 8px rgba(0,0,0,0.04)', height: '100%' }}>
                        {teacherStats.length === 0 ? <Empty description="No data" /> : teacherStats.slice(0, 8).map((t, i) => (
                            <div key={i} style={{ marginBottom: 10 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                                    <Text style={{ fontSize: 13 }}>{t.name}</Text>
                                    <Text type="secondary" style={{ fontSize: 12 }}>{t.count} files · {fmtSize(t.size)}</Text>
                                </div>
                                <Progress percent={Math.round((t.count / maxTeacherCount) * 100)} showInfo={false}
                                    strokeColor="#1a56db" size="small" />
                            </div>
                        ))}
                    </Card>
                </Col>

                {/* Resources per Batch */}
                <Col xs={24} md={12}>
                    <Card title={<span><BookOutlined style={{ color: '#7c3aed', marginRight: 8 }} />Resources per Batch</span>}
                        size="small" style={{ borderRadius: 12, border: 'none', boxShadow: '0 1px 8px rgba(0,0,0,0.04)', height: '100%' }}>
                        {batchStats.length === 0 ? <Empty description="No data" /> : batchStats.slice(0, 8).map((b, i) => (
                            <div key={i} style={{ marginBottom: 10 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                                    <Text style={{ fontSize: 13 }}>{b.name}</Text>
                                    <Text type="secondary" style={{ fontSize: 12 }}>{b.count} files</Text>
                                </div>
                                <Progress percent={Math.round((b.count / maxBatchCount) * 100)} showInfo={false}
                                    strokeColor="#7c3aed" size="small" />
                            </div>
                        ))}
                    </Card>
                </Col>

                {/* File Type Distribution */}
                <Col xs={24} md={12}>
                    <Card title={<span><FolderOutlined style={{ color: '#0891b2', marginRight: 8 }} />File Type Distribution</span>}
                        size="small" style={{ borderRadius: 12, border: 'none', boxShadow: '0 1px 8px rgba(0,0,0,0.04)', height: '100%' }}>
                        {typeStats.length === 0 ? <Empty description="No data" /> : typeStats.map(([cat, count], i) => {
                            const c = CAT[cat] || CAT.document;
                            const pct = resources.length ? Math.round((count / resources.length) * 100) : 0;
                            return (
                                <div key={i} style={{ marginBottom: 10 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                                        <Space size={6}><span style={{ color: c.color }}>{c.icon}</span><Text style={{ fontSize: 13 }}>{c.label}</Text></Space>
                                        <Text type="secondary" style={{ fontSize: 12 }}>{count} ({pct}%)</Text>
                                    </div>
                                    <Progress percent={pct} showInfo={false} strokeColor={c.color} size="small" />
                                </div>
                            );
                        })}
                    </Card>
                </Col>

                {/* Storage per Teacher */}
                <Col xs={24} md={12}>
                    <Card title={<span><DatabaseOutlined style={{ color: '#f39c12', marginRight: 8 }} />Storage per Teacher</span>}
                        size="small" style={{ borderRadius: 12, border: 'none', boxShadow: '0 1px 8px rgba(0,0,0,0.04)', height: '100%' }}>
                        {teacherStats.length === 0 ? <Empty description="No data" /> : teacherStats.slice(0, 8).map((t, i) => {
                            const maxSize = teacherStats[0].size || 1;
                            return (
                                <div key={i} style={{ marginBottom: 10 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                                        <Text style={{ fontSize: 13 }}>{t.name}</Text>
                                        <Text type="secondary" style={{ fontSize: 12 }}>{fmtSize(t.size)}</Text>
                                    </div>
                                    <Progress percent={Math.round((t.size / maxSize) * 100)} showInfo={false}
                                        strokeColor="#f39c12" size="small" />
                                </div>
                            );
                        })}
                    </Card>
                </Col>
            </Row>

            {/* Filter Bar */}
            <Card size="small" style={{ borderRadius: 12, border: 'none', boxShadow: '0 1px 8px rgba(0,0,0,0.04)', marginBottom: 16 }}>
                <Space wrap size="middle">
                    <Input placeholder="Search resources..." prefix={<SearchOutlined />} allowClear
                        value={searchText} onChange={e => setSearchText(e.target.value)}
                        style={{ width: 240, borderRadius: 8 }} />
                    <Select value={filterCategory} onChange={setFilterCategory} style={{ width: 140 }}
                        options={[{ value: 'all', label: 'All Types' }, ...Object.entries(CAT).map(([k, v]) => ({ value: k, label: v.label }))]} />
                    <Select value={filterTeacher} onChange={setFilterTeacher} allowClear placeholder="All Teachers" style={{ width: 180 }}
                        options={teachers.map(t => ({ value: t.id, label: `${t.first_name} ${t.last_name}` }))} />
                    <Select value={filterBatch} onChange={setFilterBatch} allowClear placeholder="All Batches" style={{ width: 160 }}
                        options={batches.map(b => ({ value: b.id, label: b.name }))} />
                </Space>
            </Card>

            {/* Resource Table */}
            <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                <Table columns={columns} dataSource={filtered} rowKey="id" loading={loading}
                    pagination={{ pageSize: 15, showSizeChanger: true, showTotal: (t) => `${t} resources` }}
                    locale={{ emptyText: <Empty description="No resources found" /> }} />
            </Card>

            {/* Preview Modal */}
            <Modal
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: 24 }}>
                        <span>{previewResource?.title || 'Preview'}</span>
                        <Button size="small" icon={fullscreen ? <CompressOutlined /> : <ExpandOutlined />}
                            onClick={() => setFullscreen(!fullscreen)} style={{ marginRight: 8 }} />
                    </div>
                }
                open={!!previewResource}
                onCancel={closePreview}
                width={fullscreen ? '100vw' : 900}
                style={fullscreen ? { top: 0, maxWidth: '100vw', paddingBottom: 0 } : undefined}
                styles={{ body: { padding: 0, minHeight: fullscreen ? 'calc(100vh - 110px)' : 500 } }}
                footer={[
                    <Button key="download" icon={<DownloadOutlined />} onClick={() => {
                        if (previewResource) secureDownload(previewResource.id, previewResource.file_name);
                    }}>Download</Button>,
                    <Button key="close" type="primary" onClick={closePreview}>Close</Button>,
                ]}
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
                        <Text type="secondary">This file may not be accessible from this server. Try downloading instead.</Text>
                    </div>
                )}
                {previewResource && previewBlobUrl && previewBlobUrl !== 'error' && (
                    <div style={{ width: '100%', minHeight: fullscreen ? 'calc(100vh - 110px)' : 500 }}>
                        {previewResource.category === 'pdf' && (
                            <iframe src={previewBlobUrl} style={{ width: '100%', height: fullscreen ? 'calc(100vh - 110px)' : 600, border: 'none' }} title="PDF Preview" />
                        )}
                        {previewResource.category === 'video' && (
                            <video controls style={{ width: '100%', maxHeight: fullscreen ? 'calc(100vh - 110px)' : 500 }} src={previewBlobUrl} />
                        )}
                        {previewResource.category === 'audio' && (
                            <div style={{ padding: 40, textAlign: 'center' }}>
                                <SoundOutlined style={{ fontSize: 64, color: '#9b59b6', marginBottom: 24 }} />
                                <div><Text strong style={{ fontSize: 18 }}>{previewResource.file_name}</Text></div>
                                <audio controls style={{ marginTop: 24, width: '80%' }} src={previewBlobUrl} />
                            </div>
                        )}
                        {previewResource.category === 'image' && (
                            <img src={previewBlobUrl} alt={previewResource.title} style={{ width: '100%', objectFit: 'contain', maxHeight: fullscreen ? 'calc(100vh - 110px)' : 600 }} />
                        )}
                        {previewResource.category === 'document' && (
                            <div style={{ padding: 60, textAlign: 'center' }}>
                                <FileTextOutlined style={{ fontSize: 64, color: '#f39c12', marginBottom: 16 }} />
                                <div><Text strong style={{ fontSize: 18 }}>{previewResource.file_name}</Text></div>
                                <Text type="secondary">{fmtSize(previewResource.file_size)}</Text>
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

export default AdminResources;
