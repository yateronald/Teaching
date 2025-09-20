import React, { useEffect, useState } from 'react';
import { Card, Typography, Form, Input, Button, Space, Alert } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Paragraph } = Typography;

const ForcePasswordChange: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const { changePassword, user, isAuthenticated, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  // Extra hardening: redirect if not authenticated or not required
  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      navigate('/login', { replace: true, state: { from: location } });
      return;
    }
    const force = (user as any)?.force_password_change;
    if (!force) {
      const role = user?.role;
      const dashboardPath = role === 'admin' ? '/dashboard' : role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard';
      navigate(dashboardPath, { replace: true });
    }
  }, [loading, isAuthenticated, user, navigate, location]);

  const onFinish = async (values: any) => {
    setSubmitting(true);
    const { currentPassword, newPassword } = values;
    const result = await changePassword(currentPassword, newPassword);
    setSubmitting(false);
    if (result.success) {
      // After successful change, route user to their dashboard
      const role = user?.role;
      const dashboardPath = role === 'admin' ? '/dashboard' : role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard';
      const from = (location.state as any)?.from?.pathname;
      navigate(from || dashboardPath, { replace: true });
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '24px' }}>
      <Card style={{ width: 500, maxWidth: '100%' }}>
        <Space size={12} direction="vertical" style={{ width: '100%' }}>
          <Space>
            <LockOutlined style={{ color: '#1677ff' }} />
            <Title level={3} style={{ margin: 0 }}>Update Your Password</Title>
          </Space>
          <Alert
            type="warning"
            showIcon
            message="Password update required"
            description="For security reasons, you must change your password before continuing."
          />
          <Paragraph style={{ marginTop: 8, color: '#595959' }}>
            Please enter your current password and choose a new one with at least 6 characters.
          </Paragraph>

          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="currentPassword"
              label="Current Password"
              rules={[{ required: true, message: 'Please enter your current password' }, { min: 6, message: 'Password must be at least 6 characters' }]}
            >
              <Input.Password placeholder="Enter current password" size="large" />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="New Password"
              rules={[{ required: true, message: 'Please enter a new password' }, { min: 6, message: 'Password must be at least 6 characters' }]}
            >
              <Input.Password placeholder="Enter new password" size="large" />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm New Password"
              dependencies={["newPassword"]}
              rules={[
                { required: true, message: 'Please confirm your new password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('The two passwords do not match'));
                  }
                })
              ]}
            >
              <Input.Password placeholder="Confirm new password" size="large" />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  Change Password
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </div>
  );
};

export default ForcePasswordChange;
