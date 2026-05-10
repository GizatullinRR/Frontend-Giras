import { HttpInterceptorFn, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

/** Не пытаемся refresh по 401 на самих эндпоинтах входа/регистрации/обновления токена. */
const SKIP_REFRESH_ON_401 = /\/auth\/(login|register|refresh)(?:\?|$)/i;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401 && !SKIP_REFRESH_ON_401.test(req.url)) {
                return authService.refresh().pipe(
                    switchMap(() => next(req)),
                    catchError(() => {
                        authService.clearAuth();
                        router.navigate(['/login']);
                        return throwError(() => error);
                    })
                );
            }
            return throwError(() => error);
        })
    );
};
