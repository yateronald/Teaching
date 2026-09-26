import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, message, Spin } from 'antd';
import {
  MailOutlined,
  LockOutlined,
  GlobalOutlined,
  DownOutlined,
  CheckOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  StarFilled,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { apiAsset } from '../../utils/apiAsset';
import { ASSET_PATHS } from '../../utils/assets';
import { brandingUtils } from '../../utils/branding';
import { useTranslation } from 'react-i18next';
import { useTr } from '../../utils/useTr';
import PasswordResetModal from './PasswordResetModal';
import AccountDisabledModal from './AccountDisabledModal';
import DeviceLimitModal from './DeviceLimitModal';
import type { DeviceSession } from '../../utils/devices';
import SEO from '../SEO/SEO';
import './Login.css';
import { homeFor } from '../../utils/roles';
import { emailStepFor, readPresentation, welcomeFor } from './signInAudience';
import type { CompanyBrand, Presentation } from './signInAudience';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** A company's logo on a white tile, or its initial. */
const CompanyMark: React.FC<{ company: CompanyBrand; className: string }> = ({ company, className }) => (
  <span className={className}>
    {company.logo_url
      ? <img src={apiAsset(company.logo_url)} alt={company.name} />
      : <b aria-hidden="true">{company.name.slice(0, 1).toUpperCase()}</b>}
  </span>
);

/* ══════════════════════════════════════════
   Email-first sign-in. Step 1 asks for the email only; the server says which
   space it belongs to (never whether it exists: unknown emails and
   administrators get the same neutral welcome); step 2 greets the person in
   that space — with their company's logo for company accounts — and asks for
   the password. A company's own address (/o/<slug>) is branded from the start.
══════════════════════════════════════════ */
const Login: React.FC = () => {
  const [form] = Form.useForm();
  // The email being typed (step 1), read without touching the form during render.
  const typedEmail: string = Form.useWatch('email', form) || '';
  const { slug } = useParams<{ slug?: string }>();
  const [slugCompany, setSlugCompany] = useState<CompanyBrand | null>(null);
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [found, setFound] = useState<Presentation | null>(null);
  const [identifying, setIdentifying] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [resetOpen, setResetOpen] = useState(false);
  const [accountDisabledOpen, setAccountDisabledOpen] = useState(false);
  const [accountDisabledData, setAccountDisabledData] = useState<{
    type: 'disabled' | 'locked';
    message?: string;
    lockedUntil?: string;
    failedAttempts?: number;
  }>({ type: 'disabled' });

  // An exam account may only be signed in on so many devices; this holds the
  // refusal until the person picks what to do.
  const [deviceLimit, setDeviceLimit] = useState<{
    limit: number;
    devices: DeviceSession[];
    canSignOutOthers: boolean;
  } | null>(null);
  const [takingOver, setTakingOver] = useState(false);

  const { t, i18n } = useTranslation();
  const { tr } = useTr();
  const [langOpen, setLangOpen] = useState(false);
  const langSwitcherRef = useRef<HTMLDivElement | null>(null);

  // Close on outside click — replaces the racy onBlur+setTimeout pattern
  // that was preventing language changes from registering.
  useEffect(() => {
    if (!langOpen) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (langSwitcherRef.current && !langSwitcherRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [langOpen]);

  const handleSelectLang = (lng: 'en' | 'fr') => {
    if (i18n.language !== lng) {
      i18n.changeLanguage(lng);
      try { localStorage.setItem('i18n_lang', lng); } catch { /* ignore */ }
    }
    setLangOpen(false);
  };

  /** A company's language, unless this device already chose one. */
  const followCompanyLanguage = (c: CompanyBrand | null | undefined) => {
    if (!c) return;
    let chosen: string | null = null;
    try { chosen = localStorage.getItem('i18n_lang'); } catch { /* private mode */ }
    if (!chosen && c.default_language && i18n.language !== c.default_language) i18n.changeLanguage(c.default_language);
  };

  // Back to the exact page that asked for sign-in (a meeting invitation keeps its query and #passcode).
  const fromLoc = location.state?.from;
  const from = fromLoc?.pathname || '/';
  const fromFull = `${from}${fromLoc?.search || ''}${fromLoc?.hash || ''}`;

  // A company's sign-in address shows its name and logo from the first step.
  useEffect(() => {
    if (!slug) { setSlugCompany(null); return; }
    let alive = true;
    fetch(`${API_BASE}/public/org/${encodeURIComponent(slug)}`)
      .then(r => (r.ok ? r.json() : null))
      .then((b: unknown) => {
        if (!alive || !b) return;
        const p = readPresentation({ audience: 'company_learner', company: b });
        if (p.company) { setSlugCompany(p.company); followCompanyLanguage(p.company); }
      })
      .catch(() => { /* the plain sign-in page still works */ });
    return () => { alive = false; };
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  // What the page shows. On a company's own address, the neutral answer keeps
  // that company's welcome (it tells nothing either way).
  const shown: Presentation = step === 'password' && found
    ? (found.audience === 'platform' && slugCompany ? { audience: 'company_learner', company: slugCompany } : found)
    : (slugCompany ? { audience: 'company_learner', company: slugCompany } : { audience: 'platform' });
  const company = shown.company || null;
  const welcome = welcomeFor(shown, tr);
  const head = step === 'password' ? welcome : emailStepFor(slugCompany, tr);

  useEffect(() => {
    document.title = company ? company.name : 'Learn French with Natives';
    brandingUtils.applyCSSVariables();
  }, [company]);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(from === '/' ? homeFor(user.role) : fromFull, { replace: true });
    }
  }, [isAuthenticated, user, navigate, from, fromFull]);

  /** Step 1 → 2: which space this email signs in to. Any failure (network, rate
   *  limit) still moves on, with the neutral welcome: sign-in never depends on it. */
  const identify = async (raw: string) => {
    const clean = raw.trim();
    setIdentifying(true);
    let p: Presentation = { audience: 'platform' };
    try {
      const r = await fetch(`${API_BASE}/auth/identify`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: clean }),
      });
      if (r.ok) p = readPresentation(await r.json());
    } catch { /* neutral welcome */ }
    followCompanyLanguage(p.company);
    setEmail(clean);
    setFound(p);
    setStep('password');
    setIdentifying(false);
  };

  const backToEmail = () => {
    form.setFieldsValue({ email, password: '' });
    setStep('email');
    setFound(null);
  };

  const signIn = async (password: string) => {
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        // Navigation handled by useEffect
      } else if (result.code === 'ACCOUNT_DISABLED') {
        setAccountDisabledData({ type: 'disabled', message: result.message });
        setAccountDisabledOpen(true);
      } else if (result.code === 'ORG_SUSPENDED') {
        setAccountDisabledData({
          type: 'disabled',
          message: tr('Your company’s account is disabled. Please contact your company’s administrator or Learn French with Natives.',
            'Le compte de votre entreprise est désactivé. Contactez l’administrateur de votre entreprise ou Learn French with Natives.'),
        });
        setAccountDisabledOpen(true);
      } else if (result.code === 'ACCOUNT_LOCKED') {
        setAccountDisabledData({
          type: 'locked', message: result.message,
          lockedUntil: result.locked_until, failedAttempts: result.failed_attempts,
        });
        setAccountDisabledOpen(true);
      } else if (result.code === 'SESSION_LIMIT' || result.code === 'SESSION_TAKEOVER_BLOCKED') {
        setDeviceLimit({
          limit: result.limit || 2,
          devices: result.sessions || [],
          canSignOutOthers: !!result.can_sign_out_others,
        });
      }
    } catch {
      message.error(t('login.error_generic'));
    } finally {
      setLoading(false);
    }
  };

  const onFinish = (values: { email?: string; password?: string }) => {
    if (step === 'email') identify(values.email || '');
    else signIn(values.password || '');
  };

  // Sign the other devices out and come in here instead. The account holder is
  // notified, so a shared password does not stay quiet.
  const signOutOtherDevices = async () => {
    setTakingOver(true);
    try {
      const result = await login(email, form.getFieldValue('password'), { signOutOthers: true });
      if (result.success) {
        setDeviceLimit(null);
        if (result.signed_out_others) message.info(t('login.devices.done'));
      } else if (result.code === 'SESSION_TAKEOVER_BLOCKED') {
        setDeviceLimit({ limit: result.limit || 2, devices: result.sessions || [], canSignOutOthers: false });
      } else {
        setDeviceLimit(null);
      }
    } catch {
      message.error(t('login.error_generic'));
    } finally {
      setTakingOver(false);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="login-loading">
        <Spin size="large" />
      </div>
    );
  }

  const isCompany = !!company;
  const sideKey = `${shown.audience}:${company?.slug || ''}`;

  return (
    <>
      <SEO
        title="Sign in — Learn French with Natives"
        description="Sign in to your Learn French with Natives space."
        path="/login"
        noindex
      />
      <div className={`login-page${isCompany ? ' login-page--company' : ''}`}>
        {/* ── LEFT — brand panel: Learn French with Natives, or the company ── */}
        <aside className="login-side">
          <div className="login-side-bg" aria-hidden="true" />
          <div className="login-side-tint" aria-hidden="true" />
          <div className="login-tricolore" aria-hidden="true">
            <span /><span /><span />
          </div>

          {company ? (
            <div className="login-side-logo">
              <CompanyMark company={company} className="login-side-logo-mark login-company-mark" />
              <span className="login-side-logo-text">
                <strong>{company.name}</strong>
                <em>{shown.audience === 'company_manager' ? tr('Company space', 'Espace entreprise') : tr('Exam preparation', 'Préparation aux examens')}</em>
              </span>
            </div>
          ) : (
            <a href="/" className="login-side-logo" aria-label="Accueil">
              <span className="login-side-logo-mark">
                <img src={ASSET_PATHS.LOGOS.MAIN} alt="Learn French with Natives" />
              </span>
              <span className="login-side-logo-text">
                <strong>Learn French</strong>
                <em>with Natives</em>
              </span>
            </a>
          )}

          <div className="login-side-body" key={sideKey}>
            <p className="login-eyebrow">
              <span className="login-eyebrow-dash" aria-hidden="true" />
              {welcome.side.eyebrow}
            </p>
            <h1 className="login-side-title">{welcome.side.title}</h1>
            <div className="login-side-exams">
              {welcome.side.chips.map(e => <span key={e}>{e}</span>)}
            </div>
            {welcome.side.stats && (
              <dl className="login-side-stats">
                <div><dd>98%</dd><dt>{t('login.stat_pass')}</dt></div>
                <div><dd>15+</dd><dt>{t('login.stat_teachers')}</dt></div>
                <div><dd>1 000+</dd><dt>{t('login.stat_students')}</dt></div>
              </dl>
            )}
          </div>

          <div className="login-side-foot">
            {company ? (
              <span className="login-powered">{tr('Powered by', 'Propulsé par')} <img src={ASSET_PATHS.LOGOS.MAIN} alt="" aria-hidden="true" /> <strong>Learn French with Natives</strong></span>
            ) : (
              <>
                <span className="login-side-rating">
                  {[...Array(5)].map((_, i) => <StarFilled key={i} aria-hidden="true" />)}
                </span>
                <span>4,9 / 5 · 500+ avis</span>
              </>
            )}
          </div>
        </aside>

        {/* ── RIGHT — form panel ── */}
        <main className="login-main">
          <header className="login-topbar">
            {/* Mobile-only logo (side panel hidden on small screens) */}
            {company ? (
              <span className="login-topbar-logo">
                {company.logo_url && <img src={apiAsset(company.logo_url)} alt="" />}
                <strong>{company.name}</strong>
              </span>
            ) : (
              <a href="/" className="login-topbar-logo" aria-label="Accueil">
                <img src={ASSET_PATHS.LOGOS.MAIN} alt="Learn French with Natives" />
                <strong>Learn French <em>with Natives</em></strong>
              </a>
            )}

            <div className="login-topbar-actions">
              <div ref={langSwitcherRef} className={`login-lang${langOpen ? ' is-open' : ''}`}>
                <button
                  type="button"
                  className="login-lang-toggle"
                  onClick={() => setLangOpen((o) => !o)}
                  aria-label="Switch language"
                  aria-expanded={langOpen}
                >
                  <GlobalOutlined />
                  <span>{i18n.language === 'en' ? 'EN' : 'FR'}</span>
                  <DownOutlined className="login-lang-chevron" />
                </button>
                {langOpen && (
                  <div className="login-lang-dropdown">
                    <button
                      type="button"
                      className={`login-lang-option${i18n.language === 'en' ? ' is-active' : ''}`}
                      onMouseDown={(e) => { e.preventDefault(); handleSelectLang('en'); }}
                    >
                      English
                      {i18n.language === 'en' && <CheckOutlined />}
                    </button>
                    <button
                      type="button"
                      className={`login-lang-option${i18n.language === 'fr' ? ' is-active' : ''}`}
                      onMouseDown={(e) => { e.preventDefault(); handleSelectLang('fr'); }}
                    >
                      Français
                      {i18n.language === 'fr' && <CheckOutlined />}
                    </button>
                  </div>
                )}
              </div>
              <a href="/" className="login-back-link">
                <ArrowLeftOutlined aria-hidden="true" />
                <span>{tr('Back to home', 'Retour à l’accueil')}</span>
              </a>
            </div>
          </header>

          <div className="login-form-wrap">
            <div className="login-card">
              <div className="login-card-tricolore" aria-hidden="true">
                <span /><span /><span />
              </div>

              <div className="login-step" key={`${step}:${sideKey}`}>
                {company
                  ? <CompanyMark company={company} className="login-card-mark login-card-mark--company" />
                  : <div className="login-card-mark"><img src={ASSET_PATHS.LOGOS.MAIN} alt="" aria-hidden="true" /></div>}

                <p className="login-eyebrow login-eyebrow--dark">
                  <span className="login-eyebrow-dash" aria-hidden="true" />
                  {head.eyebrow}
                </p>
                <h2 className="login-title">{head.title}</h2>
                <p className="login-sub">{head.sub}</p>

                <Form form={form} name="login" onFinish={onFinish} layout="vertical" size="large" className="login-form" requiredMark={false}>
                  {step === 'email' ? (
                    <>
                      <Form.Item
                        name="email"
                        label={t('login.email_label')}
                        rules={[
                          { required: true, message: tr('Enter your email address', 'Saisissez votre adresse email') },
                          { pattern: EMAIL_RE, message: t('login.error_invalid') },
                        ]}
                      >
                        <Input
                          prefix={<MailOutlined className="login-input-icon" />}
                          placeholder={t('login.email_placeholder')}
                          autoComplete="username"
                          inputMode="email"
                          autoFocus
                          className="login-input"
                        />
                      </Form.Item>
                      <Form.Item style={{ marginBottom: 0 }}>
                        <Button type="primary" htmlType="submit" loading={identifying} block className="login-submit-btn">
                          {tr('Continue', 'Continuer')} {!identifying && <ArrowRightOutlined />}
                        </Button>
                      </Form.Item>
                    </>
                  ) : (
                    <>
                      <div className="login-account">
                        <span className="login-account-avatar" aria-hidden="true">{email.slice(0, 1).toUpperCase()}</span>
                        <span className="login-account-email" title={email}>{email}</span>
                        <button type="button" className="login-account-change" onClick={backToEmail}>{tr('Change', 'Modifier')}</button>
                      </div>
                      {/* For password managers: the account this password belongs to. */}
                      <input className="login-sr-only" type="email" name="username" autoComplete="username" value={email} readOnly tabIndex={-1} aria-hidden="true" />

                      <Form.Item
                        name="password"
                        label={t('login.password_label')}
                        rules={[
                          { required: true, message: tr('Enter your password', 'Saisissez votre mot de passe') },
                          { min: 6, message: t('login.error_invalid') },
                        ]}
                      >
                        <Input.Password
                          prefix={<LockOutlined className="login-input-icon" />}
                          placeholder={t('login.password_placeholder')}
                          autoComplete="current-password"
                          autoFocus
                          className="login-input"
                        />
                      </Form.Item>

                      <div className="login-forgot-row">
                        <Button type="link" onClick={() => setResetOpen(true)} className="login-forgot-link">
                          {t('login.forgot')}
                        </Button>
                      </div>

                      <Form.Item style={{ marginBottom: 0 }}>
                        <Button type="primary" htmlType="submit" loading={loading} block className="login-submit-btn">
                          {loading ? t('login.loading') : t('login.submit')}
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form>
              </div>
            </div>

            <p className="login-footer">
              © {new Date().getFullYear()} Learn French with Natives · {tr('All rights reserved', 'Tous droits réservés')}
            </p>
          </div>
        </main>
      </div>

      <PasswordResetModal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        initialEmail={email || typedEmail}
        onSuccess={resetEmail => {
          form.setFieldsValue({ password: '' });
          // Reset for another address: that one has to be identified first.
          if (resetEmail && resetEmail.trim().toLowerCase() !== email.toLowerCase()) {
            form.setFieldsValue({ email: resetEmail.trim() });
            setStep('email');
            setFound(null);
          }
        }}
      />
      <DeviceLimitModal
        open={!!deviceLimit}
        onClose={() => setDeviceLimit(null)}
        onSignOutOthers={signOutOtherDevices}
        busy={takingOver}
        limit={deviceLimit?.limit ?? 2}
        devices={deviceLimit?.devices ?? []}
        canSignOutOthers={!!deviceLimit?.canSignOutOthers}
      />
      <AccountDisabledModal
        visible={accountDisabledOpen}
        onClose={() => setAccountDisabledOpen(false)}
        type={accountDisabledData.type}
        message={accountDisabledData.message}
        lockedUntil={accountDisabledData.lockedUntil}
        failedAttempts={accountDisabledData.failedAttempts}
      />
    </>
  );
};

export default Login;
