import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ApiService, LoginRequest } from '../../services/api.service';
import { environment } from '../../../environments/environment';

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

  isCloudMode: boolean = (environment as any).cloudMode || environment.production;

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    if (this.isCloudMode) {
      console.log('[CLOUD] Cloud-Modus erkannt - leite zum Dashboard weiter');
      this.router.navigate([this.returnUrl]);
      return;
    }

    if (this.apiService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }
  }


  /**
   * Login-Handler: Sendet Credentials an Backend
   * Backend handhabt OAuth2-Flow mit ausgewähltem IdP
   *
   * SAP IAS: Verwendet Basic Auth (Browser-Maske)
   * AWS Cognito: Verwendet Custom Login-Endpoint
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

    if (this.selectedBackend === 'sapias') {
      console.log('[SAP IAS] Verwende Basic Auth (Browser-Maske)');

      this.apiService.setBasicAuth(this.username, this.password);

      this.loading = false;
      this.router.navigate([this.returnUrl]);
    } else {
      this.apiService.login(credentials).subscribe({
        next: (response) => {
          this.loading = false;

          this.router.navigate([this.returnUrl]).then(success => {
          }).catch(err => {
            console.error(' Navigation fehlgeschlagen:', err);
          });
        },
        error: (error) => {
          console.error('Login-Fehler:', error);
          this.errorMessage = error.error?.message || 'Authentifizierung fehlgeschlagen. Bitte prüfen Sie Ihre Zugangsdaten';
          this.loading = false;
        }
      });
    }
  }

  /**
   * Backend-Wechsel für Vergleich (AWS Cognito vs. SAP IAS)
   */
  onBackendChange(): void {
    console.log(`Backend gewechselt zu: ${this.selectedBackend}`);
    const backendUrls = {
      'cognito': 'http://localhost:8081/api',
      'sapias': 'http://localhost:8080' // SAP CAP Backend
    };
    this.apiService.setBackendUrl(backendUrls[this.selectedBackend]);
  }
}



