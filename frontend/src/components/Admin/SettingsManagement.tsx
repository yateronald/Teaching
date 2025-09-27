import React, { useState, useEffect } from 'react';
import {
    Card,
    Form,
    InputNumber,
    Switch,
    Button,
    message,
    Typography,
    Space,
    Divider,
    Spin,
    Row,
    Col,
    Alert
} from 'antd';
import {
    SettingOutlined,
    SaveOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text } = Typography;

interface Setting {
    id: number;
    setting_key: string;
    setting_value: string;
    description: string;
    created_at: string;
    updated_at: string;
}

interface SettingsData {
    code_length: number;
    code_expiry_minutes: number;
    early_start_minutes: number;
    late_join_minutes: number;
    auto_end_minutes: number;
    require_code_for_attendance: boolean;
}

const SettingsManagement: React.FC = () => {
    const [settings, setSettings] = useState<Setting[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form] = Form.useForm();
    const { apiCall, user, isAdmin, isAuthenticated } = useAuth();

    // Check if user is authenticated and has admin privileges
    if (!isAuthenticated) {
        return (
            <Card>
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Title level={3}>Authentication Required</Title>
                    <p>Please log in to access settings management.</p>
                </div>
            </Card>
        );
    }

    if (!isAdmin) {
        return (
            <Card>
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Title level={3}>Access Denied</Title>
                    <p>You need admin privileges to access settings management.</p>
                    <p>Current role: {user?.role || 'Unknown'}</p>
                </div>
            </Card>
        );
    }

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const response = await apiCall('/settings');
            if (response.ok) {
                const result = await response.json();
                const data = result.data || [];
                setSettings(data);
                
                // Convert settings array to form values
                const formValues: any = {};
                data.forEach((setting: Setting) => {
                    if (setting.setting_key === 'require_code_for_attendance') {
                        formValues[setting.setting_key] = setting.setting_value === 'true';
                    } else {
                        formValues[setting.setting_key] = parseInt(setting.setting_value) || setting.setting_value;
                    }
                });
                
                form.setFieldsValue(formValues);
            } else {
                const errorData = await response.json();
                message.error(errorData.error || errorData.message || 'Failed to fetch settings');
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            message.error('Failed to fetch settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (values: SettingsData) => {
        setSaving(true);
        try {
            // Update each setting individually
            const updatePromises = Object.entries(values).map(async ([key, value]) => {
                const response = await apiCall(`/settings/key/${key}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ setting_value: value.toString() }),
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || errorData.message || `Failed to update ${key}`);
                }
                
                return response.json();
            });

            await Promise.all(updatePromises);
            message.success('Settings updated successfully');
            fetchSettings(); // Refresh the settings
        } catch (error) {
            console.error('Error updating settings:', error);
            message.error(error instanceof Error ? error.message : 'Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    const getSettingByKey = (key: string): Setting | undefined => {
        return settings.find(setting => setting.setting_key === key);
    };

    return (
        <div style={{ padding: '24px' }}>
            <Card>
                <div style={{ marginBottom: '24px' }}>
                    <Title level={2}>
                        <SettingOutlined style={{ marginRight: '8px' }} />
                        Settings Management
                    </Title>
                    <Text type="secondary">
                        Configure attendance and system settings for the platform.
                    </Text>
                </div>

                <Spin spinning={loading}>
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSave}
                        disabled={saving}
                    >
                        <Alert
                            message="Settings Information"
                            description="These settings control various aspects of the attendance system. Changes will take effect immediately after saving."
                            type="info"
                            showIcon
                            style={{ marginBottom: '24px' }}
                        />

                        <Row gutter={[24, 16]}>
                            <Col xs={24} md={12}>
                                <Card title="Access Code Settings" size="small">
                                    <Form.Item
                                        name="code_length"
                                        label="Access Code Length"
                                        help={getSettingByKey('code_length')?.description}
                                        rules={[
                                            { required: true, message: 'Please enter code length' },
                                            { type: 'number', min: 4, max: 10, message: 'Code length must be between 4 and 10' }
                                        ]}
                                    >
                                        <InputNumber
                                            min={4}
                                            max={10}
                                            style={{ width: '100%' }}
                                            placeholder="Enter code length"
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        name="code_expiry_minutes"
                                        label="Code Expiry (Minutes)"
                                        help={getSettingByKey('code_expiry_minutes')?.description}
                                        rules={[
                                            { required: true, message: 'Please enter expiry time' },
                                            { type: 'number', min: 1, max: 120, message: 'Expiry time must be between 1 and 120 minutes' }
                                        ]}
                                    >
                                        <InputNumber
                                            min={1}
                                            max={120}
                                            style={{ width: '100%' }}
                                            placeholder="Enter expiry time in minutes"
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        name="require_code_for_attendance"
                                        label="Require Code for Attendance"
                                        help={getSettingByKey('require_code_for_attendance')?.description}
                                        valuePropName="checked"
                                    >
                                        <Switch />
                                    </Form.Item>
                                </Card>
                            </Col>

                            <Col xs={24} md={12}>
                                <Card title="Session Timing Settings" size="small">
                                    <Form.Item
                                        name="early_start_minutes"
                                        label="Early Start (Minutes)"
                                        help={getSettingByKey('early_start_minutes')?.description}
                                        rules={[
                                            { required: true, message: 'Please enter early start time' },
                                            { type: 'number', min: 0, max: 60, message: 'Early start must be between 0 and 60 minutes' }
                                        ]}
                                    >
                                        <InputNumber
                                            min={0}
                                            max={60}
                                            style={{ width: '100%' }}
                                            placeholder="Minutes before class start"
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        name="late_join_minutes"
                                        label="Late Join (Minutes)"
                                        help={getSettingByKey('late_join_minutes')?.description}
                                        rules={[
                                            { required: true, message: 'Please enter late join time' },
                                            { type: 'number', min: 0, max: 60, message: 'Late join must be between 0 and 60 minutes' }
                                        ]}
                                    >
                                        <InputNumber
                                            min={0}
                                            max={60}
                                            style={{ width: '100%' }}
                                            placeholder="Minutes after class start"
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        name="auto_end_minutes"
                                        label="Auto End (Minutes)"
                                        help={getSettingByKey('auto_end_minutes')?.description}
                                        rules={[
                                            { required: true, message: 'Please enter auto end time' },
                                            { type: 'number', min: 0, max: 120, message: 'Auto end must be between 0 and 120 minutes' }
                                        ]}
                                    >
                                        <InputNumber
                                            min={0}
                                            max={120}
                                            style={{ width: '100%' }}
                                            placeholder="Minutes after scheduled end"
                                        />
                                    </Form.Item>
                                </Card>
                            </Col>
                        </Row>

                        <Divider />

                        <Space>
                            <Button
                                type="primary"
                                htmlType="submit"
                                icon={<SaveOutlined />}
                                loading={saving}
                                size="large"
                            >
                                Save Settings
                            </Button>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={fetchSettings}
                                disabled={saving}
                                size="large"
                            >
                                Refresh
                            </Button>
                        </Space>
                    </Form>
                </Spin>
            </Card>
        </div>
    );
};

export default SettingsManagement;