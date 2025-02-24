import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { CsrfService } from '../csrf/csrf.service';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class PasswordService {
  private apiUrl = `${environment.API_URL}/password`;

  constructor(private http: HttpClient) {}

  sendVerificationCode(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/send-code`, { email, tipo_id: 1 });
  }

  verifyCode(email: string, code: string): Observable<any> {
    const verificationData = { email, code, tipo: 'pass_recovery' };
    return this.http.post(`${this.apiUrl}/verify-code`, verificationData);
  }

  changePassword(email: string, newPassword: string): Observable<any> {
    const passwordData = { email, newPassword };
    return this.http.post(`${this.apiUrl}/change-password`, passwordData);
  }
}
