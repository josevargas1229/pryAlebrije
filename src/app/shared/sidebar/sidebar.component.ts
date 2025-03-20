import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenav, MatSidenavContainer} from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatNavList } from '@angular/material/list';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [MatIconModule, CommonModule, MatButtonModule, MatTooltipModule, RouterLink, RouterLinkActive,MatSidenavContainer,MatSidenav,MatToolbarModule,MatNavList],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  isLoggedIn: boolean = false;
  userRole: number | null = null;

  constructor(private readonly authService: AuthService, private readonly router: Router) {}

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
      this.userRole = null;
      this.router.navigate(['/']);
    });
  }
}
