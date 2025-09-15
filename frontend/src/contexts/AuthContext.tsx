import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { message } from 'antd';

interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: 'admin' | 'teacher' | 'student';
    created_at: string;
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

    const login = async (email, password) => {
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

    const updateProfile = async (profileData) => {
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

    const changePassword = async (currentPassword, newPassword) => {
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
    const apiCall = async (endpoint, options = {}) => {
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

        console.log('apiCall - Token:', token);
        console.log('apiCall - Config:', config);

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
            return response;
        } catch (error) {
            throw error;
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
        isStudent: user?.role === 'student'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};