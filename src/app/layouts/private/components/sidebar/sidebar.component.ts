import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ZardIconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, ZardIconComponent],
  template: `
    <aside class="flex flex-col w-72 h-full bg-background shrink-0">
      <nav class="flex flex-col h-full pl-8">
        <header class="flex flex-col gap-1 px-2 pt-10">
          <a
            routerLink="/boards"
            routerLinkActive="bg-accent text-accent-foreground font-medium"
            [routerLinkActiveOptions]="{ exact: true }"
            class="flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm
                  text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <z-icon zType="layout-dashboard" class="size-4 shrink-0" />
            Boards
          </a>
          <a
            routerLink="/"
            routerLinkActive="bg-accent text-accent-foreground font-medium"
            class="flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm
                  text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <z-icon zType="house" class="size-4 shrink-0" />
            Home
          </a>
        </header>
        <div class="mx-4 my-2 border-t border-border"></div>
        <section class="flex flex-col gap-0.5 px-2 flex-1 overflow-y-auto">
          <p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-1">
            Workspaces
          </p>
        </section>
      </nav>
    </aside>
  `,
})
export class AppSidebarComponent {}
