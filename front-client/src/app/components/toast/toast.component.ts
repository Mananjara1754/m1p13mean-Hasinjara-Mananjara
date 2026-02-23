import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';
import { Observable } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    templateUrl: './toast.component.html',
    styleUrl: './toast.component.css'
})
export class ToastComponent implements OnInit {
    toasts$: Observable<Toast[]>;

    constructor(private toastService: ToastService) {
        this.toasts$ = this.toastService.toasts$;
    }

    ngOnInit(): void { }

    remove(id: number) {
        this.toastService.remove(id);
    }

    getIcon(type: string): string {
        switch (type) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            default: return 'ℹ️';
        }
    }
}
