import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Checkbox, Input, Modal, Segmented, Select, Switch } from 'antd';
import {
  CheckOutlined, IdcardOutlined, LoadingOutlined, ReadOutlined, SearchOutlined, SolutionOutlined, TeamOutlined, UndoOutlined, UserDeleteOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../../contexts/AuthContext';
import { call } from '../../Org/orgModel';
import { useTr } from '../../../utils/useTr';
import {
  EXAM_LABEL, demoStatusLabel, emailError, regStatusLabel, sourceLabel, sourcesLabel,
  type Audience, type AudienceCounts, type EmailMeta, type Person, type PersonSource, type Source, type Tr,
} from './emailModel';

const SOURCES = (tr: Tr): { key: Source; name: string; icon: React.ReactNode; hint: string }[] => [
  { key: 'students', name: tr('Students', 'Élèves'), icon: <TeamOutlined />, hint: tr('People with a student account', 'Les comptes élèves') },
  { key: 'candidates', name: tr('Exam candidates', 'Candidats aux examens'), icon: <IdcardOutlined />, hint: tr('TCF preparation accounts', 'Les comptes de préparation TCF') },
  { key: 'demos', name: tr('Demo requests', 'Demandes de démo'), icon: <SolutionOutlined />, hint: tr('Classes and exam preparation', 'Cours et préparation aux examens') },
  { key: 'registrations', name: tr('Campaign registrations', 'Inscrits aux campagnes'), icon: <ReadOutlined />, hint: tr('People who registered on the site', 'Les inscrits du site') },
];

function sourceCount(meta: EmailMeta | null, key: Source, tr: Tr): string {
  if (!meta) return '…';
  const s = meta.sources;
  if (key === 'students') return tr(`${s.students.active} active${s.students.inactive ? ` · ${s.students.inactive} former` : ''}`, `${s.students.active} actifs${s.students.inactive ? ` · ${s.students.inactive} anciens` : ''}`);
  if (key === 'candidates') return `${s.candidates.active}`;
  if (key === 'demos') return s.demos.total === 1 ? tr('1 request', '1 demande') : tr(`${s.demos.total} requests`, `${s.demos.total} demandes`);
  return `${s.registrations.total}`;
}

export interface AudienceResult { counts: AudienceCounts; people: Person[] }

/* Who receives the email: the lists, their filters, the count and the people. */
const EmailAudience: React.FC<{
  meta: EmailMeta | null;
  audience: Audience;
  excluded: string[];
  onChange: (a: Audience) => void;
  onExcluded: (e: string[]) => void;
  onResult?: (r: AudienceResult | null) => void;
}> = ({ meta, audience: a, excluded, onChange, onExcluded, onResult }) => {
  const { apiCall } = useAuth();
  const { tr } = useTr();
  const [result, setResult] = useState<AudienceResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const [q, setQ] = useState('');
  const asked = useRef(0);

  const key = JSON.stringify(a);
  useEffect(() => {
    const ticket = ++asked.current;
    if (!a.sources.length) { setResult(null); onResult?.(null); return; }
    setBusy(true);
    const t = window.setTimeout(async () => {
      try {
        const r = await call<AudienceResult>(apiCall, '/admin/email-campaigns/audience', 'POST', { audience: a, excluded: [] });
        if (ticket !== asked.current) return;
        setResult(r);
        setErr(null);
      } catch (e) { if (ticket === asked.current) setErr(emailError(e, tr)); } finally { if (ticket === asked.current) setBusy(false); }
    }, 350);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiCall, key]);

  const removed = useMemo(() => new Set(excluded), [excluded]);
  const people = result?.people || [];
  const kept = people.filter(p => !removed.has(p.email));
  useEffect(() => {
    if (!result) { onResult?.(null); return; }
    const by = { student: 0, candidate: 0, registration: 0, demo: 0 };
    for (const p of kept) by[p.source]++;
    onResult?.({ counts: { ...result.counts, total: kept.length, by_source: by, excluded: people.length - kept.length }, people: kept });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, excluded]);

  const set = (patch: Partial<Audience>) => onChange({ ...a, ...patch });
  const toggle = (s: Source) => set({ sources: a.sources.includes(s) ? a.sources.filter(x => x !== s) : [...a.sources, s] });
  const ql = q.trim().toLowerCase();
  const shown = people.filter(p => !ql || `${p.email} ${p.name}`.toLowerCase().includes(ql));

  return (
    <div className="em-audience">
      <div className="em-sources">
        {SOURCES(tr).map(s => {
          const on = a.sources.includes(s.key);
          return (
            <button key={s.key} type="button" className={`og-kind em-source${on ? ' is-on' : ''}`} onClick={() => toggle(s.key)} aria-pressed={on}>
              <span className="og-kind-ic">{s.icon}</span>
              <span className="og-kind-text"><strong>{s.name}</strong><em>{sourceCount(meta, s.key, tr)} · {s.hint}</em></span>
              <span className="og-kind-tick"><CheckOutlined /></span>
            </button>
          );
        })}
      </div>

      {a.sources.includes('students') && (
        <div className="em-filter">
          <span className="em-filter-name"><TeamOutlined /> {tr('Students', 'Élèves')}</span>
          <Segmented size="small" value={a.students.state} onChange={v => set({ students: { ...a.students, state: v as Audience['students']['state'] } })}
            options={[{ value: 'active', label: tr('Active', 'Actifs') }, { value: 'inactive', label: tr('Former', 'Anciens') }, { value: 'all', label: tr('Both', 'Les deux') }]} />
          <Select mode="multiple" allowClear size="small" placeholder={tr('All groups', 'Tous les groupes')} value={a.students.batches} style={{ minWidth: 220, flex: 1 }}
            onChange={v => set({ students: { ...a.students, batches: v } })} optionFilterProp="label" maxTagCount="responsive"
            options={(meta?.batches || []).map(b => ({ value: b.id, label: `${b.name}${b.french_level ? ` · ${b.french_level}` : ''} (${b.students})` }))} />
        </div>
      )}
      {a.sources.includes('candidates') && (
        <div className="em-filter">
          <span className="em-filter-name"><IdcardOutlined /> {tr('Candidates', 'Candidats')}</span>
          <Checkbox.Group value={a.candidates.exams} onChange={v => set({ candidates: { exams: v as string[] } })}
            options={Object.entries(EXAM_LABEL).map(([value, label]) => ({ value, label }))} />
          <small className="og-muted">{tr('None ticked: every candidate.', 'Aucun coché : tous les candidats.')}</small>
        </div>
      )}
      {a.sources.includes('demos') && (
        <div className="em-filter">
          <span className="em-filter-name"><SolutionOutlined /> {tr('Demo requests', 'Demandes de démo')}</span>
          <Select size="small" value={a.demos.since_days ?? 0} style={{ width: 170 }} onChange={v => set({ demos: { ...a.demos, since_days: v || null } })}
            options={[{ value: 30, label: tr('Last 30 days', '30 derniers jours') }, { value: 90, label: tr('Last 3 months', '3 derniers mois') }, { value: 180, label: tr('Last 6 months', '6 derniers mois') }, { value: 365, label: tr('Last 12 months', '12 derniers mois') }, { value: 0, label: tr('Any time', 'Toutes') }]} />
          <Select mode="multiple" allowClear size="small" placeholder={tr('Any status', 'Tous les statuts')} value={a.demos.statuses} style={{ minWidth: 200, flex: 1 }}
            onChange={v => set({ demos: { ...a.demos, statuses: v } })} maxTagCount="responsive"
            options={['new', 'contacted', 'demo_scheduled', 'completed', 'cancelled'].map(value => ({ value, label: `${demoStatusLabel(value, tr)}${meta?.sources.demos.by_status[value] ? ` (${meta.sources.demos.by_status[value]})` : ''}` }))} />
          <Segmented size="small" value={a.demos.interest || 'any'} onChange={v => set({ demos: { ...a.demos, interest: v === 'any' ? null : v as 'exam' | 'general' } })}
            options={[{ value: 'any', label: tr('All requests', 'Toutes les demandes') }, { value: 'general', label: tr('Classes', 'Cours') }, { value: 'exam', label: tr('Exam only', 'Examen uniquement') }]} />
          <label className="mk-switch"><Switch size="small" checked={a.demos.exclude_students} onChange={v => set({ demos: { ...a.demos, exclude_students: v } })} />
            <span>{tr('Leave out those who became students', 'Sans ceux devenus élèves')}</span></label>
          {(a.demos.since_days === null || a.demos.since_days > 180) && (
            <small className="em-law">{tr('Canada’s anti-spam law: a request for information allows emails for 6 months. Beyond that, write only to people who agreed to receive your news.', 'Loi canadienne anti-pourriel : une demande d’information permet d’écrire pendant 6 mois. Au-delà, écrivez seulement aux personnes qui ont accepté vos nouvelles.')}</small>
          )}
        </div>
      )}
      {a.sources.includes('registrations') && (
        <div className="em-filter">
          <span className="em-filter-name"><ReadOutlined /> {tr('Registrations', 'Inscrits')}</span>
          <Select mode="multiple" allowClear size="small" placeholder={tr('Every campaign', 'Toutes les campagnes')} value={a.registrations.promotion_ids} style={{ minWidth: 220, flex: 1 }}
            onChange={v => set({ registrations: { ...a.registrations, promotion_ids: v } })} optionFilterProp="label" maxTagCount="responsive"
            options={(meta?.promotions || []).map(p => ({ value: p.id, label: p.title_en || p.title_fr || p.slug }))} />
          <Select mode="multiple" allowClear size="small" placeholder={tr('Any status', 'Tous les statuts')} value={a.registrations.statuses} style={{ minWidth: 180 }}
            onChange={v => set({ registrations: { ...a.registrations, statuses: v } })} maxTagCount="responsive"
            options={['new', 'contacted', 'confirmed', 'waitlist', 'cancelled'].map(value => ({ value, label: regStatusLabel(value, tr) }))} />
        </div>
      )}

      <div className={`em-count${a.sources.length ? '' : ' is-empty'}`} aria-live="polite">
        {!a.sources.length ? <span>{tr('Choose at least one list.', 'Choisissez au moins une liste.')}</span> : busy && !result ? <span><LoadingOutlined /> {tr('Counting…', 'Calcul…')}</span> : err ? <span className="og-text-bad">{err}</span> : result && (
          <>
            <span className="em-count-main">{busy ? <LoadingOutlined /> : null}<strong>{kept.length}</strong> {tr(kept.length === 1 ? 'person will receive it' : 'people will receive it', kept.length === 1 ? 'personne le recevra' : 'personnes le recevront')}</span>
            <span className="em-count-notes">
              {(Object.entries(result.counts.by_source) as [PersonSource, number][]).filter(([, n]) => n).map(([k, n]) => `${n} ${sourcesLabel(k, tr)}`).join(' · ')}
              {result.counts.duplicates > 0 && tr(` · ${result.counts.duplicates} duplicate ${result.counts.duplicates === 1 ? 'entry' : 'entries'} merged by email`, ` · ${result.counts.duplicates} ${result.counts.duplicates === 1 ? 'doublon fusionné' : 'doublons fusionnés'} par adresse email`)}
              {result.counts.suppressed > 0 && tr(` · ${result.counts.suppressed} unsubscribed, left out`, ` · ${result.counts.suppressed} désinscrits, écartés`)}
              {removed.size > 0 && tr(` · ${people.length - kept.length} removed by you`, ` · ${people.length - kept.length} retirés par vous`)}
              {result.counts.invalid > 0 && tr(` · ${result.counts.invalid} invalid addresses`, ` · ${result.counts.invalid} adresses invalides`)}
            </span>
            <Button size="small" onClick={() => setListOpen(true)} disabled={!people.length}>{tr('See the list', 'Voir la liste')}</Button>
          </>
        )}
      </div>

      <Modal open={listOpen} onCancel={() => setListOpen(false)} footer={<Button type="primary" onClick={() => setListOpen(false)}>{tr('Done', 'Terminé')}</Button>}
        title={tr(`${kept.length} of ${people.length} people will receive it`, `${kept.length} sur ${people.length} personnes le recevront`)} width={720} destroyOnHidden>
        <Input allowClear prefix={<SearchOutlined />} placeholder={tr('Search a name or an address', 'Rechercher un nom ou une adresse')} value={q} onChange={e => setQ(e.target.value)} style={{ marginBottom: 12 }} />
        <div className="em-people">
          {shown.slice(0, 500).map(p => {
            const out = removed.has(p.email);
            return (
              <div key={p.email} className={`em-person${out ? ' is-out' : ''}`}>
                <span className="og-cell-main"><strong>{p.name || p.email}</strong><em>{p.email} · {sourceLabel(p.source, tr)}{p.lang ? ` · ${p.lang.toUpperCase()}` : ''}</em></span>
                <Button size="small" type="text" icon={out ? <UndoOutlined /> : <UserDeleteOutlined />}
                  onClick={() => onExcluded(out ? excluded.filter(e => e !== p.email) : [...excluded, p.email])}>{out ? tr('Put back', 'Remettre') : tr('Remove', 'Retirer')}</Button>
              </div>
            );
          })}
          {shown.length > 500 && <p className="og-muted" style={{ padding: 10 }}>{tr(`${shown.length - 500} more: search to find someone.`, `${shown.length - 500} de plus : recherchez pour trouver quelqu’un.`)}</p>}
        </div>
      </Modal>
    </div>
  );
};

export default EmailAudience;
