import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Auth Guard zum Schutz von Routen.
 * Leitet nicht-authentifizierte Benutzer zur Login-Seite um.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Speichere die ursprüngliche URL für Redirect nach Login
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

