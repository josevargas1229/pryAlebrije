import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { CsrfService } from '../services/csrf/csrf.service';
import { switchMap } from 'rxjs';

export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  const csrfService = inject(CsrfService);

  // Solo interceptamos métodos que necesitan CSRF
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    return csrfService.getCsrfToken().pipe(
      switchMap(csrfToken => {
        const clonedRequest = req.clone({
          setHeaders: {
            'x-csrf-token': csrfToken
          },
          withCredentials: true
        });
        return next(clonedRequest);
      })
    );
  }

  // Si es GET u otro método, no lo modificamos
  return next(req);
};
