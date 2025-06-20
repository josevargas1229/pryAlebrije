import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

export interface Transaccion {
  id: number;
  usuario_id: number;
  venta_id: number;
  estado: string;
  metodo_pago: string;
  fecha_transaccion: string;
  usuario?: {
    nombre: string;
    email: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class TransaccionesService {
  private apiUrl = `${environment.API_URL}/transacciones`;

  constructor(private http: HttpClient) {}

  getTransacciones(): Observable<Transaccion[]> {
    return this.http.get<Transaccion[]>(this.apiUrl, { withCredentials: true });
  }
}
