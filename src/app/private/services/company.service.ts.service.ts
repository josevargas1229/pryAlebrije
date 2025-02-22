import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, switchMap, tap } from 'rxjs';
import { environment } from '../../../../src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private apiUrl = `${environment.API_URL}`;
  private companyProfileSubject = new BehaviorSubject<any>(null);
  companyProfile$ = this.companyProfileSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadInitialCompanyProfile();
  }

  private loadInitialCompanyProfile(): void {
    this.getCompanyProfile().subscribe();
  }

  getCompanyProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/perfil`).pipe(
      tap((profile) => this.companyProfileSubject.next(profile))
    );
  }

  updateCompanyProfile(formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/perfil`, formData, {
      withCredentials: true
    }).pipe(
      tap(() => this.getCompanyProfile().subscribe())
    );
  }
}
