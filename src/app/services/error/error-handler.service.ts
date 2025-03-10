import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  constructor(private router: Router, private http: HttpClient) {}

  handleError(error: HttpErrorResponse) {
    if (error.status === 429) {
      this.router.navigate(['/error-429']);
    } else if (error.status === 500) {
      this.router.navigate(['/error-500']);
    } else {
      console.error('Unhandled error:', error);
    }
    return throwError(() => error);
  }
}