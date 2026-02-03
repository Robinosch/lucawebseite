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
   * Show a success message
   */
  success(message: string, duration = 4000): void {
    this.show(message, 'success', duration);
  }

  /**
   * Show an error message
   */
  error(message: string, duration = 6000): void {
    this.show(message, 'error', duration);
  }

  /**
   * Show a warning message
   */
  warning(message: string, duration = 5000): void {
    this.show(message, 'warning', duration);
  }

  /**
   * Show an info message
   */
  info(message: string, duration = 4000): void {
    this.show(message, 'info', duration);
  }

  /**
   * show toast
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
   * remove toast by id
   */
  remove(id: number): void {
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next(currentToasts.filter(t => t.id !== id));
  }

  /**
   * remove all toasts
   */
  clear(): void {
    this.toastsSubject.next([]);
  }
}

