import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, message, Spin } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { ASSET_PATHS } from '../../utils/assets';
import { brandingUtils, BRAND_CONFIG, COLOR_COMBINATIONS } from '../../utils/branding';
import PasswordResetModal from './PasswordResetModal';

const { Title, Text } = Typography;

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

    const from = location.state?.from?.pathname || '/';

    useEffect(() => {
        // Ensure brand CSS variables are ready on the public route as well
        brandingUtils.applyCSSVariables();
    }, []);

    useEffect(() => {
        if (isAuthenticated && user) {
            // Redirect to appropriate dashboard based on role
            const dashboardPath = user.role === 'admin' ? '/dashboard' : 
                                 user.role === 'teacher' ? '/teacher-dashboard' : 
                                 '/student-dashboard';
            navigate(from === '/' ? dashboardPath : from, { replace: true });
        }
    }, [isAuthenticated, user, navigate, from]);

    const onFinish = async (values: LoginForm) => {
        setLoading(true);
        try {
            const result = await login(values.email, values.password);
            if (result.success) {
                // Navigation will be handled by useEffect
            }
        } catch (error) {
            message.error('Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (isAuthenticated) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: `linear-gradient(135deg, ${BRAND_CONFIG.colors.primary} 0%, ${brandingUtils.mix(BRAND_CONFIG.colors.primary, BRAND_CONFIG.colors.secondary, 0.5)} 60%, ${BRAND_CONFIG.colors.secondary} 100%)`
        }}>
            <Card 
                style={{ 
                    width: 420, 
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    borderRadius: '12px'
                }}
                styles={{ body: { padding: 24 } }}
            >
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <img 
                        src={ASSET_PATHS.LOGOS.MAIN}
                        alt={BRAND_CONFIG.name}
                        style={brandingUtils.getResponsiveLogoStyles('login')}
                    />
                </div>

                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    <Title level={3} style={{ color: COLOR_COMBINATIONS.HEADER.background, marginBottom: 8 }}>
                        French Teaching System
                    </Title>
                    <Text type="secondary">
                        Sign in to your account
                    </Text>
                </div>

                <Form
                    form={form}
                    name="login"
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                >
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Please input your email!' },
                            { type: 'email', message: 'Please enter a valid email!' }
                        ]}
                    >
                        <Input 
                            prefix={<UserOutlined />} 
                            placeholder="Enter your email"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Password"
                        rules={[
                            { required: true, message: 'Please input your password!' },
                            { min: 6, message: 'Password must be at least 6 characters!' }
                        ]}
                    >
                        <Input.Password 
                            prefix={<LockOutlined />} 
                            placeholder="Enter your password"
                        />
                    </Form.Item>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                        <Button type="link" onClick={() => setResetOpen(true)} style={{ padding: 0 }}>
                            Forgot password?
                        </Button>
                    </div>

                    <Form.Item style={{ marginBottom: 0 }}>
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            loading={loading}
                            block
                            style={{ height: 48 }}
                        >
                            Sign In
                        </Button>
                    </Form.Item>
                </Form>

                <div style={{ marginTop: 24, textAlign: 'center' }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        Demo Accounts:<br/>
                        Admin: admin@example.com / admin123<br/>
                        Teacher: teacher@example.com / teacher123<br/>
                        Student: student@example.com / student123
                    </Text>
                </div>
            </Card>
            <PasswordResetModal 
                open={resetOpen} 
                onClose={() => setResetOpen(false)}
                initialEmail={form.getFieldValue('email')}
            />
        </div>
    );
};

export default Login;