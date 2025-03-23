import { HttpInterceptorFn } from '@angular/common/http';

export const httpHeadersInterceptor: HttpInterceptorFn = (req, next) => {
  if (!(req.url.includes('login') || req.url.includes('signin'))) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
  }
  return next(req);
};
