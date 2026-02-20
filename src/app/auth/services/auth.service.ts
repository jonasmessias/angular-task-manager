import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import type { AuthResponse, LoginDto, RegisterDto, User } from 'src/app/auth/models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  login(dto: LoginDto): Observable<AuthResponse> {
    throw new Error('Not implemented');
  }

  register(dto: RegisterDto): Observable<AuthResponse> {
    throw new Error('Not implemented');
  }

  logout(): void {
    throw new Error('Not implemented');
  }

  forgotPassword(email: string): Observable<{ success: boolean }> {
    throw new Error('Not implemented');
  }

  resetPassword(token: string, newPassword: string): Observable<{ success: boolean }> {
    throw new Error('Not implemented');
  }

  get isAuthenticated(): boolean {
    throw new Error('Not implemented');
  }

  get currentUser(): User | null {
    throw new Error('Not implemented');
  }

  get token(): string | null {
    throw new Error('Not implemented');
  }

  isPublicRoute(path: string): boolean {
    const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
    return publicRoutes.some((route) => path.startsWith(route));
  }

  isPrivateRoute(path: string): boolean {
    const privateRoutes = ['/', '/tasks'];
    return privateRoutes.some((route) => path.startsWith(route));
  }
}
