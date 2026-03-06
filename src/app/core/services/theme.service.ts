import { isPlatformBrowser } from '@angular/common';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { StorageKeys } from '../enums/storage-keys.enum';

export type Theme = 'dark' | 'light';

const DEFAULT_THEME: Theme = 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly _theme = signal<Theme>(this.loadTheme());

  readonly currentTheme = this._theme.asReadonly();
  readonly isDark = computed(() => this._theme() === 'dark');

  constructor() {
    this.applyTheme(this._theme());
  }

  toggleTheme(): void {
    const next: Theme = this._theme() === 'dark' ? 'light' : 'dark';
    this._theme.set(next);
    this.applyTheme(next);
    if (this.isBrowser) {
      localStorage.setItem(StorageKeys.THEME, next);
    }
  }

  private loadTheme(): Theme {
    if (!this.isBrowser) return DEFAULT_THEME;
    const stored = localStorage.getItem(StorageKeys.THEME) as Theme | null;
    return stored === 'light' || stored === 'dark' ? stored : DEFAULT_THEME;
  }

  private applyTheme(theme: Theme): void {
    if (!this.isBrowser) return;
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }
}
