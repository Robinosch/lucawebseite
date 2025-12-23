import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ApiService, LoginRequest } from '../../services/api.service';

/**
 * Login-Komponente mit BFF-Pattern (Backend-for-Frontend).
 *
 * - Username/Password-Eingabe
 * - Backend handhabt OAuth2/OIDC-Kommunikation mit IdP
 * - Frontend sendet nur Credentials an Backend
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  username: string = '';
  password: string = '';
  selectedBackend: 'cognito' | 'sapias' = 'cognito';

  loading: boolean = false;
  errorMessage: string = '';
  returnUrl: string = '/dashboard';

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    if (this.apiService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  /**
   * Login-Handler: Sendet Credentials an Backend
   * Backend handhabt OAuth2-Flow mit ausgewähltem IdP
   */
  login(): void {
    if (!this.username || !this.password) {
      this.errorMessage = 'Bitte geben Sie Benutzername und Passwort ein';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const credentials: LoginRequest = {
      username: this.username,
      password: this.password,
      backend: this.selectedBackend
    };

    this.apiService.login(credentials).subscribe({
      next: (response) => {
        console.log('[DEBUG] Login erfolgreich, Response:', response);
        this.loading = false;

        console.log('[DEBUG] Navigiere zu:', this.returnUrl);
        this.router.navigate([this.returnUrl]).then(success => {
          console.log('[DEBUG] Navigation erfolgreich:', success);
        }).catch(err => {
          console.error('[DEBUG] Navigation fehlgeschlagen:', err);
        });
      },
      error: (error) => {
        console.error('Login-Fehler:', error);
        this.errorMessage = error.error?.message || 'Authentifizierung fehlgeschlagen. Bitte prüfen Sie Ihre Zugangsdaten';
        this.loading = false;
      }
    });
  }

  /**
   * Backend-Wechsel für Vergleich (AWS Cognito vs. SAP IAS)
   */
  onBackendChange(): void {
    console.log(`Backend gewechselt zu: ${this.selectedBackend}`);
    const backendUrls = {
      'cognito': 'http://localhost:8081/api',
      'sapias': 'http://localhost:8080/api'
    };
    this.apiService.setBackendUrl(backendUrls[this.selectedBackend]);
  }
}



