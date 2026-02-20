import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

/**
 * Centralized route configuration for the app.
 * Public routes are top-level paths (login, register, etc.).
 * Private routes are under a root path guarded by AuthGuard and use a PrivateLayout component
 * that contains the Sidebar and a RouterOutlet for child pages.
 */
export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login-page/login-page.component').then((m) => m.LoginPageComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./auth/register-page/register-page.component').then((m) => m.RegisterPageComponent),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./auth/forgot-password-page/forgot-password-page.component').then(
        (m) => m.ForgotPasswordPageComponent
      ),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./auth/reset-password-page/reset-password-page.component').then(
        (m) => m.ResetPasswordPageComponent
      ),
  },

  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/private-layout/private-layout.component').then(
        (m) => m.PrivateLayoutComponent
      ),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./home/home-page/home-page.component').then((m) => m.HomePageComponent),
      },
      {
        path: 'tasks',
        loadComponent: () =>
          import('./tasks/tasks-page/tasks-page.component').then((m) => m.TasksPageComponent),
      },
    ],
  },

  // fallback
  { path: '**', redirectTo: '' },
];
