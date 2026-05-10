import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import { Router } from '@angular/router';
import { Observable, shareReplay, tap, finalize } from "rxjs";
import { AuthUser } from "../interfaces/user.interface";
import { environment } from "../../environments/environment";

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly http = inject(HttpClient);
    private readonly router = inject(Router);

    private readonly apiUrl = `${environment.apiUrl}/auth`;

    private readonly userSignal = signal<AuthUser | null>(null);

    readonly currentUser = this.userSignal.asReadonly();

    private refreshInProgress$: Observable<{ ok: boolean }> | null = null;

    login(dto: { email: string; password: string }) {
        return this.http.post<{ ok: boolean }>(`${this.apiUrl}/login`, dto);
    }

    refresh(): Observable<{ ok: boolean }> {
        if (!this.refreshInProgress$) {
            this.refreshInProgress$ = this.http
                .post<{ ok: boolean }>(`${this.apiUrl}/refresh`, {})
                .pipe(
                    finalize(() => this.refreshInProgress$ = null),
                    shareReplay(1)
                );
        }
        return this.refreshInProgress$;
    }

    logout() {
        return this.http.post<{ message: string }>(`${this.apiUrl}/logout`, {}).pipe(
            tap(() => {
                this.clearAuth();
                this.router.navigate(['/login']);
            })
        );
    }

    getMe() {
        return this.http.get<AuthUser>(`${this.apiUrl}/me`).pipe(
            tap(user => this.userSignal.set(user))
        );
    }

    clearAuth(): void {
        this.userSignal.set(null);
    }
}
