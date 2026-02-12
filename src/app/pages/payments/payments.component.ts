import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../services/payment.service';
import { PaginationComponent } from '../../components/pagination/pagination.component';

@Component({
    selector: 'app-payments',
    standalone: true,
    imports: [CommonModule, FormsModule, PaginationComponent],
    templateUrl: './payments.component.html',
    styleUrl: './payments.component.css'
})
export class PaymentsComponent implements OnInit {
    payments: any[] = [];
    isLoading = false;

    // Pagination
    currentPage = 1;
    pageSize = 10;
    totalItems = 0;
    totalPages = 0;

    // Modals
    selectedPayment: any = null;
    isDetailsModalOpen = false;

    constructor(private paymentService: PaymentService) { }

    ngOnInit(): void {
        this.loadPayments();
    }

    loadPayments(): void {
        this.isLoading = true;

        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const shopId = user.shop_id;

        const observer = {
            next: (response: any) => {
                if (Array.isArray(response)) {
                    this.payments = response;
                    this.totalItems = response.length;
                    this.totalPages = 1;
                } else {
                    this.payments = response.payments || [];
                    this.totalItems = response.total || 0;
                    this.totalPages = response.pages || 1;
                }
                this.isLoading = false;
            },
            error: (err: any) => {
                console.error('Error loading payments', err);
                this.isLoading = false;
            }
        };

        if (user.role === 'shop' && shopId) {
            this.paymentService.getShopPayments(shopId, this.currentPage, this.pageSize).subscribe(observer);
        } else {
            this.paymentService.getPayments(this.currentPage, this.pageSize).subscribe(observer);
        }
    }

    formatAmount(value: number, currency?: string): string {
        try {
            const n = Number(value);
            if (isNaN(n)) return `${value} ${currency || ''}`.trim();
            return new Intl.NumberFormat('fr-FR').format(n) + (currency ? ` ${currency}` : '');
        } catch (e) {
            return `${value} ${currency || ''}`.trim();
        }
    }

    onPageChange(page: number): void {
        this.currentPage = page;
        this.loadPayments();
    }

    viewDetails(payment: any): void {
        this.selectedPayment = payment;
        this.isDetailsModalOpen = true;
    }

    closeDetails(): void {
        this.isDetailsModalOpen = false;
        this.selectedPayment = null;
    }

    downloadInvoice(paymentId: string): void {
        this.paymentService.downloadInvoice(paymentId).subscribe({
            next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `payment_${paymentId}.pdf`;
                a.click();
                window.URL.revokeObjectURL(url);
            },
            error: (err) => alert('Error downloading invoice: ' + err.message)
        });
    }

    getStatusClass(status: string): string {
        return 'status-' + (status || 'pending').toLowerCase();
    }
}
