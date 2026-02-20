import { Injectable, signal, effect } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly THEME_KEY = 'shipsmart-theme';
  private platformId = inject(PLATFORM_ID);
  
  themeMode = signal<ThemeMode>(this.loadTheme());
  isDarkMode = signal<boolean>(this.getIsDarkMode());

  constructor() {
    // Apply theme immediately on init
    this.applyTheme(this.themeMode());
    
    effect(() => {
      const mode = this.themeMode();
      this.applyTheme(mode);
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(this.THEME_KEY, mode);
      }
    });
  }

  setTheme(mode: ThemeMode): void {
    this.themeMode.set(mode);
    this.isDarkMode.set(this.getIsDarkMode());
  }

  private getIsDarkMode(): boolean {
    const mode = this.themeMode();
    if (mode === 'dark') return true;
    if (mode === 'light') return false;
    
    // System default
    if (isPlatformBrowser(this.platformId)) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  }

  private applyTheme(mode: ThemeMode): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const isDark = mode === 'dark' || 
      (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark-mode');
      root.classList.remove('light-mode');
    } else {
      root.classList.add('light-mode');
      root.classList.remove('dark-mode');
    }
  }

  private loadTheme(): ThemeMode {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem(this.THEME_KEY) as ThemeMode;
      return saved || 'system';
    }
    return 'system';
  }
}
