import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';

export interface Venta {
  id: number;
  usuario_id: number;
  direccion_id?: number | null; // ✅ Añadido
  total: number;
  recoger_en_tienda: boolean;
  estado: string;
  fecha_venta: string;
  detalles: DetalleVenta[];
}


export interface DetalleVenta {
  id: number;
  venta_id: number;
  producto_id: number;
  talla_id: number;
  color_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  producto: {
    id: number;
    precio: number;
    tipoProducto: { nombre: string };
    imagenes: { imagen_url: string }[]; // Ahora se incluye la lista de imágenes
  };
  talla: { talla: string };
  color: { color: string; colorHex: string };
}


@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private apiUrl = `${environment.API_URL}/ventas`;

  constructor(private http: HttpClient) {}

  // 🛒 Crear una nueva venta
  createVenta(venta: Partial<Venta>): Observable<Venta> {
    console.log("➡️ Enviando venta al backend:", venta); // ✅ Agrega log para depuración
    return this.http.post<Venta>(`${this.apiUrl}/crear`, venta, { withCredentials: true }).pipe(
      catchError(this.handleError)
    );
  }


  // 📜 Obtener todas las ventas de un usuario
  getVentasByUsuario(usuarioId: number): Observable<Venta[]> {
    return this.http.get<{ ventas: Venta[] }>(`${this.apiUrl}/usuario/${usuarioId}`, { withCredentials: true }).pipe(
      map(response => {
        console.log("🔍 Respuesta completa del backend:", response);  // 👈 Log para revisar la respuesta cruda

        return response.ventas.map(venta => ({
          ...venta,
          detalles: Array.isArray(venta.detalles) ? venta.detalles.map(detalle => ({
            ...detalle,
            producto: {
              ...detalle.producto,
              imagenes: detalle.producto?.imagenes || []  // 👈 Asegura que 'imagenes' exista
            }
          })) : []
        }));
      }),
      catchError(this.handleError)
    );
  }

  // 🔎 Obtener detalles de una venta específica
  getVentaById(ventaId: number): Observable<Venta> {
    return this.http.get<{ venta: Venta }>(`${this.apiUrl}/${ventaId}`, { withCredentials: true }).pipe(
      map(response => response.venta), // 🔹 Accede correctamente a `venta`
      catchError(this.handleError)
    );
  }

  // ❌ Manejo de errores
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Error inesperado, intenta nuevamente.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error de red: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 400:
          errorMessage = 'Solicitud inválida.';
          break;
        case 401:
          errorMessage = 'No autorizado. Inicia sesión para continuar.';
          break;
        case 404:
          errorMessage = 'No se encontró la venta.';
          break;
        case 500:
          errorMessage = 'Error en el servidor.';
          break;
      }
    }
    return throwError(() => new Error(errorMessage));
  }
}
