import { Routes } from '@angular/router';
import { authGuard, guestGuard, redirectGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Private routes (checked first — authGuard redirects to /login if unauthenticated)
  {
    path: '',
    canActivate: [authGuard, redirectGuard],
    loadComponent: () =>
      import('./layouts/private/private.layout').then((m) => m.PrivateLayoutComponent),
    children: [
      // Dashboard
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      // Profile
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/auth/profile-page/profile-page.component').then(
            (m) => m.ProfilePageComponent,
          ),
      },
      // All boards: /u/:username/boards
      {
        path: 'u/:username/boards',
        loadComponent: () =>
          import('./features/boards/boards-page/boards-page.component').then(
            (m) => m.BoardsPageComponent,
          ),
      },
      // Workspace routes: /w/:workspaceSlug/home  &  /w/:workspaceSlug/account
      {
        path: 'w/:workspaceSlug',
        children: [
          {
            path: 'home',
            loadComponent: () =>
              import('./features/workspaces/workspace-home-page/workspace-home-page.component').then(
                (m) => m.WorkspaceHomePageComponent,
              ),
          },
          {
            path: 'account',
            loadComponent: () =>
              import('./features/workspaces/workspace-account-page/workspace-account-page.component').then(
                (m) => m.WorkspaceAccountPageComponent,
              ),
          },
          {
            path: 'members',
            loadComponent: () =>
              import('./features/workspaces/workspace-members-page/workspace-members-page.component').then(
                (m) => m.WorkspaceMembersPageComponent,
              ),
          },
          { path: '', redirectTo: 'home', pathMatch: 'full' },
        ],
      },
    ],
  },

  // Board detail (navbar only, no sidebar)
  {
    path: 'b/:boardId/:boardSlug',
    canActivate: [authGuard],
    loadComponent: () => import('./layouts/board/board.layout').then((m) => m.BoardLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/boards/board-detail-page/board-detail-page.component').then(
            (m) => m.BoardDetailPageComponent,
          ),
      },
    ],
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
      {
        path: 'verify-email',
        loadComponent: () =>
          import('./features/auth/verify-email-page/verify-email-page.component').then(
            (m) => m.VerifyEmailPageComponent,
          ),
      },
    ],
  },

  { path: '**', redirectTo: '/login' },
];
