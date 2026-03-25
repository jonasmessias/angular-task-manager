import { HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { API_ERROR_CODES } from '../constants/api-error-codes.const';
import { AuthService } from '../services/auth.service';

const AUTH_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/google',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/auth/resend-verification',
];

const isAuthRoute = (url: string) => AUTH_ROUTES.some((route) => url.includes(route));

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.token;

  const authenticatedReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authenticatedReq).pipe(
    catchError((error) => {
      const code: string | undefined = error.error?.code;

      // Email not verified: clear session and redirect to verify-email page
      if (code === API_ERROR_CODES.EMAIL_NOT_VERIFIED) {
        authService.clearSession();
        router.navigate(['/verify-email']);
        return throwError(() => error);
      }

      if (error.status === HttpStatusCode.Unauthorized && !isAuthRoute(req.url)) {
        return authService.refreshToken().pipe(
          switchMap((response) => {
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${response.accessToken}` },
            });
            return next(retryReq);
          }),
          catchError((refreshError) => {
            authService.clearSessionAndRedirect();
            return throwError(() => refreshError);
          }),
        );
      }

      return throwError(() => error);
    }),
  );
};
