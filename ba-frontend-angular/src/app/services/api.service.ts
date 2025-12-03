import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

/**
 * Zentraler API Service für Backend-Kommunikation.
 * Fügt automatisch das Access Token zu allen Requests hinzu.
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  // Backend-URL - kann über Environment-Variablen konfiguriert werden
  private baseUrl = 'http://localhost:8080/api';

  /**
   * Setzt die Backend-URL (für Wechsel zwischen SAP CAP und Spring Boot Backend).
   */
  setBackendUrl(url: string): void {
    this.baseUrl = url;
  }

  /**
   * Erstellt HTTP-Headers mit Authorization Token.
   */
  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * GET Request an geschützten Endpunkt.
   */
  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * POST Request an geschützten Endpunkt.
   */
  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, data, {
      headers: this.getHeaders()
    });
  }

  /**
   * PUT Request an geschützten Endpunkt.
   */
  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, data, {
      headers: this.getHeaders()
    });
  }

  /**
   * DELETE Request an geschützten Endpunkt.
   */
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders()
    });
  }
}

