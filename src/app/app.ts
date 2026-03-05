import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  // Injecting ThemeService here ensures it's instantiated at app startup,
  // applying the persisted theme before any component renders.
  private readonly _theme = inject(ThemeService);
}
