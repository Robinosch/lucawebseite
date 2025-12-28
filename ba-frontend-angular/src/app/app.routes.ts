import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { environment } from '../environments/environment';

const cloudMode = (environment as any).cloudMode || environment.production;
const defaultRoute = cloudMode ? '/dashboard' : '/login';

export const routes: Routes = [
  {
    path: '',
    redirectTo: defaultRoute,
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register').then(m => m.Register)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./components/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'verify-email',
    loadComponent: () => import('./components/verify-email/verify-email.component').then(m => m.VerifyEmailComponent)
  },
  {
    path: 'callback',
    loadComponent: () => import('./components/callback/callback').then(m => m.Callback)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: cloudMode ? [] : [authGuard]
  },
  {
    path: 'orders',
    loadComponent: () => import('./components/orders/orders').then(m => m.Orders),
    canActivate: cloudMode ? [] : [authGuard]
  },
  {
    path: '**',
    redirectTo: defaultRoute
  }
];
