import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface OrderItem {
  product_id: string;
  quantity: number;
}

export interface Order {
  _id?: string;
  shop_id: string; // Used in request
  shop?: { _id: string, name: string }; // Used in response (populated)
  items: OrderItem[];
  delivery: any;
  totalPrice?: number;
  status?: string;
  createdAt?: string;
  buyer?: any;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) { }

  createOrder(orderData: { shop_id: string; items: OrderItem[]; delivery: any }): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, orderData);
  }

  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/myorders`);
  }

  getOrdersByDate(date: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/myorders/by-date`, { params: { date } });
  }

  getOrderById(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }
}
