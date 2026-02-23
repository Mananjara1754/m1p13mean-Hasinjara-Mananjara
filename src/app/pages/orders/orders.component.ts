import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { PaymentService } from '../../services/payment.service';
import { PaginationComponent } from '../../components/pagination/pagination.component';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {
  orders: any[] = [];
  stats: any[] = [];
  isLoading = false;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;

  // Filters
  selectedStatus: string = '';
  searchTerm: string = '';
  sort: string = '-created_at';

  // Modals
  selectedOrder: any = null;
  isDetailsModalOpen = false;

  // Action Modals
  isActionModalOpen = false;
  pendingAction: 'confirmed' | 'cancelled' | null = null;
  selectedPaymentMethod: 'card' | 'transfer' | 'wallet' = 'card';
  actionOrder: any = null;

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private paymentService: PaymentService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadOrders();
    this.loadStats();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.orderService.getOrders(this.currentPage, this.pageSize, this.selectedStatus, this.sort, this.searchTerm)
      .subscribe({
        next: (response) => {
          this.orders = response.orders;
          this.totalItems = response.total;
          this.totalPages = response.pages;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading orders', err);
          this.isLoading = false;
        }
      });
  }

  loadStats(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.shop_id) {
      this.orderService.getOrderStats(user.shop_id).subscribe({
        next: (response) => {
          this.stats = response;
        }
      });
    }
  }

  onStatusFilterChange(): void {
    this.currentPage = 1;
    this.loadOrders();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadOrders();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadOrders();
  }

  viewDetails(order: any): void {
    this.selectedOrder = order;
    this.isDetailsModalOpen = true;
  }

  closeDetails(): void {
    this.isDetailsModalOpen = false;
    this.selectedOrder = null;
  }

  openActionModal(order: any, action: 'confirmed' | 'cancelled'): void {
    this.actionOrder = order;
    this.pendingAction = action;
    this.isActionModalOpen = true;
  }

  closeActionModal(): void {
    this.isActionModalOpen = false;
    this.pendingAction = null;
    this.actionOrder = null;
    this.selectedPaymentMethod = 'card';
  }

  confirmAction(): void {
    if (!this.actionOrder || !this.pendingAction) return;

    if (this.pendingAction === 'confirmed') {
      // 1. Create Payment first (Simulate success)
      const paymentData = {
        payment_type: 'order',
        reference: {
          order_id: this.actionOrder._id,
          shop_id: this.actionOrder.shop_id
        },
          amount: {
          value: this.actionOrder.amounts.total,
          currency: this.actionOrder.amounts.currency
        },
          buyer_id: this.actionOrder.buyer_id?._id || this.actionOrder.buyer_id,
        method: this.selectedPaymentMethod
      };

      this.paymentService.createPayment(paymentData).subscribe({
        next: () => {
          // Payment success updates order status inside backend paymentController
          this.loadOrders();
          this.loadStats();
          this.closeActionModal();
        },
        error: (err) => alert('Payment simulation failed: ' + err.message)
      });
    } else {
      // Refusal flow
      this.orderService.updateOrderStatus(this.actionOrder._id, 'cancelled').subscribe({
        next: () => {
          this.loadOrders();
          this.loadStats();
          this.closeActionModal();
        },
        error: (err) => console.error('Error updating status', err)
      });
    }
  }

  downloadInvoice(order: any): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const shopId = user.shop_id;

    const obs = (user.role === 'shop' && shopId)
      ? this.paymentService.getShopPayments(shopId, this.currentPage, this.pageSize)
      : this.paymentService.getPayments(this.currentPage, this.pageSize);

    obs.subscribe({
      next: (response) => {
        const payments = Array.isArray(response) ? response : (response.payments || []);
        const payment = payments.find((p: any) => p.reference?.order_id?._id === order._id || p.reference?.order_id === order._id);

        if (payment) {
          this.paymentService.downloadInvoice(payment._id).subscribe({
            next: (blob) => {
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `receipt_${order.order_number}.pdf`;
              a.click();
              window.URL.revokeObjectURL(url);
            },
            error: (err) => alert('Error downloading receipt: ' + err.message)
          });
        } else {
          alert('No payment found for this order.');
        }
      },
      error: (err) => alert('Error fetching payments: ' + err.message)
    });
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
    switch (status) {
      case 'pending': return 'status-pending';
      case 'confirmed': return 'status-confirmed';
      case 'shipped': return 'status-shipped';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  }

  getStatCount(status: string): number {
    const stat = this.stats.find(s => s._id === status);
    return stat ? stat.count : 0;
  }

  getStatAmount(status: string): number {
    const stat = this.stats.find(s => s._id === status);
    return stat ? stat.totalAmount : 0;
  }

  getTotalAmount(): number {
    return this.stats.reduce((acc, curr) => acc + curr.totalAmount, 0);
  }

  getTotalOrders(): number {
    return this.stats.reduce((acc, curr) => acc + curr.count, 0);
  }
}

