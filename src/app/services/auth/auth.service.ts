import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Usuario } from '../user/user.models';
import { Cuenta } from '../account/account.models';
import { AuthResponse, LoginCredentials } from './auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth';
  private currentUserSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public currentUser: Observable<any>;

  constructor(private http: HttpClient) {
    this.checkAuthStatus();
    this.currentUser = this.currentUserSubject.asObservable();
  }

  login(credenciales: LoginCredentials, rememberMe: boolean): Observable<any> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { credenciales }, {
      withCredentials: true
    }).pipe(
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
    return this.http.post<Usuario>(`${this.apiUrl}/register`, { usuario, cuenta }).pipe(
      catchError(this.handleError)
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).pipe(
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
    try {
      const user = await this.http.get(`${this.apiUrl}/check-auth`, { withCredentials: true }).toPromise();
      this.currentUserSubject.next(user);
      return user;
    } catch {
      this.currentUserSubject.next(null);
      return null;
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
