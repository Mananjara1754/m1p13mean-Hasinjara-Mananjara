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


@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) { }

  getProducts(filters?: { shop_id?: string; category?: string; search?: string; page?: number; limit?: number }): Observable<PaginatedResponse<Product>> {
    let params = new HttpParams();
    if (filters?.shop_id) params = params.set('shop_id', filters.shop_id);
    if (filters?.category) params = params.set('category_id', filters.category);
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.page) params = params.set('page', filters.page.toString());
    if (filters?.limit) params = params.set('limit', filters.limit.toString());

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
