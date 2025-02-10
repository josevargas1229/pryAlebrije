import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { environment } from '../../../../../src/environments/environment.development';
import { CsrfService } from '../../../../../src/app/services/csrf/csrf.service';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionSistemaService {
  private apiUrl = `${environment.API_URL}`;

  constructor(private http: HttpClient,private csrfService: CsrfService) {}

  // Obtener la configuración actual
  getConfiguration(): Observable<any> {
    return this.http.get(`${this.apiUrl}/configuration`,{withCredentials:true});
  }

  // Actualizar la configuración del sistema
  updateConfiguration(configData: any): Observable<any> {
    return this.csrfService.getCsrfToken().pipe(
      switchMap(csrfToken => {
        return this.http.put(`${this.apiUrl}/configuration`, configData, {
          headers: {
            'x-csrf-token': csrfToken
          },
          withCredentials: true
        });
      })
    );
  }
}
