import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, RegisterRequest } from '../../auth/auth.service';

/**
 * Register-Component für BFF-Pattern.
 *
 * ARCHITEKTUR:
 * - Sendet Registrierungsdaten an Backend
 * - Backend kommuniziert mit IdP (AWS Cognito / SAP IAS)
 * - Keine direkte IdP-Kommunikation vom Frontend
 * - Backend handhabt Verifikations-E-Mails etc.
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
  private authService = inject(AuthService);

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
      acceptTerms: [false, [Validators.requiredTrue]]
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

    const registerData: RegisterRequest = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      backend: this.selectedBackend
    };

    this.authService.register(registerData).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = response.message ||
            'Registrierung erfolgreich! Bitte überprüfen Sie Ihre E-Mail zur Verifikation.';

          // Nach 3 Sekunden zur Login-Seite
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        } else {
          this.errorMessage = response.message || 'Registrierung fehlgeschlagen.';
          this.isLoading = false;
        }
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
   * Backend-Wechsel für Vergleich.
   */
  onBackendChange(): void {
    console.log(`Backend gewechselt zu: ${this.selectedBackend}`);
    const backendUrls = {
      'cognito': 'http://localhost:8080',
      'sapias': 'http://localhost:8081'
    };
    this.authService.setBackendUrl(backendUrls[this.selectedBackend]);
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
