import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: {
    current: number;
    ttc?: number;
    currency: string;
  };
  stock: {
    quantity: number;
    status: string;
    low_stock_threshold: number;
  };
  promotion: {
    is_active: boolean;
    discount_percent: number;
  };
  shop_id: {
    _id: string;
    name: string;
    logo?: string;
  };
  images: string[];
  is_active: boolean;
  price_history: any[];
  ratings?: {
    user_id: string | { _id: string, profile: { firstname: string, lastname: string } };
    rate: number;
    comment: string;
    created_at: string;
  }[];
  avg_rating?: number;
  count_rating?: number;
  stars_breakdown?: { [key: string]: number };
  can_rate?: boolean;
  __v: number;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  products: T[];
  page: number;
  pages: number;
  total: number;
}

export interface ProductFilters {
  shop_id?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  // Price range
  min_price?: number;
  max_price?: number;
  // Stock range
  min_stock?: number;
  max_stock?: number;
  // Promotion
  on_promotion?: boolean;
  // Rating range
  min_rating?: number;
  max_rating?: number;
  // Price drop
  price_drop?: boolean;
  // Sorting
  sort_by?: 'price' | 'rating' | 'date' | 'discount' | 'popularity' | 'name';
  order?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) { }

  getProducts(filters?: ProductFilters): Observable<PaginatedResponse<Product>> {
    let params = new HttpParams();
    if (filters?.shop_id) params = params.set('shop_id', filters.shop_id);
    if (filters?.category) params = params.set('category_id', filters.category);
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.page) params = params.set('page', filters.page.toString());
    if (filters?.limit) params = params.set('limit', filters.limit.toString());
    if (filters?.min_price != null) params = params.set('min_price', filters.min_price.toString());
    if (filters?.max_price != null) params = params.set('max_price', filters.max_price.toString());
    if (filters?.min_stock != null) params = params.set('min_stock', filters.min_stock.toString());
    if (filters?.max_stock != null) params = params.set('max_stock', filters.max_stock.toString());
    if (filters?.on_promotion) params = params.set('on_promotion', 'true');
    // Only send min_rating if > 0 (selecting "at least N stars")
    if (filters?.min_rating != null && filters.min_rating > 0) params = params.set('min_rating', filters.min_rating.toString());
    // Only send max_rating if < 5 (capping at a value)
    if (filters?.max_rating != null && filters.max_rating < 5) params = params.set('max_rating', filters.max_rating.toString());
    if (filters?.price_drop) params = params.set('price_drop', 'true');
    if (filters?.sort_by) params = params.set('sort_by', filters.sort_by);
    if (filters?.order) params = params.set('order', filters.order);

    return this.http.get<PaginatedResponse<Product>>(this.apiUrl, { params });
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  rateProduct(id: string, rate: number, comment: string): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/${id}/rate`, { rate, comment });
  }

  updateProductRate(id: string, rate: number, comment: string): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}/rate`, { rate, comment });
  }
}
