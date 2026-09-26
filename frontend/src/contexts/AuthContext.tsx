import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { App as AntApp } from 'antd';
import i18n from '../i18n';
import type { DeviceSession } from '../utils/devices';

interface User {
    id: number;
    username: string; // added to align with backend and profile editing
    email: string;
    first_name: string;
    last_name: string;
    role: 'admin' | 'teacher' | 'student' | 'candidate' | 'org_admin';
    created_at: string;
    // IANA timezone identifier (e.g. 'America/Toronto'). Defaults to 'UTC'
    // if the user hasn't set one. Used to localize all displayed times.
    timezone?: string;
    // Optional profile photo (kDrive file id). When null/undefined the UI shows a default icon.
    profile_photo_kdrive_file_id?: string | null;
    /** Administrators only: may open the website monitoring space. */
    can_view_monitoring?: boolean;
    // Password policy fields (may be undefined depending on endpoint)
    must_change_password?: number | boolean;
    password_expires_at?: string | null;
    force_password_change?: boolean;
    /** Company managers and company learners: their company's name, logo and state. */
    organization_id?: number | null;
    organization?: OrgBrand | null;
}

/** The company a manager or learner belongs to, as the server describes it. */
export interface OrgBrand {
    id: number;
    name: string;
    slug: string;
    default_language: 'fr' | 'en';
    state: 'active' | 'expired' | 'not_started' | 'suspended';
    access_starts_at: string;
    access_ends_at: string;
    days_left: number;
    expiring_soon: boolean;
    logo_url: string | null;
}

export interface LoginResult {
    success: boolean;
    error?: string;
    code?: string;
    message?: string;
    locked_until?: string;
    failed_attempts?: number;
    /** SESSION_LIMIT / SESSION_TAKEOVER_BLOCKED: the devices holding the account. */
    sessions?: DeviceSession[];
    limit?: number;
    can_sign_out_others?: boolean;
    /** How many devices this sign-in pushed out. */
    signed_out_others?: number;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string, options?: { signOutOthers?: boolean }) => Promise<LoginResult>;
    logout: () => Promise<void>;
    updateProfile: (profileData: Partial<User>) => Promise<{ success: boolean; error?: string }>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
    apiCall: (endpoint: string, options?: RequestInit) => Promise<Response>;
    verifyToken: () => Promise<boolean>;
    refreshUser: () => Promise<boolean>;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isTeacher: boolean;
    isStudent: boolean;
    /** Exam-preparation-only account. */
    isCandidate: boolean;
    /** Manager of a company's space. */
    isOrgAdmin: boolean;
    /** An administrator who may also see website monitoring. */
    canViewMonitoring: boolean;
    isForcePasswordChange: boolean;
    requestEmailChange: (newEmail: string) => Promise<{ success: boolean; error?: string; expiresAt?: string; attemptsLeft?: number; status?: number }>;
    verifyEmailChange: (code: string) => Promise<{ success: boolean; error?: string; user?: User; attemptsLeft?: number }>;
    resendEmailChange: () => Promise<{ success: boolean; error?: string; expiresAt?: string; attemptsLeft?: number }>;
    // Password reset additions
    requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string; expiresAt?: string; attemptsLeft?: number }>;
    verifyPasswordReset: (email: string, code: string) => Promise<{ success: boolean; error?: string; token?: string; resetExpiresAt?: string; attemptsLeft?: number }>;
    completePasswordReset: (email: string, token: string, newPassword: string) => Promise<{ success: boolean; error?: string; expired?: boolean }>;
}

interface AuthProviderProps {
    children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

    // Use Ant Design App context message instance to avoid static function warning
    const { message } = AntApp.useApp();

    // Check if user is authenticated on app load
    useEffect(() => {
        const checkAuth = async () => {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                try {
                    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
                        headers: {
                            'Authorization': `Bearer ${storedToken}`
                        }
                    });

                    if (response.ok) {
                        const userData = await response.json();
                        setUser(userData.user);
                        setToken(storedToken);
                        applyCompanyLanguage(userData.user);
                        // Auto-detect timezone if user hasn't explicitly set one yet.
                        // The DB default is 'UTC' from the migration; if the user
                        // is on a non-UTC machine we sync their profile to the
                        // browser's actual zone so quiz/meeting times display
                        // correctly out of the box.
                        autoDetectTimezone(userData.user, storedToken);
                    } else {
                        localStorage.removeItem('token');
                        setToken(null);
                    }
                } catch (error) {
                    console.error('Auth verification failed:', error);
                    localStorage.removeItem('token');
                    setToken(null);
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    // Best-effort: if the user's profile still has the migration-default
    // 'UTC' (or no timezone) and their browser is in a different zone, PATCH
    // the profile to the browser zone so all displayed times match what they
    // see on their computer. Runs once per session.
    const autoDetectTimezone = async (u: User | null, currentToken: string | null) => {
        if (!u || !currentToken) return;
        if (u.timezone && u.timezone !== 'UTC') return; // already set explicitly
        let browserTz: string | undefined;
        try { browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { /* ignore */ }
        if (!browserTz || browserTz === 'UTC') return; // nothing to change
        try {
            const r = await fetch(`${API_BASE_URL}/auth/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` },
                body: JSON.stringify({ timezone: browserTz }),
            });
            if (r.ok) {
                const d = await r.json();
                if (d?.user) mergeUser(d.user);
            }
        } catch { /* silent */ }
    };

    const login = async (email: string, password: string, options: { signOutOthers?: boolean } = {}): Promise<LoginResult> => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password, ...(options.signOutOthers ? { sign_out_others: true } : {}) })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                setToken(data.token);
                setUser(data.user);
                applyCompanyLanguage(data.user);
                message.success('Login successful!');
                // Sync profile timezone to browser on fresh login too.
                autoDetectTimezone(data.user, data.token);
                return { success: true, signed_out_others: data.signed_out_others };
            } else {
                // Don't show message here for security errors - let the component handle it
                if (data.code === 'ACCOUNT_DISABLED' || data.code === 'ACCOUNT_LOCKED' || data.code === 'ORG_SUSPENDED') {
                    return {
                        success: false,
                        error: data.error,
                        code: data.code,
                        message: data.message,
                        locked_until: data.locked_until,
                        failed_attempts: data.failed_attempts
                    };
                } else if (data.code === 'SESSION_LIMIT' || data.code === 'SESSION_TAKEOVER_BLOCKED') {
                    // The account is on as many devices as it may be. The sign-in
                    // screen shows them and offers to sign the others out.
                    return {
                        success: false,
                        error: data.error,
                        code: data.code,
                        message: data.message,
                        sessions: data.sessions || [],
                        limit: data.limit,
                        can_sign_out_others: !!data.can_sign_out_others,
                    };
                } else {
                    message.error(data.message || data.error || 'Login failed');
                    return { success: false, error: data.error };
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            message.error('Network error. Please try again.');
            return { success: false, error: 'Network error' };
        }
    };

    /**
     * A company account opens in its company's language, unless the person
     * already chose one on this device (the sign-in page or the header switch).
     */
    const applyCompanyLanguage = (u: User | null) => {
        const lang = u?.organization?.default_language;
        if (!lang) return;
        let chosen: string | null = null;
        try { chosen = localStorage.getItem('i18n_lang'); } catch { /* private mode */ }
        if (!chosen && i18n.language !== lang) i18n.changeLanguage(lang);
    };

    /**
     * Profile answers carry the account fields only: keep what the sign-in
     * check added (the company of a company account) instead of dropping it.
     */
    const mergeUser = (next: User) => setUser(prev => (prev ? { ...prev, ...next } : next));

    /** Forgets the sign-in on this device. */
    const clearSession = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const logout = async () => {
        // Tell the server first: the device slot is freed straight away and the
        // old token stops working, even if it is still lying around somewhere.
        const current = token || localStorage.getItem('token');
        if (current) {
            await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${current}` },
            }).catch(() => { /* signing out locally is what matters to the user */ });
        }
        clearSession();
        message.success('Logged out successfully');
    };

    const updateProfile = async (profileData: Partial<User>) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileData)
            });

            const data = await response.json();

            if (response.ok) {
                mergeUser(data.user);
                message.success('Profile updated successfully!');
                return { success: true };
            } else {
                message.error(data.error || 'Profile update failed');
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('Profile update error:', error);
            message.error('Network error. Please try again.');
            return { success: false, error: 'Network error' };
        }
    };

    const changePassword = async (currentPassword: string, newPassword: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const data = await response.json();

            if (response.ok) {
                // Refresh user profile to clear any force change flags
                try {
                    const verifyResp = await fetch(`${API_BASE_URL}/auth/verify`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (verifyResp.ok) {
                        const verifyData = await verifyResp.json();
                        setUser(verifyData.user);
                    }
                } catch (e) {
                    console.warn('Post-change profile refresh failed', e);
                }
                message.success('Password changed successfully!');
                return { success: true };
            } else {
                message.error(data.error || 'Password change failed');
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('Password change error:', error);
            message.error('Network error. Please try again.');
            return { success: false, error: 'Network error' };
        }
    };

    // Helper function to verify token validity
    const verifyToken = async () => {
        if (!token) return false;

        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.ok;
        } catch (error) {
            console.error('Token verification failed:', error);
            return false;
        }
    };

    // Refresh the cached user object from the server (used after profile changes
    // like a new profile photo so other components — header/sidebar — update).
    const refreshUser = async () => {
        if (!token) return false;
        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) return false;
            const data = await response.json();
            if (data?.user) setUser(data.user);
            return true;
        } catch (error) {
            console.error('refreshUser failed:', error);
            return false;
        }
    };

    // Helper function to make authenticated API calls
    const apiCall = async (endpoint: string, options: RequestInit = {}) => {
        // No pre-flight /auth/verify here — it doubled every request. A 401 answer is
        // checked against /auth/verify below, so an expired session still raises the same error.
        if (!token) {
            throw new Error('Authentication token is invalid or expired.');
        }

        // Normalize possible Headers instance to plain object to avoid merge issues
        const normalizedHeaders = options && (options as any).headers instanceof Headers
            ? Object.fromEntries(((options as any).headers as Headers).entries())
            : ((options as any)?.headers || {});

        // Detect FormData body – browser must set Content-Type with boundary itself
        const isFormData = options?.body instanceof FormData;

        const config: RequestInit = {
            ...(options as RequestInit),
            headers: {
                // Only set Content-Type for non-FormData requests
                ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
                ...normalizedHeaders,
                // Ensure Authorization is ALWAYS present and cannot be overridden
                'Authorization': `Bearer ${token}`,
            },
        };

        // If FormData, ensure Content-Type is NOT set (let browser add boundary)
        if (isFormData) {
            delete (config.headers as any)['Content-Type'];
        }

        // Normalize endpoint to avoid double '/api' and ensure leading slash
        let ep = String(endpoint || '');
        // If absolute URL provided, use it directly
        const isAbsolute = /^https?:\/\//i.test(ep);
        if (!isAbsolute) {
            if (ep.startsWith('/api/')) {
                ep = ep.slice(4); // remove leading '/api'
            }
            if (!ep.startsWith('/')) {
                ep = `/${ep}`;
            }
        }

        try {
            const url = isAbsolute ? ep : `${API_BASE_URL}${ep}`;
            const response = await fetch(url, config);
            if (response.status === 401) {
                // Ask the server whether this sign-in is still good. Only a clear
                // answer counts: a network blip must not sign anybody out.
                const check = await fetch(`${API_BASE_URL}/auth/verify`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                }).catch(() => null);
                if (check && !check.ok) {
                    const body = await check.json().catch(() => ({} as any));
                    clearSession();
                    message.warning(body?.code === 'SESSION_ENDED'
                        ? 'This device was signed out. Please sign in again.'
                        : 'Your session has expired. Please sign in again.');
                    throw new Error('Authentication token is invalid or expired.');
                }
                if (!check) throw new Error('Network error. Please try again.');
            }
            if (response.status === 403) {
                // The administrator disabled the company while this person was signed in.
                const body = await response.clone().json().catch(() => null);
                if (body?.code === 'ORG_SUSPENDED') {
                    clearSession();
                    message.warning(i18n.language?.startsWith('fr')
                        ? 'Le compte de votre entreprise est désactivé. Contactez l’administrateur.'
                        : 'Your company’s account is disabled. Please contact the administrator.');
                    throw new Error('Company account disabled.');
                }
            }
            return response;
        } catch (error) {
            throw error;
        }
    };

    const requestEmailChange = async (newEmail: string) => {
        try {
            const res = await apiCall('/email-change/request', { method: 'POST', body: JSON.stringify({ newEmail }) });
            const data = await res.json();
            if (res.ok) return { success: true, expiresAt: data.expiresAt, attemptsLeft: data.attemptsLeft };
            return { success: false, error: data.error, status: res.status };
        } catch (e: any) {
            return { success: false, error: e?.message || 'Network error' };
        }
    };

    const verifyEmailChange = async (code: string) => {
        try {
            const res = await apiCall('/email-change/verify', { method: 'POST', body: JSON.stringify({ code }) });
            const data = await res.json();
            if (res.ok) {
                mergeUser(data.user);
                return { success: true, user: data.user };
            }
            return { success: false, error: data.error, attemptsLeft: data.attemptsLeft };
        } catch (e: any) {
            return { success: false, error: e?.message || 'Network error' };
        }
    };

    const resendEmailChange = async () => {
        try {
            const res = await apiCall('/email-change/resend', { method: 'POST' });
            const data = await res.json();
            if (res.ok) return { success: true, expiresAt: data.expiresAt, attemptsLeft: data.attemptsLeft };
            return { success: false, error: data.error };
        } catch (e: any) {
            return { success: false, error: e?.message || 'Network error' };
        }
    };

    // Password reset flows (public endpoints, do not use apiCall).
    // No toasts here: PasswordResetModal shows every outcome inline, translated.
    const requestPasswordReset = async (email: string) => {
        try {
            const resp = await fetch(`${API_BASE_URL}/password-reset/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await resp.json().catch(() => ({}));
            if (resp.ok) return { success: true, expiresAt: data.expiresAt, attemptsLeft: data.attemptsLeft };
            return { success: false, error: data.error };
        } catch (e) {
            console.error('requestPasswordReset error', e);
            return { success: false, error: 'Network error' };
        }
    };

    const verifyPasswordReset = async (email: string, code: string) => {
        try {
            const resp = await fetch(`${API_BASE_URL}/password-reset/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code })
            });
            const data = await resp.json().catch(() => ({}));
            if (resp.ok) return { success: true, token: data.token, resetExpiresAt: data.resetExpiresAt };
            return { success: false, error: data.error || 'Invalid code', attemptsLeft: data.attemptsLeft };
        } catch (e) {
            console.error('verifyPasswordReset error', e);
            return { success: false, error: 'Network error' };
        }
    };

    const completePasswordReset = async (email: string, token: string, newPassword: string) => {
        try {
            const resp = await fetch(`${API_BASE_URL}/password-reset/reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token, newPassword })
            });
            const data = await resp.json().catch(() => ({}));
            if (resp.ok) return { success: true };
            return { success: false, error: data.error, expired: resp.status === 410 };
        } catch (e) {
            console.error('completePasswordReset error', e);
            return { success: false, error: 'Network error' };
        }
    };

    const value = {
        user,
        token,
        loading,
        login,
        logout,
        updateProfile,
        changePassword,
        apiCall,
        verifyToken,
        refreshUser,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'admin',
        isTeacher: user?.role === 'teacher',
        isStudent: user?.role === 'student',
        isCandidate: user?.role === 'candidate',
        isOrgAdmin: user?.role === 'org_admin',
        canViewMonitoring: user?.role === 'admin' && !!user?.can_view_monitoring,
        isForcePasswordChange: !!user?.force_password_change,
        requestEmailChange,
        verifyEmailChange,
        resendEmailChange,
        requestPasswordReset,
        verifyPasswordReset,
        completePasswordReset
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};