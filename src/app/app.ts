import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { ZardToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ZardToastComponent],
  template: `
    <router-outlet />
    <z-toaster [richColors]="true" position="bottom-right" />
  `,
  styleUrl: './app.css',
})
export class App {
  // ThemeService is injected here to be instantiated before the first render.
  private readonly _theme = inject(ThemeService);
}
