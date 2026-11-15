import React, { useEffect, useRef, useState } from 'react';
import { Segmented, Skeleton } from 'antd';
import { DesktopOutlined, LoadingOutlined, MobileOutlined } from '@ant-design/icons';
import { useAuth } from '../../../contexts/AuthContext';
import { call, errorText } from '../../Org/orgModel';
import type { EmailFields, Lang, PersonSource, Tr } from './emailModel';

interface Rendered { subject: string; preheader: string; html: string }

/* The email as it will arrive: first as a line of the inbox (sender, subject,
   preview text), then the email itself at a computer's or a phone's width.
   The server draws it (the very HTML that is sent), a moment after each change. */
const EmailPreview: React.FC<{
  fields: EmailFields; senderName: string; source?: PersonSource; tr: Tr;
  lang?: Lang; onLang?: (l: Lang) => void; campaignId?: number;
}> = ({ fields, senderName, source = 'student', tr, lang: controlled, onLang, campaignId }) => {
  const { apiCall } = useAuth();
  const both = fields.language_mode === 'both';
  const fixed = fields.language_mode === 'fr' || fields.language_mode === 'en' ? fields.language_mode : null;
  const [own, setOwn] = useState<Lang>(fields.default_lang);
  const lang = controlled || own;
  const setLang = (l: Lang) => (onLang ? onLang(l) : setOwn(l));
  const [device, setDevice] = useState<'desktop' | 'phone'>('desktop');
  const [out, setOut] = useState<Rendered | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [height, setHeight] = useState(900);
  const frame = useRef<HTMLIFrameElement | null>(null);
  const asked = useRef(0);
  const shownLang = both ? 'both' : fixed || lang;

  const key = JSON.stringify([fields, shownLang, source, campaignId]);
  useEffect(() => {
    const ticket = ++asked.current;
    setBusy(true);
    const t = window.setTimeout(async () => {
      try {
        const r = await call<Rendered>(apiCall, '/admin/email-campaigns/preview', 'POST', { fields, lang: shownLang, source, id: campaignId });
        if (ticket !== asked.current) return;
        setOut(r);
        setErr(null);
      } catch (e) { if (ticket === asked.current) setErr(errorText(e, (en: string) => en)); } finally { if (ticket === asked.current) setBusy(false); }
    }, 450);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiCall, key]);

  const fit = () => {
    const doc = frame.current?.contentDocument;
    if (doc?.body) setHeight(Math.max(420, Math.min(5000, doc.documentElement.scrollHeight + 4)));
  };
  useEffect(() => { const t = window.setTimeout(fit, 150); return () => window.clearTimeout(t); }, [out, device]);

  const html = out ? out.html.replace('<head>', '<head><base target="_blank" />') : '';

  return (
    <div className="em-preview">
      <div className="em-preview-bar">
        <Segmented size="small" value={device} onChange={v => setDevice(v as 'desktop' | 'phone')}
          options={[{ value: 'desktop', icon: <DesktopOutlined />, label: tr('Computer', 'Ordinateur') }, { value: 'phone', icon: <MobileOutlined />, label: tr('Phone', 'Téléphone') }]} />
        {both ? <span className="og-muted">{tr('Bilingual', 'Bilingue')}</span> : fixed ? <span className="og-muted">{fixed === 'fr' ? tr('French only', 'Français seulement') : tr('English only', 'Anglais seulement')}</span> : (
          <Segmented size="small" value={lang} onChange={v => setLang(v as Lang)} options={[{ value: 'fr', label: 'Français' }, { value: 'en', label: 'English' }]} />
        )}
        {busy && <LoadingOutlined className="og-muted" />}
      </div>

      <div className="em-inbox" aria-label={tr('As it appears in the inbox', 'Tel qu’il apparaît dans la boîte de réception')}>
        <span className="em-inbox-avatar" aria-hidden style={{ background: fields.design.colors.primary }}>{(senderName || 'L').charAt(0)}</span>
        <span className="em-inbox-text">
          <span className="em-inbox-top"><strong>{senderName}</strong><small>{tr('now', 'maintenant')}</small></span>
          <strong className="em-inbox-subject">{out?.subject || tr('Subject', 'Objet')}</strong>
          <span className="em-inbox-pre">{out?.preheader || tr('The preview text appears here, after the subject.', 'Le texte d’aperçu apparaît ici, après l’objet.')}</span>
        </span>
      </div>

      {err ? <div className="og-check tone-bad"><span>{err}</span></div> : !out ? <Skeleton active paragraph={{ rows: 10 }} /> : (
        <div className={`em-frame is-${device}`}>
          <iframe ref={frame} title={tr('Email preview', 'Aperçu de l’email')} srcDoc={html} sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            style={{ height }} onLoad={fit} />
        </div>
      )}
    </div>
  );
};

export default EmailPreview;
