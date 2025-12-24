import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import {ApiService} from '../services/api.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const apiService = inject(ApiService);

  if (apiService.isAuthenticated()) {
    return true;
  }

  // Leite zur Login-Seite um und speichere Return-URL
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });
  return false;
};

