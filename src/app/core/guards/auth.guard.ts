import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const path = state.url;

  if (path === '/login' && auth.isAuthenticated) {
    return router.createUrlTree(['/']);
  }

  if (auth.isPublicRoute(path)) {
    return true;
  }

  if (!auth.isAuthenticated) {
    return router.createUrlTree(['/login']);
  }

  if (auth.isPrivateRoute(path)) {
    return true;
  }

  return router.createUrlTree(['/']);
};
