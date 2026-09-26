import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { App as AntApp, Button, DatePicker, Input, Modal, Popconfirm, Segmented, Select, Skeleton, Tooltip } from 'antd';
import {
  ApartmentOutlined, CalendarOutlined, CheckCircleOutlined, DeleteOutlined, SearchOutlined, SendOutlined, UserOutlined, WarningOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTr } from '../../utils/useTr';
import { FAMILY_CODE } from '../Admin/examAdminData';
import { call, errorText, familyOfRef, fmtDate, personName } from './orgModel';
import type { Group, Learner, OrgAssignment } from './orgModel';
import ContentTreePicker from './ContentTreePicker';
import { indexTree } from './contentTreeIndex';
import type { ContentNode } from './contentTreeIndex';
import { ChangeButton, Empty, PageHeader } from './OrgUi';
import { useCompanyOpen } from './useCompanyOpen';
import './Org.css';

/* Exams the company opened to its learners and groups, and new assignments. */
const OrgAssignments: React.FC = () => {
  const { apiCall } = useAuth();
  const { tr, locale } = useTr();
  const { message } = AntApp.useApp();
  const [params, setParams] = useSearchParams();
  const { open } = useCompanyOpen();
  const [list, setList] = useState<OrgAssignment[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'active' | 'expired' | 'all'>('active');
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState<{ learners: number[]; groups: number[] } | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try { setList(await call<OrgAssignment[]>(apiCall, '/org/assignments')); } catch (e) { setError(errorText(e, tr)); }
  }, [apiCall, tr]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (params.get('new') !== '1') return;
    const ids = (k: string) => (params.get(k) || '').split(',').map(Number).filter(n => Number.isInteger(n) && n > 0);
    if (open) setCreating({ learners: ids('learners'), groups: ids('groups') });
    setParams({}, { replace: true });
  }, [params, setParams, open]);

  const q = query.trim().toLowerCase();
  const visible = useMemo(() => (list || []).filter(a =>
    (status === 'all' || (status === 'active' ? !a.is_expired : a.is_expired))
    && (!q || `${a.name} ${a.items.map(i => i.name).join(' ')} ${a.recipients.map(r => r.name).join(' ')}`.toLowerCase().includes(q))), [list, status, q]);
  const activeCount = (list || []).filter(a => !a.is_expired).length;

  const remove = async (a: OrgAssignment) => {
    try {
      await call(apiCall, `/org/assignments/${encodeURIComponent(a.group_id)}`, 'DELETE');
      message.success(tr('Assignment removed', 'Attribution supprimée'));
      load();
    } catch (e) { message.error(errorText(e, tr)); }
  };

  return (
    <div className="og is-company">
      <PageHeader overline={tr('Company space', 'Espace entreprise')} title={tr('Assignments', 'Attributions')}
        subtitle={tr('Open practice exams to your learners or groups, until a date within your access.', 'Ouvrez des examens d’entraînement à vos apprenants ou groupes, jusqu’à une date comprise dans votre accès.')}
        actions={<ChangeButton type="primary" icon={<SendOutlined />} onClick={() => setCreating({ learners: [], groups: [] })}>{tr('New assignment', 'Nouvelle attribution')}</ChangeButton>} />

      <section className="og-card">
        <div className="og-toolbar">
          <Input allowClear prefix={<SearchOutlined />} placeholder={tr('Search exams or learners', 'Rechercher un examen ou un apprenant')} value={query} onChange={e => setQuery(e.target.value)} />
          <Segmented value={status} onChange={v => setStatus(v as typeof status)} options={[
            { value: 'active', label: `${tr('Open', 'Ouvertes')} ${activeCount}` },
            { value: 'expired', label: `${tr('Ended', 'Terminées')} ${(list || []).length - activeCount}` },
            { value: 'all', label: tr('All', 'Toutes') },
          ]} />
        </div>
        {error ? (
          <Empty icon={<WarningOutlined />} title={tr('Assignments could not be loaded', 'Les attributions n’ont pas pu être chargées')} text={error} action={<Button onClick={load}>{tr('Try again', 'Réessayer')}</Button>} />
        ) : list === null ? (
          <div style={{ padding: 18 }}><Skeleton active paragraph={{ rows: 5 }} /></div>
        ) : visible.length === 0 ? (
          <Empty icon={<SendOutlined />} title={list.length ? tr('No assignment matches', 'Aucune attribution ne correspond') : tr('No assignment yet', 'Aucune attribution pour l’instant')}
            text={list.length ? undefined : tr('Choose exams, then the learners or groups who may take them.', 'Choisissez des examens, puis les apprenants ou groupes qui peuvent les passer.')}
            action={!list.length ? <ChangeButton type="primary" icon={<SendOutlined />} onClick={() => setCreating({ learners: [], groups: [] })}>{tr('New assignment', 'Nouvelle attribution')}</ChangeButton> : undefined} />
        ) : (
          <div className="og-list">
            <div className="og-row is-assignment is-head"><span>{tr('Assignment', 'Attribution')}</span><span>{tr('Exams', 'Examens')}</span><span>{tr('For', 'Pour')}</span><span>{tr('Until', 'Jusqu’au')}</span><span /></div>
            {visible.map(a => (
              <div key={a.group_id} className={`og-row is-assignment${a.is_expired ? ' is-off' : ''}`}>
                <span className="og-cell-main"><strong title={a.name}>{a.name}</strong><em>{fmtDate(a.assigned_at, locale)}{a.assigned_by ? ` · ${a.assigned_by}` : ''}</em></span>
                <span className="og-cell-tags og-hide-sm">
                  {a.items.slice(0, 3).map(i => <span key={`${i.content_type}:${i.content_id}`} className={`ea-chip is-sm fam-${familyOfRef(i)}`}><b>{FAMILY_CODE[familyOfRef(i)]}</b>{i.name}</span>)}
                  {a.items.length > 3 && <Tooltip title={a.items.slice(3).map(i => i.name).join(', ')}><span className="og-tag">+{a.items.length - 3}</span></Tooltip>}
                </span>
                <span className="og-cell-tags og-hide-sm">
                  {a.recipients.slice(0, 3).map(r => <span key={`${r.type}:${r.id}`} className="og-tag">{r.type === 'group' ? <ApartmentOutlined /> : <UserOutlined />}{r.name}</span>)}
                  {a.recipients.length > 3 && <Tooltip title={a.recipients.slice(3).map(r => r.name).join(', ')}><span className="og-tag">+{a.recipients.length - 3}</span></Tooltip>}
                </span>
                <span><span className={`og-pill ${a.is_expired ? 'tone-off' : 'tone-ok'}`}>{a.is_expired ? tr('Ended', 'Terminée') : fmtDate(a.expires_at, locale)}</span></span>
                <span className="og-row-actions">
                  {open ? (
                    <Popconfirm title={tr('Remove this assignment?', 'Supprimer cette attribution ?')} description={tr('These learners lose access to these exams (their results are kept).', 'Ces apprenants perdent l’accès à ces examens (leurs résultats sont conservés).')}
                      okText={tr('Remove', 'Supprimer')} okButtonProps={{ danger: true }} cancelText={tr('Cancel', 'Annuler')} onConfirm={() => remove(a)}>
                      <Button type="text" size="small" danger icon={<DeleteOutlined />} aria-label={tr('Remove', 'Supprimer')} />
                    </Popconfirm>
                  ) : <ChangeButton type="text" size="small" danger icon={<DeleteOutlined />} />}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <NewAssignmentModal preset={creating} onClose={() => setCreating(null)} onDone={() => { setCreating(null); setStatus('active'); load(); }} />
    </div>
  );
};

const NewAssignmentModal: React.FC<{ preset: { learners: number[]; groups: number[] } | null; onClose: () => void; onDone: () => void }> = ({ preset, onClose, onDone }) => {
  const { apiCall, user } = useAuth();
  const { tr, locale } = useTr();
  const { message } = AntApp.useApp();
  const open = !!preset;
  const [tree, setTree] = useState<ContentNode[] | null>(null);
  const [learners, setLearners] = useState<Learner[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [learnerIds, setLearnerIds] = useState<number[]>([]);
  const [groupIds, setGroupIds] = useState<number[]>([]);
  const [name, setName] = useState('');
  const [until, setUntil] = useState<Dayjs | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const companyEnd = user?.organization?.access_ends_at ? dayjs(user.organization.access_ends_at) : null;

  useEffect(() => {
    if (!preset) return;
    setSelected([]); setName(''); setErr(null);
    setLearnerIds(preset.learners); setGroupIds(preset.groups);
    const inAMonth = dayjs().add(1, 'month').endOf('day');
    setUntil(companyEnd && companyEnd.isBefore(inAMonth) ? companyEnd : inAMonth);
    Promise.all([call<ContentNode[]>(apiCall, '/org/content-tree'), call<Learner[]>(apiCall, '/org/learners'), call<Group[]>(apiCall, '/org/groups')])
      .then(([t, l, g]) => { setTree(t); setLearners(l); setGroups(g); })
      .catch(e => setErr(errorText(e, tr)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset, apiCall]);

  const index = useMemo(() => indexTree(tree || []), [tree]);
  const picked = selected.map(k => index.map.get(k)).filter(Boolean);
  const autoName = picked.slice(0, 2).map(r => r!.label).join(', ') + (picked.length > 2 ? ` +${picked.length - 2}` : '');
  const reach = useMemo(() => {
    const set = new Set(learnerIds);
    groups.filter(g => groupIds.includes(g.id)).forEach(g => g.member_ids.forEach(id => set.add(id)));
    return set.size;
  }, [learnerIds, groupIds, groups]);
  const dateOk = !!until && until.isAfter(dayjs()) && (!companyEnd || !until.isAfter(companyEnd));
  const canSubmit = selected.length > 0 && (learnerIds.length + groupIds.length) > 0 && dateOk && !busy;

  const submit = async () => {
    setBusy(true); setErr(null);
    try {
      const r = await call<{ created: number; skipped: number }>(apiCall, '/org/assignments', 'POST', {
        items: picked.map(p => ({ content_type: p!.node.type, content_id: p!.node.content_id ?? p!.node.id })),
        learner_ids: learnerIds, group_ids: groupIds, expires_at: until!.toISOString(), name: name.trim() || autoName,
      });
      message.success(r.skipped
        ? tr(`Assigned · ${r.skipped} already opened by the administrator`, `Attribué · ${r.skipped} déjà ouvert(s) par l’administrateur`)
        : tr('Assigned: the learners are notified', 'Attribué : les apprenants sont prévenus'));
      onDone();
    } catch (e) { setErr(errorText(e, tr)); } finally { setBusy(false); }
  };

  const presets = [
    { label: tr('In 2 weeks', 'Dans 2 semaines'), value: dayjs().add(14, 'day').endOf('day') },
    { label: tr('In 1 month', 'Dans 1 mois'), value: dayjs().add(1, 'month').endOf('day') },
    { label: tr('In 3 months', 'Dans 3 mois'), value: dayjs().add(3, 'month').endOf('day') },
  ].filter(p => !companyEnd || !p.value.isAfter(companyEnd));
  if (companyEnd) presets.push({ label: tr('Until the end of access', 'Jusqu’à la fin de l’accès'), value: companyEnd });

  return (
    <Modal open={open} onCancel={onClose} footer={null} width="min(1040px, calc(100vw - 24px))" wrapClassName="og-modal is-company" destroyOnHidden>
      <div className="og-modal-head"><span className="og-logo"><SendOutlined /></span><div>
        <h3>{tr('New assignment', 'Nouvelle attribution')}</h3>
        <p>{tr('Choose the exams, who may take them, and until when.', 'Choisissez les examens, qui peut les passer, et jusqu’à quand.')}</p></div></div>
      <div className="og-grid" style={{ gap: 14 }}>
        <div className="og-section og-span-7">
          <div className="og-section-title"><span className="og-step">1</span>{tr('Exams', 'Examens')} <span className="og-muted" style={{ fontWeight: 400 }}>{selected.length ? `· ${selected.length}` : ''}</span></div>
          <ContentTreePicker tree={tree} value={selected} onChange={setSelected} loading={!tree} height={380} />
        </div>
        <div className="og-section og-span-5">
          <div className="og-section-title"><span className="og-step">2</span>{tr('Learners and date', 'Apprenants et date')}</div>
          <div className="og-field"><label><UserOutlined />{tr('Learners', 'Apprenants')}</label>
            <Select mode="multiple" value={learnerIds} onChange={setLearnerIds} showSearch optionFilterProp="search" allowClear maxTagCount="responsive"
              placeholder={tr('Search by name or email', 'Rechercher par nom ou email')}
              options={learners.filter(l => l.is_active).map(l => ({ value: l.id, label: personName(l), search: `${personName(l)} ${l.email}`.toLowerCase() }))} /></div>
          <div className="og-field"><label><ApartmentOutlined />{tr('Groups', 'Groupes')}</label>
            <Select mode="multiple" value={groupIds} onChange={setGroupIds} allowClear maxTagCount="responsive" placeholder={tr('Every member of the group', 'Tous les membres du groupe')}
              options={groups.map(g => ({ value: g.id, label: `${g.name} (${g.member_count})` }))} />
            <small>{tr('Learners who join the group later get these exams too.', 'Les apprenants ajoutés plus tard au groupe reçoivent aussi ces examens.')}</small></div>
          <div className="og-field"><label><CalendarOutlined />{tr('Open until', 'Ouvert jusqu’au')}</label>
            <DatePicker value={until} onChange={setUntil} format="DD/MM/YYYY" style={{ width: '100%' }} presets={presets}
              disabledDate={d => d.isBefore(dayjs(), 'day') || (!!companyEnd && d.isAfter(companyEnd, 'day'))}
              status={until && !dateOk ? 'error' : undefined} />
            {companyEnd && <small>{tr(`At the latest ${fmtDate(companyEnd.toISOString(), locale)}, the end of your company’s access.`, `Au plus tard le ${fmtDate(companyEnd.toISOString(), locale)}, fin de l’accès de votre entreprise.`)}</small>}</div>
          <div className="og-field"><label>{tr('Name', 'Nom')} <em>{tr('optional', 'facultatif')}</em></label>
            <Input value={name} onChange={e => setName(e.target.value)} maxLength={200} placeholder={autoName || tr('e.g. Week 1 practice', 'ex. Entraînement semaine 1')} /></div>
          {canSubmit && <div className="og-check tone-ok"><CheckCircleOutlined /><span>{tr(`${selected.length} exam item(s) for ${reach} learner(s), until ${until!.format('DD/MM/YYYY')}.`, `${selected.length} élément(s) pour ${reach} apprenant(s), jusqu’au ${until!.format('DD/MM/YYYY')}.`)}</span></div>}
          {err && <div className="og-check tone-bad"><WarningOutlined /><span>{err}</span></div>}
        </div>
      </div>
      <div className="og-foot" style={{ marginTop: 14 }}>
        <span className="og-foot-note">{!selected.length ? tr('Choose at least one exam.', 'Choisissez au moins un examen.')
          : !(learnerIds.length + groupIds.length) ? tr('Choose learners or groups.', 'Choisissez des apprenants ou des groupes.')
            : !dateOk ? tr('Choose a date within your access.', 'Choisissez une date comprise dans votre accès.') : ''}</span>
        <Button onClick={onClose}>{tr('Cancel', 'Annuler')}</Button>
        <Button type="primary" icon={<SendOutlined />} onClick={submit} loading={busy} disabled={!canSubmit}>{tr('Assign', 'Attribuer')}</Button>
      </div>
    </Modal>
  );
};

export default OrgAssignments;
