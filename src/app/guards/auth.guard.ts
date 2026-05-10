import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, map, of, switchMap } from 'rxjs';

export const authGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const cached = authService.currentUser();
    if (cached) {
        if (cached.role !== 'admin') {
            router.navigate(['/login']);
            return false;
        }
        return true;
    }

    const session$ = authService.getMe().pipe(
        catchError(() => authService.refresh().pipe(switchMap(() => authService.getMe())))
    );

    return session$.pipe(
        map((user) => {
            if (user.role !== 'admin') {
                router.navigate(['/login']);
                return false;
            }
            return true;
        }),
        catchError(() => {
            router.navigate(['/login']);
            return of(false);
        })
    );
};
