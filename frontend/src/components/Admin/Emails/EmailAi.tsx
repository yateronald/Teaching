import React, { useEffect, useRef, useState } from 'react';
import { Button, Input, Select, Switch, Tooltip } from 'antd';
import {
  BellOutlined, CalendarOutlined, CheckCircleFilled, FormOutlined, LinkOutlined, LoadingOutlined, NotificationOutlined, PictureOutlined, RobotOutlined,
  StopOutlined, SyncOutlined, TagOutlined, TeamOutlined, UndoOutlined, UpOutlined, WarningOutlined, WhatsAppOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../../contexts/AuthContext';
import { call } from '../../Org/orgModel';
import { Sparkles } from '../Marketing/CampaignAi';
import { promoImage } from '../../../promo/model';
import {
  emailError, goals, isHttps, isWhatsApp, modelStateLabel,
  type EmailDraft, type EmailFields, type EmailGoal, type EmailMeta, type EmailPicture as EmailPictureAnswer, type ModelChoice, type PicturePlace, type SecondaryAction, type Tr,
} from './emailModel';

/* The AI writer: the administrator says what the email is for and what its
   button does; the AI writes everything in French and in English (words,
   buttons, the form's questions, the offer box, the steps) and suggests a
   layout. Nothing is sent: the form and the preview show it, to correct. */

const IDEAS = (tr: Tr): { label: string; goal: EmailGoal; action: SecondaryAction; text: string }[] => [
  { label: tr('Follow up trial requests', 'Relancer les demandes d’essai'), goal: 'group', action: 'form', text: tr('Follow up the people who asked for a trial class but did not register. Our next group [level] starts on [date], [days and time] Montréal time, [8] seats, [price]. The button opens a form to book a seat (their level and availability).', 'Relancer les personnes qui ont demandé un cours d’essai sans s’inscrire. Notre prochain groupe [niveau] commence le [date], [jours et heure] heure de Montréal, [8] places, [prix]. Le bouton ouvre un formulaire pour réserver (niveau et disponibilités).') },
  { label: tr('Questions to students', 'Questionnaire aux élèves'), goal: 'survey', action: 'form', text: tr('Ask our students three or four short questions about their classes: what they like, what to improve, which new course they would like. It takes two minutes.', 'Poser trois ou quatre questions courtes à nos élèves sur leurs cours : ce qu’ils aiment, ce qu’il faut améliorer, quel nouveau cours ils aimeraient. Deux minutes.') },
  { label: tr('WhatsApp group', 'Groupe WhatsApp'), goal: 'whatsapp', action: 'whatsapp', text: tr('Invite them to join our free WhatsApp group: every week a short French exercise, tips for the TCF and answers from a native teacher.', 'Les inviter à rejoindre notre groupe WhatsApp gratuit : chaque semaine un court exercice, des conseils pour le TCF et les réponses d’une professeure native.') },
  { label: tr('Offer with a deadline', 'Offre limitée'), goal: 'offer', action: 'link', text: tr('[-20 %] on [what] until [date] for [who]. Say clearly what they get and how to take advantage of it.', '[-20 %] sur [quoi] jusqu’au [date] pour [qui]. Dire clairement ce qu’ils obtiennent et comment en profiter.') },
];

interface Props {
  editing: boolean;
  fields: EmailFields;
  meta: EmailMeta | null;
  tr: Tr;
  lang: 'fr' | 'en';
  /** The writers offered (Vertex), what each did lately, and the one picked. */
  choices: ModelChoice[];
  model: string | null;
  onModel: (id: string) => void;
  onChoices: (c: ModelChoice[]) => void;
  onDraft: (draft: EmailDraft, withDesign: boolean) => void;
  onPicture: (key: string, prompt: string, place: PicturePlace) => void;
  onSubject: (lang: 'fr' | 'en', subject: string) => void;
  onUndo?: () => void;
}

/* The model to write with (Vertex only): the administrator's pick; when it
   cannot answer, the next model writes and the notes say so. */
function ModelPicker({ choices, model, onModel, onChoices, disabled, tr }: {
  choices: ModelChoice[]; model: string | null; onModel: (id: string) => void; onChoices: (c: ModelChoice[]) => void; disabled: boolean; tr: Tr;
}) {
  const { apiCall } = useAuth();
  const [checking, setChecking] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const check = async () => {
    setChecking(true);
    setErr(null);
    try {
      const r = await call<{ choices: ModelChoice[] }>(apiCall, '/admin/email-campaigns/ai/models/check', 'POST', {});
      onChoices(r.choices);
    } catch (e) { setErr(emailError(e, tr)); } finally { setChecking(false); }
  };
  const picked = choices.find(c => c.id === model);
  const options = choices.map(c => ({
    value: c.id,
    label: <span className="em-model-option"><span>{c.label}</span>{c.state && <em className={`is-${c.state}`}>{modelStateLabel(c.state, tr)}</em>}</span>,
    disabled: false,
  }));
  if (!choices.some(c => c.id === 'gemini-4-neon')) {
    options.push({
      value: 'gemini-4-neon',
      label: <span className="em-model-option"><span>Gemini 4 Neon</span><em>{tr('Requires backend update', 'Mise à jour du serveur requise')}</em></span>,
      disabled: true,
    });
  }
  return (
    <div className="em-model">
      <div className="em-model-row">
        <span className="em-model-label"><RobotOutlined /> {tr('Model', 'Modèle')}</span>
        <Select size="small" variant="filled" value={model ?? undefined} onChange={v => onModel(v)} disabled={disabled} popupMatchSelectWidth={false}
          aria-label={tr('AI model (Vertex AI)', 'Modèle d’IA (Vertex AI)')} className="em-model-select"
          labelRender={() => <span className="em-model-option"><span>{picked?.label || model}</span>{picked?.state && <i className={`is-${picked.state}`} aria-hidden />}</span>}
          options={options} />
        <Tooltip title={tr('Check which models answer on your Vertex project (one short call each)', 'Vérifier quels modèles répondent sur votre projet Vertex (un court appel chacun)')}>
          <Button size="small" type="text" icon={<SyncOutlined spin={checking} />} onClick={check} disabled={disabled || checking} aria-label={tr('Check the models', 'Vérifier les modèles')} />
        </Tooltip>
      </div>
      {picked?.state === 'missing' && <small className="og-text-warn">{tr(
        `${picked.label} is not available on your Vertex project yet: Gemini 3.8 will write instead.`,
        `${picked.label} n’est pas encore disponible sur votre projet Vertex : Gemini 3.8 écrira à sa place.`,
      )}</small>}
      {err && <small className="og-text-warn">{err}</small>}
    </div>
  );
}

const GOAL_ICONS: Record<EmailGoal, React.ReactNode> = {
  group: <TeamOutlined />, offer: <TagOutlined />, survey: <FormOutlined />, whatsapp: <WhatsAppOutlined />,
  event: <CalendarOutlined />, news: <NotificationOutlined />, reminder: <BellOutlined />,
};
const ACTION_ICONS: Record<SecondaryAction, React.ReactNode> = {
  none: <StopOutlined />, link: <LinkOutlined />, form: <FormOutlined />, whatsapp: <WhatsAppOutlined />,
};

/** A numbered step of the panel: its number, its title, a hint, then what it holds. */
function Step({ n, title, hint, children }: { n: number; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="em-ai-step">
      <div className="em-ai-step-head"><span className="em-ai-n">{n}</span><strong>{title}</strong>{hint && <em>{hint}</em>}</div>
      {children}
    </div>
  );
}

const EmailAi: React.FC<Props> = ({ editing, fields, meta, tr, lang, choices, model, onModel, onChoices, onDraft, onPicture, onSubject, onUndo }) => {
  const { apiCall } = useAuth();
  const [open, setOpen] = useState(!editing);
  const [brief, setBrief] = useState('');
  const [goal, setGoal] = useState<EmailGoal>(fields.goal);
  const [promotion, setPromotion] = useState<number | null>(fields.promotion_id);
  const [primary, setPrimary] = useState<{ action: SecondaryAction; url: string }>({ action: fields.buttons.primary.action, url: fields.buttons.primary.url || '' });
  const [secondary, setSecondary] = useState<{ action: SecondaryAction; url: string }>({ action: fields.buttons.secondary.action, url: fields.buttons.secondary.url || '' });
  const [withPicture, setWithPicture] = useState(false);
  const [picturePrompt, setPicturePrompt] = useState('');
  const [place, setPlace] = useState<PicturePlace>('top');
  const [withDesign, setWithDesign] = useState(!editing);
  const [phase, setPhase] = useState<'idle' | 'writing' | 'drawing'>('idle');
  const [seconds, setSeconds] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<{ draft: EmailDraft; picture?: { key: string; prompt: string; warning: string | null } | null; pictureError?: string | null } | null>(null);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useEffect(() => {
    if (phase === 'idle') return;
    setSeconds(0);
    const t = window.setInterval(() => setSeconds(s => s + 1), 1000);
    return () => window.clearInterval(t);
  }, [phase]);

  const hasContent = !!(fields.content.fr.subject || fields.content.en.subject || fields.content.fr.body || fields.content.en.body);
  const busy = phase !== 'idle';
  // A link typed must be right; an empty one is fine to write (the AI does not need it; it is asked before sending).
  const urlOk = (b: { action: SecondaryAction; url: string }) => {
    if (!b.url.trim()) return true;
    if (b.action === 'link') return isHttps(b.url);
    if (b.action === 'whatsapp') return isWhatsApp(b.url);
    return true;
  };
  const ready = brief.trim().length >= 8 && urlOk(primary) && urlOk(secondary);

  const run = async () => {
    setErr(null);
    setResult(null);
    setPhase('writing');
    try {
      const draft = await call<EmailDraft>(apiCall, '/admin/email-campaigns/ai/draft', 'POST', {
        brief, goal, promotion_id: promotion,
        primary: { action: primary.action, url: primary.url.trim() || null },
        secondary: { action: secondary.action, url: secondary.url.trim() || null },
        current: { ...fields, goal, promotion_id: promotion },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, notes_lang: lang,
        model, picture: withPicture, picture_prompt: withPicture ? picturePrompt.trim() || null : null,
      });
      if (!alive.current) return;
      if (draft.choices?.length) onChoices(draft.choices);
      onDraft(draft, withDesign);
      setResult({ draft });
      const scene = (draft.image_prompt || picturePrompt).trim();
      if (!withPicture || scene.length < 12) return;
      // The picture, by the marketing painter, from the description the writer refined.
      setPhase('drawing');
      try {
        const pic = await call<EmailPictureAnswer>(apiCall, '/admin/email-campaigns/ai/image', 'POST', {
          prompt: scene, theme: draft.fields.design?.theme || fields.design.theme, title: draft.fields.content?.en.headline || draft.fields.content?.fr.headline,
        });
        if (!alive.current) return;
        onPicture(pic.image_key, scene, place);
        setResult({ draft, picture: { key: pic.image_key, prompt: scene, warning: pic.warning } });
      } catch (e) {
        if (alive.current) setResult({ draft, pictureError: emailError(e, tr) });
      }
    } catch (e) {
      if (alive.current) setErr(emailError(e, tr));
    } finally {
      if (alive.current) setPhase('idle');
    }
  };

  if (!open) {
    return (
      <button type="button" className="mk-ai-open" onClick={() => setOpen(true)}>
        <span className="mk-ai-mark"><Sparkles size={18} /></span>
        <span><strong>{editing || hasContent ? tr('Change it with AI', 'Le modifier avec l’IA') : tr('Write it with AI', 'L’écrire avec l’IA')}</strong>
          <em>{tr('Say what the email is for: the AI writes it in French and English.', 'Dites à quoi sert l’email : l’IA l’écrit en français et en anglais.')}</em></span>
      </button>
    );
  }

  const actionLabel = (a: SecondaryAction) => ({
    none: tr('None', 'Aucun'), link: tr('A page', 'Une page'), form: tr('A form', 'Un formulaire'), whatsapp: 'WhatsApp',
  }[a]);
  const actionPills = (b: { action: SecondaryAction }, set: (a: SecondaryAction) => void, withNone: boolean, name: string) => (
    <div className="em-ai-pills" role="radiogroup" aria-label={name}>
      {([...(withNone ? ['none'] : []), 'link', 'form', 'whatsapp'] as SecondaryAction[]).map(a => (
        <button key={a} type="button" role="radio" aria-checked={b.action === a} className={`em-goal is-${a}${b.action === a ? ' is-on' : ''}`} onClick={() => set(a)} disabled={busy}>
          {ACTION_ICONS[a]}{actionLabel(a)}
        </button>
      ))}
    </div>
  );
  const urlInput = (b: { action: SecondaryAction; url: string }, set: (v: string) => void) => (b.action === 'link' || b.action === 'whatsapp') && (
    <Input value={b.url} onChange={e => set(e.target.value)} disabled={busy} status={!b.url.trim() || urlOk(b) ? undefined : 'error'} allowClear
      prefix={b.action === 'whatsapp' ? <WhatsAppOutlined style={{ color: '#1fa855' }} /> : <LinkOutlined className="og-muted" />}
      placeholder={b.action === 'whatsapp' ? 'https://chat.whatsapp.com/…' : tr('https://… or leave empty', 'https://… ou laissez vide')} />
  );
  const buttonNote = (b: { action: SecondaryAction; url: string }) => (
    b.action === 'link' ? (b.url ? null : tr('Empty: the AI picks the right page of the site.', 'Vide : l’IA choisit la bonne page du site.'))
      : b.action === 'form' ? tr('The AI writes its questions; you can change them after.', 'L’IA écrit ses questions ; vous pourrez les changer.')
        : b.action === 'whatsapp' ? (isWhatsApp(b.url) ? null : tr('Paste the group’s invitation link (https://chat.whatsapp.com/…).', 'Collez le lien d’invitation du groupe (https://chat.whatsapp.com/…).'))
          : tr('A softer second choice, e.g. the WhatsApp group next to a form.', 'Un second choix plus doux, ex. le groupe WhatsApp à côté d’un formulaire.')
  );
  const promotionTitle = (p: EmailMeta['promotions'][number]) => (lang === 'fr' ? p.title_fr || p.title_en : p.title_en || p.title_fr) || p.slug;
  const waitHint = brief.trim().length < 8
    ? tr('Describe the email in a sentence or two to start.', 'Décrivez l’email en une ou deux phrases pour commencer.')
    : !urlOk(primary) || !urlOk(secondary) ? tr('Check the button links above.', 'Vérifiez les liens des boutons ci-dessus.') : null;

  return (
    <section className="mk-ai em-ai" aria-label={tr('Write the email with AI', 'Écrire l’email avec l’IA')}>
      <header>
        <span className="mk-ai-mark"><Sparkles size={18} /></span>
        <div>
          <strong>{hasContent ? tr('Change this email with AI', 'Modifier cet email avec l’IA') : tr('Write the email with AI', 'Écrire l’email avec l’IA')}</strong>
          <span>{tr('In French and English, from your facts only · about 20 seconds', 'En français et en anglais, avec vos informations seulement · environ 20 secondes')}</span>
        </div>
        <Tooltip title={tr('Close', 'Fermer')}><Button type="text" size="small" icon={<UpOutlined />} onClick={() => setOpen(false)} aria-label={tr('Close the AI panel', 'Fermer le panneau IA')} /></Tooltip>
      </header>

      {meta && !meta.ai.available ? (
        <p className="mk-ai-off"><WarningOutlined /> {tr('The AI engine is not configured on the server. Write the email by hand.', 'Le moteur d’IA n’est pas configuré sur le serveur. Écrivez l’email à la main.')}</p>
      ) : (
        <>
          <Step n={1} title={tr('What is it for?', 'À quoi sert-il ?')}>
            <div className="em-ai-pills" role="radiogroup" aria-label={tr('What the email is for', 'À quoi sert l’email')}>
              {goals(tr).map(g => (
                <button key={g.value} type="button" role="radio" aria-checked={goal === g.value} className={`em-goal${goal === g.value ? ' is-on' : ''}`}
                  onClick={() => setGoal(g.value)} disabled={busy} title={g.hint}>{GOAL_ICONS[g.value]}{g.label}</button>
              ))}
            </div>
          </Step>

          <Step n={2} title={hasContent ? tr('What should change?', 'Que faut-il changer ?') : tr('Your brief', 'Votre brief')}
            hint={hasContent ? undefined : tr('in French or English', 'en français ou en anglais')}>
            <Input.TextArea className="em-ai-brief" value={brief} onChange={e => setBrief(e.target.value)} autoSize={{ minRows: 4, maxRows: 10 }} maxLength={4000} disabled={busy}
              placeholder={hasContent
                ? tr('e.g. « Shorter », « Say there are only 3 seats left », « Ask also for their exam date ».', 'ex. « Plus court », « Dire qu’il reste 3 places », « Demander aussi la date d’examen ».')
                : tr('The class, the dates, the price, the deadline, what people should do… The AI only uses your facts and tells you what is missing.', 'Le cours, les dates, le prix, la date limite, ce que les gens doivent faire… L’IA n’utilise que vos informations et signale ce qui manque.')} />
            {!brief && !hasContent && (
              <div className="mk-ai-ideas">
                <span>{tr('Start from:', 'Partir de :')}</span>
                {IDEAS(tr).map(i => <button key={i.label} type="button" onClick={() => { setBrief(i.text); setGoal(i.goal); setPrimary(p => ({ ...p, action: i.action })); }}>{i.label}</button>)}
              </div>
            )}
            {brief.includes('[') && <p className="mk-ai-hint">{tr('Replace what is in [brackets] with your details: anything left is reported as missing.', 'Remplacez ce qui est entre [crochets] : ce qui reste est signalé comme manquant.')}</p>}
          </Step>

          <Step n={3} title={tr('What should people do?', 'Que doivent faire les gens ?')}>
            <div className="em-ai-buttons">
              <div className="em-ai-button is-primary">
                <span className="em-ai-button-title">{tr('Main button', 'Bouton principal')}</span>
                {actionPills(primary, a => setPrimary(p => ({ ...p, action: a })), false, tr('The main button opens', 'Le bouton principal ouvre'))}
                {urlInput(primary, v => setPrimary(p => ({ ...p, url: v })))}
                {buttonNote(primary) && <small>{buttonNote(primary)}</small>}
              </div>
              <div className="em-ai-button">
                <span className="em-ai-button-title">{tr('Second button', 'Deuxième bouton')} <em>{tr('optional', 'facultatif')}</em></span>
                {actionPills(secondary, a => setSecondary(p => ({ ...p, action: a })), true, tr('The second button opens', 'Le deuxième bouton ouvre'))}
                {urlInput(secondary, v => setSecondary(p => ({ ...p, url: v })))}
                {buttonNote(secondary) && <small>{buttonNote(secondary)}</small>}
              </div>
            </div>
          </Step>

          <Step n={4} title={tr('Extras', 'En plus')} hint={tr('optional', 'facultatif')}>
            <div className="em-ai-extras">
              <div className="em-ai-extra">
                <div className="em-ai-extra-head">
                  <span className="em-ai-extra-ic is-campaign"><NotificationOutlined /></span>
                  <span className="em-ai-extra-text"><strong>{tr('Promote a marketing campaign', 'Promouvoir une campagne marketing')}</strong>
                    <em>{tr('Its dates, price and seats are used as facts.', 'Ses dates, son prix et ses places servent de faits.')}</em></span>
                  <Select allowClear value={promotion ?? undefined} onChange={v => setPromotion(v ?? null)} disabled={busy} placeholder={tr('None', 'Aucune')} showSearch optionFilterProp="label"
                    className="em-ai-extra-select" popupMatchSelectWidth={false}
                    options={(meta?.promotions || []).map(p => ({ value: p.id, label: promotionTitle(p) }))} />
                </div>
              </div>
              <div className={`em-ai-extra${withPicture ? ' is-on' : ''}`}>
                <div className="em-ai-extra-head">
                  <span className="em-ai-extra-ic is-picture"><PictureOutlined /></span>
                  <span className="em-ai-extra-text"><strong>{tr('Add a picture', 'Ajouter une image')}</strong>
                    <em>{tr(`By ${meta?.ai.image_model || 'the marketing painter'}, like the marketing campaigns · about 15 s`, `Par ${meta?.ai.image_model || 'le peintre du marketing'}, comme les campagnes marketing · environ 15 s`)}</em></span>
                  <Switch checked={withPicture} onChange={setWithPicture} disabled={busy} aria-label={tr('Add a picture', 'Ajouter une image')} />
                </div>
                {withPicture && (
                  <div className="em-ai-extra-body">
                    <Input.TextArea value={picturePrompt} onChange={e => setPicturePrompt(e.target.value)} autoSize={{ minRows: 2, maxRows: 5 }} maxLength={600} disabled={busy}
                      placeholder={tr(
                        'Describe it (optional): who, where, doing what, the mood. e.g. « An adult learner at home in the evening, smiling during an online French class ». Empty: the AI imagines one that fits the email.',
                        'Décrivez-la (facultatif) : qui, où, en train de faire quoi, l’ambiance. ex. « Une adulte chez elle le soir, souriante pendant un cours de français en ligne ». Vide : l’IA en imagine une qui va avec l’email.',
                      )} />
                    <div className="em-ai-place" role="radiogroup" aria-label={tr('Where the picture goes', 'Où va l’image')}>
                      {([['top', tr('At the top, large', 'En haut, en grand')], ['inline', tr('Under the headline', 'Sous le titre')]] as [PicturePlace, string][]).map(([v, label]) => (
                        <button key={v} type="button" role="radio" aria-checked={place === v} className={`em-ai-place-opt is-${v}${place === v ? ' is-on' : ''}`} onClick={() => setPlace(v)} disabled={busy}>
                          <i aria-hidden><b /><s /><s /></i>{label}
                        </button>
                      ))}
                    </div>
                    <small className="og-muted">{tr('Checked for text and logos before it is used.', 'Vérifiée (texte, logos) avant d’être utilisée.')}</small>
                  </div>
                )}
              </div>
            </div>
          </Step>

          <div className="em-ai-foot">
            <div className="em-ai-settings">
              {meta?.ai.engine === 'vertex' && (
                <ModelPicker choices={choices} model={model} onModel={onModel} onChoices={onChoices} disabled={busy} tr={tr} />
              )}
              <Tooltip title={tr('Use the layout the AI picks for this kind of email (you can change it in Design).', 'Utiliser la mise en page choisie par l’IA pour ce type d’email (modifiable dans Design).')}>
                <label className="mk-switch"><Switch size="small" checked={withDesign} onChange={setWithDesign} disabled={busy} /><span>{tr('Apply its layout', 'Appliquer sa mise en page')}</span></label>
              </Tooltip>
            </div>
            <div className="em-ai-go-row">
              {waitHint && !busy && <small className="em-ai-wait">{waitHint}</small>}
              {onUndo && result && !busy && <Button icon={<UndoOutlined />} onClick={() => { onUndo(); setResult(null); }}>{tr('Undo', 'Annuler')}</Button>}
              <Button type="primary" size="large" className="mk-ai-go" onClick={run} disabled={busy || !ready} icon={busy ? <LoadingOutlined /> : <Sparkles />}>
                {busy ? tr('Working…', 'L’IA travaille…') : hasContent ? tr('Apply the changes', 'Appliquer les changements') : withPicture ? tr('Write the email and its picture', 'Écrire l’email et son image') : tr('Write the email', 'Écrire l’email')}
              </Button>
            </div>
          </div>

          {busy && (
            <ol className="mk-ai-steps" aria-live="polite">
              <li className={phase === 'writing' ? 'is-on' : 'is-done'}>
                {phase === 'writing' ? <LoadingOutlined /> : <CheckCircleFilled />}
                {tr('Writing in French and English', 'Écriture en français et en anglais')}
                {model && meta?.ai.engine === 'vertex' ? ` · ${choices.find(c => c.id === model)?.label || model}` : ''}{phase === 'writing' ? ` · ${seconds} s` : ''}
              </li>
              {withPicture && <li className={phase === 'drawing' ? 'is-on' : ''}>{phase === 'drawing' ? <LoadingOutlined /> : <PictureOutlined />}{tr('Creating the picture', 'Création de l’image')}{phase === 'drawing' ? ` · ${seconds} s` : ''}</li>}
            </ol>
          )}
          {err && <div className="og-check tone-bad"><WarningOutlined /><span>{err}</span></div>}

          {result && !busy && (
            <div className="mk-ai-result" aria-live="polite">
              <p className="mk-ai-done"><CheckCircleFilled /> {tr(
                `Written by ${result.draft.model_label || result.draft.model}: read it, correct what is needed, then save.`,
                `Écrit par ${result.draft.model_label || result.draft.model} : relisez, corrigez si besoin, puis enregistrez.`,
              )}</p>
              {result.picture && (
                <div className="em-ai-result-picture">
                  <img src={promoImage(result.picture.key)} alt="" />
                  <span>
                    <strong>{tr('Picture added', 'Image ajoutée')} · {place === 'top' ? tr('at the top', 'en haut') : tr('under the headline', 'sous le titre')}</strong>
                    <em>{result.picture.prompt}</em>
                    <small>{tr('Change it or make another one in the Design tab.', 'Changez-la ou créez-en une autre dans l’onglet Design.')}</small>
                  </span>
                </div>
              )}
              {result.picture?.warning && <p className="mk-ai-warn"><WarningOutlined /> {result.picture.warning}</p>}
              {result.pictureError && <p className="mk-ai-warn"><WarningOutlined /> {tr('The email is written, but the picture could not be made:', 'L’email est écrit, mais l’image n’a pas pu être faite :')} {result.pictureError}</p>}
              {(result.draft.subject_ideas.fr.length > 0 || result.draft.subject_ideas.en.length > 0) && <>
                <p className="mk-ai-check">{tr('Other subjects to try (click to use)', 'Autres objets à essayer (cliquez pour l’utiliser)')}</p>
                <div className="em-ideas">
                  {(['fr', 'en'] as const).flatMap(l => result.draft.subject_ideas[l].map(s => (
                    <button key={`${l}${s}`} type="button" onClick={() => onSubject(l, s)}><b>{l.toUpperCase()}</b>{s}</button>
                  )))}
                </div>
              </>}
              {!!result.draft.notes.length && <>
                <p className="mk-ai-check">{tr('To check before sending', 'À vérifier avant l’envoi')}</p>
                <ul>{result.draft.notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
              </>}
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default EmailAi;
