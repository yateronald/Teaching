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