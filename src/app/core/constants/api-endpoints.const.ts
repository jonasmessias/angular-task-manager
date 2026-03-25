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
    GOOGLE: `${BASE}/auth/google`,
  },

  USERS: {
    ALL: `${BASE}/users`,
    ME: `${BASE}/users/me`,
    AVATAR: `${BASE}/users/me/avatar`,
    BY_ID: (id: string) => `${BASE}/users/${id}`,
  },

  WORKSPACES: {
    ALL: `${BASE}/workspaces`,
    BY_ID: (id: string) => `${BASE}/workspaces/${id}`,
    COVER: (id: string) => `${BASE}/workspaces/${id}/cover`,
    MEMBERS: (id: string) => `${BASE}/workspaces/${id}/members`,
    MEMBER: (id: string, userId: string) => `${BASE}/workspaces/${id}/members/${userId}`,
  },

  BOARDS: {
    ALL: `${BASE}/boards`,
    BY_ID: (id: string) => `${BASE}/boards/${id}`,
    COVER: (id: string) => `${BASE}/boards/${id}/cover`,
    MEMBERS: (id: string) => `${BASE}/boards/${id}/members`,
    MEMBER: (id: string, userId: string) => `${BASE}/boards/${id}/members/${userId}`,
  },

  LISTS: {
    ALL: (boardId: string) => `${BASE}/boards/${boardId}/lists`,
    BY_ID: (boardId: string, listId: string) => `${BASE}/boards/${boardId}/lists/${listId}`,
  },

  CARDS: {
    ALL: (boardId: string, listId: string) => `${BASE}/boards/${boardId}/lists/${listId}/cards`,
    BY_ID: (boardId: string, listId: string, cardId: string) =>
      `${BASE}/boards/${boardId}/lists/${listId}/cards/${cardId}`,
    MOVE: (boardId: string, listId: string, cardId: string) =>
      `${BASE}/boards/${boardId}/lists/${listId}/cards/${cardId}/move`,
  },

  ATTACHMENTS: {
    REQUEST_UPLOAD: (cardId: string) => `${BASE}/cards/${cardId}/attachments/request-upload`,
    CONFIRM: (cardId: string) => `${BASE}/cards/${cardId}/attachments/confirm`,
    ALL: (cardId: string) => `${BASE}/cards/${cardId}/attachments`,
    BY_ID: (cardId: string, attachmentId: string) =>
      `${BASE}/cards/${cardId}/attachments/${attachmentId}`,
  },

  STORAGE: {
    UPLOAD: `${BASE}/storage/upload`,
    PRESIGNED_UPLOAD: `${BASE}/storage/presigned-upload`,
    DELETE: `${BASE}/storage`,
  },
} as const;
