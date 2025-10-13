import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoadingService } from '../loading.service';

@Component({
  selector: 'app-loading-spinner',
  imports: [CommonModule],
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.scss']
})
export class LoadingSpinnerComponent implements OnInit, OnDestroy {
  visible = false;

  private sub?: Subscription;

  constructor(
    private readonly loading: LoadingService,
    private readonly cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // initialize from service
    this.visible = this.loading.visible;
    // subscribe to changes (no signals — just a property + notifier)
    this.sub = this.loading.changes.subscribe(v => {
      this.visible = v;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}