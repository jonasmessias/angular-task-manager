import { isPlatformBrowser } from '@angular/common';
import { computed, inject, Injectable, OnDestroy, PLATFORM_ID, signal } from '@angular/core';
import { StorageKeys } from '../enums/storage-keys.enum';

export type Theme = 'dark' | 'light' | 'system';

const DEFAULT_THEME: Theme = 'system';
const CYCLE: Theme[] = ['light', 'dark', 'system'];

@Injectable({ providedIn: 'root' })
export class ThemeService implements OnDestroy {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private mediaQuery: MediaQueryList | null = null;
  private mediaListener: ((e: MediaQueryListEvent) => void) | null = null;

  private readonly _theme = signal<Theme>(this.loadTheme());

  /** The stored preference (light | dark | system) */
  readonly currentTheme = this._theme.asReadonly();

  /** Whether the UI should currently render dark — resolves 'system' */
  readonly isDark = computed(() => {
    const t = this._theme();
    if (t === 'system') return this._systemDark();
    return t === 'dark';
  });

  private readonly _systemDark = signal<boolean>(this.getSystemDark());

  constructor() {
    this.applyTheme(this._theme());
    if (this.isBrowser) {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.mediaListener = (e: MediaQueryListEvent) => {
        this._systemDark.set(e.matches);
        if (this._theme() === 'system') {
          document.documentElement.classList.toggle('dark', e.matches);
        }
      };
      this.mediaQuery.addEventListener('change', this.mediaListener);
    }
  }

  ngOnDestroy(): void {
    if (this.mediaQuery && this.mediaListener) {
      this.mediaQuery.removeEventListener('change', this.mediaListener);
    }
  }

  /** Cycles: light → dark → system → light … */
  cycleTheme(): void {
    const current = this._theme();
    const next = CYCLE[(CYCLE.indexOf(current) + 1) % CYCLE.length];
    this.setTheme(next);
  }

  setTheme(theme: Theme): void {
    this._theme.set(theme);
    this.applyTheme(theme);
    if (this.isBrowser) {
      localStorage.setItem(StorageKeys.THEME, theme);
    }
  }

  private getSystemDark(): boolean {
    if (!this.isBrowser) return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private loadTheme(): Theme {
    if (!this.isBrowser) return DEFAULT_THEME;
    const stored = localStorage.getItem(StorageKeys.THEME) as Theme | null;
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : DEFAULT_THEME;
  }

  private applyTheme(theme: Theme): void {
    if (!this.isBrowser) return;
    const dark = theme === 'dark' || (theme === 'system' && this.getSystemDark());
    document.documentElement.classList.toggle('dark', dark);
  }
}
