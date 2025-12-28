import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { ApiService } from '../services/api.service';
import { environment } from '../../environments/environment';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const apiService = inject(ApiService);

  // Cloud-Modus: User ist bereits via XSUAA/SAP IAS authentifiziert
  // Der App Router leitet nicht-authentifizierte User automatisch um
  const isCloudMode = (environment as any).cloudMode || environment.production;
  if (isCloudMode) {
    return true;
  }

  if (apiService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });
  return false;
};

