import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

/**
 * VerifyEmail-Component for aws cognito backend
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

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || localStorage.getItem('pending_verification_email') || '';
    });

    const savedBackend = localStorage.getItem('pending_verification_backend');
    if (savedBackend === 'cognito' || savedBackend === 'sapias') {
      this.backend = savedBackend;
    }
  }

  /**
   * start verification process
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

    this.apiService.verifyEmail(identifier, this.verificationCode, localStorage.getItem("pending_verification_username") ?? this.username, this.backend).subscribe({
      next: (response) => {
        this.successMessage = response.message || 'Email erfolgreich verifiziert! Du wirst zum Login weitergeleitet...';

        localStorage.removeItem('pending_verification_email');
        localStorage.removeItem('pending_verification_backend');
        localStorage.removeItem('registration_timestamp');

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);

        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Verifizierung fehlgeschlagen. Versuche es erneut.';
        this.loading = false;
      }
    });
  }

  /**
   * Resend Code (optional).
   */
  resendCode() {
    const identifier = localStorage.getItem("pending_verification_username");
    if (!identifier) return;

    this.apiService.resendVerificationCode(identifier, this.email, this.backend).subscribe({
      next: () => {
        this.successMessage = 'Neuer Code wurde gesendet!';
        this.errorMessage = null;
      },
      error: (error) => {
        this.errorMessage = 'Fehler beim Versenden des Codes';
      }
    });
  }
}

