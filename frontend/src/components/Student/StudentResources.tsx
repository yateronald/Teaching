import React, { useState, useEffect, useCallback } from 'react';
import {
    Card, Typography, Tag, Space, Input, Select, Row, Col, Statistic, Empty,
    Button, Modal, Tooltip, Spin
} from 'antd';
import {
    DownloadOutlined, EyeOutlined, SearchOutlined, FolderOutlined,
    FilePdfOutlined, VideoCameraOutlined, SoundOutlined, PictureOutlined,
    FileTextOutlined, ExpandOutlined, CompressOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface Resource {
    id: number;
    title: string;
    description: string;
    file_name: string;
    file_type: string;
    file_size: number;
    batch_id: number;
    batch_name?: string;
    teacher_first_name?: string;
    teacher_last_name?: string;
    category: string;
    storage_type: string;
    created_at: string;
}

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

const StudentResources: React.FC = () => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [catFilter, setCatFilter] = useState('all');
    const [batchFilter, setBatchFilter] = useState<number | null>(null);
    const [preview, setPreview] = useState<Resource | null>(null);
    const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
    const [previewFullscreen, setPreviewFullscreen] = useState(false);
    const { apiCall, token } = useAuth();
    const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

    const fetchResources = useCallback(async () => {
        setLoading(true);
        try {
            const p = new URLSearchParams();
            if (catFilter !== 'all') p.set('category', catFilter);
            if (batchFilter) p.set('batch_id', String(batchFilter));
            const resp = await apiCall(`/resources?${p}`);
            if (resp.ok) setResources(await resp.json());
        } catch {} finally { setLoading(false); }
    }, [catFilter, batchFilter]);

    useEffect(() => { fetchResources(); }, [fetchResources]);

    /** Securely download via token in URL */
    const secureDownload = (id: number, fileName: string) => {
        const url = `${API}/resources/${id}/download?token=${token}`;
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
    };

    /** Open preview with secure streaming URL */
    const openPreview = (r: Resource) => {
        setPreview(r);
        setPreviewBlobUrl(`${API}/resources/${r.id}/preview?token=${token}`);
    };

    const closePreview = () => {
        setPreviewBlobUrl(null);
        setPreview(null);
        setPreviewFullscreen(false);
    };

    const filtered = resources.filter(r => {
        if (search && !r.title.toLowerCase().includes(search.toLowerCase()) && !r.file_name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const batches = [...new Map(resources.filter(r => r.batch_id && r.batch_name).map(r => [r.batch_id, r.batch_name])).entries()]
        .map(([id, name]) => ({ id, name }));

    const stats = {
        total: resources.length,
        pdf: resources.filter(r => r.category === 'pdf').length,
        video: resources.filter(r => r.category === 'video').length,
        audio: resources.filter(r => r.category === 'audio').length,
        document: resources.filter(r => r.category === 'document').length,
        image: resources.filter(r => r.category === 'image').length,
    };

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <Title level={3} style={{ margin: 0, fontWeight: 700 }}>My Resources</Title>
                <Text type="secondary">Learning materials shared by your teachers</Text>
            </div>

            {/* Stats */}
            <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
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
                                valueStyle={{ fontSize: 22, fontWeight: 700 }} />
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Filters */}
            <Card size="small" style={{ borderRadius: 12, border: 'none', boxShadow: '0 1px 8px rgba(0,0,0,0.04)', marginBottom: 20 }}>
                <Space wrap size="middle">
                    <Input placeholder="Search..." prefix={<SearchOutlined />} allowClear
                        value={search} onChange={e => setSearch(e.target.value)} style={{ width: 220, borderRadius: 8 }} />
                    <Select value={catFilter} onChange={setCatFilter} style={{ width: 130 }}
                        options={[{ value: 'all', label: 'All Types' }, ...Object.entries(CAT).map(([k, v]) => ({ value: k, label: v.label }))]} />
                    <Select value={batchFilter} onChange={setBatchFilter} allowClear placeholder="All Batches" style={{ width: 160 }}
                        options={batches.map(b => ({ value: b.id, label: b.name }))} />
                </Space>
            </Card>

            {/* Resources List */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>
            ) : filtered.length === 0 ? (
                <Empty description="No resources available" style={{ padding: 60 }} />
            ) : (
                <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}
                    styles={{ body: { padding: 0 } }}>
                    {filtered.map((r, idx) => {
                        const cat = CAT[r.category] || CAT.document;
                        return (
                            <div key={r.id}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 14,
                                    padding: '14px 20px',
                                    borderBottom: idx < filtered.length - 1 ? '1px solid #f0f0f0' : 'none',
                                    cursor: 'pointer',
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = '#fafbfc')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                onClick={() => openPreview(r)}
                            >
                                {/* Icon */}
                                <div style={{
                                    width: 40, height: 40, borderRadius: 10, background: cat.bg,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 18, color: cat.color, flexShrink: 0,
                                }}>
                                    {cat.icon}
                                </div>

                                {/* Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <Text strong style={{ fontSize: 14, display: 'block', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {r.title}
                                    </Text>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        {r.file_name} · {fmtSize(r.file_size)}
                                    </Text>
                                </div>

                                {/* Tags */}
                                <Space size={4} style={{ flexShrink: 0 }}>
                                    <Tag color={cat.color} style={{ borderRadius: 6, fontSize: 11, margin: 0 }}>{cat.label}</Tag>
                                    {r.batch_name && <Tag color="blue" style={{ borderRadius: 6, fontSize: 11, margin: 0 }}>{r.batch_name}</Tag>}
                                </Space>

                                {/* Date + Teacher */}
                                <Text type="secondary" style={{ fontSize: 11, flexShrink: 0, width: 80, textAlign: 'right' }}>
                                    {dayjs(r.created_at).format('MMM DD')}
                                </Text>

                                {/* Actions */}
                                <Space size={2} style={{ flexShrink: 0 }}>
                                    <Tooltip title="Preview">
                                        <Button size="small" type="text" icon={<EyeOutlined />}
                                            onClick={(e) => { e.stopPropagation(); openPreview(r); }} />
                                    </Tooltip>
                                    <Tooltip title="Download">
                                        <Button size="small" type="text" icon={<DownloadOutlined />}
                                            onClick={(e) => { e.stopPropagation(); secureDownload(r.id, r.file_name); }} />
                                    </Tooltip>
                                </Space>
                            </div>
                        );
                    })}
                </Card>
            )}

            {/* Preview Modal */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 32 }}>
                        <span>{preview?.title || 'Preview'}</span>
                        <Tooltip title={previewFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
                            <Button type="text" size="small" icon={previewFullscreen ? <CompressOutlined /> : <ExpandOutlined />}
                                onClick={() => setPreviewFullscreen(f => !f)} />
                        </Tooltip>
                    </div>
                }
                open={!!preview}
                onCancel={closePreview}
                width={previewFullscreen ? '100vw' : 900}
                style={previewFullscreen ? { top: 0, maxWidth: '100vw', paddingBottom: 0 } : undefined}
                footer={[
                    <Button key="dl" icon={<DownloadOutlined />} onClick={() => preview && secureDownload(preview.id, preview.file_name)}>
                        Download
                    </Button>,
                    <Button key="close" type="primary" onClick={closePreview}>Close</Button>,
                ]}
                styles={{ body: { padding: 0, minHeight: previewFullscreen ? 'calc(100vh - 120px)' : 400 } }}
            >
                {preview && !previewBlobUrl && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: previewFullscreen ? 'calc(100vh - 120px)' : 400 }}>
                        <Spin size="large" />
                    </div>
                )}
                {preview && previewBlobUrl && (
                    <div style={{ width: '100%' }}>
                        {preview.category === 'pdf' && (
                            <iframe src={previewBlobUrl} style={{ width: '100%', height: previewFullscreen ? 'calc(100vh - 120px)' : 600, border: 'none' }} title="PDF" />
                        )}
                        {preview.category === 'video' && (
                            <video controls style={{ width: '100%', maxHeight: previewFullscreen ? 'calc(100vh - 120px)' : 500 }} src={previewBlobUrl} />
                        )}
                        {preview.category === 'audio' && (
                            <div style={{ padding: 48, textAlign: 'center' }}>
                                <SoundOutlined style={{ fontSize: 56, color: '#9b59b6', marginBottom: 20 }} />
                                <div><Text strong style={{ fontSize: 16 }}>{preview.file_name}</Text></div>
                                <audio controls style={{ marginTop: 20, width: '80%' }} src={previewBlobUrl} />
                            </div>
                        )}
                        {preview.category === 'image' && (
                            <img src={previewBlobUrl} alt={preview.title}
                                style={{ width: '100%', objectFit: 'contain', maxHeight: 600 }} />
                        )}
                        {preview.category === 'document' && (
                            <div style={{ padding: 60, textAlign: 'center' }}>
                                <FileTextOutlined style={{ fontSize: 56, color: '#f39c12', marginBottom: 16 }} />
                                <div><Text strong style={{ fontSize: 16 }}>{preview.file_name}</Text></div>
                                <Text type="secondary">{fmtSize(preview.file_size)}</Text>
                                <div style={{ marginTop: 20 }}>
                                    <Text type="secondary">Preview not available. Please download the file.</Text>
                                </div>
                            </div>
                        )}
                        {preview.description && (
                            <div style={{ padding: '16px 24px', borderTop: '1px solid #f0f0f0' }}>
                                <Text type="secondary" style={{ fontSize: 13 }}>{preview.description}</Text>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default StudentResources;
