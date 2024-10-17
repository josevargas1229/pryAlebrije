import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, map, switchMap } from 'rxjs/operators';
import { Usuario } from '../user/user.models';
import { Cuenta } from '../account/account.models';
import { AuthResponse, LoginCredentials } from './auth.models';

import { CsrfService } from '../csrf.service';
import { environment } from '../../../environments/environment.example';



@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.API_URL}/auth`;
  private currentUserSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public currentUser: Observable<any>;
  private isCheckingAuth: boolean = false;

  constructor(private http: HttpClient, private csrfService: CsrfService) {
    this.checkAuthStatus();
    this.currentUser = this.currentUserSubject.asObservable();
  }

  login(credenciales: LoginCredentials, captchaToken: string, rememberMe: boolean): Observable<any> {
    return this.csrfService.getCsrfToken().pipe(
      switchMap(csrfToken => {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { credenciales, captchaToken }, {
          withCredentials: true,
          headers: {
            'x-csrf-token': csrfToken
          }
        });
      }),
      tap(response => {
        this.currentUserSubject.next(response);
        if (rememberMe) {
          this.setRememberMe(credenciales);
        } else {
          this.clearRememberMe();
        }
      }),
      catchError(this.handleLoginError)
    );
  }

  private handleLoginError(error: HttpErrorResponse) {
    if (error.status === 401) {
      return throwError(() => new Error('Credenciales inválidas. Por favor, verifique su email y contraseña.'));
    } else if (error.status === 403) {
      return throwError(() => new Error('Su cuenta está bloqueada debido a demasiados intentos fallidos.'));
    } else {
      return throwError(() => new Error('Ocurrió un error inesperado. Inténtelo de nuevo más tarde.'));
    }
  }

  register(usuario: Partial<Usuario>, cuenta: Partial<Cuenta>): Observable<Usuario> {
    return this.csrfService.getCsrfToken().pipe(
      switchMap(csrfToken => {
        const headers = new HttpHeaders().set('x-csrf-token', csrfToken);
        return this.http.post<Usuario>(`${this.apiUrl}/register`, { usuario, cuenta }, {
          headers,
          withCredentials: true
        });
      }),
      catchError(this.handleError)
    );
  }

  logout(): Observable<any> {
    return this.csrfService.getCsrfToken().pipe(
      switchMap(csrfToken => {
        return this.http.post(`${this.apiUrl}/logout`, {}, {
          withCredentials: true,
          headers: {
            'x-csrf-token': csrfToken
          }
        });
      }),
      tap(() => {
        this.currentUserSubject.next(null);
      }),
      catchError(this.handleError)
    );
  }

  isLoggedIn(): Observable<boolean> {
    return this.currentUser.pipe(
      map(user => !!user)
    );
  }

  getUserRole(): Observable<string | null> {
    return this.currentUser.pipe(
      map(user => user ? user.tipo : null)
    );
  }

  async checkAuthStatus(): Promise<any> {

    if (this.isCheckingAuth) return; // Si ya se está comprobando, salir
    this.isCheckingAuth = true;

    if (this.isCheckingAuth) return;
    this.isCheckingAuth = true;
    try {
      const user = await this.csrfService.getCsrfToken().pipe(
        switchMap(csrfToken => {
          return this.http.get(`${this.apiUrl}/check-auth`, {
            withCredentials: true,
            headers: {
              'x-csrf-token': csrfToken
            }
          });
        })
      ).toPromise();

      this.currentUserSubject.next(user);
      return user;
    } catch {
      this.currentUserSubject.next(null);
      return null;
    }finally {
      this.isCheckingAuth = false;
    }
  }

  getRememberMe(): { credenciales: LoginCredentials } | null {
    if (typeof localStorage !== 'undefined') {
      const rememberMe = localStorage.getItem('remember_me');
      return rememberMe ? JSON.parse(rememberMe) : null;
    }
    return null; // o manejar el caso donde localStorage no está disponible
  }

  private setRememberMe(credenciales: LoginCredentials): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('remember_me', JSON.stringify({ credenciales }));
    }
  }

  private clearRememberMe(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('remember_me');
    }
  }

  cambiarContraseña(accountId: number, nuevaContraseña: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/cambiar-contraseña`, { account_id: accountId, nueva_contraseña: nuevaContraseña }, { withCredentials: true });
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error inesperado. Inténtelo de nuevo más tarde.';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente o de la red
      errorMessage = `Error de red: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 401:
          errorMessage = 'No autenticado. Por favor, inicie sesión.';
          break;
        case 403:
          errorMessage = 'Acceso denegado. No tiene permisos para realizar esta acción.';
          break;
        case 404:
          errorMessage = 'Recurso no encontrado.';
          break;
        case 500:
          errorMessage = 'Error del servidor. Por favor, inténtelo de nuevo más tarde.';
          break;
      }
    }


    return throwError(() => new Error(errorMessage));
  }

}

