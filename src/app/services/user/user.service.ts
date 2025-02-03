import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { Usuario } from './user.models';
import { environment } from '../../../environments/environment.development';
import { CsrfService } from '../csrf/csrf.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.API_URL}/users`;

  constructor(private http: HttpClient, private csrfService:CsrfService) {}

   // Obtener la información del usuario autenticado
  getUserInfo(): Observable<Usuario> {
    return this.http.get<Usuario>(this.apiUrl, { withCredentials:true });
  }

  // Actualizar la información del usuario autenticado
  updateUserInfo(userData: Partial<Usuario>): Observable<any> {
    return this.csrfService.getCsrfToken().pipe(
      switchMap(csrfToken => {
        return this.http.put(this.apiUrl, userData, {
          withCredentials: true,
          headers: {
            'x-csrf-token': csrfToken
          }
        });
      })
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.csrfService.getCsrfToken().pipe(
        switchMap(csrfToken => {
            return this.http.put(`${this.apiUrl}/change-password`, { currentPassword, newPassword }, {
                withCredentials: true,
                headers: {
                    'x-csrf-token': csrfToken
                }
            });
        })
    );
}

}
