import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../api/services';
import {
  AppointmentSlotOption,
  DepartmentOption,
  DepartmentSuggestion,
  DoctorRecommendationResponse,
  DoctorSuggestion,
  SymptomMessageResponse,
} from './clinic-chat.models';
import { ClinicChatService } from './clinic-chat.service';

interface ChatDisplayMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  suggestedDepartment?: DepartmentSuggestion | null;
  followUpQuestions?: string[];
  departmentOptions?: DepartmentOption[];
  doctorOptions?: DoctorSuggestion[];
  slotOptions?: AppointmentSlotOption[];
  confirmationText?: string;
  canPickDepartment?: boolean;
  canPickDoctor?: boolean;
  canPickSlot?: boolean;
  canConfirm?: boolean;
  isError?: boolean;
}

@Component({
  selector: 'app-symptom-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './symptom-chat.component.html',
  styleUrl: './symptom-chat.component.scss',
})
export class SymptomChatComponent implements OnInit {
  @ViewChild('messageContainer') messageContainer?: ElementRef<HTMLDivElement>;

  private readonly clinicChatService = inject(ClinicChatService);
  private readonly appointmentService = inject(AppointmentService);

  messages: ChatDisplayMessage[] = [];
  draftMessage = '';
  manualDepartmentId: number | null = null;

  isProcessing = false;
  isBooking = false;

  symptomSummary: string | null = null;
  departmentOptions: DepartmentOption[] = [];
  doctorSuggestions: DoctorSuggestion[] = [];

  selectedDepartment?: DepartmentOption;
  selectedDoctor?: DoctorSuggestion;
  selectedSlot?: AppointmentSlotOption;

  ngOnInit(): void {
    this.pushAssistantMessage(
      'Hello! I\'m your Care Navigator. Tell me about what you\'re feeling and I\'ll guide you to the right specialist.',
    );
  }

  sendMessage(): void {
    const content = this.draftMessage.trim();
    if (!content || this.isProcessing) {
      return;
    }

    this.pushUserMessage(content);
    this.draftMessage = '';
    this.isProcessing = true;

    this.resetSelectionsForNewInquiry();

    this.clinicChatService.analyzeSymptoms({ message: content }).subscribe({
      next: (response) => this.handleSymptomResponse(response),
      error: (error) => this.handleError(error),
    });
  }

  selectSuggestedDepartment(option: DepartmentOption | undefined | null): void {
    if (!option) {
      return;
    }
    this.manualDepartmentId = option.id;
    this.chooseDepartment(option);
  }

  applyManualDepartment(): void {
    if (this.manualDepartmentId == null) {
      return;
    }
    const option = this.departmentOptions.find((dept) => dept.id === this.manualDepartmentId);
    if (option) {
      this.chooseDepartment(option);
    }
  }

  chooseDepartment(option: DepartmentOption): void {
    if (this.isProcessing) {
      return;
    }

    this.selectedDepartment = option;
    this.pushUserMessage(`Let's look at ${option.name}.`);
    this.isProcessing = true;

    this.clinicChatService
      .recommendDoctors({ departmentId: option.id, symptomSummary: this.symptomSummary ?? undefined })
      .subscribe({
        next: (response) => this.handleDoctorResponse(response),
        error: (error) => this.handleError(error),
      });
  }

  chooseDoctor(doctor: DoctorSuggestion): void {
    if (this.isProcessing) {
      return;
    }

    this.selectedDoctor = doctor;
    this.selectedSlot = undefined;

    const doctorLabel = doctor.fullName || 'this doctor';
    this.pushUserMessage(`I'd like to meet with ${doctorLabel}.`);

    if (!doctor.upcomingSlots || doctor.upcomingSlots.length === 0) {
      this.clearInteractiveFlags();
      this.pushAssistantMessage(
        `${doctorLabel} doesn't have open appointments in the next two weeks. Let's pick another doctor.`,
        {
          doctorOptions: this.doctorSuggestions,
          canPickDoctor: this.doctorSuggestions.length > 0,
        },
      );
      return;
    }

    this.showSlotsForDoctor(doctor);
  }

  chooseSlot(slot: AppointmentSlotOption): void {
    if (!this.selectedDoctor) {
      return;
    }

    this.selectedSlot = slot;
    const slotLabel = slot.displayLabel ?? `${slot.localDate} ${slot.localTime}`;
    this.pushUserMessage(`The ${slotLabel} slot works for me.`);

    const confirmationText = `Would you like me to confirm ${this.selectedDoctor.fullName} on ${slotLabel}?`;
    this.clearInteractiveFlags();
    this.messages.push({
      role: 'assistant',
      text: confirmationText,
      timestamp: new Date(),
      confirmationText,
      canConfirm: true,
    });
    this.scrollToBottom();
  }

  confirmAppointment(): void {
    if (!this.selectedDoctor || !this.selectedSlot || this.isBooking) {
      return;
    }

    this.pushUserMessage('Yes, please confirm this appointment.');
    this.isBooking = true;

    this.appointmentService
      .appointmentBook({
        body: {
          doctorId: this.selectedDoctor.doctorId,
          dateTime: this.selectedSlot.utcStart,
          reason: this.symptomSummary ?? 'Scheduled via care navigator',
        },
      })
      .subscribe({
        next: () => {
          this.isBooking = false;
          this.clearInteractiveFlags();
          const doctorName = this.selectedDoctor?.fullName ?? 'the doctor';
          const slotLabel = this.selectedSlot?.displayLabel ?? '';
          this.pushAssistantMessage(
            `All set! You're booked with ${doctorName}${slotLabel ? ` on ${slotLabel}` : ''}. I'll send it to your appointments list.`,
          );
          this.selectedSlot = undefined;
        },
        error: (error) => {
          this.isBooking = false;
          const message = this.resolveErrorMessage(error, 'I could not confirm that appointment.');
          this.clearInteractiveFlags();
          this.pushAssistantMessage(message, { isError: true });
          if (this.selectedDoctor?.upcomingSlots?.length) {
            this.pushAssistantMessage('Here are the available times again:', {
              slotOptions: this.selectedDoctor.upcomingSlots,
              canPickSlot: true,
            });
          }
        },
      });
  }

  declineConfirmation(): void {
    if (!this.selectedDoctor) {
      return;
    }

    this.pushUserMessage("Let's try a different time.");
    this.showSlotsForDoctor(this.selectedDoctor);
  }

  returnToDoctorChoices(): void {
    if (!this.doctorSuggestions.length) {
      return;
    }

    this.selectedDoctor = undefined;
    this.selectedSlot = undefined;
    this.pushAssistantMessage('No problem, here are the other available doctors.', {
      doctorOptions: this.doctorSuggestions,
      canPickDoctor: true,
    });
  }

  trackByMessage = (index: number) => index;
  trackByDepartment = (_: number, item: DepartmentOption) => item.id;
  trackByDoctor = (_: number, item: DoctorSuggestion) => item.doctorId;
  trackBySlot = (_: number, item: AppointmentSlotOption) => item.utcStart;

  confidenceLabel(suggestion?: DepartmentSuggestion | null): string | null {
    if (!suggestion?.confidence && suggestion?.confidence !== 0) {
      return null;
    }
    const value = Math.round((suggestion.confidence ?? 0) * 100);
    return `${value}% match`;
  }

  private handleSymptomResponse(response: SymptomMessageResponse): void {
    this.isProcessing = false;
    this.departmentOptions = response.departments ?? [];
    this.doctorSuggestions = [];
    this.selectedDepartment = undefined;
    this.selectedDoctor = undefined;
    this.selectedSlot = undefined;
    this.symptomSummary = response.symptomSummary ?? null;
    this.manualDepartmentId = response.suggestedDepartment?.department.id ?? null;

    this.clearInteractiveFlags();
    this.messages.push({
      role: 'assistant',
      text: response.message,
      timestamp: new Date(),
      suggestedDepartment: response.suggestedDepartment ?? undefined,
      followUpQuestions: response.followUpQuestions ?? [],
      departmentOptions: response.departments,
      canPickDepartment: (response.departments?.length ?? 0) > 0,
    });
    this.scrollToBottom();
  }

  private handleDoctorResponse(response: DoctorRecommendationResponse): void {
    this.isProcessing = false;
    this.doctorSuggestions = response.doctors ?? [];
    this.symptomSummary = response.symptomSummary ?? this.symptomSummary;

    this.clearInteractiveFlags();
    this.messages.push({
      role: 'assistant',
      text: response.message,
      timestamp: new Date(),
      doctorOptions: this.doctorSuggestions,
      canPickDoctor: this.doctorSuggestions.length > 0,
    });
    this.scrollToBottom();
  }

  private handleError(error: unknown): void {
    this.isProcessing = false;
    const message = this.resolveErrorMessage(error, 'Something went wrong while contacting the assistant.');
    this.clearInteractiveFlags();
    this.pushAssistantMessage(message, { isError: true });
  }

  private showSlotsForDoctor(doctor: DoctorSuggestion): void {
    this.clearInteractiveFlags();
    this.messages.push({
      role: 'assistant',
      text: `Here are the next available times with ${doctor.fullName}.`,
      timestamp: new Date(),
      slotOptions: doctor.upcomingSlots,
      canPickSlot: doctor.upcomingSlots.length > 0,
    });
    this.scrollToBottom();
  }

  private pushUserMessage(text: string): void {
    this.messages.push({ role: 'user', text, timestamp: new Date() });
    this.scrollToBottom();
  }

  private pushAssistantMessage(text: string, extras?: Partial<ChatDisplayMessage>): void {
    this.messages.push({
      role: 'assistant',
      text,
      timestamp: new Date(),
      ...extras,
    });
    this.scrollToBottom();
  }

  private clearInteractiveFlags(): void {
    this.messages.forEach((message) => {
      message.canPickDepartment = false;
      message.canPickDoctor = false;
      message.canPickSlot = false;
      message.canConfirm = false;
    });
  }

  private scrollToBottom(): void {
    queueMicrotask(() => {
      const element = this.messageContainer?.nativeElement;
      if (element) {
        element.scrollTop = element.scrollHeight;
      }
    });
  }

  private resetSelectionsForNewInquiry(): void {
    this.selectedDepartment = undefined;
    this.selectedDoctor = undefined;
    this.selectedSlot = undefined;
    this.doctorSuggestions = [];
  }

  private resolveErrorMessage(error: unknown, fallback: string): string {
    if (error && typeof error === 'object' && 'error' in error) {
      const errorPayload = (error as any).error;
      if (errorPayload?.message) {
        return String(errorPayload.message);
      }
    }
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return fallback;
  }
}
