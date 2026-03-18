export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
}

// ── User DTOs ────────────────────────────────────────────────────────────────

export interface UpdateProfileDto {
  name?: string;
  username?: string;
}

// ── Auth DTOs ────────────────────────────────────────────────────────────────

export interface LoginDto {
  emailOrUsername: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface VerifyEmailDto {
  token: string;
}

export interface ResendVerificationDto {
  email: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface LogoutDto {
  refreshToken: string;
}

// ── Auth Responses ───────────────────────────────────────────────────────────

export interface AuthResponse {
  name: string;
  accessToken: string;
  refreshToken: string;
}
