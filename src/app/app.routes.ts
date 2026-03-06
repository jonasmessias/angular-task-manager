import { Routes } from '@angular/router';
import { authGuard, guestGuard, redirectGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // ── Rotas públicas (layout com split-screen) ──────────────────────────────
  {
    path: '',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./layouts/public/public.layout').then((m) => m.PublicLayoutComponent),
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login-page/login-page.component').then(
            (m) => m.LoginPageComponent,
          ),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register-page/register-page.component').then(
            (m) => m.RegisterPageComponent,
          ),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./features/auth/forgot-password-page/forgot-password-page.component').then(
            (m) => m.ForgotPasswordPageComponent,
          ),
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./features/auth/reset-password-page/reset-password-page.component').then(
            (m) => m.ResetPasswordPageComponent,
          ),
      },
    ],
  },

  // ── Rotas privadas (layout com navbar + sidebar) ──────────────────────────
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layouts/private/private.layout').then((m) => m.PrivateLayoutComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
    ],
  },

  // ── Wildcard ──────────────────────────────────────────────────────────────
  {
    path: '**',
    canActivate: [redirectGuard],
    loadComponent: () =>
      import('./features/auth/login-page/login-page.component').then((m) => m.LoginPageComponent),
  },
];
