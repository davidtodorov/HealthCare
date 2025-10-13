// doctor-booking.component.ts
import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarComponent } from '../../common/calendar/calendar.component';
import { generateTimeSlots } from '../../helpers/dateHelper';
import moment from 'moment';
import { AppointmentService, DoctorService } from '../../api/services';
import { AppointmentModel, AppointmentStatus, DoctorModel } from '../../api/models';
@Component({
  selector: 'app-appointment-scheduler',
  imports: [CommonModule, FormsModule, CalendarComponent],
  templateUrl: './appointment-scheduler.component.html',
  styleUrl: './appointment-scheduler.component.scss'
})
export class AppointmentSchedulerComponent {
  @ViewChild(CalendarComponent) calendarComponent!: CalendarComponent;
  AppointmentStatus = AppointmentStatus;

  doctorList: DoctorModel[] = [];
  dates: string[] = [];
  availabilitySlots: any = {};
  scheduledAppointments: AppointmentModel[] = [];
  search: string = '';
  selectedDoctor: DoctorModel | null = null;
  viewYear: number = new Date().getFullYear();
  viewMonth: number = new Date().getMonth(); // 0-based
  selectedDate: Date | null = null;
  selectedTime: string | null = null;
  bookedOk: boolean = false;
  years: number[] = [];

  constructor(private doctorService: DoctorService, private appointmentService: AppointmentService) {
    this.doctorService.doctorGetAll().subscribe(result => {
      this.doctorList = result;
    });

    this.appointmentService.appointmentGetAll().subscribe(result => {
      this.scheduledAppointments = result;
    });
    const nowYear = new Date().getFullYear();
    for (let y = nowYear - 5; y <= nowYear + 5; y++) this.years.push(y);
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
    return this.availabilitySlots[moment(d).format('YYYY-MM-DD')] || [];
  }

  get summary(): string {
    const doctor = this.selectedDoctor;
    const d = this.selectedDate;
    const t = this.selectedTime;
    if (doctor && d && t) {
      return `${doctor.firstName} • ${doctor.departmentName} — ${moment(d).format('ddd - Do MMMM, YYYY')} at ${t}`;
    } else if (doctor && d) {
      return `${doctor.firstName} • ${doctor.departmentName} — ${moment(d).format('ddd - Do MMMM, YYYY')} • Select a time.`;
    } else if (doctor) {
      return `${doctor.firstName} • ${doctor.departmentName} — Select a date.`;
    }
    return '—';
  }

  onDoctorSelect(d: DoctorModel) {
    this.selectedDoctor = d;

    this.availabilitySlots = this.findFreeSlotsForDoctor(this.scheduledAppointments, d.id as any, '08:00', '18:00', 30);
    this.dates = this.availabilitySlots ? Object.keys(this.availabilitySlots) : [];

    this.resetSelection();

    const now = new Date();
    const viewYear = now.getFullYear();
    const viewMonth = now.getMonth();
    this.calendarComponent.buildMonth(viewYear, viewMonth)
    this.calendarComponent.goToday(true);
  }

  onViewChange() {
    this.availabilitySlots = this.findFreeSlotsForDoctor(this.scheduledAppointments, this.selectedDoctor!.id as any, '08:00', '18:00', 30);
    this.dates = this.availabilitySlots ? Object.keys(this.availabilitySlots) : [];
  }

  onDateSelect(date: any) {
    this.selectedDate = date;

    this.selectedTime = null;
    this.bookedOk = false;

  }

  findFreeSlotsForDoctor(allAppointments: AppointmentModel[], doctorId: number, slotStartTime: string, slotEndTime: string, intervalMinutes: number) {
    // 1. Define the full set of possible slots for a single day
    const allPossibleSlots = generateTimeSlots(slotStartTime, slotEndTime, intervalMinutes);

    // 2. Filter appointments for the target doctor and exclude 'canceled' ones
    const takenAppointments = allAppointments.filter(
      (app) => app.doctorId === doctorId && app.status !== AppointmentStatus.Canceled
    );

    // 3. Group taken slots by date for efficient lookup
    const takenSlotsByDate = takenAppointments.reduce((acc, appointment) => {
      const { dateTime } = appointment;
      const date = moment(dateTime).format('YYYY-MM-DD');
      const time = moment(dateTime).format('HH:mm');
      if (!acc[date]) {
        acc[date] = new Set();
      }
      acc[date].add(time);
      return acc;
    }, {});

    // 4. Determine free slots by comparing all possible slots against the taken slots
    const freeSlotsByDate = {};

    // Get all dates the doctor has an appointment (taken or not)
    const uniqueDates = Array.from(new Set(takenAppointments.map(app => app.dateTime ? moment(app.dateTime).format('YYYY-MM-DD') : ''))).filter(d => d);

    // Iterate over each date the doctor has an appointment
    uniqueDates.forEach(date => {
      const takenSlots = takenSlotsByDate[date] || new Set<string>();
      const freeSlots = allPossibleSlots.filter(slot => !takenSlots.has(slot));

      if (freeSlots.length > 0) {
        freeSlotsByDate[date] = freeSlots;
      }
    });

    // 5. Include remaining days of the currently viewed month with full availability
    const year = this.calendarComponent.viewYear;
    const month = this.calendarComponent.viewMonth; // 0-based
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
    let date = moment(d).utc().hour(moment.duration(t).hours()).minute(moment.duration(t).minutes()).format();
    this.appointmentService.appointmentBook({
      body: {
        doctorId: doctor.id,
        dateTime: date,
      }
    }).subscribe({
      next: (result) => {
        this.appointmentService.appointmentGetAll().subscribe(result => {
          this.scheduledAppointments = result;
          this.availabilitySlots = this.findFreeSlotsForDoctor(this.scheduledAppointments, doctor.id as any, '08:00', '18:00', 30);
          this.bookedOk = true;
          this.selectedTime = null;
        });
      }
    });
    
  }

  // --- Helpers ---
  resetSelection() {
    this.selectedDate = null;
    this.selectedTime = null;
    this.bookedOk = false;
  }

  trackByIndex(i: number) { return i; }
  trackByDoctor = (_: number, d: DoctorModel) => d.id;
}