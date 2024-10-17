import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from './user.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
<<<<<<< HEAD
  private apiUrl = 'http://localhost:3000/users';
=======
  private apiUrl = `${environment.API_URL}`;
  
>>>>>>> 22b771e68e4465978bbef8d7f07c24479e930864

  constructor(private http: HttpClient) { }

  getUser(id: number, options?: { headers?: HttpHeaders }): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`, options);
  }
}
