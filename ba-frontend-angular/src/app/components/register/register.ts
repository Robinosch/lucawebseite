import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService, RegisterRequest } from '../../services/api.service';

/**
 * Register-Component für BFF-Pattern.
 *
 * ARCHITEKTUR:
 * - Sendet Registrierungsdaten an Backend
 * - Backend kommuniziert mit IdP (AWS Cognito / SAP IAS)
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
   * Custom Validator: Passwort und Bestätigung müssen übereinstimmen.
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
   * Registrierungs-Handler: Sendet Daten an Backend.
   * Backend handhabt IdP-Kommunikation (AWS Cognito / SAP IAS).
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
    // H6 Metrik: Start der Registrierung
    console.log(`[CASE_STUDY_METRIC] REGISTRATION_STARTED: backend=${this.selectedBackend}, username=${formData.username}, email=${formData.email}, timestamp=${new Date().toISOString()}`);

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
        const registrationDuration = performance.now() - registrationStartTime;

        console.log(`[CASE_STUDY_METRIC] REGISTRATION_SUCCESS: backend=${this.selectedBackend}, duration_ms=${registrationDuration.toFixed(2)}, email=${formData.email}, timestamp=${new Date().toISOString()}`);

        this.successMessage = response.message ||
          'Registrierung erfolgreich! Du wirst zur Email-Verifizierung weitergeleitet...';

        localStorage.setItem('pending_verification_email', formData.email);
        localStorage.setItem('pending_verification_username', formData.username);
        localStorage.setItem('pending_verification_backend', this.selectedBackend);
        localStorage.setItem('registration_timestamp', registrationStartTime.toString());

        console.log('[DEBUG] Weiterleitung zu /verify-email mit email:', formData.email);

        this.isLoading = false;
        this.router.navigate(['/verify-email'], {
          queryParams: {
            email: formData.email,
            username: formData.username
          }
        }).then(success => {
          console.log('[DEBUG] Navigation erfolgreich:', success);
        }).catch(err => {
          console.error('[DEBUG] Navigation fehlgeschlagen:', err);
        });
      },
      error: (error) => {
        const registrationDuration = performance.now() - registrationStartTime;
        console.error('Registrierungs-Fehler:', error);

        console.log(`[CASE_STUDY_METRIC] REGISTRATION_FAILED: backend=${this.selectedBackend}, duration_ms=${registrationDuration.toFixed(2)}, error=${error.error?.message || error.message}, timestamp=${new Date().toISOString()}`);

        this.errorMessage = error.error?.message ||
          'Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.';
        this.isLoading = false;
      }
    });
  }

  /**
   * Backend-Wechsel für Vergleich.
   */
  onBackendChange(): void {
    console.log(`Backend gewechselt zu: ${this.selectedBackend}`);
    const backendUrls = {
      'cognito': 'http://localhost:8081/api',
      'sapias': 'http://localhost:8080/api'
    };
    this.apiService.setBackendUrl(backendUrls[this.selectedBackend]);
  }

  /**
   * Markiert alle Formular-Felder als "touched" für Validierung.
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }


  switchBackend(): void {
    console.log(`Backend gewechselt zu: ${this.selectedBackend}`);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.registerForm.get(fieldName);

    if (!field || !field.touched || !field.errors) {
      return '';
    }

    if (field.errors['required']) {
      return 'Dieses Feld ist erforderlich.';
    }

    if (field.errors['email']) {
      return 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
    }

    if (field.errors['minlength']) {
      return `Mindestens ${field.errors['minlength'].requiredLength} Zeichen erforderlich.`;
    }

    if (field.errors['passwordMismatch']) {
      return 'Passwörter stimmen nicht überein.';
    }

    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}
