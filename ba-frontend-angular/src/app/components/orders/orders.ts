import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { ApiService, UserProfile } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import {environment} from '../../../environments/environment';

/**
 * Order-Component for protected resources
 *
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
  private toast = inject(ToastService);

  orders: any[] = [];

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();

  error: string | null = null;

  userProfile: UserProfile | null = null;

  canViewOrders = false;
  canViewOrderDetails = false;
  canCreateOrders = false;
  canDeleteOrders = false;
  isCloudMode = (environment as any).cloudMode || environment.production;

  isCognitoBackend = true;

  showCreateForm = false;
  newOrder = {
    customer: '',
    amount: 0,
    status: 'OPEN'
  };

  ngOnInit(): void {
    this.apiService.userProfile$.subscribe(profile => {
      if (this.isCloudMode || !this.isCognitoBackend) {
        this.userProfile = JSON.parse(localStorage.getItem('userProfile') ?? 'null') ;
      }else{
        this.userProfile = profile;
      }
      this.updatePermissions();

      if (this.isCloudMode || !this.isCognitoBackend) {
      }
    });

    this.loadOrders();
  }

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
   * load all orders
   * Backend: GET /api/orders
   * Authorization: isAuthenticated()
   */
  loadOrders(): void {
    this.isLoadingSubject.next(true);
    this.error = null;

    this.apiService.getAllOrders().subscribe({
      next: (orders) => {
        this.orders = orders || [];
        if (this.orders.length > 0) {
          this.toast.success(`${this.orders.length} Bestellung(en) geladen`);
        }
      },
      error: (err) => {
        if (err.status === 403) {
          this.error = 'Keine Berechtigung zum Anzeigen von Bestellungen (403 Forbidden)';
          this.toast.error('❌ Keine Berechtigung zum Anzeigen von Bestellungen');
        } else {
          this.error = err.error?.message || 'Fehler beim Laden der Bestellungen';
          this.toast.error(`Fehler: ${this.error}`);
        }
        this.orders = [];
      },
      complete: () => {
        this.isLoadingSubject.next(false);
        console.log('[DEBUG] loadOrders() abgeschlossen, isLoading=false');
      }
    });
  }

  /**
   * Create new order
   * Backend: POST /api/orders
   * Authorization: hasRole('ADMIN')
   */
  createOrder(): void {
    this.isLoadingSubject.next(true);
    this.error = null;

    this.apiService.createOrder(this.newOrder).subscribe({
      next: (order) => {
        this.orders.unshift(order);
        this.showCreateForm = false;
        this.resetForm();
        this.toast.success('✓ Bestellung erfolgreich erstellt!');
      },
      error: (err) => {
        console.error('[ERROR] Fehler beim Erstellen der Bestellung:', err);
        if (err.status === 403) {
          this.error = 'Keine Berechtigung zum Erstellen von Bestellungen (403 Forbidden). ADMIN-Rolle erforderlich!';
          this.toast.error('❌ Keine Berechtigung! ADMIN-Rolle erforderlich zum Erstellen von Bestellungen.');
        } else {
          this.error = err.error?.message || 'Fehler beim Erstellen der Bestellung';
          this.toast.error(`Fehler: ${this.error}`);
        }
      },
      complete: () => {
        this.isLoadingSubject.next(false);
      }
    });
  }

  /**
   * delete order by id
   * Backend: DELETE /api/orders/{id}
   * Authorization: hasRole('ADMIN')
   */
  deleteOrder(id: string): void {
    if (!confirm('Bestellung wirklich löschen?')) {
      return;
    }

    this.isLoadingSubject.next(true);
    this.error = null;

    this.apiService.deleteOrder(id).subscribe({
      next: () => {
        this.orders = this.orders.filter(o => (o.ID || o.id) !== id);
        this.toast.success('✓ Bestellung erfolgreich gelöscht!');
      },
      error: (err) => {
        console.error('[ERROR] Fehler beim Löschen der Bestellung:', err);
        if (err.status === 403) {
          this.error = 'Keine Berechtigung zum Löschen von Bestellungen (403 Forbidden). ADMIN-Rolle erforderlich!';
          this.toast.error('❌ Keine Berechtigung! ADMIN-Rolle erforderlich zum Löschen von Bestellungen.');
        } else {
          this.error = err.error?.message || 'Fehler beim Löschen der Bestellung';
          this.toast.error(`Fehler: ${this.error}`);
        }
      },
      complete: () => {
        this.isLoadingSubject.next(false);
      }
    });
  }

  /**
   * reset form
   */
  resetForm(): void {
    this.newOrder = {
      customer: '',
      amount: 0,
      status: 'OPEN'
    };
  }

  /**
   * navigate back to dashboard
   */
  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  /**
   * get CSS class based on order status
   * @param status order status
   */
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
