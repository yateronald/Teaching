import React, { useEffect, useState, useCallback } from 'react';
import { Modal, Button, Select, InputNumber, message, Spin, Tag, Tabs, Table, Input, Dropdown } from 'antd';
import {
    ThunderboltFilled,
    UserOutlined,
    TeamOutlined,
    FormOutlined,
    AudioOutlined,
    CheckCircleFilled,
    SearchOutlined,
    DeleteOutlined,
    ReloadOutlined,
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

interface CreditBalance {
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
    ee_credits: number;
    eo_credits: number;
    updated_at?: string;
}

const GrantCreditsModal: React.FC<GrantCreditsModalProps> = ({ open, onClose, apiCall }) => {
    const [activeTab, setActiveTab] = useState<string>('grant');
    
    // Grant state
    const [students, setStudents] = useState<Student[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
    const [selectedBatchIds, setSelectedBatchIds] = useState<number[]>([]);
    const [eeCredits, setEeCredits] = useState<number | null>(null);
    const [eoCredits, setEoCredits] = useState<number | null>(null);
    const [notes, setNotes] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Balances state
    const [balances, setBalances] = useState<CreditBalance[]>([]);
    const [loadingBalances, setLoadingBalances] = useState(false);
    const [balancesSearch, setBalancesSearch] = useState('');

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

    const fetchBalances = useCallback(async () => {
        if (!open) return;
        setLoadingBalances(true);
        try {
            const resp = await apiCall('/ai-credits/balances');
            if (resp.ok) {
                const data = await resp.json();
                setBalances(Array.isArray(data) ? data : []);
            } else {
                message.error('Failed to load student credit balances');
            }
        } catch {
            message.error('Network error loading credit balances');
        } finally {
            setLoadingBalances(false);
        }
    }, [open, apiCall]);

    useEffect(() => { 
        if (open) {
            fetchData(); 
            if (activeTab === 'balances') {
                fetchBalances();
            }
        }
    }, [open, fetchData, fetchBalances, activeTab]);

    // Reset on open
    useEffect(() => {
        if (open) {
            setSelectedStudentIds([]);
            setSelectedBatchIds([]);
            setEeCredits(null);
            setEoCredits(null);
            setNotes('');
            setActiveTab('grant');
            setBalancesSearch('');
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

    const handleRevoke = async (userId: number, type: 'ee' | 'eo' | 'all') => {
        try {
            const resp = await apiCall('/ai-credits/revoke', {
                method: 'POST',
                body: JSON.stringify({
                    user_id: userId,
                    type,
                    amount: 'all',
                    notes: 'Revoked by admin',
                }),
            });
            const data = await resp.json().catch(() => ({}));
            if (!resp.ok) {
                message.error(data?.error || 'Failed to revoke credits');
                return;
            }
            message.success('Credits successfully revoked');
            fetchBalances();
        } catch {
            message.error('Network error while revoking credits');
        }
    };

    // Filter balances based on search query and positive credit balance
    const filteredBalances = balances.filter(b => {
        if ((b.ee_credits || 0) <= 0 && (b.eo_credits || 0) <= 0) return false;
        const query = balancesSearch.toLowerCase();
        const fullName = `${b.first_name || ''} ${b.last_name || ''}`.toLowerCase();
        return fullName.includes(query) || (b.email || '').toLowerCase().includes(query);
    });

    const balancesColumns = [
        {
            title: 'Student',
            key: 'student',
            render: (_: any, record: CreditBalance) => (
                <div>
                    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 13 }}>
                        {`${record.first_name || ''} ${record.last_name || ''}`.trim() || record.email}
                    </div>
                    <div style={{ color: '#64748b', fontSize: 11 }}>{record.email}</div>
                </div>
            ),
        },
        {
            title: 'EE Credits',
            dataIndex: 'ee_credits',
            key: 'ee',
            width: 110,
            align: 'center' as const,
            render: (v: number) => {
                const style = v > 0 
                    ? { background: '#fff1f2', color: '#f43f5e', border: '1px solid #fecdd3', fontWeight: 700, borderRadius: 6 }
                    : { background: '#f1f5f9', color: '#94a3b8', border: '1px solid #e2e8f0', fontWeight: 500, borderRadius: 6 };
                return <Tag style={style}>{v}</Tag>;
            },
        },
        {
            title: 'EO Credits',
            dataIndex: 'eo_credits',
            key: 'eo',
            width: 110,
            align: 'center' as const,
            render: (v: number) => {
                const style = v > 0 
                    ? { background: '#ecfdf5', color: '#10b981', border: '1px solid #a7f3d0', fontWeight: 700, borderRadius: 6 }
                    : { background: '#f1f5f9', color: '#94a3b8', border: '1px solid #e2e8f0', fontWeight: 500, borderRadius: 6 };
                return <Tag style={style}>{v}</Tag>;
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 80,
            align: 'center' as const,
            render: (_: any, record: CreditBalance) => {
                const hasCredits = record.ee_credits > 0 || record.eo_credits > 0;
                if (!hasCredits) return <span style={{ color: '#cbd5e1', fontSize: 12 }}>—</span>;
                
                return (
                    <Dropdown
                        menu={{
                            items: [
                                {
                                    key: 'revoke_ee',
                                    label: 'Revoke Expression Écrite',
                                    disabled: record.ee_credits === 0,
                                    danger: true,
                                },
                                {
                                    key: 'revoke_eo',
                                    label: 'Revoke Expression Orale',
                                    disabled: record.eo_credits === 0,
                                    danger: true,
                                },
                                {
                                    type: 'divider',
                                },
                                {
                                    key: 'revoke_all',
                                    label: 'Revoke All Credits',
                                    danger: true,
                                },
                            ],
                            onClick: ({ key }) => {
                                let type: 'ee' | 'eo' | 'all' = 'all';
                                if (key === 'revoke_ee') type = 'ee';
                                else if (key === 'revoke_eo') type = 'eo';
                                
                                Modal.confirm({
                                    title: 'Confirm Revocation',
                                    content: `Are you sure you want to revoke ${
                                        type === 'all' ? 'all EE and EO' : type.toUpperCase()
                                    } credits for ${record.first_name || ''} ${record.last_name || ''}?`,
                                    okText: 'Yes, Revoke',
                                    okType: 'danger',
                                    cancelText: 'Cancel',
                                    onOk: () => handleRevoke(record.user_id, type),
                                });
                            },
                        }}
                        trigger={['click']}
                    >
                        <Button
                            type="text"
                            size="small"
                            icon={<DeleteOutlined style={{ color: '#ef4444' }} />}
                            style={{ borderRadius: 8 }}
                        />
                    </Dropdown>
                );
            },
        },
    ];

    return (
        <Modal
            open={open}
            onCancel={() => !submitting && onClose()}
            footer={null}
            width={640}
            centered
            destroyOnClose
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
                        Manage Credits
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: 500, marginTop: 2 }}>
                        Assign AI credits or view and revoke balances for students
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
                        zIndex: 10,
                    }}
                >✕</button>
            </div>

            {/* ── Tabs Navigation & Body Content ── */}
            <div style={{ padding: '16px 28px 8px' }}>
                <Tabs
                    activeKey={activeTab}
                    onChange={(key) => {
                        setActiveTab(key);
                        if (key === 'balances') {
                            fetchBalances();
                        }
                    }}
                    items={[
                        {
                            key: 'grant',
                            label: (
                                <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <ThunderboltFilled />
                                    Grant Credits
                                </span>
                            ),
                            children: (
                                <>
                                    {loading ? (
                                        <div style={{ padding: '40px 0', textAlign: 'center' }}><Spin /></div>
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
                                </>
                            ),
                        },
                        {
                            key: 'balances',
                            label: (
                                <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <TeamOutlined />
                                    Assigned Balances
                                </span>
                            ),
                            children: (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 320 }}>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <Input
                                            placeholder="Search students by name or email…"
                                            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                                            value={balancesSearch}
                                            onChange={(e) => setBalancesSearch(e.target.value)}
                                            style={{ borderRadius: 10, flex: 1 }}
                                            allowClear
                                        />
                                        <Button
                                            icon={<ReloadOutlined />}
                                            onClick={fetchBalances}
                                            loading={loadingBalances}
                                            style={{ borderRadius: 10, width: 40 }}
                                        />
                                    </div>
                                    <Table
                                        dataSource={filteredBalances}
                                        columns={balancesColumns}
                                        rowKey="user_id"
                                        size="small"
                                        loading={loadingBalances}
                                        pagination={{
                                            pageSize: 5,
                                            showSizeChanger: false,
                                            size: 'small',
                                        }}
                                        locale={{
                                            emptyText: 'No student credit records found',
                                        }}
                                        style={{
                                            background: '#fff',
                                            borderRadius: 12,
                                            overflow: 'hidden',
                                            border: '1px solid #f0f0f8',
                                        }}
                                    />
                                </div>
                            ),
                        },
                    ]}
                />
            </div>

            {/* ── Footer (Conditionally rendered by tab) ── */}
            {activeTab === 'grant' ? (
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
            ) : (
                <div style={{
                    padding: '16px 28px 22px',
                    display: 'flex', justifyContent: 'flex-end',
                    borderTop: '1px solid #f1f5f9',
                }}>
                    <Button
                        onClick={onClose}
                        style={{ borderRadius: 10, height: 40, fontWeight: 600, color: '#64748b', borderColor: '#e2e8f0', width: 100 }}
                    >
                        Close
                    </Button>
                </div>
            )}
        </Modal>
    );
};

export default GrantCreditsModal;

