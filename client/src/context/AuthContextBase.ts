import { createContext } from 'react';
import type { User } from '../types';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string; email: string; password: string;
    selectedArea: string; preferences: string[];
    confirm_password_real?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
