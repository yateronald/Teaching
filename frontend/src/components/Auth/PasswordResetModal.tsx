import React, { useEffect, useRef, useState } from 'react';
import { Button, ConfigProvider, Form, Input, Modal } from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleFilled,
  CheckOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  ExclamationCircleFilled,
  LockOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import './PasswordResetModal.css';

interface Props {
  open: boolean;
  onClose: () => void;
  initialEmail?: string;
  /** Called with the email once the password was changed (e.g. to prefill the sign-in form). */
  onSuccess?: (email: string) => void;
}

type Step = 'request' | 'verify' | 'reset' | 'done';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SEC = 30;
const MIN_PASSWORD = 6; // mirrors the backend rule

const EMPTY = Array<string>(OTP_LENGTH).fill('');

const passwordChecks = (pw: string) => ({
  length: pw.length >= MIN_PASSWORD,
  case: /[a-z]/.test(pw) && /[A-Z]/.test(pw),
  number: /\d/.test(pw),
  symbol: /[^A-Za-z0-9]/.test(pw),
});

/** 0 = empty, 1 weak, 2 fair, 3 good, 4 strong */
const strengthOf = (pw: string) => {
  if (!pw) return 0;
  const c = passwordChecks(pw);
  if (!c.length) return 1;
  const extras = [pw.length >= 10, c.case, c.number, c.symbol].filter(Boolean).length;
  return extras <= 1 ? 1 : extras === 2 ? 2 : extras === 3 ? 3 : 4;
};

const PasswordResetModal: React.FC<Props> = ({ open, onClose, initialEmail = '', onSuccess }) => {
  const { requestPasswordReset, verifyPasswordReset, completePasswordReset } = useAuth();
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [digits, setDigits] = useState<string[]>(EMPTY);
  const [shake, setShake] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const newPassword: string = Form.useWatch('newPassword', form) || '';

  useEffect(() => { if (open) setEmail(initialEmail || ''); }, [open, initialEmail]);

  // Code countdown — computed immediately so it never flashes "expired" on the first second.
  useEffect(() => {
    if (!expiresAt || step !== 'verify') return;
    const tick = () => setTimeLeft(Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [expiresAt, step]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setInterval(() => setCooldown(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => window.clearInterval(id);
  }, [cooldown]);

  useEffect(() => {
    if (!notice) return;
    const id = window.setTimeout(() => setNotice(null), 4000);
    return () => window.clearTimeout(id);
  }, [notice]);

  useEffect(() => {
    if (step === 'verify') window.setTimeout(() => inputsRef.current[0]?.focus(), 60);
  }, [step]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = String(timeLeft % 60).padStart(2, '0');
  const expired = step === 'verify' && !!expiresAt && timeLeft <= 0;
  const code = digits.join('');

  const errorText = (res: { error?: string }) =>
    res.error === 'Network error' ? t('reset.network_error') : t('reset.generic_error');

  const resetState = () => {
    setStep('request');
    setDigits(EMPTY);
    setExpiresAt(null);
    setTimeLeft(0);
    setCooldown(0);
    setResetToken(null);
    setLoading(false);
    setError(null);
    setNotice(null);
    form.resetFields();
  };

  const handleClose = () => {
    if (loading) return;
    resetState();
    onClose();
  };

  /* ── Step 1: send the code ── */
  const sendCode = async (address: string, isResend = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await requestPasswordReset(address);
      if (!res.success) { setError(errorText(res)); return; }
      setEmail(address);
      setDigits(EMPTY);
      setExpiresAt(res.expiresAt || new Date(Date.now() + 10 * 60_000).toISOString());
      setCooldown(RESEND_COOLDOWN_SEC);
      if (isResend) {
        setNotice(t('reset.otp_resent'));
        window.setTimeout(() => inputsRef.current[0]?.focus(), 0);
      } else {
        setStep('verify');
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 2: verify ── */
  const verify = async (value: string) => {
    if (value.length !== OTP_LENGTH || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await verifyPasswordReset(email, value);
      if (res.success && res.token) {
        setResetToken(res.token);
        setStep('reset');
        return;
      }
      setError(res.error === 'Network error' ? t('reset.network_error') : t('reset.otp_invalid'));
      setShake(true);
      window.setTimeout(() => setShake(false), 450);
      setDigits(EMPTY);
      window.setTimeout(() => inputsRef.current[0]?.focus(), 0);
    } finally {
      setLoading(false);
    }
  };

  const fill = (next: string[], focusIdx: number) => {
    setDigits(next);
    setError(null);
    window.setTimeout(() => inputsRef.current[focusIdx]?.focus(), 0);
    if (next.every(Boolean) && !expired) verify(next.join(''));
  };

  const setDigit = (index: number, raw: string) => {
    const value = raw.replace(/\D/g, '');
    if (!value) { const next = [...digits]; next[index] = ''; setDigits(next); return; }
    // Typing several digits at once (autofill on mobile) spreads them across the boxes.
    const next = [...digits];
    let i = index;
    for (const ch of value.slice(0, OTP_LENGTH - index)) next[i++] = ch;
    fill(next, Math.min(i, OTP_LENGTH - 1));
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      e.preventDefault();
      const next = [...digits];
      next[index - 1] = '';
      setDigits(next);
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      e.preventDefault();
      inputsRef.current[index + 1]?.focus();
    } else if (e.key === 'Enter') {
      verify(code);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    const next = [...EMPTY];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    fill(next, Math.min(pasted.length, OTP_LENGTH - 1));
  };

  /* ── Step 3: new password ── */
  const handleComplete = async (values: { newPassword: string }) => {
    if (!resetToken) { setStep('request'); setError(t('reset.session_invalid')); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await completePasswordReset(email, resetToken, values.newPassword);
      if (res.success) { setStep('done'); return; }
      if (res.expired) {
        setResetToken(null);
        setStep('request');
        setError(t('reset.session_expired'));
      } else {
        setError(errorText(res));
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── View ── */
  const stepIndex = step === 'request' ? 0 : step === 'verify' ? 1 : 2;
  const stepNames = [t('reset.step_account'), t('reset.step_verify'), t('reset.step_new_password')];
  const strength = strengthOf(newPassword);
  const checks = passwordChecks(newPassword);
  const strengthName = ['', t('reset.strength_weak'), t('reset.strength_fair'), t('reset.strength_good'), t('reset.strength_strong')][strength];

  const header = {
    request: { icon: <MailOutlined />, title: t('reset.title_request'), text: <>{t('reset.intro_email')}</> },
    verify: {
      icon: <SafetyCertificateOutlined />,
      title: t('reset.title_verify'),
      text: (
        <>
          {t('reset.otp_sent_prefix')}<strong>{email}</strong>{t('reset.otp_sent_suffix')}{' '}
          <button type="button" className="pr-inline-link" onClick={() => { setError(null); setStep('request'); }} disabled={loading}>
            {t('reset.change_email')}
          </button>
        </>
      ),
    },
    reset: { icon: <LockOutlined />, title: t('reset.title_new'), text: <>{t('reset.intro_new_password')}</> },
    done: { icon: <CheckOutlined />, title: t('reset.title_done'), text: <>{t('reset.done_text')}</> },
  }[step];

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={448}
      centered
      destroyOnHidden
      closable={false}
      maskClosable={!loading}
      className="pr-modal"
      title={null}
    >
      <ConfigProvider theme={{ token: { colorPrimary: '#1E40AF', borderRadius: 12, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' } }}>
        <div className="pr">
          <div className="pr-top">
            {step === 'verify' ? (
              <button type="button" className="pr-back" onClick={() => { setError(null); setStep('request'); }} disabled={loading}>
                <ArrowLeftOutlined /> {t('reset.btn_back')}
              </button>
            ) : <span />}
            <button type="button" className="pr-close" onClick={handleClose} aria-label={t('reset.btn_close')} disabled={loading}>
              <CloseOutlined />
            </button>
          </div>

          {step !== 'done' && (
            <div className="pr-progress">
              <div className="pr-progress-bars" aria-hidden>
                {[0, 1, 2].map(i => <span key={i} className={i < stepIndex ? 'is-done' : i === stepIndex ? 'is-current' : ''} />)}
              </div>
              <span className="pr-progress-label">
                {t('reset.step_of', { current: stepIndex + 1, total: 3 })} · <b>{stepNames[stepIndex]}</b>
              </span>
            </div>
          )}

          <div key={step} className="pr-stage">
            <div className={`pr-icon is-${step}`}>{header.icon}</div>
            <h3 className="pr-title">{header.title}</h3>
            <p className="pr-text">{header.text}</p>

            {error && (
              <div className="pr-alert" role="alert">
                <ExclamationCircleFilled />
                <span>{error}</span>
              </div>
            )}

            {/* Step 1 — email */}
            {step === 'request' && (
              <Form form={form} layout="vertical" requiredMark={false} className="pr-form" initialValues={{ email }}
                onFinish={(v: { email: string }) => sendCode(v.email.trim())}>
                <Form.Item name="email" label={t('reset.email_label')}
                  rules={[
                    { required: true, message: t('reset.email_required') },
                    { type: 'email', message: t('reset.email_invalid') },
                  ]}>
                  <Input size="large" prefix={<MailOutlined />} placeholder={t('reset.email_placeholder')} autoComplete="email" autoFocus inputMode="email" />
                </Form.Item>
                <Button type="primary" htmlType="submit" size="large" block loading={loading} className="pr-primary">
                  {t('reset.btn_send_code')}
                </Button>
                <button type="button" className="pr-link-center" onClick={handleClose}>
                  <ArrowLeftOutlined /> {t('reset.btn_back_signin')}
                </button>
              </Form>
            )}

            {/* Step 2 — code */}
            {step === 'verify' && (
              <div className="pr-form">
                <div className={`pr-otp${shake ? ' is-error' : ''}${expired ? ' is-expired' : ''}`} onPaste={handlePaste} role="group" aria-label={t('reset.otp_required')}>
                  {digits.map((d, idx) => (
                    <input
                      key={idx}
                      ref={el => { inputsRef.current[idx] = el; }}
                      value={d}
                      onChange={e => setDigit(idx, e.target.value)}
                      onKeyDown={e => handleKeyDown(idx, e)}
                      onFocus={e => e.target.select()}
                      inputMode="numeric"
                      autoComplete={idx === 0 ? 'one-time-code' : 'off'}
                      maxLength={OTP_LENGTH}
                      disabled={loading || expired}
                      className={`pr-otp-box${d ? ' is-filled' : ''}`}
                      aria-label={t('reset.otp_digit_aria', { index: idx + 1 })}
                    />
                  ))}
                </div>

                <div className="pr-otp-meta">
                  <span className={`pr-timer${expired ? ' is-expired' : timeLeft < 60 ? ' is-warn' : ''}`}>
                    <ClockCircleOutlined />
                    {expired ? t('reset.otp_expired') : t('reset.otp_expires_in', { minutes, seconds })}
                  </span>
                  <span className="pr-resend">
                    {t('reset.otp_resend_prompt')}{' '}
                    <button type="button" className="pr-inline-link" disabled={cooldown > 0 || loading} onClick={() => sendCode(email, true)}>
                      {cooldown > 0 ? t('reset.otp_resend_in', { seconds: cooldown }) : t('reset.otp_resend')}
                    </button>
                  </span>
                </div>

                {notice && <div className="pr-notice" role="status"><CheckCircleFilled /> {notice}</div>}

                <Button type="primary" size="large" block loading={loading} disabled={code.length !== OTP_LENGTH || expired}
                  onClick={() => verify(code)} className="pr-primary">
                  {t('reset.btn_verify')}
                </Button>
                <p className="pr-hint">{t('reset.otp_spam_hint')}</p>
              </div>
            )}

            {/* Step 3 — new password */}
            {step === 'reset' && (
              <Form form={form} layout="vertical" requiredMark={false} className="pr-form" onFinish={handleComplete}>
                <Form.Item name="newPassword" label={t('reset.new_password_label')} className="pr-item-tight"
                  rules={[
                    { required: true, message: t('reset.new_password_required') },
                    { min: MIN_PASSWORD, message: t('reset.new_password_min') },
                  ]}>
                  <Input.Password size="large" prefix={<LockOutlined />} placeholder={t('reset.new_password_placeholder')} autoComplete="new-password" autoFocus />
                </Form.Item>

                <div className={`pr-strength is-${strength}`} aria-live="polite">
                  <div className="pr-strength-bars" aria-hidden>{[1, 2, 3, 4].map(i => <span key={i} className={i <= strength ? 'is-on' : ''} />)}</div>
                  <span className="pr-strength-label">{t('reset.strength_label')}: <b>{strength ? strengthName : '—'}</b></span>
                </div>
                <ul className="pr-rules">
                  <li className={checks.length ? 'is-ok' : ''}><CheckCircleFilled /> {t('reset.rule_length', { count: MIN_PASSWORD })}</li>
                  <li className={checks.case ? 'is-ok' : ''}><CheckCircleFilled /> {t('reset.rule_case')}</li>
                  <li className={checks.number ? 'is-ok' : ''}><CheckCircleFilled /> {t('reset.rule_number')}</li>
                  <li className={checks.symbol ? 'is-ok' : ''}><CheckCircleFilled /> {t('reset.rule_symbol')}</li>
                </ul>

                <Form.Item name="confirmPassword" label={t('reset.confirm_password_label')} dependencies={['newPassword']}
                  rules={[
                    { required: true, message: t('reset.confirm_password_required') },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                        return Promise.reject(new Error(t('reset.confirm_password_match')));
                      },
                    }),
                  ]}>
                  <Input.Password size="large" prefix={<LockOutlined />} placeholder={t('reset.confirm_password_placeholder')} autoComplete="new-password" />
                </Form.Item>
                <Button type="primary" htmlType="submit" size="large" block loading={loading} className="pr-primary">
                  {t('reset.btn_reset')}
                </Button>
              </Form>
            )}

            {/* Done */}
            {step === 'done' && (
              <div className="pr-form">
                <Button type="primary" size="large" block className="pr-primary"
                  onClick={() => { onSuccess?.(email); handleClose(); }}>
                  {t('reset.btn_back_signin')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </ConfigProvider>
    </Modal>
  );
};

export default PasswordResetModal;
