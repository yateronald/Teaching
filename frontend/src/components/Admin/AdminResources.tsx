import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, ConfigProvider, DatePicker, Input, Modal, Pagination, Segmented, Select, Skeleton, Tooltip, message } from 'antd';
import {
    AppstoreOutlined, CloseOutlined, CloudOutlined, CompressOutlined, DatabaseOutlined, DeleteOutlined, DownloadOutlined,
    ExclamationCircleOutlined, ExpandOutlined, EyeOutlined, FilePdfOutlined, FileTextOutlined, FolderOpenOutlined, HddOutlined,
    LoadingOutlined, PictureOutlined, ReloadOutlined, RiseOutlined, SearchOutlined, SoundOutlined, TeamOutlined,
    UnorderedListOutlined, UserOutlined, VideoCameraOutlined, WarningOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { useAuth } from '../../contexts/AuthContext';
import useResponsive from '../../hooks/useResponsive';
import PdfViewer from '../Common/PdfViewer';
import { resolveTimezone, timezoneLabel } from '../../utils/timezone';
import { initials, statusOf } from './batchUtils';
import type { Batch } from './batchUtils';
// Shares the file tiles, cards and preview with the student library, recoloured for the admin console.
import '../Student/StudentResources.css';
import './AdminResources.css';

/* ══════════════════════════════════════════
   ADMIN — RESOURCES
   Every file shared on the platform: who shares what, with which batches,
   where it is stored — plus preview, download and delete.
══════════════════════════════════════════ */

interface Resource {
    id: number;
    title: string;
    description?: string | null;
    file_name: string;
    file_type?: string;
    file_size: number;
    batch_ids: number[] | null;
    batch_names?: string | null;
    teacher_id: number;
    teacher_first_name?: string | null;
    teacher_last_name?: string | null;
    category: string;
    storage_type: string;
    created_at: string;
}
interface Person { id: number; first_name?: string; last_name?: string; }

type Category = 'pdf' | 'video' | 'audio' | 'image' | 'document';
type SortKey = 'newest' | 'oldest' | 'name' | 'size';
type View = 'list' | 'grid';
type Storage = 'all' | 'cloud' | 'local';

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
const VIEW_KEY = 'lfn.admin.resources.view';
const NEW_MS = 7 * 86_400_000;

const fmtSize = (b: number) => {
    if (!b) return '0 B';
    const k = 1024, units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.min(units.length - 1, Math.floor(Math.log(b) / Math.log(k)));
    return `${parseFloat((b / Math.pow(k, i)).toFixed(1))} ${units[i]}`;
};
const teacherName = (r: Resource) => [r.teacher_first_name, r.teacher_last_name].filter(Boolean).join(' ').trim() || 'Unknown teacher';
const isCloud = (r: Resource) => r.storage_type === 'kdrive';
const extOf = (r: Resource) => (r.file_name.includes('.') ? r.file_name.split('.').pop()!.slice(0, 4).toUpperCase() : CATEGORIES[categoryOf(r)].label.toUpperCase());
const idsOf = (r: Resource) => (Array.isArray(r.batch_ids) ? r.batch_ids.filter(x => x != null) : []);
const readView = (): View => { try { return localStorage.getItem(VIEW_KEY) === 'grid' ? 'grid' : 'list'; } catch { return 'list'; } };
const listOf = <T,>(d: unknown, key: string): T[] => (Array.isArray(d) ? d : Array.isArray((d as any)?.[key]) ? (d as any)[key] : []);

const keyFmts = new Map<string, Intl.DateTimeFormat>();
/** YYYY-MM-DD of an instant in the viewer's timezone. */
const dayKey = (iso: string, tz: string) => {
    let f = keyFmts.get(tz);
    if (!f) { f = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }); keyFmts.set(tz, f); }
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? '' : f.format(d);
};

const AdminResources: React.FC = () => {
    const r = useResponsive();
    const { apiCall, user } = useAuth();
    const tz = resolveTimezone(user?.timezone);
    const tzLabel = timezoneLabel(user?.timezone);
    const [msg, msgHolder] = message.useMessage();
    const [modal, modalHolder] = Modal.useModal();

    const [resources, setResources] = useState<Resource[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [teachers, setTeachers] = useState<Person[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [type, setType] = useState<Category | 'all'>('all');
    const [search, setSearch] = useState('');
    const [teacher, setTeacher] = useState<number | null>(null);
    const [batch, setBatch] = useState<number | 'none' | null>(null);
    const [storage, setStorage] = useState<Storage>('all');
    const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
    const [sort, setSort] = useState<SortKey>('newest');
    const [view, setView] = useState<View>(readView);
    const [page, setPage] = useState(1);

    const [preview, setPreview] = useState<Resource | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewFailed, setPreviewFailed] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);
    const [busyId, setBusyId] = useState<number | null>(null);

    const load = useCallback(async () => {
        try {
            const [rRes, bRes, tRes] = await Promise.all([apiCall('/resources'), apiCall('/batches'), apiCall('/users?role=teacher')]);
            if (!rRes.ok) throw new Error(`The server answered ${rRes.status}.`);
            setResources(listOf<Resource>(await rRes.json(), 'resources'));
            if (bRes.ok) setBatches(listOf<Batch>(await bRes.json(), 'batches'));
            if (tRes.ok) setTeachers(listOf<Person>(await tRes.json(), 'users'));
            setError(null);
        } catch (e: any) {
            setError(e?.message || 'Could not load resources.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [apiCall]);

    useEffect(() => { load(); }, [load]);

    const changeView = (v: View) => { setView(v); try { localStorage.setItem(VIEW_KEY, v); } catch { /* private mode */ } };

    const fmt = useMemo(() => {
        const date = new Intl.DateTimeFormat('en-US', { timeZone: tz, month: 'short', day: 'numeric', year: 'numeric' });
        const time = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit' });
        const safe = (f: Intl.DateTimeFormat) => (iso?: string | null) => { if (!iso) return '—'; const d = new Date(iso); return Number.isNaN(d.getTime()) ? '—' : f.format(d); };
        return { date: safe(date), time: safe(time) };
    }, [tz]);

    /* ── Batch names come from the batch list (ids are authoritative); fall back to the joined names. ── */
    const batchById = useMemo(() => new Map(batches.map(b => [b.id, b])), [batches]);
    const batchNamesOf = useCallback((res: Resource) => {
        const ids = idsOf(res);
        const joined = (res.batch_names || '').split(', ').filter(Boolean);
        return ids.map((id, i) => batchById.get(id)?.name || joined[i] || `Batch #${id}`);
    }, [batchById]);

    /* ═══════════ FILTERING ═══════════ */
    const scoped = useMemo(() => {
        const q = search.trim().toLowerCase();
        const from = range ? range[0].format('YYYY-MM-DD') : null;
        const to = range ? range[1].format('YYYY-MM-DD') : null;
        return resources.filter(res => {
            if (teacher && res.teacher_id !== teacher) return false;
            if (batch === 'none' && idsOf(res).length) return false;
            if (typeof batch === 'number' && !idsOf(res).includes(batch)) return false;
            if (storage !== 'all' && (storage === 'cloud') !== isCloud(res)) return false;
            if (from && to) { const k = dayKey(res.created_at, tz); if (k < from || k > to) return false; }
            if (q && !`${res.title} ${res.file_name} ${res.description || ''} ${teacherName(res)} ${res.batch_names || ''}`.toLowerCase().includes(q)) return false;
            return true;
        });
    }, [resources, teacher, batch, storage, range, search, tz]);

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

    useEffect(() => { setPage(1); }, [type, search, teacher, batch, storage, range, sort]);

    const hasFilters = type !== 'all' || !!search.trim() || !!teacher || batch != null || storage !== 'all' || !!range;
    const clearFilters = () => { setType('all'); setSearch(''); setTeacher(null); setBatch(null); setStorage('all'); setRange(null); };

    /* ═══════════ INSIGHTS (on the scoped set) ═══════════ */
    const lib = useMemo(() => {
        const count: Record<Category | 'all', number> = { all: 0, pdf: 0, video: 0, audio: 0, image: 0, document: 0 };
        const size: Record<Category | 'all', number> = { all: 0, pdf: 0, video: 0, audio: 0, image: 0, document: 0 };
        let cloud = 0, cloudSize = 0, fresh = 0, unshared = 0;
        const now = Date.now();
        scoped.forEach(res => {
            const c = categoryOf(res);
            const s = res.file_size || 0;
            count[c]++; count.all++; size[c] += s; size.all += s;
            if (isCloud(res)) { cloud++; cloudSize += s; }
            if (now - new Date(res.created_at).getTime() < NEW_MS) fresh++;
            if (!idsOf(res).length) unshared++;
        });
        return { count, size, cloud, cloudSize, local: count.all - cloud, localSize: size.all - cloudSize, fresh, unshared };
    }, [scoped]);

    const months = useMemo(() => {
        const out = Array.from({ length: 6 }, (_, i) => {
            const m = dayjs().startOf('month').subtract(5 - i, 'month');
            return { key: m.format('YYYY-MM'), label: m.format('MMM'), long: m.format('MMMM YYYY'), n: 0, size: 0 };
        });
        const idx = new Map(out.map((m, i) => [m.key, i]));
        scoped.forEach(res => {
            const i = idx.get(dayKey(res.created_at, tz).slice(0, 7));
            if (i != null) { out[i].n++; out[i].size += res.file_size || 0; }
        });
        return out;
    }, [scoped, tz]);
    const maxMonth = Math.max(1, ...months.map(m => m.n));
    const thisMonth = months[5];
    const lastMonth = months[4];

    const teacherRows = useMemo(() => {
        const map = new Map<number, { id: number; name: string; n: number; size: number; last: string }>();
        scoped.forEach(res => {
            let t = map.get(res.teacher_id);
            if (!t) { t = { id: res.teacher_id, name: teacherName(res), n: 0, size: 0, last: res.created_at }; map.set(res.teacher_id, t); }
            t.n++; t.size += res.file_size || 0;
            if (res.created_at > t.last) t.last = res.created_at;
        });
        return Array.from(map.values()).sort((a, b) => b.n - a.n);
    }, [scoped]);
    const silentTeachers = useMemo(() => {
        const sharing = new Set(resources.map(x => x.teacher_id));
        return teachers.filter(t => !sharing.has(t.id));
    }, [teachers, resources]);

    const batchRows = useMemo(() => {
        const map = new Map<number, { id: number; name: string; n: number }>();
        scoped.forEach(res => idsOf(res).forEach((id, i) => {
            let b = map.get(id);
            if (!b) { b = { id, name: batchNamesOf(res)[i], n: 0 }; map.set(id, b); }
            b.n++;
        }));
        return Array.from(map.values()).sort((a, b) => b.n - a.n);
    }, [scoped, batchNamesOf]);
    const bareBatches = useMemo(() => {
        const covered = new Set(resources.flatMap(idsOf));
        return batches.filter(b => statusOf(b) !== 'ended' && !covered.has(b.id));
    }, [batches, resources]);
    const maxTeacher = Math.max(1, ...teacherRows.map(t => t.n));
    const maxBatch = Math.max(1, ...batchRows.map(b => b.n));

    const teacherOptions = useMemo(() => {
        const map = new Map<number, string>();
        teachers.forEach(t => map.set(t.id, `${t.first_name || ''} ${t.last_name || ''}`.trim()));
        resources.forEach(x => { if (!map.has(x.teacher_id)) map.set(x.teacher_id, teacherName(x)); });
        return Array.from(map, ([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label));
    }, [teachers, resources]);
    const batchOptions = useMemo(() => [
        { value: 'none' as const, label: 'Not shared with any batch' },
        ...batches.map(b => ({ value: b.id, label: b.name })).sort((a, b) => a.label.localeCompare(b.label)),
    ], [batches]);

    /* ═══════════ ACTIONS ═══════════ */
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
        modal.confirm({
            title: `Delete “${res.title}”?`,
            icon: <ExclamationCircleOutlined />,
            content: `The file is removed for ${teacherName(res)} and every batch it is shared with${isCloud(res) ? ', and deleted from cloud storage' : ''}. This can't be undone.`,
            okText: 'Delete file',
            okButtonProps: { danger: true },
            cancelText: 'Cancel',
            onOk: async () => {
                const resp = await apiCall(`/resources/${res.id}`, { method: 'DELETE' });
                if (!resp.ok) { msg.error('The file could not be deleted.'); throw new Error('delete failed'); }
                setResources(xs => xs.filter(x => x.id !== res.id));
                if (preview?.id === res.id) closePreview();
                msg.success('File deleted.');
            },
        });
    };

    /* ── pieces ── */
    const TypeTile = ({ res }: { res: Resource }) => (
        <span className={`rs-file-icon rs-type-${categoryOf(res)}`} aria-hidden>
            {CATEGORIES[categoryOf(res)].icon}
            <em>{extOf(res)}</em>
        </span>
    );
    const StorageChip = ({ res }: { res: Resource }) => (
        <span className={`ar-store ${isCloud(res) ? 'is-cloud' : 'is-local'}`}>{isCloud(res) ? <><CloudOutlined /> Cloud</> : <><HddOutlined /> Server</>}</span>
    );
    const actions = (res: Resource) => (
        <span className="rs-actions ar-actions">
            <Tooltip title="Preview"><Button type="text" size="small" icon={<EyeOutlined />} aria-label={`Preview ${res.title}`} onClick={e => { e.stopPropagation(); openPreview(res); }} /></Tooltip>
            <Tooltip title="Download"><Button type="text" size="small" aria-label={`Download ${res.title}`} icon={busyId === res.id ? <LoadingOutlined /> : <DownloadOutlined />} onClick={e => { e.stopPropagation(); download(res); }} /></Tooltip>
            <Tooltip title="Delete"><Button type="text" size="small" className="is-danger" icon={<DeleteOutlined />} aria-label={`Delete ${res.title}`} onClick={e => { e.stopPropagation(); remove(res); }} /></Tooltip>
        </span>
    );

    /* ═══════════ LOADING ═══════════ */
    if (loading) return (
        <div className="rs ar" aria-busy="true">
            <div className="rs-header"><div><Skeleton.Input active size="small" style={{ width: 130, height: 12 }} /><div style={{ marginTop: 10 }}><Skeleton.Input active style={{ width: 220, height: 24 }} /></div></div></div>
            <div className="rs-overview rs-overview-loading"><Skeleton active avatar={{ size: 64, shape: 'square' }} title={false} paragraph={{ rows: 3 }} /></div>
            <div className="ar-insights">{[0, 1, 2].map(i => <div key={i} className="ar-card rs-pad"><Skeleton active paragraph={{ rows: 5 }} /></div>)}</div>
        </div>
    );

    const pageItems = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const cloudPct = lib.size.all ? Math.round((lib.cloudSize / lib.size.all) * 100) : 0;
    const monthDelta = thisMonth.n - lastMonth.n;

    return (
        <ConfigProvider theme={{ token: { colorPrimary: '#4f46e5', fontSize: 13, borderRadius: 8 } }}>
            {msgHolder}{modalHolder}
            <div className="rs ar">
                {/* ── Header ── */}
                <header className="rs-header">
                    <div>
                        <div className="rs-overline">Admin console · Content</div>
                        <h1 className="rs-title">Resources</h1>
                        <p className="rs-subtitle">Every file teachers share on the platform — who shares what, with which batches, and where it's stored. Times in {tzLabel}.</p>
                    </div>
                    <Tooltip title="Refresh"><Button icon={<ReloadOutlined spin={refreshing} />} aria-label="Refresh" onClick={() => { setRefreshing(true); load(); }} /></Tooltip>
                </header>

                {error && <div className="ar-alert" role="alert"><WarningOutlined /><span><strong>Couldn't load resources.</strong> {error}</span><Button size="small" onClick={() => { setRefreshing(true); load(); }}>Retry</Button></div>}

                {/* ── Library overview (type tiles filter the files below) ── */}
                <section className="rs-overview" aria-label="Library">
                    <div className="rs-hero">
                        <span className="rs-hero-art"><FolderOpenOutlined /></span>
                        <div className="rs-hero-text">
                            <div className="rs-hero-label">{hasFilters && type === 'all' ? 'Matching files' : 'Platform library'}</div>
                            <div className="rs-hero-value">
                                <span>{lib.count.all} <small>{lib.count.all === 1 ? 'file' : 'files'}</small></span>
                                {lib.fresh > 0 && <span className="rs-new-chip">{lib.fresh} this week</span>}
                            </div>
                            <div className="rs-hero-note"><DatabaseOutlined /><span>{fmtSize(lib.size.all)} stored</span></div>
                            <Tooltip title={`Cloud: ${lib.cloud} files · ${fmtSize(lib.cloudSize)} — Server: ${lib.local} files · ${fmtSize(lib.localSize)}`}>
                                <div className="ar-split" aria-label={`${cloudPct}% of storage in the cloud`}>
                                    <span className="ar-split-bar"><span style={{ width: `${cloudPct}%` }} /></span>
                                    <span className="ar-split-legend"><span><i className="is-cloud" />Cloud {lib.cloud}</span><span><i className="is-local" />Server {lib.local}</span></span>
                                </div>
                            </Tooltip>
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

                {/* ── Insights ── */}
                <div className="ar-insights">
                    <section className="ar-card">
                        <div className="ar-card-head">
                            <span className="ar-card-title"><span className="ar-card-ic"><RiseOutlined /></span>Upload activity</span>
                            <span className="ar-card-note">last 6 months</span>
                        </div>
                        <div className="ar-card-body">
                            <div className="ar-months">
                                {months.map((m, i) => (
                                    <Tooltip key={m.key} title={`${m.long}: ${m.n} ${m.n === 1 ? 'file' : 'files'}${m.n ? ` · ${fmtSize(m.size)}` : ''}`}>
                                        <div className={`ar-month${i === 5 ? ' is-now' : ''}`}>
                                            <strong>{m.n || ''}</strong>
                                            <span className="ar-month-bar"><span style={{ height: `${(m.n / maxMonth) * 100}%` }} /></span>
                                            <em>{m.label}</em>
                                        </div>
                                    </Tooltip>
                                ))}
                            </div>
                            <p className="ar-insight">
                                <strong>{thisMonth.n}</strong> {thisMonth.n === 1 ? 'file' : 'files'} shared this month
                                {lastMonth.n > 0 || thisMonth.n > 0 ? (
                                    <span className={`ar-delta ${monthDelta > 0 ? 'is-up' : monthDelta < 0 ? 'is-down' : ''}`}> {monthDelta > 0 ? '▲' : monthDelta < 0 ? '▼' : '•'} {Math.abs(monthDelta)} vs {lastMonth.label}</span>
                                ) : null}
                            </p>
                        </div>
                    </section>

                    <section className="ar-card">
                        <div className="ar-card-head">
                            <span className="ar-card-title"><span className="ar-card-ic"><UserOutlined /></span>Teachers</span>
                            <span className="ar-card-note">{teacherRows.length} sharing</span>
                        </div>
                        <ul className="ar-bars">
                            {teacherRows.slice(0, 5).map(t => (
                                <li key={t.id}>
                                    <button type="button" className={teacher === t.id ? 'is-on' : ''} onClick={() => setTeacher(teacher === t.id ? null : t.id)} title="Filter by this teacher">
                                        <span className="ar-av">{initials(t.name)}</span>
                                        <span className="ar-bars-main">
                                            <span className="ar-bars-top"><strong>{t.name}</strong><em>{t.n} · {fmtSize(t.size)}</em></span>
                                            <span className="ar-bars-track"><span style={{ width: `${(t.n / maxTeacher) * 100}%` }} /></span>
                                        </span>
                                    </button>
                                </li>
                            ))}
                            {teacherRows.length === 0 && <li className="ar-none">No files for these filters.</li>}
                        </ul>
                        {silentTeachers.length > 0 && (
                            <div className="ar-card-foot"><WarningOutlined className="ar-amber" /> {silentTeachers.length} {silentTeachers.length === 1 ? 'teacher hasn\'t' : 'teachers haven\'t'} shared any file yet: {silentTeachers.slice(0, 3).map(t => `${t.first_name || ''} ${t.last_name || ''}`.trim()).join(', ')}{silentTeachers.length > 3 ? '…' : ''}</div>
                        )}
                    </section>

                    <section className="ar-card">
                        <div className="ar-card-head">
                            <span className="ar-card-title"><span className="ar-card-ic"><TeamOutlined /></span>Batches</span>
                            <span className="ar-card-note">{batchRows.length} with files</span>
                        </div>
                        <ul className="ar-bars">
                            {batchRows.slice(0, 5).map(b => (
                                <li key={b.id}>
                                    <button type="button" className={batch === b.id ? 'is-on' : ''} onClick={() => setBatch(batch === b.id ? null : b.id)} title="Filter by this batch">
                                        <span className="ar-bars-main">
                                            <span className="ar-bars-top"><strong>{b.name}</strong><em>{b.n} {b.n === 1 ? 'file' : 'files'}</em></span>
                                            <span className="ar-bars-track is-violet"><span style={{ width: `${(b.n / maxBatch) * 100}%` }} /></span>
                                        </span>
                                    </button>
                                </li>
                            ))}
                            {batchRows.length === 0 && <li className="ar-none">No file is shared with a batch here.</li>}
                        </ul>
                        {(lib.unshared > 0 || bareBatches.length > 0) && (
                            <div className="ar-card-foot ar-flags">
                                {lib.unshared > 0 && <button type="button" className="ar-flag" onClick={() => setBatch('none')}><WarningOutlined /> {lib.unshared} {lib.unshared === 1 ? 'file isn\'t' : 'files aren\'t'} shared with any batch</button>}
                                {bareBatches.length > 0 && (
                                    <Tooltip title={bareBatches.map(b => b.name).join(', ')}>
                                        <span className="ar-flag is-muted"><TeamOutlined /> {bareBatches.length} active {bareBatches.length === 1 ? 'batch has' : 'batches have'} no files</span>
                                    </Tooltip>
                                )}
                            </div>
                        )}
                    </section>
                </div>

                {/* ── Files ── */}
                <section className="rs-panel" aria-label="Files">
                    <div className="rs-toolbar">
                        <div className="rs-toolbar-title">{type === 'all' ? 'All files' : CATEGORIES[type].plural}<span className="rs-count">{list.length}</span></div>
                        <div className="rs-filters">
                            <Input className="rs-search" allowClear prefix={<SearchOutlined className="rs-muted" />} placeholder="Search files, teachers, batches" value={search} onChange={e => setSearch(e.target.value)} aria-label="Search files" />
                            <Select className="rs-filter" allowClear showSearch optionFilterProp="label" placeholder="All teachers" value={teacher} onChange={v => setTeacher(v ?? null)} options={teacherOptions} />
                            <Select<number | 'none'> className="rs-filter" allowClear showSearch optionFilterProp="label" placeholder="All batches" value={batch ?? undefined} onChange={v => setBatch(v ?? null)} options={batchOptions} />
                            <Select<Storage> className="ar-filter-s" value={storage} onChange={setStorage} aria-label="Storage"
                                options={[{ value: 'all', label: 'Any storage' }, { value: 'cloud', label: 'Cloud' }, { value: 'local', label: 'Server' }]} />
                            <DatePicker.RangePicker className="ar-range" value={range} format="MMM D, YYYY" allowClear placeholder={['Shared from', 'to']}
                                disabledDate={d => d.isAfter(dayjs(), 'day')} onChange={v => setRange(v && v[0] && v[1] ? [v[0], v[1]] : null)} />
                            <Select<SortKey> className="rs-sort" value={sort} onChange={setSort} aria-label="Sort"
                                options={[{ value: 'newest', label: 'Newest first' }, { value: 'oldest', label: 'Oldest first' }, { value: 'name', label: 'Name (A–Z)' }, { value: 'size', label: 'Largest first' }]} />
                            {!r.isMobile && (
                                <Segmented<View> value={view} onChange={changeView} aria-label="Layout"
                                    options={[{ value: 'list', icon: <UnorderedListOutlined />, title: 'List' }, { value: 'grid', icon: <AppstoreOutlined />, title: 'Grid' }]} />
                            )}
                            {hasFilters && <Button type="link" size="small" onClick={clearFilters}>Clear</Button>}
                        </div>
                    </div>

                    {list.length === 0 ? (
                        <div className="rs-empty">
                            <span className="rs-empty-art"><FolderOpenOutlined /></span>
                            <strong>{resources.length === 0 ? 'No resources yet' : 'No files match these filters'}</strong>
                            <span>{resources.length === 0 ? 'Files teachers upload will appear here.' : 'Try another type, teacher, batch or date.'}</span>
                            {hasFilters && resources.length > 0 && <Button size="small" onClick={clearFilters}>Clear filters</Button>}
                        </div>
                    ) : view === 'grid' && !r.isMobile ? (
                        <div className="rs-grid">
                            {pageItems.map(res => {
                                const names = batchNamesOf(res);
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
                                            <div className="rs-card-meta">{teacherName(res)} · {fmtSize(res.file_size)} · {fmt.date(res.created_at)}</div>
                                        </div>
                                        <div className="rs-card-foot">
                                            <span className={`rs-card-batches${names.length ? '' : ' ar-amber'}`}><TeamOutlined /> {names.join(', ') || 'Not shared'}</span>
                                            {actions(res)}
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    ) : (
                        <ul className="rs-list">
                            {!r.isMobile && <li className="rs-list-head" aria-hidden><span>File</span><span>Teacher · batches</span><span>Storage</span><span>Shared on</span><span /></li>}
                            {pageItems.map(res => {
                                const names = batchNamesOf(res);
                                return (
                                    <li key={res.id}>
                                        <div className="rs-row" role="button" tabIndex={0} onClick={() => openPreview(res)} onKeyDown={e => { if (e.key === 'Enter') openPreview(res); }}>
                                            <span className="rs-row-file">
                                                <TypeTile res={res} />
                                                <span className="rs-row-text">
                                                    <span className="rs-row-title">{res.title}{Date.now() - new Date(res.created_at).getTime() < NEW_MS && <span className="rs-badge-new">New</span>}</span>
                                                    <span className="rs-row-meta">{res.file_name} · {fmtSize(res.file_size)}{r.isMobile ? ` · ${teacherName(res)} · ${fmt.date(res.created_at)}` : ''}</span>
                                                </span>
                                            </span>
                                            {!r.isMobile && (
                                                <span className="ar-row-who">
                                                    <span className="ar-row-teacher"><span className="ar-av is-sm">{initials(teacherName(res))}</span>{teacherName(res)}</span>
                                                    <span className="rs-row-tags">
                                                        {names.length ? names.slice(0, 2).map(b => <span key={b} className="rs-chip"><TeamOutlined /> {b}</span>) : <span className="rs-chip ar-chip-warn">Not shared</span>}
                                                        {names.length > 2 && <Tooltip title={names.slice(2).join(', ')}><span className="rs-chip">+{names.length - 2}</span></Tooltip>}
                                                    </span>
                                                </span>
                                            )}
                                            {!r.isMobile && <span><StorageChip res={res} /></span>}
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
                            <Pagination size="small" current={page} pageSize={PAGE_SIZE} total={list.length} onChange={p => { setPage(p); }} showSizeChanger={false} simple={r.isMobile}
                                showTotal={r.isMobile ? undefined : (t, [a, b]) => `${a}–${b} of ${t}`} />
                        </div>
                    )}
                </section>

                {/* ── Preview ── */}
                <Modal open={!!preview} onCancel={closePreview} footer={null} closable={false} centered={!fullscreen && !r.isMobile} destroyOnHidden
                    width={fullscreen || r.isMobile ? '100%' : Math.min(1080, r.width - 64)}
                    wrapClassName={`rs-preview ar-preview${fullscreen || r.isMobile ? ' is-full' : ''}`}
                    styles={{ content: { padding: 0 }, body: { padding: 0 } }}>
                    {preview && (
                        <div className="rs-pv">
                            <header className={`rs-pv-head rs-type-${categoryOf(preview)}`}>
                                <TypeTile res={preview} />
                                <div className="rs-pv-info">
                                    <div className="rs-pv-title" title={preview.title}>{preview.title}</div>
                                    <div className="rs-pv-meta">
                                        {fmtSize(preview.file_size)} · {fmt.date(preview.created_at)} · <UserOutlined /> {teacherName(preview)}
                                        {' · '}<TeamOutlined /> {batchNamesOf(preview).join(', ') || 'Not shared with a batch'}
                                        {' · '}{isCloud(preview) ? 'Cloud' : 'Server'}
                                    </div>
                                </div>
                                <div className="rs-pv-actions">
                                    <Button type="primary" icon={busyId === preview.id ? <LoadingOutlined /> : <DownloadOutlined />} onClick={() => download(preview)}>{!r.isMobile && 'Download'}</Button>
                                    <Tooltip title="Delete"><Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(preview)} aria-label="Delete" /></Tooltip>
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
                                ) : categoryOf(preview) === 'pdf' ? (
                                    <PdfViewer src={previewUrl} />
                                ) : categoryOf(preview) === 'video' ? (
                                    <video controls className="rs-pv-video" src={previewUrl} />
                                ) : categoryOf(preview) === 'audio' ? (
                                    <div className="rs-pv-audio"><span className="rs-pv-audio-art rs-type-audio"><SoundOutlined /></span><strong>{preview.title}</strong><audio controls src={previewUrl} /></div>
                                ) : categoryOf(preview) === 'image' ? (
                                    <img className="rs-pv-image" src={previewUrl} alt={preview.title} />
                                ) : (
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

export default AdminResources;
