import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

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
   * Retrieves user info from /user-api/currentUser endpoint
   * this is relevant for SAP IAS / XSUAA authentication
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
   * Post request to backend
   * @param endpoint API endpoint
   * @param data request payload
   */
  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, data, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  /**
   * Delete request to backend
   * @param endpoint API endpoint
   */
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}${endpoint}`, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  /**
   * Login user with credentials
   * @param credentials login data
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
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

  private loginSapCap(credentials: LoginRequest): Observable<AuthResponse> {
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

  private extractRolesFromUsername(username: string): string[] {
    if (username.toLowerCase().includes('admin')) {
      return ['Admin'];
    } else if (username.toLowerCase().includes('manager')) {
      return ['Manager'];
    }
    return ['User'];
  }

  /**
   * Register new user
   * @param data registration data
   */
  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, data, {
      withCredentials: true
    }).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  /**
   * verify user email with code
   * @param email user email
   * @param code verification code
   * @param username name of the user
   * @param backend backend to use (cognito or sapias)
   */
  verifyEmail(email: string, code: string, username: string, backend: 'cognito' | 'sapias'): Observable<AuthResponse> {
    if (backend === 'cognito') {
      this.apiUrl = environment.cognitoBackendUrl;
    }
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/verify-email`, {
      email,
      username,
      verificationCode: code
    }, { withCredentials: true }).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  /**
   * resend verification code to user email
   * @param username name of the user
   * @param email user email
   * @param backend backend to use (cognito or sapias)
   */
  resendVerificationCode(username: string, email: string, backend: 'cognito' | 'sapias'): Observable<AuthResponse> {
    if (backend === 'cognito') {
      this.apiUrl = environment.cognitoBackendUrl;
    }
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/resend-verification-code`, {
      email: email,
      username: username
    }, { withCredentials: true }).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Request password-reset from backend
   */
  requestPasswordReset(email: string, username?: string): Observable<AuthResponse> {
    return this.post<AuthResponse>(`${this.apiUrl}/auth/forgot-password`, { email, username });
  }

  /**
   * confirm passwort reset
   *
   * @param email - mail address of the user
   * @param code - code received by email
   * @param newPassword - new password to set
   */
  confirmPasswordReset(email: string, code: string, newPassword: string): Observable<AuthResponse> {
    return this.post<AuthResponse>(`${this.apiUrl}/auth/confirm-password-reset`, {
      email,
      verificationCode: code,
      newPassword
    });
  }

  /**
   * Logout current user
   */
  logout(): Observable<void> {
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
        this.clearLocalAuth();
        return throwError(() => error);
      })
    );
  }

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

    if (!this.isCloudMode) {
      this.router.navigate(['/login']);
    }
  }

  /**
   * check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject$.value;
  }

  /**
   * get all orders from backend
   * Cognito Backend: GET /api/orders
   * SAP IAS Backend: GET /odata/v4/api/orders/Orders
   * Authorization: USER role required
   */
  getAllOrders(): Observable<any[]> {
    const url = this.getOrdersUrl();
    return this.http.get<any>(url, {
      headers: this.getHeaders(),
      withCredentials: true
    }).pipe(
      map(response => {
        if (response && response.value) {
          return response.value;
        }
        return response;
      }),
      catchError(error => {
        if (error.status === 401 || error.status === 403) {
          this.clearLocalAuth();
        }
        return throwError(() => error);
      })
    );
  }


  /**
   * Create new order
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
   * delete an order by id
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
   * set current backend based on url
   */
  setBackendUrl(url: string): void {
    const newBackend = url.includes('8081') ? 'cognito' : 'sapias';

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
   * Set Basic Auth credentials for SAP CAP backend
   */
  setBasicAuth(username: string, password: string): void {
    const basicAuth = btoa(`${username}:${password}`);
    this.basicAuthCredentials = basicAuth;
    this.currentBackend = 'sapias';
    localStorage.setItem('basicAuthCredentials', basicAuth);
    localStorage.setItem('currentBackend', 'sapias');

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

  /**
   * check if current backend is Cognito
   */
  isCognitoBackend(): boolean {
    return this.currentBackend === 'cognito';
  }


  private getOrdersUrl(): string {
    if (this.isCloudMode) {
      return '/odata/v4/api/orders/Orders';
    }

    if (this.currentBackend === 'sapias') {
      return `${environment.sapIasODataUrl}/Orders`;
    }
    return `${this.apiUrl}/orders`;
  }
}

