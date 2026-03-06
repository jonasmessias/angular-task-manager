import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AppSidebarComponent } from './components/sidebar/sidebar.component';

@Component({
  selector: 'app-private-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, NavbarComponent, AppSidebarComponent],
  template: `
    <div class="flex flex-col h-screen w-screen overflow-hidden bg-background">
      <app-navbar />
      <div class="flex flex-1 min-h-0 overflow-hidden">
        <app-sidebar />
        <main class="flex-1 overflow-auto bg-background">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class PrivateLayoutComponent {}
