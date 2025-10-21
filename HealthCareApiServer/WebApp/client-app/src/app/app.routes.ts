import { Routes } from '@angular/router';
import { AppointmentSchedulerComponent } from './appointments/appointment-scheduler/appointment-scheduler.component';
import { DoctorSchedulerComponent } from './doctor-scheduler/doctor-scheduler.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { roleGuard } from './auth/role.guard';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { ForbiddenComponent } from './errors/forbidden/forbidden.component';
import { PrescriptionHistoryComponent } from './prescriptions/prescription-history.component';
import { AppointmentHistoryComponent } from './appointments/appointment-history/appointment-history.component';
import { ROLE_ADMIN, ROLE_DOCTOR, ROLE_PATIENT } from './common/roles';
import { AdminUserManagementComponent } from './admin/admin-user-management/admin-user-management.component';
import { AdminAppointmentsComponent } from './admin/admin-appointments/admin-appointments.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'main-menu',
    pathMatch: 'full',
    data: {}
  },
  {
    path: 'main-menu', component: MainMenuComponent,
    canMatch: [roleGuard],
    data: { roles: ['Patient', 'Doctor'] }
  },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'doctor-register',
    component: RegisterComponent,
    canMatch: [roleGuard],
    data: { roles: [ROLE_ADMIN] }
  },
  {
    path: 'appointments/history',
    component: AppointmentHistoryComponent,
    canMatch: [roleGuard],
    data: { roles: [ROLE_PATIENT] }
  },
  {
    path: 'appointments',
    component: AppointmentSchedulerComponent,
    canMatch: [roleGuard],
    data: { roles: [ROLE_PATIENT, ROLE_DOCTOR] }
  },
  {
    path: 'prescriptions',
    component: PrescriptionHistoryComponent,
    canMatch: [roleGuard],
    data: { roles: [ROLE_PATIENT] }
  },
  {
    path: 'doctor-scheduler',
    component: DoctorSchedulerComponent,
    canMatch: [roleGuard],
    data: { roles: [ROLE_DOCTOR] }
  },
  {
    path: 'admin/users',
    component: AdminUserManagementComponent,
    canMatch: [roleGuard],
    data: { roles: [ROLE_ADMIN] }
  },
  {
    path: 'admin/appointments',
    component: AdminAppointmentsComponent,
    canMatch: [roleGuard],
    data: { roles: [ROLE_ADMIN] }
  },
  { path: 'forbidden', component: ForbiddenComponent },
  {
    path: '**', redirectTo: 'forbidden',
  }
];

