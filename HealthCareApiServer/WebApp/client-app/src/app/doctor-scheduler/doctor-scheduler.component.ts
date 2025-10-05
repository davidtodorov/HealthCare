import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// --- Mock Data Interfaces ---

interface Prescription {
  id: string;
  doctorId: string;
  medication: string;
  dose: string;
  durationDays: number;
  times: string[];
  startDate: string; // YYYY-MM-DD
  active: boolean;
}

interface Patient {
  id: string;
  name: string;
  age: number;
  phone: string;
  email: string;
  photo: string;
  tags: string[];
  notes: string[];
  prescriptions: Prescription[];
}

interface Appointment {
  id: string;
  doctorId: string;
  date: string; // YYYY-MM-DD
  time: string;
  patientId: string;
  reason: string;
  status: 'upcoming' | 'completed' | 'canceled';
}

// --- Component Definition ---
@Component({
    selector: 'app-doctor-scheduler',
    imports: [CommonModule, FormsModule],
    templateUrl: './doctor-scheduler.component.html',
    styleUrls: ['./doctor-scheduler.component.scss']
})
export class DoctorSchedulerComponent implements OnInit {
  // --- Constants & Mock Data ---
  months: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  doctorId: string = 'd1';

  patients: Patient[] = [
    { id: 'p1', name: 'Nikolay Petrov', age: 34, phone: '+359 88 123 4567', email: 'nikolay@example.com',
        photo: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?q=80&w=256&auto=format&fit=crop',
        tags: ['Hypertension', 'Smoker'], notes: ['Home BP readings borderline'], prescriptions: []
    },
    { id: 'p2', name: 'Elena Ivanova', age: 29, phone: '+359 88 765 4321', email: 'elena@example.com',
        photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=256&auto=format&fit=crop',
        tags: ['Eczema', 'Allergies'], notes: ['Responding well to emollients'], 
        prescriptions: [{ id: 'rx_1', doctorId: 'd1', medication: 'Betamethasone', dose: '10 mg', durationDays: 14, times: ['08:00', '20:00'], startDate: '2025-09-28', active: true }]
    },
    { id: 'p3', name: 'Georgi Stoyanov', age: 41, phone: '+359 87 222 0000', email: 'georgi@example.com',
        photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop',
        tags: ['Pediatric guardian'], notes: ['Brings child for checkups'], prescriptions: []
    }
  ];

  appointments: Appointment[] = [
    { id: 'a1', doctorId: 'd1', date: '2025-10-05', time: '09:00', patientId: 'p1', reason: 'Follow-up: BP review', status: 'upcoming' },
    { id: 'a2', doctorId: 'd1', date: '2025-10-05', time: '10:30', patientId: 'p2', reason: 'Skin rash evaluation', status: 'upcoming' },
    { id: 'a3', doctorId: 'd1', date: '2025-10-06', time: '14:00', patientId: 'p1', reason: 'Holter results', status: 'upcoming' },
    { id: 'a4', doctorId: 'd1', date: '2025-09-28', time: '11:00', patientId: 'p2', reason: 'Eczema follow-up', status: 'completed' },
    { id: 'a5', doctorId: 'd1', date: '2025-09-10', time: '09:30', patientId: 'p1', reason: 'Initial consult', status: 'completed' },
    { id: 'a6', doctorId: 'd1', date: '2025-10-07', time: '09:00', patientId: 'p3', reason: 'Child vaccine Q&A', status: 'canceled' },
    { id: 'a7', doctorId: 'd1', date: '2025-10-09', time: '16:00', patientId: 'p3', reason: 'Tonsillitis check', status: 'upcoming' },
    { id: 'a8', doctorId: 'd1', date: '2025-10-25', time: '11:00', patientId: 'p2', reason: 'Annual review', status: 'upcoming' },
    { id: 'a9', doctorId: 'd1', date: '2025-11-03', time: '10:00', patientId: 'p1', reason: 'Medication review', status: 'upcoming' },
  ];

  // --- Component State (Properties) ---
  viewYear!: number;
  viewMonth!: number; // 0-based month
  selectedDate: Date | null = null;
  selectedAppt: Appointment | null = null;
  currentView: 'day' | 'week' | 'month' = 'day';

  // Calendar rendering properties
  calendarDays: { date: Date, ymd: string, d: number, classes: string, hasAppts: boolean }[] = [];
  monthLabel: string = '—';
  monthOptions: { value: number, text: string }[] = [];
  yearOptions: { value: number, text: string }[] = [];

  // Schedule properties
  searchQuery: string = '';
  statusFilter: string = 'all';
  dateHeading: string = 'Select a date…';
  filteredAppointments: { appt: Appointment, patient: Patient | undefined }[] = [];
  groupedAppointments: { date: string, appts: { appt: Appointment, patient: Patient | undefined }[] }[] = [];
  
  // Detail View properties
  currentPatient: Patient | undefined;
  newNoteText: string = '';
  rxNameInput: string = '';
  rxDoseInput: string = '';
  rxDaysInput: number = 7;
  rxTimesPerDayInput: number = 2;
  rxTimeInputs: string[] = ['08:00', '20:00'];

  ngOnInit() {
    this.initSelectors();
    this.goToday(true);
    this.setView('day');
  }

  // --- Utility Functions ---
  private pad(n: number): string { return String(n).padStart(2, '0'); }
  private formatYMD(d: Date): string { return `${d.getFullYear()}-${this.pad(d.getMonth() + 1)}-${this.pad(d.getDate())}`; }
  private isoWeekday(d: Date): number { return (d.getDay() || 7); } // Returns 1 (Mon) to 7 (Sun)
  
  // Helper to ensure patient objects have required properties for details view
  getPatient(id: string): Patient | undefined {
    const p = this.patients.find(p => p.id === id);
    if (p) {
        // Ensure properties exist for template safety
        p.notes = p.notes || [];
        p.prescriptions = p.prescriptions || [];
    }
    return p;
  }

  // Getter to provide actively filtered prescriptions for the template, fixing the compilation error
  get activePrescriptions(): Prescription[] {
    if (!this.currentPatient) return [];
    return this.currentPatient.prescriptions.filter(r => r.active);
  }

  // TrackBy function for *ngFor on prescriptions to prevent re-rendering and fix the error
  trackByRxId(index: number, rx: Prescription): string {
    return rx.id;
  }

  // --- Initialization ---
  private initSelectors() {
    this.months.forEach((nm, idx) => {
      this.monthOptions.push({ value: idx, text: nm });
    });
    const nowY = new Date().getFullYear();
    for (let yy = nowY - 5; yy <= nowY + 5; yy++) {
      this.yearOptions.push({ value: yy, text: String(yy) });
    }
  }

  // --- Calendar Logic ---
  buildMonth(y: number, m: number): void {
    this.viewYear = y;
    this.viewMonth = m;
    this.calendarDays = [];

    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);
    const leading = (this.isoWeekday(first) - 1);
    const days = last.getDate();

    this.monthLabel = first.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

    // Determine the date range for week highlighting
    let weekHighlightStart: Date | null = null;
    let weekHighlightEnd: Date | null = null;
    const selectedYMD = this.selectedDate ? this.formatYMD(this.selectedDate) : null;
    const today = new Date(); today.setHours(0, 0, 0, 0);

    if (this.currentView === 'week' && this.selectedDate) {
      weekHighlightStart = new Date(this.selectedDate);
      weekHighlightStart.setDate(this.selectedDate.getDate() - (this.isoWeekday(this.selectedDate) - 1));
      
      weekHighlightEnd = new Date(weekHighlightStart);
      weekHighlightEnd.setDate(weekHighlightStart.getDate() + 6);
    }

    // Leading blanks
    for (let i = 0; i < leading; i++) {
      this.calendarDays.push({ date: new Date(), ymd: '', d: 0, classes: 'h-10', hasAppts: false }); // Placeholder
    }

    for (let d = 1; d <= days; d++) {
      const date = new Date(y, m, d);
      const ymd = this.formatYMD(date);
      
      let classes = 'bg-white hover:bg-slate-100 text-slate-900';
      let isWeekHighlighted = false;

      // 1. Check for Weekly Highlight
      if (this.currentView === 'week' && weekHighlightStart && weekHighlightEnd && date >= weekHighlightStart && date <= weekHighlightEnd) {
        isWeekHighlighted = true;
        classes = 'bg-indigo-100/70 text-indigo-800 hover:bg-indigo-200/70';
      }

      // 2. Check for Day Highlight (selected date)
      if (this.currentView === 'day' && ymd === selectedYMD) {
        classes = 'ring-2 ring-indigo-500 bg-indigo-50 text-indigo-800';
        isWeekHighlighted = false;
      }
      
      // 3. Check for Today
      if (date.getTime() === today.getTime()) {
        if (ymd === selectedYMD) {
          classes = 'ring-2 ring-indigo-500 bg-indigo-50 font-bold text-indigo-800';
        } else if (isWeekHighlighted) {
          classes = classes.replace('bg-indigo-100/70', 'bg-indigo-200/70'); // Better highlight for today in week view
          classes += ' font-bold border-2 border-indigo-400';
        } else {
          classes = 'bg-slate-900 text-white hover:bg-slate-700';
        }
      } else if (isWeekHighlighted && ymd === selectedYMD) {
          classes += ' !font-bold';
      }

      const hasAppts = this.appointments.some(a => a.doctorId === this.doctorId && a.date === ymd);

      this.calendarDays.push({ date, ymd, d, classes, hasAppts });
    }
  }

  handleCalendarChange(): void {
    this.buildMonth(this.viewYear, this.viewMonth);
    this.renderSchedule();
  }

  prevMonth(): void {
    if (this.viewMonth === 0) { this.viewMonth = 11; this.viewYear--; } else this.viewMonth--;
    this.handleCalendarChange();
  }
  nextMonth(): void {
    if (this.viewMonth === 11) { this.viewMonth = 0; this.viewYear++; } else this.viewMonth++;
    this.handleCalendarChange();
  }

  goToday(selectDay: boolean = true): void {
    const now = new Date();
    this.viewYear = now.getFullYear();
    this.viewMonth = now.getMonth();
    if (selectDay) {
      this.selectedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      this.setView('day'); // setView calls buildMonth and renderSchedule
    } else {
      this.buildMonth(this.viewYear, this.viewMonth);
      this.renderSchedule();
    }
  }

  selectDate(date: Date): void {
    this.selectedDate = date; 
    this.setView('day'); // Switch to Day view on calendar click (setView handles updates)
  }

  // --- View and Navigation Logic ---
  setView(view: 'day' | 'week' | 'month'): void {
    this.currentView = view;
    // Update calendar to show new highlights (day vs week)
    this.buildMonth(this.viewYear, this.viewMonth); 
    this.renderSchedule();
  }

  navigatePeriod(direction: number): void {
    if (!this.selectedDate) this.goToday(true);
    if (!this.selectedDate) return;

    let amount = 0;
    if (this.currentView === 'day') amount = 1 * direction;
    else if (this.currentView === 'week') amount = 7 * direction;

    if (amount !== 0) {
      const newDate = new Date(this.selectedDate);
      newDate.setDate(this.selectedDate.getDate() + amount);
      this.selectedDate = newDate;
      this.viewYear = newDate.getFullYear(); // Update calendar context
      this.viewMonth = newDate.getMonth();
      this.buildMonth(this.viewYear, this.viewMonth);
      this.renderSchedule();
    }
  }

  // --- Appointments List Logic ---
  renderSchedule(): void {
    this.selectedAppt = null;
    this.currentPatient = undefined;
    this.filteredAppointments = [];
    this.groupedAppointments = [];

    if (!this.selectedDate && this.currentView !== 'month') {
      this.dateHeading = 'Select a date…';
      return;
    }

    // 1. Determine Date Range & Heading
    let startDate: Date;
    let endDate: Date;
    let title: string;

    // Ensure selectedDate is available for Day/Week context if it's null (e.g., first load of Month view)
    let contextDate: Date = this.selectedDate || new Date(this.viewYear, this.viewMonth, 1);
    contextDate.setHours(0,0,0,0);
    
    if (this.currentView === 'day') {
      startDate = new Date(contextDate);
      endDate = new Date(contextDate);
      title = contextDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    } else if (this.currentView === 'week') {
      startDate = new Date(contextDate);
      startDate.setDate(contextDate.getDate() - (this.isoWeekday(contextDate) - 1));

      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);

      const startStr = startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const endStr = endDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      title = `Week of ${startStr} – ${endStr}`;

    } else { // 'month'
      startDate = new Date(this.viewYear, this.viewMonth, 1);
      endDate = new Date(this.viewYear, this.viewMonth + 1, 0);
      title = startDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long' });
    }

    this.dateHeading = title;

    const startYMD = this.formatYMD(startDate);
    const endYMD = this.formatYMD(endDate);

    // 2. Filtering
    const q = this.searchQuery.trim().toLowerCase();
    const status = this.statusFilter;

    const filtered = this.appointments.filter(a => {
      if (a.doctorId !== this.doctorId) return false;

      // Date range check
      if (a.date < startYMD || a.date > endYMD) return false;

      // Status filter
      if (status !== 'all' && a.status !== status) return false;

      // Search filter
      if (q) {
        const p = this.getPatient(a.patientId);
        return (p?.name.toLowerCase().includes(q) || a.reason.toLowerCase().includes(q));
      }
      return true;
    });

    filtered.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

    this.filteredAppointments = filtered.map(appt => ({ appt, patient: this.getPatient(appt.patientId) }));

    // 3. Grouping for Week/Month views
    if (this.currentView === 'day') {
      this.groupedAppointments = [{
        date: startYMD,
        appts: this.filteredAppointments,
      }];
    } else {
      const tempGroup: { [key: string]: { appt: Appointment, patient: Patient | undefined }[] } = {};
      this.filteredAppointments.forEach(item => {
        tempGroup[item.appt.date] = tempGroup[item.appt.date] || [];
        tempGroup[item.appt.date].push(item);
      });

      // Populate groupedAppointments ensuring dates are in order
      this.groupedAppointments = [];
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
          const ymd = this.formatYMD(currentDate);
          if (tempGroup[ymd]) {
              this.groupedAppointments.push({ date: ymd, appts: tempGroup[ymd] });
          }
          currentDate.setDate(currentDate.getDate() + 1);
      }
    }
  }

  // Helper for schedule rendering to get the date header
  getDateHeader(ymd: string): string {
    const dateObj = new Date(ymd + 'T00:00:00'); // Ensure UTC neutrality for date parsing
    return dateObj.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  }

  getApptStatusClasses(status: string): string {
    switch (status) {
        case 'upcoming': return 'bg-indigo-100 border-indigo-300 text-indigo-800';
        case 'completed': return 'bg-green-100 border-green-300 text-green-800';
        case 'canceled': return 'bg-red-100 border-red-300 text-red-800';
        default: return 'bg-slate-100 border-slate-300 text-slate-800';
    }
  }

  // --- Detail Panel Logic ---
  openDetail(appt: Appointment): void {
    this.selectedAppt = appt;
    this.currentPatient = this.getPatient(appt.patientId);
    
    if (!this.currentPatient) return;
    
    // Reset inputs
    this.newNoteText = '';
    this.rxNameInput = '';
    this.rxDoseInput = '';
    this.rxDaysInput = 7;
    this.rxTimesPerDayInput = 2;
    this.buildTimeInputs(2);
  }

  updateStatus(next: 'completed' | 'canceled'): void {
    if (!this.selectedAppt) return;
    this.selectedAppt.status = next;
    // Re-open detail and re-render schedule to reflect changes
    this.openDetail(this.selectedAppt);
    this.renderSchedule();
  }

  get patientMeta(): string {
    if (!this.currentPatient) return '';
    return `${this.currentPatient.age} yrs • ${this.currentPatient.phone} • ${this.currentPatient.email}`;
  }

  // --- Notes ---
  addNote(): void {
    if (!this.currentPatient || !this.newNoteText.trim()) return;
    this.currentPatient.notes.push(this.newNoteText.trim());
    this.newNoteText = '';
  }

  // --- Previous Visits ---
  get previousVisits(): Appointment[] {
    if (!this.currentPatient) return [];
    return this.appointments
        .filter(a => a.patientId === this.currentPatient!.id && a.doctorId === this.doctorId && a.id !== (this.selectedAppt?.id || '') && (a.status === 'completed' || a.status === 'canceled'))
        .sort((a, b) => b.date.localeCompare(a.date));
  }

  // --- Prescriptions ---
  buildTimeInputs(count: number): void {
    this.rxTimesPerDayInput = count;
    this.rxTimeInputs = [];
    for (let i = 0; i < count; i++) {
        // Simple default times
        let defaultTime: string;
        switch (i) {
            case 0: defaultTime = '08:00'; break;
            case 1: defaultTime = '20:00'; break;
            case 2: defaultTime = '12:00'; break;
            case 3: defaultTime = '16:00'; break;
            default: defaultTime = '00:00';
        }
        this.rxTimeInputs.push(defaultTime);
    }
  }

  setRxTime(index: number, time: string): void {
    this.rxTimeInputs[index] = time;
  }

  addPrescription(): void {
    if (!this.selectedAppt || !this.currentPatient) return;
    const medication = this.rxNameInput.trim();
    const dose = this.rxDoseInput.trim();
    const durationDays = Math.max(1, this.rxDaysInput);
    const times = this.rxTimeInputs.filter(t => t && t.trim()); // Only include non-empty times

    if (!medication || !dose || !times.length) return;

    this.currentPatient.prescriptions.push({
      id: 'rx_' + Math.random().toString(36).slice(2, 9),
      doctorId: this.doctorId,
      medication,
      dose,
      durationDays,
      times,
      startDate: this.selectedAppt.date,
      active: true,
    });

    // Clear inputs
    this.rxNameInput = '';
    this.rxDoseInput = '';
    this.rxDaysInput = 7;
    this.rxTimesPerDayInput = 2;
    this.buildTimeInputs(2);
  }

  stopPrescription(id: string): void {
    if (!this.currentPatient) return;
    const item = this.currentPatient.prescriptions.find(r => r.id === id);
    if (item) { item.active = false; }
  }

  computeEndDate(startYmd: string | undefined, days: number | undefined): string {
    if (!startYmd || !days) return '—';
    const start = new Date(startYmd + 'T00:00:00'); // Use T00:00:00 to avoid timezone issues
    const end = new Date(start.getTime());
    end.setDate(start.getDate() + (days - 1));
    return this.formatYMD(end);
  }
}
