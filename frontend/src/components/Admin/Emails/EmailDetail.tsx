import React, { useCallback, useEffect, useState } from 'react';
import { App as AntApp, Button, DatePicker, Drawer, Dropdown, Input, Modal, Progress, Segmented, Select, Skeleton, Tabs, Tooltip } from 'antd';
import {
  ArrowLeftOutlined, CalendarOutlined, CheckCircleOutlined, CopyOutlined, DeleteOutlined, DownloadOutlined, EditOutlined, ExperimentOutlined, EyeOutlined,
  FormOutlined, MailOutlined, MoreOutlined, PauseCircleOutlined, PlayCircleOutlined, RedoOutlined, SearchOutlined, SendOutlined, StopOutlined,
  TeamOutlined, ThunderboltOutlined, UserDeleteOutlined, WarningOutlined, WhatsAppOutlined,
} from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { call } from '../../Org/orgModel';
import { Empty, Kpi } from '../../Org/OrgUi';
import { useTr } from '../../../utils/useTr';
import EmailEditor from './EmailEditor';
import EmailPreview from './EmailPreview';
import { EmailStatusChip } from './EmailCampaigns';
import { SenderDetails } from './EmailSettings';
import {
  counted, emailError, fieldsOf, fmtMoment, missingFor, pct, people, recipientStatus, responseStatus, sourceLabel, sourcesLabel, usesForm,
  type AudienceCounts, type CampaignLink, type EmailCampaign, type EmailMeta, type FormField, type FormResponse, type Person, type PersonSource, type Recipient, type Tr,
} from './emailModel';
import '../../Org/Org.css';
import '../Marketing/Marketing.css';
import './Emails.css';

/* Administrator: one email — test it, send it or schedule it, follow it as it goes, its answers, and what it brought. */

interface Detail {
  campaign: EmailCampaign;
  links: CampaignLink[];
  days: { day: string; opened: number; clicked: number }[];
  by_source: { source: PersonSource; recipients: number; opened: number; clicked: number }[];
  missing: string[];
}

const EmailDetail: React.FC = () => {
  const { id } = useParams();
  const { apiCall, user } = useAuth();
  const { tr, locale } = useTr();
  const { message, modal } = AntApp.useApp();
  const navigate = useNavigate();
  const [d, setD] = useState<Detail | null>(null);
  const [meta, setMeta] = useState<EmailMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState('preview');
  const [editing, setEditing] = useState(false);
  const [testing, setTesting] = useState(false);
  const [sending, setSending] = useState(false);
  const [sender, setSender] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [one, m] = await Promise.all([
        call<Detail>(apiCall, `/admin/email-campaigns/${id}`),
        meta ? Promise.resolve(meta) : call<EmailMeta>(apiCall, '/admin/email-campaigns/meta'),
      ]);
      setD(one);
      setMeta(m);
      setError(null);
    } catch (e) { setError(emailError(e, tr)); }
  }, [apiCall, id, meta, tr]);
  useEffect(() => { load(); }, [load]);

  const live = d?.campaign.status === 'sending';
  useEffect(() => {
    if (!live) return;
    const t = window.setInterval(load, 3000);
    return () => window.clearInterval(t);
  }, [live, load]);

  if (error && !d) return <div className="og"><Empty icon={<WarningOutlined />} title={tr('This email could not be loaded', 'Cet email n’a pas pu être chargé')} text={error} action={<Button onClick={() => navigate('/app/emails')}>{tr('All emails', 'Tous les emails')}</Button>} /></div>;
  if (!d || !meta) return <div className="og"><Skeleton active paragraph={{ rows: 10 }} /></div>;
  const c = d.campaign;
  const s = c.stats;
  const subject = c.content.fr.subject || c.content.en.subject;

  const act = async (path: string, done: string) => {
    setBusy(path);
    try {
      const r = await call<{ campaign: EmailCampaign; retried?: number }>(apiCall, `/admin/email-campaigns/${c.id}/${path}`, 'POST');
      message.success(path === 'retry' ? tr(`${r.retried || 0} sent again`, `${r.retried || 0} renvoyé(s)`) : done);
      load();
    } catch (e) { message.error(emailError(e, tr)); } finally { setBusy(null); }
  };
  const duplicate = async () => {
    try {
      const r = await call<{ campaign: EmailCampaign }>(apiCall, `/admin/email-campaigns/${c.id}/duplicate`, 'POST');
      message.success(tr('Copied as a draft', 'Copié en brouillon'));
      navigate(`/app/emails/${r.campaign.id}`);
    } catch (e) { message.error(emailError(e, tr)); }
  };
  const remove = () => modal.confirm({
    title: tr(`Delete « ${c.name} »?`, `Supprimer « ${c.name} » ?`), content: tr('The draft is deleted for good.', 'Le brouillon est supprimé définitivement.'),
    okText: tr('Delete', 'Supprimer'), cancelText: tr('Cancel', 'Annuler'), okButtonProps: { danger: true },
    onOk: async () => {
      try { await call(apiCall, `/admin/email-campaigns/${c.id}`, 'DELETE'); message.success(tr('Email deleted', 'Email supprimé')); navigate('/app/emails'); }
      catch (e) { message.error(emailError(e, tr)); }
    },
  });
  const confirmCancel = () => modal.confirm({
    title: tr('Cancel this email?', 'Annuler cet email ?'),
    content: tr('People who have not received it yet will not receive it. Duplicate it to send it again.', 'Les personnes qui ne l’ont pas encore reçu ne le recevront pas. Dupliquez-le pour l’envoyer de nouveau.'),
    okText: tr('Cancel the email', 'Annuler l’email'), okButtonProps: { danger: true }, cancelText: tr('Keep it', 'Le garder'), onOk: () => act('cancel', tr('Email cancelled', 'Email annulé')),
  });

  const missing = c.status === 'draft' ? missingFor(fieldsOf(c), tr, { postalAddress: meta.settings.postal_address }) : [];
  const primary = c.status === 'draft'
    ? <>
      <Button icon={<EditOutlined />} onClick={() => setEditing(true)}>{tr('Edit', 'Modifier')}</Button>
      <Button icon={<ExperimentOutlined />} onClick={() => setTesting(true)}>{tr('Send a test', 'Envoyer un test')}</Button>
      <Button type="primary" icon={<SendOutlined />} onClick={() => setSending(true)}>{tr('Send…', 'Envoyer…')}</Button>
    </>
    : c.status === 'scheduled'
      ? <Button icon={<EditOutlined />} loading={busy === 'unschedule'} onClick={() => act('unschedule', tr('Back to draft: it will not go out', 'Revenu en brouillon : il ne partira pas'))}>{tr('Back to draft', 'Repasser en brouillon')}</Button>
      : c.status === 'sending'
        ? <Button icon={<PauseCircleOutlined />} loading={busy === 'pause'} onClick={() => act('pause', tr('Paused', 'En pause'))}>{tr('Pause', 'Pause')}</Button>
        : c.status === 'paused'
          ? <Button type="primary" icon={<PlayCircleOutlined />} loading={busy === 'resume'} onClick={() => act('resume', tr('Sending again', 'Envoi repris'))}>{tr('Resume', 'Reprendre')}</Button>
          : <Button icon={<CopyOutlined />} onClick={duplicate}>{tr('Duplicate', 'Dupliquer')}</Button>;

  const buttonsLine = [c.buttons.primary, c.buttons.secondary].filter(b => b.action !== 'none').map(b => (
    b.action === 'form' ? <span key="f"><FormOutlined />{tr('Form', 'Formulaire')}</span>
      : b.action === 'whatsapp' ? <span key="w"><WhatsAppOutlined />WhatsApp</span>
        : <span key="l"><ThunderboltOutlined />{tr('Page', 'Page')}</span>
  ));

  return (
    <div className="og mk em">
      <button type="button" className="og-back" onClick={() => navigate('/app/emails')}><ArrowLeftOutlined />{tr('All emails', 'Tous les emails')}</button>
      <div className="og-hero">
        <span className="mk-thumb is-md" aria-hidden style={{ background: `linear-gradient(135deg, ${c.design.colors.primary}, ${c.design.colors.header_bg})` }}><MailOutlined className="em-thumb-ic" /></span>
        <div className="og-hero-main">
          <span className="og-overline">{tr('Email campaign', 'Campagne email')}</span>
          <h1 className="og-title">{c.name} <EmailStatusChip status={c.status} /></h1>
          <div className="og-hero-meta">
            <span><MailOutlined />{subject || tr('No subject yet', 'Pas encore d’objet')}</span>
            {buttonsLine}
            {c.status === 'scheduled' && <span><CalendarOutlined />{tr('Goes out', 'Part le')} {fmtMoment(c.scheduled_at, locale)}</span>}
            {c.started_at && <span><SendOutlined />{c.finished_at ? `${tr('Sent', 'Envoyé le')} ${fmtMoment(c.finished_at, locale)}` : `${tr('Started', 'Commencé le')} ${fmtMoment(c.started_at, locale)}`}</span>}
          </div>
        </div>
        <div className="og-actions">
          {primary}
          <Dropdown trigger={['click']} menu={{ items: [
            { key: 'copy', icon: <CopyOutlined />, label: tr('Duplicate as a draft', 'Dupliquer en brouillon'), onClick: duplicate },
            ...(['sending', 'paused', 'sent'].includes(c.status) && s.failed > 0 ? [{ key: 'retry', icon: <RedoOutlined />, label: tr(`Retry the ${s.failed} failed`, `Renvoyer les ${s.failed} échecs`), onClick: () => act('retry', '') }] : []),
            ...(['sending', 'paused', 'scheduled'].includes(c.status) ? [{ key: 'cancel', icon: <StopOutlined />, danger: true, label: tr('Cancel the email', 'Annuler l’email'), onClick: confirmCancel }] : []),
            ...(c.status === 'draft' || (c.status === 'cancelled' && s.sent === 0) ? [{ type: 'divider' as const }, { key: 'delete', icon: <DeleteOutlined />, danger: true, label: tr('Delete', 'Supprimer'), onClick: remove }] : []),
          ] }}>
            <Button icon={<MoreOutlined />} aria-label={tr('More actions', 'Plus d’actions')} />
          </Dropdown>
        </div>
      </div>

      {missing.length > 0 && (
        <div className="og-banner tone-warn"><WarningOutlined /><div className="og-banner-body">
          <strong>{tr('Before sending', 'Avant l’envoi')}</strong><span>{tr('Add', 'Ajoutez')} {missing.join(', ')}.</span>
        </div>{missing.some(m => /postal|postale/.test(m)) ? <Button size="small" onClick={() => setSender(true)}>{tr('Sender details', 'Expéditeur')}</Button> : <Button size="small" onClick={() => setEditing(true)}>{tr('Edit', 'Modifier')}</Button>}</div>
      )}
      {c.status === 'scheduled' && <div className="og-banner tone-soon"><CalendarOutlined /><div className="og-banner-body"><strong>{tr('Scheduled', 'Programmé')}</strong><span>{tr(`It goes out by itself on ${fmtMoment(c.scheduled_at, locale)} to ${s.recipients} people.`, `Il partira seul le ${fmtMoment(c.scheduled_at, locale)} vers ${s.recipients} personnes.`)}</span></div></div>}
      {c.status === 'paused' && <div className="og-banner tone-warn"><PauseCircleOutlined /><div className="og-banner-body"><strong>{tr('Paused', 'En pause')}</strong><span>{tr(`${s.queued} people have not received it yet.`, `${s.queued} personnes ne l’ont pas encore reçu.`)}</span></div></div>}
      {c.note === 'daily_limit' && <div className="og-banner tone-soon"><CalendarOutlined /><div className="og-banner-body"><strong>{tr('Daily allowance reached', 'Quota du jour atteint')}</strong><span>{tr('The rest goes out tomorrow, by itself.', 'La suite part demain, toute seule.')}</span></div></div>}

      {(c.status === 'sending' || c.status === 'paused') && (
        <section className="og-card em-progress">
          <div className="og-card-body">
            <div className="em-progress-row"><strong>{tr(`${s.recipients - s.queued} of ${s.recipients} sent`, `${s.recipients - s.queued} sur ${s.recipients} envoyés`)}</strong><span className="og-muted">{tr(`about ${meta.pace.per_minute} a minute`, `environ ${meta.pace.per_minute} par minute`)}</span></div>
            <Progress percent={Math.round(s.progress * 100)} status={c.status === 'paused' ? 'exception' : 'active'} showInfo={false} strokeColor={c.design.colors.primary} />
          </div>
        </section>
      )}

      {c.status !== 'draft' && (
        <div className="og-kpis">
          <Kpi icon={<TeamOutlined />} label={tr('Recipients', 'Destinataires')} value={s.recipients} note={s.skipped ? tr(`${s.skipped} not sent`, `${s.skipped} non envoyés`) : tr('One email each', 'Un email chacun')} />
          <Kpi icon={<CheckCircleOutlined />} label={tr('Sent', 'Envoyés')} value={s.sent} warn={s.failed + s.bounced > 0} note={s.failed + s.bounced ? tr(`${s.failed} failed · ${s.bounced} bounced`, `${counted(s.failed, tr, ['', ''], ['échec', 'échecs'])} · ${counted(s.bounced, tr, ['', ''], ['rejeté', 'rejetés'])}`) : tr('No failure', 'Aucun échec')} />
          <Kpi icon={<EyeOutlined />} label={tr('Opened', 'Ouverts')} value={pct(s.open_rate, tr)} note={`${people(s.opened, tr)} · ${tr('approximate', 'approximatif')}`} />
          <Kpi icon={<ThunderboltOutlined />} label={tr('Clicked', 'Cliqués')} value={pct(s.click_rate, tr)} note={people(s.clicked, tr)} />
          {usesForm(c) && <Kpi icon={<FormOutlined />} label={tr('Answers', 'Réponses')} value={s.responses} note={tr(`${pct(s.response_rate, tr)} of recipients`, `${pct(s.response_rate, tr)} des destinataires`)} />}
          <Kpi icon={<UserDeleteOutlined />} label={tr('Unsubscribed', 'Désinscrits')} value={s.unsubscribed} warn={!!s.unsubscribe_rate && s.unsubscribe_rate > 0.01} note={pct(s.unsubscribe_rate, tr)} />
        </div>
      )}

      <Tabs className="og-tabs" activeKey={tab} onChange={setTab} items={[
        { key: 'preview', label: tr('The email', 'L’email'), children: <section className="og-card"><div className="og-card-body"><EmailPreview fields={fieldsOf(c)} senderName={meta.settings.sender_name || meta.sender.name} campaignId={c.id} tr={tr} /></div></section> },
        ...(usesForm(c) || s.responses ? [{ key: 'answers', label: `${tr('Answers', 'Réponses')} (${s.responses})`, children: <Answers campaign={c} tr={tr} locale={locale} onChanged={load} /> }] : []),
        ...(c.status !== 'draft' ? [
          { key: 'people', label: `${tr('Recipients', 'Destinataires')} (${s.recipients})`, children: <Recipients campaign={c} tr={tr} locale={locale} /> },
          { key: 'links', label: tr('Links and results', 'Liens et résultats'), children: <Results detail={d} tr={tr} /> },
        ] : []),
      ]} />

      <EmailEditor open={editing} meta={meta} campaign={c} onClose={() => setEditing(false)} onSaved={() => { setEditing(false); load(); }} />
      <TestModal open={testing} campaign={c} defaultTo={user?.email || ''} tr={tr} onClose={() => setTesting(false)} />
      <SendModal open={sending} campaign={c} meta={meta} tr={tr} onClose={() => setSending(false)} onSent={() => { setSending(false); load(); }} />
      <SenderDetails open={sender} meta={meta} onClose={() => setSender(false)} onSaved={st => { setSender(false); setMeta({ ...meta, settings: st }); load(); }} />
    </div>
  );
};

// ── A test ──
const TestModal: React.FC<{ open: boolean; campaign: EmailCampaign; defaultTo: string; tr: Tr; onClose: () => void }> = ({ open, campaign, defaultTo, tr, onClose }) => {
  const { apiCall } = useAuth();
  const { message } = AntApp.useApp();
  const [to, setTo] = useState(defaultTo);
  const [lang, setLang] = useState('auto');
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (open) { setTo(defaultTo); setLang('auto'); } }, [open, defaultTo]);
  const send = async () => {
    setBusy(true);
    try {
      const r = await call<{ sent: { to: string; lang: string }[] }>(apiCall, `/admin/email-campaigns/${campaign.id}/test`, 'POST', { to, lang });
      message.success(tr(`${r.sent.length} test(s) sent: check the inbox (and the spam folder)`, `${r.sent.length} test(s) envoyé(s) : regardez la boîte de réception (et les indésirables)`));
      onClose();
    } catch (e) { message.error(emailError(e, tr)); } finally { setBusy(false); }
  };
  return (
    <Modal open={open} onCancel={onClose} title={tr('Send a test', 'Envoyer un test')} okText={tr('Send the test', 'Envoyer le test')} cancelText={tr('Cancel', 'Annuler')} onOk={send} confirmLoading={busy} okButtonProps={{ disabled: !to.trim() }} destroyOnHidden>
      <div className="og-form" style={{ gap: 14 }}>
        <div className="og-field"><label>{tr('To', 'À')} <em>{tr('up to 5 addresses', '5 adresses au plus')}</em></label>
          <Input value={to} onChange={e => setTo(e.target.value)} placeholder="you@example.com, colleague@example.com" /></div>
        <div className="og-field"><label>{tr('Version', 'Version')}</label>
          <Segmented value={lang} onChange={v => setLang(v as string)} options={[
            { value: 'auto', label: campaign.language_mode === 'both' ? tr('Bilingual', 'Bilingue') : tr('Each version', 'Chaque version') }, { value: 'fr', label: tr('French', 'Français') }, { value: 'en', label: tr('English', 'Anglais') },
          ]} /></div>
        <small className="og-muted">{tr('« [TEST] » is added to the subject. Links are not counted; the form opens in preview (nothing is kept).', '« [TEST] » est ajouté à l’objet. Les liens ne sont pas comptés ; le formulaire s’ouvre en aperçu (rien n’est enregistré).')}</small>
      </div>
    </Modal>
  );
};

// ── Send now or later ──
const SendModal: React.FC<{ open: boolean; campaign: EmailCampaign; meta: EmailMeta; tr: Tr; onClose: () => void; onSent: () => void }> = ({ open, campaign, meta, tr, onClose, onSent }) => {
  const { apiCall } = useAuth();
  const { message } = AntApp.useApp();
  const [when, setWhen] = useState<'now' | 'later'>('now');
  const [at, setAt] = useState<Dayjs | null>(null);
  const [counts, setCounts] = useState<AudienceCounts | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    if (!open) return;
    setWhen('now'); setAt(dayjs().add(1, 'day').hour(9).minute(0).second(0)); setErr(null); setCounts(null);
    call<{ counts: AudienceCounts; people: Person[] }>(apiCall, '/admin/email-campaigns/audience', 'POST', { audience: campaign.audience, excluded: campaign.excluded })
      .then(r => setCounts(r.counts)).catch(e => setErr(emailError(e, tr)));
  }, [open, apiCall, campaign, tr]);

  const missing = missingFor(fieldsOf(campaign), tr, { postalAddress: meta.settings.postal_address, recipients: counts?.total });
  const minutes = counts ? Math.max(1, Math.ceil(counts.total / meta.pace.per_minute)) : 0;
  const send = async () => {
    setBusy(true);
    setErr(null);
    try {
      await call(apiCall, `/admin/email-campaigns/${campaign.id}/send`, 'POST', when === 'later' && at ? { scheduled_at: at.toISOString() } : {});
      message.success(when === 'later' ? tr(`Scheduled for ${at?.format('D MMM YYYY, HH:mm')}`, `Programmé pour le ${at?.format('D MMM YYYY, HH:mm')}`) : tr('Sending: it goes out in the next minutes', 'Envoi en cours : il part dans les prochaines minutes'));
      onSent();
    } catch (e) { setErr(emailError(e, tr)); } finally { setBusy(false); }
  };

  return (
    <Modal open={open} onCancel={onClose} title={tr('Send the email', 'Envoyer l’email')} destroyOnHidden width={560} cancelText={tr('Cancel', 'Annuler')}
      okText={counts ? (when === 'later' ? tr(`Schedule for ${counts.total} people`, `Programmer pour ${counts.total} personnes`) : tr(`Send to ${counts.total} people`, `Envoyer à ${counts.total} personnes`)) : tr('Send', 'Envoyer')}
      onOk={send} confirmLoading={busy} okButtonProps={{ disabled: !counts || missing.length > 0 || (when === 'later' && !at) }}>
      <div className="og-form" style={{ gap: 14 }}>
        {!counts && !err ? <Skeleton active paragraph={{ rows: 2 }} /> : counts && (
          <div className="em-send-who">
            <strong>{counts.total} {tr(counts.total === 1 ? 'person' : 'people', counts.total === 1 ? 'personne' : 'personnes')}</strong>
            <span>{(Object.entries(counts.by_source) as [PersonSource, number][]).filter(([, n]) => n).map(([k, n]) => `${n} ${sourcesLabel(k, tr)}`).join(' · ')}</span>
            {counts.suppressed > 0 && <small>{tr(`${counts.suppressed} unsubscribed address(es) left out.`, `${counts.suppressed} adresse(s) désinscrite(s) écartée(s).`)}</small>}
          </div>
        )}
        <Segmented block value={when} onChange={v => setWhen(v as 'now' | 'later')} options={[{ value: 'now', label: tr('Send now', 'Envoyer maintenant') }, { value: 'later', label: tr('Schedule', 'Programmer') }]} />
        {when === 'later' && (
          <div className="og-field"><label>{tr('Send on', 'Envoyer le')} <em>{tr('your time zone', 'votre fuseau horaire')}</em></label>
            <DatePicker showTime={{ format: 'HH:mm', minuteStep: 5 }} format="D MMM YYYY, HH:mm" value={at} onChange={setAt} style={{ width: '100%' }}
              disabledDate={day => day.isBefore(dayjs(), 'day') || day.isAfter(dayjs().add(90, 'day'))} />
            <small>{tr('Tuesday to Thursday, around 9–10 am or 6–8 pm, is usually when such emails are read most.', 'Du mardi au jeudi, vers 9–10 h ou 18–20 h : c’est souvent là que ces emails sont le plus lus.')}</small></div>
        )}
        {counts && counts.total > 0 && <small className="og-muted">{tr(`About ${meta.pace.per_minute} emails a minute: about ${minutes} min for everyone. You can pause at any time.`, `Environ ${meta.pace.per_minute} emails par minute : environ ${minutes} min pour tout le monde. Vous pouvez mettre en pause à tout moment.`)}</small>}
        {missing.length > 0 && <div className="og-check tone-bad"><WarningOutlined /><span>{tr('Before sending, add', 'Avant l’envoi, ajoutez')} {missing.join(', ')}.</span></div>}
        {err && <div className="og-check tone-bad"><WarningOutlined /><span>{err}</span></div>}
      </div>
    </Modal>
  );
};

// ── Answers to the form ──
const csvCell = (v: unknown) => {
  const s = Array.isArray(v) ? v.join(', ') : String(v ?? '');
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const Answers: React.FC<{ campaign: EmailCampaign; tr: Tr; locale: string; onChanged: () => void }> = ({ campaign, tr, locale, onChanged }) => {
  const { apiCall } = useAuth();
  const { message } = AntApp.useApp();
  const [rows, setRows] = useState<FormResponse[] | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [q, setQ] = useState('');
  const load = useCallback(() => {
    call<{ responses: FormResponse[]; fields: FormField[] }>(apiCall, `/admin/email-campaigns/${campaign.id}/responses`)
      .then(r => { setRows(r.responses); setFields(r.fields); }).catch(() => setRows([]));
  }, [apiCall, campaign.id]);
  useEffect(() => { load(); }, [load, campaign.stats.responses]);
  const open = rows?.find(r => r.id === openId) || null;
  useEffect(() => { setNotes(open?.notes || ''); }, [openId, open?.notes]);

  const label = (f: FormField) => tr(f.label_en || f.label_fr || f.id, f.label_fr || f.label_en || f.id);
  const update = async (r: FormResponse, patch: Partial<FormResponse>) => {
    try {
      await call(apiCall, `/admin/email-campaigns/${campaign.id}/responses/${r.id}`, 'PATCH', patch);
      load();
      onChanged();
    } catch (e) { message.error(emailError(e, tr)); }
  };
  const csv = () => {
    if (!rows) return;
    const head = [tr('Date', 'Date'), tr('Name', 'Nom'), 'Email', tr('Phone', 'Téléphone'), tr('Language', 'Langue'), tr('Status', 'Statut'), ...fields.map(label), tr('Notes', 'Notes')];
    const lines = rows.map(r => [fmtMoment(r.created_at, locale), r.name, r.email, r.phone, r.lang, responseStatus(r.status, tr).label, ...fields.map(f => r.answers[f.id]), r.notes].map(csvCell).join(','));
    // A byte-order mark first, so Excel reads the accents correctly.
    const blob = new Blob([String.fromCharCode(0xfeff), [head.map(csvCell).join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${(campaign.name || 'email').replace(/[^\w-]+/g, '-').toLowerCase()}-answers.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const ql = q.trim().toLowerCase();
  const visible = (rows || []).filter(r => !ql || `${r.name || ''} ${r.email || ''} ${r.phone || ''}`.toLowerCase().includes(ql));
  return (
    <section className="og-card">
      <div className="og-toolbar">
        <Input allowClear prefix={<SearchOutlined />} placeholder={tr('Search a name, an email, a phone', 'Rechercher un nom, un email, un téléphone')} value={q} onChange={e => setQ(e.target.value)} />
        <span className="og-toolbar-spacer" />
        <Button icon={<DownloadOutlined />} onClick={csv} disabled={!rows?.length}>{tr('Export (CSV)', 'Exporter (CSV)')}</Button>
      </div>
      {!rows ? <div style={{ padding: 18 }}><Skeleton active /></div> : visible.length === 0 ? (
        <Empty icon={<FormOutlined />} title={tr('No answer yet', 'Pas encore de réponse')} text={tr('When someone fills the form, their answers appear here, and you get a notification.', 'Quand quelqu’un remplit le formulaire, ses réponses apparaissent ici et vous recevez une notification.')} />
      ) : (
        <div className="og-list">
          <div className="og-row is-answer is-head"><span>{tr('Person', 'Personne')}</span><span>{tr('Answers', 'Réponses')}</span><span>{tr('Status', 'Statut')}</span></div>
          {visible.map(r => (
            <div key={r.id} className={`og-row is-answer is-link${r.status === 'new' ? ' is-fresh' : ''}`} role="button" tabIndex={0} onClick={() => setOpenId(r.id)} onKeyDown={e => { if (e.key === 'Enter') setOpenId(r.id); }}>
              <span className="og-cell-main"><strong>{r.name || r.email}</strong><em>{r.email}{r.phone ? ` · ${r.phone}` : ''} · {fmtMoment(r.created_at, locale)}</em></span>
              <span className="og-cell-main og-hide-sm"><em className="em-answer-line">{fields.filter(f => !['name', 'email', 'phone'].includes(f.type) && r.answers[f.id]).map(f => `${label(f)} : ${Array.isArray(r.answers[f.id]) ? (r.answers[f.id] as string[]).join(', ') : r.answers[f.id]}`).join(' · ') || '—'}</em></span>
              <span onClick={e => e.stopPropagation()}>
                <Select size="small" value={r.status} onChange={v => update(r, { status: v })} style={{ width: 130 }}
                  options={(['new', 'contacted', 'done'] as const).map(st => ({ value: st, label: responseStatus(st, tr).label }))} />
              </span>
            </div>
          ))}
        </div>
      )}
      <Drawer open={!!open} onClose={() => setOpenId(null)} width="min(520px, 100vw)" rootClassName="og-drawer" title={open?.name || open?.email}>
        {open && (
          <div className="og-form">
            <div className="og-field"><label>Email</label><a href={`mailto:${open.email}`}>{open.email}</a></div>
            {open.phone && <div className="og-field"><label>{tr('Phone', 'Téléphone')}</label>
              <span><a href={`tel:${open.phone}`}>{open.phone}</a> · <a href={`https://wa.me/${open.phone.replace(/[^\d]/g, '')}`} target="_blank" rel="noreferrer"><WhatsAppOutlined /> WhatsApp</a></span></div>}
            {fields.filter(f => !['name', 'email', 'phone'].includes(f.type)).map(f => (
              <div key={f.id} className="og-field"><label>{label(f)}</label>
                <span>{Array.isArray(open.answers[f.id]) ? (open.answers[f.id] as string[]).join(', ') : (open.answers[f.id] as string) || '—'}</span></div>
            ))}
            <div className="og-field"><label>{tr('Answered', 'Répondu le')}</label><span>{fmtMoment(open.created_at, locale)} · {open.lang.toUpperCase()}{open.source ? ` · ${sourceLabel(open.source, tr)}` : ''}</span></div>
            <div className="og-field"><label>{tr('Status', 'Statut')}</label>
              <Segmented value={open.status} onChange={v => update(open, { status: v as FormResponse['status'] })} options={(['new', 'contacted', 'done'] as const).map(st => ({ value: st, label: responseStatus(st, tr).label }))} /></div>
            <div className="og-field"><label>{tr('Notes', 'Notes')} <em>{tr('only the team sees them', 'visibles par l’équipe seulement')}</em></label>
              <Input.TextArea value={notes} onChange={e => setNotes(e.target.value)} autoSize={{ minRows: 3, maxRows: 8 }} maxLength={4000} />
              <Button size="small" style={{ alignSelf: 'flex-start', marginTop: 6 }} disabled={notes === (open.notes || '')} onClick={() => update(open, { notes })}>{tr('Save the notes', 'Enregistrer les notes')}</Button></div>
          </div>
        )}
      </Drawer>
    </section>
  );
};

// ── Recipients ──
const Recipients: React.FC<{ campaign: EmailCampaign; tr: Tr; locale: string }> = ({ campaign, tr, locale }) => {
  const { apiCall } = useAuth();
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(0);
  const [data, setData] = useState<{ recipients: Recipient[]; total: number } | null>(null);
  useEffect(() => { setPage(0); }, [filter, q]);
  useEffect(() => {
    const t = window.setTimeout(() => {
      call<{ recipients: Recipient[]; total: number }>(apiCall, `/admin/email-campaigns/${campaign.id}/recipients?filter=${filter}&q=${encodeURIComponent(q)}&page=${page}`)
        .then(setData).catch(() => setData({ recipients: [], total: 0 }));
    }, 250);
    return () => window.clearTimeout(t);
  }, [apiCall, campaign.id, campaign.stats.sent, filter, q, page]);

  return (
    <section className="og-card">
      <div className="og-toolbar">
        <Input allowClear prefix={<SearchOutlined />} placeholder={tr('Search a name or an address', 'Rechercher un nom ou une adresse')} value={q} onChange={e => setQ(e.target.value)} />
        <Segmented value={filter} onChange={v => setFilter(v as string)} options={[
          { value: 'all', label: tr('Everyone', 'Tous') }, { value: 'opened', label: tr('Opened', 'Ouvert') }, { value: 'clicked', label: tr('Clicked', 'Cliqué') },
          { value: 'not_opened', label: tr('Not opened', 'Pas ouvert') }, { value: 'unsubscribed', label: tr('Unsubscribed', 'Désinscrit') }, { value: 'failed', label: tr('Failed', 'Échec') },
        ]} />
      </div>
      {!data ? <div style={{ padding: 18 }}><Skeleton active /></div> : data.recipients.length === 0 ? <Empty icon={<TeamOutlined />} title={tr('Nobody here', 'Personne ici')} /> : (
        <div className="og-list">
          <div className="og-row is-recipient is-head"><span>{tr('Person', 'Personne')}</span><span>{tr('State', 'État')}</span><span>{tr('Opened', 'Ouvert')}</span><span>{tr('Clicked', 'Cliqué')}</span></div>
          {data.recipients.map(r => (
            <div key={r.id} className="og-row is-recipient">
              <span className="og-cell-main"><strong>{r.name || r.email}</strong><em>{r.email} · {sourceLabel(r.source, tr)} · {r.lang.toUpperCase()}</em></span>
              <span className="og-cell-main">
                <span><span className={`og-pill tone-${recipientStatus(r.status, tr).tone}`}>{recipientStatus(r.status, tr).label}</span>{r.unsubscribed_at && <span className="og-pill tone-warn" style={{ marginLeft: 6 }}>{tr('Unsubscribed', 'Désinscrit')}</span>}</span>
                <em>{r.error ? <Tooltip title={r.error}>{r.error.slice(0, 48)}{r.error.length > 48 ? '…' : ''}</Tooltip> : r.sent_at ? fmtMoment(r.sent_at, locale) : ''}</em>
              </span>
              <span className="og-cell-main og-hide-sm"><strong style={{ fontWeight: 500 }}>{r.opened_at ? fmtMoment(r.opened_at, locale) : '—'}</strong><em>{r.opens > 1 ? tr(`${r.opens} times`, `${r.opens} fois`) : ''}</em></span>
              <span className="og-cell-main"><strong style={{ fontWeight: 500 }}>{r.clicked_at ? fmtMoment(r.clicked_at, locale) : '—'}</strong><em>{r.clicks > 1 ? tr(`${r.clicks} clicks`, `${r.clicks} clics`) : ''}</em></span>
            </div>
          ))}
          {data.total > 100 && (
            <div className="em-pager">
              <Button size="small" disabled={page === 0} onClick={() => setPage(p => p - 1)}>{tr('Previous', 'Précédent')}</Button>
              <span className="og-muted">{page * 100 + 1}–{Math.min(data.total, (page + 1) * 100)} / {data.total}</span>
              <Button size="small" disabled={(page + 1) * 100 >= data.total} onClick={() => setPage(p => p + 1)}>{tr('Next', 'Suivant')}</Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

// ── Links and results ──
const Results: React.FC<{ detail: Detail; tr: Tr }> = ({ detail, tr }) => {
  const max = Math.max(1, ...detail.days.map(x => x.opened));
  return (
    <div className="em-results">
      <section className="og-card">
        <div className="og-card-head"><span className="og-card-title">{tr('Links', 'Liens')}</span></div>
        <div className="og-list">
          <div className="og-row is-link-stat is-head"><span>{tr('Link', 'Lien')}</span><span>{tr('People', 'Personnes')}</span><span>{tr('Clicks', 'Clics')}</span></div>
          {detail.links.length === 0 && <Empty icon={<ThunderboltOutlined />} title={tr('No link in this email', 'Aucun lien dans cet email')} />}
          {detail.links.map(l => (
            <div key={l.idx} className="og-row is-link-stat">
              <span className="og-cell-main"><strong>{l.label || `${tr('Link', 'Lien')} ${l.idx}`}</strong><em>{l.url === 'form' ? tr('The form', 'Le formulaire') : <a href={l.url} target="_blank" rel="noreferrer">{l.url}</a>}</em></span>
              <span className="og-num">{l.people}</span><span className="og-num og-muted">{l.clicks}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="og-card">
        <div className="og-card-head"><span className="og-card-title">{tr('By list', 'Par liste')}</span></div>
        <div className="og-list">
          <div className="og-row is-link-stat is-head"><span>{tr('List', 'Liste')}</span><span>{tr('Opened', 'Ouverts')}</span><span>{tr('Clicked', 'Cliqués')}</span></div>
          {detail.by_source.map(b => (
            <div key={b.source} className="og-row is-link-stat">
              <span className="og-cell-main"><strong>{sourcesLabel(b.source, tr)}</strong><em>{tr(`${b.recipients} received it`, `${b.recipients} l’ont reçu`)}</em></span>
              <span className="og-num">{pct(b.recipients ? b.opened / b.recipients : null, tr)}</span>
              <span className="og-num">{pct(b.recipients ? b.clicked / b.recipients : null, tr)}</span>
            </div>
          ))}
        </div>
      </section>
      {detail.days.length > 0 && (
        <section className="og-card">
          <div className="og-card-head"><span className="og-card-title">{tr('Day by day', 'Jour par jour')}</span><span className="og-muted">{tr('people who opened · clicked', 'personnes qui ont ouvert · cliqué')}</span></div>
          <div className="og-card-body em-days">
            {detail.days.map(x => (
              <div key={x.day} className="em-day">
                <span>{dayjs(x.day).format('D MMM')}</span>
                <i><b style={{ width: `${(x.opened / max) * 100}%` }} /><b className="is-click" style={{ width: `${(x.clicked / max) * 100}%` }} /></i>
                <span className="og-num">{x.opened} · {x.clicked}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default EmailDetail;
