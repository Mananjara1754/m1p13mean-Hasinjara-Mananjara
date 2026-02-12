import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PaymentService {
    private apiUrl = `${environment.apiUrl}/payments`;

    constructor(private http: HttpClient) { }

    getPayments(page: number = 1, limit: number = 10): Observable<any> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());
        return this.http.get<any>(this.apiUrl, { params });
    }

    getShopPayments(shopId: string, page: number = 1, limit: number = 10): Observable<any> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());
        return this.http.get<any>(`${this.apiUrl}/shop/${shopId}`, { params });
    }

    createPayment(paymentData: any): Observable<any> {
        return this.http.post<any>(this.apiUrl, paymentData);
    }

    getMyPayments(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/my-payments`);
    }

    getPaymentById(id: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`);
    }

    downloadInvoice(id: string): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/${id}/download`, {
            responseType: 'blob'
        });
    }
}
