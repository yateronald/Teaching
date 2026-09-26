import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { App as AntApp, Button, Checkbox, InputNumber, Segmented, Select, Skeleton } from 'antd';
import { CheckCircleOutlined, RollbackOutlined, ThunderboltOutlined, WarningOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTr } from '../../utils/useTr';
import { call, creditName, errorText, fmtDate, moveText, personName } from './orgModel';
import type { CreditMove, CreditPot, CreditType, Group, Learner } from './orgModel';
import { ChangeButton, Empty, PageHeader } from './OrgUi';
import './Org.css';

interface CreditsData { credits: { ee: CreditPot; eo: CreditPot }; items: CreditMove[] }

/* The company's credits: reserve, what learners hold and spent, hand out, take back. */
const OrgCredits: React.FC = () => {
  const { apiCall } = useAuth();
  const { tr, lang, locale } = useTr();
  const { message } = AntApp.useApp();
  const [data, setData] = useState<CreditsData | null>(null);
  const [learners, setLearners] = useState<Learner[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<'give' | 'back'>('give');
  const [type, setType] = useState<CreditType>('eo');
  const [amount, setAmount] = useState<number | null>(1);
  // "each": the amount is per learner; "split": the amount is a total shared evenly.
  const [share, setShare] = useState<'each' | 'split'>('each');
  const [allBack, setAllBack] = useState(true);
  const [learnerIds, setLearnerIds] = useState<number[]>([]);
  const [groupIds, setGroupIds] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [c, l, g] = await Promise.all([call<CreditsData>(apiCall, '/org/credits?limit=200'), call<Learner[]>(apiCall, '/org/learners'), call<Group[]>(apiCall, '/org/groups')]);
      setData(c); setLearners(l); setGroups(g);
    } catch (e) { setError(errorText(e, tr)); }
  }, [apiCall, tr]);
  useEffect(() => { load(); }, [load]);

  const active = useMemo(() => learners.filter(l => l.is_active), [learners]);
  const reached = useMemo(() => {
    const set = new Set(learnerIds);
    if (mode === 'give') groups.filter(g => groupIds.includes(g.id)).forEach(g => g.member_ids.forEach(id => { if (active.some(a => a.id === id)) set.add(id); }));
    return set.size;
  }, [learnerIds, groupIds, groups, active, mode]);
  const reserve = data ? data.credits[type].reserve : 0;
  const each = share === 'split' ? (reached ? Math.floor((amount || 0) / reached) : 0) : (amount || 0);
  const total = each * reached;
  const kept = share === 'split' ? (amount || 0) - total : 0;
  const enough = total <= reserve;
  const splittable = share === 'each' || each >= 1;
  const holding = useMemo(() => learners.filter(l => learnerIds.includes(l.id)).reduce((t, l) => t + (type === 'ee' ? l.ee_credits : l.eo_credits), 0), [learners, learnerIds, type]);

  const submit = async () => {
    setBusy(true); setErr(null);
    try {
      if (mode === 'give') {
        const r = await call<{ given: number; each: number; kept_in_reserve: number }>(apiCall, '/org/credits/distribute', 'POST', { type, mode: share, amount, learner_ids: learnerIds, group_ids: groupIds });
        message.success(tr(`${r.given * r.each} credit(s) handed out: ${r.each} to each of ${r.given} learner(s)${r.kept_in_reserve ? ` · ${r.kept_in_reserve} kept in the reserve` : ''}`,
          `${r.given * r.each} crédit(s) distribué(s) : ${r.each} à chacun des ${r.given} apprenant(s)${r.kept_in_reserve ? ` · ${r.kept_in_reserve} gardé(s) dans la réserve` : ''}`));
      } else {
        const r = await call<{ returned: number }>(apiCall, '/org/credits/reclaim', 'POST', { type, amount: allBack ? 'all' : amount, learner_ids: learnerIds });
        message.success(tr(`${r.returned} credit(s) back in the reserve`, `${r.returned} crédit(s) rendu(s) à la réserve`));
      }
      setLearnerIds([]); setGroupIds([]);
      load();
    } catch (e) { setErr(errorText(e, tr)); } finally { setBusy(false); }
  };

  if (error) return <div className="og is-company"><Empty icon={<WarningOutlined />} title={tr('Credits could not be loaded', 'Les crédits n’ont pas pu être chargés')} text={error} action={<Button onClick={load}>{tr('Try again', 'Réessayer')}</Button>} /></div>;
  if (!data) return <div className="og is-company"><Skeleton active paragraph={{ rows: 10 }} /></div>;

  const pot = (t: CreditType) => {
    const p = data.credits[t];
    const all = Math.max(1, p.reserve + p.with_learners + p.used);
    return (
      <div key={t} className={`og-pot fam-${t}`}>
        <div className="og-pot-head"><strong>{creditName(t, lang)} ({t.toUpperCase()})</strong><span className="og-muted">{tr(`${p.granted} granted`, `${p.granted} accordés`)}</span></div>
        <div className="og-pot-big">{p.reserve}<small>{tr('in reserve', 'en réserve')}</small></div>
        <div className="og-pot-split" aria-hidden>
          <span className="is-reserve" style={{ width: `${(p.reserve / all) * 100}%` }} />
          <span className="is-held" style={{ width: `${(p.with_learners / all) * 100}%` }} />
          <span className="is-used" style={{ width: `${(p.used / all) * 100}%` }} />
        </div>
        <div className="og-pot-legend">
          <span><i style={{ background: 'var(--f)' }} />{tr('Reserve', 'Réserve')} {p.reserve}</span>
          <span><i style={{ background: 'color-mix(in srgb, var(--f) 45%, #fff)' }} />{tr('With learners', 'Chez les apprenants')} {p.with_learners}</span>
          <span><i style={{ background: '#cbd5e1' }} />{tr('Used', 'Utilisés')} {p.used}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="og is-company">
      <PageHeader overline={tr('Company space', 'Espace entreprise')} title={tr('Credits', 'Crédits')}
        subtitle={tr('Writing and speaking exams are corrected by AI: each one uses a credit. Hand out credits from your reserve; you can never give more than it holds. To get more, contact the administrator.',
          'Les examens d’expression écrite et orale sont corrigés par l’IA : chacun utilise un crédit. Distribuez des crédits depuis votre réserve ; vous ne pouvez jamais en donner plus qu’elle n’en contient. Pour en obtenir davantage, contactez l’administrateur.')} />

      <div className="og-pots">{pot('ee')}{pot('eo')}</div>

      <div className="og-grid">
        <section className="og-card og-span-5">
          <div className="og-card-head"><span className="og-card-title"><ThunderboltOutlined />{mode === 'give' ? tr('Hand out credits', 'Distribuer des crédits') : tr('Take credits back', 'Récupérer des crédits')}</span></div>
          <div className="og-card-body og-form">
            <Segmented block value={mode} onChange={v => { setMode(v as 'give' | 'back'); setErr(null); }} options={[
              { value: 'give', label: tr('Hand out', 'Distribuer') }, { value: 'back', label: tr('Take back', 'Récupérer') },
            ]} />
            <div className="og-field"><label>{tr('Kind', 'Type')}</label>
              <Segmented block value={type} onChange={v => setType(v as CreditType)} options={[
                { value: 'eo', label: `EO · ${data.credits.eo.reserve}` }, { value: 'ee', label: `EE · ${data.credits.ee.reserve}` },
              ]} /></div>
            <div className="og-field"><label>{tr('Learners', 'Apprenants')}</label>
              <Select mode="multiple" value={learnerIds} onChange={setLearnerIds} showSearch optionFilterProp="search" allowClear maxTagCount="responsive"
                placeholder={tr('Search by name or email', 'Rechercher par nom ou email')}
                options={(mode === 'give' ? active : learners.filter(l => (type === 'ee' ? l.ee_credits : l.eo_credits) > 0)).map(l => ({
                  value: l.id, label: `${personName(l)} · ${type === 'ee' ? l.ee_credits : l.eo_credits}`, search: `${personName(l)} ${l.email}`.toLowerCase(),
                }))} /></div>
            {mode === 'give' && groups.length > 0 && (
              <div className="og-field"><label>{tr('Groups', 'Groupes')}</label>
                <Select mode="multiple" value={groupIds} onChange={setGroupIds} allowClear maxTagCount="responsive" placeholder={tr('Every active member', 'Tous les membres actifs')}
                  options={groups.map(g => ({ value: g.id, label: `${g.name} (${g.member_count})` }))} /></div>
            )}
            {mode === 'give' ? (
              <>
                <div className="og-field"><label>{tr('How to count', 'Comment compter')}</label>
                  <Segmented block value={share} onChange={v => setShare(v as 'each' | 'split')} options={[
                    { value: 'each', label: tr('Per learner', 'Par apprenant') }, { value: 'split', label: tr('Total to share', 'Total à répartir') },
                  ]} />
                  <small>{share === 'each'
                    ? tr('Each learner receives this amount (5 learners × 3 = 15 credits).', 'Chaque apprenant reçoit ce nombre (5 apprenants × 3 = 15 crédits).')
                    : tr('This total is shared evenly (15 credits ÷ 5 learners = 3 each). What cannot be shared evenly stays in the reserve.', 'Ce total est partagé à parts égales (15 crédits ÷ 5 apprenants = 3 chacun). Ce qui ne se partage pas reste dans la réserve.')}</small></div>
                <div className="og-field"><label>{share === 'each' ? tr('Credits per learner', 'Crédits par apprenant') : tr('Total credits to share', 'Total de crédits à répartir')}</label>
                  <InputNumber min={1} max={100000} value={amount} onChange={v => setAmount(v)} style={{ width: '100%' }} /></div>
                {reached > 0 && (
                  <div className={`og-check ${enough && splittable ? 'tone-ok' : 'tone-bad'}`}>{enough && splittable ? <CheckCircleOutlined /> : <WarningOutlined />}
                    <span>{!splittable
                      ? tr(`${amount || 0} credit(s) cannot be shared between ${reached} learners: give at least ${reached}.`, `${amount || 0} crédit(s) ne peuvent pas être partagés entre ${reached} apprenants : donnez-en au moins ${reached}.`)
                      : <>{tr(`${reached} learner(s) × ${each} = ${total} credit(s) · reserve ${reserve}`, `${reached} apprenant(s) × ${each} = ${total} crédit(s) · réserve ${reserve}`)}
                        {kept > 0 && ` · ${tr(`${kept} kept in the reserve`, `${kept} gardé(s) dans la réserve`)}`}
                        {!enough && ` · ${tr(`${total - reserve} missing`, `il en manque ${total - reserve}`)}`}</>}</span></div>
                )}
              </>
            ) : (
              <>
                <Checkbox checked={allBack} onChange={e => setAllBack(e.target.checked)}>{tr('Everything they have not used', 'Tout ce qu’ils n’ont pas utilisé')}</Checkbox>
                {!allBack && <div className="og-field"><label>{tr('At most, per learner', 'Au plus, par apprenant')}</label>
                  <InputNumber min={1} max={1000} value={amount} onChange={v => setAmount(v)} style={{ width: '100%' }} /></div>}
                {learnerIds.length > 0 && <div className="og-check tone-soon"><RollbackOutlined /><span>{tr(`They hold ${holding} credit(s) of this kind.`, `Ils détiennent ${holding} crédit(s) de ce type.`)}</span></div>}
              </>
            )}
            {err && <div className="og-check tone-bad"><WarningOutlined /><span>{err}</span></div>}
            <ChangeButton type="primary" block onClick={submit} loading={busy}
              disabled={!reached || (mode === 'give' ? !amount || !enough || !splittable : !allBack && !amount)}>
              {mode === 'give' ? tr('Hand out', 'Distribuer') : tr('Take back', 'Récupérer')}
            </ChangeButton>
          </div>
        </section>

        <section className="og-card og-span-7">
          <div className="og-card-head"><span className="og-card-title">{tr('History', 'Historique')}</span><span className="og-card-note">{data.items.length}</span></div>
          <div className="og-card-body is-flush">
            {data.items.length === 0 ? <Empty icon={<ThunderboltOutlined />} title={tr('No movement yet', 'Aucun mouvement pour l’instant')} /> : (
              <div className="og-list" style={{ maxHeight: 520, overflowY: 'auto' }}>
                {data.items.map(m => (
                  <div key={m.id} className={`og-row is-move fam-${m.credit_type}`}>
                    <span className="og-muted">{fmtDate(m.created_at, locale)}</span>
                    <span className="og-cell-main"><strong>{moveText(m, tr)}</strong><em>{m.actor_first_name ? personName({ first_name: m.actor_first_name, last_name: m.actor_last_name }) : tr('Automatic', 'Automatique')}{m.notes ? ` · ${m.notes}` : ''}</em></span>
                    <span className="og-tag og-hide-sm" style={{ background: 'var(--f-bg)', color: 'var(--f)' }}>{m.credit_type.toUpperCase()}</span>
                    <span className="og-num" style={{ textAlign: 'right', color: m.delta >= 0 ? '#047857' : '#b91c1c' }}>{m.delta > 0 ? `+${m.delta}` : m.delta}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default OrgCredits;
