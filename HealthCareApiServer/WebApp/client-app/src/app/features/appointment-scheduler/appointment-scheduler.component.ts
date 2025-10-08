// doctor-booking.component.ts
import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarComponent } from '../../common/calendar/calendar.component';
import { Appointment } from '../../doctor-scheduler/doctor-scheduler.component';
import { generateTimeSlots } from '../../helpers/dateHelper';
import moment from 'moment';

/**
 * Drop-in Angular standalone component that replicates the provided vanilla HTML+JS UI
 * and adds: (1) Go to Today, (2) Month & Year selectors.
 *
 * Usage:
 * <app-doctor-booking />
 */

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  photo: string;
  bio: string;
}

interface AvailabilityMap {
  [doctorId: string]: { [isoWeekday: number]: string[] };
}

interface AvailabilityDay { 
  doctorId: string;
  dates: {
    [date: string]: string[]; // times, use ISO date string as key
  }
}

interface DayCell {
  date: Date | null; // null = leading/trailing blank
  label: number | '';
  isPast: boolean;
  hasAvailability: boolean;
  isSelected: boolean;
}

@Component({
  selector: 'app-appointment-scheduler',
  imports: [CommonModule, FormsModule, CalendarComponent],
  templateUrl: './appointment-scheduler.component.html',
  styleUrl: './appointment-scheduler.component.scss'
})
export class AppointmentSchedulerComponent {
  @ViewChild(CalendarComponent) calendarComponent!: CalendarComponent;

  // --- Mock data ---
  doctors: Doctor[] = [
    {
      id: 'd1',
      name: 'Dr. Elena Petrova',
      specialty: 'Cardiologist',
      photo:
        'https://images.unsplash.com/photo-1550831107-1553da8c8464?q=80&w=640&auto=format&fit=crop',
      bio: 'Board-certified cardiologist with 12+ years of experience focusing on preventive cardiology and patient-centered care.',
    },
    {
      id: 'd2',
      name: 'Dr. Ivan Dimitrov',
      specialty: 'Dermatologist',
      photo:
        'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=640&auto=format&fit=crop',
      bio: 'Dermatology specialist in acne, eczema, and skin cancer screening. Passionate about education and minimally invasive treatments.',
    },
    {
      id: 'd3',
      name: 'Dr. Maria Stoyanova',
      specialty: 'Pediatrician',
      photo:
        'https://images.unsplash.com/photo-1527613426441-4da17471b66d?q=80&w=640&auto=format&fit=crop',
      bio: 'Pediatrician with a gentle approach, focusing on newborn and child wellness, vaccinations, and family guidance.',
    },
  ];

  dates: string[] = []; // Array of date strings in "YYYY-MM-DD" format

  availability: AvailabilityMap = {
    d1: { 1: ['09:00', '09:30', '10:00', '11:00'], 3: ['13:00', '13:30', '14:00'], 5: ['09:00', '10:00', '10:30'] },
    d2: { 2: ['10:00', '10:30', '11:00', '15:30'], 4: ['09:30', '10:00', '16:00'], 6: ['10:00', '10:30'] },
    d3: { 1: ['15:00', '15:30'], 3: ['09:00', '09:30', '10:00', '10:30'], 4: ['13:00', '13:30'], 5: ['09:00', '09:30'] },
  };

  availabilitySlots: any = {};

  appointments: Appointment[] = [
    { id: 'a1', doctorId: 'd1', date: '2025-10-05', time: '09:00', patientId: 'p1', reason: 'Follow-up: BP review', status: 'upcoming' },
    { id: 'a2', doctorId: 'd1', date: '2025-10-05', time: '10:30', patientId: 'p2', reason: 'Skin rash evaluation', status: 'upcoming' },
    { id: 'a3', doctorId: 'd1', date: '2025-10-06', time: '14:00', patientId: 'p1', reason: 'Holter results', status: 'upcoming' },
    { id: 'a4', doctorId: 'd2', date: '2025-09-28', time: '11:00', patientId: 'p2', reason: 'Eczema follow-up', status: 'completed' },
    { id: 'a5', doctorId: 'd2', date: '2025-09-10', time: '09:30', patientId: 'p1', reason: 'Initial consult', status: 'completed' },
    { id: 'a6', doctorId: 'd2', date: '2025-10-07', time: '09:00', patientId: 'p3', reason: 'Child vaccine Q&A', status: 'canceled' },
    { id: 'a7', doctorId: 'd3', date: '2025-10-09', time: '16:00', patientId: 'p3', reason: 'Tonsillitis check', status: 'upcoming' },
    { id: 'a10', doctorId: 'd3', date: '2025-10-09', time: '16:30', patientId: 'p3', reason: 'Tonsillitis check', status: 'upcoming' },
    { id: 'a8', doctorId: 'd3', date: '2025-10-25', time: '11:00', patientId: 'p2', reason: 'Annual review', status: 'upcoming' },
    { id: 'a9', doctorId: 'd3', date: '2025-11-03', time: '10:00', patientId: 'p1', reason: 'Medication review', status: 'upcoming' },
  ];

  // --- Component state ---
  search: string = '';
  selectedDoctor: Doctor | null = null;
  viewYear: number = new Date().getFullYear();
  viewMonth: number = new Date().getMonth(); // 0-based
  selectedDate: Date | null = null;
  selectedTime: string | null = null;
  bookedOk: boolean = false;

  // Month/year controls
  months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  years: number[] = [];

  constructor() {
    const nowYear = new Date().getFullYear();
    for (let y = nowYear - 5; y <= nowYear + 5; y++) this.years.push(y);
  }

  // Derived values as getters
  get filteredDoctors(): Doctor[] {
    const q = this.search.trim().toLowerCase();
    if (!q) return this.doctors;
    return this.doctors.filter(
      (d) => d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q)
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
    return d.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  get slotsForSelected(): string[] {
    const doctor = this.selectedDoctor;
    const d = this.selectedDate;
    if (!doctor || !d) return [];
    const w = this.isoWeekday(d);
    const map = this.availability[doctor.id] || {};
    //return (map[w] || []).slice();
    return this.availabilitySlots[moment(d).format('YYYY-MM-DD')] || [];
  }

  get summary(): string {
    const doctor = this.selectedDoctor;
    const d = this.selectedDate;
    const t = this.selectedTime;
    if (doctor && d && t) {
      return `${doctor.name} • ${doctor.specialty} — ${d.toLocaleDateString()} at ${t}`;
    } else if (doctor && d) {
      return `${doctor.name} — ${d.toLocaleDateString()} • Select a time.`;
    } else if (doctor) {
      return `${doctor.name} — Select a date.`;
    }
    return '—';
  }

  // --- UI actions ---
  onDoctorSelect(d: Doctor) {
    this.selectedDoctor = d;

    this.availabilitySlots = this.findFreeSlotsForDoctor(this.appointments, d.id, '08:00', '18:00', 30);
    this.dates = this.availabilitySlots ? Object.keys(this.availabilitySlots) : [];

    this.resetSelection();
    this.goToday();

    const now = new Date();
    const viewYear = now.getFullYear();
    const viewMonth = now.getMonth();
    this.calendarComponent.buildMonth(viewYear, viewMonth)
  }

  onDateSelect(date: any) {
    this.selectedDate = date;
    this.selectedTime = null;
    this.bookedOk = false;
    //this.calendarComponent.selectDate(date);
  }

  findFreeSlotsForDoctor(allAppointments: Appointment[], doctorId: string, slotStartTime: string, slotEndTime: string, intervalMinutes: number) {
    // 1. Define the full set of possible slots for a single day
    const allPossibleSlots = generateTimeSlots(slotStartTime, slotEndTime, intervalMinutes);

    // 2. Filter appointments for the target doctor and exclude 'canceled' ones
    const takenAppointments = allAppointments.filter(
        (app) => app.doctorId === doctorId && app.status !== 'canceled'
    );

    // 3. Group taken slots by date for efficient lookup
    const takenSlotsByDate = takenAppointments.reduce((acc, appointment) => {
        const { date, time } = appointment;
        if (!acc[date]) {
            acc[date] = new Set();
        }
        acc[date].add(time);
        return acc;
    }, {});

    // 4. Determine free slots by comparing all possible slots against the taken slots
    const freeSlotsByDate = {};

    // Get all dates the doctor has an appointment (taken or not)
    const uniqueDates = Array.from(new Set(takenAppointments.map(app => app.date)));

    // Iterate over each date the doctor has an appointment
    uniqueDates.forEach(date => {
        const takenSlots = takenSlotsByDate[date] || new Set();
        const freeSlots = allPossibleSlots.filter(slot => !takenSlots.has(slot));

        if (freeSlots.length > 0) {
            freeSlotsByDate[date] = freeSlots;
        }
    });

    return freeSlotsByDate;
}

  goToday(selectDay: boolean = true) {
    const now = new Date();
    const viewYear = now.getFullYear();
    const viewMonth = now.getMonth();
    if (selectDay) {
      this.selectedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      this.selectedTime = null;
    }
    this.bookedOk = false;
  }

  // selectDate(cell: DayCell) {
  //   this.resetSelection();
  //   if (!cell.date || cell.isPast) return;
  //   this.selectedDate = cell.date;
  //   this.selectedTime = null;
  //   this.bookedOk = false;
  // }

  selectTime(t: string) {
    this.selectedTime = t;
    this.bookedOk = false;
  }

  book() {
    const doctor = this.selectedDoctor;
    const d = this.selectedDate;
    const t = this.selectedTime;
    if (!(doctor && d && t)) return;
    const w = this.isoWeekday(d);
    const list = this.availability[doctor.id][w];
    this.availability[doctor.id][w] = list.filter((x) => x !== t);
    this.bookedOk = true;
    // Reset the chosen time to force refresh of slots
    this.selectedTime = null;
  }

  // --- Helpers ---
  resetSelection() {
    this.selectedDate = null;
    this.selectedTime = null;
    this.bookedOk = false;
  }

  isoWeekday(d: Date): number {
    const wd = d.getDay();
    return wd === 0 ? 7 : wd; // 1..7
  }

  hasAvailabilityOn(date: Date): boolean {
    const doctor = this.selectedDoctor;
    if (!doctor) return false;
    const w = this.isoWeekday(date);
    const map = this.availability[doctor.id] || {};
    const slots = map[w] || [];
    return slots.length > 0;
  }

  sameYMD(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  trackByIndex(i: number) { return i; }
  trackByDoctor = (_: number, d: Doctor) => d.id;
}