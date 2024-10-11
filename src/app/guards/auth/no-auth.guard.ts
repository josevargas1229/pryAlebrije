import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { from, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return from(this.authService.checkAuthStatus()).pipe(
      map(user => {
        if (user) {
          // Si el usuario está autenticado, redirigir al dashboard
          this.router.navigate(['/dashboard']);
          return false; // No permitir el acceso a la ruta protegida
        }
        return true; // Permitir el acceso a la ruta si no está autenticado
      })
    );
  }
}
