import React, { useEffect, useMemo, useRef, useState } from 'react';
import { App as AntApp, Button, Input, Popconfirm, Segmented, Slider, Switch, Tabs, Tooltip, Upload } from 'antd';
import {
  BgColorsOutlined,
  CheckOutlined,
  CopyOutlined,
  DeleteOutlined,
  DesktopOutlined,
  ExportOutlined,
  FontSizeOutlined,
  GlobalOutlined,
  LockOutlined,
  MobileOutlined,
  PictureOutlined,
  PlusOutlined,
  ReloadOutlined,
  SaveOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { apiAsset } from '../../utils/apiAsset';
import { useTr } from '../../utils/useTr';
import {
  DEFAULT_PORTAL_BRANDING,
  THEME_PRESETS,
  isLightColor,
  normalizePortalBranding,
  validateHex,
  validateHttpsUrl,
} from '../../utils/portalTheme';
import type { ButtonStyle, HeroStyle, LoginLayout, PortalBranding, SurfaceTone } from '../../utils/portalTheme';
import CompanyLoginShell from '../Auth/CompanyLoginShell';
import type { CompanyBrand } from '../Auth/signInAudience';
import { call, errorText } from './orgModel';
import type { Company } from './orgModel';
import './PortalBrandingEditor.css';

const LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DESKTOP_STAGE_W = 1140;
const DESKTOP_STAGE_H = 680;

export interface PortalBrandingEditorProps {
  company: Company;
  mode: 'admin' | 'org';
  readOnly?: boolean;
  onSaved: () => void | Promise<void>;
}

const LayoutThumb: React.FC<{ kind: LoginLayout }> = ({ kind }) => {
  if (kind === 'centered') {
    return (
      <span className="pbe-thumb pbe-thumb--centered" aria-hidden="true">
        <span className="pbe-thumb-band" />
        <span className="pbe-thumb-card" />
      </span>
    );
  }
  if (kind === 'minimal') {
    return (
      <span className="pbe-thumb pbe-thumb--minimal" aria-hidden="true">
        <span className="pbe-thumb-dot" />
        <span className="pbe-thumb-card" />
      </span>
    );
  }
  return (
    <span className="pbe-thumb pbe-thumb--split" aria-hidden="true">
      <span className="pbe-thumb-hero" />
      <span className="pbe-thumb-side">
        <span className="pbe-thumb-mini-card" />
      </span>
    </span>
  );
};

const PortalBrandingEditor: React.FC<PortalBrandingEditorProps> = ({
  company,
  mode,
  readOnly = false,
  onSaved,
}) => {
  const { apiCall } = useAuth();
  const { tr: appTr } = useTr();
  const { message } = AntApp.useApp();

  // Admin console stays in crisp English; company manager portal stays bilingual.
  const tr = useMemo(
    () => (mode === 'admin' ? (en: string) => en : appTr),
    [mode, appTr]
  );

  const initialBranding = useMemo(
    () => normalizePortalBranding(company.brand?.branding),
    [company.brand?.branding]
  );

  const [draft, setDraft] = useState<PortalBranding>(initialBranding);
  const [displayNameDraft, setDisplayNameDraft] = useState(company.display_name || company.name);
  const [slugDraft, setSlugDraft] = useState(company.slug);
  const [newBadge, setNewBadge] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Live preview controls
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [previewStep, setPreviewStep] = useState<'email' | 'password'>('email');
  const [previewLang, setPreviewLang] = useState<'en' | 'fr'>(company.default_language);

  useEffect(() => {
    setDraft(initialBranding);
  }, [initialBranding]);

  useEffect(() => {
    setDisplayNameDraft(company.display_name || company.name);
    setSlugDraft(company.slug);
    setPreviewLang(company.default_language);
  }, [company.display_name, company.name, company.slug, company.default_language]);

  // Measure the right-hand preview frame to scale desktop 1140x680 smoothly.
  const stageOuterRef = useRef<HTMLDivElement | null>(null);
  const [stageWidth, setStageWidth] = useState(560);
  useEffect(() => {
    const el = stageOuterRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const obs = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect?.width;
      if (w && w > 0) setStageWidth(w);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const scale = Math.min(1, Math.max(0.28, stageWidth / DESKTOP_STAGE_W));
  const scaledHeight = Math.round(DESKTOP_STAGE_H * scale);

  const patch = (next: Partial<PortalBranding>) => setDraft(prev => ({ ...prev, ...next }));

  const basePath = mode === 'admin' ? `/admin/organizations/${company.id}` : '/org';
  const settingsPath = mode === 'admin' ? `/admin/organizations/${company.id}` : '/org/settings';

  const slugValid = SLUG_RE.test(slugDraft.trim().toLowerCase());
  const urlValid = validateHttpsUrl(draft.website_url);
  const emailValid = !draft.support_email.trim() || EMAIL_RE.test(draft.support_email.trim());
  const colorsValid = validateHex(draft.primary_color) && validateHex(draft.secondary_color);
  const displayNameValid = !!displayNameDraft.trim();
  const canSave = !readOnly && displayNameValid && colorsValid && urlValid && emailValid && (mode !== 'admin' || slugValid);

  const dirty = useMemo(() => {
    const slugChanged = mode === 'admin' && slugDraft.trim().toLowerCase() !== company.slug.toLowerCase();
    const nameChanged = displayNameDraft.trim() !== (company.display_name || company.name);
    return nameChanged || slugChanged || JSON.stringify(draft) !== JSON.stringify(initialBranding);
  }, [displayNameDraft, company.display_name, company.name, draft, initialBranding, mode, slugDraft, company.slug]);

  const uploadAsset = async (kind: 'logo' | 'cover', file: File) => {
    const maxBytes = kind === 'logo' ? 1024 * 1024 : 2 * 1024 * 1024;
    if (!LOGO_TYPES.includes(file.type)) {
      message.error(tr('PNG, JPG or WebP only.', 'PNG, JPG ou WebP uniquement.'));
      return false;
    }
    if (file.size > maxBytes) {
      message.error(kind === 'logo'
        ? tr('The logo must be 1 MB or less.', 'Le logo doit faire 1 Mo maximum.')
        : tr('The cover image must be 2 MB or less.', 'L’image de couverture doit faire 2 Mo maximum.'));
      return false;
    }
    const setBusy = kind === 'logo' ? setUploadingLogo : setUploadingCover;
    setBusy(true);
    try {
      const form = new FormData();
      form.append(kind, file);
      await call(apiCall, `${basePath}/${kind}`, 'POST', form);
      if (kind === 'cover' && draft.hero_style !== 'cover') {
        patch({ hero_style: 'cover' });
      }
      message.success(kind === 'logo'
        ? tr('Logo updated', 'Logo mis à jour')
        : tr('Cover image updated', 'Image de couverture mise à jour'));
      await onSaved();
    } catch (e) {
      message.error(errorText(e, tr));
    } finally {
      setBusy(false);
    }
    return false;
  };

  const removeAsset = async (kind: 'logo' | 'cover') => {
    try {
      await call(apiCall, `${basePath}/${kind}`, 'DELETE');
      if (kind === 'cover' && draft.hero_style === 'cover') {
        patch({ hero_style: 'geometric' });
      }
      message.success(kind === 'logo'
        ? tr('Logo removed', 'Logo supprimé')
        : tr('Cover image removed', 'Image de couverture supprimée'));
      await onSaved();
    } catch (e) {
      message.error(errorText(e, tr));
    }
  };

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        display_name: displayNameDraft.trim(),
        portal_branding: draft,
      };
      if (mode === 'admin' && slugDraft.trim().toLowerCase() !== company.slug.toLowerCase()) {
        payload.slug = slugDraft.trim().toLowerCase();
      }
      await call(apiCall, settingsPath, 'PUT', payload);
      message.success(tr('Portal branding saved', 'Personnalisation enregistrée'));
      await onSaved();
    } catch (e) {
      message.error(errorText(e, tr));
    } finally {
      setSaving(false);
    }
  };

  const resetDefaults = () => {
    setDraft(prev => ({
      ...DEFAULT_PORTAL_BRANDING,
      hide_powered_by: mode === 'admin' ? DEFAULT_PORTAL_BRANDING.hide_powered_by : prev.hide_powered_by,
    }));
  };

  const currentHighlights = draft.highlights ?? (
    previewLang === 'fr'
      ? ['Compréhension écrite', 'Compréhension orale', 'Expression écrite', 'Expression orale']
      : ['Reading', 'Listening', 'Writing', 'Speaking']
  );

  const addBadge = () => {
    const clean = newBadge.trim().slice(0, 36);
    if (!clean) return;
    if (currentHighlights.length >= 4) {
      message.warning(tr('At most 4 badges can be shown.', '4 badges maximum peuvent être affichés.'));
      return;
    }
    patch({ highlights: [...currentHighlights, clean] });
    setNewBadge('');
  };

  const removeBadgeAt = (idx: number) => {
    patch({ highlights: currentHighlights.filter((_, i) => i !== idx) });
  };

  const effectiveSlug = (mode === 'admin' && slugValid ? slugDraft.trim().toLowerCase() : company.slug);
  const liveUrl = `${window.location.origin}/o/${effectiveSlug}`;

  const previewCompany: CompanyBrand = {
    name: displayNameDraft.trim() || company.name,
    slug: effectiveSlug,
    logo_url: company.brand?.logo_url || null,
    cover_url: company.brand?.cover_url || null,
    default_language: company.default_language,
    branding: draft,
  };

  const appearanceTab = (
    <div className="pbe-tab-pane">
      {/* Display name & Portal URL */}
      <div className="pbe-group">
        <div className="pbe-group-title">{tr('Portal identity & address', 'Identité & adresse du portail')}</div>
        <div className="pbe-field">
          <label>{tr('Name shown to learners', 'Nom affiché aux apprenants')}</label>
          <Input
            value={displayNameDraft}
            onChange={e => setDisplayNameDraft(e.target.value)}
            maxLength={160}
            status={!displayNameValid ? 'error' : undefined}
            disabled={readOnly}
          />
        </div>
        {mode === 'admin' ? (
          <div className="pbe-slug-row">
            <Input
              addonBefore="/o/"
              value={slugDraft}
              onChange={e => setSlugDraft(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              maxLength={80}
              status={slugDraft && !slugValid ? 'error' : undefined}
              disabled={readOnly}
            />
            <Tooltip title={tr('Copy portal link', 'Copier le lien')}>
              <Button icon={<CopyOutlined />} onClick={() => navigator.clipboard?.writeText(liveUrl).then(() => message.success(tr('Link copied', 'Lien copié')))} />
            </Tooltip>
          </div>
        ) : (
          <div className="pbe-url-bar">
            <span>{liveUrl}</span>
            <Button size="small" type="text" icon={<CopyOutlined />} onClick={() => navigator.clipboard?.writeText(liveUrl).then(() => message.success(tr('Link copied', 'Lien copié')))}>
              {tr('Copy', 'Copier')}
            </Button>
          </div>
        )}
        <small className="pbe-hint">{tr('Share this link with your learners so they land directly on your branded sign-in page.', 'Partagez ce lien à vos apprenants pour qu’ils arrivent directement sur votre page de connexion personnalisée.')}</small>
      </div>

      {/* Logo & Cover uploads */}
      <div className="pbe-group">
        <div className="pbe-group-title">{tr('Brand visuals', 'Visuels de marque')}</div>
        <div className="pbe-media-grid">
          <div className="pbe-media-box">
            <div className="pbe-media-thumb">
              {company.brand?.logo_url
                ? <img src={apiAsset(company.brand.logo_url)} alt={previewCompany.name} />
                : <b>{previewCompany.name.slice(0, 1).toUpperCase()}</b>}
            </div>
            <div className="pbe-media-info">
              <strong>{tr('Company logo', 'Logo entreprise')}</strong>
              <span>{tr('PNG, JPG or WebP, max 1 MB', 'PNG, JPG ou WebP, 1 Mo max')}</span>
              <div className="pbe-media-btns">
                <Upload accept=".png,.jpg,.jpeg,.webp" showUploadList={false} beforeUpload={(f) => uploadAsset('logo', f)} disabled={readOnly}>
                  <Button size="small" icon={<UploadOutlined />} loading={uploadingLogo} disabled={readOnly}>
                    {company.brand?.logo_url ? tr('Replace', 'Remplacer') : tr('Upload', 'Importer')}
                  </Button>
                </Upload>
                {company.brand?.logo_url && (
                  <Popconfirm title={tr('Remove logo?', 'Supprimer le logo ?')} okText={tr('Remove', 'Supprimer')} okButtonProps={{ danger: true }} onConfirm={() => removeAsset('logo')}>
                    <Button size="small" danger icon={<DeleteOutlined />} disabled={readOnly} />
                  </Popconfirm>
                )}
              </div>
            </div>
          </div>

          <div className="pbe-media-box">
            <div className="pbe-media-thumb is-cover">
              {company.brand?.cover_url
                ? <img src={apiAsset(company.brand.cover_url)} alt="" />
                : <PictureOutlined style={{ fontSize: 20, color: '#94A3B8' }} />}
            </div>
            <div className="pbe-media-info">
              <strong>{tr('Cover background', 'Image de couverture')}</strong>
              <span>{tr('Wide photo (PNG/JPG/WebP, max 2 MB)', 'Photo large (PNG/JPG/WebP, 2 Mo max)')}</span>
              <div className="pbe-media-btns">
                <Upload accept=".png,.jpg,.jpeg,.webp" showUploadList={false} beforeUpload={(f) => uploadAsset('cover', f)} disabled={readOnly}>
                  <Button size="small" icon={<UploadOutlined />} loading={uploadingCover} disabled={readOnly}>
                    {company.brand?.cover_url ? tr('Replace', 'Remplacer') : tr('Upload', 'Importer')}
                  </Button>
                </Upload>
                {company.brand?.cover_url && (
                  <Popconfirm title={tr('Remove cover image?', 'Supprimer l’image de couverture ?')} okText={tr('Remove', 'Supprimer')} okButtonProps={{ danger: true }} onConfirm={() => removeAsset('cover')}>
                    <Button size="small" danger icon={<DeleteOutlined />} disabled={readOnly} />
                  </Popconfirm>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Theme presets */}
      <div className="pbe-group">
        <div className="pbe-group-title">{tr('Color presets', 'Palettes prêtes à l’emploi')}</div>
        <div className="pbe-presets">
          {THEME_PRESETS.map(p => {
            const active = draft.primary_color === p.primary_color && draft.secondary_color === p.secondary_color;
            return (
              <button
                key={p.id}
                type="button"
                disabled={readOnly}
                className={`pbe-preset${active ? ' is-active' : ''}`}
                onClick={() => patch({
                  primary_color: p.primary_color,
                  secondary_color: p.secondary_color,
                  surface_tone: p.surface_tone,
                  hero_style: company.brand?.cover_url && draft.hero_style === 'cover' ? 'cover' : p.hero_style,
                })}
              >
                <span className="pbe-preset-dots">
                  <i style={{ background: p.primary_color }} />
                  <i style={{ background: p.secondary_color }} />
                </span>
                <span>{tr(p.name, p.nameFr)}</span>
                {active && <CheckOutlined className="pbe-preset-check" />}
              </button>
            );
          })}
        </div>

        <div className="pbe-colors-row">
          <label className="pbe-color-field">
            <span>{tr('Primary brand color', 'Couleur principale')}</span>
            <div className="pbe-color-input">
              <input
                type="color"
                value={validateHex(draft.primary_color) ? draft.primary_color : '#16325C'}
                onChange={e => patch({ primary_color: e.target.value.toUpperCase() })}
                disabled={readOnly}
              />
              <Input
                value={draft.primary_color}
                onChange={e => patch({ primary_color: e.target.value.toUpperCase() })}
                maxLength={7}
                status={draft.primary_color && !validateHex(draft.primary_color) ? 'error' : undefined}
                disabled={readOnly}
              />
            </div>
            {validateHex(draft.primary_color) && isLightColor(draft.primary_color) && (
              <small className="pbe-hint is-info">{tr('Light primary: dark text is automatically applied on buttons for legibility.', 'Couleur claire : le texte des boutons passe automatiquement en foncé pour rester lisible.')}</small>
            )}
          </label>

          <label className="pbe-color-field">
            <span>{tr('Accent color', 'Couleur secondaire')}</span>
            <div className="pbe-color-input">
              <input
                type="color"
                value={validateHex(draft.secondary_color) ? draft.secondary_color : '#0F766E'}
                onChange={e => patch({ secondary_color: e.target.value.toUpperCase() })}
                disabled={readOnly}
              />
              <Input
                value={draft.secondary_color}
                onChange={e => patch({ secondary_color: e.target.value.toUpperCase() })}
                maxLength={7}
                status={draft.secondary_color && !validateHex(draft.secondary_color) ? 'error' : undefined}
                disabled={readOnly}
              />
            </div>
          </label>
        </div>
      </div>

      {/* Layout template */}
      <div className="pbe-group">
        <div className="pbe-group-title">{tr('Login page layout', 'Mise en page')}</div>
        <div className="pbe-layout-grid">
          {([
            { id: 'split', en: 'Split Showcase', fr: 'Écran partagé' },
            { id: 'centered', en: 'Centered Card', fr: 'Carte centrée' },
            { id: 'minimal', en: 'Minimal Clean', fr: 'Minimal épuré' },
          ] as { id: LoginLayout; en: string; fr: string }[]).map(opt => (
            <button
              key={opt.id}
              type="button"
              disabled={readOnly}
              className={`pbe-layout-btn${draft.login_layout === opt.id ? ' is-active' : ''}`}
              onClick={() => patch({ login_layout: opt.id })}
            >
              <LayoutThumb kind={opt.id} />
              <span>{tr(opt.en, opt.fr)}</span>
            </button>
          ))}
        </div>

        <div className="pbe-two-controls">
          <div className="pbe-control-col">
            <label>{tr('Backdrop style', 'Style d’arrière-plan')}</label>
            <Segmented
              block
              disabled={readOnly}
              value={draft.hero_style}
              onChange={v => patch({ hero_style: v as HeroStyle })}
              options={[
                { value: 'geometric', label: tr('Geometric', 'Géométrique') },
                { value: 'gradient', label: tr('Gradient', 'Dégradé') },
                { value: 'solid', label: tr('Solid', 'Uni') },
                { value: 'cover', label: tr('Cover', 'Photo'), disabled: !company.brand?.cover_url },
              ]}
            />
          </div>

          <div className="pbe-control-col">
            <label>{tr('Page surface', 'Fond de page')}</label>
            <Segmented
              block
              disabled={readOnly}
              value={draft.surface_tone}
              onChange={v => patch({ surface_tone: v as SurfaceTone })}
              options={[
                { value: 'clean', label: tr('Clean', 'Pur') },
                { value: 'warm', label: tr('Warm', 'Chaud') },
                { value: 'slate', label: tr('Slate', 'Ardoise') },
              ]}
            />
          </div>
        </div>

        <div className="pbe-two-controls">
          <div className="pbe-control-col">
            <label>{tr('Button corners', 'Style des boutons')}</label>
            <Segmented
              block
              disabled={readOnly}
              value={draft.button_style}
              onChange={v => patch({ button_style: v as ButtonStyle })}
              options={[
                { value: 'rounded', label: tr('Rounded', 'Arrondi') },
                { value: 'pill', label: tr('Pill', 'Pilule') },
                { value: 'sharp', label: tr('Sharp', 'Carré') },
              ]}
            />
          </div>

          {draft.hero_style === 'cover' && company.brand?.cover_url && (
            <div className="pbe-control-col">
              <label>{tr('Cover scrim darkness', 'Contraste de l’image')}: {draft.cover_overlay}%</label>
              <Slider
                min={35}
                max={85}
                value={draft.cover_overlay}
                onChange={v => patch({ cover_overlay: v })}
                disabled={readOnly}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const copyTab = (
    <div className="pbe-tab-pane">
      <div className="pbe-group">
        <div className="pbe-field">
          <label>{tr('Portal tagline / subtitle', 'Sous-titre du portail')} <em>{tr('optional', 'optionnel')}</em></label>
          <Input
            value={draft.tagline}
            onChange={e => patch({ tagline: e.target.value })}
            maxLength={80}
            placeholder={tr('e.g. Corporate Language Academy', 'ex. Académie des langues')}
            disabled={readOnly}
          />
          <small className="pbe-hint">{tr('Shown beneath the company logo and in the browser tab.', 'Affiché sous le logo de l’entreprise et dans l’onglet du navigateur.')}</small>
        </div>

        <div className="pbe-field">
          <label>{tr('Hero headline', 'Titre principal')} <em>{tr('optional', 'optionnel')}</em></label>
          <Input
            value={draft.headline}
            onChange={e => patch({ headline: e.target.value })}
            maxLength={110}
            placeholder={tr(`Prepare for the TCF with ${previewCompany.name}`, `Préparez le TCF avec ${previewCompany.name}`)}
            disabled={readOnly}
          />
        </div>

        <div className="pbe-field">
          <label>{tr('Sign-in card welcome message', 'Message d’accueil sur la carte')} <em>{tr('optional', 'optionnel')}</em></label>
          <Input.TextArea
            value={draft.welcome_message}
            onChange={e => patch({ welcome_message: e.target.value })}
            maxLength={240}
            autoSize={{ minRows: 2, maxRows: 4 }}
            placeholder={tr(`Sign in to ${previewCompany.name}'s learning portal.`, `Connectez-vous à l’espace de formation de ${previewCompany.name}.`)}
            disabled={readOnly}
          />
        </div>
      </div>

      <div className="pbe-group">
        <div className="pbe-switch-row">
          <div>
            <strong>{tr('Show feature highlight badges', 'Afficher les badges de programme')}</strong>
            <span>{tr('Displays up to 4 skill or program tags on the portal hero.', 'Affiche jusqu’à 4 pastilles de compétences ou de programme.')}</span>
          </div>
          <Switch checked={draft.show_highlights} onChange={v => patch({ show_highlights: v })} disabled={readOnly} />
        </div>

        {draft.show_highlights && (
          <div className="pbe-badges-box">
            <div className="pbe-badges-list">
              {currentHighlights.map((item, idx) => (
                <span key={`${item}-${idx}`} className="pbe-badge-pill">
                  <span>{item}</span>
                  {!readOnly && (
                    <button type="button" onClick={() => removeBadgeAt(idx)} aria-label={tr('Remove badge', 'Retirer')}>×</button>
                  )}
                </span>
              ))}
            </div>
            <div className="pbe-badge-add">
              <Input
                value={newBadge}
                onChange={e => setNewBadge(e.target.value)}
                onPressEnter={(e) => { e.preventDefault(); addBadge(); }}
                maxLength={36}
                placeholder={tr('Add a badge (e.g. B2 Readiness)', 'Ajouter un badge (ex. Objectif B2)')}
                disabled={readOnly || currentHighlights.length >= 4}
              />
              <Button icon={<PlusOutlined />} onClick={addBadge} disabled={readOnly || !newBadge.trim() || currentHighlights.length >= 4}>
                {tr('Add', 'Ajouter')}
              </Button>
              {draft.highlights !== null && (
                <Button type="link" size="small" onClick={() => patch({ highlights: null })} disabled={readOnly}>
                  {tr('Use defaults', 'Par défaut')}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const linksTab = (
    <div className="pbe-tab-pane">
      <div className="pbe-group">
        <div className="pbe-field">
          <label><GlobalOutlined /> {tr('Company website URL', 'Site web de l’entreprise')} <em>{tr('https:// only', 'https:// uniquement')}</em></label>
          <Input
            value={draft.website_url}
            onChange={e => patch({ website_url: e.target.value })}
            maxLength={200}
            placeholder="https://www.company.com"
            status={draft.website_url && !urlValid ? 'error' : undefined}
            disabled={readOnly}
          />
          <small className="pbe-hint">
            {draft.website_url && !urlValid
              ? tr('Enter a public https:// URL.', 'Saisissez une URL publique commençant par https://.')
              : tr('When set, replaces any external link with a link back to your company website.', 'Si renseigné, affiche un lien direct vers le site web de votre entreprise.')}
          </small>
        </div>

        <div className="pbe-field">
          <label>{tr('Learner support email', 'Email de support apprenants')} <em>{tr('optional', 'optionnel')}</em></label>
          <Input
            type="email"
            value={draft.support_email}
            onChange={e => patch({ support_email: e.target.value })}
            maxLength={120}
            placeholder="training@company.com"
            status={draft.support_email && !emailValid ? 'error' : undefined}
            disabled={readOnly}
          />
          <small className="pbe-hint">{tr('Displayed on the sign-in card and in learner invitation emails.', 'Affiché sous la carte de connexion et dans les emails d’invitation.')}</small>
        </div>

        <div className="pbe-field">
          <label>{tr('Custom copyright / footer notice', 'Mention légale en pied de page')} <em>{tr('optional', 'optionnel')}</em></label>
          <Input
            value={draft.footer_text}
            onChange={e => patch({ footer_text: e.target.value })}
            maxLength={140}
            placeholder={`© ${new Date().getFullYear()} ${previewCompany.name}`}
            disabled={readOnly}
          />
        </div>
      </div>

      <div className="pbe-group">
        <div className="pbe-group-title">{tr('White-label & security', 'Marque blanche et sécurité')}</div>
        <div className="pbe-switch-row">
          <div>
            <strong>{tr('Hide platform homepage link', 'Masquer le lien vers l’accueil plateforme')}</strong>
            <span>{tr('Recommended so learners stay inside your dedicated company portal.', 'Recommandé pour que vos apprenants restent dans votre portail dédié.')}</span>
          </div>
          <Switch checked={draft.hide_back_to_home} onChange={v => patch({ hide_back_to_home: v })} disabled={readOnly} />
        </div>

        <div className="pbe-switch-row">
          <div>
            <strong>{tr('Show private portal security notice', 'Afficher l’indicateur d’accès privé')}</strong>
            <span>{tr('Displays a verified private access badge below the sign-in form.', 'Affiche un badge d’accès privé vérifié sous le formulaire.')}</span>
          </div>
          <Switch checked={draft.security_badge} onChange={v => patch({ security_badge: v })} disabled={readOnly} />
        </div>

        <div className="pbe-switch-row">
          <div>
            <strong>{tr('Full white-label (hide “Powered by”)', 'Marque blanche complète (masquer « Propulsé par »)')}</strong>
            <span>
              {mode === 'admin'
                ? tr('Hides “Powered by Learn French with Natives” on /o/<slug> and learner emails.', 'Masque toute mention de Learn French with Natives sur /o/<slug>.')
                : tr('Managed by your platform administrator.', 'Géré par l’administrateur de la plateforme.')}
            </span>
          </div>
          <Switch
            checked={draft.hide_powered_by}
            onChange={v => patch({ hide_powered_by: v })}
            disabled={readOnly || mode !== 'admin'}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="pbe-studio">
      {/* LEFT: Controls */}
      <div className="pbe-controls">
        <div className="pbe-controls-card">
          <Tabs
            className="pbe-tabs"
            items={[
              { key: 'look', label: <><BgColorsOutlined /> {tr('Look & Media', 'Apparence & Médias')}</>, children: appearanceTab },
              { key: 'copy', label: <><FontSizeOutlined /> {tr('Portal Copy', 'Textes')}</>, children: copyTab },
              { key: 'links', label: <><LockOutlined /> {tr('White-Label & Links', 'Liens & Marque')}</>, children: linksTab },
            ]}
          />

          <div className="pbe-savebar">
            <Popconfirm
              title={tr('Reset visual theme and copy to defaults?', 'Réinitialiser le thème et les textes par défaut ?')}
              okText={tr('Reset', 'Réinitialiser')}
              onConfirm={resetDefaults}
              disabled={readOnly}
            >
              <Button icon={<ReloadOutlined />} disabled={readOnly || saving}>{tr('Reset', 'Réinitialiser')}</Button>
            </Popconfirm>
            <span className="pbe-savebar-spacer" />
            {dirty && <span className="pbe-dirty-dot">{tr('Unsaved changes', 'Modifications non enregistrées')}</span>}
            <Button type="primary" icon={<SaveOutlined />} onClick={save} loading={saving} disabled={!dirty || !canSave}>
              {tr('Save branding', 'Enregistrer')}
            </Button>
          </div>
        </div>
      </div>

      {/* RIGHT: Sticky Live WYSIWYG Preview */}
      <div className="pbe-preview-col">
        <div className="pbe-preview-shell">
          <div className="pbe-preview-bar">
            <div className="pbe-preview-title">
              <strong>{tr('Live sign-in preview', 'Aperçu en direct')}</strong>
              <span>{tr('Exact rendering seen by learners', 'Rendu exact vu par les apprenants')}</span>
            </div>
            <div className="pbe-preview-controls">
              <Segmented
                size="small"
                value={viewport}
                onChange={v => setViewport(v as 'desktop' | 'mobile')}
                options={[
                  { value: 'desktop', icon: <DesktopOutlined /> },
                  { value: 'mobile', icon: <MobileOutlined /> },
                ]}
              />
              <Segmented
                size="small"
                value={previewStep}
                onChange={v => setPreviewStep(v as 'email' | 'password')}
                options={[
                  { value: 'email', label: tr('1. Email', '1. Email') },
                  { value: 'password', label: tr('2. Password', '2. Mot de passe') },
                ]}
              />
              <Segmented
                size="small"
                value={previewLang}
                onChange={v => setPreviewLang(v as 'en' | 'fr')}
                options={[{ value: 'en', label: 'EN' }, { value: 'fr', label: 'FR' }]}
              />
              <Tooltip title={tr('Open live sign-in page in new tab', 'Ouvrir la page en direct')}>
                <Button size="small" icon={<ExportOutlined />} href={`/o/${effectiveSlug}`} target="_blank" rel="noopener noreferrer" />
              </Tooltip>
            </div>
          </div>

          <div className="pbe-browser-bar">
            <span className="pbe-browser-dots" aria-hidden="true"><i /><i /><i /></span>
            <span className="pbe-browser-url">
              <LockOutlined />
              <span>{liveUrl}</span>
            </span>
          </div>

          <div ref={stageOuterRef} className={`pbe-stage-outer${viewport === 'mobile' ? ' is-mobile' : ''}`}>
            {viewport === 'desktop' ? (
              <div className="pbe-stage-viewport" style={{ height: scaledHeight }}>
                <div
                  className="pbe-stage-canvas"
                  style={{
                    width: DESKTOP_STAGE_W,
                    height: DESKTOP_STAGE_H,
                    transform: `scale(${scale})`,
                  }}
                >
                  <CompanyLoginShell
                    company={previewCompany}
                    audience="company_learner"
                    step={previewStep}
                    lang={previewLang}
                    onSelectLang={setPreviewLang}
                    onPreviewStepChange={setPreviewStep}
                    previewMode
                    forceViewport="desktop"
                  />
                </div>
              </div>
            ) : (
              <div className="pbe-phone-frame">
                <div className="pbe-phone-notch" aria-hidden="true" />
                <div className="pbe-phone-screen">
                  <CompanyLoginShell
                    company={previewCompany}
                    audience="company_learner"
                    step={previewStep}
                    lang={previewLang}
                    onSelectLang={setPreviewLang}
                    onPreviewStepChange={setPreviewStep}
                    previewMode
                    forceViewport="mobile"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortalBrandingEditor;
