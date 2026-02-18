import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../services/auth.service';
import { ShopService, Shop } from '../../services/shop.service';
import { CategoryShopService, CategoryShop } from '../../services/category-shop.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  user: User | null = null;
  shop: Shop | null = null;
  categories: CategoryShop[] = [];
  isLoading = false;
  isSavingShop = false;
  isChangingPassword = false;
  selectedLogo: File | null = null;

  // Password change data
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  dayNames: { [key: string]: string } = {
    'monday': 'Lundi',
    'tuesday': 'Mardi',
    'wednesday': 'Mercredi',
    'thursday': 'Jeudi',
    'friday': 'Vendredi',
    'saturday': 'Samedi',
    'sunday': 'Dimanche'
  };

  constructor(
    private authService: AuthService,
    private shopService: ShopService,
    private categoryShopService: CategoryShopService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      if (user?.shop_id) {
        this.loadShop(user.shop_id);
        this.loadCategories();
      }
    });
  }

  loadShop(id: string) {
    this.isLoading = true;
    this.shopService.getShopById(id).subscribe({
      next: (shop) => {
        this.shop = shop;
        // Normalize category_id to be the string ID for the select binding
        if (this.shop.category_id && typeof this.shop.category_id === 'object') {
          this.shop.category_id = (this.shop.category_id as any)._id;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading shop', err);
        this.isLoading = false;
      }
    });
  }

  loadCategories() {
    this.categoryShopService.getCategoryShops().subscribe({
      next: (data) => {
        this.categories = data;
      }
    });
  }

  onLogoSelected(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.selectedLogo = event.target.files[0];
    }
  }

  onClosedToggle(day: string) {
    if (this.shop?.opening_hours && this.shop.opening_hours[day].is_closed) {
      this.shop.opening_hours[day].open = '';
      this.shop.opening_hours[day].close = '';
    }
  }

  onTimeChange(day: string) {
    if (this.shop?.opening_hours) {
      const hours = this.shop.opening_hours[day];
      if (hours.open || hours.close) {
        hours.is_closed = false;
      }
    }
  }

  saveShop() {
    if (!this.shop) return;
    this.isSavingShop = true;

    const formData = new FormData();
    formData.append('name', this.shop.name);
    formData.append('description', this.shop.description || '');
    const categoryId = typeof this.shop.category_id === 'object'
      ? (this.shop.category_id as any)._id
      : this.shop.category_id;
    formData.append('category_id', categoryId || '');

    if (this.shop.location) {
      formData.append('location', JSON.stringify(this.shop.location));
    }

    if (this.shop.rent) {
      formData.append('rent', JSON.stringify(this.shop.rent));
    }

    formData.append('opening_hours', JSON.stringify(this.shop.opening_hours));

    if (this.selectedLogo) {
      formData.append('logo', this.selectedLogo);
    }

    this.shopService.updateShop(this.shop._id, formData).subscribe({
      next: (updated) => {
        this.shop = updated;
        this.isSavingShop = false;
        this.toastService.success('Paramètres de la boutique mis à jour avec succès');
      },
      error: (err) => {
        console.error(err);
        this.isSavingShop = false;
        this.toastService.error('Erreur lors de la mise à jour de la boutique');
      }
    });
  }

  changePassword() {
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.toastService.warning('Les mots de passe ne correspondent pas');
      return;
    }

    this.isChangingPassword = true;
    this.authService.changePassword({
      currentPassword: this.passwordData.currentPassword,
      newPassword: this.passwordData.newPassword
    }).subscribe({
      next: () => {
        this.isChangingPassword = false;
        this.passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };
        this.toastService.success('Mot de passe mis à jour avec succès');
      },
      error: (err) => {
        this.isChangingPassword = false;
        this.toastService.error(err.error?.message || 'Erreur lors du changement de mot de passe');
      }
    });
  }
}
