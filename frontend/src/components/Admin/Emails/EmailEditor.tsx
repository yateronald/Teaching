import React, { useEffect, useMemo, useState } from 'react';
import { App as AntApp, Button, Drawer, Input, Segmented, Tabs } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { useAuth } from '../../../contexts/AuthContext';
import { call, errorText } from '../../Org/orgModel';
import { useTr } from '../../../utils/useTr';
import EmailAi from './EmailAi';
import EmailAudience, { type AudienceResult } from './EmailAudience';
import EmailContent from './EmailContent';
import EmailActions from './EmailActions';
import EmailDesign from './EmailDesign';
import EmailPreview from './EmailPreview';
import {
  blankEmail, fieldsOf, languageModes, linkProblems, missingFor, placePicture, saveModel, savedModel, usesForm, withDraft,
  type EmailCampaign, type EmailDraft, type EmailFields, type EmailMeta, type Lang, type LanguageMode, type ModelChoice, type Words,
} from './emailModel';
import '../../Org/Org.css';
import '../Marketing/Marketing.css';
import './Emails.css';

interface Props {
  open: boolean;
  meta: EmailMeta | null;
  campaign?: EmailCampaign | null;
  onClose: () => void;
  onSaved: (c: EmailCampaign) => void;
}

/* Administrator: write or change an email, and see it as it will arrive while typing. */
const EmailEditor: React.FC<Props> = ({ open, meta, campaign, onClose, onSaved }) => {
  const { apiCall } = useAuth();
  const { tr, lang: uiLang } = useTr();
  const { message } = AntApp.useApp();
  const [f, setF] = useState<EmailFields>(() => blankEmail(meta));
  const [lang, setLang] = useState<Lang>('fr');
  const [tab, setTab] = useState('who');
  const [beforeAi, setBeforeAi] = useState<EmailFields | null>(null);
  const [imagePrompt, setImagePrompt] = useState('');
  const [audience, setAudience] = useState<AudienceResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  // The writer picked for the AI (Vertex): kept on this computer for the next email.
  const [choices, setChoices] = useState<ModelChoice[]>([]);
  const [aiModel, setAiModel] = useState<string | null>(null);
  useEffect(() => {
    const list = meta?.ai.writing_choices || [];
    setChoices(list);
    setAiModel(meta?.ai.engine === 'vertex' ? savedModel(list) : null);
  }, [meta]);
  const pickModel = (id: string) => { setAiModel(id); saveModel(id); };

  useEffect(() => {
    if (!open) return;
    const base = campaign ? fieldsOf(campaign) : blankEmail(meta);
    setF(base);
    setLang(base.language_mode === 'en' || (base.language_mode === 'auto' && base.default_lang === 'en') ? 'en' : 'fr');
    setTab(campaign ? 'message' : 'who');
    setBeforeAi(null);
    setImagePrompt('');
    setErr(null);
  }, [open, campaign, meta]);

  const set = (patch: Partial<EmailFields>) => setF(v => ({ ...v, ...patch }));
  const setWords = (l: Lang, patch: Partial<Words>) => setF(v => ({ ...v, content: { ...v.content, [l]: { ...v.content[l], ...patch } } }));

  const applyDraft = (d: EmailDraft, withDesign: boolean) => {
    setBeforeAi(prev => prev ?? f);
    setF(v => withDraft(v, d.fields, { design: withDesign }));
    setImagePrompt(d.image_prompt);
    setTab('message');
  };

  const missing = useMemo(() => missingFor(f, tr, { postalAddress: meta?.settings.postal_address, recipients: audience?.counts.total }), [f, tr, meta, audience]);
  // What stops saving: a wrong link, a form without an email field or a list without choices (the server refuses them).
  // Anything else (a link not given yet, a subject in one language…) only stops sending.
  const blocking = [...linkProblems(f, tr), ...missing.filter(m => /email field|champ email|choices|choix/.test(m))];
  const canSave = !!(f.content.fr.subject || f.content.en.subject || f.content.fr.headline || f.content.en.headline) && !blocking.length;

  const save = async () => {
    setBusy(true);
    setErr(null);
    try {
      const r = campaign
        ? await call<{ campaign: EmailCampaign }>(apiCall, `/admin/email-campaigns/${campaign.id}`, 'PUT', f)
        : await call<{ campaign: EmailCampaign }>(apiCall, '/admin/email-campaigns', 'POST', f);
      message.success(campaign ? tr('Email saved', 'Email enregistré') : tr('Draft saved: send yourself a test, then send it', 'Brouillon enregistré : envoyez-vous un test, puis envoyez-le'));
      onSaved(r.campaign);
    } catch (e) { setErr(errorText(e, (en: string) => en)); } finally { setBusy(false); }
  };

  const modes = languageModes(tr);
  const words = f.content[lang];
  const sender = meta?.settings.sender_name || meta?.sender.name || 'Learn French with Natives';

  return (
    <Drawer open={open} onClose={onClose} width="min(1400px, 100vw)" rootClassName="og-drawer mk-drawer" destroyOnHidden
      title={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}><MailOutlined />{campaign ? tr('Edit the email', 'Modifier l’email') : tr('New email', 'Nouvel email')}</span>}
      footer={<div className="og-foot">
        <span className="og-foot-note">{!canSave
          ? (blocking.length ? `${tr('To fix', 'À corriger')} : ${blocking.join(', ')}.` : tr('Write a subject (or let the AI write the email).', 'Écrivez un objet (ou laissez l’IA écrire l’email).'))
          : missing.length ? `${tr('Before sending', 'Avant l’envoi')} : ${missing.join(', ')}.` : tr('Ready: save, send yourself a test, then send it.', 'Prêt : enregistrez, envoyez-vous un test, puis envoyez-le.')}</span>
        <Button onClick={onClose}>{tr('Cancel', 'Annuler')}</Button>
        <Button type="primary" onClick={save} loading={busy} disabled={!canSave}>{campaign ? tr('Save', 'Enregistrer') : tr('Save the draft', 'Enregistrer le brouillon')}</Button>
      </div>}>
      <div className="em-editor">
        <div className="og-form">
          <EmailAi editing={!!campaign} fields={f} meta={meta} tr={tr} lang={uiLang} onDraft={applyDraft}
            choices={choices} model={aiModel} onModel={pickModel} onChoices={setChoices}
            onUndo={beforeAi ? () => { setF(beforeAi); setBeforeAi(null); } : undefined}
            onPicture={(k, p, place) => { setF(v => ({ ...v, image_key: k, design: placePicture(v.design, place) })); setImagePrompt(p); }}
            onSubject={(l, s) => { setWords(l, { subject: s }); setLang(l); setTab('message'); }} />
          {err && <div className="og-check tone-bad"><span>{err}</span></div>}

          <Tabs className="og-tabs em-tabs" activeKey={tab} onChange={setTab} items={[
            {
              key: 'who', label: `1 · ${tr('Recipients', 'Destinataires')}${audience ? ` (${audience.counts.total})` : ''}`,
              children: <EmailAudience meta={meta} audience={f.audience} excluded={f.excluded} onChange={a => set({ audience: a })} onExcluded={e => set({ excluded: e })} onResult={setAudience} />,
            },
            {
              key: 'message', label: `2 · ${tr('Message', 'Message')}`,
              children: <EmailContent fields={f} lang={lang} onLang={setLang} onWords={setWords} onOffer={patch => set({ offer: { ...f.offer, ...patch } })} tr={tr} />,
            },
            {
              key: 'actions', label: `3 · ${usesForm(f) ? tr('Buttons and form', 'Boutons et formulaire') : tr('Buttons', 'Boutons')}`,
              children: <EmailActions fields={f} meta={meta} tr={tr} lang={lang} onLang={setLang} onChange={set} onWords={setWords} />,
            },
            {
              key: 'design', label: `4 · ${tr('Design', 'Design')}`,
              children: <EmailDesign fields={f} meta={meta} campaignId={campaign?.id} tr={tr} lang={lang} imagePrompt={imagePrompt} model={aiModel} onChoices={setChoices}
                onDesign={d => set({ design: d })} onImage={(k, p) => { set({ image_key: k }); setImagePrompt(p); }} />,
            },
            {
              key: 'settings', label: `5 · ${tr('Language and name', 'Langue et nom')}`,
              children: (
                <div className="og-form">
                  <div className="em-langs">
                    {(Object.keys(modes) as LanguageMode[]).map(m => (
                      <button key={m} type="button" className={`em-lang${f.language_mode === m ? ' is-on' : ''}`} onClick={() => set({ language_mode: m })} aria-pressed={f.language_mode === m}>
                        <strong>{modes[m].label}</strong><em>{modes[m].hint}</em>
                      </button>
                    ))}
                  </div>
                  {f.language_mode === 'auto' && (
                    <div className="og-field"><label>{tr('Main language', 'Langue principale')} <em>{tr('for people whose language is unknown (most students and trial requests)', 'pour les personnes dont la langue est inconnue (la plupart des élèves et des demandes d’essai)')}</em></label>
                      <Segmented value={f.default_lang} onChange={v => set({ default_lang: v as Lang })} options={[{ value: 'fr', label: tr('French', 'Français') }, { value: 'en', label: tr('English', 'Anglais') }]} /></div>
                  )}
                  <div className="og-field"><label>{tr('Name of this email', 'Nom de cet email')} <em>{tr('only you see it', 'vous seul le voyez')}</em></label>
                    <Input value={f.name || ''} onChange={e => set({ name: e.target.value || null })} maxLength={140} placeholder={words.subject || tr('e.g. A1 January – trial requests', 'ex. A1 janvier – demandes d’essai')} /></div>
                </div>
              ),
            },
          ]} />
        </div>

        <aside className="em-side">
          <EmailPreview fields={f} senderName={sender} source={audience?.people[0]?.source} lang={lang} onLang={setLang} campaignId={campaign?.id} tr={tr} />
        </aside>
      </div>
    </Drawer>
  );
};

export default EmailEditor;
