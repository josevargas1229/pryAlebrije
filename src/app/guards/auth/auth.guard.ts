import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService, private readonly router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.authService.currentUser.pipe(
      take(1), // Tomar solo el primer valor emitido para evitar suscripciones continuas
      map(user => {
        if (user) {
          return true; // El usuario está autenticado
        } else {
          // Guardar la URL a la que el usuario intentaba acceder
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('redirectUrl', state.url);
          }
          // Retornar un UrlTree para redirigir al login
          return this.router.parseUrl('/login');
        }
      })
    );
  }
}