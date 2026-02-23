import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Promotion {
  _id?: string;
  shop_id?: string;
  type: 'homepage' | 'carousel' | 'featured' | 'discount';
  title: string;
  description?: string;
  image?: string;
  product_ids?: any[]; // Can be strings or Product objects
  discount_percent?: number;
  budget: {
    amount: number;
    currency: string;
  };
  stats?: {
    views: number;
    clicks: number;
    orders_generated: number;
  };
  start_date: Date;
  end_date: Date;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PromotionService {
  private apiUrl = `${environment.apiUrl}/promotions`;

  constructor(private http: HttpClient) { }

  getPromotions(shopId?: string): Observable<Promotion[]> {
    let url = this.apiUrl;
    if (shopId) {
      url += `?shop_id=${shopId}&all=true`;
    }
    return this.http.get<Promotion[]>(url);
  }

  getPromotion(id: string): Observable<Promotion> {
    return this.http.get<Promotion>(`${this.apiUrl}/${id}`);
  }

  createPromotion(promotion: Promotion): Observable<Promotion> {
    return this.http.post<Promotion>(this.apiUrl, promotion);
  }

  updatePromotion(id: string, promotion: Promotion): Observable<Promotion> {
    return this.http.put<Promotion>(`${this.apiUrl}/${id}`, promotion);
  }

  deletePromotion(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
