import { environment } from '../../../environments/environment';

const BASE = environment.apiUrl;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${BASE}/auth/login`,
    REGISTER: `${BASE}/auth/register`,
    LOGOUT: `${BASE}/auth/logout`,
    LOGOUT_ALL: `${BASE}/auth/logout-all`,
    REFRESH_TOKEN: `${BASE}/auth/refresh`,
    FORGOT_PASSWORD: `${BASE}/auth/forgot-password`,
    RESET_PASSWORD: `${BASE}/auth/reset-password`,
    VERIFY_EMAIL: `${BASE}/auth/verify-email`,
    RESEND_VERIFICATION: `${BASE}/auth/resend-verification`,
  },

  USERS: {
    ALL: `${BASE}/users`,
    ME: `${BASE}/users/me`,
    BY_ID: (id: string) => `${BASE}/users/${id}`,
  },

  WORKSPACES: {
    ALL: `${BASE}/workspaces`,
    BY_ID: (id: string) => `${BASE}/workspaces/${id}`,
  },

  BOARDS: {
    ALL: `${BASE}/boards`,
    BY_ID: (id: string) => `${BASE}/boards/${id}`,
  },

  LISTS: {
    ALL: (boardId: string) => `${BASE}/boards/${boardId}/lists`,
    BY_ID: (boardId: string, listId: string) => `${BASE}/boards/${boardId}/lists/${listId}`,
  },

  CARDS: {
    ALL: (boardId: string, listId: string) => `${BASE}/boards/${boardId}/lists/${listId}/cards`,
    BY_ID: (boardId: string, listId: string, cardId: string) =>
      `${BASE}/boards/${boardId}/lists/${listId}/cards/${cardId}`,
  },
} as const;
