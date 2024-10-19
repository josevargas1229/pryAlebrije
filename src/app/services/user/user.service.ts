import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from './user.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.API_URL}/users`;

  constructor(private http: HttpClient) {}

   // Obtener la información del usuario autenticado
  getUserInfo(): Observable<Usuario> {
    return this.http.get<Usuario>(this.apiUrl, { withCredentials:true });
  }

  // Actualizar la información del usuario autenticado
  updateUserInfo(userData: Partial<Usuario>): Observable<any> {
    return this.http.put(this.apiUrl, userData, { withCredentials:true  });
  }

  // Método para obtener el token JWT almacenado (puedes ajustar esto según tu implementación)
  private getToken(): string | null {
    return localStorage.getItem('token'); // Suponiendo que el token se almacena en localStorage
  }
}
