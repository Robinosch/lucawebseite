import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

/**
 * Email-Verifizierungs-Komponente für Hypothese H6.
 *
 * MESSBAR:
 * - Zeit vom Register-Button bis Account verifiziert
 * - Code-Zeilen für Verifizierung (minimal)
 * - Backend-Abstraktion: Identischer Code für AWS Cognito und SAP IAS
 */
@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.css',
})
export class VerifyEmailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);

  email = '';
  username = '';
  backend: 'cognito' | 'sapias' = 'cognito';
  verificationCode = '';
  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  showUsernameField = true;

  private registrationStartTime: number = 0;
  private verificationStartTime: number = 0;

  ngOnInit() {
    // Email aus Query Parameter oder localStorage
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || localStorage.getItem('pending_verification_email') || '';
    });

    // Backend aus localStorage
    const savedBackend = localStorage.getItem('pending_verification_backend');
    if (savedBackend === 'cognito' || savedBackend === 'sapias') {
      this.backend = savedBackend;
    }

    // Registrierungs-Startzeit für Gesamtdauer
    const savedTime = localStorage.getItem('registration_timestamp');
    if (savedTime) {
      this.registrationStartTime = parseInt(savedTime);
    }

    console.log(`[CASE_STUDY_METRIC] VERIFY_EMAIL_PAGE_LOADED: backend=${this.backend}, email=${this.email}, timestamp=${new Date().toISOString()}`);
  }

  /**
   * Verifizierung durchführen.
   * H6 KRITISCH: Ende der Registrierungs-Flow-Messung.
   */
  verifyCode() {
    if (!this.verificationCode || this.verificationCode.length !== 6) {
      this.errorMessage = 'Bitte gib einen 6-stelligen Code ein';
      return;
    }

    // Validiere Email ODER Username
    const identifier = this.email || this.username;
    if (!identifier) {
      this.errorMessage = 'Email-Adresse oder Username fehlt';
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;


    console.log(`[CASE_STUDY_METRIC] VERIFICATION_ATTEMPT: backend=${this.backend}, identifier=${identifier}, code_length=${this.verificationCode.length}, timestamp=${new Date().toISOString()}`);

    // Sende Code zum Backend (verwende Email oder Username)
    this.apiService.verifyEmail(identifier, this.verificationCode, localStorage.getItem("pending_verification_username") ?? this.username, this.backend).subscribe({
      next: (response) => {
        this.successMessage = response.message || 'Email erfolgreich verifiziert! Du wirst zum Login weitergeleitet...';

        // Cleanup
        localStorage.removeItem('pending_verification_email');
        localStorage.removeItem('pending_verification_backend');
        localStorage.removeItem('registration_timestamp');

        // Umleitung nach kurzer Verzögerung
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);

        this.loading = false;
      },
      error: (error) => {
        const verificationDuration = performance.now() - this.verificationStartTime;

        console.log(`[CASE_STUDY_METRIC] VERIFICATION_FAILED: backend=${this.backend}, identifier=${identifier}, duration_ms=${verificationDuration.toFixed(2)}, error=${error.error?.message || error.message}, status_code=${error.status}, timestamp=${new Date().toISOString()}`);

        this.errorMessage = error.error?.message || 'Verifizierung fehlgeschlagen. Versuche es erneut.';
        this.loading = false;
      }
    });
  }

  /**
   * Resend Code (optional - für bessere UX).
   */
  resendCode() {
    const identifier = localStorage.getItem("pending_verification_username");
    if (!identifier) return;

    console.log(`[CASE_STUDY_METRIC] RESEND_CODE_REQUESTED: backend=${this.backend}, identifier=${identifier}, timestamp=${new Date().toISOString()}`);

    this.apiService.resendVerificationCode(identifier, this.email, this.backend).subscribe({
      next: () => {
        this.successMessage = 'Neuer Code wurde gesendet!';
        this.errorMessage = null;

        console.log(`[CASE_STUDY_METRIC] RESEND_CODE_SUCCESS: backend=${this.backend}, identifier=${identifier}, timestamp=${new Date().toISOString()}`);
      },
      error: (error) => {
        this.errorMessage = 'Fehler beim Versenden des Codes';

        console.log(`[CASE_STUDY_METRIC] RESEND_CODE_FAILED: backend=${this.backend}, error=${error.message}, timestamp=${new Date().toISOString()}`);
      }
    });
  }
}

