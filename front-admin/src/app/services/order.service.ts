import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private apiUrl = `${environment.apiUrl}/orders`;

    constructor(private http: HttpClient) { }

    getOrders(page: number = 1, limit: number = 10, status?: string, sort: string = '-created_at', search?: string): Observable<any> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString())
            .set('sort', sort);

        if (status) {
            params = params.set('status', status);
        }

        if (search) {
            params = params.set('search', search);
        }

        return this.http.get<any>(this.apiUrl, { params });
    }

    getOrderById(id: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`);
    }

    updateOrderStatus(id: string, status: string, payment_status?: string): Observable<any> {
        return this.http.patch<any>(`${this.apiUrl}/${id}/status`, { status, payment_status });
    }

    getOrderStats(shop_id: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/stats/total-by-status/${shop_id}`);
    }
}
