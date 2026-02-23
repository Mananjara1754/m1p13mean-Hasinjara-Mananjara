import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-pagination',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './pagination.component.html',
    styleUrl: './pagination.component.css'
})
export class PaginationComponent {
    @Input() currentPage: number = 1;
    @Input() totalPages: number = 1;
    @Input() totalItems: number = 0;
    @Input() pageSize: number = 8;
    @Output() pageChange = new EventEmitter<number>();
    @Output() limitChange = new EventEmitter<number>();

    get pages(): number[] {
        const pages = [];
        const maxVisiblePages = 5;
        let start = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let end = Math.min(this.totalPages, start + maxVisiblePages - 1);

        if (end - start + 1 < maxVisiblePages) {
            start = Math.max(1, end - maxVisiblePages + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    }

    onPageChange(page: number) {
        if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
            this.pageChange.emit(page);
        }
    }

    onLimitUpdate(event: Event) {
        const input = event.target as HTMLInputElement;
        const newLimit = parseInt(input.value, 10);
        if (!isNaN(newLimit) && newLimit > 0 && newLimit <= 100) {
            this.limitChange.emit(newLimit);
        }
    }
}
