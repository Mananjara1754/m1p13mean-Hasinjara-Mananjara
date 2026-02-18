import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ShopService, Shop } from '../../../services/shop.service';
import { CategoryShopService, CategoryShop } from '../../../services/category-shop.service';
import { CategoryService, Category } from '../../../services/category.service';

@Component({
  selector: 'app-shop-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './shop-form.component.html',
  styleUrl: './shop-form.component.css'
})
export class ShopFormComponent implements OnInit {
  isEditMode = false;
  isLoading = false;
  shopId: string | null = null;
  selectedLogo: File | null = null;
  categories: CategoryShop[] = [];
  productCategories: Category[] = [];

  days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  shopData: Partial<Shop> = {
    name: '',
    description: '',
    category_id: '',
    product_category_ids: [],
    location: {
      floor: 1,
      zone: '',
      map_position: { x: 0, y: 0 }
    },
    rent: {
      amount: 0,
      currency: 'USD',
      billing_cycle: 'monthly'
    },
    opening_hours: {
      monday: { open: '08:00', close: '20:00', is_closed: false },
      tuesday: { open: '08:00', close: '20:00', is_closed: false },
      wednesday: { open: '08:00', close: '20:00', is_closed: false },
      thursday: { open: '08:00', close: '20:00', is_closed: false },
      friday: { open: '08:00', close: '20:00', is_closed: false },
      saturday: { open: '10:00', close: '18:00', is_closed: false },
      sunday: { open: '', close: '', is_closed: true }
    }
  };

  constructor(
    private shopService: ShopService,
    private categoryShopService: CategoryShopService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.loadCategories();
    this.loadProductCategories();
    this.shopId = this.route.snapshot.paramMap.get('id');
    if (this.shopId) {
      this.isEditMode = true;
      this.loadShop(this.shopId);
    }
  }

  loadCategories() {
    this.categoryShopService.getCategoryShops().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => console.error('Error loading categories', err)
    });
  }

  loadProductCategories() {
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.productCategories = data;
      },
      error: (err) => console.error('Error loading product categories', err)
    });
  }

  loadShop(id: string) {
    this.isLoading = true;
    this.shopService.getShopById(id).subscribe({
      next: (shop) => {
        this.shopData = shop;
        // Ensure nested objects exist
        if (!this.shopData.location) this.shopData.location = { floor: 1, zone: '', map_position: { x: 0, y: 0 } };
        if (!this.shopData.rent) this.shopData.rent = { amount: 0, currency: 'USD', billing_cycle: 'monthly' };

        // Normalize IDs if they are populated objects
        if (this.shopData.category_id && typeof this.shopData.category_id === 'object') {
          this.shopData.category_id = (this.shopData.category_id as any)._id;
        }
        if (this.shopData.product_category_ids) {
          this.shopData.product_category_ids = this.shopData.product_category_ids.map((item: any) =>
            typeof item === 'object' ? item._id : item
          );
        }
        if (!this.shopData.product_category_ids) this.shopData.product_category_ids = [];

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading shop', err);
        this.isLoading = false;
      }
    });
  }

  onClosedToggle(day: string) {
    if (this.shopData.opening_hours && this.shopData.opening_hours[day].is_closed) {
      this.shopData.opening_hours[day].open = '';
      this.shopData.opening_hours[day].close = '';
    }
  }

  isProductCategorySelected(id: string): boolean {
    return this.shopData.product_category_ids?.includes(id) || false;
  }

  toggleProductCategory(id: string) {
    if (!this.shopData.product_category_ids) {
      this.shopData.product_category_ids = [];
    }

    const index = this.shopData.product_category_ids.indexOf(id);
    if (index > -1) {
      this.shopData.product_category_ids.splice(index, 1);
    } else {
      this.shopData.product_category_ids.push(id);
    }
  }

  onTimeChange(day: string) {
    if (this.shopData.opening_hours) {
      const hours = this.shopData.opening_hours[day];
      if (hours.open || hours.close) {
        hours.is_closed = false;
      }
    }
  }

  onLogoSelected(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.selectedLogo = event.target.files[0];
    }
  }

  onSubmit() {
    this.isLoading = true;
    const formData = new FormData();

    formData.append('name', this.shopData.name || '');
    formData.append('description', this.shopData.description || '');

    // Ensure we send string IDs
    const categoryId = typeof this.shopData.category_id === 'object' ? (this.shopData.category_id as any)._id : this.shopData.category_id;
    formData.append('category_id', categoryId || '');

    if (this.shopData.product_category_ids && this.shopData.product_category_ids.length > 0) {
      this.shopData.product_category_ids.forEach(item => {
        const id = typeof item === 'object' ? (item as any)._id : item;
        formData.append('product_category_ids[]', id);
      });
    }

    // Append location fields
    if (this.shopData.location) {
      formData.append('location[floor]', (this.shopData.location.floor || 0).toString());
      formData.append('location[zone]', this.shopData.location.zone || '');
      formData.append('location[map_position][x]', (this.shopData.location.map_position?.x || 0).toString());
      formData.append('location[map_position][y]', (this.shopData.location.map_position?.y || 0).toString());
    }

    // Append rent fields
    if (this.shopData.rent) {
      formData.append('rent[amount]', (this.shopData.rent.amount || 0).toString());
      formData.append('rent[currency]', this.shopData.rent.currency || 'USD');
      formData.append('rent[billing_cycle]', this.shopData.rent.billing_cycle || 'monthly');
    }

    // Append opening hours
    formData.append('opening_hours', JSON.stringify(this.shopData.opening_hours));

    if (this.selectedLogo) {
      formData.append('logo', this.selectedLogo);
    }

    if (this.isEditMode && this.shopId) {
      this.shopService.updateShop(this.shopId, formData).subscribe({
        next: () => this.handleSuccess(),
        error: (err) => this.handleError(err)
      });
    } else {
      this.shopService.createShop(formData).subscribe({
        next: () => this.handleSuccess(),
        error: (err) => this.handleError(err)
      });
    }
  }

  private handleSuccess() {
    this.isLoading = false;
    this.router.navigate(['/shops']);
  }

  private handleError(err: any) {
    console.error('Save error', err);
    this.isLoading = false;
    alert('Failed to save shop.');
  }
}
