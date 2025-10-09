// src/app/register/register.component.ts

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { RegisterUserRequestModel }  from '../../api/models';
import { apiIdentityRegisterPost } from '../../api/functions';
import { IdentityService } from '../../api/services';

// --- Custom Validator Function ---
// This function is applied to the entire FormGroup (it takes a control, which is the FormGroup)
function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  // Only validate if both controls exist and the password has been entered
  if (password?.value && confirmPassword?.value) {
    // If values don't match, return the error object
    return password.value === confirmPassword.value ? null : { 'mismatch': true };
  }

  // No error if one or both fields are empty (basic required validation handles this)
  return null;
}
// ---------------------------------

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], 
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  
  // Define the FormGroup for the registration form
  registerForm!: FormGroup;

  constructor(private fb: FormBuilder, private service: IdentityService) { }

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
        // Add a regex for strength validation (e.g., must contain a number)
        Validators.pattern(/^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$/) 
      ]],
      confirmPassword: ['', [
        Validators.required
      ]],
    }, { 
      // Apply the custom validator to the entire FormGroup
      validators: passwordMatchValidator 
    });
  }

  // Convenience getters for easy access to form controls in the template
  get username() { return this.registerForm.get('username'); }
  get firstName() { return this.registerForm.get('firstName'); }
  get lastName() { return this.registerForm.get('lastName'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
  
  // Getter to easily check for the custom password mismatch error on the FormGroup
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
    let model = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      username: formData.username,
      email: formData.email,
      password: formData.password
    } as RegisterUserRequestModel;

    this.service.apiIdentityRegisterPost({ body: model }).subscribe({});

    // this.clientService.register(model).subscribe({
    //   next: () => {
    //     console.log('Registration successful! Submitting data:', {
    //       username: formData.username,
    //       email: formData.email,
    //       password: '***',
    //     });
    //   },
    //   error: (err) => {
    //     console.error('Registration failed:', err);
    //   }
    // });
    
    // Call your registration service here
  }
}