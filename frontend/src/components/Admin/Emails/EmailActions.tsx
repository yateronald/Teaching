import React from 'react';
import { Button, Dropdown, Input, Segmented, Select, Switch, Tooltip } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined, DeleteOutlined, FormOutlined, LinkOutlined, PlusOutlined, WhatsAppOutlined } from '@ant-design/icons';
import {
  fieldTypeLabel, isHttps, isWhatsApp, newField, usesForm,
  type Action, type EmailFields, type EmailMeta, type FieldType, type FormField, type Lang, type SecondaryAction, type Tr, type Words,
} from './emailModel';

/* What the buttons do — open a page, open the email's form, join a WhatsApp
   group — their words in both languages, and the form itself: its questions,
   its words, what people see once they have answered. */

const QUICK = (tr: Tr): { key: string; label: string }[] => [
  { key: 'trial_class', label: tr('Book a trial class', 'Cours d’essai') }, { key: 'offers', label: tr('Offers', 'Offres') },
  { key: 'free_courses', label: tr('Free courses', 'Cours gratuits') }, { key: 'level_test', label: tr('Level test', 'Test de niveau') },
  { key: 'tcf_canada', label: 'TCF Canada' },
];

/** Ready-made questions, in both languages. */
const TEMPLATES = (tr: Tr): { key: string; label: string; field: Omit<FormField, 'id'> & { id?: string } }[] => [
  { key: 'level', label: tr('French level', 'Niveau de français'), field: { id: 'level', type: 'select', required: true, label_fr: 'Votre niveau de français', label_en: 'Your French level', options_fr: ['Débutant', 'A1', 'A2', 'B1', 'B2', 'C1 ou plus', 'Je ne sais pas'], options_en: ['Beginner', 'A1', 'A2', 'B1', 'B2', 'C1 or above', 'I don’t know'] } },
  { key: 'availability', label: tr('Availability', 'Disponibilités'), field: { id: 'availability', type: 'checkbox', required: false, label_fr: 'Quand êtes-vous disponible ?', label_en: 'When are you available?', options_fr: ['Matin', 'Midi', 'Soir', 'Week-end'], options_en: ['Morning', 'Lunchtime', 'Evening', 'Weekend'] } },
  { key: 'goal', label: tr('Goal', 'Objectif'), field: { id: 'goal', type: 'radio', required: false, label_fr: 'Votre objectif principal', label_en: 'Your main goal', options_fr: ['Réussir un examen (TCF, TEF, DELF)', 'Immigration au Canada', 'Travail', 'Voyages et vie quotidienne'], options_en: ['Pass an exam (TCF, TEF, DELF)', 'Immigration to Canada', 'Work', 'Travel and everyday life'] } },
  { key: 'exam_date', label: tr('Exam date', 'Date d’examen'), field: { id: 'exam_date', type: 'date', required: false, label_fr: 'Date de votre examen (si vous la connaissez)', label_en: 'Your exam date (if you know it)' } },
  { key: 'country', label: tr('Country', 'Pays'), field: { id: 'country', type: 'text', required: false, label_fr: 'Pays de résidence', label_en: 'Country of residence' } },
];

function ButtonEditor({ which, fields, meta, tr, onButton, onLabel }: {
  which: 'primary' | 'secondary'; fields: EmailFields; meta: EmailMeta | null; tr: Tr;
  onButton: (patch: { action?: SecondaryAction; url?: string | null }) => void;
  onLabel: (lang: Lang, label: string | null) => void;
}) {
  const b = fields.buttons[which];
  const key = `${which}_label` as 'primary_label';
  const options: { value: SecondaryAction; label: React.ReactNode }[] = [
    ...(which === 'secondary' ? [{ value: 'none' as const, label: tr('None', 'Aucun') }] : []),
    { value: 'link', label: <span><LinkOutlined /> {tr('A page', 'Une page')}</span> },
    { value: 'form', label: <span><FormOutlined /> {tr('A form', 'Un formulaire')}</span> },
    { value: 'whatsapp', label: <span><WhatsAppOutlined /> WhatsApp</span> },
  ];
  const urlError = (b.action === 'link' && b.url && !isHttps(b.url)) || (b.action === 'whatsapp' && b.url && !isWhatsApp(b.url));
  return (
    <div className={`em-button-editor is-${which}`}>
      <div className="em-button-head">
        <strong>{which === 'primary' ? tr('Main button', 'Bouton principal') : tr('Second button', 'Deuxième bouton')}</strong>
        <Segmented size="small" value={b.action} onChange={v => onButton({ action: v as SecondaryAction, url: v === 'form' || v === 'none' ? null : b.url })} options={options} />
      </div>
      {b.action !== 'none' && <>
        <div className="og-two">
          <div className="og-field"><label>{tr('Words (French)', 'Texte (français)')}</label>
            <Input value={fields.content.fr[key] || ''} onChange={e => onLabel('fr', e.target.value || null)} maxLength={60}
              placeholder={b.action === 'form' ? 'Je réponds' : b.action === 'whatsapp' ? 'Rejoindre le groupe WhatsApp' : 'Réserver ma place'} /></div>
          <div className="og-field"><label>{tr('Words (English)', 'Texte (anglais)')}</label>
            <Input value={fields.content.en[key] || ''} onChange={e => onLabel('en', e.target.value || null)} maxLength={60}
              placeholder={b.action === 'form' ? 'Reply now' : b.action === 'whatsapp' ? 'Join the WhatsApp group' : 'Book my seat'} /></div>
        </div>
        {b.action === 'link' && <>
          <Input prefix={<LinkOutlined />} value={b.url || ''} onChange={e => onButton({ url: e.target.value.trim() || null })} placeholder="https://…" status={urlError ? 'error' : undefined} />
          <div className="em-quick">
            <span>{tr('Link to:', 'Lien vers :')}</span>
            {(() => {
              const p = meta?.promotions.find(x => x.id === fields.promotion_id);
              if (!p || !meta) return null;
              const base = (meta.site_pages.home?.en || '').replace(/\/$/, '');
              const url = fields.default_lang === 'en' ? `${base}/offers/?p=${encodeURIComponent(p.slug)}` : `${base}/fr/offres/?p=${encodeURIComponent(p.slug)}`;
              return <button type="button" className={b.url === url ? 'is-on' : ''} onClick={() => onButton({ url })}>{tr('The campaign', 'La campagne')}</button>;
            })()}
            {QUICK(tr).map(q => {
              const url = meta?.site_pages[q.key]?.[fields.default_lang];
              return url ? <button key={q.key} type="button" className={b.url === url ? 'is-on' : ''} onClick={() => onButton({ url })}>{q.label}</button> : null;
            })}
          </div>
        </>}
        {b.action === 'whatsapp' && <>
          <Input prefix={<WhatsAppOutlined style={{ color: '#1fa855' }} />} value={b.url || ''} onChange={e => onButton({ url: e.target.value.trim() || null })} placeholder="https://chat.whatsapp.com/…" status={urlError ? 'error' : undefined} />
          <small className="og-muted">{tr('WhatsApp → the group → Invite via link → copy the link.', 'WhatsApp → le groupe → Inviter via un lien → copier le lien.')}</small>
        </>}
        {b.action === 'form' && <small className="og-muted">{tr('Opens the form below on the site, already filled with the person’s name and email. You receive the answers in this email’s « Answers » tab.', 'Ouvre le formulaire ci-dessous sur le site, déjà rempli avec le nom et l’email de la personne. Vous recevez les réponses dans l’onglet « Réponses » de cet email.')}</small>}
      </>}
    </div>
  );
}

function FieldEditor({ f, i, count, tr, onChange, onMove, onRemove }: {
  f: FormField; i: number; count: number; tr: Tr;
  onChange: (patch: Partial<FormField>) => void; onMove: (d: -1 | 1) => void; onRemove: () => void;
}) {
  const choices = ['select', 'radio', 'checkbox'].includes(f.type);
  return (
    <div className="em-field">
      <div className="em-field-head">
        <span className="em-field-n">{i + 1}</span>
        <Select size="small" value={f.type} style={{ width: 170 }} onChange={v => onChange({ type: v, ...(['select', 'radio', 'checkbox'].includes(v) ? { options_fr: f.options_fr || [], options_en: f.options_en || [] } : {}) })}
          options={(['name', 'email', 'phone', 'text', 'textarea', 'select', 'radio', 'checkbox', 'date'] as FieldType[]).map(t => ({ value: t, label: fieldTypeLabel(t, tr) }))} />
        <label className="mk-switch"><Switch size="small" checked={f.required} onChange={v => onChange({ required: v })} /><span>{tr('Required', 'Obligatoire')}</span></label>
        <span style={{ flex: 1 }} />
        <Tooltip title={tr('Up', 'Monter')}><Button size="small" type="text" icon={<ArrowUpOutlined />} disabled={i === 0} onClick={() => onMove(-1)} /></Tooltip>
        <Tooltip title={tr('Down', 'Descendre')}><Button size="small" type="text" icon={<ArrowDownOutlined />} disabled={i === count - 1} onClick={() => onMove(1)} /></Tooltip>
        <Tooltip title={tr('Remove', 'Retirer')}><Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={onRemove} /></Tooltip>
      </div>
      <div className="og-two">
        <Input value={f.label_fr || ''} onChange={e => onChange({ label_fr: e.target.value || null })} maxLength={120} placeholder={tr('Question in French', 'Question en français')} />
        <Input value={f.label_en || ''} onChange={e => onChange({ label_en: e.target.value || null })} maxLength={120} placeholder={tr('Question in English', 'Question en anglais')} />
      </div>
      {choices && (
        <div className="og-two">
          <Input.TextArea value={(f.options_fr || []).join('\n')} autoSize={{ minRows: 2, maxRows: 6 }} placeholder={tr('Choices in French, one per line', 'Choix en français, un par ligne')}
            onChange={e => onChange({ options_fr: e.target.value.split('\n').map(s => s.trimStart()).slice(0, 12) })} />
          <Input.TextArea value={(f.options_en || []).join('\n')} autoSize={{ minRows: 2, maxRows: 6 }} placeholder={tr('Choices in English, same order', 'Choix en anglais, même ordre')}
            onChange={e => onChange({ options_en: e.target.value.split('\n').map(s => s.trimStart()).slice(0, 12) })} />
        </div>
      )}
    </div>
  );
}

const EmailActions: React.FC<{
  fields: EmailFields; meta: EmailMeta | null; tr: Tr; lang: Lang; onLang: (l: Lang) => void;
  onChange: (patch: Partial<EmailFields>) => void;
  onWords: (lang: Lang, patch: Partial<Words>) => void;
}> = ({ fields, meta, tr, lang, onLang, onChange, onWords }) => {
  const setButton = (which: 'primary' | 'secondary') => (patch: { action?: SecondaryAction; url?: string | null }) => {
    const next = { ...fields.buttons[which], ...patch };
    const buttons = { ...fields.buttons, [which]: which === 'primary' ? { ...next, action: (next.action === 'none' ? 'link' : next.action) as Action } : next };
    // A form button gets the usual questions to start with.
    const form = patch.action === 'form' && !fields.form.fields.length
      ? { fields: [newField('name', []), newField('email', [newField('name', [])]), newField('phone', [])].map((f, i) => ({
        ...f, label_fr: ['Prénom et nom', 'Adresse email', 'Téléphone ou WhatsApp'][i], label_en: ['First and last name', 'Email address', 'Phone or WhatsApp'][i],
      })) }
      : fields.form;
    onChange({ buttons: buttons as EmailFields['buttons'], form });
  };
  const fieldsList = fields.form.fields;
  const setFields = (list: FormField[]) => onChange({ form: { fields: list } });
  const w = fields.content[lang];
  const formText = (k: keyof Words) => (w[k] as string | null) || '';
  const setFormText = (k: keyof Words) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onWords(lang, { [k]: e.target.value || null } as Partial<Words>);

  return (
    <div className="og-form em-actions">
      <ButtonEditor which="primary" fields={fields} meta={meta} tr={tr} onButton={setButton('primary')} onLabel={(l, v) => onWords(l, { primary_label: v })} />
      <ButtonEditor which="secondary" fields={fields} meta={meta} tr={tr} onButton={setButton('secondary')} onLabel={(l, v) => onWords(l, { secondary_label: v })} />

      {usesForm(fields) && (
        <section className="em-form-builder">
          <div className="em-form-head">
            <strong><FormOutlined /> {tr('The form', 'Le formulaire')}</strong>
            <Segmented size="small" value={lang} onChange={v => onLang(v as Lang)} options={[{ value: 'fr', label: 'Français' }, { value: 'en', label: 'English' }]} />
          </div>
          <div className="og-two">
            <div className="og-field"><label>{tr('Title', 'Titre')}</label>
              <Input value={formText('form_title')} onChange={setFormText('form_title')} maxLength={140} placeholder={lang === 'fr' ? 'Réservez votre place' : 'Book your seat'} /></div>
            <div className="og-field"><label>{tr('Button', 'Bouton')}</label>
              <Input value={formText('form_submit')} onChange={setFormText('form_submit')} maxLength={40} placeholder={lang === 'fr' ? 'Envoyer mes réponses' : 'Send my answers'} /></div>
          </div>
          <div className="og-field"><label>{tr('A few words above the questions', 'Quelques mots avant les questions')}</label>
            <Input.TextArea value={formText('form_intro')} onChange={setFormText('form_intro')} autoSize={{ minRows: 2, maxRows: 4 }} maxLength={600}
              placeholder={lang === 'fr' ? 'Deux minutes suffisent. Nous vous répondons rapidement.' : 'It takes two minutes. We reply quickly.'} /></div>
          <div className="og-two">
            <div className="og-field"><label>{tr('Thank-you title', 'Titre du remerciement')}</label>
              <Input value={formText('form_thanks_title')} onChange={setFormText('form_thanks_title')} maxLength={140} placeholder={lang === 'fr' ? 'Merci !' : 'Thank you!'} /></div>
            <div className="og-field"><label>{tr('Thank-you message', 'Message de remerciement')}</label>
              <Input value={formText('form_thanks_text')} onChange={setFormText('form_thanks_text')} maxLength={600} placeholder={lang === 'fr' ? 'Nous vous répondons rapidement.' : 'We will get back to you soon.'} /></div>
          </div>
          <div className="em-fields">
            {fieldsList.map((f, i) => (
              <FieldEditor key={`${f.id}-${i}`} f={f} i={i} count={fieldsList.length} tr={tr}
                onChange={patch => setFields(fieldsList.map((x, j) => (j === i ? { ...x, ...patch } : x)))}
                onMove={d => { const next = [...fieldsList]; [next[i], next[i + d]] = [next[i + d], next[i]]; setFields(next); }}
                onRemove={() => setFields(fieldsList.filter((_, j) => j !== i))} />
            ))}
          </div>
          <div className="em-quick">
            <Dropdown trigger={['click']} menu={{
              items: (['text', 'textarea', 'select', 'radio', 'checkbox', 'date', 'phone', 'email', 'name'] as FieldType[]).map(t => ({ key: t, label: fieldTypeLabel(t, tr) })),
              onClick: ({ key }) => setFields([...fieldsList, newField(key as FieldType, fieldsList)].slice(0, 12)),
            }}>
              <Button size="small" icon={<PlusOutlined />} disabled={fieldsList.length >= 12}>{tr('Add a question', 'Ajouter une question')}</Button>
            </Dropdown>
            <span>{tr('Ready-made:', 'Toutes faites :')}</span>
            {TEMPLATES(tr).map(t => (
              <button key={t.key} type="button" disabled={fieldsList.some(f => f.id === t.field.id) || fieldsList.length >= 12}
                onClick={() => setFields([...fieldsList, { ...newField(t.field.type, fieldsList), ...t.field, id: t.field.id || newField(t.field.type, fieldsList).id } as FormField])}>{t.label}</button>
            ))}
          </div>
          {!fieldsList.some(f => f.type === 'email') && <small className="og-text-warn">{tr('Keep an email field: it is how you answer people.', 'Gardez un champ email : c’est ainsi que vous répondez.')}</small>}
        </section>
      )}
    </div>
  );
};

export default EmailActions;
