import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarComponent } from '../common/calendar/calendar.component';
import moment from 'moment';
import { DoctorService } from '../api/services';
import { AppointmentModel, AppointmentStatus, User } from '../api/models';
import { A } from '@fullcalendar/core/internal-common';
import { EnumTextPipe } from '../common/enumPipe';

// --- Component Definition ---
@Component({
  selector: 'app-doctor-scheduler',
  imports: [CommonModule, FormsModule, CalendarComponent, EnumTextPipe],
  templateUrl: './doctor-scheduler.component.html',
  styleUrls: ['./doctor-scheduler.component.scss']
})
export class DoctorSchedulerComponent implements OnInit {
  constructor(private doctorService: DoctorService) {

  }
  AppointmentStatus = AppointmentStatus;
  doctorId = 1;

  patients: User[] = [];

  appointments: AppointmentModel[] = [];

  dates: string[] = [];
  // --- Component State (Properties) ---
  selectedDate: moment.Moment | null = null;
  selectedAppt: AppointmentModel | null = null;
  currentView: 'day' | 'week' | 'month' = 'day';

  // Schedule properties
  searchQuery: string = '';
  statusFilter: AppointmentStatus | string | undefined = "all";
  dateHeading: string = 'Select a date…';
  filteredAppointments: AppointmentModel[] = [];
  groupedAppointments: { date: string, appts: AppointmentModel[] }[] = [];

  // Detail View properties
  currentPatient: User | undefined;
  newNoteText: string = '';
  rxNameInput: string = '';
  rxDoseInput: string = '';
  rxDaysInput: number = 7;
  rxTimesPerDayInput: number = 2;
  rxTimeInputs: string[] = ['08:00', '20:00'];

  ngOnInit() {
    this.goToday(true);
    this.setView('day');
    this.doctorService.doctorGetAppointmentsForDoctor({ month: this.selectedDate!.month() + 1 }).subscribe(appointments => {
      this.dates = appointments.map(x => moment(x.dateTime!).format('YYYY-MM-DD'));
      this.appointments = appointments;
    });

  }

  getPatient(id?: number): any {
    const appointment = this.appointments.find(p => p.patientId === id);
    if (appointment) {
      let user = {
        id: appointment?.patientId,
        fullName: appointment?.patient?.fullName,
      } as any as User;
      return user;
      //TODO: add prescriptions and notes to the mock data
      // Ensure properties exist for template safety
      //p.notes = ;p.notes || [];
      //p.prescriptions = p.prescriptions || [];
    }
    return;
  }

  // Getter to provide actively filtered prescriptions for the template, fixing the compilation error
  // get activePrescriptions(): Prescription[] {
  //   if (!this.currentPatient) return [];
  //   return []; //TODO: this.currentPatient.prescriptions.filter(r => r.active);
  // }

  // TrackBy function for *ngFor on prescriptions to prevent re-rendering and fix the error
  // trackByRxId(index: number, rx: Prescription): string {
  //   return rx.id;
  // }

  goToday(selectDay: boolean = true): void {
    if (selectDay) {
      this.selectedDate = moment().utc();
      this.setView('day'); // setView calls buildMonth and renderSchedule
    } else {
      this.renderSchedule();
    }
  }

  // Method called when a date is clicked in the Calendar
  handleDateSelect(date: moment.Moment): void {
    this.selectedDate = date;
    this.setView('day'); // Switch to Day view on calendar click (setView handles updates)
  }

  // Method called when the month/year changes in the Calendar
  handleCalendarViewChange(): void {
    this.renderSchedule();
  }

  // --- View and Navigation Logic ---
  setView(view: 'day' | 'week' | 'month'): void {
    this.currentView = view;
    this.renderSchedule();
  }

  navigatePeriod(direction: number): void {
    if (!this.selectedDate) this.goToday(true);
    if (!this.selectedDate) return;

    let amount = 0;
    if (this.currentView === 'day') amount = 1 * direction;
    else if (this.currentView === 'week') amount = 7 * direction;

    if (amount !== 0) {
      const newDate = moment(this.selectedDate);
      newDate.add(amount, 'days');
      this.selectedDate = newDate;
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

    // Use a context date to determine the range
    let contextDate: moment.Moment;
    // If selectedDate is null (e.g., on first load with currentView='month'),
    // we need to set a temporary context date for the month view.
    // We'll use the first day of the current month.
    if (!this.selectedDate && this.currentView === 'month') {
      const now = moment();
      contextDate = moment({ year: now.year(), month: now.month(), day: 1 });
    } else if (!this.selectedDate) {
      // Fallback for Day/Week if selectedDate is null (shouldn't happen after goToday)
      contextDate = moment();
    } else {
      contextDate = moment(this.selectedDate);
    }

    contextDate.hour(0).minute(0).second(0).millisecond(0);

    if (this.currentView === 'day') {
      startDate = moment(contextDate).toDate();
      endDate = moment(contextDate).toDate();
      title = contextDate.format('dddd, MMMM D, YYYY');

    } else if (this.currentView === 'week') {
      // Set startDate to the beginning of the week (Monday) using moment
      startDate = moment(contextDate).startOf('isoWeek').toDate();

      endDate = moment(startDate).endOf('isoWeek').toDate();

      const startStr = moment(startDate).format('MMM D');
      const endStr = endDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      title = `Week of ${startStr} – ${endStr}`;

    } else { // 'month'
      const year = contextDate.year();
      const month = contextDate.month();
      startDate = new Date(year, month, 1);
      endDate = new Date(year, month + 1, 0);
      title = moment(startDate).format('MMMM YYYY');
    }

    this.dateHeading = title;

    const startYMD = moment(startDate).format('YYYY-MM-DD');
    const endYMD = moment(endDate).format('YYYY-MM-DD');

    // 2. Filtering
    const q = this.searchQuery.trim().toLowerCase();
    const status = this.statusFilter;

    const filtered = this.appointments.filter(a => {
      if (a.doctorId !== this.doctorId) return false;

      // Date range check
      const apptYMD = moment(a.dateTime).format('YYYY-MM-DD');
      if (moment(apptYMD).isBefore(startYMD) || moment(apptYMD).isAfter(endYMD)) return false;

      // Status filter
      if (status !== undefined && status !== "all" && a.status !== status) return false;

      // Search filter
      if (q) {
        return (a.patient && a.patient.fullName && a.patient.fullName.toLocaleLowerCase().includes(q.trim())
          //TODO: || a.reason.toLowerCase().includes(q)
        );
      }
      return true;
    });

    filtered.sort((a, b) => moment.utc(a.dateTime).isBefore(moment.utc(b.dateTime)) ? -1 : moment.utc(a.dateTime).isAfter(moment.utc(b.dateTime)) ? 1 : 0);

    this.filteredAppointments = filtered;

    // 3. Grouping for Week/Month views
    if (this.currentView === 'day') {
      this.groupedAppointments = [{
        date: startYMD,
        appts: this.filteredAppointments,
      }];
    } else {
      const tempGroup: { [key: string]: AppointmentModel[] } = {};
      this.filteredAppointments.forEach(item => {
        tempGroup[moment(item.dateTime).format('YYYY-MM-DD')] = tempGroup[moment(item.dateTime).format('YYYY-MM-DD')] || [];
        tempGroup[moment(item.dateTime).format('YYYY-MM-DD')].push(item);
      });

      // Populate groupedAppointments ensuring dates are in order
      this.groupedAppointments = [];
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const ymd = moment(currentDate).format('YYYY-MM-DD');
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

  getApptStatusClasses(status: AppointmentStatus): string {
    switch (status) {
      case AppointmentStatus.Upcoming: return 'bg-indigo-100 border-indigo-300 text-indigo-800';
      case AppointmentStatus.Completed: return 'bg-green-100 border-green-300 text-green-800';
      case AppointmentStatus.Canceled: return 'bg-red-100 border-red-300 text-red-800';
      default: return 'bg-slate-100 border-slate-300 text-slate-800';
    }
  }

  // --- Detail Panel Logic ---
  openDetail(appt: AppointmentModel): void {
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

  updateStatus(next: AppointmentStatus.Completed | AppointmentStatus.Canceled): void {
    if (!this.selectedAppt) return;
    this.selectedAppt.status = next;
    // Re-open detail and re-render schedule to reflect changes
    this.openDetail(this.selectedAppt);
    this.renderSchedule();
  }

  get patientMeta(): string {
    if (!this.currentPatient) return '';
    //TODO: return `${this.currentPatient.age} yrs • ${this.currentPatient.phone} • ${this.currentPatient.email}`;
    return `${this.currentPatient.email}`;
  }

  // --- Notes ---
  addNote(): void {
    // TODO:
    // if (!this.currentPatient || !this.newNoteText.trim()) return;
    // this.currentPatient.notes.push(this.newNoteText.trim());
    // this.newNoteText = '';
  }

  // --- Previous Visits ---
  get previousVisits(): AppointmentModel[] {
    if (!this.currentPatient) return [];
    return this.appointments
      .filter(a => a.patientId === this.currentPatient!.id && a.doctorId === this.doctorId && a.id !== (this.selectedAppt?.id || '')
        && (a.status === AppointmentStatus.Completed || a.status === AppointmentStatus.Canceled))
      .sort((a, b) => b.dateTime.localeCompare(a.dateTime));
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

    //todo: prescription
    // this.currentPatient.prescriptions.push({
    //   id: 'rx_' + Math.random().toString(36).slice(2, 9),
    //   doctorId: this.doctorId,
    //   medication,
    //   dose,
    //   durationDays,
    //   times,
    //   startDate: this.selectedAppt.date,
    //   active: true,
    // });

    // Clear inputs
    this.rxNameInput = '';
    this.rxDoseInput = '';
    this.rxDaysInput = 7;
    this.rxTimesPerDayInput = 2;
    this.buildTimeInputs(2);
  }

  stopPrescription(id: string): void {
    if (!this.currentPatient) return;
    //TODO: const item = this.currentPatient.prescriptions.find(r => r.id === id);
    //TODO: if (item) { item.active = false; }
  }

  computeEndDate(startYmd: string | undefined, days: number | undefined): string {
    if (!startYmd || !days) return '—';
    const start = new Date(startYmd + 'T00:00:00'); // Use T00:00:00 to avoid timezone issues
    const end = new Date(start.getTime());
    end.setDate(start.getDate() + (days - 1));
    return moment(end).format('YYYY-MM-DD');
  }
}
