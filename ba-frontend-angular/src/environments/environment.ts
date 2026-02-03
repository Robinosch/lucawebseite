/**
 * Environment-Config for local development
 */
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8081/api', // Default: Spring Boot + AWS Cognito
  cognitoBackendUrl: 'http://localhost:8081/api',
  sapIasBackendUrl: 'http://localhost:8080', // SAP CAP Backend Port
  sapIasODataUrl: 'http://localhost:8080/odata/v4/api/orders', // OData V4 Endpoint
  cloudMode: false
};

