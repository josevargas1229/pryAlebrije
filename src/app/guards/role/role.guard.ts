import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private readonly authService: AuthService, private readonly router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    const expectedRole = route.data['expectedRole'];
    const userRole = this.authService.getUserRole();

    if (this.authService.isLoggedIn() && userRole !== expectedRole) {
      // Redirect to login page or unauthorized page
      this.router.navigate(['/']); // Redirecciona
      return false; // Evita que se acceda a la ruta
    }

    return true; // Permite el acceso a la ruta
  }
}
