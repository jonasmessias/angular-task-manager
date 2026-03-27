import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../private/components/navbar/navbar.component';

@Component({
  selector: 'app-board-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <div class="flex flex-col h-screen w-screen overflow-hidden bg-background">
      <app-navbar />
      <main class="flex-1 min-h-0 overflow-hidden">
        <router-outlet />
      </main>
    </div>
  `,
})
export class BoardLayoutComponent {}
