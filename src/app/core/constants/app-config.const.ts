export const APP_CONFIG = {
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
  },
  FILE_UPLOAD: {
    MAX_SIZE_MB: 5,
    ALLOWED_EXTENSIONS: ['jpg', 'jpeg', 'png', 'gif', 'pdf'],
  },
  TIMEOUTS: {
    API_REQUEST_MS: 30000,
    DEBOUNCE_MS: 300,
    TOAST_DURATION_MS: 3000,
  },
  VALIDATION: {
    PASSWORD_MIN_LENGTH: 8,
    TITLE_MIN_LENGTH: 3,
    DESCRIPTION_MIN_LENGTH: 10,
  },
} as const;
