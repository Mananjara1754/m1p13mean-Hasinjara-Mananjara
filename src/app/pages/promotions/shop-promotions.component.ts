import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PromotionService, Promotion } from '../../services/promotion.service';
import { AuthService } from '../../services/auth.service';
import { ProductService, Product } from '../../services/product.service'; // Assuming ProductService exists and is exported
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-shop-promotions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shop-promotions.component.html',
  styleUrls: ['./promotions.component.css'] // Reuse existing styles
})
export class ShopPromotionsComponent implements OnInit {
  promotions: Promotion[] = [];
  products: Product[] = [];
  isLoading = false;
  showModal = false;
  isEditing = false;
  shopId: string | null = null;

  currentPromotion: Promotion = this.getEmptyPromotion();

  constructor(
    private promotionService: PromotionService,
    private authService: AuthService,
    private productService: ProductService
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user && user.shop_id) {
        this.shopId = user.shop_id;
        this.loadPromotions();
        this.loadProducts();
      }
    });
  }

  getEmptyPromotion(): Promotion {
    return {
      title: '',
      type: 'discount',
      description: '',
      discount_percent: 0,
      start_date: new Date(),
      end_date: new Date(new Date().setDate(new Date().getDate() + 7)), // Default 1 week
      budget: { amount: 0, currency: 'MGA' },
      is_active: true,
      shop_id: this.shopId || '',
      product_ids: []
    };
  }

  loadPromotions() {
    if (!this.shopId) return;
    this.isLoading = true;
    this.promotionService.getPromotions(this.shopId).subscribe({
      next: (data) => {
        this.promotions = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading promotions', err);
        this.isLoading = false;
      }
    });
  }

  loadProducts() {
    if (!this.shopId) return;
    // Load all products for the shop (pagination might be an issue if too many, but for now load mostly all)
    // Assuming getProducts supports limit/page, we might want a larger limit here
    this.productService.getProducts({ shop_id: this.shopId, limit: 100 }).subscribe({
      next: (data) => {
        this.products = data.products;
      }
    });
  }

  openAddModal() {
    this.isEditing = false;
    this.currentPromotion = this.getEmptyPromotion();
    this.showModal = true;
  }

  openEditModal(promotion: Promotion) {
    this.isEditing = true;
    this.currentPromotion = JSON.parse(JSON.stringify(promotion));

    // Ensure product_ids is array of strings
    if (this.currentPromotion.product_ids && this.currentPromotion.product_ids.length > 0) {
      // If populated, map to IDs
      this.currentPromotion.product_ids = this.currentPromotion.product_ids.map((p: any) =>
        typeof p === 'object' ? p._id : p
      );
    } else {
      this.currentPromotion.product_ids = [];
    }

    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  // Formatting dates for datetime-local input (YYYY-MM-DDThh:mm)
  formatDateForInput(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    const z = (n: number) => (n < 10 ? '0' : '') + n;
    return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}T${z(d.getHours())}:${z(d.getMinutes())}`;
  }

  onDateChange(event: any, field: 'start_date' | 'end_date') {
    this.currentPromotion[field] = new Date(event.target.value);
  }

  toggleProductSelection(productId: string) {
    if (!this.currentPromotion.product_ids) {
      this.currentPromotion.product_ids = [];
    }

    const index = this.currentPromotion.product_ids.indexOf(productId);
    if (index > -1) {
      this.currentPromotion.product_ids.splice(index, 1);
    } else {
      this.currentPromotion.product_ids.push(productId);
    }
  }

  isProductSelected(productId: string): boolean {
    return this.currentPromotion.product_ids?.includes(productId) || false;
  }

  savePromotion() {
    console.log('Attempting to save promotion...', this.currentPromotion);

    if (!this.currentPromotion.title) {
      alert('Veuillez saisir un titre pour la promotion.');
      return;
    }

    if (!this.shopId) {
      alert('Erreur: ID de boutique introuvable. Veuillez vous reconnecter.');
      return;
    }

    if (!this.currentPromotion.product_ids || this.currentPromotion.product_ids.length === 0) {
      alert('Veuillez sélectionner au moins un produit.');
      return;
    }

    this.currentPromotion.shop_id = this.shopId;
    this.isLoading = true;

    console.log('Sending promotion to service...', this.currentPromotion);

    const handleResponse = {
      next: (res: any) => {
        console.log('Promotion saved successfully', res);
        this.loadPromotions();
        this.closeModal();
        this.isLoading = false;
        alert('Promotion enregistrée avec succès !');
      },
      error: (err: any) => {
        console.error('Error saving promotion', err);
        this.isLoading = false;
        alert('Erreur lors de l\'enregistrement : ' + (err.error?.message || err.message));
      }
    };

    if (this.isEditing && this.currentPromotion._id) {
      this.promotionService.updatePromotion(this.currentPromotion._id, this.currentPromotion).subscribe(handleResponse);
    } else {
      this.promotionService.createPromotion(this.currentPromotion).subscribe(handleResponse);
    }
  }

  deletePromotion(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette promotion ? Les produits reviendront à leur prix normal.')) {
      this.promotionService.deletePromotion(id).subscribe({
        next: () => this.loadPromotions(),
        error: (err) => console.error('Error deleting promotion', err)
      });
    }
  }
}
