import { Injectable, signal, effect } from '@angular/core';

/**
 * ThemeService – verwaltet den Dark-/Light-Mode.
 * Persistiert die Auswahl im localStorage und setzt das data-theme-Attribut auf <html>.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'hc-weetfeld-theme';

  /** true = Dark Mode aktiv */
  readonly isDark = signal(this.loadInitialTheme());

  constructor() {
    // Effekt: Bei jeder Änderung von isDark das Theme anwenden
    effect(() => {
      this.applyTheme(this.isDark());
    });
  }

  /** Dark Mode umschalten */
  toggle(): void {
    this.isDark.update(current => !current);
  }

  /** Initiales Theme aus localStorage oder System-Preference laden */
  private loadInitialTheme(): boolean {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored !== null) {
      return stored === 'dark';
    }
    // Fallback: System-Preference nutzen
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  }

  /** Theme auf DOM anwenden und in localStorage speichern */
  private applyTheme(isDark: boolean): void {
    const htmlEl = document.documentElement;
    if (isDark) {
      htmlEl.setAttribute('data-theme', 'dark');
    } else {
      htmlEl.removeAttribute('data-theme');
    }
    localStorage.setItem(this.STORAGE_KEY, isDark ? 'dark' : 'light');
  }
}

