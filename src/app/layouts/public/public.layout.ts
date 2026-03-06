import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

import { ZardIconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, ZardIconComponent],
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">
      <!-- Logo -->
      <a routerLink="/login" class="flex items-center gap-2 mb-8 group">
        <div
          class="flex items-center justify-center w-8 h-8 rounded-lg bg-primary
                    group-hover:opacity-90 transition-opacity"
        >
          <z-icon zType="layers" class="size-4 text-primary-foreground" />
        </div>
        <span class="font-semibold text-base tracking-tight">Task Manager</span>
      </a>

      <!-- Conteúdo da rota -->
      <div class="w-full max-w-sm">
        <router-outlet />
      </div>
    </div>
  `,
})
export class PublicLayoutComponent {}
