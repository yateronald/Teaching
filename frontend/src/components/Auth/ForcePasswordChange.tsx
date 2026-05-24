import React, { useEffect, useState } from 'react';
import { Form, Input, Button } from 'antd';
import { LockOutlined, SafetyCertificateOutlined, CheckCircleFilled } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { ASSET_PATHS } from '../../utils/assets';
import './ForcePasswordChange.css';

const ForcePasswordChange: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const { changePassword, user, isAuthenticated, loading } = useAuth();
  const { t } = useTranslation();
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
            <h1 className="fpc-left-title">{t('forceChange.left_title_1')}<br />{t('forceChange.left_title_2')}</h1>
            <p className="fpc-left-desc">
              {t('forceChange.left_desc')}
            </p>
            <div className="fpc-left-tips">
              <div className="fpc-tip">
                <CheckCircleFilled className="fpc-tip-icon" />
                <span>{t('forceChange.tip_1')}</span>
              </div>
              <div className="fpc-tip">
                <CheckCircleFilled className="fpc-tip-icon" />
                <span>{t('forceChange.tip_2')}</span>
              </div>
              <div className="fpc-tip">
                <CheckCircleFilled className="fpc-tip-icon" />
                <span>{t('forceChange.tip_3')}</span>
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
              <h2>{t('forceChange.title')}</h2>
              <p>{t('forceChange.subtitle')}</p>
            </div>

            <Form form={form} layout="vertical" onFinish={onFinish} className="fpc-form">
              <Form.Item
                name="currentPassword"
                label={t('forceChange.current_password_label')}
                rules={[
                  { required: true, message: t('forceChange.current_password_required') },
                  { min: 6, message: t('forceChange.current_password_min') },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="fpc-input-icon" />}
                  placeholder={t('forceChange.current_password_placeholder')}
                  className="fpc-input"
                />
              </Form.Item>

              <Form.Item
                name="newPassword"
                label={t('forceChange.new_password_label')}
                rules={[
                  { required: true, message: t('forceChange.new_password_required') },
                  { min: 6, message: t('forceChange.new_password_min') },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="fpc-input-icon" />}
                  placeholder={t('forceChange.new_password_placeholder')}
                  className="fpc-input"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label={t('forceChange.confirm_password_label')}
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: t('forceChange.confirm_password_required') },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                      return Promise.reject(new Error(t('forceChange.confirm_password_match')));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="fpc-input-icon" />}
                  placeholder={t('forceChange.confirm_password_placeholder')}
                  className="fpc-input"
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button type="primary" htmlType="submit" loading={submitting} block className="fpc-submit-btn">
                  {t('forceChange.btn_submit')}
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
