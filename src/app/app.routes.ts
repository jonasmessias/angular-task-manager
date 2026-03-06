import { Routes } from '@angular/router';
import { authGuard, guestGuard, redirectGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Redirects root path based on auth state
  {
    path: '',
    pathMatch: 'full',
    canActivate: [redirectGuard],
    loadComponent: () =>
      import('./layouts/public/public.layout').then((m) => m.PublicLayoutComponent),
  },

  // Public routes
  {
    path: '',
    loadComponent: () =>
      import('./layouts/public/public.layout').then((m) => m.PublicLayoutComponent),
    children: [
      {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./features/auth/login-page/login-page.component').then(
            (m) => m.LoginPageComponent,
          ),
      },
      {
        path: 'register',
        canActivate: [guestGuard],
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

  // Private routes
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layouts/private/private.layout').then((m) => m.PrivateLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
    ],
  },

  { path: '**', redirectTo: '/login' },
];
