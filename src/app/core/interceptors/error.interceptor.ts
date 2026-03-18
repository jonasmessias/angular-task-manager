import { HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { ToastService } from '@shared/services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error) => {
      const status: number = error.status;

      // status 0 = network error / API offline
      if (status === 0) {
        toast.error('Unable to reach the server. Please check your connection or try again later.');
        return throwError(() => error);
      }

      if (
        status === HttpStatusCode.ServiceUnavailable ||
        status === HttpStatusCode.GatewayTimeout
      ) {
        toast.error('The server is temporarily unavailable. Please try again in a moment.');
        return throwError(() => error);
      }

      if (status >= 500) {
        toast.error('An unexpected server error occurred. Please try again later.');
        return throwError(() => error);
      }

      return throwError(() => error);
    }),
  );
};
