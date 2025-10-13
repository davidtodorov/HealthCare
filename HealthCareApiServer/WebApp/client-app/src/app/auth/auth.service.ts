import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { IdentityService } from '../api/services';
import { BehaviorSubject, Observable, catchError, map, of, shareReplay, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private rolesCache$?: Observable<string[]>;
    private readonly loginState$ = new BehaviorSubject<boolean>(false);

    private userId: number | null = null;

    constructor(private identityService: IdentityService, @Inject(DOCUMENT) private document: Document) {
        this.updateLoginState();
    }

    getUserId(): number | null {
        return this.userId;
    }

    private setUserId(userId: number | null): void {
        this.userId = userId;
    }

    private clearUserId(): void {
        this.userId = null;
    }

    getRoles(): Observable<any> {
        if (!this.rolesCache$) {
            this.rolesCache$ = this.identityService
                .identityRoles()
                .pipe(
                    tap(userAndRoles => {
                        if (userAndRoles?.id) {
                            this.setUserId(userAndRoles.id ?? null);
                        } else {
                            this.clearUserId();
                        }
                    }),
                    map(userAndRoles => userAndRoles?.roles ?? []),
                    catchError(() => of([])),
                    tap(roles => this.updateLoginState(roles)),
                    shareReplay(1)
                );
        }

        return this.rolesCache$;
    }

    isLoggedIn(): Observable<boolean> {
        this.updateLoginState();
        return this.loginState$.asObservable();
    }

    clear(): void {
        this.rolesCache$ = undefined;
        this.updateLoginState();
        this.clearUserId();
    }

    updateLoginStateFromCookie(): void {
        this.updateLoginState();
    }

    logout(): Observable<void> {
        return this.identityService.identityLogout().pipe(
            map(() => void 0),
            tap(() => {
                this.rolesCache$ = undefined;
                this.loginState$.next(false);
            }),
            catchError(() => {
                this.rolesCache$ = undefined;
                this.loginState$.next(false);
                return of(void 0);
            })
        );
    }

    private updateLoginState(latestRoles?: string[]): void {
        const hasCookie = this.hasAuthCookie();
        const hasRoles = Array.isArray(latestRoles) ? latestRoles.length > 0 : this.loginState$.value;
        this.loginState$.next(hasCookie || !!hasRoles);
    }

    private hasAuthCookie(): boolean {
        const cookieString = this.document?.cookie ?? '';
        return cookieString.split(';').some(part => part.trim().startsWith('.AspNetCore.Identity.Application='));
    }
}
