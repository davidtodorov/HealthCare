import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { EnumTextPipe } from '../../common/enumPipe';
import { AppointmentService } from '../../api/services';
import { AppointmentModel, AppointmentStatus } from '../../api/models';
import { AuthService } from '../../auth/auth.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-appointment-history',
  standalone: true,
  imports: [CommonModule, EnumTextPipe],
  templateUrl: './appointment-history.component.html',
  styleUrl: './appointment-history.component.scss'
})
export class AppointmentHistoryComponent implements OnInit {
  readonly AppointmentStatus = AppointmentStatus;

  isLoading = false;
  errorMessage: string | null = null;
  appointments: AppointmentModel[] = [];

  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly authService: AuthService
  ) { }

  ngOnInit(): void {
    this.ensureUserAndLoadAppointments();
  }

  get upcomingAppointments(): AppointmentModel[] {
    return this.appointments
      .filter(a => a.status === AppointmentStatus.Upcoming)
      .sort((a, b) => a.dateTime.localeCompare(b.dateTime));
  }

  get pastAppointments(): AppointmentModel[] {
    return this.appointments
      .filter(a => a.status !== AppointmentStatus.Upcoming)
      .sort((a, b) => b.dateTime.localeCompare(a.dateTime));
  }

  trackByAppointment = (_: number, appointment: AppointmentModel) => appointment.id ?? appointment.dateTime;

  statusBadgeClasses(status: AppointmentStatus): string {
    switch (status) {
      case AppointmentStatus.Completed:
        return 'bg-emerald-100 text-emerald-700';
      case AppointmentStatus.Canceled:
        return 'bg-rose-100 text-rose-700';
      case AppointmentStatus.Upcoming:
      default:
        return 'bg-indigo-100 text-indigo-700';
    }
  }

  private ensureUserAndLoadAppointments(): void {
    const userId = this.authService.getUserId();
    if (userId == null) {
      this.isLoading = true;
      this.authService.getRoles().pipe(take(1)).subscribe({
        next: () => this.fetchAppointments(),
        error: () => {
          this.isLoading = false;
          this.errorMessage = 'We could not verify your account details. Please try again.';
        }
      });
      return;
    }

    this.fetchAppointments();
  }

  private fetchAppointments(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.appointmentService.appointmentGetCurrentPatientAppointments().pipe(take(1)).subscribe({
      next: appointments => {

        this.appointments = appointments.sort((a, b) => a.dateTime.localeCompare(b.dateTime));
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'We could not load your appointments right now. Please try again later.';
        this.isLoading = false;
      }
    });
  }
}
