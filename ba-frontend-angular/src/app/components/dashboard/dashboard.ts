import {Component, inject, OnInit, ChangeDetectorRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import {ApiService, UserProfile} from '../../services/api.service';
import {environment} from '../../../environments/environment';
import {ToastService} from '../../services/toast.service';

/**
 * Dashboard-Component für BFF-Pattern.
 *
 * ARCHITEKTUR:
 * - Zeigt Benutzerdaten vom Backend
 * - Keine Token-Anzeige (Tokens sind im Backend)
 * - Session-basierte Authentifizierung
 * - Demonstriert rollenbasierte UI-Elemente
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private toast = inject(ToastService);

  userProfile: UserProfile | null = null;
  isAuthenticated = this.apiService.isAuthenticated();
  isCloudMode = (environment as any).cloudMode || environment.production;

  isCognitoBackend = true;
  canViewOrders = false;
  canCreateOrders = false;
  canDeleteOrders = false;

  ngOnInit(): void {
    this.isCognitoBackend = this.apiService.isCognitoBackend();

    this.apiService.userProfile$.subscribe(profile => {
      console.log('[DEBUG] Dashboard: userProfile$ Update erhalten:', profile);
      this.userProfile = profile;
      this.updatePermissions();
      this.cdr.detectChanges();
    });

    if (this.isCloudMode || !this.isCognitoBackend) {
      this.loadCloudUserInfo();
    }
  }

  /**
   * Lädt Benutzerinfo aus dem Cloud-Backend (nach SAP IAS Login).
   */
  private loadCloudUserInfo(): void {
    this.apiService.fetchUserInfo().subscribe({
      next: (userInfo) => {
        console.log('[DEBUG] Cloud UserInfo erhalten:', userInfo);
        if (userInfo) {
          const profile: UserProfile = {
            username: userInfo.username || userInfo.email || 'Unknown User',
            email: userInfo.email || '',
            roles: userInfo.roles || ['User']
          };

          this.userProfile = profile;
          localStorage.setItem('userProfile', JSON.stringify(profile));
          this.updatePermissions();
          this.cdr.detectChanges();

          const rolesText = profile.roles.length > 0 ? profile.roles.join(', ') : 'Keine';
          this.toast.success(`Willkommen ${profile.username}! Rollen: ${rolesText}`);
        }
      },
      error: (err) => {
        console.log('[DEBUG] Cloud UserInfo Fehler:', err);
        this.toast.warning('Benutzerinfo konnte nicht geladen werden');
        if (this.isCloudMode) {
          this.userProfile = {
            username: 'Cloud User',
            email: '',
            roles: ['User']
          };
          this.updatePermissions();
          this.cdr.detectChanges();
        }
      }
    });
  }

  /**
   * Aktualisiert UI-Berechtigungen basierend auf Benutzerrollen.
   * Orientiert sich an Spring Boot @PreAuthorize Annotationen:
   * - GET /api/orders - isAuthenticated()
   * - GET /api/orders/{id} - hasRole('MANAGER')
   * - POST /api/orders - hasRole('ADMIN')
   * - DELETE /api/orders/{id} - hasRole('ADMIN')
   */
  private updatePermissions(): void {
    if (!this.userProfile || !this.userProfile.roles) {
      this.canViewOrders = false;
      this.canCreateOrders = false;
      this.canDeleteOrders = false;
      return;
    }

    const roles = this.userProfile.roles.map(r => r.toUpperCase());

    // Jeder authentifizierte Benutzer kann Orders sehen
    this.canViewOrders = this.isAuthenticated;

    // Nur ADMIN kann Orders erstellen und löschen
    this.canCreateOrders = roles.includes('ADMIN');
    this.canDeleteOrders = roles.includes('ADMIN');
  }

  hasRole(role: string): boolean {
    if (!this.userProfile || !this.userProfile.roles) {
      return false;
    }
    return this.userProfile.roles.map(r => r.toUpperCase()).includes(role.toUpperCase());
  }

  /**
   * Kürzt Token für Anzeigezwecke (nur für Demo - eigentlich keine Tokens im Frontend!).
   */
  getTruncatedToken(): string {
    return 'Session-Cookie (HTTP-only)';
  }

  /**
   * Logout: Backend invalidiert Session.
   */
  logout(): void {
    this.apiService.logout().subscribe({
      next: () => {
      },
      error: (error) => {
        console.error('Logout-Fehler:', error);
        this.router.navigate(['/login']);
      }
    });
  }

  /**
   * Navigation zu geschützter Orders-Seite.
   */
  navigateToOrders(): void {
    this.router.navigate(['/orders']);
  }
}

