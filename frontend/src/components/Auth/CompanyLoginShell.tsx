import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckOutlined,
  DownOutlined,
  GlobalOutlined,
  LockOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { apiAsset } from '../../utils/apiAsset';
import { ASSET_PATHS } from '../../utils/assets';
import { HeroRichContent } from '../../utils/heroRichText';
import { normalizePortalBranding, portalCssVars } from '../../utils/portalTheme';
import type { PortalBranding } from '../../utils/portalTheme';
import { emailStepFor, welcomeFor } from './signInAudience';
import type { Audience, CompanyBrand } from './signInAudience';
import './CompanyLogin.css';

export interface CompanyLoginShellProps {
  company: CompanyBrand;
  audience?: Audience;
  step: 'email' | 'password';
  lang: 'en' | 'fr';
  onSelectLang?: (lng: 'en' | 'fr') => void;
  /** Optional raw object URL overrides during optimistic upload previews. */
  logoUrlOverride?: string | null;
  coverUrlOverride?: string | null;
  /** Preview mode for the Branding Studio (renders studio-safe interactive controls). */
  previewMode?: boolean;
  /** Forces layout media mode inside scaled preview stages. */
  forceViewport?: 'desktop' | 'mobile';
  previewEmail?: string;
  onPreviewStepChange?: (step: 'email' | 'password') => void;
  /** Real form rendered inside `.cp-form-slot` when not in `previewMode`. */
  children?: React.ReactNode;
}

const trFor = (lang: 'en' | 'fr') => (en: string, fr: string) => (lang === 'fr' ? fr : en);

export const CompanyLoginShell: React.FC<CompanyLoginShellProps> = ({
  company,
  audience = 'company_learner',
  step,
  lang,
  onSelectLang,
  logoUrlOverride,
  coverUrlOverride,
  previewMode = false,
  forceViewport,
  previewEmail = 'alex.martin@company.com',
  onPreviewStepChange,
  children,
}) => {
  const tr = trFor(lang);
  const branding: PortalBranding = normalizePortalBranding(company.branding);
  const cssVars = portalCssVars(branding);

  const logoSrc = logoUrlOverride !== undefined
    ? logoUrlOverride
    : (company.logo_url ? apiAsset(company.logo_url) : null);
  const coverSrc = coverUrlOverride !== undefined
    ? coverUrlOverride
    : (company.cover_url ? apiAsset(company.cover_url) : null);

  const hasCover = !!coverSrc;
  const placement = branding.cover_placement || 'hero';
  const isFullBg = hasCover && placement === 'full';
  const isHeroBg = hasCover && placement === 'hero' && branding.hero_style === 'cover';
  const isCardImg = hasCover && placement === 'card';
  const effectiveHeroStyle = branding.hero_style === 'cover' && !isHeroBg
    ? 'geometric'
    : branding.hero_style;

  const welcome = welcomeFor({ audience, company: { ...company, branding } }, tr);
  const emailStep = emailStepFor({ ...company, branding }, tr);
  const cardHead = step === 'password' ? welcome : emailStep;
  const tagline = branding.tagline || (audience === 'company_manager' ? tr('Company space', 'Espace entreprise') : tr('Exam preparation', 'Préparation aux examens'));
  const footerCopy = branding.footer_text || `© ${new Date().getFullYear()} ${company.name}`;
  const hasHeroBody = branding.hero_body.trim().length > 0;

  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!langOpen) return;
    const close = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [langOpen]);

  const initial = (company.name || 'C').trim().slice(0, 1).toUpperCase();

  const renderMark = (cls: string) => (
    <span className={`cp-mark ${cls}`} aria-hidden="true">
      {logoSrc ? <img src={logoSrc} alt={company.name} /> : <b>{initial}</b>}
    </span>
  );

  const renderTopActions = () => (
    <div className="cp-top-actions">
      <div ref={langRef} className={`cp-lang${langOpen ? ' is-open' : ''}`}>
        <button
          type="button"
          className="cp-lang-btn"
          onClick={() => setLangOpen(o => !o)}
          aria-label="Switch language"
          aria-expanded={langOpen}
        >
          <GlobalOutlined />
          <span>{lang === 'en' ? 'EN' : 'FR'}</span>
          <DownOutlined className="cp-lang-chev" />
        </button>
        {langOpen && (
          <div className="cp-lang-menu">
            <button
              type="button"
              className={`cp-lang-opt${lang === 'en' ? ' is-active' : ''}`}
              onMouseDown={(e) => { e.preventDefault(); onSelectLang?.('en'); setLangOpen(false); }}
            >
              <span>English</span>
              {lang === 'en' && <CheckOutlined />}
            </button>
            <button
              type="button"
              className={`cp-lang-opt${lang === 'fr' ? ' is-active' : ''}`}
              onMouseDown={(e) => { e.preventDefault(); onSelectLang?.('fr'); setLangOpen(false); }}
            >
              <span>Français</span>
              {lang === 'fr' && <CheckOutlined />}
            </button>
          </div>
        )}
      </div>

      {branding.website_url ? (
        <a
          href={previewMode ? undefined : branding.website_url}
          onClick={previewMode ? (e) => e.preventDefault() : undefined}
          target={previewMode ? undefined : '_blank'}
          rel={previewMode ? undefined : 'noopener noreferrer'}
          className="cp-top-link"
        >
          <ArrowLeftOutlined aria-hidden="true" />
          <span>{tr(`Visit ${company.name}`, `Site ${company.name}`)}</span>
        </a>
      ) : !branding.hide_back_to_home ? (
        <a
          href={previewMode ? undefined : '/'}
          onClick={previewMode ? (e) => e.preventDefault() : undefined}
          className="cp-top-link"
        >
          <ArrowLeftOutlined aria-hidden="true" />
          <span>{tr('Back to home', 'Retour à l’accueil')}</span>
        </a>
      ) : null}
    </div>
  );

  const renderFormArea = () => (
    <div className="cp-card">
      <div className="cp-card-accent" aria-hidden="true" />
      <div className="cp-card-step" key={`${step}:${audience}:${company.slug}`}>
        <div className="cp-card-head-row">
          {renderMark('cp-mark--card')}
          <div className="cp-card-org">
            <span className="cp-eyebrow">
              <span className="cp-eyebrow-dot" aria-hidden="true" />
              {cardHead.eyebrow}
            </span>
          </div>
        </div>

        <h2 className="cp-card-title">{cardHead.title}</h2>
        <p className="cp-card-sub">{cardHead.sub}</p>

        {previewMode ? (
          <div className="cp-preview-form" aria-label={tr('Interactive preview form', 'Formulaire de prévisualisation')}>
            {step === 'email' ? (
              <>
                <label className="cp-prev-label">{tr('Email address', 'Adresse email')}</label>
                <div className="cp-prev-input">
                  <MailOutlined className="cp-prev-icon" />
                  <span>{previewEmail}</span>
                </div>
                <button
                  type="button"
                  className="cp-prev-submit"
                  onClick={() => onPreviewStepChange?.('password')}
                >
                  <span>{tr('Continue', 'Continuer')}</span>
                  <ArrowRightOutlined />
                </button>
              </>
            ) : (
              <>
                <div className="cp-prev-account">
                  <span className="cp-prev-avatar">{previewEmail.slice(0, 1).toUpperCase()}</span>
                  <span className="cp-prev-email">{previewEmail}</span>
                  <button
                    type="button"
                    className="cp-prev-change"
                    onClick={() => onPreviewStepChange?.('email')}
                  >
                    {tr('Change', 'Modifier')}
                  </button>
                </div>
                <label className="cp-prev-label">{tr('Password', 'Mot de passe')}</label>
                <div className="cp-prev-input">
                  <LockOutlined className="cp-prev-icon" />
                  <span className="cp-prev-dots">••••••••••</span>
                </div>
                <div className="cp-prev-forgot">
                  <span>{tr('Forgot password?', 'Mot de passe oublié ?')}</span>
                </div>
                <button type="button" className="cp-prev-submit">
                  <span>{tr('Sign in', 'Se connecter')}</span>
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="cp-form-slot">{children}</div>
        )}

        {(branding.security_badge || branding.support_email) && (
          <div className="cp-card-meta">
            {branding.security_badge && (
              <span className="cp-security-pill">
                <SafetyCertificateOutlined />
                <span>{tr(`Private ${company.name} access`, `Accès privé ${company.name}`)}</span>
              </span>
            )}
            {branding.support_email && (
              <a
                href={previewMode ? undefined : `mailto:${branding.support_email}`}
                onClick={previewMode ? (e) => e.preventDefault() : undefined}
                className="cp-support-link"
              >
                {tr('Need help?', 'Besoin d’aide ?')} {branding.support_email}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderFooter = () => (
    <footer className="cp-footer">
      <span>{footerCopy}</span>
      {!branding.hide_powered_by && (
        <span className="cp-powered-inline">
          {tr('Powered by', 'Propulsé par')} <strong>Learn French with Natives</strong>
        </span>
      )}
    </footer>
  );

  const heroLayer = (
    <>
      <div className={`cp-hero-bg cp-hero-bg--${effectiveHeroStyle}`} aria-hidden="true" />
      {isHeroBg && coverSrc && (
        <div className="cp-hero-img" style={{ backgroundImage: `url("${coverSrc}")` }} aria-hidden="true" />
      )}
      <div className="cp-hero-scrim" aria-hidden="true" />
      <div className="cp-hero-mesh" aria-hidden="true" />
    </>
  );

  const fullBgLayer = isFullBg && coverSrc ? (
    <div className="cp-full-bg-wrap" aria-hidden="true">
      <div className="cp-full-bg-base" />
      <div className="cp-full-bg-img" style={{ backgroundImage: `url("${coverSrc}")` }} />
      <div className="cp-full-bg-scrim" />
    </div>
  ) : null;

  const featureCardNode = (extraClass = '') => (isCardImg && coverSrc ? (
    <div className={`cp-feature-card ${extraClass}`}>
      <img src={coverSrc} alt="" />
    </div>
  ) : null);

  const rootClass = [
    'cp-login',
    `cp-layout--${branding.login_layout}`,
    `cp-hero-style--${effectiveHeroStyle}`,
    isFullBg ? 'cp-cover-full' : '',
    hasHeroBody ? 'cp-has-hero-body' : '',
    forceViewport === 'desktop' ? 'cp-force-desktop' : '',
    forceViewport === 'mobile' ? 'cp-force-mobile' : '',
    previewMode ? 'cp-is-preview' : '',
  ].filter(Boolean).join(' ');

  if (branding.login_layout === 'centered') {
    return (
      <div className={rootClass} style={cssVars}>
        {fullBgLayer}
        <div className={`cp-centered-hero${isFullBg ? ' is-transparent' : ''}`}>
          {!isFullBg && heroLayer}
          <header className="cp-centered-top">
            <div className="cp-brand-lockup">
              {renderMark('cp-mark--hero')}
              <div className="cp-brand-copy">
                <strong>{company.name}</strong>
                <span>{tagline}</span>
              </div>
            </div>
            {renderTopActions()}
          </header>

          <div className="cp-centered-intro">
            {featureCardNode('cp-feature-card--centered')}
            <h1 className="cp-centered-headline">{welcome.side.title}</h1>
            {hasHeroBody && <HeroRichContent text={branding.hero_body} tone="light" align="center" />}
            {branding.show_highlights && welcome.side.chips.length > 0 && (
              <div className="cp-chips cp-chips--centered">
                {welcome.side.chips.map(ch => <span key={ch}>{ch}</span>)}
              </div>
            )}
          </div>
        </div>

        <main className="cp-centered-main">
          {renderFormArea()}
          {renderFooter()}
        </main>
      </div>
    );
  }

  if (branding.login_layout === 'minimal') {
    const lightText = isFullBg || isHeroBg;
    return (
      <div className={rootClass} style={cssVars}>
        {fullBgLayer}
        {isHeroBg ? (
          <div className="cp-minimal-banner">
            {heroLayer}
            <header className="cp-minimal-top">
              <div className="cp-brand-lockup">
                {renderMark('cp-mark--hero')}
                <div className="cp-brand-copy">
                  <strong>{company.name}</strong>
                  <span>{tagline}</span>
                </div>
              </div>
              {renderTopActions()}
            </header>
            <div className="cp-minimal-header is-on-banner">
              <h1 className="cp-minimal-headline is-light">{welcome.side.title}</h1>
              {hasHeroBody && <HeroRichContent text={branding.hero_body} tone="light" align="center" />}
              {branding.show_highlights && welcome.side.chips.length > 0 && (
                <div className="cp-chips cp-chips--centered">
                  {welcome.side.chips.map(ch => <span key={ch}>{ch}</span>)}
                </div>
              )}
            </div>
          </div>
        ) : (
          <header className="cp-minimal-top">
            <div className={`cp-brand-lockup${lightText ? '' : ' is-dark'}`}>
              {renderMark(lightText ? 'cp-mark--hero' : 'cp-mark--minimal')}
              <div className={`cp-brand-copy${lightText ? '' : ' is-dark'}`}>
                <strong>{company.name}</strong>
                <span>{tagline}</span>
              </div>
            </div>
            {renderTopActions()}
          </header>
        )}

        <main className={`cp-minimal-main${isHeroBg ? ' is-after-banner' : ''}`}>
          {!isHeroBg && (
            <div className="cp-minimal-header">
              {featureCardNode(lightText ? 'cp-feature-card--centered' : 'cp-feature-card--centered cp-feature-card--light')}
              <h1 className="cp-minimal-headline">{welcome.side.title}</h1>
              {hasHeroBody && <HeroRichContent text={branding.hero_body} tone={lightText ? 'light' : 'dark'} align="center" />}
              {branding.show_highlights && welcome.side.chips.length > 0 && (
                <div className={`cp-chips cp-chips--centered${lightText ? '' : ' cp-chips--dark'}`}>
                  {welcome.side.chips.map(ch => <span key={ch}>{ch}</span>)}
                </div>
              )}
            </div>
          )}
          {renderFormArea()}
          {renderFooter()}
        </main>
      </div>
    );
  }

  /* Default: Split Showcase layout */
  return (
    <div className={rootClass} style={cssVars}>
      {fullBgLayer}
      <aside className="cp-split-side">
        {!isFullBg && heroLayer}
        <div className="cp-split-accent-bar" aria-hidden="true" />

        <div className="cp-brand-lockup cp-split-logo">
          {renderMark('cp-mark--hero')}
          <div className="cp-brand-copy">
            <strong>{company.name}</strong>
            <span>{tagline}</span>
          </div>
        </div>

        <div className="cp-split-body" key={`${audience}:${company.slug}`}>
          {featureCardNode()}
          <p className="cp-side-eyebrow">
            <span className="cp-side-dash" aria-hidden="true" />
            {welcome.side.eyebrow}
          </p>
          <h1 className="cp-side-title">{welcome.side.title}</h1>
          {hasHeroBody && <HeroRichContent text={branding.hero_body} tone="light" align="left" />}
          {branding.show_highlights && welcome.side.chips.length > 0 && (
            <div className="cp-chips">
              {welcome.side.chips.map(ch => <span key={ch}>{ch}</span>)}
            </div>
          )}
        </div>

        <div className="cp-split-foot">
          {!branding.hide_powered_by ? (
            <span className="cp-powered-badge">
              {tr('Powered by', 'Propulsé par')} <img src={ASSET_PATHS.LOGOS.MAIN} alt="" aria-hidden="true" /> <strong>Learn French with Natives</strong>
            </span>
          ) : (
            <span className="cp-portal-status">
              <span className="cp-portal-dot" aria-hidden="true" />
              <span>{tr(`${company.name} Official Portal`, `Portail officiel ${company.name}`)}</span>
            </span>
          )}
        </div>
      </aside>

      <main className="cp-split-main">
        {/* Mobile compact hero header when split sidebar collapses */}
        <div className="cp-mobile-banner">
          {!isFullBg && heroLayer}
          <div className="cp-mobile-banner-inner">
            <div className="cp-brand-lockup">
              {renderMark('cp-mark--mobile')}
              <div className="cp-brand-copy">
                <strong>{company.name}</strong>
                <span>{tagline}</span>
              </div>
            </div>
            {renderTopActions()}
          </div>
        </div>

        <header className="cp-split-topbar">
          {renderTopActions()}
        </header>

        <div className="cp-split-form-wrap">
          {renderFormArea()}
          {renderFooter()}
        </div>
      </main>
    </div>
  );
};

export default CompanyLoginShell;
