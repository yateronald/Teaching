import React, { useEffect, useState } from 'react';
import { Input, InputNumber, Segmented, Select, Switch } from 'antd';
import type { EmailFields, Lang, Tr, Words } from './emailModel';

/* The words of the email in one language at a time (French and English side
   by side through the switch): subject, preview text, headline, message, key
   points, the offer box, the steps, the signature, the P.S. */

type ListKey = 'highlights' | 'steps';

const EmailContent: React.FC<{
  fields: EmailFields;
  lang: Lang;
  onLang: (l: Lang) => void;
  onWords: (lang: Lang, patch: Partial<Words>) => void;
  onOffer: (patch: Partial<EmailFields['offer']>) => void;
  tr: Tr;
}> = ({ fields, lang, onLang, onWords, onOffer, tr }) => {
  const w = fields.content[lang];
  const other: Lang = lang === 'fr' ? 'en' : 'fr';
  const o = fields.content[other];
  // Lists are typed as lines: kept as typed while editing, split when they change.
  const [lists, setLists] = useState<Record<ListKey, string>>({ highlights: w.highlights.join('\n'), steps: w.steps.join('\n') });
  const listKey = `${lang}|${w.highlights.join('|')}|${w.steps.join('|')}`;
  useEffect(() => {
    setLists(l => ({
      highlights: l.highlights.split('\n').map(s => s.trim()).filter(Boolean).join('|') === w.highlights.join('|') ? l.highlights : w.highlights.join('\n'),
      steps: l.steps.split('\n').map(s => s.trim()).filter(Boolean).join('|') === w.steps.join('|') ? l.steps : w.steps.join('\n'),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listKey]);

  const text = (k: keyof Words) => (w[k] as string | null) || '';
  const set = (k: keyof Words) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onWords(lang, { [k]: e.target.value || null } as Partial<Words>);
  const hint = (k: keyof Words, fallback?: string) => (o[k] as string | null) || fallback;
  const setList = (k: ListKey, max: number) => (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const typed = e.target.value;
    setLists(l => ({ ...l, [k]: typed }));
    onWords(lang, { [k]: typed.split('\n').map(s => s.trim()).filter(Boolean).slice(0, max) } as Partial<Words>);
  };
  const done = (l: Lang) => !!(fields.content[l].subject && fields.content[l].body);
  const subjectLen = text('subject').length;

  return (
    <div className="og-form em-content">
      <div className="em-lang-switch">
        <Segmented value={lang} onChange={v => onLang(v as Lang)} options={[
          { value: 'fr', label: `Français${done('fr') ? ' ✓' : ''}` }, { value: 'en', label: `English${done('en') ? ' ✓' : ''}` },
        ]} />
        <small>{tr('Write both: each person receives their language.', 'Écrivez les deux : chacun reçoit sa langue.')}</small>
      </div>

      <div className="og-field"><label>{tr('Subject', 'Objet')} <em>{subjectLen ? `${subjectLen} ${tr('characters', 'caractères')}${subjectLen > 60 ? tr(' · may be cut on phones', ' · peut être coupé sur téléphone') : ''}` : tr('40 to 55 characters', '40 à 55 caractères')}</em></label>
        <Input value={text('subject')} onChange={set('subject')} maxLength={160} placeholder={hint('subject', lang === 'fr' ? 'ex. Votre groupe A1 du soir commence en janvier' : 'e.g. Your A1 evening group starts in January')} /></div>
      <div className="og-field"><label>{tr('Preview text', 'Texte d’aperçu')} <em>{tr('shown after the subject in the inbox', 'affiché après l’objet dans la boîte de réception')}</em></label>
        <Input value={text('preheader')} onChange={set('preheader')} maxLength={200} placeholder={hint('preheader')} /></div>
      <div className="og-two">
        <div className="og-field"><label>{tr('Small title', 'Surtitre')} <em>{tr('optional', 'facultatif')}</em></label>
          <Input value={text('eyebrow')} onChange={set('eyebrow')} maxLength={60} placeholder={hint('eyebrow', lang === 'fr' ? 'ex. Nouveau groupe' : 'e.g. New group')} /></div>
        <div className="og-field"><label>{tr('Headline', 'Titre')}</label>
          <Input value={text('headline')} onChange={set('headline')} maxLength={160} placeholder={hint('headline')} /></div>
      </div>
      <div className="og-field"><label>{tr('Message', 'Message')}</label>
        <Input.TextArea value={text('body')} onChange={set('body')} autoSize={{ minRows: 6, maxRows: 16 }} maxLength={6000}
          placeholder={hint('body', lang === 'fr' ? 'Bonjour {first_name},\n\n…' : 'Hi {first_name},\n\n…')} />
        <small>{tr('{first_name} becomes each person’s first name. An empty line starts a paragraph, « - » a list, **bold**, [text](https://link).', '{first_name} devient le prénom de chaque personne. Une ligne vide commence un paragraphe, « - » une liste, **gras**, [texte](https://lien).')}</small></div>

      <div className="og-two">
        <div className="og-field"><label>{tr('Key points', 'Points clés')} <em>{tr('one per line, up to 5', 'un par ligne, 5 au plus')}</em></label>
          <Input value={text('highlights_title')} onChange={set('highlights_title')} maxLength={80} placeholder={tr('Title (optional), e.g. What you get', 'Titre (facultatif), ex. Ce qui vous attend')} style={{ marginBottom: 6 }} />
          <Input.TextArea value={lists.highlights} onChange={setList('highlights', 5)} autoSize={{ minRows: 3, maxRows: 6 }}
            placeholder={lang === 'fr' ? 'Mardi et jeudi, 19 h\n8 personnes au plus' : 'Tuesday and Thursday, 7 pm\n8 people at most'} /></div>
        <div className="og-field"><label>{tr('Steps', 'Étapes')} <em>{tr('optional · one per line, up to 4', 'facultatives · une par ligne, 4 au plus')}</em></label>
          <Input value={text('steps_title')} onChange={set('steps_title')} maxLength={80} placeholder={tr('Title, e.g. How it works', 'Titre, ex. Comment ça marche')} style={{ marginBottom: 6 }} />
          <Input.TextArea value={lists.steps} onChange={setList('steps', 4)} autoSize={{ minRows: 3, maxRows: 6 }}
            placeholder={lang === 'fr' ? 'Répondez au formulaire\nNous vous rappelons sous 24 h' : 'Answer the form\nWe call you back within 24 h'} /></div>
      </div>

      <div className="em-offer">
        <label className="mk-switch"><Switch checked={fields.offer.show} onChange={v => onOffer({ show: v })} />
          <span><strong>{tr('Price box', 'Encadré prix')}</strong> · {tr('the price, the old one crossed out, the deadline', 'le prix, l’ancien barré, la date limite')}</span></label>
        {fields.offer.show && <>
          <div className="mk-three">
            <div className="og-field"><label>{tr('Regular price', 'Prix normal')}</label>
              <InputNumber min={0} max={99999} value={fields.offer.regular} onChange={v => onOffer({ regular: v ?? null })} style={{ width: '100%' }} placeholder="600" /></div>
            <div className="og-field"><label>{tr('Offer price', 'Prix de l’offre')}</label>
              <InputNumber min={0} max={99999} value={fields.offer.promo} onChange={v => onOffer({ promo: v ?? null })} style={{ width: '100%' }} placeholder="480" /></div>
            <div className="og-field"><label>{tr('Currency', 'Devise')}</label>
              <Select value={fields.offer.currency} onChange={v => onOffer({ currency: v })} options={['CAD', 'USD', 'EUR'].map(c => ({ value: c, label: c }))} /></div>
          </div>
          <div className="mk-three">
            <div className="og-field"><label>{tr('Label', 'Étiquette')}</label>
              <Input value={text('offer_label')} onChange={set('offer_label')} maxLength={60} placeholder={lang === 'fr' ? 'Prix de lancement' : 'Launch price'} /></div>
            <div className="og-field"><label>{tr('Note', 'Précision')}</label>
              <Input value={text('offer_note')} onChange={set('offer_note')} maxLength={140} placeholder={lang === 'fr' ? 'pour 12 semaines' : 'for 12 weeks'} /></div>
            <div className="og-field"><label>{tr('Deadline', 'Date limite')}</label>
              <Input value={text('deadline')} onChange={set('deadline')} maxLength={140} placeholder={lang === 'fr' ? 'Jusqu’au 15 décembre' : 'Until December 15'} /></div>
          </div>
        </>}
      </div>

      <div className="og-two">
        <div className="og-field"><label>{tr('Signature', 'Signature')}</label>
          <Input value={text('signature')} onChange={set('signature')} maxLength={140} placeholder={lang === 'fr' ? 'L’équipe Learn French with Natives' : 'The Learn French with Natives team'} /></div>
        <div className="og-field"><label>{tr('P.S.', 'P.-S.')} <em>{tr('optional · one more reason to act', 'facultatif · une raison de plus d’agir')}</em></label>
          <Input value={text('ps')} onChange={set('ps')} maxLength={300} placeholder={hint('ps')} /></div>
      </div>
    </div>
  );
};

export default EmailContent;
