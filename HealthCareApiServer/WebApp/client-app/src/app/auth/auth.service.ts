import { Injectable } from '@angular/core';
import { IdentityService } from '../api/services';
import { catchError, map, Observable, of, shareReplay } from 'rxjs';

@Injectable({providedIn: 'root'})
export class AuthService {
    private rolesCache$?: Observable<string[]>;
    
    constructor(private identityService: IdentityService) { 

    }

    getRoles(): Observable<string[]> {
        if (!this.rolesCache$) {
            this.rolesCache$ = this.identityService.apiIdentityRolesGet$Json()
            .pipe(
                map(r => r ?? []),
                shareReplay(1),
                catchError(() => of([])) // treat failures as no roles
            );
        }
        return this.rolesCache$;
    }

    clear() { this.rolesCache$ = undefined; }
    
}