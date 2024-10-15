import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { CsrfService } from '../csrf.service';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = 'http://localhost:3000/check-password';

  constructor(private http: HttpClient, private csrfService: CsrfService) {}

  checkPassword(password: string): Observable<{ message: string }> {
    return this.csrfService.getCsrfToken().pipe(
      switchMap(csrfToken => {
        const headers = new HttpHeaders({
          'x-csrf-token': csrfToken
        });
        return this.http.post<{ message: string }>(this.apiUrl, { password }, { headers, withCredentials: true });
      })
    );
  }
}
