import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Product {
  _id: string;
  shop_id: string;
  name: string;
  description?: string;
  category_id?: string;
  images: string[];
  price: {
    current: number;
    currency: string;
  };
  stock: {
    quantity: number;
    low_stock_threshold?: number;
    status?: 'in_stock' | 'low_stock' | 'out_of_stock';
  };
  promotion?: {
    is_active: boolean;
    discount_percent: number;
    start_date?: Date;
    end_date?: Date;
  };
  price_history?: {
    price: number;
    from: Date;
  }[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedProducts {
  products: Product[];
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

  getProducts(filters?: { shop_id?: string; category?: string; search?: string; page?: number; limit?: number }): Observable<PaginatedProducts> {
    let params = new HttpParams();
    if (filters?.shop_id) params = params.set('shop_id', filters.shop_id);
    if (filters?.category) params = params.set('category', filters.category);
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.page) params = params.set('page', filters.page.toString());
    if (filters?.limit) params = params.set('limit', filters.limit.toString());

    return this.http.get<PaginatedProducts>(this.apiUrl, { params });
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  createProduct(productData: FormData): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, productData);
  }

  updateProduct(id: string, productData: FormData): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, productData);
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
