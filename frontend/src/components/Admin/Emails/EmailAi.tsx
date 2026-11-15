import React, { useEffect, useRef, useState } from 'react';
import { Button, Input, Segmented, Select, Switch, Tooltip } from 'antd';
import { CheckCircleFilled, FormOutlined, LinkOutlined, LoadingOutlined, PictureOutlined, UndoOutlined, UpOutlined, WarningOutlined, WhatsAppOutlined } from '@ant-design/icons';
import { useAuth } from '../../../contexts/AuthContext';
import { call, errorText } from '../../Org/orgModel';
import { Sparkles } from '../Marketing/CampaignAi';
import { promoImage } from '../../../promo/model';
import {
  goals, isHttps, isWhatsApp, modelStateLabel,
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
    } catch (e) { setErr(errorText(e, (en: string) => en)); } finally { setChecking(false); }
  };
  const picked = choices.find(c => c.id === model);
  return (
    <div className="og-field em-model"><label>{tr('AI model', 'Modèle d’IA')} <em>{tr('Vertex AI', 'Vertex AI')}</em></label>
      <div className="em-model-row">
        <Select value={model ?? undefined} onChange={v => onModel(v)} disabled={disabled} style={{ minWidth: 220, flex: 1 }}
          options={choices.map(c => ({
            value: c.id,
            label: <span className="em-model-option"><span>{c.label}</span>{c.state && <i className={`is-${c.state}`}>{modelStateLabel(c.state, tr)}</i>}</span>,
          }))} />
        <Tooltip title={tr('One short call to each model, to see which ones answer on your project.', 'Un court appel à chaque modèle, pour voir lesquels répondent sur votre projet.')}>
          <Button onClick={check} loading={checking} disabled={disabled}>{tr('Check', 'Vérifier')}</Button>
        </Tooltip>
      </div>
      {picked?.state === 'missing' && <small className="og-text-warn">{tr(
        `${picked.label} did not answer on your Vertex project (not found or no access): the next model will write instead.`,
        `${picked.label} n’a pas répondu sur votre projet Vertex (introuvable ou accès non accordé) : le modèle suivant écrira à sa place.`,
      )}</small>}
      {err && <small className="og-text-warn">{err}</small>}
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
  const urlOk = (b: { action: SecondaryAction; url: string }) => (b.action === 'link' ? !b.url || isHttps(b.url) : b.action === 'whatsapp' ? isWhatsApp(b.url) : true);
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
        if (alive.current) setResult({ draft, pictureError: errorText(e, (en: string) => en) });
      }
    } catch (e) {
      if (alive.current) setErr(errorText(e, (en: string) => en));
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

  const actions = (withNone: boolean) => [
    ...(withNone ? [{ value: 'none', label: tr('None', 'Aucun') }] : []),
    { value: 'link', label: <span><LinkOutlined /> {tr('A page', 'Une page')}</span> },
    { value: 'form', label: <span><FormOutlined /> {tr('A form', 'Un formulaire')}</span> },
    { value: 'whatsapp', label: <span><WhatsAppOutlined /> WhatsApp</span> },
  ];
  const urlInput = (b: { action: SecondaryAction; url: string }, set: (v: string) => void) => (b.action === 'link' || b.action === 'whatsapp') && (
    <Input size="small" value={b.url} onChange={e => set(e.target.value)} disabled={busy} status={urlOk(b) ? undefined : 'error'}
      prefix={b.action === 'whatsapp' ? <WhatsAppOutlined style={{ color: '#1fa855' }} /> : <LinkOutlined />}
      placeholder={b.action === 'whatsapp' ? 'https://chat.whatsapp.com/…' : tr('https://… (optional: the AI picks a page of the site)', 'https://… (facultatif : l’IA choisit une page du site)')} />
  );

  return (
    <section className="mk-ai" aria-label={tr('Write the email with AI', 'Écrire l’email avec l’IA')}>
      <header>
        <span className="mk-ai-mark"><Sparkles size={18} /></span>
        <div>
          <strong>{hasContent ? tr('Change this email with AI', 'Modifier cet email avec l’IA') : tr('Write the email with AI', 'Écrire l’email avec l’IA')}</strong>
          <span>{meta?.ai.available ? `${meta.ai.writing_model} · ${meta.ai.engine === 'vertex' ? 'Vertex AI' : 'Gemini API'}` : tr('Uses the platform’s AI engine.', 'Utilise le moteur d’IA de la plateforme.')}</span>
        </div>
        <Tooltip title={tr('Close', 'Fermer')}><Button type="text" size="small" icon={<UpOutlined />} onClick={() => setOpen(false)} aria-label={tr('Close the AI panel', 'Fermer le panneau IA')} /></Tooltip>
      </header>

      {meta && !meta.ai.available ? (
        <p className="mk-ai-off"><WarningOutlined /> {tr('The AI engine is not configured on the server. Write the email by hand.', 'Le moteur d’IA n’est pas configuré sur le serveur. Écrivez l’email à la main.')}</p>
      ) : (
        <>
          {meta?.ai.engine === 'vertex' && choices.length > 0 && (
            <ModelPicker choices={choices} model={model} onModel={onModel} onChoices={onChoices} disabled={busy} tr={tr} />
          )}
          <div className="em-goals" role="radiogroup" aria-label={tr('What the email is for', 'À quoi sert l’email')}>
            {goals(tr).map(g => (
              <button key={g.value} type="button" role="radio" aria-checked={goal === g.value} className={`em-goal${goal === g.value ? ' is-on' : ''}`}
                onClick={() => setGoal(g.value)} disabled={busy} title={g.hint}>{g.label}</button>
            ))}
          </div>
          <Input.TextArea value={brief} onChange={e => setBrief(e.target.value)} autoSize={{ minRows: 4, maxRows: 10 }} maxLength={4000} disabled={busy}
            placeholder={hasContent
              ? tr('What should change? e.g. « Shorter », « Say there are only 3 seats left », « Ask also for their exam date ».', 'Que faut-il changer ? ex. « Plus court », « Dire qu’il reste 3 places », « Demander aussi la date d’examen ».')
              : tr('Say what the email is about and what you want people to do, in French or English: the class, the dates, the price, the deadline… The AI only uses your facts and tells you what is missing.', 'Dites de quoi parle l’email et ce que les gens doivent faire, en français ou en anglais : le cours, les dates, le prix, la date limite… L’IA n’utilise que vos informations et signale ce qui manque.')} />
          {!brief && !hasContent && (
            <div className="mk-ai-ideas">
              <span>{tr('Start from:', 'Partir de :')}</span>
              {IDEAS(tr).map(i => <button key={i.label} type="button" onClick={() => { setBrief(i.text); setGoal(i.goal); setPrimary(p => ({ ...p, action: i.action })); }}>{i.label}</button>)}
            </div>
          )}
          {brief.includes('[') && <p className="mk-ai-hint">{tr('Replace what is in [brackets] with your details: anything left is reported as missing.', 'Remplacez ce qui est entre [crochets] : ce qui reste est signalé comme manquant.')}</p>}

          <div className="em-ai-buttons">
            <div className="og-field"><label>{tr('The main button…', 'Le bouton principal…')}</label>
              <Segmented size="small" value={primary.action} onChange={v => setPrimary(p => ({ ...p, action: v as SecondaryAction }))} options={actions(false)} disabled={busy} />
              {urlInput(primary, v => setPrimary(p => ({ ...p, url: v })))}
              {primary.action === 'form' && <small>{tr('The AI writes the form’s questions: you can change them after.', 'L’IA écrit les questions du formulaire : vous pouvez les changer ensuite.')}</small>}
            </div>
            <div className="og-field"><label>{tr('A second button?', 'Un deuxième bouton ?')}</label>
              <Segmented size="small" value={secondary.action} onChange={v => setSecondary(p => ({ ...p, action: v as SecondaryAction }))} options={actions(true)} disabled={busy} />
              {urlInput(secondary, v => setSecondary(p => ({ ...p, url: v })))}
            </div>
          </div>
          <div className="og-field"><label>{tr('Promote a marketing campaign', 'Promouvoir une campagne marketing')} <em>{tr('optional · its dates, price and seats are used', 'facultatif · ses dates, prix et places sont utilisés')}</em></label>
            <Select allowClear value={promotion ?? undefined} onChange={v => setPromotion(v ?? null)} disabled={busy} placeholder={tr('None', 'Aucune')} showSearch optionFilterProp="label"
              options={(meta?.promotions || []).map(p => ({ value: p.id, label: (lang === 'fr' ? p.title_fr || p.title_en : p.title_en || p.title_fr) || p.slug }))} /></div>

          <div className={`em-ai-picture${withPicture ? ' is-on' : ''}`}>
            <label className="mk-switch"><Switch size="small" checked={withPicture} onChange={setWithPicture} disabled={busy} />
              <span><strong>{tr('Add a picture', 'Ajouter une image')}</strong> · {tr(`made by ${meta?.ai.image_model || 'the marketing painter'}, like the marketing campaigns`, `faite par ${meta?.ai.image_model || 'le peintre du marketing'}, comme pour les campagnes marketing`)}</span></label>
            {withPicture && <>
              <Input.TextArea value={picturePrompt} onChange={e => setPicturePrompt(e.target.value)} autoSize={{ minRows: 2, maxRows: 5 }} maxLength={600} disabled={busy}
                placeholder={tr(
                  'Describe the picture (optional): who, where, doing what, the mood. e.g. « An adult learner at home in the evening, smiling during an online French class ». Empty: the AI describes one that fits the email.',
                  'Décrivez l’image (facultatif) : qui, où, en train de faire quoi, l’ambiance. ex. « Une adulte chez elle le soir, souriante pendant un cours de français en ligne ». Vide : l’IA en imagine une qui va avec l’email.',
                )} />
              <div className="em-ai-picture-row">
                <span>{tr('Place', 'Place')}</span>
                <Segmented size="small" value={place} onChange={v => setPlace(v as PicturePlace)} disabled={busy} options={[
                  { value: 'top', label: tr('At the top, large', 'En haut, en grand') },
                  { value: 'inline', label: tr('Under the headline', 'Sous le titre') },
                ]} />
                <small>{tr('About 15 s more · checked for text and logos', 'Environ 15 s de plus · vérifiée (texte, logos)')}</small>
              </div>
            </>}
          </div>

          <div className="mk-ai-actions">
            <label className="mk-switch"><Switch size="small" checked={withDesign} onChange={setWithDesign} disabled={busy} /><span>{tr('Apply its layout', 'Appliquer sa mise en page')}</span></label>
            <span style={{ flex: 1 }} />
            {onUndo && result && !busy && <Button icon={<UndoOutlined />} onClick={() => { onUndo(); setResult(null); }}>{tr('Undo', 'Annuler')}</Button>}
            <Button type="primary" className="mk-ai-go" onClick={run} disabled={busy || !ready} icon={busy ? <LoadingOutlined /> : <Sparkles />}>
              {busy ? tr('Working…', 'L’IA travaille…') : hasContent ? tr('Apply the changes', 'Appliquer les changements') : tr('Write the email', 'Écrire l’email')}
            </Button>
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
