import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Checkbox, DatePicker, Input, InputNumber, Modal, Popconfirm, Segmented, Select, Skeleton, Tooltip, message } from 'antd';
import {
  AudioOutlined, BookOutlined, CalendarOutlined, ClockCircleOutlined, CloseOutlined, DeleteOutlined, FolderOutlined, FormOutlined,
  ReadOutlined, ReloadOutlined, RightOutlined, SearchOutlined, SendOutlined, SoundOutlined, TeamOutlined, ThunderboltOutlined,
  UserOutlined, WarningOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import {
  FAMILY_CODE, familyOfCategory, familyOfType, loadPeople, peekPeople, personName,
} from './examAdminData';
import type { ApiCall, BatchLite, ExamAssignmentGroup, Family, PersonLite } from './examAdminData';
import './ExamAdmin.css';

/* ══════════════════════════════════════════
   ASSIGN EXAM CONTENT
   1 · pick content from the TCF tree (whole skills, years, months or single series)
   2 · pick students / batches, optional name, access end date and AI credits.
   Picking a parent includes everything under it, so its children show as "Included".
══════════════════════════════════════════ */

interface ContentNode {
  id: number;
  name?: string;
  year?: number;
  month?: number;
  month_name?: string;
  type: string;
  content_id?: number;
  icon?: string;
  description?: string;
  total_questions?: number;
  total_points?: number;
  children?: ContentNode[];
}
interface Row {
  key: string;
  node: ContentNode;
  depth: number;
  parent: string | null;
  family: Family;
  label: string;
  path: string;
  childKeys: string[];
}

const TYPE_LABEL: Record<string, string> = {
  category: 'Skill', ce_series: 'Series', co_series: 'Series',
  ee_year: 'Year', ee_month: 'Month', ee_combinaison: 'Combinaison',
  eo_year: 'Year', eo_month: 'Month', eo_partie: 'Partie',
};
const CHILD_WORD: Record<string, [string, string]> = {
  ce_series: ['series', 'series'], co_series: ['series', 'series'],
  ee_year: ['year', 'years'], eo_year: ['year', 'years'],
  ee_month: ['month', 'months'], eo_month: ['month', 'months'],
  ee_combinaison: ['combinaison', 'combinaisons'], eo_partie: ['partie', 'parties'],
};
const CATEGORY_ICON: Record<string, React.ReactNode> = {
  ReadOutlined: <ReadOutlined />, FormOutlined: <FormOutlined />, SoundOutlined: <SoundOutlined />,
  AudioOutlined: <AudioOutlined />, BookOutlined: <BookOutlined />,
};

const keyOf = (n: ContentNode) => `${n.type}:${n.content_id ?? n.id}`;
const labelOf = (n: ContentNode) =>
  n.type.endsWith('_year') ? String(n.year ?? n.name ?? `#${n.id}`)
    : n.type.endsWith('_month') ? (n.month_name || n.name || `Month ${n.month ?? ''}`.trim())
      : n.name || `#${n.content_id ?? n.id}`;
const iconOf = (row: Row) => {
  const t = row.node.type;
  if (t === 'category') return CATEGORY_ICON[row.node.icon || ''] || <FolderOutlined />;
  if (t.endsWith('_year')) return <CalendarOutlined />;
  if (t.endsWith('_month')) return <ClockCircleOutlined />;
  return <BookOutlined />;
};
const metaOf = (row: Row) => {
  const n = row.node;
  if (n.total_questions) return `${n.total_questions} questions${n.total_points ? ` · ${n.total_points} pts` : ''}`;
  const c = row.childKeys.length;
  if (!c || !n.children?.length) return row.node.type === 'category' ? 'No content yet' : '';
  const w = CHILD_WORD[n.children[0].type] || ['item', 'items'];
  return `${c} ${c === 1 ? w[0] : w[1]}`;
};
const fmtDate = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

/* Content tree is cached briefly (it is the heaviest request); the reload button forces a refresh. */
const TREE_TTL = 60_000;
let treeCache: { at: number; tree: ContentNode[] } | null = null;

/* ── one tree row (memoised: only rows whose state changes re-render) ── */
const TreeRow = memo(function TreeRow({ row, checked, included, open, onToggle, onExpand }: {
  row: Row; checked: boolean; included: boolean; open: boolean;
  onToggle: (key: string, on: boolean) => void; onExpand: (key: string) => void;
}) {
  const has = row.childKeys.length > 0;
  const meta = metaOf(row);
  return (
    <div className={`ea-row fam-${row.family}${checked ? ' is-checked' : ''}${included ? ' is-included' : ''}${row.depth === 0 ? ' is-root' : ''}`}
      style={{ paddingLeft: 8 + row.depth * 22 }} role="treeitem" aria-selected={checked || included} aria-expanded={has ? open : undefined}>
      <button type="button" className={`ea-caret${open ? ' is-open' : ''}`} onClick={() => has && onExpand(row.key)}
        tabIndex={has ? 0 : -1} aria-hidden={!has} aria-label={open ? `Collapse ${row.label}` : `Expand ${row.label}`}>
        {has && <RightOutlined />}
      </button>
      <Checkbox checked={checked || included} disabled={included} onChange={e => onToggle(row.key, e.target.checked)} aria-label={`Select ${row.label}`} />
      <span className="ea-row-ic">{iconOf(row)}</span>
      <span className="ea-row-text" onClick={() => (has ? onExpand(row.key) : !included && onToggle(row.key, !checked))}>
        <strong>{row.label}</strong>
        {meta && <em>{meta}</em>}
      </span>
      <span className="ea-type">{included ? 'Included' : TYPE_LABEL[row.node.type] || row.node.type}</span>
    </div>
  );
});

const ExamAssignmentModal: React.FC<{
  open: boolean;
  onClose: () => void;
  apiCall: ApiCall;
  initialTab?: 'new' | 'list';
  onChanged?: () => void;
  /** Content ticked when the modal opens (e.g. "Assign" from a series). */
  preselect?: { content_type: string; content_id: number }[];
}> = ({ open, onClose, apiCall, initialTab = 'new', onChanged, preselect }) => {
  const [msg, msgHolder] = message.useMessage();
  const [tab, setTab] = useState<'new' | 'list'>(initialTab);

  const [tree, setTree] = useState<ContentNode[]>(() => treeCache?.tree || []);
  const [students, setStudents] = useState<PersonLite[]>(() => peekPeople()?.students || []);
  const [batches, setBatches] = useState<BatchLite[]>(() => peekPeople()?.batches || []);
  const [groups, setGroups] = useState<ExamAssignmentGroup[] | null>(null);
  const [treeLoading, setTreeLoading] = useState(!treeCache);
  const [treeError, setTreeError] = useState<string | null>(null);

  const [selected, setSelected] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');
  const [family, setFamily] = useState<Family | 'all'>('all');
  const [name, setName] = useState('');
  const [studentIds, setStudentIds] = useState<number[]>([]);
  const [batchIds, setBatchIds] = useState<number[]>([]);
  const [expiresAt, setExpiresAt] = useState<Dayjs | null>(null);
  const [eeCredits, setEeCredits] = useState<number | null>(null);
  const [eoCredits, setEoCredits] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [listQuery, setListQuery] = useState('');
  const [listStatus, setListStatus] = useState<'all' | 'active' | 'expired'>('active');
  const [removing, setRemoving] = useState<string | null>(null);

  /* ═══════════ DATA ═══════════ */
  const loadGroups = useCallback(async () => {
    try {
      const r = await apiCall('/tcf/exam-assignments');
      const d = r.ok ? await r.json() : [];
      setGroups(Array.isArray(d) ? d : []);
    } catch { setGroups(g => g ?? []); }
  }, [apiCall]);

  const loadTree = useCallback(async (force = false) => {
    if (!force && treeCache && Date.now() - treeCache.at < TREE_TTL) { setTree(treeCache.tree); setTreeLoading(false); return; }
    if (!treeCache || force) setTreeLoading(true);
    try {
      const r = await apiCall('/tcf/exam-assignments/content-tree');
      if (!r.ok) throw new Error(`The server answered ${r.status}.`);
      const d = await r.json();
      treeCache = { at: Date.now(), tree: Array.isArray(d) ? d : [] };
      setTree(treeCache.tree);
      setTreeError(null);
    } catch (e: any) {
      setTreeError(e?.message || 'Could not load the content.');
    } finally {
      setTreeLoading(false);
    }
  }, [apiCall]);

  const resetForm = () => {
    setSelected([]); setName(''); setStudentIds([]); setBatchIds([]);
    setExpiresAt(null); setEeCredits(null); setEoCredits(null);
  };

  useEffect(() => {
    if (!open) return;
    setTab(initialTab);
    resetForm();
    if (preselect?.length) setSelected(preselect.map(p => `${p.content_type}:${p.content_id}`));
    setQuery('');
    setListQuery('');
    loadTree();
    loadGroups();
    loadPeople(apiCall).then(p => { setStudents(p.students); setBatches(p.batches); }).catch(() => { /* selects stay empty */ });
  }, [open, initialTab, preselect, apiCall, loadTree, loadGroups]);

  /* ═══════════ TREE INDEX ═══════════ */
  const index = useMemo(() => {
    const map = new Map<string, Row>();
    const roots: string[] = [];
    const walk = (n: ContentNode, depth: number, parent: string | null, fam: Family, prefix: string): string => {
      const key = keyOf(n);
      const label = labelOf(n);
      const row: Row = { key, node: n, depth, parent, family: fam, label, path: prefix ? `${prefix} › ${label}` : label, childKeys: [] };
      map.set(key, row);
      (n.children || []).forEach(c => row.childKeys.push(walk(c, depth + 1, key, fam, row.path)));
      return key;
    };
    tree.forEach(n => roots.push(walk(n, 0, null, familyOfCategory(n.name), '')));
    return { map, roots };
  }, [tree]);

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const includedSet = useMemo(() => {
    const out = new Set<string>();
    const add = (k: string) => index.map.get(k)?.childKeys.forEach(c => { out.add(c); add(c); });
    selected.forEach(add);
    return out;
  }, [selected, index]);

  const onToggle = useCallback((key: string, on: boolean) => {
    setSelected(prev => {
      if (!on) return prev.filter(k => k !== key);
      // A parent covers its children: drop any selected descendant.
      const desc = new Set<string>();
      const add = (k: string) => index.map.get(k)?.childKeys.forEach(c => { desc.add(c); add(c); });
      add(key);
      return [...prev.filter(k => !desc.has(k) && k !== key), key];
    });
  }, [index]);

  const onExpand = useCallback((key: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }, []);

  const q = query.trim().toLowerCase();
  const rows = useMemo(() => {
    const out: Row[] = [];
    let allowed: Set<string> | null = null;
    if (q) {
      allowed = new Set();
      for (const r of index.map.values()) {
        if (!r.label.toLowerCase().includes(q)) continue;
        let k: string | null = r.key;
        while (k && !allowed.has(k)) { allowed.add(k); k = index.map.get(k)?.parent ?? null; }
      }
    }
    const visit = (k: string) => {
      if (allowed && !allowed.has(k)) return;
      const r = index.map.get(k)!;
      out.push(r);
      const isOpen = allowed ? r.childKeys.some(c => allowed!.has(c)) : expanded.has(k);
      if (isOpen) r.childKeys.forEach(visit);
    };
    index.roots.filter(k => family === 'all' || index.map.get(k)!.family === family).forEach(visit);
    return out;
  }, [index, expanded, q, family]);

  const expandAll = () => {
    const keys = new Set<string>();
    index.map.forEach((r, k) => { if (r.childKeys.length && r.node.type !== 'ee_month' && r.node.type !== 'eo_month') keys.add(k); });
    setExpanded(keys);
  };

  /* ═══════════ SELECTION SUMMARY ═══════════ */
  const selectedRows = selected.map(k => index.map.get(k)).filter((r): r is Row => !!r);
  const hasEe = selectedRows.some(r => r.family === 'ee');
  const hasEo = selectedRows.some(r => r.family === 'eo');
  const autoName = selectedRows.length
    ? `${selectedRows.slice(0, 2).map(r => (r.depth === 0 ? r.label : `${FAMILY_CODE[r.family]} ${r.label}`)).join(', ')}${selectedRows.length > 2 ? ` +${selectedRows.length - 2}` : ''}`
    : '';
  const recipients = studentIds.length + batchIds.length;
  const reach = useMemo(() => {
    const byId = new Map(batches.map(b => [b.id, Number(b.student_count) || 0]));
    return studentIds.length + batchIds.reduce((t, id) => t + (byId.get(id) || 0), 0);
  }, [studentIds, batchIds, batches]);
  const canSubmit = selected.length > 0 && recipients > 0 && !submitting;

  const studentOptions = useMemo(() => students.map(s => ({ value: s.id, label: personName(s), email: s.email, search: `${personName(s)} ${s.email}`.toLowerCase() })), [students]);
  const batchOptions = useMemo(() => batches.map(b => ({ value: b.id, label: b.name, count: Number(b.student_count) || 0, search: b.name.toLowerCase() })), [batches]);

  /* ═══════════ ACTIONS ═══════════ */
  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const r = await apiCall('/tcf/exam-assignments', {
        method: 'POST',
        body: JSON.stringify({
          items: selectedRows.map(row => ({ content_type: row.node.type, content_id: row.node.content_id ?? row.node.id })),
          student_ids: studentIds,
          batch_ids: batchIds,
          expires_at: expiresAt ? expiresAt.toISOString() : null,
          group_name: name.trim() || autoName,
          ee_credits: hasEe ? eeCredits || 0 : 0,
          eo_credits: hasEo ? eoCredits || 0 : 0,
        }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { msg.error(d?.error || 'The assignment could not be created.'); return; }
      msg.success(d.duplicates
        ? `${d.created} assigned · ${d.duplicates} already existed`
        : `${d.created} ${d.created === 1 ? 'assignment' : 'assignments'} created`);
      resetForm();
      setListStatus('active');
      setTab('list');
      loadGroups();
      onChanged?.();
    } catch {
      msg.error('The assignment could not be created. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const removeGroup = async (g: ExamAssignmentGroup) => {
    setRemoving(g.group_id);
    try {
      const r = await apiCall(`/tcf/exam-assignments/group/${encodeURIComponent(g.group_id)}`, { method: 'DELETE' });
      if (!r.ok) throw new Error();
      setGroups(list => (list || []).filter(x => x.group_id !== g.group_id));
      msg.success('Assignment removed');
      onChanged?.();
    } catch {
      msg.error('The assignment could not be removed.');
    } finally {
      setRemoving(null);
    }
  };

  const lq = listQuery.trim().toLowerCase();
  const visibleGroups = useMemo(() => (groups || []).filter(g =>
    (listStatus === 'all' || (listStatus === 'active' ? !g.is_expired : g.is_expired))
    && (!lq || `${g.group_name} ${g.items.map(i => i.content_name).join(' ')} ${g.recipients.map(x => x.name).join(' ')}`.toLowerCase().includes(lq))), [groups, listStatus, lq]);
  const activeCount = (groups || []).filter(g => !g.is_expired).length;
  const expiredCount = (groups || []).length - activeCount;

  const rootChips = index.roots.map(k => index.map.get(k)!);

  return (
    <Modal open={open} onCancel={onClose} footer={null} closable={false} centered width="min(1100px, calc(100vw - 24px))"
      wrapClassName="ea-modal" styles={{ content: { padding: 0 }, body: { padding: 0 } }} maskClosable={!submitting}>
      {msgHolder}
      <div className="ea">
        <header className="ea-head">
          <span className="ea-head-ic"><SendOutlined /></span>
          <div className="ea-head-text">
            <h2>Assign exam content</h2>
            <p>Give students or whole batches access to TCF practice content.</p>
          </div>
          <Segmented className="ea-tabs" value={tab} onChange={v => setTab(v as 'new' | 'list')} options={[
            { value: 'new', label: 'New assignment' },
            { value: 'list', label: <span className="ea-tab">Assignments <em>{groups ? activeCount : '…'}</em></span> },
          ]} />
          <button type="button" className="ea-close" onClick={onClose} aria-label="Close"><CloseOutlined /></button>
        </header>

        {tab === 'new' ? (
          <>
            <div className="ea-body">
              {/* ── 1 · Content ── */}
              <section className="ea-pane">
                <div className="ea-pane-head">
                  <span className="ea-step">1</span>
                  <strong>Choose content</strong>
                  <span className="ea-pane-note">{selected.length ? `${selected.length} selected` : 'Whole skills, years, months or single series'}</span>
                  <Tooltip title="Reload content"><Button type="text" size="small" icon={<ReloadOutlined spin={treeLoading && !!tree.length} />} onClick={() => loadTree(true)} aria-label="Reload content" /></Tooltip>
                </div>
                <div className="ea-tools">
                  <Input allowClear prefix={<SearchOutlined />} placeholder="Search series, years, months…" value={query} onChange={e => setQuery(e.target.value)} />
                  <div className="ea-fams" role="tablist" aria-label="Skill">
                    <button type="button" className={family === 'all' ? 'is-on' : ''} onClick={() => setFamily('all')}>All</button>
                    {rootChips.map(r => (
                      <Tooltip key={r.key} title={r.label}>
                        <button type="button" className={`fam-${r.family}${family === r.family ? ' is-on' : ''}`} onClick={() => setFamily(family === r.family ? 'all' : r.family)}>
                          {FAMILY_CODE[r.family]}
                        </button>
                      </Tooltip>
                    ))}
                  </div>
                </div>
                <div className="ea-tree" role="tree" aria-label="Exam content">
                  {treeLoading && !tree.length ? (
                    <div className="ea-pad"><Skeleton active title={false} paragraph={{ rows: 7 }} /></div>
                  ) : treeError && !tree.length ? (
                    <div className="ea-state"><WarningOutlined /><strong>Couldn't load the content</strong><span>{treeError}</span><Button size="small" onClick={() => loadTree(true)}>Retry</Button></div>
                  ) : rows.length === 0 ? (
                    <div className="ea-state"><SearchOutlined /><strong>{q ? 'Nothing matches your search' : 'No content yet'}</strong><span>{q ? 'Try another word.' : 'Create series or years first.'}</span></div>
                  ) : rows.map(row => (
                    <TreeRow key={row.key} row={row} checked={selectedSet.has(row.key)} included={includedSet.has(row.key)}
                      open={q ? true : expanded.has(row.key)} onToggle={onToggle} onExpand={onExpand} />
                  ))}
                </div>
                <div className="ea-tree-foot">
                  <button type="button" onClick={expandAll}>Expand all</button>
                  <button type="button" onClick={() => setExpanded(new Set())}>Collapse all</button>
                  {selected.length > 0 && <button type="button" className="is-danger" onClick={() => setSelected([])}>Clear selection</button>}
                </div>
              </section>

              {/* ── 2 · Recipients & options ── */}
              <section className="ea-pane ea-side">
                <div className="ea-pane-head">
                  <span className="ea-step">2</span>
                  <strong>Recipients & options</strong>
                </div>
                <div className="ea-side-body">
                  <div className="ea-field">
                    <label>Selected content</label>
                    {selectedRows.length === 0 ? (
                      <div className="ea-hint">Tick items on the left. Ticking a skill or a year includes everything inside it.</div>
                    ) : (
                      <div className="ea-chips">
                        {selectedRows.map(r => (
                          <span key={r.key} className={`ea-chip fam-${r.family}`} title={r.path}>
                            <b>{FAMILY_CODE[r.family]}</b>{r.depth === 0 ? 'Entire skill' : r.path.split(' › ').slice(1).join(' › ')}
                            <button type="button" onClick={() => onToggle(r.key, false)} aria-label={`Remove ${r.label}`}><CloseOutlined /></button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="ea-field">
                    <label><UserOutlined /> Students</label>
                    <Select mode="multiple" allowClear placeholder="Search by name or email" value={studentIds} onChange={setStudentIds}
                      options={studentOptions} optionFilterProp="search" maxTagCount="responsive" showSearch
                      optionRender={o => <span className="ea-opt"><strong>{o.data.label}</strong><em>{o.data.email}</em></span>}
                      notFoundContent={students.length ? 'No student matches' : 'Loading students…'} />
                  </div>
                  <div className="ea-field">
                    <label><TeamOutlined /> Batches</label>
                    <Select mode="multiple" allowClear placeholder="Every student of the batch gets access" value={batchIds} onChange={setBatchIds}
                      options={batchOptions} optionFilterProp="search" maxTagCount="responsive" showSearch
                      optionRender={o => <span className="ea-opt"><strong>{o.data.label}</strong><em>{o.data.count} {o.data.count === 1 ? 'student' : 'students'}</em></span>}
                      notFoundContent={batches.length ? 'No batch matches' : 'Loading batches…'} />
                  </div>

                  <div className="ea-grid2">
                    <div className="ea-field">
                      <label>Name <em>optional</em></label>
                      <Input value={name} onChange={e => setName(e.target.value)} maxLength={100} placeholder={autoName || 'e.g. CE practice — week 1'} />
                    </div>
                    <div className="ea-field">
                      <label>Access until <em>optional</em></label>
                      <DatePicker showTime={{ format: 'HH:mm' }} format="MMM D, YYYY HH:mm" value={expiresAt} onChange={setExpiresAt} placeholder="No end date"
                        disabledDate={d => d.isBefore(dayjs(), 'day')} style={{ width: '100%' }}
                        presets={[
                          { label: 'In 1 week', value: dayjs().add(7, 'day').endOf('day') },
                          { label: 'In 2 weeks', value: dayjs().add(14, 'day').endOf('day') },
                          { label: 'In 1 month', value: dayjs().add(1, 'month').endOf('day') },
                          { label: 'In 3 months', value: dayjs().add(3, 'month').endOf('day') },
                        ]} />
                    </div>
                  </div>

                  {(hasEe || hasEo) && (
                    <div className="ea-field ea-credits">
                      <label><ThunderboltOutlined /> AI credits per student <em>optional</em></label>
                      <div className="ea-grid2">
                        {hasEe && <div className="ea-credit"><span>Expression Écrite</span><InputNumber min={0} max={9999} value={eeCredits ?? undefined} onChange={v => setEeCredits(v ?? null)} placeholder="0" /></div>}
                        {hasEo && <div className="ea-credit"><span>Expression Orale</span><InputNumber min={0} max={9999} value={eoCredits ?? undefined} onChange={v => setEoCredits(v ?? null)} placeholder="0" /></div>}
                      </div>
                      <small>Each AI-graded attempt uses one credit. Credits never expire.</small>
                    </div>
                  )}
                </div>
              </section>
            </div>

            <footer className="ea-foot">
              <div className="ea-summary">
                {!selected.length ? 'Choose at least one content item.'
                  : !recipients ? 'Add students or batches.'
                    : <><strong>{selected.length}</strong> {selected.length === 1 ? 'item' : 'items'} for <strong>{recipients}</strong> {recipients === 1 ? 'recipient' : 'recipients'}{reach ? <> · reaches up to <strong>{reach}</strong> {reach === 1 ? 'student' : 'students'}</> : null}{expiresAt ? ` · until ${expiresAt.format('MMM D')}` : ''}</>}
              </div>
              <Button onClick={onClose} disabled={submitting}>Cancel</Button>
              <Button type="primary" icon={<SendOutlined />} onClick={submit} loading={submitting} disabled={!canSubmit}>Assign</Button>
            </footer>
          </>
        ) : (
          <>
            <div className="ea-list">
              <div className="ea-list-tools">
                <Input allowClear prefix={<SearchOutlined />} placeholder="Search assignments, content or recipients" value={listQuery} onChange={e => setListQuery(e.target.value)} />
                <Segmented value={listStatus} onChange={v => setListStatus(v as typeof listStatus)} options={[
                  { value: 'active', label: `Active ${activeCount}` },
                  { value: 'expired', label: `Expired ${expiredCount}` },
                  { value: 'all', label: 'All' },
                ]} />
              </div>
              <div className="ea-groups">
                {groups === null ? (
                  <div className="ea-pad"><Skeleton active paragraph={{ rows: 6 }} /></div>
                ) : visibleGroups.length === 0 ? (
                  <div className="ea-state"><SendOutlined /><strong>{groups.length ? 'No assignment matches' : 'No assignments yet'}</strong><span>{groups.length ? 'Try another search or status.' : 'Assigned content appears here.'}</span>
                    {!groups.length && <Button type="primary" size="small" onClick={() => setTab('new')}>New assignment</Button>}</div>
                ) : visibleGroups.map(g => (
                  <article key={g.group_id} className={`ea-group${g.is_expired ? ' is-expired' : ''}`}>
                    <div className="ea-group-main">
                      <strong title={g.group_name}>{g.group_name}</strong>
                      <em>{fmtDate(g.assigned_at)}{g.assigned_by ? ` · by ${g.assigned_by}` : ''}</em>
                    </div>
                    <div className="ea-group-chips">
                      {g.items.slice(0, 3).map(it => (
                        <span key={`${it.content_type}:${it.content_id}`} className={`ea-chip is-sm fam-${familyOfType(it.content_type)}`} title={it.content_name}>
                          <b>{FAMILY_CODE[familyOfType(it.content_type)]}</b>{it.content_name}
                        </span>
                      ))}
                      {g.items.length > 3 && <Tooltip title={g.items.slice(3).map(i => i.content_name).join(', ')}><span className="ea-chip is-sm">+{g.items.length - 3}</span></Tooltip>}
                    </div>
                    <div className="ea-group-chips">
                      {g.recipients.slice(0, 3).map(x => (
                        <span key={x.key} className="ea-who" title={x.name}>{x.type === 'student' ? <UserOutlined /> : <TeamOutlined />}{x.name}</span>
                      ))}
                      {g.recipients.length > 3 && <Tooltip title={g.recipients.slice(3).map(x => x.name).join(', ')}><span className="ea-who">+{g.recipients.length - 3}</span></Tooltip>}
                    </div>
                    <div className="ea-group-status">
                      <span className={`ea-pill ${g.is_expired ? 'is-expired' : 'is-active'}`}>{g.is_expired ? 'Expired' : 'Active'}</span>
                      <em>{g.expires_at ? `${g.is_expired ? 'Ended' : 'Until'} ${fmtDate(g.expires_at)}` : 'No end date'}</em>
                    </div>
                    <Popconfirm title="Remove this assignment?" description={`${g.recipients.length} ${g.recipients.length === 1 ? 'recipient loses' : 'recipients lose'} access to ${g.items.length} ${g.items.length === 1 ? 'item' : 'items'}.`}
                      okText="Remove" okButtonProps={{ danger: true }} onConfirm={() => removeGroup(g)} placement="left">
                      <Button type="text" danger size="small" icon={<DeleteOutlined />} loading={removing === g.group_id} aria-label={`Remove ${g.group_name}`} />
                    </Popconfirm>
                  </article>
                ))}
              </div>
            </div>
            <footer className="ea-foot">
              <div className="ea-summary">{groups ? <><strong>{activeCount}</strong> active · {expiredCount} expired</> : 'Loading…'}</div>
              <Button onClick={onClose}>Close</Button>
              <Button type="primary" icon={<SendOutlined />} onClick={() => setTab('new')}>New assignment</Button>
            </footer>
          </>
        )}
      </div>
    </Modal>
  );
};

export default ExamAssignmentModal;
