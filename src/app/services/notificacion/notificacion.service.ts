import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';

export interface Notificacion {
  id: number;
  mensaje: string;
  tipo: 'usuario' | 'admin' | 'sistema';
  usuario_id: number | null;
  leida: boolean;
  fecha: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  private apiUrl = `${environment.API_URL}/notificaciones`;

  constructor(private http: HttpClient) {}

  // 🔔 Obtener todas las notificaciones del usuario autenticado
 getNotificaciones(): Observable<Notificacion[]> {
  return this.http.get<Notificacion[]>(this.apiUrl, { withCredentials: true }).pipe(
    catchError(this.handleError)
  );
}
  // ❌ Manejo de errores
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Error inesperado en las notificaciones.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error de red: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 401:
          errorMessage = 'No autorizado.';
          break;
        case 404:
          errorMessage = 'No se encontraron notificaciones.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor.';
          break;
      }
    }
    return throwError(() => new Error(errorMessage));
  }
}
