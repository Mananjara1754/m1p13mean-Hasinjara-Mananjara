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
}
