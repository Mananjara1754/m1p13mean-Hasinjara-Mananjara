import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PromotionService, Promotion } from '../../services/promotion.service';

@Component({
  selector: 'app-promotions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './promotions.component.html',
  styleUrl: './promotions.component.css'
})
export class PromotionsComponent implements OnInit {
  promotions: Promotion[] = [];
  isLoading = false;
  showModal = false;
  isEditing = false;

  currentPromotion: Promotion = this.getEmptyPromotion();

  constructor(private promotionService: PromotionService) { }

  ngOnInit(): void {
    this.loadPromotions();
  }

  getEmptyPromotion(): Promotion {
    return {
      title: '',
      type: 'homepage',
      start_date: new Date(),
      end_date: new Date(),
      budget: {
        amount: 0, currency: 'MGA'
      },
      is_active: true
    };
  }

  loadPromotions() {
    this.isLoading = true;
    this.promotionService.getPromotions().subscribe({
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

  openAddModal() {
    this.isEditing = false;
    this.currentPromotion = this.getEmptyPromotion();
    this.showModal = true;
  }

  openEditModal(promotion: Promotion) {
    this.isEditing = true;
    // Deep copy to avoid reference issues
    this.currentPromotion = JSON.parse(JSON.stringify(promotion));
    // Fix date strings back to Date objects if needed, or handle in template
    // Angular might return strings from API.
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  savePromotion() {
    if (!this.currentPromotion.title) return;

    if (this.isEditing && this.currentPromotion._id) {
      this.promotionService.updatePromotion(this.currentPromotion._id, this.currentPromotion).subscribe({
        next: () => {
          this.loadPromotions();
          this.closeModal();
        },
        error: (err) => console.error('Error updating promotion', err)
      });
    } else {
      this.promotionService.createPromotion(this.currentPromotion).subscribe({
        next: () => {
          this.loadPromotions();
          this.closeModal();
        },
        error: (err) => console.error('Error creating promotion', err)
      });
    }
  }

  deletePromotion(id: string) {
    if (confirm('Are you sure you want to delete this promotion?')) {
      this.promotionService.deletePromotion(id).subscribe({
        next: () => this.loadPromotions(),
        error: (err) => console.error('Error deleting promotion', err)
      });
    }
  }
}
