import { HttpInterceptorFn } from '@angular/common/http';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  // Clonamos la petición y añadimos withCredentials: true
  const authReq = req.clone({
    withCredentials: true
  });
  return next(authReq);
};