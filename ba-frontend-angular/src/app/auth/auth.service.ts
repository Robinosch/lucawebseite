import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { OAuthService, AuthConfig } from 'angular-oauth2-oidc';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

/**
 * Zentraler Authentication Service für OAuth2/OIDC-Integration.
 * Unterstützt sowohl AWS Cognito als auch SAP IAS über standardisierte OIDC-Flows.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private oauthService = inject(OAuthService);
  private router = inject(Router);

  private isAuthenticatedSubject$ = new BehaviorSubject<boolean>(false);
  public isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject$.asObservable();

  private userProfileSubject$ = new BehaviorSubject<any>(null);
  public userProfile$: Observable<any> = this.userProfileSubject$.asObservable();

  constructor() {
    // Token-Events überwachen
    this.oauthService.events
      .pipe(filter((e) => e.type === 'token_received'))
      .subscribe(() => this.handleNewToken());
  }

  /**
   * Konfiguriert den OAuth2-Provider (AWS Cognito oder SAP IAS).
   * Die Konfiguration wird zur Laufzeit gesetzt, um zwischen Backends zu wechseln.
   */
  configure(config: AuthConfig): void {
    this.oauthService.configure(config);
    this.oauthService.setupAutomaticSilentRefresh();
    this.oauthService.loadDiscoveryDocumentAndTryLogin().then(() => {
      if (this.oauthService.hasValidAccessToken()) {
        this.isAuthenticatedSubject$.next(true);
        this.loadUserProfile();
      }
    });
  }

  /**
   * Startet den Login-Flow (Authorization Code Flow mit PKCE).
   */
  login(): void {
    this.oauthService.initCodeFlow();
  }

  /**
   * Logout des Benutzers.
   */
  logout(): void {
    this.oauthService.logOut();
    this.isAuthenticatedSubject$.next(false);
    this.userProfileSubject$.next(null);
    this.router.navigate(['/login']);
  }

  /**
   * Gibt das aktuelle Access Token zurück (für API-Aufrufe).
   */
  getAccessToken(): string {
    return this.oauthService.getAccessToken();
  }

  /**
   * Gibt das ID Token zurück.
   */
  getIdToken(): string {
    return this.oauthService.getIdToken();
  }

  /**
   * Prüft, ob der Benutzer authentifiziert ist.
   */
  isAuthenticated(): boolean {
    return this.oauthService.hasValidAccessToken();
  }

  /**
   * Lädt das Benutzerprofil aus den Token-Claims.
   */
  private loadUserProfile(): void {
    const claims = this.oauthService.getIdentityClaims();
    this.userProfileSubject$.next(claims);
  }

  /**
   * Wird aufgerufen, wenn ein neues Token empfangen wurde.
   */
  private handleNewToken(): void {
    this.isAuthenticatedSubject$.next(true);
    this.loadUserProfile();
  }

  /**
   * Gibt die User Claims zurück.
   */
  getUserClaims(): any {
    return this.oauthService.getIdentityClaims();
  }
}

