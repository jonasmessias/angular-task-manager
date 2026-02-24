import { environment } from '../../../environments/environment';

const API_BASE = `${environment.apiUrl}/api/${environment.apiVersion}`;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE}/auth/login`,
    REGISTER: `${API_BASE}/auth/register`,
    LOGOUT: `${API_BASE}/auth/logout`,
    FORGOT_PASSWORD: `${API_BASE}/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE}/auth/reset-password`,
    ME: `${API_BASE}/auth/me`,
  },
  TASKS: {
    BASE: `${API_BASE}/tasks`,
    BY_ID: (id: string) => `${API_BASE}/tasks/${id}`,
    BY_STATUS: (status: string) => `${API_BASE}/tasks?status=${status}`,
    BY_PRIORITY: (priority: string) => `${API_BASE}/tasks?priority=${priority}`,
  },
  HOME: {
    STATS: `${API_BASE}/dashboard/stats`,
    RECENT_ACTIVITIES: `${API_BASE}/dashboard/activities`,
  },
} as const;
