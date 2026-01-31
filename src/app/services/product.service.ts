import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  category: string;
  shop: { _id: string, name: string } | string;
  isSponsored: boolean;
  discount: number;
  imageUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) { }

  getProducts(filters?: { shop?: string; category?: string; search?: string }): Observable<Product[]> {
    let params = new HttpParams();
    if (filters?.shop) params = params.set('shop', filters.shop);
    if (filters?.category) params = params.set('category', filters.category);
    if (filters?.search) params = params.set('search', filters.search);

    return this.http.get<Product[]>(this.apiUrl, { params });
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }
}
