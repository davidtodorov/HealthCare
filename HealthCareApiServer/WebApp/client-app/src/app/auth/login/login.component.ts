// src/app/login/login.component.ts

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IdentityService } from '../../api/services';
import { AuthService } from '../auth.service';
import { ROLE_ADMIN, ROLE_DOCTOR, ROLE_PATIENT } from '../../common/roles';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true, 
  imports: [CommonModule, ReactiveFormsModule], 
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder, 
    private identityService: IdentityService, 
    private router: Router,
    private auth: AuthService
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', [
        Validators.required, 
        Validators.minLength(3)
      ]],
      password: ['', [
        Validators.required, 
        Validators.minLength(3)
      ]],
    });
  }

  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const formData = this.loginForm.value;

    this.identityService.identityLogin({ body: { 
      username: formData.username, 
      password: formData.password 
    }}).subscribe({
      next: () => {
        this.auth.clear();
        this.auth.getRoles().pipe(take(1)).subscribe(roles => {
          this.router.navigateByUrl('/');
        });
      },
      error: (err) => {
        console.error('Login API call failed', err);
      }
    });
  }
}
