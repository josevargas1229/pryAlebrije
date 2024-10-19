import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { NavigationComponent } from "../../navigation/navigation.component";
import { MatIconModule } from '@angular/material/icon';
import { ThemeSwitcherComponent } from "../../theme-switcher/theme-switcher.component";
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, MatButtonModule, NavigationComponent, MatIconModule, ThemeSwitcherComponent,MatToolbarModule,MatTooltipModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  isLoggedIn: boolean = false;
  userRole: number | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Verifica el estado de autenticación del usuario
    this.authService.isLoggedIn().subscribe((loggedIn: boolean) => {
      this.isLoggedIn = loggedIn;
      if (this.isLoggedIn) {
        // Obtiene el rol del usuario si está autenticado
        this.authService.getUserRole().subscribe((role: number | null) => {
          if(role!==null){
            this.userRole = role;
          }
        });
      }
    });
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.isLoggedIn = false;
      this.userRole = null; // Resetea el rol del usuario al cerrar sesión
      this.router.navigate(['/']);
    });
  }
}