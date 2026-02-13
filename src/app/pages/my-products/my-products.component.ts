import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { ShopService } from '../../services/shop.service';
import { CategoryService, Category } from '../../services/category.service';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

import { PaginationComponent } from '../../components/pagination/pagination.component';

@Component({
  selector: 'app-my-products',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './my-products.component.html',
  styleUrls: ['./my-products.component.css']
})
export class MyProductsComponent implements OnInit, AfterViewInit {
  products: Product[] = [];
  categories: Category[] = [];
  showModal = false;
  showDetailsModal = false;
  isEditing = false;
  isLoading = false;
  chart: any = null;

  currentProduct: any = this.getEmptyProduct();
  selectedProduct: Product | null = null;
  selectedFiles: File[] = [];
  shopId: string | null = null;

  // Pagination
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  limit = 9;

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private shopService: ShopService,
    private categoryService: CategoryService
  ) { }

  ngOnInit() {
    this.loadCategories();
    this.authService.currentUser$.subscribe(user => {
      console.log("user", user);
      if (user && user.shop_id) {
        this.shopId = user.shop_id;
        this.loadProducts();
      }
    });
  }

  // ngOnInit() {
  //   this.authService.currentUser$.subscribe(user => {
  //     if (user) {
  //       this.findUserShop(user._id);
  //     }
  //   });
  // }

  // findUserShop(userId: string) {
  //   this.shopService.getShops().subscribe(shops => {
  //     const myShop = shops.find((s: any) => {
  //        const ownerId = typeof s.owner_user_id === 'object' ? s.owner_user_id._id : s.owner_user_id;
  //        return ownerId === userId;
  //     });

  //     if (myShop) {
  //       this.shopId = myShop._id;
  //       this.loadProducts();
  //     }
  //   });
  // }

  getEmptyProduct() {
    return {
      name: '',
      description: '',
      category_id: '',
      price: { current: 0, ttc: 0, currency: 'MGA' },
      stock: { quantity: 0, status: 'in_stock' },
      images: []
    };
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe(categories => {
      this.categories = categories;
    });
  }

  loadProducts() {
    if (!this.shopId) return;
    this.isLoading = true;
    this.productService.getProducts({
      shop_id: this.shopId,
      page: this.currentPage,
      limit: this.limit
    }).subscribe({
      next: (data) => {
        this.products = data.products;
        this.totalPages = data.pages;
        this.totalItems = data.total;
        this.currentPage = data.page;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading products', err);
        this.isLoading = false;
      }
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openModal() {
    this.isEditing = false;
    this.currentProduct = this.getEmptyProduct();
    this.selectedFiles = [];
    this.showModal = true;
  }

  editProduct(product: Product) {
    this.isEditing = true;
    // Deep copy to avoid reference issues with nested objects
    this.currentProduct = JSON.parse(JSON.stringify(product));

    // Ensure category_id is a string (ID) for the form select
    if (this.currentProduct.category_id && typeof this.currentProduct.category_id === 'object') {
      const catObj: any = this.currentProduct.category_id;
      this.currentProduct.category_id = catObj._id;
    }

    if (!this.currentProduct.price.ttc && this.currentProduct.price.current) {
       this.updateTTC();
    }

    this.selectedFiles = [];
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  onFileSelected(event: any) {
    if (event.target.files) {
      this.selectedFiles = Array.from(event.target.files);
    }
  }

  saveProduct() {
    if (!this.shopId) {
      alert('Shop not found for this user.');
      return;
    }

    this.isLoading = true;
    const formData = new FormData();

    // Append basic fields
    formData.append('shop_id', this.shopId);
    formData.append('name', this.currentProduct.name);
    formData.append('description', this.currentProduct.description || '');
    formData.append('category_id', this.currentProduct.category_id || '');

    // Append nested objects as JSON strings
    formData.append('price', JSON.stringify(this.currentProduct.price));
    formData.append('stock', JSON.stringify(this.currentProduct.stock));

    if (this.currentProduct.promotion) {
      formData.append('promotion', JSON.stringify(this.currentProduct.promotion));
    }

    // Append images
    this.selectedFiles.forEach((file) => {
      formData.append('images', file);
    });

    if (this.isEditing && this.currentProduct._id) {
      this.productService.updateProduct(this.currentProduct._id, formData).subscribe({
        next: (updatedProduct) => {
          this.isLoading = false;
          this.loadProducts();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error updating product', err);
          this.isLoading = false;
          alert('Failed to update product');
        }
      });
    } else {
      this.productService.createProduct(formData).subscribe({
        next: (newProduct) => {
          this.isLoading = false;
          this.loadProducts();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error creating product', err);
          this.isLoading = false;
          alert('Failed to create product');
        }
      });
    }
  }

  showProductDetails(product: Product) {
    this.selectedProduct = product;
    this.showDetailsModal = true;
    setTimeout(() => {
      this.createChart(product);
    }, 100);
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedProduct = null;
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  createChart(product: Product) {
    if (!product.price_history || product.price_history.length < 2) return;

    const ctx = document.getElementById('priceHistoryChart') as HTMLCanvasElement;
    if (!ctx) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const sortedHistory = [...product.price_history].sort((a, b) => new Date(a.from).getTime() - new Date(b.from).getTime());

    // Format dates and prices
    const labels = sortedHistory.map(h => {
      const date = new Date(h.from);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    });
    const data = sortedHistory.map(h => h.price);

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Price History (' + product.price.currency + ')',
          data: data,
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
          borderWidth: 2,
          tension: 0.1,
          pointRadius: 4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: '#94a3b8'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          },
          x: {
            ticks: {
              color: '#94a3b8'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: '#e2e8f0'
            }
          }
        }
      }
    });
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('fr-MG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  getCategoryName(categoryId: string | any): string {
    if (!categoryId) return 'Unknown';
    if (typeof categoryId === 'object' && categoryId.name) {
      return categoryId.name;
    }
    const category = this.categories.find(c => c._id === categoryId);
    return category ? category.name : 'Unknown';
  }

  // Chart methods for canvas chart.js implementation
  // Removed old SVG methods

  updateTTC() {
    if (this.currentProduct.price.current) {
      const ht = this.currentProduct.price.current;
      const ttc = ht * 1.2;
      this.currentProduct.price.ttc = Math.round(ttc);
    }
  }

  deleteProduct(id: string) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.loadProducts();
        },
        error: (err) => {
          console.error('Error deleting product', err);
          alert('Failed to delete product');
        }
      });
    }
  }

  ngAfterViewInit() {
    // Chart initialization would go here when we have a chart library
    // For now, this is a placeholder for future chart implementation
  }
}
