import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiConfiguration } from '../../api/api-configuration';

@Injectable({ providedIn: 'root' })
export class AdminUserService {
  private readonly http = inject(HttpClient);
  private readonly apiConfiguration = inject(ApiConfiguration);

  changePassword(userId: number, password: string): Observable<void> {
    const url = `${this.apiConfiguration.rootUrl}/api/User/${userId}/password`;
    return this.http.put<void>(url, { password });
  }
}
