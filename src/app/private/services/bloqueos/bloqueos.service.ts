import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { environment } from '../../../../../src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class BloqueosService {
  private apiUrl = `${environment.API_URL}/bloqueos`;

  constructor(private http: HttpClient) { }

  obtenerUsuariosBloqueados(periodo?: string): Observable<any> {
    let params = new HttpParams();
    if (periodo) {
      params = params.set('periodo', periodo);
    }
    return this.http.get<any>(`${this.apiUrl}/`, { params, withCredentials: true });
  }

  bloquearUsuario(userId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/`, { account_id: userId }, { withCredentials: true });
  }

  obtenerBloqueosRecientes(dias?: number, cantidad?: number): Observable<any> {
    let params = new HttpParams();
    if (dias) {
      params = params.set('dias', dias.toString());
    }
    if (cantidad) { // Añadir la condición para cantidad
      params = params.set('cantidad', cantidad.toString());
    }
    return this.http.get<any>(`${this.apiUrl}/recientes`, { params, withCredentials: true });
  }
}
