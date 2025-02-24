import { HttpInterceptorFn } from '@angular/common/http';
import { catchError } from 'rxjs';
import { ErrorHandlerService } from '../services/error/error-handler.service';
import { inject } from '@angular/core';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorHandler = inject(ErrorHandlerService);  // Inyectamos ErrorHandlerService

  // Asegúrate de que next.handle() se usa correctamente
  return next(req).pipe(
    catchError(error => errorHandler.handleError(error))  // Manejo de errores
  );
};
