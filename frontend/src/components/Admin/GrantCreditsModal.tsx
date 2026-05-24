import React, { useEffect, useState, useCallback } from 'react';
import { Modal, Button, Select, InputNumber, message, Spin, Tag } from 'antd';
import {
    ThunderboltFilled,
    UserOutlined,
    TeamOutlined,
    FormOutlined,
    AudioOutlined,
    CheckCircleFilled,
} from '@ant-design/icons';

interface GrantCreditsModalProps {
    open: boolean;
    onClose: () => void;
    apiCall: (endpoint: string, options?: RequestInit) => Promise<Response>;
}

interface Student {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
}

interface Batch {
    id: number;
    name: string;
    student_count?: number;
}

const GrantCreditsModal: React.FC<GrantCreditsModalProps> = ({ open, onClose, apiCall }) => {
    const [students, setStudents] = useState<Student[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
    const [selectedBatchIds, setSelectedBatchIds] = useState<number[]>([]);
    const [eeCredits, setEeCredits] = useState<number | null>(null);
    const [eoCredits, setEoCredits] = useState<number | null>(null);
    const [notes, setNotes] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const fetchData = useCallback(async () => {
        if (!open) return;
        setLoading(true);
        try {
            const [studentsResp, batchesResp] = await Promise.all([
                apiCall('/users?role=student'),
                apiCall('/batches'),
            ]);
            if (studentsResp.ok) {
                const data = await studentsResp.json();
                setStudents(Array.isArray(data) ? data : (data?.users || []));
            }
            if (batchesResp.ok) {
                const data = await batchesResp.json();
                setBatches(Array.isArray(data) ? data : []);
            }
        } catch {
            message.error('Failed to load students and batches');
        } finally {
            setLoading(false);
        }
    }, [open, apiCall]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Reset on open
    useEffect(() => {
        if (open) {
            setSelectedStudentIds([]);
            setSelectedBatchIds([]);
            setEeCredits(null);
            setEoCredits(null);
            setNotes('');
        }
    }, [open]);

    const totalRecipients = selectedStudentIds.length + selectedBatchIds.length;
    const hasCredits = (eeCredits || 0) > 0 || (eoCredits || 0) > 0;
    const canSubmit = totalRecipients > 0 && hasCredits && !submitting;

    const handleSubmit = async () => {
        if (!canSubmit) return;
        setSubmitting(true);
        try {
            const resp = await apiCall('/ai-credits/bulk-grant', {
                method: 'POST',
                body: JSON.stringify({
                    student_ids: selectedStudentIds,
                    batch_ids: selectedBatchIds,
                    ee_credits: eeCredits || 0,
                    eo_credits: eoCredits || 0,
                    notes: notes.trim() || undefined,
                }),
            });
            const data = await resp.json().catch(() => ({}));
            if (!resp.ok) {
                message.error(data?.error || 'Failed to grant credits');
                return;
            }
            message.success(
                `Credits granted to ${data.recipients_count} student${data.recipients_count !== 1 ? 's' : ''}`
            );
            onClose();
        } catch {
            message.error('Network error while granting credits');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            open={open}
            onCancel={() => !submitting && onClose()}
            footer={null}
            width={580}
            centered
            destroyOnHidden
            closable={false}
            maskClosable={!submitting}
            styles={{
                body: { padding: 0 },
                content: { padding: 0, borderRadius: 20, overflow: 'hidden' },
            }}
        >
            {/* ── Header band — sky-blue gradient (matches the AI credits theme) ── */}
            <div style={{
                position: 'relative', height: 100,
                background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                overflow: 'hidden',
                padding: '0 28px',
                display: 'flex', alignItems: 'center', gap: 16,
            }}>
                <div style={{
                    position: 'absolute', top: -30, right: -30,
                    width: 130, height: 130, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.10)',
                }} />
                <div style={{
                    position: 'absolute', bottom: -40, right: 70,
                    width: 90, height: 90, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.06)',
                }} />
                <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: 'rgba(255,255,255,0.22)',
                    backdropFilter: 'blur(8px)',
                    border: '1.5px solid rgba(255,255,255,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    position: 'relative',
                }}>
                    <ThunderboltFilled style={{ fontSize: 26, color: '#fff' }} />
                </div>
                <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.85)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>
                        AI Credits
                    </div>
                    <div style={{ fontSize: 19, fontWeight: 800, color: '#fff', letterSpacing: -0.3 }}>
                        Grant Credits
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: 500, marginTop: 2 }}>
                        Give EE / EO AI credits to one or many students at once
                    </div>
                </div>
                <button
                    onClick={() => !submitting && onClose()}
                    style={{
                        width: 32, height: 32, borderRadius: 10,
                        background: 'rgba(255,255,255,0.18)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        color: '#fff', fontSize: 14, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        position: 'relative',
                    }}
                >✕</button>
            </div>

            {/* ── Body ── */}
            <div style={{ padding: '24px 28px 8px' }}>
                {loading ? (
                    <div style={{ padding: '60px 0', textAlign: 'center' }}><Spin /></div>
                ) : (
                    <>
                        {/* Recipient pickers */}
                        <div style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: 14,
                            padding: 16,
                            marginBottom: 14,
                        }}>
                            <div style={{ fontSize: 11, fontWeight: 800, color: '#475569', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12 }}>
                                Recipients
                            </div>

                            {/* Students */}
                            <div style={{ marginBottom: 12 }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <UserOutlined style={{ color: '#0ea5e9' }} />
                                    Students {selectedStudentIds.length > 0 && <Tag color="blue" style={{ marginLeft: 4, fontSize: 10, fontWeight: 700, borderRadius: 6 }}>{selectedStudentIds.length}</Tag>}
                                </div>
                                <Select
                                    mode="multiple"
                                    value={selectedStudentIds}
                                    onChange={setSelectedStudentIds}
                                    placeholder="Search and select students…"
                                    showSearch
                                    optionFilterProp="label"
                                    style={{ width: '100%' }}
                                    maxTagCount="responsive"
                                    options={students.map(s => ({
                                        value: s.id,
                                        label: `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.email,
                                    }))}
                                />
                            </div>

                            {/* Batches */}
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <TeamOutlined style={{ color: '#0ea5e9' }} />
                                    Batches {selectedBatchIds.length > 0 && <Tag color="blue" style={{ marginLeft: 4, fontSize: 10, fontWeight: 700, borderRadius: 6 }}>{selectedBatchIds.length}</Tag>}
                                </div>
                                <Select
                                    mode="multiple"
                                    value={selectedBatchIds}
                                    onChange={setSelectedBatchIds}
                                    placeholder="Select batches (every student inside gets credits)…"
                                    showSearch
                                    optionFilterProp="label"
                                    style={{ width: '100%' }}
                                    maxTagCount="responsive"
                                    options={batches.map(b => ({
                                        value: b.id,
                                        label: b.name,
                                    }))}
                                />
                            </div>
                        </div>

                        {/* Credit amounts */}
                        <div style={{
                            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                            border: '1px solid #bae6fd',
                            borderRadius: 14,
                            padding: 16,
                            marginBottom: 14,
                        }}>
                            <div style={{ fontSize: 11, fontWeight: 800, color: '#0369a1', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 }}>
                                Credit amount per recipient
                            </div>
                            <div style={{ fontSize: 11.5, color: '#0c4a6e', marginBottom: 12 }}>
                                Credits never expire. Each AI-graded attempt consumes 1 credit.
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div style={{
                                    background: '#fff', borderRadius: 10, padding: 12,
                                    border: '1px solid rgba(244,63,94,0.18)',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                        <FormOutlined style={{ color: '#f43f5e', fontSize: 14 }} />
                                        <span style={{ fontSize: 11.5, fontWeight: 700, color: '#475569' }}>Expression Écrite</span>
                                    </div>
                                    <InputNumber
                                        min={0}
                                        max={9999}
                                        value={eeCredits ?? undefined}
                                        onChange={(v) => setEeCredits(v as number | null)}
                                        placeholder="0"
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div style={{
                                    background: '#fff', borderRadius: 10, padding: 12,
                                    border: '1px solid rgba(16,185,129,0.18)',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                        <AudioOutlined style={{ color: '#10b981', fontSize: 14 }} />
                                        <span style={{ fontSize: 11.5, fontWeight: 700, color: '#475569' }}>Expression Orale</span>
                                    </div>
                                    <InputNumber
                                        min={0}
                                        max={9999}
                                        value={eoCredits ?? undefined}
                                        onChange={(v) => setEoCredits(v as number | null)}
                                        placeholder="0"
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Optional note */}
                        <div style={{ marginBottom: 14 }}>
                            <div style={{ fontSize: 11, fontWeight: 800, color: '#475569', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6 }}>
                                Note <span style={{ fontWeight: 500, color: '#94a3b8', textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                            </div>
                            <input
                                type="text"
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                placeholder="e.g. Practice for January TEF exam"
                                maxLength={120}
                                style={{
                                    width: '100%', padding: '8px 12px',
                                    border: '1px solid #e2e8f0', borderRadius: 10,
                                    fontSize: 13, color: '#0f172a', outline: 'none',
                                    fontFamily: 'inherit',
                                }}
                            />
                        </div>

                        {/* Summary line */}
                        {canSubmit && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: '10px 14px',
                                background: 'rgba(34,197,94,0.08)',
                                border: '1px solid rgba(34,197,94,0.2)',
                                borderRadius: 10,
                                marginBottom: 6,
                                fontSize: 12.5, color: '#15803d', fontWeight: 600,
                            }}>
                                <CheckCircleFilled style={{ color: '#22c55e' }} />
                                Will grant {(eeCredits || 0) > 0 && `${eeCredits} EE`}
                                {(eeCredits || 0) > 0 && (eoCredits || 0) > 0 && ' + '}
                                {(eoCredits || 0) > 0 && `${eoCredits} EO`}
                                {' '} credit{((eeCredits || 0) + (eoCredits || 0)) > 1 ? 's' : ''} per recipient
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* ── Footer ── */}
            <div style={{
                padding: '16px 28px 22px',
                display: 'flex', justifyContent: 'flex-end', gap: 8,
                borderTop: '1px solid #f1f5f9',
            }}>
                <Button
                    onClick={onClose}
                    disabled={submitting}
                    style={{ borderRadius: 10, height: 40, fontWeight: 600, color: '#64748b', borderColor: '#e2e8f0' }}
                >
                    Cancel
                </Button>
                <Button
                    type="primary"
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    loading={submitting}
                    icon={<ThunderboltFilled />}
                    style={{
                        borderRadius: 10, height: 40, fontWeight: 700,
                        background: canSubmit ? 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)' : undefined,
                        border: 'none',
                        boxShadow: canSubmit ? '0 8px 18px -6px rgba(14,165,233,0.5)' : 'none',
                        paddingInline: 18,
                    }}
                >
                    Grant credits
                </Button>
            </div>
        </Modal>
    );
};

export default GrantCreditsModal;
