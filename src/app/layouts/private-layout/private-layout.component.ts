import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ZardIconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-private-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ZardIconComponent],
  template: `
    <div class="flex h-screen w-screen overflow-hidden bg-background">
      <!-- Sidebar -->
      <aside class="flex flex-col w-64 h-full bg-sidebar border-r border-sidebar-border shrink-0">
        <!-- Logo -->
        <div class="flex items-center gap-2 px-5 h-14 border-b border-sidebar-border shrink-0">
          <z-icon zType="layers-2" class="text-primary size-5" />
          <span class="font-bold text-base text-sidebar-foreground">Task Manager</span>
        </div>

        <!-- Nav Links -->
        <nav class="flex flex-col gap-1 px-3 py-4 flex-1 overflow-y-auto">
          <p
            class="text-xs font-medium text-sidebar-foreground/50 px-2 mb-1 uppercase tracking-wide"
          >
            Menu
          </p>

          <a
            routerLink="/"
            routerLinkActive="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
            [routerLinkActiveOptions]="{ exact: true }"
            class="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <z-icon zType="house" class="size-4 shrink-0" />
            Home
          </a>
        </nav>

        <!-- User + Logout -->
        <div class="border-t border-sidebar-border px-3 py-3 shrink-0">
          <div class="flex items-center gap-3 px-2 py-2 rounded-md">
            <div
              class="size-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold shrink-0"
            >
              {{ userInitial() }}
            </div>
            <div class="flex flex-col flex-1 min-w-0">
              <span class="text-sm font-medium text-sidebar-foreground truncate">{{
                userName()
              }}</span>
              <span class="text-xs text-sidebar-foreground/50 truncate">{{ userUsername() }}</span>
            </div>
            <button
              (click)="logout()"
              class="p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
              title="Sair"
            >
              <z-icon zType="log-out" class="size-4" />
            </button>
          </div>
        </div>
      </aside>

      <!-- Main area -->
      <div class="flex flex-col flex-1 min-w-0 overflow-hidden">
        <!-- Topbar -->
        <header
          class="flex items-center justify-between px-6 h-14 border-b border-border bg-background shrink-0"
        >
          <h1 class="text-sm font-semibold text-foreground">{{ pageTitle() }}</h1>
          <div class="flex items-center gap-2">
            <button
              class="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            >
              <z-icon zType="bell" class="size-4" />
            </button>
            <button
              class="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            >
              <z-icon zType="settings" class="size-4" />
            </button>
          </div>
        </header>

        <!-- Page content -->
        <main class="flex-1 overflow-auto">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
})
export class PrivateLayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  userName = signal(this.authService.currentUser?.name ?? 'Usuário');
  userUsername = signal(this.authService.currentUser?.username ?? '');
  userInitial = signal((this.authService.currentUser?.name?.[0] ?? 'U').toUpperCase());
  pageTitle = signal('Home');

  logout(): void {
    this.authService.logout();
  }
}
