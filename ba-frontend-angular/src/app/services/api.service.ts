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
 * - Frontend speichert KEINE Tokens
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
  backend: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: UserProfile;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // Base URL für Backend-API (BFF)
  private apiUrl = environment.apiUrl || 'http://localhost:8081/api';

  // Observables für reaktive Komponenten
  private isAuthenticatedSubject$ = new BehaviorSubject<boolean>(false);
  public isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject$.asObservable();

  private userProfileSubject$ = new BehaviorSubject<UserProfile | null>(null);
  public userProfile$: Observable<UserProfile | null> = this.userProfileSubject$.asObservable();

  constructor() {
    // Prüfe Session beim Start
    this.checkSession();
  }

  /**
   * Erstellt Standard HTTP-Headers (ohne Authorization Token).
   * Session wird automatisch via HTTP-only Cookie mitgesendet.
   */
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
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
   * Prüft, ob eine gültige Session existiert (via Backend).
   * Backend validiert HTTP-only Cookie.
   */
  checkSession(): void {
    this.http.get<AuthResponse>(`${this.apiUrl}/auth/session`, { withCredentials: true })
      .pipe(
        tap(response => {
          if (response.success && response.user) {
            this.isAuthenticatedSubject$.next(true);
            this.userProfileSubject$.next(response.user);
          } else {
            this.isAuthenticatedSubject$.next(false);
            this.userProfileSubject$.next(null);
          }
        }),
        catchError(() => {
          this.isAuthenticatedSubject$.next(false);
          this.userProfileSubject$.next(null);
          return throwError(() => new Error('Session check failed'));
        })
      )
      .subscribe();
  }

  /**
   * Login mit Username/Password.
   * Backend handhabt OAuth2-Flow mit IdP und setzt HTTP-only Cookie.
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials, {
      withCredentials: true
    }).pipe(
      tap(response => {
        if (response.success && response.user) {
          this.isAuthenticatedSubject$.next(true);
          if (response.user) {
            this.userProfileSubject$.next(response.user);
          }
        }
      }),
      catchError(error => {
        this.isAuthenticatedSubject$.next(false);
        this.userProfileSubject$.next(null);
        return throwError(() => error);
      })
    );
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
    return this.post<AuthResponse>('/auth/forgot-password', { email, username });
  }

  /**
   * Passwort-Reset bestätigen mit Code (Schritt 2 - nur für AWS Cognito).
   *
   * @param email - Benutzer E-Mail
   * @param code - Verifizierungscode aus E-Mail
   * @param newPassword - Neues Passwort
   */
  confirmPasswordReset(email: string, code: string, newPassword: string): Observable<AuthResponse> {
    return this.post<AuthResponse>('/auth/confirm-password-reset', {
      email,
      verificationCode: code,
      newPassword
    });
  }

  /**
   * Logout: Backend invalidiert Session und HTTP-only Cookie.
   */
  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/logout`, {}, {
      withCredentials: true
    }).pipe(
      tap(() => {
        this.isAuthenticatedSubject$.next(false);
        this.userProfileSubject$.next(null);
        this.router.navigate(['/login']);
      }),
      catchError(error => {
        // Auch bei Fehler lokal ausloggen
        this.isAuthenticatedSubject$.next(false);
        this.userProfileSubject$.next(null);
        this.router.navigate(['/login']);
        return throwError(() => error);
      })
    );
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

  /**
   * Setzt die Backend-URL (für Wechsel zwischen Backends).
   */
  setBackendUrl(url: string): void {
    this.apiUrl = url;
  }
}

