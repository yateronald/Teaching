import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, message, Spin } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { ASSET_PATHS } from '../../utils/assets';
import { brandingUtils, BRAND_CONFIG, COLOR_COMBINATIONS } from '../../utils/branding';
import PasswordResetModal from './PasswordResetModal';
import AccountDisabledModal from './AccountDisabledModal';

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
    const [accountDisabledOpen, setAccountDisabledOpen] = useState(false);
    const [accountDisabledData, setAccountDisabledData] = useState<{
        type: 'disabled' | 'locked';
        message?: string;
        lockedUntil?: string;
        failedAttempts?: number;
    }>({ type: 'disabled' });

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
            } else if (result.code === 'ACCOUNT_DISABLED') {
                setAccountDisabledData({
                    type: 'disabled',
                    message: result.message
                });
                setAccountDisabledOpen(true);
            } else if (result.code === 'ACCOUNT_LOCKED') {
                setAccountDisabledData({
                    type: 'locked',
                    message: result.message,
                    lockedUntil: result.locked_until,
                    failedAttempts: result.failed_attempts
                });
                setAccountDisabledOpen(true);
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
        <>
            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes slideInLeft {
                    from {
                        opacity: 0;
                        transform: translateX(-50px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes pulse {
                    0% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.05);
                    }
                    100% {
                        transform: scale(1);
                    }
                }

                @keyframes gradientShift {
                    0% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                    100% {
                        background-position: 0% 50%;
                    }
                }

                .login-logo {
                    animation: fadeInUp 1s ease-out;
                }

                .login-title {
                    animation: slideInLeft 1.2s ease-out;
                    background: linear-gradient(-45deg, #4f46e5, #7c3aed, #ec4899, #f59e0b);
                    background-size: 400% 400%;
                    animation: slideInLeft 1.2s ease-out, gradientShift 3s ease infinite;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .member-login-title {
                    animation: fadeInUp 1.4s ease-out;
                }

                .login-form {
                    animation: fadeInUp 1.6s ease-out;
                }

                .login-button:hover {
                    animation: pulse 0.6s ease-in-out;
                }

                /* Tablet styles */
                @media (max-width: 1024px) {
                    .login-container {
                        max-width: 900px !important;
                        margin: 15px !important;
                    }
                    .login-left-side, .login-right-side {
                        padding: 40px !important;
                    }
                }

                /* Mobile landscape */
                @media (max-width: 768px) and (orientation: landscape) {
                    .login-container {
                        flex-direction: row !important;
                        height: 90vh !important;
                        margin: 5vh auto !important;
                    }
                    .login-left-side {
                        flex: 0.4 !important;
                        min-height: auto !important;
                    }
                    .login-right-side {
                        flex: 0.6 !important;
                        padding: 20px !important;
                    }
                    .login-title {
                        font-size: 18px !important;
                        margin-bottom: 5px !important;
                    }
                    .member-login-title {
                        font-size: 14px !important;
                        margin-bottom: 15px !important;
                    }
                }

                /* Mobile portrait */
                @media (max-width: 768px) and (orientation: portrait) {
                    .login-container {
                        flex-direction: column !important;
                        margin: 10px !important;
                        min-height: calc(100vh - 20px) !important;
                        border-radius: 15px !important;
                    }
                    .login-left-side {
                        min-height: 180px !important;
                        flex: none !important;
                        border-radius: 15px 15px 0 0 !important;
                        background-attachment: scroll !important;
                    }
                    .login-right-side {
                        padding: 25px 20px !important;
                        border-radius: 0 0 15px 15px !important;
                    }
                    .login-logo {
                        width: 90px !important;
                        margin-bottom: 8px !important;
                    }
                    .login-title {
                        font-size: 22px !important;
                        margin-bottom: 8px !important;
                        line-height: 1.2 !important;
                    }
                    .member-login-title {
                        font-size: 16px !important;
                        margin-bottom: 20px !important;
                    }
                    .login-form .ant-form-item {
                        margin-bottom: 16px !important;
                    }
                    .login-form .ant-input, .login-form .ant-input-password {
                        height: 45px !important;
                        font-size: 16px !important;
                    }
                    .login-button {
                        height: 45px !important;
                        font-size: 15px !important;
                    }
                }

                /* Small mobile devices */
                @media (max-width: 480px) {
                    .login-container {
                        margin: 5px !important;
                        border-radius: 12px !important;
                    }
                    .login-left-side {
                        min-height: 150px !important;
                        border-radius: 12px 12px 0 0 !important;
                    }
                    .login-right-side {
                        padding: 20px 15px !important;
                        border-radius: 0 0 12px 12px !important;
                    }
                    .login-logo {
                        width: 75px !important;
                        margin-bottom: 6px !important;
                    }
                    .login-title {
                        font-size: 18px !important;
                        margin-bottom: 6px !important;
                        letter-spacing: 0.5px !important;
                    }
                    .member-login-title {
                        font-size: 14px !important;
                        margin-bottom: 15px !important;
                    }
                    .login-form .ant-input, .login-form .ant-input-password {
                        height: 42px !important;
                        font-size: 16px !important;
                        border-radius: 21px !important;
                    }
                    .login-button {
                        height: 42px !important;
                        font-size: 14px !important;
                        border-radius: 21px !important;
                    }
                }

                /* Extra small devices */
                @media (max-width: 360px) {
                    .login-container {
                        margin: 3px !important;
                    }
                    .login-right-side {
                        padding: 15px 12px !important;
                    }
                    .login-title {
                        font-size: 16px !important;
                        letter-spacing: 0.3px !important;
                    }
                    .member-login-title {
                        font-size: 13px !important;
                    }
                }

                /* Mobile animation optimizations */
                @media (max-width: 768px) {
                    .login-logo {
                        animation-duration: 0.8s !important;
                        animation-delay: 0.1s !important;
                    }
                    .login-title {
                        animation-duration: 0.9s !important;
                        animation-delay: 0.2s !important;
                        text-shadow: 1px 1px 2px rgba(0,0,0,0.1) !important;
                    }
                    .member-login-title {
                        animation-duration: 0.7s !important;
                        animation-delay: 0.3s !important;
                    }
                    .login-form {
                        animation-duration: 1s !important;
                        animation-delay: 0.4s !important;
                    }
                    /* Reduce motion for better mobile performance */
                    .login-button {
                        transition: all 0.2s ease !important;
                    }
                    .login-button:hover {
                        animation: none !important;
                        transform: translateY(-1px) !important;
                    }
                }

                /* Reduce motion for users who prefer it */
                @media (prefers-reduced-motion: reduce) {
                    .login-logo, .login-title, .member-login-title, .login-form {
                        animation: none !important;
                    }
                    .login-button {
                        transition: none !important;
                    }
                    .login-button:hover {
                        animation: none !important;
                        transform: none !important;
                    }
                }

                /* Touch device optimizations */
                @media (hover: none) and (pointer: coarse) {
                    .login-button {
                        transform: none !important;
                        -webkit-tap-highlight-color: transparent !important;
                    }
                    .login-button:active {
                        transform: scale(0.98) !important;
                        transition: transform 0.1s ease !important;
                        background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%) !important;
                    }
                    .ant-input:focus, .ant-input-password:focus {
                        transform: scale(1.01) !important;
                        transition: transform 0.2s ease !important;
                        box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
                    }
                    /* Improve touch targets */
                    .ant-input, .ant-input-password, .login-button {
                        min-height: 44px !important;
                    }
                }

                /* High DPI displays */
                @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
                    .login-title {
                        -webkit-font-smoothing: antialiased !important;
                        -moz-osx-font-smoothing: grayscale !important;
                    }
                    .member-login-title {
                        -webkit-font-smoothing: antialiased !important;
                        -moz-osx-font-smoothing: grayscale !important;
                    }
                }

                /* Mobile form enhancements */
                @media (max-width: 768px) {
                    .ant-form-item-has-error .ant-input, 
                    .ant-form-item-has-error .ant-input-password {
                        border-color: #ff4d4f !important;
                        box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2) !important;
                        animation: shake 0.5s ease-in-out !important;
                    }
                    
                    .ant-form-item-explain-error {
                        font-size: 12px !important;
                        margin-top: 4px !important;
                        padding: 4px 8px !important;
                        background: rgba(255, 77, 79, 0.1) !important;
                        border-radius: 4px !important;
                    }

                    /* Loading state for mobile */
                    .login-button.ant-btn-loading {
                        pointer-events: none !important;
                        opacity: 0.7 !important;
                    }

                    /* Forgot password link mobile styling */
                    .ant-typography {
                        font-size: 13px !important;
                        padding: 8px !important;
                        text-align: center !important;
                        margin-top: 10px !important;
                    }
                }

                /* Shake animation for form errors */
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
                    20%, 40%, 60%, 80% { transform: translateX(2px); }
                }

                /* Mobile keyboard adjustments */
                @media (max-width: 768px) {
                    .login-container {
                        transition: all 0.3s ease !important;
                    }
                    
                    /* Adjust for virtual keyboard */
                    @supports (-webkit-touch-callout: none) {
                        .login-container {
                            min-height: calc(100vh - 20px) !important;
                            max-height: calc(100vh - 20px) !important;
                        }
                    }
                }

                /* Accessibility improvements for mobile */
                @media (max-width: 768px) {
                    .login-button:focus-visible {
                        outline: 2px solid #1890ff !important;
                        outline-offset: 2px !important;
                    }
                    
                    .ant-input:focus-visible, 
                    .ant-input-password:focus-visible {
                        outline: 2px solid #1890ff !important;
                        outline-offset: 1px !important;
                    }
                }
            `}</style>
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${BRAND_CONFIG.colors.primary} 0%, ${brandingUtils.mix(BRAND_CONFIG.colors.primary, BRAND_CONFIG.colors.secondary, 0.5)} 60%, ${BRAND_CONFIG.colors.secondary} 100%)`,
                padding: '20px'
            }}>
                <div className="login-container" style={{
                    display: 'flex',
                    width: '100%',
                    maxWidth: '1200px',
                    minHeight: '600px',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                    background: 'white'
                }}>
                {/* Left side - French background image */}
                 <div className="login-left-side" style={{
                     flex: 1,
                     backgroundImage: `url(${ASSET_PATHS.IMAGES.FR_BACKGROUND})`,
                     backgroundSize: 'cover',
                     backgroundPosition: 'center',
                     position: 'relative'
                 }}>
                 </div>

                 {/* Right side - Login form */}
                 <div className="login-right-side" style={{
                     flex: 1,
                     padding: '60px 50px',
                     display: 'flex',
                     flexDirection: 'column',
                     justifyContent: 'center',
                     background: 'white'
                 }}>
                     {/* Logo and title moved to right side */}
                     <div style={{ textAlign: 'center', marginBottom: 40 }}>
                         <img 
                             src={ASSET_PATHS.LOGOS.MAIN}
                             alt={BRAND_CONFIG.name}
                             className="login-logo"
                             style={{
                                 width: '90px',
                                 height: 'auto',
                                 marginBottom: '15px'
                             }}
                         />
                         <Title level={2} className="login-title" style={{ 
                             marginBottom: '10px',
                             fontSize: '28px',
                             fontWeight: 'bold',
                             letterSpacing: '1px'
                         }}>
                             LEARN FRENCH WITH NATIVES
                         </Title>
                         <Title level={3} className="member-login-title" style={{ 
                             color: '#666', 
                             marginBottom: 8,
                             fontSize: '18px',
                             fontWeight: '400'
                         }}>
                             Member Login
                         </Title>
                     </div>
                     <Form
                         form={form}
                         name="login"
                         onFinish={onFinish}
                         layout="vertical"
                         size="large"
                         className="login-form"
                    >
                        <Form.Item
                            name="email"
                            rules={[
                                { required: true, message: 'Please input your email!' },
                                { type: 'email', message: 'Please enter a valid email!' }
                            ]}
                        >
                            <Input 
                                prefix={<UserOutlined style={{ color: '#999' }} />} 
                                placeholder="Email"
                                style={{
                                    height: '50px',
                                    borderRadius: '25px',
                                    border: 'none',
                                    background: '#f5f5f5',
                                    paddingLeft: '20px'
                                }}
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[
                                { required: true, message: 'Please input your password!' },
                                { min: 6, message: 'Password must be at least 6 characters!' }
                            ]}
                        >
                            <Input.Password 
                                prefix={<LockOutlined style={{ color: '#999' }} />} 
                                placeholder="Password"
                                style={{
                                    height: '50px',
                                    borderRadius: '25px',
                                    border: 'none',
                                    background: '#f5f5f5',
                                    paddingLeft: '20px'
                                }}
                            />
                        </Form.Item>

                        <Form.Item style={{ marginBottom: 20 }}>
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                loading={loading}
                                block
                                className="login-button"
                                style={{ 
                                    height: '50px',
                                    borderRadius: '25px',
                                    background: 'linear-gradient(45deg, #52c41a, #73d13d)',
                                    border: 'none',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                LOGIN
                            </Button>
                        </Form.Item>

                        <div style={{ textAlign: 'center' }}>
                            <Button 
                                type="link" 
                                onClick={() => setResetOpen(true)} 
                                style={{ 
                                    padding: 0,
                                    color: '#999',
                                    fontSize: '14px'
                                }}
                            >
                                Forgot Username / Password?
                            </Button>
                        </div>
                    </Form>
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