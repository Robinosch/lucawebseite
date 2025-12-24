import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { ApiService, UserProfile } from '../../services/api.service';

/**
 * Orders-Komponente mit geschützten Ressourcen.
 *
 * Demonstriert rollenbasierte Autorisierung entsprechend Spring Boot Controller:
 * - GET /api/orders - isAuthenticated()
 * - GET /api/orders/{id} - hasRole('MANAGER')
 * - POST /api/orders - hasRole('ADMIN')
 * - DELETE /api/orders/{id} - hasRole('ADMIN')
 */
@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);

  orders: any[] = [];

  // BehaviorSubject für bessere Change Detection
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();

  error: string | null = null;

  userProfile: UserProfile | null = null;

  // UI-State für Berechtigungen
  canViewOrders = false;
  canViewOrderDetails = false;
  canCreateOrders = false;
  canDeleteOrders = false;

  // Neues Bestellungs-Formular
  showCreateForm = false;
  newOrder = {
    customer: '',
    amount: 0,
    status: 'OPEN'
  };

  ngOnInit(): void {
    this.apiService.userProfile$.subscribe(profile => {
      this.userProfile = profile;
      this.updatePermissions();

      if (this.canViewOrders) {
        this.loadOrders();
      }
    });
  }

  /**
   * Aktualisiert UI-Berechtigungen basierend auf Benutzerrollen.
   */
  private updatePermissions(): void {
    if (!this.userProfile || !this.userProfile.roles) {
      this.canViewOrders = false;
      this.canViewOrderDetails = false;
      this.canCreateOrders = false;
      this.canDeleteOrders = false;
      return;
    }

    const roles = this.userProfile.roles.map(r => r.toUpperCase());

    this.canViewOrders = true;
    this.canViewOrderDetails = roles.includes('MANAGER') || roles.includes('ADMIN');
    this.canCreateOrders = roles.includes('ADMIN');
    this.canDeleteOrders = roles.includes('ADMIN');

  }

  /**
   * Lädt alle Bestellungen vom Backend.
   * Backend: GET /api/orders
   * Authorization: isAuthenticated()
   */
  loadOrders(): void {
    if (!this.canViewOrders) {
      this.error = 'Keine Berechtigung zum Anzeigen von Bestellungen';
      this.isLoadingSubject.next(false);
      return;
    }

    this.isLoadingSubject.next(true);
    this.error = null;

    this.apiService.getAllOrders().subscribe({
      next: (orders) => {
        this.orders = orders || [];
      },
      error: (err) => {
        this.error = err.error?.message || 'Fehler beim Laden der Bestellungen';
        this.orders = [];
      },
      complete: () => {
        this.isLoadingSubject.next(false);
        console.log('[DEBUG] loadOrders() abgeschlossen, isLoading=false');
      }
    });
  }

  /**
   * Erstellt eine neue Bestellung.
   * Backend: POST /api/orders
   * Authorization: hasRole('ADMIN')
   */
  createOrder(): void {
    if (!this.canCreateOrders) {
      this.error = 'Keine Berechtigung zum Erstellen von Bestellungen. ADMIN-Rolle erforderlich!';
      return;
    }

    this.isLoadingSubject.next(true);
    this.error = null;

    this.apiService.createOrder(this.newOrder).subscribe({
      next: (order) => {
        this.orders.unshift(order);
        this.showCreateForm = false;
        this.resetForm();
      },
      error: (err) => {
        console.error('[ERROR] Fehler beim Erstellen der Bestellung:', err);
        this.error = err.error?.message || 'Fehler beim Erstellen der Bestellung';
      },
      complete: () => {
        this.isLoadingSubject.next(false);
      }
    });
  }

  /**
   * Löscht eine Bestellung.
   * Backend: DELETE /api/orders/{id}
   * Authorization: hasRole('ADMIN')
   */
  deleteOrder(id: string): void {
    if (!this.canDeleteOrders) {
      this.error = 'Keine Berechtigung zum Löschen von Bestellungen. ADMIN-Rolle erforderlich!';
      return;
    }

    if (!confirm('Bestellung wirklich löschen?')) {
      return;
    }

    this.isLoadingSubject.next(true);
    this.error = null;

    this.apiService.deleteOrder(id).subscribe({
      next: () => {
        this.orders = this.orders.filter(o => o.id !== id);
      },
      error: (err) => {
        console.error('[ERROR] Fehler beim Löschen der Bestellung:', err);
        this.error = err.error?.message || 'Fehler beim Löschen der Bestellung';
      },
      complete: () => {
        this.isLoadingSubject.next(false);
      }
    });
  }

  /**
   * Setzt das Formular zurück.
   */
  resetForm(): void {
    this.newOrder = {
      customer: '',
      amount: 0,
      status: 'OPEN'
    };
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'COMPLETED':
        return 'status-delivered';
      case 'OPEN':
        return 'status-processing';
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  }
}
