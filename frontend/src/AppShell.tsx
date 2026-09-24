// The signed-in app's shell: antd, authentication and the app's translations.
//
// Loaded on demand (see App.tsx) so that visitors of the public pages never
// download it: those pages use none of it, and every kilobyte they skip makes
// them appear sooner, which counts for visitors and for Google.
import './i18n';
import '@ant-design/v5-patch-for-react-19';
import { Suspense } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp, Button, Result } from 'antd';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import { homeFor } from './utils/roles';
import { BRAND_CONFIG } from './utils/branding';
import './App.css';

export { ProtectedRoute };

/** Providers for everything behind /login and /app, around the matched screen. */
export default function AppShell() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: BRAND_CONFIG.colors.primary,
          borderRadius: 6,
          // Bump the popup base z-index so Select/DatePicker/Dropdown popups
          // ALWAYS render on top of antd Modals (modal default z-index is 1000).
          zIndexPopupBase: 2000,
        },
      }}
      // Mount all popups (Select dropdown, DatePicker, TimePicker, Cascader, etc.)
      // at document.body so they're never trapped inside a parent stacking context
      // (e.g. a Modal body whose 'transform' or 'overflow' creates a new context).
      getPopupContainer={() => document.body}
    >
      <AntApp>
        <AuthProvider>
          <Suspense fallback={<div className="app-route-loading" role="status" aria-label="Loading" />}>
            <Outlet />
          </Suspense>
        </AuthProvider>
      </AntApp>
    </ConfigProvider>
  );
}

/** /app → the signed-in user's own home page. */
export function RoleHome() {
  const { user } = useAuth();
  return <Navigate to={homeFor(user?.role)} replace />;
}

/** An /app address that matches no screen: said plainly, with a way back. */
export function AppNotFound() {
  const navigate = useNavigate();
  return (
    <Result
      status="404"
      title="Page not found"
      subTitle="This page does not exist in your space. It may have moved, or the link may be incomplete."
      extra={<Button type="primary" onClick={() => navigate('/app', { replace: true })}>Back to my dashboard</Button>}
    />
  );
}
