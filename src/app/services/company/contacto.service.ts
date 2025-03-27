import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ContactoService {
  private apiUrl = `${environment.API_URL}/contacto`;

  constructor(private http: HttpClient) {}

  enviarMensaje(data: { nombre: string, email: string, mensaje: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/enviar`, data, { withCredentials: true })
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error. Intenta nuevamente.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error de red: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 400:
          errorMessage = 'Solicitud inválida. Por favor, completa todos los campos.';
          break;
        case 500:
          errorMessage = 'Error en el servidor al enviar el mensaje.';
          break;
      }
    }
    return throwError(() => new Error(errorMessage));
  }
}
