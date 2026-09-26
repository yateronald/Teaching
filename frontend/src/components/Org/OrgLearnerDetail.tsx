import React, { useCallback, useEffect, useState } from 'react';
import { App as AntApp, Button, Input, Modal, Select, Skeleton, Tag } from 'antd';
import {
  ArrowLeftOutlined, CheckCircleOutlined, ClockCircleOutlined, EditOutlined, FieldTimeOutlined, MailOutlined, SendOutlined,
  StopOutlined, ThunderboltOutlined, TrophyOutlined, WarningOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTr } from '../../utils/useTr';
import { ago, call, errorText, fmtDate, personName, skillName, SKILLS } from './orgModel';
import type { Group, Learner, Skill } from './orgModel';
import { ChangeButton, Credits, Empty, Initials, Kpi, PageHeader } from './OrgUi';
import { GiveCreditsModal } from './OrgLearners';
import './Org.css';

interface Attempt { skill: Skill; id: number; title: string | null; at: string; score: number | null; max: number; percent: number | null; cefr: string | null; nclc: number | null; detail: string | null }
interface SkillSummary {
  skill: Skill; attempts: number;
  estimate: { score: number; max: number; percent: number; cefr: string; nclc: number | null } | null;
  best: { score: number; max: number } | null; last_at: string | null;
}
interface Detail {
  learner: { id: number; first_name: string; last_name: string; email: string; is_active: boolean; created_at: string; invitation_pending: boolean; groups: { id: number; name: string }[] };
  overview: {
    credits: { ee: number; eo: number } | null;
    skills: SkillSummary[];
    level: { nclc: number | null; skills_measured: number; below_4: boolean };
    activity: { total: number; last_30_days: number; minutes: number; last_at: string | null };
    access: { active_items: number; next_end: string | null; items: { type: string; id: number; name: string; skill: Skill | null; expires_at: string | null; active: boolean }[] };
  };
  results: Attempt[];
}

/* One learner, as the company sees them: level per skill, results, access, credits. */
const OrgLearnerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { apiCall } = useAuth();
  const { tr, lang, locale } = useTr();
  const { message } = AntApp.useApp();
  const navigate = useNavigate();
  const [data, setData] = useState<Detail | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [give, setGive] = useState(false);
  const [edit, setEdit] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [d, g] = await Promise.all([call<Detail>(apiCall, `/org/learners/${id}`), call<Group[]>(apiCall, '/org/groups')]);
      setData(d); setGroups(g);
    } catch (e) { setError(errorText(e, tr)); }
  }, [apiCall, id, tr]);
  useEffect(() => { load(); }, [load]);

  if (error) return <div className="og is-company"><Empty icon={<WarningOutlined />} title={tr('This learner could not be loaded', 'Cet apprenant n’a pas pu être chargé')} text={error}
    action={<Button onClick={() => navigate('/app/org/learners')}>{tr('Back to learners', 'Retour aux apprenants')}</Button>} /></div>;
  if (!data) return <div className="og is-company"><Skeleton active paragraph={{ rows: 10 }} /></div>;

  const l = data.learner;
  const o = data.overview;
  const name = personName(l);
  const credits = o.credits || { ee: 0, eo: 0 };
  const learnerForModal = [{ ...l, ee_credits: credits.ee, eo_credits: credits.eo } as unknown as Learner];

  const setActive = (active: boolean) => {
    const run = async () => {
      try {
        await call(apiCall, `/org/learners/${l.id}/active`, 'PUT', { active });
        message.success(active ? tr('Reactivated', 'Réactivé') : tr('Deactivated · unused credits returned to your reserve', 'Désactivé · crédits non utilisés rendus à votre réserve'));
        load();
      } catch (e) { message.error(errorText(e, tr)); }
    };
    if (active) { run(); return; }
    Modal.confirm({
      title: tr(`Deactivate ${name}?`, `Désactiver ${name} ?`),
      content: tr('They can no longer sign in. Their unused credits return to your reserve and their results are kept.', 'La personne ne pourra plus se connecter. Ses crédits non utilisés reviennent dans votre réserve et ses résultats sont conservés.'),
      okText: tr('Deactivate', 'Désactiver'), okButtonProps: { danger: true }, cancelText: tr('Cancel', 'Annuler'), onOk: run,
    });
  };
  const resend = async () => {
    try {
      const r = await call<{ invitation_sent: boolean }>(apiCall, `/org/learners/${l.id}/invite`, 'POST');
      if (r.invitation_sent) message.success(tr(`A new invitation was sent to ${l.email}`, `Une nouvelle invitation a été envoyée à ${l.email}`));
      else message.warning(tr('The password was reset but the email could not be sent.', 'Le mot de passe a été réinitialisé mais l’email n’a pas pu partir.'));
    } catch (e) { message.error(errorText(e, tr)); }
  };

  return (
    <div className="og is-company">
      <button type="button" className="og-back" onClick={() => navigate('/app/org/learners')}><ArrowLeftOutlined />{tr('All learners', 'Tous les apprenants')}</button>
      <PageHeader
        lead={<Initials first={l.first_name} last={l.last_name} />}
        overline={l.is_active ? (l.invitation_pending ? tr('Not signed in yet', 'Jamais connecté') : tr('Active learner', 'Apprenant actif')) : tr('Deactivated', 'Désactivé')}
        title={name}
        subtitle={<>{l.email} · {tr('added', 'ajouté le')} {fmtDate(l.created_at, locale)} {l.groups.map(g => <Tag key={g.id} style={{ marginLeft: 6 }}>{g.name}</Tag>)}</>}
        actions={l.is_active ? <>
          <ChangeButton icon={<EditOutlined />} onClick={() => setEdit(true)}>{tr('Edit', 'Modifier')}</ChangeButton>
          <ChangeButton icon={<MailOutlined />} onClick={resend}>{tr('Send the invitation again', 'Renvoyer l’invitation')}</ChangeButton>
          <ChangeButton icon={<ThunderboltOutlined />} onClick={() => setGive(true)}>{tr('Give credits', 'Donner des crédits')}</ChangeButton>
          <ChangeButton type="primary" icon={<SendOutlined />} onClick={() => navigate(`/app/org/assignments?new=1&learners=${l.id}`)}>{tr('Assign exams', 'Attribuer des examens')}</ChangeButton>
          <ChangeButton danger icon={<StopOutlined />} onClick={() => setActive(false)}>{tr('Deactivate', 'Désactiver')}</ChangeButton>
        </> : <ChangeButton type="primary" icon={<CheckCircleOutlined />} onClick={() => setActive(true)}>{tr('Reactivate', 'Réactiver')}</ChangeButton>}
      />

      <div className="og-kpis">
        <Kpi icon={<TrophyOutlined />} label={tr('Estimated level', 'Niveau estimé')}
          value={o.level.nclc != null ? `NCLC ${o.level.nclc}` : o.level.below_4 ? '< NCLC 4' : '—'}
          note={o.level.nclc != null || o.level.below_4 ? tr('weakest of the four skills', 'la plus faible des quatre compétences') : tr(`${o.level.skills_measured} of 4 skills measured`, `${o.level.skills_measured} compétence(s) sur 4 évaluée(s)`)} />
        <Kpi icon={<FieldTimeOutlined />} label={tr('Exams completed', 'Examens terminés')} value={o.activity.total}
          note={tr(`${o.activity.last_30_days} in 30 days · ${o.activity.minutes} min`, `${o.activity.last_30_days} en 30 jours · ${o.activity.minutes} min`)} />
        <Kpi icon={<ClockCircleOutlined />} label={tr('Last practice', 'Dernier entraînement')} value={o.activity.last_at ? ago(o.activity.last_at, tr) : '—'} />
        <Kpi icon={<ThunderboltOutlined />} label={tr('Credits', 'Crédits')} value={<Credits ee={credits.ee} eo={credits.eo} />}
          note={tr('One credit per AI-corrected exam', 'Un crédit par examen corrigé par l’IA')} />
      </div>

      <div className="og-grid">
        <section className="og-card og-span-7">
          <div className="og-card-head"><span className="og-card-title">{tr('Level by skill', 'Niveau par compétence')}</span></div>
          <div className="og-card-body og-skills">
            {SKILLS.map(k => {
              const s = o.skills.find(x => x.skill === k);
              const e = s?.estimate;
              return (
                <div key={k} className={`og-skill fam-${k}`}>
                  <span className="og-skill-name">{skillName(k, lang)}<em>{s?.attempts ? tr(`${s.attempts} result(s)`, `${s.attempts} résultat(s)`) : tr('no result yet', 'aucun résultat')}</em></span>
                  <span className="og-track"><span style={{ width: `${e?.percent ?? 0}%`, background: 'var(--f)' }} /></span>
                  <span className="og-skill-val">{e ? (e.nclc != null ? `NCLC ${e.nclc}` : e.cefr) : '—'}</span>
                </div>
              );
            })}
          </div>
        </section>
        <section className="og-card og-span-5">
          <div className="og-card-head"><span className="og-card-title">{tr('Open to this learner', 'Ouvert à cet apprenant')}</span>
            <span className="og-card-note">{o.access.active_items}</span></div>
          <div className="og-card-body is-flush">
            {o.access.items.length === 0 ? (
              <Empty icon={<SendOutlined />} title={tr('Nothing assigned yet', 'Rien d’attribué pour l’instant')} />
            ) : (
              <div className="og-list">
                {o.access.items.slice(0, 12).map(a => (
                  <div key={`${a.type}:${a.id}`} className={`og-row${a.active ? '' : ' is-off'}`} style={{ gridTemplateColumns: '1fr auto' }}>
                    <span className="og-cell-main"><strong>{a.name}</strong><em>{a.skill ? skillName(a.skill, lang) : ''}</em></span>
                    <span className="og-muted">{a.active ? tr(`until ${fmtDate(a.expires_at, locale)}`, `jusqu’au ${fmtDate(a.expires_at, locale)}`) : tr('ended', 'terminé')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
        <section className="og-card og-span-12">
          <div className="og-card-head"><span className="og-card-title">{tr('Results', 'Résultats')}</span><span className="og-card-note">{data.results.length}</span></div>
          <div className="og-card-body is-flush">
            {data.results.length === 0 ? (
              <Empty icon={<TrophyOutlined />} title={tr('No result yet', 'Aucun résultat pour l’instant')} text={tr('Results show here as soon as an exam is finished.', 'Les résultats apparaissent dès qu’un examen est terminé.')} />
            ) : (
              <div className="og-list">
                {data.results.map(r => (
                  <div key={`${r.skill}:${r.id}`} className={`og-row fam-${r.skill}`} style={{ gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr) 90px 110px' }}>
                    <span className="og-cell-main"><strong>{r.title || skillName(r.skill, lang)}</strong><em>{skillName(r.skill, lang)}{r.detail ? ` · ${r.detail}` : ''}</em></span>
                    <span className="og-num">{r.score == null ? '—' : `${r.score} / ${r.max}`}</span>
                    <span className="og-level" style={{ background: 'var(--f-bg)', color: 'var(--f)' }}>{r.nclc != null ? `NCLC ${r.nclc}` : r.cefr || '—'}</span>
                    <span className="og-muted">{fmtDate(r.at, locale)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <GiveCreditsModal learnerIds={give ? [l.id] : null} learners={learnerForModal} onClose={() => setGive(false)} onDone={() => { setGive(false); load(); }} />
      <EditLearnerModal open={edit} learner={l} groups={groups} onClose={() => setEdit(false)} onDone={() => { setEdit(false); load(); }} />
    </div>
  );
};

const EditLearnerModal: React.FC<{ open: boolean; learner: Detail['learner']; groups: Group[]; onClose: () => void; onDone: () => void }> = ({ open, learner, groups, onClose, onDone }) => {
  const { apiCall } = useAuth();
  const { tr } = useTr();
  const { message } = AntApp.useApp();
  const [first, setFirst] = useState(learner.first_name);
  const [last, setLast] = useState(learner.last_name);
  const [groupIds, setGroupIds] = useState<number[]>(learner.groups.map(g => g.id));
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (open) { setFirst(learner.first_name); setLast(learner.last_name); setGroupIds(learner.groups.map(g => g.id)); } }, [open, learner]);
  const submit = async () => {
    setBusy(true);
    try {
      await call(apiCall, `/org/learners/${learner.id}`, 'PUT', { first_name: first, last_name: last, group_ids: groupIds });
      message.success(tr('Saved', 'Enregistré'));
      onDone();
    } catch (e) { message.error(errorText(e, tr)); } finally { setBusy(false); }
  };
  return (
    <Modal open={open} onCancel={onClose} onOk={submit} okText={tr('Save', 'Enregistrer')} cancelText={tr('Cancel', 'Annuler')}
      okButtonProps={{ loading: busy, disabled: !first.trim() || !last.trim() }} title={tr('Edit learner', 'Modifier l’apprenant')} wrapClassName="og-modal is-company" width={480}>
      <div className="og-form">
        <div className="og-two">
          <div className="og-field"><label>{tr('First name', 'Prénom')}</label><Input value={first} onChange={e => setFirst(e.target.value)} maxLength={50} /></div>
          <div className="og-field"><label>{tr('Last name', 'Nom')}</label><Input value={last} onChange={e => setLast(e.target.value)} maxLength={50} /></div>
        </div>
        <div className="og-field"><label>{tr('Groups', 'Groupes')}</label>
          <Select mode="multiple" value={groupIds} onChange={setGroupIds} options={groups.map(g => ({ value: g.id, label: g.name }))} placeholder={tr('None', 'Aucun')} /></div>
        <small className="og-muted">{tr('The email cannot be changed here: it is the learner’s sign-in.', 'L’email ne peut pas être modifié ici : c’est l’identifiant de connexion.')}</small>
      </div>
    </Modal>
  );
};

export default OrgLearnerDetail;
