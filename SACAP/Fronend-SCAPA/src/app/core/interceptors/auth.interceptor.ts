import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si es una petición al auth/login no adjuntamos token normal
  if (req.url.includes('/auth/login')) {
    return next(req);
  }

  const token = authService.getToken();
  let authReq = req;

  if (token && !req.headers.has('Authorization')) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError(err => {
      if (err.status === 401 || err.status === 403) {
        // Si el backend devuelve 401/403, significa que está encendido pero el token (incluso el mock) es inválido.
        // Forzamos el deslogueo para que el usuario pueda obtener un token real.
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => err);
    })
  );
};
