import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject(AuthService);

  if (!auth.isAuthenticated) {
    return router.createUrlTree(['/login']);
  }

  return true;
};

export const guestGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject(AuthService);

  if (auth.isAuthenticated) {
    return router.createUrlTree(['/']);
  }

  return true;
};

export const redirectGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject(AuthService);

  if (auth.isAuthenticated) {
    return router.createUrlTree(['/']);
  }

  return router.createUrlTree(['/login']);
};
