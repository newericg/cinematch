import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { ApiKeyService } from '../services/api-key.service';
import { environment } from '../../../environments/environment';

export const tmdbInterceptor: HttpInterceptorFn = (req, next) => {
  const apiKeyService = inject(ApiKeyService);

  if (!req.url.startsWith(environment.tmdbBaseUrl)) {
    return next(req);
  }

  const apiKey = apiKeyService.apiKey();
  if (!apiKey) {
    return next(req);
  }

  const modified = req.clone({
    params: req.params.set('api_key', apiKey),
  });

  return next(modified);
};
