/**
 * Production Environment-Konfiguration für SAP BTP Deployment.
 *
 * In der Cloud:
 * - App Router handhabt Authentifizierung via SAP IAS
 * - Backend ist über relative Pfade erreichbar
 * - Kein direkter Login via Frontend-Formular nötig
 */
export const environment = {
  production: true,
  // Relative URLs - App Router leitet an Backend weiter
  apiUrl: '/api',
  cognitoBackendUrl: '/api', // Nicht verwendet in Cloud
  sapIasBackendUrl: '',
  sapIasODataUrl: '/odata/v4/api/orders'
};

