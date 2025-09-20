import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Form, Input, Button, Typography, Space, message } from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import type { InputRef } from 'antd';

const { Text } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentEmail: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ChangeEmailModal: React.FC<Props> = ({ open, onClose, onSuccess, currentEmail }) => {
  const { requestEmailChange, verifyEmailChange, resendEmailChange } = useAuth();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [loading, setLoading] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const inputsRef = useRef<Array<InputRef | null>>([null, null, null, null, null, null]);
  const [emailError, setEmailError] = useState<string | null>(null);
  const expiredHandledRef = useRef(false);

   useEffect(() => {
     if (!open) {
       resetAll();
     }
   }, [open]);

   const [currentTime, setCurrentTime] = useState(Date.now());

   const remainingMs = useMemo(() => {
     if (!expiresAt) return 0;
     const ms = new Date(expiresAt).getTime() - currentTime;
     return Math.max(0, ms);
   }, [expiresAt, currentTime]);

   useEffect(() => {
     if (!expiresAt) return;
     const t = setInterval(() => {
       setCurrentTime(Date.now());
     }, 1000);
     return () => clearInterval(t);
   }, [expiresAt]);

   // Auto-close the modal when code expires and notify the user
   useEffect(() => {
     if (step === 'code' && expiresAt && remainingMs === 0 && !expiredHandledRef.current) {
       expiredHandledRef.current = true;
       message.warning('Verification code expired. Please start again.');
       onClose();
       resetAll();
     }
   }, [remainingMs, step, expiresAt]);

   function resetAll() {
     setStep('email');
     setLoading(false);
     setNewEmail('');
     setExpiresAt(null);
     setAttemptsLeft(null);
     setCode(['', '', '', '', '', '']);
     setCurrentTime(Date.now());
     setEmailError(null);
     expiredHandledRef.current = false;
   }

   const handleRequest = async () => {
     setEmailError(null);
     if (!EMAIL_REGEX.test(newEmail)) {
       setEmailError('Please enter a valid email');
       message.error('Please enter a valid email');
       return;
     }
     if (newEmail === currentEmail) {
       setEmailError('New email must be different from current email');
       message.warning('New email must be different from current email');
       return;
     }

     setLoading(true);
     const res = await requestEmailChange(newEmail);
     setLoading(false);
     if (res.success) {
       setExpiresAt(res.expiresAt || null);
       setAttemptsLeft(res.attemptsLeft ?? 3);
       setStep('code');
       setTimeout(() => inputsRef.current[0]?.focus(), 50);
       message.success('Verification code sent to your new email');
     } else {
       if (res.status === 409) {
         message.error('This email is already associated with another account. Please use a different email.');
       } else {
         message.error(res.error || 'Failed to start email change');
       }
     }
   };

  const codeString = useMemo(() => code.join(''), [code]);

  const handleVerify = async () => {
    if (codeString.length !== 6) {
      message.error('Please enter the 6-digit code');
      return;
    }
    setLoading(true);
    const res = await verifyEmailChange(codeString);
    setLoading(false);
    if (res.success) {
      message.success('Email changed successfully');
      onSuccess();
      onClose();
      resetAll();
    } else {
      if (typeof res.attemptsLeft === 'number') setAttemptsLeft(res.attemptsLeft);
      message.error(res.error || 'Invalid code');
    }
  };

  const canResend = useMemo(() => {
    return remainingMs === 0 || (attemptsLeft !== null && attemptsLeft <= 0);
  }, [remainingMs, attemptsLeft]);

  const handleResend = async () => {
    setLoading(true);
    const res = await resendEmailChange();
    setLoading(false);
    if (res.success) {
      setExpiresAt(res.expiresAt || null);
      setAttemptsLeft(res.attemptsLeft ?? 3);
      setCode(['', '', '', '', '', '']);
      setTimeout(() => inputsRef.current[0]?.focus(), 50);
      message.success('A new code has been sent');
    } else {
      message.error(res.error || 'Resend not allowed yet');
    }
  };

  const onChangeDigit = (index: number, val: string) => {
    const digit = (val || '').replace(/\D/g, '').slice(0, 1);
    const next = [...code];
    next[index] = digit;
    setCode(next);
    if (digit && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const onKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) inputsRef.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6);
    if (pasted.length) {
      const arr = pasted.split('').concat(Array(6).fill('')).slice(0, 6) as string[];
      setCode(arr);
      setTimeout(() => inputsRef.current[Math.min(5, pasted.length)]?.focus(), 0);
      e.preventDefault();
    }
  };

  const mm = Math.floor(remainingMs / 60000);
  const ss = Math.floor((remainingMs % 60000) / 1000);
  const timeLeft = `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;

  return (
    <Modal
      title="Change Email"
      open={open}
      onCancel={() => { onClose(); resetAll(); }}
      footer={null}
      destroyOnClose
    >
      {step === 'email' ? (
        <>
          <Text>Current email</Text>
          <div style={{ marginBottom: 8 }}><Text strong>{currentEmail}</Text></div>
          <Form layout="vertical" onFinish={handleRequest}>
            <Form.Item label="New email" required validateStatus={emailError ? 'error' : undefined} help={emailError || undefined}>
              <Input
                placeholder="Enter your new email"
                value={newEmail}
                onChange={e => { setNewEmail(e.target.value); if (emailError) setEmailError(null); }}
                type="email"
              />
            </Form.Item>
            <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={() => { onClose(); resetAll(); }}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={loading}>Send Code</Button>
            </Space>
          </Form>
        </>
      ) : (
        <>
          <div style={{ marginBottom: 12 }}>
            <Text>We sent a 6-digit code to</Text>
            <div><Text strong>{newEmail}</Text></div>
          </div>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ display: 'inline-flex', gap: 8 }}>
              {code.map((c, i) => (
                <Input
                  key={i}
                  style={{ width: 42, height: 48, textAlign: 'center', fontSize: 20 }}
                  maxLength={1}
                  value={c}
                  onChange={e => onChangeDigit(i, e.target.value)}
                  onKeyDown={e => onKeyDown(i, e)}
                  onPaste={onPaste}
                  ref={el => { inputsRef.current[i] = el; }}
                />
              ))}
            </div>
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">Expires in {timeLeft}. Attempts left: {attemptsLeft ?? '-'}</Text>
            </div>
          </div>
          <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={() => setStep('email')} disabled={loading}>Back</Button>
            <div>
              <Button onClick={handleResend} disabled={!canResend || loading} style={{ marginRight: 8 }}>Resend</Button>
              <Button type="primary" onClick={handleVerify} loading={loading}>Verify</Button>
            </div>
          </Space>
        </>
      )}
    </Modal>
  );
};

export default ChangeEmailModal;