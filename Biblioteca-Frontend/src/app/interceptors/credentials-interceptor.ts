// src/app/interceptors/credentials-interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { catchError, throwError } from 'rxjs';

const TOKEN_KEY = 'authToken';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.endsWith('/auth/login') || req.url.endsWith('/auth/registro')) {
    return next(req);
  }

  const token = sessionStorage.getItem(TOKEN_KEY);
  if (!token || !req.url.startsWith(`${environment.apiUrl}/`)) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });
  return next(authReq).pipe(
    catchError(error => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        sessionStorage.removeItem(TOKEN_KEY);
      }
      return throwError(() => error);
    })
  );
};