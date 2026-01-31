import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface OrderItem {
  product: string; // Product ID
  quantity: number;
}

export interface Order {
  _id?: string;
  shop: string; // Shop ID
  items: OrderItem[];
  totalPrice: number;
  status: string;
  createdAt: string;
  buyer?: any;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) { }

  createOrder(orderData: { shop: string; items: OrderItem[]; totalPrice: number }): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, orderData);
  }

  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/myorders`);
  }

  getOrderById(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }
}
