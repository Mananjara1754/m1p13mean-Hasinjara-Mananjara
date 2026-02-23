import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-auth-modal',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    templateUrl: './auth-modal.component.html',
    styleUrl: './auth-modal.component.css'
})
export class AuthModalComponent {
    @Input() isVisible = false;
    @Output() onConfirm = new EventEmitter<void>();
    @Output() onClose = new EventEmitter<void>();

    confirm() {
        this.onConfirm.emit();
    }

    close() {
        this.onClose.emit();
    }
}
