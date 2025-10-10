import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-menu',
  imports: [],
  templateUrl: './main-menu.component.html',
  styleUrl: './main-menu.component.scss'
})
export class MainMenuComponent {
  constructor(private router: Router) { }

  goToCreateAppointment() {
    this.router.navigate(['/appointments']);
  }

  goToDoctorSchedule() {
    this.router.navigate(['/doctor-scheduler']);
  }

}
