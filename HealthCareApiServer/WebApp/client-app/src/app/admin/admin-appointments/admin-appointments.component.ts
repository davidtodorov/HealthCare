import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AppointmentModel, AppointmentStatus } from '../../api/models';
import { AppointmentService } from '../../api/services';

@Component({
  selector: 'app-admin-appointments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: './admin-appointments.component.html',
  styleUrl: './admin-appointments.component.scss'
})
export class AdminAppointmentsComponent implements OnInit, OnDestroy {
  private readonly appointmentService = inject(AppointmentService);
  private readonly fb = inject(FormBuilder);

  private readonly appointmentSub = new Subscription();

  readonly filtersForm = this.fb.nonNullable.group({
    doctor: 'all',
    patient: 'all',
    status: 'all'
  });

  readonly editForm = this.fb.nonNullable.group({
    status: AppointmentStatus.Upcoming,
    notes: ''
  });

  readonly appointments = signal<AppointmentModel[]>([]);
  readonly filteredAppointments = signal<AppointmentModel[]>([]);
  readonly selectedAppointment = signal<AppointmentModel | null>(null);

  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly saving = signal(false);
  readonly saveError = signal<string | null>(null);
  readonly saveSuccess = signal<string | null>(null);

  readonly statusOptions = computed(() =>
    Object.values(AppointmentStatus).filter((value): value is AppointmentStatus => typeof value === 'number')
  );

  readonly doctorNames = computed(() => {
    const names = new Set<string>();
    for (const appointment of this.appointments()) {
      if (appointment.doctorName) {
        names.add(appointment.doctorName);
      }
    }
    return Array.from(names).sort();
  });

  readonly patientNames = computed(() => {
    const names = new Set<string>();
    for (const appointment of this.appointments()) {
      const patientName = this.getPatientName(appointment);
      if (patientName) {
        names.add(patientName);
      }
    }
    return Array.from(names).sort();
  });

  ngOnInit(): void {
    this.loadAppointments();
    this.appointmentSub.add(
      this.filtersForm.valueChanges.subscribe(() => this.applyFilters())
    );
  }

  ngOnDestroy(): void {
    this.appointmentSub.unsubscribe();
  }

  loadAppointments(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.appointmentService.appointmentGetAll().pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: appointments => {
        const sorted = [...appointments].sort((a, b) => a.dateTime!.localeCompare(b.dateTime!));
        this.appointments.set(sorted);
        this.applyFilters();
        if (sorted.length > 0) {
          this.selectAppointment(sorted[0]);
        }
      },
      error: () => {
        this.loadError.set('Unable to load appointments. Please try again later.');
      }
    });
  }

  applyFilters(): void {
    const { doctor, patient, status } = this.filtersForm.getRawValue();
    const filtered = this.appointments().filter(appointment => {
      if (doctor !== 'all' && appointment.doctorName !== doctor) {
        return false;
      }
      const patientName = this.getPatientName(appointment);
      if (patient !== 'all' && patientName !== patient) {
        return false;
      }
      if (status !== 'all' && appointment.status?.toString() !== status) {
        return false;
      }
      return true;
    });
    this.filteredAppointments.set(filtered);
    const selected = this.selectedAppointment();
    if (selected) {
      const stillPresent = filtered.find(a => a.id === selected.id);
      if (!stillPresent) {
        this.selectedAppointment.set(filtered.length > 0 ? filtered[0] : null);
      }
    }
  }

  selectAppointment(appointment: AppointmentModel): void {
    this.selectedAppointment.set(appointment);
    this.saveError.set(null);
    this.saveSuccess.set(null);
    this.editForm.patchValue({
      status: appointment.status ?? AppointmentStatus.Upcoming,
      notes: appointment.notes ?? ''
    });
  }

  saveChanges(): void {
    const appointment = this.selectedAppointment();
    if (!appointment) {
      return;
    }

    const { status, notes } = this.editForm.getRawValue();
    const statusValue = Number(status) as AppointmentStatus;
    this.saving.set(true);
    this.saveError.set(null);
    this.saveSuccess.set(null);

    this.appointmentService.appointmentUpdateStatus({
      id: appointment.id,
      body: {
        status: statusValue,
        notes: notes ?? '',
        prescriptions: appointment.prescriptions ?? []
      }
    }).pipe(
      finalize(() => this.saving.set(false))
    ).subscribe({
      next: () => {
        appointment.status = statusValue;
        appointment.notes = notes ?? '';
        this.saveSuccess.set('Appointment updated successfully.');
      },
      error: () => {
        this.saveError.set('Unable to update the appointment. Please try again.');
      }
    });
  }

  statusLabel(status: AppointmentStatus | undefined): string {
    switch (status) {
      case AppointmentStatus.Completed:
        return 'Completed';
      case AppointmentStatus.Canceled:
        return 'Canceled';
      default:
        return 'Upcoming';
    }
  }

  getPatientName(appointment: AppointmentModel): string {
    const fromModel = appointment.patient?.fullName || `${appointment.patient?.firstName ?? ''} ${appointment.patient?.lastName ?? ''}`.trim();
    return fromModel || appointment.patient?.email || `Patient #${appointment.patientId}`;
  }

  trackByAppointment = (_: number, appointment: AppointmentModel) => appointment.id ?? appointment.dateTime;

  trackByStatus = (_: number, status: AppointmentStatus) => status;
}
