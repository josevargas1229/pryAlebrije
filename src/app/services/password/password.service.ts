import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { CsrfService } from '../csrf/csrf.service';

@Injectable({
  providedIn: 'root'
})
export class PasswordService {
  private apiUrl = 'http://localhost:3000/password';

  constructor(private http: HttpClient, private csrfService: CsrfService) {}

  sendVerificationCode(email: string): Observable<any> {
    return this.csrfService.getCsrfToken().pipe(
      switchMap(csrfToken => {
        console.log(csrfToken)
        return this.http.post(`${this.apiUrl}/send-code`, { email }, {
          withCredentials: true,
          headers: {
            'x-csrf-token': csrfToken
          }
        });
      })
    );
  }

  verifyCode(email: string, verificationCode: string): Observable<any> {
    return this.csrfService.getCsrfToken().pipe(
      switchMap(csrfToken => {
        const verificationData = { email, verificationCode };
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
