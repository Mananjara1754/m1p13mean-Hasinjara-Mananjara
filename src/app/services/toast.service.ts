import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    params?: any;
    duration?: number;
}

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    private toastsSubject = new BehaviorSubject<Toast[]>([]);
    public toasts$ = this.toastsSubject.asObservable();
    private counter = 0;

    show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', params: any = null, duration: number = 3000) {
        const id = this.counter++;
        const toast: Toast = { id, message, type, params, duration };

        this.toastsSubject.next([...this.toastsSubject.value, toast]);

        if (duration > 0) {
            setTimeout(() => this.remove(id), duration);
        }
    }

    success(message: string, params: any = null, duration?: number) {
        this.show(message, 'success', params, duration);
    }

    error(message: string, params: any = null, duration?: number) {
        this.show(message, 'error', params, duration);
    }

    info(message: string, params: any = null, duration?: number) {
        this.show(message, 'info', params, duration);
    }

    warning(message: string, params: any = null, duration?: number) {
        this.show(message, 'warning', params, duration);
    }

    remove(id: number) {
        this.toastsSubject.next(this.toastsSubject.value.filter(t => t.id !== id));
    }
}
