import { Component, AfterViewInit } from '@angular/core';
import { ThemeService } from '../services/theme.service';
import { MatOptionModule } from '@angular/material/core';
import { MatLabel } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [MatFormFieldModule, MatOptionModule, MatLabel, MatSelectModule, MatRadioModule, CommonModule, FormsModule, MatMenuModule, MatIconButton, MatIcon],
  templateUrl: './theme-switcher.component.html',
  styleUrls: ['./theme-switcher.component.css']
})
export class ThemeSwitcherComponent implements AfterViewInit {
  themes = [
    { name: 'Rose & Red', value: 'rose-red', color: '#FFD7DF' },
    { name: 'Azure & Blue', value: 'azure-blue', color: '#D3E3FF' },
    { name: 'Cyan & Orange', value: 'cyan-orange', color: '#005050' },
    { name: 'Magenta & Violet', value: 'magenta-violet', color: '#8F007E' }
  ];

  selectedTheme = 'azure-blue';

  constructor(private themeService: ThemeService) { }

  ngAfterViewInit(): void {
    this.themeService.initThemeLink();

    // Recupera el tema seleccionado del localStorage si existe
    const savedTheme = this.themeService.isBrowser()?localStorage.getItem('theme-storage-current-name'):'azure-blue';
    if (savedTheme) {
      this.selectedTheme = savedTheme;
    }
  }

  changeTheme(theme: string): void {
    this.themeService.switchTheme(theme);
  }
}
