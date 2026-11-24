import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  icon?: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly _toasts = signal<ToastMessage[]>([]);
  public readonly toasts = this._toasts.asReadonly();

  show(toast: Omit<ToastMessage, 'id'>): void {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { ...toast, id };
    
    this._toasts.update(list => [...list, newToast]);

    const duration = toast.duration ?? 3500;
    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  success(title: string, message: string, icon = 'fa-circle-check'): void {
    this.show({ type: 'success', title, message, icon });
  }

  info(title: string, message: string, icon = 'fa-circle-info'): void {
    this.show({ type: 'info', title, message, icon });
  }

  warning(title: string, message: string, icon = 'fa-triangle-exclamation'): void {
    this.show({ type: 'warning', title, message, icon });
  }

  error(title: string, message: string, icon = 'fa-circle-xmark'): void {
    this.show({ type: 'error', title, message, icon });
  }

  remove(id: string): void {
    this._toasts.update(list => list.filter(t => t.id !== id));
  }
}
