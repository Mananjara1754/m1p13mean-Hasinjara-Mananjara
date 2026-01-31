import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService, Product, CreateProductDto } from '../../../services/product.service';
import { ShopService } from '../../../services/shop.service';

@Component({
  selector: 'app-shop-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './shop-products.component.html',
  styleUrl: './shop-products.component.css'
})
export class ShopProductsComponent implements OnInit {
  shopId: string | null = null;
  shopName: string = '';
  products: Product[] = [];
  showForm = false;
  isLoading = false;

  newProduct: CreateProductDto = {
    name: '',
    description: '',
    price: 0,
    stockQuantity: 0,
    category: '',
    shop: '',
    isSponsored: false,
    discount: 0
  };

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private shopService: ShopService
  ) { }

  ngOnInit() {
    this.shopId = this.route.snapshot.paramMap.get('id');
    if (this.shopId) {
      this.newProduct.shop = this.shopId;
      this.loadShopInfo();
      this.loadProducts();
    }
  }

  loadShopInfo() {
    if (!this.shopId) return;
    this.shopService.getShopById(this.shopId).subscribe(shop => {
      this.shopName = shop.name;
    });
  }

  loadProducts() {
    if (!this.shopId) return;
    this.productService.getProducts({ shop: this.shopId }).subscribe(products => {
      this.products = products;
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  onSubmit() {
    this.isLoading = true;
    this.productService.createProduct(this.newProduct).subscribe({
      next: (product) => {
        this.products.push(product); // Optimistic update or reload
        this.isLoading = false;
        this.showForm = false;
        this.resetForm();
      },
      error: (err) => {
        console.error('Failed to create product', err);
        this.isLoading = false;
      }
    });
  }

  resetForm() {
    this.newProduct = {
      name: '',
      description: '',
      price: 0,
      stockQuantity: 0,
      category: '',
      shop: this.shopId || '',
      isSponsored: false,
      discount: 0
    };
  }
}
