import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { ShopService, Shop } from '../../../services/shop.service';
import { CategoryShopService, CategoryShop } from '../../../services/category-shop.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-shop-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './shop-list.component.html',
  styleUrl: './shop-list.component.css'
})
export class ShopListComponent implements OnInit {
  shops$!: Observable<Shop[]>;
  categories: CategoryShop[] = [];

  // Modal states
  isDetailsModalOpen = false;
  isFormModalOpen = false;
  isEditMode = false;
  isLoading = false;

  selectedShop: Shop | null = null;
  selectedLogo: File | null = null;

  // Form data
  shopData: any = {
    name: '',
    description: '',
    category_id: '',
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
    },
    // Owner Info (for creation only)
    user_firstname: '',
    user_lastname: '',
    user_email: ''
  };

  days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  constructor(
    private shopService: ShopService,
    private categoryShopService: CategoryShopService
  ) { }

  ngOnInit() {
    this.refreshShops();
    this.loadCategories();
  }

  loadCategories() {
    this.categoryShopService.getCategoryShops().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => console.error('Error loading categories', err)
    });
  }

  refreshShops() {
    this.shops$ = this.shopService.getShops();
  }

  // --- Details Modal ---
  openDetails(shop: Shop) {
    this.selectedShop = shop;
    this.isDetailsModalOpen = true;
  }

  closeDetails() {
    this.isDetailsModalOpen = false;
    this.selectedShop = null;
  }

  // --- Form Modal ---
  openAddModal() {
    this.isEditMode = false;
    this.resetForm();
    this.isFormModalOpen = true;
  }

  openEditModal(shop: Shop) {
    this.isEditMode = true;
    // Deep copy to avoid modifying the list item directly before save
    this.shopData = JSON.parse(JSON.stringify(shop));
    this.selectedShop = shop; // Keep reference to original if needed (e.g. for ID)

    // Ensure nested objects exist
    if (!this.shopData.location) this.shopData.location = { floor: 1, zone: '', map_position: { x: 0, y: 0 } };
    if (!this.shopData.rent) this.shopData.rent = { amount: 0, currency: 'USD', billing_cycle: 'monthly' };
    if (!this.shopData.opening_hours) {
      this.shopData.opening_hours = {
        monday: { open: '08:00', close: '20:00' },
        tuesday: { open: '08:00', close: '20:00' },
        wednesday: { open: '08:00', close: '20:00' },
        thursday: { open: '08:00', close: '20:00' },
        friday: { open: '08:00', close: '20:00' },
        saturday: { open: '10:00', close: '18:00' },
        sunday: { open: '', close: '' }
      };
    }

    this.isFormModalOpen = true;
  }

  closeFormModal() {
    this.isFormModalOpen = false;
    this.resetForm();
  }

  onClosedToggle(day: string) {
    if (this.shopData.opening_hours && this.shopData.opening_hours[day].is_closed) {
      this.shopData.opening_hours[day].open = '';
      this.shopData.opening_hours[day].close = '';
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

  resetForm() {
    this.shopData = {
      name: '',
      description: '',
      category_id: '',
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
      },
      user_firstname: '',
      user_lastname: '',
      user_email: ''
    };
    this.selectedLogo = null;
    this.selectedShop = null;
  }

  onLogoSelected(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.selectedLogo = event.target.files[0];
    }
  }

  saveShop() {
    this.isLoading = true;
    const formData = new FormData();

    formData.append('name', this.shopData.name || '');
    formData.append('description', this.shopData.description || '');
    formData.append('category_id', this.shopData.category_id || '');

    // Append location fields
    if (this.shopData.location) {
      formData.append('location[floor]', (this.shopData.location.floor || 0).toString());
      formData.append('location[zone]', this.shopData.location.zone || '');
      if (this.shopData.location.map_position) {
        formData.append('location[map_position][x]', (this.shopData.location.map_position.x || 0).toString());
        formData.append('location[map_position][y]', (this.shopData.location.map_position.y || 0).toString());
      }
    }

    // Append rent fields
    if (this.shopData.rent) {
      formData.append('rent[amount]', (this.shopData.rent.amount || 0).toString());
      formData.append('rent[currency]', this.shopData.rent.currency || 'USD');
      formData.append('rent[billing_cycle]', this.shopData.rent.billing_cycle || 'monthly');
    }

    // Append opening hours as JSON string because it's complex 
    // (or we can flat it, but backend parser handled JSON.parse for it)
    formData.append('opening_hours', JSON.stringify(this.shopData.opening_hours));

    if (this.selectedLogo) {
      formData.append('logo', this.selectedLogo);
    }

    if (this.isEditMode && this.selectedShop && this.selectedShop._id) {
      this.shopService.updateShop(this.selectedShop._id, formData).subscribe({
        next: () => {
          this.isLoading = false;
          this.closeFormModal();
          this.refreshShops();
        },
        error: (err) => {
          console.error('Update error', err);
          this.isLoading = false;
          alert(err.error?.message || 'Failed to update shop');
        }
      });
    } else {
      // Create with User
      formData.append('user_firstname', this.shopData.user_firstname);
      formData.append('user_lastname', this.shopData.user_lastname);
      formData.append('user_email', this.shopData.user_email);

      this.shopService.createShopWithUser(formData).subscribe({
        next: () => {
          this.isLoading = false;
          this.closeFormModal();
          this.refreshShops();
        },
        error: (err) => {
          console.error('Create error', err);
          this.isLoading = false;
          alert(err.error?.message || 'Failed to create shop');
        }
      });
    }
  }

  isOwnerObject(owner: any): owner is { profile: { firstname: string; lastname: string; email: string } } {
    return typeof owner === 'object' && owner !== null && 'profile' in owner;
  }

  getOwnerName(owner: any): string {
    if (this.isOwnerObject(owner)) {
      return `${owner.profile.firstname} ${owner.profile.lastname}`;
    }
    return owner || 'N/A';
  }

  getCategoryName(id: string | undefined): string {
    if (!id) return 'N/A';
    const cat = this.categories.find(c => c._id === id);
    return cat ? `${cat.icon} ${cat.name}` : 'N/A';
  }

  deleteShop(id: string) {
    if (confirm('Are you sure you want to delete this shop?')) {
      this.shopService.deleteShop(id).subscribe({
        next: () => this.refreshShops(),
        error: (err) => {
          console.error('Delete error', err);
          alert('Failed to delete shop');
        }
      });
    }
  }
}
