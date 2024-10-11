import { Component } from '@angular/core';
import { ThemeService } from '../services/theme.service';
import { MatOptionModule } from '@angular/material/core';
import { MatLabel } from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [MatFormFieldModule, MatOptionModule, MatLabel, MatSelectModule],
  templateUrl: './theme-switcher.component.html',
  styleUrl: './theme-switcher.component.css'
})
export class ThemeSwitcherComponent {
  constructor(private themeService: ThemeService) { }

  ngAfterViewInit(): void {
    this.themeService.initThemeLink();
  }

  changeTheme(theme: string): void {
    this.themeService.switchTheme(theme);
  }
}
