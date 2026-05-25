import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Table, Input, Select, Empty, Button, Modal, Tooltip, Skeleton, Alert, DatePicker } from 'antd';
import {
    DownloadOutlined, EyeOutlined, SearchOutlined, FolderOutlined,
    FilePdfOutlined, VideoCameraOutlined, SoundOutlined, PictureOutlined,
    FileTextOutlined, ExpandOutlined, CompressOutlined, DesktopOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import KpiCard from '../Common/KpiCard';
import PageHeader from '../Common/PageHeader';
import PdfViewer from '../Common/PdfViewer';
import useResponsive from '../../hooks/useResponsive';



/* ── Types ── */
interface Resource {
    id: number;
    title: string;
    description: string;
    file_name: string;
    file_type: string;
    file_size: number;
    batch_ids: number[];
    batch_names?: string;
    teacher_first_name?: string;
    teacher_last_name?: string;
    category: string;
    storage_type: string;
    created_at: string;
}

const CAT: Record<string, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
    pdf: { icon: <FilePdfOutlined />, color: '#ef4444', bg: '#fee2e2', label: 'PDF' },
    video: { icon: <VideoCameraOutlined />, color: '#3b82f6', bg: '#dbeafe', label: 'Video' },
    audio: { icon: <SoundOutlined />, color: '#8b5cf6', bg: '#ede9fe', label: 'Audio' },
    image: { icon: <PictureOutlined />, color: '#10b981', bg: '#d1fae5', label: 'Image' },
    document: { icon: <FileTextOutlined />, color: '#f59e0b', bg: '#fef3c7', label: 'Document' },
};

function fmtSize(b: number) {
    if (!b) return '0 B';
    const k = 1024, s = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return parseFloat((b / Math.pow(k, i)).toFixed(1)) + ' ' + s[i];
}

/* ══════════════════════════════
   MAIN COMPONENT
══════════════════════════════ */
const StudentResources: React.FC = () => {
    const r = useResponsive();
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [catFilter, setCatFilter] = useState('all');
    const [batchFilter, setBatchFilter] = useState<number | null>(null);
    const [teacherFilter, setTeacherFilter] = useState<string | null>(null);
    const [dateRangeFilter, setDateRangeFilter] = useState<any>(null);

    const [preview, setPreview] = useState<Resource | null>(null);
    const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
    const [previewFullscreen, setPreviewFullscreen] = useState(false);
    const { apiCall } = useAuth();

    const fetchResources = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const p = new URLSearchParams();
            if (catFilter !== 'all') p.set('category', catFilter);
            if (batchFilter) p.set('batch_id', String(batchFilter));
            const resp = await apiCall(`/resources?${p}`);
            if (resp.ok) setResources(await resp.json());
            else throw new Error('Failed to fetch resources');
        } catch (err: any) { setError(err.message); }
        finally { setLoading(false); }
    }, [catFilter, batchFilter, apiCall]);

    useEffect(() => { fetchResources(); }, [fetchResources]);

    // Deep-link: ?focus=<resourceId> scrolls to and pulses the matching row.
    const [searchParams] = useSearchParams();
    const focusId = searchParams.get('focus');
    useEffect(() => {
        if (!focusId || loading) return;
        const idNum = Number(focusId);
        if (!Number.isFinite(idNum)) return;
        const tid = setTimeout(() => {
            const el = document.querySelector(`[data-focus-id="${idNum}"]`) as HTMLElement | null;
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('focus-pulse');
                setTimeout(() => el.classList.remove('focus-pulse'), 2500);
            }
        }, 250);
        return () => clearTimeout(tid);
    }, [focusId, loading, resources]);

    /* ── Secure Actions ── */
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
            }
        } catch {}
    };

    const openPreview = async (r: Resource) => {
        setPreview(r); setPreviewBlobUrl(null);
        try {
            const resp = await apiCall(`/resources/${r.id}/preview`);
            if (resp.ok) {
                const blob = await resp.blob();
                setPreviewBlobUrl(URL.createObjectURL(blob));
            } else setPreviewBlobUrl('error');
        } catch { setPreviewBlobUrl('error'); }
    };

    const closePreview = () => {
        setPreviewBlobUrl(null); setPreview(null); setPreviewFullscreen(false);
    };

    /* ── Derived Data ── */
    const filtered = useMemo(() => resources.filter(r => {
        if (search && !r.title.toLowerCase().includes(search.toLowerCase()) && !r.file_name.toLowerCase().includes(search.toLowerCase())) return false;
        if (teacherFilter) {
            const tName = `${r.teacher_first_name || ''} ${r.teacher_last_name || ''}`.trim();
            if (tName !== teacherFilter) return false;
        }
        if (dateRangeFilter && dateRangeFilter.length === 2 && r.created_at) {
            const start = dayjs(r.created_at);
            if (start.isBefore(dateRangeFilter[0], 'day') || start.isAfter(dateRangeFilter[1], 'day')) return false;
        }
        return true;
    }), [resources, search, teacherFilter, dateRangeFilter]);

    const batches = useMemo(() => {
        const m = new Map<number, string>();
        resources.forEach(r => {
            if (r.batch_ids && r.batch_names) {
                const bIds = r.batch_ids;
                const bNames = r.batch_names.split(',').map(n => n.trim());
                bIds.forEach((id, i) => {
                    if (bNames[i]) m.set(id, bNames[i]);
                });
            }
        });
        return Array.from(m.entries()).map(([id, name]) => ({ value: id, label: name }));
    }, [resources]);

    const availableTeachers = useMemo(() => {
        const set = new Set<string>();
        resources.forEach(r => {
            const tName = `${r.teacher_first_name || ''} ${r.teacher_last_name || ''}`.trim();
            if (tName) set.add(tName);
        });
        return Array.from(set).map(name => ({ value: name, label: name }));
    }, [resources]);

    const stats = useMemo(() => ({
        total: resources.length,
        pdf: resources.filter(r => r.category === 'pdf').length,
        video: resources.filter(r => r.category === 'video').length,
        audio: resources.filter(r => r.category === 'audio').length,
        document: resources.filter(r => r.category === 'document').length,
    }), [resources]);

    /* ── Table Columns ── */
    const columns = [
        {
            title: 'FILE', key: 'file', width: 350, fixed: 'left' as const,
            render: (_: any, r: Resource) => {
                const cat = CAT[r.category] || CAT.document;
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: cat.color, flexShrink: 0 }}>{cat.icon}</div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontWeight: 700, color: '#1a1d2e', fontSize: 13.5, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</div>
                            <div style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.file_name} · {fmtSize(r.file_size)}</div>
                        </div>
                    </div>
                );
            }
        },
        {
            title: 'TAGS', key: 'tags', width: 200,
            render: (_: any, r: Resource) => {
                const cat = CAT[r.category] || CAT.document;
                return (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: cat.color, background: cat.bg, borderRadius: 20, padding: '2px 10px' }}>{cat.label}</span>
                        {r.batch_names && r.batch_names.split(',').map((n, i) => (
                            <span key={i} style={{ fontSize: 11, fontWeight: 600, color: '#4b5563', background: '#f1f5f9', borderRadius: 20, padding: '2px 10px' }}>{n.trim()}</span>
                        ))}
                    </div>
                );
            }
        },
        {
            title: 'SHARED ON', dataIndex: 'created_at', key: 'date', width: 140,
            render: (v: string) => (<div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1d2e' }}>{dayjs(v).format('MMM DD, YYYY')}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{dayjs(v).format('HH:mm')}</div>
            </div>),
            sorter: (a: Resource, b: Resource) => dayjs(a.created_at).valueOf() - dayjs(b.created_at).valueOf()
        },
        {
            title: 'ACTIONS', key: 'actions', width: 100, align: 'right' as const, fixed: 'right' as const,
            render: (_: any, r: Resource) => (
                <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                    <Tooltip title="Preview">
                        <Button type="text" onClick={(e) => { e.stopPropagation(); openPreview(r); }} style={{ width: 36, height: 36, borderRadius: 10, background: '#eef2ff', color: '#6366f1' }} icon={<EyeOutlined />} />
                    </Tooltip>
                    <Tooltip title="Download">
                        <Button type="text" onClick={(e) => { e.stopPropagation(); secureDownload(r.id, r.file_name); }} style={{ width: 36, height: 36, borderRadius: 10, background: '#f8fafc', color: '#64748b' }} icon={<DownloadOutlined />} />
                    </Tooltip>
                </div>
            )
        }
    ];

    /* ═══════════════════════════════════
       SKELETON LOADING
    ═══════════════════════════════════ */
    if (loading && resources.length === 0) return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ marginBottom: 24 }}>
                <Skeleton.Input active style={{ width: 260, height: 26, borderRadius: 8 }} />
                <div style={{ marginTop: 6 }}><Skeleton.Input active style={{ width: 180, height: 13, borderRadius: 6 }} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14, marginBottom: 20 }}>
                {[1,2,3,4,5].map(i => (
                    <div key={i} style={{ borderRadius: 16, padding: '20px 22px', background: '#fff', border: '1px solid #f0f0f8', display: 'flex', alignItems: 'center', gap: 16 }}><Skeleton.Avatar active size={46} shape="square" style={{ borderRadius: 13 }} /><div style={{ flex: 1 }}><Skeleton.Input active style={{ width: '70%', height: 11, borderRadius: 4, marginBottom: 8 }} block /><Skeleton.Input active style={{ width: 40, height: 26, borderRadius: 6 }} /></div></div>
                ))}
            </div>
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0f0f8', flex: 1, padding: 20 }}>
                {[1,2,3,4,5].map(i => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0', borderBottom: '1px solid #f8f8fc' }}><Skeleton.Avatar active shape="square" size={44} style={{ borderRadius: 12 }} /><div style={{ flex: 1 }}><Skeleton.Input active style={{ width: '40%', height: 13, borderRadius: 5, marginBottom: 5 }} block /><Skeleton.Input active style={{ width: '20%', height: 11, borderRadius: 5 }} block /></div></div>
                ))}
            </div>
        </div>
    );

    /* ═══════════════════════════════════
       MAIN RENDER
    ═══════════════════════════════════ */
    return (
        <div className="student-portal" style={{
            display: 'flex',
            flexDirection: 'column',
            /* On mobile, let the page flow naturally — fixed-height + overflow:hidden
               creates wasted empty space when cards are few, and traps the user inside
               an inner scroll-area. On desktop we keep the card filling the viewport. */
            height: r.isMobile ? 'auto' : '100%',
            minHeight: r.isMobile ? 'auto' : '100%',
        }}>

            {/* ── Header ── */}
            <PageHeader
                title="My Resources"
                subtitle="Learning materials and documents shared by your teachers"
                icon={<FolderOutlined />}
                accent="#10b981"
            />

            {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16, borderRadius: 12 }} />}

            {/* ── KPI Cards ── */}
            <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: r.isCompact ? 'repeat(auto-fit, minmax(140px, 1fr))' : 'repeat(auto-fit, minmax(170px, 1fr))', gap: r.isCompact ? 10 : 14, marginBottom: r.isCompact ? 14 : 20, flexShrink: 0 }}>
                <KpiCard label="Total Files" value={stats.total} icon={<FolderOutlined />} accent="#6366f1" />
                <KpiCard label="PDFs" value={stats.pdf} icon={<FilePdfOutlined />} accent="#ef4444" />
                <KpiCard label="Videos" value={stats.video} icon={<VideoCameraOutlined />} accent="#3b82f6" />
                <KpiCard label="Audio" value={stats.audio} icon={<SoundOutlined />} accent="#8b5cf6" />
                <KpiCard label="Documents" value={stats.document} icon={<FileTextOutlined />} accent="#f59e0b" />
            </div>

            {/* ── Table Card (Flex 1) ── */}
            <div style={{
                background: '#fff',
                borderRadius: 16,
                border: '1px solid #f0f0f8',
                boxShadow: '0 2px 12px rgba(99,102,241,0.07)',
                flex: r.isMobile ? 'none' : 1,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
            }}>
                {/* Search Bar */}
                {/* Search Bar */}
                <div style={{ display: 'flex', gap: r.isMobile ? 8 : 12, padding: r.isMobile ? '12px 14px' : '16px 20px', borderBottom: '1px solid #f0f0f8', background: '#fafafa', flexWrap: 'wrap', flexShrink: 0 }}>
                    <Input placeholder="Search files..." prefix={<SearchOutlined style={{ color: '#94a3b8' }} />} value={search} onChange={e => setSearch(e.target.value)} allowClear style={{ flex: r.isMobile ? '1 1 100%' : '1 1 180px', minWidth: 140, borderRadius: 10, height: 38 }} />
                    <Select value={catFilter} onChange={setCatFilter} style={{ flex: r.isMobile ? '1 1 calc(50% - 4px)' : '0 1 140px', minWidth: 120, height: 38 }} options={[{ value: 'all', label: 'All Types' }, ...Object.entries(CAT).map(([k, v]) => ({ value: k, label: v.label }))]} />
                    <DatePicker.RangePicker onChange={setDateRangeFilter} allowClear style={{ flex: r.isMobile ? '1 1 100%' : '1 1 200px', minWidth: 180, borderRadius: 10, height: 38 }} />
                    <Select value={batchFilter} onChange={setBatchFilter} allowClear placeholder="All Batches" style={{ flex: r.isMobile ? '1 1 calc(50% - 4px)' : '1 1 150px', minWidth: 130, height: 38 }} options={batches} />
                    <Select value={teacherFilter} onChange={setTeacherFilter} allowClear placeholder="All Teachers" style={{ flex: r.isMobile ? '1 1 calc(50% - 4px)' : '1 1 150px', minWidth: 130, height: 38 }} options={availableTeachers} />
                </div>
                {/* Table wrapper */}
                <div style={{
                    flex: r.isMobile ? 'none' : 1,
                    overflow: r.isMobile ? 'visible' : 'hidden',
                    padding: r.isMobile ? 12 : 0,
                }}>
                    {r.isMobile ? (
                        /* ── Mobile: card stack ── */
                        filtered.length === 0 ? (
                            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                                <Empty description={<span style={{ color: '#94a3b8', fontSize: 13 }}>No resources found</span>} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 8 }}>
                                {filtered.map((rec) => {
                                    const cat = CAT[rec.category] || CAT.document;
                                    return (
                                        <div
                                            key={rec.id}
                                            data-focus-id={rec.id}
                                            onClick={() => openPreview(rec)}
                                            style={{
                                                background: '#fff',
                                                border: '1px solid #f0f0f8',
                                                borderRadius: 14,
                                                padding: 14,
                                                cursor: 'pointer',
                                                boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                                                <div style={{
                                                    width: 42, height: 42, borderRadius: 11, flexShrink: 0,
                                                    background: cat.bg, color: cat.color,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: 20,
                                                }}>{cat.icon}</div>
                                                <div style={{ minWidth: 0, flex: 1 }}>
                                                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1d2e', marginBottom: 2, lineHeight: 1.3 }}>
                                                        {rec.title}
                                                    </div>
                                                    <div style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {rec.file_name} · {fmtSize(rec.file_size)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                                                <span style={{ fontSize: 10.5, fontWeight: 700, color: cat.color, background: cat.bg, borderRadius: 20, padding: '2px 9px' }}>{cat.label}</span>
                                                {rec.batch_names && rec.batch_names.split(',').slice(0, 2).map((n, i) => (
                                                    <span key={i} style={{ fontSize: 10.5, fontWeight: 600, color: '#4b5563', background: '#f1f5f9', borderRadius: 20, padding: '2px 9px' }}>{n.trim()}</span>
                                                ))}
                                            </div>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <Button
                                                    block
                                                    size="middle"
                                                    onClick={(e) => { e.stopPropagation(); openPreview(rec); }}
                                                    icon={<EyeOutlined />}
                                                    style={{ borderRadius: 10, background: '#eef2ff', color: '#6366f1', borderColor: 'transparent', fontWeight: 600 }}
                                                >
                                                    Preview
                                                </Button>
                                                <Button
                                                    block
                                                    size="middle"
                                                    onClick={(e) => { e.stopPropagation(); secureDownload(rec.id, rec.file_name); }}
                                                    icon={<DownloadOutlined />}
                                                    style={{ borderRadius: 10, fontWeight: 600 }}
                                                >
                                                    Download
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    ) : filtered.length === 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 200 }}>
                            <Empty description={<span style={{ color: '#94a3b8', fontSize: 13 }}>No resources found matching your criteria</span>} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        </div>
                    ) : (
                        <Table 
                            columns={columns as any}
                            dataSource={filtered}
                            rowKey="id"
                            pagination={false}
                            scroll={{ y: 'calc(100vh - 430px)', x: 'max-content' }}
                            size={r.isCompact ? 'small' : 'middle'}
                            onRow={(rec) => ({
                                onClick: () => openPreview(rec),
                                style: { cursor: 'pointer' },
                                'data-focus-id': rec.id,
                            } as any)}
                            rowClassName={() => 'resource-row'}
                        />
                    )}
                </div>
            </div>

            {/* ── Premium Preview Modal ── */}
            <Modal
                title={null}
                open={!!preview}
                onCancel={closePreview}
                footer={null}
                /* Mobile: hugs the top of the viewport; desktop: centered cap. */
                width={previewFullscreen ? '100vw' : (r.isMobile ? '100vw' : r.isCompact ? '94vw' : Math.min(1100, r.width - 80))}
                centered={!previewFullscreen && !r.isMobile}
                destroyOnHidden
                closable={true}
                maskClosable={true}
                closeIcon={
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#fff', transition: 'all 0.2s', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'scale(1)'; }}
                    >✕</div>
                }
                wrapClassName={`preview-modal${previewFullscreen ? ' preview-modal-fullscreen' : ''}`}
                styles={{
                    mask: { backdropFilter: 'blur(6px)', background: 'rgba(2, 6, 23, 0.65)' },
                    content: { padding: 0, borderRadius: previewFullscreen || r.isMobile ? 0 : 16, overflow: 'hidden', boxShadow: '0 30px 80px -20px rgba(0,0,0,0.4), 0 0 0 1px rgba(15,23,42,0.05)' },
                    /* Body height uses min(…) of vh + dvh so it works on every
                       browser (older ones fall back to the vh value, modern
                       mobile browsers use dvh which excludes the URL bar). */
                    body: {
                        padding: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        height: previewFullscreen
                            ? '100dvh'
                            : r.isMobile
                                ? '100dvh'
                                : 'min(86vh, 760px)',
                    },
                }}
            >
                {preview && (
                    <>
                        <div style={{
                            flexShrink: 0,
                            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                            padding: r.isMobile ? '14px 56px 14px 16px' : '20px 60px 20px 28px',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 12,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: r.isMobile ? 10 : 14, minWidth: 0, flex: 1 }}>
                                <div style={{
                                    width: r.isMobile ? 38 : 44,
                                    height: r.isMobile ? 38 : 44,
                                    borderRadius: 12,
                                    background: 'rgba(255,255,255,0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: r.isMobile ? 18 : 22,
                                    flexShrink: 0,
                                }}>
                                    {CAT[preview.category]?.icon || <FileTextOutlined />}
                                </div>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                    <div style={{ fontSize: r.isMobile ? 15 : 18, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{preview.title}</div>
                                    <div style={{ fontSize: 11.5, opacity: 0.7, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {fmtSize(preview.file_size)} · Shared {dayjs(preview.created_at).format('MMM DD, YYYY')}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                                {!r.isMobile && (
                                    <Button
                                        type="default"
                                        icon={<DownloadOutlined />}
                                        onClick={() => secureDownload(preview.id, preview.file_name)}
                                        style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600 }}
                                    >
                                        Download
                                    </Button>
                                )}
                                {r.isMobile && (
                                    <Button
                                        type="text"
                                        icon={<DownloadOutlined />}
                                        onClick={() => secureDownload(preview.id, preview.file_name)}
                                        aria-label="Download"
                                        style={{ color: '#fff', background: 'rgba(255,255,255,0.1)', borderRadius: 8 }}
                                    />
                                )}
                                <Button
                                    type="text"
                                    icon={previewFullscreen ? <CompressOutlined /> : <ExpandOutlined />}
                                    onClick={() => setPreviewFullscreen(!previewFullscreen)}
                                    aria-label={previewFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                                    style={{ color: '#fff', background: 'rgba(255,255,255,0.1)', borderRadius: 8 }}
                                />
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
                                    /* For PDFs the PdfViewer manages its own scroll
                                       container, so don't center-align — let it
                                       stretch to fill. Video/audio still get
                                       centered via their own wrapper below. */
                                    alignItems: preview.category === 'pdf' ? 'stretch' : 'center',
                                    justifyContent: preview.category === 'pdf' ? 'flex-start' : 'center',
                                }}>
                                    {preview.category === 'pdf' && (
                                        <PdfViewer src={previewBlobUrl} />
                                    )}
                                    {preview.category === 'video' && (
                                        <video controls style={{ maxWidth: '100%', maxHeight: '100%', background: '#000', outline: 'none' }} src={previewBlobUrl} />
                                    )}
                                    {preview.category === 'audio' && (
                                        <div style={{ padding: 48, textAlign: 'center', width: '100%', maxWidth: 500 }}>
                                            <div style={{ width: 120, height: 120, borderRadius: '50%', background: '#ede9fe', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, margin: '0 auto 30px', boxShadow: '0 10px 25px rgba(139,92,246,0.2)' }}>
                                                <SoundOutlined />
                                            </div>
                                            <audio controls style={{ width: '100%', height: 50 }} src={previewBlobUrl} />
                                        </div>
                                    )}
                                    {preview.category === 'image' && (
                                        <img src={previewBlobUrl} alt={preview.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                    )}
                                    {preview.category === 'document' && (
                                        <div style={{ padding: 60, textAlign: 'center' }}>
                                            <DesktopOutlined style={{ fontSize: 64, color: '#94a3b8', marginBottom: 20 }} />
                                            <div style={{ fontSize: 16, fontWeight: 600, color: '#1a1d2e', marginBottom: 8 }}>Preview not supported for this file type</div>
                                            <div style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>Please download the file to view its contents.</div>
                                            <Button type="primary" size="large" icon={<DownloadOutlined />} onClick={() => secureDownload(preview.id, preview.file_name)} style={{ borderRadius: 8 }}>Download File</Button>
                                        </div>
                                    )}
                                </div>
                            )}
                            {preview.description && (
                                <div style={{ flexShrink: 0, padding: '16px 24px', background: '#fff', borderTop: '1px solid #f1f5f9', fontSize: 13, color: '#4b5563', lineHeight: 1.5 }}>
                                    <span style={{ fontWeight: 700, color: '#1a1d2e', marginRight: 8 }}>Description:</span>{preview.description}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </Modal>

            <style>{`
                .resource-row:hover td { background: #f8f7ff !important; }
                .ant-table-thead > tr > th { background: #fafafa !important; font-weight: 700 !important; color: #4b5563 !important; font-size: 11px !important; text-transform: uppercase !important; letter-spacing: 0.5px !important; border-bottom: 2px solid #f0f0f8 !important; }
                .ant-table-cell { border-bottom: 1px solid #f5f5fc !important; }
                
                .preview-modal .ant-modal-close { top: 12px !important; right: 12px !important; width: auto !important; height: auto !important; z-index: 10 !important; }
                .preview-modal .ant-modal-close-x { width: auto !important; height: auto !important; line-height: 1 !important; }
                .preview-modal .ant-modal-header { display: none !important; }
                .preview-modal .ant-modal-content { border-radius: ${previewFullscreen ? '0' : '16px'} !important; overflow: hidden !important; padding: 0 !important; }

                .focus-pulse {
                    animation: focus-pulse-anim 2.5s ease-out;
                    scroll-margin-top: 100px;
                }
                @keyframes focus-pulse-anim {
                    0%   { box-shadow: 0 0 0 0 rgba(99,102,241,0.5), 0 0 0 0 rgba(99,102,241,0.3); background-color: rgba(99,102,241,0.10); }
                    30%  { box-shadow: 0 0 0 6px rgba(99,102,241,0.2), 0 0 0 12px rgba(99,102,241,0.05); }
                    100% { box-shadow: 0 0 0 0 transparent; background-color: transparent; }
                }
            `}</style>
        </div>
    );
};

export default StudentResources;
