import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, ConfigProvider, DatePicker, Dropdown, Input, Modal, Segmented, Select, Skeleton, Table, Tooltip, message } from 'antd';
import type { MenuProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    BarChartOutlined, CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined, DeleteOutlined, DownloadOutlined, EditOutlined,
    ExclamationCircleFilled, HistoryOutlined, MoreOutlined, PlusOutlined, ReloadOutlined, RightOutlined, SearchOutlined,
    TeamOutlined, WarningOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import useResponsive from '../../hooks/useResponsive';
import { headerHeight } from '../Layout/layoutMetrics';
import { formatPlain } from '../../utils/timezone';
import BatchEditor from './BatchEditor';
import BatchDrawer from './BatchDrawer';
import {
    LEVELS, STATUS_LABEL, countOf, daysBetween, initials, levelTone, personName, progressOf, statusOf, teacherOf,
} from './batchUtils';
import type { Batch, BatchStatus, Person } from './batchUtils';
import './BatchManagement.css';

type StatusTab = 'all' | BatchStatus | 'empty';

const BatchManagement: React.FC = () => {
    const { apiCall, user } = useAuth();
    const r = useResponsive();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [msg, msgHolder] = message.useMessage();
    const [modal, modalHolder] = Modal.useModal();

    const [batches, setBatches] = useState<Batch[]>([]);
    const [teachers, setTeachers] = useState<Person[]>([]);
    const [students, setStudents] = useState<Person[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const [tab, setTab] = useState<StatusTab>('all');
    const [search, setSearch] = useState('');
    const [teacherFilter, setTeacherFilter] = useState<number[]>([]);
    const [levelFilter, setLevelFilter] = useState<string[]>([]);
    const [range, setRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
    const [selectedIds, setSelectedIds] = useState<React.Key[]>([]);
    const [bulkBusy, setBulkBusy] = useState(false);
    const [cardLimit, setCardLimit] = useState(20);

    const [editor, setEditor] = useState<{ open: boolean; batch: Batch | null; step: number }>({ open: false, batch: null, step: 0 });
    const [drawerId, setDrawerId] = useState<number | null>(null);
    const drawerBatch = batches.find(b => b.id === drawerId) || null;

    /* ═══════════ DATA ═══════════ */
    const fetchBatches = useCallback(async () => {
        try {
            const res = await apiCall('/batches');
            if (!res.ok) throw new Error(`The server answered ${res.status}.`);
            const data = await res.json();
            setBatches(Array.isArray(data) ? data : (data.batches || []));
            setLoadError(null);
        } catch (e: any) {
            setLoadError(e?.message || 'Could not load batches.');
        } finally {
            setLoading(false);
        }
    }, [apiCall]);

    const fetchPeople = useCallback(async () => {
        const read = async (path: string) => {
            try {
                const res = await apiCall(path);
                if (!res.ok) return [];
                const d = await res.json();
                return Array.isArray(d) ? d : (d.users || []);
            } catch { return []; }
        };
        const [t, s] = await Promise.all([read('/users/role/teachers'), read('/users/role/students')]);
        setTeachers(t);
        setStudents(s);
    }, [apiCall]);

    useEffect(() => { fetchBatches(); fetchPeople(); }, [fetchBatches, fetchPeople]);

    // Deep links: ?new=1 opens the wizard (dashboard); ?edit=<id>&step=<n> opens a batch's editor (timetable).
    useEffect(() => {
        if (loading) return;
        if (searchParams.get('new') === '1') {
            setEditor({ open: true, batch: null, step: 0 });
            setSearchParams({}, { replace: true });
            return;
        }
        const editId = Number(searchParams.get('edit'));
        if (editId) {
            const b = batches.find(x => x.id === editId);
            if (b) setEditor({ open: true, batch: b, step: Number(searchParams.get('step')) || 0 });
            setSearchParams({}, { replace: true });
        }
    }, [searchParams, loading, batches, setSearchParams]);

    /* ═══════════ DERIVED ═══════════ */
    const statusById = useMemo(() => new Map(batches.map(b => [b.id, statusOf(b)])), [batches]);
    const stats = useMemo(() => {
        const by = (s: BatchStatus) => batches.filter(b => statusById.get(b.id) === s).length;
        const enrolled = batches.reduce((s, b) => s + countOf(b), 0);
        const live = batches.filter(b => statusById.get(b.id) !== 'ended');
        return {
            total: batches.length,
            running: by('running'),
            upcoming: by('upcoming'),
            ended: by('ended'),
            enrolled,
            avg: live.length ? Math.round(live.reduce((s, b) => s + countOf(b), 0) / live.length) : 0,
            teachers: new Set(batches.map(b => b.teacher_id)).size,
            empty: live.filter(b => countOf(b) === 0).length,
        };
    }, [batches, statusById]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return batches.filter(b => {
            const st = statusById.get(b.id);
            if (tab === 'empty' && (countOf(b) > 0 || st === 'ended')) return false;
            if (tab !== 'all' && tab !== 'empty' && st !== tab) return false;
            if (q && !`${b.name} ${teacherOf(b, teachers)}`.toLowerCase().includes(q)) return false;
            if (teacherFilter.length && !teacherFilter.includes(b.teacher_id)) return false;
            if (levelFilter.length && !levelFilter.includes(b.french_level)) return false;
            if (range && !(dayjs(b.start_date).isBefore(range[1].endOf('day')) && dayjs(b.end_date).isAfter(range[0].startOf('day')))) return false;
            return true;
        });
    }, [batches, statusById, tab, search, teacherFilter, levelFilter, range, teachers]);

    const hasFilters = !!(search || teacherFilter.length || levelFilter.length || range || tab !== 'all');
    const clearFilters = () => { setSearch(''); setTeacherFilter([]); setLevelFilter([]); setRange(null); setTab('all'); };
    useEffect(() => {
        setSelectedIds(ids => ids.filter(id => filtered.some(b => b.id === id)));
        setCardLimit(20);
    }, [filtered]);

    /* ═══════════ ACTIONS ═══════════ */
    const openCreate = () => setEditor({ open: true, batch: null, step: 0 });
    const openEdit = (b: Batch, step = 0) => setEditor({ open: true, batch: b, step });

    const deleteOne = async (b: Batch) => {
        const res = await apiCall(`/batches/${b.id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(String(res.status));
    };
    const confirmDelete = (b: Batch) => {
        modal.confirm({
            title: `Delete “${b.name}”?`,
            icon: <ExclamationCircleFilled style={{ color: '#dc2626' }} />,
            content: `${countOf(b)} ${countOf(b) === 1 ? 'student loses' : 'students lose'} access to this batch. Its timetable is removed. This cannot be undone.`,
            okText: 'Delete batch',
            okButtonProps: { danger: true },
            centered: true,
            onOk: async () => {
                try {
                    await deleteOne(b);
                    msg.success(`“${b.name}” was deleted`);
                    if (drawerId === b.id) setDrawerId(null);
                    fetchBatches();
                } catch {
                    msg.error('Could not delete the batch');
                }
            },
        });
    };
    const confirmBulkDelete = () => {
        const targets = batches.filter(b => selectedIds.includes(b.id));
        const affected = targets.reduce((s, b) => s + countOf(b), 0);
        modal.confirm({
            title: `Delete ${targets.length} ${targets.length === 1 ? 'batch' : 'batches'}?`,
            icon: <ExclamationCircleFilled style={{ color: '#dc2626' }} />,
            content: `${affected} ${affected === 1 ? 'enrolment is' : 'enrolments are'} removed with them. This cannot be undone.`,
            okText: 'Delete batches',
            okButtonProps: { danger: true },
            centered: true,
            onOk: async () => {
                setBulkBusy(true);
                const results = await Promise.allSettled(targets.map(deleteOne));
                const ok = results.filter(x => x.status === 'fulfilled').length;
                setBulkBusy(false);
                setSelectedIds([]);
                fetchBatches();
                if (ok === targets.length) msg.success(`${ok} ${ok === 1 ? 'batch' : 'batches'} deleted`);
                else msg.warning(`${ok} of ${targets.length} deleted — the others could not be removed.`);
            },
        });
    };

    const exportCsv = () => {
        const rows: (string | number)[][] = [
            ['ID', 'Name', 'Level', 'Teacher', 'Status', 'Start', 'End', 'Students', 'Timezone'],
            ...filtered.map(b => [b.id, b.name, b.french_level, teacherOf(b, teachers), STATUS_LABEL[statusById.get(b.id) || 'running'],
                dayjs(b.start_date).format('YYYY-MM-DD'), dayjs(b.end_date).format('YYYY-MM-DD'), countOf(b), b.timezone || 'UTC']),
        ];
        const csv = rows.map(row => row.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
        const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = `batches-${dayjs().format('YYYY-MM-DD')}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const actionsMenu = (b: Batch): MenuProps['items'] => [
        { key: 'edit', icon: <EditOutlined />, label: 'Edit details', onClick: () => openEdit(b, 0) },
        { key: 'schedule', icon: <CalendarOutlined />, label: 'Edit schedule', onClick: () => openEdit(b, 1) },
        { key: 'students', icon: <TeamOutlined />, label: 'Manage students', onClick: () => setDrawerId(b.id) },
        { key: 'insights', icon: <BarChartOutlined />, label: 'Quiz insights', onClick: () => navigate(`/app/batches/${b.id}/insights`) },
        { type: 'divider' },
        { key: 'delete', icon: <DeleteOutlined />, label: 'Delete batch', danger: true, onClick: () => confirmDelete(b) },
    ];

    /* ═══════════ VIEW HELPERS ═══════════ */
    const fmt = (iso: string, withYear = true) => formatPlain(iso, user?.timezone, withYear ? { month: 'short', day: 'numeric', year: 'numeric' } : { month: 'short', day: 'numeric' });
    const periodText = (b: Batch) => {
        const sameYear = dayjs(b.start_date).year() === dayjs(b.end_date).year();
        return `${fmt(b.start_date, !sameYear)} – ${fmt(b.end_date)}`;
    };
    const periodHint = (b: Batch, st: BatchStatus) => {
        const now = Date.now();
        if (st === 'upcoming') { const d = Math.max(0, daysBetween(now, b.start_date)); return d <= 1 ? 'Starts tomorrow' : `Starts in ${d} days`; }
        if (st === 'ended') return 'Finished';
        const left = Math.max(0, daysBetween(now, b.end_date));
        return left <= 14 ? `Ends in ${left} ${left === 1 ? 'day' : 'days'}` : `${progressOf(b)}% through`;
    };

    const BatchCell: React.FC<{ b: Batch }> = ({ b }) => (
        <div className="bm-batch">
            <span className={`bm-mark ${levelTone(b.french_level)}`}>{b.french_level}</span>
            <div className="bm-batch-text">
                <div className="bm-batch-name">{b.name}</div>
                <div className="bm-batch-sub">#{b.id} · created {fmt(b.created_at)}</div>
            </div>
        </div>
    );
    const PeriodCell: React.FC<{ b: Batch }> = ({ b }) => {
        const st = statusById.get(b.id) || 'running';
        return (
            <div className="bm-period">
                <div className="bm-period-top">
                    <span className={`bm-pill is-${st}`}>{STATUS_LABEL[st]}</span>
                    <span className="bm-period-hint">{periodHint(b, st)}</span>
                </div>
                <div className="bm-period-dates">{periodText(b)}</div>
                {st === 'running' && <div className="bm-progress"><i style={{ width: `${progressOf(b)}%` }} /></div>}
            </div>
        );
    };
    const CountCell: React.FC<{ b: Batch }> = ({ b }) => {
        const n = countOf(b);
        const empty = n === 0 && statusById.get(b.id) !== 'ended';
        return <span className={`bm-count${empty ? ' is-empty' : ''}`}>{empty ? <WarningOutlined /> : <TeamOutlined />} {n}</span>;
    };

    /* ═══════════ LOADING ═══════════ */
    if (loading) {
        return (
            <div className="bm" aria-busy="true">
                <div className="bm-header">
                    <div>
                        <Skeleton.Input active size="small" style={{ width: 120, height: 12 }} />
                        <div style={{ marginTop: 10 }}><Skeleton.Input active style={{ width: 200, height: 24 }} /></div>
                    </div>
                </div>
                <div className="bm-tiles">
                    {[0, 1, 2, 3, 4].map(i => <div key={i} className="bm-tile"><Skeleton.Avatar active shape="square" size={36} /><Skeleton.Input active size="small" style={{ width: 70 }} /></div>)}
                </div>
                <div className="bm-panel bm-pad"><Skeleton active title={false} paragraph={{ rows: 9 }} /></div>
            </div>
        );
    }

    const tiles: { key: StatusTab; label: string; value: number | string; hint: string; icon: React.ReactNode; tone: string; click: boolean }[] = [
        { key: 'running', label: 'Running', value: stats.running, hint: 'In progress now', icon: <ClockCircleOutlined />, tone: 'green', click: true },
        { key: 'upcoming', label: 'Upcoming', value: stats.upcoming, hint: 'Not started yet', icon: <CalendarOutlined />, tone: 'indigo', click: true },
        { key: 'ended', label: 'Ended', value: stats.ended, hint: 'Finished', icon: <HistoryOutlined />, tone: 'slate', click: true },
        { key: 'all', label: 'Enrolments', value: stats.enrolled, hint: `≈ ${stats.avg} per active batch · ${stats.teachers} teachers`, icon: <TeamOutlined />, tone: 'blue', click: false },
        { key: 'empty', label: 'Without students', value: stats.empty, hint: 'Active batches to fill', icon: <WarningOutlined />, tone: 'amber', click: true },
    ];

    const columns: ColumnsType<Batch> = [
        {
            title: 'Batch',
            key: 'batch',
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (_, b) => <BatchCell b={b} />,
        },
        {
            title: 'Teacher',
            key: 'teacher',
            width: 200,
            sorter: (a, b) => teacherOf(a, teachers).localeCompare(teacherOf(b, teachers)),
            render: (_, b) => {
                const name = teacherOf(b, teachers);
                return <span className="bm-teacher"><span className="bm-person-av">{initials(name)}</span><span>{name}</span></span>;
            },
        },
        {
            title: 'Period',
            key: 'period',
            width: 250,
            defaultSortOrder: 'descend',
            sorter: (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime(),
            render: (_, b) => <PeriodCell b={b} />,
        },
        {
            title: 'Students',
            key: 'students',
            width: 110,
            align: 'center',
            sorter: (a, b) => countOf(a) - countOf(b),
            render: (_, b) => <CountCell b={b} />,
        },
        {
            title: <span className="sr-only">Actions</span>,
            key: 'actions',
            width: 92,
            align: 'right',
            render: (_, b) => (
                <div className="bm-row-actions" onClick={e => e.stopPropagation()}>
                    <Tooltip title="Edit batch">
                        <Button type="text" className="bm-icon-btn" icon={<EditOutlined />} onClick={() => openEdit(b)} aria-label={`Edit ${b.name}`} />
                    </Tooltip>
                    <Dropdown menu={{ items: actionsMenu(b) }} trigger={['click']} placement="bottomRight">
                        <Button type="text" className="bm-icon-btn" icon={<MoreOutlined />} aria-label={`More actions for ${b.name}`} />
                    </Dropdown>
                </div>
            ),
        },
    ];

    const empty = (
        <div className="bm-empty">
            <span className="bm-empty-ic"><CalendarOutlined /></span>
            <strong>{batches.length ? 'No batches match these filters' : 'No batches yet'}</strong>
            <span>{batches.length ? 'Try another search or clear the filters.' : 'Create your first batch to group students with a teacher and a weekly timetable.'}</span>
            {batches.length ? <Button onClick={clearFilters}>Clear filters</Button> : <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>New batch</Button>}
        </div>
    );
    const useCards = r.width < 768;

    return (
        <ConfigProvider theme={{ token: { colorPrimary: '#4f46e5', fontSize: 13, borderRadius: 8 } }}>
            <div className="bm">
                {msgHolder}
                {modalHolder}

                <header className="bm-header">
                    <div>
                        <div className="bm-overline">Admin console · Classes</div>
                        <h1 className="bm-title">Batches</h1>
                        <p className="bm-subtitle">Group students with a teacher, set the weekly timetable and follow each cohort.</p>
                    </div>
                    <div className="bm-header-actions">
                        <Tooltip title="Refresh"><Button icon={<ReloadOutlined />} aria-label="Refresh" onClick={() => { setLoading(true); fetchBatches(); fetchPeople(); }} /></Tooltip>
                        <Button icon={<DownloadOutlined />} onClick={exportCsv} disabled={!filtered.length}>{r.isMobile ? 'CSV' : 'Export CSV'}</Button>
                        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>New batch</Button>
                    </div>
                </header>

                {loadError && (
                    <div className="bm-alert" role="alert">
                        <ExclamationCircleFilled />
                        <span><strong>Couldn't load batches.</strong> {loadError}</span>
                        <Button size="small" onClick={() => { setLoading(true); fetchBatches(); }}>Retry</Button>
                    </div>
                )}

                <section className="bm-tiles" aria-label="Overview">
                    {tiles.map(t => {
                        const body = (
                            <>
                                <span className="bm-tile-ic">{t.icon}</span>
                                <span className="bm-tile-text"><span>{t.label}</span><strong>{t.value}</strong></span>
                                <em>{t.hint}</em>
                            </>
                        );
                        return t.click ? (
                            <button key={t.label} type="button" className={`bm-tile bm-k-${t.tone}${tab === t.key ? ' is-active' : ''}`}
                                aria-pressed={tab === t.key} onClick={() => setTab(tab === t.key ? 'all' : t.key)}>{body}</button>
                        ) : <div key={t.label} className={`bm-tile bm-k-${t.tone}`}>{body}</div>;
                    })}
                </section>

                <section className="bm-panel" aria-label="Batch directory">
                    <div className="bm-toolbar">
                        {selectedIds.length > 0 ? (
                            <div className="bm-bulk">
                                <span><b>{selectedIds.length}</b> selected</span>
                                <Button size="small" danger icon={<DeleteOutlined />} loading={bulkBusy} onClick={confirmBulkDelete}>Delete</Button>
                                <Button size="small" type="text" onClick={() => setSelectedIds([])}>Clear</Button>
                            </div>
                        ) : (
                            <Segmented value={tab === 'empty' ? 'all' : tab} onChange={v => setTab(v as StatusTab)}
                                options={[
                                    { value: 'all', label: <span className="bm-seg">All <b>{stats.total}</b></span> },
                                    { value: 'running', label: <span className="bm-seg">Running <b>{stats.running}</b></span> },
                                    { value: 'upcoming', label: <span className="bm-seg">Upcoming <b>{stats.upcoming}</b></span> },
                                    { value: 'ended', label: <span className="bm-seg">Ended <b>{stats.ended}</b></span> },
                                ]} />
                        )}
                        <Input className="bm-search" prefix={<SearchOutlined />} allowClear placeholder="Search batch or teacher"
                            value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="bm-filters">
                        <Select className="bm-filter" mode="multiple" allowClear maxTagCount="responsive" placeholder="All teachers"
                            value={teacherFilter} onChange={setTeacherFilter} optionFilterProp="label"
                            options={teachers.map(t => ({ value: t.id, label: personName(t) }))} />
                        <Select className="bm-filter is-narrow" mode="multiple" allowClear maxTagCount="responsive" placeholder="All levels"
                            value={levelFilter} onChange={setLevelFilter} options={LEVELS.map(l => ({ value: l, label: l }))} />
                        <DatePicker.RangePicker className="bm-range" value={range} allowClear format="MMM D, YYYY" placeholder={['Active from', 'To']}
                            onChange={v => setRange(v && v[0] && v[1] ? [v[0], v[1]] : null)} />
                        {tab === 'empty' && <span className="bm-chip">Without students <button type="button" onClick={() => setTab('all')} aria-label="Remove filter">×</button></span>}
                        {hasFilters && <Button type="link" size="small" onClick={clearFilters}>Clear filters</Button>}
                        <span className="bm-count-text">{filtered.length === batches.length ? `${batches.length} batches` : `${filtered.length} of ${batches.length} batches`}</span>
                    </div>

                    {useCards ? (
                        filtered.length === 0 ? empty : (
                            <div className="bm-cards">
                                {filtered.slice(0, cardLimit).map(b => (
                                    <button key={b.id} type="button" className="bm-card" onClick={() => setDrawerId(b.id)}>
                                        <div className="bm-card-top">
                                            <BatchCell b={b} />
                                            <RightOutlined className="bm-card-chev" />
                                        </div>
                                        <div className="bm-card-meta">
                                            <span className="bm-teacher is-sm"><span className="bm-person-av">{initials(teacherOf(b, teachers))}</span>{teacherOf(b, teachers)}</span>
                                            <CountCell b={b} />
                                        </div>
                                        <PeriodCell b={b} />
                                    </button>
                                ))}
                                {filtered.length > cardLimit && (
                                    <div className="bm-more"><Button onClick={() => setCardLimit(n => n + 20)}>Show {Math.min(20, filtered.length - cardLimit)} more</Button></div>
                                )}
                            </div>
                        )
                    ) : (
                        <Table<Batch>
                            className="bm-table"
                            columns={columns}
                            dataSource={filtered}
                            rowKey="id"
                            size="middle"
                            sticky={{ offsetHeader: headerHeight(r.isMobile) }}
                            scroll={{ x: 880 }}
                            locale={{ emptyText: empty }}
                            rowSelection={{ selectedRowKeys: selectedIds, onChange: setSelectedIds }}
                            onRow={b => ({
                                onClick: e => {
                                    if ((e.target as HTMLElement).closest('.ant-table-selection-column, .bm-row-actions')) return;
                                    setDrawerId(b.id);
                                },
                                className: 'bm-row',
                            })}
                            pagination={{
                                defaultPageSize: 20,
                                showSizeChanger: true,
                                pageSizeOptions: ['10', '20', '50', '100'],
                                showTotal: (total, [a, b]) => `${a}–${b} of ${total}`,
                            }}
                        />
                    )}
                </section>

                <BatchDrawer
                    batch={drawerBatch}
                    teachers={teachers}
                    students={students}
                    onClose={() => setDrawerId(null)}
                    onEdit={(b, step) => openEdit(b, step)}
                    onDelete={confirmDelete}
                    onChanged={fetchBatches}
                />

                <BatchEditor
                    open={editor.open}
                    batch={editor.batch}
                    initialStep={editor.step}
                    teachers={teachers}
                    students={students}
                    onClose={() => setEditor(e => ({ ...e, open: false }))}
                    onSaved={() => { setEditor(e => ({ ...e, open: false })); fetchBatches(); }}
                />

                {stats.total > 0 && tab === 'all' && !hasFilters && stats.empty === 0 && (
                    <p className="bm-foot-note"><CheckCircleOutlined /> Every active batch has students.</p>
                )}
            </div>
        </ConfigProvider>
    );
};

export default BatchManagement;
