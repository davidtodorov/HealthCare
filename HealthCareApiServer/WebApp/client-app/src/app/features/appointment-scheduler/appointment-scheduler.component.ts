// doctor-booking.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

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

interface DayCell {
  date: Date | null; // null = leading/trailing blank
  label: number | '';
  isPast: boolean;
  hasAvailability: boolean;
  isSelected: boolean;
}

@Component({
  selector: 'app-appointment-scheduler',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointment-scheduler.component.html',
  styleUrl: './appointment-scheduler.component.scss'
})
export class AppointmentSchedulerComponent {
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

  availability: AvailabilityMap = {
    d1: { 1: ['09:00', '09:30', '10:00', '11:00'], 3: ['13:00', '13:30', '14:00'], 5: ['09:00', '10:00', '10:30'] },
    d2: { 2: ['10:00', '10:30', '11:00', '15:30'], 4: ['09:30', '10:00', '16:00'], 6: ['10:00', '10:30'] },
    d3: { 1: ['15:00', '15:30'], 3: ['09:00', '09:30', '10:00', '10:30'], 4: ['13:00', '13:30'], 5: ['09:00', '09:30'] },
  };

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
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
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
    return (map[w] || []).slice();
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

  get calendarGrid(): DayCell[] {
    return this.buildMonth(this.viewYear, this.viewMonth);
  }

  // --- UI actions ---
  onSelectDoctor(d: Doctor) {
    this.selectedDoctor = d;
    this.resetSelection();
  }

  prevMonth() {
    const m = this.viewMonth;
    if (m === 0) {
      this.viewMonth = 11;
      this.viewYear = this.viewYear - 1;
    } else {
      this.viewMonth = m - 1;
    }
  }

  nextMonth() {
    const m = this.viewMonth;
    if (m === 11) {
      this.viewMonth = 0;
      this.viewYear = this.viewYear + 1;
    } else {
      this.viewMonth = m + 1;
    }
  }

  goToday(selectDay: boolean = true) {
    const now = new Date();
    this.viewYear = now.getFullYear();
    this.viewMonth = now.getMonth();
    if (selectDay) {
      this.selectedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      this.selectedTime = null;
    }
    this.bookedOk = false;
  }

  onMonthChange(value: string) {
    this.viewMonth = +value;
  }

  onYearChange(value: string) {
    this.viewYear = +value;
  }

  selectDate(cell: DayCell) {
    if (!cell.date || cell.isPast) return;
    this.selectedDate = cell.date;
    this.selectedTime = null;
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

  buildMonth(y: number, m: number): DayCell[] {
    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);

    const leading = this.isoWeekday(first) - 1; // blanks before first day
    const days = last.getDate();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const grid: DayCell[] = [];

    // leading blanks
    for (let i = 0; i < leading; i++) {
      grid.push({ date: null, label: '', isPast: false, hasAvailability: false, isSelected: false });
    }

    for (let day = 1; day <= days; day++) {
      const date = new Date(y, m, day);
      const isPast = date < today;
      const isSelected = !!this.selectedDate && this.sameYMD(date, this.selectedDate);
      const hasAvailability = this.hasAvailabilityOn(date);
      grid.push({ date, label: day, isPast, isSelected, hasAvailability });
    }

    return grid;
  }

  sameYMD(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  trackByIndex(i: number) { return i; }
  trackByDoctor = (_: number, d: Doctor) => d.id;
}

/* -------------------- doctor-booking.component.html -------------------- */
/*
<div class="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
  <!-- Left: Doctor list -->
  <section class="card bg-white p-4 md:p-6">
    <div class="flex items-center gap-2 mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-slate-500">
        <path fill-rule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 3.93 12.285l4.767 4.768a.75.75 0 1 0 1.06-1.06l-4.768-4.767A6.75 6.75 0 0 0 10.5 3.75ZM5.25 10.5a5.25 5.25 0 1 1 10.5 0 5.25 5.25 0 0 1-10.5 0Z" clip-rule="evenodd" />
      </svg>
      <input id="search" type="text" placeholder="Search name or specialty"
        [(ngModel)]="search"
        class="w-full border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300" />
    </div>

    <div id="doctorList" class="space-y-3 max-h-[70vh] overflow-auto pr-1 scrollbar-thin">
      <ng-container *ngIf="filteredDoctors.length; else noDocs">
        <button *ngFor="let d of filteredDoctors; trackBy: trackByDoctor"
                (click)="onSelectDoctor(d)"
                class="w-full text-left p-3 border border-slate-200 hover:bg-slate-50 rounded-2xl flex gap-3 items-center">
          <img [src]="d.photo" [alt]="d.name" class="w-14 h-14 object-cover rounded-xl ring-1 ring-slate-200" />
          <div class="flex-1">
            <div class="font-medium">{{ d.name }}</div>
            <div class="text-sm text-slate-600">{{ d.specialty }}</div>
          </div>
        </button>
      </ng-container>
      <ng-template #noDocs>
        <div class="text-sm text-slate-500">No doctors match your search.</div>
      </ng-template>
    </div>
  </section>

  <!-- Right: Details & Booking -->
  <section class="space-y-6">
    <!-- Doctor details card -->
    <div class="card bg-white p-4 md:p-6" id="doctorDetails">
      <div class="flex items-start gap-4">
        <img [src]="selectedDoctor?.photo || ''" alt="Doctor photo" class="w-24 h-24 object-cover rounded-2xl ring-1 ring-slate-200" />
        <div class="flex-1">
          <h2 class="text-xl font-semibold">{{ selectedDoctor?.name || 'Select a doctor' }}</h2>
          <p class="text-slate-600">{{ selectedDoctor?.specialty || '—' }}</p>
          <p class="mt-2 text-slate-700 leading-relaxed">
            {{ selectedDoctor?.bio || 'Choose someone from the list to see their profile, available dates, and hours.' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Calendar + time slots -->
    <div class="card bg-white p-4 md:p-6">
      <div class="flex flex-col md:flex-row md:items-start gap-6">
        <!-- Calendar -->
        <div class="md:w-[360px]">
          <div class="flex items-center justify-between mb-3 gap-2">
            <div class="flex items-center gap-2">
              <button (click)="prevMonth()" class="btn px-3 py-2 border border-slate-200 hover:bg-slate-50">←</button>
              <button (click)="goToday()" class="btn px-3 py-2 border border-slate-200 hover:bg-slate-50">Today</button>
              <button (click)="nextMonth()" class="btn px-3 py-2 border border-slate-200 hover:bg-slate-50">→</button>
            </div>
            <div class="flex items-center gap-2">
              <select [ngModel]="viewMonth" (ngModelChange)="onMonthChange($event)"
                      class="border border-slate-200 rounded-xl px-2 py-1">
                <option *ngFor="let m of months; index as i" [value]="i">{{ m }}</option>
              </select>
              <select [ngModel]="viewYear" (ngModelChange)="onYearChange($event)"
                      class="border border-slate-200 rounded-xl px-2 py-1">
                <option *ngFor="let y of years" [value]="y">{{ y }}</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-7 text-xs text-slate-500 mb-2">
            <div class="text-center">Mon</div>
            <div class="text-center">Tue</div>
            <div class="text-center">Wed</div>
            <div class="text-center">Thu</div>
            <div class="text-center">Fri</div>
            <div class="text-center">Sat</div>
            <div class="text-center">Sun</div>
          </div>

          <div id="calendar" class="calendar-grid grid grid-cols-7 gap-1">
            <ng-container *ngFor="let cell of calendarGrid; trackBy: trackByIndex">
              <div *ngIf="!cell.date" class="day rounded-xl"></div>
              <button *ngIf="cell.date"
                      (click)="selectDate(cell)"
                      [disabled]="cell.isPast"
                      class="day rounded-xl border border-slate-200 hover:bg-slate-50 relative flex items-center justify-center"
                      [ngClass]="{
                        'opacity-40': cell.isPast,
                        'ring-2 ring-slate-900 bg-slate-900/5': cell.isSelected
                      }">
                {{ cell.label }}
                <span *ngIf="cell.hasAvailability" class="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-slate-900"></span>
              </button>
            </ng-container>
          </div>
          <p class="mt-3 text-xs text-slate-500">Dates with a dot • have available hours.</p>
        </div>

        <!-- Time slots & booking -->
        <div class="flex-1">
          <h4 class="font-semibold mb-2">Available time slots</h4>
          <div class="text-slate-600 mb-3">{{ dateLabel }}</div>

          <div id="slots" class="flex flex-wrap gap-2">
            <ng-container *ngIf="slotsForSelected.length; else noSlots">
              <button *ngFor="let t of slotsForSelected; trackBy: trackByIndex"
                      (click)="selectTime(t)"
                      class="slot-btn btn px-3 py-2 border border-slate-200 hover:bg-slate-50"
                      [ngClass]="{'ring-2 ring-slate-900 bg-slate-900/5': selectedTime === t}">
                {{ t }}
              </button>
            </ng-container>
            <ng-template #noSlots>
              <div class="text-slate-500">No hours on this date.</div>
            </ng-template>
          </div>

          <div class="mt-6 border-t pt-4">
            <h4 class="font-semibold mb-2">Appointment summary</h4>
            <div class="text-slate-700">{{ summary }}</div>
            <button (click)="book()"
                    class="btn mt-4 px-4 py-2 bg-slate-900 text-white hover:opacity-90 disabled:opacity-40"
                    [disabled]="!(selectedDoctor && selectedDate && selectedTime)">
              Book appointment
            </button>
            <p *ngIf="bookedOk" class="mt-3 text-green-700 font-medium">✓ Appointment booked!</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>
*/

/* -------------------- doctor-booking.component.css -------------------- */
/*
.card { @apply rounded-2xl border border-slate-200 shadow-sm; }
.calendar-grid .day { @apply h-10; }
.btn { @apply rounded-xl transition; }
*/
