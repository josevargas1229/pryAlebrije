import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from './user.models';
import { environment } from '../../../environments/environment.example';

@Injectable({
  providedIn: 'root'
})
export class UserService {


  private apiUrl = `${environment.API_URL}`;



  constructor(private http: HttpClient) { }

  getUser(id: number, options?: { headers?: HttpHeaders }): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`, options);
  }
}
