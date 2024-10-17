import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return from(this.authService.checkAuthStatus()).pipe(
      map(user => {
        if (user) {
          return true; // El usuario está autenticado
        } else {
          this.router.navigate(['/login']); // El usuario no está autenticado, redirigir al login
          return false;
        }
      })
    );
  }
}
