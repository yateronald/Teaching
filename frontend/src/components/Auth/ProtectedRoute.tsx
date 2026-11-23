import React, { type ReactNode } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Button, Result, Spin } from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import { homeFor, type Role } from '../../utils/roles';

interface ProtectedRouteProps {
    children: ReactNode;
    /** One role, or the roles allowed on this page. */
    requiredRole?: Role | Role[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
    const { user, loading, isAuthenticated } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

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
        return <Navigate to={homeFor(user?.role)} replace />;
    }

    // If user must change password, redirect to force-change page from any other route
    if (!isForceChangeRoute && force) {
        return <Navigate to="/force-change-password" replace state={{ from: location }} />;
    }

    // Check role-based access. A page of another role does not exist for this
    // person: the same "page not found" as an unknown address (nothing of the
    // page is drawn, and its code is not even downloaded).
    const allowed = requiredRole ? (Array.isArray(requiredRole) ? requiredRole : [requiredRole]) : null;
    if (allowed && !allowed.includes(user?.role as Role)) {
        return (
            <Result
                status="404"
                title="Page not found"
                subTitle="This page does not exist in your space. It may have moved, or the link may be incomplete."
                extra={<Button type="primary" onClick={() => navigate(homeFor(user?.role), { replace: true })}>Back to my dashboard</Button>}
            />
        );
    }

    return <>{children}</>;
};

export default ProtectedRoute;
