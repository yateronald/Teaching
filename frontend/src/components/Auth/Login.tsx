import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, message, Spin } from 'antd';
import {
  MailOutlined,
  LockOutlined,
  GlobalOutlined,
  DownOutlined,
  CheckOutlined,
  ArrowLeftOutlined,
  StarFilled,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { ASSET_PATHS } from '../../utils/assets';
import { brandingUtils } from '../../utils/branding';
import { useTranslation } from 'react-i18next';
import PasswordResetModal from './PasswordResetModal';
import AccountDisabledModal from './AccountDisabledModal';
import SEO from '../SEO/SEO';
import './Login.css';
import { homeFor } from '../../utils/roles';

interface LoginForm {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const [form] = Form.useForm();
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

  const { t, i18n } = useTranslation();
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

  // Back to the exact page that asked for sign-in (a meeting invitation keeps its query and #passcode).
  const fromLoc = location.state?.from;
  const from = fromLoc?.pathname || '/';
  const fromFull = `${from}${fromLoc?.search || ''}${fromLoc?.hash || ''}`;

  useEffect(() => {
    document.title = 'Learn French';
    brandingUtils.applyCSSVariables();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(from === '/' ? homeFor(user.role) : fromFull, { replace: true });
    }
  }, [isAuthenticated, user, navigate, from, fromFull]);

  const onFinish = async (values: LoginForm) => {
    setLoading(true);
    try {
      const result = await login(values.email, values.password);
      if (result.success) {
        // Navigation handled by useEffect
      } else if (result.code === 'ACCOUNT_DISABLED') {
        setAccountDisabledData({ type: 'disabled', message: result.message });
        setAccountDisabledOpen(true);
      } else if (result.code === 'ACCOUNT_LOCKED') {
        setAccountDisabledData({
          type: 'locked', message: result.message,
          lockedUntil: result.locked_until, failedAttempts: result.failed_attempts,
        });
        setAccountDisabledOpen(true);
      }
    } catch {
      message.error(t('login.error_generic'));
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="login-loading">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Sign in — Learn French with Natives"
        description="Sign in to your Learn French with Natives student space."
        path="/login"
        noindex
      />
      <div className="login-page">
        {/* ── LEFT — image-backed editorial brand panel ── */}
        <aside className="login-side">
          <div className="login-side-bg" aria-hidden="true" />
          <div className="login-side-tint" aria-hidden="true" />
          <div className="login-tricolore" aria-hidden="true">
            <span /><span /><span />
          </div>

          <a href="/" className="login-side-logo" aria-label="Accueil">
            <span className="login-side-logo-mark">
              <img src={ASSET_PATHS.LOGOS.MAIN} alt="Learn French with Natives" />
            </span>
            <span className="login-side-logo-text">
              <strong>Learn French</strong>
              <em>with Natives</em>
            </span>
          </a>

          <div className="login-side-body">
            <p className="login-eyebrow">
              <span className="login-eyebrow-dash" aria-hidden="true" />
              {t('login.brand_title')}
            </p>
            <h1 className="login-side-title">
              {t('login.brand_sub')}
            </h1>

            <div className="login-side-exams">
              {['TEF Canada', 'DELF', 'DALF', 'TCF', 'TEFAQ'].map((e) => (
                <span key={e}>{e}</span>
              ))}
            </div>

            <dl className="login-side-stats">
              <div>
                <dd>98%</dd>
                <dt>{t('login.stat_pass')}</dt>
              </div>
              <div>
                <dd>15+</dd>
                <dt>{t('login.stat_teachers')}</dt>
              </div>
              <div>
                <dd>1 000+</dd>
                <dt>{t('login.stat_students')}</dt>
              </div>
            </dl>
          </div>

          <div className="login-side-foot">
            <span className="login-side-rating">
              {[...Array(5)].map((_, i) => <StarFilled key={i} aria-hidden="true" />)}
            </span>
            <span>4,9 / 5 · 500+ avis</span>
          </div>
        </aside>

        {/* ── RIGHT — form panel ── */}
        <main className="login-main">
          <header className="login-topbar">
            {/* Mobile-only logo (side panel hidden on small screens) */}
            <a href="/" className="login-topbar-logo" aria-label="Accueil">
              <img src={ASSET_PATHS.LOGOS.MAIN} alt="Learn French with Natives" />
              <strong>Learn French <em>with Natives</em></strong>
            </a>

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
                <span>{i18n.language === 'en' ? 'Back to home' : 'Retour à l\'accueil'}</span>
              </a>
            </div>
          </header>

          <div className="login-form-wrap">
            <div className="login-card">
              <div className="login-card-tricolore" aria-hidden="true">
                <span /><span /><span />
              </div>

              <div className="login-card-mark">
                <img src={ASSET_PATHS.LOGOS.MAIN} alt="" aria-hidden="true" />
              </div>

              <p className="login-eyebrow login-eyebrow--dark">
                <span className="login-eyebrow-dash" aria-hidden="true" />
                {i18n.language === 'en' ? 'Student space' : 'Espace étudiant'}
              </p>
              <h2 className="login-title">{t('login.title')}</h2>
              <p className="login-sub">{t('login.sub')}</p>

              <Form form={form} name="login" onFinish={onFinish} layout="vertical" size="large" className="login-form">
                <Form.Item
                  name="email"
                  label={t('login.email_label')}
                  rules={[
                    { required: true, message: t('login.email_label') },
                    { type: 'email', message: t('login.error_invalid') },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined className="login-input-icon" />}
                    placeholder={t('login.email_placeholder')}
                    autoComplete="email"
                    className="login-input"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label={t('login.password_label')}
                  rules={[
                    { required: true, message: t('login.password_label') },
                    { min: 6, message: t('login.error_invalid') },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="login-input-icon" />}
                    placeholder={t('login.password_placeholder')}
                    autoComplete="current-password"
                    className="login-input"
                  />
                </Form.Item>

                <div className="login-forgot-row">
                  <Button type="link" onClick={() => setResetOpen(true)} className="login-forgot-link">
                    {t('login.forgot')}
                  </Button>
                </div>

                <Form.Item style={{ marginBottom: 0 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    className="login-submit-btn"
                  >
                    {loading ? t('login.loading') : t('login.submit')}
                  </Button>
                </Form.Item>
              </Form>
            </div>

            <p className="login-footer">
              © {new Date().getFullYear()} Learn French with Natives · Tous droits réservés
            </p>
          </div>
        </main>
      </div>

      <PasswordResetModal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        initialEmail={form.getFieldValue('email')}
        onSuccess={email => form.setFieldsValue({ email, password: '' })}
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
