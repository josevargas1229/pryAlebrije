import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService, private readonly router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.currentUser.pipe(
      take(1), // Tomar solo el primer valor emitido
      map(user => {
        if (user) {
          // Si el usuario está autenticado, redirigir a la página principal
          return this.router.parseUrl('/');
        }
        // Si no está autenticado, permitir el acceso
        return true;
      })
    );
  }
}