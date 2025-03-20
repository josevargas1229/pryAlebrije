import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
