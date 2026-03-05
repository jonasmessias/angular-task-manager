import { environment } from '../../../environments/environment';

const API_BASE = `${environment.apiUrl}/api`;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE}/auth/login`,
    REGISTER: `${API_BASE}/auth/register`,
    LOGOUT: `${API_BASE}/auth/logout`,
    REFRESH_TOKEN: `${API_BASE}/auth/refresh`,
    FORGOT_PASSWORD: `${API_BASE}/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE}/auth/reset-password`,
  },
  USERS: {
    PROFILE: `${API_BASE}/users/profile`,
  },
} as const;
