import React, { useEffect, useState } from 'react';
import { 
   
  Typography, 
  Form, 
  InputNumber, 
  Switch, 
  Button, 
  Space, 
  message, 
  Row, 
  Col, 
  
  Tooltip,
  Alert,
  Skeleton
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

const { Text } = Typography;

interface SettingRow {
  id: number;
  setting_key: string;
  setting_value: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

const AdminSettings: React.FC = () => {
  const [form] = Form.useForm();
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

  if (loading && Object.keys(settings).length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 90px)', padding: '24px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
              <Skeleton.Input active style={{ width: 220, height: 26, borderRadius: 8 }} />
              <div style={{ marginTop: 8 }}>
                  <Skeleton.Input active style={{ width: 360, height: 14, borderRadius: 6 }} />
              </div>
          </div>
        </div>
        <Skeleton.Input active style={{ width: '100%', height: 60, borderRadius: 12, marginBottom: 24 }} block />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ padding: 24, borderRadius: 16, border: '1px solid #f0f0f8', background: '#fff' }}>
              <Skeleton.Input active style={{ width: 180, height: 20, borderRadius: 6, marginBottom: 24 }} />
              <Row gutter={24}>
                <Col span={12}><Skeleton.Input active style={{ width: '100%', height: 40, borderRadius: 8 }} block /></Col>
                <Col span={12}><Skeleton.Input active style={{ width: '100%', height: 40, borderRadius: 8 }} block /></Col>
              </Row>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 90px)' }}>
      {/* Fixed Header */}
      <div style={{ flexShrink: 0, marginBottom: 24, padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', letterSpacing: -0.3, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #1890ff, #36cfc9)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: '0 4px 12px rgba(24,144,255,0.3)' }}>
                    <SettingOutlined />
                </div>
                Platform Settings
            </div>
            <Typography.Text style={{ fontSize: 13, color: '#94a3b8', marginTop: 8, display: 'block' }}>
              Configure attendance system parameters, security policies, and application behaviors
            </Typography.Text>
          </div>
          <Space>
            <Button 
              size="middle"
              icon={<ReloadOutlined />}
              onClick={fetchSettings}
              style={{ borderRadius: 10, fontWeight: 600, height: 40 }}
            >
              Reload
            </Button>
            <Button 
              type="primary"
              size="middle"
              onClick={() => document.getElementById('settings-form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))}
              icon={<SaveOutlined />}
              loading={loading}
              style={{ borderRadius: 10, fontWeight: 600, height: 40, background: '#6366f1', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}
            >
              Save Configuration
            </Button>
          </Space>
        </div>
      </div>

      {/* Scrollable Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '0 24px 40px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <Alert
          message="Important Notice"
          description="Changes to these settings will affect all future attendance sessions. Current active sessions will naturally continue using the previous policies until restarted."
          type="info"
          icon={<InfoCircleOutlined style={{ fontSize: 20 }} />}
          style={{ marginBottom: '24px', borderRadius: 14, border: '1px solid #bae0ff', background: '#e6f7ff' }}
          showIcon
        />

        <Form
          form={form}
          id="settings-form"
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
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #f0f0f8', boxShadow: '0 2px 12px rgba(99,102,241,0.04)', marginBottom: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f6ffed', color: '#52c41a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                 <KeyOutlined />
              </div>
              Access Code Configuration
            </div>
            <Row gutter={[24, 16]}>
              <Col xs={24} md={12}>
                <Form.Item 
                  label={
                    <Space>
                      <span style={{ fontWeight: 700, color: '#334155', fontSize: 14 }}>Access Code Length</span>
                      <Tooltip title="Number of digits in the attendance access code (4-12 digits)">
                        <InfoCircleOutlined style={{ color: '#6366f1' }} />
                      </Tooltip>
                    </Space>
                  }
                  name="code_length" 
                  rules={[{ required: true, message: 'Please enter code length' }]}
                > 
                  <InputNumber 
                    min={4} 
                    max={12} 
                    size="large"
                    style={{ width: '100%', borderRadius: 12 }}
                    placeholder="e.g., 6"
                    addonAfter={<span style={{ fontWeight: 600, color: '#64748b' }}>digits</span>}
                    className="premium-input"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item 
                  label={
                    <Space>
                      <span style={{ fontWeight: 700, color: '#334155', fontSize: 14 }}>Code Expiry Time</span>
                      <Tooltip title="How long the access code remains valid after generation">
                        <InfoCircleOutlined style={{ color: '#6366f1' }} />
                      </Tooltip>
                    </Space>
                  }
                  name="code_expiry_minutes" 
                  rules={[{ required: true }]}
                > 
                  <InputNumber 
                    min={1} 
                    max={120} 
                    size="large"
                    style={{ width: '100%', borderRadius: 12 }}
                    placeholder="e.g., 30"
                    addonAfter={<span style={{ fontWeight: 600, color: '#64748b' }}>minutes</span>}
                    className="premium-input"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Session Timing Configuration */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #f0f0f8', boxShadow: '0 2px 12px rgba(99,102,241,0.04)', marginBottom: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fff7e6', color: '#fa8c16', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                 <ClockCircleOutlined />
              </div>
              Session Timing Requirements
            </div>
            <Row gutter={[24, 16]}>
              <Col xs={24} md={8}>
                <Form.Item 
                  label={
                    <Space>
                      <PlayCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} />
                      <span style={{ fontWeight: 700, color: '#334155', fontSize: 14 }}>Early Start Window</span>
                      <Tooltip title="How many minutes before scheduled time teachers can start the session">
                        <InfoCircleOutlined style={{ color: '#6366f1' }} />
                      </Tooltip>
                    </Space>
                  }
                  name="early_start_minutes" 
                  rules={[{ required: true }]}
                > 
                  <InputNumber 
                    min={0} 
                    max={60} 
                    size="large"
                    style={{ width: '100%', borderRadius: 12 }}
                    placeholder="e.g., 15"
                    addonAfter={<span style={{ fontWeight: 600, color: '#64748b' }}>minutes</span>}
                    className="premium-input"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item 
                  label={
                    <Space>
                      <ClockCircleOutlined style={{ color: '#faad14', fontSize: 16 }} />
                      <span style={{ fontWeight: 700, color: '#334155', fontSize: 14 }}>Late Join Window</span>
                      <Tooltip title="How many minutes after session start students can still join">
                        <InfoCircleOutlined style={{ color: '#6366f1' }} />
                      </Tooltip>
                    </Space>
                  }
                  name="late_join_minutes" 
                  rules={[{ required: true }]}
                > 
                  <InputNumber 
                    min={0} 
                    max={60} 
                    size="large"
                    style={{ width: '100%', borderRadius: 12 }}
                    placeholder="e.g., 10"
                    addonAfter={<span style={{ fontWeight: 600, color: '#64748b' }}>minutes</span>}
                    className="premium-input"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item 
                  label={
                    <Space>
                      <StopOutlined style={{ color: '#ff4d4f', fontSize: 16 }} />
                      <span style={{ fontWeight: 700, color: '#334155', fontSize: 14 }}>Auto End Timer</span>
                      <Tooltip title="How many minutes after scheduled end time to automatically close the session">
                        <InfoCircleOutlined style={{ color: '#6366f1' }} />
                      </Tooltip>
                    </Space>
                  }
                  name="auto_end_minutes" 
                  rules={[{ required: true }]}
                > 
                  <InputNumber 
                    min={0} 
                    max={180} 
                    size="large"
                    style={{ width: '100%', borderRadius: 12 }}
                    placeholder="e.g., 15"
                    addonAfter={<span style={{ fontWeight: 600, color: '#64748b' }}>minutes</span>}
                    className="premium-input"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Security Settings */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #f0f0f8', boxShadow: '0 2px 12px rgba(99,102,241,0.04)', marginBottom: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f9f0ff', color: '#722ed1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                 <SafetyOutlined />
              </div>
              Attendance Security Rules
            </div>
            <Form.Item 
              label={
                <Space>
                  <span style={{ fontWeight: 700, color: '#334155', fontSize: 14 }}>Require Access Code for Attendance</span>
                  <Tooltip title="When enabled, students must enter the correct access code to mark attendance">
                    <InfoCircleOutlined style={{ color: '#6366f1' }} />
                  </Tooltip>
                </Space>
              }
            >
              {/* Using a functional children correctly resolves form dependencies without undefined crash */}
              <Form.Item noStyle shouldUpdate={(prev, curr) => prev.require_code_for_attendance !== curr.require_code_for_attendance}>
                {() => {
                  const isStrict = form.getFieldValue('require_code_for_attendance');
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#f8fafc', padding: '12px 20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                      <Switch 
                        checked={isStrict}
                        onChange={(val) => form.setFieldsValue({ require_code_for_attendance: val })}
                        checkedChildren={<span style={{ fontWeight: 700 }}>Required</span>} 
                        unCheckedChildren={<span style={{ fontWeight: 700 }}>Optional</span>}
                        style={{ background: isStrict ? '#6366f1' : undefined }}
                      />
                      <span style={{ fontSize: 13, color: isStrict ? '#1e293b' : '#64748b', fontWeight: 600 }}>
                        {isStrict ? 'Strict Mode Active' : 'Flexible Check-ins Active'}
                      </span>
                    </div>
                  );
                }}
              </Form.Item>
            </Form.Item>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: -12, marginLeft: 6 }}>
                <Text type="secondary" style={{ fontSize: '13px', lineHeight: 1.5 }}>
                  When disabled, students can mark attendance passively without waiting for an access code.
                </Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff7e6', padding: '8px 12px', borderRadius: 8, border: '1px solid #ffd591', width: 'fit-content' }}>
                  <InfoCircleOutlined style={{ color: '#fa8c16' }} />
                  <Text type="secondary" style={{ fontSize: '12px', color: '#d46b08', fontWeight: 600 }}>
                    Warning: Disabling this may allow remote or unauthorized check-ins.
                  </Text>
                </div>
              </div>
            </div>
        </Form>
      </div>

      <style>{`
        .premium-input .ant-input-number-group-addon {
          background: #f1f5f9;
          border-color: #e2e8f0;
          border-radius: 0 12px 12px 0 !important;
          padding: 0 16px;
        }
        .premium-input.ant-input-number-group-wrapper {
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          transition: all 0.2s;
        }
        .premium-input.ant-input-number-group-wrapper:hover,
        .premium-input.ant-input-number-group-wrapper-focused {
          border-color: #818cf8;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }
        .premium-input .ant-input-number {
          border: none !important;
          background: #f8fafc;
          border-radius: 12px 0 0 12px !important;
          font-weight: 600;
          color: #1e293b;
        }
        .premium-input .ant-input-number-input {
          height: 48px;
          padding: 0 16px;
          text-align: right;
        }
        .ant-form-item-explain-error {
          margin-top: 4px;
          font-size: 13px;
        }
      `}</style>
    </div>
  );
};

export default AdminSettings;