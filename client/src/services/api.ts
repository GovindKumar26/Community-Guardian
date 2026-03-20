import axios from 'axios';
import type {
  AlertsResponse, Alert, AlertCreateResponse, AlertStats,
  AuthResponse, User, SafeCircle, DigestResponse, VouchResponse
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Send HTTP-Only cookies automatically
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('cg_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authAPI = {
  register: (data: {
    name: string; email: string; password: string;
    selectedArea: string; preferences: string[];
    confirm_password_real?: string;
  }) => api.post<AuthResponse>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),

  logout: () => api.post<{ message: string }>('/auth/logout'),

  getProfile: () => api.get<{ user: User }>('/auth/me'),

  updateProfile: (data: Partial<{ name: string; selectedArea: string; preferences: string[] }>) =>
    api.put<{ message: string; user: User }>('/auth/me', data),
};

// ─── Alerts ───────────────────────────────────────────────────────────────────

export const alertsAPI = {
  getAll: (params?: Record<string, string>) =>
    api.get<AlertsResponse>('/alerts', { params }),

  getById: (id: string) =>
    api.get<{ alert: Alert }>(`/alerts/${id}`),

  create: (data: {
    title: string; description: string; category: string;
    location: string; severity: string;
  }) => api.post<AlertCreateResponse>('/alerts', data),

  update: (id: string, data: Record<string, string>) =>
    api.put<{ message: string; alert: Alert }>(`/alerts/${id}`, data),

  getStats: (location?: string) =>
    api.get<{ stats: AlertStats }>('/alerts/stats/overview', {
      params: location ? { location } : {}
    }),

  verify: (id: string) =>
    api.post<VouchResponse>(`/alerts/${id}/verify`),

  flag: (id: string) =>
    api.post<VouchResponse>(`/alerts/${id}/flag`),
};

// ─── Digest ───────────────────────────────────────────────────────────────────

export const digestAPI = {
  generate: () => api.post<DigestResponse>('/digest'),
};

// ─── Safe Circles ─────────────────────────────────────────────────────────────

export const circlesAPI = {
  getAll: () => api.get<{ circles: SafeCircle[] }>('/circles'),

  getById: (id: string) => api.get<{ circle: SafeCircle }>(`/circles/${id}`),

  create: (data: { name: string; memberEmails: string[] }) =>
    api.post<{ message: string; circle: SafeCircle }>('/circles', data),

  sendMessage: (circleId: string, data: { content: string; isEmergency: boolean }) =>
    api.post<{ message: string; sentMessage: any }>(`/circles/${circleId}/messages`, data),

  addMember: (circleId: string, email: string) =>
    api.post<{ message: string; member: any }>(`/circles/${circleId}/members`, { email }),
};

export default api;
