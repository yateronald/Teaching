import React, { useEffect, useState } from 'react';
import { 
  Card, 
  Typography, 
  Form, 
  InputNumber, 
  Switch, 
  Button, 
  Space, 
  message, 
  Row, 
  Col, 
  Divider,
  Tooltip,
  Alert
} from 'antd';
import { 
  SettingOutlined, 
  ClockCircleOutlined, 
  KeyOutlined, 
  PlayCircleOutlined, 
  StopOutlined, 
  SafetyOutlined,
  SaveOutlined,
  ReloadOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text } = Typography;

interface SettingRow {
  id: number;
  setting_key: string;
  setting_value: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

const AdminSettings: React.FC = () => {
  const { apiCall } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await apiCall('/admin/settings');
      const data: SettingRow[] = await res.json();
      if (!res.ok) {
        throw new Error((data as any)?.error || 'Failed to fetch settings');
      }
      const map: Record<string, string> = {};
      data.forEach(r => { map[r.setting_key] = String(r.setting_value); });
      setSettings(map);
    } catch (e: any) {
      message.error(e?.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (values: any) => {
    try {
      setLoading(true);
      const payload = {
        settingsObj: {
          code_length: values.code_length,
          code_expiry_minutes: values.code_expiry_minutes,
          early_start_minutes: values.early_start_minutes,
          late_join_minutes: values.late_join_minutes,
          auto_end_minutes: values.auto_end_minutes,
          require_code_for_attendance: values.require_code_for_attendance,
        }
      };
      const res = await apiCall('/admin/settings', { method: 'PUT', body: JSON.stringify(payload) });
      const data = await res.json();
      if (res.ok) {
        message.success('Settings updated');
        const map: Record<string, string> = {};
        (data.settings || []).forEach((r: SettingRow) => { map[r.setting_key] = String(r.setting_value); });
        setSettings(map);
      } else {
        message.error(data?.error || 'Failed to update settings');
      }
    } catch (e: any) {
      message.error(e?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Card loading={loading} style={{ marginBottom: '24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <SettingOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
          <Title level={2} style={{ marginBottom: '8px' }}>Admin Settings</Title>
          <Text type="secondary" style={{ fontSize: '16px' }}>
            Configure attendance system parameters and security settings
          </Text>
        </div>

        <Alert
          message="Important Notice"
          description="Changes to these settings will affect all future attendance sessions. Current active sessions will not be affected."
          type="info"
          icon={<InfoCircleOutlined />}
          style={{ marginBottom: '32px' }}
          showIcon
        />

        <Form
          layout="vertical"
          initialValues={{
            code_length: Number(settings.code_length || 6),
            code_expiry_minutes: Number(settings.code_expiry_minutes || 30),
            early_start_minutes: Number(settings.early_start_minutes || 15),
            late_join_minutes: Number(settings.late_join_minutes || 10),
            auto_end_minutes: Number(settings.auto_end_minutes || 15),
            require_code_for_attendance: (settings.require_code_for_attendance || 'true') === 'true',
          }}
          onFinish={onSubmit}
        >
          {/* Access Code Configuration */}
          <Card 
            title={
              <Space>
                <KeyOutlined style={{ color: '#52c41a' }} />
                <span>Access Code Configuration</span>
              </Space>
            }
            style={{ marginBottom: '24px' }}
            size="small"
          >
            <Row gutter={[24, 16]}>
              <Col xs={24} md={12}>
                <Form.Item 
                  label={
                    <Space>
                      <span>Access Code Length</span>
                      <Tooltip title="Number of digits in the attendance access code (4-12 digits)">
                        <InfoCircleOutlined style={{ color: '#1890ff' }} />
                      </Tooltip>
                    </Space>
                  }
                  name="code_length" 
                  rules={[{ required: true, message: 'Please enter code length' }]}
                > 
                  <InputNumber 
                    min={4} 
                    max={12} 
                    style={{ width: '100%' }}
                    placeholder="e.g., 6"
                    addonAfter="digits"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item 
                  label={
                    <Space>
                      <span>Code Expiry Time</span>
                      <Tooltip title="How long the access code remains valid after generation">
                        <InfoCircleOutlined style={{ color: '#1890ff' }} />
                      </Tooltip>
                    </Space>
                  }
                  name="code_expiry_minutes" 
                  rules={[{ required: true }]}
                > 
                  <InputNumber 
                    min={1} 
                    max={120} 
                    style={{ width: '100%' }}
                    placeholder="e.g., 30"
                    addonAfter="minutes"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Session Timing Configuration */}
          <Card 
            title={
              <Space>
                <ClockCircleOutlined style={{ color: '#fa8c16' }} />
                <span>Session Timing Configuration</span>
              </Space>
            }
            style={{ marginBottom: '24px' }}
            size="small"
          >
            <Row gutter={[24, 16]}>
              <Col xs={24} md={8}>
                <Form.Item 
                  label={
                    <Space>
                      <PlayCircleOutlined style={{ color: '#52c41a' }} />
                      <span>Early Start Window</span>
                      <Tooltip title="How many minutes before scheduled time teachers can start the session">
                        <InfoCircleOutlined style={{ color: '#1890ff' }} />
                      </Tooltip>
                    </Space>
                  }
                  name="early_start_minutes" 
                  rules={[{ required: true }]}
                > 
                  <InputNumber 
                    min={0} 
                    max={60} 
                    style={{ width: '100%' }}
                    placeholder="e.g., 15"
                    addonAfter="minutes"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item 
                  label={
                    <Space>
                      <ClockCircleOutlined style={{ color: '#faad14' }} />
                      <span>Late Join Window</span>
                      <Tooltip title="How many minutes after session start students can still join">
                        <InfoCircleOutlined style={{ color: '#1890ff' }} />
                      </Tooltip>
                    </Space>
                  }
                  name="late_join_minutes" 
                  rules={[{ required: true }]}
                > 
                  <InputNumber 
                    min={0} 
                    max={60} 
                    style={{ width: '100%' }}
                    placeholder="e.g., 10"
                    addonAfter="minutes"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item 
                  label={
                    <Space>
                      <StopOutlined style={{ color: '#ff4d4f' }} />
                      <span>Auto End Timer</span>
                      <Tooltip title="How many minutes after scheduled end time to automatically close the session">
                        <InfoCircleOutlined style={{ color: '#1890ff' }} />
                      </Tooltip>
                    </Space>
                  }
                  name="auto_end_minutes" 
                  rules={[{ required: true }]}
                > 
                  <InputNumber 
                    min={0} 
                    max={180} 
                    style={{ width: '100%' }}
                    placeholder="e.g., 15"
                    addonAfter="minutes"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Security Settings */}
          <Card 
            title={
              <Space>
                <SafetyOutlined style={{ color: '#722ed1' }} />
                <span>Security Settings</span>
              </Space>
            }
            style={{ marginBottom: '32px' }}
            size="small"
          >
            <Form.Item 
              label={
                <Space>
                  <span>Require Access Code for Attendance</span>
                  <Tooltip title="When enabled, students must enter the correct access code to mark attendance">
                    <InfoCircleOutlined style={{ color: '#1890ff' }} />
                  </Tooltip>
                </Space>
              }
              name="require_code_for_attendance" 
              valuePropName="checked"
            > 
              <Switch 
                checkedChildren="Required" 
                unCheckedChildren="Optional"
                style={{ marginLeft: '8px' }}
              />
            </Form.Item>
            <Text type="secondary" style={{ fontSize: '14px' }}>
              When disabled, students can mark attendance without entering an access code
            </Text>
          </Card>

          <Divider />

          {/* Action Buttons */}
          <div style={{ textAlign: 'center' }}>
            <Space size="large">
              <Button 
                type="primary" 
                htmlType="submit" 
                size="large"
                icon={<SaveOutlined />}
                loading={loading}
              >
                Save Changes
              </Button>
              <Button 
                onClick={fetchSettings} 
                size="large"
                icon={<ReloadOutlined />}
              >
                Refresh Settings
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default AdminSettings;