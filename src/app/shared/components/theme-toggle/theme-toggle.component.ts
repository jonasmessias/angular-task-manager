import { Component, inject } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  template: `
    <button
      (click)="themeService.toggleTheme()"
      [title]="themeService.isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
      class="relative flex items-center justify-center w-9 h-9 rounded-md
             text-(--text-secondary) hover:text-(--text-primary)
             hover:bg-(--bg-card-hover) transition-colors duration-200"
      type="button"
    >
      <!-- Sun icon — shown in dark mode (click to go light) -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="absolute transition-all duration-300"
        [style.opacity]="themeService.isDark() ? '1' : '0'"
        [style.transform]="themeService.isDark() ? 'rotate(0deg) scale(1)' : 'rotate(90deg) scale(0)'"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>

      <!-- Moon icon — shown in light mode (click to go dark) -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="absolute transition-all duration-300"
        [style.opacity]="themeService.isDark() ? '0' : '1'"
        [style.transform]="themeService.isDark() ? 'rotate(-90deg) scale(0)' : 'rotate(0deg) scale(1)'"
      >
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </svg>
    </button>
  `,
})
export class ThemeToggleComponent {
  readonly themeService = inject(ThemeService);
}
