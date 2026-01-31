import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ShopService, Shop } from '../../services/shop.service';
import { ProductService, Product } from '../../services/product.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-shop-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shop-detail.component.html',
  styleUrl: './shop-detail.component.css'
})
export class ShopDetailComponent implements OnInit {
  shopId: string | null = null;
  shop: Shop | null = null;
  products: Product[] = [];
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private shopService: ShopService,
    private productService: ProductService,
    private cartService: CartService
  ) { }

  ngOnInit() {
    this.shopId = this.route.snapshot.paramMap.get('id');
    if (this.shopId) {
      this.loadData(this.shopId);
    }
  }

  loadData(id: string) {
    this.isLoading = true;

    // ForkJoin could be used here, but simple sequential load is fine for now
    this.shopService.getShopById(id).subscribe({
      next: (shop) => {
        this.shop = shop;
        this.loadProducts(id);
      },
      error: () => this.isLoading = false
    });
  }

  loadProducts(shopId: string) {
    this.productService.getProducts({ shop: shopId }).subscribe({
      next: (products) => {
        this.products = products;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product);
    // Optional: Show toast
    alert(`Added ${product.name} to cart!`);
  }
}
