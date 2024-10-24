import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { environment } from '../../src/environments/environment';
import { CsrfService } from '../../src/app/services/csrf/csrf.service';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private apiUrl = `${environment.API_URL}`; // Define tu URL base aquí

  constructor(private http: HttpClient, private csrfService:CsrfService) {}

  // Obtener el perfil de la empresa
  getCompanyProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/perfil`);
  }

  // Actualizar el perfil de la empresa
  updateCompanyProfile(formData: FormData): Observable<any> {
    return this.csrfService.getCsrfToken().pipe(
      switchMap(csrfToken => {
        console.log(csrfToken)
        return this.http.put(`${this.apiUrl}/perfil`, formData, {
          headers: {
            'x-csrf-token': csrfToken // Incluir el token CSRF en el encabezado
          },
          withCredentials: true
        });
      })
    );
  }
}
