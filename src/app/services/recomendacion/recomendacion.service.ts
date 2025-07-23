import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';

export interface Recomendacion {
  item: string;
  producto_id: number;
  descripcion_producto: string;
  confidence: number;
  lift: number;
  product_cluster: number;
  priority: number;
  tipo_id: number;
  categoria_id: number;
  precio: number;
  imagen_url: string;
  tienePromocion?: boolean;
  precioFinal?: number;
  descuento?: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class RecomendacionService {
  private baseUrl = environment.API_RECOMMENDER; // Asegúrate de definir esto en environment

  constructor(private http: HttpClient) {}

  obtenerRecomendaciones(topN: number = 10, minConfidence: number = 0.1): Observable<Recomendacion[]> {
  const body = {
    top_n: topN,
    min_confidence: minConfidence
  };

 return this.http.post<any>(`${environment.API_URL}/producto/recommended`, body, {
    withCredentials: true
  }).pipe(
    map(res => res.recomendacionesPersonalizadas as Recomendacion[]),
    catchError(this.handleError)
  );
}


  obtenerRelacionados(productId: number, topN: number = 10): Observable<Recomendacion[]> {
    const params = new HttpParams()
      .set('product_id', productId.toString())
      .set('top_n', topN.toString());

    return this.http.get<any>(`${this.baseUrl}/related_products`, { params }).pipe(
      map(res => res.recommendations as Recomendacion[]),
      catchError(this.handleError)
    );
  }

  // Manejo de errores centralizado
  private handleError(error: HttpErrorResponse) {
    let errorMsg = 'Error inesperado. Intenta más tarde.';
    if (error.error instanceof ErrorEvent) {
      errorMsg = `Error de red: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 400:
          errorMsg = 'Solicitud inválida.';
          break;
        case 404:
          errorMsg = 'No se encontraron recomendaciones.';
          break;
        case 500:
          errorMsg = 'Error del servidor en recomendador.';
          break;
      }
    }
    return throwError(() => new Error(errorMsg));
  }
}
