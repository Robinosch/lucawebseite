import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

/**
 * BFF-Pattern: Session-basierter Authentication Service.
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
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // Base URL für Backend-API (BFF)
  private apiUrl = environment.apiUrl || 'http://localhost:8080';

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
          this.userProfileSubject$.next(response.user);
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
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, data, {
      withCredentials: true
    }).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
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

