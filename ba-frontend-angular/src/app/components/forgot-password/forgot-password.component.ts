import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import {FormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  imports: [
    FormsModule,
    NgIf
  ],
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  email = '';
  username = '';
  loading = false;
  errorMessage = '';
  successMessage = '';
  selectedBackend = 'cognito';

  verificationCode = '';
  newPassword = '';
  confirmPassword = '';

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
  }

  requestPasswordReset() {
    if (!this.email) {
      this.errorMessage = 'Bitte E-Mail-Adresse eingeben';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const startTime = performance.now();

    console.log(`[CASE_STUDY_METRIC] PASSWORD_RESET_REQUEST_STARTED: backend=${this.selectedBackend}, email=${this.email}, timestamp=${new Date().toISOString()}`);

    this.apiService.requestPasswordReset(this.email, this.username).subscribe({
      next: (response) => {
        const duration = performance.now() - startTime;

        console.log(`[CASE_STUDY_METRIC] PASSWORD_RESET_REQUEST_SUCCESS: backend=${this.selectedBackend}, duration_ms=${duration.toFixed(2)}, timestamp=${new Date().toISOString()}`);

        if (this.selectedBackend === 'cognito') {
          // AWS Cognito: Zeige Formular für Code + neues Passwort
          this.successMessage = 'Ein Verifizierungscode wurde an Ihre E-Mail gesendet. Bitte geben Sie den Code und Ihr neues Passwort ein.';
        } else {
          // SAP IAS: Nutzer erhält E-Mail mit direktem Link
          this.successMessage = 'Eine E-Mail mit einem Link zum Zurücksetzen wurde gesendet. Bitte überprüfen Sie Ihr Postfach.';

          // Nach 3 Sekunden zurück zum Login
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        }

        this.loading = false;
      },
      error: (error) => {
        const duration = performance.now() - startTime;

        console.log(`[CASE_STUDY_METRIC] PASSWORD_RESET_REQUEST_FAILED: backend=${this.selectedBackend}, duration_ms=${duration.toFixed(2)}, error=${error.error?.message || error.message}, timestamp=${new Date().toISOString()}`);

        this.errorMessage = error.error?.message || 'Fehler beim Anfordern des Passwort-Resets';
        this.loading = false;
      }
    });
  }

  // Schritt 2 (nur für Cognito): Passwort mit Code zurücksetzen
  confirmPasswordReset() {
    if (!this.verificationCode || !this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Bitte alle Felder ausfüllen';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwörter stimmen nicht überein';
      return;
    }

    if (this.newPassword.length < 8) {
      this.errorMessage = 'Passwort muss mindestens 8 Zeichen lang sein';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const startTime = performance.now();

    console.log(`[CASE_STUDY_METRIC] PASSWORD_RESET_CONFIRM_STARTED: backend=${this.selectedBackend}, email=${this.email}, timestamp=${new Date().toISOString()}`);

    this.apiService.confirmPasswordReset(this.email, this.verificationCode, this.newPassword).subscribe({
      next: (response) => {
        const duration = performance.now() - startTime;

        console.log(`[CASE_STUDY_METRIC] PASSWORD_RESET_CONFIRM_SUCCESS: backend=${this.selectedBackend}, duration_ms=${duration.toFixed(2)}, timestamp=${new Date().toISOString()}`);

        this.successMessage = 'Passwort erfolgreich zurückgesetzt! Sie werden zum Login weitergeleitet...';

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);

        this.loading = false;
      },
      error: (error) => {
        const duration = performance.now() - startTime;

        console.log(`[CASE_STUDY_METRIC] PASSWORD_RESET_CONFIRM_FAILED: backend=${this.selectedBackend}, duration_ms=${duration.toFixed(2)}, error=${error.error?.message || error.message}, timestamp=${new Date().toISOString()}`);

        this.errorMessage = error.error?.message || 'Fehler beim Zurücksetzen des Passworts';
        this.loading = false;
      }
    });
  }

  goBackToLogin() {
    this.router.navigate(['/login']);
  }
}

