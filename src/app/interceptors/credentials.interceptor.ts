import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

/** Чтобы с браузера уходил httpOnly refresh-cookie на API (другой origin). */
export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
    try {
        const origin = new URL(environment.apiUrl).origin;
        if (req.url.startsWith(origin)) {
            req = req.clone({ withCredentials: true });
        }
    } catch {
        /* ignore malformed apiUrl */
    }
    return next(req);
};
