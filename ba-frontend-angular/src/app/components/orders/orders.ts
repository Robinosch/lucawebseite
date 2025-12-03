import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);

  orders: any[] = [];
  isLoading = false;
  error: string | null = null;

  ngOnInit(): void {
    this.loadMockOrders();
  }

  loadMockOrders(): void {
    this.isLoading = true;

    setTimeout(() => {
      this.orders = [
        {
          id: 'ORD-001',
          customerName: 'Max Mustermann',
          product: 'SAP CAP Starter Kit',
          amount: 299.99,
          status: 'Versandt',
          date: new Date('2024-11-15')
        },
        {
          id: 'ORD-002',
          customerName: 'Erika Beispiel',
          product: 'Spring Boot Premium',
          amount: 199.99,
          status: 'In Bearbeitung',
          date: new Date('2024-11-20')
        },
        {
          id: 'ORD-003',
          customerName: 'Hans Schmidt',
          product: 'OAuth2 Security Guide',
          amount: 49.99,
          status: 'Geliefert',
          date: new Date('2024-11-10')
        }
      ];
      this.isLoading = false;
    }, 800);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Geliefert':
        return 'status-delivered';
      case 'Versandt':
        return 'status-shipped';
      case 'In Bearbeitung':
        return 'status-processing';
      default:
        return 'status-pending';
    }
  }
}
