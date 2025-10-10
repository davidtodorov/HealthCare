import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { RegisterUserRequestModel } from '../../api/models';
import { apiIdentityRegisterPost } from '../../api/functions';
import { DoctorService, IdentityService } from '../../api/services';
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

  constructor(private fb: FormBuilder,
    private identityService: IdentityService,
    private doctorService: DoctorService,
    private router: Router) { }

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
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }

  get passwordMismatch() {
    return this.registerForm.errors?.['mismatch'] && this.confirmPassword?.touched;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      console.error('Registration failed: Form is invalid. Please correct the errors.');
      return;
    }

    const formData = this.registerForm.value;
    if (this.isDoctorRegister) {
      this.doctorService.apiDoctorCreatePost({
        body:
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          username: formData.username,
          email: formData.email,
          password: formData.password

        }
      }).subscribe(res => {
        console.log('Doctor created successfully');
      });
    } else {

      let model = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
        password: formData.password
      } as RegisterUserRequestModel;

      this.identityService.apiIdentityRegisterPost({ body: model }).subscribe(() => {
        this.router.navigateByUrl('/');
      });
    }
  }
}