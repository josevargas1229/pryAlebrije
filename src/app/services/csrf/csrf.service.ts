import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment.example';


@Injectable({
  providedIn: 'root'
})
export class CsrfService {
  private csrfTokenUrl = `${environment.API_URL}/csrf-token`;
  public csrfToken: string = '';

  constructor(private http: HttpClient) {
    this.getCsrfToken().subscribe();
  }

  // Obtener el token CSRF
  getCsrfToken(): Observable<string> {
    return this.http.get<{ csrfToken: string }>(this.csrfTokenUrl, { withCredentials: true })
      .pipe(
        tap(response => {
          this.csrfToken = response.csrfToken;
        }),
        map(response => response.csrfToken)
      );
  }

  // Método para hacer una solicitud POST protegida por CSRF
  postWithCsrf(url: string, body: any, csrfToken: string): Observable<any> {
    const headers = new HttpHeaders().set('x-csrf-token', csrfToken); // Incluir el token CSRF en el encabezado
    return this.http.post(url, body, { headers });
  }
}
