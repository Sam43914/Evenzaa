import React, { createContext, useContext, useState } from 'react';
import { AuthState, User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>(() => {
    try {
      const saved = localStorage.getItem('evenza_auth');
      return saved ? JSON.parse(saved) : { user: null, token: null };
    } catch {
      return { user: null, token: null };
    }
  });

  const login = (token: string, user: User) => {
    const newAuth = { token, user };
    setAuth(newAuth);
    localStorage.setItem('evenza_auth', JSON.stringify(newAuth));
  };

  const logout = () => {
    setAuth({ user: null, token: null });
    localStorage.removeItem('evenza_auth');
    // Also clear old key if it exists
    localStorage.removeItem('auth');
  };

  return (
    <AuthContext.Provider value={{
      user: auth.user,
      token: auth.token,
      login,
      logout,
      isAuthenticated: !!auth.token,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
