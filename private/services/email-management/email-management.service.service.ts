import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../src/environments/environment.development';
import { Observable, switchMap } from 'rxjs';
import { CsrfService } from '../../../src/app/services/csrf/csrf.service';

@Injectable({
  providedIn: 'root'
})
export class EmailManagementService {
  private apiUrl = `${environment.API_URL}`;

  constructor(
    private http: HttpClient,
    private csrfService: CsrfService
  ) {}

  getAllTemplates(): Observable<any> {
    return this.http.get(`${this.apiUrl}/email-templates`,{withCredentials:true});
  }

  createTemplate(templateData: any) {
    return this.csrfService.getCsrfToken().pipe(
      switchMap(csrfToken => {
        console.log(csrfToken)
        return this.http.post(`${this.apiUrl}/email-templates`, templateData, {
          headers: {
            'x-csrf-token': csrfToken // Incluir el token CSRF en el encabezado
          },
          withCredentials: true
        });
      })
    );
  }

  updateTemplate(id: number, templateData: any) {
    return this.csrfService.getCsrfToken().pipe(
      switchMap(csrfToken => {
        return this.http.put(`${this.apiUrl}/email-templates/${id}`, templateData, {
          headers: {
            'x-csrf-token': csrfToken
          },
          withCredentials: true
        });
      })
    );
  }

  deleteTemplate(id: number) {
    return this.csrfService.getCsrfToken().pipe(
      switchMap(csrfToken => {
        return this.http.delete(`${this.apiUrl}/email-templates/${id}`, {
          headers: {
            'x-csrf-token': csrfToken
          },
          withCredentials: true
        });
      })
    );
  }

  getAllTypes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/email-types`,{withCredentials:true});
  }

  createType(typeData: any): Observable<any> {
    return this.csrfService.getCsrfToken().pipe(
      switchMap(csrfToken => {
        console.log(csrfToken)
        return this.http.post(`${this.apiUrl}/email-types`, typeData, {
          headers: {
            'x-csrf-token': csrfToken // Incluir el token CSRF en el encabezado
          },
          withCredentials: true
        });
      })
    );
  }
  updateType(typeId: number, typeData: any): Observable<any> {
    return this.csrfService.getCsrfToken().pipe(
      switchMap(csrfToken => {
        return this.http.put(`${this.apiUrl}/email-types/${typeId}`, typeData, {
          headers: {
            'x-csrf-token': csrfToken
          },
          withCredentials: true
        });
      })
    );
  }

  deleteType(typeId: number): Observable<any> {
    return this.csrfService.getCsrfToken().pipe(
      switchMap(csrfToken => {
        return this.http.delete(`${this.apiUrl}/email-types/${typeId}`, {
          headers: {
            'x-csrf-token': csrfToken
          },
          withCredentials: true
        });
      })
    );
  }
}
