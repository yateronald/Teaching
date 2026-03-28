import React, { useEffect, useState } from 'react';
import { Form, Input, Button } from 'antd';
import { LockOutlined, SafetyCertificateOutlined, CheckCircleFilled } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ASSET_PATHS } from '../../utils/assets';
import './ForcePasswordChange.css';

const ForcePasswordChange: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const { changePassword, user, isAuthenticated, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      navigate('/login', { replace: true, state: { from: location } });
      return;
    }
    const force = (user as any)?.force_password_change;
    if (!force) {
      const role = user?.role;
      const dash = role === 'admin' ? '/dashboard' : role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard';
      navigate(dash, { replace: true });
    }
  }, [loading, isAuthenticated, user, navigate, location]);

  const onFinish = async (values: any) => {
    setSubmitting(true);
    const result = await changePassword(values.currentPassword, values.newPassword);
    setSubmitting(false);
    if (result.success) {
      const role = user?.role;
      const dash = role === 'admin' ? '/dashboard' : role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard';
      const from = (location.state as any)?.from?.pathname;
      navigate(from || dash, { replace: true });
    }
  };

  return (
    <div className="fpc-page">
      <div className="fpc-container">
        {/* Left panel */}
        <div className="fpc-left">
          <div className="fpc-left-bg" />
          <div className="fpc-left-content">
            <img src={ASSET_PATHS.LOGOS.MAIN} alt="Logo" className="fpc-logo" />
            <h1 className="fpc-left-title">Secure Your<br />Account</h1>
            <p className="fpc-left-desc">
              A strong password keeps your account safe. Update it now to continue using the platform.
            </p>
            <div className="fpc-left-tips">
              <div className="fpc-tip">
                <CheckCircleFilled className="fpc-tip-icon" />
                <span>At least 6 characters long</span>
              </div>
              <div className="fpc-tip">
                <CheckCircleFilled className="fpc-tip-icon" />
                <span>Mix letters, numbers & symbols</span>
              </div>
              <div className="fpc-tip">
                <CheckCircleFilled className="fpc-tip-icon" />
                <span>Don't reuse old passwords</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="fpc-right">
          <div className="fpc-right-inner">
            <div className="fpc-form-header">
              <div className="fpc-header-icon">
                <SafetyCertificateOutlined />
              </div>
              <h2>Update Your Password</h2>
              <p>For security reasons, please set a new password before continuing.</p>
            </div>

            <Form form={form} layout="vertical" onFinish={onFinish} className="fpc-form">
              <Form.Item
                name="currentPassword"
                label="Current Password"
                rules={[
                  { required: true, message: 'Please enter your current password' },
                  { min: 6, message: 'Must be at least 6 characters' },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="fpc-input-icon" />}
                  placeholder="Enter current password"
                  className="fpc-input"
                />
              </Form.Item>

              <Form.Item
                name="newPassword"
                label="New Password"
                rules={[
                  { required: true, message: 'Please enter a new password' },
                  { min: 6, message: 'Must be at least 6 characters' },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="fpc-input-icon" />}
                  placeholder="Enter new password"
                  className="fpc-input"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Confirm New Password"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Please confirm your new password' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                      return Promise.reject(new Error('Passwords do not match'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="fpc-input-icon" />}
                  placeholder="Confirm new password"
                  className="fpc-input"
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button type="primary" htmlType="submit" loading={submitting} block className="fpc-submit-btn">
                  Update Password
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForcePasswordChange;
