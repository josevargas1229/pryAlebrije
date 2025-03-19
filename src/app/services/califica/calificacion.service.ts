import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';

export interface CalificacionResponse {
  promedio: number;
  total: number;
  detalle: { estrella: number; cantidad: number }[];
}

export interface Calificacion {
  id: number;
  producto_id: number;
  usuario_id: number;
  calificacion: number;
}

@Injectable({
  providedIn: 'root'
})
export class CalificacionService {
  private apiUrl = `${environment.API_URL}/calificacion`;

  constructor(private http: HttpClient) {}

  // Obtener la calificación promedio y total de calificaciones de un producto
  getCalificacionProducto(productoId: number): Observable<CalificacionResponse> {
    return this.http.get<CalificacionResponse>(`${this.apiUrl}/producto/${productoId}`, { withCredentials: true })
      .pipe(
        map(response => ({
          promedio: response.promedio,
          total: response.total,
          detalle: response.detalle || []
        })),
        catchError(this.handleError)
      );
  }

  //  Agregar una nueva calificación y actualizar el ranking
  addCalificacionProducto(productoId: number, usuarioId: number, calificacion: number): Observable<any> {
    const body = { producto_id: productoId, usuario_id: usuarioId, calificacion };

    console.log("📤 Enviando calificación al backend:", body);

    return this.http.post(`${this.apiUrl}/producto`, body, { withCredentials: true })
      .pipe(
        catchError(this.handleError)
      );
}


  //  Manejo de errores
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Error inesperado, intenta nuevamente.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error de red: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 400:
          errorMessage = 'Solicitud inválida. Revisa los datos.';
          break;
        case 401:
          errorMessage = 'No autorizado. Inicia sesión para continuar.';
          break;
        case 404:
          errorMessage = 'No se encontró la calificación.';
          break;
        case 500:
          errorMessage = 'Error en el servidor.';
          break;
      }
    }
    console.error(` Error API: ${errorMessage}`);
    return throwError(() => new Error(errorMessage));
  }
}
