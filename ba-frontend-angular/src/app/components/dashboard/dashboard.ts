import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

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

  userProfile: any = null;
  tokenInfo: any = null;

  ngOnInit(): void {
    this.authService.userProfile$.subscribe(profile => {
      this.userProfile = profile;
    });

    const claims = this.authService.getUserClaims();
    this.tokenInfo = {
      accessToken: this.authService.getAccessToken()?.substring(0, 20) + '...',
      idToken: this.authService.getIdToken()?.substring(0, 20) + '...',
      claims: claims
    };
  }

  logout(): void {
    this.authService.logout();
  }

  navigateToOrders(): void {
    this.router.navigate(['/orders']);
  }
}
