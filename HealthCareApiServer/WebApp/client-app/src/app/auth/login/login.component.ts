// src/app/login/login.component.ts

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true, 
  imports: [CommonModule, ReactiveFormsModule], 
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  
  // Define the FormGroup that will represent our login form model
  loginForm!: FormGroup;

  // Inject FormBuilder to easily create the form structure
  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    // Initialize the form structure with default values and Validators
    this.loginForm = this.fb.group({
      email: ['', [
        Validators.required, 
        Validators.email
      ]],
      password: ['', [
        Validators.required, 
        Validators.minLength(3)
      ]],
    });
  }

  // Convenience getter for easy access to form controls in the template
  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  onSubmit(): void {
    // 1. Check if the entire form is valid
    if (this.loginForm.invalid) {
      // Mark all fields as touched to display errors if the user clicks submit too early
      this.loginForm.markAllAsTouched();
      console.error('Login failed: Form is invalid. Please correct the errors.');
      return;
    }

    // 2. Access the form data (value) from the FormGroup
    const formData = this.loginForm.value;

    console.log('Login successful! Submitting data:', {
      email: formData.email,
      password: '***', // Never log actual password in real apps
    });

    // 3. Call your authentication service here (e.g., this.authService.login(formData.email, formData.password))
    
    // Optional: Reset the form after successful submission
  }
}