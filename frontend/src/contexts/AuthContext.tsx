import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { message } from 'antd';

interface User {
    id: number;
    username: string; // added to align with backend and profile editing
    email: string;
    first_name: string;
    last_name: string;
    role: 'admin' | 'teacher' | 'student';
    created_at: string;
    // Password policy fields (may be undefined depending on endpoint)
    must_change_password?: number | boolean;
    password_expires_at?: string | null;
    force_password_change?: boolean;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    updateProfile: (profileData: Partial<User>) => Promise<{ success: boolean; error?: string }>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
    apiCall: (endpoint: string, options?: RequestInit) => Promise<Response>;
    verifyToken: () => Promise<boolean>;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isTeacher: boolean;
    isStudent: boolean;
    isForcePasswordChange: boolean;
    requestEmailChange: (newEmail: string) => Promise<{ success: boolean; error?: string; expiresAt?: string; attemptsLeft?: number; status?: number }>;
    verifyEmailChange: (code: string) => Promise<{ success: boolean; error?: string; user?: User; attemptsLeft?: number }>;
    resendEmailChange: () => Promise<{ success: boolean; error?: string; expiresAt?: string; attemptsLeft?: number }>;
    // Password reset additions
    requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string; expiresAt?: string; attemptsLeft?: number }>;
    verifyPasswordReset: (email: string, code: string) => Promise<{ success: boolean; error?: string; token?: string; resetExpiresAt?: string; attemptsLeft?: number }>;
    completePasswordReset: (email: string, token: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
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

    const login = async (email: string, password: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                setToken(data.token);
                setUser(data.user);
                message.success('Login successful!');
                return { success: true };
            } else {
                message.error(data.error || 'Login failed');
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('Login error:', error);
            message.error('Network error. Please try again.');
            return { success: false, error: 'Network error' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
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
                setUser(data.user);
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

    // Helper function to make authenticated API calls
    const apiCall = async (endpoint: string, options: RequestInit = {}) => {
        // First verify token is still valid
        const isTokenValid = await verifyToken();
        if (!isTokenValid) {
            // If token is invalid, throw an error to be handled by the component
            throw new Error('Authentication token is invalid or expired.');
        }

        // Normalize possible Headers instance to plain object to avoid merge issues
        const normalizedHeaders = options && (options as any).headers instanceof Headers
            ? Object.fromEntries(((options as any).headers as Headers).entries())
            : ((options as any)?.headers || {});

        const config: RequestInit = {
            ...(options as RequestInit),
            headers: {
                'Content-Type': 'application/json',
                ...normalizedHeaders,
                // Ensure Authorization is ALWAYS present and cannot be overridden
                'Authorization': `Bearer ${token}`,
            },
        };

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
                setUser(data.user);
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

    // Password reset flows (public endpoints, do not use apiCall)
    const requestPasswordReset = async (email: string) => {
        try {
            const resp = await fetch(`${API_BASE_URL}/password-reset/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await resp.json();
            if (resp.ok) {
                message.success('If an account exists, a code has been sent to your email.');
                return { success: true, expiresAt: data.expiresAt, attemptsLeft: data.attemptsLeft };
            } else {
                // Still show success-like message to avoid enumeration
                message.success('If an account exists, a code has been sent to your email.');
                return { success: false, error: data.error };
            }
        } catch (e) {
            console.error('requestPasswordReset error', e);
            message.error('Network error. Please try again.');
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
            const data = await resp.json();
            if (resp.ok) {
                message.success('Code verified. You can now set a new password.');
                return { success: true, token: data.token, resetExpiresAt: data.resetExpiresAt };
            } else {
                if (typeof data.attemptsLeft === 'number') {
                    message.error(`${data.error || 'Invalid code'}. Attempts left: ${data.attemptsLeft}`);
                } else {
                    message.error(data.error || 'Verification failed');
                }
                return { success: false, error: data.error, attemptsLeft: data.attemptsLeft } as any;
            }
        } catch (e) {
            console.error('verifyPasswordReset error', e);
            message.error('Network error. Please try again.');
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
            const data = await resp.json();
            if (resp.ok) {
                message.success('Your password has been reset. You can now sign in.');
                return { success: true };
            } else {
                message.error(data.error || 'Could not reset password');
                return { success: false, error: data.error };
            }
        } catch (e) {
            console.error('completePasswordReset error', e);
            message.error('Network error. Please try again.');
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
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'admin',
        isTeacher: user?.role === 'teacher',
        isStudent: user?.role === 'student',
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