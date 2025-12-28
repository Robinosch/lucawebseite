/**
 * Production Environment-Konfiguration für SAP BTP Deployment.
 *
 * In der Cloud:
 * - App Router handhabt Authentifizierung via XSUAA/SAP IAS
 * - Backend ist über relative Pfade erreichbar
 * - KEIN Login-Formular nötig - XSUAA übernimmt Authentifizierung!
 * - User ist bereits authentifiziert, wenn er diese App erreicht
 */
export const environment = {
  production: true,
  // Relative URLs - App Router leitet an Backend weiter
  apiUrl: '/api',
  cognitoBackendUrl: '/api', // Nicht verwendet in Cloud
  sapIasBackendUrl: '',
  sapIasODataUrl: '/odata/v4/api/orders',
  // Flag für Cloud-Modus: Kein Login-Formular nötig!
  cloudMode: true
};

