import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Button, ConfigProvider, Form, Input, Modal, Pagination, Progress, Segmented, Select, Skeleton, Tooltip, Upload, message,
} from 'antd';
import type { UploadFile } from 'antd';
import {
    AppstoreOutlined, CloudUploadOutlined, CloseOutlined, CompressOutlined, DeleteOutlined, DownloadOutlined, EditOutlined,
    ExclamationCircleOutlined, ExpandOutlined, EyeOutlined, FilePdfOutlined, FileTextOutlined, FolderOpenOutlined, HddOutlined,
    LoadingOutlined, PictureOutlined, PlusOutlined, ReloadOutlined, SearchOutlined, SoundOutlined, TeamOutlined,
    UnorderedListOutlined, VideoCameraOutlined, WarningOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import useResponsive from '../../hooks/useResponsive';
import PdfViewer from '../Common/PdfViewer';
import { resolveTimezone, timezoneLabel } from '../../utils/timezone';
import '../Student/StudentResources.css';
import './Teacher.css';

/* ══════════════════════════════════════════
   TEACHER RESOURCES — upload, organise and share learning material.
   Same library design as the student side, plus upload, edit and delete.
══════════════════════════════════════════ */

interface Resource {
    id: number;
    title: string;
    description?: string | null;
    file_name: string;
    file_size: number;
    batch_ids: number[] | null;
    batch_names?: string | null;
    category: string;
    storage_type: string;
    created_at: string;
}
interface Batch { id: number; name: string }

type Category = 'pdf' | 'video' | 'audio' | 'image' | 'document';
type SortKey = 'newest' | 'oldest' | 'name' | 'size';
type View = 'list' | 'grid';

const CATEGORIES: Record<Category, { label: string; plural: string; icon: React.ReactNode }> = {
    pdf: { label: 'PDF', plural: 'PDFs', icon: <FilePdfOutlined /> },
    video: { label: 'Video', plural: 'Videos', icon: <VideoCameraOutlined /> },
    audio: { label: 'Audio', plural: 'Audio', icon: <SoundOutlined /> },
    image: { label: 'Image', plural: 'Images', icon: <PictureOutlined /> },
    document: { label: 'Document', plural: 'Documents', icon: <FileTextOutlined /> },
};
const CATEGORY_KEYS = Object.keys(CATEGORIES) as Category[];
const categoryOf = (r: Resource): Category => (r.category in CATEGORIES ? (r.category as Category) : 'document');

const PAGE_SIZE = 20;
const VIEW_KEY = 'lfn.teacher.resources.view';
const NEW_MS = 7 * 86_400_000;

const fmtSize = (b: number) => {
    if (!b) return '0 B';
    const k = 1024, units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.min(units.length - 1, Math.floor(Math.log(b) / Math.log(k)));
    return `${parseFloat((b / Math.pow(k, i)).toFixed(1))} ${units[i]}`;
};
const extOf = (r: Resource) => (r.file_name.includes('.') ? r.file_name.split('.').pop()!.slice(0, 4).toUpperCase() : CATEGORIES[categoryOf(r)].label.toUpperCase());
const idsOf = (r: Resource) => (Array.isArray(r.batch_ids) ? r.batch_ids.filter(x => x != null) : []);
const isCloud = (r: Resource) => r.storage_type === 'kdrive';
const readView = (): View => { try { return localStorage.getItem(VIEW_KEY) === 'grid' ? 'grid' : 'list'; } catch { return 'list'; } };
const listOf = <T,>(d: unknown, key: string): T[] => (Array.isArray(d) ? d : Array.isArray((d as any)?.[key]) ? (d as any)[key] : []);

const ResourceManagement: React.FC = () => {
    const { apiCall, token } = useAuth();
    const r = useResponsive();
    const [msg, msgHolder] = message.useMessage();
    const [modal, modalHolder] = Modal.useModal();
    const [form] = Form.useForm();
    const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    const tz = resolveTimezone(null);

    const [resources, setResources] = useState<Resource[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [type, setType] = useState<Category | 'all'>('all');
    const [search, setSearch] = useState('');
    const [batch, setBatch] = useState<number | 'none' | null>(null);
    const [sort, setSort] = useState<SortKey>('newest');
    const [view, setView] = useState<View>(readView);
    const [page, setPage] = useState(1);

    const [editorOpen, setEditorOpen] = useState(false);
    const [editing, setEditing] = useState<Resource | null>(null);
    const [files, setFiles] = useState<UploadFile[]>([]);
    const [titles, setTitles] = useState<Record<string, string>>({});
    const [uploading, setUploading] = useState(false);
    const [sent, setSent] = useState(0);

    const [preview, setPreview] = useState<Resource | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewFailed, setPreviewFailed] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);
    const [busyId, setBusyId] = useState<number | null>(null);

    /* ── One request; every filter runs in the browser ── */
    const load = useCallback(async () => {
        try {
            const [res, b] = await Promise.all([apiCall('/resources'), apiCall('/batches')]);
            if (!res.ok) throw new Error(`The server answered ${res.status}.`);
            setResources(listOf<Resource>(await res.json(), 'resources'));
            if (b.ok) setBatches(listOf<Batch>(await b.json(), 'batches'));
            setError(null);
        } catch (e: any) {
            setError(e?.message || 'Could not load your resources.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [apiCall]);

    useEffect(() => { load(); }, [load]);
    useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

    const changeView = (v: View) => { setView(v); try { localStorage.setItem(VIEW_KEY, v); } catch { /* private mode */ } };

    const fmt = useMemo(() => {
        const date = new Intl.DateTimeFormat('en-US', { timeZone: tz, month: 'short', day: 'numeric', year: 'numeric' });
        const time = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit' });
        const safe = (f: Intl.DateTimeFormat) => (iso?: string | null) => { if (!iso) return '—'; const d = new Date(iso); return Number.isNaN(d.getTime()) ? '—' : f.format(d); };
        return { date: safe(date), time: safe(time) };
    }, [tz]);

    const batchById = useMemo(() => new Map(batches.map(b => [b.id, b])), [batches]);
    const namesOf = useCallback((res: Resource) => {
        const ids = idsOf(res);
        const joined = (res.batch_names || '').split(', ').filter(Boolean);
        return ids.map((id, i) => batchById.get(id)?.name || joined[i] || `Batch #${id}`);
    }, [batchById]);

    /* ── Figures + filtering ── */
    const scoped = useMemo(() => {
        const q = search.trim().toLowerCase();
        return resources.filter(res => {
            if (batch === 'none' && idsOf(res).length) return false;
            if (typeof batch === 'number' && !idsOf(res).includes(batch)) return false;
            if (q && !`${res.title} ${res.file_name} ${res.description || ''} ${res.batch_names || ''}`.toLowerCase().includes(q)) return false;
            return true;
        });
    }, [resources, batch, search]);

    const lib = useMemo(() => {
        const count: Record<Category | 'all', number> = { all: 0, pdf: 0, video: 0, audio: 0, image: 0, document: 0 };
        const size: Record<Category | 'all', number> = { all: 0, pdf: 0, video: 0, audio: 0, image: 0, document: 0 };
        let fresh = 0, unshared = 0;
        const now = Date.now();
        scoped.forEach(res => {
            const c = categoryOf(res);
            count[c]++; count.all++;
            size[c] += res.file_size || 0; size.all += res.file_size || 0;
            if (now - new Date(res.created_at).getTime() < NEW_MS) fresh++;
            if (!idsOf(res).length) unshared++;
        });
        return { count, size, fresh, unshared };
    }, [scoped]);

    const list = useMemo(() => {
        const out = type === 'all' ? [...scoped] : scoped.filter(res => categoryOf(res) === type);
        const time = (x: Resource) => new Date(x.created_at).getTime() || 0;
        return out.sort((a, b) => {
            if (sort === 'oldest') return time(a) - time(b);
            if (sort === 'name') return a.title.localeCompare(b.title);
            if (sort === 'size') return (b.file_size || 0) - (a.file_size || 0);
            return time(b) - time(a);
        });
    }, [scoped, type, sort]);

    useEffect(() => { setPage(1); }, [type, search, batch, sort]);

    const hasFilters = type !== 'all' || !!search.trim() || batch != null;
    const clearFilters = () => { setType('all'); setSearch(''); setBatch(null); };

    /* ── Actions ── */
    const download = async (res: Resource) => {
        setBusyId(res.id);
        const hide = msg.loading(`Preparing ${res.file_name}…`, 0);
        try {
            const resp = await apiCall(`/resources/${res.id}/download?json=true`);
            if (!resp.ok) throw new Error();
            const a = document.createElement('a');
            a.download = res.file_name;
            if ((resp.headers.get('content-type') || '').includes('application/json')) {
                const data = await resp.json();
                if (!data?.url) throw new Error();
                a.href = data.url; a.target = '_blank'; a.rel = 'noopener';
                document.body.appendChild(a); a.click(); a.remove();
            } else {
                const url = URL.createObjectURL(await resp.blob());
                a.href = url;
                document.body.appendChild(a); a.click(); a.remove();
                window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
            }
        } catch {
            msg.error('The download failed. Please try again.');
        } finally {
            hide();
            setBusyId(null);
        }
    };

    const closePreview = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreview(null); setPreviewUrl(null); setPreviewFailed(false); setFullscreen(false);
    };
    const openPreview = async (res: Resource) => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreview(res); setPreviewUrl(null); setPreviewFailed(false);
        try {
            const resp = await apiCall(`/resources/${res.id}/preview`);
            if (!resp.ok) throw new Error();
            setPreviewUrl(URL.createObjectURL(await resp.blob()));
        } catch {
            setPreviewFailed(true);
        }
    };

    const remove = (res: Resource) => {
        const names = namesOf(res);
        modal.confirm({
            title: `Delete “${res.title}”?`,
            icon: <ExclamationCircleOutlined />,
            content: names.length
                ? `Students in ${names.join(', ')} will no longer see this file${isCloud(res) ? ', and it is removed from cloud storage' : ''}. This can't be undone.`
                : `The file is removed permanently${isCloud(res) ? ', including from cloud storage' : ''}. This can't be undone.`,
            okText: 'Delete file',
            okButtonProps: { danger: true },
            onOk: async () => {
                const resp = await apiCall(`/resources/${res.id}`, { method: 'DELETE' });
                if (!resp.ok) { msg.error('The file could not be deleted.'); throw new Error('delete failed'); }
                setResources(xs => xs.filter(x => x.id !== res.id));
                if (preview?.id === res.id) closePreview();
                msg.success('File deleted');
            },
        });
    };

    const openUpload = () => { setEditing(null); setFiles([]); setTitles({}); form.resetFields(); setEditorOpen(true); };
    const openEdit = (res: Resource) => {
        setEditing(res);
        setFiles([]); setTitles({});
        form.setFieldsValue({ title: res.title, description: res.description || '', batch_ids: idsOf(res) });
        setEditorOpen(true);
    };

    const submitEdit = async (values: any) => {
        if (!editing) return;
        try {
            const resp = await apiCall(`/resources/${editing.id}`, {
                method: 'PUT',
                body: JSON.stringify({ title: values.title, description: values.description || '', batch_ids: values.batch_ids || [] }),
            });
            const d = await resp.json().catch(() => ({}));
            if (!resp.ok) { msg.error(d?.error || 'The changes could not be saved.'); return; }
            msg.success('Resource updated');
            setEditorOpen(false); setEditing(null);
            load();
        } catch {
            msg.error('The changes could not be saved.');
        }
    };

    const submitUpload = async (values: any) => {
        if (!files.length) { msg.error('Choose at least one file.'); return; }
        setUploading(true);
        setSent(0);
        try {
            const body = new FormData();
            const list: string[] = [];
            files.forEach(f => {
                if (f.originFileObj) body.append('files', f.originFileObj);
                list.push((titles[f.uid] || f.name.split('.').slice(0, -1).join('.') || f.name).trim());
            });
            body.append('titles', JSON.stringify(list));
            if (values.description) body.append('description', values.description);
            if (values.batch_ids?.length) body.append('batch_ids', JSON.stringify(values.batch_ids));

            await new Promise<void>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', `${API}/resources`);
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                // Real progress for the part we can measure: the upload to this server.
                xhr.upload.onprogress = e => { if (e.lengthComputable) setSent(Math.round((e.loaded / e.total) * 100)); };
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        msg.success(files.length === 1 ? 'File uploaded' : `${files.length} files uploaded`);
                        setEditorOpen(false); setFiles([]); setTitles({}); form.resetFields();
                        load();
                        resolve();
                    } else {
                        let text = 'The upload failed.';
                        try { text = JSON.parse(xhr.responseText).error || text; } catch { /* keep default */ }
                        msg.error(text);
                        reject(new Error(text));
                    }
                };
                xhr.onerror = () => { msg.error('The upload failed. Check your connection and try again.'); reject(new Error('network')); };
                xhr.send(body);
            });
        } catch {
            /* message already shown */
        } finally {
            setUploading(false);
            setSent(0);
        }
    };

    const batchOptions = useMemo(() => batches.map(b => ({ value: b.id, label: b.name })), [batches]);
    const tzLabel = timezoneLabel(null);

    /* ── Pieces ── */
    const TypeTile = ({ res }: { res: Resource }) => (
        <span className={`rs-file-icon rs-type-${categoryOf(res)}`} aria-hidden>
            {CATEGORIES[categoryOf(res)].icon}<em>{extOf(res)}</em>
        </span>
    );
    const actions = (res: Resource) => (
        <span className="rs-actions">
            <Tooltip title="Preview"><Button type="text" size="small" icon={<EyeOutlined />} aria-label={`Preview ${res.title}`} onClick={e => { e.stopPropagation(); openPreview(res); }} /></Tooltip>
            <Tooltip title="Download"><Button type="text" size="small" aria-label={`Download ${res.title}`} icon={busyId === res.id ? <LoadingOutlined /> : <DownloadOutlined />} onClick={e => { e.stopPropagation(); download(res); }} /></Tooltip>
            <Tooltip title="Edit"><Button type="text" size="small" icon={<EditOutlined />} aria-label={`Edit ${res.title}`} onClick={e => { e.stopPropagation(); openEdit(res); }} /></Tooltip>
            <Tooltip title="Delete"><Button type="text" size="small" className="is-danger" icon={<DeleteOutlined />} aria-label={`Delete ${res.title}`} onClick={e => { e.stopPropagation(); remove(res); }} /></Tooltip>
        </span>
    );

    /* ═══════════ LOADING ═══════════ */
    if (loading) {
        return (
            <div className="rs tc-res" aria-busy="true">
                <div className="rs-header"><div><Skeleton.Input active size="small" style={{ width: 120, height: 12 }} /><div style={{ marginTop: 10 }}><Skeleton.Input active style={{ width: 200, height: 24 }} /></div></div></div>
                <div className="rs-overview rs-overview-loading"><Skeleton active avatar={{ size: 64, shape: 'square' }} title={false} paragraph={{ rows: 3 }} /></div>
                <div className="rs-panel rs-pad"><Skeleton active title={false} paragraph={{ rows: 8 }} /></div>
            </div>
        );
    }

    const pageItems = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <ConfigProvider theme={{ token: { colorPrimary: '#4f46e5', fontSize: 13, borderRadius: 8 } }}>
            {msgHolder}{modalHolder}
            <div className="rs tc-res">
                {/* ── Header ── */}
                <header className="rs-header">
                    <div>
                        <div className="rs-overline">Teacher space</div>
                        <h1 className="rs-title">Resources</h1>
                        <p className="rs-subtitle">Course material you share with your batches. Students see a file as soon as it is assigned to their batch. Times in {tzLabel}.</p>
                    </div>
                    <div className="tc-actions">
                        <Tooltip title="Refresh"><Button icon={<ReloadOutlined spin={refreshing} />} aria-label="Refresh" onClick={() => { setRefreshing(true); load(); }} /></Tooltip>
                        <Button type="primary" icon={<PlusOutlined />} onClick={openUpload}>Upload files</Button>
                    </div>
                </header>

                {error && (
                    <div className="tc-alert" role="alert">
                        <WarningOutlined /><span><strong>Couldn't load your resources.</strong> {error}</span>
                        <Button size="small" onClick={() => { setRefreshing(true); load(); }}>Retry</Button>
                    </div>
                )}

                {/* ── Library overview ── */}
                <section className="rs-overview" aria-label="Library">
                    <div className="rs-hero">
                        <span className="rs-hero-art"><FolderOpenOutlined /></span>
                        <div className="rs-hero-text">
                            <div className="rs-hero-label">{hasFilters ? 'Matching files' : 'Your library'}</div>
                            <div className="rs-hero-value">
                                <span>{lib.count.all} <small>{lib.count.all === 1 ? 'file' : 'files'}</small></span>
                                {lib.fresh > 0 && <span className="rs-new-chip">{lib.fresh} this week</span>}
                            </div>
                            <div className="rs-hero-note">
                                <HddOutlined />
                                <span>{fmtSize(lib.size.all)}{lib.unshared > 0 && <> · <button type="button" className="tc-link" onClick={() => setBatch('none')}>{lib.unshared} not shared</button></>}</span>
                            </div>
                        </div>
                    </div>
                    <div className="rs-types" role="tablist" aria-label="File type">
                        <button type="button" role="tab" aria-selected={type === 'all'} className={`rs-type-tile is-all${type === 'all' ? ' is-active' : ''}`} onClick={() => setType('all')}>
                            <span className="rs-type-tile-icon"><AppstoreOutlined /></span>
                            <span className="rs-type-tile-text"><span>All files</span><span className="rs-type-tile-count"><strong>{lib.count.all}</strong><em>{fmtSize(lib.size.all)}</em></span></span>
                        </button>
                        {CATEGORY_KEYS.map(k => (
                            <button key={k} type="button" role="tab" aria-selected={type === k} disabled={!lib.count[k]}
                                className={`rs-type-tile rs-type-${k}${type === k ? ' is-active' : ''}`} onClick={() => setType(k)}>
                                <span className="rs-type-tile-icon">{CATEGORIES[k].icon}</span>
                                <span className="rs-type-tile-text"><span>{CATEGORIES[k].plural}</span><span className="rs-type-tile-count"><strong>{lib.count[k]}</strong>{lib.count[k] > 0 && <em>{fmtSize(lib.size[k])}</em>}</span></span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* ── Files ── */}
                <section className="rs-panel" aria-label="Files">
                    <div className="rs-toolbar">
                        <div className="rs-toolbar-title">{type === 'all' ? 'All files' : CATEGORIES[type].plural}<span className="rs-count">{list.length}</span></div>
                        <div className="rs-filters">
                            <Input className="rs-search" allowClear prefix={<SearchOutlined className="rs-muted" />} placeholder="Search files" value={search} onChange={e => setSearch(e.target.value)} aria-label="Search files" />
                            <Select<number | 'none'> className="rs-filter" allowClear showSearch optionFilterProp="label" placeholder="All batches"
                                value={batch ?? undefined} onChange={v => setBatch(v ?? null)}
                                options={[{ value: 'none' as const, label: 'Not shared with a batch' }, ...batchOptions]} />
                            <Select<SortKey> className="rs-sort" value={sort} onChange={setSort} aria-label="Sort" options={[
                                { value: 'newest', label: 'Newest first' }, { value: 'oldest', label: 'Oldest first' },
                                { value: 'name', label: 'Name (A–Z)' }, { value: 'size', label: 'Largest first' },
                            ]} />
                            {!r.isMobile && (
                                <Segmented<View> value={view} onChange={changeView} aria-label="Layout" options={[
                                    { value: 'list', icon: <UnorderedListOutlined />, title: 'List' },
                                    { value: 'grid', icon: <AppstoreOutlined />, title: 'Grid' },
                                ]} />
                            )}
                            {hasFilters && <Button type="link" size="small" onClick={clearFilters}>Clear</Button>}
                        </div>
                    </div>

                    {list.length === 0 ? (
                        <div className="rs-empty">
                            <span className="rs-empty-art"><FolderOpenOutlined /></span>
                            <strong>{resources.length === 0 ? 'No resources yet' : 'No files match these filters'}</strong>
                            <span>{resources.length === 0 ? 'Upload a file and assign it to a batch — your students see it straight away.' : 'Try another type, batch or search term.'}</span>
                            {resources.length === 0
                                ? <Button type="primary" icon={<PlusOutlined />} onClick={openUpload}>Upload files</Button>
                                : hasFilters && <Button size="small" onClick={clearFilters}>Clear filters</Button>}
                        </div>
                    ) : view === 'grid' && !r.isMobile ? (
                        <div className="rs-grid">
                            {pageItems.map(res => {
                                const names = namesOf(res);
                                return (
                                    <article key={res.id} className={`rs-card rs-type-${categoryOf(res)}`} onClick={() => openPreview(res)} tabIndex={0} onKeyDown={e => { if (e.key === 'Enter') openPreview(res); }}>
                                        <div className="rs-card-art">
                                            <span className="rs-card-ext">{extOf(res)}</span>
                                            {Date.now() - new Date(res.created_at).getTime() < NEW_MS && <span className="rs-badge-new">New</span>}
                                            <span className="rs-card-icon">{CATEGORIES[categoryOf(res)].icon}</span>
                                            <span className="rs-card-hover"><EyeOutlined /> Preview</span>
                                        </div>
                                        <div className="rs-card-body">
                                            <div className="rs-card-title" title={res.title}>{res.title}</div>
                                            <div className="rs-card-meta">{fmtSize(res.file_size)} · {fmt.date(res.created_at)}</div>
                                        </div>
                                        <div className="rs-card-foot">
                                            <span className={`rs-card-batches${names.length ? '' : ' tc-warn'}`}><TeamOutlined /> {names.join(', ') || 'Not shared'}</span>
                                            {actions(res)}
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    ) : (
                        <ul className="rs-list">
                            {!r.isMobile && <li className="rs-list-head" aria-hidden><span>File</span><span>Shared with</span><span>Storage</span><span>Uploaded</span><span /></li>}
                            {pageItems.map(res => {
                                const names = namesOf(res);
                                return (
                                    <li key={res.id}>
                                        <div className="rs-row" role="button" tabIndex={0} onClick={() => openPreview(res)} onKeyDown={e => { if (e.key === 'Enter') openPreview(res); }}>
                                            <span className="rs-row-file">
                                                <TypeTile res={res} />
                                                <span className="rs-row-text">
                                                    <span className="rs-row-title">{res.title}{Date.now() - new Date(res.created_at).getTime() < NEW_MS && <span className="rs-badge-new">New</span>}</span>
                                                    <span className="rs-row-meta">{res.file_name} · {fmtSize(res.file_size)}{r.isMobile ? ` · ${fmt.date(res.created_at)}` : ''}</span>
                                                </span>
                                            </span>
                                            {!r.isMobile && (
                                                <span className="rs-row-tags">
                                                    {names.length
                                                        ? names.slice(0, 2).map(n => <span key={n} className="rs-chip"><TeamOutlined /> {n}</span>)
                                                        : <span className="rs-chip tc-chip-warn">Not shared</span>}
                                                    {names.length > 2 && <Tooltip title={names.slice(2).join(', ')}><span className="rs-chip">+{names.length - 2}</span></Tooltip>}
                                                </span>
                                            )}
                                            {!r.isMobile && <span><span className={`tc-res-store ${isCloud(res) ? 'is-cloud' : 'is-local'}`}>{isCloud(res) ? <><CloudUploadOutlined /> Cloud</> : <><HddOutlined /> Server</>}</span></span>}
                                            {!r.isMobile && <span className="rs-row-date"><span>{fmt.date(res.created_at)}</span><span className="rs-muted">{fmt.time(res.created_at)}</span></span>}
                                            {actions(res)}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    {list.length > PAGE_SIZE && (
                        <div className="rs-foot">
                            <Pagination size="small" current={page} pageSize={PAGE_SIZE} total={list.length} onChange={setPage} showSizeChanger={false} simple={r.isMobile}
                                showTotal={r.isMobile ? undefined : (t, [a, b]) => `${a}–${b} of ${t}`} />
                        </div>
                    )}
                </section>

                {/* ── Upload / edit ── */}
                <Modal open={editorOpen} onCancel={() => { if (!uploading) { setEditorOpen(false); setEditing(null); } }}
                    okText={editing ? 'Save changes' : files.length > 1 ? `Upload ${files.length} files` : 'Upload'}
                    okButtonProps={{ disabled: !editing && files.length === 0, icon: editing ? <EditOutlined /> : <CloudUploadOutlined /> }}
                    confirmLoading={uploading} onOk={() => form.submit()} closable={false} title={null}
                    width="min(640px, calc(100vw - 24px))" wrapClassName="tc-modal" styles={{ body: { padding: 0 } }}
                    maskClosable={!uploading} destroyOnHidden>
                    <header className="tc-up-head">
                        <span className="tc-up-ic">{editing ? <EditOutlined /> : <CloudUploadOutlined />}</span>
                        <div>
                            <h2>{editing ? 'Edit resource' : 'Upload resources'}</h2>
                            <p>{editing ? 'Rename it, or change which batches can see it.' : 'Files are stored securely; students only see them once a batch is assigned.'}</p>
                        </div>
                    </header>
                    {uploading ? (
                        <div className="tc-up-progress">
                            <CloudUploadOutlined />
                            <strong>{sent < 100 ? 'Sending your files…' : 'Storing in the cloud…'}</strong>
                            <span>{sent < 100 ? 'Please keep this window open.' : 'Almost done — this can take a moment for large files.'}</span>
                            <Progress percent={sent} status={sent < 100 ? 'active' : undefined} strokeColor="#4f46e5" />
                        </div>
                    ) : (
                        <div className="tc-up-body">
                            <Form form={form} layout="vertical" requiredMark={false} onFinish={editing ? submitEdit : submitUpload}>
                                {editing && (
                                    <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Enter a title' }]}>
                                        <Input placeholder="e.g. Grammar — chapter 3" maxLength={120} />
                                    </Form.Item>
                                )}
                                <Form.Item name="batch_ids" label={<>Share with batches <em className="rs-muted">optional</em></>}
                                    extra="Leave empty to keep the file private until you assign it.">
                                    <Select mode="multiple" allowClear placeholder="Choose batches" options={batchOptions} optionFilterProp="label" />
                                </Form.Item>
                                <Form.Item name="description" label={<>Description <em className="rs-muted">optional</em></>}>
                                    <Input.TextArea rows={2} placeholder="What is this file for?" maxLength={500} />
                                </Form.Item>
                                {!editing && (
                                    <>
                                        <Upload.Dragger multiple beforeUpload={() => false} showUploadList={false} fileList={files}
                                            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.mp4,.avi,.mov,.webm,.mp3,.wav,.ogg,.m4a,.jpg,.jpeg,.png,.gif,.zip"
                                            onChange={({ fileList }) => {
                                                setFiles(fileList);
                                                setTitles(prev => {
                                                    const next = { ...prev };
                                                    fileList.forEach(f => { if (!next[f.uid]) next[f.uid] = f.name.split('.').slice(0, -1).join('.') || f.name; });
                                                    return next;
                                                });
                                            }}>
                                            <p className="ant-upload-drag-icon"><CloudUploadOutlined style={{ color: '#4f46e5' }} /></p>
                                            <p className="ant-upload-text">Drop files here, or click to choose</p>
                                            <p className="ant-upload-hint">PDF, video, audio, images and documents. Up to 50 files at a time.</p>
                                        </Upload.Dragger>
                                        {files.length > 0 && (
                                            <div className="tc-up-files">
                                                {files.map(f => (
                                                    <div key={f.uid} className="tc-up-file">
                                                        <FileTextOutlined />
                                                        <span className="tc-up-file-main">
                                                            <Input size="small" value={titles[f.uid]} placeholder="Title shown to students"
                                                                onChange={e => setTitles(prev => ({ ...prev, [f.uid]: e.target.value }))} />
                                                            <em>{f.name} · {fmtSize(f.size || 0)}</em>
                                                        </span>
                                                        <Tooltip title="Remove"><Button type="text" size="small" icon={<CloseOutlined />} aria-label={`Remove ${f.name}`}
                                                            onClick={() => setFiles(list => list.filter(x => x.uid !== f.uid))} /></Tooltip>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </Form>
                        </div>
                    )}
                </Modal>

                {/* ── Preview ── */}
                <Modal open={!!preview} onCancel={closePreview} footer={null} closable={false} centered={!fullscreen && !r.isMobile} destroyOnHidden
                    width={fullscreen || r.isMobile ? '100%' : Math.min(1080, r.width - 64)}
                    wrapClassName={`rs-preview tc-preview${fullscreen || r.isMobile ? ' is-full' : ''}`}
                    styles={{ content: { padding: 0 }, body: { padding: 0 } }}>
                    {preview && (
                        <div className="rs-pv">
                            <header className={`rs-pv-head rs-type-${categoryOf(preview)}`}>
                                <TypeTile res={preview} />
                                <div className="rs-pv-info">
                                    <div className="rs-pv-title" title={preview.title}>{preview.title}</div>
                                    <div className="rs-pv-meta">
                                        {fmtSize(preview.file_size)} · {fmt.date(preview.created_at)} · <TeamOutlined /> {namesOf(preview).join(', ') || 'Not shared with a batch'}
                                    </div>
                                </div>
                                <div className="rs-pv-actions">
                                    <Button type="primary" icon={busyId === preview.id ? <LoadingOutlined /> : <DownloadOutlined />} onClick={() => download(preview)}>{!r.isMobile && 'Download'}</Button>
                                    <Tooltip title="Edit"><Button type="text" icon={<EditOutlined />} onClick={() => { closePreview(); openEdit(preview); }} aria-label="Edit" /></Tooltip>
                                    {!r.isMobile && (
                                        <Tooltip title={fullscreen ? 'Exit full screen' : 'Full screen'}>
                                            <Button type="text" icon={fullscreen ? <CompressOutlined /> : <ExpandOutlined />} onClick={() => setFullscreen(f => !f)} aria-label={fullscreen ? 'Exit full screen' : 'Full screen'} />
                                        </Tooltip>
                                    )}
                                    <Button type="text" icon={<CloseOutlined />} onClick={closePreview} aria-label="Close preview" />
                                </div>
                            </header>
                            <div className={`rs-pv-body is-${categoryOf(preview)}`}>
                                {previewFailed ? (
                                    <div className="rs-pv-state"><ExclamationCircleOutlined /><strong>The preview could not be loaded</strong><span>You can still download the file.</span><Button type="primary" icon={<DownloadOutlined />} onClick={() => download(preview)}>Download</Button></div>
                                ) : !previewUrl ? (
                                    <div className="rs-pv-state"><LoadingOutlined /><span>Loading preview…</span></div>
                                ) : categoryOf(preview) === 'pdf' ? <PdfViewer src={previewUrl} />
                                    : categoryOf(preview) === 'video' ? <video controls className="rs-pv-video" src={previewUrl} />
                                        : categoryOf(preview) === 'audio' ? (
                                            <div className="rs-pv-audio"><span className="rs-pv-audio-art rs-type-audio"><SoundOutlined /></span><strong>{preview.title}</strong><audio controls src={previewUrl} /></div>
                                        ) : categoryOf(preview) === 'image' ? <img className="rs-pv-image" src={previewUrl} alt={preview.title} />
                                            : (
                                                <div className="rs-pv-state"><FileTextOutlined /><strong>No preview for this file type</strong><span>Download the file to open it on your device.</span><Button type="primary" icon={<DownloadOutlined />} onClick={() => download(preview)}>Download</Button></div>
                                            )}
                            </div>
                            {preview.description && <footer className="rs-pv-desc"><strong>About this file</strong><p>{preview.description}</p></footer>}
                        </div>
                    )}
                </Modal>
            </div>
        </ConfigProvider>
    );
};

export default ResourceManagement;
