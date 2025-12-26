import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ApiService, UserProfile } from '../../services/api.service';

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

  userProfile: UserProfile | null = null;
  isAuthenticated = this.apiService.isAuthenticated();

  isCognitoBackend = true;
  canViewOrders = false;
  canCreateOrders = false;
  canDeleteOrders = false;

  ngOnInit(): void {
    this.isCognitoBackend = this.apiService.isCognitoBackend();
    this.apiService.userProfile$.subscribe(profile => {
      this.userProfile = profile;
      this.updatePermissions();
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
      next: () => {},
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


