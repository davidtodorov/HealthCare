import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { DoctorModel, PatientModel } from '../../../api/models';

@Component({
  selector: 'app-appointment-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointment-confirmation-modal.component.html',
})
export class AppointmentConfirmationModalComponent {
  @Input() doctor: DoctorModel | null = null;
  @Input() patient: PatientModel | null = null;
  @Input() selectedDate: Date | null = null;
  @Input() selectedTime: string | null = null;
  @Input() isDoctor: boolean = false;
  @Input() isBusy: boolean = false;
  @Input() error: string | null = null;

  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  get doctorName(): string {
    if (!this.doctor) {
      return '-';
    }
    const first = this.doctor.firstName ?? '';
    const last = this.doctor.lastName ?? '';
    return `${first} ${last}`.trim() || '-';
  }

  get patientName(): string {
    if (!this.patient) {
      return '-';
    }
    return (this.patient.fullName
      ?? `${this.patient.firstName ?? ''} ${this.patient.lastName ?? ''}`.trim())
      || '-';
  }

  onCancel() {
    this.cancel.emit();
  }

  onConfirm() {
    this.confirm.emit();
  }
}
