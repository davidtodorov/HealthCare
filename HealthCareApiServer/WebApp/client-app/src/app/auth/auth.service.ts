import { inject, Injectable } from '@angular/core';
import { IdentityService } from '../api/services';
import { BehaviorSubject, Observable, catchError, map, of, shareReplay, tap } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { UserAndRoles } from '../api/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private rolesCache$?: Observable<string[]>;
    private readonly loginState$ = new BehaviorSubject<boolean>(false);
    private readonly cookieService = inject(CookieService);

    private userId: number | null = null;
    private firstName: string | null = null;
    private lastName: string | null = null;

    constructor(private identityService: IdentityService) {
        this.updateLoginState();
    }

    getUserId(): number | null {
        return this.userId;
    }

    getUserFullName(): string | null {
        return `${this.firstName} ${this.lastName}`;
    }

    private setUser(user: UserAndRoles): void {
        this.userId = user.id ?? null;
        this.firstName = user.firstName ?? null;
        this.lastName = user.lastName ?? null;
    }

    private clearUser(): void {
        this.userId = null;
        this.firstName = null;
        this.lastName = null;
    }

    getRoles(): Observable<string[]> {
        if (!this.rolesCache$) {
            this.rolesCache$ = this.identityService
                .identityRoles()
                .pipe(
                    tap(userAndRoles => {
                        if (userAndRoles?.id) {
                            this.setUser(userAndRoles ?? null);
                        } else {
                            this.clearUser();
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
        this.clearUser();
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
        const cookieString = this.cookieService.get('.AspNetCore.Identity.Application') ?? '';
        return !!cookieString;
    }
}
