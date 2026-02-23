import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../services/payment.service';
import { ShopService } from '../../services/shop.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-rent',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './rent.component.html',
  styleUrl: './rent.component.css'
})
export class RentComponent implements OnInit {
  rentAmount: number = 0;
  rentCurrency: string = 'MGA';

  availableMonths: { value: string, label: string }[] = [];
  selectedMonth: string = '';
  selectedYear: number = new Date().getFullYear();

  years: number[] = [];

  payments: any[] = [];
  isLoading = false;
  isPaying = false;

  currentShopId: string = '';

  constructor(
    private paymentService: PaymentService,
    private shopService: ShopService,
    private authService: AuthService
  ) {
    const currentYear = new Date().getFullYear();
    this.years = [currentYear, currentYear + 1];
    this.selectedYear = currentYear;
  }

  ngOnInit(): void {
    // 1. Get User -> Shop
    // Since we don't have direct "getMyShop", we rely on user profile or search
    // Assuming authService.currentUserValue has shop_id if role is shop?
    // Or we fetch all shops and find the one owned by user.

    this.authService.currentUser$.subscribe(user => {
      if (user && user.role === 'shop') {
        this.loadShopAndRent(user._id);
      }
    });

    this.generateMonths();
  }

  async loadShopAndRent(userId: string) {
    this.isLoading = true;
    try {
      // Find shop owned by this user
      // Optimization: Backend could have /api/shops/my-shop endpoint
      // For now, list all and filter.
      const shops = await this.shopService.getShops().toPromise();
      const myShop = shops?.find((s: any) => {
        // owner_user_id can be object or string
        const ownerId = typeof s.owner_user_id === 'object' ? s.owner_user_id._id : s.owner_user_id;
        return ownerId === userId;
      });

      if (myShop) {
        this.currentShopId = myShop._id;
        this.rentAmount = myShop.rent?.amount || 0;
        this.rentCurrency = myShop.rent?.currency || 'MGA';

        this.loadPayments();
      } else {
        console.error('No shop found for this user');
      }
    } catch (error) {
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }

  loadPayments() {
    this.paymentService.getShopPayments(this.currentShopId).subscribe({
      next: (res: any) => {
        // API returns { payments: [], ... } or []
        this.payments = Array.isArray(res) ? res : (res.payments || []);
        // Filter only rent payments
        this.payments = this.payments.filter(p => p.payment_type === 'rent');
        this.updateAvailableMonths();
      },
      error: (err) => console.error(err)
    });
  }

  generateMonths() {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    // reset
    this.availableMonths = months.map((m, i) => ({
      value: (i + 1).toString().padStart(2, '0'),
      label: m
    }));
  }

  updateAvailableMonths() {
    // Exclude months that are already paid/pending for the selected year
    if (!this.payments) return;

    this.generateMonths(); // Reset first

    const paidMonths = this.payments
      .filter(p => p.period && p.period.month.startsWith(this.selectedYear.toString()))
      .map(p => p.period.month.split('-')[1]); // "2024-05" -> "05"

    this.availableMonths = this.availableMonths.filter(m => !paidMonths.includes(m.value));

    // Select first available if current selection is invalid
    if (this.availableMonths.length > 0 && !this.availableMonths.find(m => m.value === this.selectedMonth)) {
      this.selectedMonth = this.availableMonths[0].value;
    }
  }

  onYearChange() {
    this.updateAvailableMonths();
  }

  payRent() {
    if (!this.selectedMonth || !this.selectedYear || !this.currentShopId) return;

    this.isPaying = true;
    const data = {
      shop_id: this.currentShopId,
      month: this.selectedMonth,
      year: this.selectedYear.toString()
    };

    this.paymentService.payRent(data).subscribe({
      next: (res) => {
        alert('Paiement envoyé avec succès (En attente de validation)');
        this.isPaying = false;
        this.loadPayments(); // Reload to update list and available months
      },
      error: (err) => {
        alert('Erreur: ' + (err.error?.message || err.message));
        this.isPaying = false;
      }
    });
  }

  formatAmount(val: number, cur: string) {
    return new Intl.NumberFormat('fr-FR').format(val) + ' ' + cur;
  }
}
