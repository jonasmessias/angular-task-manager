import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import type {
  AuthResponse,
  LoginDto,
  RegisterDto,
  User,
} from '../../features/auth/models/auth.model';
import { API_ENDPOINTS } from '../constants/api-endpoints.const';
import { StorageKeys } from '../enums/storage-keys.enum';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly userSignal = signal<User | null>(null);
  private readonly tokenSignal = signal<string | null>(null);

  login(dto: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, dto).pipe(
      tap((response) => {
        this.tokenSignal.set(response.token);
        this.userSignal.set(response.user);
        localStorage.setItem(StorageKeys.AUTH_TOKEN, response.token);
        localStorage.setItem(StorageKeys.USER_DATA, JSON.stringify(response.user));
      }),
    );
  }

  register(dto: RegisterDto): Observable<AuthResponse> {
    throw new Error('Not implemented');
  }

  forgotPassword(email: string): Observable<{ success: boolean }> {
    throw new Error('Not implemented');
  }

  resetPassword(token: string, newPassword: string): Observable<{ success: boolean }> {
    throw new Error('Not implemented');
  }

  get isAuthenticated(): boolean {
    return this.tokenSignal() !== null;
  }

  get currentUser(): User | null {
    return this.userSignal();
  }

  get token(): string | null {
    return this.tokenSignal();
  }

  isPublicRoute(path: string): boolean {
    const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
    return publicRoutes.some((route) => path.startsWith(route));
  }

  isPrivateRoute(path: string): boolean {
    return !this.isPublicRoute(path);
  }
}
