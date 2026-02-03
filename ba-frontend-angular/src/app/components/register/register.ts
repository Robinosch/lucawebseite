import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService, RegisterRequest } from '../../services/api.service';

/**
 * Register-Component
 *
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private apiService = inject(ApiService);

  selectedBackend: 'cognito' | 'sapias' = 'cognito';
  registerForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor() {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
    }, { validators: this.passwordMatchValidator });
  }

  /**
   * Custom Validator for passwort to match confirmPassword
   */
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  /**
   * handle registration process
   */
  onRegister(): void {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const formData = this.registerForm.value;
    const registrationStartTime = performance.now();

    const registerData: RegisterRequest = {
      familyName: formData.lastName,
      givenName: formData.firstName,
      username: formData.username,
      email: formData.email,
      password: formData.password,
      backend: this.selectedBackend
    };

    this.apiService.register(registerData).subscribe({
      next: (response) => {
        this.successMessage = response.message ||
          'Registrierung erfolgreich! Du wirst zur Email-Verifizierung weitergeleitet...';

        localStorage.setItem('pending_verification_email', formData.email);
        localStorage.setItem('pending_verification_username', formData.username);
        localStorage.setItem('pending_verification_backend', this.selectedBackend);
        localStorage.setItem('registration_timestamp', registrationStartTime.toString());

        this.isLoading = false;
        this.router.navigate(['/verify-email'], {
          queryParams: {
            email: formData.email,
            username: formData.username
          }
        }).then(success => {})
          .catch(err => {});
      },
      error: (error) => {
        console.error('Registrierungs-Fehler:', error);
        this.errorMessage = error.error?.message ||
          'Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.';
        this.isLoading = false;
      }
    });
  }

  /**
   * change backend on selection
   */
  onBackendChange(): void {
    console.log(`Backend gewechselt zu: ${this.selectedBackend}`);
    const backendUrls = {
      'cognito': 'http://localhost:8081/api',
      'sapias': 'http://localhost:8080/api'
    };
    this.apiService.setBackendUrl(backendUrls[this.selectedBackend]);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
