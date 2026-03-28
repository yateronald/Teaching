import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Form, Input, Button, Steps, message } from 'antd';
import {
  LockOutlined,
  MailOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
} from '@ant-design/icons';
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
    if (!email) { message.error('Please enter your email'); return; }
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
    if (code.length !== OTP_LENGTH) { message.error('Please enter the 6-digit code'); return; }
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
    if (!resetToken) { message.error('Reset session is invalid. Please start again.'); setStep('request'); return; }
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
          <h3>Reset Password</h3>
          <p>
            {step === 'request' && 'Enter your email to receive a secure verification code.'}
            {step === 'verify' && 'Enter the 6-digit code sent to your email.'}
            {step === 'reset' && 'Choose a strong new password for your account.'}
          </p>
        </div>

        {/* Steps */}
        <Steps
          current={stepIndex}
          size="small"
          className="pw-reset-steps"
          items={[
            { title: 'Account' },
            { title: 'Verify' },
            { title: 'New Password' },
          ]}
        />

        {/* Step 1: Request */}
        {step === 'request' && (
          <Form layout="vertical" form={form} onFinish={handleRequest} initialValues={{ email }} className="pw-reset-form">
            <Form.Item
              label="Email address"
              name="email"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Enter a valid email address' },
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#94a3b8' }} />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                size="large"
              />
            </Form.Item>
            <div className="pw-reset-actions">
              <Button onClick={handleClose} className="pw-reset-cancel-btn">Cancel</Button>
              <Button type="primary" htmlType="submit" loading={loading} className="pw-reset-primary-btn">
                Send Code
              </Button>
            </div>
          </Form>
        )}

        {/* Step 2: Verify OTP */}
        {step === 'verify' && (
          <div>
            <div className="pw-reset-sent-banner">
              <CheckCircleFilled />
              <p>Code sent to <strong>{email}</strong>. Check your inbox and spam folder.</p>
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
                  aria-label={`Digit ${idx + 1}`}
                />
              ))}
            </div>

            <div className="pw-reset-verify-footer">
              <span className={`pw-reset-timer ${timerClass}`}>
                <ClockCircleOutlined />
                {timeLeft > 0 ? `Expires in ${minutes}:${seconds}` : 'Code expired'}
              </span>
              <div className="pw-reset-verify-actions">
                <Button type="link" onClick={handleResend} disabled={resendCooldown > 0 || loading} className="pw-reset-resend-btn">
                  Resend{resendCooldown > 0 ? ` (${resendCooldown}s)` : ''}
                </Button>
                <Button size="small" onClick={() => setStep('request')} className="pw-reset-diff-email-btn">
                  Different email
                </Button>
              </div>
            </div>

            <div className="pw-reset-actions">
              <Button onClick={handleClose} className="pw-reset-cancel-btn">Cancel</Button>
              <Button type="primary" onClick={handleVerify} loading={loading} className="pw-reset-primary-btn">
                Verify Code
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: New Password */}
        {step === 'reset' && (
          <Form layout="vertical" form={form} onFinish={handleCompleteReset} className="pw-reset-form">
            <div className="pw-reset-new-pw-info">
              <CheckCircleFilled style={{ color: '#22c55e' }} />
              <p>Email verified for <strong>{email}</strong>. Set your new password below.</p>
            </div>
            <Form.Item
              label="New Password"
              name="newPassword"
              rules={[
                { required: true, message: 'Please enter a new password' },
                { min: 6, message: 'Must be at least 6 characters' },
              ]}
            >
              <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} size="large" placeholder="Enter new password" />
            </Form.Item>
            <Form.Item
              label="Confirm Password"
              name="confirmPassword"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'Please confirm your password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                    return Promise.reject(new Error('Passwords do not match'));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} size="large" placeholder="Confirm new password" />
            </Form.Item>
            <div className="pw-reset-actions">
              <Button onClick={handleClose} className="pw-reset-cancel-btn">Cancel</Button>
              <Button type="primary" htmlType="submit" loading={loading} className="pw-reset-primary-btn">
                Reset Password
              </Button>
            </div>
          </Form>
        )}
      </div>
    </Modal>
  );
};

export default PasswordResetModal;
