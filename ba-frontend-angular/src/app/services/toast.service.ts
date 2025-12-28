import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$ = this.toastsSubject.asObservable();

  private nextId = 0;

  /**
   * Zeigt eine Erfolgsmeldung
   */
  success(message: string, duration = 4000): void {
    this.show(message, 'success', duration);
  }

  /**
   * Zeigt eine Fehlermeldung
   */
  error(message: string, duration = 6000): void {
    this.show(message, 'error', duration);
  }

  /**
   * Zeigt eine Warnmeldung
   */
  warning(message: string, duration = 5000): void {
    this.show(message, 'warning', duration);
  }

  /**
   * Zeigt eine Info-Meldung
   */
  info(message: string, duration = 4000): void {
    this.show(message, 'info', duration);
  }

  /**
   * Zeigt einen Toast
   */
  private show(message: string, type: Toast['type'], duration: number): void {
    const toast: Toast = {
      id: this.nextId++,
      message,
      type,
      duration
    };

    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, toast]);

    if (duration > 0) {
      setTimeout(() => this.remove(toast.id), duration);
    }
  }

  /**
   * Entfernt einen Toast
   */
  remove(id: number): void {
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next(currentToasts.filter(t => t.id !== id));
  }

  /**
   * Entfernt alle Toasts
   */
  clear(): void {
    this.toastsSubject.next([]);
  }
}

