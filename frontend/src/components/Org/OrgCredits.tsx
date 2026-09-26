import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { App as AntApp, Button, Checkbox, Segmented, Select, Skeleton } from 'antd';
import { RollbackOutlined, TeamOutlined, ThunderboltOutlined, UserOutlined, WarningOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTr } from '../../utils/useTr';
import { call, chosenAmounts, creditName, errorText, fmtDate, kindsText, moveText, personName } from './orgModel';
import type { CreditMove, CreditPot, CreditType, Group, Learner } from './orgModel';
import { ChangeButton, Empty, PageHeader } from './OrgUi';
import { AmountBoxes, CreditReceipt, KindPicker } from './CreditControls';
import type { Amounts, ReceiptLine } from './CreditControls';
import './Org.css';

interface CreditsData { credits: { ee: CreditPot; eo: CreditPot }; items: CreditMove[] }
type Kinds = Partial<Record<CreditType, number>>;

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
  const [kinds, setKinds] = useState<CreditType[]>(['ee', 'eo']);
  const [target, setTarget] = useState<'learners' | 'groups'>('learners');
  const [learnerIds, setLearnerIds] = useState<number[]>([]);
  const [groupIds, setGroupIds] = useState<number[]>([]);
  // Groups only: "each" = the amount is per learner; "split" = a total shared evenly.
  const [share, setShare] = useState<'each' | 'split'>('each');
  const [amounts, setAmounts] = useState<Amounts>({ ee: 1, eo: 1 });
  const [allBack, setAllBack] = useState(true);
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
  const held = (l: Learner, t: CreditType) => (t === 'ee' ? l.ee_credits : l.eo_credits);
  // Who the action reaches: the chosen learners, or every active member of the chosen groups.
  const reachedIds = useMemo(() => {
    if (target === 'learners') return learnerIds;
    const ids = new Set<number>();
    groups.filter(g => groupIds.includes(g.id)).forEach(g => g.member_ids.forEach(id => { if (active.some(a => a.id === id)) ids.add(id); }));
    return [...ids];
  }, [target, learnerIds, groupIds, groups, active]);
  const n = reachedIds.length;
  const split = mode === 'give' && target === 'groups' && share === 'split';

  const lines = useMemo(() => {
    if (!data) return [];
    return kinds.map(t => {
      const amount = amounts[t] || 0;
      const reserve = data.credits[t].reserve;
      const each = split ? (n ? Math.floor(amount / n) : 0) : amount;
      const total = each * n;
      return { t, amount, reserve, each, total, kept: split ? amount - total : 0, splittable: !split || each >= 1, enough: total <= reserve };
    });
  }, [data, kinds, amounts, split, n]);
  const holding = useMemo(() => {
    const out: Kinds = {};
    for (const t of kinds) out[t] = learners.filter(l => reachedIds.includes(l.id)).reduce((s, l) => s + held(l, t), 0);
    return out;
  }, [learners, reachedIds, kinds]);

  const giveReady = n > 0 && lines.length > 0 && lines.every(l => l.amount > 0 && l.splittable && l.enough);
  const backReady = n > 0 && (allBack || kinds.every(t => (amounts[t] || 0) > 0));

  const reset = () => { setLearnerIds([]); setGroupIds([]); setErr(null); };
  const submit = async () => {
    setBusy(true); setErr(null);
    const recipients = target === 'learners' ? { learner_ids: learnerIds } : { group_ids: groupIds };
    try {
      if (mode === 'give') {
        const r = await call<{ given: number; each: Kinds; kept_in_reserve: Kinds }>(apiCall, '/org/credits/distribute', 'POST',
          { amounts: chosenAmounts(kinds, amounts), mode: split ? 'split' : 'each', ...recipients });
        const kept = kindsText(r.kept_in_reserve, ', ');
        message.success(tr(`Handed out to ${r.given} learner(s): ${kindsText(r.each)} each${kept ? ` · ${kept} kept in the reserve` : ''}`,
          `Distribué à ${r.given} apprenant(s) : ${kindsText(r.each)} chacun${kept ? ` · ${kept} gardé(s) dans la réserve` : ''}`));
      } else {
        const back = Object.fromEntries(kinds.map(t => [t, allBack ? 'all' : amounts[t]]));
        const r = await call<{ returned: Kinds; total: number }>(apiCall, '/org/credits/reclaim', 'POST', { amounts: back, ...recipients });
        if (r.total) message.success(tr(`${kindsText(r.returned)} back in the reserve`, `${kindsText(r.returned)} rendu(s) à la réserve`));
        else message.info(tr('These learners had no credit of this kind to take back.', 'Ces apprenants n’avaient aucun crédit de ce type à récupérer.'));
      }
      reset();
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

  const learnerOptions = (mode === 'give' ? active : learners.filter(l => kinds.some(t => held(l, t) > 0))).map(l => ({
    value: l.id,
    label: `${personName(l)} · EE ${l.ee_credits} · EO ${l.eo_credits}`,
    search: `${personName(l)} ${l.email}`.toLowerCase(),
  }));

  const giveLines: ReceiptLine[] = lines.map(l => ({
    kind: l.t,
    ok: l.splittable && l.enough && l.amount > 0,
    what: split
      ? tr(`${l.amount} shared between ${n} → ${l.each} each`, `${l.amount} répartis entre ${n} → ${l.each} chacun`)
      : tr(`${n} learner(s) × ${l.each}`, `${n} apprenant(s) × ${l.each}`),
    detail: !l.splittable
      ? tr(`Give at least ${n} to share between ${n} learners`, `Donnez-en au moins ${n} pour ${n} apprenants`)
      : !l.enough
        ? tr(`Reserve ${l.reserve} · ${l.total - l.reserve} missing`, `Réserve ${l.reserve} · il en manque ${l.total - l.reserve}`)
        : tr(`Reserve ${l.reserve} → ${l.reserve - l.total}${l.kept ? ` · ${l.kept} kept (not divisible)` : ''}`,
          `Réserve ${l.reserve} → ${l.reserve - l.total}${l.kept ? ` · ${l.kept} gardé(s) (non divisible)` : ''}`),
    total: `−${l.total}`,
  }));

  return (
    <div className="og is-company">
      <PageHeader overline={tr('Company space', 'Espace entreprise')} title={tr('Credits', 'Crédits')}
        subtitle={tr('Writing and speaking exams are corrected by AI: each one uses a credit. Hand out credits from your reserve; you can never give more than it holds. To get more, contact the administrator.',
          'Les examens d’expression écrite et orale sont corrigés par l’IA : chacun utilise un crédit. Distribuez des crédits depuis votre réserve ; vous ne pouvez jamais en donner plus qu’elle n’en contient. Pour en obtenir davantage, contactez l’administrateur.')} />

      <div className="og-pots">{pot('ee')}{pot('eo')}</div>

      <div className="og-grid">
        <section className="og-card og-span-6">
          <div className="og-card-head">
            <span className="og-card-title">{mode === 'give' ? <ThunderboltOutlined /> : <RollbackOutlined />}{mode === 'give' ? tr('Hand out credits', 'Distribuer des crédits') : tr('Take credits back', 'Récupérer des crédits')}</span>
            <Segmented size="small" value={mode} onChange={v => { setMode(v as 'give' | 'back'); setErr(null); }} options={[
              { value: 'give', label: tr('Hand out', 'Distribuer') }, { value: 'back', label: tr('Take back', 'Récupérer') },
            ]} />
          </div>
          <div className="og-card-body og-form">
            <div className="og-field"><label><span className="og-step-n">1</span>{tr('Which credits', 'Quels crédits')} <em>{tr('one or both', 'l’un ou les deux')}</em></label>
              <KindPicker value={kinds} onChange={setKinds} lang={lang}
                note={t => mode === 'give' ? tr(`${data.credits[t].reserve} in reserve`, `${data.credits[t].reserve} en réserve`) : tr(`${data.credits[t].with_learners} with learners`, `${data.credits[t].with_learners} chez les apprenants`)} /></div>

            <div className="og-field"><label><span className="og-step-n">2</span>{tr('Who', 'À qui')}</label>
              {groups.length > 0 && (
                <Segmented block value={target} onChange={v => { setTarget(v as 'learners' | 'groups'); setErr(null); }} options={[
                  { value: 'learners', label: <><UserOutlined /> {tr('Learners', 'Apprenants')}</> },
                  { value: 'groups', label: <><TeamOutlined /> {tr('Groups', 'Groupes')}</> },
                ]} />
              )}
              {target === 'learners' ? (
                <Select mode="multiple" value={learnerIds} onChange={setLearnerIds} showSearch optionFilterProp="search" allowClear maxTagCount="responsive"
                  placeholder={tr('Search by name or email', 'Rechercher par nom ou email')} options={learnerOptions} />
              ) : (
                <Select mode="multiple" value={groupIds} onChange={setGroupIds} allowClear maxTagCount="responsive" placeholder={tr('Choose groups', 'Choisissez des groupes')}
                  options={groups.map(g => ({ value: g.id, label: `${g.name} (${g.member_count})` }))} />
              )}
              {target === 'groups' && groupIds.length > 0 && <small>{tr(`${n} active learner(s) in these groups`, `${n} apprenant(s) actif(s) dans ces groupes`)}</small>}
            </div>

            {mode === 'give' ? (
              <>
                {target === 'groups' && (
                  <div className="og-field"><label>{tr('How to count', 'Comment compter')}</label>
                    <Segmented block value={share} onChange={v => setShare(v as 'each' | 'split')} options={[
                      { value: 'each', label: tr('Per learner', 'Par apprenant') }, { value: 'split', label: tr('Total to share', 'Total à répartir') },
                    ]} />
                    <small>{share === 'each'
                      ? tr('Each member receives the amount (5 learners × 3 = 15 credits).', 'Chaque membre reçoit le nombre indiqué (5 apprenants × 3 = 15 crédits).')
                      : tr('The total is shared evenly (15 credits ÷ 5 learners = 3 each). What cannot be shared evenly stays in the reserve.', 'Le total est partagé à parts égales (15 crédits ÷ 5 apprenants = 3 chacun). Ce qui ne se partage pas reste dans la réserve.')}</small></div>
                )}
                <div className="og-field"><label><span className="og-step-n">3</span>{split ? tr('Total to share', 'Total à répartir') : tr('Credits per learner', 'Crédits par apprenant')}</label>
                  <AmountBoxes kinds={kinds} values={amounts} onChange={setAmounts} label={t => creditName(t, lang)} /></div>
                {n > 0 && <CreditReceipt lines={giveLines} foot={tr('One credit = one AI-corrected exam. Nothing moves unless every line is ready.', 'Un crédit = un examen corrigé par l’IA. Rien ne bouge tant que toutes les lignes ne sont pas prêtes.')} />}
              </>
            ) : (
              <>
                <div className="og-field"><label><span className="og-step-n">3</span>{tr('How much', 'Combien')}</label>
                  <Checkbox checked={allBack} onChange={e => setAllBack(e.target.checked)}>{tr('Everything they have not used', 'Tout ce qu’ils n’ont pas utilisé')}</Checkbox></div>
                {!allBack && <AmountBoxes kinds={kinds} values={amounts} onChange={setAmounts} max={1000} label={t => tr(`${creditName(t, lang)}, at most per learner`, `${creditName(t, lang)}, au plus par apprenant`)} />}
                {n > 0 && (
                  <CreditReceipt lines={kinds.map(t => ({
                    kind: t, ok: true,
                    what: tr(`${n} learner(s) hold ${holding[t] || 0}`, `${n} apprenant(s) en détiennent ${holding[t] || 0}`),
                    detail: allBack ? tr('Everything comes back to the reserve', 'Tout revient dans la réserve') : tr(`At most ${amounts[t] || 0} from each`, `Au plus ${amounts[t] || 0} chacun`),
                    total: `+${allBack ? holding[t] || 0 : Math.min(holding[t] || 0, (amounts[t] || 0) * n)}`,
                  }))} />
                )}
              </>
            )}
            {err && <div className="og-check tone-bad"><WarningOutlined /><span>{err}</span></div>}
            <ChangeButton type="primary" size="large" block onClick={submit} loading={busy} disabled={mode === 'give' ? !giveReady : !backReady}>
              {mode === 'give'
                ? (giveReady ? tr(`Hand out ${kindsText(Object.fromEntries(lines.map(l => [l.t, l.total])))}`, `Distribuer ${kindsText(Object.fromEntries(lines.map(l => [l.t, l.total])))}`) : tr('Hand out', 'Distribuer'))
                : tr('Take back', 'Récupérer')}
            </ChangeButton>
          </div>
        </section>

        <section className="og-card og-span-6">
          <div className="og-card-head"><span className="og-card-title">{tr('History', 'Historique')}</span><span className="og-card-note">{data.items.length}</span></div>
          <div className="og-card-body is-flush">
            {data.items.length === 0 ? <Empty icon={<ThunderboltOutlined />} title={tr('No movement yet', 'Aucun mouvement pour l’instant')} /> : (
              <div className="og-list" style={{ maxHeight: 640, overflowY: 'auto' }}>
                {data.items.map(m => (
                  <div key={m.id} className={`og-row is-move fam-${m.credit_type}`}>
                    <span className="og-muted">{fmtDate(m.created_at, locale)}</span>
                    <span className="og-cell-main"><strong>{moveText(m, tr)}</strong><em>{m.actor_first_name ? personName({ first_name: m.actor_first_name, last_name: m.actor_last_name }) : tr('Automatic', 'Automatique')}{m.notes ? ` · ${m.notes}` : ''}</em></span>
                    <span className="og-code og-hide-sm">{m.credit_type.toUpperCase()}</span>
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
