import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = 'http://localhost:3000/check-password'; // Cambia la URL si es necesario

  constructor(private http: HttpClient) {}

  checkPassword(password: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(this.apiUrl, { password });
  }
}
