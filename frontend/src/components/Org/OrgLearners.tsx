import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { App as AntApp, Button, Checkbox, Dropdown, Input, Modal, Segmented, Select, Skeleton, Tooltip, Upload } from 'antd';
import {
  ApartmentOutlined, CheckCircleOutlined, DeleteOutlined, DownloadOutlined, MailOutlined, MoreOutlined, ReloadOutlined, SearchOutlined, SendOutlined,
  StopOutlined, TeamOutlined, ThunderboltOutlined, UploadOutlined, UserAddOutlined, WarningOutlined,
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTr } from '../../utils/useTr';
import { ago, call, chosenAmounts, creditName, errorText, kindsText, parseLearnersCsv, personName } from './orgModel';
import type { CreditType, Group, Learner } from './orgModel';
import { ChangeButton, Credits, Empty, Level, PageHeader } from './OrgUi';
import { useCompanyOpen } from './useCompanyOpen';
import { AmountBoxes, CreditReceipt, KindPicker } from './CreditControls';
import type { Amounts, ReceiptLine } from './CreditControls';
import './Org.css';

/* ══════════════════════════════════════════
   The company's learners: add (one or a CSV file), find, act on one or many.
══════════════════════════════════════════ */

type Status = 'active' | 'pending' | 'off' | 'all';

const OrgLearners: React.FC = () => {
  const { apiCall } = useAuth();
  const { tr } = useTr();
  const { message } = AntApp.useApp();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { open } = useCompanyOpen();

  const [learners, setLearners] = useState<Learner[] | null>(null);
  const [pkg, setPkg] = useState<{ limit: number; used: number } | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<Status>('active');
  const [groupId, setGroupId] = useState<number | 'all'>('all');
  const [picked, setPicked] = useState<number[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [giveFor, setGiveFor] = useState<number[] | null>(null);
  const [groupFor, setGroupFor] = useState<number[] | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [l, g, me] = await Promise.all([call<Learner[]>(apiCall, '/org/learners'), call<Group[]>(apiCall, '/org/groups'),
        call<{ company: { seat_limit: number; seats_used: number } }>(apiCall, '/org/me')]);
      setLearners(l); setGroups(g); setPkg({ limit: me.company.seat_limit, used: me.company.seats_used });
    } catch (e) { setError(errorText(e, tr)); }
  }, [apiCall, tr]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (params.get('add') === '1' && open) { setAddOpen(true); params.delete('add'); setParams(params, { replace: true }); }
  }, [params, setParams, open]);

  const q = query.trim().toLowerCase();
  const visible = useMemo(() => (learners || []).filter(l =>
    (status === 'all' || (status === 'active' ? l.is_active : status === 'off' ? !l.is_active : l.is_active && l.invitation_pending))
    && (groupId === 'all' || l.groups.some(g => g.id === groupId))
    && (!q || `${personName(l)} ${l.email}`.toLowerCase().includes(q))), [learners, status, groupId, q]);
  const counts = useMemo(() => ({
    active: (learners || []).filter(l => l.is_active).length,
    pending: (learners || []).filter(l => l.is_active && l.invitation_pending).length,
    off: (learners || []).filter(l => !l.is_active).length,
  }), [learners]);
  const activeVisible = visible.filter(l => l.is_active);
  const full = !!pkg && pkg.used >= pkg.limit;
  const fullText = tr('Your package is full: contact the administrator to add accounts. An account never used can be deleted to free its place.', 'Votre forfait est complet : contactez l’administrateur pour ajouter des comptes. Un compte jamais utilisé peut être supprimé pour libérer sa place.');
  const allPicked = activeVisible.length > 0 && activeVisible.every(l => picked.includes(l.id));

  const setActive = async (l: Learner, active: boolean) => {
    try {
      const r = await call<{ credits_returned?: { ee: number; eo: number } }>(apiCall, `/org/learners/${l.id}/active`, 'PUT', { active });
      const back = r.credits_returned ? r.credits_returned.ee + r.credits_returned.eo : 0;
      message.success(active
        ? tr(`${personName(l)} is active again`, `${personName(l)} est de nouveau actif`)
        : back ? tr(`${personName(l)} deactivated · ${back} credit(s) back in the reserve`, `${personName(l)} désactivé · ${back} crédit(s) rendu(s) à la réserve`)
          : tr(`${personName(l)} deactivated`, `${personName(l)} désactivé`));
      load();
    } catch (e) { message.error(errorText(e, tr)); }
  };
  // An account created by mistake and never used can be deleted: its place in the package is freed.
  const remove = async (l: Learner) => {
    try {
      await call(apiCall, `/org/learners/${l.id}`, 'DELETE');
      message.success(tr(`${personName(l)} deleted · one place freed in your package`, `${personName(l)} supprimé · une place libérée dans votre forfait`));
      load();
    } catch (e) { message.error(errorText(e, tr)); }
  };
  const askRemove = (l: Learner) => Modal.confirm({
    title: tr(`Delete ${personName(l)}?`, `Supprimer ${personName(l)} ?`),
    content: tr('This account has never been used (never signed in, no exam). Deleting it frees its place in your package. Any credits it was given go back to your reserve.',
      'Ce compte n’a jamais été utilisé (aucune connexion, aucun examen). Le supprimer libère sa place dans votre forfait. Les crédits qui lui avaient été donnés reviennent dans votre réserve.'),
    okText: tr('Delete', 'Supprimer'), okButtonProps: { danger: true }, cancelText: tr('Cancel', 'Annuler'),
    onOk: () => remove(l),
  });
  const removeItem = (l: Learner) => (l.unused
    ? { key: 'delete', icon: <DeleteOutlined />, danger: true, disabled: !open, label: tr('Delete (never used)', 'Supprimer (jamais utilisé)'), onClick: () => askRemove(l) }
    : { key: 'delete', icon: <DeleteOutlined />, disabled: true,
      label: <Tooltip placement="left" title={tr('This learner has used their account: it keeps its place in the package. You can deactivate it.', 'Cet apprenant a utilisé son compte : il garde sa place dans le forfait. Vous pouvez le désactiver.')}>
        <span>{tr('Delete (already used)', 'Supprimer (déjà utilisé)')}</span></Tooltip> });

  const resend = async (l: Learner) => {
    try {
      const r = await call<{ invitation_sent: boolean }>(apiCall, `/org/learners/${l.id}/invite`, 'POST');
      if (r.invitation_sent) message.success(tr(`A new invitation was sent to ${l.email}`, `Une nouvelle invitation a été envoyée à ${l.email}`));
      else message.warning(tr('The password was reset but the email could not be sent. Try again later.', 'Le mot de passe a été réinitialisé mais l’email n’a pas pu partir. Réessayez plus tard.'));
      load();
    } catch (e) { message.error(errorText(e, tr)); }
  };

  const exportCsv = () => {
    const head = ['first_name', 'last_name', 'email', 'status', 'groups', 'nclc', 'ee_credits', 'eo_credits', 'attempts', 'last_practice'];
    const rows = (learners || []).map(l => [l.first_name, l.last_name, l.email, l.is_active ? 'active' : 'inactive',
      l.groups.map(g => g.name).join(' | '), l.nclc ?? '', l.ee_credits, l.eo_credits, l.attempts, l.last_practice_at ? l.last_practice_at.slice(0, 10) : '']);
    const csv = [head, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'learners.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="og is-company">
      <PageHeader overline={tr('Company space', 'Espace entreprise')} title={tr('Learners', 'Apprenants')}
        subtitle={<>{tr('Add your learners, follow their level and give them what they need to practise.', 'Ajoutez vos apprenants, suivez leur niveau et donnez-leur de quoi s’entraîner.')}
          {pkg && <> <span className={`og-pill ${pkg.used >= pkg.limit ? 'tone-warn' : 'tone-ok'}`}>{tr(`Package: ${pkg.used} / ${pkg.limit} accounts`, `Forfait : ${pkg.used} / ${pkg.limit} comptes`)}</span></>}</>}
        actions={<>
          <Button icon={<DownloadOutlined />} onClick={exportCsv} disabled={!learners?.length}>{tr('Export', 'Exporter')}</Button>
          <Tooltip title={full ? fullText : undefined}><span className="og-locked">
            <ChangeButton icon={<UploadOutlined />} onClick={() => setImportOpen(true)} disabled={full}>{tr('Import a file', 'Importer un fichier')}</ChangeButton></span></Tooltip>
          <Tooltip title={full ? fullText : undefined}><span className="og-locked">
            <ChangeButton type="primary" icon={<UserAddOutlined />} onClick={() => setAddOpen(true)} disabled={full}>{tr('Add a learner', 'Ajouter un apprenant')}</ChangeButton></span></Tooltip>
        </>} />
      {full && (
        <div className="og-banner tone-warn"><WarningOutlined /><div className="og-banner-body">
          <strong>{tr('Your package is full', 'Votre forfait est complet')}</strong>
          <span>{tr(`All ${pkg!.limit} learner accounts of your package are created (deactivated accounts count too). You can reactivate a deactivated learner; to add new ones, contact the administrator.`,
            `Les ${pkg!.limit} comptes apprenants de votre forfait sont créés (les comptes désactivés comptent aussi). Vous pouvez réactiver un apprenant désactivé ; pour en ajouter, contactez l’administrateur.`)}</span></div></div>
      )}

      <section className="og-card">
        <div className="og-toolbar">
          <Input allowClear prefix={<SearchOutlined />} placeholder={tr('Search by name or email', 'Rechercher par nom ou email')} value={query} onChange={e => setQuery(e.target.value)} />
          <Segmented value={status} onChange={v => { setStatus(v as Status); setPicked([]); }} options={[
            { value: 'active', label: `${tr('Active', 'Actifs')} ${counts.active}` },
            { value: 'pending', label: `${tr('Not signed in yet', 'Jamais connectés')} ${counts.pending}` },
            { value: 'off', label: `${tr('Deactivated', 'Désactivés')} ${counts.off}` },
            { value: 'all', label: tr('All', 'Tous') },
          ]} />
          <Select value={groupId} onChange={setGroupId} style={{ minWidth: 170 }} options={[
            { value: 'all', label: tr('All groups', 'Tous les groupes') },
            ...groups.map(g => ({ value: g.id, label: `${g.name} (${g.member_count})` })),
          ]} />
          <span className="og-toolbar-spacer" />
          <Tooltip title={tr('Refresh', 'Actualiser')}><Button type="text" icon={<ReloadOutlined />} onClick={load} /></Tooltip>
        </div>

        {picked.length > 0 && (
          <div className="og-bulk">
            <strong>{tr(`${picked.length} selected`, `${picked.length} sélectionné(s)`)}</strong>
            <ChangeButton size="small" icon={<SendOutlined />} onClick={() => navigate(`/app/org/assignments?new=1&learners=${picked.join(',')}`)}>{tr('Assign exams', 'Attribuer des examens')}</ChangeButton>
            <ChangeButton size="small" icon={<ThunderboltOutlined />} onClick={() => setGiveFor(picked)}>{tr('Give credits', 'Donner des crédits')}</ChangeButton>
            <ChangeButton size="small" icon={<ApartmentOutlined />} onClick={() => setGroupFor(picked)} disabled={!groups.length}>{tr('Add to a group', 'Ajouter à un groupe')}</ChangeButton>
            <Button size="small" type="text" onClick={() => setPicked([])}>{tr('Clear', 'Effacer')}</Button>
          </div>
        )}

        {error ? (
          <Empty icon={<WarningOutlined />} title={tr('Learners could not be loaded', 'Les apprenants n’ont pas pu être chargés')} text={error} action={<Button onClick={load}>{tr('Try again', 'Réessayer')}</Button>} />
        ) : learners === null ? (
          <div style={{ padding: 18 }}><Skeleton active paragraph={{ rows: 6 }} /></div>
        ) : visible.length === 0 ? (
          <Empty icon={<TeamOutlined />} title={learners.length ? tr('No learner matches', 'Aucun apprenant ne correspond') : tr('No learner yet', 'Aucun apprenant pour l’instant')}
            text={learners.length ? tr('Try another search or filter.', 'Essayez une autre recherche ou un autre filtre.') : tr('Add them one by one or import a file with their names and emails.', 'Ajoutez-les un par un ou importez un fichier avec leurs noms et emails.')}
            action={!learners.length ? <ChangeButton type="primary" icon={<UserAddOutlined />} onClick={() => setAddOpen(true)}>{tr('Add a learner', 'Ajouter un apprenant')}</ChangeButton> : undefined} />
        ) : (
          <div className="og-list" role="table" aria-label={tr('Learners', 'Apprenants')}>
            <div className="og-row is-learner is-head" role="row">
              <Checkbox checked={allPicked} indeterminate={!allPicked && picked.length > 0} disabled={!activeVisible.length}
                onChange={e => setPicked(e.target.checked ? activeVisible.map(l => l.id) : [])} aria-label={tr('Select all', 'Tout sélectionner')} />
              <span>{tr('Learner', 'Apprenant')}</span><span>{tr('Level', 'Niveau')}</span><span>{tr('Groups', 'Groupes')}</span>
              <span>{tr('Credits', 'Crédits')}</span><span>{tr('Last practice', 'Dernier entraînement')}</span><span />
            </div>
            {visible.map(l => (
              <div key={l.id} className={`og-row is-learner is-link${l.is_active ? '' : ' is-off'}`} role="row"
                onClick={() => navigate(`/app/org/learners/${l.id}`)}>
                <span onClick={e => e.stopPropagation()}>
                  <Checkbox checked={picked.includes(l.id)} disabled={!l.is_active}
                    onChange={e => setPicked(p => (e.target.checked ? [...p, l.id] : p.filter(x => x !== l.id)))} aria-label={personName(l)} />
                </span>
                <span className="og-cell-main">
                  <strong>{personName(l)}</strong>
                  <em>{l.email}{!l.is_active ? ` · ${tr('deactivated', 'désactivé')}` : l.invitation_pending ? ` · ${tr('not signed in yet', 'jamais connecté')}` : ''}</em>
                </span>
                <span className="og-hide-sm"><Level nclc={l.nclc} level={Object.values(l.skills).find(Boolean) || null} /></span>
                <span className="og-cell-tags og-hide-sm">{l.groups.length ? l.groups.map(g => <span key={g.id} className="og-tag">{g.name}</span>) : <span className="og-muted">—</span>}</span>
                <span className="og-hide-sm"><Credits ee={l.ee_credits} eo={l.eo_credits} /></span>
                <span className="og-hide-sm og-muted">{l.last_practice_at ? ago(l.last_practice_at, tr) : tr('never', 'jamais')}</span>
                <span className="og-row-actions" onClick={e => e.stopPropagation()}>
                  <Dropdown trigger={['click']} menu={{
                    items: [
                      ...(l.is_active ? [
                        { key: 'credits', icon: <ThunderboltOutlined />, label: tr('Give credits', 'Donner des crédits'), disabled: !open, onClick: () => setGiveFor([l.id]) },
                        { key: 'invite', icon: <MailOutlined />, label: tr('Send the invitation again', 'Renvoyer l’invitation'), disabled: !open, onClick: () => resend(l) },
                        { type: 'divider' as const },
                        { key: 'off', icon: <StopOutlined />, danger: true, disabled: !open, label: tr('Deactivate', 'Désactiver'),
                          onClick: () => Modal.confirm({
                            title: tr(`Deactivate ${personName(l)}?`, `Désactiver ${personName(l)} ?`),
                            content: tr('They can no longer sign in. Their unused credits return to your reserve and their results are kept. The account keeps its place in your package.',
                              'La personne ne pourra plus se connecter. Ses crédits non utilisés reviennent dans votre réserve et ses résultats sont conservés. Le compte garde sa place dans votre forfait.'),
                            okText: tr('Deactivate', 'Désactiver'), okButtonProps: { danger: true }, cancelText: tr('Cancel', 'Annuler'),
                            onOk: () => setActive(l, false),
                          }) },
                        removeItem(l),
                      ] : [
                        { key: 'on', icon: <CheckCircleOutlined />, disabled: !open, label: tr('Reactivate', 'Réactiver'), onClick: () => setActive(l, true) },
                        removeItem(l),
                      ]),
                    ],
                  }}>
                    <Button type="text" size="small" icon={<MoreOutlined />} aria-label={tr('Actions', 'Actions')} />
                  </Dropdown>
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <AddLearnerModal open={addOpen} groups={groups} onClose={() => setAddOpen(false)} onDone={() => { setAddOpen(false); load(); }} />
      <ImportLearnersModal open={importOpen} groups={groups} onClose={() => setImportOpen(false)} onDone={load} />
      <GiveCreditsModal learnerIds={giveFor} learners={learners || []} onClose={() => setGiveFor(null)} onDone={() => { setGiveFor(null); setPicked([]); load(); }} />
      <AddToGroupModal learnerIds={groupFor} groups={groups} onClose={() => setGroupFor(null)} onDone={() => { setGroupFor(null); setPicked([]); load(); }} />
    </div>
  );
};

/* ── Add one learner ── */
const AddLearnerModal: React.FC<{ open: boolean; groups: Group[]; onClose: () => void; onDone: () => void }> = ({ open, groups, onClose, onDone }) => {
  const { apiCall } = useAuth();
  const { tr } = useTr();
  const { message } = AntApp.useApp();
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [email, setEmail] = useState('');
  const [groupIds, setGroupIds] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => { if (open) { setFirst(''); setLast(''); setEmail(''); setGroupIds([]); setErr(null); } }, [open]);
  const valid = first.trim() && last.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const submit = async (again: boolean) => {
    setBusy(true); setErr(null);
    try {
      const r = await call<{ email: string; invitation_sent: boolean }>(apiCall, '/org/learners', 'POST', { first_name: first, last_name: last, email, group_ids: groupIds });
      if (r.invitation_sent) message.success(tr(`${first} was added and invited by email`, `${first} a été ajouté et invité par email`));
      else message.warning(tr(`${first} was added, but the invitation email could not be sent: use “Send the invitation again”.`, `${first} a été ajouté, mais l’email d’invitation n’a pas pu partir : utilisez « Renvoyer l’invitation ».`));
      if (again) { setFirst(''); setLast(''); setEmail(''); } else onDone();
    } catch (e) { setErr(errorText(e, tr)); } finally { setBusy(false); }
  };

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={520} wrapClassName="og-modal is-company" destroyOnHidden>
      <div className="og-modal-head"><span className="og-logo"><UserAddOutlined /></span><div>
        <h3>{tr('Add a learner', 'Ajouter un apprenant')}</h3>
        <p>{tr('They receive an email with a temporary password.', 'La personne reçoit un email avec un mot de passe provisoire.')}</p></div></div>
      <div className="og-form">
        <div className="og-two">
          <div className="og-field"><label>{tr('First name', 'Prénom')}</label><Input value={first} onChange={e => setFirst(e.target.value)} maxLength={50} autoFocus /></div>
          <div className="og-field"><label>{tr('Last name', 'Nom')}</label><Input value={last} onChange={e => setLast(e.target.value)} maxLength={50} /></div>
        </div>
        <div className="og-field"><label>Email</label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} maxLength={100} placeholder="prenom.nom@entreprise.com" /></div>
        {groups.length > 0 && (
          <div className="og-field"><label>{tr('Groups', 'Groupes')} <em>{tr('optional', 'facultatif')}</em></label>
            <Select mode="multiple" value={groupIds} onChange={setGroupIds} options={groups.map(g => ({ value: g.id, label: g.name }))} placeholder={tr('None', 'Aucun')} /></div>
        )}
        {err && <div className="og-check tone-bad"><WarningOutlined /><span>{err}</span></div>}
        <div className="og-foot">
          <Button onClick={onClose}>{tr('Cancel', 'Annuler')}</Button>
          <Button onClick={() => submit(true)} disabled={!valid} loading={busy}>{tr('Add and add another', 'Ajouter et continuer')}</Button>
          <Button type="primary" onClick={() => submit(false)} disabled={!valid} loading={busy}>{tr('Add', 'Ajouter')}</Button>
        </div>
      </div>
    </Modal>
  );
};

/* ── Import a CSV file ── */
interface ImportResult { row: number; status: 'created' | 'error' | 'skipped'; email?: string | null; error?: string; code?: string }
const ImportLearnersModal: React.FC<{ open: boolean; groups: Group[]; onClose: () => void; onDone: () => void }> = ({ open, groups, onClose, onDone }) => {
  const { apiCall } = useAuth();
  const { tr } = useTr();
  const [rows, setRows] = useState<{ first_name: string; last_name: string; email: string }[]>([]);
  const [fileName, setFileName] = useState('');
  const [groupIds, setGroupIds] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<ImportResult[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const reset = useRef(() => { setRows([]); setFileName(''); setGroupIds([]); setResults(null); setErr(null); });
  useEffect(() => { if (open) reset.current(); }, [open]);

  const bad = rows.filter(r => !r.first_name || !r.last_name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email));
  const read = async (file: File) => {
    setResults(null); setErr(null);
    const text = await file.text();
    const parsed = parseLearnersCsv(text);
    setFileName(file.name);
    setRows(parsed);
    if (!parsed.length) setErr(tr('No learner found in this file.', 'Aucun apprenant trouvé dans ce fichier.'));
    return false;
  };
  const submit = async () => {
    setBusy(true); setErr(null);
    try {
      const r = await call<{ created: number; failed: number; results: ImportResult[] }>(apiCall, '/org/learners/import', 'POST', { rows, group_ids: groupIds });
      setResults(r.results);
      onDone();
    } catch (e) { setErr(errorText(e, tr)); } finally { setBusy(false); }
  };
  const template = () => {
    const csv = 'first_name,last_name,email\nAwa,Diop,awa.diop@example.com\n';
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a'); a.href = url; a.download = 'learners-template.csv'; a.click(); URL.revokeObjectURL(url);
  };
  const created = results?.filter(r => r.status === 'created').length ?? 0;

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={640} wrapClassName="og-modal is-company" destroyOnHidden>
      <div className="og-modal-head"><span className="og-logo"><UploadOutlined /></span><div>
        <h3>{tr('Import learners', 'Importer des apprenants')}</h3>
        <p>{tr('A CSV file with the columns first name, last name and email (comma or semicolon).', 'Un fichier CSV avec les colonnes prénom, nom et email (virgule ou point-virgule).')}</p></div></div>
      <div className="og-form">
        {!results ? (
          <>
            <Upload.Dragger accept=".csv,text/csv" showUploadList={false} beforeUpload={read} multiple={false}>
              <p style={{ fontSize: 28, margin: 0, color: 'var(--x-accent)' }}><UploadOutlined /></p>
              <p style={{ margin: '6px 0 2px', fontWeight: 600 }}>{fileName || tr('Drop your CSV file here or click to choose it', 'Déposez votre fichier CSV ici ou cliquez pour le choisir')}</p>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--x-subtle)' }}>{rows.length ? tr(`${rows.length} learner(s) found`, `${rows.length} apprenant(s) trouvé(s)`) : tr('Up to 500 learners at a time', 'Jusqu’à 500 apprenants à la fois')}</p>
            </Upload.Dragger>
            <Button type="link" size="small" icon={<DownloadOutlined />} onClick={template} style={{ alignSelf: 'flex-start', padding: 0 }}>{tr('Download a template', 'Télécharger un modèle')}</Button>
            {rows.length > 0 && (
              <div className="og-card" style={{ maxHeight: 220, overflow: 'auto' }}>
                {rows.slice(0, 50).map((r, i) => {
                  const ok = r.first_name && r.last_name && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email);
                  return (
                    <div key={i} className={`og-row is-manager${ok ? '' : ' is-off'}`} style={{ gridTemplateColumns: '1fr 1.4fr auto' }}>
                      <span className="og-cell-main"><strong>{r.first_name} {r.last_name}</strong></span>
                      <span className="og-muted">{r.email || '—'}</span>
                      {ok ? <CheckCircleOutlined style={{ color: '#047857' }} /> : <Tooltip title={tr('Missing name or invalid email', 'Nom manquant ou email invalide')}><WarningOutlined style={{ color: '#b45309' }} /></Tooltip>}
                    </div>
                  );
                })}
                {rows.length > 50 && <div className="og-row og-muted">{tr(`…and ${rows.length - 50} more`, `…et ${rows.length - 50} de plus`)}</div>}
              </div>
            )}
            {groups.length > 0 && rows.length > 0 && (
              <div className="og-field"><label>{tr('Add them to groups', 'Les ajouter à des groupes')} <em>{tr('optional', 'facultatif')}</em></label>
                <Select mode="multiple" value={groupIds} onChange={setGroupIds} options={groups.map(g => ({ value: g.id, label: g.name }))} /></div>
            )}
            {bad.length > 0 && <div className="og-check tone-warn"><WarningOutlined /><span>{tr(`${bad.length} line(s) have a missing name or an invalid email: they will be reported and skipped.`, `${bad.length} ligne(s) ont un nom manquant ou un email invalide : elles seront signalées et ignorées.`)}</span></div>}
            {err && <div className="og-check tone-bad"><WarningOutlined /><span>{err}</span></div>}
            <div className="og-foot">
              <Button onClick={onClose}>{tr('Cancel', 'Annuler')}</Button>
              <Button type="primary" onClick={submit} loading={busy} disabled={!rows.length}>{tr(`Import ${rows.length} learner(s)`, `Importer ${rows.length} apprenant(s)`)}</Button>
            </div>
          </>
        ) : (
          <>
            <div className={`og-check ${created === results.length ? 'tone-ok' : 'tone-warn'}`}>
              {created === results.length ? <CheckCircleOutlined /> : <WarningOutlined />}
              <span>{tr(`${created} of ${results.length} learner(s) added and invited.`, `${created} apprenant(s) sur ${results.length} ajouté(s) et invité(s).`)}</span>
            </div>
            {results.some(r => r.status !== 'created') && (
              <div className="og-card" style={{ maxHeight: 240, overflow: 'auto' }}>
                {results.filter(r => r.status !== 'created').map(r => (
                  <div key={r.row} className="og-row" style={{ gridTemplateColumns: '60px 1fr' }}>
                    <span className="og-muted">{tr('Line', 'Ligne')} {r.row}</span>
                    <span className="og-cell-main"><strong>{r.email || '—'}</strong>
                      <em>{r.status === 'skipped' ? tr('Skipped: your package is full', 'Ignorée : votre forfait est complet') : r.error}</em></span>
                  </div>
                ))}
              </div>
            )}
            <div className="og-foot"><Button type="primary" onClick={onClose}>{tr('Close', 'Fermer')}</Button></div>
          </>
        )}
      </div>
    </Modal>
  );
};

/* ── Give credits to one or several learners ──
   Chosen learners each receive the amounts: nothing to share, so no "total"
   mode here (sharing a total is offered for groups on the Credits page). */
export const GiveCreditsModal: React.FC<{ learnerIds: number[] | null; learners: Learner[]; onClose: () => void; onDone: () => void }> = ({ learnerIds, learners, onClose, onDone }) => {
  const { apiCall } = useAuth();
  const { tr, lang } = useTr();
  const { message } = AntApp.useApp();
  const [kinds, setKinds] = useState<CreditType[]>(['ee', 'eo']);
  const [amounts, setAmounts] = useState<Amounts>({ ee: 1, eo: 1 });
  const [reserve, setReserve] = useState<{ ee: number; eo: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const open = !!learnerIds;
  useEffect(() => {
    if (!open) return;
    setKinds(['ee', 'eo']); setAmounts({ ee: 1, eo: 1 }); setErr(null);
    call<{ credits: { ee: { reserve: number }; eo: { reserve: number } } }>(apiCall, '/org/credits?limit=1')
      .then(r => setReserve({ ee: r.credits.ee.reserve, eo: r.credits.eo.reserve })).catch(() => setReserve(null));
  }, [open, apiCall]);
  const n = learnerIds?.length || 0;
  const names = learners.filter(l => learnerIds?.includes(l.id)).map(personName);
  const lines: ReceiptLine[] = kinds.map(t => {
    const each = amounts[t] || 0;
    const total = each * n;
    const available = reserve ? reserve[t] : null;
    const enough = available == null || total <= available;
    return {
      kind: t,
      ok: each > 0 && enough,
      what: n === 1 ? tr(`${each} to ${names[0]}`, `${each} à ${names[0]}`) : tr(`${n} learners × ${each}`, `${n} apprenants × ${each}`),
      detail: available == null ? undefined : enough
        ? tr(`Reserve ${available} → ${available - total}`, `Réserve ${available} → ${available - total}`)
        : tr(`Reserve ${available} · ${total - available} missing`, `Réserve ${available} · il en manque ${total - available}`),
      total: `−${total}`,
    };
  });
  const ready = n > 0 && lines.every(l => l.ok);

  const submit = async () => {
    setBusy(true); setErr(null);
    try {
      const r = await call<{ given: number; each: Partial<Record<CreditType, number>> }>(apiCall, '/org/credits/distribute', 'POST',
        { amounts: chosenAmounts(kinds, amounts), mode: 'each', learner_ids: learnerIds });
      message.success(tr(`${kindsText(r.each)} given to ${r.given} learner(s)`, `${kindsText(r.each)} donné(s) à ${r.given} apprenant(s)`));
      onDone();
    } catch (e) { setErr(errorText(e, tr)); } finally { setBusy(false); }
  };

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={520} wrapClassName="og-modal is-company" destroyOnHidden>
      <div className="og-modal-head"><span className="og-logo"><ThunderboltOutlined /></span><div>
        <h3>{tr('Give credits', 'Donner des crédits')}</h3>
        <p>{n === 1 ? names[0] : tr(`${n} learners · each receives the amounts`, `${n} apprenants · chacun reçoit les montants`)}</p></div></div>
      <div className="og-form">
        <div className="og-field"><label>{tr('Which credits', 'Quels crédits')} <em>{tr('one or both', 'l’un ou les deux')}</em></label>
          <KindPicker value={kinds} onChange={setKinds} lang={lang} note={t => (reserve ? tr(`${reserve[t]} in reserve`, `${reserve[t]} en réserve`) : '')} /></div>
        <AmountBoxes kinds={kinds} values={amounts} onChange={setAmounts} label={t => tr(`${creditName(t, lang)} per learner`, `${creditName(t, lang)} par apprenant`)} />
        <CreditReceipt lines={lines} foot={tr('One credit = one AI-corrected exam.', 'Un crédit = un examen corrigé par l’IA.')} />
        {err && <div className="og-check tone-bad"><WarningOutlined /><span>{err}</span></div>}
        <div className="og-foot">
          <Button onClick={onClose}>{tr('Cancel', 'Annuler')}</Button>
          <Button type="primary" onClick={submit} loading={busy} disabled={!ready}>{tr('Give', 'Donner')}</Button>
        </div>
      </div>
    </Modal>
  );
};

/* ── Add several learners to a group ── */
const AddToGroupModal: React.FC<{ learnerIds: number[] | null; groups: Group[]; onClose: () => void; onDone: () => void }> = ({ learnerIds, groups, onClose, onDone }) => {
  const { apiCall } = useAuth();
  const { tr } = useTr();
  const { message } = AntApp.useApp();
  const [gid, setGid] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (learnerIds) setGid(null); }, [learnerIds]);
  const submit = async () => {
    const g = groups.find(x => x.id === gid);
    if (!g || !learnerIds) return;
    setBusy(true);
    try {
      await call(apiCall, `/org/groups/${g.id}`, 'PUT', { member_ids: [...new Set([...g.member_ids, ...learnerIds])] });
      message.success(tr(`Added to ${g.name}`, `Ajouté(s) à ${g.name}`));
      onDone();
    } catch (e) { message.error(errorText(e, tr)); } finally { setBusy(false); }
  };
  return (
    <Modal open={!!learnerIds} onCancel={onClose} onOk={submit} okText={tr('Add', 'Ajouter')} cancelText={tr('Cancel', 'Annuler')}
      okButtonProps={{ disabled: !gid, loading: busy }} title={tr('Add to a group', 'Ajouter à un groupe')} wrapClassName="og-modal is-company" width={420}>
      <Select style={{ width: '100%' }} value={gid ?? undefined} onChange={setGid} placeholder={tr('Choose a group', 'Choisissez un groupe')}
        options={groups.map(g => ({ value: g.id, label: `${g.name} (${g.member_count})` }))} />
    </Modal>
  );
};

export default OrgLearners;
