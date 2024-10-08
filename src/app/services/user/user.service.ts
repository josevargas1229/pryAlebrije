
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from './user.models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = process.env['API_URL'];

  constructor(private http: HttpClient) { }

  getUser(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  updateUser(id: number, userData: Partial<Usuario>): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, userData);
  }

  // Otros métodos relacionados con usuarios...
}