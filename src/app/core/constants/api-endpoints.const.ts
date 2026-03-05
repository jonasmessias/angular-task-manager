import { environment } from '../../../environments/environment';

const API_BASE = environment.apiUrl;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE}/auth/login`,
    REGISTER: `${API_BASE}/auth/register`,
    LOGOUT: `${API_BASE}/auth/logout`,
    LOGOUT_ALL: `${API_BASE}/auth/logout-all`,
    REFRESH_TOKEN: `${API_BASE}/auth/refresh`,
    FORGOT_PASSWORD: `${API_BASE}/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE}/auth/reset-password`,
  },
  USERS: {
    ME: `${API_BASE}/users/me`,
    BY_ID: (id: string) => `${API_BASE}/users/${id}`,
    ALL: `${API_BASE}/users`,
  },
  WORKSPACES: {
    ALL: `${API_BASE}/workspaces`,
    BY_ID: (id: string) => `${API_BASE}/workspaces/${id}`,
  },
  BOARDS: {
    ALL: `${API_BASE}/boards`,
    BY_ID: (id: string) => `${API_BASE}/boards/${id}`,
    LISTS: (boardId: string) => `${API_BASE}/boards/${boardId}/lists`,
    LIST_BY_ID: (boardId: string, listId: string) =>
      `${API_BASE}/boards/${boardId}/lists/${listId}`,
    CARDS: (boardId: string, listId: string) =>
      `${API_BASE}/boards/${boardId}/lists/${listId}/cards`,
    CARD_BY_ID: (boardId: string, listId: string, cardId: string) =>
      `${API_BASE}/boards/${boardId}/lists/${listId}/cards/${cardId}`,
  },
} as const;
