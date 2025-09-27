import React, { useEffect, useState } from 'react';
import { Card, Typography, Form, InputNumber, Switch, Button, Space, message } from 'antd';
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
    <Card loading={loading}>
      <Title level={3}>Admin Settings</Title>
      <Text type="secondary">View and modify attendance-related settings used across the platform.</Text>

      <Form
        layout="vertical"
        style={{ marginTop: 16 }}
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
        <Form.Item label="Access Code Length" name="code_length" rules={[{ required: true, message: 'Please enter code length' }]}> 
          <InputNumber min={4} max={12} style={{ width: 200 }} />
        </Form.Item>

        <Form.Item label="Code Expiry (minutes)" name="code_expiry_minutes" rules={[{ required: true }]}> 
          <InputNumber min={1} max={120} style={{ width: 200 }} />
        </Form.Item>

        <Form.Item label="Early Start Window (minutes)" name="early_start_minutes" rules={[{ required: true }]}> 
          <InputNumber min={0} max={60} style={{ width: 200 }} />
        </Form.Item>

        <Form.Item label="Late Join Window (minutes)" name="late_join_minutes" rules={[{ required: true }]}> 
          <InputNumber min={0} max={60} style={{ width: 200 }} />
        </Form.Item>

        <Form.Item label="Auto End After (minutes)" name="auto_end_minutes" rules={[{ required: true }]}> 
          <InputNumber min={0} max={180} style={{ width: 200 }} />
        </Form.Item>

        <Form.Item label="Require Code for Attendance" name="require_code_for_attendance" valuePropName="checked"> 
          <Switch />
        </Form.Item>

        <Space>
          <Button type="primary" htmlType="submit">Save Changes</Button>
          <Button onClick={fetchSettings}>Refresh</Button>
        </Space>
      </Form>
    </Card>
  );
};

export default AdminSettings;