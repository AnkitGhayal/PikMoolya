import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export type UserRole = 'FARMER' | 'BUYER' | 'ADMIN' | 'LOGISTICS_PARTNER';

export interface User {
  id: string;
  phone?: string;
  email?: string;
  role: UserRole;
  status: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (phone: string, password: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (token) {
      api.get('/auth/me')
        .then((res) => {
          setUser(res.data.user);
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (phone: string, password: string) => {
    const res = await api.post('/auth/login', { phone, password });
    const jwt = res.data.accessToken || res.data.token;
    if (!jwt) throw new Error('JWT token not returned by server');
    localStorage.setItem('token', jwt);
    setToken(jwt);

    const meRes = await api.get('/auth/me');
    setUser(meRes.data.user);
  };

  const register = async (payload: any) => {
    await api.post('/auth/register', payload);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
