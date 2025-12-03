/**
 * Environment-Konfiguration für verschiedene Deployment-Umgebungen
 */

export interface Environment {
  production: boolean;
  apiUrl: string;
  authConfig: {
    provider: 'cognito' | 'sapias' | 'mock';
    issuer: string;
    clientId: string;
    redirectUri: string;
    scope: string;
  };
}

/**
 * Entwicklungsumgebung (Mock)
 */
export const environment: Environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  authConfig: {
    provider: 'mock',
    issuer: 'http://localhost:4200',
    clientId: 'mock-client',
    redirectUri: 'http://localhost:4200/callback',
    scope: 'openid profile email'
  }
};

/**
 * SAP IAS Umgebung
 */
export const environmentSapIas: Environment = {
  production: true,
  apiUrl: 'https://your-sap-cap-backend.cfapps.eu10.hana.ondemand.com/api',
  authConfig: {
    provider: 'sapias',
    issuer: 'https://{tenant}.accounts.ondemand.com',
    clientId: '{your-sap-ias-client-id}',
    redirectUri: 'https://your-frontend.cfapps.eu10.hana.ondemand.com/callback',
    scope: 'openid profile email'
  }
};

/**
 * AWS Cognito Umgebung
 */
export const environmentCognito: Environment = {
  production: true,
  apiUrl: 'https://your-spring-boot-backend.amazonaws.com/api',
  authConfig: {
    provider: 'cognito',
    issuer: 'https://cognito-idp.{region}.amazonaws.com/{userPoolId}',
    clientId: '{your-cognito-client-id}',
    redirectUri: 'https://your-frontend.s3-website.{region}.amazonaws.com/callback',
    scope: 'openid profile email'
  }
};

