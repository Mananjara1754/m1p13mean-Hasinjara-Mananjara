import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../services/payment.service';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-payments',
    standalone: true,
    imports: [CommonModule, FormsModule, PaginationComponent],
    templateUrl: './payments.component.html',
    styleUrl: './payments.component.css'
})
export class PaymentsComponent implements OnInit {
    activeTab: 'validation' | 'history' | 'monitoring' = 'validation';
    isAdmin = false;

    // Payments List
    payments: any[] = [];
    isLoading = false;
    currentPage = 1;
    pageSize = 10;
    totalItems = 0;
    totalPages = 0;

    // Monitoring (Shops Status)
    shopsStatus: any[] = [];
    monitoredMonth: string = (new Date().getMonth() + 1).toString().padStart(2, '0');
    monitoredYear: number = new Date().getFullYear();
    years: number[] = [];
    months = [
        { value: '01', label: 'Janvier' }, { value: '02', label: 'Février' },
        { value: '03', label: 'Mars' }, { value: '04', label: 'Avril' },
        { value: '05', label: 'Mai' }, { value: '06', label: 'Juin' },
        { value: '07', label: 'Juillet' }, { value: '08', label: 'Août' },
        { value: '09', label: 'Septembre' }, { value: '10', label: 'Octobre' },
        { value: '11', label: 'Novembre' }, { value: '12', label: 'Décembre' }
    ];

    // Modals
    selectedPayment: any = null;
    isDetailsModalOpen = false;

    // Validation Modal
    paymentToValidate: any = null;
    isValidationModalOpen = false;
    selectedPaymentMethod: 'card' | 'transfer' | 'wallet' = 'transfer';

    constructor(
        private paymentService: PaymentService,
        private authService: AuthService,
        private toastService: ToastService
    ) {
        const currentYear = new Date().getFullYear();
        this.years = [currentYear - 1, currentYear, currentYear + 1];
    }

    ngOnInit(): void {
        this.authService.currentUser$.subscribe(user => {
            this.isAdmin = user?.role === 'admin';
            if (!this.isAdmin) {
                // Shop Owner: Only show Order payments
                this.loadShopPayments();
            } else {
                // Admin: Default to validation tab
                this.loadAdminData();
            }
        });
    }

    switchTab(tab: 'validation' | 'history' | 'monitoring') {
        this.activeTab = tab;
        this.currentPage = 1;
        this.loadAdminData();
    }

    loadAdminData() {
        if (this.activeTab === 'validation') {
            // Rent + Pending
            this.loadAdminPayments({ status: 'pending', payment_type: 'rent' });
        } else if (this.activeTab === 'history') {
            // Rent + Paid (or others, but typically rent is what we track here as per request)
            this.loadAdminPayments({ payment_type: 'rent' });
             // Note: If we want to exclude pending, we could, but showing history usually implies "past"
             // or "processed". Let's show all rents that are NOT pending if possible, or just all rents.
             // Currently generic filter logic in service.
             // To match "historique de paiement", we likely want 'paid'.
             // But if we just filter by type=rent, we see all.
             // Let's filter by status='paid' as per typical use case unless user wants all.
             // User said "ceux qui sont en attente et les historiques".
             // We'll treat history as 'paid', 'failed', 'overdue'.
             // Ideally we pass status as 'paid' or handle negation. For now let's query 'paid'.
             this.loadAdminPayments({ status: 'paid', payment_type: 'rent' });
        } else {
            this.loadMonitoringData();
        }
    }

    loadAdminPayments(filters: any) {
        this.isLoading = true;
        this.paymentService.getAllPayments(
            this.currentPage,
            this.pageSize,
            filters
        ).subscribe({
            next: (response: any) => {
                this.payments = response.payments || [];
                this.totalItems = response.total || 0;
                this.totalPages = response.pages || 1;
                this.isLoading = false;
            },
            error: (err) => {
                console.error(err);
                this.isLoading = false;
            }
        });
    }

    loadShopPayments() {
        this.isLoading = true;
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const shopId = user.shop_id;

        if (shopId) {
            // Shop Owner: Filter payment_type = 'order'
            this.paymentService.getShopPayments(shopId, this.currentPage, this.pageSize, { payment_type: 'order' })
                .subscribe({
                    next: (res: any) => {
                        this.payments = res.payments || [];
                        this.totalItems = res.total;
                        this.totalPages = res.pages;
                        this.isLoading = false;
                    },
                    error: () => this.isLoading = false
                });
        }
    }

    loadMonitoringData() {
        this.isLoading = true;
        this.paymentService.getRentStatus(this.monitoredMonth, this.monitoredYear.toString()).subscribe({
            next: (res: any) => {
                this.shopsStatus = res;
                this.isLoading = false;
            },
            error: (err) => {
                console.error(err);
                this.isLoading = false;
            }
        });
    }

    // Handlers
    openValidationModal(payment: any) {
        this.paymentToValidate = payment;
        this.selectedPaymentMethod = payment.method || 'transfer';
        this.isValidationModalOpen = true;
    }

    closeValidationModal() {
        this.isValidationModalOpen = false;
        this.paymentToValidate = null;
        this.selectedPaymentMethod = 'transfer';
    }

    confirmValidation() {
        if (!this.paymentToValidate) return;

        this.paymentService.validateRent(this.paymentToValidate._id, this.selectedPaymentMethod).subscribe({
            next: () => {
                this.toastService.success('Paiement validé avec succès');
                this.closeValidationModal();
                this.loadAdminData(); // Reload current view
            },
            error: (err) => this.toastService.error('Erreur: ' + err.message)
        });
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
            error: (err) => this.toastService.error('Erreur lors du téléchargement: ' + err.message)
        });
    }

    onPageChange(page: number): void {
        this.currentPage = page;
        if (this.isAdmin) {
            this.loadAdminData();
        } else {
            this.loadShopPayments();
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

    getStatusClass(status: string): string {
        return 'status-' + (status || 'pending').toLowerCase();
    }
}
