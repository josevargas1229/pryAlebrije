import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { from, map, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return from(this.authService.checkAuthStatus()).pipe(
      tap(user => console.log('Usuario autenticado:', user)),
    map(user => {
      if (user) {
        this.router.navigate(['/']);
        return false; // No permitir el acceso a la ruta protegida
      }
      return true; // Permitir el acceso a la ruta si no está autenticado
    })
  );
}
}