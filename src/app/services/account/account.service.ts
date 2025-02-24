import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { CsrfService } from '../csrf/csrf.service';
import { environment } from '../../../environments/environment.development';



@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = `${environment.API_URL}/password/check`;

  constructor(private http: HttpClient) {}

  checkPassword(password: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(this.apiUrl, { password }, { withCredentials: true });
  }
}
