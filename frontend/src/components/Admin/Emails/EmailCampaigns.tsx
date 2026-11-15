import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Input, Segmented, Skeleton, Tooltip } from 'antd';
import {
  EyeOutlined, FormOutlined, MailOutlined, PlusOutlined, ReloadOutlined, RightOutlined, SearchOutlined, SendOutlined, SettingOutlined,
  StopOutlined, ThunderboltOutlined, UserDeleteOutlined, WarningOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { ApiError, call } from '../../Org/orgModel';
import { Empty, Kpi, PageHeader } from '../../Org/OrgUi';
import { useTr } from '../../../utils/useTr';
import { Sparkles } from '../Marketing/CampaignAi';
import EmailEditor from './EmailEditor';
import { SenderDetails, Suppressions } from './EmailSettings';
import { STATUS_TONE, counted, emailError, pct, people, statusLabel, whenOf, type EmailCampaign, type EmailMeta, type EmailStatus, type EmailSummary } from './emailModel';
import '../../Org/Org.css';
import '../Marketing/Marketing.css';
import './Emails.css';

/* Administrator: every email campaign, how it did, and the way to a new one. */

type Filter = 'all' | 'draft' | 'live' | 'sent';

export const EmailStatusChip: React.FC<{ status: EmailStatus }> = ({ status }) => {
  const { tr } = useTr();
  return (
    <span className={`og-pill tone-${STATUS_TONE[status]}`}>
      {status === 'sending' && <i className="mk-live" aria-hidden />}{statusLabel(status, tr)}
    </span>
  );
};

const EmailCampaigns: React.FC = () => {
  const { apiCall } = useAuth();
  const { tr, locale } = useTr();
  const navigate = useNavigate();
  const [list, setList] = useState<EmailCampaign[] | null>(null);
  const [summary, setSummary] = useState<EmailSummary | null>(null);
  const [meta, setMeta] = useState<EmailMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notInstalled, setNotInstalled] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [creating, setCreating] = useState(false);
  const [sender, setSender] = useState(false);
  const [suppressions, setSuppressions] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [r, m] = await Promise.all([
        call<{ campaigns: EmailCampaign[]; summary: EmailSummary }>(apiCall, '/admin/email-campaigns'),
        call<EmailMeta>(apiCall, '/admin/email-campaigns/meta'),
      ]);
      setList(r.campaigns);
      setSummary(r.summary);
      setMeta(m);
      setNotInstalled(false);
    } catch (e) {
      if (e instanceof ApiError && (e.data as { code?: string })?.code === 'EMAILS_NOT_MIGRATED') setNotInstalled(true);
      setError(emailError(e, tr));
    }
  }, [apiCall, tr]);
  useEffect(() => { load(); }, [load]);

  const sending = (list || []).some(c => c.status === 'sending');
  useEffect(() => {
    if (!sending) return;
    const t = window.setInterval(load, 5000);
    return () => window.clearInterval(t);
  }, [sending, load]);

  const q = query.trim().toLowerCase();
  const inFilter = (c: EmailCampaign, f: Filter) => f === 'all' || (f === 'draft' && c.status === 'draft')
    || (f === 'live' && ['scheduled', 'sending', 'paused'].includes(c.status)) || (f === 'sent' && ['sent', 'cancelled'].includes(c.status));
  const visible = useMemo(() => (list || []).filter(c => inFilter(c, filter)
    && (!q || `${c.name || ''} ${c.content.fr.subject || ''} ${c.content.en.subject || ''}`.toLowerCase().includes(q))), [list, filter, q]);
  const count = (f: Filter) => (list || []).filter(c => inFilter(c, f)).length;
  const noAddress = meta && !meta.settings.postal_address.trim();

  return (
    <div className="og mk em">
      <PageHeader overline={tr('Administration', 'Administration')} title={tr('Email campaigns', 'Campagnes email')}
        subtitle={tr('Emails to your students, exam candidates, people who asked for a trial class and people who registered for an offer. The AI writes them in French and English and proposes their design; a button can open a page, a form or a WhatsApp group.',
          'Des emails à vos élèves, aux candidats, aux personnes qui ont demandé un cours d’essai et aux inscrits. L’IA les écrit en français et en anglais et propose leur design ; un bouton peut ouvrir une page, un formulaire ou un groupe WhatsApp.')}
        actions={<>
          <Button icon={<SettingOutlined />} onClick={() => setSender(true)} disabled={!meta}>{tr('Sender details', 'Expéditeur')}</Button>
          <Button icon={<UserDeleteOutlined />} onClick={() => setSuppressions(true)} disabled={!meta}>{tr('Unsubscribed', 'Désinscrits')}{meta ? ` (${meta.suppressions})` : ''}</Button>
          <Button type="primary" icon={<Sparkles />} onClick={() => setCreating(true)} disabled={notInstalled}>{tr('New email', 'Nouvel email')}</Button>
        </>} />

      {noAddress && (
        <div className="og-banner tone-warn"><WarningOutlined /><div className="og-banner-body">
          <strong>{tr('Add the school’s postal address', 'Ajoutez l’adresse postale de l’école')}</strong>
          <span>{tr('Every campaign must show it (Canada’s anti-spam law). Emails cannot be sent until it is set.', 'Chaque email doit l’afficher (loi canadienne anti-pourriel). Aucun envoi tant qu’elle manque.')}</span>
        </div><Button size="small" onClick={() => setSender(true)}>{tr('Add it', 'L’ajouter')}</Button></div>
      )}

      <div className="og-kpis">
        <Kpi icon={<SendOutlined />} label={tr('Emails sent · 30 days', 'Emails envoyés · 30 jours')} value={summary ? summary.sent_30d.toLocaleString(locale) : '—'}
          note={summary ? (summary.sending ? tr(`${summary.sending} sending now`, `${summary.sending} en cours d’envoi`) : summary.scheduled ? tr(`${summary.scheduled} scheduled`, `${summary.scheduled} programmé(s)`) : tr('Nothing scheduled', 'Rien de programmé')) : undefined} />
        <Kpi icon={<EyeOutlined />} label={tr('Opened', 'Ouverts')} value={pct(summary?.open_rate_30d, tr)} note={tr('Approximate: some mail apps open every email', 'Approximatif : certaines messageries ouvrent tout')} />
        <Kpi icon={<ThunderboltOutlined />} label={tr('Clicked', 'Cliqués')} value={pct(summary?.click_rate_30d, tr)} note={summary ? `${people(summary.clicked_30d, tr)} ${tr('clicked', summary.clicked_30d <= 1 ? 'a cliqué' : 'ont cliqué')}` : undefined} />
        <Kpi icon={<FormOutlined />} label={tr('New answers', 'Nouvelles réponses')} value={summary?.new_responses ?? '—'} warn={!!summary?.new_responses} note={tr('Forms answered, not followed up yet', 'Formulaires remplis, pas encore traités')} />
        <Kpi icon={<StopOutlined />} label={tr('Unsubscribed · 30 days', 'Désinscrits · 30 jours')} value={summary?.unsubscribed_30d ?? '—'} warn={!!summary && summary.sent_30d > 0 && summary.unsubscribed_30d / summary.sent_30d > 0.01}
          note={tr('Above 1 %: send less often, or to better-chosen people', 'Au-delà de 1 % : envoyez moins souvent, ou à des personnes mieux choisies')} />
      </div>

      <section className="og-card">
        <div className="og-toolbar">
          <Input allowClear prefix={<SearchOutlined />} placeholder={tr('Search emails', 'Rechercher un email')} value={query} onChange={e => setQuery(e.target.value)} />
          <Segmented value={filter} onChange={v => setFilter(v as Filter)} options={[
            { value: 'all', label: tr('All', 'Tous') }, { value: 'draft', label: `${tr('Drafts', 'Brouillons')} ${count('draft')}` },
            { value: 'live', label: `${tr('Scheduled & sending', 'Programmés et en cours')} ${count('live')}` }, { value: 'sent', label: `${tr('Sent', 'Envoyés')} ${count('sent')}` },
          ]} />
          <span className="og-toolbar-spacer" />
          <Tooltip title={tr('Refresh', 'Actualiser')}><Button type="text" icon={<ReloadOutlined />} onClick={load} /></Tooltip>
        </div>
        {notInstalled ? (
          <Empty icon={<WarningOutlined />} title={tr('Email campaigns are not installed on the server yet', 'Les campagnes email ne sont pas encore installées sur le serveur')}
            text={tr('Run backend/database/run-email-campaigns-migration.js once on the server, then come back to this page.', 'Lancez backend/database/run-email-campaigns-migration.js une fois sur le serveur, puis revenez ici.')}
            action={<Button onClick={load}>{tr('Check again', 'Vérifier à nouveau')}</Button>} />
        ) : error ? (
          <Empty icon={<WarningOutlined />} title={tr('Emails could not be loaded', 'Les emails n’ont pas pu être chargés')} text={error} action={<Button onClick={load}>{tr('Try again', 'Réessayer')}</Button>} />
        ) : list === null ? (
          <div style={{ padding: 18 }}><Skeleton active paragraph={{ rows: 6 }} /></div>
        ) : visible.length === 0 ? (
          <Empty icon={<MailOutlined />} title={list.length ? tr('No email matches', 'Aucun email ne correspond') : tr('No email yet', 'Aucun email pour l’instant')}
            text={list.length ? tr('Try another search or filter.', 'Essayez une autre recherche ou un autre filtre.') : tr('Write your first email with the AI: tell it who it is for and what you want them to do.', 'Écrivez votre premier email avec l’IA : dites-lui à qui il s’adresse et ce que vous attendez des lecteurs.')}
            action={!list.length ? <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreating(true)}>{tr('New email', 'Nouvel email')}</Button> : undefined} />
        ) : (
          <div className="og-list">
            <div className="og-row is-email is-head"><span>{tr('Email', 'Email')}</span><span>{tr('State', 'État')}</span><span>{tr('Recipients', 'Destinataires')}</span><span>{tr('Opened', 'Ouverts')}</span><span>{tr('Clicked · answers', 'Clics · réponses')}</span><span /></div>
            {visible.map(c => (
              <div key={c.id} className="og-row is-email is-link" role="link" tabIndex={0}
                onClick={() => navigate(`/app/emails/${c.id}`)} onKeyDown={e => { if (e.key === 'Enter') navigate(`/app/emails/${c.id}`); }}>
                <span className="og-company-who">
                  <span className="mk-thumb" aria-hidden style={{ background: `linear-gradient(135deg, ${c.design.colors.primary}, ${c.design.colors.header_bg})` }}><MailOutlined className="em-thumb-ic" /></span>
                  <span className="og-cell-main"><strong>{c.name || tr('Untitled', 'Sans titre')}</strong><em>{c.content.fr.subject || c.content.en.subject || tr('No subject yet', 'Pas encore d’objet')}</em></span>
                </span>
                <span className="og-cell-main"><span><EmailStatusChip status={c.status} /></span><em>{whenOf(c, tr, locale)}</em></span>
                <span className="og-cell-main og-hide-sm">
                  <strong className="og-num">{c.stats.recipients || '—'}</strong>
                  <em>{c.status === 'sending' ? tr(`${Math.round(c.stats.progress * 100)} % sent`, `${Math.round(c.stats.progress * 100)} % envoyés`) : c.stats.failed ? tr(`${c.stats.failed} failed`, `${c.stats.failed} échec(s)`) : c.stats.recipients ? tr(`${c.stats.sent} delivered`, `${c.stats.sent} remis`) : tr('not sent yet', 'pas encore envoyé')}</em>
                </span>
                <span className="og-cell-main og-hide-sm"><strong className="og-num">{pct(c.stats.open_rate, tr)}</strong><em>{people(c.stats.opened, tr)}</em></span>
                <span className="og-cell-main"><strong className="og-num">{pct(c.stats.click_rate, tr)}</strong><em>{c.stats.responses ? counted(c.stats.responses, tr, ['answer', 'answers'], ['réponse', 'réponses']) : people(c.stats.clicked, tr)}</em></span>
                <span className="og-muted"><RightOutlined /></span>
              </div>
            ))}
          </div>
        )}
      </section>

      <EmailEditor open={creating} meta={meta} onClose={() => setCreating(false)} onSaved={c => { setCreating(false); navigate(`/app/emails/${c.id}`); }} />
      <SenderDetails open={sender} meta={meta} onClose={() => setSender(false)} onSaved={s => { setSender(false); setMeta(m => (m ? { ...m, settings: s } : m)); }} />
      <Suppressions open={suppressions} onClose={() => setSuppressions(false)} onChanged={load} />
    </div>
  );
};

export default EmailCampaigns;
