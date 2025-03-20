import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { environment } from '../../../../../src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionSistemaService {
  private readonly apiUrl = `${environment.API_URL}`;

  constructor(private readonly http: HttpClient) { }

  // Obtener la configuración actual
  getConfiguration(): Observable<any> {
    return this.http.get(`${this.apiUrl}/configuration`, { withCredentials: true });
  }

  // Actualizar la configuración del sistema
  updateConfiguration(configData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/configuration`, configData, { withCredentials: true });
  }
}
