import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, of, switchMap, tap } from 'rxjs';
import type {
  AuthResponse,
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResendVerificationDto,
  ResetPasswordDto,
  UpdateProfileDto,
  User,
  VerifyEmailDto,
} from '../../features/auth/models/auth.model';
import { API_ENDPOINTS } from '../constants/api-endpoints.const';
import { StorageKeys } from '../enums/storage-keys.enum';
import { BoardService } from './board.service';
import { WorkspaceService } from './workspace.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly workspaceService = inject(WorkspaceService);
  private readonly boardService = inject(BoardService);

  private readonly _accessToken = signal<string | null>(
    localStorage.getItem(StorageKeys.ACCESS_TOKEN),
  );

  private readonly _currentUser = signal<User | null>(null);

  readonly isAuthenticated = computed(() => this._accessToken() !== null);
  readonly currentUser = this._currentUser.asReadonly();

  get token(): string | null {
    return this._accessToken();
  }

  init(): Observable<User | null> {
    if (!this._accessToken()) {
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
      catchError(() => of(null)),
    );
  }

  login(dto: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, dto).pipe(
      tap((response) => this.saveSession(response)),
      switchMap((response) => this.getProfile().pipe(switchMap(() => of(response)))),
    );
  }

  register(dto: RegisterDto): Observable<void> {
    return this.http
      .post(API_ENDPOINTS.AUTH.REGISTER, dto, { responseType: 'text' })
      .pipe(switchMap(() => of(undefined as void)));
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
    this.workspaceService.clearState();
    this.boardService.clearState();
    this.router.navigate(['/login']);
  }

  clearSession(): void {
    this._accessToken.set(null);
    this._currentUser.set(null);
    localStorage.removeItem(StorageKeys.ACCESS_TOKEN);
    localStorage.removeItem(StorageKeys.REFRESH_TOKEN);
  }

  forgotPassword(dto: ForgotPasswordDto): Observable<void> {
    return this.http.post<void>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, dto);
  }

  resetPassword(dto: ResetPasswordDto): Observable<void> {
    return this.http.post<void>(API_ENDPOINTS.AUTH.RESET_PASSWORD, dto);
  }

  verifyEmail(dto: VerifyEmailDto): Observable<void> {
    return this.http
      .post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, dto, { responseType: 'text' })
      .pipe(switchMap(() => of(undefined as void)));
  }

  resendVerification(dto: ResendVerificationDto): Observable<void> {
    return this.http
      .post(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, dto, { responseType: 'text' })
      .pipe(switchMap(() => of(undefined as void)));
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem(StorageKeys.REFRESH_TOKEN);
    return this.http
      .post<AuthResponse>(API_ENDPOINTS.AUTH.REFRESH_TOKEN, { refreshToken })
      .pipe(tap((response) => this.saveSession(response)));
  }

  getProfile(): Observable<User> {
    return this.http
      .get<User>(API_ENDPOINTS.USERS.ME)
      .pipe(tap((user) => this._currentUser.set(user)));
  }

  updateProfile(dto: UpdateProfileDto): Observable<User> {
    return this.http
      .put<User>(API_ENDPOINTS.USERS.ME, dto)
      .pipe(tap((user) => this._currentUser.set(user)));
  }

  deleteAccount(): Observable<void> {
    return this.http
      .delete<void>(API_ENDPOINTS.USERS.ME)
      .pipe(tap(() => this.clearSessionAndRedirect()));
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(API_ENDPOINTS.USERS.BY_ID(id));
  }

  private saveSession(response: AuthResponse): void {
    this._accessToken.set(response.accessToken);
    localStorage.setItem(StorageKeys.ACCESS_TOKEN, response.accessToken);
    localStorage.setItem(StorageKeys.REFRESH_TOKEN, response.refreshToken);
  }
}
