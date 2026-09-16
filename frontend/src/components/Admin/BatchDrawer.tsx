import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Drawer, Dropdown, Input, Modal, Select, Skeleton, Tabs, Tooltip, message } from 'antd';
import {
    BarChartOutlined, CalendarOutlined, CloseOutlined, DeleteOutlined, EditOutlined, EnvironmentOutlined, LinkOutlined,
    MoreOutlined, SearchOutlined, TeamOutlined, UserAddOutlined, UserDeleteOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import useResponsive from '../../hooks/useResponsive';
import { formatPlain } from '../../utils/timezone';
import {
    LEVEL_HINT, STATUS_LABEL, WEEK, countOf, daysBetween, durationText, hhmm, hoursText, initials, levelTone, personName,
    progressOf, spanMinutes, statusOf, teacherOf,
} from './batchUtils';
import type { Batch, Person, TimetableEntry } from './batchUtils';

interface Enrolled extends Person { username?: string; enrolled_at?: string; }

interface Props {
    batch: Batch | null;
    teachers: Person[];
    students: Person[];
    onClose: () => void;
    onEdit: (b: Batch, step: number) => void;
    onDelete: (b: Batch) => void;
    onChanged: () => void;
}

const BatchDrawer: React.FC<Props> = ({ batch, teachers, students, onClose, onEdit, onDelete, onChanged }) => {
    const { apiCall, user } = useAuth();
    const r = useResponsive();
    const navigate = useNavigate();
    const [msg, msgHolder] = message.useMessage();
    const [modal, modalHolder] = Modal.useModal();

    const [tab, setTab] = useState('overview');
    const [enrolled, setEnrolled] = useState<Enrolled[] | null>(null);
    const [timetable, setTimetable] = useState<TimetableEntry[] | null>(null);
    const [loadError, setLoadError] = useState(false);
    const [query, setQuery] = useState('');
    const [toAdd, setToAdd] = useState<number[]>([]);
    const [adding, setAdding] = useState(false);
    const id = batch?.id;

    const load = useCallback(async (bid: number) => {
        setLoadError(false);
        try {
            const [dRes, tRes] = await Promise.all([apiCall(`/batches/${bid}`), apiCall(`/batches/${bid}/timetable`)]);
            if (!dRes.ok) throw new Error(String(dRes.status));
            const d = await dRes.json();
            setEnrolled(Array.isArray(d.students) ? d.students : []);
            setTimetable(tRes.ok ? await tRes.json() : []);
        } catch {
            setLoadError(true);
            setEnrolled([]);
            setTimetable([]);
        }
    }, [apiCall]);

    useEffect(() => {
        if (!id) return;
        setTab('overview');
        setEnrolled(null);
        setTimetable(null);
        setQuery('');
        setToAdd([]);
        load(id);
    }, [id, load]);

    const fmt = (iso?: string) => formatPlain(iso, user?.timezone, { month: 'short', day: 'numeric', year: 'numeric' });
    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        return (enrolled || []).filter(s => !q || `${personName(s)} ${s.email}`.toLowerCase().includes(q));
    }, [enrolled, query]);
    const addable = useMemo(
        () => students.filter(s => !(enrolled || []).some(e => e.id === s.id)).map(s => ({ value: s.id, label: `${personName(s)} · ${s.email}` })),
        [students, enrolled],
    );
    const week = useMemo(() => WEEK.map(w => ({
        ...w,
        slots: (timetable || []).filter(e => Number(e.day_of_week) === w.v).sort((a, b) => a.start_time.localeCompare(b.start_time)),
    })), [timetable]);
    const weeklyMinutes = (timetable || []).reduce((s, e) => s + spanMinutes(e.start_time, e.end_time), 0);

    if (!batch) return <Drawer open={false} onClose={onClose} />;

    const status = statusOf(batch);
    const progress = progressOf(batch);
    const now = Date.now();
    const statusLine = status === 'running'
        ? `${Math.max(0, daysBetween(now, batch.end_date))} days left`
        : status === 'upcoming'
            ? `Starts in ${Math.max(0, daysBetween(now, batch.start_date))} days`
            : `Ended ${Math.max(0, daysBetween(batch.end_date, now))} days ago`;
    const count = enrolled ? enrolled.length : countOf(batch);
    const online = batch.default_location_mode !== 'physical';

    const addStudents = async () => {
        if (!toAdd.length) return;
        setAdding(true);
        try {
            const res = await apiCall(`/batches/${batch.id}/students`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ student_ids: toAdd }),
            });
            const d = await res.json().catch(() => ({}));
            if (!res.ok) { msg.error(d.error || 'Could not add the students'); return; }
            msg.success(`${toAdd.length} ${toAdd.length === 1 ? 'student' : 'students'} added and notified`);
            setToAdd([]);
            await load(batch.id);
            onChanged();
        } catch {
            msg.error('Could not add the students');
        } finally {
            setAdding(false);
        }
    };

    const removeStudent = (s: Enrolled) => {
        modal.confirm({
            title: `Remove ${personName(s)} from ${batch.name}?`,
            content: 'They lose access to this batch’s classes, quizzes and resources. Their past results are kept.',
            okText: 'Remove student',
            okButtonProps: { danger: true },
            centered: true,
            onOk: async () => {
                const res = await apiCall(`/batches/${batch.id}/students/${s.id}`, { method: 'DELETE' });
                if (!res.ok) { msg.error('Could not remove the student'); return; }
                msg.success(`${personName(s)} was removed`);
                await load(batch.id);
                onChanged();
            },
        });
    };

    const facts = [
        { label: 'Teacher', value: teacherOf(batch, teachers) },
        { label: 'Level', value: `${batch.french_level} · ${LEVEL_HINT[batch.french_level] || 'Custom'}` },
        { label: 'Period', value: `${fmt(batch.start_date)} – ${fmt(batch.end_date)}` },
        { label: 'Length', value: durationText(batch) },
        { label: 'Timezone', value: (batch.timezone || 'UTC').replace(/_/g, ' ') },
        {
            label: 'Classes',
            value: online
                ? (batch.default_link ? <a href={batch.default_link} target="_blank" rel="noreferrer" className="bm-link">Online · open link</a> : 'Online')
                : (batch.default_location || 'In person'),
        },
        { label: 'Created', value: fmt(batch.created_at) },
    ];

    const loading = enrolled === null || timetable === null;

    const overview = (
        <div className="bm-dpane">
            <div className="bm-dstats">
                <div><strong>{count}</strong><span>{count === 1 ? 'Student' : 'Students'}</span></div>
                <div><strong>{loading ? '—' : (timetable || []).length}</strong><span>Classes / week</span></div>
                <div><strong>{loading ? '—' : hoursText(weeklyMinutes)}</strong><span>Per week</span></div>
            </div>
            {!loading && count === 0 && (
                <div className="bm-callout is-warn">
                    <TeamOutlined />
                    <div><strong>No students yet</strong><span>Add students so they can see the classes, quizzes and resources of this batch.</span></div>
                    <Button size="small" onClick={() => setTab('students')}>Add</Button>
                </div>
            )}
            <dl className="bm-facts">
                {facts.map(f => <div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>)}
            </dl>
            <Button block icon={<BarChartOutlined />} onClick={() => navigate(`/app/batches/${batch.id}/insights`)}>View quiz insights</Button>
        </div>
    );

    const studentsPane = (
        <div className="bm-dpane">
            <div className="bm-add">
                <Select mode="multiple" allowClear showSearch optionFilterProp="label" maxTagCount="responsive" value={toAdd}
                    onChange={setToAdd} options={addable} placeholder={addable.length ? 'Add students…' : 'Every student is already enrolled'}
                    disabled={!addable.length} style={{ flex: 1, minWidth: 0 }} />
                <Button type="primary" icon={<UserAddOutlined />} loading={adding} disabled={!toAdd.length} onClick={addStudents}>Add</Button>
            </div>
            {(enrolled || []).length > 5 && (
                <Input className="bm-dsearch" prefix={<SearchOutlined />} allowClear placeholder="Search enrolled students" value={query} onChange={e => setQuery(e.target.value)} />
            )}
            {loading ? <Skeleton active avatar paragraph={{ rows: 3 }} /> : visible.length === 0 ? (
                <div className="bm-empty-line"><TeamOutlined /> {(enrolled || []).length ? 'No student matches your search.' : 'No students enrolled yet.'}</div>
            ) : (
                <ul className="bm-slist">
                    {visible.map(s => (
                        <li key={s.id}>
                            <span className="bm-person-av">{initials(personName(s))}</span>
                            <span className="bm-slist-text">
                                <strong>{personName(s)}</strong>
                                <em>{s.email}{s.enrolled_at ? ` · since ${fmt(s.enrolled_at)}` : ''}</em>
                            </span>
                            <Tooltip title="Remove from batch">
                                <Button type="text" size="small" danger icon={<UserDeleteOutlined />} onClick={() => removeStudent(s)} aria-label={`Remove ${personName(s)}`} />
                            </Tooltip>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );

    const timetablePane = (
        <div className="bm-dpane">
            <div className="bm-dpane-head">
                <span>{(timetable || []).length ? `${(timetable || []).length} classes a week · ${hoursText(weeklyMinutes)}` : 'No weekly classes set'}</span>
                <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(batch, 1)}>Edit schedule</Button>
            </div>
            {loading ? <Skeleton active paragraph={{ rows: 5 }} title={false} /> : (
                <ul className="bm-week">
                    {week.map(w => (
                        <li key={w.v} className={w.slots.length ? 'has-class' : ''}>
                            <span className="bm-week-day">{w.short}</span>
                            <div className="bm-week-slots">
                                {w.slots.length === 0 ? <span className="bm-week-none">No class</span> : w.slots.map((s, i) => (
                                    <div key={i} className="bm-week-slot">
                                        <strong>{hhmm(s.start_time)} – {hhmm(s.end_time)}</strong>
                                        <span>
                                            {s.location_mode === 'physical'
                                                ? <><EnvironmentOutlined /> {s.location || 'In person'}</>
                                                : <><LinkOutlined /> {s.link ? 'Online link' : 'Online'}</>}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            <p className="bm-note">Times are in {(timetable?.[0]?.timezone || batch.timezone || 'UTC').replace(/_/g, ' ')}. Students see them in their own timezone.</p>
        </div>
    );

    return (
        <Drawer open={!!batch} onClose={onClose} width={r.isMobile ? '100%' : 460} closable={false} title={null} className="bm-drawer">
            {msgHolder}
            {modalHolder}
            <div className="bm-dh">
                <div className="bm-dh-top">
                    <span className={`bm-mark ${levelTone(batch.french_level)}`}>{batch.french_level}</span>
                    <div className="bm-dh-actions">
                        <Dropdown trigger={['click']} placement="bottomRight" menu={{
                            items: [
                                { key: 'schedule', icon: <CalendarOutlined />, label: 'Edit schedule', onClick: () => onEdit(batch, 1) },
                                { key: 'insights', icon: <BarChartOutlined />, label: 'Quiz insights', onClick: () => navigate(`/app/batches/${batch.id}/insights`) },
                                { type: 'divider' },
                                { key: 'delete', icon: <DeleteOutlined />, label: 'Delete batch', danger: true, onClick: () => onDelete(batch) },
                            ],
                        }}>
                            <button type="button" className="bm-dh-btn" aria-label="More actions"><MoreOutlined /></button>
                        </Dropdown>
                        <button type="button" className="bm-dh-btn" onClick={onClose} aria-label="Close"><CloseOutlined /></button>
                    </div>
                </div>
                <h3>{batch.name}</h3>
                <p>{teacherOf(batch, teachers)} · {fmt(batch.start_date)} – {fmt(batch.end_date)}</p>
                <div className="bm-dh-status">
                    <span className={`bm-pill is-${status}`}>{STATUS_LABEL[status]}</span>
                    <span className="bm-dh-line">{statusLine}</span>
                </div>
                {status !== 'upcoming' && (
                    <div className="bm-progress is-lg" aria-label={`${progress}% of the batch period has passed`}>
                        <i style={{ width: `${progress}%` }} />
                    </div>
                )}
                <Button type="primary" icon={<EditOutlined />} className="bm-dh-edit" onClick={() => onEdit(batch, 0)}>Edit batch</Button>
            </div>

            {loadError && <div className="bm-alert is-inline">Some details couldn’t be loaded. <button type="button" onClick={() => load(batch.id)}>Retry</button></div>}

            <Tabs className="bm-dtabs" activeKey={tab} onChange={setTab}
                items={[
                    { key: 'overview', label: 'Overview', children: overview },
                    { key: 'students', label: `Students${enrolled ? ` · ${enrolled.length}` : ''}`, children: studentsPane },
                    { key: 'timetable', label: 'Timetable', children: timetablePane },
                ]} />
        </Drawer>
    );
};

export default BatchDrawer;
