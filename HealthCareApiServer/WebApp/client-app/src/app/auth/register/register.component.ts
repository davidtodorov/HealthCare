import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { DepartmentModel, RegisterUserRequestModel } from '../../api/models';
import { DepartmentService, DoctorService, IdentityService } from '../../api/services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  @Input() isDoctorRegister: boolean = false;

  registerForm!: FormGroup;
  departments: DepartmentModel[] = [];

  private fb = inject(FormBuilder);
  private departmentService = inject(DepartmentService);
  private identityService = inject(IdentityService);
  private doctorService = inject(DoctorService);

  constructor(private router: Router) {
    const navigation = this.router!.getCurrentNavigation();
    const state = navigation?.extras.state;
    if (state && state['isDoctorRegister']) {
      this.isDoctorRegister = state['isDoctorRegister'];
    }
  }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.minLength(3)
      ]],
      firstName: ['', [
        Validators.required,
        Validators.minLength(3)
      ]],
      lastName: ['', [
        Validators.required,
        Validators.minLength(3)
      ]],
      email: ['', [
        Validators.required,
        Validators.email
      ]],
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

    // If it's a doctor registration, add the department control and load data
    if (this.isDoctorRegister) {
      this.registerForm.addControl('departmentId', this.fb.control('', Validators.required));
      this.loadDepartments();
    }
  }

  loadDepartments(): void {
    this.departmentService.departmentGetAll().subscribe(data => {
      this.departments = data;
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password?.value && confirmPassword?.value) {
      return password.value === confirmPassword.value ? null : { 'mismatch': true };
    }
    return null;
  }

  get username() { return this.registerForm.get('username'); }
  get firstName() { return this.registerForm.get('firstName'); }
  get lastName() { return this.registerForm.get('lastName'); }
  get departmentId() { return this.registerForm.get('departmentId'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }

  get passwordMismatch(): boolean {
    return !!this.registerForm.errors?.['mismatch'] && !!this.confirmPassword?.touched;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      console.error('Registration failed: Form is invalid. Please correct the errors.');
      return;
    }

    const formData = this.registerForm.value;
    if (this.isDoctorRegister) {
      this.doctorService.doctorCreate({ body: formData })
        .subscribe(() => {
          this.router?.navigateByUrl('/');
        });
    } else {
      const model: RegisterUserRequestModel = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
        password: formData.password
      } as RegisterUserRequestModel;

      this.identityService.identityRegister({ body: model }).subscribe(() => {
        this.router?.navigateByUrl('/');
      });
    }
  }
}