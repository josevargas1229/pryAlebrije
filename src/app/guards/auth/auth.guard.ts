import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return from(this.authService.checkAuthStatus()).pipe(
      map(user => {
        if (user) {
          return true; // El usuario está autenticado
        } else {
          if (typeof window !== 'undefined' && window.localStorage) {
            // Verificamos que estamos en un entorno del cliente antes de usar localStorage
            localStorage.setItem('redirectUrl', state.url); // Guarda la URL a la que el usuario intentaba acceder
          }
          this.router.navigate(['/login']); // El usuario no está autenticado, redirigir al login
          return false;
        }
      })
    );
  }
}
