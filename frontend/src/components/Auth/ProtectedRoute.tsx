import React, { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
    children: ReactNode;
    requiredRole?: 'admin' | 'teacher' | 'student';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
    const { user, loading, isAuthenticated } = useAuth();
    const location = useLocation();

    if (loading) {
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

    if (!isAuthenticated) {
        // Redirect to login page with return url
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Enforce password change if required and restrict access to the force-change route
    const isForceChangeRoute = location.pathname === '/force-change-password';
    const force = (user as any)?.force_password_change;

    // If user is trying to access force-change-password but doesn't need to change password, redirect to their dashboard
    if (isForceChangeRoute && !force) {
        const dashboardPath = user?.role === 'admin' ? '/dashboard' : 
                             user?.role === 'teacher' ? '/teacher-dashboard' : 
                             '/student-dashboard';
        return <Navigate to={dashboardPath} replace />;
    }

    // If user must change password, redirect to force-change page from any other route
    if (!isForceChangeRoute && force) {
        return <Navigate to="/force-change-password" replace state={{ from: location }} />;
    }

    // Check role-based access
    if (requiredRole && user?.role !== requiredRole) {
        // Redirect to appropriate dashboard based on user role
        const dashboardPath = user?.role === 'admin' ? '/dashboard' : 
                             user?.role === 'teacher' ? '/teacher-dashboard' : 
                             '/student-dashboard';
        return <Navigate to={dashboardPath} replace />;
    }

    return <>{children}</>; 
};

export default ProtectedRoute;