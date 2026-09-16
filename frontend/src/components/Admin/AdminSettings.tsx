import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, ConfigProvider, Form, InputNumber, Skeleton, Switch, Tooltip, message } from 'antd';
import {
    CheckCircleOutlined, ClockCircleOutlined, InfoCircleOutlined, KeyOutlined, ReloadOutlined, SafetyOutlined,
    SaveOutlined, UndoOutlined, WarningOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { formatLocal } from '../../utils/timezone';
import './AdminSettings.css';

/* ══════════════════════════════════════════
   PLATFORM SETTINGS
   Six values that govern attendance sessions. The page reads them as a whole,
   shows what they mean in plain words, and only enables Save once something changed.
══════════════════════════════════════════ */

interface SettingRow {
    id: number;
    setting_key: string;
    setting_value: string;
    description?: string | null;
    updated_at?: string;
}

interface Values {
    code_length: number;
    code_expiry_minutes: number;
    early_start_minutes: number;
    late_join_minutes: number;
    auto_end_minutes: number;
    require_code_for_attendance: boolean;
}

const DEFAULTS: Values = {
    code_length: 6,
    code_expiry_minutes: 30,
    early_start_minutes: 15,
    late_join_minutes: 10,
    auto_end_minutes: 15,
    require_code_for_attendance: true,
};

const LIMITS: Record<keyof Omit<Values, 'require_code_for_attendance'>, { min: number; max: number }> = {
    code_length: { min: 4, max: 12 },
    code_expiry_minutes: { min: 1, max: 120 },
    early_start_minutes: { min: 0, max: 60 },
    late_join_minutes: { min: 0, max: 60 },
    auto_end_minutes: { min: 0, max: 180 },
};

const toValues = (map: Record<string, string>): Values => ({
    code_length: Number(map.code_length ?? DEFAULTS.code_length),
    code_expiry_minutes: Number(map.code_expiry_minutes ?? DEFAULTS.code_expiry_minutes),
    early_start_minutes: Number(map.early_start_minutes ?? DEFAULTS.early_start_minutes),
    late_join_minutes: Number(map.late_join_minutes ?? DEFAULTS.late_join_minutes),
    auto_end_minutes: Number(map.auto_end_minutes ?? DEFAULTS.auto_end_minutes),
    require_code_for_attendance: (map.require_code_for_attendance ?? 'true') === 'true',
});

const same = (a: Values, b: Values) => (Object.keys(DEFAULTS) as (keyof Values)[]).every(k => a[k] === b[k]);
const minutes = (n: number) => `${n} ${n === 1 ? 'minute' : 'minutes'}`;

/** Declared here, not inside the page: a component created during render remounts on every
 *  keystroke, which would drop focus out of the field as you type. */
const NumberField: React.FC<{ name: keyof typeof LIMITS; label: string; unit: string; help: string }> = ({ name, label, unit, help }) => (
    <Form.Item name={name} label={label} rules={[{ required: true, message: `${label} is required` }]} extra={help}>
        <InputNumber className="st-num" min={LIMITS[name].min} max={LIMITS[name].max} addonAfter={unit} aria-label={label} />
    </Form.Item>
);

const AdminSettings: React.FC = () => {
    const { apiCall, user } = useAuth();
    const [form] = Form.useForm<Values>();
    const [msg, msgHolder] = message.useMessage();

    const [saved, setSaved] = useState<Values | null>(null);
    const [values, setValues] = useState<Values>(DEFAULTS);
    const [updatedAt, setUpdatedAt] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const apply = useCallback((next: Values, stamp: string | null) => {
        setSaved(next);
        setValues(next);
        setUpdatedAt(stamp);
        form.setFieldsValue(next);   // initialValues alone would not refresh an already-mounted form
    }, [form]);

    const load = useCallback(async () => {
        try {
            const res = await apiCall('/admin/settings');
            if (!res.ok) throw new Error(`The server answered ${res.status}.`);
            const rows: SettingRow[] = await res.json();
            const map: Record<string, string> = {};
            let stamp: string | null = null;
            (Array.isArray(rows) ? rows : []).forEach(r => {
                map[r.setting_key] = String(r.setting_value);
                if (r.updated_at && (!stamp || r.updated_at > stamp)) stamp = r.updated_at;
            });
            apply(toValues(map), stamp);
            setError(null);
        } catch (e: any) {
            setError(e?.message || 'Could not load the settings.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [apiCall, apply]);

    useEffect(() => { load(); }, [load]);

    const dirty = !!saved && !same(values, saved);

    const submit = async (next: Values) => {
        setSaving(true);
        try {
            const res = await apiCall('/admin/settings', { method: 'PUT', body: JSON.stringify({ settingsObj: next }) });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) { msg.error(data?.error || 'The settings could not be saved.'); return; }
            const map: Record<string, string> = {};
            let stamp: string | null = null;
            (data.settings || []).forEach((r: SettingRow) => {
                map[r.setting_key] = String(r.setting_value);
                if (r.updated_at && (!stamp || r.updated_at > stamp)) stamp = r.updated_at;
            });
            apply(Object.keys(map).length ? toValues(map) : next, stamp);
            msg.success('Settings saved');
        } catch {
            msg.error('The settings could not be saved. Check your connection and try again.');
        } finally {
            setSaving(false);
        }
    };

    /* ── What these values mean, in plain words ── */
    const notes = useMemo(() => {
        const out: { tone: 'warn' | 'info'; text: string }[] = [];
        if (!values.require_code_for_attendance) {
            out.push({ tone: 'warn', text: 'Students can be marked present without entering a code, so attendance can be claimed from anywhere.' });
        }
        if (values.require_code_for_attendance && values.code_expiry_minutes < values.late_join_minutes) {
            out.push({ tone: 'warn', text: `The code expires after ${minutes(values.code_expiry_minutes)} but students may join up to ${minutes(values.late_join_minutes)} late — late arrivals will find the code already invalid.` });
        }
        if (values.require_code_for_attendance && values.code_length < 5) {
            out.push({ tone: 'warn', text: 'A 4-digit code is short enough to be guessed. Five digits or more is safer.' });
        }
        if (values.early_start_minutes === 0) {
            out.push({ tone: 'info', text: 'Teachers cannot open a session before its scheduled time.' });
        }
        if (values.auto_end_minutes === 0) {
            out.push({ tone: 'info', text: 'Sessions close as soon as the scheduled end time passes.' });
        }
        if (values.late_join_minutes === 0) {
            out.push({ tone: 'info', text: 'Students cannot check in once the session has started.' });
        }
        return out;
    }, [values]);

    /* ═══════════ LOADING ═══════════ */
    if (loading) {
        return (
            <div className="st" aria-busy="true">
                <div className="st-header"><div><Skeleton.Input active size="small" style={{ width: 150, height: 12 }} /><div style={{ marginTop: 10 }}><Skeleton.Input active style={{ width: 200, height: 26 }} /></div></div></div>
                {[0, 1, 2].map(i => <div key={i} className="st-card st-pad"><Skeleton active paragraph={{ rows: 3 }} /></div>)}
            </div>
        );
    }

    return (
        <ConfigProvider theme={{ token: { colorPrimary: '#4f46e5', fontSize: 13, borderRadius: 8 } }}>
            {msgHolder}
            <div className="st">
                {/* ── Header ── */}
                <header className="st-header">
                    <div>
                        <div className="st-overline">Admin console · System</div>
                        <h1 className="st-title">Settings</h1>
                        <p className="st-subtitle">
                            How attendance sessions behave: access codes, timing windows and check-in rules.
                            {updatedAt && <> Last changed {formatLocal(updatedAt, user?.timezone, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}.</>}
                        </p>
                    </div>
                    <div className="st-header-actions">
                        <Tooltip title="Reload from the server"><Button icon={<ReloadOutlined spin={refreshing} />} aria-label="Reload" onClick={() => { setRefreshing(true); load(); }} /></Tooltip>
                        <Button icon={<UndoOutlined />} disabled={!dirty || saving} onClick={() => saved && apply(saved, updatedAt)}>Discard</Button>
                        <Button type="primary" icon={<SaveOutlined />} loading={saving} disabled={!dirty} onClick={() => form.submit()}>Save changes</Button>
                    </div>
                </header>

                {error && (
                    <div className="st-alert is-error" role="alert">
                        <WarningOutlined />
                        <span><strong>Couldn't load the settings.</strong> {error}</span>
                        <Button size="small" onClick={() => { setLoading(true); load(); }}>Retry</Button>
                    </div>
                )}

                <Form<Values>
                    form={form}
                    layout="vertical"
                    requiredMark={false}
                    initialValues={saved || DEFAULTS}
                    onValuesChange={(_, all) => setValues(all)}
                    onFinish={submit}
                    onFinishFailed={() => msg.error('Some values are out of range — check the highlighted fields.')}
                >
                    {/* ── Summary ── */}
                    <section className="st-card st-summary">
                        <div className="st-summary-main">
                            <span className="st-summary-ic"><InfoCircleOutlined /></span>
                            <div>
                                <h2>What these settings do</h2>
                                <p>
                                    Teachers can open a session <strong>{values.early_start_minutes === 0 ? 'at its scheduled time' : `${minutes(values.early_start_minutes)} early`}</strong>.
                                    {values.require_code_for_attendance
                                        ? <> Students check in with a <strong>{values.code_length}-digit code</strong> that stays valid for <strong>{minutes(values.code_expiry_minutes)}</strong>,</>
                                        : <> Students are checked in <strong>without a code</strong>,</>}
                                    {values.late_join_minutes === 0 ? ' and only until the session starts.' : <> and may still join up to <strong>{minutes(values.late_join_minutes)}</strong> after it starts.</>}
                                    {' '}Sessions close <strong>{values.auto_end_minutes === 0 ? 'at the scheduled end' : `${minutes(values.auto_end_minutes)} after the scheduled end`}</strong>.
                                </p>
                            </div>
                        </div>
                        {notes.length > 0 && (
                            <ul className="st-notes">
                                {notes.map((n, i) => (
                                    <li key={i} className={`is-${n.tone}`}>{n.tone === 'warn' ? <WarningOutlined /> : <InfoCircleOutlined />}<span>{n.text}</span></li>
                                ))}
                            </ul>
                        )}
                        <p className="st-footnote">Changes apply to sessions started from now on. Sessions already running keep the rules they started with.</p>
                    </section>

                    {/* ── Access code ── */}
                    <section className="st-card">
                        <div className="st-card-head">
                            <span className="st-card-ic is-green"><KeyOutlined /></span>
                            <div><h2>Access code</h2><p>The code a teacher shares so students can check in.</p></div>
                        </div>
                        <div className="st-fields">
                            <NumberField name="code_length" label="Code length" unit="digits" help={`Between ${LIMITS.code_length.min} and ${LIMITS.code_length.max} digits.`} />
                            <NumberField name="code_expiry_minutes" label="Code stays valid for" unit="min" help="After this, the teacher must generate a new code." />
                        </div>
                    </section>

                    {/* ── Session timing ── */}
                    <section className="st-card">
                        <div className="st-card-head">
                            <span className="st-card-ic is-amber"><ClockCircleOutlined /></span>
                            <div><h2>Session timing</h2><p>When a class can be opened, joined and closed, relative to its scheduled time.</p></div>
                        </div>
                        <div className="st-fields is-three">
                            <NumberField name="early_start_minutes" label="Teachers can start early by" unit="min" help="0 means only at the scheduled time." />
                            <NumberField name="late_join_minutes" label="Students can join late by" unit="min" help="Counted from the moment the session starts." />
                            <NumberField name="auto_end_minutes" label="Close session after end by" unit="min" help="Counted from the scheduled end time." />
                        </div>
                    </section>

                    {/* ── Check-in rule ── */}
                    <section className="st-card">
                        <div className="st-card-head">
                            <span className="st-card-ic is-violet"><SafetyOutlined /></span>
                            <div><h2>Check-in rule</h2><p>Whether the code is required to be marked present.</p></div>
                        </div>
                        <Form.Item name="require_code_for_attendance" valuePropName="checked" noStyle>
                            <Switch className="st-hidden-switch" />
                        </Form.Item>
                        <div className="st-choices" role="radiogroup" aria-label="Check-in rule">
                            {[true, false].map(on => (
                                <button key={String(on)} type="button" role="radio" aria-checked={values.require_code_for_attendance === on}
                                    className={`st-choice${values.require_code_for_attendance === on ? ' is-on' : ''}${on ? '' : ' is-risky'}`}
                                    onClick={() => { form.setFieldsValue({ require_code_for_attendance: on }); setValues(v => ({ ...v, require_code_for_attendance: on })); }}>
                                    <span className="st-choice-mark">{values.require_code_for_attendance === on && <CheckCircleOutlined />}</span>
                                    <span className="st-choice-text">
                                        <strong>{on ? 'Code required' : 'No code needed'}</strong>
                                        <em>{on ? 'Students must type the code the teacher shares. Recommended.' : 'Students are marked present without entering anything.'}</em>
                                    </span>
                                </button>
                            ))}
                        </div>
                    </section>
                </Form>

                {/* ── Unsaved changes bar ── */}
                {dirty && (
                    <div className="st-bar" role="status">
                        <span><strong>You have unsaved changes.</strong> They take effect for new sessions once saved.</span>
                        <Button size="small" onClick={() => saved && apply(saved, updatedAt)} disabled={saving}>Discard</Button>
                        <Button size="small" type="primary" icon={<SaveOutlined />} loading={saving} onClick={() => form.submit()}>Save changes</Button>
                    </div>
                )}
            </div>
        </ConfigProvider>
    );
};

export default AdminSettings;
