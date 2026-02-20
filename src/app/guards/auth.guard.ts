import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';

// Guard unificado que implementa a lógica de middleware
export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const path = state.url;

  // Se estiver na rota /login e já estiver autenticado, redireciona para início
  if (path === '/login' && auth.isAuthenticated) {
    return router.createUrlTree(['/']);
  }

  // Se for rota pública, permite acesso
  if (auth.isPublicRoute(path)) {
    return true;
  }

  // Se não tiver token, redireciona para login
  if (!auth.isAuthenticated) {
    return router.createUrlTree(['/login']);
  }

  // Verifica se a rota é privada e permite acesso
  if (auth.isPrivateRoute(path)) {
    return true;
  }

  // Redireciona para home se nenhuma condição anterior for atendida
  return router.createUrlTree(['/']);
};
