import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Form, Input, Button, Steps, message } from 'antd';
import {
  LockOutlined,
  MailOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import './PasswordResetModal.css';

interface Props {
  open: boolean;
  onClose: () => void;
  initialEmail?: string;
}

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SEC = 30;

const PasswordResetModal: React.FC<Props> = ({ open, onClose, initialEmail = '' }) => {
  const { requestPasswordReset, verifyPasswordReset, completePasswordReset } = useAuth();
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'request' | 'verify' | 'reset'>('request');
  const [email, setEmail] = useState(initialEmail);
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => { setEmail(initialEmail || ''); }, [initialEmail]);

  useEffect(() => {
    if (!expiresAt || step !== 'verify') return;
    const interval = setInterval(() => {
      const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setTimeLeft(diff);
      if (diff <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, step]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const minutes = useMemo(() => Math.floor(timeLeft / 60), [timeLeft]);
  const seconds = useMemo(() => (timeLeft % 60).toString().padStart(2, '0'), [timeLeft]);

  const timerClass = timeLeft <= 0 ? 'pw-reset-timer-expired' : timeLeft < 60 ? 'pw-reset-timer-warn' : '';

  const resetState = () => {
    setStep('request');
    setOtpDigits(Array(OTP_LENGTH).fill(''));
    setExpiresAt(null);
    setTimeLeft(0);
    setResendCooldown(0);
    setResetToken(null);
    setLoading(false);
    form.resetFields();
  };

  const handleClose = () => { resetState(); onClose(); };

  const handleRequest = async () => {
    if (!email) { message.error(t('reset.email_required')); return; }
    setLoading(true);
    try {
      const res = await requestPasswordReset(email);
      if (res.success) {
        setStep('verify');
        if (res.expiresAt) setExpiresAt(res.expiresAt);
        setResendCooldown(RESEND_COOLDOWN_SEC);
      }
    } finally { setLoading(false); }
  };

  const handleVerify = async () => {
    const code = otpDigits.join('');
    if (code.length !== OTP_LENGTH) { message.error(t('reset.otp_required')); return; }
    setLoading(true);
    try {
      const res = await verifyPasswordReset(email, code);
      if (res.success && res.token) { setResetToken(res.token); setStep('reset'); }
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    try {
      const res = await requestPasswordReset(email);
      if (res.success) {
        setOtpDigits(Array(OTP_LENGTH).fill(''));
        if (res.expiresAt) setExpiresAt(res.expiresAt);
        setResendCooldown(RESEND_COOLDOWN_SEC);
        setTimeout(() => inputsRef.current[0]?.focus(), 0);
      }
    } finally { setLoading(false); }
  };

  const handleCompleteReset = async (values: any) => {
    if (!resetToken) { message.error(t('reset.session_invalid')); setStep('request'); return; }
    setLoading(true);
    try {
      const res = await completePasswordReset(email, resetToken, values.newPassword);
      if (res.success) handleClose();
    } finally { setLoading(false); }
  };

  const setDigit = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...otpDigits];
    next[index] = value;
    setOtpDigits(next);
    if (value && index < OTP_LENGTH - 1) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
      const next = [...otpDigits]; next[index - 1] = ''; setOtpDigits(next); e.preventDefault();
    }
    if (e.key === 'ArrowLeft' && index > 0) { inputsRef.current[index - 1]?.focus(); e.preventDefault(); }
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) { inputsRef.current[index + 1]?.focus(); e.preventDefault(); }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = [...otpDigits];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setOtpDigits(next);
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    setTimeout(() => inputsRef.current[focusIdx]?.focus(), 0);
  };

  const stepIndex = step === 'request' ? 0 : step === 'verify' ? 1 : 2;

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={520}
      destroyOnHidden
      className="pw-reset-modal"
      title={null}
    >
      <div className="pw-reset-top-bar" />
      <div className="pw-reset-body">
        {/* Header */}
        <div className="pw-reset-header">
          <div className="pw-reset-header-icon">
            <LockOutlined />
          </div>
          <h3>{t('reset.title')}</h3>
          <p>
            {step === 'request' && t('reset.intro_email')}
            {step === 'verify' && t('reset.intro_otp')}
            {step === 'reset' && t('reset.intro_new_password')}
          </p>
        </div>

        {/* Steps */}
        <Steps
          current={stepIndex}
          size="small"
          className="pw-reset-steps"
          items={[
            { title: t('reset.step_account') },
            { title: t('reset.step_verify') },
            { title: t('reset.step_new_password') },
          ]}
        />

        {/* Step 1: Request */}
        {step === 'request' && (
          <Form layout="vertical" form={form} onFinish={handleRequest} initialValues={{ email }} className="pw-reset-form">
            <Form.Item
              label={t('reset.email_label')}
              name="email"
              rules={[
                { required: true, message: t('reset.email_required') },
                { type: 'email', message: t('reset.email_invalid') },
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#94a3b8' }} />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('reset.email_placeholder')}
                size="large"
              />
            </Form.Item>
            <div className="pw-reset-actions">
              <Button onClick={handleClose} className="pw-reset-cancel-btn">{t('reset.btn_cancel')}</Button>
              <Button type="primary" htmlType="submit" loading={loading} className="pw-reset-primary-btn">
                {t('reset.btn_send_code')}
              </Button>
            </div>
          </Form>
        )}

        {/* Step 2: Verify OTP */}
        {step === 'verify' && (
          <div>
            <div className="pw-reset-sent-banner">
              <CheckCircleFilled />
              <p>{t('reset.otp_sent_prefix')}<strong>{email}</strong>{t('reset.otp_sent_suffix')}</p>
            </div>

            <div className="pw-reset-otp-row" onPaste={handlePaste}>
              {Array.from({ length: OTP_LENGTH }).map((_, idx) => (
                <input
                  key={idx}
                  ref={(el) => { inputsRef.current[idx] = el; }}
                  value={otpDigits[idx]}
                  onChange={(e) => setDigit(idx, e.target.value.replace(/\D/g, '').slice(0, 1))}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  inputMode="numeric"
                  maxLength={1}
                  placeholder="·"
                  className="pw-reset-otp-input"
                  aria-label={t('reset.otp_digit_aria', { index: idx + 1 })}
                />
              ))}
            </div>

            <div className="pw-reset-verify-footer">
              <span className={`pw-reset-timer ${timerClass}`}>
                <ClockCircleOutlined />
                {timeLeft > 0 ? t('reset.otp_expires_in', { minutes, seconds }) : t('reset.otp_expired')}
              </span>
              <div className="pw-reset-verify-actions">
                <Button type="link" onClick={handleResend} disabled={resendCooldown > 0 || loading} className="pw-reset-resend-btn">
                  {resendCooldown > 0 ? t('reset.otp_resend_in', { seconds: resendCooldown }) : t('reset.otp_resend')}
                </Button>
                <Button size="small" onClick={() => setStep('request')} className="pw-reset-diff-email-btn">
                  {t('reset.different_email')}
                </Button>
              </div>
            </div>

            <div className="pw-reset-actions">
              <Button onClick={handleClose} className="pw-reset-cancel-btn">{t('reset.btn_cancel')}</Button>
              <Button type="primary" onClick={handleVerify} loading={loading} className="pw-reset-primary-btn">
                {t('reset.btn_verify')}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: New Password */}
        {step === 'reset' && (
          <Form layout="vertical" form={form} onFinish={handleCompleteReset} className="pw-reset-form">
            <div className="pw-reset-new-pw-info">
              <CheckCircleFilled style={{ color: '#16a34a' }} />
              <p>{t('reset.verified_prefix')}<strong>{email}</strong>{t('reset.verified_suffix')}</p>
            </div>
            <Form.Item
              label={t('reset.new_password_label')}
              name="newPassword"
              rules={[
                { required: true, message: t('reset.new_password_required') },
                { min: 6, message: t('reset.new_password_min') },
              ]}
            >
              <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} size="large" placeholder={t('reset.new_password_placeholder')} />
            </Form.Item>
            <Form.Item
              label={t('reset.confirm_password_label')}
              name="confirmPassword"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: t('reset.confirm_password_required') },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                    return Promise.reject(new Error(t('reset.confirm_password_match')));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} size="large" placeholder={t('reset.confirm_password_placeholder')} />
            </Form.Item>
            <div className="pw-reset-actions">
              <Button onClick={handleClose} className="pw-reset-cancel-btn">{t('reset.btn_cancel')}</Button>
              <Button type="primary" htmlType="submit" loading={loading} className="pw-reset-primary-btn">
                {t('reset.btn_reset')}
              </Button>
            </div>
          </Form>
        )}
      </div>
    </Modal>
  );
};

export default PasswordResetModal;
