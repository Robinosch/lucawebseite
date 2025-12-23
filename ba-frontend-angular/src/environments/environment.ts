/**
 * Environment-Konfiguration für BFF-Pattern.
 *
 * BACKEND-URLs:
 * - AWS Cognito Backend: http://localhost:8080
 * - SAP IAS Backend: http://localhost:8081
 */
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8081/api', // Default: Spring Boot + AWS Cognito
  cognitoBackendUrl: 'http://localhost:8081/api',
  sapIasBackendUrl: 'http://localhost:8080/api'
};

