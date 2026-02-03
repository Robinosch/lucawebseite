import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {ApiService} from '../../services/api.service';
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
export class ForgotPasswordComponent {
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


  /**
   * Initiate password reset process
   */
  requestPasswordReset() {
    if (!this.email) {
      this.errorMessage = 'Bitte E-Mail-Adresse eingeben';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const startTime = performance.now();


    this.apiService.requestPasswordReset(this.email, this.username).subscribe({
      next: (response) => {
        const duration = performance.now() - startTime;


        if (this.selectedBackend === 'cognito') {
          this.successMessage = 'Ein Verifizierungscode wurde an Ihre E-Mail gesendet. Bitte geben Sie den Code und Ihr neues Passwort ein.';
        } else {
          this.successMessage = 'Eine E-Mail mit einem Link zum Zurücksetzen wurde gesendet. Bitte überprüfen Sie Ihr Postfach.';

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        }

        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Fehler beim Anfordern des Passwort-Resets';
        this.loading = false;
      }
    });
  }

  /**
   * Confirm password reset with code and new password
   */
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


    this.apiService.confirmPasswordReset(this.email, this.verificationCode, this.newPassword).subscribe({
      next: (response) => {
        this.successMessage = 'Passwort erfolgreich zurückgesetzt! Sie werden zum Login weitergeleitet...';

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);

        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Fehler beim Zurücksetzen des Passworts';
        this.loading = false;
      }
    });
  }

  /**
   * Navigate back to login page
   */
  goBackToLogin() {
    this.router.navigate(['/login']);
  }
}

