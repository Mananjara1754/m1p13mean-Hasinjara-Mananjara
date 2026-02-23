import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { ProductService, Product, PaginatedResponse, ProductFilters } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { CategoryProducts } from '../../data/dto/categoryProducts.dto';
import { CartService } from '../../services/cart.service';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { TranslateModule } from '@ngx-translate/core';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { PriceFormatPipe } from '../../pipes/price-format.pipe';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { FilterSidepanelComponent, ActiveFilters } from '../../components/filter-sidepanel/filter-sidepanel.component';

@Component({
    selector: 'app-product-results',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule, PriceFormatPipe, PaginationComponent, ProductCardComponent, FilterSidepanelComponent, RouterLink],
    templateUrl: './product-results.component.html',
    styleUrl: './product-results.component.css'
})
export class ProductResultsComponent implements OnInit, OnDestroy {
    products: Product[] = [];
    categories: CategoryProducts[] = [];
    selectedCategoryId: string | null = null;
    isLoading = true;
    currentPage = 1;
    totalPages = 1;
    totalItems = 0;
    pageSize = 12;
    searchTerm = '';
    private searchSubject = new Subject<string>();

    // Filter sidepanel state
    showFilterPanel = false;
    activeFilters: ActiveFilters = {};
    activeFiltersCount = 0;

    // Product details modal
    selectedProduct: Product | null = null;
    activeLargeImage: string | null = null;
    showDetailsModal = false;
    chart: any;

    // Rating modal
    showRatingModal = false;
    ratingType: 'product' | 'shop' = 'product';
    ratingTargetId = '';
    ratingValue = 5;
    ratingComment = '';
    isEditingRating = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private productService: ProductService,
        private categoryService: CategoryService,
        private cartService: CartService,
        private toastService: ToastService,
        private authService: AuthService,
        private userService: UserService
    ) { }

    ngOnInit() {
        this.categoryService.getCategoryProducts().subscribe({
            next: (categories) => this.categories = categories,
            error: () => console.error('Failed to load categories')
        });

        this.route.queryParams.subscribe(params => {
            this.searchTerm = params['q'] || '';
            this.currentPage = 1;
            this.loadProducts();
        });

        this.searchSubject.pipe(
            debounceTime(400),
            distinctUntilChanged()
        ).subscribe(term => {
            this.router.navigate([], {
                relativeTo: this.route,
                queryParams: { q: term },
                queryParamsHandling: 'merge'
            });
        });
    }

    ngOnDestroy() {
        this.searchSubject.complete();
    }

    buildFilters(): ProductFilters {
        const filters: ProductFilters = {
            ...this.activeFilters,
            category: this.selectedCategoryId || undefined,
            page: this.currentPage,
            limit: this.pageSize,
            search: this.searchTerm || undefined,
        };
        return filters;
    }

    loadProducts(background: boolean = false) {
        if (!background) this.isLoading = true;
        this.productService.getProducts(this.buildFilters()).subscribe({
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
        this.loadProducts();
        window.scrollTo({ top: 200, behavior: 'smooth' });
    }

    onLimitChange(limit: number) {
        this.pageSize = limit;
        this.currentPage = 1;
        this.loadProducts();
    }

    filterByCategory(categoryId: string | null) {
        this.selectedCategoryId = categoryId;
        this.currentPage = 1;
        this.loadProducts();
    }

    onFiltersChange(filters: ActiveFilters) {
        this.activeFilters = filters;
        this.currentPage = 1;
        this.activeFiltersCount = Object.keys(filters).filter(k =>
            k !== 'sort_by' && k !== 'order' && (filters as any)[k] !== undefined
        ).length;
        this.loadProducts();
    }

    addToCart(product: Product) {
        this.cartService.addToCart(product);
        this.toastService.success('common.addedToCart', { name: product.name });
    }

    getShopName(product: Product): string {
        if (typeof product.shop_id === 'object') return product.shop_id.name || '';
        return '';
    }

    getShopLogo(product: Product): string | null {
        if (typeof product.shop_id === 'object') return (product.shop_id as any).logo || null;
        return null;
    }

    getShopId(product: Product): string {
        if (typeof product.shop_id === 'object') return product.shop_id._id || '';
        return product.shop_id as any;
    }

    openDetails(product: Product) {
        this.selectedProduct = product;
        this.activeLargeImage = product.images && product.images.length > 0 ? product.images[0] : null;
        this.showDetailsModal = true;
        setTimeout(() => this.initChart(product), 100);
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
        const ctx = document.getElementById('priceHistoryChartResults') as HTMLCanvasElement;
        if (!ctx) return;
        if (this.chart) this.chart.destroy();

        // @ts-ignore
        import('chart.js/auto').then(({ Chart }) => {
            this.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: product.price_history.map(h => new Date(h.from).toLocaleDateString()),
                    datasets: [{
                        data: product.price_history.map(h => h.price),
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245,158,11,0.1)',
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
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
                        x: { grid: { display: false } }
                    }
                }
            });
        });
    }

    getOriginalPrice(product: Product): number {
        return product.price.ttc || (product.price.current * 1.2);
    }

    getDiscountedPrice(product: Product): number | null {
        if (product.promotion?.is_active && product.promotion.discount_percent > 0) {
            return this.getOriginalPrice(product) * (1 - product.promotion.discount_percent / 100);
        }
        return null;
    }

    openRatingModal(type: 'product' | 'shop', target: any) {
        this.ratingType = type;
        this.ratingTargetId = target._id;
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
        return this.selectedProduct?.ratings || [];
    }

    setRating(val: number) { this.ratingValue = val; }

    submitRating() {
        const action = this.isEditingRating
            ? this.productService.updateProductRate(this.ratingTargetId, this.ratingValue, this.ratingComment)
            : this.productService.rateProduct(this.ratingTargetId, this.ratingValue, this.ratingComment);

        action.subscribe({
            next: (updatedProduct) => {
                this.toastService.success('shopDetail.ratingSubmitted');
                this.loadProducts(true);
                if (this.selectedProduct && this.selectedProduct._id === updatedProduct._id) {
                    this.selectedProduct = { ...this.selectedProduct, ...updatedProduct };
                }
                this.showRatingModal = false;
            },
            error: () => this.toastService.error('common.error')
        });
    }

    isFavorite(productId: string): boolean {
        const user = this.authService.currentUserValue;
        return user?.favorite_products?.includes(productId) || false;
    }

    getStarArray(rating: number = 0): number[] {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            const diff = rating - (i - 1);
            stars.push(diff >= 1 ? 1 : diff > 0 ? diff : 0);
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
        return !total ? 0 : (count / total) * 100;
    }

    getUserInitials(user: any): string {
        if (!user || !user.profile) return '??';
        return ((user.profile.firstname?.charAt(0) || '') + (user.profile.lastname?.charAt(0) || '')).toUpperCase();
    }

    getUserFullName(user: any): string {
        if (!user || !user.profile) return 'Utilisateur';
        return `${user.profile.firstname} ${user.profile.lastname}`;
    }
}
