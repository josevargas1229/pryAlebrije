import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      // Si el usuario está autenticado, permite el acceso a la ruta
      return true;
    } else {
      // Si no está autenticado, redirige al inicio
      this.router.navigate(['/']);
      return false;
    }
  }
}
