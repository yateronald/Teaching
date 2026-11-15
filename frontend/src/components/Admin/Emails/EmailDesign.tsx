import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Button, Collapse, ColorPicker, Input, Segmented, Select, Slider } from 'antd';
import { CheckOutlined, InfoCircleOutlined, LoadingOutlined, UndoOutlined, WarningOutlined } from '@ant-design/icons';
import { useAuth } from '../../../contexts/AuthContext';
import { call } from '../../Org/orgModel';
import { Sparkles } from '../Marketing/CampaignAi';
import EmailPicture from './EmailPicture';
import { THEMES, emailError, placePicture, recolor, type ColorKey, type Design, type EmailFields, type EmailMeta, type ModelChoice, type Tr } from './emailModel';

/* The look of the email: the AI's art director proposes three complete
   designs (each drawn as the real email); the administrator can also pick a
   layout, a palette, and change every part by hand. The server keeps every
   colour readable (WCAG AA) whatever is chosen. */

const STYLES = (tr: Tr) => [
  { value: 'professional', label: tr('Professional', 'Professionnel') }, { value: 'modern', label: tr('Modern', 'Moderne') },
  { value: 'elegant', label: tr('Elegant', 'Élégant') }, { value: 'warm', label: tr('Warm', 'Chaleureux') },
  { value: 'bold', label: tr('Bold', 'Percutant') }, { value: 'minimal', label: tr('Minimal', 'Épuré') },
];
const PRESETS = (tr: Tr): { id: Design['preset']; name: string; text: string }[] => [
  { id: 'classic', name: tr('Classic', 'Classique'), text: tr('Headline on a colour band', 'Titre sur un bandeau de couleur') },
  { id: 'hero', name: tr('Photo', 'Photo'), text: tr('A large photo at the top', 'Une grande photo en haut') },
  { id: 'minimal', name: tr('Minimal', 'Épuré'), text: tr('White, airy, square edges', 'Blanc, aéré, angles droits') },
  { id: 'bold', name: tr('Bold', 'Percutant'), text: tr('Big headline, pill buttons', 'Grand titre, boutons arrondis') },
  { id: 'editorial', name: tr('Editorial', 'Éditorial'), text: tr('Centred, serif headline', 'Centré, titre à empattements') },
];
const FONT_NAMES: Record<string, string> = { system: 'System (modern)', humanist: 'Humanist', georgia: 'Georgia (serif)', trebuchet: 'Trebuchet', verdana: 'Verdana' };
const COLOR_LABELS = (tr: Tr): [ColorKey, string][] => [
  ['primary', tr('Buttons and links', 'Boutons et liens')], ['accent', tr('Accent', 'Accent')], ['header_bg', tr('Header', 'En-tête')],
  ['header_text', tr('Header text', 'Texte de l’en-tête')], ['page_bg', tr('Page background', 'Fond de page')], ['card_bg', tr('Card', 'Carte')],
  ['heading', tr('Headings', 'Titres')], ['text', tr('Text', 'Texte')], ['muted', tr('Small text', 'Petit texte')], ['soft', tr('Boxes', 'Encadrés')],
];

interface Proposal { design: Design; html: string | null }

/* A proposal drawn small: the real email at 640 px, scaled to the card. */
const THUMB_WIDTH = 640;
const THUMB_HEIGHT = 300;
function Thumb({ html, title }: { html: string | null; title: string }) {
  const box = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(0.3);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const w = el.getBoundingClientRect().width;
    if (w) setScale(w / THUMB_WIDTH);
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([e]) => { if (e.contentRect.width) setScale(e.contentRect.width / THUMB_WIDTH); });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={box} className="em-proposal-frame" style={{ height: THUMB_HEIGHT }}>
      {html
        ? <iframe title={title} srcDoc={html} sandbox="" tabIndex={-1} aria-hidden style={{ width: THUMB_WIDTH, height: THUMB_HEIGHT / scale, transform: `scale(${scale})` }} />
        : <span><LoadingOutlined /></span>}
    </div>
  );
}

const EmailDesign: React.FC<{
  fields: EmailFields;
  meta: EmailMeta | null;
  campaignId?: number;
  tr: Tr;
  lang: 'fr' | 'en';
  imagePrompt: string;
  /** The writer the administrator picked (Vertex), or null for the usual order. */
  model: string | null;
  onChoices?: (c: ModelChoice[]) => void;
  onDesign: (d: Design) => void;
  onImage: (key: string | null, prompt: string) => void;
}> = ({ fields, meta, campaignId, tr, lang, imagePrompt, model, onChoices, onDesign, onImage }) => {
  const { apiCall } = useAuth();
  const d = fields.design;
  const [style, setStyle] = useState('professional');
  const [color, setColor] = useState<string>('brand');
  const [custom, setCustom] = useState('#1d4577');
  const [header, setHeader] = useState('auto');
  const [wishes, setWishes] = useState('');
  const [busy, setBusy] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [before, setBefore] = useState<Design | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useEffect(() => {
    if (!busy) return;
    setSeconds(0);
    const t = window.setInterval(() => setSeconds(s => s + 1), 1000);
    return () => window.clearInterval(t);
  }, [busy]);

  const set = (patch: Partial<Design>) => onDesign({ ...d, ...patch });
  const setColorKey = (k: ColorKey, v: string) => onDesign({ ...d, colors: { ...d.colors, [k]: v } });
  const apply = (next: Design) => { setBefore(b => b ?? d); onDesign(next); };

  const propose = async () => {
    setBusy(true);
    setErr(null);
    setNotice(null);
    setProposals([]);
    try {
      const r = await call<{ designs: Design[]; notice: string | null; choices?: ModelChoice[] }>(apiCall, '/admin/email-campaigns/ai/designs', 'POST', {
        campaign: fields,
        wishes: { style, color: color === 'custom' ? custom : color === 'brand' ? 'navy' : color, header: header === 'auto' ? null : header, notes: wishes },
        model, lang: tr('en', 'fr'),
      });
      if (!alive.current) return;
      setNotice(r.notice || null);
      if (r.choices?.length) onChoices?.(r.choices);
      const list: Proposal[] = r.designs.map(design => ({ design, html: null }));
      setProposals(list);
      // Each proposal drawn as the real email (the server's renderer).
      r.designs.forEach((design, i) => {
        call<{ html: string }>(apiCall, '/admin/email-campaigns/preview', 'POST', { fields: { ...fields, design }, lang, id: campaignId })
          .then(p => { if (alive.current) setProposals(ps => ps.map((x, j) => (j === i ? { ...x, html: p.html } : x))); })
          .catch(() => { /* the card still shows its name and reason */ });
      });
    } catch (e) {
      if (alive.current) setErr(emailError(e, tr));
    } finally {
      if (alive.current) setBusy(false);
    }
  };

  const presets = meta?.design.presets;
  return (
    <div className="em-design">
      {/* The art director */}
      <section className="mk-ai em-director" aria-label={tr('Designs proposed by the AI', 'Designs proposés par l’IA')}>
        <header>
          <span className="mk-ai-mark"><Sparkles size={18} /></span>
          <div>
            <strong>{tr('AI art director', 'Directeur artistique IA')}</strong>
            <span>{tr('Three professional designs for this email, following email UI/UX rules (hierarchy, contrast, one clear button).', 'Trois designs professionnels pour cet email, selon les règles UI/UX de l’email (hiérarchie, contraste, un bouton clair).')}</span>
          </div>
        </header>
        <div className="em-director-row">
          <span>{tr('Mood', 'Ambiance')}</span>
          <div className="em-goals">
            {STYLES(tr).map(s => <button key={s.value} type="button" className={`em-goal${style === s.value ? ' is-on' : ''}`} onClick={() => setStyle(s.value)} disabled={busy}>{s.label}</button>)}
          </div>
        </div>
        <div className="em-director-row">
          <span>{tr('Colours', 'Couleurs')}</span>
          <div className="em-goals">
            <button type="button" className={`em-goal${color === 'brand' ? ' is-on' : ''}`} onClick={() => setColor('brand')} disabled={busy}>{tr('The school’s colours', 'Couleurs de l’école')}</button>
            {THEMES.map(t => (
              <button key={t.id} type="button" className={`em-goal em-swatch pm-t-${t.id}${color === t.id ? ' is-on' : ''}`} onClick={() => setColor(t.id)} disabled={busy}><i aria-hidden />{tr(t.en, t.fr)}</button>
            ))}
            <span className={`em-goal em-custom${color === 'custom' ? ' is-on' : ''}`}>
              <ColorPicker size="small" value={custom} disabledAlpha onChange={(_, hex) => { setCustom(hex); setColor('custom'); }} disabled={busy} />
              <button type="button" onClick={() => setColor('custom')} disabled={busy}>{tr('My colour', 'Ma couleur')}</button>
            </span>
          </div>
        </div>
        <div className="em-director-row">
          <span>{tr('Header', 'En-tête')}</span>
          <Segmented size="small" value={header} onChange={v => setHeader(v as string)} disabled={busy} options={[
            { value: 'auto', label: tr('AI’s choice', 'Au choix de l’IA') }, { value: 'band', label: tr('Colour band', 'Bandeau') },
            { value: 'hero', label: tr('Photo', 'Photo') }, { value: 'logo', label: tr('Logo', 'Logo') }, { value: 'centered', label: tr('Centred', 'Centré') },
          ]} />
        </div>
        <Input.TextArea value={wishes} onChange={e => setWishes(e.target.value)} autoSize={{ minRows: 2, maxRows: 4 }} maxLength={600} disabled={busy}
          placeholder={tr('Anything else? e.g. « more premium », « less text in the header », « like a letter from the teacher »', 'Autre chose ? ex. « plus premium », « moins de texte dans l’en-tête », « comme une lettre de la professeure »')} />
        <div className="mk-ai-actions">
          {before && !busy && <Button icon={<UndoOutlined />} onClick={() => { onDesign(before); setBefore(null); }}>{tr('Back to the previous design', 'Revenir au design précédent')}</Button>}
          <span style={{ flex: 1 }} />
          <Button type="primary" className="mk-ai-go" icon={busy ? <LoadingOutlined /> : <Sparkles />} onClick={propose} disabled={busy || !meta?.ai.available}>
            {busy ? tr(`Designing… ${seconds} s`, `Création… ${seconds} s`) : proposals.length ? tr('Three other designs', 'Trois autres designs') : tr('Propose three designs', 'Proposer trois designs')}
          </Button>
        </div>
        {err && <div className="og-check tone-bad"><WarningOutlined /><span>{err}</span></div>}
        {notice && <div className="og-check tone-warn"><InfoCircleOutlined /><span>{notice}</span></div>}
        {proposals.length > 0 && (
          <div className="em-proposals">
            {proposals.map((p, i) => {
              const on = JSON.stringify(p.design.colors) === JSON.stringify(d.colors) && p.design.preset === d.preset && p.design.header === d.header;
              return (
                <div key={i} className={`em-proposal${on ? ' is-on' : ''}`}>
                  <Thumb html={p.html} title={tr(`Design ${i + 1}`, `Design ${i + 1}`)} />
                  <strong>{tr(p.design.name_en || `Design ${i + 1}`, p.design.name_fr || `Design ${i + 1}`)}</strong>
                  <p>{tr(p.design.rationale_en || '', p.design.rationale_fr || '')}</p>
                  <Button type={on ? 'default' : 'primary'} icon={on ? <CheckOutlined /> : undefined} onClick={() => apply({ ...p.design })} disabled={on}>
                    {on ? tr('In use', 'Utilisé') : tr('Use this design', 'Utiliser ce design')}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Layouts and palettes */}
      <div className="og-field"><label>{tr('Layout', 'Mise en page')}</label>
        <div className="em-presets">
          {PRESETS(tr).map(p => (
            <button key={p.id} type="button" className={`em-preset is-${p.id}${d.preset === p.id ? ' is-on' : ''}`} onClick={() => presets && apply(recolor({ ...presets[p.id] }, d.theme, meta))} disabled={!presets}>
              <i aria-hidden><b /><s /><s /><u /></i>
              <strong>{p.name}</strong><em>{p.text}</em>
            </button>
          ))}
        </div>
      </div>
      <div className="og-field"><label>{tr('Palette', 'Palette')}</label>
        <div className="mk-themes">
          {THEMES.map(t => (
            <button key={t.id} type="button" className={`mk-theme pm-t-${t.id}${d.theme === t.id ? ' is-on' : ''}`} onClick={() => apply(recolor(d, t.id, meta))}>
              <i aria-hidden />{tr(t.en, t.fr)}{d.theme === t.id && <CheckOutlined />}
            </button>
          ))}
        </div>
      </div>

      {/* Picture */}
      <div className="og-field"><label>{tr('Picture', 'Image')} <em>{tr('optional', 'facultative')}</em></label>
        <EmailPicture imageKey={fields.image_key} design={d} meta={meta} title={fields.content.en.headline || fields.content.fr.headline} prompt={imagePrompt} tr={tr}
          onPicture={(k, p) => onImage(k, p)} onPlace={place => onDesign(placePicture(d, place))} />
      </div>

      {/* Every detail */}
      <Collapse className="em-tune" items={[{
        key: 'tune',
        label: tr('Adjust every detail', 'Régler chaque détail'),
        children: (
          <div className="em-tune-grid">
            <div className="og-field"><label>{tr('Header', 'En-tête')}</label>
              <Segmented size="small" block value={d.header} onChange={v => set({ header: v as Design['header'] })} options={[
                { value: 'band', label: tr('Band', 'Bandeau') }, { value: 'hero', label: tr('Photo', 'Photo') }, { value: 'logo', label: 'Logo' },
                { value: 'centered', label: tr('Centred', 'Centré') }, { value: 'none', label: tr('None', 'Aucun') },
              ]} /></div>
            <div className="og-field"><label>{tr('Logo', 'Logo')}</label>
              <Segmented size="small" block value={d.logo} onChange={v => set({ logo: v as Design['logo'] })} options={[
                { value: 'top', label: tr('Above', 'Au-dessus') }, { value: 'header', label: tr('In the header', 'Dans l’en-tête') }, { value: 'none', label: tr('Hidden', 'Masqué') },
              ]} /></div>
            <div className="og-field"><label>{tr('Alignment', 'Alignement')}</label>
              <Segmented size="small" block value={d.align} onChange={v => set({ align: v as Design['align'] })} options={[
                { value: 'left', label: tr('Left', 'À gauche') }, { value: 'center', label: tr('Centred', 'Centré') },
              ]} />
              <small>{tr('Long text always stays on the left (easier to read).', 'Le texte long reste toujours à gauche (plus lisible).')}</small></div>
            <div className="og-two">
              <div className="og-field"><label>{tr('Text font', 'Police du texte')}</label>
                <Select value={d.font} onChange={v => set({ font: v })} options={(meta?.design.fonts || Object.keys(FONT_NAMES)).map(f => ({ value: f, label: FONT_NAMES[f] || f }))} /></div>
              <div className="og-field"><label>{tr('Headline font', 'Police des titres')}</label>
                <Select value={d.heading_font} onChange={v => set({ heading_font: v })} options={(meta?.design.fonts || Object.keys(FONT_NAMES)).map(f => ({ value: f, label: FONT_NAMES[f] || f }))} /></div>
            </div>
            <div className="og-two">
              <div className="og-field"><label>{tr('Headline size', 'Taille du titre')} <em>{d.heading_size} px</em></label>
                <Slider min={22} max={38} value={d.heading_size} onChange={v => set({ heading_size: v })} /></div>
              <div className="og-field"><label>{tr('Text size', 'Taille du texte')} <em>{d.body_size} px</em></label>
                <Slider min={14} max={18} value={d.body_size} onChange={v => set({ body_size: v })} /></div>
            </div>
            <div className="og-two">
              <div className="og-field"><label>{tr('Corners', 'Coins')} <em>{d.radius} px</em></label>
                <Slider min={0} max={28} value={d.radius} onChange={v => set({ radius: v })} /></div>
              <div className="og-field"><label>{tr('Spacing', 'Espacement')}</label>
                <Segmented size="small" block value={d.spacing} onChange={v => set({ spacing: v as Design['spacing'] })} options={[
                  { value: 'compact', label: tr('Compact', 'Serré') }, { value: 'normal', label: tr('Normal', 'Normal') }, { value: 'airy', label: tr('Airy', 'Aéré') },
                ]} /></div>
            </div>
            <div className="og-two">
              <div className="og-field"><label>{tr('Buttons', 'Boutons')}</label>
                <Segmented size="small" block value={d.button_shape} onChange={v => set({ button_shape: v as Design['button_shape'] })} options={[
                  { value: 'rounded', label: tr('Rounded', 'Arrondis') }, { value: 'pill', label: tr('Pill', 'Pilule') }, { value: 'square', label: tr('Square', 'Carrés') },
                ]} /></div>
              <div className="og-field"><label>{tr('Button width', 'Largeur des boutons')}</label>
                <Segmented size="small" block value={d.button_width} onChange={v => set({ button_width: v as Design['button_width'] })} options={[
                  { value: 'auto', label: tr('Fitted', 'Ajustée') }, { value: 'full', label: tr('Full width', 'Pleine largeur') },
                ]} /></div>
            </div>
            <div className="og-two">
              <div className="og-field"><label>{tr('Key points', 'Points clés')}</label>
                <Segmented size="small" block value={d.points} onChange={v => set({ points: v as Design['points'] })} options={[
                  { value: 'checks', label: tr('Ticks', 'Coches') }, { value: 'cards', label: tr('Cards', 'Cartes') }, { value: 'numbers', label: tr('Numbers', 'Numéros') },
                ]} /></div>
              <div className="og-field"><label>{tr('Card', 'Carte')}</label>
                <Segmented size="small" block value={d.card} onChange={v => set({ card: v as Design['card'] })} options={[
                  { value: 'shadow', label: tr('Shadow', 'Ombre') }, { value: 'border', label: tr('Border', 'Bordure') }, { value: 'flat', label: tr('Flat', 'Plate') },
                ]} /></div>
            </div>
            <div className="og-field"><label>{tr('Colours', 'Couleurs')} <em>{tr('kept readable automatically (contrast ≥ 4.5:1)', 'gardées lisibles automatiquement (contraste ≥ 4,5:1)')}</em></label>
              <div className="em-colors">
                {COLOR_LABELS(tr).map(([k, label]) => (
                  <label key={k} className="em-color">
                    <ColorPicker size="small" value={d.colors[k]} disabledAlpha onChangeComplete={c => setColorKey(k, c.toHexString())} />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              {!!d.fixed?.length && <small>{tr('Some colours were adjusted to stay readable.', 'Certaines couleurs ont été ajustées pour rester lisibles.')}</small>}
            </div>
          </div>
        ),
      }]} />
    </div>
  );
};

export default EmailDesign;
