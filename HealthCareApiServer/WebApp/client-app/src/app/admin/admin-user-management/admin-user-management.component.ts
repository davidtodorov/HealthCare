import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { DepartmentModel, DoctorModel, UserModel } from '../../api/models';
import { DepartmentService, DoctorService, UserService } from '../../api/services';
import { AdminUserService } from './admin-user.service';

@Component({
  selector: 'app-admin-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-user-management.component.html',
  styleUrl: './admin-user-management.component.scss'
})
export class AdminUserManagementComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly doctorService = inject(DoctorService);
  private readonly departmentService = inject(DepartmentService);
  private readonly adminUserService = inject(AdminUserService);
  private readonly fb = inject(FormBuilder);

  users: UserModel[] = [];
  doctors: DoctorModel[] = [];
  departments: DepartmentModel[] = [];

  loading = false;
  loadError?: string;

  selectedUser?: UserModel;
  selectedDoctor?: DoctorModel;

  readonly nameForm = this.fb.group({
    username: ['', Validators.required],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    departmentId: this.fb.control<number | null>(null)
  });



  readonly passwordForm = this.fb.group({
    password: ['', [
      Validators.required,
      Validators.minLength(3),
    ]],
    confirmPassword: ['', [
      Validators.required
    ]],
  }, {
    validators: this.passwordMatchValidator
  });
  
  saving = false;
  saveMessage?: string;
  saveError?: string;

  passwordSaving = false;
  passwordMessage?: string;
  passwordError?: string;

  ngOnInit(): void {
    this.loadData();
  }

  trackByUser = (_: number, user: UserModel) => user.id ?? _;

  get departmentControl() {
    return this.nameForm.get('departmentId');
  }

  get passwordMismatch(): boolean {
    return this.passwordForm.hasError('mismatch');
  }

  private loadData(): void {
    this.loading = true;
    this.loadError = undefined;

    forkJoin({
      users: this.userService.userGetAll(),
      doctors: this.doctorService.doctorGetAll().pipe(catchError(() => of([] as DoctorModel[]))),
      departments: this.departmentService.departmentGetAll().pipe(catchError(() => of([] as DepartmentModel[])))
    }).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: ({ users, doctors, departments }) => {
        this.users = [...users].sort((a, b) => this.getUserDisplayName(a).localeCompare(this.getUserDisplayName(b)));
        this.doctors = doctors ?? [];
        this.departments = (departments ?? []).sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
        if (this.selectedUser) {
          const updatedUser = this.users.find(u => u.id === this.selectedUser?.id);
          if (updatedUser) {
            this.selectUser(updatedUser);
          }
        }
      },
      error: () => {
        this.loadError = 'Unable to load users right now. Please try again later.';
      }
    });
  }

  selectUser(user: UserModel): void {
    this.selectedUser = user;
    this.saveMessage = undefined;
    this.saveError = undefined;
    this.passwordMessage = undefined;
    this.passwordError = undefined;

    const doctor = this.doctors.find(d => d.userId === user.id);
    this.selectedDoctor = doctor;

    this.nameForm.patchValue({
      username: user.username ?? '',
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      departmentId: doctor?.departmentId ?? null
    });

    if (doctor) {
      this.departmentControl?.enable({ emitEvent: false });
    } else {
      this.departmentControl?.disable({ emitEvent: false });
    }

    this.passwordForm.reset({ password: '', confirmPassword: '' });
  }

  saveUser(): void {
    if (!this.selectedUser) {
      return;
    }

    if (this.nameForm.invalid) {
      this.nameForm.markAllAsTouched();
      return;
    }

    const { username, firstName, lastName, departmentId } = this.nameForm.getRawValue();
    const updatedUser: UserModel = {
      ...this.selectedUser,
      username: username ?? '',
      firstName: firstName ?? '',
      lastName: lastName ?? ''
    };

    const userUpdate$ = this.userService.userPut({ id: this.selectedUser.id!, body: updatedUser });

    let doctorUpdate$ = of({});
    if (this.selectedDoctor && typeof departmentId === 'number' && departmentId !== this.selectedDoctor.departmentId) {
      const updatedDoctor: DoctorModel = {
        ...this.selectedDoctor,
        departmentId
      };
      doctorUpdate$ = this.doctorService.doctorPut({ id: this.selectedDoctor.id!, body: updatedDoctor });
    }

    this.saving = true;
    this.saveMessage = undefined;
    this.saveError = undefined;

    forkJoin([userUpdate$, doctorUpdate$]).pipe(
      finalize(() => this.saving = false)
    ).subscribe({
      next: () => {
        Object.assign(this.selectedUser!, updatedUser);
        if (this.selectedDoctor && typeof departmentId === 'number') {
          this.selectedDoctor.departmentId = departmentId;
          const department = this.departments.find(d => d.id === departmentId);
          if (department) {
            this.selectedDoctor.departmentName = department.name;
          }
        }
        this.saveMessage = 'User details were updated successfully.';
        this.loadData();
      },
      error: () => {
        this.saveError = 'We could not update the user. Please try again.';
      }
    });
  }

  changePassword(): void {
    if (!this.selectedUser) {
      return;
    }

    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const password = this.passwordForm.value.password ?? '';
    this.passwordSaving = true;
    this.passwordMessage = undefined;
    this.passwordError = undefined;

    this.adminUserService.changePassword(this.selectedUser.id!, password).pipe(
      finalize(() => this.passwordSaving = false)
    ).subscribe({
      next: () => {
        this.passwordForm.reset({ password: '', confirmPassword: '' });
        this.passwordMessage = 'Password updated successfully.';
      },
      error: () => {
        this.passwordError = 'Unable to update password. Ensure it meets the requirements and try again.';
      }
    });
  }

  getUserDisplayName(user: UserModel): string {
    const first = user.firstName ?? '';
    const last = user.lastName ?? '';
    const full = `${first} ${last}`.trim();
    return full || `User #${user.id}`;
  }

  isDoctor(user: UserModel): boolean {
    return this.doctors.some(d => d.userId === user.id);
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password?.value && confirmPassword?.value) {
      return password.value === confirmPassword.value ? null : { 'mismatch': true };
    }
    return null;
  }


}
