import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Premio } from './models';

@Injectable({ providedIn: 'root' })
export class PremioService {
  private base = environment.API_URL;
  private url = `${this.base}/premios`;

  constructor(private http: HttpClient) {}

  listPremios(): Observable<Premio[]> {
    return this.http.get<Premio[]>(this.url, { withCredentials: true });
  }

  getPremio(id: number): Observable<Premio> {
    return this.http.get<Premio>(`${this.url}/${id}`, { withCredentials: true });
  }

  createPremio(body: Partial<Premio>): Observable<Premio> {
    return this.http.post<Premio>(this.url, body, { withCredentials: true });
  }

  updatePremio(id: number, body: Partial<Premio>): Observable<Premio> {
    return this.http.put<Premio>(`${this.url}/${id}`, body, { withCredentials: true });
  }

  deletePremio(id: number) {
    return this.http.delete(`${this.url}/${id}`, { withCredentials: true });
  }
}
