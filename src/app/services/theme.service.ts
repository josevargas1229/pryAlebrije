import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeLink: HTMLLinkElement | null;
  private readonly themeStorageKey = 'theme-storage-current-name';

  constructor() {
    // Inicializa el enlace del tema
    if (typeof document !== 'undefined') {
      this.themeLink = document.getElementById('app-theme') as HTMLLinkElement;
    } else {
      this.themeLink = null;
    }
  }

  isBrowser(): boolean {
    return typeof localStorage !== 'undefined';
  }

  initThemeLink(): void {
    // Recupera el tema almacenado en el localStorage, si existe y estamos en el navegador
    const savedTheme = this.isBrowser() ? localStorage.getItem(this.themeStorageKey) : null;
    const defaultTheme = savedTheme ? savedTheme : 'azure-blue';

    // Establece el tema predeterminado o el guardado
    if (this.themeLink) {
      this.themeLink.href = `assets/css/${defaultTheme}.css`;
    }
  }

  switchTheme(theme: string): void {
    if (this.themeLink) {
      const timestamp = new Date().getTime(); // Para evitar caché
      this.themeLink.href = `assets/css/${theme}.css?ts=${timestamp}`;
      console.log(`Theme switched to: ${theme}`);

      // Guarda el tema en el localStorage solo si estamos en el navegador
      if (this.isBrowser()) {
        localStorage.setItem(this.themeStorageKey, theme);
      }
    }
  }
}
