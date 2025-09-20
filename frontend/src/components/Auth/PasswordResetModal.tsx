import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Form, Input, Button, Typography, Space, Steps, message } from 'antd';
import { useAuth } from '../../contexts/AuthContext';

const { Text, Title } = Typography;

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

  // Keep email in sync if parent changes
  useEffect(() => {
    setEmail(initialEmail || '');
  }, [initialEmail]);

  // Countdown for OTP expiry
  useEffect(() => {
    if (!expiresAt || step !== 'verify') return;
    const interval = setInterval(() => {
      const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setTimeLeft(diff);
      if (diff <= 0) {
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, step]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const minutes = useMemo(() => Math.floor(timeLeft / 60), [timeLeft]);
  const seconds = useMemo(() => (timeLeft % 60).toString().padStart(2, '0'), [timeLeft]);

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

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleRequest = async () => {
    if (!email) {
      message.error('Please enter your email');
      return;
    }
    setLoading(true);
    try {
      const res = await requestPasswordReset(email);
      if (res.success) {
        setStep('verify');
        if (res.expiresAt) setExpiresAt(res.expiresAt);
        setResendCooldown(RESEND_COOLDOWN_SEC);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    const code = otpDigits.join('');
    if (code.length !== OTP_LENGTH) {
      message.error('Please enter the 6-digit code');
      return;
    }
    setLoading(true);
    try {
      const res = await verifyPasswordReset(email, code);
      if (res.success && res.token) {
        setResetToken(res.token);
        setStep('reset');
      }
    } finally {
      setLoading(false);
    }
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
        // focus first box
        setTimeout(() => inputsRef.current[0]?.focus(), 0);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteReset = async (values: any) => {
    if (!resetToken) {
      message.error('Reset session is invalid. Please start again.');
      setStep('request');
      return;
    }
    setLoading(true);
    try {
      const res = await completePasswordReset(email, resetToken, values.newPassword);
      if (res.success) {
        handleClose();
      }
    } finally {
      setLoading(false);
    }
  };

  const setDigit = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...otpDigits];
    next[index] = value;
    setOtpDigits(next);
    if (value && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
      const next = [...otpDigits];
      next[index - 1] = '';
      setOtpDigits(next);
      e.preventDefault();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
      e.preventDefault();
    }
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
      e.preventDefault();
    }
  };

  const otpBoxes = (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 8, marginBottom: 8 }}>
      {Array.from({ length: OTP_LENGTH }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => { inputsRef.current[idx] = el; }}
          value={otpDigits[idx]}
          onChange={(e) => setDigit(idx, e.target.value.replace(/\D/g, '').slice(0, 1))}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          inputMode="numeric"
          maxLength={1}
          style={{
            width: 44,
            height: 52,
            textAlign: 'center' as const,
            fontSize: 22,
            border: '1px solid #d9d9d9',
            borderRadius: 8,
            outline: 'none',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
          }}
        />
      ))}
    </div>
  );

  const header = (
    <div style={{ marginBottom: 8 }}>
      <Title level={4} style={{ margin: 0 }}>Reset Password</Title>
      <Text type="secondary">Secure 6-digit code via email. Expires in 10 minutes.</Text>
    </div>
  );

  return (
    <Modal
      title={header}
      open={open}
      onCancel={handleClose}
      footer={null}
      width={560}
      destroyOnClose
      styles={{ body: { paddingTop: 8 } as any }}
    >
      <div style={{ marginBottom: 16 }}>
        <Steps
          current={step === 'request' ? 0 : step === 'verify' ? 1 : 2}
          items={[
            { title: 'Account' },
            { title: 'Verify Code' },
            { title: 'New Password' }
          ]}
          size="small"
        />
      </div>

      {step === 'request' && (
        <Form
          layout="vertical"
          form={form}
          onFinish={handleRequest}
          initialValues={{ email }}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Please enter your email' }, { type: 'email' }]}
          >
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your account email"
              size="large"
            />
          </Form.Item>

          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Send Code
            </Button>
          </Space>
        </Form>
      )}

      {step === 'verify' && (
        <div>
          <div style={{
            background: '#F6FFED',
            border: '1px solid #B7EB8F',
            borderRadius: 8,
            padding: 12,
            marginBottom: 16
          }}>
            <Text>If the email you entered is registered, a 6-digit code has been sent to <strong>{email}</strong>. Enter it below.</Text>
          </div>
          {otpBoxes}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <Text type="secondary">Expires in {minutes}:{seconds}</Text>
            <Space>
              <Button type="link" onClick={handleResend} disabled={resendCooldown > 0 || loading}>
                Resend code {resendCooldown > 0 ? `(${resendCooldown}s)` : ''}
              </Button>
              <Button onClick={() => setStep('request')}>Use different email</Button>
              <Button type="primary" onClick={handleVerify} loading={loading}>
                Verify
              </Button>
            </Space>
          </div>
        </div>
      )}

      {step === 'reset' && (
        <Form layout="vertical" form={form} onFinish={handleCompleteReset}>
          <div style={{ marginBottom: 8 }}>
            <Text type="secondary">Set a new password for <strong>{email}</strong>.</Text>
          </div>
          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[{ required: true, message: 'Please enter new password' }, { min: 6 }]}
          >
            <Input.Password size="large" placeholder="Enter new password" />
          </Form.Item>
          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: 'Please confirm new password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password size="large" placeholder="Confirm new password" />
          </Form.Item>

          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>Reset Password</Button>
          </Space>
        </Form>
      )}
    </Modal>
  );
};

export default PasswordResetModal;