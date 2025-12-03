import { ApplicationConfig, provideBrowserGlobalErrorListeners, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideOAuthClient } from 'angular-oauth2-oidc';

import { routes } from './app.routes';
import { AuthService } from './auth/auth.service';
import { mockAuthConfig } from './auth/auth.config';

/**
 * Initialisiert den OAuth2-Service beim App-Start.
 * Konfiguriert den Identity Provider (AWS Cognito oder SAP IAS).
 */
function initializeAuth(authService: AuthService): () => void {
  return () => {
    // Standardmäßig Mock-Konfiguration für Entwicklung
    // In Produktion: awsCognitoAuthConfig oder sapIasAuthConfig
    authService.configure(mockAuthConfig);
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    provideOAuthClient(),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      deps: [AuthService],
      multi: true
    }
  ]
};
