import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import type {
  AuthResponse,
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  User,
} from '../../features/auth/models/auth.model';
import { API_ENDPOINTS } from '../constants/api-endpoints.const';
import { StorageKeys } from '../enums/storage-keys.enum';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly userSignal = signal<User | null>(null);
  private readonly accessTokenSignal = signal<string | null>(
    localStorage.getItem(StorageKeys.ACCESS_TOKEN),
  );

  login(dto: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, dto).pipe(
      tap((response) => this.saveSession(response)),
    );
  }

  register(dto: RegisterDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, dto).pipe(
      tap((response) => this.saveSession(response)),
    );
  }

  logout(): void {
    const refreshToken = localStorage.getItem(StorageKeys.REFRESH_TOKEN);

    if (refreshToken) {
      this.http.post(API_ENDPOINTS.AUTH.LOGOUT, { refreshToken }).subscribe();
    }

    this.clearSession();
    this.router.navigate(['/login']);
  }

  forgotPassword(dto: ForgotPasswordDto): Observable<void> {
    return this.http.post<void>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, dto);
  }

  resetPassword(dto: ResetPasswordDto): Observable<void> {
    return this.http.post<void>(API_ENDPOINTS.AUTH.RESET_PASSWORD, dto);
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem(StorageKeys.REFRESH_TOKEN);

    return this.http
      .post<AuthResponse>(API_ENDPOINTS.AUTH.REFRESH_TOKEN, { refreshToken })
      .pipe(tap((response) => this.saveSession(response)));
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(API_ENDPOINTS.USERS.PROFILE).pipe(
      tap((user) => this.userSignal.set(user)),
    );
  }

  get isAuthenticated(): boolean {
    return this.accessTokenSignal() !== null;
  }

  get currentUser(): User | null {
    return this.userSignal();
  }

  get token(): string | null {
    return this.accessTokenSignal();
  }

  isPublicRoute(path: string): boolean {
    const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
    return publicRoutes.some((route) => path.startsWith(route));
  }

  isPrivateRoute(path: string): boolean {
    return !this.isPublicRoute(path);
  }

  private saveSession(response: AuthResponse): void {
    this.accessTokenSignal.set(response.accessToken);
    localStorage.setItem(StorageKeys.ACCESS_TOKEN, response.accessToken);
    localStorage.setItem(StorageKeys.REFRESH_TOKEN, response.refreshToken);
  }

  private clearSession(): void {
    this.accessTokenSignal.set(null);
    this.userSignal.set(null);
    localStorage.removeItem(StorageKeys.ACCESS_TOKEN);
    localStorage.removeItem(StorageKeys.REFRESH_TOKEN);
    localStorage.removeItem(StorageKeys.USER_DATA);
  }
}
