import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { CsrfService } from '../services/csrf/csrf.service';
import { switchMap } from 'rxjs';

export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  const csrfService = inject(CsrfService);

  // Solo interceptamos métodos que necesitan CSRF
  // csrf.interceptor.ts
if (['POST','PUT','PATCH','DELETE'].includes(req.method) && !req.url.endsWith('/auth/login')) {
  return csrfService.getCsrfToken().pipe(
    switchMap(csrfToken => next(req.clone({
      setHeaders: { 'x-csrf-token': csrfToken },
      withCredentials: true
    })))
  );
}
return next(req);

};
