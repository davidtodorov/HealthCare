import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { PrescriptionIntakeModel, PrescriptionModel } from '../../api/models';
import { PrescriptionIntakeService, PrescriptionService } from '../../api/services';
import { PushNotificationService } from '../../common/push-notification.service';
import moment from 'moment';
import { Subscription } from 'rxjs';

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
export class PrescriptionHistoryComponent implements OnInit, OnDestroy {
  isLoading = false;
  errorMessage: string | null = null;
  prescriptions: PrescriptionModel[] = [];
  selectedPrescription: PrescriptionModel | null = null;
  scheduleSlots: ScheduleSlot[] = [];
  notificationsSupported = false;
  isNotificationsEnabled = false;
  isNotificationLoading = false;
  notificationError: string | null = null;
  private subscription?: Subscription;

  constructor(
    private readonly prescriptionService: PrescriptionService,
    private readonly intakeService: PrescriptionIntakeService,
    private readonly pushNotificationService: PushNotificationService
  ) { }

  ngOnInit(): void {
    this.loadPrescriptions();
    this.notificationsSupported = this.pushNotificationService.isSupported;
    if (this.notificationsSupported) {
      this.subscription = this.pushNotificationService.getSubscriptionState().subscribe(isEnabled => {
        this.isNotificationsEnabled = isEnabled;
      });
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  get activePrescriptions(): PrescriptionModel[] {
    return this.prescriptions.filter(p => p.isActive);
  }

  async enableNotifications(): Promise<void> {
    if (!this.notificationsSupported || this.isNotificationLoading) {
      return;
    }

    this.isNotificationLoading = true;
    this.notificationError = null;
    try {
      const success = await this.pushNotificationService.subscribe();
      this.isNotificationsEnabled = success;
      if (!success) {
        this.notificationError = 'We could not enable reminders. Please allow notifications and try again.';
      }
    } catch (error) {
      this.notificationError = 'We ran into a problem while enabling reminders. Please try again later.';
    } finally {
      this.isNotificationLoading = false;
    }
  }

  async disableNotifications(): Promise<void> {
    if (!this.notificationsSupported || this.isNotificationLoading) {
      return;
    }

    this.isNotificationLoading = true;
    this.notificationError = null;
    try {
      await this.pushNotificationService.unsubscribe();
      this.isNotificationsEnabled = false;
    } catch (error) {
      this.notificationError = 'We could not disable reminders right now. Please try again later.';
    } finally {
      this.isNotificationLoading = false;
    }
  }

  get historicalPrescriptions(): PrescriptionModel[] {
    return this.prescriptions.filter(p => !p.isActive);
  }

  get selectedHasSchedule(): boolean {
    return this.scheduleSlots.length > 0;
  }

  getEndDate(prescription: PrescriptionModel): Date | null {
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

    this.prescriptionService.prescriptionGetAll().subscribe({
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

  selectPrescription(prescription: PrescriptionModel): void {
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
      takenAt: moment().format()
    } as PrescriptionIntakeModel;

    this.intakeService.prescriptionIntakeMark({ body: request }).subscribe({
      next: (intake: PrescriptionIntakeModel) => {
        slot.isSaving = false;
        slot.isTaken = true;
        slot.takenAt = intake.takenAt ?? request.takenAt;
        const currentIntakes = this.selectedPrescription?.intakes ?? [];
        this.selectedPrescription = {
          ...this.selectedPrescription!,
          intakes: [...currentIntakes, intake],
          isActive: this.selectedPrescription?.isActive
        };

        this.prescriptions.find(x => x.id === this.selectedPrescription?.id)!.isActive = this.selectedPrescription?.isActive;
      },
      error: () => {
        slot.isSaving = false;
        this.errorMessage = 'Unable to record the intake. Please try again.';
      }
    });
  }

  trackByPrescription = (_: number, prescription: PrescriptionModel) => prescription.id ?? prescription.name;

  trackBySlot = (_: number, slot: ScheduleSlot) => slot.scheduledFor;

  private buildSchedule(prescription: PrescriptionModel): ScheduleSlot[] {
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
        const slotDate = moment(day).utc().hour(hour).minutes(minute);

        const scheduledIso = slotDate.format();
        const matchingIntake = intakes.find(x => moment.utc(x.scheduledFor).isSame(moment.utc(slotDate)));

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
    const date = moment(value).utc();
    return { hour: date.hour(), minute: date.minute() };
  }

}
