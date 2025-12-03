import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService, UserProfile } from '../../auth/auth.service';

/**
 * Dashboard-Component für BFF-Pattern.
 *
 * ARCHITEKTUR:
 * - Zeigt Benutzerdaten vom Backend
 * - Keine Token-Anzeige (Tokens sind im Backend)
 * - Session-basierte Authentifizierung
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  userProfile: UserProfile | null = null;
  isAuthenticated = false;

  ngOnInit(): void {
    // Subscribe zu User-Profil vom Backend
    this.authService.userProfile$.subscribe(profile => {
      this.userProfile = profile;
    });

    // Subscribe zu Auth-Status
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
    });
  }

  /**
   * Logout: Backend invalidiert Session.
   */
  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        // Navigation wird vom AuthService gehandhabt
      },
      error: (error) => {
        console.error('Logout-Fehler:', error);
        // Trotzdem zur Login-Seite navigieren
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


