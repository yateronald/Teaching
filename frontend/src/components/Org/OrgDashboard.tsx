import React, { useCallback, useEffect, useState } from 'react';
import { Button, Skeleton } from 'antd';
import {
  CalendarOutlined, FireOutlined, ReloadOutlined, RiseOutlined, SendOutlined, TeamOutlined, ThunderboltOutlined,
  UserAddOutlined, WarningOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTr } from '../../utils/useTr';
import { call, errorText, fmtDate, ago, skillName } from './orgModel';
import type { Dashboard } from './orgModel';
import { ChangeButton, Empty, Initials, Kpi, LogoTile, PageHeader, StatePill } from './OrgUi';
import './Org.css';

/* The company's home: people, activity, levels, credits and who needs a nudge. */
const OrgDashboard: React.FC = () => {
  const { apiCall, user } = useAuth();
  const { tr, lang, locale } = useTr();
  const navigate = useNavigate();
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try { setData(await call<Dashboard>(apiCall, '/org/dashboard')); }
    catch (e) { setError(errorText(e, tr)); }
  }, [apiCall, tr]);
  useEffect(() => { load(); }, [load]);

  if (error) {
    return <div className="og is-company"><Empty icon={<WarningOutlined />} title={tr('The dashboard could not be loaded', 'Le tableau de bord n’a pas pu être chargé')} text={error}
      action={<Button onClick={load} icon={<ReloadOutlined />}>{tr('Try again', 'Réessayer')}</Button>} /></div>;
  }
  if (!data) return <div className="og is-company"><Skeleton active paragraph={{ rows: 10 }} /></div>;

  const c = data.company;
  const seats = `${c.seats_used} / ${c.seat_limit}`;
  const maxWeek = Math.max(1, ...data.activity.weeks.map(w => w.attempts));
  const maxDist = Math.max(1, ...data.nclc_distribution.map(d => d.learners));
  const firstName = user?.first_name || '';

  return (
    <div className="og is-company">
      <PageHeader
        lead={<LogoTile name={c.brand.name} logoUrl={c.brand.logo_url} />}
        overline={tr('Company space', 'Espace entreprise')}
        title={tr(`Hello ${firstName}`, `Bonjour ${firstName}`)}
        subtitle={<>{c.brand.name} · <StatePill company={c} /> · {tr('access until', 'accès jusqu’au')} {fmtDate(c.access_ends_at, locale)}</>}
        actions={<>
          <ChangeButton icon={<UserAddOutlined />} onClick={() => navigate('/app/org/learners?add=1')}>{tr('Add learners', 'Ajouter des apprenants')}</ChangeButton>
          <ChangeButton icon={<ThunderboltOutlined />} onClick={() => navigate('/app/org/credits')}>{tr('Give credits', 'Donner des crédits')}</ChangeButton>
          <ChangeButton type="primary" icon={<SendOutlined />} onClick={() => navigate('/app/org/assignments?new=1')}>{tr('Assign exams', 'Attribuer des examens')}</ChangeButton>
        </>}
      />

      <div className="og-kpis">
        <Kpi icon={<TeamOutlined />} label={tr('Learner accounts (package)', 'Comptes apprenants (forfait)')} value={seats} warn={c.seats_left === 0}
          note={c.seats_left === 0 ? tr('Package full: contact the administrator', 'Forfait complet : contactez l’administrateur')
            : tr(`${c.seats_left} left · ${data.learners.active} active`, `${c.seats_left} restant(s) · ${data.learners.active} actif(s)`)} />
        <Kpi icon={<FireOutlined />} label={tr('Practised this month', 'Actifs ce mois-ci')} value={data.learners.practised_30_days}
          note={tr(`${data.activity.attempts_30_days} exams in 30 days`, `${data.activity.attempts_30_days} examens en 30 jours`)} />
        <Kpi icon={<ThunderboltOutlined />} label={tr('Credits in reserve', 'Crédits en réserve')}
          value={<>{c.credits.ee.reserve}<small>EE</small> · {c.credits.eo.reserve}<small>EO</small></>}
          note={tr('To hand out to your learners', 'À distribuer à vos apprenants')} />
        <Kpi icon={<CalendarOutlined />} label={tr('Access', 'Accès')} warn={c.expiring_soon || c.state !== 'active'}
          value={c.state === 'active' ? tr(`${c.days_left} days`, `${c.days_left} jours`) : <StatePill company={c} />}
          note={tr(`until ${fmtDate(c.access_ends_at, locale)}`, `jusqu’au ${fmtDate(c.access_ends_at, locale)}`)} />
      </div>

      <div className="og-grid">
        <section className="og-card og-span-7">
          <div className="og-card-head">
            <span className="og-card-title"><RiseOutlined />{tr('Activity', 'Activité')}</span>
            <span className="og-card-note">{tr('Exams completed per week', 'Examens terminés par semaine')}</span>
          </div>
          <div className="og-card-body">
            <div className="og-weeks" role="img" aria-label={tr('Exams completed per week over 8 weeks', 'Examens terminés par semaine sur 8 semaines')}>
              {data.activity.weeks.map(w => (
                <div key={w.week_start} className="og-week">
                  <b>{w.attempts || ''}</b>
                  <span className={`og-week-bar${w.attempts ? '' : ' is-empty'}`} style={{ height: `${Math.max(3, (w.attempts / maxWeek) * 100)}%` }} />
                  <em>{fmtDate(w.week_start, locale, false)}</em>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="og-card og-span-5">
          <div className="og-card-head">
            <span className="og-card-title">{tr('Average level by skill', 'Niveau moyen par compétence')}</span>
          </div>
          <div className="og-card-body og-skills">
            {data.skills.map(s => (
              <div key={s.skill} className={`og-skill fam-${s.skill}`}>
                <span className="og-skill-name">{skillName(s.skill, lang)}<em>{tr(`${s.learners_measured} measured`, `${s.learners_measured} évalué(s)`)}</em></span>
                <span className="og-track"><span style={{ width: `${s.average_percent ?? 0}%`, background: 'var(--f)' }} /></span>
                <span className="og-skill-val">{s.average_percent == null ? '—' : `${s.average_percent}%`}</span>
              </div>
            ))}
            <small className="og-muted">{tr('Estimated from each learner’s three latest results.', 'Estimé à partir des trois derniers résultats de chaque apprenant.')}</small>
          </div>
        </section>

        <section className="og-card og-span-5">
          <div className="og-card-head">
            <span className="og-card-title">{tr('Learners by NCLC level', 'Apprenants par niveau NCLC')}</span>
            <span className="og-card-note">{tr('weakest skill', 'compétence la plus faible')}</span>
          </div>
          <div className="og-card-body">
            <div className="og-dist">
              {data.nclc_distribution.map(d => (
                <div key={d.nclc}>
                  <b>{d.learners || ''}</b>
                  <i className={d.learners ? 'is-on' : ''} style={{ height: `${Math.max(3, (d.learners / maxDist) * 100)}%` }} />
                  <em>{d.nclc}</em>
                </div>
              ))}
            </div>
            <small className="og-muted">{tr('A level shows once a learner has results in all four skills.', 'Un niveau apparaît quand l’apprenant a des résultats dans les quatre compétences.')}</small>
          </div>
        </section>

        <section className="og-card og-span-7">
          <div className="og-card-head">
            <span className="og-card-title"><WarningOutlined />{tr('Need a nudge', 'À relancer')}</span>
            <span className="og-card-note">{tr(`No practice for ${data.inactive_days} days`, `Aucun entraînement depuis ${data.inactive_days} jours`)} · {data.inactive_count}</span>
          </div>
          <div className="og-card-body is-flush">
            {data.inactive.length === 0 ? (
              <Empty icon={<FireOutlined />} title={tr('Everyone is practising', 'Tout le monde s’entraîne')} text={tr('No active learner has been idle for two weeks.', 'Aucun apprenant actif n’est inactif depuis deux semaines.')} />
            ) : (
              <div className="og-people">
                {data.inactive.map(p => (
                  <div key={p.id} className="og-person" role="button" tabIndex={0} onClick={() => navigate(`/app/org/learners/${p.id}`)}
                    onKeyDown={e => { if (e.key === 'Enter') navigate(`/app/org/learners/${p.id}`); }}>
                    <Initials first={p.first_name} last={p.last_name} />
                    <span className="og-cell-main"><strong>{p.first_name} {p.last_name}</strong>
                      <em>{p.last_practice_at ? tr(`Last practice ${ago(p.last_practice_at, tr)}`, `Dernier entraînement ${ago(p.last_practice_at, tr)}`) : tr('Has not practised yet', 'Ne s’est pas encore entraîné')}</em></span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {data.learners.total === 0 && (
        <section className="og-card">
          <Empty icon={<TeamOutlined />} title={tr('Add your first learners', 'Ajoutez vos premiers apprenants')}
            text={tr('Each learner receives an email with a temporary password and signs in on your company’s page.', 'Chaque apprenant reçoit un email avec un mot de passe provisoire et se connecte sur la page de votre entreprise.')}
            action={<ChangeButton type="primary" icon={<UserAddOutlined />} onClick={() => navigate('/app/org/learners?add=1')}>{tr('Add learners', 'Ajouter des apprenants')}</ChangeButton>} />
        </section>
      )}
    </div>
  );
};

export default OrgDashboard;
