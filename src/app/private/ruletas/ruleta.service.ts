import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class RuletaService {
  private readonly apiUrl = `${environment.API_URL}/ruletas`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> { return this.http.get<any[]>(this.apiUrl, { withCredentials: true }); }

  get(id: number): Observable<any> { return this.http.get(`${this.apiUrl}/${id}`, { withCredentials: true }); }

  create(data: FormData): Observable<any> { return this.http.post(this.apiUrl, data, { withCredentials: true }); }

  update(id: number, data: FormData): Observable<any> { return this.http.put(`${this.apiUrl}/${id}`, data, { withCredentials: true }); }

  delete(id: number): Observable<any> { return this.http.delete(`${this.apiUrl}/${id}`, { withCredentials: true }); }
}