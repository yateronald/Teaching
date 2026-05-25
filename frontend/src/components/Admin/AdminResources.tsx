import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Table, Select, Input, Space, Typography,
    Button, Modal, Empty, Progress, message, Skeleton, DatePicker
} from 'antd';
import {
    FolderOutlined, FilePdfOutlined, VideoCameraOutlined, SoundOutlined, PictureOutlined,
    FileTextOutlined, CloudOutlined, SearchOutlined, EyeOutlined, DownloadOutlined,
    TeamOutlined, BookOutlined, DatabaseOutlined, ExpandOutlined, CompressOutlined,
    CloudUploadOutlined, DesktopOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import PdfViewer from '../Common/PdfViewer';

const { Text } = Typography;

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
    const [dateRangeFilter, setDateRangeFilter] = useState<any>(null);
    const { apiCall } = useAuth();

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
        setPreviewResource(r);
        setPreviewBlobUrl(null);
        try {
            const resp = await apiCall(`/resources/${r.id}/preview`);
            if (resp.ok) {
                const blob = await resp.blob();
                setPreviewBlobUrl(URL.createObjectURL(blob));
            } else {
                setPreviewBlobUrl('error');
            }
        } catch {
            setPreviewBlobUrl('error');
        }
    };

    const closePreview = () => {
        setPreviewBlobUrl(null);
        setPreviewResource(null);
        setFullscreen(false);
    };

    // Filtered resources
    const filtered = useMemo(() => resources.filter(r => {
        if (searchText && !r.title.toLowerCase().includes(searchText.toLowerCase()) && !r.file_name.toLowerCase().includes(searchText.toLowerCase())) return false;
        if (filterTeacher && r.teacher_id !== filterTeacher) return false;
        if (dateRangeFilter && dateRangeFilter.length === 2 && r.created_at) {
            const start = dayjs(r.created_at);
            if (start.isBefore(dateRangeFilter[0], 'day') || start.isAfter(dateRangeFilter[1], 'day')) return false;
        }
        return true;
    }), [resources, searchText, filterTeacher, dateRangeFilter]);

    // Stats (Based on filtered so dashboard is globally dynamic)
    const totalStorage = filtered.reduce((s, r) => s + (r.file_size || 0), 0);
    const cloudCount = filtered.filter(r => r.storage_type === 'kdrive').length;
    const localCount = filtered.length - cloudCount;

    // Insights
    const teacherStats = useMemo(() => {
        const map: Record<number, { name: string; count: number; size: number }> = {};
        filtered.forEach(r => {
            const tid = r.teacher_id;
            if (!map[tid]) map[tid] = { name: `${r.teacher_first_name || ''} ${r.teacher_last_name || ''}`.trim() || `Teacher #${tid}`, count: 0, size: 0 };
            map[tid].count++; map[tid].size += r.file_size || 0;
        });
        return Object.values(map).sort((a, b) => b.count - a.count);
    }, [filtered]);

    const batchStats = useMemo(() => {
        const map: Record<number, { name: string; count: number }> = {};
        filtered.forEach(r => {
            if (!r.batch_id) return;
            if (!map[r.batch_id]) map[r.batch_id] = { name: r.batch_name || `Batch #${r.batch_id}`, count: 0 };
            map[r.batch_id].count++;
        });
        return Object.values(map).sort((a, b) => b.count - a.count);
    }, [filtered]);

    const typeStats = useMemo(() => {
        const counts: Record<string, number> = {};
        filtered.forEach(r => { counts[r.category] = (counts[r.category] || 0) + 1; });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]);
    }, [filtered]);

    const columns: ColumnsType<Resource> = [
        {
            title: 'Resource', key: 'resource',
            width: 250,
            fixed: 'left',
            render: (_, r) => {
                const cat = CAT[r.category] || CAT.document;
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ 
                            width: 38, height: 38, borderRadius: 10, background: cat.bg, 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            color: cat.color, fontSize: 16, flexShrink: 0,
                            boxShadow: `0 2px 8px ${cat.color}20` 
                        }}>
                            {cat.icon}
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 13, lineHeight: 1.3 }}>{r.title}</div>
                            <div style={{ fontSize: 11, color: '#94a3b8' }}>{r.file_name} · {fmtSize(r.file_size)}</div>
                        </div>
                    </div>
                );
            },
        },
        {
            title: 'Type', dataIndex: 'category', key: 'category', width: 100,
            render: (cat: string) => {
                const c = CAT[cat] || CAT.document;
                return (
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                        background: c.bg, color: c.color, border: `1px solid ${c.color}30`,
                    }}>
                        {c.icon} {c.label}
                    </span>
                );
            },
        },
        {
            title: 'Teacher', key: 'teacher', width: 150,
            render: (_, r) => {
                const name = r.teacher_first_name ? `${r.teacher_first_name} ${r.teacher_last_name}` : '';
                if (!name) return <Text type="secondary">—</Text>;
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                            width: 24, height: 24, borderRadius: '50%',
                            background: '#f1f5f9', color: '#64748b',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 10, fontWeight: 700, border: '1px solid #e2e8f0'
                        }}>
                            {`${name.split(' ')[0]?.[0] || ''}${name.split(' ')[1]?.[0] || ''}`.toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, color: '#475569', fontSize: 12 }}>{name}</span>
                    </div>
                );
            }
        },
        {
            title: 'Batch', dataIndex: 'batch_name', key: 'batch', width: 140,
            render: (name: string) => name ? (
                <span style={{
                    display: 'inline-block', padding: '2px 10px', borderRadius: 8,
                    fontSize: 11, fontWeight: 700, color: '#3b82f6', background: '#eff6ff',
                }}>
                    {name}
                </span>
            ) : <Text type="secondary">—</Text>,
        },
        {
            title: 'Storage', key: 'storage', width: 100,
            render: (_, r) => r.storage_type === 'kdrive'
                ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, color: '#0891b2', background: '#cffafe', border: '1px solid #a5f3fc' }}><CloudUploadOutlined /> Cloud</span>
                : <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0' }}>Local</span>,
        },
        {
            title: 'Date', dataIndex: 'created_at', key: 'date', width: 120,
            render: (d: string) => <span style={{ color: '#64748b', fontSize: 12 }}>{dayjs(d).format('MMM DD, YYYY')}</span>,
            sorter: (a, b) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
            defaultSortOrder: 'descend',
        },
        {
            title: 'Actions', key: 'actions', width: 100, fixed: 'right',
            render: (_, r) => (
                <Space size="small">
                    <Button type="text" size="small" icon={<EyeOutlined />} 
                        onClick={() => openPreview(r)}
                        style={{ borderRadius: 8, height: 30, width: 30, color: '#6366f1', background: '#eef2ff' }} 
                        title="Preview" />
                    <Button type="text" size="small" icon={<DownloadOutlined />} 
                        onClick={() => secureDownload(r.id, r.file_name)}
                        style={{ borderRadius: 8, height: 30, width: 30, color: '#10b981', background: '#ecfdf5' }} 
                        title="Download" />
                </Space>
            ),
        },
    ];

    const maxTeacherCount = teacherStats.length ? teacherStats[0].count : 1;
    const maxBatchCount = batchStats.length ? batchStats[0].count : 1;

    // Full-page Skeleton
    if (loading && resources.length === 0) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 90px)' }}>
                <div style={{ flexShrink: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                        <div>
                            <Skeleton.Input active style={{ width: 220, height: 26, borderRadius: 8 }} />
                            <div style={{ marginTop: 8 }}>
                                <Skeleton.Input active style={{ width: 360, height: 14, borderRadius: 6 }} />
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px', marginBottom: 20 }}>
                        {[...Array(7)].map((_, i) => (
                            <Skeleton.Button key={i} active style={{ height: 60, borderRadius: 12, width: '100%' }} />
                        ))}
                    </div>
                </div>

                <div style={{ flex: 1, background: '#fff', borderRadius: 16, border: '1px solid #f0f0f8', overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                    <div style={{ padding: '14px 20px', borderBottom: '1px solid #f5f5fa', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                        <Skeleton.Avatar active size={30} shape="square" style={{ borderRadius: 9 }} />
                        <Skeleton.Input active style={{ width: 120, height: 16, borderRadius: 4 }} />
                    </div>
                    <div style={{ padding: '12px 20px', borderBottom: '1px solid #f5f5fa', display: 'flex', gap: 24 }}>
                        {[180, 100, 140, 100, 80, 80].map((w, i) => (
                            <Skeleton.Input key={i} active style={{ width: w, height: 12, borderRadius: 4 }} />
                        ))}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden', padding: '0 20px' }}>
                        {[...Array(6)].map((_, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '14px 0', borderBottom: '1px solid #f8f9fb' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: 180 }}>
                                    <Skeleton.Avatar active size={34} shape="square" style={{ borderRadius: 10 }} />
                                    <div>
                                        <Skeleton.Input active style={{ width: 120, height: 12, borderRadius: 4, marginBottom: 4 }} />
                                    </div>
                                </div>
                                <Skeleton.Input active style={{ width: 80, height: 18, borderRadius: 12 }} />
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 140 }}>
                                    <Skeleton.Avatar active size={24} shape="circle" />
                                    <Skeleton.Input active style={{ width: 80, height: 12, borderRadius: 4 }} />
                                </div>
                                <Skeleton.Input active style={{ width: 70, height: 18, borderRadius: 12 }} />
                                <Skeleton.Input active style={{ width: 60, height: 18, borderRadius: 12 }} />
                                <Skeleton.Input active style={{ width: 60, height: 12, borderRadius: 4 }} />
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
            <div style={{ flexShrink: 0 }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', letterSpacing: -0.3 }}>
                            Resource Dashboard
                        </div>
                        <Typography.Text style={{ fontSize: 13, color: '#94a3b8' }}>
                            Overview of all learning resources across the platform
                        </Typography.Text>
                    </div>
                    
                    {/* Global Dashboard Filters */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                        <Input placeholder="Search..." prefix={<SearchOutlined />} allowClear
                            value={searchText} onChange={e => setSearchText(e.target.value)}
                            style={{ flex: '1 1 160px', minWidth: 120, borderRadius: 8 }} />
                        <Select value={filterCategory} onChange={setFilterCategory} style={{ flex: '0 1 130px', minWidth: 110 }}
                            options={[{ value: 'all', label: 'All Types' }, ...Object.entries(CAT).map(([k, v]) => ({ value: k, label: v.label }))]} />
                        <Select value={filterTeacher} onChange={setFilterTeacher} allowClear placeholder="Teacher" style={{ flex: '1 1 130px', minWidth: 110, borderRadius: 8 }}
                            options={teachers.map(t => ({ value: t.id, label: `${t.first_name} ${t.last_name}` }))} showSearch optionFilterProp="label" />
                        <Select value={filterBatch} onChange={setFilterBatch} allowClear placeholder="Batch" style={{ flex: '1 1 130px', minWidth: 110, borderRadius: 8 }}
                            options={batches.map(b => ({ value: b.id, label: b.name }))} showSearch optionFilterProp="label" />
                        <DatePicker.RangePicker onChange={setDateRangeFilter} allowClear style={{ flex: '1 1 200px', minWidth: 180, borderRadius: 8 }} />
                    </div>
                </div>

                {/* Stats Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10, marginBottom: 20 }}>
                    {[
                        { label: 'Total', value: filtered.length, icon: <FolderOutlined />, color: '#1a56db', bg: '#eff6ff' },
                        { label: 'Storage', value: fmtSize(totalStorage), icon: <DatabaseOutlined />, color: '#7c3aed', bg: '#f5f3ff' },
                        { label: 'Cloud', value: cloudCount, icon: <CloudOutlined />, color: '#0891b2', bg: '#ecfeff' },
                        { label: 'Local', value: localCount, icon: <DatabaseOutlined />, color: '#64748b', bg: '#f8fafc' },
                        ...Object.entries(CAT).map(([k, v]) => ({
                            label: v.label, value: filtered.filter(r => r.category === k).length, icon: v.icon, color: v.color, bg: v.bg
                        })),
                    ].map((s, i) => (
                        <div key={i} style={{ 
                            background: '#fff', borderRadius: 14, padding: '10px 12px',
                            border: '1px solid #f0f0f8', boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                            display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
                            cursor: 'default'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div style={{
                                width: 32, height: 32, borderRadius: 9, background: s.bg,
                                color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0
                            }}>
                                {s.icon}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.label}</div>
                                <div style={{ fontSize: 15, fontWeight: 800, color: '#1e293b', whiteSpace: 'nowrap' }}>{s.value}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Content Area - Scrollable */}
            <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Insights Section */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, flexShrink: 0 }}>
                    {/* Resources per Teacher */}
                    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0f0f8', padding: 20 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <TeamOutlined style={{ color: '#1a56db' }} /> Resources per Teacher
                        </div>
                        {teacherStats.length === 0 ? <Empty description="No data" /> : teacherStats.slice(0, 5).map((t, i) => (
                            <div key={i} style={{ marginBottom: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <Text style={{ fontSize: 12, fontWeight: 600 }}>{t.name}</Text>
                                    <Text type="secondary" style={{ fontSize: 11 }}>{t.count} files · {fmtSize(t.size)}</Text>
                                </div>
                                <Progress percent={Math.round((t.count / maxTeacherCount) * 100)} showInfo={false} strokeColor="#1a56db" size="small" trailColor="#f1f5f9" />
                            </div>
                        ))}
                    </div>

                    {/* Resources per Batch */}
                    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0f0f8', padding: 20 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <BookOutlined style={{ color: '#7c3aed' }} /> Resources per Batch
                        </div>
                        {batchStats.length === 0 ? <Empty description="No data" /> : batchStats.slice(0, 5).map((b, i) => (
                            <div key={i} style={{ marginBottom: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <Text style={{ fontSize: 12, fontWeight: 600 }}>{b.name}</Text>
                                    <Text type="secondary" style={{ fontSize: 11 }}>{b.count} files</Text>
                                </div>
                                <Progress percent={Math.round((b.count / maxBatchCount) * 100)} showInfo={false} strokeColor="#7c3aed" size="small" trailColor="#f1f5f9" />
                            </div>
                        ))}
                    </div>

                    {/* File Type Distribution */}
                    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0f0f8', padding: 20 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <FolderOutlined style={{ color: '#0891b2' }} /> File Type Distribution
                        </div>
                        {typeStats.length === 0 ? <Empty description="No data" /> : typeStats.map(([cat, count], i) => {
                            const c = CAT[cat] || CAT.document;
                            const pct = filtered.length ? Math.round((count / filtered.length) * 100) : 0;
                            return (
                                <div key={i} style={{ marginBottom: 12 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <Space size={6}><span style={{ color: c.color, fontSize: 12 }}>{c.icon}</span><Text style={{ fontSize: 12, fontWeight: 600 }}>{c.label}</Text></Space>
                                        <Text type="secondary" style={{ fontSize: 11 }}>{count} ({pct}%)</Text>
                                    </div>
                                    <Progress percent={pct} showInfo={false} strokeColor={c.color} size="small" trailColor="#f1f5f9" />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Filter & Table Container */}
                <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0f0f8', boxShadow: '0 2px 12px rgba(99,102,241,0.04)', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 400 }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #f5f5fa', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 30, height: 30, borderRadius: 9, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', fontSize: 14 }}>
                                <FolderOutlined />
                            </div>
                            <span style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>File Directory</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', background: '#f1f5f9', padding: '2px 10px', borderRadius: 12 }}>{filtered.length} matching files</span>
                        </div>
                    </div>
                    <div style={{ flex: 1, overflow: 'auto' }}>
                        <Table columns={columns} dataSource={filtered} rowKey="id" loading={false} size="middle"
                            pagination={{ pageSize: 15, showSizeChanger: true, showTotal: (t) => `${t} resources`, style: { padding: '12px 20px', margin: 0 } }}
                            locale={{ emptyText: <Empty description="No resources found" /> }} scroll={{ x: 1000 }} />
                    </div>
                </div>
            </div>

            {/* Premium Preview Modal */}
            <Modal
                title={null}
                open={!!previewResource}
                onCancel={closePreview}
                footer={null}
                width={fullscreen ? '100vw' : 1000}
                centered
                closable={true}
                closeIcon={
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#fff', transition: 'all 0.2s', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'scale(1)'; }}
                    >✕</div>
                }
                wrapClassName="preview-modal"
                styles={{ body: { padding: 0, height: fullscreen ? '100vh' : '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' } }}
                style={{ top: fullscreen ? 0 : 20, maxWidth: fullscreen ? '100vw' : undefined, margin: fullscreen ? 0 : '', paddingBottom: fullscreen ? 0 : '' }}
            >
                {previewResource && (
                    <>
                        <div style={{ flexShrink: 0, background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: '20px 60px 20px 28px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                                    {CAT[previewResource.category]?.icon || <FileTextOutlined />}
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ fontSize: 18, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{previewResource.title}</div>
                                    <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>{fmtSize(previewResource.file_size)} · Shared {dayjs(previewResource.created_at).format('MMM DD, YYYY')}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <Button type="default" icon={<DownloadOutlined />} onClick={() => secureDownload(previewResource.id, previewResource.file_name)} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600 }}>Download</Button>
                                <Button type="text" icon={fullscreen ? <CompressOutlined /> : <ExpandOutlined />} onClick={() => setFullscreen(!fullscreen)} style={{ color: '#fff', background: 'rgba(255,255,255,0.1)', borderRadius: 8 }} />
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
                                            <div style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Preview not supported for this file type</div>
                                            <div style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>Please download the file to view its contents.</div>
                                            <Button type="primary" size="large" icon={<DownloadOutlined />} onClick={() => secureDownload(previewResource.id, previewResource.file_name)} style={{ borderRadius: 8 }}>Download File</Button>
                                        </div>
                                    )}
                                </div>
                            )}
                            {previewResource.description && (
                                <div style={{ flexShrink: 0, padding: '16px 24px', background: '#fff', borderTop: '1px solid #f1f5f9', fontSize: 13, color: '#4b5563', lineHeight: 1.5 }}>
                                    <span style={{ fontWeight: 700, color: '#1e293b', marginRight: 8 }}>Description:</span>{previewResource.description}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </Modal>

            <style>{`
                .preview-modal .ant-modal-close { top: 12px !important; right: 12px !important; width: auto !important; height: auto !important; z-index: 10 !important; }
                .preview-modal .ant-modal-close-x { width: auto !important; height: auto !important; line-height: 1 !important; }
                .preview-modal .ant-modal-header { display: none !important; }
                .preview-modal .ant-modal-content { border-radius: ${fullscreen ? '0' : '16px'} !important; overflow: hidden !important; padding: 0 !important; }
            `}</style>
        </div>
    );
};

export default AdminResources;
