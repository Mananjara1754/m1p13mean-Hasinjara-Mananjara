import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { ShopService, Shop } from '../../services/shop.service';
import { ProductService, Product, PaginatedResponse } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { CategoryProducts } from '../../data/dto/categoryProducts.dto';
import { CartService } from '../../services/cart.service';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { TranslateModule } from '@ngx-translate/core';
import { ToastService } from '../../services/toast.service';
import { PriceFormatPipe } from '../../pipes/price-format.pipe';

@Component({
  selector: 'app-shop-detail',
  standalone: true,
  imports: [CommonModule, TranslateModule, PriceFormatPipe, PaginationComponent],
  templateUrl: './shop-detail.component.html',
  styleUrl: './shop-detail.component.css'
})
export class ShopDetailComponent implements OnInit, OnDestroy {
  shopId: string | null = null;
  shop: Shop | null = null;
  products: Product[] = [];
  categories: CategoryProducts[] = [];
  selectedCategoryId: string | null = null;
  isLoading = true;
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  pageSize = 8;
  searchTerm = '';
  private searchSubject = new Subject<string>();

  constructor(
    private route: ActivatedRoute,
    private shopService: ShopService,
    private productService: ProductService,
    private categoryService: CategoryService,
    private cartService: CartService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.shopId = this.route.snapshot.paramMap.get('id');

    // Load product categories
    this.categoryService.getCategoryProducts().subscribe({
      next: (categories) => this.categories = categories,
      error: () => console.error('Failed to load categories')
    });

    // Check if shop object is passed in state
    const navigation = history.state;
    if (navigation && navigation.shop) {
      this.shop = navigation.shop;
      if (this.shopId) {
        this.loadProducts(this.shopId);
        this.isLoading = false; // Data is already here
        // We still fetch products though
        this.isLoading = true; // Wait for products
      }
    } else if (this.shopId) {
      this.loadData(this.shopId);
    }

    // Initialize debounced search
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm = term;
      this.currentPage = 1; // Reset to first page
      if (this.shopId) {
        this.loadProducts(this.shopId);
      }
    });
  }

  ngOnDestroy() {
    this.searchSubject.complete();
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
    this.productService.getProducts({
      shop_id: shopId,
      category: this.selectedCategoryId || undefined,
      page: this.currentPage,
      limit: this.pageSize,
      search: this.searchTerm
    }).subscribe({
      next: (response: PaginatedResponse<Product>) => {
        this.products = response.products;
        this.totalPages = response.pages;
        this.totalItems = response.total;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  onSearch(event: Event) {
    const term = (event.target as HTMLInputElement).value;
    this.searchSubject.next(term);
  }

  onPageChange(page: number) {
    this.currentPage = page;
    if (this.shopId) {
      this.loadProducts(this.shopId);
      // Smooth scroll to top of products
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  }

  onLimitChange(limit: number) {
    this.pageSize = limit;
    this.currentPage = 1; // Reset to first page
    if (this.shopId) {
      this.loadProducts(this.shopId);
    }
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product);
    this.toastService.success('common.addedToCart', { name: product.name });
  }

  filterByCategory(categoryId: string | null) {
    this.selectedCategoryId = categoryId;
    this.currentPage = 1; // Reset to first page
    if (this.shopId) {
      this.loadProducts(this.shopId);
    }
  }

  isShopOpen(): boolean {
    if (!this.shop) return false;
    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = days[now.getDay()];
    // @ts-ignore
    const dayHours = this.shop.opening_hours[dayName];
    return dayHours && !dayHours.is_closed;
  }
}
