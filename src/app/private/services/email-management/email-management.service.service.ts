import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../src/environments/environment.development';
import { Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmailManagementService {
  private apiUrl = `${environment.API_URL}`;

  constructor(private http: HttpClient) { }

  getAllTemplates(): Observable<any> {
    return this.http.get(`${this.apiUrl}/email-templates`, { withCredentials: true });
  }

  createTemplate(templateData: any) {
    return this.http.post(`${this.apiUrl}/email-templates`, templateData, { withCredentials: true });
  }

  updateTemplate(id: number, templateData: any) {
    return this.http.put(`${this.apiUrl}/email-templates/${id}`, templateData, { withCredentials: true });
  }

  deleteTemplate(id: number) {
    return this.http.delete(`${this.apiUrl}/email-templates/${id}`, { withCredentials: true });
  }

  getAllTypes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/email-types`, { withCredentials: true });
  }

  createType(typeData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/email-types`, typeData, { withCredentials: true });
  }
  updateType(typeId: number, typeData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/email-types/${typeId}`, typeData, { withCredentials: true });
  }

  deleteType(typeId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/email-types/${typeId}`, { withCredentials: true });
  }
}
