import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Shop {
  _id: string;
  name: string;
  category: string;
  description: string;
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
}
