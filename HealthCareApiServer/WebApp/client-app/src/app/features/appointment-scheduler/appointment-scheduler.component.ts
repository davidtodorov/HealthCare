// doctor-booking.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import moment from 'moment';
import { take } from 'rxjs';

import { AppointmentService, DoctorService, PatientService } from '../../api/services';
import { AppointmentModel, AppointmentStatus, DoctorModel, PatientModel } from '../../api/models';
import { AuthService } from '../../auth/auth.service';
import { ROLE_DOCTOR } from '../../common/roles';
import { CalendarComponent } from '../../common/calendar/calendar.component';
import { generateTimeSlots } from '../../helpers/dateHelper';

@Component({
  selector: 'app-appointment-scheduler',
  imports: [CommonModule, FormsModule, CalendarComponent],
  templateUrl: './appointment-scheduler.component.html',
  styleUrl: './appointment-scheduler.component.scss'
})
export class AppointmentSchedulerComponent implements OnInit {
  @ViewChild(CalendarComponent) calendarComponent!: CalendarComponent;
  AppointmentStatus = AppointmentStatus;

  doctorList: DoctorModel[] = [];
  patientList: PatientModel[] = [];
  dates: string[] = [];
  availabilitySlots: Record<string, string[]> = {};
  scheduledAppointments: AppointmentModel[] = [];
  search: string = '';
  selectedDoctor: DoctorModel | null = null;
  selectedPatient: PatientModel | null = null;
  viewYear: number = new Date().getFullYear();
  viewMonth: number = new Date().getMonth(); // 0-based
  selectedDate: Date | null = null;
  selectedTime: string | null = null;
  bookedOk: boolean = false;
  isDoctor: boolean = false;
  currentUserId: number | null = null;

  constructor(
    private doctorService: DoctorService,
    private appointmentService: AppointmentService,
    private patientService: PatientService,
    private authService: AuthService
  ) {
  }

  ngOnInit(): void {
    this.authService.getRoles().pipe(take(1)).subscribe(roles => {
      this.isDoctor = roles.includes(ROLE_DOCTOR);
      this.currentUserId = this.authService.getUserId();

      if (this.isDoctor) {
        this.loadDoctorProfile();
        this.loadPatients();
      } else {
        this.loadDoctors();
      }

      this.loadAppointments();
    });
  }

  private loadAppointments(): void {
    this.appointmentService.appointmentGetAll().subscribe(result => {
      this.scheduledAppointments = result;
      this.updateAvailabilitySlots();
    });
  }

  private loadDoctors(): void {
    this.doctorService.doctorGetAll().subscribe(result => {
      this.doctorList = result;
    });
  }

  private loadDoctorProfile(): void {
    this.doctorService.doctorGetAll().subscribe(result => {
      this.doctorList = result;
      const loggedDoctor = this.currentUserId != null
        ? this.doctorList.find(d => d.userId === this.currentUserId)
        : null;

      if (loggedDoctor) {
        this.selectedDoctor = loggedDoctor;
        this.updateAvailabilitySlots();
        this.refreshCalendarView();
      }
    });
  }

  private loadPatients(): void {
    this.patientService.patientGetAll().subscribe(result => {
      this.patientList = result;
    });
  }

  private refreshCalendarView(): void {
    if (!this.calendarComponent) {
      return;
    }

    const now = new Date();
    this.calendarComponent.buildMonth(now.getFullYear(), now.getMonth());
    this.calendarComponent.goToday(true);
  }

  get filteredDoctors(): DoctorModel[] {
    const q = this.search.trim().toLowerCase();
    if (!q) return this.doctorList;
    return this.doctorList.filter(
      (d) => (d.firstName ?? '').toLowerCase().includes(q)
        || (d.lastName ?? '').toLowerCase().includes(q)
        || (d.departmentName ?? '').toLowerCase().includes(q)
    );
  }

  get filteredPatients(): PatientModel[] {
    const q = this.search.trim().toLowerCase();
    if (!q) return this.patientList;
    return this.patientList.filter(
      (p) => (p.firstName ?? '').toLowerCase().includes(q)
        || (p.lastName ?? '').toLowerCase().includes(q)
        || (p.fullName ?? '').toLowerCase().includes(q)
        || (p.email ?? '').toLowerCase().includes(q)
    );
  }

  get monthLabel(): string {
    return new Date(this.viewYear, this.viewMonth, 1).toLocaleString(undefined, {
      month: 'long',
      year: 'numeric',
    });
  }

  get dateLabel(): string {
    const d = this.selectedDate;
    if (!d) return 'Select a date to view hours.';
    return moment(d).format('ddd - Do MMMM, YYYY');
  }

  get slotsForSelected(): string[] {
    const doctor = this.selectedDoctor;
    const d = this.selectedDate;
    if (!doctor || !d) return [];
    if (this.isDoctor && !this.selectedPatient) return [];
    const key = moment(d).format('YYYY-MM-DD');
    const slots = this.availabilitySlots[key] || [];
    const dayMoment = moment(key, 'YYYY-MM-DD');

    if (!slots.length) {
      return [];
    }

    if (!dayMoment.isSame(moment(), 'day')) {
      return slots;
    }

    const now = moment();
    return slots.filter(slot => {
      const [hours, minutes] = slot.split(':').map(Number);
      const slotMoment = moment(dayMoment)
        .hour(hours)
        .minute(minutes)
        .second(0)
        .millisecond(0);
      return slotMoment.isAfter(now);
    });
  }

  get summary(): string {
    const d = this.selectedDate;
    const t = this.selectedTime;

    if (this.isDoctor) {
      const patient = this.selectedPatient;
      if (patient && d && t) {
        return `${patient.fullName ?? patient.firstName} — ${moment(d).format('ddd - Do MMMM, YYYY')} at ${t}`;
      } else if (patient && d) {
        return `${patient.fullName ?? patient.firstName} — ${moment(d).format('ddd - Do MMMM, YYYY')} • Select a time.`;
      } else if (patient) {
        return `${patient.fullName ?? patient.firstName} — Select a date.`;
      }
    } else {
      const doctor = this.selectedDoctor;
      if (doctor && d && t) {
        return `${doctor.firstName} • ${doctor.departmentName} — ${moment(d).format('ddd - Do MMMM, YYYY')} at ${t}`;
      } else if (doctor && d) {
        return `${doctor.firstName} • ${doctor.departmentName} — ${moment(d).format('ddd - Do MMMM, YYYY')} • Select a time.`;
      } else if (doctor) {
        return `${doctor.firstName} • ${doctor.departmentName} — Select a date.`;
      }
    }
    return '—';
  }

  onDoctorSelect(d: DoctorModel) {
    if (this.isDoctor) {
      return;
    }

    this.selectedDoctor = d;
    this.resetSelection();
    this.updateAvailabilitySlots();
    this.refreshCalendarView();
  }

  onPatientSelect(p: PatientModel) {
    if (!this.isDoctor) {
      return;
    }

    this.selectedPatient = p;
    this.resetSelection();
    this.goToday();
    this.updateAvailabilitySlots();
    //this.refreshCalendarView();
  }

  onViewChange() {
    this.updateAvailabilitySlots();
  }

  onDateSelect(date: any) {
    this.selectedDate = date;
    this.selectedTime = null;
    this.bookedOk = false;
    this.updateAvailabilitySlots();
  }

  private findFreeSlotsForDoctor(
    allAppointments: AppointmentModel[],
    doctorId: number,
    slotStartTime: string,
    slotEndTime: string,
    intervalMinutes: number,
    patientOptions?: { patientId?: number | null; patientUserId?: number | null }
  ) {
    const allPossibleSlots = generateTimeSlots(slotStartTime, slotEndTime, intervalMinutes);

    const matchesPatient = (app: AppointmentModel) => {
      if (patientOptions?.patientId != null) {
        return app.patientId === patientOptions.patientId;
      }
      if (patientOptions?.patientUserId != null) {
        return app.patient?.userId === patientOptions.patientUserId;
      }
      return false;
    };

    const takenAppointments = allAppointments.filter(app => {
      if (app.status === AppointmentStatus.Canceled) {
        return false;
      }
      return app.doctorId === doctorId || matchesPatient(app);
    });

    const takenSlotsByDate = takenAppointments.reduce((acc, appointment) => {
      const { dateTime } = appointment;
      const date = moment(dateTime).format('YYYY-MM-DD');
      const time = moment(dateTime).format('HH:mm');
      if (!acc[date]) {
        acc[date] = new Set<string>();
      }
      acc[date].add(time);
      return acc;
    }, {} as Record<string, Set<string>>);

    const freeSlotsByDate: Record<string, string[]> = {};
    const uniqueDates = Array.from(new Set(takenAppointments.map(app => app.dateTime ? moment(app.dateTime).format('YYYY-MM-DD') : ''))).filter(d => d);

    uniqueDates.forEach(date => {
      const takenSlots = takenSlotsByDate[date] || new Set<string>();
      const freeSlots = allPossibleSlots.filter(slot => !takenSlots.has(slot));

      if (freeSlots.length > 0) {
        freeSlotsByDate[date] = freeSlots;
      }
    });

    const year = this.calendarComponent?.viewYear ?? new Date().getFullYear();
    const month = this.calendarComponent?.viewMonth ?? new Date().getMonth();
    const daysInMonth = moment({ year, month, date: 1 }).daysInMonth();
    const uniqueDatesSet = new Set(uniqueDates);

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = moment({ year, month, date: day }).format('YYYY-MM-DD');
      if (!uniqueDatesSet.has(dateStr)) {
        freeSlotsByDate[dateStr] = [...allPossibleSlots];
      }
    }

    return freeSlotsByDate;
  }

  goToday(selectDay: boolean = true) {
    const now = new Date();
    if (selectDay) {
      this.selectedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      this.selectedTime = null;
    }
    this.bookedOk = false;

  }

  selectTime(t: string) {
    this.selectedTime = t;
    this.bookedOk = false;
  }

  book() {
    const doctor = this.selectedDoctor;
    const d = this.selectedDate;
    const t = this.selectedTime;
    if (!(doctor && doctor.id !== undefined && d && t)) return;
    if (this.isDoctor && !this.selectedPatient) return;

    const date = moment(d).hour(moment.duration(t).hours()).minute(moment.duration(t).minutes()).utc(true).format();
    const body: { doctorId: number; dateTime: string; patientId?: number } = {
      doctorId: doctor.id,
      dateTime: date,
    };

    if (this.isDoctor && this.selectedPatient?.id) {
      body.patientId = this.selectedPatient.id;
    }

    this.appointmentService.appointmentBook({ body }).subscribe({
      next: () => {
        this.appointmentService.appointmentGetAll().subscribe(result => {
          this.scheduledAppointments = result;
          this.updateAvailabilitySlots();
          this.bookedOk = true;
          this.selectedTime = null;
        });
      }
    });
  }

  resetSelection() {
    this.selectedDate = null;
    this.selectedTime = null;
    this.bookedOk = false;
  }

  trackByIndex(i: number) { return i; }
  trackByDoctor = (_: number, d: DoctorModel) => d.id;
  trackByPatient = (_: number, p: PatientModel) => p.id;

  private updateAvailabilitySlots() {
    const doctorId = this.selectedDoctor?.id;
    if (!doctorId) {
      this.availabilitySlots = {};
      this.dates = [];
      return;
    }

    if (this.isDoctor && !this.selectedPatient) {
      this.availabilitySlots = {};
      this.dates = [];
      return;
    }

    const patientId = this.isDoctor ? this.selectedPatient?.id ?? null : null;
    const patientUserId = this.isDoctor ? this.selectedPatient?.userId ?? null : this.currentUserId;

    const rawSlots = this.findFreeSlotsForDoctor(
      this.scheduledAppointments,
      doctorId,
      '08:00',
      '18:00',
      30,
      { patientId, patientUserId }
    );

    const today = moment().startOf('day');
    const now = moment();
    const filteredSlots: Record<string, string[]> = {};

    Object.entries(rawSlots).forEach(([dateKey, slots]) => {
      const dayMoment = moment(dateKey, 'YYYY-MM-DD');
      if (dayMoment.isBefore(today)) {
        return;
      }

      const upcomingSlots = dayMoment.isSame(today, 'day')
        ? slots.filter(slot => {
          const [hours, minutes] = slot.split(':').map(Number);
          const slotMoment = moment(dayMoment)
            .hour(hours)
            .minute(minutes)
            .second(0)
            .millisecond(0);
          return slotMoment.isAfter(now);
        })
        : slots;

      if (upcomingSlots.length > 0) {
        filteredSlots[dateKey] = upcomingSlots;
      }
    });

    this.availabilitySlots = filteredSlots;
    this.dates = Object.keys(filteredSlots);
  }
}
