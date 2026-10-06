import React, { createContext, useContext, useState, useEffect } from 'react';
import { buildApiUrl } from '../config/api';

export interface User {
  id: number;
  name: string;
  email: string;
  target_field: string;
  target_role: string;
  google_id?: string;
  avatar_url?: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string, target_field?: string, target_role?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (credential: string, target_field?: string, target_role?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  profileModalOpen: boolean;
  setProfileModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem('smarthire_user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('smarthire_token') || null;
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Sync auth state to localStorage
  // Sync auth state to localStorage (sync both smarthire_token and token keys)
  useEffect(() => {
    if (token) {
      localStorage.setItem('smarthire_token', token);
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('smarthire_token');
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('smarthire_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('smarthire_user');
    }
  }, [user]);

  // Check token validity on mount
  // Check token validity on mount (clears expired tokens gracefully)
  useEffect(() => {
    if (token) {
      fetch(buildApiUrl('/api/auth/me'), {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error('Token invalid or expired');
          return res.json();
        })
        .then(data => {
          if (data.user) setUser(data.user);
        })
        .catch(() => {
          // Token expired or invalid
          setToken(null);
          setUser(null);
          localStorage.removeItem('smarthire_token');
          localStorage.removeItem('token');
          localStorage.removeItem('smarthire_user');
        });
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(buildApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Authentication failed' };
      }
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Unable to connect to authentication server' };
    }
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    target_field = 'it',
    target_role = 'Frontend Developer'
  ) => {
    try {
      const res = await fetch(buildApiUrl('/api/auth/signup'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, target_field, target_role })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Unable to connect to authentication server' };
    }
  };

  const loginWithGoogle = async (
    credential: string,
    target_field = 'it',
    target_role = 'Frontend Developer'
  ) => {
    try {
      const res = await fetch(buildApiUrl('/api/auth/google'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential, target_field, target_role }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Google authentication failed' };
      }
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Unable to connect to authentication server' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('smarthire_token');
    localStorage.removeItem('token');
    localStorage.removeItem('smarthire_user');
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (!token) return;
    try {
      const res = await fetch(buildApiUrl('/api/profile'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const resData = await res.json();
        setUser(resData.user);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        login,
        signup,
        loginWithGoogle,
        logout,
        updateUserProfile,
        authModalOpen,
        setAuthModalOpen,
        profileModalOpen,
        setProfileModalOpen
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

