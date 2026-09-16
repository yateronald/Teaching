import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, ConfigProvider, Input, Modal, Pagination, Select, Skeleton, Alert, Tooltip, Segmented, message } from 'antd';
import {
    DownloadOutlined, EyeOutlined, SearchOutlined, FilePdfOutlined, VideoCameraOutlined, SoundOutlined,
    PictureOutlined, FileTextOutlined, ExpandOutlined, CompressOutlined, CloseOutlined, AppstoreOutlined,
    UnorderedListOutlined, LoadingOutlined, TeamOutlined, UserOutlined, ExclamationCircleOutlined,
    FolderOpenOutlined, CloudDownloadOutlined,
} from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PdfViewer from '../Common/PdfViewer';
import useResponsive from '../../hooks/useResponsive';
import { resolveTimezone, timezoneLabel } from '../../utils/timezone';
import './StudentResources.css';

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
const VIEW_KEY = 'lfn.resources.view';
const NEW_MS = 7 * 86_400_000;

const fmtSize = (b: number) => {
    if (!b) return '0 B';
    const k = 1024, units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.min(units.length - 1, Math.floor(Math.log(b) / Math.log(k)));
    return `${parseFloat((b / Math.pow(k, i)).toFixed(1))} ${units[i]}`;
};
const teacherOf = (r: Resource) => [r.teacher_first_name, r.teacher_last_name].filter(Boolean).join(' ') || null;
const batchesOf = (r: Resource) => (r.batch_names || '').split(',').map(s => s.trim()).filter(Boolean);
const extOf = (r: Resource) => (r.file_name.includes('.') ? r.file_name.split('.').pop()!.slice(0, 4).toUpperCase() : CATEGORIES[categoryOf(r)].label.toUpperCase());

const readView = (): View => {
    try { return localStorage.getItem(VIEW_KEY) === 'grid' ? 'grid' : 'list'; } catch { return 'list'; }
};

const StudentResources: React.FC = () => {
    const r = useResponsive();
    const { apiCall, user } = useAuth();
    const zone = resolveTimezone(user?.timezone);
    const tzLabel = timezoneLabel(zone);
    const [messageApi, contextHolder] = message.useMessage();

    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [type, setType] = useState<Category | 'all'>('all');
    const [search, setSearch] = useState('');
    const [batch, setBatch] = useState<string | null>(null);
    const [teacher, setTeacher] = useState<string | null>(null);
    const [sort, setSort] = useState<SortKey>('newest');
    const [view, setView] = useState<View>(readView);
    const [page, setPage] = useState(1);

    const [preview, setPreview] = useState<Resource | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewFailed, setPreviewFailed] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);
    const [downloadingId, setDownloadingId] = useState<number | null>(null);

    /* ── Data: one request; every filter runs in the browser ── */
    const fetchResources = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const resp = await apiCall('/resources');
            if (!resp.ok) throw new Error('Failed to load resources');
            const data = await resp.json();
            setResources(Array.isArray(data) ? data : data?.resources ?? []);
        } catch (e: any) {
            setError(e?.message || 'Failed to load resources');
        } finally {
            setLoading(false);
        }
    }, [apiCall]);

    useEffect(() => { fetchResources(); }, [fetchResources]);

    const changeView = (v: View) => {
        setView(v);
        try { localStorage.setItem(VIEW_KEY, v); } catch { /* private mode */ }
    };

    /* ── Dates in the student's timezone ── */
    const fmt = useMemo(() => {
        const date = new Intl.DateTimeFormat('en-US', { timeZone: zone, month: 'short', day: 'numeric', year: 'numeric' });
        const time = new Intl.DateTimeFormat('en-GB', { timeZone: zone, hour: '2-digit', minute: '2-digit' });
        const safe = (f: Intl.DateTimeFormat) => (iso?: string | null) => {
            if (!iso) return '—';
            const d = new Date(iso);
            return isNaN(d.getTime()) ? '—' : f.format(d);
        };
        return { date: safe(date), time: safe(time) };
    }, [zone]);

    /* ── Library figures ── */
    const library = useMemo(() => {
        const count: Record<Category | 'all', number> = { all: resources.length, pdf: 0, video: 0, audio: 0, image: 0, document: 0 };
        const size: Record<Category | 'all', number> = { all: 0, pdf: 0, video: 0, audio: 0, image: 0, document: 0 };
        let latest: Resource | null = null;
        let fresh = 0;
        const now = Date.now();
        for (const res of resources) {
            const c = categoryOf(res);
            count[c]++;
            size[c] += res.file_size || 0;
            size.all += res.file_size || 0;
            const t = new Date(res.created_at).getTime();
            if (now - t < NEW_MS) fresh++;
            if (!latest || t > new Date(latest.created_at).getTime()) latest = res;
        }
        return { count, size, latest: latest as Resource | null, fresh };
    }, [resources]);
    const isNew = (res: Resource) => Date.now() - new Date(res.created_at).getTime() < NEW_MS;

    const batchOptions = useMemo(() => Array.from(new Set(resources.flatMap(batchesOf))).sort().map(v => ({ value: v, label: v })), [resources]);
    const teacherOptions = useMemo(() => Array.from(new Set(resources.map(teacherOf).filter((t): t is string => !!t))).sort().map(v => ({ value: v, label: v })), [resources]);

    const list = useMemo(() => {
        const q = search.trim().toLowerCase();
        const out = resources.filter(res => {
            if (type !== 'all' && categoryOf(res) !== type) return false;
            if (q && !`${res.title} ${res.file_name} ${res.description || ''}`.toLowerCase().includes(q)) return false;
            if (batch && !batchesOf(res).includes(batch)) return false;
            if (teacher && teacherOf(res) !== teacher) return false;
            return true;
        });
        const time = (x: Resource) => new Date(x.created_at).getTime() || 0;
        return out.sort((a, b) => {
            if (sort === 'oldest') return time(a) - time(b);
            if (sort === 'name') return a.title.localeCompare(b.title);
            if (sort === 'size') return (b.file_size || 0) - (a.file_size || 0);
            return time(b) - time(a);
        });
    }, [resources, type, search, batch, teacher, sort]);

    useEffect(() => { setPage(1); }, [type, search, batch, teacher, sort]);

    const hasFilters = type !== 'all' || !!search.trim() || !!batch || !!teacher;
    const clearFilters = () => { setType('all'); setSearch(''); setBatch(null); setTeacher(null); };

    /* ── Deep link ?focus=<resourceId> ── */
    const [searchParams] = useSearchParams();
    const focusId = Number(searchParams.get('focus')) || null;
    useEffect(() => {
        if (!focusId || loading) return;
        const idx = list.findIndex(x => x.id === focusId);
        if (idx < 0) return;
        setPage(Math.floor(idx / PAGE_SIZE) + 1);
        const t = window.setTimeout(() => {
            const el = document.querySelector(`[data-focus-id="${focusId}"]`);
            if (!el) return;
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('rs-focus');
            window.setTimeout(() => el.classList.remove('rs-focus'), 2600);
        }, 300);
        return () => window.clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [focusId, loading]);

    /* ── Download & preview (server-proxied; storage links never sit in the page) ── */
    const download = async (res: Resource) => {
        setDownloadingId(res.id);
        const hide = messageApi.loading(`Preparing ${res.file_name}…`, 0);
        try {
            const resp = await apiCall(`/resources/${res.id}/download?json=true`);
            if (!resp.ok) throw new Error();
            const a = document.createElement('a');
            a.download = res.file_name;
            if ((resp.headers.get('content-type') || '').includes('application/json')) {
                const data = await resp.json();
                if (!data?.url) throw new Error();
                a.href = data.url;
                a.target = '_blank';
                a.rel = 'noopener';
                document.body.appendChild(a); a.click(); a.remove();
            } else {
                const url = URL.createObjectURL(await resp.blob());
                a.href = url;
                document.body.appendChild(a); a.click(); a.remove();
                window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
            }
        } catch {
            messageApi.error('The download failed. Please try again.');
        } finally {
            hide();
            setDownloadingId(null);
        }
    };

    const openPreview = async (res: Resource) => {
        setPreview(res); setPreviewUrl(null); setPreviewFailed(false);
        try {
            const resp = await apiCall(`/resources/${res.id}/preview`);
            if (!resp.ok) throw new Error();
            setPreviewUrl(URL.createObjectURL(await resp.blob()));
        } catch {
            setPreviewFailed(true);
        }
    };

    const closePreview = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreview(null); setPreviewUrl(null); setPreviewFailed(false); setFullscreen(false);
    };

    /* ── Pieces ── */
    const TypeTile = ({ res }: { res: Resource }) => (
        <span className={`rs-file-icon rs-type-${categoryOf(res)}`} aria-hidden>
            {CATEGORIES[categoryOf(res)].icon}
            <em>{extOf(res)}</em>
        </span>
    );

    const actions = (res: Resource) => (
        <span className="rs-actions">
            <Tooltip title="Preview">
                <Button type="text" size="small" icon={<EyeOutlined />} aria-label={`Preview ${res.title}`}
                    onClick={e => { e.stopPropagation(); openPreview(res); }} />
            </Tooltip>
            <Tooltip title="Download">
                <Button type="text" size="small" aria-label={`Download ${res.title}`}
                    icon={downloadingId === res.id ? <LoadingOutlined /> : <DownloadOutlined />}
                    onClick={e => { e.stopPropagation(); download(res); }} />
            </Tooltip>
        </span>
    );

    /* ═══════════ LOADING ═══════════ */
    if (loading) return (
        <div className="rs" aria-busy="true">
            <div className="rs-header">
                <div>
                    <Skeleton.Input active size="small" style={{ width: 90, height: 12 }} />
                    <div style={{ marginTop: 10 }}><Skeleton.Input active style={{ width: 240, height: 24 }} /></div>
                </div>
            </div>
            <div className="rs-overview rs-overview-loading"><Skeleton active avatar={{ size: 64, shape: 'square' }} title={false} paragraph={{ rows: 3 }} /></div>
            <div className="rs-panel rs-pad"><Skeleton active title={false} paragraph={{ rows: 8 }} /></div>
        </div>
    );

    const pageItems = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <ConfigProvider theme={{ token: { colorPrimary: '#047857', fontSize: 13 } }}>
            <div className="rs">
                {contextHolder}

                {/* ── Header ── */}
                <header className="rs-header">
                    <div>
                        <div className="rs-overline">Resources</div>
                        <h1 className="rs-title">Learning resources</h1>
                        <p className="rs-subtitle">Course material shared by your teachers — preview it here or download it. Times in {tzLabel}.</p>
                    </div>
                </header>

                {error && (
                    <Alert type="error" showIcon message="Couldn't load your resources" description={error}
                        action={<Button size="small" onClick={fetchResources}>Retry</Button>} />
                )}

                {/* ── Library overview (type tiles double as the type filter) ── */}
                <section className="rs-overview" aria-label="Library">
                    <div className="rs-hero">
                        <span className="rs-hero-art"><FolderOpenOutlined /></span>
                        <div className="rs-hero-text">
                            <div className="rs-hero-label">Your library</div>
                            <div className="rs-hero-value">
                                <span>{library.count.all} <small>{library.count.all === 1 ? 'file' : 'files'}</small></span>
                                {library.fresh > 0 && <span className="rs-new-chip">{library.fresh} new</span>}
                            </div>
                            <div className="rs-hero-note">
                                <CloudDownloadOutlined />
                                <span>{fmtSize(library.size.all)}{library.latest && <> · shared {fmt.date(library.latest.created_at)}</>}</span>
                            </div>
                        </div>
                    </div>
                    <div className="rs-types" role="tablist" aria-label="File type">
                        <button type="button" role="tab" aria-selected={type === 'all'}
                            className={`rs-type-tile is-all${type === 'all' ? ' is-active' : ''}`} onClick={() => setType('all')}>
                            <span className="rs-type-tile-icon"><AppstoreOutlined /></span>
                            <span className="rs-type-tile-text">
                                <span>All files</span>
                                <span className="rs-type-tile-count">
                                    <strong>{library.count.all}</strong>
                                    <em>{fmtSize(library.size.all)}</em>
                                </span>
                            </span>
                        </button>
                        {CATEGORY_KEYS.map(k => (
                            <button key={k} type="button" role="tab" aria-selected={type === k} disabled={!library.count[k]}
                                className={`rs-type-tile rs-type-${k}${type === k ? ' is-active' : ''}`} onClick={() => setType(k)}>
                                <span className="rs-type-tile-icon">{CATEGORIES[k].icon}</span>
                                <span className="rs-type-tile-text">
                                    <span>{CATEGORIES[k].plural}</span>
                                    <span className="rs-type-tile-count">
                                        <strong>{library.count[k]}</strong>
                                        {library.count[k] > 0 && <em>{fmtSize(library.size[k])}</em>}
                                    </span>
                                </span>
                            </button>
                        ))}
                    </div>
                </section>

                <section className="rs-panel" aria-label="Files">
                    {/* ── Toolbar ── */}
                    <div className="rs-toolbar">
                        <div className="rs-toolbar-title">
                            {type === 'all' ? 'All files' : CATEGORIES[type].plural}
                            <span className="rs-count">{list.length}</span>
                        </div>
                        <div className="rs-filters">
                            <Input className="rs-search" allowClear prefix={<SearchOutlined className="rs-muted" />} placeholder="Search files"
                                value={search} onChange={e => setSearch(e.target.value)} aria-label="Search files" />
                            {batchOptions.length > 1 && (
                                <Select className="rs-filter" allowClear placeholder="All batches" value={batch} onChange={v => setBatch(v ?? null)} options={batchOptions} />
                            )}
                            {teacherOptions.length > 1 && (
                                <Select className="rs-filter" allowClear placeholder="All teachers" value={teacher} onChange={v => setTeacher(v ?? null)} options={teacherOptions} />
                            )}
                            <Select<SortKey> className="rs-sort" value={sort} onChange={setSort} aria-label="Sort"
                                options={[
                                    { value: 'newest', label: 'Newest first' },
                                    { value: 'oldest', label: 'Oldest first' },
                                    { value: 'name', label: 'Name (A–Z)' },
                                    { value: 'size', label: 'Largest first' },
                                ]} />
                            {!r.isMobile && (
                                <Segmented<View> value={view} onChange={changeView} aria-label="Layout"
                                    options={[
                                        { value: 'list', icon: <UnorderedListOutlined />, title: 'List' },
                                        { value: 'grid', icon: <AppstoreOutlined />, title: 'Grid' },
                                    ]} />
                            )}
                        </div>
                    </div>

                    {/* ── Content ── */}
                    {list.length === 0 ? (
                        <div className="rs-empty">
                            <span className="rs-empty-art"><FolderOpenOutlined /></span>
                            <strong>{resources.length === 0 ? 'No resources yet' : 'No files match these filters'}</strong>
                            <span>{resources.length === 0 ? 'Files your teachers share will appear here.' : 'Try another type, batch or search term.'}</span>
                            {hasFilters && resources.length > 0 && <Button size="small" onClick={clearFilters}>Clear filters</Button>}
                        </div>
                    ) : view === 'grid' && !r.isMobile ? (
                        <div className="rs-grid">
                            {pageItems.map(res => (
                                <article key={res.id} className={`rs-card rs-type-${categoryOf(res)}`} data-focus-id={res.id} onClick={() => openPreview(res)}
                                    tabIndex={0} onKeyDown={e => { if (e.key === 'Enter') openPreview(res); }}>
                                    <div className="rs-card-art">
                                        <span className="rs-card-ext">{extOf(res)}</span>
                                        {isNew(res) && <span className="rs-badge-new">New</span>}
                                        <span className="rs-card-icon">{CATEGORIES[categoryOf(res)].icon}</span>
                                        <span className="rs-card-hover"><EyeOutlined /> Preview</span>
                                    </div>
                                    <div className="rs-card-body">
                                        <div className="rs-card-title" title={res.title}>{res.title}</div>
                                        <div className="rs-card-meta">{fmtSize(res.file_size)} · {fmt.date(res.created_at)}</div>
                                    </div>
                                    <div className="rs-card-foot">
                                        <span className="rs-card-batches"><TeamOutlined /> {batchesOf(res).join(', ') || '—'}</span>
                                        {actions(res)}
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <ul className="rs-list">
                            {!r.isMobile && (
                                <li className="rs-list-head" aria-hidden>
                                    <span>File</span><span>Shared with</span><span>Shared on</span><span />
                                </li>
                            )}
                            {pageItems.map(res => (
                                <li key={res.id} data-focus-id={res.id}>
                                    <div className="rs-row" role="button" tabIndex={0} onClick={() => openPreview(res)}
                                        onKeyDown={e => { if (e.key === 'Enter') openPreview(res); }}>
                                        <span className="rs-row-file">
                                            <TypeTile res={res} />
                                            <span className="rs-row-text">
                                                <span className="rs-row-title">
                                                    {res.title}
                                                    {isNew(res) && <span className="rs-badge-new">New</span>}
                                                </span>
                                                <span className="rs-row-meta">{res.file_name} · {fmtSize(res.file_size)}{r.isMobile ? ` · ${fmt.date(res.created_at)}` : ''}</span>
                                            </span>
                                        </span>
                                        {!r.isMobile && (
                                            <span className="rs-row-tags">
                                                {batchesOf(res).map(b => <span key={b} className="rs-chip"><TeamOutlined /> {b}</span>)}
                                                {teacherOf(res) && <span className="rs-row-teacher"><UserOutlined /> {teacherOf(res)}</span>}
                                            </span>
                                        )}
                                        {!r.isMobile && (
                                            <span className="rs-row-date">
                                                <span>{fmt.date(res.created_at)}</span>
                                                <span className="rs-muted">{fmt.time(res.created_at)}</span>
                                            </span>
                                        )}
                                        {actions(res)}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    {list.length > PAGE_SIZE && (
                        <div className="rs-foot">
                            <Pagination size="small" current={page} pageSize={PAGE_SIZE} total={list.length} onChange={setPage}
                                showSizeChanger={false} simple={r.isMobile}
                                showTotal={r.isMobile ? undefined : (t, [a, b]) => `${a}–${b} of ${t}`} />
                        </div>
                    )}
                </section>

                {/* ── Preview ── */}
                <Modal
                    open={!!preview}
                    onCancel={closePreview}
                    footer={null}
                    closable={false}
                    centered={!fullscreen && !r.isMobile}
                    destroyOnHidden
                    width={fullscreen || r.isMobile ? '100%' : Math.min(1080, r.width - 64)}
                    wrapClassName={`rs-preview${fullscreen || r.isMobile ? ' is-full' : ''}`}
                    styles={{ content: { padding: 0 }, body: { padding: 0 } }}
                >
                    {preview && (
                        <div className="rs-pv">
                            <header className={`rs-pv-head rs-type-${categoryOf(preview)}`}>
                                <TypeTile res={preview} />
                                <div className="rs-pv-info">
                                    <div className="rs-pv-title" title={preview.title}>{preview.title}</div>
                                    <div className="rs-pv-meta">
                                        {fmtSize(preview.file_size)} · Shared {fmt.date(preview.created_at)}
                                        {teacherOf(preview) && <> · <UserOutlined /> {teacherOf(preview)}</>}
                                        {batchesOf(preview).length > 0 && <> · <TeamOutlined /> {batchesOf(preview).join(', ')}</>}
                                    </div>
                                </div>
                                <div className="rs-pv-actions">
                                    <Button type="primary" icon={downloadingId === preview.id ? <LoadingOutlined /> : <DownloadOutlined />} onClick={() => download(preview)}>
                                        {!r.isMobile && 'Download'}
                                    </Button>
                                    {!r.isMobile && (
                                        <Tooltip title={fullscreen ? 'Exit full screen' : 'Full screen'}>
                                            <Button type="text" icon={fullscreen ? <CompressOutlined /> : <ExpandOutlined />}
                                                onClick={() => setFullscreen(f => !f)} aria-label={fullscreen ? 'Exit full screen' : 'Full screen'} />
                                        </Tooltip>
                                    )}
                                    <Button type="text" icon={<CloseOutlined />} onClick={closePreview} aria-label="Close preview" />
                                </div>
                            </header>

                            <div className={`rs-pv-body is-${categoryOf(preview)}`}>
                                {previewFailed ? (
                                    <div className="rs-pv-state">
                                        <ExclamationCircleOutlined />
                                        <strong>The preview could not be loaded</strong>
                                        <span>You can still download the file.</span>
                                        <Button type="primary" icon={<DownloadOutlined />} onClick={() => download(preview)}>Download</Button>
                                    </div>
                                ) : !previewUrl ? (
                                    <div className="rs-pv-state"><LoadingOutlined /><span>Loading preview…</span></div>
                                ) : categoryOf(preview) === 'pdf' ? (
                                    <PdfViewer src={previewUrl} />
                                ) : categoryOf(preview) === 'video' ? (
                                    <video controls controlsList="nodownload" className="rs-pv-video" src={previewUrl} />
                                ) : categoryOf(preview) === 'audio' ? (
                                    <div className="rs-pv-audio">
                                        <span className="rs-pv-audio-art rs-type-audio"><SoundOutlined /></span>
                                        <strong>{preview.title}</strong>
                                        <audio controls controlsList="nodownload" src={previewUrl} />
                                    </div>
                                ) : categoryOf(preview) === 'image' ? (
                                    <img className="rs-pv-image" src={previewUrl} alt={preview.title} />
                                ) : (
                                    <div className="rs-pv-state">
                                        <FileTextOutlined />
                                        <strong>No preview for this file type</strong>
                                        <span>Download the file to open it on your device.</span>
                                        <Button type="primary" icon={<DownloadOutlined />} onClick={() => download(preview)}>Download</Button>
                                    </div>
                                )}
                            </div>

                            {preview.description && (
                                <footer className="rs-pv-desc"><strong>About this file</strong><p>{preview.description}</p></footer>
                            )}
                        </div>
                    )}
                </Modal>
            </div>
        </ConfigProvider>
    );
};

export default StudentResources;
