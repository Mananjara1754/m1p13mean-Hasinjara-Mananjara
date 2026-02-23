import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Shop {
  _id: string;
  name: string;
  category: string;
  description: string;
  logo?: string;
  location: {
    floor: number;
    zone: string;
    address?: string;
  };
  opening_hours: {
    monday: { is_closed: boolean };
    tuesday: { is_closed: boolean };
    wednesday: { is_closed: boolean };
    thursday: { is_closed: boolean };
    friday: { is_closed: boolean };
    saturday: { is_closed: boolean };
    sunday: { is_closed: boolean };
  };
  rent: {
    amount: number;
    currency: string;
    billing_cycle: string;
  };
  stats: {
    total_sales: number;
    total_orders: number;
    rating: number;
  };
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
  owner_user_id: {
    profile: {
      firstname: string;
      lastname: string;
      email: string;
    };
    _id: string;
  };
  created_at: string;
  updated_at: string;
  __v: number;
}

@Injectable({
  providedIn: 'root'
})
export class ShopService {
  private apiUrl = `${environment.apiUrl}/shops`;

  constructor(private http: HttpClient) { }

  getShops(category_id?: string): Observable<Shop[]> {
    const url = category_id
      ? `${this.apiUrl}?category_id=${category_id}`
      : this.apiUrl;
    return this.http.get<Shop[]>(url);
  }

  getShopById(id: string): Observable<Shop> {
    return this.http.get<Shop>(`${this.apiUrl}/${id}`);
  }

  rateShop(id: string, rate: number, comment: string): Observable<Shop> {
    return this.http.post<Shop>(`${this.apiUrl}/${id}/rate`, { rate, comment });
  }

  updateShopRate(id: string, rate: number, comment: string): Observable<Shop> {
    return this.http.put<Shop>(`${this.apiUrl}/${id}/rate`, { rate, comment });
  }
}
