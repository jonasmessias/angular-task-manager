import { environment } from '../../../environments/environment';

const API_BASE = `${environment.apiUrl}`;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE}/auth/login`,
    LOGOUT: `${API_BASE}/auth/logout`,
    LOGOUT_ALL: `${API_BASE}/auth/logout-all`,
    REFRESH_TOKEN: `${API_BASE}/auth/refresh`,
    REGISTER: `${API_BASE}/auth/register`,
    FORGOT_PASSWORD: `${API_BASE}/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE}/auth/reset-password`,
  },
  USER: `${API_BASE}/user`,
} as const;
