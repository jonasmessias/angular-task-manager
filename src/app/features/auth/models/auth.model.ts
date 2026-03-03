export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUEST = 'GUEST',
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
