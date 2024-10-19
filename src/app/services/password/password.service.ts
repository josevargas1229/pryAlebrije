import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { CsrfService } from '../csrf/csrf.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PasswordService {
  private apiUrl = `${environment.API_URL}/password`;

  constructor(private http: HttpClient, private csrfService: CsrfService) {}

  sendVerificationCode(email: string): Observable<any> {
    return this.csrfService.getCsrfToken().pipe(
      switchMap(csrfToken => {
        console.log(csrfToken)
        return this.http.post(`${this.apiUrl}/send-code`, { email, tipo_id:1 }, {
          withCredentials: true,
          headers: {
            'x-csrf-token': csrfToken
          }
        });
      })
    );
  }

  verifyCode(email: string, code: string): Observable<any> {
    return this.csrfService.getCsrfToken().pipe(
      switchMap(csrfToken => {
        const verificationData = { email, code };
        return this.http.post(`${this.apiUrl}/verify-code`, verificationData, {
          withCredentials: true,
          headers: {
            'x-csrf-token': csrfToken
          }
        });
      })
    );
  }

  changePassword(email: string, newPassword: string): Observable<any> {
    return this.csrfService.getCsrfToken().pipe(
      switchMap(csrfToken => {
        const passwordData = { email, newPassword };
        return this.http.post(`${this.apiUrl}/change-password`, passwordData,{
          withCredentials: true,
          headers: {
            'x-csrf-token': csrfToken
          }
        });
      })
    );
  }
}
