import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Usuario } from '../user/user.models';
import { Cuenta } from '../account/account.models';
import { AuthResponse, LoginCredentials } from './auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth';

  private tokenKey = 'auth_token';
  private rememberMeKey = 'remember_me';

  constructor(private http: HttpClient) { }

  /**
   * The `login` function sends a POST request to the server with the email and password, sets the
   * token received in the response.
   * @param {string} email - The `email` parameter is a string that represents the email address of the
   * user trying to log in.
   * @param {string} contraseña - The parameter "contraseña" is a string representing the password for
   * the login function.
   * @returns An Observable is being returned.
   */
  login(credenciales: LoginCredentials, rememberMe: boolean): Observable<any> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { credenciales }, {
        withCredentials: true
    }).pipe(
        tap(response => {
            this.setToken(response.token);
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

  /**
   * The `register` function sends a POST request to the server with partial user and account
   * information to register a new user.
   * @param usuario - The `usuario` parameter is a partial object of type `Usuario`, which likely
   * contains information about a user such as their name, email, password, etc. It is marked as
   * partial, which means not all properties of the `Usuario` object are required when calling this
   * function.
   * @param cuenta - The `cuenta` parameter is a partial object of type `Cuenta`, which likely contains
   * information related to a user's account details such as account number, balance, transaction
   * history, etc. It is being passed as an argument to the `register` method along with a partial
   * `Usuario` object
   * @returns An Observable of type Usuario is being returned.
   */
  register(usuario: Partial<Usuario>, cuenta: Partial<Cuenta>): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/register`, { usuario, cuenta });
  }

  /**
   * The `logout` function removes the token key from the local storage.
   */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }

  /**
   * The `getToken` function retrieves a token from local storage and returns it as a string or null.
   * @returns The `getToken()` function is returning a string value if there is a token stored in the
   * `localStorage` with the key `this.tokenKey`. If no token is found, it will return `null`.
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * The function `setToken` stores a token in the browser's local storage.
   * @param {string} token - The `token` parameter is a string that represents the authentication token
   * that you want to store in the browser's `localStorage`.
   */
  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  /**
   * The isLoggedIn function in TypeScript returns true if a token is present and false if not.
   * @returns A boolean value is being returned. The expression `!!this.getToken()` is used to convert
   * the value returned by `this.getToken()` into a boolean value.
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
  getRememberMe(): { credenciales:LoginCredentials } | null {
    const rememberMe = localStorage.getItem(this.rememberMeKey);
    return rememberMe ? JSON.parse(rememberMe) : null;
  }

  private setRememberMe(credenciales:LoginCredentials): void {
    localStorage.setItem(this.rememberMeKey, JSON.stringify({ credenciales }));
  }

  private clearRememberMe(): void {
    localStorage.removeItem(this.rememberMeKey);
  }
  // Método para registrar intentos fallidos
  /**
   * The function `registrarIntentoFallido` sends a POST request to a specified API endpoint to record
   * failed login attempts with user ID, IP address, and timestamp.
   * @param {number} userId - The `userId` parameter is a number that represents the user ID of the
   * user for whom the failed attempt is being recorded.
   * @param {string} ip - The `ip` parameter in the `registrarIntentoFallido` function represents the
   * IP address from which the failed attempt is being made. It is a string type parameter that stores
   * the IP address of the user who made the unsuccessful attempt.
   * @returns An Observable<any> is being returned.
   */
  registrarIntentoFallido(userId: number, ip: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/intentos-fallidos`, { user_id: userId, ip, fecha: new Date() });
  }

  // Método para cambiar contraseña
  /**
   * The function cambiarContraseña takes an account ID and a new password as parameters and makes a
   * POST request to change the password.
   * @param {number} accountId - The `accountId` parameter is a number that represents the unique
   * identifier of the account for which the password is being changed.
   * @param {string} nuevaContraseña - The parameter `nuevaContraseña` is a string that represents the
   * new password that the user wants to set for their account.
   * @returns An Observable<any> is being returned.
   */
  cambiarContraseña(accountId: number, nuevaContraseña: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/cambiar-contraseña`, { account_id: accountId, nueva_contraseña: nuevaContraseña });
  }
}