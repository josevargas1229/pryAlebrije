import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class LogsService {
  private readonly apiUrl = `${environment.API_URL}/logs`;

  constructor(private readonly http: HttpClient) { }

  obtenerLogs(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}`,{withCredentials:true});
  }
}
