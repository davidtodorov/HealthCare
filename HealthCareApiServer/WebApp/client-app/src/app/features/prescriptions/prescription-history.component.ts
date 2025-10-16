import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PrescriptionTrackingService, PrescriptionWithIntakes, PrescriptionIntakeModel } from './prescription-tracking.service';

interface ScheduleSlot {
  scheduledFor: string;
  isTaken: boolean;
  takenAt?: string | null;
  isSaving?: boolean;
}

@Component({
  selector: 'app-prescription-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './prescription-history.component.html',
  styleUrl: './prescription-history.component.scss'
})
export class PrescriptionHistoryComponent implements OnInit {
  isLoading = false;
  errorMessage: string | null = null;
  prescriptions: PrescriptionWithIntakes[] = [];
  selectedPrescription: PrescriptionWithIntakes | null = null;
  scheduleSlots: ScheduleSlot[] = [];

  constructor(private readonly trackingService: PrescriptionTrackingService) { }

  ngOnInit(): void {
    this.loadPrescriptions();
  }

  get activePrescriptions(): PrescriptionWithIntakes[] {
    return this.prescriptions.filter(p => p.isActive);
  }

  get historicalPrescriptions(): PrescriptionWithIntakes[] {
    return this.prescriptions.filter(p => !p.isActive);
  }

  get selectedHasSchedule(): boolean {
    return this.scheduleSlots.length > 0;
  }

  getEndDate(prescription: PrescriptionWithIntakes): Date | null {
    if (!prescription.startDate || !prescription.durationInDays) {
      return null;
    }
    const start = new Date(prescription.startDate);
    const end = new Date(start.getTime());
    end.setUTCDate(end.getUTCDate() + Math.max(0, prescription.durationInDays - 1));
    return end;
  }

  loadPrescriptions(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.trackingService.getMyPrescriptions().subscribe({
      next: data => {
        this.prescriptions = (data || []).map(p => ({
          ...p,
          intakes: p.intakes ?? []
        }));
        if (this.selectedPrescription) {
          const updated = this.prescriptions.find(p => p.id === this.selectedPrescription?.id);
          this.selectedPrescription = updated ?? null;
          if (this.selectedPrescription) {
            this.scheduleSlots = this.buildSchedule(this.selectedPrescription);
          }
        }
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'We could not load your prescriptions right now. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  selectPrescription(prescription: PrescriptionWithIntakes): void {
    this.selectedPrescription = prescription;
    this.scheduleSlots = this.buildSchedule(prescription);
  }

  markSlotAsTaken(slot: ScheduleSlot): void {
    if (!this.selectedPrescription || slot.isTaken || slot.isSaving) {
      return;
    }
    const prescriptionId = this.selectedPrescription.id;
    if (prescriptionId == null) {
      return;
    }

    slot.isSaving = true;
    const request = {
      prescriptionId,
      scheduledFor: slot.scheduledFor,
      takenAt: new Date().toISOString()
    };

    this.trackingService.markIntake(request).subscribe({
      next: (intake: PrescriptionIntakeModel) => {
        slot.isSaving = false;
        slot.isTaken = true;
        slot.takenAt = intake.takenAt ?? request.takenAt;
        const currentIntakes = this.selectedPrescription?.intakes ?? [];
        this.selectedPrescription = {
          ...this.selectedPrescription!,
          intakes: [...currentIntakes, intake]
        };
      },
      error: () => {
        slot.isSaving = false;
        this.errorMessage = 'Unable to record the intake. Please try again.';
      }
    });
  }

  trackByPrescription = (_: number, prescription: PrescriptionWithIntakes) => prescription.id ?? prescription.name;

  trackBySlot = (_: number, slot: ScheduleSlot) => slot.scheduledFor;

  private buildSchedule(prescription: PrescriptionWithIntakes): ScheduleSlot[] {
    if (!prescription.startDate || !prescription.durationInDays || !prescription.times?.length) {
      return [];
    }

    const times = (prescription.times ?? [])
      .map(time => this.extractUtcTime(time))
      .filter((value): value is { hour: number; minute: number } => value !== null);

    if (!times.length) {
      return [];
    }

    const start = new Date(prescription.startDate);
    const intakes = prescription.intakes ?? [];
    const slots: ScheduleSlot[] = [];

    for (let dayOffset = 0; dayOffset < Math.max(1, prescription.durationInDays); dayOffset++) {
      const day = new Date(start.getTime());
      day.setUTCDate(day.getUTCDate() + dayOffset);

      times.forEach(({ hour, minute }) => {
        const slotDate = new Date(Date.UTC(
          day.getUTCFullYear(),
          day.getUTCMonth(),
          day.getUTCDate(),
          hour,
          minute,
          0,
          0
        ));

        const scheduledIso = slotDate.toISOString();
        const matchingIntake = intakes.find(x => this.normalisedIso(x.scheduledFor) === this.normalisedIso(scheduledIso));

        slots.push({
          scheduledFor: scheduledIso,
          isTaken: Boolean(matchingIntake),
          takenAt: matchingIntake?.takenAt ?? matchingIntake?.scheduledFor ?? null
        });
      });
    }

    return slots.sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor));
  }

  private extractUtcTime(value: string | null | undefined): { hour: number; minute: number } | null {
    if (!value) {
      return null;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return { hour: date.getUTCHours(), minute: date.getUTCMinutes() };
  }

  private normalisedIso(value: string): string {
    const date = new Date(value);
    date.setUTCSeconds(0, 0);
    return date.toISOString();
  }
}
