import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

export interface ImagenProducto {
  id: number;
  url: string;
  // agrega otros campos si los necesitas
}
export interface TipoProducto {
  id: number;
  nombre: string;
}

export interface Producto {
  id: number;
  nombre: string;
  imagenes?: ImagenProducto[];   // ← opcional
  tipoProducto?: TipoProducto;   // ← opcional
}


export interface Promocion {
  id: number;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  tipo: string;
  descuento: number;
  productos: Producto[];
}

@Injectable({
  providedIn: 'root'
})
export class PromocionService {
  private apiUrl = `${environment.API_URL}/promociones`;

  constructor(private http: HttpClient) {}

  getPromocionesActivas(): Observable<Promocion[]> {
    return this.http.get<Promocion[]>(`${this.apiUrl}/activas`, { withCredentials: true });
  }
  getTodas(): Observable<Promocion[]> {
  return this.http.get<Promocion[]>(this.apiUrl, { withCredentials: true });
}

crear(promocion: any): Observable<any> {
  return this.http.post(this.apiUrl, promocion, { withCredentials: true });
}

actualizar(id: number, promocion: any): Observable<any> {
  return this.http.put(`${this.apiUrl}/${id}`, promocion, { withCredentials: true });
}

eliminar(id: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/${id}`, { withCredentials: true });
}

}
