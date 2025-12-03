import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * API Service für BFF-Pattern (Backend-for-Frontend).
 *
 * ARCHITEKTUR:
 * - KEINE Token-Verwaltung im Frontend
 * - Session über HTTP-only Cookies
 * - Backend handhabt Token-Validierung
 * - Backend proxied API-Calls zu geschützten Ressourcen
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);

  // Base URL für Backend-API (BFF)
  private baseUrl = environment.apiUrl || 'http://localhost:8080';

  /**
   * Setzt die Backend-URL (für Wechsel zwischen Backends).
   */
  setBackendUrl(url: string): void {
    this.baseUrl = url;
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
   * GET Request an Backend.
   *
   * SICHERHEIT:
   * - withCredentials: true sendet HTTP-only Cookie automatisch
   * - Backend validiert Session und leitet Request an IdP/Business API weiter
   */
  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders(),
      withCredentials: true  // Wichtig für Cookie-basierte Auth
    });
  }

  /**
   * POST Request an Backend.
   */
  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, data, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  /**
   * PUT Request an Backend.
   */
  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, data, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  /**
   * DELETE Request an Backend.
   */
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }
}



