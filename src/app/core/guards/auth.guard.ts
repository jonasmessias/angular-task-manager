import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Protege rotas privadas: redireciona para /login se não autenticado
export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject(AuthService);

  if (!auth.isAuthenticated) {
    return router.createUrlTree(['/login']);
  }

  return true;
};

// Protege rotas públicas: redireciona para / se já estiver autenticado
export const guestGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject(AuthService);

  if (auth.isAuthenticated) {
    return router.createUrlTree(['/']);
  }

  return true;
};

// Rota fallback (**): redireciona com base no estado de autenticação
export const redirectGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject(AuthService);

  if (auth.isAuthenticated) {
    return router.createUrlTree(['/']);
  }

  return router.createUrlTree(['/login']);
};
