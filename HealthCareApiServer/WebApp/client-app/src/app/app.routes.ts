import { Routes } from '@angular/router';
import { AppointmentSchedulerComponent } from './features/appointment-scheduler/appointment-scheduler.component';
import { DoctorSchedulerComponent } from './doctor-scheduler/doctor-scheduler.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { roleGuard } from './auth/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'appointments', component: AppointmentSchedulerComponent },
  {
    path: 'doctor-scheduler',
    component: DoctorSchedulerComponent,
    canMatch: [roleGuard],
    data: { roles: ['Doctor'] }
  },
  { path: '**', redirectTo: 'appointments' }
];
