import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

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

  selectedBackend: 'cognito' | 'sapias' = 'cognito';
  registerForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor() {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  async onRegister(): Promise<void> {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    try {
      const formData = this.registerForm.value;

      if (this.selectedBackend === 'cognito') {
        await this.registerWithCognito(formData);
      } else {
        await this.registerWithSapIas(formData);
      }

      this.successMessage = 'Registrierung erfolgreich! Bitte überprüfen Sie Ihre E-Mail.';

      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);

    } catch (error: any) {
      this.errorMessage = error.message || 'Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.';
    } finally {
      this.isLoading = false;
    }
  }

  private async registerWithCognito(data: any): Promise<void> {
    console.log('AWS Cognito Registrierung:', data);
    await this.simulateApiCall(1500);
  }

  private async registerWithSapIas(data: any): Promise<void> {
    console.log('SAP IAS Registrierung:', data);
    await this.simulateApiCall(1500);
  }

  private simulateApiCall(delay: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, delay));
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
