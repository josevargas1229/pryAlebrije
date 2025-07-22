import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, fromEvent, Subscription } from 'rxjs';
import { catchError, tap, map, first, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment.development';
import { AuthResponse, LoginCredentials } from './auth.models';
import { Usuario } from '../user/user.models';
import { Cuenta } from '../account/account.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  private apiUrl = `${environment.API_URL}/auth`;
  private currentUserSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public currentUser: Observable<any> = this.currentUserSubject.asObservable();
  private inactivityTimeout: any;
  private readonly inactivityTime = 15 * 60 * 1000; // 15 minutos
  private eventSubscriptions: Subscription[] = [];
  private authStatusChecked = false;

  constructor(private readonly http: HttpClient, private readonly router: Router) {
    // No iniciamos el contador aquí, lo haremos solo al autenticar
  }

  // Login
  login(
  credenciales: LoginCredentials,
  captchaToken: string,
  rememberMe: boolean,
  clientId?: string | null,
  redirectUri?: string | null,
  state?: string | null
): Observable<any> {
  const body: any = {
    credenciales,
    captchaToken
  };

  if (clientId && redirectUri && state) {
    body.client_id = clientId;
    body.redirect_uri = redirectUri;
    body.state = state;
  }

  return this.http.post<AuthResponse>(`${this.apiUrl}/login`, body, {
    withCredentials: true
  }).pipe(
    tap(response => {
      // 🔁 Redirección hacia Alexa (Account Linking)
      if (clientId && redirectUri && state && response.redirect_to) {
        window.location.href = response.redirect_to;
        return;
      }

      // ✅ Usuario verificado: login normal
      if (response?.verified) {
        this.currentUserSubject.next(response);
        this.authStatusChecked = true;
        this.startInactivityListener();

        if (rememberMe) {
          this.setRememberMe(credenciales);
        } else {
          this.clearRememberMe();
        }

        const redirectUrl = localStorage.getItem('redirectUrl') || '/';
        this.router.navigate([redirectUrl]).then(() => {
          localStorage.removeItem('redirectUrl');
        });
      }

      // ❌ Usuario no verificado: redirigir a verificación
      else if (!clientId) {
        this.router.navigate(['/verificacion'], {
          queryParams: { email: credenciales.email }
        });
      }
    }),
    catchError(this.handleLoginError)
  );
}

  getCurrentUser(): Observable<Usuario | null> {
    return this.currentUserSubject.asObservable();
  }


  // Registro
  register(usuario: Partial<Usuario>, cuenta: Partial<Cuenta>): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/register`, { usuario, cuenta }, { withCredentials: true }).pipe(
      tap(() => this.router.navigate(['/verificacion'], { queryParams: { email: usuario.email } })),
      catchError((error: HttpErrorResponse) => this.handleRegisterError(error))
    );
  }

  // Logout
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => this.clearSession()),
      catchError(this.handleError)
    );
  }

  // Verificar estado de autenticación
  async checkAuthStatus(): Promise<any> {
    if (this.authStatusChecked && this.currentUserSubject.value) {
      return Promise.resolve(this.currentUserSubject.value);
    }

    try {
      const user = await this.http.get(`${this.apiUrl}/check-auth`, { withCredentials: true }).toPromise();
      this.currentUserSubject.next(user);
      this.authStatusChecked = true;
      if (user) {
        this.startInactivityListener(); // Iniciar contador si hay sesión
      }
      return user;
    } catch (error) {
      this.clearSession();
      this.authStatusChecked = true;
      throw error;
    }
  }

  // Estado de autenticación
  isLoggedIn(): Observable<boolean> {
    return this.currentUser.pipe(map(user => !!user));
  }

  // Rol del usuario
  setUserRole(role: number): void {
    this.currentUserSubject.next({ ...this.currentUserSubject.value, tipo: role });
  }

  getUserRole(): Observable<number | null> {
    return this.currentUser.pipe(map(user => user?.tipo || null));
  }

  // Remember Me
  getRememberMe(): { credenciales: LoginCredentials } | null {
    return typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('remember_me') || 'null') : null;
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

  // Verificación y cambio de contraseña
  sendVerificationCode(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/send-link`, { email, tipo_id: 2 }, { withCredentials: true });
  }

  resendVerificationEmail(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/send-link`, { email }, { withCredentials: true }).pipe(catchError(this.handleError));
  }

  verifyAccount(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/verify?token=${token}`, { withCredentials: true }).pipe(
      tap(() => this.checkAuthStatus()),
      catchError(this.handleError)
    );
  }

  cambiarContraseña(accountId: number, nuevaContraseña: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/cambiar-contraseña`, { account_id: accountId, nueva_contraseña: nuevaContraseña }, { withCredentials: true });
  }

  // Manejo de inactividad
  private startInactivityListener(): void {
    if (this.eventSubscriptions.length > 0) return; // Evitar múltiples listeners
    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach(event => {
      const sub = fromEvent(window, event).subscribe(() => this.resetInactivityTimer());
      this.eventSubscriptions.push(sub);
    });
    this.resetInactivityTimer();
  }

  private resetInactivityTimer(): void {
    clearTimeout(this.inactivityTimeout);
    this.inactivityTimeout = setTimeout(() => {
      this.logout().subscribe({
        next: () => alert('Sesión cerrada por inactividad.'),
        error: () => this.clearSession()
      });
    }, this.inactivityTime);
  }

  private clearSession(): void {
    this.currentUserSubject.next(null);
    this.stopInactivityListener();
  }

  private stopInactivityListener(): void {
    this.eventSubscriptions.forEach(sub => sub.unsubscribe());
    this.eventSubscriptions = [];
    clearTimeout(this.inactivityTimeout);
  }

  // Manejo de errores
  private handleLoginError(error: HttpErrorResponse): Observable<never> {
    if (error.status === 401) {
      return throwError(() => new Error('Credenciales inválidas. Por favor, verifique su email y contraseña.'));
    } else if (error.status === 403) {
      return throwError(() => new Error(error.error.message || 'Su cuenta está bloqueada o no verificada.'));
    } else {
      return throwError(() => new Error('Ocurrió un error inesperado. Inténtelo de nuevo más tarde.'));
    }
  }

  private handleRegisterError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocurrió un error al registrar el usuario.';

    if (error.status === 400 && error.error.errors) {
      // Errores de validación del backend (como unicidad)
      const validationErrors = error.error.errors.map((err: { field: string; message: string }) =>
        `${err.field}: ${err.message}`
      ).join(', ');
      errorMessage = validationErrors || 'Error de validación en los datos proporcionados.';
    } else if (error.status === 500) {
      errorMessage = 'Error interno del servidor. Por favor, intenta de nuevo más tarde.';
    } else if (error.status === 403) {
      errorMessage = error.error.message || 'Acceso denegado.';
    }

    // Propagar el mensaje detallado al frontend
    return throwError(() => new Error(errorMessage));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocurrió un error inesperado.';
    switch (error.status) {
      case 401: errorMessage = 'No autenticado. Por favor, inicie sesión.'; break;
      case 403: errorMessage = error.error.message || 'Acceso denegado.'; break;
      case 404: errorMessage = 'Recurso no encontrado.'; break;
      case 500: errorMessage = 'Error del servidor.'; break;
    }
    return throwError(() => new Error(errorMessage));
  }

  ngOnDestroy(): void {
    this.stopInactivityListener();
  }
}
