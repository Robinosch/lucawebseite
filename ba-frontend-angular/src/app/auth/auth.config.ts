import { AuthConfig } from 'angular-oauth2-oidc';

/**
 * OAuth2/OIDC-Konfigurationen für verschiedene Identity Provider.
 * Diese Konfigurationen können zur Laufzeit gewechselt werden.
 */

/**
 * AWS Cognito Konfiguration
 * Beispielhafte Konfiguration - muss mit echten Cognito-Werten befüllt werden.
 */
export const awsCognitoAuthConfig: AuthConfig = {
  issuer: 'https://cognito-idp.{region}.amazonaws.com/{userPoolId}',
  redirectUri: window.location.origin + '/callback',
  clientId: '{cognito-client-id}',
  responseType: 'code',
  scope: 'openid profile email',
  showDebugInformation: true,
  strictDiscoveryDocumentValidation: false,
};

/**
 * SAP IAS Konfiguration
 * Beispielhafte Konfiguration - muss mit echten SAP IAS-Werten befüllt werden.
 */
export const sapIasAuthConfig: AuthConfig = {
  issuer: 'https://{tenant}.accounts.ondemand.com',
  redirectUri: window.location.origin + '/callback',
  clientId: '{sap-ias-client-id}',
  responseType: 'code',
  scope: 'openid profile email',
  showDebugInformation: true,
  strictDiscoveryDocumentValidation: false,
};

/**
 * Lokale Mock-Konfiguration für Entwicklung ohne echten IdP.
 */
export const mockAuthConfig: AuthConfig = {
  issuer: 'http://localhost:4200',
  redirectUri: window.location.origin + '/callback',
  clientId: 'mock-client',
  responseType: 'code',
  scope: 'openid profile email',
  showDebugInformation: true,
  requireHttps: false,
  strictDiscoveryDocumentValidation: false,
};

