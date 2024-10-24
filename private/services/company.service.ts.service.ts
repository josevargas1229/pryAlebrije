import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private apiUrl = `${environment.API_URL}`; // Define tu URL base aquí

  constructor(private http: HttpClient) {}

  // Obtener el perfil de la empresa
  getCompanyProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/perfil`);
  }

  // Actualizar el perfil de la empresa
  updateCompanyProfile(formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/perfil`, formData);
  }
}
