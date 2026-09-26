import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { App as AntApp, Button, Input, Modal, Popconfirm, Select, Skeleton } from 'antd';
import { ApartmentOutlined, DeleteOutlined, EditOutlined, PlusOutlined, SendOutlined, WarningOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTr } from '../../utils/useTr';
import { call, errorText, personName } from './orgModel';
import type { Group, Learner } from './orgModel';
import { ChangeButton, Empty, PageHeader } from './OrgUi';
import { useCompanyOpen } from './useCompanyOpen';
import './Org.css';

/* Groups of learners: assign exams or hand out credits to a whole group at once. */
const OrgGroups: React.FC = () => {
  const { apiCall } = useAuth();
  const { tr } = useTr();
  const { message } = AntApp.useApp();
  const navigate = useNavigate();
  const { open } = useCompanyOpen();
  const [groups, setGroups] = useState<Group[] | null>(null);
  const [learners, setLearners] = useState<Learner[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Group | 'new' | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [g, l] = await Promise.all([call<Group[]>(apiCall, '/org/groups'), call<Learner[]>(apiCall, '/org/learners')]);
      setGroups(g); setLearners(l);
    } catch (e) { setError(errorText(e, tr)); }
  }, [apiCall, tr]);
  useEffect(() => { load(); }, [load]);

  const byId = useMemo(() => new Map(learners.map(l => [l.id, l])), [learners]);
  const remove = async (g: Group) => {
    try {
      await call(apiCall, `/org/groups/${g.id}`, 'DELETE');
      message.success(tr(`“${g.name}” deleted`, `« ${g.name} » supprimé`));
      load();
    } catch (e) { message.error(errorText(e, tr)); }
  };

  return (
    <div className="og is-company">
      <PageHeader overline={tr('Company space', 'Espace entreprise')} title={tr('Groups', 'Groupes')}
        subtitle={tr('Group your learners (a class, a team, an intake) to assign exams or give credits to all of them at once. A learner who joins a group later gets the group’s exams.',
          'Regroupez vos apprenants (une classe, une équipe, une promotion) pour leur attribuer des examens ou des crédits en une fois. Un apprenant ajouté plus tard à un groupe reçoit les examens du groupe.')}
        actions={<ChangeButton type="primary" icon={<PlusOutlined />} onClick={() => setEditing('new')}>{tr('New group', 'Nouveau groupe')}</ChangeButton>} />

      <section className="og-card">
        {error ? (
          <Empty icon={<WarningOutlined />} title={tr('Groups could not be loaded', 'Les groupes n’ont pas pu être chargés')} text={error} action={<Button onClick={load}>{tr('Try again', 'Réessayer')}</Button>} />
        ) : groups === null ? (
          <div style={{ padding: 18 }}><Skeleton active paragraph={{ rows: 5 }} /></div>
        ) : groups.length === 0 ? (
          <Empty icon={<ApartmentOutlined />} title={tr('No group yet', 'Aucun groupe pour l’instant')}
            text={tr('Create a group, then choose its learners.', 'Créez un groupe, puis choisissez ses apprenants.')}
            action={<ChangeButton type="primary" icon={<PlusOutlined />} onClick={() => setEditing('new')}>{tr('New group', 'Nouveau groupe')}</ChangeButton>} />
        ) : (
          <div className="og-list">
            <div className="og-row is-group is-head"><span>{tr('Group', 'Groupe')}</span><span>{tr('Learners', 'Apprenants')}</span><span /></div>
            {groups.map(g => (
              <div key={g.id} className="og-row is-group">
                <span className="og-cell-main"><strong>{g.name}</strong><em>{tr(`${g.member_count} learner(s)`, `${g.member_count} apprenant(s)`)}</em></span>
                <span className="og-cell-tags og-hide-sm">
                  {g.member_ids.slice(0, 6).map(id => byId.get(id)).filter(Boolean).map(l => <span key={l!.id} className="og-tag">{personName(l!)}</span>)}
                  {g.member_ids.length > 6 && <span className="og-tag is-accent">+{g.member_ids.length - 6}</span>}
                  {!g.member_ids.length && <span className="og-muted">{tr('Empty', 'Vide')}</span>}
                </span>
                <span className="og-row-actions">
                  <ChangeButton type="text" size="small" icon={<SendOutlined />} title={tr('Assign exams', 'Attribuer des examens')}
                    onClick={() => navigate(`/app/org/assignments?new=1&groups=${g.id}`)} />
                  <ChangeButton type="text" size="small" icon={<EditOutlined />} title={tr('Edit', 'Modifier')} onClick={() => setEditing(g)} />
                  {open ? (
                    <Popconfirm title={tr(`Delete “${g.name}”?`, `Supprimer « ${g.name} » ?`)}
                      description={tr('The exams assigned to this group close for its members (their own assignments stay).', 'Les examens attribués à ce groupe se ferment pour ses membres (leurs attributions individuelles restent).')}
                      okText={tr('Delete', 'Supprimer')} okButtonProps={{ danger: true }} cancelText={tr('Cancel', 'Annuler')} onConfirm={() => remove(g)}>
                      <Button type="text" size="small" danger icon={<DeleteOutlined />} aria-label={tr('Delete', 'Supprimer')} />
                    </Popconfirm>
                  ) : <ChangeButton type="text" size="small" danger icon={<DeleteOutlined />} />}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <GroupModal group={editing} learners={learners} onClose={() => setEditing(null)} onDone={() => { setEditing(null); load(); }} />
    </div>
  );
};

const GroupModal: React.FC<{ group: Group | 'new' | null; learners: Learner[]; onClose: () => void; onDone: () => void }> = ({ group, learners, onClose, onDone }) => {
  const { apiCall } = useAuth();
  const { tr } = useTr();
  const { message } = AntApp.useApp();
  const isNew = group === 'new';
  const [name, setName] = useState('');
  const [members, setMembers] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    if (!group) return;
    setErr(null);
    setName(group === 'new' ? '' : group.name);
    setMembers(group === 'new' ? [] : group.member_ids);
  }, [group]);
  const options = useMemo(() => learners.filter(l => l.is_active || members.includes(l.id))
    .map(l => ({ value: l.id, label: personName(l), search: `${personName(l)} ${l.email}`.toLowerCase(), email: l.email })), [learners, members]);

  const submit = async () => {
    setBusy(true); setErr(null);
    try {
      if (isNew) await call(apiCall, '/org/groups', 'POST', { name, member_ids: members });
      else if (group) await call(apiCall, `/org/groups/${group.id}`, 'PUT', { name, member_ids: members });
      message.success(tr('Group saved', 'Groupe enregistré'));
      onDone();
    } catch (e) { setErr(errorText(e, tr)); } finally { setBusy(false); }
  };

  return (
    <Modal open={!!group} onCancel={onClose} footer={null} width={560} wrapClassName="og-modal is-company" destroyOnHidden>
      <div className="og-modal-head"><span className="og-logo"><ApartmentOutlined /></span><div>
        <h3>{isNew ? tr('New group', 'Nouveau groupe') : tr('Edit group', 'Modifier le groupe')}</h3>
        <p>{tr('Name the group and choose its learners.', 'Nommez le groupe et choisissez ses apprenants.')}</p></div></div>
      <div className="og-form">
        <div className="og-field"><label>{tr('Name', 'Nom')}</label>
          <Input value={name} onChange={e => setName(e.target.value)} maxLength={120} placeholder={tr('e.g. Intake September 2026', 'ex. Promotion septembre 2026')} autoFocus /></div>
        <div className="og-field"><label>{tr('Learners', 'Apprenants')} <em>{members.length}</em></label>
          <Select mode="multiple" value={members} onChange={setMembers} options={options} optionFilterProp="search" showSearch allowClear
            placeholder={tr('Search by name or email', 'Rechercher par nom ou email')} maxTagCount="responsive"
            optionRender={o => <span className="ea-opt"><strong>{o.data.label}</strong><em>{o.data.email}</em></span>} /></div>
        {err && <div className="og-check tone-bad"><WarningOutlined /><span>{err}</span></div>}
        <div className="og-foot">
          <Button onClick={onClose}>{tr('Cancel', 'Annuler')}</Button>
          <Button type="primary" onClick={submit} loading={busy} disabled={!name.trim()}>{tr('Save', 'Enregistrer')}</Button>
        </div>
      </div>
    </Modal>
  );
};

export default OrgGroups;
