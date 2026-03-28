import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Spin } from 'antd';
import { UserOutlined, LockOutlined, CheckCircleFilled, GlobalOutlined, TrophyOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { ASSET_PATHS } from '../../utils/assets';
import { brandingUtils } from '../../utils/branding';
import PasswordResetModal from './PasswordResetModal';
import AccountDisabledModal from './AccountDisabledModal';
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
      message.error('Login failed. Please try again.');
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
      <div className="login-page">
        <div className="login-container">
          {/* LEFT — Branding panel */}
          <div className="login-left">
            <div className="login-left-bg" />
            <div className="login-left-content">
              <img src={ASSET_PATHS.LOGOS.MAIN} alt="Logo" className="login-left-logo" />
              <h1 className="login-left-title">Learn French<br />with Natives</h1>
              <p className="login-left-desc">
                Master French with certified native speakers. Prepare for TEF, DELF, DALF, TCF & TEFAQ exams.
              </p>
              <div className="login-left-features">
                <div className="login-left-feat">
                  <CheckCircleFilled className="login-feat-icon" />
                  <span>98% exam pass rate</span>
                </div>
                <div className="login-left-feat">
                  <GlobalOutlined className="login-feat-icon" />
                  <span>15+ native French teachers</span>
                </div>
                <div className="login-left-feat">
                  <TrophyOutlined className="login-feat-icon" />
                  <span>1,000+ students trained</span>
                </div>
                <div className="login-left-feat">
                  <ClockCircleOutlined className="login-feat-icon" />
                  <span>Flexible scheduling</span>
                </div>
              </div>
              <div className="login-left-exams">
                {['TEF Canada', 'DELF', 'DALF', 'TCF', 'TEFAQ'].map((e) => (
                  <span key={e} className="login-exam-chip">{e}</span>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — Form */}
          <div className="login-right">
            <div className="login-right-inner">
              <div className="login-form-header">
                <h2>Welcome back</h2>
                <p>Sign in to your account to continue learning</p>
              </div>

              <Form form={form} name="login" onFinish={onFinish} layout="vertical" size="large" className="login-form">
                <Form.Item
                  name="email"
                  label="Email address"
                  rules={[
                    { required: true, message: 'Please enter your email' },
                    { type: 'email', message: 'Please enter a valid email' },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined className="login-input-icon" />}
                    placeholder="you@example.com"
                    className="login-input"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label="Password"
                  rules={[
                    { required: true, message: 'Please enter your password' },
                    { min: 6, message: 'Password must be at least 6 characters' },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="login-input-icon" />}
                    placeholder="Enter your password"
                    className="login-input"
                  />
                </Form.Item>

                <div className="login-forgot-row">
                  <Button type="link" onClick={() => setResetOpen(true)} className="login-forgot-link">
                    Forgot password?
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
                    Sign In
                  </Button>
                </Form.Item>
              </Form>

              <div className="login-footer-text">
                <p>Protected by Learn French with Natives</p>
              </div>
            </div>
          </div>
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
