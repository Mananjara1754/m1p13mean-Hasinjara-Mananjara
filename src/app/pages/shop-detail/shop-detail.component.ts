import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { TranslationService } from '../../services/translation.service';
import { AuthService, User } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { PriceFormatPipe } from '../../pipes/price-format.pipe';

@Component({
  selector: 'app-shop-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PriceFormatPipe, PaginationComponent],
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
    private toastService: ToastService,
    private authService: AuthService,
    private userService: UserService
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

  loadProducts(shopId: string, background: boolean = false) {
    if (!background) this.isLoading = true;
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

  getShopStatus(): { isOpen: boolean, text: string, details: string } {
    if (!this.shop || !this.shop.opening_hours) return { isOpen: false, text: 'shopDetail.closed', details: '' };

    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = days[now.getDay()];
    // @ts-ignore
    const dayHours = this.shop.opening_hours[dayName];

    if (!dayHours || dayHours.is_closed) {
      return { isOpen: false, text: 'shopDetail.closed', details: '' };
    }

    const openDaysCount = Object.values(this.shop.opening_hours).filter((day: any) => !day.is_closed).length;

    return {
      isOpen: true,
      text: 'shopDetail.open',
      details: ` ${openDaysCount}/7`
    };
  }

  isShopOpen(): boolean {
    return this.getShopStatus().isOpen;
  }

  // Product Details Modal
  selectedProduct: Product | null = null;
  activeLargeImage: string | null = null;
  showDetailsModal = false;
  chart: any;

  openDetails(product: Product) {
    this.selectedProduct = product;
    this.activeLargeImage = product.images && product.images.length > 0 ? product.images[0] : null;
    this.showDetailsModal = true;

    // Initialize chart after view updates
    setTimeout(() => {
      this.initChart(product);
    }, 100);
  }

  setLargeImage(img: string) {
    this.activeLargeImage = img;
  }

  closeDetails() {
    this.showDetailsModal = false;
    this.selectedProduct = null;
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  initChart(product: Product) {
    if (!product.price_history || product.price_history.length === 0) return;

    const ctx = document.getElementById('priceHistoryChart') as HTMLCanvasElement;
    if (!ctx) return;

    if (this.chart) {
      this.chart.destroy();
    }

    // @ts-ignore
    import('chart.js/auto').then(({ Chart }) => {
      const labels = product.price_history.map(h => new Date(h.from).toLocaleDateString());
      const data = product.price_history.map(h => h.price);

      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Price History',
            data: data,
            borderColor: '#f59e0b', // Amber 500
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#f59e0b',
            pointRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: '#f1f5f9'
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }
      });
    });
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('fr-MG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  // Favorites logic
  isFavorite(productId: string): boolean {
    const user = this.authService.currentUserValue;
    return user?.favorite_products?.includes(productId) || false;
  }

  toggleFavorite(event: Event, productId: string) {
    event.stopPropagation();
    if (!this.authService.isAuthenticated()) {
      this.toastService.error('shopDetail.mustBeLoggedIn');
      return;
    }

    if (this.isFavorite(productId)) {
      this.userService.removeFavorite(productId).subscribe({
        next: (res) => {
          this.toastService.success('shopDetail.removedFromFavorites');
          this.updateUserFavorites(res.favorite_products);
        }
      });
    } else {
      this.userService.addFavorite(productId).subscribe({
        next: (res) => {
          this.toastService.success('shopDetail.addedToFavorites');
          this.updateUserFavorites(res.favorite_products);
        }
      });
    }
  }

  private updateUserFavorites(favs: string[]) {
    const user = this.authService.currentUserValue;
    if (user) {
      const updatedUser = { ...user, favorite_products: favs };
      this.authService.updateCurrentUser(updatedUser);
    }
  }

  // Rating Modal logic
  showRatingModal = false;
  ratingType: 'product' | 'shop' = 'shop';
  ratingTargetId = '';
  ratingValue = 5;
  ratingComment = '';
  isEditingRating = false;

  openRatingModal(type: 'product' | 'shop', target: any) {
    this.ratingType = type;
    this.ratingTargetId = target._id;

    // Check if user already rated
    const userId = this.authService.currentUserValue?._id;
    const existingRating = target.ratings?.find((r: any) => {
      const rUserId = typeof r.user_id === 'string' ? r.user_id : r.user_id?._id;
      return rUserId === userId;
    });

    if (existingRating) {
      this.isEditingRating = true;
      this.ratingValue = existingRating.rate;
      this.ratingComment = existingRating.comment;
    } else {
      this.isEditingRating = false;
      this.ratingValue = 5;
      this.ratingComment = '';
    }

    this.showRatingModal = true;
  }

  get reviewsToList(): any[] {
    if (this.ratingType === 'shop') {
      return this.shop?.ratings || [];
    } else {
      return this.selectedProduct?.ratings || [];
    }
  }

  setRating(val: number) {
    this.ratingValue = val;
  }

  submitRating() {
    if (this.ratingType === 'product') {
      const action = this.isEditingRating
        ? this.productService.updateProductRate(this.ratingTargetId, this.ratingValue, this.ratingComment)
        : this.productService.rateProduct(this.ratingTargetId, this.ratingValue, this.ratingComment);

      action.subscribe({
        next: (updatedProduct) => {
          this.toastService.success('shopDetail.ratingSubmitted');
          this.loadProducts(this.shopId!, true);
          if (this.selectedProduct && this.selectedProduct._id === updatedProduct._id) {
            this.selectedProduct = { ...this.selectedProduct, ...updatedProduct };
          }
          this.showRatingModal = false;
        },
        error: () => this.toastService.error('common.error')
      });
    } else {
      const action = this.isEditingRating
        ? this.shopService.updateShopRate(this.ratingTargetId, this.ratingValue, this.ratingComment)
        : this.shopService.rateShop(this.ratingTargetId, this.ratingValue, this.ratingComment);

      action.subscribe({
        next: (updatedShop) => {
          this.toastService.success('shopDetail.ratingSubmitted');
          this.shop = { ...this.shop!, ...updatedShop };
          this.showRatingModal = false;
        },
        error: () => this.toastService.error('common.error')
      });
    }
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

  hasUserRated(target: any): boolean {
    const userId = this.authService.currentUserValue?._id;
    if (!userId || !target?.ratings) return false;
    return target.ratings.some((r: any) => {
      const rUserId = typeof r.user_id === 'string' ? r.user_id : r.user_id?._id;
      return rUserId === userId;
    });
  }

  getBreakdownPercent(count: number, total: number): number {
    if (!total) return 0;
    return (count / total) * 100;
  }

  getUserInitials(user: any): string {
    if (!user || !user.profile) return '??';
    const first = user.profile.firstname?.charAt(0) || '';
    const last = user.profile.lastname?.charAt(0) || '';
    return (first + last).toUpperCase();
  }

  getUserFullName(user: any): string {
    if (!user || !user.profile) return 'Utilisateur';
    return `${user.profile.firstname} ${user.profile.lastname}`;
  }
}
