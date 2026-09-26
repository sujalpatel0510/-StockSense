import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (payload: { email: string; password: string; fullName: string; role?: string }) => Promise<void>;
  googleLogin: (credentialOrDemo?: { credential?: string; email?: string; name?: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('stocksense_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const setAuthData = (newToken: string, newUser: User) => {
    localStorage.setItem('stocksense_token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const refreshUser = async () => {
    const savedToken = localStorage.getItem('stocksense_token');
    if (!savedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.getCurrentUser();
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        logout();
      }
    } catch (err) {
      console.warn('Failed to verify token, logging out:', err);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login({ email, password: pass });
    if (res.success && res.token) {
      setAuthData(res.token, res.user);
    }
  };

  const register = async (payload: { email: string; password: string; fullName: string; role?: string }) => {
    const res = await api.register(payload);
    if (res.success && res.token) {
      setAuthData(res.token, res.user);
    }
  };

  const googleLogin = async (credentialOrDemo?: { credential?: string; email?: string; name?: string }) => {
    const res = await api.googleAuth(
      credentialOrDemo || {
        email: 'sujal.google@stocksense.demo',
        name: 'Sujal (Google User)',
      }
    );
    if (res.success && res.token) {
      setAuthData(res.token, res.user);
    }
  };

  const logout = () => {
    localStorage.removeItem('stocksense_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        googleLogin,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
