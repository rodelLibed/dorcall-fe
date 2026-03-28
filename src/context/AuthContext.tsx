import React, { createContext, useContext, useState, useCallback } from 'react';
import { getToken, removeToken } from '../helpers/token';

export interface SipData {
  psAuth: {
    id: string;
    authType: string;
    username: string;
  };
  psEndpoint: {
    id: string;
    transport: string;
    context: string;
    disallow: string;
    allow: string;
    auth: string;
    aors: string;
  } | null;
  psAor: {
    id: string;
    maxContacts: string;
  } | null;
}

export interface UserInfo {
  id: string;
  username: string;
  role: 'agent' | 'admin';
  sipData?: SipData;
}

interface AuthContextType {
  user: UserInfo | null;
  isAuthenticated: boolean;
  setUser: (user: UserInfo) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<UserInfo | null>(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  });

  const isAuthenticated = !!user && !!getToken();

  const setUser = useCallback((userInfo: UserInfo) => {
    localStorage.setItem('user', JSON.stringify(userInfo));
    setUserState(userInfo);
  }, []);

  const logout = useCallback(() => {
    removeToken();
    localStorage.removeItem('user');
    setUserState(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
