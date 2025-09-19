import React, { useState } from 'react';
import { Layout as AntLayout, Menu, Avatar, Dropdown, Button, Typography, Space } from 'antd';
import {
    DashboardOutlined,
    UserOutlined,
    TeamOutlined,
    BookOutlined,
    FileTextOutlined,
    CalendarOutlined,
    FolderOutlined,
    LogoutOutlined,
    SettingOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    BarChartOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { MenuProps } from 'antd';
import { ASSET_PATHS } from '../../utils/assets';
import { COLOR_COMBINATIONS, brandingUtils } from '../../utils/branding';

const { Header, Sider, Content } = AntLayout;
const { Text } = Typography;

type MenuItem = Required<MenuProps>['items'][number];

const Layout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { user, logout, isAdmin, isTeacher, isStudent } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const getMenuItems = (): MenuItem[] => {
        const items: MenuItem[] = [];

        if (isAdmin) {
            items.push(
                {
                    key: '/dashboard',
                    icon: <DashboardOutlined />,
                    label: 'Dashboard',
                },
                {
                    key: '/users',
                    icon: <UserOutlined />,
                    label: 'User Management',
                },
                {
                    key: '/batches',
                    icon: <TeamOutlined />,
                    label: 'Batch Management',
                },
                {
                    key: '/timetable',
                    icon: <CalendarOutlined />,
                    label: 'Teacher Timetable',
                }
            );
        }

        if (isTeacher) {
            items.push(
                {
                    key: '/teacher-dashboard',
                    icon: <DashboardOutlined />,
                    label: 'Dashboard',
                },
                {
                    key: '/my-batches',
                    icon: <TeamOutlined />,
                    label: 'My Batches',
                },
                {
                    key: '/quizzes',
                    icon: <FileTextOutlined />,
                    label: 'Quiz Management',
                },
                {
                    key: '/resources',
                    icon: <FolderOutlined />,
                    label: 'Resources',
                },
                {
                    key: '/schedule',
                    icon: <CalendarOutlined />,
                    label: 'Schedule',
                }
            );
        }

        if (isStudent) {
            items.push(
                {
                    key: '/student-dashboard',
                    icon: <DashboardOutlined />,
                    label: 'Dashboard',
                },
                {
                    key: '/my-quizzes',
                    icon: <FileTextOutlined />,
                    label: 'My Quizzes',
                },
                {
                    key: '/my-results',
                    icon: <BookOutlined />,
                    label: 'My Results',
                },
                {
                    key: '/my-marksheet',
                    icon: <BarChartOutlined />,
                    label: 'Marksheet',
                },
                {
                    key: '/my-resources',
                    icon: <FolderOutlined />,
                    label: 'Resources',
                },
                {
                    key: '/my-schedule',
                    icon: <CalendarOutlined />,
                    label: 'My Schedule',
                }
            );
        }

        return items;
    };

    const handleMenuClick = ({ key }: { key: string }) => {
        navigate(key);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const userMenuItems: MenuProps['items'] = [
        {
            key: 'profile',
            icon: <SettingOutlined />,
            label: 'Profile Settings',
            onClick: () => navigate('/profile')
        },
        {
            type: 'divider'
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Logout',
            onClick: handleLogout
        }
    ];

    const getRoleDisplayName = (role: string) => {
        switch (role) {
            case 'admin': return 'Administrator';
            case 'teacher': return 'Teacher';
            case 'student': return 'Student';
            default: return role;
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return '#f50';
            case 'teacher': return '#108ee9';
            case 'student': return '#87d068';
            default: return '#666';
        }
    };

    return (
        <AntLayout style={{ minHeight: '100vh' }}>
            <Sider 
                trigger={null} 
                collapsible 
                collapsed={collapsed}
                style={{
                    background: '#fff',
                    boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    zIndex: 100
                }}
            >
                <div style={{
                    height: 64,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: '1px solid #f0f0f0',
                    marginBottom: 16,
                    paddingInline: 12
                }}>
                    <img
                        src={ASSET_PATHS.LOGOS.MAIN}
                        alt="Learn French - Logo"
                        style={brandingUtils.getResponsiveLogoStyles(collapsed ? 'header-collapsed' : 'header')}
                    />
                </div>
                
                <Menu
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={getMenuItems()}
                    onClick={handleMenuClick}
                    style={{ border: 'none' }}
                />
            </Sider>
            
            <AntLayout style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 0.2s' }}>
                <Header style={{
                    padding: '0 24px',
                    background: COLOR_COMBINATIONS.HEADER.background,
                    color: COLOR_COMBINATIONS.HEADER.text,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    left: collapsed ? 80 : 200,
                    zIndex: 99,
                    transition: 'left 0.2s'
                }}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{ fontSize: 16, width: 64, height: 64, color: COLOR_COMBINATIONS.HEADER.text }}
                    />
                    
                    <Space align="center" size={12}>
                        <Space direction="vertical" size={0} style={{ textAlign: 'right', lineHeight: 1.2 }}>
                            <Text strong style={{ margin: 0, display: 'block', color: COLOR_COMBINATIONS.HEADER.text }}>
                                {user?.first_name} {user?.last_name}
                            </Text>
                            <Text 
                                type="secondary" 
                                style={{ 
                                    fontSize: 12,
                                    color: 'rgba(255,255,255,0.85)',
                                    margin: 0,
                                    display: 'block'
                                }}
                            >
                                {getRoleDisplayName(user?.role || '')}
                            </Text>
                        </Space>
                        
                        <Dropdown 
                            menu={{ items: userMenuItems }} 
                            placement="bottomRight"
                            trigger={['click']}
                        >
                            <Avatar 
                                size={40}
                                style={{ 
                                    backgroundColor: getRoleColor(user?.role || ''),
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                icon={<UserOutlined />}
                            />
                        </Dropdown>
                    </Space>
                </Header>
                
                <Content style={{
                    margin: '88px 24px 24px 24px',
                    padding: '24px',
                    background: '#fff',
                    borderRadius: '8px',
                    minHeight: 'calc(100vh - 112px)',
                    overflow: 'auto'
                }}>
                    <Outlet />
                </Content>
            </AntLayout>
        </AntLayout>
    );
};

export default Layout;