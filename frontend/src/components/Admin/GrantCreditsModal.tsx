import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Dropdown, Input, InputNumber, Modal, Segmented, Select, Skeleton, message } from 'antd';
import {
    AudioOutlined, CloseOutlined, DeleteOutlined, FormOutlined, ReloadOutlined, SearchOutlined, TeamOutlined,
    ThunderboltFilled, UserOutlined,
} from '@ant-design/icons';
import { loadPeople, peekPeople, personName } from './examAdminData';
import type { ApiCall, BatchLite, PersonLite } from './examAdminData';
import './ExamAdmin.css';

/* ══════════════════════════════════════════
   AI CREDITS — grant Expression Écrite / Orale credits to students or batches,
   and review / revoke current balances.
══════════════════════════════════════════ */

interface CreditBalance {
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
    ee_credits: number;
    eo_credits: number;
    updated_at?: string;
}

const QUICK = [1, 5, 10, 20];

const GrantCreditsModal: React.FC<{ open: boolean; onClose: () => void; apiCall: ApiCall }> = ({ open, onClose, apiCall }) => {
    const [msg, msgHolder] = message.useMessage();
    const [modal, modalHolder] = Modal.useModal();
    const [tab, setTab] = useState<'grant' | 'balances'>('grant');

    const [students, setStudents] = useState<PersonLite[]>(() => peekPeople()?.students || []);
    const [batches, setBatches] = useState<BatchLite[]>(() => peekPeople()?.batches || []);
    const [studentIds, setStudentIds] = useState<number[]>([]);
    const [batchIds, setBatchIds] = useState<number[]>([]);
    const [ee, setEe] = useState<number | null>(null);
    const [eo, setEo] = useState<number | null>(null);
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [balances, setBalances] = useState<CreditBalance[] | null>(null);
    const [balancesLoading, setBalancesLoading] = useState(false);
    const [search, setSearch] = useState('');

    const fetchBalances = useCallback(async () => {
        setBalancesLoading(true);
        try {
            const r = await apiCall('/ai-credits/balances');
            if (!r.ok) throw new Error();
            const d = await r.json();
            setBalances(Array.isArray(d) ? d : []);
        } catch {
            msg.error('Could not load credit balances.');
            setBalances(b => b ?? []);
        } finally {
            setBalancesLoading(false);
        }
    }, [apiCall, msg]);

    // Reset and load once per opening (switching tabs no longer re-fetches the student list).
    useEffect(() => {
        if (!open) return;
        setTab('grant');
        setStudentIds([]); setBatchIds([]); setEe(null); setEo(null); setNotes(''); setSearch('');
        setBalances(null);
        loadPeople(apiCall).then(p => { setStudents(p.students); setBatches(p.batches); }).catch(() => msg.error('Could not load students and batches.'));
    }, [open, apiCall, msg]);

    useEffect(() => { if (open && tab === 'balances' && balances === null) fetchBalances(); }, [open, tab, balances, fetchBalances]);

    const recipients = studentIds.length + batchIds.length;
    const reach = useMemo(() => {
        const byId = new Map(batches.map(b => [b.id, Number(b.student_count) || 0]));
        return studentIds.length + batchIds.reduce((t, id) => t + (byId.get(id) || 0), 0);
    }, [studentIds, batchIds, batches]);
    const hasCredits = (ee || 0) > 0 || (eo || 0) > 0;
    const canSubmit = recipients > 0 && hasCredits && !submitting;

    const submit = async () => {
        if (!canSubmit) return;
        setSubmitting(true);
        try {
            const r = await apiCall('/ai-credits/bulk-grant', {
                method: 'POST',
                body: JSON.stringify({ student_ids: studentIds, batch_ids: batchIds, ee_credits: ee || 0, eo_credits: eo || 0, notes: notes.trim() || undefined }),
            });
            const d = await r.json().catch(() => ({}));
            if (!r.ok) { msg.error(d?.error || 'Credits could not be granted.'); return; }
            msg.success(`Credits granted to ${d.recipients_count} ${d.recipients_count === 1 ? 'student' : 'students'}`);
            setStudentIds([]); setBatchIds([]); setEe(null); setEo(null); setNotes('');
            setBalances(null);
        } catch {
            msg.error('Credits could not be granted. Check your connection and try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const revoke = (b: CreditBalance, type: 'ee' | 'eo' | 'all') => {
        const what = type === 'all' ? 'all AI credits' : type === 'ee' ? 'Expression Écrite credits' : 'Expression Orale credits';
        modal.confirm({
            title: `Revoke ${what}?`,
            content: `${personName(b)} will no longer be able to use ${what === 'all AI credits' ? 'them' : 'these credits'}.`,
            okText: 'Revoke',
            okButtonProps: { danger: true },
            onOk: async () => {
                const r = await apiCall('/ai-credits/revoke', { method: 'POST', body: JSON.stringify({ user_id: b.user_id, type, amount: 'all', notes: 'Revoked by admin' }) });
                if (!r.ok) { msg.error('Credits could not be revoked.'); throw new Error('revoke failed'); }
                msg.success('Credits revoked');
                fetchBalances();
            },
        });
    };

    const qq = search.trim().toLowerCase();
    const withCredits = (balances || []).filter(b => (b.ee_credits || 0) > 0 || (b.eo_credits || 0) > 0);
    const visible = withCredits.filter(b => !qq || `${personName(b)} ${b.email}`.toLowerCase().includes(qq));
    const totals = withCredits.reduce((t, b) => ({ ee: t.ee + (b.ee_credits || 0), eo: t.eo + (b.eo_credits || 0) }), { ee: 0, eo: 0 });

    const studentOptions = useMemo(() => students.map(s => ({ value: s.id, label: personName(s), email: s.email, search: `${personName(s)} ${s.email}`.toLowerCase() })), [students]);
    const batchOptions = useMemo(() => batches.map(b => ({ value: b.id, label: b.name, count: Number(b.student_count) || 0, search: b.name.toLowerCase() })), [batches]);

    return (
        <Modal open={open} onCancel={() => !submitting && onClose()} footer={null} closable={false} centered width="min(620px, calc(100vw - 24px))"
            wrapClassName="gc-modal" styles={{ content: { padding: 0 }, body: { padding: 0 } }} maskClosable={!submitting}>
            {msgHolder}{modalHolder}
            <div className="gc">
                <header className="ea-head">
                    <span className="ea-head-ic is-sky"><ThunderboltFilled /></span>
                    <div className="ea-head-text">
                        <h2>AI credits</h2>
                        <p>Credits pay for AI-graded Expression Écrite and Orale attempts.</p>
                    </div>
                    <button type="button" className="ea-close" onClick={() => !submitting && onClose()} aria-label="Close"><CloseOutlined /></button>
                </header>
                <div className="gc-tabs">
                    <Segmented block value={tab} onChange={v => setTab(v as 'grant' | 'balances')} options={[
                        { value: 'grant', label: 'Grant credits' },
                        { value: 'balances', label: 'Balances' },
                    ]} />
                </div>

                {tab === 'grant' ? (
                    <>
                        <div className="gc-body">
                            <div className="ea-field">
                                <label><UserOutlined /> Students</label>
                                <Select mode="multiple" allowClear showSearch placeholder="Search by name or email" value={studentIds} onChange={setStudentIds}
                                    options={studentOptions} optionFilterProp="search" maxTagCount="responsive"
                                    optionRender={o => <span className="ea-opt"><strong>{o.data.label}</strong><em>{o.data.email}</em></span>}
                                    notFoundContent={students.length ? 'No student matches' : 'Loading students…'} />
                            </div>
                            <div className="ea-field">
                                <label><TeamOutlined /> Batches</label>
                                <Select mode="multiple" allowClear showSearch placeholder="Every student of the batch receives the credits" value={batchIds} onChange={setBatchIds}
                                    options={batchOptions} optionFilterProp="search" maxTagCount="responsive"
                                    optionRender={o => <span className="ea-opt"><strong>{o.data.label}</strong><em>{o.data.count} {o.data.count === 1 ? 'student' : 'students'}</em></span>}
                                    notFoundContent={batches.length ? 'No batch matches' : 'Loading batches…'} />
                            </div>

                            <div className="ea-field">
                                <label>Credits per student</label>
                                <div className="gc-amounts">
                                    {([['ee', 'Expression Écrite', <FormOutlined key="i" />, ee, setEe], ['eo', 'Expression Orale', <AudioOutlined key="i" />, eo, setEo]] as const).map(([k, label, icon, value, set]) => (
                                        <div key={k} className={`gc-amount is-${k}`}>
                                            <span className="gc-amount-head">{icon}{label}</span>
                                            <InputNumber min={0} max={9999} value={value ?? undefined} onChange={v => set(v ?? null)} placeholder="0" />
                                            <span className="gc-quick">
                                                {QUICK.map(n => <button key={n} type="button" className={value === n ? 'is-on' : ''} onClick={() => set(n)}>{n}</button>)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <small>Credits never expire. Each AI-graded attempt uses one credit.</small>
                            </div>

                            <div className="ea-field">
                                <label>Note <em>optional</em></label>
                                <Input value={notes} onChange={e => setNotes(e.target.value)} maxLength={120} placeholder="e.g. Practice before the January exam" />
                            </div>
                        </div>
                        <footer className="ea-foot">
                            <div className="ea-summary">
                                {!recipients ? 'Choose students or batches.'
                                    : !hasCredits ? 'Enter at least one credit amount.'
                                        : <>{(ee || 0) > 0 && <><strong>{ee}</strong> EE</>}{(ee || 0) > 0 && (eo || 0) > 0 && ' + '}{(eo || 0) > 0 && <><strong>{eo}</strong> EO</>} per student{reach ? <> · up to <strong>{reach}</strong> {reach === 1 ? 'student' : 'students'}</> : null}</>}
                            </div>
                            <Button onClick={onClose} disabled={submitting}>Cancel</Button>
                            <Button type="primary" icon={<ThunderboltFilled />} onClick={submit} loading={submitting} disabled={!canSubmit}>Grant credits</Button>
                        </footer>
                    </>
                ) : (
                    <>
                        <div className="gc-body">
                            <div className="gc-totals">
                                <div><span>Students with credits</span><strong>{balances ? withCredits.length : '–'}</strong></div>
                                <div className="is-ee"><span>EE credits left</span><strong>{balances ? totals.ee : '–'}</strong></div>
                                <div className="is-eo"><span>EO credits left</span><strong>{balances ? totals.eo : '–'}</strong></div>
                            </div>
                            <div className="gc-search">
                                <Input allowClear prefix={<SearchOutlined />} placeholder="Search students" value={search} onChange={e => setSearch(e.target.value)} />
                                <Button icon={<ReloadOutlined spin={balancesLoading} />} onClick={fetchBalances} aria-label="Refresh" />
                            </div>
                            <div className="gc-list">
                                {balances === null ? <div className="ea-pad"><Skeleton active paragraph={{ rows: 5 }} /></div>
                                    : visible.length === 0 ? <div className="ea-state"><ThunderboltFilled /><strong>{withCredits.length ? 'No student matches' : 'No student has credits'}</strong><span>{withCredits.length ? 'Try another name.' : 'Granted credits appear here.'}</span></div>
                                        : visible.map(b => (
                                            <div key={b.user_id} className="gc-row">
                                                <span className="gc-av">{(personName(b)[0] || '?').toUpperCase()}</span>
                                                <span className="gc-row-text"><strong>{personName(b)}</strong><em>{b.email}</em></span>
                                                <span className={`gc-badge is-ee${b.ee_credits ? '' : ' is-zero'}`} title="Expression Écrite">EE {b.ee_credits}</span>
                                                <span className={`gc-badge is-eo${b.eo_credits ? '' : ' is-zero'}`} title="Expression Orale">EO {b.eo_credits}</span>
                                                <Dropdown trigger={['click']} menu={{
                                                    items: [
                                                        { key: 'ee', label: 'Revoke Expression Écrite', disabled: !b.ee_credits, danger: true },
                                                        { key: 'eo', label: 'Revoke Expression Orale', disabled: !b.eo_credits, danger: true },
                                                        { type: 'divider' },
                                                        { key: 'all', label: 'Revoke all credits', danger: true },
                                                    ],
                                                    onClick: ({ key }) => revoke(b, key as 'ee' | 'eo' | 'all'),
                                                }}>
                                                    <Button type="text" size="small" danger icon={<DeleteOutlined />} aria-label={`Revoke credits of ${personName(b)}`} />
                                                </Dropdown>
                                            </div>
                                        ))}
                            </div>
                        </div>
                        <footer className="ea-foot">
                            <div className="ea-summary">{balances ? `${visible.length} of ${withCredits.length} students` : 'Loading…'}</div>
                            <Button onClick={onClose}>Close</Button>
                        </footer>
                    </>
                )}
            </div>
        </Modal>
    );
};

export default GrantCreditsModal;
