import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarComponent } from '../common/calendar/calendar.component';
import moment from 'moment';
import { AppointmentService, DoctorService, PrescriptionService } from '../api/services';
import { AppointmentModel, AppointmentStatus, PatientModel, PrescriptionModel, UserModel } from '../api/models';
import { EnumTextPipe } from '../common/enumPipe';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-doctor-scheduler',
  imports: [CommonModule, FormsModule, CalendarComponent, EnumTextPipe],
  templateUrl: './doctor-scheduler.component.html',
  styleUrls: ['./doctor-scheduler.component.scss']
})
export class DoctorSchedulerComponent implements OnInit {
  public doctorId: number | null = null;

  constructor(
    private doctorService: DoctorService, 
    private prescriptionService: PrescriptionService, 
    private appointmentService: AppointmentService,
    private authService: AuthService
  ) {
    this.doctorId = this.authService.getUserId();
  }
  AppointmentStatus = AppointmentStatus;
  patients: UserModel[] = [];
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
  currentPatient: PatientModel | undefined;
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

  // getPatient(id?: number): any {
  //   const appointment = this.appointments.find(p => p.patientId === id);
  //   if (appointment) {
  //     let patient = {
  //       id: appointment?.patientId,
  //       fullName: appointment?.patient?.fullName,
  //       prescriptions: appointment?.prescriptions || [],
  //     } as any as PatientModel;
  //     return patient;
  //     //TODO: add prescriptions and notes to the mock data
  //     // Ensure properties exist for template safety
  //     //p.notes = ;p.notes || [];
  //     //p.prescriptions = p.prescriptions || [];
  //   }
  //   return;
  // }

  // Getter to provide actively filtered prescriptions for the template, fixing the compilation error
  get activePrescriptions(): PrescriptionModel[] {
    if (!this.currentPatient) return [];
    
    return this.currentPatient.prescriptions?.filter(x => x.isActive) || [];
  }

  // TrackBy function for *ngFor on prescriptions to prevent re-rendering and fix the error
  trackByRxId(index: number, rx: PrescriptionModel): number | undefined {
    return rx.id;
  }

  goToday(selectDay: boolean = true): void {
    if (selectDay) {
      this.selectedDate = moment().utc(true);
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
      // Date range check
      const apptYMD = moment(a.dateTime).format('YYYY-MM-DD');
      if (moment(apptYMD).isBefore(startYMD) || moment(apptYMD).isAfter(endYMD)) return false;

      // Status filter
      if (status !== undefined && status !== "all" && a.status !== status) return false;

      // Search filter
      if (q) {
        return (a.patient && a.patient.fullName && a.patient.fullName.toLocaleLowerCase().includes(q.trim())
        || a.notes?.toLowerCase().includes(q)
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
    // this.prescriptionService.prescriptionGetPrescriptionsByAppointmentId({ appId: appt.id! }).subscribe(res => { 

    //  });
    this.currentPatient = appt.patient || undefined;

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
    
    this.appointmentService
      //TODO: 
      .appointmentUpdateStatus({ id: this.selectedAppt.id!, body: { status: next, notes: this.selectedAppt.notes, prescriptions: this.currentPatient?.prescriptions } }).subscribe(() => {
        this.selectedAppt!.status = next;
        // Re-open detail and re-render schedule to reflect changes
        this.openDetail(this.selectedAppt!);
        this.renderSchedule();

      });
    
  }

  get patientMeta(): string {
    if (!this.currentPatient) return '';
    return `${this.currentPatient.email}`;
  }

  addNote(): void {
    // TODO:
    if (!this.selectedAppt || !this.newNoteText.trim()) return;
    this.selectedAppt.notes = this.newNoteText.trim();
    this.newNoteText = '';
  }

  // --- Previous Visits ---
  get previousVisits(): AppointmentModel[] {
    if (!this.currentPatient) return [];
    return this.appointments
      .filter(x => x.patient?.userId === this.currentPatient?.userId 
        && x.id !== this.selectedAppt?.id 
        && moment(x.dateTime).isBefore(moment(this.selectedAppt?.dateTime))
        && (x.status === AppointmentStatus.Completed || x.status === AppointmentStatus.Canceled))
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

    //TODO: rxTimesInput is format "HH:mm" map to datetime objects, use moment co to parse and validate
    const times = this.rxTimeInputs.filter(t => t && t.trim()).map(t => moment.utc(t, 'HH:mm').format()); // Only include non-empty times

    if (!medication || !dose || !times.length) return;

    //todo: prescription
    let prescription: PrescriptionModel = {
      name: medication,
      dose: dose,
      durationInDays: durationDays,
      times: times,
      startDate: this.selectedAppt.dateTime,
      isActive: true,
      patientId: this.currentPatient.id!,
      appointmentId: this.selectedAppt.id,
    };
    this.currentPatient.prescriptions = this.currentPatient.prescriptions || [];
    this.currentPatient.prescriptions.push(prescription);

    // Clear inputs
    this.rxNameInput = '';
    this.rxDoseInput = '';
    this.rxDaysInput = 7;
    this.rxTimesPerDayInput = 2;
    this.buildTimeInputs(2);
  }

  stopPrescription(id?: number): void {
    if (!this.currentPatient) return;
    const item = this.currentPatient.prescriptions?.find(r => r.id === id);
    if (item) { item.isActive = false; }
  }

  computeEndDate(startYmd: string | undefined, days: number | undefined): string {
    if (!startYmd || !days) return '—';
    const start = moment.utc(startYmd);
    const end = start.add(days - 1, 'days');
    return moment.utc(end).format('YYYY-MM-DD');
  }
}
