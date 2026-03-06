import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ZardIconComponent } from '../../../../shared/components/icon/icon.component';
import { AvatarMenuComponent } from './avatar-menu/avatar-menu.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, ZardIconComponent, AvatarMenuComponent],
  template: `
    <header class="flex items-center h-12 px-2 gap-3 bg-background shrink-0">
      <div class="flex items-center gap-2 mr-2 shrink-0">
        <button
          class="size-8 rounded-full bg-primary flex justify-center items-center text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <z-icon
            zType="chevron-right"
            class="size-6 text-primary-foreground pointer-events-none"
          />
        </button>
        <a routerLink="/" class="flex items-center gap-2 mr-2 shrink-0">
          <z-icon zType="layers-2" class="text-primary size-5" />
          <span class="font-bold text-sm text-foreground">Task Manager</span>
        </a>
      </div>

      <div class="flex-1 flex items-center justify-center gap-4 mx-auto">
        <div class="flex-1 max-w-xl relative">
          <z-icon
            zType="search"
            class="absolute left-1.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search..."
            class="w-full h-8 pl-8 pr-3 text-sm bg-muted/60 border border-border rounded-md
                   text-foreground placeholder:text-muted-foreground
                   focus:outline-none focus:ring-1 focus:ring-ring focus:bg-background
                   transition-colors"
          />
        </div>
        <button
          class="flex items-center gap-1.5 h-8 px-3 rounded-md text-sm font-medium cursor-pointer
                 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <z-icon zType="plus" class="size-3.5" />
          Create
        </button>
      </div>

      <!-- Right: Actions + Avatar -->
      <div class="flex items-center gap-1 ml-2 shrink-0">
        <button
          class="flex items-center justify-center size-8 rounded-full cursor-pointer
                 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          title="Notifications"
        >
          <z-icon zType="bell" class="size-4" />
        </button>
        <button
          class="flex items-center justify-center size-8 rounded-full cursor-pointer
                 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          title="Help"
        >
          <z-icon zType="circle-help" class="size-4" />
        </button>
        <app-avatar-menu
          [userName]="userName()"
          [userEmail]="userEmail()"
          [userInitial]="userInitial()"
          (logoutEvent)="logout()"
        />
      </div>
    </header>
  `,
})
export class NavbarComponent {
  private readonly authService = inject(AuthService);

  readonly userName = computed(() => this.authService.currentUser?.name ?? 'Usuário');
  readonly userEmail = computed(() => this.authService.currentUser?.email ?? '');
  readonly userInitial = computed(() =>
    (this.authService.currentUser?.name?.[0] ?? 'U').toUpperCase(),
  );

  logout(): void {
    this.authService.logout();
  }
}
