import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ShopStatisticService {
    private apiUrl = `${environment.apiUrl}/shop/statistics`;

    constructor(private http: HttpClient) { }

    getGlobalStats(shopId: string, year: number): Observable<any> {
        const params = new HttpParams()
            .set('shop_id', shopId)
            .set('year', year.toString());
        return this.http.get<any>(`${this.apiUrl}/global`, { params });
    }

    getProductStats(shopId: string, year: number): Observable<any> {
        const params = new HttpParams()
            .set('shop_id', shopId)
            .set('year', year.toString());
        return this.http.get<any>(`${this.apiUrl}/products`, { params });
    }

    getCategoryStats(shopId: string, year: number): Observable<any> {
        const params = new HttpParams()
            .set('shop_id', shopId)
            .set('year', year.toString());
        return this.http.get<any>(`${this.apiUrl}/categories`, { params });
    }

    getPromoStats(shopId: string, year: number): Observable<any> {
        const params = new HttpParams()
            .set('shop_id', shopId)
            .set('year', year.toString());
        return this.http.get<any>(`${this.apiUrl}/promos`, { params });
    }

    getOrderSummary(shopId: string, startDate: string, endDate: string): Observable<any> {
        const params = new HttpParams()
            .set('shop_id', shopId)
            .set('startDate', startDate)
            .set('endDate', endDate);
        return this.http.get<any>(`${this.apiUrl}/orders`, { params });
    }

    getTopClients(shopId: string, startDate: string, endDate: string): Observable<any> {
        const params = new HttpParams()
            .set('shop_id', shopId)
            .set('startDate', startDate)
            .set('endDate', endDate);
        return this.http.get<any>(`${this.apiUrl}/top-clients`, { params });
    }
}
