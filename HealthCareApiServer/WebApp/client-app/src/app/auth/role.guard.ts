import { inject } from '@angular/core';
import { CanMatchFn, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';
import { catchError, map, of } from 'rxjs';
import { ROLE_ADMIN } from '../common/roles';

export const roleGuard: CanMatchFn = (route, segments) => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const required = (route.data?.['roles'] as string[]) ?? [];

  return auth.getRoles().pipe(
    map(roles => {
      if (required.length === 0
        || roles.includes(ROLE_ADMIN)
        || required.some(r => roles.includes(r))) {
        return true;
      }
      if(auth.isLoggedIn()) {
        return router.createUrlTree(['/forbidden']);
      }
      return router.createUrlTree(['/login']);
    }),
    catchError(() => of(router.createUrlTree(['/login'])))
  );
};
