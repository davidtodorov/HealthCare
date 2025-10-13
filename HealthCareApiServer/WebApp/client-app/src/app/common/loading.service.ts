import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private counter = 0;
  private _visible = false;

  /** Public read-only property */
  get visible(): boolean {
    return this._visible;
  }

  /** Emits whenever visibility changes */
  readonly changes = new Subject<boolean>();

  show(): void {
    this.counter++;
    if (!this._visible) {
      this._visible = true;
      this.changes.next(true);
    }
  }

  hide(): void {
    this.counter = Math.max(0, this.counter - 1);
    if (this.counter === 0 && this._visible) {
      this._visible = false;
      this.changes.next(false);
    }
  }

  /** Force-hide (e.g., after global error) */
  reset(): void {
    this.counter = 0;
    if (this._visible) {
      this._visible = false;
      this.changes.next(false);
    }
  }
}