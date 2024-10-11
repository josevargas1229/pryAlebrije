import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeLink: HTMLLinkElement | null;

  constructor() {
    // Inicializa el enlace del tema
    if (typeof document !== 'undefined') {
    this.themeLink = document.getElementById('app-theme') as HTMLLinkElement;
    }
    else{
      this.themeLink =null;
    }
  }

  initThemeLink(): void {
    // Establece el tema predeterminado si es necesario
    if (this.themeLink) {
      this.themeLink.href = `assets/css/azure-blue.css`;  // Cambia esto si necesitas un tema diferente por defecto
    }
  }

  switchTheme(theme: string): void {
    if (this.themeLink) {
      const timestamp = new Date().getTime(); // Para evitar caché
      this.themeLink.href = `assets/css/${theme}.css?ts=${timestamp}`;
      console.log(`Theme switched to: ${theme}`);
    }
  }
}
