import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { map, Observable } from 'rxjs';
import { ROLE_ADMIN, ROLE_DOCTOR, ROLE_PATIENT } from '../common/roles';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main-menu.component.html',
  styleUrl: './main-menu.component.scss'
})
export class MainMenuComponent {
  constructor(private router: Router) { }

  authService: AuthService = inject(AuthService);
  
  getUserFullName(): string | null {
    return this.authService.getUserFullName();
  }

  readonly isAdminRole$: Observable<boolean> = this.authService.getRoles().pipe(
    map(roles => roles.includes(ROLE_ADMIN))
  );

  readonly isDoctorRole$: Observable<boolean> = this.authService.getRoles().pipe(
    map(roles => roles.includes(ROLE_DOCTOR))
  );

  readonly isPatientRole$: Observable<boolean> = this.authService.getRoles().pipe(
    map(roles => roles.includes(ROLE_PATIENT))
  );

  goToCreateAppointment() {
    this.router.navigate(['/appointments']);
  }

  goToDoctorSchedule() {
    this.router.navigate(['/doctor-scheduler']);
  }

  goToDoctorRegister() {
    this.router.navigate(['/doctor-register'], {
      state: { isDoctorRegister: true }
    });
  }

  goToPrescriptions() {
    this.router.navigate(['/prescriptions']);
  }

}
