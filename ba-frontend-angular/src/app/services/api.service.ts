import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

/**
 * Unified API Service mit BFF-Pattern (Backend-for-Frontend).
 *
 * ARCHITEKTUR:
 * - Backend handhabt OAuth2/OIDC mit IdP (AWS Cognito / SAP IAS)
 * - Session-Management über HTTP-only Cookies
 * - Token-Validierung vollständig im Backend
 */

export interface LoginRequest {
  username: string;
  password: string;
  backend: 'cognito' | 'sapias'; // Backend-Auswahl für Vergleich
}

export interface RegisterRequest {
  familyName: string;
  givenName: string;
  username: string;
  email: string;
  password: string;
  backend: 'cognito' | 'sapias';
}

export interface UserProfile {
  username: string;
  email: string;
  roles: string[];
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: UserProfile;
  accessToken?: string;
  idToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private apiUrl = environment.apiUrl || 'http://localhost:8081/api';

  private currentBackend: 'cognito' | 'sapias' = 'cognito';

  private accessToken: string | null = null;

  private basicAuthCredentials: string | null = null;

  private isAuthenticatedSubject$ = new BehaviorSubject<boolean>(false);
  private userProfileSubject$ = new BehaviorSubject<UserProfile | null>(null);
  public userProfile$: Observable<UserProfile | null> = this.userProfileSubject$.asObservable();

  private isCloudMode = (environment as any).cloudMode || environment.production;

  constructor() {
    if (this.isCloudMode) {
      this.currentBackend = 'sapias';
      this.isAuthenticatedSubject$.next(true);
      return;
    }

    const storedToken = localStorage.getItem('accessToken');
    const storedBasicAuth = localStorage.getItem('basicAuthCredentials');
    const storedBackend = localStorage.getItem('currentBackend') as 'cognito' | 'sapias';

    if (storedBackend) {
      this.currentBackend = storedBackend;
    }

    if (storedToken) {
      this.accessToken = storedToken;
      this.isAuthenticatedSubject$.next(true);
    }

    if (storedBasicAuth) {
      this.basicAuthCredentials = storedBasicAuth;
      this.isAuthenticatedSubject$.next(true);
    }

    const storedUser = localStorage.getItem('userProfile');
    if (storedUser) {
      this.userProfileSubject$.next(JSON.parse(storedUser));
    }
  }

  /**
   * Holt Benutzerinfo vom Backend.
   * Im Cloud-Modus wird der App Router User-API Service verwendet.
   * Dieser gibt automatisch die Benutzerinfos aus dem XSUAA/IAS Token zurück.
   */
  fetchUserInfo(): Observable<any> {
    return this.http.get<any>('/user-api/currentUser', { withCredentials: true }).pipe(
        map(user => {
          const roles = this.extractRolesFromScopes(user.scopes || []);

          return {
            authenticated: true,
            username: user.firstname ? `${user.firstname} ${user.lastname}` : user.email || user.logonName,
            email: user.email || user.logonName,
            roles: roles,
            givenName: user.firstname,
            familyName: user.lastname,
            scopes: user.scopes,
            rawUser: user
          };
        }),
        catchError(err => {
          return throwError(() => err);
        })
      );
  }

  /**
   * Extrahiert Rollen aus XSUAA Scopes.
   * XSUAA Scopes haben das Format: appname.RoleName (z.B. ba-backend-cap-ias!t12345.Admin)
   *
   */
  private extractRolesFromScopes(scopes: string[]): string[] {
    if (!scopes || scopes.length === 0) {
      return ['User'];
    }

    const roles: string[] = [];
    const knownRoles = ['Admin', 'Manager', 'User', 'Observer'];

    for (const scope of scopes) {
      if (['openid', 'email', 'profile', 'address', 'phone'].includes(scope)) {
        continue;
      }

      const parts = scope.split('.');
      const roleName = parts[parts.length - 1];

      if (knownRoles.includes(roleName)) {
        roles.push(roleName);
        console.log(`[DEBUG] Rolle "${roleName}" aus Scope "${scope}" extrahiert`);
      }
    }

    if (roles.length === 0) {
      return ['User'];
    }

    return roles;
  }

  /**
   * Erstellt HTTP-Headers mit Authorization Token/Basic Auth.
   * - Cloud-Modus: Kein Header nötig (Cookie/Session via App Router)
   * - Cognito: Bearer Token
   * - SAP CAP lokal: Basic Auth
   */
  private getHeaders(): HttpHeaders {
    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json'
    };

    // Cloud-Modus: Kein Authorization Header nötig - XSUAA/SAP IAS via Cookie
    if (this.isCloudMode) {
      return new HttpHeaders(headers);
    }

    if (this.currentBackend === 'sapias' && this.basicAuthCredentials) {
      // SAP CAP lokal: Basic Auth
      headers['Authorization'] = `Basic ${this.basicAuthCredentials}`;
    } else if (this.accessToken) {
      // Cognito oder SAP IAS Cloud: Bearer Token
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    return new HttpHeaders(headers);
  }

  /**
   * Generic POST Request an Backend.
   */
  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, data, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  /**
   * Generic GET Request an Backend.
   */
  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}${endpoint}`, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  /**
   * Generic PUT Request an Backend.
   */
  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}${endpoint}`, data, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  /**
   * Generic DELETE Request an Backend.
   */
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}${endpoint}`, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  // ==========================================
  // AUTHENTICATION METHODS
  // ==========================================

  /**
   * Login mit Username/Password.
   * - Cognito: Backend handhabt OAuth2-Flow und gibt JWT-Token zurück
   * - SAP CAP (lokal): Basic Auth direkt an OData-Endpoints
   * - SAP CAP (Cloud): SAP IAS OAuth2/OIDC Flow
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    // SAP CAP Backend: Basic Auth für lokale Entwicklung
    if (credentials.backend === 'sapias') {
      return this.loginSapCap(credentials);
    }

    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials, {
      withCredentials: true
    }).pipe(
      tap(response => {
        if (response.success && response.accessToken) {
          this.accessToken = response.accessToken;
          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('currentBackend', 'cognito');

          if (response.user) {
            this.userProfileSubject$.next(response.user);
            localStorage.setItem('userProfile', JSON.stringify(response.user));
          }

          if (response.refreshToken) {
            localStorage.setItem('refreshToken', response.refreshToken);
          }

          this.isAuthenticatedSubject$.next(true);

          console.log('[DEBUG] Cognito Token gespeichert:', {
            hasAccessToken: !!this.accessToken,
            username: response.user?.username,
            roles: response.user?.roles
          });
        }
      }),
      catchError(error => {
        this.isAuthenticatedSubject$.next(false);
        this.userProfileSubject$.next(null);
        this.accessToken = null;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userProfile');
        localStorage.removeItem('refreshToken');
        return throwError(() => error);
      })
    );
  }

  /**
   * Login für SAP CAP Backend.
   *
   * LOKAL (Basic Auth):
   * - Speichert Credentials lokal
   * - Basic Auth Header wird bei jedem Request mitgesendet
   * - Keine separate Login-API nötig
   *
   * CLOUD (SAP IAS):
   * - App Router leitet automatisch zu SAP IAS
   * - Kein manueller Login nötig
   */
  private loginSapCap(credentials: LoginRequest): Observable<AuthResponse> {
    // Basic Auth Credentials Base64-kodieren
    const basicAuth = btoa(`${credentials.username}:${credentials.password}`);

    this.basicAuthCredentials = basicAuth;
    this.currentBackend = 'sapias';
    localStorage.setItem('basicAuthCredentials', basicAuth);
    localStorage.setItem('currentBackend', 'sapias');

    const userProfile: UserProfile = {
      username: credentials.username,
      email: credentials.username,
      roles: this.extractRolesFromUsername(credentials.username)
    };

    this.userProfileSubject$.next(userProfile);
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    this.isAuthenticatedSubject$.next(true);

    console.log('[DEBUG] SAP CAP Credentials gespeichert:', {
      username: credentials.username,
      roles: userProfile.roles,
      hint: 'Basic Auth wird bei jedem API-Request gesendet'
    });

    return new Observable<AuthResponse>(observer => {
      observer.next({
        success: true,
        message: 'Credentials gespeichert. Validierung erfolgt beim ersten API-Aufruf.',
        user: userProfile
      });
      observer.complete();
    });
  }

  /**
   * Extrahiert Rollen aus dem Benutzernamen (Mock-User).
   * admin@test.com -> ['Admin']
   * manager@test.com -> ['Manager']
   * user@test.com -> ['User']
   */
  private extractRolesFromUsername(username: string): string[] {
    if (username.toLowerCase().includes('admin')) {
      return ['Admin'];
    } else if (username.toLowerCase().includes('manager')) {
      return ['Manager'];
    }
    return ['User'];
  }

  /**
   * Registrierung eines neuen Benutzers.
   * Backend kommuniziert mit IdP (AWS Cognito / SAP IAS).
   */
  register(data: RegisterRequest): Observable<AuthResponse> {
    const startTime = performance.now();
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, data, {
      withCredentials: true
    }).pipe(
      tap(() => {
        const duration = performance.now() - startTime;
        console.log(`[CASE_STUDY_METRIC] REGISTER_SUCCESS: backend=${data.backend}, duration_ms=${duration.toFixed(2)}, timestamp=${new Date().toISOString()}`);
      }),
      catchError(error => {
        const duration = performance.now() - startTime;
        console.log(`[CASE_STUDY_METRIC] REGISTER_FAILED: backend=${data.backend}, duration_ms=${duration.toFixed(2)}, timestamp=${new Date().toISOString()}`);
        return throwError(() => error);
      })
    );
  }

  /**
   * Email Verifizierung mit Code.
   * H6 KRITISCH: Messbar für Registrierungs-Flow.
   */
  verifyEmail(email: string, code: string, username: string, backend: 'cognito' | 'sapias'): Observable<AuthResponse> {
    const startTime = performance.now();
    if (backend === 'cognito') {
      this.apiUrl = environment.cognitoBackendUrl;
    }
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/verify-email`, {
      email,
      username,
      verificationCode: code
    }, { withCredentials: true }).pipe(
      tap(() => {
        const duration = performance.now() - startTime;
        console.log(`[CASE_STUDY_METRIC] EMAIL_VERIFICATION_SUCCESS: backend=${backend}, duration_ms=${duration.toFixed(2)}, timestamp=${new Date().toISOString()}`);
      }),
      catchError(error => {
        const duration = performance.now() - startTime;
        console.log(`[CASE_STUDY_METRIC] EMAIL_VERIFICATION_FAILED: backend=${backend}, duration_ms=${duration.toFixed(2)}, timestamp=${new Date().toISOString()}`);
        return throwError(() => error);
      })
    );
  }

  /**
   * Code erneut senden (für bessere UX).
   */
  resendVerificationCode(username: string, email: string, backend: 'cognito' | 'sapias'): Observable<AuthResponse> {
    if (backend === 'cognito') {
      this.apiUrl = environment.cognitoBackendUrl;
    }
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/resend-verification-code`, {
      email: email,
      username: username
    }, { withCredentials: true }).pipe(
      tap(() => {
        console.log(`[CASE_STUDY_METRIC] RESEND_CODE_SUCCESS: email=${email}, backend=${backend}`);
      }),
      catchError(error => {
        console.log(`[CASE_STUDY_METRIC] RESEND_CODE_FAILED: email=${email}, backend=${backend}`);
        return throwError(() => error);
      })
    );
  }

  /**
   * Passwort-Reset anfordern (Schritt 1).
   * Sendet E-Mail mit Verifizierungscode oder Link.
   *
   * AWS Cognito: Code per E-Mail
   * SAP IAS: Link per E-Mail
   */
  requestPasswordReset(email: string, username?: string): Observable<AuthResponse> {
    return this.post<AuthResponse>(`${this.apiUrl}/auth/forgot-password`, { email, username });
  }

  /**
   * Passwort-Reset bestätigen mit Code (Schritt 2 - nur für AWS Cognito).
   *
   * @param email - Benutzer E-Mail
   * @param code - Verifizierungscode aus E-Mail
   * @param newPassword - Neues Passwort
   */
  confirmPasswordReset(email: string, code: string, newPassword: string): Observable<AuthResponse> {
    return this.post<AuthResponse>(`${this.apiUrl}/auth/confirm-password-reset`, {
      email,
      verificationCode: code,
      newPassword
    });
  }

  /**
   * Logout: Backend invalidiert Session und lokal werden Token gelöscht.
   */
  logout(): Observable<void> {
    // Für SAP CAP: Kein Backend-Logout nötig bei Basic Auth
    if (this.currentBackend === 'sapias' && this.basicAuthCredentials) {
      this.clearLocalAuth();
      return new Observable(observer => {
        observer.next();
        observer.complete();
      });
    }

    return this.http.post<void>(`${this.apiUrl}/auth/logout`, {}, {
      withCredentials: true
    }).pipe(
      tap(() => {
        this.clearLocalAuth();
      }),
      catchError(error => {
        // Auch bei Fehler lokal ausloggen
        this.clearLocalAuth();
        return throwError(() => error);
      })
    );
  }

  /**
   * Löscht alle lokalen Auth-Daten.
   */
  private clearLocalAuth(): void {
    this.accessToken = null;
    this.basicAuthCredentials = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('basicAuthCredentials');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentBackend');

    this.isAuthenticatedSubject$.next(false);
    this.userProfileSubject$.next(null);

    // Im Cloud-Modus übernimmt App Router die Umleitung
    if (!this.isCloudMode) {
      this.router.navigate(['/login']);
    }
  }

  /**
   * Prüft synchron, ob Benutzer authentifiziert ist.
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject$.value;
  }

  /**
   * Gibt das aktuelle Benutzerprofil zurück.
   */
  getUserProfile(): UserProfile | null {
    return this.userProfileSubject$.value;
  }

  // ==========================================
  // ORDER MANAGEMENT METHODS (Protected Resources)
  // ==========================================

  /**
   * Holt alle Bestellungen.
   * Cognito Backend: GET /api/orders (REST)
   * SAP IAS Backend: GET /odata/v4/api/orders/Orders (OData V4)
   * Authorization: Authenticated users only
   */
  getAllOrders(): Observable<any[]> {
    const url = this.getOrdersUrl();
    return this.http.get<any>(url, {
      headers: this.getHeaders(),
      withCredentials: true
    }).pipe(
      map(response => {
        // OData V4 Response hat .value Array
        if (response && response.value) {
          return response.value;
        }
        // REST Response ist direkt das Array
        return response;
      }),
      catchError(error => {
        // Bei 401/403: Credentials sind ungültig - Benutzer ausloggen
        if (error.status === 401 || error.status === 403) {
          console.error('[DEBUG] Authentifizierung fehlgeschlagen:', error);
          this.clearLocalAuth();
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Holt eine spezifische Bestellung nach ID.
   * Cognito Backend: GET /api/orders/{id}
   * SAP IAS Backend: GET /odata/v4/api/orders/Orders('<uuid>')
   * Authorization: MANAGER role required
   */
  getOrderById(id: string): Observable<any> {
    if (this.currentBackend === 'sapias') {
      const encodedId = encodeURIComponent(id);
      const url = `${environment.sapIasODataUrl}/Orders('${encodedId}')`;
      return this.http.get<any>(url, {
        headers: this.getHeaders(),
        withCredentials: true
      });
    }
    return this.get<any>(`/orders/${id}`);
  }

  /**
   * Erstellt eine neue Bestellung.
   * Cognito Backend: POST /api/orders
   * SAP IAS Backend: POST /odata/v4/api/orders/Orders
   * Authorization: ADMIN role required
   */
  createOrder(order: any): Observable<any> {
    if (this.currentBackend === 'sapias') {
      const url = `${environment.sapIasODataUrl}/Orders`;
      return this.http.post<any>(url, order, {
        headers: this.getHeaders(),
        withCredentials: true
      });
    }
    return this.post<any>('/orders', order);
  }

  /**
   * Löscht eine Bestellung.
   * Cognito Backend: DELETE /api/orders/{id}
   * SAP IAS Backend: DELETE /odata/v4/api/orders/Orders('<uuid>')
   * Authorization: ADMIN role required
   */
  deleteOrder(id: string): Observable<void> {
    if (!id) {
      console.error('[DEBUG] deleteOrder: ID ist leer!');
      return throwError(() => new Error('ID ist erforderlich'));
    }

    if (this.currentBackend === 'sapias') {
      // OData V4: UUID in einfachen Anführungszeichen
      const url = `${environment.sapIasODataUrl}/Orders(${id})`;

      console.log('[DEBUG] DELETE URL:', url);

      const headers = new HttpHeaders({
        'Authorization': `Basic ${this.basicAuthCredentials}`,
        'Accept': 'application/json'
      });

      return this.http.delete<void>(url, {
        headers,
        withCredentials: true
      });
    }
    return this.delete<void>(`/orders/${id}`);
  }

  /**
   * Setzt die Backend-URL (für Wechsel zwischen Backends).
   * Löscht Auth-State bei Backend-Wechsel.
   */
  setBackendUrl(url: string): void {
    const newBackend = url.includes('8081') ? 'cognito' : 'sapias';

    // Bei Backend-Wechsel Auth-State clearen
    if (newBackend !== this.currentBackend) {
      this.accessToken = null;
      this.basicAuthCredentials = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('basicAuthCredentials');
      this.isAuthenticatedSubject$.next(false);
    }

    this.apiUrl = url;
    this.currentBackend = newBackend;
    localStorage.setItem('currentBackend', newBackend);
    console.log(`[DEBUG] Backend gewechselt zu: ${this.currentBackend}, URL: ${url}`);
  }

  /**
   * Setzt Basic Auth Credentials für SAP CAP Backend.
   * Browser-Maske wird beim ersten API-Call automatisch angezeigt.
   */
  setBasicAuth(username: string, password: string): void {
    const basicAuth = btoa(`${username}:${password}`);
    this.basicAuthCredentials = basicAuth;
    this.currentBackend = 'sapias';
    localStorage.setItem('basicAuthCredentials', basicAuth);
    localStorage.setItem('currentBackend', 'sapias');

    // User Profile aus Username ableiten
    const userProfile: UserProfile = {
      username: username,
      email: username,
      roles: this.extractRolesFromUsername(username)
    };

    this.userProfileSubject$.next(userProfile);
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    this.isAuthenticatedSubject$.next(true);

    console.log('[DEBUG] Basic Auth gesetzt:', {
      username,
      roles: userProfile.roles
    });
  }

  isCognitoBackend(): boolean {
    return this.currentBackend === 'cognito';
  }

  /**
   * Gibt das aktuelle Backend zurück.
   */
  getCurrentBackend(): 'cognito' | 'sapias' {
    return this.currentBackend;
  }

  /**
   * Gibt die korrekte Orders-URL basierend auf dem Backend zurück.
   * - Cloud-Modus: Relative URL (App Router leitet weiter)
   * - Cognito lokal: /api/orders (REST)
   * - SAP IAS lokal: /odata/v4/api/orders/Orders (OData V4)
   */
  private getOrdersUrl(): string {
    // Cloud-Modus: Relative URL - App Router leitet an Backend weiter
    if (this.isCloudMode) {
      return '/odata/v4/api/orders/Orders';
    }

    if (this.currentBackend === 'sapias') {
      return `${environment.sapIasODataUrl}/Orders`;
    }
    return `${this.apiUrl}/orders`;
  }
}

