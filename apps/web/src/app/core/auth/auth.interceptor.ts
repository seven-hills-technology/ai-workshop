import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { API_BASE } from '../config';
import { AuthService } from './auth.service';

const LOGIN_URL = `${API_BASE}/auth/login`;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.token();
  const authed =
    token !== null
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(authed).pipe(
    catchError((err: unknown) => {
      if (
        err instanceof HttpErrorResponse &&
        err.status === 401 &&
        req.url !== LOGIN_URL
      ) {
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => err);
    }),
  );
};
