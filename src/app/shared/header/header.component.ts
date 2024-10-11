import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { NavigationComponent } from "../../navigation/navigation.component";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, MatButtonModule, NavigationComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  isLoggedIn: boolean = false;
  constructor(private authService: AuthService, private router: Router) {}
  ngOnInit(): void {
    // Verifica el estado de autenticación del usuario
    this.authService.isLoggedIn().subscribe((loggedIn: boolean) => {
      this.isLoggedIn = loggedIn;
      console.log(loggedIn)
    });
  }
  logout(): void {
    this.authService.logout().subscribe(() => {
      this.isLoggedIn = false;
      this.router.navigate(['/']);
    });
  }
}
