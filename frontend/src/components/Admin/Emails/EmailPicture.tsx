import React, { useEffect, useState } from 'react';
import { Button, Input, Segmented, Tooltip } from 'antd';
import { DeleteOutlined, LoadingOutlined, PictureOutlined, WarningOutlined } from '@ant-design/icons';
import { useAuth } from '../../../contexts/AuthContext';
import { call } from '../../Org/orgModel';
import { promoImage } from '../../../promo/model';
import { Sparkles } from '../Marketing/CampaignAi';
import { PICTURES } from '../Marketing/marketingModel';
import { emailError, pictureOf, type Design, type EmailMeta, type EmailPicture as Picture, type PicturePlace, type Tr } from './emailModel';

/* The picture of an email: made by the marketing painter from a description
   (same image model, same checks for text and logos), or taken from the
   library; placed at the top (large) or under the headline; removed. */

const EmailPicture: React.FC<{
  imageKey: string | null;
  design: Design;
  meta: EmailMeta | null;
  title: string | null;
  /** The description last used (by the AI writer or by hand). */
  prompt: string;
  tr: Tr;
  onPicture: (key: string | null, prompt: string) => void;
  onPlace: (place: PicturePlace) => void;
}> = ({ imageKey, design, meta, title, prompt: initial, tr, onPicture, onPlace }) => {
  const { apiCall } = useAuth();
  const [prompt, setPrompt] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [note, setNote] = useState<{ tone: 'bad' | 'warn'; text: string } | null>(null);
  const [library, setLibrary] = useState(false);
  useEffect(() => { setPrompt(initial); }, [initial]);
  useEffect(() => {
    if (!busy) return;
    setSeconds(0);
    const t = window.setInterval(() => setSeconds(s => s + 1), 1000);
    return () => window.clearInterval(t);
  }, [busy]);

  const make = async () => {
    setBusy(true);
    setNote(null);
    try {
      const p = await call<Picture>(apiCall, '/admin/email-campaigns/ai/image', 'POST', { prompt, theme: design.theme, title });
      onPicture(p.image_key, prompt);
      if (p.warning) setNote({ tone: 'warn', text: p.warning });
    } catch (e) {
      setNote({ tone: 'bad', text: emailError(e, tr) });
    } finally {
      setBusy(false);
    }
  };

  const place = pictureOf(design);
  const painter = meta?.ai.image_model;
  return (
    <div className="em-picture">
      <div className="em-picture-row">
        {imageKey
          ? <img className="em-pic" src={promoImage(imageKey)} alt="" />
          : <span className="em-pic is-empty"><PictureOutlined /></span>}
        <div className="em-picture-side">
          <Segmented size="small" value={place} onChange={v => onPlace(v as PicturePlace)} options={[
            { value: 'top', label: tr('At the top, large', 'En haut, en grand') },
            { value: 'inline', label: tr('Under the headline', 'Sous le titre') },
          ]} />
          <div className="em-picture-buttons">
            <Button size="small" icon={<PictureOutlined />} onClick={() => setLibrary(x => !x)}>{library ? tr('Close the library', 'Fermer la bibliothèque') : tr('Library', 'Bibliothèque')}</Button>
            {imageKey && <Tooltip title={tr('Remove the picture', 'Retirer l’image')}><Button size="small" icon={<DeleteOutlined />} onClick={() => onPicture(null, prompt)} aria-label={tr('Remove the picture', 'Retirer l’image')} /></Tooltip>}
          </div>
        </div>
      </div>
      {library && (
        <div className="mk-pictures">
          {PICTURES.map(g => (
            <div key={g.group}><p>{g.group}</p><div>
              {g.keys.map(k => <button key={k} type="button" className={imageKey === k ? 'is-on' : ''} onClick={() => { onPicture(k, prompt); setLibrary(false); }} aria-label={k}><img src={promoImage(k)} alt="" loading="lazy" /></button>)}
            </div></div>
          ))}
        </div>
      )}
      <div className="mk-ai-picture">
        <Input.TextArea value={prompt} onChange={e => setPrompt(e.target.value)} autoSize={{ minRows: 2, maxRows: 5 }} maxLength={900} disabled={busy}
          placeholder={tr(
            'Describe the picture: who, where, doing what, the mood. e.g. « An adult learner at home in the evening, laughing during an online French class on a laptop ». No text is ever drawn.',
            'Décrivez l’image : qui, où, en train de faire quoi, l’ambiance. ex. « Une adulte chez elle le soir, qui rit pendant un cours de français en ligne sur son ordinateur ». Aucun texte n’est jamais dessiné.',
          )} />
        <div className="mk-ai-actions">
          <small>{tr(
            `${painter ? `${painter} (the marketing painter)` : 'The marketing painter'} · about 15 s · checked for text and logos`,
            `${painter ? `${painter} (le peintre du marketing)` : 'Le peintre du marketing'} · environ 15 s · vérifiée (texte, logos)`,
          )}</small>
          <span style={{ flex: 1 }} />
          <Button type="primary" className="mk-ai-go" onClick={make} disabled={busy || prompt.trim().length < 12 || !meta?.ai.available} icon={busy ? <LoadingOutlined /> : <Sparkles />}>
            {busy ? tr(`Drawing… ${seconds} s`, `Création… ${seconds} s`) : imageKey?.startsWith('ai-') ? tr('Another picture', 'Une autre image') : tr('Create the picture', 'Créer l’image')}
          </Button>
        </div>
        {note && <div className={`og-check tone-${note.tone}`}><WarningOutlined /><span>{note.text}</span></div>}
      </div>
    </div>
  );
};

export default EmailPicture;
