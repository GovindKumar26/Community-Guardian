import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { authAPI } from '../services/api';
import { AuthContext } from './AuthContextBase';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('cg_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  // Verify auth on mount via HTTP-Only cookie
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const res = await authAPI.getProfile();
        setUser(res.data.user);
        localStorage.setItem('cg_user', JSON.stringify(res.data.user));
      } catch {
        // Cookie missing or invalid — clear user state
        localStorage.removeItem('cg_user');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    verifyAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authAPI.login({ email, password });
    const { user: newUser } = res.data;
    localStorage.setItem('cg_user', JSON.stringify(newUser));
    setUser(newUser);
  };

  const register = async (data: {
    name: string; email: string; password: string;
    selectedArea: string; preferences: string[];
    confirm_password_real?: string;
  }) => {
    const res = await authAPI.register(data);
    const { user: newUser } = res.data;
    localStorage.setItem('cg_user', JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // proceed with local cleanup even if API fails
    } finally {
      localStorage.removeItem('cg_user');
      setUser(null);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('cg_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
