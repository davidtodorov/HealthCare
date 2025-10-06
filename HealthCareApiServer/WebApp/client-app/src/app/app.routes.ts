import { Routes } from '@angular/router';
import { AppointmentSchedulerComponent } from './features/appointment-scheduler/appointment-scheduler.component';
import { DoctorSchedulerComponent } from './doctor-scheduler/doctor-scheduler.component';

export const routes: Routes = [
  { path: '', redirectTo: 'doctor-scheduler', pathMatch: 'full' },
  { path: 'appointments', component: AppointmentSchedulerComponent },
  { path: 'doctor-scheduler', component: DoctorSchedulerComponent },
  { path: '**', redirectTo: 'appointments' }
];
