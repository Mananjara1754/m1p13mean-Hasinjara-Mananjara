import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService, Order } from '../../services/order.service';
import { PriceFormatPipe } from '../../pipes/price-format.pipe';
import { TranslateModule } from '@ngx-translate/core';

import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, PriceFormatPipe],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {
  orders: any[] = []; // Using any to handle population structure flexibly
  isLoading = true;
  selectedDate: string;

  constructor(
    private orderService: OrderService,
    private paymentService: PaymentService
  ) {
    // Set default date to today (YYYY-MM-DD)
    const now = new Date();
    this.selectedDate = now.toISOString().split('T')[0];
  }

  downloadInvoice(order: any) {
    this.paymentService.downloadInvoice(order._id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice_${order.order_number}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Error downloading invoice', err)
    });
  }

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading = true;
    this.orderService.getOrdersByDate(this.selectedDate).subscribe({
      next: (orders) => {
        this.orders = orders;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load orders', err);
        this.isLoading = false;
        this.orders = []; // Clear orders on error
      }
    });
  }

  onDateChange(event: any) {
    this.selectedDate = event.target.value;
    this.loadOrders();
  }
}
