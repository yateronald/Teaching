import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Spin } from 'antd';
import { UserOutlined, LockOutlined, CheckCircleFilled } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { ASSET_PATHS } from '../../utils/assets';
import { brandingUtils } from '../../utils/branding';
import { useTranslation } from 'react-i18next';
import PasswordResetModal from './PasswordResetModal';
import AccountDisabledModal from './AccountDisabledModal';
import SEO from '../SEO/SEO';
import './Login.css';

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

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    document.title = 'Learn French';
    brandingUtils.applyCSSVariables();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      const dashboardPath = user.role === 'admin' ? '/dashboard' :
        user.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard';
      navigate(from === '/' ? dashboardPath : from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, from]);

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
        {/* Full-bleed image background */}
        <div className="login-bg-image" />
        <div className="login-bg-overlay" />

        {/* Decorative floating shapes */}
        <div className="login-bg-blob login-bg-blob--a" />
        <div className="login-bg-blob login-bg-blob--b" />

        {/* Top brand bar */}
        <div className="login-brand-bar">
          <div className="login-brand">
            <img src={ASSET_PATHS.LOGOS.MAIN} alt="Logo" className="login-brand-logo" />
            <div className="login-brand-text">
              <strong>Learn French</strong>
              <span>with Natives</span>
            </div>
          </div>
          <div className="login-brand-bar-right">
            {/* Language switcher dropdown */}
            <div className={`lp-lang-switcher${langOpen ? ' is-open' : ''}`}>
              <button
                className="lp-lang-toggle"
                onClick={() => setLangOpen((o) => !o)}
                onBlur={() => setTimeout(() => setLangOpen(false), 150)}
                aria-label="Switch language"
                aria-expanded={langOpen}
              >
                <span className="lp-lang-toggle-flag">
                  {i18n.language === 'en' ? '🇬🇧' : '🇫🇷'}
                </span>
                <span className="lp-lang-toggle-label">
                  {i18n.language === 'en' ? 'EN' : 'FR'}
                </span>
                <span className="lp-lang-toggle-chevron">▾</span>
              </button>
              {langOpen && (
                <div className="lp-lang-dropdown">
                  <button
                    className={`lp-lang-option${i18n.language === 'en' ? ' is-active' : ''}`}
                    onClick={() => { i18n.changeLanguage('en'); setLangOpen(false); }}
                  >
                    <span>🇬🇧</span> English
                  </button>
                  <button
                    className={`lp-lang-option${i18n.language === 'fr' ? ' is-active' : ''}`}
                    onClick={() => { i18n.changeLanguage('fr'); setLangOpen(false); }}
                  >
                    <span>🇫🇷</span> Français
                  </button>
                </div>
              )}
            </div>
            <a href="/" className="login-back-link">← {i18n.language === 'en' ? 'Back to home' : 'Retour à l\'accueil'}</a>
          </div>
        </div>

        {/* Centered card */}
        <div className="login-card">
          <div className="login-card-inner">
            {/* Header */}
            <div className="login-form-header">
              <div className="login-logo-mark">
                <img src={ASSET_PATHS.LOGOS.MAIN} alt="Learn French with Natives" />
              </div>
              <h2>{t('login.title')}</h2>
              <p>{t('login.sub')}</p>
            </div>

            {/* Form */}
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
                  prefix={<UserOutlined className="login-input-icon" />}
                  placeholder={t('login.email_placeholder')}
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

            {/* Brand panel — official prep + trust signals merged into one elegant card */}
            <div className="login-brand-panel">
              <div className="login-brand-panel-header">
                <div className="login-brand-panel-icon">
                  <CheckCircleFilled />
                </div>
                <div>
                  <strong>{t('login.brand_title')}</strong>
                  <span>{t('login.brand_sub')}</span>
                </div>
              </div>

              <div className="login-brand-panel-exams">
                {['TEF Canada', 'DELF', 'DALF', 'TCF', 'TEFAQ'].map((e) => (
                  <span key={e} className="login-brand-exam-pill">{e}</span>
                ))}
              </div>

              <div className="login-brand-panel-stats">
                <div className="login-brand-stat">
                  <strong>98%</strong>
                  <span>{t('login.stat_pass')}</span>
                </div>
                <div className="login-brand-stat-divider" />
                <div className="login-brand-stat">
                  <strong>15+</strong>
                  <span>{t('login.stat_teachers')}</span>
                </div>
                <div className="login-brand-stat-divider" />
                <div className="login-brand-stat">
                  <strong>1 000+</strong>
                  <span>{t('login.stat_students')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="login-footer">
          <p>© {new Date().getFullYear()} Learn French with Natives · Tous droits réservés</p>
        </div>
      </div>

      <PasswordResetModal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        initialEmail={form.getFieldValue('email')}
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
