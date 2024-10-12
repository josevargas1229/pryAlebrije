import { Component } from '@angular/core';
import { ThemeService } from '../services/theme.service';
import { MatOptionModule } from '@angular/material/core';
import { MatLabel } from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatRadioModule} from '@angular/material/radio';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {MatMenuModule} from '@angular/material/menu';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [MatFormFieldModule, MatOptionModule, MatLabel, MatSelectModule,MatRadioModule,CommonModule,FormsModule,MatMenuModule,MatIconButton,MatIcon],
  templateUrl: './theme-switcher.component.html',
  styleUrl: './theme-switcher.component.css'
})
export class ThemeSwitcherComponent {
  themes = [
    { name: 'Rose & Red', value: 'rose-red', color: '#F44336' },  // Usa los colores que representan cada tema
    { name: 'Azure & Blue', value: 'azure-blue', color: '#2196F3' },
    { name: 'Cyan & Orange', value: 'cyan-orange', color: '#FF9800' },
    { name: 'Magenta & Violet', value: 'magenta-violet', color: '#9C27B0' }
  ];

  selectedTheme = 'azure-blue';
  constructor(private themeService: ThemeService) { }

  ngAfterViewInit(): void {
    this.themeService.initThemeLink();
  }

  changeTheme(theme: string): void {
    this.themeService.switchTheme(theme);
  }
}
