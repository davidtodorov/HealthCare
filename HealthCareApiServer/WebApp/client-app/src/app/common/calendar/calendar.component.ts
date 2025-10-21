import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import moment from 'moment';

// --- Interfaces for Inputs ---
export interface AppointmentStub {
  doctorId: string;
  date: string; // YYYY-MM-DD
  id: string;
}

interface CalendarDay {
  date: moment.Moment,
  ymd: string,
  d: number,
  classes: string,
  hasAppts: boolean,
  isDisabled: boolean,
}

@Component({
  selector: 'app-calendar',
  imports: [CommonModule, FormsModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent implements OnInit, OnChanges {
  @Input() doctorId: number | null = 0;
  @Input() dates: string[] = []; // Array of date strings in "YYYY-MM-DD" format
  @Input() selectedDate: moment.Moment | null = null;
  @Input() currentView: 'day' | 'week' | 'month' = 'day';
  @Input() availabilitySlots: Record<string, string[]> | null = null;
  @Input() disablePastAndUnavailable: boolean = false;

  @Output() dateSelected = new EventEmitter<moment.Moment>();
  @Output() viewChanged = new EventEmitter<void>();

  months: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  viewYear!: number;
  viewMonth!: number; // 0-based month
  monthLabel: string = '—';

  calendarDays: CalendarDay[] = [];
  monthOptions: { value: number, text: string }[] = [];
  yearOptions: { value: number, text: string }[] = [];


  ngOnInit() {
    this.initSelectors();
    this.goToday(false);
    this.buildMonth(this.viewYear, this.viewMonth);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appointments'] || changes['dates'] || changes['availabilitySlots'] || changes['selectedDate'] || changes['currentView']) {
      this.buildMonth(this.viewYear, this.viewMonth);
    }
  }

  private initSelectors() {
    this.months.forEach((nm, idx) => {
      this.monthOptions.push({ value: idx, text: nm });
    });
    const nowY = moment().year();
    for (let yy = nowY - 5; yy <= nowY + 5; yy++) {
      this.yearOptions.push({ value: yy, text: String(yy) });
    }
  }

  // Set initial month/year to today
  public goToday(selectDay: boolean): void {
    const now = moment();
    this.viewYear = now.year();
    this.viewMonth = now.month();
    if (selectDay) {
      this.selectDate(now);
    } else {
      this.buildMonth(this.viewYear, this.viewMonth);
    }
  }

  buildMonth(y: number, m: number): void {
    this.viewYear = y;
    this.viewMonth = m;
    this.calendarDays = [];

    const first = moment({ year: y, month: m, date: 1 });
    const last = moment(first).endOf('month');
    const leading = first.isoWeekday() - 1;
    const days = last.date();

    this.monthLabel = first.format('MMMM YYYY');

    // Leading blanks
    for (let i = 0; i < leading; i++) {
      this.calendarDays.push({ date: moment(), ymd: '', d: 0, classes: 'h-10', hasAppts: false, isDisabled: true });
    }

    // Actual days, adding classes as needed
    for (let d = 1; d <= days; d++) {
      const date = moment({ year: y, month: m, date: d });
      const ymd = date.format('YYYY-MM-DD');

      const hasAppts = this.hasAvailableSlots(ymd, date);
      const isDisabled = this.isDateDisabled(date, hasAppts);

      let classes = 'bg-white hover:bg-slate-100 text-slate-900';
      if (isDisabled) {
        classes = 'bg-slate-100 text-slate-400 cursor-not-allowed';
      }

      this.calendarDays.push({ date: date, ymd, d, classes, hasAppts, isDisabled });
    }

    this.highlightCalendarDays();
  }

  // Extracted method for highlighting calendar days
  private highlightCalendarDays(): void {
    const selectedYMD = this.selectedDate ? moment(this.selectedDate).format('YYYY-MM-DD') : null;
    const today = moment(); // highlight today using local time

    let weekHighlightStart: moment.Moment | null = null;
    let weekHighlightEnd: moment.Moment | null = null;

    if (this.currentView === 'week' && this.selectedDate) {
      weekHighlightStart = moment(this.selectedDate).startOf('isoWeek');
      weekHighlightEnd = moment(weekHighlightStart).add(6, 'days');
    }

    this.calendarDays.forEach(day => {
      if (!day.ymd) return; // Skip placeholder days

      if (day.isDisabled) {
        day.classes = 'bg-slate-100 text-slate-400';
        return;
      }

      const date = day.date;

      let classes = 'bg-white hover:bg-slate-100 text-slate-900';
      let isWeekHighlighted = false;

      // 1. Check for Weekly Highlight
      if (this.currentView === 'week' && weekHighlightStart && weekHighlightEnd && date.isBetween(weekHighlightStart, weekHighlightEnd, 'day', '[]')) {
        isWeekHighlighted = true;
        classes = 'bg-indigo-100/70 text-indigo-800 hover:bg-indigo-200/70';
      }

      // 2. Check for Day Highlight (selected date)
      if (this.currentView === 'day' && day.ymd === selectedYMD) {
        classes = 'ring-2 ring-indigo-500 bg-indigo-50 text-indigo-800';
        isWeekHighlighted = false;
      }

      // 3. Check for Today (local)
      if (date.isSame(today, 'day')) {
        if (day.ymd === selectedYMD) {
          classes = 'ring-2 ring-indigo-500 bg-indigo-50 font-bold text-indigo-800';
        } else if (isWeekHighlighted) {
          classes = classes.replace('bg-indigo-100/70', 'bg-indigo-200/70');
          classes += ' font-bold border-2 border-indigo-400';
        } else {
          classes = 'bg-slate-900 text-white hover:bg-slate-700';
        }
      } else if (isWeekHighlighted && day.ymd === selectedYMD) {
        classes += ' !font-bold';
      }

      day.classes = classes;
    });
  }

  handleCalendarChange(): void {
    this.buildMonth(this.viewYear, this.viewMonth);
    this.viewChanged.emit();
  }

  prevMonth(): void {
    if (this.viewMonth === 0) { this.viewMonth = 11; this.viewYear--; } else this.viewMonth--;
    this.handleCalendarChange();
  }
  nextMonth(): void {
    if (this.viewMonth === 11) { this.viewMonth = 0; this.viewYear++; } else this.viewMonth++;
    this.handleCalendarChange();
  }

  selectDate(date: Date | moment.Moment): void {
    this.selectedDate = moment(date);
    this.buildMonth(this.viewYear, this.viewMonth);
    this.dateSelected.emit(this.selectedDate);
  }

  private hasAvailableSlots(ymd: string, date: moment.Moment): boolean {
    if (this.availabilitySlots && Object.keys(this.availabilitySlots).length > 0) {
      const slots = this.availabilitySlots[ymd] || [];
      if (!slots.length) {
        return false;
      }

      if (!this.disablePastAndUnavailable) {
        return true;
      }

      if (!date.isSame(moment(), 'day')) {
        return true;
      }

      const now = moment();
      return slots.some(slot => this.isSlotAfter(date, slot, now));
    }

    return this.dates.indexOf(ymd) !== -1;
  }

  private isDateDisabled(date: moment.Moment, hasSlots: boolean): boolean {
    if (!this.disablePastAndUnavailable) {
      return false;
    }

    const today = moment().startOf('day');
    if (date.isBefore(today, 'day')) {
      return true;
    }

    if (!hasSlots) {
      return true;
    }

    if (date.isSame(today, 'day') && this.availabilitySlots) {
      const slots = this.availabilitySlots[date.format('YYYY-MM-DD')] || [];
      if (!slots.length) {
        return true;
      }

      const now = moment();
      return !slots.some(slot => this.isSlotAfter(date, slot, now));
    }

    return false;
  }

  private isSlotAfter(date: moment.Moment, slot: string, compare: moment.Moment): boolean {
    const [hours, minutes] = slot.split(':').map(Number);
    const slotMoment = moment(date)
      .hour(hours)
      .minute(minutes)
      .second(0)
      .millisecond(0);
    return slotMoment.isAfter(compare);
  }

}
