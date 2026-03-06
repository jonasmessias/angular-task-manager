import { Component, computed, inject } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  template: `
    <button
      (click)="themeService.cycleTheme()"
      [title]="tooltip()"
      class="relative flex items-center justify-center w-9 h-9 rounded-md
             text-(--text-secondary) hover:text-(--text-primary)
             hover:bg-(--bg-card-hover) transition-colors duration-200"
      type="button"
    >
      <!-- Sun icon — light mode -->
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
        [style.opacity]="isLight() ? '1' : '0'"
        [style.transform]="isLight() ? 'rotate(0deg) scale(1)' : 'rotate(90deg) scale(0)'"
      >
        <circle cx="12" cy="12" r="4" />
        <path
          d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
        />
      </svg>

      <!-- Moon icon — dark mode -->
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
        [style.opacity]="isDark() ? '1' : '0'"
        [style.transform]="isDark() ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0)'"
      >
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </svg>

      <!-- Monitor icon — system mode -->
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
        [style.opacity]="isSystem() ? '1' : '0'"
        [style.transform]="isSystem() ? 'scale(1)' : 'scale(0)'"
      >
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    </button>
  `,
})
export class ThemeToggleComponent {
  readonly themeService = inject(ThemeService);

  readonly isLight = computed(() => this.themeService.currentTheme() === 'light');
  readonly isDark = computed(() => this.themeService.currentTheme() === 'dark');
  readonly isSystem = computed(() => this.themeService.currentTheme() === 'system');

  readonly tooltip = computed(() => {
    switch (this.themeService.currentTheme()) {
      case 'light':
        return 'Modo claro — clique para escuro';
      case 'dark':
        return 'Modo escuro — clique para sistema';
      case 'system':
        return 'Tema do sistema — clique para claro';
    }
  });
}
