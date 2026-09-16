import React, { useEffect, useMemo, useState } from 'react';
import { Button, DatePicker, Form, Input, Modal, Segmented, Select, Switch, TimePicker, message } from 'antd';
import {
    CheckOutlined, ClockCircleOutlined, EditOutlined, EnvironmentOutlined, ExclamationCircleFilled, LinkOutlined,
    PlusOutlined, SearchOutlined, TeamOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { useAuth } from '../../contexts/AuthContext';
import { resolveTimezone } from '../../utils/timezone';
import {
    LEVELS, LEVEL_HINT, WEEK, dayName, hhmm, hoursText, initials, levelTone, personName, spanMinutes, timezoneList, weekOrder,
} from './batchUtils';
import type { Batch, LocationMode, Person, TimetableEntry } from './batchUtils';

/* ══════════════════════════════════════════
   BATCH EDITOR — 3-step wizard (Details · Schedule · Students)
   Editing skips the Students step: enrolment is managed from the batch panel.
══════════════════════════════════════════ */

interface Slot { start: string; end: string; custom: boolean; mode: LocationMode; location: string; link: string; }

interface Props {
    open: boolean;
    batch: Batch | null;
    /** 0 = Details, 1 = Schedule — lets "Edit schedule" open straight on the timetable. */
    initialStep?: number;
    teachers: Person[];
    students: Person[];
    onClose: () => void;
    onSaved: (created: boolean) => void;
}

const DEFAULT_SLOT: Slot = { start: '09:00', end: '10:00', custom: false, mode: 'online', location: '', link: '' };
const toTime = (t: string) => dayjs(`2000-01-01 ${hhmm(t)}`, 'YYYY-MM-DD HH:mm');
const DURATIONS = [
    { label: '4 weeks', add: [4, 'week'] as const },
    { label: '8 weeks', add: [8, 'week'] as const },
    { label: '3 months', add: [3, 'month'] as const },
    { label: '6 months', add: [6, 'month'] as const },
];

const BatchEditor: React.FC<Props> = ({ open, batch, initialStep = 0, teachers, students, onClose, onSaved }) => {
    const { apiCall, user } = useAuth();
    const [msg, msgHolder] = message.useMessage();
    const [form] = Form.useForm();
    const editing = !!batch;
    const steps = editing ? ['Details', 'Schedule'] : ['Details', 'Schedule', 'Students'];

    const [step, setStep] = useState(0);
    const [days, setDays] = useState<number[]>([]);
    const [sameTime, setSameTime] = useState(true);
    const [master, setMaster] = useState({ start: '09:00', end: '10:00' });
    const [slots, setSlots] = useState<Record<number, Slot>>({});
    const [picked, setPicked] = useState<number[]>([]);
    const [studentQuery, setStudentQuery] = useState('');
    const [loadingTimetable, setLoadingTimetable] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const defaultMode: LocationMode = Form.useWatch('default_location_mode', form) || 'online';
    const tzOptions = useMemo(() => timezoneList().map(tz => ({ value: tz, label: tz.replace(/_/g, ' ') })), []);

    /* ── Reset / prefill whenever the editor opens ── */
    useEffect(() => {
        if (!open) return;
        setError(null);
        setStudentQuery('');
        setPicked([]);
        setStep(Math.min(initialStep, editing ? 1 : 2));
        form.resetFields();
        const tz = resolveTimezone(user?.timezone);
        if (batch) {
            form.setFieldsValue({
                name: batch.name,
                french_level: batch.french_level,
                teacher_id: batch.teacher_id,
                dates: [dayjs(batch.start_date), dayjs(batch.end_date)],
                timezone: batch.timezone || 'UTC',
                default_location_mode: batch.default_location_mode === 'physical' ? 'physical' : 'online',
                default_location: batch.default_location || '',
                default_link: batch.default_link || '',
            });
            setDays([]);
            setSlots({});
            setSameTime(true);
            setMaster({ start: '09:00', end: '10:00' });
            let cancelled = false;
            setLoadingTimetable(true);
            apiCall(`/batches/${batch.id}/timetable`)
                .then(res => (res.ok ? res.json() : []))
                .then((tt: TimetableEntry[]) => {
                    if (cancelled || !Array.isArray(tt)) return;
                    const defMode = batch.default_location_mode === 'physical' ? 'physical' : 'online';
                    const next: Record<number, Slot> = {};
                    tt.forEach(e => {
                        const mode: LocationMode = e.location_mode === 'physical' ? 'physical' : 'online';
                        const custom = mode !== defMode
                            || (e.location || '') !== (batch.default_location || '')
                            || (e.link || '') !== (batch.default_link || '');
                        next[Number(e.day_of_week)] = {
                            start: hhmm(e.start_time) || '09:00', end: hhmm(e.end_time) || '10:00',
                            custom, mode, location: e.location || '', link: e.link || '',
                        };
                    });
                    const list = Object.keys(next).map(Number);
                    const values = Object.values(next);
                    const uniform = values.length > 0 && values.every(s => s.start === values[0].start && s.end === values[0].end && !s.custom);
                    setDays(list);
                    setSlots(next);
                    setSameTime(values.length === 0 || uniform);
                    if (values[0]) setMaster({ start: values[0].start, end: values[0].end });
                })
                .catch(() => { /* empty timetable is fine */ })
                .finally(() => { if (!cancelled) setLoadingTimetable(false); });
            return () => { cancelled = true; };
        }
        form.setFieldsValue({
            timezone: timezoneList().includes(tz) ? tz : 'UTC',
            default_location_mode: 'online',
            default_location: '',
            default_link: '',
        });
        setDays([]);
        setSlots({});
        setSameTime(true);
        setMaster({ start: '09:00', end: '10:00' });
        return undefined;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, batch?.id]);

    /* ── Schedule helpers ── */
    const setDaySet = (next: number[]) => {
        setDays(next);
        setSlots(prev => {
            const out: Record<number, Slot> = {};
            next.forEach(d => { out[d] = prev[d] || { ...DEFAULT_SLOT, start: master.start, end: master.end, mode: defaultMode }; });
            return out;
        });
    };
    const toggleDay = (d: number) => setDaySet(days.includes(d) ? days.filter(x => x !== d) : [...days, d]);
    const patchSlot = (d: number, patch: Partial<Slot>) => setSlots(prev => ({ ...prev, [d]: { ...(prev[d] || DEFAULT_SLOT), ...patch } }));
    const orderedDays = [...days].sort((a, b) => weekOrder(a) - weekOrder(b));
    const slotTime = (d: number) => (sameTime ? master : slots[d] || DEFAULT_SLOT);
    const weeklyMinutes = orderedDays.reduce((s, d) => s + spanMinutes(slotTime(d).start, slotTime(d).end), 0);
    const badTimes = orderedDays.filter(d => spanMinutes(slotTime(d).start, slotTime(d).end) <= 0);

    /* ── Students step ── */
    const visibleStudents = useMemo(() => {
        const q = studentQuery.trim().toLowerCase();
        return students
            .filter(s => !q || `${personName(s)} ${s.email}`.toLowerCase().includes(q))
            .sort((a, b) => personName(a).localeCompare(personName(b)));
    }, [students, studentQuery]);
    const togglePick = (id: number) => setPicked(p => (p.includes(id) ? p.filter(x => x !== id) : [...p, id]));

    /* ── Navigation ── */
    const next = async () => {
        setError(null);
        try {
            if (step === 0) await form.validateFields(['name', 'french_level', 'teacher_id', 'dates']);
            if (step === 1) {
                await form.validateFields(['timezone', 'default_location_mode', 'default_location', 'default_link']);
                if (badTimes.length) { setError(`Check the times for ${badTimes.map(dayName).join(', ')} — the end must be after the start.`); return; }
            }
        } catch { return; }
        if (step < steps.length - 1) setStep(step + 1);
        else submit();
    };

    const submit = async () => {
        setError(null);
        let values: any;
        try { values = await form.validateFields(); } catch { setStep(0); return; }
        if (badTimes.length) { setStep(1); setError('Some class times end before they start.'); return; }
        if (!editing && picked.length === 0) { setError('Choose at least one student for this batch.'); return; }

        const [start, end]: [Dayjs, Dayjs] = values.dates;
        const keepStart = batch && dayjs(batch.start_date).isSame(start, 'day');
        const keepEnd = batch && dayjs(batch.end_date).isSame(end, 'day');
        const mode: LocationMode = values.default_location_mode;
        const timetable = orderedDays.map(d => {
            const s = slots[d] || DEFAULT_SLOT;
            const t = slotTime(d);
            const own = !sameTime && s.custom;
            return {
                day_of_week: d,
                start_time: t.start,
                end_time: t.end,
                timezone: values.timezone,
                location_mode: own ? s.mode : mode,
                location: own ? s.location : (values.default_location || ''),
                link: own ? s.link : (values.default_link || ''),
            };
        });

        const payload: Record<string, unknown> = {
            name: String(values.name).trim(),
            french_level: values.french_level,
            teacher_id: values.teacher_id,
            start_date: keepStart ? batch!.start_date : start.startOf('day').toISOString(),
            end_date: keepEnd ? batch!.end_date : end.endOf('day').toISOString(),
            timezone: values.timezone,
            default_location_mode: mode,
            default_location: values.default_location || '',
            default_link: values.default_link || '',
        };
        if (editing) payload.timetable = timetable;
        else {
            if (timetable.length) payload.timetable = timetable;
            payload.student_ids = picked;
        }

        setSaving(true);
        try {
            const res = await apiCall(editing ? `/batches/${batch!.id}` : '/batches', {
                method: editing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                const err: string = data.error || data.message || 'Could not save the batch.';
                if (/end date/i.test(err)) { setStep(0); form.setFields([{ name: 'dates', errors: ['The end date must be after the start date.'] }]); }
                else setError(err === 'Validation failed' ? 'Some fields are missing or invalid.' : err);
                return;
            }
            msg.success(editing ? 'Batch updated' : `“${payload.name}” created — the teacher and ${picked.length} ${picked.length === 1 ? 'student were' : 'students were'} notified`);
            onSaved(!editing);
        } catch {
            setError("We couldn't reach the server. Try again.");
        } finally {
            setSaving(false);
        }
    };

    const close = () => { if (!saving) onClose(); };
    const isLast = step === steps.length - 1;

    return (
        <Modal open={open} onCancel={close} footer={null} width={720} centered forceRender maskClosable={!saving} closable={!saving} className="bm-modal">
            {msgHolder}
            <div className="bm-ed">
                <header className="bm-ed-head">
                    <span className="bm-ed-icon">{editing ? <EditOutlined /> : <PlusOutlined />}</span>
                    <div>
                        <h3>{editing ? `Edit ${batch!.name}` : 'New batch'}</h3>
                        <p>{editing ? 'Update the details and weekly timetable.' : 'Set up the class, its weekly timetable and who joins it.'}</p>
                    </div>
                </header>

                <ol className="bm-steps" aria-label="Steps">
                    {steps.map((label, i) => (
                        <li key={label} className={i < step ? 'is-done' : i === step ? 'is-current' : ''}>
                            <button type="button" disabled={i > step || saving} onClick={() => setStep(i)}>
                                <span className="bm-step-dot">{i < step ? <CheckOutlined /> : i + 1}</span>
                                <span>{label}</span>
                            </button>
                        </li>
                    ))}
                </ol>

                <Form form={form} layout="vertical" requiredMark={false} className="bm-ed-body">
                    {/* ── Step 1 — details ── */}
                    <section className="bm-step" hidden={step !== 0}>
                        <Form.Item name="name" label="Batch name" rules={[{ required: true, whitespace: true, message: 'Give the batch a name' }]}>
                            <Input placeholder="e.g. TEF Canada — evening group" maxLength={120} />
                        </Form.Item>
                        <Form.Item name="french_level" label="French level" rules={[{ required: true, message: 'Choose a level' }]}>
                            <LevelPicker />
                        </Form.Item>
                        <Form.Item name="teacher_id" label="Teacher" rules={[{ required: true, message: 'Choose a teacher' }]}>
                            <Select showSearch placeholder="Search a teacher" optionFilterProp="label"
                                options={teachers.map(t => ({ value: t.id, label: `${personName(t)} · ${t.email}` }))}
                                notFoundContent="No teacher found — add one in Users first" />
                        </Form.Item>
                        <Form.Item name="dates" label="Start and end dates" className="bm-item-tight"
                            rules={[{ required: true, message: 'Pick the start and end dates' }]}>
                            <DatePicker.RangePicker style={{ width: '100%' }} format="MMM D, YYYY" placeholder={['Starts', 'Ends']} />
                        </Form.Item>
                        <div className="bm-presets">
                            <span>Quick length:</span>
                            {DURATIONS.map(d => (
                                <button key={d.label} type="button" onClick={() => {
                                    const current = form.getFieldValue('dates') as [Dayjs, Dayjs] | undefined;
                                    const startAt = current?.[0] || dayjs().add(1, 'day').startOf('day');
                                    form.setFieldsValue({ dates: [startAt, startAt.add(d.add[0], d.add[1]).subtract(1, 'day')] });
                                    form.validateFields(['dates']).catch(() => { });
                                }}>{d.label}</button>
                            ))}
                        </div>
                    </section>

                    {/* ── Step 2 — schedule ── */}
                    <section className="bm-step" hidden={step !== 1}>
                        <div className="bm-grid-2">
                            <Form.Item name="timezone" label="Timezone" rules={[{ required: true, message: 'Choose a timezone' }]}>
                                <Select showSearch options={tzOptions} optionFilterProp="label" />
                            </Form.Item>
                            <Form.Item name="default_location_mode" label="Classes take place">
                                <Segmented block options={[
                                    { value: 'online', label: <span className="bm-seg-ic"><LinkOutlined /> Online</span> },
                                    { value: 'physical', label: <span className="bm-seg-ic"><EnvironmentOutlined /> In person</span> },
                                ]} />
                            </Form.Item>
                        </div>
                        {defaultMode === 'online' ? (
                            <Form.Item name="default_link" label="Meeting link" extra="Optional — shown to students with each class."
                                rules={[{ type: 'url', message: 'Enter a full link, e.g. https://meet.google.com/…' }]}>
                                <Input prefix={<LinkOutlined />} placeholder="https://meet.google.com/abc-defg-hij" />
                            </Form.Item>
                        ) : (
                            <Form.Item name="default_location" label="Classroom or address" extra="Optional — shown to students with each class.">
                                <Input prefix={<EnvironmentOutlined />} placeholder="e.g. Room 204, 12 rue de Rivoli" />
                            </Form.Item>
                        )}

                        <div className="bm-block">
                            <div className="bm-block-head">
                                <div>
                                    <strong>Weekly classes</strong>
                                    <span>{loadingTimetable ? 'Loading the current timetable…' : orderedDays.length
                                        ? `${orderedDays.length} ${orderedDays.length === 1 ? 'class' : 'classes'} a week · ${hoursText(weeklyMinutes)} in total`
                                        : 'No regular classes yet — you can add them later.'}</span>
                                </div>
                                <div className="bm-presets is-compact">
                                    <button type="button" onClick={() => setDaySet([1, 2, 3, 4, 5])}>Weekdays</button>
                                    <button type="button" onClick={() => setDaySet([6, 0])}>Weekends</button>
                                    <button type="button" onClick={() => setDaySet([0, 1, 2, 3, 4, 5, 6])}>Every day</button>
                                    {days.length > 0 && <button type="button" onClick={() => setDaySet([])}>Clear</button>}
                                </div>
                            </div>
                            <div className="bm-days" role="group" aria-label="Class days">
                                {WEEK.map(w => (
                                    <button key={w.v} type="button" aria-pressed={days.includes(w.v)}
                                        className={days.includes(w.v) ? 'is-on' : ''} onClick={() => toggleDay(w.v)}>{w.short}</button>
                                ))}
                            </div>

                            {orderedDays.length > 0 && (
                                <>
                                    <div className="bm-switch-line">
                                        <Switch size="small" checked={sameTime} onChange={v => {
                                            setSameTime(v);
                                            if (!v) setSlots(prev => {
                                                const out = { ...prev };
                                                orderedDays.forEach(d => { out[d] = { ...(out[d] || DEFAULT_SLOT), start: master.start, end: master.end }; });
                                                return out;
                                            });
                                        }} />
                                        <span>Same time every class day</span>
                                    </div>
                                    {sameTime ? (
                                        <div className="bm-slot-row is-master">
                                            <ClockCircleOutlined />
                                            <TimePicker.RangePicker format="HH:mm" minuteStep={5} allowClear={false} order={false}
                                                value={[toTime(master.start), toTime(master.end)]}
                                                onChange={v => v?.[0] && v?.[1] && setMaster({ start: v[0].format('HH:mm'), end: v[1].format('HH:mm') })} />
                                            <span className="bm-slot-len">{hoursText(spanMinutes(master.start, master.end))}</span>
                                        </div>
                                    ) : (
                                        <div className="bm-slot-list">
                                            {orderedDays.map(d => {
                                                const s = slots[d] || DEFAULT_SLOT;
                                                const bad = spanMinutes(s.start, s.end) <= 0;
                                                return (
                                                    <div key={d} className={`bm-slot${bad ? ' is-bad' : ''}`}>
                                                        <div className="bm-slot-row">
                                                            <span className="bm-slot-day">{dayName(d)}</span>
                                                            <TimePicker.RangePicker format="HH:mm" minuteStep={5} allowClear={false} order={false}
                                                                value={[toTime(s.start), toTime(s.end)]} status={bad ? 'error' : undefined}
                                                                onChange={v => v?.[0] && v?.[1] && patchSlot(d, { start: v[0].format('HH:mm'), end: v[1].format('HH:mm') })} />
                                                            <button type="button" className={`bm-place-toggle${s.custom ? ' is-on' : ''}`}
                                                                onClick={() => patchSlot(d, { custom: !s.custom, mode: s.custom ? s.mode : defaultMode })}>
                                                                {s.custom ? 'Custom place' : 'Default place'}
                                                            </button>
                                                        </div>
                                                        {s.custom && (
                                                            <div className="bm-place">
                                                                <Segmented size="small" value={s.mode} onChange={v => patchSlot(d, { mode: v as LocationMode })}
                                                                    options={[{ value: 'online', label: 'Online' }, { value: 'physical', label: 'In person' }]} />
                                                                {s.mode === 'online'
                                                                    ? <Input size="small" prefix={<LinkOutlined />} placeholder="Meeting link" value={s.link} onChange={e => patchSlot(d, { link: e.target.value })} />
                                                                    : <Input size="small" prefix={<EnvironmentOutlined />} placeholder="Room or address" value={s.location} onChange={e => patchSlot(d, { location: e.target.value })} />}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </>
                            )}
                            {editing && <p className="bm-note">Saving a new timetable notifies the students of this batch.</p>}
                        </div>
                    </section>

                    {/* ── Step 3 — students (create only) ── */}
                    {!editing && (
                        <section className="bm-step" hidden={step !== 2}>
                            <div className="bm-block-head">
                                <div>
                                    <strong>Students</strong>
                                    <span>{picked.length ? `${picked.length} selected — they receive an enrolment email.` : 'Choose at least one student.'}</span>
                                </div>
                                <div className="bm-presets is-compact">
                                    <button type="button" onClick={() => setPicked(p => Array.from(new Set([...p, ...visibleStudents.map(s => s.id)])))}>
                                        Select {studentQuery ? 'shown' : 'all'} ({visibleStudents.length})
                                    </button>
                                    {picked.length > 0 && <button type="button" onClick={() => setPicked([])}>Clear</button>}
                                </div>
                            </div>
                            <Input className="bm-pick-search" prefix={<SearchOutlined />} allowClear placeholder="Search by name or email"
                                value={studentQuery} onChange={e => setStudentQuery(e.target.value)} />
                            <div className="bm-picker" role="listbox" aria-multiselectable="true" aria-label="Students">
                                {visibleStudents.length === 0 ? (
                                    <div className="bm-empty-line"><TeamOutlined /> {students.length ? 'No student matches your search.' : 'No students yet — add them in Users first.'}</div>
                                ) : visibleStudents.map(s => {
                                    const on = picked.includes(s.id);
                                    return (
                                        <button key={s.id} type="button" role="option" aria-selected={on}
                                            className={`bm-pick${on ? ' is-on' : ''}`} onClick={() => togglePick(s.id)}>
                                            <span className="bm-check">{on && <CheckOutlined />}</span>
                                            <span className="bm-person-av">{initials(personName(s))}</span>
                                            <span className="bm-pick-text"><strong>{personName(s)}</strong><em>{s.email}</em></span>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {error && (
                        <div className="bm-alert" role="alert"><ExclamationCircleFilled /><span>{error}</span></div>
                    )}
                </Form>

                <footer className="bm-ed-foot">
                    <span className="bm-ed-count">Step {step + 1} of {steps.length}</span>
                    <div>
                        {step > 0 ? <Button onClick={() => { setError(null); setStep(step - 1); }} disabled={saving}>Back</Button>
                            : <Button onClick={close} disabled={saving}>Cancel</Button>}
                        <Button type="primary" loading={saving} onClick={isLast ? submit : next}>
                            {isLast ? (editing ? 'Save changes' : `Create batch${picked.length ? ` · ${picked.length}` : ''}`) : 'Continue'}
                        </Button>
                    </div>
                </footer>
            </div>
        </Modal>
    );
};

const LevelPicker: React.FC<{ value?: string; onChange?: (v: string) => void }> = ({ value, onChange }) => (
    <div className="bm-levels" role="radiogroup" aria-label="French level">
        {LEVELS.map(l => (
            <button key={l} type="button" role="radio" aria-checked={value === l}
                className={`bm-level-card ${levelTone(l)}${value === l ? ' is-on' : ''}`} onClick={() => onChange?.(l)}>
                <strong>{l}</strong>
                <span>{LEVEL_HINT[l]}</span>
            </button>
        ))}
    </div>
);

export default BatchEditor;
