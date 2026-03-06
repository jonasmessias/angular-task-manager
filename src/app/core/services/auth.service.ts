import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, of, switchMap, tap } from 'rxjs';
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

  private readonly accessTokenSignal = signal<string | null>(
    localStorage.getItem(StorageKeys.ACCESS_TOKEN),
  );

  private readonly userSignal = signal<User | null>(null);

  init(): Observable<User | null> {
    if (!this.accessTokenSignal()) {
      return of(null);
    }

    return this.getProfile().pipe(
      catchError(() =>
        this.refreshToken().pipe(
          switchMap(() => this.getProfile()),
          catchError(() => {
            this.clearSession();
            return of(null);
          }),
        ),
      ),
    );
  }

  login(dto: LoginDto): Observable<User> {
    return this.http.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, dto).pipe(
      tap((response) => this.saveSession(response)),
      switchMap(() => this.getProfile()),
    );
  }

  register(dto: RegisterDto): Observable<User> {
    return this.http.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, dto).pipe(
      tap((response) => this.saveSession(response)),
      switchMap(() => this.getProfile()),
    );
  }

  logout(): void {
    const refreshToken = localStorage.getItem(StorageKeys.REFRESH_TOKEN);

    if (refreshToken) {
      this.http.post(API_ENDPOINTS.AUTH.LOGOUT, { refreshToken }).subscribe();
    }

    this.clearSessionAndRedirect();
  }

  clearSessionAndRedirect(): void {
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
    return this.http.get<User>(API_ENDPOINTS.USERS.ME).pipe(tap((user) => this.saveUser(user)));
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

  private saveSession(response: AuthResponse): void {
    this.accessTokenSignal.set(response.accessToken);
    localStorage.setItem(StorageKeys.ACCESS_TOKEN, response.accessToken);
    localStorage.setItem(StorageKeys.REFRESH_TOKEN, response.refreshToken);
  }

  private saveUser(user: User): void {
    this.userSignal.set(user);
  }

  private clearSession(): void {
    this.accessTokenSignal.set(null);
    this.userSignal.set(null);
    localStorage.removeItem(StorageKeys.ACCESS_TOKEN);
    localStorage.removeItem(StorageKeys.REFRESH_TOKEN);
  }
}
