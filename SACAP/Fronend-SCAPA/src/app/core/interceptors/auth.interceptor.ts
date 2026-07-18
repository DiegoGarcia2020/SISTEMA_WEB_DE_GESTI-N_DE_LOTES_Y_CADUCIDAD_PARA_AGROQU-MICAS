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
        // Evitar desloguear si estamos en modo mock y el backend devuelve 401 por no reconocer el token mock
        if (token && token.includes('mock')) {
          console.warn('⚠️ Backend rechazó el token mock con 401/403. Delegando al servicio para fallback.');
        } else {
          authService.logout();
          router.navigate(['/login']);
        }
      }
      return throwError(() => err);
    })
  );
};
