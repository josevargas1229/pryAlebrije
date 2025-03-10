import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface AuditLog {
  id: number;
  usuario_id: number;
  nombre_usuario: string;
  rol: string;
  modulo: string;
  accion: string;
  detalle: string;
  created_at: string;
}
@Injectable({
  providedIn: 'root'
})
export class HistorialService {
  private apiUrl = `${environment.API_URL}/historial`;

  constructor(private http: HttpClient) {}

  getAuditLogs(modulo?: string): Observable<AuditLog[]> {
    const url = modulo ? `${this.apiUrl}?modulo=${modulo}` : this.apiUrl;
    return this.http.get<AuditLog[]>(url);
  }
}
