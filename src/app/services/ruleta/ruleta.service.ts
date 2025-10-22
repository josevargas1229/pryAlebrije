// src/app/services/ruleta.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout, switchMap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';

export interface SegmentoDTO {
  id: number;
  ruleta_id: number;
  premio_id: number | null;
  probabilidad_pct: number | string; // puede venir como '30.00'
  activo: boolean;
  premio?: { id: number; nombre: string };
}
export interface SpinResp {
  exito: boolean;
  resultado: 'gano_premio' | 'sin_premio';
  premio: { id: number; nombre: string; descripcion?: string; descuento: number } | null;
  cupon: { codigo: string; vence_el: string; estado: string } | null;
  ruleta: { id: number; imagen_ruleta: string };
  participacion_id: number;
}

@Injectable({ providedIn: 'root' })
export class RuletaService {
  private base = environment.API_URL;
  private segmentosApi = `${this.base}/ruletapremios`;
  private spinApi      = `${this.base}/ruleta-spin`;
  private csrfUrl      = `${this.base}/csrf-token`;

  constructor(private http: HttpClient) {}

  getSegmentos(ruletaId: number): Observable<SegmentoDTO[]> {
    return this.http
      .get<SegmentoDTO[]>(`${this.segmentosApi}/public/ruletas/${ruletaId}/segmentos`, { withCredentials: true })
      .pipe(timeout(8000), catchError(this.handleError));
  }

  getIntentosDisponibles(): Observable<{ disponibles: number }> {
  return this.http
    .get<{ disponibles: number }>(
      `${this.spinApi}/intentos`,
      { withCredentials: true }
    )
    .pipe(timeout(8000), catchError(this.handleError));
}

  /** Obtiene token CSRF y hace el POST del giro con el header X-CSRF-Token */
  spin(ruletaId: number): Observable<SpinResp> {
    return this.http.get<{ csrfToken: string }>(this.csrfUrl, { withCredentials: true }).pipe(
      map(r => r.csrfToken),
      switchMap(token => {
        const headers = new HttpHeaders({ 'X-CSRF-Token': token });
        return this.http.post<SpinResp>(
          `${this.spinApi}/ruletas/${ruletaId}/spin`,
          {},
          { withCredentials: true, headers }
        );
      }),
      timeout(8000),
      catchError(this.handleError)
    );
  }

  /** Importante: devolvemos el HttpErrorResponse intacto para poder leer status en el componente */
  private handleError(error: HttpErrorResponse) {
    return throwError(() => error);
  }
}
