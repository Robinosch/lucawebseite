/**
 * Environment-Konfiguration für BFF-Pattern.
 *
 * BACKEND-URLs:
 * - AWS Cognito Backend: http://localhost:8081 (Spring Boot)
 * - SAP IAS Backend: http://localhost:8080 (SAP CAP mit mvn spring-boot:run)
 */
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8081/api', // Default: Spring Boot + AWS Cognito
  cognitoBackendUrl: 'http://localhost:8081/api',
  sapIasBackendUrl: 'http://localhost:8080', // SAP CAP Backend Port
  sapIasODataUrl: 'http://localhost:8080/odata/v4/api/orders', // OData V4 Endpoint
  // Flag für Cloud-Modus: false = lokaler Modus mit Login-Formular
  cloudMode: false
};

