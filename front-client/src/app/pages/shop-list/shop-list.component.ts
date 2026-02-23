import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { ShopService, Shop } from '../../services/shop.service';
import { CategoryService } from '../../services/category.service';
import { CategoryShops } from '../../data/dto/categoryShops.dto';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-shop-list',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './shop-list.component.html',
  styleUrl: './shop-list.component.css'
})
export class ShopListComponent implements OnInit {
  shops$!: Observable<Shop[]>;
  categories$!: Observable<CategoryShops[]>;
  selectedCategoryId: string | null = null;

  constructor(
    private shopService: ShopService,
    private categoryService: CategoryService
  ) { }

  ngOnInit() {
    this.categories$ = this.categoryService.getCategoryShops();
    this.shops$ = this.shopService.getShops();
  }

  filterByCategory(categoryId: string | null) {
    this.selectedCategoryId = categoryId;
    this.shops$ = this.shopService.getShops(categoryId || undefined);
  }

  getShopStatus(shop: Shop): { isOpen: boolean, text: string, details: string } {
    if (!shop || !shop.opening_hours) return { isOpen: false, text: 'shopDetail.closed', details: '' };

    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = days[now.getDay()];
    // @ts-ignore
    const dayHours = shop.opening_hours[dayName];

    if (!dayHours || dayHours.is_closed) {
      return { isOpen: false, text: 'shopDetail.closed', details: '' };
    }

    const openDaysCount = Object.values(shop.opening_hours).filter((day: any) => !day.is_closed).length;

    return {
      isOpen: true,
      text: 'shopDetail.open',
      details: ` ${openDaysCount}/7`
    };
  }

  isShopOpen(shop: Shop): boolean {
    return this.getShopStatus(shop).isOpen;
  }

  getStarArray(rating: number = 0): number[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const diff = rating - (i - 1);
      if (diff >= 1) {
        stars.push(1);
      } else if (diff > 0) {
        stars.push(diff);
      } else {
        stars.push(0);
      }
    }
    return stars;
  }
}
