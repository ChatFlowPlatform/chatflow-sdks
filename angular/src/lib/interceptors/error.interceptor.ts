import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/login')) {
        // Try to refresh token
        return authService.refreshToken().pipe(
          switchMap(() => {
            // Retry the request with new token
            const token = authService.getToken();
            const cloned = req.clone({
              setHeaders: {
                Authorization: `Bearer ${token}`
              }
            });
            return next(cloned);
          }),
          catchError(refreshError => {
            // Refresh failed, logout
            authService.logout().subscribe();
            return throwError(() => refreshError);
          })
        );
      }

      // Handle other errors
      let errorMessage = 'An error occurred';
      
      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Server-side error
        errorMessage = error.error?.message || `Error Code: ${error.status}\nMessage: ${error.message}`;
      }

      console.error('HTTP Error:', errorMessage);
      return throwError(() => error);
    })
  );
};
