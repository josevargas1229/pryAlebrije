import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface LowStockProduct {
  id: number;
  nombre: string;
  stock: number;
  categoria: string;
  talla: string;
  color: { nombre: string; hex: string };
}

export interface LowStockResponse {
  productos: LowStockProduct[];
  nivel_minimo_default: number;
}
@Injectable({
  providedIn: 'root'
})
export class LowStockService {
  private readonly apiUrl = `${environment.API_URL}/producto/low-stock`; 

  constructor(private readonly http: HttpClient) {}

  getLowStockProducts(): Observable<LowStockResponse> {
    return this.http.get<LowStockResponse>(this.apiUrl, { withCredentials: true });
  }
}