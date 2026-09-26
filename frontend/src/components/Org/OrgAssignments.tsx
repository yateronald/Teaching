import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { App as AntApp, Button, DatePicker, Input, Modal, Popconfirm, Segmented, Select, Skeleton, Switch, Tooltip } from 'antd';
import {
  ApartmentOutlined, CalendarOutlined, CheckCircleOutlined, DeleteOutlined, SearchOutlined, SendOutlined, ThunderboltOutlined, UserOutlined, WarningOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTr } from '../../utils/useTr';
import { FAMILY_CODE } from '../Admin/examAdminData';
import { CREDIT_KINDS, call, chosenAmounts, creditName, errorText, familyOfRef, fmtDate, kindsText, personName } from './orgModel';
import type { CreditType, Group, Learner, OrgAssignment } from './orgModel';
import { AmountBoxes, CreditReceipt, KindPicker } from './CreditControls';
import type { Amounts, ReceiptLine } from './CreditControls';
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

/* ── New assignment: exams, who, until when — and, if wanted, AI credits in the same step ── */
const NewAssignmentModal: React.FC<{ preset: { learners: number[]; groups: number[] } | null; onClose: () => void; onDone: () => void }> = ({ preset, onClose, onDone }) => {
  const { apiCall, user } = useAuth();
  const { tr, lang, locale } = useTr();
  const { message } = AntApp.useApp();
  const open = !!preset;
  const [tree, setTree] = useState<ContentNode[] | null>(null);
  const [learners, setLearners] = useState<Learner[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [reserve, setReserve] = useState<Record<CreditType, number> | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [target, setTarget] = useState<'learners' | 'groups'>('learners');
  const [learnerIds, setLearnerIds] = useState<number[]>([]);
  const [groupIds, setGroupIds] = useState<number[]>([]);
  const [name, setName] = useState('');
  const [until, setUntil] = useState<Dayjs | null>(null);
  // Optional credits, same rules as the Credits page.
  const [withCredits, setWithCredits] = useState(false);
  const [kinds, setKinds] = useState<CreditType[]>(['ee', 'eo']);
  const [kindsTouched, setKindsTouched] = useState(false);
  const [share, setShare] = useState<'each' | 'split'>('each');
  const [amounts, setAmounts] = useState<Amounts>({ ee: 1, eo: 1 });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const companyEnd = user?.organization?.access_ends_at ? dayjs(user.organization.access_ends_at) : null;

  useEffect(() => {
    if (!preset) return;
    setSelected([]); setName(''); setErr(null);
    setLearnerIds(preset.learners); setGroupIds(preset.groups);
    setTarget(preset.groups.length && !preset.learners.length ? 'groups' : 'learners');
    setWithCredits(false); setKinds(['ee', 'eo']); setKindsTouched(false); setShare('each'); setAmounts({ ee: 1, eo: 1 });
    const inAMonth = dayjs().add(1, 'month').endOf('day');
    setUntil(companyEnd && companyEnd.isBefore(inAMonth) ? companyEnd : inAMonth);
    Promise.all([
      call<ContentNode[]>(apiCall, '/org/content-tree'), call<Learner[]>(apiCall, '/org/learners'), call<Group[]>(apiCall, '/org/groups'),
      call<{ credits: Record<CreditType, { reserve: number }> }>(apiCall, '/org/credits?limit=1').catch(() => null),
    ])
      .then(([t, l, g, c]) => { setTree(t); setLearners(l); setGroups(g); setReserve(c ? { ee: c.credits.ee.reserve, eo: c.credits.eo.reserve } : null); })
      .catch(e => setErr(errorText(e, tr)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset, apiCall]);

  const index = useMemo(() => indexTree(tree || []), [tree]);
  const picked = useMemo(() => selected.map(k => index.map.get(k)).filter(Boolean), [selected, index]);
  const autoName = picked.slice(0, 2).map(r => r!.label).join(', ') + (picked.length > 2 ? ` +${picked.length - 2}` : '');
  // Writing and speaking exams are the ones corrected by AI (they use credits).
  const aiKinds = useMemo(() => CREDIT_KINDS.filter(t => picked.some(p => p!.family === t)), [picked]);
  const aiKey = aiKinds.join(',');
  useEffect(() => { if (!kindsTouched && aiKinds.length) setKinds(aiKinds); }, [aiKey, kindsTouched]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeIds = useMemo(() => new Set(learners.filter(l => l.is_active).map(l => l.id)), [learners]);
  const recipients = target === 'learners' ? learnerIds : groupIds;
  // Everyone reached today (credits go to active learners only).
  const reached = useMemo(() => {
    if (target === 'learners') return learnerIds.length;
    const set = new Set<number>();
    groups.filter(g => groupIds.includes(g.id)).forEach(g => g.member_ids.forEach(id => { if (activeIds.has(id)) set.add(id); }));
    return set.size;
  }, [target, learnerIds, groupIds, groups, activeIds]);
  const split = withCredits && target === 'groups' && share === 'split';
  const lines = kinds.map(t => {
    const amount = amounts[t] || 0;
    const each = split ? (reached ? Math.floor(amount / reached) : 0) : amount;
    const total = each * reached;
    const available = reserve ? reserve[t] : null;
    return { t, amount, each, total, available, kept: split ? amount - total : 0, splittable: !split || each >= 1, enough: available == null || total <= available };
  });
  const creditsOk = !withCredits || (reached > 0 && lines.every(l => l.amount > 0 && l.splittable && l.enough));

  const dateOk = !!until && until.isAfter(dayjs()) && (!companyEnd || !until.isAfter(companyEnd));
  const canSubmit = selected.length > 0 && recipients.length > 0 && dateOk && creditsOk && !busy;

  const submit = async () => {
    setBusy(true); setErr(null);
    try {
      const r = await call<{ created: number; skipped: number; credits: null | { given: number; each: Partial<Record<CreditType, number>> } }>(apiCall, '/org/assignments', 'POST', {
        items: picked.map(p => ({ content_type: p!.node.type, content_id: p!.node.content_id ?? p!.node.id })),
        learner_ids: target === 'learners' ? learnerIds : [], group_ids: target === 'groups' ? groupIds : [],
        expires_at: until!.toISOString(), name: name.trim() || autoName,
        credits: withCredits ? { amounts: chosenAmounts(kinds, amounts), mode: split ? 'split' : 'each' } : undefined,
      });
      const given = r.credits ? tr(` · ${kindsText(r.credits.each)} credit(s) each to ${r.credits.given} learner(s)`, ` · ${kindsText(r.credits.each)} crédit(s) chacun à ${r.credits.given} apprenant(s)`) : '';
      message.success(r.skipped
        ? tr(`Assigned · ${r.skipped} already opened by the administrator${given}`, `Attribué · ${r.skipped} déjà ouvert(s) par l’administrateur${given}`)
        : tr(`Assigned: the learners are notified${given}`, `Attribué : les apprenants sont prévenus${given}`));
      onDone();
    } catch (e) { setErr(errorText(e, tr)); } finally { setBusy(false); }
  };

  const presets = [
    { label: tr('In 2 weeks', 'Dans 2 semaines'), value: dayjs().add(14, 'day').endOf('day') },
    { label: tr('In 1 month', 'Dans 1 mois'), value: dayjs().add(1, 'month').endOf('day') },
    { label: tr('In 3 months', 'Dans 3 mois'), value: dayjs().add(3, 'month').endOf('day') },
  ].filter(p => !companyEnd || !p.value.isAfter(companyEnd));
  if (companyEnd) presets.push({ label: tr('Until the end of access', 'Jusqu’à la fin de l’accès'), value: companyEnd });

  const receipt: ReceiptLine[] = lines.map(l => ({
    kind: l.t,
    ok: l.amount > 0 && l.splittable && l.enough,
    what: split
      ? tr(`${l.amount} shared between ${reached} → ${l.each} each`, `${l.amount} répartis entre ${reached} → ${l.each} chacun`)
      : tr(`${reached} learner(s) × ${l.each}`, `${reached} apprenant(s) × ${l.each}`),
    detail: !l.splittable
      ? tr(`Give at least ${reached} to share between ${reached} learners`, `Donnez-en au moins ${reached} pour ${reached} apprenants`)
      : l.available == null ? undefined
        : !l.enough
          ? tr(`Reserve ${l.available} · ${l.total - l.available} missing`, `Réserve ${l.available} · il en manque ${l.total - l.available}`)
          : tr(`Reserve ${l.available} → ${l.available - l.total}${l.kept ? ` · ${l.kept} kept (not divisible)` : ''}`, `Réserve ${l.available} → ${l.available - l.total}${l.kept ? ` · ${l.kept} gardé(s) (non divisible)` : ''}`),
    total: `−${l.total}`,
  }));

  const eachText = kindsText(Object.fromEntries(lines.map(l => [l.t, l.each])));
  const hint = !selected.length ? tr('Choose at least one exam.', 'Choisissez au moins un examen.')
    : !recipients.length ? (target === 'learners' ? tr('Choose learners.', 'Choisissez des apprenants.') : tr('Choose groups.', 'Choisissez des groupes.'))
      : !dateOk ? tr('Choose a date within your access.', 'Choisissez une date comprise dans votre accès.')
        : !creditsOk ? tr('Check the credits.', 'Vérifiez les crédits.')
          : tr(`${selected.length} exam item(s) · ${reached} learner(s) · until ${until!.format('DD/MM/YYYY')}${withCredits ? ` · ${eachText} credit(s) each` : ''}`,
            `${selected.length} élément(s) · ${reached} apprenant(s) · jusqu’au ${until!.format('DD/MM/YYYY')}${withCredits ? ` · ${eachText} crédit(s) chacun` : ''}`);

  return (
    <Modal open={open} onCancel={onClose} footer={null} width="min(1120px, calc(100vw - 24px))" wrapClassName="og-modal is-company" destroyOnHidden>
      <div className="og-modal-head"><span className="og-logo"><SendOutlined /></span><div>
        <h3>{tr('New assignment', 'Nouvelle attribution')}</h3>
        <p>{tr('Choose the exams, who may take them and until when — and give AI credits in the same step if you wish.', 'Choisissez les examens, qui peut les passer et jusqu’à quand — et donnez des crédits IA dans la même étape si vous le souhaitez.')}</p></div></div>
      <div className="og-grid" style={{ gap: 14 }}>
        <div className="og-section og-span-6">
          <div className="og-section-title"><span className="og-step">1</span>{tr('Exams', 'Examens')} <span className="og-muted" style={{ fontWeight: 400 }}>{selected.length ? `· ${selected.length}` : ''}</span></div>
          <ContentTreePicker tree={tree} value={selected} onChange={setSelected} loading={!tree} height={460} />
        </div>

        <div className="og-span-6 og-assign-side">
          <div className="og-section">
            <div className="og-section-title"><span className="og-step">2</span>{tr('Who and until when', 'Qui et jusqu’à quand')}</div>
            {groups.length > 0 && (
              <Segmented block value={target} onChange={v => { setTarget(v as 'learners' | 'groups'); setShare('each'); }} options={[
                { value: 'learners', label: <><UserOutlined /> {tr('Learners', 'Apprenants')}</> },
                { value: 'groups', label: <><ApartmentOutlined /> {tr('Groups', 'Groupes')}</> },
              ]} />
            )}
            {target === 'learners' ? (
              <Select mode="multiple" value={learnerIds} onChange={setLearnerIds} showSearch optionFilterProp="search" allowClear maxTagCount="responsive"
                placeholder={tr('Search by name or email', 'Rechercher par nom ou email')}
                options={learners.filter(l => l.is_active).map(l => ({ value: l.id, label: personName(l), search: `${personName(l)} ${l.email}`.toLowerCase() }))} />
            ) : (
              <div className="og-field">
                <Select mode="multiple" value={groupIds} onChange={setGroupIds} allowClear maxTagCount="responsive" placeholder={tr('Choose groups', 'Choisissez des groupes')}
                  options={groups.map(g => ({ value: g.id, label: `${g.name} (${g.member_count})` }))} />
                <small>{groupIds.length
                  ? tr(`${reached} active learner(s) today. Those who join later get these exams too.`, `${reached} apprenant(s) actif(s) aujourd’hui. Ceux qui rejoignent le groupe plus tard reçoivent aussi ces examens.`)
                  : tr('Learners who join the group later get these exams too.', 'Les apprenants ajoutés plus tard au groupe reçoivent aussi ces examens.')}</small>
              </div>
            )}
            <div className="og-two">
              <div className="og-field"><label><CalendarOutlined />{tr('Open until', 'Ouvert jusqu’au')}</label>
                <DatePicker value={until} onChange={setUntil} format="DD/MM/YYYY" style={{ width: '100%' }} presets={presets}
                  disabledDate={d => d.isBefore(dayjs(), 'day') || (!!companyEnd && d.isAfter(companyEnd, 'day'))}
                  status={until && !dateOk ? 'error' : undefined} /></div>
              <div className="og-field"><label>{tr('Name', 'Nom')} <em>{tr('optional', 'facultatif')}</em></label>
                <Input value={name} onChange={e => setName(e.target.value)} maxLength={200} placeholder={autoName || tr('e.g. Week 1 practice', 'ex. Entraînement semaine 1')} /></div>
            </div>
            {companyEnd && <small className="og-muted">{tr(`At the latest ${fmtDate(companyEnd.toISOString(), locale)}, the end of your company’s access.`, `Au plus tard le ${fmtDate(companyEnd.toISOString(), locale)}, fin de l’accès de votre entreprise.`)}</small>}
          </div>

          <div className={`og-section og-credits-step${withCredits ? ' is-on' : ''}`}>
            <div className="og-section-title">
              <span className="og-step">3</span>{tr('AI credits', 'Crédits IA')} <em className="og-muted" style={{ fontWeight: 400, fontStyle: 'normal' }}>{tr('optional', 'facultatif')}</em>
              <Switch size="small" checked={withCredits} onChange={setWithCredits} style={{ marginLeft: 'auto' }} aria-label={tr('Also give AI credits', 'Donner aussi des crédits IA')} />
            </div>
            {!withCredits ? (
              <p className="og-credits-off">
                <ThunderboltOutlined />
                <span>{aiKinds.length
                  ? tr(`These exams include ${aiKinds.map(t => t.toUpperCase()).join(' and ')}: each attempt uses an AI credit. Give them now so your learners can start right away.`,
                    `Ces examens comprennent ${aiKinds.map(t => t.toUpperCase()).join(' et ')} : chaque passage utilise un crédit IA. Donnez-les maintenant pour que vos apprenants puissent commencer tout de suite.`)
                  : tr('Writing (EE) and speaking (EO) exams use one AI credit per attempt. Turn this on to hand them out with the assignment.',
                    'Les examens d’expression écrite (EE) et orale (EO) utilisent un crédit IA par passage. Activez pour les distribuer avec l’attribution.')}</span>
              </p>
            ) : (
              <>
                <KindPicker value={kinds} onChange={v => { setKinds(v); setKindsTouched(true); }} lang={lang}
                  note={t => (reserve ? tr(`${reserve[t]} in reserve`, `${reserve[t]} en réserve`) : '')} />
                {target === 'groups' && (
                  <Segmented block value={share} onChange={v => setShare(v as 'each' | 'split')} options={[
                    { value: 'each', label: tr('Per learner', 'Par apprenant') }, { value: 'split', label: tr('Total to share', 'Total à répartir') },
                  ]} />
                )}
                <AmountBoxes kinds={kinds} values={amounts} onChange={setAmounts}
                  label={t => (split ? tr(`${creditName(t, lang)}, total`, `${creditName(t, lang)}, total`) : tr(`${creditName(t, lang)} per learner`, `${creditName(t, lang)} par apprenant`))} />
                {reached > 0
                  ? <CreditReceipt lines={receipt} />
                  : <div className="og-check tone-soon"><WarningOutlined /><span>{recipients.length
                    ? tr('No active learner to receive credits yet.', 'Aucun apprenant actif pour recevoir des crédits pour l’instant.')
                    : tr('Choose who receives the exams first.', 'Choisissez d’abord qui reçoit les examens.')}</span></div>}
              </>
            )}
          </div>
          {err && <div className="og-check tone-bad"><WarningOutlined /><span>{err}</span></div>}
        </div>
      </div>
      <div className="og-foot og-assign-foot">
        <span className={`og-foot-note${canSubmit ? ' is-ready' : ''}`}>{canSubmit && <CheckCircleOutlined />} {hint}</span>
        <Button onClick={onClose}>{tr('Cancel', 'Annuler')}</Button>
        <Button type="primary" icon={<SendOutlined />} onClick={submit} loading={busy} disabled={!canSubmit}>
          {withCredits ? tr('Assign and give credits', 'Attribuer et donner les crédits') : tr('Assign', 'Attribuer')}
        </Button>
      </div>
    </Modal>
  );
};

export default OrgAssignments;
