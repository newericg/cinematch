import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const tmdbInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.tmdbBaseUrl)) {
    return next(req);
  }

  return next(req.clone({
    params: req.params.set('api_key', environment.tmdbApiKey),
  }));
};
