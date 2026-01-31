import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ShopService, CreateShopDto } from '../../../services/shop.service';

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

  shopData: CreateShopDto = {
    name: '',
    category: '',
    ownerId: '',
    location: {
      address: '',
      lat: 0,
      lng: 0,
      floor: ''
    }
  };

  constructor(
    private shopService: ShopService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.shopId = this.route.snapshot.paramMap.get('id');
    if (this.shopId) {
      this.isEditMode = true;
      this.loadShop(this.shopId);
    }
  }

  loadShop(id: string) {
    this.isLoading = true;
    this.shopService.getShopById(id).subscribe({
      next: (shop) => {
        this.shopData = {
          name: shop.name,
          category: shop.category,
          ownerId: shop.owner?._id || '', // Handle population
          location: shop.location,
          openingHours: shop.openingHours
        };
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading shop', err);
        // Navigate back or show error
        this.isLoading = false;
      }
    });
  }

  onSubmit() {
    this.isLoading = true;

    if (this.isEditMode && this.shopId) {
      this.shopService.updateShop(this.shopId, this.shopData).subscribe({
        next: () => this.handleSuccess(),
        error: (err) => this.handleError(err)
      });
    } else {
      this.shopService.createShop(this.shopData).subscribe({
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
    alert('Failed to save shop. See console for details.');
  }
}
